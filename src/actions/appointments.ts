"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  cancelAppointmentById,
  findAppointmentById,
  findMedicationById,
  insertAppointment,
  updateMedicationNextDose,
} from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { sendPushToUsers } from "@/lib/firebase/send-push";
import { requireRoleAction } from "@/lib/safe-action";

export async function renewPrescription(medicationId: string): Promise<ActionResult<void>> {
  try {
    await requireRoleAction("doctor");
    const med = await findMedicationById(medicationId);
    if (!med) return fail("Medication not found.");

    await updateMedicationNextDose(medicationId, "Renewed — next dose Tomorrow 8:00 AM");

    await sendPushToUsers([med.patientId], {
      title: "Prescription renewed",
      body: `${med.name} has been renewed by your doctor.`,
      url: "/patient/medications",
      event: "prescription_renewed",
    });

    revalidatePath("/doctor/prescriptions");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to renew prescription.");
  }
}

const appointmentSchema = z.object({
  patientId: z.string().min(1),
  staffName: z.string().min(1),
  whenLabel: z.string().min(1),
  reason: z.string().min(1),
});

export async function createAppointment(
  data: z.infer<typeof appointmentSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireRoleAction("doctor");
    const parsed = appointmentSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid appointment data.");

    const id = crypto.randomUUID();
    await insertAppointment({
      id,
      patientId: parsed.data.patientId,
      staffId: session.user.id,
      staffName: parsed.data.staffName,
      whenLabel: parsed.data.whenLabel,
      reason: parsed.data.reason,
      status: "scheduled",
    });

    await sendPushToUsers([parsed.data.patientId], {
      title: "New appointment scheduled",
      body: `${parsed.data.whenLabel} — ${parsed.data.reason}`,
      url: "/patient",
      event: "appointment_created",
    });

    revalidatePath("/doctor/appointments");
    revalidatePath("/patient");
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to create appointment.");
  }
}

export async function cancelAppointment(appointmentId: string): Promise<ActionResult<void>> {
  try {
    await requireRoleAction("doctor");
    const appt = await findAppointmentById(appointmentId);
    if (!appt) return fail("Appointment not found.");

    await cancelAppointmentById(appointmentId);

    await sendPushToUsers([appt.patientId], {
      title: "Appointment cancelled",
      body: `Your appointment (${appt.whenLabel}) has been cancelled.`,
      url: "/patient",
      event: "appointment_cancelled",
    });

    revalidatePath("/doctor/appointments");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to cancel appointment.");
  }
}
