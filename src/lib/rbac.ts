import { auth } from "@/auth";
import type { Role } from "@/auth";

const roleHome: Record<Role, string> = {
  patient: "/patient",
  nurse: "/nurse",
  doctor: "/doctor",
  admin: "/admin",
};

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.user.role !== role) {
    throw new Error("Forbidden");
  }
  return session;
}

export function homeForRole(role: Role) {
  return roleHome[role];
}
