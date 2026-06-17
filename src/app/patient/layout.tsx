import { RoleLayout } from "@/components/role-layout";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="patient">{children}</RoleLayout>;
}
