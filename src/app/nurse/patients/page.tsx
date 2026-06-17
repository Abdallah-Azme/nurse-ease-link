import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { riskBg } from "@/lib/risk";
import { getPatientsForNurse } from "@/db/queries";

export const metadata = { title: "Patients · CareConnect" };

export default async function NursePatientsPage() {
  const session = await auth();
  const patients = await getPatientsForNurse(session!.user.id);

  return (
    <>
      <PageHeader title="My patients" subtitle="All patients assigned to your care." />
      <div className="metric-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase tracking-wider text-left">
            <tr>
              <th className="py-2">Patient</th>
              <th>Conditions</th>
              <th>Risk</th>
              <th>Adherence</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
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
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.age} · {p.sex}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-muted-foreground">{p.conditions.join(", ")}</td>
                <td className="py-3">
                  <span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span>
                </td>
                <td className="py-3">{p.adherence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
