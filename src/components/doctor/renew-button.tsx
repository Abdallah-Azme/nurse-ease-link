"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { renewPrescription } from "@/actions/appointments";

export function RenewButton({ medicationId }: { medicationId: string }) {
  const router = useRouter();

  async function handleRenew() {
    const result = await renewPrescription(medicationId);
    if (result.ok) {
      toast.success("Prescription renewed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handleRenew}
      className="text-xs rounded-md border bg-card px-2 py-1 hover:bg-accent"
    >
      Renew
    </button>
  );
}
