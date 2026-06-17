import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients, staff, riskBg } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users · CareConnect" }] }),
  component: () => {
    const [tab, setTab] = useState<"patients" | "staff">("patients");
    return (
      <>
        <PageHeader title="Users" subtitle="Manage patient and staff accounts." />
        <div className="metric-card">
          <div className="flex gap-2 mb-4 border-b">
            {(["patients", "staff"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            {tab === "patients" ? (
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase tracking-wider text-left">
                  <tr><th className="py-2">Name</th><th>Age</th><th>Conditions</th><th>Risk</th><th>Status</th></tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3">{p.age}</td>
                      <td className="py-3 text-muted-foreground">{p.conditions.join(", ")}</td>
                      <td className="py-3"><span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span></td>
                      <td className="py-3"><span className="chip bg-success/10 text-success">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase tracking-wider text-left">
                  <tr><th className="py-2">Name</th><th>Role</th><th>Specialty</th><th>Patients</th></tr>
                </thead>
                <tbody className="divide-y">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/40">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className="py-3 capitalize">{s.role}</td>
                      <td className="py-3 text-muted-foreground">{s.specialty}</td>
                      <td className="py-3">{s.patientsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    );
  },
});
