import "server-only";

import { auth, type Role } from "@/auth";
import { getUserById } from "@/db/queries/users";
import { collections } from "@/db/mongo/collections";
import type { UserDoc } from "@/db/mongo/types";
export { canReadNotification, canTransitionStatus } from "@/lib/policy-helpers";

export type AuthContext = {
  user: UserDoc;
};

function isActiveUser(user: UserDoc | null | undefined) {
  return !!user && (user.status === undefined || user.status === "active");
}

export async function requireAuthenticatedUser(): Promise<AuthContext> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);
  if (!isActiveUser(user)) {
    throw new Error("Unauthorized");
  }

  return { user: user as UserDoc };
}

export async function requireActiveUser() {
  return requireAuthenticatedUser();
}

export async function requireRole(...roles: Role[]) {
  const { user } = await requireAuthenticatedUser();
  if (!roles.includes(user.role as Role)) {
    throw new Error("Forbidden");
  }
  return { user, role: user.role as Role };
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireOwnPatient(patientId: string) {
  const { user } = await requireAuthenticatedUser();
  if (user.role !== "patient" || user.id !== patientId) {
    throw new Error("Forbidden");
  }
  return { user };
}

export async function requireCareTeamMember(patientId: string, userId?: string) {
  const { user } = await requireAuthenticatedUser();
  if (user.role === "admin") return { user };

  const { patientProfiles } = await collections();
  const patient = await patientProfiles.findOne({ userId: patientId });
  if (!patient) {
    throw new Error("Not found");
  }

  const allowed =
    (user.role === "patient" && user.id === patientId) ||
    (user.role === "nurse" && patient.assignedNurseId === (userId ?? user.id)) ||
    (user.role === "doctor" && patient.assignedDoctorId === (userId ?? user.id));

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return { user, patient };
}

export async function requireAssignedNurse(patientId: string, nurseId?: string) {
  const { user } = await requireRole("nurse", "admin");
  if (user.role === "admin") return { user };

  const { patientProfiles } = await collections();
  const patient = await patientProfiles.findOne({ userId: patientId });
  if (!patient || patient.assignedNurseId !== (nurseId ?? user.id)) {
    throw new Error("Forbidden");
  }

  return { user, patient };
}

export async function requireAssignedDoctor(patientId: string, doctorId?: string) {
  const { user } = await requireRole("doctor", "admin");
  if (user.role === "admin") return { user };

  const { patientProfiles } = await collections();
  const patient = await patientProfiles.findOne({ userId: patientId });
  if (!patient || patient.assignedDoctorId !== (doctorId ?? user.id)) {
    throw new Error("Forbidden");
  }

  return { user, patient };
}

export async function requireMessageParticipant(threadId: string, userId?: string) {
  const { user } = await requireAuthenticatedUser();
  const subjectId = userId ?? user.id;
  if (user.role === "admin") return { user };
  const { conversationMembers, conversations } = await collections();
  const conversation = await conversations.findOne({ id: threadId });
  if (!conversation) throw new Error("Not found");
  const member = await conversationMembers.findOne({ conversationId: threadId, userId: subjectId });
  if (!member) {
    throw new Error("Forbidden");
  }
  return { user };
}
