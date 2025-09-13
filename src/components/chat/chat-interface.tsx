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
import { ChevronUp, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Country {
  code: string;
  name: string;
}

interface ChatInterfaceProps {
  selectedCountry: string;
  selectedCaseType: string;
}

export function ChatInterface({
  selectedCountry,
  selectedCaseType,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReferences, setShowQuickReferences] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [summaryData, setSummaryData] = useState(null);

  const getSelectedCaseType = () => {
    return caseTypes.find((type) => type.id === selectedCaseType);
  };

  const getSelectedCountry = () => {
    return (countries as Country[]).find(
      (country) => country.code === selectedCountry
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
          selectedCaseType,
          selectedCountry,
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
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (selectedCase && selectedCountryData) {
      const welcomeMessage: ChatMessage = {
        id: "1",
        role: "assistant",
        content: `Hello! I understand you need help with **${selectedCase.title}** in **${selectedCountryData.name}**.

I'm here to provide legal guidance specific to your situation. To better assist you, could you please tell me more about your specific circumstances?

For example:
- What exactly happened?
- When did this occur?
- Have you taken any steps already?
- What outcome are you hoping to achieve?

Please note that I provide general legal guidance, not formal legal advice. For complex matters, I may recommend consulting with a qualified lawyer.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedCase, selectedCountryData]);

  const handleSendMessage = async (content: string) => {
    if (!session?.user) {
      toast.error("Please sign in to continue");
      return;
    }

    // Hide quick references once user starts chatting
    setShowQuickReferences(false);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          selectedCountry,
          selectedCaseType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const totalMessages = messages.length + 2; // +1 for user message, +1 for assistant message
      if (totalMessages > 2) {
        generateSummary([...messages, userMessage, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-blue-50 p-3 md:p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                Legal Assistant
              </h3>
              <p className="text-xs text-gray-600">
                {selectedCase?.title} • {selectedCountryData?.name}
              </p>
            </div>
          </div>

          {/* Summary Toggle - Always visible in header */}
          {summaryData && (
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
          )}
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
        {/* Quick References - show only when we have just the welcome message */}
        {messages.length === 1 && showQuickReferences && (
          <QuickReferences
            selectedCaseType={selectedCaseType}
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
