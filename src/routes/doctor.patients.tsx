import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients, riskBg } from "@/lib/mock-data";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({ meta: [{ title: "Patients · CareConnect" }] }),
  component: () => {
    const my = patients.filter((p) => p.assignedDoctorId === "d1" || p.assignedDoctorId === "d2");
    return (
      <>
        <PageHeader title="Patient panel" subtitle="All patients under your care." />
        <div className="metric-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider text-left">
              <tr>
                <th className="py-2">Patient</th><th>Conditions</th><th>Risk</th><th>Adherence</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {my.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="py-3 font-medium">{p.name} <span className="text-muted-foreground font-normal">· {p.age}{p.sex}</span></td>
                  <td className="py-3 text-muted-foreground">{p.conditions.join(", ")}</td>
                  <td className="py-3"><span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span></td>
                  <td className="py-3">{p.adherence}%</td>
                  <td className="py-3 text-right"><button className="text-xs rounded-lg border bg-card px-3 py-1.5 hover:bg-accent">View chart</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  },
});
