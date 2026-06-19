import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import {
  getUnreadAlertCountForUser,
  getUnreadMessageCountForUser,
  getUnreadNotificationCountForUser,
} from "@/db/queries";
import type { Role } from "@/auth";
import { redirect } from "next/navigation";

export async function RoleLayout({ role, children }: { role: Role; children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== role) {
    redirect("/login");
  }

  const alertCount = await getUnreadAlertCountForUser(session.user.id, role);
  const messageCount = await getUnreadMessageCountForUser(session.user.id);
  const notificationCount = await getUnreadNotificationCountForUser(session.user.id);

  return (
    <AppShell
      role={role}
      userName={session.user.name}
      alertCount={alertCount + messageCount + notificationCount}
    >
      {children}
    </AppShell>
  );
}
