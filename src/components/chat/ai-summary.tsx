"use client";

import { useState, useEffect } from "react";
import { Info, Calendar, FileText, AlertCircle } from "lucide-react";

interface TimelineEvent {
  date: string;
  description: string;
  type: "payment" | "communication" | "legal" | "deadline" | "other";
}

interface AISummaryData {
  caseDescription: string;
  timelineEvents: TimelineEvent[];
  keyPoints: string[];
  nextSteps: string[];
  urgency: "low" | "medium" | "high";
}

interface AISummaryProps {
  messages: Array<{ role: string; content: string }>;
  selectedCaseType: string;
  selectedCountry: string;
  isVisible: boolean;
}

export function AISummary({
  messages,
  selectedCaseType,
  selectedCountry,
  isVisible,
}: AISummaryProps) {
  const [summaryData, setSummaryData] = useState<AISummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && messages.length > 2) {
      // Only generate summary after some conversation
      generateSummary();
    }
  }, [messages, isVisible]);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          selectedCaseType,
          selectedCountry,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryData(data.summary);
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || (!summaryData && !isLoading)) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "💰";
      case "communication":
        return "📧";
      case "legal":
        return "⚖️";
      case "deadline":
        return "⏰";
      default:
        return "📋";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-5 h-5 bg-blue-500 rounded animate-pulse"></div>
          <h3 className="font-semibold text-gray-900">AI Summary</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">AI Summary</h3>
        </div>
        {summaryData.urgency !== "low" && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(
              summaryData.urgency
            )}`}
          >
            {summaryData.urgency.toUpperCase()} PRIORITY
          </span>
        )}
      </div>

      {/* Case Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 font-medium mb-1">
          You&apos;re describing {summaryData.caseDescription}.
        </p>
      </div>

      {/* Timeline Events */}
      {summaryData.timelineEvents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Timeline events:
          </h4>
          <ul className="space-y-1">
            {summaryData.timelineEvents.map((event, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-lg leading-none">
                  {getEventIcon(event.type)}
                </span>
                <span className="text-blue-600 font-medium min-w-fit">
                  {event.date}
                </span>
                <span className="text-gray-700">– {event.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Points */}
      {summaryData.keyPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Key points:
          </h4>
          <ul className="space-y-1">
            {summaryData.keyPoints.map((point, index) => (
              <li
                key={index}
                className="text-sm text-gray-700 flex items-start"
              >
                <span className="text-blue-500 mr-2">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {summaryData.nextSteps.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Recommended next steps:
          </h4>
          <ul className="space-y-1">
            {summaryData.nextSteps.map((step, index) => (
              <li
                key={index}
                className="text-sm text-gray-700 flex items-start"
              >
                <span className="text-green-500 mr-2">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
