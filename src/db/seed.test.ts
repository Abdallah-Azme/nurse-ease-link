import { describe, expect, it } from "vitest";

import { getUserByEmail } from "@/db/queries/users";

describe("database seed", () => {
  it("has demo patient user", async () => {
    const user = await getUserByEmail("patient@careconnect.demo");
    expect(user).not.toBeNull();
    expect(user?.role).toBe("patient");
    expect(user?.name).toBe("Amelia Hart");
  });

  it("has demo nurse user", async () => {
    const user = await getUserByEmail("nurse@careconnect.demo");
    expect(user?.role).toBe("nurse");
  });
});
