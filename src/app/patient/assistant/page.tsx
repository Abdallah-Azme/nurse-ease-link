import Link from "next/link";

import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEducationResources } from "@/db/queries";

export const metadata = { title: "Patient education · CareConnect" };

export default async function AssistantPage() {
  const resources = await getEducationResources("patient");

  return (
    <>
      <PageHeader
        title="Patient education"
        subtitle="Safe, clinician-approved guidance and quick access to your care team."
      />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Approved resources</CardTitle>
            <CardDescription>
              This area now shows approved education content rather than a simulated assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="rounded-lg border p-3">
                <div className="font-medium">{resource.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{resource.summary}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need help now?</CardTitle>
            <CardDescription>
              Use a route that reaches a real clinician or emergency service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/patient/chat"
              className="block rounded-lg border bg-background px-4 py-3 text-sm font-medium hover:bg-accent"
            >
              Message care team
            </Link>
            <Link
              href="/patient/emergency"
              className="block rounded-lg border bg-background px-4 py-3 text-sm font-medium hover:bg-accent"
            >
              Emergency flow
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
