import { PageHeader } from "@/components/app-shell";
import { AdherenceChart, LineVitalsChart } from "@/components/charts/vitals-charts";
import {
  getAdherenceTrend,
  getAllPatients,
  getPlatformStats,
  getVitalsForPatient,
} from "@/db/queries";

export const metadata = { title: "Analytics · CareConnect" };

export default async function AdminAnalyticsPage() {
  const platformStats = await getPlatformStats();
  const adherenceTrend = await getAdherenceTrend();
  const patients = await getAllPatients();
  const focus = patients.find(Boolean);
  const vitals = focus ? await getVitalsForPatient(focus.id) : { heartRate: [] };

  return (
    <>
      <PageHeader title="Analytics" subtitle="Platform trends and population health metrics." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className="metric-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Total patients
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">
            {platformStats.totalPatients}
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Active nurses
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">
            {platformStats.activeNurses}
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Active doctors
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">
            {platformStats.activeDoctors}
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            High-risk patients
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">{platformStats.highRisk}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="metric-card">
          <div className="text-sm font-medium mb-3">Adherence trend (14d)</div>
          <div className="h-[240px]">
            <AdherenceChart data={adherenceTrend} gradientId="analytics-adh" />
          </div>
        </div>
        <div className="metric-card">
          <div className="text-sm font-medium mb-3">
            {focus ? `${focus.name} heart rate` : "Population heart rate"}
          </div>
          <div className="h-[240px]">
            <LineVitalsChart data={vitals.heartRate} dataKey="bpm" />
          </div>
        </div>
      </div>
    </>
  );
}
