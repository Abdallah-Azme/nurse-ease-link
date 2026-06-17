import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { getAppointmentsForDoctor } from "@/db/queries";

export const metadata = { title: "Appointments · CareConnect" };

export default async function DoctorAppointmentsPage() {
  const session = await auth();
  const appointments = await getAppointmentsForDoctor(session!.user.id);

  return (
    <>
      <PageHeader title="Appointments" subtitle="Scheduled visits with your patients." />
      <div className="grid gap-3">
        {appointments.map((a) => (
          <div key={a.id} className="metric-card">
            <div className="font-display font-semibold">{a.staffName}</div>
            <div className="text-sm text-muted-foreground">{a.whenLabel}</div>
            <div className="text-sm mt-2">{a.reason}</div>
            <span className="chip bg-success/10 text-success mt-3">{a.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
