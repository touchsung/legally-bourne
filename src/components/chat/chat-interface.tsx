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
  const [showSummary, setShowSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      // Show summary after user has interacted with assistant
      if (messages.length >= 2) {
        // User message + AI response
        setShowSummary(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <div
          className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
          style={{ height: "600px" }}
        >
          {/* Chat Header */}
          <div className="bg-blue-50 p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Legal Assistant</h3>
                <p className="text-xs text-gray-600">
                  {selectedCase?.title} • {selectedCountryData?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!session?.user}
          />
        </div>
      </div>

      {/* AI Summary Sidebar */}
      <div className="lg:col-span-1">
        <AISummary
          messages={messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))}
          selectedCaseType={selectedCaseType}
          selectedCountry={selectedCountry}
          isVisible={showSummary}
        />
      </div>
    </div>
  );
}
