"use client";

import { useState } from "react";
import { ClientNavbar } from "@/components/layout/client-navbar";
import { Footer } from "@/components/layout/footer";
import { CaseSelectionForm } from "@/components/chat/case-selection-form";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCaseType, setSelectedCaseType] = useState<string>("");
  const [showChat, setShowChat] = useState(false);

  const handleContinue = () => {
    if (selectedCountry && selectedCaseType) {
      setShowChat(true);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <ClientNavbar />

      <div className="flex-1 min-h-0">
        {showChat ? (
          <div className="h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ChatInterface
              selectedCountry={selectedCountry}
              selectedCaseType={selectedCaseType}
            />
          </div>
        ) : (
          <div className="h-full">
            <CaseSelectionForm
              selectedCountry={selectedCountry}
              selectedCaseType={selectedCaseType}
              onCountryChange={setSelectedCountry}
              onCaseTypeChange={setSelectedCaseType}
              onContinue={handleContinue}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
