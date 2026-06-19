"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPatientWithProfile } from "@/db/queries";
import {
  insertAlert,
  insertAuditLog,
  insertCommunicationLog,
  insertOutcomeSnapshot,
  insertSymptomCheckin,
  insertVisitSchedule,
  upsertCarePlan,
} from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAssignedDoctor, requireAssignedNurse, requireOwnPatient } from "@/lib/policies";
import { requireRoleAction } from "@/lib/safe-action";
import { getAlertLevel } from "./palliative-utils";
import {
  carePlanSchema,
  communicationSchema,
  outcomeSchema,
  symptomSchema,
  visitSchema,
} from "./palliative-schemas";

export async function submitSymptomCheckin(
  data: z.infer<typeof symptomSchema>,
): Promise<ActionResult<{ id: string; alertLevel: "ok" | "watch" | "urgent" }>> {
  try {
    const session = await requireRoleAction("patient");
    const parsed = symptomSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid symptom check-in.");

    const alertLevel = getAlertLevel(parsed.data);
    await requireOwnPatient(session.user.id);
    const profile = await getPatientWithProfile(session.user.id);
    const id = crypto.randomUUID();
    const recordedAt = new Date();

    await insertSymptomCheckin({
      id,
      patientId: session.user.id,
      recordedAt,
      ...parsed.data,
      alertLevel,
    });

    if (alertLevel !== "ok" && profile?.assignedNurseId) {
      await insertAlert({
        id: crypto.randomUUID(),
        patientId: session.user.id,
        level: alertLevel === "urgent" ? "critical" : "warning",
        message: `Symptom check-in flagged ${alertLevel} symptoms: pain ${parsed.data.pain}/10, breathlessness ${parsed.data.breathlessness}/10.`,
        createdAt: new Date(),
      });
      await insertAuditLog({
        id: crypto.randomUUID(),
        actorId: session.user.id,
        actorRole: "patient",
        action: "symptom_checkin.submitted",
        entityType: "symptom_checkin",
        entityId: id,
        metadata: { alertLevel, ...parsed.data },
        correlationId: crypto.randomUUID(),
        createdAt: new Date(),
      });
    }

    revalidatePath("/patient");
    revalidatePath("/patient/palliative");
    revalidatePath("/nurse");
    revalidatePath("/nurse/palliative");
    revalidatePath("/doctor");
    revalidatePath("/doctor/palliative");
    revalidatePath("/admin");
    revalidatePath("/admin/analytics");
    return ok({ id, alertLevel });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to submit symptom check-in.");
  }
}

export async function saveCarePlan(
  data: z.infer<typeof carePlanSchema>,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireRoleAction("doctor");
    const parsed = carePlanSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid care plan.");
    await requireAssignedDoctor(parsed.data.patientId, user.id);

    await upsertCarePlan({
      id: crypto.randomUUID(),
      patientId: parsed.data.patientId,
      summary: parsed.data.summary,
      updatedAt: new Date(),
      nextReviewAt: parsed.data.nextReviewAt ?? null,
      goals: parsed.data.goals.map((goal, index) => ({
        id: `goal-${index + 1}`,
        patientId: parsed.data.patientId,
        title: goal.title,
        details: goal.details,
        status: "active",
      })),
      interventions: parsed.data.interventions,
      caregiverNotes: parsed.data.caregiverNotes,
    });

    revalidatePath("/doctor/palliative");
    revalidatePath("/patient/palliative");
    revalidatePath("/nurse/palliative");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to save care plan.");
  }
}

export async function scheduleVisit(
  data: z.infer<typeof visitSchema>,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireRoleAction("nurse");
    const parsed = visitSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid visit data.");
    await requireAssignedNurse(parsed.data.patientId, user.id);

    await insertVisitSchedule({
      id: crypto.randomUUID(),
      patientId: parsed.data.patientId,
      staffId: user.id,
      staffName: parsed.data.staffName,
      scheduledAt: parsed.data.scheduledAt,
      type: parsed.data.type,
      status: "scheduled",
      reason: parsed.data.reason,
    });

    revalidatePath("/nurse/palliative");
    revalidatePath("/patient/palliative");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to schedule visit.");
  }
}

export async function addCommunicationLog(
  data: z.infer<typeof communicationSchema>,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireRoleAction("nurse");
    const parsed = communicationSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid communication log.");
    await requireAssignedNurse(parsed.data.patientId, user.id);

    await insertCommunicationLog({
      id: crypto.randomUUID(),
      patientId: parsed.data.patientId,
      authorId: user.id,
      authorName: parsed.data.authorName,
      channel: parsed.data.channel,
      summary: parsed.data.summary,
      createdAt: new Date(),
    });

    revalidatePath("/nurse/palliative");
    revalidatePath("/patient/palliative");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to add communication log.");
  }
}

export async function addOutcomeSnapshot(
  data: z.infer<typeof outcomeSchema>,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireRoleAction("doctor");
    const parsed = outcomeSchema.safeParse(data);
    if (!parsed.success) return fail("Invalid outcome snapshot.");
    await requireAssignedDoctor(parsed.data.patientId, user.id);

    await insertOutcomeSnapshot({
      id: crypto.randomUUID(),
      patientId: parsed.data.patientId,
      recordedAt: new Date(),
      symptomScore: parsed.data.symptomScore,
      adherenceScore: parsed.data.adherenceScore,
      qualityOfLifeScore: parsed.data.qualityOfLifeScore,
      alertCount: parsed.data.alertCount,
    });

    revalidatePath("/doctor/palliative");
    revalidatePath("/admin/palliative");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to add outcome snapshot.");
  }
}
