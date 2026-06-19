import { describe, expect, it } from "vitest";

import { fail, ok } from "@/lib/action-result";
import { riskBg, riskColor } from "@/lib/risk";

describe("action-result", () => {
  it("ok returns success shape", () => {
    const result = ok({ id: "1" }, { eventId: "event-1", correlationId: "correlation-1" });
    expect(result).toEqual({
      ok: true,
      data: { id: "1" },
      eventId: "event-1",
      correlationId: "correlation-1",
    });
  });

  it("fail returns error shape", () => {
    const result = fail("nope", "validation_error", {
      correlationId: "correlation-1",
      fieldErrors: { email: ["Invalid email"] },
    });
    expect(result).toEqual({
      ok: false,
      code: "validation_error",
      message: "nope",
      error: "nope",
      correlationId: "correlation-1",
      fieldErrors: { email: ["Invalid email"] },
    });
  });
});

describe("risk helpers", () => {
  it("maps risk levels to classes", () => {
    expect(riskColor("high")).toContain("destructive");
    expect(riskBg("low")).toContain("success");
    expect(riskBg("medium")).toContain("warning");
  });
});
