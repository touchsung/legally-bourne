"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/types/chat";
import { ChatMessageItem } from "@/components/chat/chat-message-item";
import { ChatInput } from "@/components/chat/chat-input";
import { QuickReferences } from "@/components/chat/quick-references";
import { CaseSummary } from "@/components/chat/case-summary";
import { toast } from "sonner";
import { FileText, X, Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CaseSummary as CaseSummaryType,
  SendMessageInput,
} from "@/app/api/cases/schema";
import { useRouter } from "next/navigation";

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
  summary?: CaseSummaryType;
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
  const [summaryData, setSummaryData] = useState<CaseSummaryType | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGenerating = useRef(false);
  const router = useRouter();
  const isFreshCase = messages.length === 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/files/${caseData.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUploadedFiles(
            result.files.map(
              (file: { uploadedAt: string | number | Date }) => ({
                ...file,
                uploadedAt: new Date(file.uploadedAt),
              })
            )
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  }, [caseData.id]);

  const generateSummary = async (messagesToSummarize: ChatMessage[]) => {
    if (isGenerating.current) return;

    try {
      setIsGeneratingSummary(true);
      isGenerating.current = true;

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
          uploadedFiles: uploadedFiles.map((f) => ({
            id: f.id,
            filename: f.filename,
            mimetype: f.mimetype,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryData(data.summary);
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setIsGeneratingSummary(false);
      isGenerating.current = false;
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

        setTimeout(() => {
          generateSummary(newMessages);
        }, 1000);

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
    setTimeout(() => {
      generateSummary(messages);
    }, 500);
  };

  const handleFileUploadTrigger = () => {
    const chatInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (chatInput) {
      chatInput.click();
    }
  };

  const availableFiles = uploadedFiles.map((file) => ({
    id: file.id,
    filename: file.filename,
    mimetype: file.mimetype,
  }));

  const handleBackToSelection = () => {
    router.push("/chat");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-3 lg:gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0">
        {/* Chat Header */}
        <div className="bg-blue-50 p-3 sm:p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  AI
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">
                  Legal Assistant Chat
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {selectedCase?.title} • {selectedCountryData?.name}
                </p>
              </div>
            </div>

            {/* Mobile Summary Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummaryPanel(!showSummaryPanel)}
              className="lg:hidden ml-2 p-2"
            >
              {showSummaryPanel ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
          {isFreshCase && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Help with Your {selectedCase?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Describe your situation below and I&apos;ll provide legal
                  guidance specific to {selectedCountryData?.name}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    Quick Start Tips:
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Be specific about dates and events</li>
                    <li>• Upload relevant documents if available</li>
                    <li>• Mention any deadlines you&apos;re facing</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
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
            <div className="flex gap-2 sm:gap-3 justify-start">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">AI</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2">
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

        {/* Input Area */}
        <div className="flex-shrink-0">
          <ChatInput
            caseId={caseData.id}
            caseType={caseData.caseType}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!session?.user}
            availableFiles={availableFiles}
            onFileUploaded={handleFileUploaded}
          />
        </div>
      </div>

      {/* Summary Panel - Desktop: Always visible, Mobile: Overlay */}
      <div
        className={`
          fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto
          lg:w-80 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col
          transition-transform duration-300 ease-in-out
          ${
            showSummaryPanel
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Summary Header */}
        <div className="p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Legal Case Summary
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {isGeneratingSummary && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummaryPanel(false)}
                className="lg:hidden p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <div className="flex-1 overflow-y-auto">
          <CaseSummary
            summaryData={summaryData}
            onFileUpload={handleFileUploadTrigger}
          />
        </div>
      </div>

      {/* Overlay for mobile summary panel */}
      {showSummaryPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSummaryPanel(false)}
        />
      )}
    </div>
  );
}
