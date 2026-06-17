import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { ChatPanel } from "@/components/patient/chat-panel";
import {
  getMessagesForThread,
  getPatientWithProfile,
  getThreadId,
  getUserById,
} from "@/db/queries";

export const metadata = { title: "Care team · CareConnect" };

export default async function ChatPage() {
  const session = await auth();
  const patient = await getPatientWithProfile(session!.user.id);
  if (!patient?.assignedNurseId || !patient.assignedDoctorId) {
    return <p>No care team assigned.</p>;
  }

  const nurse = await getUserById(patient.assignedNurseId);
  const doctor = await getUserById(patient.assignedDoctorId);
  const threadId = await getThreadId(patient.id, patient.assignedNurseId);
  const messages = await getMessagesForThread(threadId);

  return (
    <>
      <PageHeader
        title="Care team"
        subtitle="Secure messages with your assigned nurse and doctor."
      />
      <ChatPanel
        patientId={patient.id}
        nurseId={patient.assignedNurseId}
        nurseName={nurse?.name ?? "Nurse"}
        doctorId={patient.assignedDoctorId}
        doctorName={doctor?.name ?? "Doctor"}
        initialNurseMessages={messages}
        initialDoctorMessage="Hi Amelia, I reviewed your latest BP readings — let's discuss at your appointment Thursday."
        currentUserId={session!.user.id}
      />
      <p className="text-xs text-muted-foreground mt-3">
        Signed in as {session!.user.name}. Messages are not for emergencies — use the Emergency
        button.
      </p>
    </>
  );
}
