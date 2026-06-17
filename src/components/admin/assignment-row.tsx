"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateAssignments } from "@/actions/assignments";

export function AssignmentRow({
  patientId,
  patientName,
  nurses,
  doctors,
  defaultNurseId,
  defaultDoctorId,
}: {
  patientId: string;
  patientName: string;
  nurses: { id: string; name: string }[];
  doctors: { id: string; name: string }[];
  defaultNurseId: string;
  defaultDoctorId: string;
}) {
  const [nurseId, setNurseId] = useState(defaultNurseId);
  const [doctorId, setDoctorId] = useState(defaultDoctorId);

  async function save(newNurseId: string, newDoctorId: string) {
    const result = await updateAssignments(patientId, newNurseId, newDoctorId);
    if (result.ok) {
      toast.success(`Updated assignments for ${patientName}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <tr>
      <td className="py-3 font-medium">{patientName}</td>
      <td className="py-3">
        <select
          value={nurseId}
          onChange={(e) => {
            setNurseId(e.target.value);
            void save(e.target.value, doctorId);
          }}
          className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {nurses.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3">
        <select
          value={doctorId}
          onChange={(e) => {
            setDoctorId(e.target.value);
            void save(nurseId, e.target.value);
          }}
          className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
