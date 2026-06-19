import "server-only";

import { collections } from "@/db/mongo/collections";
import type { RiskLevel } from "@/db/mongo/types";

export type { RiskLevel } from "@/db/mongo/types";

export function parseConditions(conditions: string[] | string): string[] {
  if (Array.isArray(conditions)) return conditions;
  return JSON.parse(conditions) as string[];
}

export { getUserByEmail, getUserById } from "./users";
export { getOrCreateConversation } from "./conversations";

async function mapPatientRow(userId: string) {
  const { users, patientProfiles } = await collections();
  const user = await users.findOne({ id: userId });
  const profile = await patientProfiles.findOne({ userId });
  if (!user || !profile) return null;
  return {
    id: user.id,
    name: user.name,
    age: profile.age,
    sex: profile.sex,
    conditions: parseConditions(profile.conditions),
    risk: profile.risk as RiskLevel,
    adherence: profile.adherence,
    assignedNurseId: profile.assignedNurseId,
    assignedDoctorId: profile.assignedDoctorId,
    avatarHue: profile.avatarHue,
  };
}

export async function getPatientWithProfile(patientId: string) {
  const { users, patientProfiles } = await collections();
  const user = await users.findOne({ id: patientId });
  const profile = await patientProfiles.findOne({ userId: patientId });
  if (!user || !profile) return null;
  return {
    ...user,
    ...profile,
    conditions: parseConditions(profile.conditions),
  };
}

export async function getPatientsForNurse(nurseId: string) {
  const { patientProfiles } = await collections();
  const profiles = await patientProfiles.find({ assignedNurseId: nurseId }).toArray();
  const rows = await Promise.all(profiles.map((p) => mapPatientRow(p.userId)));
  return rows.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getPatientsForDoctor(doctorId: string) {
  const { patientProfiles } = await collections();
  const profiles = await patientProfiles.find({ assignedDoctorId: doctorId }).toArray();
  const rows = await Promise.all(profiles.map((p) => mapPatientRow(p.userId)));
  return rows.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getAllPatients() {
  const { patientProfiles } = await collections();
  const profiles = await patientProfiles.find({}).toArray();
  const rows = await Promise.all(profiles.map((p) => mapPatientRow(p.userId)));
  return rows.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getAllStaff() {
  const { users, staffProfiles } = await collections();
  const staffUsers = await users.find({ role: { $in: ["nurse", "doctor"] } }).toArray();
  const result = [];
  for (const user of staffUsers) {
    const profile = await staffProfiles.findOne({ userId: user.id });
    if (!profile) continue;
    result.push({
      id: user.id,
      name: user.name,
      role: user.role as "nurse" | "doctor",
      status: user.status ?? "active",
      specialty: profile.specialty ?? undefined,
      patientsCount: profile.patientsCount,
    });
  }
  return result;
}

export async function getNursesAndDoctors() {
  const { users, staffProfiles } = await collections();
  const staffUsers = await users.find({ role: { $in: ["nurse", "doctor"] } }).toArray();
  return Promise.all(
    staffUsers.map(async (user) => ({
      user,
      profile: await staffProfiles.findOne({ userId: user.id }),
    })),
  );
}

export async function updatePatientAssignments(
  patientId: string,
  assignedNurseId: string,
  assignedDoctorId: string,
) {
  const { patientProfiles } = await collections();
  await patientProfiles.updateOne(
    { userId: patientId },
    { $set: { assignedNurseId, assignedDoctorId } },
  );
}

export async function getVitalsForPatient(patientId: string) {
  const { vitalsReadings } = await collections();
  const rows = await vitalsReadings.find({ patientId }).sort({ recordedAt: 1 }).toArray();

  return {
    bloodPressure: rows
      .filter((r) => r.type === "blood_pressure")
      .map((r) => ({ day: r.dayLabel, systolic: r.systolic!, diastolic: r.diastolic! })),
    bloodSugar: rows
      .filter((r) => r.type === "blood_sugar")
      .map((r) => ({ day: r.dayLabel, fasting: r.fasting! })),
    heartRate: rows
      .filter((r) => r.type === "heart_rate")
      .map((r) => ({ day: r.dayLabel, bpm: r.bpm! })),
    weight: rows.filter((r) => r.type === "weight").map((r) => ({ day: r.dayLabel, kg: r.kg! })),
    oxygen: rows
      .filter((r) => r.type === "oxygen")
      .map((r) => ({ day: r.dayLabel, spo2: r.spo2! })),
  };
}

export async function getMedicationsForPatient(patientId: string) {
  const { medications, medicationLogs } = await collections();
  const meds = await medications.find({ patientId }).toArray();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];
  for (const med of meds) {
    const log = await medicationLogs.findOne(
      { medicationId: med.id, takenAt: { $gte: today } },
      { sort: { takenAt: -1 } },
    );
    result.push({ ...med, taken: !!log });
  }
  return result;
}

export async function getAlertsForPatients(patientIds?: string[], includeResolved = false) {
  const { alerts, users } = await collections();
  const filter: Record<string, unknown> = {};
  if (patientIds?.length) filter.patientId = { $in: patientIds };
  if (!includeResolved) {
    filter.$or = [{ resolvedAt: { $exists: false } }, { resolvedAt: null }];
  }

  const rows = await alerts.find(filter).sort({ createdAt: -1 }).toArray();
  const result = [];
  for (const alert of rows) {
    const patient = await users.findOne({ id: alert.patientId });
    result.push({
      id: alert.id,
      patientId: alert.patientId,
      patientName: patient?.name ?? "Unknown",
      level: alert.level,
      message: alert.message,
      time: formatRelativeTime(alert.createdAt),
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt ?? null,
    });
  }
  return result;
}

export async function getAllAlerts(includeResolved = false) {
  return getAlertsForPatients(undefined, includeResolved);
}

export async function getMessagesForThread(threadId: string) {
  const { messages } = await collections();
  return messages.find({ conversationId: threadId }).sort({ createdAt: 1 }).toArray();
}

export async function getUnreadMessageCountForUser(userId: string) {
  const { messages } = await collections();
  return messages.countDocuments({ recipientId: userId, readAt: { $exists: false } });
}

export async function getUnreadNotificationCountForUser(userId: string) {
  const { notifications } = await collections();
  return notifications.countDocuments({ userId, readAt: { $exists: false } });
}

export async function getMessageThreadsForUser(userId: string) {
  const { messages, users } = await collections();
  const rows = await messages
    .find({ $or: [{ senderId: userId }, { recipientId: userId }] })
    .toArray();
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const threadId = row.conversationId;
    if (!grouped.has(threadId)) grouped.set(threadId, []);
    grouped.get(threadId)!.push(row);
  }

  const result = [];
  for (const [threadId, threadMessages] of grouped.entries()) {
    const last = [...threadMessages].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    )[0];
    const unreadCount = threadMessages.filter((m) => m.recipientId === userId && !m.readAt).length;
    const otherId = last.senderId === userId ? last.recipientId : last.senderId;
    const other = await users.findOne({ id: otherId });
    result.push({
      threadId,
      participantId: otherId,
      participantName: other?.name ?? "Unknown",
      participantRole: other?.role ?? "patient",
      lastMessage: last.body,
      lastMessageAt: last.createdAt,
      unreadCount,
    });
  }
  return result.sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
}

export async function getNotificationFeedForUser(userId: string) {
  const { notifications } = await collections();
  const rows = await notifications.find({ userId }).sort({ createdAt: -1 }).toArray();
  return rows.map((n) => ({
    id: n.id,
    type: n.type as "alert" | "message" | "system",
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    url: n.deepLink,
    unread: !n.readAt,
  }));
}

export async function getThreadId(patientId: string, staffId: string) {
  return `${patientId}-${staffId}`;
}

export async function getAppointmentsForPatient(patientId: string) {
  const { appointments } = await collections();
  return appointments.find({ patientId, status: "scheduled" }).sort({ scheduledAt: 1 }).toArray();
}

export async function getAppointmentsForDoctor(doctorId: string) {
  const patientIds = (await getPatientsForDoctor(doctorId)).map((p) => p.id);
  if (!patientIds.length) return [];
  const { appointments } = await collections();
  return appointments
    .find({ patientId: { $in: patientIds }, status: "scheduled" })
    .sort({ scheduledAt: 1 })
    .toArray();
}

export async function getSymptomCheckinsForPatient(patientId: string) {
  const { symptomCheckins } = await collections();
  return symptomCheckins.find({ patientId }).sort({ recordedAt: -1 }).toArray();
}

export async function getCarePlanForPatient(patientId: string) {
  const { carePlans } = await collections();
  return carePlans.findOne({ patientId });
}

export async function getVisitSchedulesForPatient(patientId: string) {
  const { visitSchedules } = await collections();
  return visitSchedules.find({ patientId }).sort({ scheduledAt: 1 }).toArray();
}

export async function getOverdueVisitSchedules() {
  const { visitSchedules } = await collections();
  return visitSchedules
    .find({ status: "scheduled", scheduledAt: { $lt: new Date() } })
    .sort({ scheduledAt: 1 })
    .toArray();
}

export async function getEducationResources(audience?: "patient" | "caregiver" | "staff") {
  const { educationResources } = await collections();
  const filter = audience ? { audience } : {};
  return educationResources.find(filter).sort({ category: 1, title: 1 }).toArray();
}

export async function getCommunicationLogsForPatient(patientId: string) {
  const { communicationLogs } = await collections();
  return communicationLogs.find({ patientId }).sort({ createdAt: -1 }).toArray();
}

export async function getOutcomeSnapshotsForPatient(patientId: string) {
  const { outcomeSnapshots } = await collections();
  return outcomeSnapshots.find({ patientId }).sort({ recordedAt: 1 }).toArray();
}

export async function getPalliativeProgramMetrics() {
  const { symptomCheckins, visitSchedules, outcomeSnapshots, medications } = await collections();
  const [checkins, visits, outcomes, meds] = await Promise.all([
    symptomCheckins.find({}).sort({ recordedAt: 1 }).toArray(),
    visitSchedules.find({}).sort({ scheduledAt: 1 }).toArray(),
    outcomeSnapshots.find({}).sort({ recordedAt: 1 }).toArray(),
    medications.find({}).toArray(),
  ]);

  const urgentCheckins = checkins.filter((c) => c.alertLevel === "urgent").length;
  const missedVisits = visits.filter((v) => v.status === "missed").length;
  const scheduledVisits = visits.filter((v) => v.status === "scheduled").length;
  const avgSymptomScore = outcomes.length
    ? Math.round(outcomes.reduce((sum, row) => sum + row.symptomScore, 0) / outcomes.length)
    : 0;
  const avgQualityOfLife = outcomes.length
    ? Math.round(outcomes.reduce((sum, row) => sum + row.qualityOfLifeScore, 0) / outcomes.length)
    : 0;
  const avgAdherence = meds.length
    ? Math.round(meds.reduce((sum, med) => sum + med.adherence, 0) / meds.length)
    : 0;

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 13);
  windowStart.setHours(0, 0, 0, 0);
  const trendSource = outcomes.filter((row) => new Date(row.recordedAt) >= windowStart);
  const trend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(windowStart);
    d.setDate(windowStart.getDate() + i);
    const dayKey = d.toISOString().slice(5, 10);
    const daily = trendSource.filter((row) => {
      const rowDay = new Date(row.recordedAt).toISOString().slice(5, 10);
      return rowDay === dayKey;
    });
    const symptom = daily.length
      ? Math.round(daily.reduce((sum, row) => sum + row.symptomScore, 0) / daily.length)
      : 0;
    const qol = daily.length
      ? Math.round(daily.reduce((sum, row) => sum + row.qualityOfLifeScore, 0) / daily.length)
      : 0;
    const adherence = daily.length
      ? Math.round(daily.reduce((sum, row) => sum + row.adherenceScore, 0) / daily.length)
      : 0;
    return { day: dayKey, symptom, qol, adherence };
  });

  return {
    urgentCheckins,
    missedVisits,
    scheduledVisits,
    avgSymptomScore,
    avgQualityOfLife,
    avgAdherence,
    trend,
  };
}

export async function getAdherenceTrend() {
  const { outcomeSnapshots, medications } = await collections();
  const [snapshots, meds] = await Promise.all([
    outcomeSnapshots.find({}).sort({ recordedAt: 1 }).toArray(),
    medications.find({}).toArray(),
  ]);

  const baseline = meds.length
    ? Math.round(meds.reduce((sum, med) => sum + med.adherence, 0) / meds.length)
    : 0;

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 13);
  windowStart.setHours(0, 0, 0, 0);
  const trendSource = snapshots.filter((row) => new Date(row.recordedAt) >= windowStart);

  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(windowStart);
    d.setDate(windowStart.getDate() + i);
    const dayKey = d.toISOString().slice(5, 10);
    const daily = trendSource.filter((row) => {
      const rowDay = new Date(row.recordedAt).toISOString().slice(5, 10);
      return rowDay === dayKey;
    });
    const rate = daily.length
      ? Math.round(daily.reduce((sum, row) => sum + row.adherenceScore, 0) / daily.length)
      : baseline;
    return { day: dayKey, rate };
  });
}

export async function getPlatformStats() {
  const { patientProfiles, users, vitalsReadings } = await collections();
  const totalPatients = await patientProfiles.countDocuments();
  const staffRows = await users.find({ role: { $in: ["nurse", "doctor"] } }).toArray();
  const nurses = staffRows.filter((s) => s.role === "nurse").length;
  const doctors = staffRows.filter((s) => s.role === "doctor").length;
  const highRisk = await patientProfiles.countDocuments({ risk: "high" });
  const profiles = await patientProfiles.find({}).toArray();
  const avgAdherence =
    profiles.length > 0 ? profiles.reduce((sum, p) => sum + p.adherence, 0) / profiles.length : 84;

  return {
    totalPatients,
    activeNurses: nurses,
    activeDoctors: doctors,
    emergenciesThisWeek: await vitalsReadings.countDocuments({
      type: "oxygen",
      spo2: { $lt: 92 },
    }),
    avgAdherence: Math.round(avgAdherence),
    highRisk,
  };
}

export async function getUnreadAlertCountForUser(userId: string, role: string) {
  if (role === "patient") {
    const rows = await getAlertsForPatients([userId]);
    return rows.filter((a) => a.level !== "info").length;
  }
  if (role === "nurse") {
    const patients = await getPatientsForNurse(userId);
    const rows = await getAlertsForPatients(patients.map((p) => p.id));
    return rows.filter((a) => a.level !== "info").length;
  }
  if (role === "doctor") {
    const patients = await getPatientsForDoctor(userId);
    const rows = await getAlertsForPatients(patients.map((p) => p.id));
    return rows.filter((a) => a.level !== "info").length;
  }
  const rows = await getAllAlerts();
  return rows.filter((a) => a.level !== "info").length;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
