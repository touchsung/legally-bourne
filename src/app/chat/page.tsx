"use client";

import { useState } from "react";
import { ClientNavbar } from "@/components/layout/client-navbar";
import { Footer } from "@/components/layout/footer";
import { CaseSelectionForm } from "@/components/chat/case-selection-form";

export default function ChatPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCaseType, setSelectedCaseType] = useState<string>("");

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <ClientNavbar />

      <div className="flex-1 min-h-0">
        <div className="h-full">
          <CaseSelectionForm
            selectedCountry={selectedCountry}
            selectedCaseType={selectedCaseType}
            onCountryChange={setSelectedCountry}
            onCaseTypeChange={setSelectedCaseType}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
