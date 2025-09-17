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
  id: z.string().optional(),
  date: z.string(),
  description: z.string(),
  type: z.enum([
    "payment",
    "communication",
    "legal",
    "deadline",
    "filing",
    "evidence",
    "negotiation",
    "other",
  ]),
  status: z
    .enum(["completed", "pending", "overdue", "upcoming"])
    .default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  daysFromNow: z.number().optional(),
});

export const evidenceItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum([
    "contracts",
    "communications",
    "financial_records",
    "identity_documents",
    "photos_videos",
    "witness_statements",
    "expert_reports",
    "government_documents",
    "receipts_invoices",
    "other",
  ]),
  description: z.string(),
  isRequired: z.boolean().default(false),
  isUploaded: z.boolean().default(false),
  uploadedFileIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
  priority: z.enum(["critical", "important", "helpful"]).default("important"),
});

export const legalAnalysisSchema = z.object({
  caseStrength: z.enum(["strong", "moderate", "weak", "unclear"]),
  keyLegalIssues: z.array(z.string()),
  relevantLaws: z.array(z.string()).optional(),
  potentialOutcomes: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  risks: z.array(z.string()).optional(),
  estimatedTimeframe: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export const caseSummarySchema = z.object({
  id: z.string(),
  caseId: z.string(),
  caseDescription: z.string(),
  legalAnalysis: legalAnalysisSchema,
  evidenceChecklist: z.array(evidenceItemSchema),
  nextCriticalDeadline: timelineEventSchema.optional(),
  timelineEvents: z.array(timelineEventSchema),
  urgency: z.enum(["low", "medium", "high"]),
  messageCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API request schemas
export const generateSummarySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  selectedCaseType: z.string(),
  selectedCountry: z.string(),
  caseId: z.string(),
  uploadedFiles: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        mimetype: z.string(),
      })
    )
    .optional(),
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
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type LegalAnalysis = z.infer<typeof legalAnalysisSchema>;
export type CaseSummary = z.infer<typeof caseSummarySchema>;
export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;
