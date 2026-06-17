import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { LineVitalsChart } from "@/components/charts/vitals-charts";
import { riskBg } from "@/lib/risk";
import { Calendar, FileText, Users } from "lucide-react";

import { getAppointmentsForDoctor, getPatientsForDoctor, getVitalsForPatient } from "@/db/queries";

export const metadata = { title: "Doctor dashboard · CareConnect" };

export default async function DoctorHomePage() {
  const session = await auth();
  const my = await getPatientsForDoctor(session!.user.id);
  const appointments = await getAppointmentsForDoctor(session!.user.id);
  const vitals = my[0] ? await getVitalsForPatient(my[0].id) : { heartRate: [] };

  return (
    <>
      <PageHeader
        title="Welcome, Dr. Chen"
        subtitle={`${my.length} patients · ${appointments.length} appointments this week`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={Users} label="My patients" value={my.length} />
        <Stat icon={Calendar} label="Appointments" value={appointments.length} />
        <Stat icon={FileText} label="Pending Rx" value={3} />
        <Stat
          icon={Users}
          label="High risk"
          value={my.filter((p) => p.risk === "high").length}
          tone="destructive"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 metric-card">
          <div className="text-sm font-medium mb-3">My patients</div>
          <div className="space-y-2">
            {my.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border bg-background/40 p-3"
              >
                <div
                  className="h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-primary-foreground"
                  style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}
                >
                  {p.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.conditions.join(", ")}</div>
                </div>
                <span className={`chip ${riskBg(p.risk)}`}>{p.risk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Upcoming appointments</div>
          <div className="space-y-2">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-xl border bg-background/40 p-3">
                <div className="text-sm font-medium">{a.staffName}</div>
                <div className="text-xs text-muted-foreground">{a.whenLabel}</div>
                <div className="text-xs mt-1">{a.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 metric-card">
          <div className="text-sm font-medium mb-3">Population heart rate trend (avg)</div>
          <div className="h-[220px]">
            <LineVitalsChart data={vitals.heartRate} dataKey="bpm" />
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
  tone?: "destructive";
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div
          className={`h-8 w-8 grid place-items-center rounded-lg ${tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
