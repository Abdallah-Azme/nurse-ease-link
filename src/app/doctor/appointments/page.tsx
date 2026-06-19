import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { AppointmentManager } from "@/components/doctor/appointment-manager";
import { getAppointmentsForDoctor, getPatientsForDoctor } from "@/db/queries";

export const metadata = { title: "Appointments · CareConnect" };

export default async function DoctorAppointmentsPage() {
  const session = await auth();
  const [appointments, patients] = await Promise.all([
    getAppointmentsForDoctor(session!.user.id),
    getPatientsForDoctor(session!.user.id),
  ]);

  const appointmentItems = await Promise.all(
    appointments.map(async (a) => {
      const patient = patients.find((p) => p.id === a.patientId);
      return {
        id: a.id,
        patientId: a.patientId,
        patientName: patient?.name ?? "Unknown patient",
        whenLabel: a.whenLabel,
        scheduledAt: a.scheduledAt ?? null,
        reason: a.reason,
        status: a.status,
      };
    }),
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Create new follow-ups and cancel upcoming visits."
      />
      <AppointmentManager
        patients={patients.map((p) => ({
          id: p.id,
          name: p.name,
          conditions: p.conditions,
        }))}
        appointments={appointmentItems}
      />
    </>
  );
}
