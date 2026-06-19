import Link from "next/link";

import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssistantChat } from "@/components/patient/assistant-chat";
import { getEducationResources } from "@/db/queries";

export const metadata = { title: "Patient assistant · CareConnect" };

export default async function AssistantPage() {
  const resources = await getEducationResources("patient");

  return (
    <>
      <PageHeader
        title="Patient assistant"
        subtitle="Gemini-powered education with quick access to your care team."
      />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AssistantChat />
        </div>
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
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Approved resources</CardTitle>
          <CardDescription>Clinician-reviewed education content from the platform.</CardDescription>
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
    </>
  );
}
