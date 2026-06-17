import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/nurse")({
  component: () => (
    <AppShell role="nurse">
      <Outlet />
    </AppShell>
  ),
});
