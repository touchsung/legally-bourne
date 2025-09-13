import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";

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

    const { messages, selectedCountry, selectedCaseType } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get case details
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

    // Create system message for summary generation
    const systemMessage = {
      role: "system" as const,
      content: `You are an AI assistant that analyzes legal conversations and creates structured summaries. 

Based on the conversation about a ${caseType.title} case in ${country.name}, create a JSON summary with this exact structure:

{
  "caseDescription": "Brief description of the legal issue (e.g., 'a payment dispute', 'an employment termination', 'a tenancy issue')",
  "timelineEvents": [
    {
      "date": "Date mentioned (e.g., 'June 1st', 'Last month', '3 weeks ago')",
      "description": "What happened",
      "type": "payment|communication|legal|deadline|other"
    }
  ],
  "keyPoints": [
    "Important facts or issues mentioned"
  ],
  "nextSteps": [
    "Recommended actions based on the conversation"
  ],
  "urgency": "low|medium|high"
}

Guidelines:
- Extract actual dates/timeframes mentioned in the conversation
- Focus on concrete facts and events
- Determine urgency based on deadlines, threats, or time-sensitive issues
- Keep descriptions concise and clear
- Only include information that was actually discussed

Return ONLY the JSON object, no additional text.`,
    };

    // Filter out system messages and get only user/assistant conversation
    const conversationMessages = messages.filter(
      (msg) => msg.role === "user" || msg.role === "assistant"
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...conversationMessages],
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent JSON output
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response
      const summary = JSON.parse(response);

      // Validate the structure
      const requiredFields = [
        "caseDescription",
        "timelineEvents",
        "keyPoints",
        "nextSteps",
        "urgency",
      ];
      const isValidStructure = requiredFields.every(
        (field) => field in summary
      );

      if (!isValidStructure) {
        throw new Error("Invalid summary structure");
      }

      return NextResponse.json({ summary });
    } catch (parseError) {
      console.error("Failed to parse summary JSON:", response);

      // Fallback summary if JSON parsing fails
      const fallbackSummary = {
        caseDescription: `a ${caseType.title.toLowerCase()} matter`,
        timelineEvents: [],
        keyPoints: ["Case details are being analyzed"],
        nextSteps: ["Continue providing more details about your situation"],
        urgency: "medium",
      };

      return NextResponse.json({ summary: fallbackSummary });
    }
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
