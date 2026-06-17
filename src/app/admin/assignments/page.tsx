import { PageHeader } from "@/components/app-shell";
import { AssignmentRow } from "@/components/admin/assignment-row";
import { getAllPatients, getNursesAndDoctors } from "@/db/queries";

export const metadata = { title: "Assignments · CareConnect" };

export default async function AdminAssignmentsPage() {
  const patients = await getAllPatients();
  const staffRows = await getNursesAndDoctors();
  const nurses = staffRows
    .filter((s) => s.user.role === "nurse")
    .map((s) => ({ id: s.user.id, name: s.user.name }));
  const doctors = staffRows
    .filter((s) => s.user.role === "doctor")
    .map((s) => ({ id: s.user.id, name: s.user.name }));

  return (
    <>
      <PageHeader title="Care team assignments" subtitle="Assign nurses and doctors to patients." />
      <div className="metric-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase tracking-wider text-left">
            <tr>
              <th className="py-2">Patient</th>
              <th>Nurse</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map((p) => (
              <AssignmentRow
                key={p.id}
                patientId={p.id}
                patientName={p.name}
                nurses={nurses}
                doctors={doctors}
                defaultNurseId={p.assignedNurseId}
                defaultDoctorId={p.assignedDoctorId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
