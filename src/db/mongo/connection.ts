import { MongoClient, type Db } from "mongodb";

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

  const client = globalForMongo.mongoClient ?? new MongoClient(getUri());
  if (!globalForMongo.mongoClient) {
    await client.connect();
    globalForMongo.mongoClient = client;
  }

  const db = client.db(getDbName());
  globalForMongo.mongoDb = db;
  return db;
}

export async function ensureIndexes() {
  const db = await getMongoDb();
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ id: 1 }, { unique: true }),
    db.collection("patient_profiles").createIndex({ userId: 1 }, { unique: true }),
    db.collection("patient_profiles").createIndex({ assignedNurseId: 1 }),
    db.collection("patient_profiles").createIndex({ assignedDoctorId: 1 }),
    db.collection("vitals_readings").createIndex({ patientId: 1, recordedAt: 1 }),
    db.collection("medications").createIndex({ patientId: 1 }),
    db.collection("medication_logs").createIndex({ medicationId: 1, takenAt: -1 }),
    db.collection("alerts").createIndex({ patientId: 1, createdAt: -1 }),
    db.collection("messages").createIndex({ threadId: 1, createdAt: 1 }),
    db.collection("appointments").createIndex({ patientId: 1 }),
    db.collection("fcm_tokens").createIndex({ token: 1 }, { unique: true }),
    db.collection("fcm_tokens").createIndex({ userId: 1 }),
  ]);
}
