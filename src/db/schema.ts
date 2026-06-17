import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["patient", "nurse", "doctor", "admin"] }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const patientProfiles = sqliteTable("patient_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  age: integer("age").notNull(),
  sex: text("sex", { enum: ["F", "M"] }).notNull(),
  conditions: text("conditions").notNull(), // JSON string[]
  risk: text("risk", { enum: ["low", "medium", "high"] }).notNull(),
  adherence: integer("adherence").notNull(),
  assignedNurseId: text("assigned_nurse_id").references(() => users.id),
  assignedDoctorId: text("assigned_doctor_id").references(() => users.id),
  avatarHue: integer("avatar_hue").notNull(),
});

export const staffProfiles = sqliteTable("staff_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  specialty: text("specialty"),
  patientsCount: integer("patients_count").notNull().default(0),
});

export const vitalsReadings = sqliteTable("vitals_readings", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => users.id),
  type: text("type", {
    enum: ["blood_pressure", "blood_sugar", "heart_rate", "weight", "oxygen"],
  }).notNull(),
  dayLabel: text("day_label").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
  systolic: integer("systolic"),
  diastolic: integer("diastolic"),
  fasting: integer("fasting"),
  bpm: integer("bpm"),
  kg: real("kg"),
  spo2: integer("spo2"),
});

export const medications = sqliteTable("medications", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  schedule: text("schedule").notNull(),
  nextDose: text("next_dose").notNull(),
  adherence: integer("adherence").notNull(),
});

export const medicationLogs = sqliteTable("medication_logs", {
  id: text("id").primaryKey(),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medications.id),
  patientId: text("patient_id")
    .notNull()
    .references(() => users.id),
  takenAt: integer("taken_at", { mode: "timestamp" }).notNull(),
});

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => users.id),
  level: text("level", { enum: ["info", "warning", "critical"] }).notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id").notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => users.id),
  staffId: text("staff_id").references(() => users.id),
  staffName: text("staff_name").notNull(),
  whenLabel: text("when_label").notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["scheduled", "cancelled", "completed"] })
    .notNull()
    .default("scheduled"),
});

export const emergencies = sqliteTable("emergencies", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => users.id),
  answers: text("answers").notNull(), // JSON string[]
  severity: text("severity", { enum: ["mild", "moderate", "severe"] }).notNull(),
  status: text("status", { enum: ["open", "resolved"] })
    .notNull()
    .default("open"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const fcmTokens = sqliteTable("fcm_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  staffProfile: one(staffProfiles, {
    fields: [users.id],
    references: [staffProfiles.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type VitalsReading = typeof vitalsReadings.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
