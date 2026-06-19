import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOverdueVisitSchedules, getPatientsForNurse } from "@/db/queries";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

export const metadata = { title: "Palliative triage · CareConnect" };

export default async function NursePalliativePage() {
  const session = await auth();
  const patients = await getPatientsForNurse(session!.user.id);
  const checkins: Array<{
    id: string;
    recordedAt: Date;
    alertLevel: string;
    pain: number;
    breathlessness: number;
    anxiety: number;
    notes?: string;
  }> = [];
  const visits: Array<{ id: string }> = [];
  const logs: Array<{ id: string; authorName: string; summary: string }> = [];
  const outcomes: Array<{
    id: string;
    recordedAt: Date;
    symptomScore: number;
    qualityOfLifeScore: number;
    adherenceScore: number;
  }> = [];
  const overdueVisits = await getOverdueVisitSchedules();

  const urgent = checkins.filter((c) => c.alertLevel === "urgent").length;

  return (
    <>
      <PageHeader
        title="Palliative triage"
        subtitle="Review urgent symptoms, care plans, and home-visit follow-up."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={ClipboardList} label="Assigned patients" value={patients.length} />
        <Stat icon={ShieldAlert} label="Urgent check-ins" value={urgent} tone="destructive" />
        <Stat icon={CalendarDays} label="Visits" value={visits.length} tone="success" />
        <Stat icon={MessageSquare} label="Notes" value={logs.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Urgent symptom review</CardTitle>
            <CardDescription>Open an assigned patient to review symptom trends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkins.map((checkin) => (
              <div key={checkin.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{new Date(checkin.recordedAt).toLocaleString()}</div>
                  <span
                    className={`chip ${checkin.alertLevel === "urgent" ? "bg-destructive/15 text-destructive" : checkin.alertLevel === "watch" ? "bg-warning/15 text-warning-foreground" : "bg-success/10 text-success"}`}
                  >
                    {checkin.alertLevel}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Pain {checkin.pain}/10 · Breathlessness {checkin.breathlessness}/10 · Anxiety{" "}
                  {checkin.anxiety}/10
                </div>
                {checkin.notes && <div className="text-sm mt-2">{checkin.notes}</div>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Care plan</CardTitle>
            <CardDescription>Goals and next action.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Open an assigned patient to view the current care plan.
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Open an assigned patient to record a visit log or review their plan.
            </CardContent>
          </Card>
        </div>

        {overdueVisits.length > 0 && (
          <Card className="lg:col-span-3 border-warning/30 bg-warning/5">
            <CardHeader>
              <CardTitle>Overdue visits</CardTitle>
              <CardDescription>These scheduled follow-ups need a status update.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueVisits.map((visit) => (
                <div key={visit.id} className="rounded-lg border bg-background/70 p-3">
                  <div className="font-medium">{visit.staffName}</div>
                  <div className="text-sm text-muted-foreground">
                    {visit.reason} · {new Date(visit.scheduledAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Outcome trend</CardTitle>
            <CardDescription>Quality of life and symptom improvement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outcomes.map((row) => (
              <div key={row.id} className="rounded-lg border p-3">
                <div className="text-sm font-medium">
                  {new Date(row.recordedAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Symptoms {row.symptomScore}/100 · QoL {row.qualityOfLifeScore}/100 · Adherence{" "}
                  {row.adherenceScore}/100
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Follow-up log</CardTitle>
            <CardDescription>Calls, visits, and interventions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{log.authorName}</div>
                <div className="text-xs text-muted-foreground mt-1">{log.summary}</div>
              </div>
            ))}
          </CardContent>
        </Card>
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
  icon: typeof AlertTriangle;
  label: string;
  value: number | string;
  tone?: "destructive" | "success";
}) {
  const toneClass =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "success"
        ? "bg-success/10 text-success"
        : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`h-8 w-8 rounded-lg grid place-items-center ${toneClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
