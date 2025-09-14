import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    caseId: string;
  }>;
}

const updateCaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  status: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { caseId } = await params;
    const body = await request.json();

    const validatedData = updateCaseSchema.parse(body);

    // Check if the case exists and belongs to the user
    const existingCase = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: caseId,
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      case: {
        id: updatedCase.id,
        title: updatedCase.title,
        description: updatedCase.description,
        country: updatedCase.country,
        caseType: updatedCase.caseType,
        status: updatedCase.status,
        createdAt: updatedCase.createdAt,
        updatedAt: updatedCase.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update case error:", error);

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

    const caseData = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
      include: {
        summaries: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: {
        id: caseData.id,
        title: caseData.title,
        description: caseData.description,
        country: caseData.country,
        caseType: caseData.caseType,
        status: caseData.status,
        createdAt: caseData.createdAt,
        updatedAt: caseData.updatedAt,
        summaries: caseData.summaries,
        _count: caseData._count,
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { caseId } = await params;

    const existingCase = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    // Delete case (cascade will handle related records)
    await prisma.case.delete({
      where: {
        id: caseId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    console.error("Delete case error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
