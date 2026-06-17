import type { Collection, Db } from "mongodb";

import { getMongoDb } from "./connection";
import type {
  AlertDoc,
  AppointmentDoc,
  EmergencyDoc,
  FcmTokenDoc,
  MedicationDoc,
  MedicationLogDoc,
  MessageDoc,
  PatientProfileDoc,
  StaffProfileDoc,
  UserDoc,
  VitalsReadingDoc,
} from "./types";

export const COLLECTIONS = {
  users: "users",
  patientProfiles: "patient_profiles",
  staffProfiles: "staff_profiles",
  vitalsReadings: "vitals_readings",
  medications: "medications",
  medicationLogs: "medication_logs",
  alerts: "alerts",
  messages: "messages",
  appointments: "appointments",
  emergencies: "emergencies",
  fcmTokens: "fcm_tokens",
} as const;

export async function collections(db?: Db) {
  const database = db ?? (await getMongoDb());
  return {
    users: database.collection<UserDoc>(COLLECTIONS.users),
    patientProfiles: database.collection<PatientProfileDoc>(COLLECTIONS.patientProfiles),
    staffProfiles: database.collection<StaffProfileDoc>(COLLECTIONS.staffProfiles),
    vitalsReadings: database.collection<VitalsReadingDoc>(COLLECTIONS.vitalsReadings),
    medications: database.collection<MedicationDoc>(COLLECTIONS.medications),
    medicationLogs: database.collection<MedicationLogDoc>(COLLECTIONS.medicationLogs),
    alerts: database.collection<AlertDoc>(COLLECTIONS.alerts),
    messages: database.collection<MessageDoc>(COLLECTIONS.messages),
    appointments: database.collection<AppointmentDoc>(COLLECTIONS.appointments),
    emergencies: database.collection<EmergencyDoc>(COLLECTIONS.emergencies),
    fcmTokens: database.collection<FcmTokenDoc>(COLLECTIONS.fcmTokens),
  };
}

export type Collections = Awaited<ReturnType<typeof collections>>;
export type { Collection };
