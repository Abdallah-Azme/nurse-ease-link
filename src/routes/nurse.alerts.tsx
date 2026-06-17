import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { alerts } from "@/lib/mock-data";

export const Route = createFileRoute("/nurse/alerts")({
  head: () => ({ meta: [{ title: "Alerts · CareConnect" }] }),
  component: NurseAlerts,
});

function NurseAlerts() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Sorted by severity. Acknowledge to remove from the queue." />
      <div className="space-y-3">
        {alerts.map((a) => (
          <div key={a.id} className={`metric-card flex items-start gap-4 border-l-4 ${a.level === "critical" ? "border-l-destructive" : a.level === "warning" ? "border-l-warning" : "border-l-primary"}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`chip ${a.level === "critical" ? "bg-destructive/15 text-destructive" : a.level === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-primary/15 text-primary"}`}>{a.level}</span>
                <div className="font-medium">{a.patientName}</div>
                <div className="text-xs text-muted-foreground">· {a.time}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">Acknowledge</button>
              <button className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90">Contact patient</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
