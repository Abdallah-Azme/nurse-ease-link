import "server-only";

import { collections } from "@/db/mongo/collections";
import type {
  AssignmentDoc,
  AuditLogDoc,
  AlertDoc,
  AppointmentDoc,
  CommunicationLogDoc,
  CarePlanDoc,
  EmergencyDoc,
  OutcomeSnapshotDoc,
  MedicationDoc,
  MedicationLogDoc,
  MessageDoc,
  NotificationDoc,
  NotificationDeliveryDoc,
  OutboxJobDoc,
  SymptomCheckinDoc,
  VisitScheduleDoc,
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

export async function markMessagesRead(threadId: string, recipientId: string) {
  const { messages } = await collections();
  await messages.updateMany(
    { conversationId: threadId, recipientId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
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

export async function insertSymptomCheckin(doc: SymptomCheckinDoc) {
  const { symptomCheckins } = await collections();
  await symptomCheckins.insertOne(doc);
}

export async function upsertCarePlan(doc: CarePlanDoc) {
  const { carePlans } = await collections();
  await carePlans.updateOne({ patientId: doc.patientId }, { $set: doc }, { upsert: true });
}

export async function insertVisitSchedule(doc: VisitScheduleDoc) {
  const { visitSchedules } = await collections();
  await visitSchedules.insertOne(doc);
}

export async function insertCommunicationLog(doc: CommunicationLogDoc) {
  const { communicationLogs } = await collections();
  await communicationLogs.insertOne(doc);
}

export async function insertOutcomeSnapshot(doc: OutcomeSnapshotDoc) {
  const { outcomeSnapshots } = await collections();
  await outcomeSnapshots.insertOne(doc);
}

export async function findAppointmentById(appointmentId: string) {
  const { appointments } = await collections();
  return appointments.findOne({ id: appointmentId });
}

export async function cancelAppointmentById(appointmentId: string) {
  const { appointments } = await collections();
  await appointments.updateOne({ id: appointmentId }, { $set: { status: "cancelled" } });
}

export async function insertAssignment(doc: AssignmentDoc) {
  const { assignments } = await collections();
  await assignments.insertOne(doc);
}

export async function insertNotification(doc: NotificationDoc) {
  const { notifications } = await collections();
  await notifications.insertOne(doc);
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
  readAt = new Date(),
) {
  const { notifications } = await collections();
  return notifications.updateOne({ id: notificationId, userId }, { $set: { readAt } });
}

export async function insertNotificationDelivery(doc: NotificationDeliveryDoc) {
  const { notificationDeliveries } = await collections();
  await notificationDeliveries.insertOne(doc);
}

export async function insertAuditLog(doc: AuditLogDoc) {
  const { auditLogs } = await collections();
  await auditLogs.insertOne(doc);
}

export async function insertOutboxJob(doc: OutboxJobDoc) {
  const { outboxJobs } = await collections();
  await outboxJobs.insertOne(doc);
}

export async function findMedicationsByPatientIds(patientIds: string[]) {
  const { medications } = await collections();
  return medications.find({ patientId: { $in: patientIds } }).toArray();
}

export async function findMedicationsByPatientId(patientId: string) {
  const { medications } = await collections();
  return medications.find({ patientId }).toArray();
}
