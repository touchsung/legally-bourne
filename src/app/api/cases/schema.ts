import { z } from "zod";

export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  country: z.string().min(2, "Country code is required"),
  caseType: z.string().min(1, "Case type is required"),
});

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message too long"),
});

export const caseResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  country: z.string(),
  caseType: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const messageResponseSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.date(),
});

export const timelineEventSchema = z.object({
  date: z.string(),
  description: z.string(),
  type: z.enum(["payment", "communication", "legal", "deadline", "other"]),
});

export const caseSummarySchema = z.object({
  id: z.string(),
  caseId: z.string(),
  caseDescription: z.string(),
  timelineEvents: z.array(timelineEventSchema),
  keyPoints: z.array(z.string()),
  nextSteps: z.array(z.string()),
  urgency: z.enum(["low", "medium", "high"]),
  messageCount: z.number(),
  createdAt: z.date(),
});

export const getCaseResponseSchema = z.object({
  success: z.boolean(),
  case: caseResponseSchema.extend({
    messages: z.array(messageResponseSchema),
    summary: caseSummarySchema.nullable().optional(),
  }),
  error: z.string().optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CaseResponse = z.infer<typeof caseResponseSchema>;
export type GetCaseResponse = z.infer<typeof getCaseResponseSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type CaseSummary = z.infer<typeof caseSummarySchema>;
