import { describe, expect, it } from "vitest";

import { getAlertLevel } from "@/actions/palliative-utils";

describe("palliative actions", () => {
  it("classifies urgent symptom check-ins", () => {
    expect(
      getAlertLevel({
        pain: 8,
        nausea: 1,
        fatigue: 2,
        appetite: 2,
        sleep: 2,
        anxiety: 2,
        breathlessness: 1,
      }),
    ).toBe("urgent");
  });

  it("classifies watch symptom check-ins", () => {
    expect(
      getAlertLevel({
        pain: 4,
        nausea: 1,
        fatigue: 2,
        appetite: 2,
        sleep: 2,
        anxiety: 2,
        breathlessness: 1,
      }),
    ).toBe("watch");
  });

  it("classifies low symptom check-ins as ok", () => {
    expect(
      getAlertLevel({
        pain: 1,
        nausea: 1,
        fatigue: 1,
        appetite: 1,
        sleep: 1,
        anxiety: 1,
        breathlessness: 1,
      }),
    ).toBe("ok");
  });
});
