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
    const validatedData = createCaseSchema.parse(body);

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

    const title =
      validatedData.title || `${caseType.title} case in ${country.name}`;

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
  }
}
