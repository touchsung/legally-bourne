import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caseId = formData.get("caseId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "Case ID is required" },
        { status: 400 }
      );
    }

    const caseExists = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: session.user.id,
      },
    });

    if (!caseExists) {
      return NextResponse.json(
        { success: false, error: "Case not found or access denied" },
        { status: 404 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "File type not supported" },
        { status: 400 }
      );
    }

    // Generate unique file path: userId/caseId/fileId/filename
    const fileId = crypto.randomUUID();
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${session.user.id}/${caseId}/${fileId}/${timestamp}-${sanitizedFilename}`;

    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("case-files")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    const fileRecord = await prisma.caseFile.create({
      data: {
        id: fileId,
        caseId: caseId,
        filename: sanitizedFilename,
        originalFilename: file.name,
        storagePath: uploadData.path,
        filesize: file.size,
        mimetype: file.type,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.originalFilename,
        filesize: fileRecord.filesize,
        mimetype: fileRecord.mimetype,
        uploadedAt: fileRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
