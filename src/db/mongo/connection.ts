import { MongoClient, type ClientSession, type Db, type TransactionOptions } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
};

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB connection string to .env");
  }
  return uri;
}

function getDbName(): string {
  return process.env.MONGODB_DB_NAME ?? "careconnect";
}

export async function getMongoDb(): Promise<Db> {
  if (globalForMongo.mongoDb) {
    return globalForMongo.mongoDb;
  }

  const client =
    globalForMongo.mongoClient ??
    new MongoClient(getUri(), {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  if (!globalForMongo.mongoClient) {
    await client.connect();
    globalForMongo.mongoClient = client;
  }

  const db = client.db(getDbName());
  globalForMongo.mongoDb = db;
  return db;
}

export async function withMongoTransaction<T>(
  operation: (db: Db, session: ClientSession) => Promise<T>,
): Promise<T> {
  await getMongoDb();
  const client = globalForMongo.mongoClient;
  if (!client) throw new Error("MongoDB client is not connected.");

  const session = client.startSession();
  const options: TransactionOptions = {
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
    readPreference: "primary",
  };
  try {
    return await session.withTransaction(() => operation(client.db(getDbName()), session), options);
  } finally {
    await session.endSession();
  }
}

export async function ensureIndexes() {
  const db = await getMongoDb();
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ id: 1 }, { unique: true }),
    db.collection("patient_profiles").createIndex({ userId: 1 }, { unique: true }),
    db.collection("patient_profiles").createIndex({ assignedNurseId: 1 }),
    db.collection("patient_profiles").createIndex({ assignedDoctorId: 1 }),
    db.collection("patient_profiles").createIndex({ risk: 1, assignedNurseId: 1 }),
    db.collection("vitals_readings").createIndex({ patientId: 1, recordedAt: 1 }),
    db.collection("vitals_readings").createIndex({ patientId: 1, type: 1, recordedAt: -1 }),
    db.collection("medications").createIndex({ patientId: 1 }),
    db.collection("medication_logs").createIndex({ medicationId: 1, takenAt: -1 }),
    db.collection("medication_logs").createIndex({ patientId: 1, takenAt: -1 }),
    db.collection("alerts").createIndex({ patientId: 1, createdAt: -1 }),
    db.collection("alerts").createIndex({ patientId: 1, resolvedAt: 1 }),
    db.collection("messages").createIndex({ conversationId: 1, createdAt: 1 }),
    db.collection("conversations").createIndex({ id: 1 }, { unique: true }),
    db
      .collection("conversation_members")
      .createIndex({ conversationId: 1, userId: 1 }, { unique: true }),
    db.collection("conversation_members").createIndex({ userId: 1, readCursorAt: 1 }),
    db.collection("messages").createIndex({ recipientId: 1, readAt: 1 }),
    db.collection("appointments").createIndex({ patientId: 1 }),
    db.collection("appointments").createIndex({ patientId: 1, status: 1, scheduledAt: 1 }),
    db.collection("symptom_checkins").createIndex({ patientId: 1, recordedAt: -1 }),
    db.collection("care_plans").createIndex({ patientId: 1 }, { unique: true }),
    db.collection("visit_schedules").createIndex({ patientId: 1, scheduledAt: -1 }),
    db.collection("education_resources").createIndex({ audience: 1, category: 1 }),
    db.collection("communication_logs").createIndex({ patientId: 1, createdAt: -1 }),
    db.collection("outcome_snapshots").createIndex({ patientId: 1, recordedAt: -1 }),
    db.collection("fcm_tokens").createIndex({ token: 1 }, { unique: true }),
    db.collection("fcm_tokens").createIndex({ userId: 1 }),
    db.collection("assignments").createIndex({ patientId: 1, role: 1, endsAt: 1 }),
    db.collection("notifications").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("notifications").createIndex({ userId: 1, readAt: 1, archivedAt: 1 }),
    db.collection("notification_deliveries").createIndex({ notificationId: 1, channel: 1 }),
    db.collection("audit_logs").createIndex({ entityType: 1, entityId: 1, createdAt: -1 }),
    db.collection("outbox_jobs").createIndex({ status: 1, availableAt: 1 }),
    db.collection("outbox_jobs").createIndex({ dedupeKey: 1 }, { unique: true }),
    db.collection("outbox_jobs").createIndex({ lockedBy: 1, lockedAt: 1 }),
    db.collection("domain_events").createIndex({ id: 1 }, { unique: true }),
    db.collection("domain_events").createIndex({ aggregateType: 1, aggregateId: 1, createdAt: -1 }),
    db
      .collection("idempotency_keys")
      .createIndex({ actorId: 1, key: 1, operation: 1 }, { unique: true }),
    db.collection("idempotency_keys").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
