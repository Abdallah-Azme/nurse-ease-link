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
  const nurseThreadId = await getThreadId(patient.id, patient.assignedNurseId);
  const doctorThreadId = await getThreadId(patient.id, patient.assignedDoctorId);
  const [nurseMessages, doctorMessages] = await Promise.all([
    getMessagesForThread(nurseThreadId),
    getMessagesForThread(doctorThreadId),
  ]);

  return (
    <>
      <PageHeader
        title="Care team"
        subtitle="Secure messages with your assigned nurse and doctor."
      />
      <ChatPanel
        nurseThreadId={nurseThreadId}
        doctorThreadId={doctorThreadId}
        patientId={patient.id}
        nurseId={patient.assignedNurseId}
        nurseName={nurse?.name ?? "Nurse"}
        doctorId={patient.assignedDoctorId}
        doctorName={doctor?.name ?? "Doctor"}
        initialNurseMessages={nurseMessages}
        initialDoctorMessages={doctorMessages}
        currentUserId={session!.user.id}
      />
      <p className="text-xs text-muted-foreground mt-3">
        Signed in as {session!.user.name}. Messages are not for emergencies - use the Emergency
        button.
      </p>
    </>
  );
}
