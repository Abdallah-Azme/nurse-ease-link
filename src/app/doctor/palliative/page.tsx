import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatientsForDoctor } from "@/db/queries";
import { Activity, ChartLine, ClipboardList, Users } from "lucide-react";

export const metadata = { title: "Palliative review · CareConnect" };

export default async function DoctorPalliativePage() {
  const session = await auth();
  const patients = await getPatientsForDoctor(session!.user.id);
  const checkins: Array<{
    id: string;
    recordedAt: Date;
    alertLevel: string;
    pain: number;
    nausea: number;
    fatigue: number;
  }> = [];
  const outcomes: Array<{
    id: string;
    recordedAt: Date;
    symptomScore: number;
    qualityOfLifeScore: number;
    alertCount: number;
  }> = [];

  return (
    <>
      <PageHeader
        title="Palliative review"
        subtitle="Use symptom trends and outcomes to update the care plan."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat icon={Users} label="Patients" value={patients.length} />
        <Stat icon={Activity} label="Latest pain" value="select a patient" />
        <Stat icon={ClipboardList} label="Outcomes" value={outcomes.length} />
        <Stat icon={ChartLine} label="Trend" value="select a patient" tone="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Recent symptom check-ins</CardTitle>
            <CardDescription>
              Select a patient from the patient list to review trends.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkins.map((checkin) => (
              <div key={checkin.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{new Date(checkin.recordedAt).toLocaleString()}</div>
                  <span className="chip bg-primary/10 text-primary">{checkin.alertLevel}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Pain {checkin.pain}/10 · Nausea {checkin.nausea}/10 · Fatigue {checkin.fatigue}/10
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outcome history</CardTitle>
            <CardDescription>Quality-of-life and adherence snapshots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outcomes.map((row) => (
              <div key={row.id} className="rounded-lg border p-3">
                <div className="text-sm font-medium">
                  {new Date(row.recordedAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Symptoms {row.symptomScore}/100 · QoL {row.qualityOfLifeScore}/100 · Alerts{" "}
                  {row.alertCount}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Choose a patient in the dedicated patient list to edit a care plan or record an
              outcome snapshot.
            </CardContent>
          </Card>
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
  tone?: "success";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div
            className={`h-8 w-8 rounded-lg grid place-items-center ${tone === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
