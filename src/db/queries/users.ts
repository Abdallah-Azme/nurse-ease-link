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
