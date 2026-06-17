import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { medications } from "@/lib/mock-data";
import { useState } from "react";
import { Check, Clock, Pill, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/medications")({
  head: () => ({ meta: [{ title: "Medications · CareConnect" }] }),
  component: MedsPage,
});

function MedsPage() {
  const [list, setList] = useState(medications);
  const toggle = (id: string) => {
    setList((l) => l.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m)));
    const med = list.find((m) => m.id === id);
    if (med && !med.taken) toast.success(`Marked ${med.name} as taken`);
  };
  return (
    <>
      <PageHeader
        title="Medications"
        subtitle="Track doses, schedules, and adherence."
        action={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add medication
          </button>
        }
      />

      <div className="grid gap-3">
        {list.map((m) => (
          <div key={m.id} className="metric-card flex flex-wrap items-center gap-4">
            <div className="h-11 w-11 grid place-items-center rounded-xl bg-primary/10 text-primary">
              <Pill className="h-5 w-5" />
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="font-display font-semibold">{m.name} <span className="text-muted-foreground text-sm font-normal">· {m.dose}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5"><Clock className="h-3 w-3" /> {m.schedule}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Next dose</div>
              <div className="text-sm font-medium">{m.nextDose}</div>
            </div>
            <div className="text-right min-w-[110px]">
              <div className="text-xs text-muted-foreground">Adherence</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${m.adherence > 85 ? "bg-success" : m.adherence > 70 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${m.adherence}%` }} />
                </div>
                <div className="text-sm font-medium">{m.adherence}%</div>
              </div>
            </div>
            <button
              onClick={() => toggle(m.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${m.taken ? "bg-success/15 text-success" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              <Check className="h-4 w-4" /> {m.taken ? "Taken" : "Mark taken"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
