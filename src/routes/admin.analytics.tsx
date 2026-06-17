import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { adherenceTrend, vitals, platformStats } from "@/lib/mock-data";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics · CareConnect" }] }),
  component: () => (
    <>
      <PageHeader title="Analytics" subtitle="Operational and clinical metrics across the platform." />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Adherence (14d)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={adherenceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[60, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="rate" stroke="var(--chart-2)" strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Avg BP systolic (14d)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vitals.bloodPressure}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="systolic" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="metric-card lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Patients", value: platformStats.totalPatients },
              { label: "High-risk", value: platformStats.highRisk },
              { label: "Emergencies (7d)", value: platformStats.emergenciesThisWeek },
              { label: "Avg adherence", value: `${platformStats.avgAdherence}%` },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="font-display text-3xl font-semibold mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ),
});
