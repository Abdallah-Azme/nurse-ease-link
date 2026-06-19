"use client";

import { useState, useTransition } from "react";

import { saveCarePlan } from "@/actions/palliative";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CarePlanForm({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit care plan</CardTitle>
        <CardDescription>Update goals and interventions for the focused patient.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await saveCarePlan({
                patientId,
                summary: String(formData.get("summary") ?? ""),
                nextReviewAt: formData.get("nextReviewAt")
                  ? new Date(String(formData.get("nextReviewAt")))
                  : undefined,
                interventions: String(formData.get("interventions") ?? "")
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
                caregiverNotes: String(formData.get("caregiverNotes") ?? ""),
                goals: String(formData.get("goals") ?? "")
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [title, details] = line.split("|");
                    return { title: title?.trim() ?? "", details: details?.trim() ?? "" };
                  }),
              });
              setStatus(result.ok ? "Care plan saved." : result.message);
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" required placeholder="Short plan summary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextReviewAt">Next review</Label>
            <Input id="nextReviewAt" name="nextReviewAt" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              name="goals"
              required
              placeholder={"Goal title | Goal details\nSecond goal | Details"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interventions">Interventions</Label>
            <Textarea
              id="interventions"
              name="interventions"
              required
              placeholder={"Daily check-in\nMedication review\nCaregiver updates"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caregiverNotes">Caregiver notes</Label>
            <Textarea id="caregiverNotes" name="caregiverNotes" placeholder="Optional notes" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save care plan"}
            </Button>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
