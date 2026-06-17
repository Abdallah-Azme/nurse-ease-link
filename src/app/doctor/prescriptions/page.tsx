import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { RenewButton } from "@/components/doctor/renew-button";
import { getPatientsForDoctor } from "@/db/queries";
import { findMedicationsByPatientId } from "@/db/repositories/writes";
import { Pill } from "lucide-react";

export const metadata = { title: "Prescriptions · CareConnect" };

export default async function DoctorPrescriptionsPage() {
  const session = await auth();
  const patients = await getPatientsForDoctor(session!.user.id);

  const cards = await Promise.all(
    patients.slice(0, 4).map(async (p, i) => {
      const meds = await findMedicationsByPatientId(p.id);
      return { patient: p, meds: meds.slice(0, 2 + (i % 2)) };
    }),
  );

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Active medications across your patients." />
      <div className="grid lg:grid-cols-2 gap-4">
        {cards.map(({ patient: p, meds }) => (
          <div key={p.id} className="metric-card">
            <div className="font-display font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.conditions.join(", ")}</div>
            <div className="mt-3 space-y-2">
              {meds.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border bg-background/40 px-3 py-2"
                >
                  <Pill className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {m.name} <span className="text-muted-foreground font-normal">· {m.dose}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{m.schedule}</div>
                  </div>
                  <RenewButton medicationId={m.id} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
