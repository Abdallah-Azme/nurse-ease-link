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
  status?: "active" | "pending" | "inactive";
  notificationPreferences?: {
    push: boolean;
    inApp: boolean;
    email: boolean;
    quietHours: string;
  };
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
  caregiverName?: string;
  caregiverPhone?: string;
  preferredEscalation?: "phone" | "sms" | "chat";
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

export interface SymptomCheckinDoc {
  id: string;
  patientId: string;
  recordedAt: Date;
  pain: number;
  nausea: number;
  fatigue: number;
  appetite: number;
  sleep: number;
  anxiety: number;
  breathlessness: number;
  notes?: string;
  alertLevel: "ok" | "watch" | "urgent";
}

export interface CareGoalDoc {
  id: string;
  patientId: string;
  title: string;
  details: string;
  status: "active" | "completed" | "paused";
  dueDate?: Date | null;
}

export interface CarePlanDoc {
  id: string;
  patientId: string;
  summary: string;
  updatedAt: Date;
  nextReviewAt?: Date | null;
  goals: CareGoalDoc[];
  interventions: string[];
  caregiverNotes?: string;
}

export interface VisitScheduleDoc {
  id: string;
  patientId: string;
  staffId: string;
  staffName: string;
  scheduledAt: Date;
  type: "home_visit" | "phone_followup" | "video_call";
  status: "scheduled" | "completed" | "missed" | "cancelled";
  reason: string;
}

export interface EducationResourceDoc {
  id: string;
  title: string;
  category: string;
  audience: "patient" | "caregiver" | "staff";
  summary: string;
  content: string;
}

export interface CommunicationLogDoc {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  channel: "call" | "chat" | "visit" | "note";
  summary: string;
  createdAt: Date;
}

export interface OutcomeSnapshotDoc {
  id: string;
  patientId: string;
  recordedAt: Date;
  symptomScore: number;
  adherenceScore: number;
  qualityOfLifeScore: number;
  alertCount: number;
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
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: Date;
  readAt?: Date | null;
}

export interface ConversationDoc {
  id: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date | null;
}

export interface ConversationMemberDoc {
  id: string;
  conversationId: string;
  userId: string;
  role: UserRole;
  readCursorAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface AssignmentDoc {
  id: string;
  patientId: string;
  role: "nurse" | "doctor";
  staffId: string;
  startsAt: Date;
  endsAt?: Date | null;
  reason?: string;
  changedBy: string;
  version: number;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  deepLink: string;
  priority: "low" | "medium" | "high" | "critical";
  sourceType?: string;
  sourceId?: string;
  readAt?: Date | null;
  archivedAt?: Date | null;
  createdAt: Date;
}

export interface NotificationDeliveryDoc {
  id: string;
  notificationId: string;
  channel: "in_app" | "push" | "email";
  providerMessageId?: string;
  status: "pending" | "sent" | "failed" | "retrying";
  attemptCount: number;
  nextRetryAt?: Date | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogDoc {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  correlationId: string;
  createdAt: Date;
}

export interface OutboxJobDoc {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "sent" | "failed" | "retrying";
  attempts: number;
  availableAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastError?: string | null;
  deadLetteredAt?: Date | null;
  dedupeKey?: string;
  lockedAt?: Date | null;
  lockedBy?: string | null;
}

export interface DomainEventDoc {
  id: string;
  type: string;
  aggregateType: string;
  aggregateId: string;
  actorId: string;
  patientId?: string;
  correlationId: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface IdempotencyKeyDoc {
  actorId: string;
  key: string;
  operation: string;
  correlationId: string;
  resourceId: string;
  createdAt: Date;
  expiresAt: Date;
}
