import "server-only";

import { collections } from "@/db/mongo/collections";

export async function upsertFcmToken(userId: string, token: string) {
  const { fcmTokens } = await collections();
  const now = new Date();
  const existing = await fcmTokens.findOne({ token });

  if (existing) {
    await fcmTokens.updateOne({ token }, { $set: { userId, updatedAt: now } });
    return;
  }

  await fcmTokens.insertOne({
    id: crypto.randomUUID(),
    userId,
    token,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteFcmToken(userId: string, token: string) {
  const { fcmTokens } = await collections();
  await fcmTokens.deleteOne({ userId, token });
}

export async function getFcmTokensForUsers(userIds: string[]) {
  if (!userIds.length) return [];
  const { fcmTokens } = await collections();
  const rows = await fcmTokens.find({ userId: { $in: userIds } }).toArray();
  return rows.map((r) => r.token);
}

export async function deleteFcmTokenByValue(token: string) {
  const { fcmTokens } = await collections();
  await fcmTokens.deleteOne({ token });
}
