// MongoDB is the active database. See src/db/mongo/

export { getMongoDb, ensureIndexes } from "./mongo/client";
export { collections, COLLECTIONS } from "./mongo/collections";
