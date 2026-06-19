"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPatientWithProfile } from "@/db/queries";
import {
  findMedicationById,
  insertAuditLog,
  insertMedicationLog,
  insertNotification,
  insertOutboxJob,
} from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireRoleAction } from "@/lib/safe-action";

const markTakenSchema = z.object({
  medicationId: z.string().min(1),
});

const markMissedSchema = z.object({
  medicationId: z.string().min(1),
});

function careTeamRecipients(patient?: Awaited<ReturnType<typeof getPatientWithProfile>>) {
  return [patient?.assignedNurseId, patient?.assignedDoctorId].filter(Boolean) as string[];
}

export async function markMedicationTaken(
  medicationId: string,
): Promise<ActionResult<{ name: string }>> {
  try {
    const session = await requireRoleAction("patient");
    const parsed = markTakenSchema.safeParse({ medicationId });
    if (!parsed.success) return fail("Invalid medication.");

    const med = await findMedicationById(medicationId);
    if (!med || med.patientId !== session.user.id) {
      return fail("Medication not found.");
    }

    const patient = await getPatientWithProfile(session.user.id);
    const recipients = careTeamRecipients(patient);

    await insertMedicationLog({
      id: crypto.randomUUID(),
      medicationId: med.id,
      patientId: session.user.id,
      takenAt: new Date(),
    });
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: "patient",
      action: "medication.taken",
      entityType: "medication",
      entityId: med.id,
      metadata: { medicationId: med.id, patientId: session.user.id },
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });

    if (recipients.length) {
      for (const userId of recipients) {
        await insertNotification({
          id: crypto.randomUUID(),
          userId,
          type: "medication_taken",
          title: "Medication logged",
          body: `${session.user.name} marked ${med.name} as taken.`,
          deepLink: userId === patient?.assignedDoctorId ? "/doctor/patients" : "/nurse/patients",
          priority: "medium",
          sourceType: "medication",
          sourceId: med.id,
          createdAt: new Date(),
        });
      }

      await insertOutboxJob({
        id: crypto.randomUUID(),
        type: "push",
        payload: {
          userIds: recipients,
          title: "Medication logged",
          body: `${session.user.name} marked ${med.name} as taken.`,
          url: "/nurse/patients",
          event: "medication_taken",
        },
        status: "pending",
        attempts: 0,
        availableAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        dedupeKey: `medication-taken:${med.id}:${session.user.id}`,
      });
    }

    revalidatePath("/patient");
    revalidatePath("/patient/medications");
    return ok({ name: med.name });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to mark medication.");
  }
}

export async function markMedicationMissed(
  medicationId: string,
): Promise<ActionResult<{ name: string }>> {
  try {
    const session = await requireRoleAction("patient");
    const parsed = markMissedSchema.safeParse({ medicationId });
    if (!parsed.success) return fail("Invalid medication.");

    const med = await findMedicationById(medicationId);
    if (!med || med.patientId !== session.user.id) {
      return fail("Medication not found.");
    }

    const patient = await getPatientWithProfile(session.user.id);
    const recipients = careTeamRecipients(patient);
    if (recipients.length) {
      for (const userId of recipients) {
        await insertNotification({
          id: crypto.randomUUID(),
          userId,
          type: "medication_missed",
          title: "Medication missed",
          body: `${session.user.name} missed ${med.name}.`,
          deepLink: userId === patient?.assignedDoctorId ? "/doctor/patients" : "/nurse/patients",
          priority: "high",
          sourceType: "medication",
          sourceId: med.id,
          createdAt: new Date(),
        });
      }
      await insertOutboxJob({
        id: crypto.randomUUID(),
        type: "push",
        payload: {
          userIds: recipients,
          title: "Medication missed",
          body: `${session.user.name} missed ${med.name}.`,
          url: "/nurse/patients",
          event: "medication_missed",
        },
        status: "pending",
        attempts: 0,
        availableAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        dedupeKey: `medication-missed:${med.id}:${session.user.id}`,
      });
    }

    revalidatePath("/patient");
    revalidatePath("/patient/medications");
    revalidatePath("/nurse");
    revalidatePath("/nurse/palliative");
    return ok({ name: med.name });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to mark medication missed.");
  }
}
