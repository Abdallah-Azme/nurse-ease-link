import "server-only";

import { collections } from "@/db/mongo/collections";
import type { RiskLevel } from "@/db/mongo/types";

export type { RiskLevel } from "@/db/mongo/types";

export function parseConditions(conditions: string[] | string): string[] {
  if (Array.isArray(conditions)) return conditions;
  return JSON.parse(conditions) as string[];
}

export { getUserByEmail, getUserById } from "./users";

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
  return messages.find({ threadId }).sort({ createdAt: 1 }).toArray();
}

export async function getThreadId(patientId: string, staffId: string) {
  return `${patientId}-${staffId}`;
}

export async function getAppointmentsForPatient(patientId: string) {
  const { appointments } = await collections();
  return appointments.find({ patientId, status: "scheduled" }).toArray();
}

export async function getAppointmentsForDoctor(doctorId: string) {
  const patientIds = (await getPatientsForDoctor(doctorId)).map((p) => p.id);
  if (!patientIds.length) return [];
  const { appointments } = await collections();
  return appointments.find({ patientId: { $in: patientIds }, status: "scheduled" }).toArray();
}

export async function getAdherenceTrend() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      day: d.toISOString().slice(5, 10),
      rate: 78 + Math.round(Math.sin(i / 2) * 8 + i * 0.6),
    };
  });
}

export async function getPlatformStats() {
  const { patientProfiles, users } = await collections();
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
    emergenciesThisWeek: 0,
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
