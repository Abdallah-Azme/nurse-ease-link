import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { appointments } from "@/lib/mock-data";
import { Calendar, Plus } from "lucide-react";

export const Route = createFileRoute("/doctor/appointments")({
  head: () => ({ meta: [{ title: "Appointments · CareConnect" }] }),
  component: () => (
    <>
      <PageHeader title="Appointments" subtitle="Your upcoming schedule." action={<button className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> Schedule</button>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...appointments, ...appointments].map((a, i) => (
          <div key={i} className="metric-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {a.when}</div>
            <div className="font-display text-lg font-semibold mt-2">{a.with}</div>
            <div className="text-sm text-muted-foreground mt-1">{a.reason}</div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">Reschedule</button>
              <button className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90">Join</button>
            </div>
          </div>
        ))}
      </div>
    </>
  ),
});
