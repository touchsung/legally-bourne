"use client";

import { caseTypes } from "@/data/case-types";

interface CaseTypeSelectorProps {
  selectedCaseType: string;
  onCaseTypeChange: (caseType: string) => void;
}

export function CaseTypeSelector({
  selectedCaseType,
  onCaseTypeChange,
}: CaseTypeSelectorProps) {
  return (
    <div className="mb-4">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
        Step 2 Select Case Type
      </h2>
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {caseTypes.map((caseType) => {
          const Icon = caseType.icon;
          const isSelected = selectedCaseType === caseType.id;

          return (
            <button
              key={caseType.id}
              onClick={() => onCaseTypeChange(caseType.id)}
              className={`w-full p-3 md:p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start space-x-3 md:space-x-4">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    isSelected ? "bg-blue-500" : "bg-blue-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      isSelected ? "text-white" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-base md:text-lg mb-1 ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {caseType.title}
                  </h3>
                  <p
                    className={`text-xs md:text-sm leading-tight ${
                      isSelected ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {caseType.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
