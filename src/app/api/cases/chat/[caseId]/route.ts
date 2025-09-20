import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/app/api/cases/schema";
import OpenAI from "openai";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Country {
  code: string;
  name: string;
}

interface RouteParams {
  params: Promise<{
    caseId: string;
  }>;
}

const sendMessageWithFilesSchema = sendMessageSchema.extend({
  fileIds: z.array(z.string()).optional(),
});

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
        files: {
          select: {
            id: true,
            filename: true,
            originalFilename: true,
            filesize: true,
            mimetype: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        summaries: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!caseWithMessages) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    // Get the latest summary if it exists
    const latestSummary = caseWithMessages.summaries[0];

    // Transform summary data to match the expected format
    const summaryData = latestSummary
      ? {
          id: latestSummary.id,
          caseId: latestSummary.caseId,
          caseDescription: latestSummary.caseDescription,
          legalAnalysis: latestSummary.legalAnalysis,
          evidenceChecklist: Array.isArray(latestSummary.evidenceChecklist)
            ? latestSummary.evidenceChecklist
            : [],
          nextCriticalDeadline: latestSummary.nextCriticalDeadline,
          timelineEvents: Array.isArray(latestSummary.timelineEvents)
            ? latestSummary.timelineEvents
            : [],
          urgency: latestSummary.urgency as "low" | "medium" | "high",
          messageCount: latestSummary.messageCount,
          createdAt: latestSummary.createdAt,
          updatedAt: latestSummary.updatedAt,
        }
      : null;

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
        messages: caseWithMessages.messages.map(
          (msg: {
            id: string;
            role: string;
            content: string;
            createdAt: Date;
          }) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            createdAt: msg.createdAt,
          })
        ),
        files: caseWithMessages.files.map(
          (file: {
            id: string;
            originalFilename: string;
            filename: string;
            filesize: number;
            mimetype: string;
            createdAt: Date;
          }) => ({
            id: file.id,
            filename: file.originalFilename || file.filename,
            filesize: file.filesize,
            mimetype: file.mimetype,
            uploadedAt: file.createdAt,
          })
        ),
        summary: summaryData,
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

async function downloadFileFromStorage(
  storagePath: string
): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from("case-files")
    .download(storagePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return await data.arrayBuffer();
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const bufferData = Buffer.from(buffer);
    const text = bufferData.toString("latin1");

    const textRegex = /BT\s*(.*?)\s*ET/g;
    const matches: string[] = [];
    let match;

    while ((match = textRegex.exec(text)) !== null) {
      matches.push(match[0]);
    }

    let extractedText = "";

    matches.forEach((matchText) => {
      const textCommands = matchText.match(/\((.*?)\)\s*T[jJ]/g);
      if (textCommands) {
        textCommands.forEach((cmd) => {
          const textContent = cmd.match(/\((.*?)\)/);
          if (textContent && textContent[1]) {
            extractedText += textContent[1] + " ";
          }
        });
      }

      const showTextRegex = /\[(.*?)\]\s*TJ/g;
      let showTextMatch;
      while ((showTextMatch = showTextRegex.exec(matchText)) !== null) {
        const textArray = showTextMatch[1];
        const stringMatches = textArray.match(/\((.*?)\)/g);
        if (stringMatches) {
          stringMatches.forEach((str) => {
            const content = str.replace(/[()]/g, "");
            if (content.trim()) {
              extractedText += content + " ";
            }
          });
        }
      }
    });

    if (extractedText.length < 100) {
      const simpleTextRegex = /\((.*?)\)/g;
      let simpleMatch;

      while ((simpleMatch = simpleTextRegex.exec(text)) !== null) {
        const content = simpleMatch[1].trim();
        if (content.length > 2 && /[a-zA-Z]/.test(content)) {
          extractedText += content + " ";
        }
      }
    }

    return extractedText
      .replace(/\s+/g, " ")
      .replace(/([.!?])\s+([A-Z])/g, "$1\n\n$2")
      .trim();
  } catch {
    throw new Error("PDF text extraction failed");
  }
}

async function extractWordText(buffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const bufferData = Buffer.from(buffer);
    const result = await mammoth.extractRawText({ buffer: bufferData });
    return result.value;
  } catch {
    throw new Error("Word document text extraction failed");
  }
}

async function processFileContent(
  storagePath: string,
  mimetype: string,
  filename: string
) {
  try {
    const fileBuffer = await downloadFileFromStorage(storagePath);

    if (mimetype === "application/pdf") {
      try {
        const text = await extractPdfText(fileBuffer);

        if (!text.trim() || text.length < 50) {
          return {
            type: "text" as const,
            text: `📄 **${filename}** (PDF Document)

⚠️ **Limited PDF Content Extracted**
I can see this PDF was uploaded, but only minimal text could be extracted. This often happens with:
- Scanned documents or image-based PDFs
- PDFs with complex formatting or special fonts
- Forms, tables, or documents with mostly visual content

**To help you better:**
1. **Copy and paste** key sections you want me to analyze
2. **Convert to images** (JPG/PNG) for visual analysis of forms or contracts
3. **Tell me specifically** what you need help with from this document

I'm ready to provide detailed legal analysis once I can access the content!`,
          };
        }

        return {
          type: "text" as const,
          text: `📄 **DOCUMENT: ${filename}**

${text}

--- END OF PDF DOCUMENT ---`,
        };
      } catch {
        return {
          type: "text" as const,
          text: `📄 **${filename}** (PDF Document)

⚠️ **Could Not Read PDF Content**
I can see this PDF was uploaded, but I'm unable to extract its text automatically.

**This could be because:**
- The PDF contains scanned images rather than searchable text
- The document uses complex formatting or is password protected
- It contains mostly forms, tables, or visual elements

**How to proceed:**
1. **Copy key sections** from the PDF and paste them in your message
2. **Describe the document type** (contract, agreement, notice, etc.) and your concerns
3. **Convert to images** if you need me to analyze forms or visual content visually

I'm here to provide detailed legal guidance once I can access the content!`,
        };
      }
    }

    if (
      mimetype.includes("document") ||
      mimetype.includes("wordprocessingml")
    ) {
      try {
        const text = await extractWordText(fileBuffer);
        return {
          type: "text" as const,
          text: `📄 **DOCUMENT: ${filename}**

${text}

--- END OF WORD DOCUMENT ---`,
        };
      } catch {
        return {
          type: "text" as const,
          text: `📄 **${filename}** (Word Document)

⚠️ Could not extract text from this Word document. Please copy and paste the relevant sections you'd like me to analyze.`,
        };
      }
    }

    if (mimetype === "text/plain") {
      const text = new TextDecoder().decode(fileBuffer);
      return {
        type: "text" as const,
        text: `📝 **DOCUMENT: ${filename}**

${text}

--- END OF TEXT DOCUMENT ---`,
      };
    }

    if (mimetype.startsWith("image/")) {
      const base64 = Buffer.from(fileBuffer).toString("base64");
      return {
        type: "image_url" as const,
        image_url: {
          url: `data:${mimetype};base64,${base64}`,
          detail: "high" as const,
        },
      };
    }

    const fileSizeKB = Math.round(fileBuffer.byteLength / 1024);
    return {
      type: "text" as const,
      text: `📎 **${filename}** (${mimetype}, ${fileSizeKB} KB)

File uploaded successfully. Please describe the key contents you'd like me to analyze for your legal case.`,
    };
  } catch {
    return {
      type: "text" as const,
      text: `❌ **Error processing ${filename}**

Failed to download or process this file. Please try uploading again or describe the key contents you need help with.`,
    };
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
    const validatedData = sendMessageWithFilesSchema.parse(body);
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
        files: {
          select: {
            id: true,
            filename: true,
            originalFilename: true,
            storagePath: true,
            mimetype: true,
          },
          where: validatedData.fileIds
            ? {
                id: { in: validatedData.fileIds },
              }
            : undefined,
          orderBy: {
            createdAt: "desc",
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

    const messageContent: Array<OpenAI.Chat.Completions.ChatCompletionContentPart> =
      [
        {
          type: "text",
          text: validatedData.message,
        },
      ];

    let hasImages = false;

    if (
      validatedData.fileIds &&
      validatedData.fileIds.length > 0 &&
      existingCase.files.length > 0
    ) {
      for (const file of existingCase.files.slice(0, 4)) {
        const processedContent = await processFileContent(
          file.storagePath,
          file.mimetype,
          file.originalFilename || file.filename
        );

        messageContent.push(processedContent);

        if (processedContent.type === "image_url") {
          hasImages = true;
        }
      }
    }

    const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam =
      {
        role: "system",
        content: `You are a helpful AI legal assistant for ${caseType.title} cases in ${country.name}.

**CRITICAL RULES:**

1. **Keep it SHORT** - Most responses should be 3-5 sentences
2. **Use simple language** - No legal jargon, explain like talking to a friend
3. **ONE main point per response** - Don't overwhelm with information
4. **Ask follow-up questions** - Let the conversation flow naturally

**RESPONSE FORMAT:**

✅ **DO:**
- Write in short paragraphs (1-3 sentences each)
- Use simple formatting (occasional **bold** for emphasis)
- Give ONE clear next step
- Sound like a knowledgeable friend, not a lawyer

❌ **DON'T:**
- Use headers (##) or complex markdown
- Write long bullet point lists
- Use excessive emojis
- Give multiple action steps at once
- Write more than 150 words unless absolutely necessary

**EXAMPLES:**

BAD (too formal, too long):
"## Your Rights Regarding Security Deposits

**Overview:**
In ${country.name}, landlords are required by law to...

**Action Steps:**
1. First, you should...
2. Then, proceed to...
3. Finally, consider..."

GOOD (conversational, concise):
"I understand you're worried about getting your deposit back. In ${country.name}, landlords must return it within 14 days unless there's damage.

Here's what to do: Send your landlord a written request for the deposit with photos showing the apartment's condition. If they don't respond in 5 days, you can file a complaint with the Rental Dispute Center.

Have you documented the apartment's condition when you left?"

**TONE:**
- Warm and supportive
- Confident but humble
- Conversational, not clinical
- Reassuring without over-promising

**KEY PRINCIPLES:**
- Prioritize clarity over completeness
- Break complex topics into multiple exchanges
- Always end with a question or clear next step
- Adapt response length to question complexity

For ${country.name} specifically:
- Reference local authorities naturally (e.g., "the Ministry of Labor" not "relevant government bodies")
- Give realistic timeframes
- Mention costs when relevant

Remember: Users want quick answers they can act on, not legal essays. Keep responses tight and conversational.`,
      };
    const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        systemMessage,
        ...existingCase.messages.map(
          (msg: { role: string; content: string }) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })
        ),
        {
          role: "user" as const,
          content: messageContent,
        },
      ];

    const modelToUse = hasImages
      ? "gpt-4-vision-preview"
      : "gpt-4-turbo-preview";

    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: conversationMessages,
      max_tokens: hasImages ? 2500 : 2000,
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
