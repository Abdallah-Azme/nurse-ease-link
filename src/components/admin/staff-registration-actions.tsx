"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { reviewStaffRegistration } from "@/actions/registration";

export function StaffRegistrationActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function review(decision: "approve" | "reject") {
    if (pending) return;
    setPending(true);
    const result = await reviewStaffRegistration(userId, decision);
    setPending(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(decision === "approve" ? "Staff account approved" : "Registration rejected");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => void review("approve")}
        className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => void review("reject")}
        className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
