import bcrypt from "bcryptjs";

import { ensureIndexes } from "./mongo/connection";
import { collections } from "./mongo/collections";

const now = new Date();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

export async function seed() {
  await ensureIndexes();
  const cols = await collections();

  const existing = await cols.users.findOne({});
  if (existing) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const passwordHash = await hash("demo123");

  const userRows = [
    { id: "p1", email: "patient@careconnect.demo", name: "Amelia Hart", role: "patient" as const },
    { id: "p2", email: "marcus@careconnect.demo", name: "Marcus Webb", role: "patient" as const },
    {
      id: "p3",
      email: "priya@careconnect.demo",
      name: "Priya Natarajan",
      role: "patient" as const,
    },
    { id: "p4", email: "diego@careconnect.demo", name: "Diego Alvarez", role: "patient" as const },
    { id: "p5", email: "noor@careconnect.demo", name: "Noor Haddad", role: "patient" as const },
    { id: "p6", email: "henrik@careconnect.demo", name: "Henrik Larsen", role: "patient" as const },
    { id: "n1", email: "nurse@careconnect.demo", name: "Jordan Reyes, RN", role: "nurse" as const },
    { id: "n2", email: "sam@careconnect.demo", name: "Sam Okafor, RN", role: "nurse" as const },
    { id: "d1", email: "doctor@careconnect.demo", name: "Dr. Mei Chen", role: "doctor" as const },
    {
      id: "d2",
      email: "rafael@careconnect.demo",
      name: "Dr. Rafael Souza",
      role: "doctor" as const,
    },
    { id: "a1", email: "admin@careconnect.demo", name: "Sasha Ortiz", role: "admin" as const },
  ];

  await cols.users.insertMany(userRows.map((u) => ({ ...u, passwordHash, createdAt: now })));

  const patients = [
    {
      userId: "p1",
      age: 62,
      sex: "F" as const,
      conditions: ["Hypertension", "Type 2 Diabetes"],
      risk: "medium" as const,
      adherence: 87,
      assignedNurseId: "n1",
      assignedDoctorId: "d1",
      avatarHue: 185,
    },
    {
      userId: "p2",
      age: 71,
      sex: "M" as const,
      conditions: ["CHF", "Atrial Fibrillation"],
      risk: "high" as const,
      adherence: 64,
      assignedNurseId: "n1",
      assignedDoctorId: "d1",
      avatarHue: 25,
    },
    {
      userId: "p3",
      age: 48,
      sex: "F" as const,
      conditions: ["Asthma"],
      risk: "low" as const,
      adherence: 96,
      assignedNurseId: "n2",
      assignedDoctorId: "d1",
      avatarHue: 155,
    },
    {
      userId: "p4",
      age: 55,
      sex: "M" as const,
      conditions: ["Type 2 Diabetes"],
      risk: "medium" as const,
      adherence: 78,
      assignedNurseId: "n1",
      assignedDoctorId: "d2",
      avatarHue: 250,
    },
    {
      userId: "p5",
      age: 34,
      sex: "F" as const,
      conditions: ["Postpartum monitoring"],
      risk: "low" as const,
      adherence: 92,
      assignedNurseId: "n2",
      assignedDoctorId: "d2",
      avatarHue: 320,
    },
    {
      userId: "p6",
      age: 78,
      sex: "M" as const,
      conditions: ["COPD", "Hypertension"],
      risk: "high" as const,
      adherence: 58,
      assignedNurseId: "n1",
      assignedDoctorId: "d1",
      avatarHue: 75,
    },
  ];

  await cols.patientProfiles.insertMany(patients);

  await cols.staffProfiles.insertMany([
    { userId: "n1", specialty: "Cardiac care", patientsCount: 4 },
    { userId: "n2", specialty: "General medicine", patientsCount: 2 },
    { userId: "d1", specialty: "Cardiology", patientsCount: 4 },
    { userId: "d2", specialty: "Endocrinology", patientsCount: 2 },
    { userId: "a1", specialty: null, patientsCount: 0 },
  ]);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { day: d.toISOString().slice(5, 10), date: d };
  });

  const vitalsRows = [];
  for (const { day, date } of days) {
    const i = days.findIndex((d) => d.day === day);
    vitalsRows.push(
      {
        id: `bp-p1-${day}`,
        patientId: "p1",
        type: "blood_pressure" as const,
        dayLabel: day,
        recordedAt: date,
        systolic: 128 + Math.round(Math.sin(i / 2) * 8 + (i === 9 ? 18 : 0)),
        diastolic: 82 + Math.round(Math.cos(i / 2) * 5 + (i === 9 ? 8 : 0)),
      },
      {
        id: `bg-p1-${day}`,
        patientId: "p1",
        type: "blood_sugar" as const,
        dayLabel: day,
        recordedAt: date,
        fasting: 110 + Math.round(Math.sin(i) * 14) + (i === 11 ? 30 : 0),
      },
      {
        id: `hr-p1-${day}`,
        patientId: "p1",
        type: "heart_rate" as const,
        dayLabel: day,
        recordedAt: date,
        bpm: 72 + Math.round(Math.cos(i / 1.5) * 6),
      },
      {
        id: `wt-p1-${day}`,
        patientId: "p1",
        type: "weight" as const,
        dayLabel: day,
        recordedAt: date,
        kg: 72.4 - i * 0.05 + Math.sin(i) * 0.2,
      },
      {
        id: `o2-p1-${day}`,
        patientId: "p1",
        type: "oxygen" as const,
        dayLabel: day,
        recordedAt: date,
        spo2: 97 + Math.round(Math.sin(i) * 1) - (i === 9 ? 4 : 0),
      },
    );
  }
  await cols.vitalsReadings.insertMany(vitalsRows);

  await cols.medications.insertMany([
    {
      id: "m1",
      patientId: "p1",
      name: "Lisinopril",
      dose: "10 mg",
      schedule: "Once daily, morning",
      nextDose: "Tomorrow 8:00 AM",
      adherence: 92,
    },
    {
      id: "m2",
      patientId: "p1",
      name: "Metformin",
      dose: "500 mg",
      schedule: "Twice daily with meals",
      nextDose: "Today 7:00 PM",
      adherence: 85,
    },
    {
      id: "m3",
      patientId: "p1",
      name: "Atorvastatin",
      dose: "20 mg",
      schedule: "Once daily, bedtime",
      nextDose: "Today 10:00 PM",
      adherence: 88,
    },
    {
      id: "m4",
      patientId: "p1",
      name: "Aspirin",
      dose: "81 mg",
      schedule: "Once daily",
      nextDose: "Tomorrow 8:00 AM",
      adherence: 96,
    },
  ]);

  const alertTime = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60_000);
  await cols.alerts.insertMany([
    {
      id: "a1",
      patientId: "p2",
      level: "critical",
      message: "BP 178/104 — recheck and call patient",
      createdAt: alertTime(12),
    },
    {
      id: "a2",
      patientId: "p6",
      level: "warning",
      message: "SpO₂ dropped to 91%",
      createdAt: alertTime(60),
    },
    {
      id: "a3",
      patientId: "p1",
      level: "warning",
      message: "Missed evening Metformin dose",
      createdAt: alertTime(120),
    },
    {
      id: "a4",
      patientId: "p4",
      level: "info",
      message: "Wellness check-in: low energy reported",
      createdAt: alertTime(300),
    },
  ]);

  const threadId = "p1-n1";
  const msgNow = new Date();
  await cols.messages.insertMany([
    {
      id: "c1",
      threadId,
      senderId: "n1",
      recipientId: "p1",
      body: "Good morning Amelia — how did you sleep?",
      createdAt: new Date(msgNow.setHours(8, 2)),
    },
    {
      id: "c2",
      threadId,
      senderId: "p1",
      recipientId: "n1",
      body: "Slept ok, BP felt a bit high this morning.",
      createdAt: new Date(msgNow.setHours(8, 14)),
    },
    {
      id: "c3",
      threadId,
      senderId: "n1",
      recipientId: "p1",
      body: "Thanks for logging it. Let's recheck in 30 minutes and I'll review.",
      createdAt: new Date(msgNow.setHours(8, 15)),
    },
  ]);

  await cols.appointments.insertMany([
    {
      id: "ap1",
      patientId: "p1",
      staffId: "d1",
      staffName: "Dr. Mei Chen",
      whenLabel: "Thu, 2:30 PM",
      reason: "Quarterly cardiology review",
      status: "scheduled",
    },
    {
      id: "ap2",
      patientId: "p1",
      staffId: "n1",
      staffName: "Nurse Jordan",
      whenLabel: "Mon, 10:00 AM",
      reason: "Medication review",
      status: "scheduled",
    },
  ]);

  console.log("MongoDB seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
