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
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What is your case about?
        </h1>
        <p className="text-gray-600">
          Choose the option that best matches your situation and select your
          country of jurisdiction.
        </p>
      </div>

      <CountrySelector
        selectedCountry={selectedCountry}
        onCountryChange={onCountryChange}
      />

      <CaseTypeSelector
        selectedCaseType={selectedCaseType}
        onCaseTypeChange={onCaseTypeChange}
      />

      <div className="flex justify-center">
        <Button
          onClick={onContinue}
          disabled={!isFormValid}
          size="lg"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
