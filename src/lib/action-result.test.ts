import { describe, expect, it } from "vitest";

import { fail, ok } from "@/lib/action-result";
import { riskBg, riskColor } from "@/lib/risk";

describe("action-result", () => {
  it("ok returns success shape", () => {
    const result = ok({ id: "1" });
    expect(result).toEqual({ ok: true, data: { id: "1" } });
  });

  it("fail returns error shape", () => {
    const result = fail("nope");
    expect(result).toEqual({ ok: false, error: "nope" });
  });
});

describe("risk helpers", () => {
  it("maps risk levels to classes", () => {
    expect(riskColor("high")).toContain("destructive");
    expect(riskBg("low")).toContain("success");
    expect(riskBg("medium")).toContain("warning");
  });
});
