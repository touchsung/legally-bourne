"use client";

import { Button } from "@/components/ui/button";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";

interface Country {
  code: string;
  name: string;
}

interface CaseDetailsSummaryProps {
  selectedCountry: string;
  selectedCaseType: string;
  onChangeSelection: () => void;
}

export function CaseDetailsSummary({
  selectedCountry,
  selectedCaseType,
  onChangeSelection,
}: CaseDetailsSummaryProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4">Your Case Details</h2>
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-600">Country:</span>
          <span className="ml-2 text-gray-900">
            {selectedCountryData?.name}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Case Type:</span>
          <span className="ml-2 text-gray-900">{selectedCase?.title}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">
            Description:
          </span>
          <span className="ml-2 text-gray-700">
            {selectedCase?.description}
          </span>
        </div>
      </div>
      <Button
        onClick={onChangeSelection}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        Change Selection
      </Button>
    </div>
  );
}
