import Link from "next/link";
import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { BloodPressureChart } from "@/components/charts/vitals-charts";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Droplet,
  Heart,
  Pill,
  Sparkles,
  TrendingUp,
  Wind,
} from "lucide-react";

import {
  getAlertsForPatients,
  getAppointmentsForPatient,
  getMedicationsForPatient,
  getVitalsForPatient,
} from "@/db/queries";

export const metadata = { title: "Patient overview · CareConnect" };

export default async function PatientHomePage() {
  const session = await auth();
  const patientId = session!.user.id;

  const vitals = await getVitalsForPatient(patientId);
  const medications = await getMedicationsForPatient(patientId);
  const alerts = await getAlertsForPatients([patientId]);
  const appointments = await getAppointmentsForPatient(patientId);

  const latestBp = vitals.bloodPressure.at(-1);
  const latestBg = vitals.bloodSugar.at(-1);
  const latestHr = vitals.heartRate.at(-1);
  const latestSpo2 = vitals.oxygen.at(-1);
  const adherenceAvg = medications.length
    ? Math.round(medications.reduce((s, m) => s + m.adherence, 0) / medications.length)
    : 0;

  const firstName = session!.user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Good afternoon, ${firstName}`}
        subtitle="Here's a snapshot of your health today."
        action={
          <Link
            href="/patient/emergency"
            className="inline-flex items-center gap-2 rounded-lg bg-destructive text-destructive-foreground px-4 py-2.5 text-sm font-medium hover:bg-destructive/90 shadow-sm"
          >
            <AlertTriangle className="h-4 w-4" /> Emergency
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          label="Blood pressure"
          value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "No data"}
          unit="mmHg"
          icon={Heart}
          accent="text-destructive"
          tone="bg-destructive/10"
        />
        <MetricCard
          label="Blood sugar"
          value={latestBg ? `${latestBg.fasting}` : "No data"}
          unit="mg/dL"
          icon={Droplet}
          accent="text-chart-3"
          tone="bg-chart-3/10"
        />
        <MetricCard
          label="Heart rate"
          value={latestHr ? `${latestHr.bpm}` : "No data"}
          unit="bpm"
          icon={Activity}
          accent="text-primary"
          tone="bg-primary/10"
        />
        <MetricCard
          label="Oxygen"
          value={latestSpo2 ? `${latestSpo2.spo2}%` : "No data"}
          unit="SpO₂"
          icon={Wind}
          accent="text-success"
          tone="bg-success/10"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 metric-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Blood pressure · last 14 days</div>
              <div className="font-display text-xl font-semibold mt-0.5">
                {vitals.bloodPressure.length ? "Trending stable" : "No readings yet"}
              </div>
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="h-56">
            {vitals.bloodPressure.length ? (
              <BloodPressureChart data={vitals.bloodPressure} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                No blood pressure readings available yet.
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="h-4 w-4 text-primary" />
            <div className="text-sm font-medium">Today&apos;s medications</div>
          </div>
          <div className="space-y-2">
            {medications.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border bg-background/40 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.dose} · {m.nextDose}
                  </div>
                </div>
                <span
                  className={`chip ${m.taken ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}`}
                >
                  {m.taken ? "Taken" : "Due"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Adherence average <span className="text-foreground font-medium">{adherenceAvg}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="text-sm font-medium">AI Assistant</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Have a question about your medications or readings? Ask the assistant — it explains,
            never diagnoses.
          </p>
          <Link
            href="/patient/assistant"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90"
          >
            Open assistant
          </Link>
        </div>

        <div className="metric-card lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-sm font-medium">Upcoming</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {appointments.length ? (
              appointments.map((a) => (
                <div key={a.id} className="rounded-lg border bg-background/40 p-3">
                  <div className="text-sm font-medium">{a.staffName}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.whenLabel} · {a.reason}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-background/30 p-3 text-sm text-muted-foreground">
                No upcoming appointments.
              </div>
            )}
            {alerts.length ? (
              alerts.map((a) => (
                <div key={a.id} className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                  <div className="text-sm font-medium text-warning-foreground">{a.message}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-background/30 p-3 text-sm text-muted-foreground">
                No active alerts.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  accent,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  icon: typeof Heart;
  accent: string;
  tone: string;
}) {
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
