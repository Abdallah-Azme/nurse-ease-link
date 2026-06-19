import { describe, expect, it } from "vitest";

import { registrationSchema } from "./registration";

const base = {
  name: "Test User",
  email: "test@example.com",
  password: "StrongPass1",
  confirmPassword: "StrongPass1",
};

describe("registrationSchema", () => {
  it("accepts a complete patient registration", () => {
    const result = registrationSchema.safeParse({
      ...base,
      role: "patient",
      age: "44",
      sex: "F",
      conditions: "Hypertension, Diabetes",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
      expect(result.data.age).toBe(44);
    }
  });

  it.each(["nurse", "doctor"] as const)("requires a specialty for %s registration", (role) => {
    const result = registrationSchema.safeParse({ ...base, role, specialty: "" });
    expect(result.success).toBe(false);
  });

  it("rejects weak and mismatched passwords", () => {
    const result = registrationSchema.safeParse({
      ...base,
      role: "patient",
      age: 44,
      sex: "M",
      password: "weak",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
    }
  });
});
