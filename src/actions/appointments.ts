"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  cancelAppointmentById,
  findAppointmentById,
  findMedicationById,
  insertAppointment,
  insertAuditLog,
  insertNotification,
  updateMedicationNextDose,
} from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getPatientWithProfile } from "@/db/queries";
import { requireRoleAction } from "@/lib/safe-action";

export async function renewPrescription(medicationId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireRoleAction("doctor");
    const med = await findMedicationById(medicationId);
    if (!med) return fail("Medication not found.");
    const patient = await getPatientWithProfile(med.patientId);
    if (!patient || patient.assignedDoctorId !== session.user.id) {
      return fail("Forbidden.");
    }

    const nextDose = `Renewed by ${session.user.name} - next dose tomorrow 8:00 AM`;
    await updateMedicationNextDose(medicationId, nextDose);
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: "doctor",
      action: "prescription.renewed",
      entityType: "medication",
      entityId: medicationId,
      metadata: { nextDose },
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    await insertNotification({
      id: crypto.randomUUID(),
      userId: med.patientId,
      type: "prescription_renewed",
      title: "Prescription renewed",
      body: `${med.name} has been renewed by your doctor.`,
      deepLink: "/patient/medications",
      priority: "medium",
      sourceType: "medication",
      sourceId: medicationId,
      createdAt: new Date(),
    });
    if (patient?.assignedNurseId) {
      await insertNotification({
        id: crypto.randomUUID(),
        userId: patient.assignedNurseId,
        type: "prescription_renewed",
        title: "Prescription renewed",
        body: `${med.name} was renewed for ${patient.name}.`,
        deepLink: "/nurse/patients",
        priority: "medium",
        sourceType: "medication",
        sourceId: medicationId,
        createdAt: new Date(),
      });
    }

    revalidatePath("/doctor/prescriptions");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to renew prescription.");
  }
}

const appointmentSchema = z.object({
  patientId: z.string().min(1),
  staffName: z.string().min(1),
  scheduledAt: z.coerce.date(),
  reason: z.string().min(1),
});

export async function createAppointment(
  data: z.infer<typeof appointmentSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireRoleAction("doctor");
    const parsed = appointmentSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid appointment data.");
    const patient = await getPatientWithProfile(parsed.data.patientId);
    if (!patient || patient.assignedDoctorId !== session.user.id) {
      return fail("Forbidden.");
    }

    const id = crypto.randomUUID();
    await insertAppointment({
      id,
      patientId: parsed.data.patientId,
      staffId: session.user.id,
      staffName: session.user.name,
      whenLabel: parsed.data.scheduledAt.toISOString(),
      scheduledAt: parsed.data.scheduledAt,
      reason: parsed.data.reason,
      status: "scheduled",
    });
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: "doctor",
      action: "appointment.created",
      entityType: "appointment",
      entityId: id,
      metadata: parsed.data,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    await insertNotification({
      id: crypto.randomUUID(),
      userId: parsed.data.patientId,
      type: "appointment_created",
      title: "New appointment scheduled",
      body: `${parsed.data.scheduledAt.toLocaleString()} - ${parsed.data.reason}`,
      deepLink: "/patient",
      priority: "medium",
      sourceType: "appointment",
      sourceId: id,
      createdAt: new Date(),
    });
    if (patient.assignedNurseId) {
      await insertNotification({
        id: crypto.randomUUID(),
        userId: patient.assignedNurseId,
        type: "appointment_created",
        title: "Patient appointment scheduled",
        body: `${patient.name} has a new appointment: ${parsed.data.reason}.`,
        deepLink: "/nurse/patients",
        priority: "medium",
        sourceType: "appointment",
        sourceId: id,
        createdAt: new Date(),
      });
    }

    revalidatePath("/doctor/appointments");
    revalidatePath("/patient");
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to create appointment.");
  }
}

export async function cancelAppointment(appointmentId: string): Promise<ActionResult<void>> {
  try {
    const session = await requireRoleAction("doctor");
    const appt = await findAppointmentById(appointmentId);
    if (!appt) return fail("Appointment not found.");
    const patient = await getPatientWithProfile(appt.patientId);
    if (!patient || patient.assignedDoctorId !== session.user.id) {
      return fail("Forbidden.");
    }

    await cancelAppointmentById(appointmentId);
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: "doctor",
      action: "appointment.cancelled",
      entityType: "appointment",
      entityId: appointmentId,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    await insertNotification({
      id: crypto.randomUUID(),
      userId: appt.patientId,
      type: "appointment_cancelled",
      title: "Appointment cancelled",
      body: `Your appointment (${appt.whenLabel}) has been cancelled.`,
      deepLink: "/patient",
      priority: "medium",
      sourceType: "appointment",
      sourceId: appointmentId,
      createdAt: new Date(),
    });
    if (patient.assignedNurseId) {
      await insertNotification({
        id: crypto.randomUUID(),
        userId: patient.assignedNurseId,
        type: "appointment_cancelled",
        title: "Patient appointment cancelled",
        body: `An appointment for ${patient.name} was cancelled.`,
        deepLink: "/nurse/patients",
        priority: "medium",
        sourceType: "appointment",
        sourceId: appointmentId,
        createdAt: new Date(),
      });
    }

    revalidatePath("/doctor/appointments");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to cancel appointment.");
  }
}
