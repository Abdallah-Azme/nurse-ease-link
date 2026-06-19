import "server-only";

import { z } from "zod";

import { collections } from "@/db/mongo/collections";
import { withMongoTransaction } from "@/db/mongo/connection";
import type { UserDoc } from "@/db/mongo/types";

const activationSchema = z.object({
  answers: z.array(z.string().trim().min(1).max(200)).max(12),
  idempotencyKey: z.string().uuid(),
});

export type ActivateEmergencyInput = z.input<typeof activationSchema>;

export async function activateEmergency(actor: UserDoc, input: ActivateEmergencyInput) {
  const data = activationSchema.parse(input);
  const correlationId = crypto.randomUUID();
  const now = new Date();

  return withMongoTransaction(async (db, session) => {
    const c = await collections(db);
    const existing = await c.idempotencyKeys.findOne(
      { actorId: actor.id, key: data.idempotencyKey, operation: "emergency.activate" },
      { session },
    );
    if (existing) return { id: existing.resourceId, correlationId: existing.correlationId };

    const profile = await c.patientProfiles.findOne({ userId: actor.id }, { session });
    if (!profile) throw new Error("Patient profile not found.");
    const admins = await c.users
      .find({ role: "admin", status: { $ne: "inactive" } }, { session })
      .project<Pick<UserDoc, "id" | "role">>({ id: 1, role: 1 })
      .toArray();
    const emergencyId = crypto.randomUUID();
    const alertId = crypto.randomUUID();
    const severity = data.answers.some((answer) => /yes|severe/i.test(answer))
      ? "severe"
      : data.answers.some((answer) => /moderate/i.test(answer))
        ? "moderate"
        : "mild";
    const recipients = [
      { id: profile.assignedNurseId, link: "/nurse/alerts" },
      { id: profile.assignedDoctorId, link: "/doctor/alerts" },
      ...admins.map((admin) => ({ id: admin.id, link: "/admin/operations" })),
    ].filter(
      (recipient, index, all) =>
        recipient.id && all.findIndex((r) => r.id === recipient.id) === index,
    );

    await c.emergencies.insertOne(
      {
        id: emergencyId,
        patientId: actor.id,
        answers: data.answers,
        severity,
        status: "open",
        createdAt: now,
      },
      { session },
    );
    await c.alerts.insertOne(
      {
        id: alertId,
        patientId: actor.id,
        level: "critical",
        message: "Patient activated an emergency alert.",
        createdAt: now,
      },
      { session },
    );
    await c.domainEvents.insertOne(
      {
        id: crypto.randomUUID(),
        type: "emergency.activated",
        aggregateType: "emergency",
        aggregateId: emergencyId,
        actorId: actor.id,
        patientId: actor.id,
        correlationId,
        payload: { severity, alertId },
        createdAt: now,
      },
      { session },
    );
    await c.auditLogs.insertOne(
      {
        id: crypto.randomUUID(),
        actorId: actor.id,
        actorRole: actor.role,
        action: "emergency.activated",
        entityType: "emergency",
        entityId: emergencyId,
        correlationId,
        metadata: { severity, answerCount: data.answers.length },
        createdAt: now,
      },
      { session },
    );
    if (recipients.length) {
      await c.notifications.insertMany(
        recipients.map((recipient) => ({
          id: crypto.randomUUID(),
          userId: recipient.id,
          type: "emergency",
          title: "Emergency alert",
          body: "A patient activated an emergency alert. Respond immediately.",
          deepLink: recipient.link,
          priority: "critical" as const,
          sourceType: "emergency",
          sourceId: emergencyId,
          createdAt: now,
        })),
        { session },
      );
      await c.outboxJobs.insertOne(
        {
          id: crypto.randomUUID(),
          type: "push",
          dedupeKey: `emergency:${emergencyId}:activated`,
          payload: {
            userIds: recipients.map((r) => r.id),
            title: "Emergency alert",
            body: "A patient activated an emergency alert. Respond immediately.",
            event: "emergency_activated",
            priority: "high",
            linksByUser: Object.fromEntries(recipients.map((r) => [r.id, r.link])),
          },
          status: "pending",
          attempts: 0,
          availableAt: now,
          createdAt: now,
          updatedAt: now,
        },
        { session },
      );
    }
    await c.idempotencyKeys.insertOne(
      {
        actorId: actor.id,
        key: data.idempotencyKey,
        operation: "emergency.activate",
        correlationId,
        resourceId: emergencyId,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
      { session },
    );
    return { id: emergencyId, correlationId };
  });
}

export async function updateEmergencyAssessment(
  actor: UserDoc,
  emergencyId: string,
  answers: string[],
): Promise<{ id: string; severity: "mild" | "moderate" | "severe" }> {
  return withMongoTransaction(async (db, session) => {
    const c = await collections(db);
    const emergency = await c.emergencies.findOne(
      { id: emergencyId, patientId: actor.id },
      { session },
    );
    if (!emergency) throw new Error("Emergency not found.");
    const severity = answers.some((answer) => /severe|yes/i.test(answer))
      ? "severe"
      : answers.some((answer) => /moderate/i.test(answer))
        ? "moderate"
        : "mild";
    const now = new Date();
    await c.emergencies.updateOne(
      { id: emergencyId, patientId: actor.id },
      { $set: { answers, severity } },
      { session },
    );
    await c.domainEvents.insertOne(
      {
        id: crypto.randomUUID(),
        type: "emergency.assessment_updated",
        aggregateType: "emergency",
        aggregateId: emergencyId,
        actorId: actor.id,
        patientId: actor.id,
        correlationId: crypto.randomUUID(),
        payload: { severity, answerCount: answers.length },
        createdAt: now,
      },
      { session },
    );
    return { id: emergencyId, severity };
  });
}
