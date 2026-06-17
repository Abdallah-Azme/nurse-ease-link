import { RoleLayout } from "@/components/role-layout";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="doctor">{children}</RoleLayout>;
}
