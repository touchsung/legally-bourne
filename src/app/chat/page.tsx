"use client";

import { useState } from "react";
import { ClientNavbar } from "@/components/layout/client-navbar";
import { Footer } from "@/components/layout/footer";
import { CaseSelectionForm } from "@/components/chat/case-selection-form";
import { CaseDetailsSummary } from "@/components/chat/case-details-summary";
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

  const handleChangeSelection = () => {
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientNavbar />

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showChat ? (
            <>
              {/* <CaseDetailsSummary
                selectedCountry={selectedCountry}
                selectedCaseType={selectedCaseType}
                onChangeSelection={handleChangeSelection}
              /> */}
              <ChatInterface
                selectedCountry={selectedCountry}
                selectedCaseType={selectedCaseType}
              />
            </>
          ) : (
            <CaseSelectionForm
              selectedCountry={selectedCountry}
              selectedCaseType={selectedCaseType}
              onCountryChange={setSelectedCountry}
              onCaseTypeChange={setSelectedCaseType}
              onContinue={handleContinue}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
