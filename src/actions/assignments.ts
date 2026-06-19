"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPatientWithProfile, getUserById, updatePatientAssignments } from "@/db/queries";
import { insertAssignment, insertAuditLog, insertNotification } from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireRoleAction } from "@/lib/safe-action";

const assignmentSchema = z.object({
  patientId: z.string().min(1),
  assignedNurseId: z.string().min(1),
  assignedDoctorId: z.string().min(1),
});

export async function updateAssignments(
  patientId: string,
  assignedNurseId: string,
  assignedDoctorId: string,
): Promise<ActionResult<void>> {
  try {
    const session = await requireRoleAction("admin");
    const parsed = assignmentSchema.safeParse({
      patientId,
      assignedNurseId,
      assignedDoctorId,
    });
    if (!parsed.success) return fail("Invalid assignment data.");

    const before = await getPatientWithProfile(parsed.data.patientId);
    const patientUser = await getUserById(parsed.data.patientId);
    const patientName = patientUser?.name ?? "a patient";

    await updatePatientAssignments(
      parsed.data.patientId,
      parsed.data.assignedNurseId,
      parsed.data.assignedDoctorId,
    );
    await insertAssignment({
      id: crypto.randomUUID(),
      patientId: parsed.data.patientId,
      role: "nurse",
      staffId: parsed.data.assignedNurseId,
      startsAt: new Date(),
      changedBy: session.user.id,
      version: 1,
    });
    await insertAssignment({
      id: crypto.randomUUID(),
      patientId: parsed.data.patientId,
      role: "doctor",
      staffId: parsed.data.assignedDoctorId,
      startsAt: new Date(),
      changedBy: session.user.id,
      version: 1,
    });
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: "admin",
      action: "assignment.updated",
      entityType: "patient",
      entityId: parsed.data.patientId,
      metadata: parsed.data,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    await insertNotification({
      id: crypto.randomUUID(),
      userId: parsed.data.patientId,
      type: "assignment_changed",
      title: "Your care team changed",
      body: "Your assigned nurse or doctor has been updated.",
      deepLink: "/patient",
      priority: "medium",
      sourceType: "patient",
      sourceId: parsed.data.patientId,
      createdAt: new Date(),
    });

    revalidatePath("/admin/assignments");
    revalidatePath("/nurse");
    revalidatePath("/doctor");
    revalidatePath("/patient");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to update assignments.");
  }
}
