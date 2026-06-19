import { RoleLayout } from "@/components/role-layout";

export const dynamic = "force-dynamic";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="doctor">{children}</RoleLayout>;
}
