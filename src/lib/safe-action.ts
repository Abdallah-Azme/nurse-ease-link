import { auth } from "@/auth";
import type { Role } from "@/auth";

export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }
  return session;
}

export async function requireRoleAction(role: Role) {
  const session = await getSessionOrThrow();
  if (session.user.role !== role) {
    throw new Error("You do not have permission to perform this action.");
  }
  return session;
}
