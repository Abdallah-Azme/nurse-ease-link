import type { Role } from "@/auth";

export function canReadNotification(notification: { userId: string }, userId: string) {
  return notification.userId === userId;
}

export function canTransitionStatus(
  resource: { status?: string },
  from: string,
  to: string,
  actorRole: Role,
) {
  if (resource.status !== from) return false;
  if (actorRole === "admin") return true;
  return from !== to;
}
