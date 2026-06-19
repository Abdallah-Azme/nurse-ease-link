import "server-only";

import { z } from "zod";

const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(
              z.object({
                text: z.string().optional(),
              }),
            ),
          })
          .optional(),
      }),
    )
    .default([]),
});

const SAFETY_PROMPT = [
  "You are CareConnect's patient education assistant for a healthcare app.",
  "You must be supportive, concise, and medically cautious.",
  "Only provide general educational information and navigation help.",
  "Do not diagnose, prescribe, change medication doses, or claim certainty about symptoms.",
  "If the user describes urgent symptoms, tell them to contact their care team or emergency services immediately.",
  "If the user asks for something beyond general education, recommend speaking with a clinician.",
].join(" ");

const DEFAULT_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"];

export type GeminiAssistantInput = {
  message: string;
  context?: string[];
};

function buildPrompt(message: string, context: string[] = []) {
  const lines = [
    SAFETY_PROMPT,
    context.length ? `Relevant platform context:\n- ${context.join("\n- ")}` : "",
    `User message: ${message}`,
    "Reply in plain language with 4 to 6 sentences, include practical detail, and add one safety note if needed.",
  ].filter(Boolean);

  return lines.join("\n\n");
}

async function callGemini(apiKey: string, model: string, input: GeminiAssistantInput) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SAFETY_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(input.message, input.context) }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`.trim());
    }

    const data = geminiResponseSchema.parse(await response.json());
    const text = data.candidates
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text?.trim())
      .find((value): value is string => Boolean(value));

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function askGeminiAssistant(input: GeminiAssistantInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const preferredModel = process.env.GEMINI_MODEL || DEFAULT_MODELS[0];
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const models = [preferredModel, ...DEFAULT_MODELS.filter((model) => model !== preferredModel)];
  let lastError = "Gemini request failed.";

  for (const model of models) {
    try {
      return await callGemini(apiKey, model, input);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      const transient =
        lastError.includes("503") || lastError.includes("429") || lastError.includes("aborted");
      if (!transient) break;
    }
  }

  throw new Error(lastError);
}
