import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients, staff } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/assignments")({
  head: () => ({ meta: [{ title: "Assignments · CareConnect" }] }),
  component: () => {
    const nurses = staff.filter((s) => s.role === "nurse");
    const doctors = staff.filter((s) => s.role === "doctor");
    return (
      <>
        <PageHeader title="Care team assignments" subtitle="Assign nurses and doctors to patients." />
        <div className="metric-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider text-left">
              <tr><th className="py-2">Patient</th><th>Nurse</th><th>Doctor</th></tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3">
                    <select defaultValue={p.assignedNurseId} className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {nurses.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  </td>
                  <td className="py-3">
                    <select defaultValue={p.assignedDoctorId} className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  },
});
