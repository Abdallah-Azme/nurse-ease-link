import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllAlerts,
  getEducationResources,
  getPalliativeProgramMetrics,
  getPlatformStats,
} from "@/db/queries";
import { Activity, BookOpen, ShieldAlert, Users } from "lucide-react";

export const metadata = { title: "Palliative analytics · CareConnect" };

export default async function AdminPalliativePage() {
  const [platform, alerts, education, metrics] = await Promise.all([
    getPlatformStats(),
    getAllAlerts(),
    getEducationResources(),
    getPalliativeProgramMetrics(),
  ]);

  return (
    <>
      <PageHeader
        title="Palliative analytics"
        subtitle="Track outcomes, education usage, and safety signals across the program."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={Users} label="Patients" value={platform.totalPatients} />
        <Stat
          icon={ShieldAlert}
          label="Critical alerts"
          value={alerts.filter((a) => a.level !== "info").length}
          tone="destructive"
        />
        <Stat
          icon={Activity}
          label="Avg adherence"
          value={`${metrics.avgAdherence}%`}
          tone="success"
        />
        <Stat icon={BookOpen} label="Resources" value={education.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Program safety</CardTitle>
            <CardDescription>Open alerts and symptom escalations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 6).map((alert) => (
              <div key={alert.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{alert.patientName}</div>
                  <span
                    className={`chip ${alert.level === "critical" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground"}`}
                  >
                    {alert.level}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{alert.message}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program outcomes</CardTitle>
            <CardDescription>
              Aggregate symptom, adherence, and quality-of-life trends.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Urgent check-ins" value={metrics.urgentCheckins} />
              <Metric label="Overdue visits" value={metrics.missedVisits} />
              <Metric label="Avg symptom score" value={metrics.avgSymptomScore} />
              <Metric label="Avg QoL score" value={metrics.avgQualityOfLife} />
            </div>
            <div className="h-[220px] mt-3">
              <SimpleTrendChart data={metrics.trend} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education library</CardTitle>
            <CardDescription>Most-used guides for patients and caregivers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {education.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.summary}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SimpleTrendChart({
  data,
}: {
  data: { day: string; symptom: number; qol: number; adherence: number }[];
}) {
  return (
    <div className="grid h-full grid-cols-14 gap-1 items-end">
      {data.map((row) => (
        <div key={row.day} className="flex h-full flex-col items-center justify-end gap-1">
          <div
            className="w-full rounded-t-sm bg-primary/70"
            style={{ height: `${row.symptom}%` }}
          />
          <div className="w-full rounded-t-sm bg-success/70" style={{ height: `${row.qol}%` }} />
          <div
            className="w-full rounded-t-sm bg-warning/70"
            style={{ height: `${row.adherence}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  tone?: "destructive" | "success";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div
            className={`h-8 w-8 rounded-lg grid place-items-center ${tone === "destructive" ? "bg-destructive/10 text-destructive" : tone === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
