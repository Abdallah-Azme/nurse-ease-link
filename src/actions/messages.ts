"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getThreadId, getUserById } from "@/db/queries";
import { insertMessage } from "@/db/repositories/writes";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { sendPushToUsers } from "@/lib/firebase/send-push";
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
    if (!parsed.success) return fail("Invalid message.");

    const patientId = session.user.role === "patient" ? session.user.id : recipientId;
    const staffId = session.user.role === "patient" ? recipientId : session.user.id;
    const threadId = await getThreadId(patientId, staffId);

    const id = crypto.randomUUID();
    await insertMessage({
      id,
      threadId,
      senderId: session.user.id,
      recipientId,
      body: parsed.data.body,
      createdAt: new Date(),
    });

    const recipient = await getUserById(recipientId);
    await sendPushToUsers([recipientId], {
      title: `Message from ${session.user.name}`,
      body:
        parsed.data.body.length > 100 ? `${parsed.data.body.slice(0, 97)}...` : parsed.data.body,
      url: chatUrlForRecipient(recipient?.role, patientId),
      event: "new_message",
    });

    revalidatePath("/patient/chat");
    revalidatePath("/nurse/chat");
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to send message.");
  }
}
