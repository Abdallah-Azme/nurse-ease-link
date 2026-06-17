import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { medications, patients } from "@/lib/mock-data";
import { Pill } from "lucide-react";

export const Route = createFileRoute("/doctor/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions · CareConnect" }] }),
  component: () => (
    <>
      <PageHeader title="Prescriptions" subtitle="Active medications across your patients." />
      <div className="grid lg:grid-cols-2 gap-4">
        {patients.slice(0, 4).map((p, i) => (
          <div key={p.id} className="metric-card">
            <div className="font-display font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.conditions.join(", ")}</div>
            <div className="mt-3 space-y-2">
              {medications.slice(0, 2 + (i % 2)).map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border bg-background/40 px-3 py-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.name} <span className="text-muted-foreground font-normal">· {m.dose}</span></div>
                    <div className="text-xs text-muted-foreground">{m.schedule}</div>
                  </div>
                  <button className="text-xs rounded-md border bg-card px-2 py-1 hover:bg-accent">Renew</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  ),
});
