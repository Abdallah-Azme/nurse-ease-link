import { auth } from "@/auth";
import { RoleLayout } from "@/components/role-layout";
import { redirect } from "next/navigation";

export default async function NotificationsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <RoleLayout role={session.user.role}>{children}</RoleLayout>;
}
