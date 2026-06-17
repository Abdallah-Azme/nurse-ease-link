import { PageHeader } from "@/components/app-shell";
import { EmergencyWizard } from "@/components/patient/emergency-wizard";

export const metadata = { title: "Emergency · CareConnect" };

export default function EmergencyPage() {
  return (
    <>
      <PageHeader
        title="Emergency assistance"
        subtitle="Use this if you feel something is seriously wrong. Your care team is notified immediately."
      />
      <EmergencyWizard />
    </>
  );
}
