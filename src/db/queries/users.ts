import "server-only";

import { collections } from "@/db/mongo/collections";

export async function getUserByEmail(email: string) {
  const { users } = await collections();
  return users.findOne({ email });
}

export async function getUserById(id: string) {
  const { users } = await collections();
  return users.findOne({ id });
}

export async function updateUserStatus(id: string, status: "active" | "inactive") {
  const { users } = await collections();
  return users.updateOne({ id }, { $set: { status } });
}

export async function updateUserNotificationPreferences(
  userId: string,
  preferences: {
    push: boolean;
    inApp: boolean;
    email: boolean;
    quietHours: string;
  },
) {
  const { users } = await collections();
  await users.updateOne({ id: userId }, { $set: { notificationPreferences: preferences } });
}
