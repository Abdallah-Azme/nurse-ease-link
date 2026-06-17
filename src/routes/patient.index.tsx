import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { medications, vitals, alerts, appointments, currentUser } from "@/lib/mock-data";
import { Activity, AlertTriangle, Calendar, Droplet, Heart, Pill, Sparkles, TrendingUp, Wind } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/patient/")({
  head: () => ({ meta: [{ title: "Patient overview · CareConnect" }] }),
  component: PatientHome,
});

function PatientHome() {
  const latestBp = vitals.bloodPressure.at(-1)!;
  const latestBg = vitals.bloodSugar.at(-1)!;
  const latestHr = vitals.heartRate.at(-1)!;
  const latestSpo2 = vitals.oxygen.at(-1)!;
  const adherenceAvg = Math.round(medications.reduce((s, m) => s + m.adherence, 0) / medications.length);

  return (
    <>
      <PageHeader
        title={`Good afternoon, ${currentUser.patient.name.split(" ")[0]}`}
        subtitle="Here's a snapshot of your health today."
        action={
          <Link to="/patient/emergency" className="inline-flex items-center gap-2 rounded-lg bg-destructive text-destructive-foreground px-4 py-2.5 text-sm font-medium hover:bg-destructive/90 shadow-sm">
            <AlertTriangle className="h-4 w-4" /> Emergency
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard label="Blood pressure" value={`${latestBp.systolic}/${latestBp.diastolic}`} unit="mmHg" icon={Heart} accent="text-destructive" tone="bg-destructive/10" />
        <MetricCard label="Blood sugar" value={`${latestBg.fasting}`} unit="mg/dL" icon={Droplet} accent="text-chart-3" tone="bg-chart-3/10" />
        <MetricCard label="Heart rate" value={`${latestHr.bpm}`} unit="bpm" icon={Activity} accent="text-primary" tone="bg-primary/10" />
        <MetricCard label="Oxygen" value={`${latestSpo2.spo2}%`} unit="SpO₂" icon={Wind} accent="text-success" tone="bg-success/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 metric-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Blood pressure · last 14 days</div>
              <div className="font-display text-xl font-semibold mt-0.5">Trending stable</div>
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vitals.bloodPressure}>
                <defs>
                  <linearGradient id="bp1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[60, 180]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="systolic" stroke="var(--chart-1)" fill="url(#bp1)" strokeWidth={2} />
                <Area type="monotone" dataKey="diastolic" stroke="var(--chart-2)" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="h-4 w-4 text-primary" />
            <div className="text-sm font-medium">Today's medications</div>
          </div>
          <div className="space-y-2">
            {medications.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border bg-background/40 px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.dose} · {m.nextDose}</div>
                </div>
                <span className={`chip ${m.taken ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}`}>
                  {m.taken ? "Taken" : "Due"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Adherence average <span className="text-foreground font-medium">{adherenceAvg}%</span></div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="text-sm font-medium">AI Assistant</div>
          </div>
          <p className="text-sm text-muted-foreground">Have a question about your medications or readings? Ask the assistant — it explains, never diagnoses.</p>
          <Link to="/patient/assistant" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90">Open assistant</Link>
        </div>

        <div className="metric-card lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-sm font-medium">Upcoming</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-lg border bg-background/40 p-3">
                <div className="text-sm font-medium">{a.with}</div>
                <div className="text-xs text-muted-foreground">{a.when} · {a.reason}</div>
              </div>
            ))}
            {alerts.filter((al) => al.patientId === "p1").map((a) => (
              <div key={a.id} className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                <div className="text-sm font-medium text-warning-foreground">{a.message}</div>
                <div className="text-xs text-muted-foreground">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({ label, value, unit, icon: Icon, accent, tone }: { label: string; value: string; unit: string; icon: typeof Heart; accent: string; tone: string }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`h-8 w-8 grid place-items-center rounded-lg ${tone}`}>
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <div className="font-display text-3xl font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{unit}</div>
      </div>
    </div>
  );
}
