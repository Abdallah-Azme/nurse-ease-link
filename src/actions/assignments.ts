"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPatientWithProfile, getUserById, updatePatientAssignments } from "@/db/queries";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { sendPushToUsers } from "@/lib/firebase/send-push";
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
    await requireRoleAction("admin");
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

    if (before?.assignedNurseId !== parsed.data.assignedNurseId) {
      await sendPushToUsers([parsed.data.assignedNurseId], {
        title: "New patient assignment",
        body: `You have been assigned to ${patientName}.`,
        url: "/nurse/patients",
        event: "assignment_nurse",
      });
    }

    if (before?.assignedDoctorId !== parsed.data.assignedDoctorId) {
      await sendPushToUsers([parsed.data.assignedDoctorId], {
        title: "New patient assignment",
        body: `You have been assigned to ${patientName}.`,
        url: "/doctor/patients",
        event: "assignment_doctor",
      });
    }

    revalidatePath("/admin/assignments");
    revalidatePath("/nurse");
    revalidatePath("/doctor");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to update assignments.");
  }
}
