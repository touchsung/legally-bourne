"use client";

import { useState, useEffect, useRef } from "react";
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
import type { SendMessageInput } from "@/app/api/cases/schema";

interface Country {
  code: string;
  name: string;
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

export function CaseChatInterface({ caseData }: CaseChatInterfaceProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReferences, setShowQuickReferences] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [summaryData, setSummaryData] = useState(null);

  const getSelectedCaseType = () => {
    return caseTypes.find((type) => type.id === caseData.caseType);
  };

  const getSelectedCountry = () => {
    return (countries as Country[]).find(
      (country) => country.code === caseData.country
    );
  };

  const selectedCase = getSelectedCaseType();
  const selectedCountryData = getSelectedCountry();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateSummary = async (messagesToSummarize: ChatMessage[]) => {
    try {
      const response = await fetch("/api/chat/summary", {
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
    // Convert case messages to ChatMessage format
    const convertedMessages: ChatMessage[] = caseData.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
    }));

    setMessages(convertedMessages);

    // Hide quick references if there are user messages
    const hasUserMessages = convertedMessages.some(
      (msg) => msg.role === "user"
    );
    setShowQuickReferences(!hasUserMessages);

    // Generate summary if there are multiple messages
    if (convertedMessages.length > 2) {
      generateSummary(convertedMessages);
    }
  }, [caseData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!session?.user) {
      toast.error("Please sign in to continue");
      return;
    }

    // Hide quick references once user starts chatting
    setShowQuickReferences(false);

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const messageData: SendMessageInput = {
        message: content,
      };

      const response = await fetch(`/api/chat/${caseData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      const assistantMessage: ChatMessage = {
        id: result.message.id,
        role: result.message.role,
        content: result.message.content,
        timestamp: new Date(result.message.createdAt),
      };

      // Replace temp user message with real one and add assistant message
      setMessages((prev) => {
        const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp-"));
        const realUserMessage = {
          ...userMessage,
          id: `user-${Date.now()}`, // Give it a real ID
        };
        return [...withoutTemp, realUserMessage, assistantMessage];
      });

      // Generate summary after a few messages
      const totalMessages = messages.length + 2;
      if (totalMessages > 2) {
        const allMessages = [...messages, userMessage, assistantMessage];
        generateSummary(allMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );

      // Remove the failed message
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelection = () => {
    router.push("/chat");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      {/* Chat Header */}
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

          {/* Summary Toggle - Always visible in header */}
          {
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
          }
        </div>
      </div>

      {/* AI Summary Section - Shows first, collapsible */}
      {!isSummaryCollapsed && (
        <div className="flex-shrink-0 border-b border-gray-100 bg-blue-50/50 max-h-60 overflow-y-auto">
          <AISummary summaryData={summaryData} />
        </div>
      )}

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 min-h-0">
        {/* Quick References - show only when there are no user messages */}
        {messages.length <= 1 && showQuickReferences && (
          <QuickReferences
            selectedCaseType={caseData.caseType}
            onQuestionSelect={handleSendMessage}
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

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!session?.user}
        />
      </div>
    </div>
  );
}
