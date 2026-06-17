import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { NurseChatPanel } from "@/components/nurse/nurse-chat-panel";
import { getMessagesForThread, getPatientWithProfile, getThreadId } from "@/db/queries";
import { notFound } from "next/navigation";

export const metadata = { title: "Messages · CareConnect" };

export default async function NurseChatDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const session = await auth();
  const patient = await getPatientWithProfile(patientId);
  if (!patient || patient.assignedNurseId !== session!.user.id) {
    notFound();
  }

  const threadId = await getThreadId(patientId, session!.user.id);
  const messages = await getMessagesForThread(threadId);

  return (
    <>
      <PageHeader title="Messages" subtitle={`Conversation with ${patient.name}`} />
      <NurseChatPanel
        patientId={patientId}
        patientName={patient.name}
        messages={messages}
        currentUserId={session!.user.id}
      />
    </>
  );
}
