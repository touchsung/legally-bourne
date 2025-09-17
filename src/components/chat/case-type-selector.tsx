"use client";

import { caseGroups } from "@/data/case-types";

interface CaseTypeSelectorProps {
  selectedCaseType: string;
  onCaseTypeChange: (caseType: string) => void;
}

export function CaseTypeSelector({
  selectedCaseType,
  onCaseTypeChange,
}: CaseTypeSelectorProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Step 2 Select Case Type
      </h2>

      {caseGroups.map((group) => {
        const GroupIcon = group.icon;

        return (
          <div key={group.id} className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GroupIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.types.map((caseType) => {
                const Icon = caseType.icon;
                const isSelected = selectedCaseType === caseType.id;

                return (
                  <div
                    key={caseType.id}
                    className="relative border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => onCaseTypeChange(caseType.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {caseType.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {caseType.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        <input
                          type="radio"
                          name="caseType"
                          value={caseType.id}
                          checked={isSelected}
                          onChange={() => onCaseTypeChange(caseType.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
