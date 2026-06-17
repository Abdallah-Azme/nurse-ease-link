"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPatientWithProfile } from "@/db/queries";
import {
  findAlertById,
  insertAlert,
  insertEmergency,
  resolveAlertById,
} from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { sendPushToUsers } from "@/lib/firebase/send-push";
import { requireRoleAction } from "@/lib/safe-action";

const emergencySchema = z.object({
  answers: z.array(z.string()),
});

export async function triggerEmergency(answers: string[]): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireRoleAction("patient");
    const parsed = emergencySchema.safeParse({ answers });
    if (!parsed.success) return fail("Invalid emergency data.");

    const severity = answers.some((a) => a === "Yes" || a === "Severe")
      ? "severe"
      : answers.includes("Moderate")
        ? "moderate"
        : "mild";

    const id = crypto.randomUUID();
    await insertEmergency({
      id,
      patientId: session.user.id,
      answers,
      severity,
      status: "open",
      createdAt: new Date(),
    });

    const patient = await getPatientWithProfile(session.user.id);
    if (patient?.assignedNurseId) {
      await insertAlert({
        id: crypto.randomUUID(),
        patientId: session.user.id,
        level: "critical",
        message: `Emergency activated by ${session.user.name} — severity: ${severity}`,
        createdAt: new Date(),
      });
    }

    const careTeamIds = [patient?.assignedNurseId, patient?.assignedDoctorId].filter(
      Boolean,
    ) as string[];

    await sendPushToUsers(careTeamIds, {
      title: "Emergency alert",
      body: `${session.user.name} activated emergency — ${severity} severity. Respond immediately.`,
      url: "/nurse/alerts",
      event: "emergency",
      priority: "high",
    });

    revalidatePath("/nurse");
    revalidatePath("/nurse/alerts");
    revalidatePath("/doctor");
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to trigger emergency.");
  }
}

export async function resolveAlert(alertId: string): Promise<ActionResult<void>> {
  try {
    await requireRoleAction("nurse");
    const alert = await findAlertById(alertId);
    if (!alert) return fail("Alert not found.");

    await resolveAlertById(alertId);

    await sendPushToUsers([alert.patientId], {
      title: "Alert resolved",
      body: "Your nurse has reviewed and resolved an alert on your care plan.",
      url: "/patient",
      event: "alert_resolved",
    });

    revalidatePath("/nurse");
    revalidatePath("/nurse/alerts");
    revalidatePath("/admin");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to resolve alert.");
  }
}
