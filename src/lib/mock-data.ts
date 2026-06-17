// Centralized mock data for CareConnect demo.
// Replace with real data once Lovable Cloud is wired up.

export type Role = "patient" | "nurse" | "doctor" | "admin";

export type RiskLevel = "low" | "medium" | "high";

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M";
  conditions: string[];
  risk: RiskLevel;
  adherence: number; // 0-100
  assignedNurseId: string;
  assignedDoctorId: string;
  avatarHue: number;
}

export interface Staff {
  id: string;
  name: string;
  role: "nurse" | "doctor" | "admin";
  specialty?: string;
  patientsCount: number;
}

export const currentUser = {
  patient: { id: "p1", name: "Amelia Hart", role: "patient" as const },
  nurse: { id: "n1", name: "Jordan Reyes, RN", role: "nurse" as const },
  doctor: { id: "d1", name: "Dr. Mei Chen", role: "doctor" as const },
  admin: { id: "a1", name: "Sasha Ortiz", role: "admin" as const },
};

export const patients: Patient[] = [
  { id: "p1", name: "Amelia Hart", age: 62, sex: "F", conditions: ["Hypertension", "Type 2 Diabetes"], risk: "medium", adherence: 87, assignedNurseId: "n1", assignedDoctorId: "d1", avatarHue: 185 },
  { id: "p2", name: "Marcus Webb", age: 71, sex: "M", conditions: ["CHF", "Atrial Fibrillation"], risk: "high", adherence: 64, assignedNurseId: "n1", assignedDoctorId: "d1", avatarHue: 25 },
  { id: "p3", name: "Priya Natarajan", age: 48, sex: "F", conditions: ["Asthma"], risk: "low", adherence: 96, assignedNurseId: "n2", assignedDoctorId: "d1", avatarHue: 155 },
  { id: "p4", name: "Diego Alvarez", age: 55, sex: "M", conditions: ["Type 2 Diabetes"], risk: "medium", adherence: 78, assignedNurseId: "n1", assignedDoctorId: "d2", avatarHue: 250 },
  { id: "p5", name: "Noor Haddad", age: 34, sex: "F", conditions: ["Postpartum monitoring"], risk: "low", adherence: 92, assignedNurseId: "n2", assignedDoctorId: "d2", avatarHue: 320 },
  { id: "p6", name: "Henrik Larsen", age: 78, sex: "M", conditions: ["COPD", "Hypertension"], risk: "high", adherence: 58, assignedNurseId: "n1", assignedDoctorId: "d1", avatarHue: 75 },
];

export const staff: Staff[] = [
  { id: "n1", name: "Jordan Reyes, RN", role: "nurse", specialty: "Cardiac care", patientsCount: 4 },
  { id: "n2", name: "Sam Okafor, RN", role: "nurse", specialty: "General medicine", patientsCount: 2 },
  { id: "d1", name: "Dr. Mei Chen", role: "doctor", specialty: "Cardiology", patientsCount: 4 },
  { id: "d2", name: "Dr. Rafael Souza", role: "doctor", specialty: "Endocrinology", patientsCount: 2 },
];

// Vitals time series for current patient (p1)
const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return d.toISOString().slice(5, 10);
});

export const vitals = {
  bloodPressure: days.map((day, i) => ({
    day,
    systolic: 128 + Math.round(Math.sin(i / 2) * 8 + (i === 9 ? 18 : 0)),
    diastolic: 82 + Math.round(Math.cos(i / 2) * 5 + (i === 9 ? 8 : 0)),
  })),
  bloodSugar: days.map((day, i) => ({ day, fasting: 110 + Math.round(Math.sin(i) * 14) + (i === 11 ? 30 : 0) })),
  heartRate: days.map((day, i) => ({ day, bpm: 72 + Math.round(Math.cos(i / 1.5) * 6) })),
  weight: days.map((day, i) => ({ day, kg: 72.4 - i * 0.05 + Math.sin(i) * 0.2 })),
  oxygen: days.map((day, i) => ({ day, spo2: 97 + Math.round(Math.sin(i) * 1) - (i === 9 ? 4 : 0) })),
};

export interface Medication {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  nextDose: string;
  adherence: number;
  taken?: boolean;
}

export const medications: Medication[] = [
  { id: "m1", name: "Lisinopril", dose: "10 mg", schedule: "Once daily, morning", nextDose: "Tomorrow 8:00 AM", adherence: 92, taken: true },
  { id: "m2", name: "Metformin", dose: "500 mg", schedule: "Twice daily with meals", nextDose: "Today 7:00 PM", adherence: 85, taken: false },
  { id: "m3", name: "Atorvastatin", dose: "20 mg", schedule: "Once daily, bedtime", nextDose: "Today 10:00 PM", adherence: 88, taken: false },
  { id: "m4", name: "Aspirin", dose: "81 mg", schedule: "Once daily", nextDose: "Tomorrow 8:00 AM", adherence: 96, taken: true },
];

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  level: "info" | "warning" | "critical";
  message: string;
  time: string;
}

export const alerts: Alert[] = [
  { id: "a1", patientId: "p2", patientName: "Marcus Webb", level: "critical", message: "BP 178/104 — recheck and call patient", time: "12 min ago" },
  { id: "a2", patientId: "p6", patientName: "Henrik Larsen", level: "warning", message: "SpO₂ dropped to 91%", time: "1 h ago" },
  { id: "a3", patientId: "p1", patientName: "Amelia Hart", level: "warning", message: "Missed evening Metformin dose", time: "2 h ago" },
  { id: "a4", patientId: "p4", patientName: "Diego Alvarez", level: "info", message: "Wellness check-in: low energy reported", time: "5 h ago" },
];

export interface ChatMessage {
  id: string;
  from: "me" | "them" | "ai" | "system";
  text: string;
  time: string;
}

export const nurseChat: ChatMessage[] = [
  { id: "c1", from: "them", text: "Good morning Amelia — how did you sleep?", time: "8:02 AM" },
  { id: "c2", from: "me", text: "Slept ok, BP felt a bit high this morning.", time: "8:14 AM" },
  { id: "c3", from: "them", text: "Thanks for logging it. Let's recheck in 30 minutes and I'll review.", time: "8:15 AM" },
];

export const appointments = [
  { id: "ap1", with: "Dr. Mei Chen", when: "Thu, 2:30 PM", reason: "Quarterly cardiology review" },
  { id: "ap2", with: "Nurse Jordan", when: "Mon, 10:00 AM", reason: "Medication review" },
];

export const adherenceTrend = days.map((day, i) => ({
  day,
  rate: 78 + Math.round(Math.sin(i / 2) * 8 + i * 0.6),
}));

export const platformStats = {
  totalPatients: 1248,
  activeNurses: 38,
  activeDoctors: 14,
  emergenciesThisWeek: 6,
  avgAdherence: 84,
  highRisk: 92,
};

export function riskColor(r: RiskLevel) {
  return r === "high" ? "text-destructive" : r === "medium" ? "text-warning" : "text-success";
}
export function riskBg(r: RiskLevel) {
  return r === "high"
    ? "bg-destructive/10 text-destructive"
    : r === "medium"
    ? "bg-warning/15 text-warning-foreground"
    : "bg-success/10 text-success";
}
