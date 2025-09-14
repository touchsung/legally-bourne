"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/chat/country-selector";
import { CaseTypeSelector } from "@/components/chat/case-type-selector";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import countries from "@/data/countries.json";
import { caseTypes } from "@/data/case-types";
import type { CreateCaseInput } from "@/app/api/cases/schema";

interface Country {
  code: string;
  name: string;
}

interface CaseSelectionFormProps {
  selectedCountry: string;
  selectedCaseType: string;
  onCountryChange: (country: string) => void;
  onCaseTypeChange: (caseType: string) => void;
}

export function CaseSelectionForm({
  selectedCountry,
  selectedCaseType,
  onCountryChange,
  onCaseTypeChange,
}: CaseSelectionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const isFormValid = selectedCountry && selectedCaseType;

  const handleCreateCase = async () => {
    if (!session?.user) {
      toast.error("Please sign in to create a case");
      return;
    }

    if (!isFormValid) {
      toast.error("Please select both country and case type");
      return;
    }

    setIsCreating(true);

    try {
      // Get selected data for title generation
      const country = (countries as Country[]).find(
        (c) => c.code === selectedCountry
      );
      const caseType = caseTypes.find((c) => c.id === selectedCaseType);

      if (!country || !caseType) {
        throw new Error("Invalid selection");
      }

      const caseData: CreateCaseInput = {
        title: `${caseType.title} case in ${country.name}`,
        description: caseType.description,
        country: selectedCountry,
        caseType: selectedCaseType,
      };

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(caseData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create case");
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to create case");
      }

      toast.success("Case created successfully!");

      // Redirect to the new case chat
      router.push(`/chat/${result.case.id}`);
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create case"
      );
    } finally {
      setIsCreating(false);
    }
  };

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
            onClick={handleCreateCase}
            disabled={!isFormValid || isCreating || !session?.user}
            size="lg"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Case...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
        {!session?.user && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Please sign in to create a case
          </p>
        )}
      </div>
    </div>
  );
}
