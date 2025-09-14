"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClientNavbar } from "@/components/layout/client-navbar";
import { Footer } from "@/components/layout/footer";
import { CaseChatInterface } from "@/components/chat/case-chat-interface";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { GetCaseResponse } from "@/app/api/cases/schema";

interface CaseData {
  id: string;
  title: string;
  description: string | null;
  country: string;
  caseType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
  }>;
}

export default function CaseChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const caseId = params?.caseId as string;

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/");
      return;
    }

    if (!caseId) {
      setError("Invalid case ID");
      setLoading(false);
      return;
    }

    fetchCaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, status, router]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cases/chat/${caseId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: GetCaseResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch case");
      }

      if (!result.success) {
        throw new Error("Failed to fetch case");
      }

      const caseWithDates = {
        ...result.case,
        createdAt: new Date(result.case.createdAt),
        updatedAt: new Date(result.case.updatedAt),
        messages: result.case.messages.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })),
      };

      setCaseData(caseWithDates);
    } catch (error) {
      console.error("Error fetching case:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch case";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <ClientNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your case...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <ClientNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Case Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error ||
                "The case you're looking for doesn't exist or you don't have access to it."}
            </p>
            <button
              onClick={() => router.push("/chat")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Case
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <ClientNavbar />

      <div className="flex-1 min-h-0">
        <div className="h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CaseChatInterface caseData={caseData} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
