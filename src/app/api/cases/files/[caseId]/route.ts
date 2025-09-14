import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const caseExists = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
    });

    if (!caseExists) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    // Get files for this case
    const files = await prisma.caseFile.findMany({
      where: {
        caseId: caseId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        filename: true,
        filesize: true,
        mimetype: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      files: files.map((file) => ({
        id: file.id,
        filename: file.filename,
        filesize: file.filesize,
        mimetype: file.mimetype,
        uploadedAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get files" },
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
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      );
    }

    // Verify case ownership and file exists
    const file = await prisma.caseFile.findFirst({
      where: {
        id: fileId,
        caseId: caseId,
        case: {
          userId: session.user.id,
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    await prisma.caseFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
