"use client";

import { useState, useTransition } from "react";

import { submitSymptomCheckin } from "@/actions/palliative";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fields = [
  { key: "pain", label: "Pain" },
  { key: "nausea", label: "Nausea" },
  { key: "fatigue", label: "Fatigue" },
  { key: "appetite", label: "Appetite loss" },
  { key: "sleep", label: "Sleep problems" },
  { key: "anxiety", label: "Anxiety" },
  { key: "breathlessness", label: "Breathlessness" },
] as const;

export function SymptomCheckinForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitSymptomCheckin({
        pain: Number(formData.get("pain")),
        nausea: Number(formData.get("nausea")),
        fatigue: Number(formData.get("fatigue")),
        appetite: Number(formData.get("appetite")),
        sleep: Number(formData.get("sleep")),
        anxiety: Number(formData.get("anxiety")),
        breathlessness: Number(formData.get("breathlessness")),
        notes: String(formData.get("notes") ?? ""),
      });
      setStatus(result.ok ? `Saved as ${result.data.alertLevel} priority.` : result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily symptom check-in</CardTitle>
        <CardDescription>
          Rate each symptom from 0 to 10. Higher scores help the care team respond faster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) => {
            onSubmit(formData);
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  name={field.key}
                  type="number"
                  min={0}
                  max={10}
                  defaultValue={0}
                  required
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything your nurse should know?"
              className="min-h-28"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Submit check-in"}
            </Button>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
