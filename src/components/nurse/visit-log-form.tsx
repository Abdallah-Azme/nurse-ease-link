"use client";

import { useState, useTransition } from "react";

import { addCommunicationLog, scheduleVisit } from "@/actions/palliative";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function VisitLogForm({ patientId, staffName }: { patientId: string; staffName: string }) {
  const [visitStatus, setVisitStatus] = useState<string | null>(null);
  const [logStatus, setLogStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Schedule follow-up</CardTitle>
          <CardDescription>Book a home visit or remote follow-up for the patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={(formData) => {
              startTransition(async () => {
                const result = await scheduleVisit({
                  patientId,
                  staffName,
                  scheduledAt: new Date(String(formData.get("scheduledAt") ?? "")),
                  type: String(formData.get("type") ?? "home_visit") as
                    | "home_visit"
                    | "phone_followup"
                    | "video_call",
                  reason: String(formData.get("reason") ?? ""),
                });
                setVisitStatus(result.ok ? "Visit scheduled." : result.message);
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date and time</Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue="home_visit"
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="home_visit">Home visit</option>
                <option value="phone_followup">Phone follow-up</option>
                <option value="video_call">Video call</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" required />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Schedule visit"}
              </Button>
              {visitStatus && <p className="text-sm text-muted-foreground">{visitStatus}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication log</CardTitle>
          <CardDescription>Capture follow-up calls, visits, and notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={(formData) => {
              startTransition(async () => {
                const result = await addCommunicationLog({
                  patientId,
                  authorName: staffName,
                  channel: String(formData.get("channel") ?? "call") as
                    | "call"
                    | "chat"
                    | "visit"
                    | "note",
                  summary: String(formData.get("summary") ?? ""),
                });
                setLogStatus(result.ok ? "Log saved." : result.message);
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <select
                id="channel"
                name="channel"
                defaultValue="call"
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="call">Call</option>
                <option value="chat">Chat</option>
                <option value="visit">Visit</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" required />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save log"}
              </Button>
              {logStatus && <p className="text-sm text-muted-foreground">{logStatus}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
