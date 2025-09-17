"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/types/chat";
import { ChatMessageItem } from "@/components/chat/chat-message-item";
import { ChatInput } from "@/components/chat/chat-input";
import { QuickReferences } from "@/components/chat/quick-references";
import { AISummary } from "@/components/chat/ai-summary";
import { toast } from "sonner";
import { FileText, MessageCircle } from "lucide-react";
import type { CaseSummary, SendMessageInput } from "@/app/api/cases/schema";

interface Country {
  code: string;
  name: string;
}

interface CaseType {
  id: string;
  title: string;
  description: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  filesize: number;
  mimetype: string;
  uploadedAt: Date;
}

// Enhanced CaseData interface to include summary from database
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
  summary?: CaseSummary | null;
}

interface CaseChatInterfaceProps {
  caseData: CaseData;
  selectedCase?: CaseType | null;
  selectedCountryData?: Country | null;
}

interface SendMessageWithFilesInput extends SendMessageInput {
  fileIds?: string[];
}

export function CaseChatInterface({
  caseData,
  selectedCase,
  selectedCountryData,
}: CaseChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReferences, setShowQuickReferences] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [summaryData, setSummaryData] = useState<CaseSummary | null>(null);
  const isGenerating = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  interface FileFromAPI {
    id: string;
    filename: string;
    filesize: number;
    mimetype: string;
    uploadedAt: string;
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

  const generateSummary = async (messagesToSummarize: ChatMessage[]) => {
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
  };

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

    if (caseData.summary) {
      setSummaryData(caseData.summary);
    }

    fetchFiles();
  }, [caseData, fetchFiles]);

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

        const newMessages = [...withoutTemp, realUserMessage, assistantMessage];

        if (!isGenerating.current) {
          isGenerating.current = true;
          generateSummary(newMessages).finally(() => {
            isGenerating.current = false;
          });
        }
        return newMessages;
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

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles((prev) => [file, ...prev]);
  };

  const availableFiles = uploadedFiles.map((file) => ({
    id: file.id,
    filename: file.filename,
    mimetype: file.mimetype,
  }));

  return (
    <div className="flex h-full gap-6">
      {/* Left Side - Chat */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="bg-blue-50 p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Quick Chat with Legal Assistant
              </h3>
              <p className="text-sm text-gray-600">
                {selectedCase?.title} • {selectedCountryData?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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

      <div className="w-80 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Case Summary</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {summaryData ? (
            <AISummary summaryData={summaryData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Case Summary</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Keep chatting to build your case summary
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
