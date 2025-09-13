// src/components/chat/case-selection-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/chat/country-selector";
import { CaseTypeSelector } from "@/components/chat/case-type-selector";

interface CaseSelectionFormProps {
  selectedCountry: string;
  selectedCaseType: string;
  onCountryChange: (country: string) => void;
  onCaseTypeChange: (caseType: string) => void;
  onContinue: () => void;
}

export function CaseSelectionForm({
  selectedCountry,
  selectedCaseType,
  onCountryChange,
  onCaseTypeChange,
  onContinue,
}: CaseSelectionFormProps) {
  const isFormValid = selectedCountry && selectedCaseType;

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-6 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          What is your case about?
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Choose the option that best matches your situation and select your
          country of jurisdiction.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 min-h-fit">
          <CountrySelector
            selectedCountry={selectedCountry}
            onCountryChange={onCountryChange}
          />

          <CaseTypeSelector
            selectedCaseType={selectedCaseType}
            onCaseTypeChange={onCaseTypeChange}
          />
        </div>
      </div>

      <div className="flex-shrink-0 py-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
        <div className="flex justify-center">
          <Button
            onClick={onContinue}
            disabled={!isFormValid}
            size="lg"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
