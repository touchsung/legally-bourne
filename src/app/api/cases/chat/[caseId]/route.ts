import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/app/api/cases/schema";
import OpenAI from "openai";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Country {
  code: string;
  name: string;
}

interface RouteParams {
  params: Promise<{
    caseId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { caseId } = await params;

    const caseWithMessages = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!caseWithMessages) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: {
        id: caseWithMessages.id,
        title: caseWithMessages.title,
        description: caseWithMessages.description,
        country: caseWithMessages.country,
        caseType: caseWithMessages.caseType,
        status: caseWithMessages.status,
        createdAt: caseWithMessages.createdAt,
        updatedAt: caseWithMessages.updatedAt,
        messages: caseWithMessages.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get case error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);
    const { caseId } = await params;

    const existingCase = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    await prisma.caseMessage.create({
      data: {
        caseId: caseId,
        role: "user",
        content: validatedData.message,
      },
    });

    const country = (countries as Country[]).find(
      (c) => c.code === existingCase.country
    );
    const caseType = caseTypes.find((c) => c.id === existingCase.caseType);

    if (!country || !caseType) {
      return NextResponse.json(
        { success: false, error: "Invalid case configuration" },
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

    const conversationMessages = [
      systemMessage,
      ...existingCase.messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: validatedData.message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: conversationMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message;

    if (!aiResponse?.content) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 }
      );
    }

    const assistantMessage = await prisma.caseMessage.create({
      data: {
        caseId: caseId,
        role: "assistant",
        content: aiResponse.content,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: assistantMessage.id,
        role: assistantMessage.role as "user" | "assistant",
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
