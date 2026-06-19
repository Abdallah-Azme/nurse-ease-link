import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCarePlanForPatient,
  getCommunicationLogsForPatient,
  getEducationResources,
  getOutcomeSnapshotsForPatient,
  getPatientWithProfile,
  getSymptomCheckinsForPatient,
  getVisitSchedulesForPatient,
} from "@/db/queries";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Users,
} from "lucide-react";

import { SymptomCheckinForm } from "@/components/patient/symptom-checkin-form";

export const metadata = { title: "Palliative care · CareConnect" };

export default async function PatientPalliativePage() {
  const session = await auth();
  const patientId = session!.user.id;

  const [checkins, carePlan, visits, resources, logs, outcomes] = await Promise.all([
    getSymptomCheckinsForPatient(patientId),
    getCarePlanForPatient(patientId),
    getVisitSchedulesForPatient(patientId),
    getEducationResources("patient"),
    getCommunicationLogsForPatient(patientId),
    getOutcomeSnapshotsForPatient(patientId),
  ]);
  const profile = await getPatientWithProfile(patientId);

  const latest = checkins[0];
  const latestOutcome = outcomes.at(-1);

  return (
    <>
      <PageHeader
        title="Home palliative care"
        subtitle="Track symptoms, review your care plan, and stay connected to your care team."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <SymptomCheckinForm />

          <div className="grid md:grid-cols-2 gap-4">
            <MiniCard
              icon={HeartPulse}
              title="Latest symptom score"
              value={
                latest
                  ? `${latest.pain + latest.nausea + latest.fatigue + latest.breathlessness}`
                  : "No check-ins yet"
              }
              subtitle={latest ? `Alert level: ${latest.alertLevel}` : "Submit your first check-in"}
            />
            <MiniCard
              icon={Users}
              title="Quality of life"
              value={latestOutcome ? `${latestOutcome.qualityOfLifeScore}/100` : "No data"}
              subtitle={
                latestOutcome
                  ? "Tracked from recent outcomes"
                  : "Update check-ins to start tracking"
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Care plan</CardTitle>
              <CardDescription>Goals, interventions, and the next review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carePlan ? (
                <>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm">{carePlan.summary}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Next review:{" "}
                      {carePlan.nextReviewAt
                        ? new Date(carePlan.nextReviewAt).toLocaleString()
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Goals</div>
                    <div className="space-y-2">
                      {carePlan.goals.map((goal) => (
                        <div key={goal.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium">{goal.title}</div>
                            <span className="chip bg-primary/10 text-primary">{goal.status}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{goal.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Current interventions</div>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      {carePlan.interventions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {carePlan.caregiverNotes && (
                    <div className="rounded-lg border bg-warning/10 p-3 text-sm">
                      <strong className="text-warning-foreground">Caregiver note:</strong>{" "}
                      {carePlan.caregiverNotes}
                    </div>
                  )}
                  {profile?.caregiverName && (
                    <div className="rounded-lg border bg-primary/5 p-3 text-sm">
                      <div className="font-medium">Caregiver access</div>
                      <div className="text-muted-foreground">
                        {profile.caregiverName}
                        {profile.caregiverPhone ? ` · ${profile.caregiverPhone}` : ""}
                        {profile.preferredEscalation
                          ? ` · prefers ${profile.preferredEscalation}`
                          : ""}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No care plan found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming visits</CardTitle>
              <CardDescription>Home visits and follow-up calls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visits.map((visit) => (
                <div key={visit.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{visit.staffName}</div>
                    <span className="chip bg-success/10 text-success">{visit.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{visit.reason}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(visit.scheduledAt).toLocaleString()} · {visit.type}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Helpful guides for you and your caregiver.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div className="font-medium">{resource.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{resource.summary}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent notes</CardTitle>
              <CardDescription>Calls, visits, and clinical decisions.</CardDescription>
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
      </div>
    </>
  );
}

function MiniCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: typeof HeartPulse;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
