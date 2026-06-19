"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { resolveAlert } from "@/actions/emergencies";

export function ResolveAlertButton({ alertId }: { alertId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleResolve() {
    if (pending) return;
    setPending(true);
    const result = await resolveAlert(alertId);
    setPending(false);
    if (result.ok) {
      toast.success("Alert resolved");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <button
      onClick={handleResolve}
      disabled={pending}
      className="text-xs rounded-lg border bg-card px-3 py-1.5 hover:bg-accent disabled:opacity-50"
    >
      {pending ? "Resolving..." : "Resolve"}
    </button>
  );
}
