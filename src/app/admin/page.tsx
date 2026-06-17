import { PageHeader } from "@/components/app-shell";
import { AdherenceChart } from "@/components/charts/vitals-charts";
import { Activity, AlertTriangle, Stethoscope, Users } from "lucide-react";

import { getAdherenceTrend, getAllAlerts, getPlatformStats } from "@/db/queries";

export const metadata = { title: "Admin overview · CareConnect" };

export default async function AdminHomePage() {
  const platformStats = await getPlatformStats();
  const adherenceTrend = await getAdherenceTrend();
  const alerts = await getAllAlerts();

  return (
    <>
      <PageHeader title="Platform overview" subtitle="System health and operational metrics." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={Users} label="Patients" value={platformStats.totalPatients.toLocaleString()} />
        <Stat
          icon={Stethoscope}
          label="Active staff"
          value={platformStats.activeNurses + platformStats.activeDoctors}
        />
        <Stat
          icon={AlertTriangle}
          label="Emergencies (7d)"
          value={platformStats.emergenciesThisWeek}
          tone="destructive"
        />
        <Stat
          icon={Activity}
          label="Avg adherence"
          value={`${platformStats.avgAdherence}%`}
          tone="success"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 metric-card">
          <div className="text-sm font-medium mb-3">Platform-wide adherence (14d)</div>
          <div className="h-[240px]">
            <AdherenceChart data={adherenceTrend} gradientId="ad2" />
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Critical alerts</div>
          <div className="space-y-2">
            {alerts
              .filter((a) => a.level !== "info")
              .map((a) => (
                <div key={a.id} className="rounded-xl border bg-background/40 p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`chip ${a.level === "critical" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground"}`}
                    >
                      {a.level}
                    </span>
                    <div className="text-sm font-medium">{a.patientName}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{a.message}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
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
  const tones: Record<string, string> = {
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  };
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div
          className={`h-8 w-8 grid place-items-center rounded-lg ${tones[tone ?? ""] ?? "bg-primary/10 text-primary"}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
