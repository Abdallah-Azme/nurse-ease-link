import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients, alerts, adherenceTrend, riskBg } from "@/lib/mock-data";
import { AlertTriangle, Bell, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/nurse/")({
  head: () => ({ meta: [{ title: "Nurse dashboard · CareConnect" }] }),
  component: NurseHome,
});

function NurseHome() {
  const assigned = patients.filter((p) => p.assignedNurseId === "n1");
  const high = assigned.filter((p) => p.risk === "high").length;
  return (
    <>
      <PageHeader title="Good morning, Jordan" subtitle={`${assigned.length} assigned patients · ${high} high-risk · ${alerts.filter(a => a.level !== 'info').length} active alerts`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={Users} label="Patients" value={assigned.length} tone="bg-primary/10 text-primary" />
        <Stat icon={AlertTriangle} label="High risk" value={high} tone="bg-destructive/10 text-destructive" />
        <Stat icon={Bell} label="Open alerts" value={alerts.filter(a => a.level !== "info").length} tone="bg-warning/15 text-warning-foreground" />
        <Stat icon={TrendingUp} label="Avg adherence" value="84%" tone="bg-success/10 text-success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Active alerts</div>
            <Link to="/nurse/alerts" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-background/40 p-3">
                <div className={`h-2.5 w-2.5 rounded-full ${a.level === "critical" ? "bg-destructive" : a.level === "warning" ? "bg-warning" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.patientName}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.message}</div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Adherence trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={adherenceTrend}>
              <defs>
                <linearGradient id="adh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} domain={[60, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="rate" stroke="var(--chart-2)" fill="url(#adh)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Assigned patients</div>
            <Link to="/nurse/patients" className="text-xs text-primary hover:underline">All patients</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase tracking-wider">
                <tr className="text-left">
                  <th className="py-2 font-medium">Patient</th>
                  <th className="py-2 font-medium">Conditions</th>
                  <th className="py-2 font-medium">Risk</th>
                  <th className="py-2 font-medium">Adherence</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assigned.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold text-primary-foreground" style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}>{p.name.split(" ").map(s => s[0]).join("").slice(0,2)}</div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.age} · {p.sex}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.conditions.join(", ")}</td>
                    <td className="py-3"><span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${p.adherence > 85 ? "bg-success" : p.adherence > 70 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${p.adherence}%` }} />
                        </div>
                        <span>{p.adherence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number | string; tone: string }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`h-8 w-8 grid place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
