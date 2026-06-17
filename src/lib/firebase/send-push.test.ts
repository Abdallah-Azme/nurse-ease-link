import { describe, expect, it } from "vitest";

import { sendPushToUsers } from "@/lib/firebase/send-push";

describe("sendPushToUsers", () => {
  it("skips gracefully when Firebase is not configured", async () => {
    const result = await sendPushToUsers(["p1"], {
      title: "Test",
      body: "Test body",
      event: "test",
    });
    expect(result.skipped).toBe(true);
    expect(result.sent).toBe(0);
  });
});
