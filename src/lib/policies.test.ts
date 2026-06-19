import { describe, expect, it } from "vitest";

import { canReadNotification, canTransitionStatus } from "@/lib/policy-helpers";

describe("policy helpers", () => {
  it("allows only matching notification recipients", () => {
    expect(canReadNotification({ userId: "u1" }, "u1")).toBe(true);
    expect(canReadNotification({ userId: "u1" }, "u2")).toBe(false);
  });

  it("requires status transitions to match the current state", () => {
    expect(canTransitionStatus({ status: "scheduled" }, "scheduled", "cancelled", "doctor")).toBe(
      true,
    );
    expect(canTransitionStatus({ status: "completed" }, "scheduled", "cancelled", "doctor")).toBe(
      false,
    );
  });
});
