"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, X } from "lucide-react";
import { toast } from "sonner";

import { cancelAppointment, createAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";

type PatientOption = {
  id: string;
  name: string;
  conditions: string[];
};

type AppointmentItem = {
  id: string;
  patientId: string;
  patientName: string;
  whenLabel: string;
  scheduledAt?: Date | null;
  reason: string;
  status: "scheduled" | "cancelled" | "completed";
};

export function AppointmentManager({
  patients,
  appointments,
}: {
  patients: PatientOption[];
  appointments: AppointmentItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [staffName, setStaffName] = useState("");

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? patients[0],
    [patientId, patients],
  );

  function submit() {
    if (!patientId || !scheduledAt.trim() || !reason.trim()) return;
    startTransition(async () => {
      const result = await createAppointment({
        patientId,
        staffName: staffName.trim(),
        scheduledAt: new Date(scheduledAt),
        reason: reason.trim(),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Appointment scheduled");
      setReason("");
      setScheduledAt("");
      setStaffName("");
      window.location.reload();
    });
  }

  function cancel(id: string) {
    startTransition(async () => {
      const result = await cancelAppointment(id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Appointment cancelled");
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="metric-card">
        <div className="flex items-center gap-2 font-display font-semibold">
          <CalendarDays className="h-5 w-5 text-primary" />
          Schedule appointment
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Patient</span>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.conditions.length ? `- ${p.conditions.join(", ")}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Date and time</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Reason</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Follow-up after symptom change"
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Staff label</span>
            <input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
              placeholder="Optional display label, e.g. Dr. Mei Chen"
            />
          </label>
        </div>
        <div className="mt-4">
          <Button type="button" onClick={submit} disabled={pending || !patient}>
            {pending ? "Saving..." : "Schedule appointment"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {appointments.length === 0 ? (
          <div className="metric-card text-sm text-muted-foreground">No upcoming appointments.</div>
        ) : (
          appointments.map((a) => (
            <div key={a.id} className="metric-card flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold">{a.patientName}</div>
                <div className="text-sm text-muted-foreground">{a.whenLabel}</div>
                <div className="text-sm mt-2">{a.reason}</div>
              </div>
              <span className="chip bg-success/10 text-success">{a.status}</span>
              {a.status === "scheduled" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => cancel(a.id)}
                  disabled={pending}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
