import "server-only";

import { collections } from "@/db/mongo/collections";
import type { ConversationDoc, ConversationMemberDoc, UserRole } from "@/db/mongo/types";

export async function getOrCreateConversation(patientId: string, staffId: string) {
  const c = await collections();
  const id = `${patientId}-${staffId}`;
  const now = new Date();
  const patient = await c.patientProfiles.findOne({ userId: patientId });
  const staff = await c.users.findOne({ id: staffId });
  if (!patient || !staff) throw new Error("Conversation participants not found.");

  const conversation: ConversationDoc = {
    id,
    patientId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: null,
  };
  await c.conversations.updateOne({ id }, { $setOnInsert: conversation }, { upsert: true });

  const members: ConversationMemberDoc[] = [
    {
      id: `${id}:${patientId}`,
      conversationId: id,
      userId: patientId,
      role: "patient" satisfies UserRole,
      createdAt: now,
      updatedAt: now,
      readCursorAt: null,
    },
    {
      id: `${id}:${staffId}`,
      conversationId: id,
      userId: staffId,
      role: staff.role as UserRole,
      createdAt: now,
      updatedAt: now,
      readCursorAt: null,
    },
  ];

  for (const member of members) {
    await c.conversationMembers.updateOne(
      { conversationId: id, userId: member.userId },
      { $setOnInsert: member },
      { upsert: true },
    );
  }

  return id;
}

export async function backfillConversationForMessages(conversationId: string) {
  const c = await collections();
  const messages = await c.messages.find({ conversationId }).toArray();
  if (!messages.length) return;
  const [patientId, staffId] = conversationId.split("-");
  if (!patientId || !staffId) return;
  await getOrCreateConversation(patientId, staffId);
}
