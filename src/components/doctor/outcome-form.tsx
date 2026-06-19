"use client";

import { useState, useTransition } from "react";

import { addOutcomeSnapshot } from "@/actions/palliative";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OutcomeForm({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record outcome snapshot</CardTitle>
        <CardDescription>Capture symptom, adherence, and quality-of-life scores.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await addOutcomeSnapshot({
                patientId,
                symptomScore: Number(formData.get("symptomScore")),
                adherenceScore: Number(formData.get("adherenceScore")),
                qualityOfLifeScore: Number(formData.get("qualityOfLifeScore")),
                alertCount: Number(formData.get("alertCount")),
              });
              setStatus(result.ok ? "Outcome recorded." : result.message);
            });
          }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {[
            ["symptomScore", "Symptom score"],
            ["adherenceScore", "Adherence score"],
            ["qualityOfLifeScore", "Quality of life"],
            ["alertCount", "Alerts"],
          ].map(([name, label]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} name={name} type="number" min={0} max={100} defaultValue={0} />
            </div>
          ))}
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save snapshot"}
            </Button>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
