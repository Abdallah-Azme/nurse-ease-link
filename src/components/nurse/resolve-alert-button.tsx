"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { resolveAlert } from "@/actions/emergencies";

export function ResolveAlertButton({ alertId }: { alertId: string }) {
  const router = useRouter();

  async function handleResolve() {
    const result = await resolveAlert(alertId);
    if (result.ok) {
      toast.success("Alert resolved");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handleResolve}
      className="text-xs rounded-lg border bg-card px-3 py-1.5 hover:bg-accent"
    >
      Resolve
    </button>
  );
}
