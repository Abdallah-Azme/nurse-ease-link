import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { ResolveAlertButton } from "@/components/nurse/resolve-alert-button";
import { getAlertsForPatients, getPatientsForNurse } from "@/db/queries";

export const metadata = { title: "Alerts · CareConnect" };

export default async function NurseAlertsPage() {
  const session = await auth();
  const patients = await getPatientsForNurse(session!.user.id);
  const alerts = await getAlertsForPatients(patients.map((p) => p.id));

  return (
    <>
      <PageHeader title="Alerts" subtitle="Respond to patient alerts and escalations." />
      <div className="grid gap-3">
        {alerts.map((a) => (
          <div key={a.id} className="metric-card flex flex-wrap items-center gap-4">
            <div
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${a.level === "critical" ? "bg-destructive" : a.level === "warning" ? "bg-warning" : "bg-primary"}`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium">{a.patientName}</div>
              <div className="text-sm text-muted-foreground">{a.message}</div>
              <div className="text-xs text-muted-foreground mt-1">{a.time}</div>
            </div>
            <span
              className={`chip ${a.level === "critical" ? "bg-destructive/15 text-destructive" : a.level === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-muted"}`}
            >
              {a.level}
            </span>
            {!a.resolvedAt && <ResolveAlertButton alertId={a.id} />}
          </div>
        ))}
      </div>
    </>
  );
}
