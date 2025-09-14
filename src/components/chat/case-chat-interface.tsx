// src/components/chat/case-chat-interface.tsx - Simplified without top file panel
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/types/chat";
import { ChatMessageItem } from "@/components/chat/chat-message-item";
import { ChatInput } from "@/components/chat/chat-input";
import { QuickReferences } from "@/components/chat/quick-references";
import { AISummary } from "@/components/chat/ai-summary";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { CaseSummary, SendMessageInput } from "@/app/api/cases/schema";

interface Country {
  code: string;
  name: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  filesize: number;
  mimetype: string;
  uploadedAt: Date;
}

interface CaseData {
  id: string;
  title: string;
  description: string | null;
  country: string;
  caseType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
  }>;
}

interface CaseChatInterfaceProps {
  caseData: CaseData;
}

interface SendMessageWithFilesInput extends SendMessageInput {
  fileIds?: string[];
}

export function CaseChatInterface({ caseData }: CaseChatInterfaceProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReferences, setShowQuickReferences] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [summaryData, setSummaryData] = useState<CaseSummary | null>(null);

  const selectedCase = caseTypes.find((type) => type.id === caseData.caseType);
  const selectedCountryData = (countries as Country[]).find(
    (country) => country.code === caseData.country
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  interface FileFromAPI {
    id: string;
    filename: string;
    filesize: number;
    mimetype: string;
    uploadedAt: string; // API returns date as string
  }

  interface FilesAPIResponse {
    success: boolean;
    files: FileFromAPI[];
  }

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/files/${caseData.id}`);

      if (response.ok) {
        const result: FilesAPIResponse = await response.json();
        if (result.success) {
          setUploadedFiles(
            result.files.map((file: FileFromAPI) => ({
              ...file,
              uploadedAt: new Date(file.uploadedAt),
            }))
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  }, [caseData.id]);

  const generateSummary = useCallback(
    async (messagesToSummarize: ChatMessage[]) => {
      try {
        const response = await fetch("/api/cases/chat/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messagesToSummarize.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            selectedCaseType: caseData.caseType,
            selectedCountry: caseData.country,
            caseId: caseData.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSummaryData(data.summary);
        }
      } catch (error) {
        console.error("Failed to generate summary:", error);
      }
    },
    [caseData.id, caseData.caseType, caseData.country]
  );

  useEffect(() => {
    const convertedMessages: ChatMessage[] = caseData.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
    }));

    setMessages(convertedMessages);

    const hasUserMessages = convertedMessages.some(
      (msg) => msg.role === "user"
    );
    setShowQuickReferences(!hasUserMessages);

    fetchFiles();
  }, [caseData, fetchFiles]);

  useEffect(() => {
    if (messages.length > 2) {
      void generateSummary(messages);
    }
  }, [messages, generateSummary]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, fileIds?: string[]) => {
    if (!session?.user) {
      toast.error("Please sign in to continue");
      return;
    }

    if (!content.trim() && (!fileIds || fileIds.length === 0)) {
      toast.error("Please enter a message or attach files");
      return;
    }

    setShowQuickReferences(false);

    let displayContent = content || "Analyzing attached documents...";
    if (fileIds && fileIds.length > 0) {
      const attachedFileNames = fileIds
        .map((fileId) => {
          const file = uploadedFiles.find((f) => f.id === fileId);
          return file ? file.filename : "Unknown file";
        })
        .join(", ");

      if (content.trim()) {
        displayContent += `\n\n📎 Attached: ${attachedFileNames}`;
      } else {
        displayContent = `📎 Analyzing documents: ${attachedFileNames}`;
      }
    }

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: displayContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const messageData: SendMessageWithFilesInput = {
        message: content || "Please analyze these documents:",
        fileIds: fileIds || [],
      };

      const response = await fetch(`/api/cases/chat/${caseData.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      const assistantMessage: ChatMessage = {
        id: result.message.id,
        role: result.message.role,
        content: result.message.content,
        timestamp: new Date(result.message.createdAt),
      };

      setMessages((prev) => {
        const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp-"));
        const realUserMessage = {
          ...userMessage,
          id: `user-${Date.now()}`,
        };
        return [...withoutTemp, realUserMessage, assistantMessage];
      });

      if (fileIds && fileIds.length > 0) {
        toast.success(`Analyzed ${fileIds.length} document(s) successfully`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelection = () => {
    router.push("/chat");
  };

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles((prev) => [file, ...prev]);
  };

  const availableFiles = uploadedFiles.map((file) => ({
    id: file.id,
    filename: file.filename,
    mimetype: file.mimetype,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-50 p-3 md:p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSelection}
              className="p-2 hover:bg-blue-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                {caseData.title}
              </h3>
              <p className="text-xs text-gray-600">
                {selectedCase?.title} • {selectedCountryData?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              className="p-2 h-auto hover:bg-blue-100 flex items-center space-x-1"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 hidden sm:inline">
                Summary
              </span>
              {isSummaryCollapsed ? (
                <ChevronDown className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronUp className="w-4 h-4 text-blue-600" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Panel */}
      {!isSummaryCollapsed && (
        <div className="flex-shrink-0 border-b border-gray-100 bg-blue-50/50 max-h-60 overflow-y-auto">
          <AISummary summaryData={summaryData} />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 min-h-0">
        {messages.length <= 1 && showQuickReferences && (
          <QuickReferences
            selectedCaseType={caseData.caseType}
            onQuestionSelect={(question) => handleSendMessage(question)}
            isVisible={showQuickReferences}
          />
        )}

        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            userImage={session?.user?.image}
            userName={session?.user?.name}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">AI</span>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Chat Input with Integrated File Upload */}
      <div className="flex-shrink-0">
        <ChatInput
          caseId={caseData.id}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!session?.user}
          availableFiles={availableFiles}
          onFileUploaded={handleFileUploaded}
        />
      </div>
    </div>
  );
}
