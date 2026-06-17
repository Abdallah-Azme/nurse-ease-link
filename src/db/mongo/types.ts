export type UserRole = "patient" | "nurse" | "doctor" | "admin";
export type RiskLevel = "low" | "medium" | "high";
export type AlertLevel = "info" | "warning" | "critical";

export interface UserDoc {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
}

export interface PatientProfileDoc {
  userId: string;
  age: number;
  sex: "F" | "M";
  conditions: string[];
  risk: RiskLevel;
  adherence: number;
  assignedNurseId: string;
  assignedDoctorId: string;
  avatarHue: number;
}

export interface StaffProfileDoc {
  userId: string;
  specialty: string | null;
  patientsCount: number;
}

export interface VitalsReadingDoc {
  id: string;
  patientId: string;
  type: "blood_pressure" | "blood_sugar" | "heart_rate" | "weight" | "oxygen";
  dayLabel: string;
  recordedAt: Date;
  systolic?: number;
  diastolic?: number;
  fasting?: number;
  bpm?: number;
  kg?: number;
  spo2?: number;
}

export interface MedicationDoc {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  schedule: string;
  nextDose: string;
  adherence: number;
}

export interface MedicationLogDoc {
  id: string;
  medicationId: string;
  patientId: string;
  takenAt: Date;
}

export interface AlertDoc {
  id: string;
  patientId: string;
  level: AlertLevel;
  message: string;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export interface MessageDoc {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: Date;
}

export interface AppointmentDoc {
  id: string;
  patientId: string;
  staffId?: string | null;
  staffName: string;
  whenLabel: string;
  scheduledAt?: Date | null;
  reason: string;
  status: "scheduled" | "cancelled" | "completed";
}

export interface EmergencyDoc {
  id: string;
  patientId: string;
  answers: string[];
  severity: "mild" | "moderate" | "severe";
  status: "open" | "resolved";
  createdAt: Date;
}

export interface FcmTokenDoc {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}
