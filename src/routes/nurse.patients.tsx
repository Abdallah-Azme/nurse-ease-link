import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients, riskBg } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/nurse/patients")({
  head: () => ({ meta: [{ title: "Patients · CareConnect" }] }),
  component: NursePatients,
});

function NursePatients() {
  const [q, setQ] = useState("");
  const list = patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Patients" subtitle="All patients you're caring for." />
      <div className="metric-card">
        <div className="relative mb-4 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border bg-background/40 p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full grid place-items-center text-sm font-semibold text-primary-foreground" style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}>
                  {p.name.split(" ").map((s) => s[0]).join("").slice(0,2)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.age} · {p.sex} · {p.conditions[0]}</div>
                </div>
                <span className={`chip ml-auto ${riskBg(p.risk)}`}>{p.risk}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
                  <div className="text-muted-foreground">Adherence</div>
                  <div className="font-medium">{p.adherence}%</div>
                </div>
                <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
                  <div className="text-muted-foreground">Conditions</div>
                  <div className="font-medium">{p.conditions.length}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
