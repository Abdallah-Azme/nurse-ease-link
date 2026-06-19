import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { getUserById } from "@/db/queries/users";
import { redirect } from "next/navigation";

export const metadata = { title: "Notification preferences · CareConnect" };

export default async function NotificationPreferencesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await getUserById(session.user.id);
  const prefs = user?.notificationPreferences ?? {
    push: true,
    inApp: true,
    email: false,
    quietHours: "22:00-07:00",
  };

  return (
    <>
      <PageHeader
        title="Notification preferences"
        subtitle="Control how you receive updates from CareConnect."
      />
      <NotificationPreferencesForm initialValues={prefs} />
    </>
  );
}
