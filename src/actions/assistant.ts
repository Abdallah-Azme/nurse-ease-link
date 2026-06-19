"use server";

import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { askGeminiAssistant } from "@/lib/gemini-assistant";
import { getPatientWithProfile } from "@/db/queries";
import { getSessionOrThrow } from "@/lib/safe-action";

const sendAssistantMessageSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

function buildPatientContext(patient: Awaited<ReturnType<typeof getPatientWithProfile>>) {
  if (!patient) return [];

  const context: string[] = [];
  if (patient.assignedNurseId) context.push("Assigned nurse exists for this patient.");
  if (patient.assignedDoctorId) context.push("Assigned doctor exists for this patient.");
  if (patient.name) context.push(`Patient name: ${patient.name}.`);
  return context;
}

export async function sendAssistantMessage(
  message: string,
): Promise<ActionResult<{ reply: string }>> {
  try {
    const session = await getSessionOrThrow();
    if (session.user.role !== "patient") {
      return fail("Only patients can use the assistant.", "forbidden");
    }

    const parsed = sendAssistantMessageSchema.safeParse({ message });
    if (!parsed.success) {
      return fail("Please enter a valid message.", "validation_error");
    }

    const patient = await getPatientWithProfile(session.user.id);
    const reply = await askGeminiAssistant({
      message: parsed.data.message,
      context: buildPatientContext(patient),
    });

    return ok({ reply });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Failed to contact Gemini.",
      "assistant_error",
    );
  }
}
