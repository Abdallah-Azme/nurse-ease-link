import "server-only";

import { collections } from "@/db/mongo/collections";
import type {
  AlertDoc,
  AppointmentDoc,
  EmergencyDoc,
  MedicationDoc,
  MedicationLogDoc,
  MessageDoc,
} from "@/db/mongo/types";

export async function insertEmergency(doc: EmergencyDoc) {
  const { emergencies } = await collections();
  await emergencies.insertOne(doc);
}

export async function insertAlert(doc: AlertDoc) {
  const { alerts } = await collections();
  await alerts.insertOne(doc);
}

export async function resolveAlertById(alertId: string) {
  const { alerts } = await collections();
  await alerts.updateOne({ id: alertId }, { $set: { resolvedAt: new Date() } });
}

export async function findAlertById(alertId: string) {
  const { alerts } = await collections();
  return alerts.findOne({ id: alertId });
}

export async function insertMessage(doc: MessageDoc) {
  const { messages } = await collections();
  await messages.insertOne(doc);
}

export async function insertMedicationLog(doc: MedicationLogDoc) {
  const { medicationLogs } = await collections();
  await medicationLogs.insertOne(doc);
}

export async function findMedicationById(medicationId: string) {
  const { medications } = await collections();
  return medications.findOne({ id: medicationId });
}

export async function updateMedicationNextDose(medicationId: string, nextDose: string) {
  const { medications } = await collections();
  await medications.updateOne({ id: medicationId }, { $set: { nextDose } });
}

export async function insertAppointment(doc: AppointmentDoc) {
  const { appointments } = await collections();
  await appointments.insertOne(doc);
}

export async function findAppointmentById(appointmentId: string) {
  const { appointments } = await collections();
  return appointments.findOne({ id: appointmentId });
}

export async function cancelAppointmentById(appointmentId: string) {
  const { appointments } = await collections();
  await appointments.updateOne({ id: appointmentId }, { $set: { status: "cancelled" } });
}

export async function findMedicationsByPatientIds(patientIds: string[]) {
  const { medications } = await collections();
  return medications.find({ patientId: { $in: patientIds } }).toArray();
}

export async function findMedicationsByPatientId(patientId: string) {
  const { medications } = await collections();
  return medications.find({ patientId }).toArray();
}
