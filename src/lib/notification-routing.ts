import type { UserRole } from "@/db/mongo/types";

export type NotificationAudience = {
  userId: string;
  role: UserRole;
  deepLink: string;
};

export function careTeamNotificationAudience(input: {
  patientId: string;
  patientName: string;
  nurseId?: string | null;
  doctorId?: string | null;
  adminIds?: string[];
}): NotificationAudience[] {
  const audience: NotificationAudience[] = [];

  if (input.nurseId) {
    audience.push({
      userId: input.nurseId,
      role: "nurse",
      deepLink: `/nurse/chat/${input.patientId}`,
    });
  }

  if (input.doctorId) {
    audience.push({
      userId: input.doctorId,
      role: "doctor",
      deepLink: "/doctor",
    });
  }

  for (const adminId of input.adminIds ?? []) {
    audience.push({
      userId: adminId,
      role: "admin",
      deepLink: "/admin",
    });
  }

  return audience;
}

export function notificationTitleForRole(role: UserRole, baseTitle: string, patientName: string) {
  if (role === "admin") {
    return `${baseTitle} - Care operations`;
  }
  return `${baseTitle} - ${patientName}`;
}
