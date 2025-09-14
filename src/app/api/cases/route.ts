import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCaseSchema } from "@/app/api/cases/schema";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";
import { z } from "zod";

interface Country {
  code: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createCaseSchema.parse(body);

    // Verify country and case type exist
    const country = (countries as Country[]).find(
      (c) => c.code === validatedData.country
    );
    const caseType = caseTypes.find((c) => c.id === validatedData.caseType);

    if (!country || !caseType) {
      return NextResponse.json(
        { success: false, error: "Invalid country or case type" },
        { status: 400 }
      );
    }

    // Generate case title if not provided
    const title =
      validatedData.title || `${caseType.title} case in ${country.name}`;

    // Create case in database
    const newCase = await prisma.case.create({
      data: {
        userId: session.user.id,
        title,
        description: validatedData.description || caseType.description,
        country: validatedData.country,
        caseType: validatedData.caseType,
        status: "active",
      },
    });

    // Create initial welcome message
    const welcomeMessage = `Hello! I understand you need help with **${caseType.title}** in **${country.name}**.

I'm here to provide legal guidance specific to your situation. To better assist you, could you please tell me more about your specific circumstances?

For example:
- What exactly happened?
- When did this occur?
- Have you taken any steps already?
- What outcome are you hoping to achieve?

Please note that I provide general legal guidance, not formal legal advice. For complex matters, I may recommend consulting with a qualified lawyer.`;

    await prisma.caseMessage.create({
      data: {
        caseId: newCase.id,
        role: "assistant",
        content: welcomeMessage,
      },
    });

    return NextResponse.json({
      success: true,
      case: {
        id: newCase.id,
        title: newCase.title,
        description: newCase.description,
        country: newCase.country,
        caseType: newCase.caseType,
        status: newCase.status,
        createdAt: newCase.createdAt,
        updatedAt: newCase.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create case error:", error);

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
