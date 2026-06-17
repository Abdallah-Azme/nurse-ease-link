import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { getUnreadAlertCountForUser } from "@/db/queries";
import type { Role } from "@/auth";

export async function RoleLayout({ role, children }: { role: Role; children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== role) {
    return null;
  }

  const alertCount = await getUnreadAlertCountForUser(session.user.id, role);

  return (
    <AppShell role={role} userName={session.user.name} alertCount={alertCount}>
      {children}
    </AppShell>
  );
}
