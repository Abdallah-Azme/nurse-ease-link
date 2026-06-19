import { afterEach, describe, expect, it, vi } from "vitest";

import { askGeminiAssistant } from "@/lib/gemini-assistant";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("gemini assistant", () => {
  it("returns the first text reply from Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: "Gemini reply" }],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    await expect(askGeminiAssistant({ message: "Hello" })).resolves.toBe("Gemini reply");
  });

  it("fails clearly when the api key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(askGeminiAssistant({ message: "Hello" })).rejects.toThrow(
      "Gemini API key is missing.",
    );
  });
});
