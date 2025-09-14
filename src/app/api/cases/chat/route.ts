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

    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful AI legal assistant for Legally Bourne. You are helping a user with their legal case in ${
        country.name
      }.

Case Details:
- Country/Jurisdiction: ${country.name}
- Case Type: ${caseType.title}
- Case Description: ${caseType.description}

Guidelines:
1. Provide legal guidance specific to ${country.name} jurisdiction
2. Focus on ${caseType.title.toLowerCase()} matters
3. Give practical, actionable advice
4. Ask clarifying questions to understand their specific situation
5. Suggest next steps they can take
6. Be empathetic and supportive
7. Always remind users that you provide general guidance, not formal legal advice
8. If the case is complex, suggest they consult with a qualified lawyer
9. Format your responses using markdown for better readability
10. Keep responses helpful but concise

Ask specific questions about their ${caseType.title.toLowerCase()} situation to provide more targeted assistance.`,
    };

    const openAIMessages = [systemMessage, ...messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: openAIMessages,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message;

    if (!response) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
