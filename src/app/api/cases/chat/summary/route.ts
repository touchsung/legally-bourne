import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";
import { generateSummarySchema } from "@/app/api/cases/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Country {
  code: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateSummarySchema.parse(body);

    const {
      messages,
      selectedCountry,
      selectedCaseType,
      caseId,
      uploadedFiles,
    } = validatedData;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const country = (countries as Country[]).find(
      (c) => c.code === selectedCountry
    );
    const caseType = caseTypes.find((c) => c.id === selectedCaseType);

    if (!country || !caseType) {
      return NextResponse.json(
        { error: "Invalid case details" },
        { status: 400 }
      );
    }

    const fileContext =
      uploadedFiles && uploadedFiles.length > 0
        ? `\n\nUploaded files context: ${uploadedFiles
            .map((f) => `${f.filename} (${f.mimetype})`)
            .join(", ")}`
        : "";

    const systemMessage = {
      role: "system" as const,
      content: `You are an AI legal assistant analyzing a ${
        caseType.title
      } case in ${
        country.name
      } process on ${new Date().toISOString()}. Based on the conversation, create a comprehensive legal analysis with specific actionable insights.

CRITICAL: You must respond with ONLY a valid JSON object that matches this exact structure:

{
  "caseDescription": "Brief description of the legal issue (e.g., 'a payment dispute', 'an employment termination', 'a tenancy issue')",
  "legalAnalysis": {
    "caseStrength": "strong|moderate|weak|unclear",
    "keyLegalIssues": ["Issue 1", "Issue 2", "Issue 3"],
    "relevantLaws": ["Law/Regulation 1", "Law/Regulation 2"],
    "potentialOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
    "recommendedActions": ["Action 1", "Action 2", "Action 3"],
    "risks": ["Risk 1", "Risk 2"],
    "estimatedTimeframe": "2-6 months",
    "additionalInfo": "Additional context if needed"
  },
  "evidenceChecklist": [
    {
      "category": "contracts|communications|financial_records|identity_documents|photos_videos|witness_statements|expert_reports|government_documents|receipts_invoices|other",
      "description": "Description of what evidence is needed",
      "isRequired": true|false,
      "isUploaded": true|false,
      "uploadedFileIds": [],
      "notes": "Additional notes about this evidence",
      "priority": "critical|important|helpful"
    }
  ],
  "timelineEvents": [
    {
      "date": "Next week|In 3 days|2024-01-15|Today|Tomorrow",
      "description": "Next step the user should take (e.g., 'Contact a local attorney', 'File a formal complaint', 'Send demand letter')",
      "type": "legal|deadline|filing|evidence|negotiation|consultation",
      "status": "upcoming|pending",
      "priority": "high|medium|low",
      "daysFromNow": 3
    }
  ],
  "nextCriticalDeadline": {
    "date": "2024-01-20",
    "description": "Most urgent upcoming deadline or action needed",
    "type": "deadline|legal|filing",
    "status": "upcoming",
    "priority": "high",
    "daysFromNow": 7
  },
  "urgency": "low|medium|high",
  "messageCount": ${messages.length}
}

IMPORTANT GUIDELINES FOR TIMELINE:
- Focus on FUTURE actions and next steps, not past events
- Timeline should be a guidance roadmap of what the user should do next
- Include specific timeframes (e.g., "In 3 days", "Next week", "Within 30 days")
- Only include past events if they are relevant deadlines that have passed
- Prioritize actionable steps like: "Contact attorney", "File complaint", "Gather documents", "Send demand letter"
- Use realistic timeframes based on legal processes in ${country.name}
- Status should be "upcoming" or "pending" for future actions
- Calculate daysFromNow as positive numbers for future events

Guidelines for analysis:
- Assess case strength based on available facts and evidence quality
- Identify specific legal issues relevant to ${caseType.title} in ${
        country.name
      }
- Create practical evidence checklist based on case type and conversation
- Build actionable timeline with next steps and future guidance
- Provide jurisdiction-specific guidance for ${country.name}
- Focus on actionable, practical advice${fileContext}

Return ONLY the JSON object, no additional text.`,
    };

    const conversationMessages = messages.filter(
      (msg) => msg.role === "user" || msg.role === "assistant"
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...conversationMessages],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    let summary;
    try {
      summary = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    const requiredFields = [
      "caseDescription",
      "legalAnalysis",
      "evidenceChecklist",
      "timelineEvents",
      "urgency",
    ];

    const isValidStructure = requiredFields.every((field) => field in summary);

    if (!isValidStructure) {
      throw new Error("Invalid summary structure");
    }

    if (caseId && session.user.id) {
      try {
        const caseExists = await prisma.case.findFirst({
          where: {
            id: caseId,
            userId: session.user.id,
          },
        });

        if (caseExists) {
          const messageCount = await prisma.caseMessage.count({
            where: { caseId: caseId },
          });

          await prisma.caseSummary.deleteMany({
            where: { caseId: caseId },
          });

          await prisma.caseSummary.create({
            data: {
              caseId: caseId,
              caseDescription: summary.caseDescription,
              legalAnalysis: summary.legalAnalysis,
              evidenceChecklist: summary.evidenceChecklist,
              nextCriticalDeadline: summary.nextCriticalDeadline || null,
              timelineEvents: summary.timelineEvents,
              urgency: summary.urgency,
              messageCount: messageCount,
            },
          });
        }
      } catch (dbError) {
        console.error("Failed to save summary to database:", dbError);
      }
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
