"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getThreadId, getUserById } from "@/db/queries";
import { getOrCreateConversation } from "@/db/queries/conversations";
import {
  insertAuditLog,
  insertMessage,
  insertNotification,
  markMessagesRead,
} from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireCareTeamMember, requireMessageParticipant } from "@/lib/policies";
import { getSessionOrThrow } from "@/lib/safe-action";

const sendSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

function chatUrlForRecipient(recipientRole: string | undefined, patientId: string): string {
  if (recipientRole === "patient") return "/patient/chat";
  if (recipientRole === "nurse") return `/nurse/chat/${patientId}`;
  if (recipientRole === "doctor") return "/doctor";
  return "/";
}

export async function sendMessage(
  recipientId: string,
  body: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = sendSchema.safeParse({ recipientId, body });
    if (!parsed.success) return fail("Invalid message.", "validation_error");

    const patientId = session.user.role === "patient" ? session.user.id : recipientId;
    const staffId = session.user.role === "patient" ? recipientId : session.user.id;
    await requireCareTeamMember(patientId, session.user.id);
    if (session.user.role === "patient") {
      const recipient = await getUserById(recipientId);
      const { getPatientWithProfile } = await import("@/db/queries");
      const patient = await getPatientWithProfile(session.user.id);
      const allowedRecipient =
        recipient?.role === "nurse"
          ? recipient.id === patient?.assignedNurseId
          : recipient?.role === "doctor"
            ? recipient.id === patient?.assignedDoctorId
            : false;
      if (!allowedRecipient) return fail("Unauthorized conversation.");
    }
    const conversationId = await getOrCreateConversation(patientId, staffId);
    await requireMessageParticipant(conversationId, session.user.id);

    const id = crypto.randomUUID();
    await insertMessage({
      id,
      conversationId,
      senderId: session.user.id,
      recipientId,
      body: parsed.data.body,
      createdAt: new Date(),
    });
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "message.sent",
      entityType: "message",
      entityId: id,
      metadata: { conversationId, recipientId },
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });

    const recipient = await getUserById(recipientId);
    await insertNotification({
      id: crypto.randomUUID(),
      userId: recipientId,
      type: "message",
      title: `Message from ${session.user.name}`,
      body:
        parsed.data.body.length > 100 ? `${parsed.data.body.slice(0, 97)}...` : parsed.data.body,
      deepLink: chatUrlForRecipient(recipient?.role, patientId),
      priority: "medium",
      sourceType: "message",
      sourceId: id,
      createdAt: new Date(),
    });

    revalidatePath("/patient/chat");
    revalidatePath("/nurse/chat");
    return ok({ id, conversationId });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to send message.");
  }
}

export async function markThreadAsRead(threadId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    await requireMessageParticipant(threadId, session.user.id);
    await markMessagesRead(threadId, session.user.id);
    await insertAuditLog({
      id: crypto.randomUUID(),
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "message.thread_read",
      entityType: "thread",
      entityId: threadId,
      correlationId: crypto.randomUUID(),
      createdAt: new Date(),
    });
    revalidatePath("/patient/chat");
    revalidatePath("/nurse/chat");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to mark thread as read.");
  }
}
