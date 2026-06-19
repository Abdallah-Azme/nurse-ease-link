"use client";

import { useState, useTransition } from "react";

import { updateNotificationPreferences } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NotificationPreferencesForm({
  initialValues,
}: {
  initialValues: {
    push: boolean;
    inApp: boolean;
    email: boolean;
    quietHours: string;
  };
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rows: Array<{ name: string; label: string; checked: boolean }> = [
    { name: "push", label: "Push notifications", checked: initialValues.push },
    { name: "inApp", label: "In-app banners", checked: initialValues.inApp },
    { name: "email", label: "Email digests", checked: initialValues.email },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Choose how you want to receive non-critical updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await updateNotificationPreferences({
                push: formData.get("push") === "on",
                inApp: formData.get("inApp") === "on",
                email: formData.get("email") === "on",
                quietHours: String(formData.get("quietHours") ?? "22:00-07:00"),
              });
              setStatus(result.ok ? "Preferences saved." : result.message);
            });
          }}
          className="space-y-4"
        >
          {rows.map(({ name, label, checked }) => (
            <label
              key={name}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">Receive {label.toLowerCase()}.</div>
              </div>
              <input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4" />
            </label>
          ))}
          <div className="space-y-2">
            <Label htmlFor="quietHours">Quiet hours</Label>
            <Input
              id="quietHours"
              name="quietHours"
              defaultValue={initialValues.quietHours}
              placeholder="22:00-07:00"
              pattern="\d{2}:\d{2}-\d{2}:\d{2}"
              aria-describedby="quietHours-help"
            />
            <p id="quietHours-help" className="text-xs text-muted-foreground">
              Use 24-hour time, for example 22:00-07:00.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save preferences"}
            </Button>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
