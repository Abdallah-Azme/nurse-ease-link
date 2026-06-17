import { PageHeader } from "@/components/app-shell";
import { AssistantChat } from "@/components/patient/assistant-chat";

export const metadata = { title: "AI Assistant · CareConnect" };

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Health Assistant"
        subtitle="Educational guidance. Never a substitute for medical advice."
      />
      <AssistantChat />
    </>
  );
}
