import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { riskBg } from "@/lib/risk";
import { getPatientsForDoctor } from "@/db/queries";

export const metadata = { title: "Patients · CareConnect" };

export default async function DoctorPatientsPage() {
  const session = await auth();
  const patients = await getPatientsForDoctor(session!.user.id);

  return (
    <>
      <PageHeader title="My patients" subtitle="Patients under your care." />
      <div className="grid gap-3">
        {patients.map((p) => (
          <div key={p.id} className="metric-card flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-primary-foreground"
              style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}
            >
              {p.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.conditions.join(", ")}</div>
            </div>
            <span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span>
            <span className="text-sm text-muted-foreground">{p.adherence}% adherence</span>
          </div>
        ))}
      </div>
    </>
  );
}
