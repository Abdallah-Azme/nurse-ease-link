import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationFeedForUser } from "@/db/queries";
import { NotificationFeedItem } from "@/components/notifications/notification-feed-item";
import { redirect } from "next/navigation";

export const metadata = { title: "Inbox · CareConnect" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const feed = await getNotificationFeedForUser(session.user.id);

  return (
    <>
      <PageHeader title="Inbox" subtitle="All recent alerts and messages in one place." />
      <div className="mb-4 flex justify-end">
        <a href="/notifications/preferences" className="text-sm text-primary hover:underline">
          Notification preferences
        </a>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Click an item to jump to the right care screen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent notifications.</p>
          ) : (
            feed.map((item) => <NotificationFeedItem key={item.id} item={item} />)
          )}
        </CardContent>
      </Card>
    </>
  );
}
