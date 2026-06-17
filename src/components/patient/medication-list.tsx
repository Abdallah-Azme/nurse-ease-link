"use client";

import { Check, Clock, Pill, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { markMedicationTaken } from "@/actions/medications";

type Med = {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  nextDose: string;
  adherence: number;
  taken: boolean;
};

export function MedicationList({ medications }: { medications: Med[] }) {
  const router = useRouter();

  async function toggle(id: string, name: string, taken: boolean) {
    if (taken) return;
    const result = await markMedicationTaken(id);
    if (result.ok) {
      toast.success(`Marked ${name} as taken`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="grid gap-3">
      {medications.map((m) => (
        <div key={m.id} className="metric-card flex flex-wrap items-center gap-4">
          <div className="h-11 w-11 grid place-items-center rounded-xl bg-primary/10 text-primary">
            <Pill className="h-5 w-5" />
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="font-display font-semibold">
              {m.name} <span className="text-muted-foreground text-sm font-normal">· {m.dose}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {m.schedule}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next dose</div>
            <div className="text-sm font-medium">{m.nextDose}</div>
          </div>
          <div className="text-right min-w-[110px]">
            <div className="text-xs text-muted-foreground">Adherence</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${m.adherence > 85 ? "bg-success" : m.adherence > 70 ? "bg-warning" : "bg-destructive"}`}
                  style={{ width: `${m.adherence}%` }}
                />
              </div>
              <div className="text-sm font-medium">{m.adherence}%</div>
            </div>
          </div>
          <button
            onClick={() => toggle(m.id, m.name, m.taken)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${m.taken ? "bg-success/15 text-success" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          >
            <Check className="h-4 w-4" /> {m.taken ? "Taken" : "Mark taken"}
          </button>
        </div>
      ))}
    </div>
  );
}

export function MedicationListHeader() {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90">
      <Plus className="h-4 w-4" /> Add medication
    </button>
  );
}
