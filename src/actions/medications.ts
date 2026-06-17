"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPatientWithProfile } from "@/db/queries";
import { findMedicationById, insertMedicationLog } from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { sendPushToUsers } from "@/lib/firebase/send-push";
import { requireRoleAction } from "@/lib/safe-action";

const markTakenSchema = z.object({
  medicationId: z.string().min(1),
});

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

    await insertMedicationLog({
      id: crypto.randomUUID(),
      medicationId: med.id,
      patientId: session.user.id,
      takenAt: new Date(),
    });

    const patient = await getPatientWithProfile(session.user.id);
    if (patient?.assignedNurseId) {
      await sendPushToUsers([patient.assignedNurseId], {
        title: "Medication logged",
        body: `${session.user.name} marked ${med.name} as taken.`,
        url: "/nurse/patients",
        event: "medication_taken",
      });
    }

    revalidatePath("/patient");
    revalidatePath("/patient/medications");
    return ok({ name: med.name });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to mark medication.");
  }
}
