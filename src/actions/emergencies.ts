"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { collections } from "@/db/mongo/collections";
import { withMongoTransaction } from "@/db/mongo/connection";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAssignedNurse, requireRole } from "@/lib/policies";
import { activateEmergency } from "@/services/emergency-service";
import { updateEmergencyAssessment } from "@/services/emergency-service";

const triggerSchema = z.object({
  answers: z.array(z.string().trim().min(1).max(200)).max(12),
  idempotencyKey: z.string().uuid(),
});

export async function triggerEmergency(
  answers: string[],
  idempotencyKey: string,
): Promise<ActionResult<{ id: string; correlationId: string }>> {
  const parsed = triggerSchema.safeParse({ answers, idempotencyKey });
  if (!parsed.success) return fail("Invalid emergency request.");

  try {
    const { user } = await requireRole("patient");
    const result = await activateEmergency(user, parsed.data);
    revalidatePath("/patient/emergency");
    revalidatePath("/nurse/alerts");
    revalidatePath("/doctor/alerts");
    revalidatePath("/admin/operations");
    return ok(result);
  } catch (error) {
    console.error("Emergency activation failed", {
      correlationId: crypto.randomUUID(),
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return fail("The alert could not be sent. Call your local emergency number now.");
  }
}

export async function updateEmergencyAnswers(
  emergencyId: string,
  answers: string[],
): Promise<ActionResult<{ id: string; severity: "mild" | "moderate" | "severe" }>> {
  const parsed = z
    .object({
      emergencyId: z.string().uuid(),
      answers: z.array(z.string().trim().min(1).max(200)).max(12),
    })
    .safeParse({ emergencyId, answers });
  if (!parsed.success) return fail("Invalid emergency update.");

  try {
    const { user } = await requireRole("patient");
    const result = await updateEmergencyAssessment(
      user,
      parsed.data.emergencyId,
      parsed.data.answers,
    );
    revalidatePath("/patient/emergency");
    revalidatePath("/nurse/alerts");
    revalidatePath("/doctor");
    revalidatePath("/admin");
    return ok(result);
  } catch {
    return fail("The assessment could not be updated.");
  }
}

const resolveSchema = z.object({ alertId: z.string().uuid() });

export async function resolveAlert(alertId: string): Promise<ActionResult<void>> {
  const parsed = resolveSchema.safeParse({ alertId });
  if (!parsed.success) return fail("Invalid alert.");

  try {
    const { user } = await requireRole("nurse");
    const c = await collections();
    const alert = await c.alerts.findOne({ id: parsed.data.alertId });
    if (!alert) return fail("Alert not found.");
    await requireAssignedNurse(alert.patientId, user.id);
    const correlationId = crypto.randomUUID();
    const now = new Date();

    await withMongoTransaction(async (db, session) => {
      const tx = await collections(db);
      const updated = await tx.alerts.updateOne(
        { id: alert.id, resolvedAt: { $in: [null, undefined] } },
        { $set: { resolvedAt: now } },
        { session },
      );
      if (!updated.modifiedCount) return;
      await tx.auditLogs.insertOne(
        {
          id: crypto.randomUUID(),
          actorId: user.id,
          actorRole: "nurse",
          action: "alert.resolved",
          entityType: "alert",
          entityId: alert.id,
          correlationId,
          createdAt: now,
        },
        { session },
      );
      await tx.domainEvents.insertOne(
        {
          id: crypto.randomUUID(),
          type: "alert.resolved",
          aggregateType: "alert",
          aggregateId: alert.id,
          actorId: user.id,
          patientId: alert.patientId,
          correlationId,
          payload: {},
          createdAt: now,
        },
        { session },
      );
      const notificationId = crypto.randomUUID();
      await tx.notifications.insertOne(
        {
          id: notificationId,
          userId: alert.patientId,
          type: "alert_resolved",
          title: "Alert reviewed",
          body: "A care-team member reviewed your alert.",
          deepLink: "/patient/emergency",
          priority: "high",
          sourceType: "alert",
          sourceId: alert.id,
          createdAt: now,
        },
        { session },
      );
      await tx.outboxJobs.insertOne(
        {
          id: crypto.randomUUID(),
          type: "push",
          dedupeKey: `alert:${alert.id}:resolved`,
          payload: {
            userIds: [alert.patientId],
            title: "Alert reviewed",
            body: "A care-team member reviewed your alert.",
            url: "/patient/emergency",
            event: "alert_resolved",
          },
          status: "pending",
          attempts: 0,
          availableAt: now,
          createdAt: now,
          updatedAt: now,
        },
        { session },
      );
    });

    revalidatePath("/nurse/alerts");
    revalidatePath("/patient/emergency");
    return ok(undefined);
  } catch {
    return fail("Failed to resolve alert.");
  }
}
