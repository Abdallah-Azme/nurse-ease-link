"use server";

import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";

import { collections } from "@/db/mongo/collections";
import { withMongoTransaction } from "@/db/mongo/connection";
import { updateUserStatus } from "@/db/queries/users";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  registrationFieldErrors,
  registrationSchema,
  type RegistrationInput,
} from "@/lib/registration";
import { requireRoleAction } from "@/lib/safe-action";

export async function registerAccount(
  input: RegistrationInput,
): Promise<ActionResult<{ role: "patient" | "nurse" | "doctor"; status: "active" }>> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", "validation_error", {
      fieldErrors: registrationFieldErrors(parsed.error),
    });
  }

  const data = parsed.data;
  const id = crypto.randomUUID();
  const status = "active" as const;

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);
    await withMongoTransaction(async (db, session) => {
      const c = await collections(db);
      const now = new Date();

      await c.users.insertOne(
        {
          id,
          name: data.name,
          email: data.email,
          passwordHash,
          role: data.role,
          status,
          createdAt: now,
        },
        { session },
      );

      if (data.role === "patient") {
        await c.patientProfiles.insertOne(
          {
            userId: id,
            age: data.age!,
            sex: data.sex!,
            conditions: data.conditions
              ? data.conditions
                  .split(",")
                  .map((condition) => condition.trim())
                  .filter(Boolean)
              : [],
            risk: "low",
            adherence: 100,
            assignedNurseId: "",
            assignedDoctorId: "",
            avatarHue: Math.floor(Math.random() * 360),
          },
          { session },
        );
      } else {
        await c.staffProfiles.insertOne(
          {
            userId: id,
            specialty: data.specialty,
            patientsCount: 0,
          },
          { session },
        );
      }

      await c.auditLogs.insertOne(
        {
          id: crypto.randomUUID(),
          actorId: id,
          actorRole: data.role,
          action: "account.registered",
          entityType: "user",
          entityId: id,
          metadata: { status },
          correlationId: crypto.randomUUID(),
          createdAt: now,
        },
        { session },
      );
    });

    return ok({ role: data.role, status });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return fail("An account with this email already exists.", "duplicate_email", {
        fieldErrors: { email: ["This email is already registered."] },
      });
    }
    return fail("Registration could not be completed. Please try again.", "registration_failed");
  }
}

export async function reviewStaffRegistration(
  userId: string,
  decision: "approve" | "reject",
): Promise<ActionResult<void>> {
  const session = await requireRoleAction("admin");
  const c = await collections();
  const user = await c.users.findOne({ id: userId });

  if (!user || !["nurse", "doctor"].includes(user.role) || user.status !== "pending") {
    return fail("This pending staff registration was not found.", "not_found");
  }

  const status = decision === "approve" ? "active" : "inactive";
  await updateUserStatus(userId, status);
  await c.auditLogs.insertOne({
    id: crypto.randomUUID(),
    actorId: session.user.id,
    actorRole: "admin",
    action: `account.${decision === "approve" ? "approved" : "rejected"}`,
    entityType: "user",
    entityId: userId,
    metadata: { role: user.role, status },
    correlationId: crypto.randomUUID(),
    createdAt: new Date(),
  });

  return ok(undefined);
}
