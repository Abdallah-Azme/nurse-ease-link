import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { vitals } from "@/lib/mock-data";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/patient/vitals")({
  head: () => ({ meta: [{ title: "Vitals · CareConnect" }] }),
  component: VitalsPage,
});

function VitalsPage() {
  return (
    <>
      <PageHeader title="Vitals & trends" subtitle="14-day history of your tracked health metrics. Abnormal readings are highlighted." />
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Blood pressure (mmHg)" abnormal="Spike on day 10">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={vitals.bloodPressure}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="systolic" stroke="var(--chart-1)" strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="diastolic" stroke="var(--chart-2)" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Blood sugar (mg/dL)" abnormal="One high fasting reading">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={vitals.bloodSugar}>
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="fasting" stroke="var(--chart-3)" fill="url(#bg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Heart rate (bpm)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={vitals.heartRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[55, 95]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="bpm" stroke="var(--chart-1)" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Oxygen saturation (SpO₂ %)" abnormal="Brief desaturation on day 10">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={vitals.oxygen}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[88, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="spo2" stroke="var(--chart-2)" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weight (kg)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={vitals.weight}>
              <defs>
                <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[70, 74]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="kg" stroke="var(--chart-4)" fill="url(#wt)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function ChartCard({ title, abnormal, children }: { title: string; abnormal?: string; children: React.ReactNode }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        {abnormal && <span className="chip bg-warning/15 text-warning-foreground">⚠ {abnormal}</span>}
      </div>
      {children}
    </div>
  );
}
