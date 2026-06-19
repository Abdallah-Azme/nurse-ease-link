import { afterEach, describe, expect, it, vi } from "vitest";

import { sendAssistantMessage } from "@/actions/assistant";

vi.mock("@/lib/safe-action", () => ({
  getSessionOrThrow: vi.fn(),
}));

vi.mock("@/db/queries", () => ({
  getPatientWithProfile: vi.fn(),
}));

vi.mock("@/lib/gemini-assistant", () => ({
  askGeminiAssistant: vi.fn(),
}));

import { getSessionOrThrow } from "@/lib/safe-action";
import { getPatientWithProfile } from "@/db/queries";
import { askGeminiAssistant } from "@/lib/gemini-assistant";

afterEach(() => {
  vi.clearAllMocks();
});

describe("sendAssistantMessage", () => {
  it("returns a Gemini reply for a patient", async () => {
    vi.mocked(getSessionOrThrow).mockResolvedValue({
      user: { id: "p1", role: "patient", name: "Test Patient" },
    } as never);
    vi.mocked(getPatientWithProfile).mockResolvedValue({
      id: "p1",
      name: "Test Patient",
      assignedNurseId: "n1",
      assignedDoctorId: "d1",
    } as never);
    vi.mocked(askGeminiAssistant).mockResolvedValue("Use rest and contact your clinician.");

    const result = await sendAssistantMessage("I feel dizzy");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.reply).toContain("rest");
    }
    expect(askGeminiAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "I feel dizzy",
        context: expect.arrayContaining([
          "Assigned nurse exists for this patient.",
          "Assigned doctor exists for this patient.",
          "Patient name: Test Patient.",
        ]),
      }),
    );
  });

  it("rejects access for non-patients", async () => {
    vi.mocked(getSessionOrThrow).mockResolvedValue({
      user: { id: "n1", role: "nurse", name: "Nurse" },
    } as never);

    const result = await sendAssistantMessage("Hello");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("forbidden");
    }
    expect(askGeminiAssistant).not.toHaveBeenCalled();
  });
});
