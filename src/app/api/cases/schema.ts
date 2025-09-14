import { z } from "zod";

// Create case validation schema
export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  country: z.string().min(2, "Country code is required"),
  caseType: z.string().min(1, "Case type is required"),
});

// Chat message validation schema
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content is required"),
});

// Send message validation schema
export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message too long"),
});

// Case response schema
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

// Message response schema
export const messageResponseSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.date(),
});

// Case summary validation schemas
export const timelineEventSchema = z.object({
  date: z.string(),
  description: z.string(),
  type: z.enum(["payment", "communication", "legal", "deadline", "other"]),
});

export const caseSummaryDataSchema = z.object({
  caseDescription: z.string(),
  timelineEvents: z.array(timelineEventSchema),
  keyPoints: z.array(z.string()),
  nextSteps: z.array(z.string()),
  urgency: z.enum(["low", "medium", "high"]),
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

// API response schemas
export const createCaseResponseSchema = z.object({
  success: z.boolean(),
  case: caseResponseSchema,
  error: z.string().optional(),
});

export const getCaseResponseSchema = z.object({
  success: z.boolean(),
  case: caseResponseSchema.extend({
    messages: z.array(messageResponseSchema),
  }),
  error: z.string().optional(),
});

export const sendMessageResponseSchema = z.object({
  success: z.boolean(),
  message: messageResponseSchema,
  error: z.string().optional(),
});

export const getLastSummaryResponseSchema = z.object({
  success: z.boolean(),
  summary: caseSummarySchema.nullable(),
  error: z.string().optional(),
});

// Type exports
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CaseResponse = z.infer<typeof caseResponseSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type CreateCaseResponse = z.infer<typeof createCaseResponseSchema>;
export type GetCaseResponse = z.infer<typeof getCaseResponseSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type CaseSummaryData = z.infer<typeof caseSummaryDataSchema>;
export type CaseSummary = z.infer<typeof caseSummarySchema>;
export type GetLastSummaryResponse = z.infer<
  typeof getLastSummaryResponseSchema
>;
