import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { LineVitalsChart } from "@/components/charts/vitals-charts";
import { getVitalsForPatient } from "@/db/queries";

export const metadata = { title: "Vitals · CareConnect" };

function ChartCard({
  title,
  abnormal,
  children,
}: {
  title: string;
  abnormal?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">{title}</div>
        {abnormal && <span className="chip bg-warning/15 text-warning-foreground">{abnormal}</span>}
      </div>
      <div className="h-[220px]">{children}</div>
    </div>
  );
}

export default async function VitalsPage() {
  const session = await auth();
  const vitals = await getVitalsForPatient(session!.user.id);

  return (
    <>
      <PageHeader
        title="Vitals & trends"
        subtitle="14-day history of your tracked health metrics. Abnormal readings are highlighted."
      />
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Blood pressure (mmHg)" abnormal="Spike on day 10">
          <LineVitalsChart data={vitals.bloodPressure} dataKey="systolic" />
        </ChartCard>
        <ChartCard title="Blood sugar (mg/dL)" abnormal="One high fasting reading">
          <LineVitalsChart
            data={vitals.bloodSugar}
            dataKey="fasting"
            stroke="var(--chart-3)"
            fill={true}
          />
        </ChartCard>
        <ChartCard title="Heart rate (bpm)">
          <LineVitalsChart data={vitals.heartRate} dataKey="bpm" domain={[55, 95]} />
        </ChartCard>
        <ChartCard title="Oxygen saturation (SpO₂ %)" abnormal="Brief desaturation on day 10">
          <LineVitalsChart
            data={vitals.oxygen}
            dataKey="spo2"
            stroke="var(--chart-2)"
            domain={[88, 100]}
          />
        </ChartCard>
        <ChartCard title="Weight (kg)">
          <LineVitalsChart data={vitals.weight} dataKey="kg" stroke="var(--chart-4)" fill={true} />
        </ChartCard>
      </div>
    </>
  );
}
