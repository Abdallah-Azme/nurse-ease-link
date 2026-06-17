import { PageHeader } from "@/components/app-shell";
import { UsersTabs } from "@/components/admin/users-tabs";
import { getAllPatients, getAllStaff } from "@/db/queries";

export const metadata = { title: "Users · CareConnect" };

export default async function AdminUsersPage() {
  const patients = await getAllPatients();
  const staff = await getAllStaff();

  return (
    <>
      <PageHeader title="Users" subtitle="Manage patient and staff accounts." />
      <UsersTabs patients={patients} staff={staff} />
    </>
  );
}
