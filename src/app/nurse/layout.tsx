import { RoleLayout } from "@/components/role-layout";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="nurse">{children}</RoleLayout>;
}
