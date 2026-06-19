"use server";

import { z } from "zod";

import { deleteFcmToken, upsertFcmToken } from "@/db/queries/fcm";
import { updateUserNotificationPreferences } from "@/db/queries/users";
import { insertAuditLog, markNotificationRead } from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getSessionOrThrow } from "@/lib/safe-action";
import { canReadNotification } from "@/lib/policy-helpers";
import { collections } from "@/db/mongo/collections";

const tokenSchema = z.object({
  token: z.string().min(1),
});

const preferencesSchema = z.object({
  push: z.coerce.boolean(),
  inApp: z.coerce.boolean(),
  email: z.coerce.boolean(),
  quietHours: z
    .string()
    .min(11)
    .max(11)
    .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/),
});

const notificationReadSchema = z.object({
  notificationId: z.string().min(1),
});

export async function registerFcmToken(token: string): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = tokenSchema.safeParse({ token });
    if (!parsed.success) return fail("Invalid token.");

    await upsertFcmToken(session.user.id, parsed.data.token);
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "fcm.register",
      entityType: "fcm_token",
      entityId: parsed.data.token,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to register token.");
  }
}

export async function unregisterFcmToken(token: string): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = tokenSchema.safeParse({ token });
    if (!parsed.success) return fail("Invalid token.");

    await deleteFcmToken(session.user.id, parsed.data.token);
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "fcm.unregister",
      entityType: "fcm_token",
      entityId: parsed.data.token,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to unregister token.");
  }
}

export async function updateNotificationPreferences(
  preferences: z.infer<typeof preferencesSchema>,
): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = preferencesSchema.safeParse(preferences);
    if (!parsed.success) return fail("Invalid notification preferences.");

    await updateUserNotificationPreferences(session.user.id, parsed.data);
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "notification_preferences.updated",
      entityType: "user",
      entityId: session.user.id,
      metadata: parsed.data,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to update preferences.");
  }
}

export async function readNotification(notificationId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = notificationReadSchema.safeParse({ notificationId });
    if (!parsed.success) return fail("Invalid notification.");

    const { notifications } = await collections();
    const notification = await notifications.findOne({ id: parsed.data.notificationId });
    if (!notification || !canReadNotification(notification, session.user.id)) {
      return fail("Notification not found.");
    }
    const updated = await markNotificationRead(parsed.data.notificationId, session.user.id);
    if (!updated.modifiedCount) return fail("Notification not found.");
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "notification.read",
      entityType: "notification",
      entityId: parsed.data.notificationId,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to mark notification read.");
  }
}
