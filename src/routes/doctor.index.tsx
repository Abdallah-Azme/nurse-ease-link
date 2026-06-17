import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients, appointments, vitals, riskBg } from "@/lib/mock-data";
import { Calendar, FileText, Users } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/doctor/")({
  head: () => ({ meta: [{ title: "Doctor dashboard · CareConnect" }] }),
  component: DoctorHome,
});

function DoctorHome() {
  const my = patients.filter((p) => p.assignedDoctorId === "d1");
  return (
    <>
      <PageHeader title="Welcome, Dr. Chen" subtitle={`${my.length} patients · ${appointments.length} appointments this week`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={Users} label="My patients" value={my.length} />
        <Stat icon={Calendar} label="Appointments" value={appointments.length} />
        <Stat icon={FileText} label="Pending Rx" value={3} />
        <Stat icon={Users} label="High risk" value={my.filter(p => p.risk === "high").length} tone="destructive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 metric-card">
          <div className="text-sm font-medium mb-3">My patients</div>
          <div className="space-y-2">
            {my.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-background/40 p-3">
                <div className="h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-primary-foreground" style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}>{p.name.split(" ").map(s => s[0]).join("").slice(0,2)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.conditions.join(", ")}</div>
                </div>
                <span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span>
                <button className="text-xs rounded-lg border bg-card px-3 py-1.5 hover:bg-accent">Open chart</button>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Upcoming appointments</div>
          <div className="space-y-2">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-xl border bg-background/40 p-3">
                <div className="text-sm font-medium">{a.with}</div>
                <div className="text-xs text-muted-foreground">{a.when}</div>
                <div className="text-xs mt-1">{a.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 metric-card">
          <div className="text-sm font-medium mb-3">Population heart rate trend (avg)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={vitals.heartRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="bpm" stroke="var(--chart-1)" strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number | string; tone?: "destructive" }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`h-8 w-8 grid place-items-center rounded-lg ${tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}><Icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
