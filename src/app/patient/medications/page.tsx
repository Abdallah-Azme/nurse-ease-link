import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { MedicationList, MedicationListHeader } from "@/components/patient/medication-list";
import { getMedicationsForPatient } from "@/db/queries";

export const metadata = { title: "Medications · CareConnect" };

export default async function MedicationsPage() {
  const session = await auth();
  const medications = await getMedicationsForPatient(session!.user.id);

  return (
    <>
      <PageHeader
        title="Medications"
        subtitle="Track doses, schedules, and adherence."
        action={<MedicationListHeader />}
      />
      <MedicationList medications={medications} />
    </>
  );
}
