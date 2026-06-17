import type { RiskLevel } from "@/db/queries";

export function riskColor(r: RiskLevel) {
  return r === "high" ? "text-destructive" : r === "medium" ? "text-warning" : "text-success";
}

export function riskBg(r: RiskLevel) {
  return r === "high"
    ? "bg-destructive/10 text-destructive"
    : r === "medium"
      ? "bg-warning/15 text-warning-foreground"
      : "bg-success/10 text-success";
}
