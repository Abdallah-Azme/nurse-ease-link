import { RoleLayout } from "@/components/role-layout";

export const dynamic = "force-dynamic";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="nurse">{children}</RoleLayout>;
}
