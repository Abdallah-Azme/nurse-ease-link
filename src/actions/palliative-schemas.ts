import { z } from "zod";

export const symptomSchema = z.object({
  pain: z.coerce.number().int().min(0).max(10),
  nausea: z.coerce.number().int().min(0).max(10),
  fatigue: z.coerce.number().int().min(0).max(10),
  appetite: z.coerce.number().int().min(0).max(10),
  sleep: z.coerce.number().int().min(0).max(10),
  anxiety: z.coerce.number().int().min(0).max(10),
  breathlessness: z.coerce.number().int().min(0).max(10),
  notes: z.string().max(500).optional().default(""),
});

export const carePlanSchema = z.object({
  patientId: z.string().min(1),
  summary: z.string().min(1).max(500),
  nextReviewAt: z.coerce.date().optional(),
  interventions: z.array(z.string().min(1)).min(1),
  caregiverNotes: z.string().max(500).optional(),
  goals: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        details: z.string().min(1).max(300),
      }),
    )
    .min(1),
});

export const visitSchema = z.object({
  patientId: z.string().min(1),
  staffName: z.string().min(1).max(120),
  scheduledAt: z.coerce.date(),
  type: z.enum(["home_visit", "phone_followup", "video_call"]),
  reason: z.string().min(1).max(300),
});

export const communicationSchema = z.object({
  patientId: z.string().min(1),
  authorName: z.string().min(1).max(120),
  channel: z.enum(["call", "chat", "visit", "note"]),
  summary: z.string().min(1).max(500),
});

export const outcomeSchema = z.object({
  patientId: z.string().min(1),
  symptomScore: z.coerce.number().int().min(0).max(100),
  adherenceScore: z.coerce.number().int().min(0).max(100),
  qualityOfLifeScore: z.coerce.number().int().min(0).max(100),
  alertCount: z.coerce.number().int().min(0).max(100),
});
