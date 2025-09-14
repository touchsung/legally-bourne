"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Edit,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { caseTypes } from "@/data/case-types";
import countries from "@/data/countries.json";
import { useState } from "react";
import { toast } from "sonner";

interface CaseSummary {
  id: string;
  caseId: string;
  caseDescription: string;
  urgency: string;
  messageCount: number;
  createdAt: Date;
}

interface CaseWithDetails {
  id: string;
  title: string;
  description: string | null;
  country: string;
  caseType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  summaries: CaseSummary[];
  _count: {
    messages: number;
  };
}

interface UserCasesListProps {
  cases: CaseWithDetails[];
}

interface Country {
  code: string;
  name: string;
}

export function UserCasesList({ cases }: UserCasesListProps) {
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingCase, setSavingCase] = useState<string | null>(null);
  const [caseTitles, setCaseTitles] = useState<Record<string, string>>(() => {
    // Initialize with current case titles
    const initialTitles: Record<string, string> = {};
    cases.forEach((case_) => {
      initialTitles[case_.id] = case_.title;
    });
    return initialTitles;
  });

  const groupedCases = groupCasesByType(cases);

  const startEditing = (caseId: string, currentTitle: string) => {
    setEditingCase(caseId);
    setEditingTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingCase(null);
    setEditingTitle("");
  };

  const saveTitle = async (caseId: string) => {
    if (!editingTitle.trim()) {
      toast.error("Case title cannot be empty");
      return;
    }

    if (editingTitle === caseTitles[caseId]) {
      cancelEditing();
      return;
    }

    setSavingCase(caseId);

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update case title");
      }

      // Update the local state
      setCaseTitles((prev) => ({
        ...prev,
        [caseId]: editingTitle.trim(),
      }));

      cancelEditing();
      toast.success("Case title updated successfully");
    } catch (error) {
      console.error("Error updating case title:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update case title"
      );
    } finally {
      setSavingCase(null);
    }
  };

  if (cases.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            My Active Legal Matters
          </h2>
          <p className="text-gray-600 text-sm">
            Legal matters currently in progress
          </p>
        </div>
        <Link href="/chat">
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            New Case
          </Button>
        </Link>
      </div>

      {Object.entries(groupedCases).map(([caseTypeTitle, typeCases]) => (
        <CaseTypeGroup
          key={caseTypeTitle}
          title={caseTypeTitle}
          cases={typeCases}
          editingCase={editingCase}
          editingTitle={editingTitle}
          savingCase={savingCase}
          caseTitles={caseTitles}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSaveTitle={saveTitle}
          onTitleChange={setEditingTitle}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
      <p className="text-gray-600 mb-6">
        Start your first legal case to get personalized assistance and guidance.
      </p>
      <Link href="/chat">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Start New Case
        </Button>
      </Link>
    </div>
  );
}

interface CaseTypeGroupProps {
  title: string;
  cases: CaseWithDetails[];
  editingCase: string | null;
  editingTitle: string;
  savingCase: string | null;
  caseTitles: Record<string, string>;
  onStartEditing: (caseId: string, currentTitle: string) => void;
  onCancelEditing: () => void;
  onSaveTitle: (caseId: string) => void;
  onTitleChange: (title: string) => void;
}

function CaseTypeGroup({
  title,
  cases,
  editingCase,
  editingTitle,
  savingCase,
  caseTitles,
  onStartEditing,
  onCancelEditing,
  onSaveTitle,
  onTitleChange,
}: CaseTypeGroupProps) {
  const firstCase = cases[0];
  const CaseIcon = getCaseTypeIcon(firstCase.caseType);
  const hasHighPriority = cases.some((c) => c.summaries[0]?.urgency === "high");
  const hasMediumPriority = cases.some(
    (c) => c.summaries[0]?.urgency === "medium"
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <CaseIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📋</span>
              {title}
            </h3>
            <p className="text-sm text-gray-500">
              {cases.length} case{cases.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            {hasHighPriority && (
              <div
                className="w-3 h-3 bg-red-500 rounded-full"
                title="High priority cases"
              ></div>
            )}
            {hasMediumPriority && (
              <div
                className="w-3 h-3 bg-yellow-500 rounded-full"
                title="Medium priority cases"
              ></div>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {cases.map((case_) => (
          <CaseCard
            key={case_.id}
            case={case_}
            isEditing={editingCase === case_.id}
            editingTitle={editingTitle}
            isSaving={savingCase === case_.id}
            currentTitle={caseTitles[case_.id] || case_.title}
            onStartEditing={onStartEditing}
            onCancelEditing={onCancelEditing}
            onSaveTitle={onSaveTitle}
            onTitleChange={onTitleChange}
          />
        ))}
      </div>
    </div>
  );
}

interface CaseCardProps {
  case: CaseWithDetails;
  isEditing: boolean;
  editingTitle: string;
  isSaving: boolean;
  currentTitle: string;
  onStartEditing: (caseId: string, currentTitle: string) => void;
  onCancelEditing: () => void;
  onSaveTitle: (caseId: string) => void;
  onTitleChange: (title: string) => void;
}

function CaseCard({
  case: case_,
  isEditing,
  editingTitle,
  isSaving,
  currentTitle,
  onStartEditing,
  onCancelEditing,
  onSaveTitle,
  onTitleChange,
}: CaseCardProps) {
  const latestSummary = case_.summaries[0];
  const countryName = getCountryName(case_.country);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSaveTitle(case_.id);
    } else if (e.key === "Escape") {
      onCancelEditing();
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-2 py-1 text-base font-medium text-gray-900 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter case title"
                  autoFocus
                  disabled={isSaving}
                />
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => onSaveTitle(case_.id)}
                    disabled={isSaving || !editingTitle.trim()}
                    size="sm"
                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    onClick={onCancelEditing}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-1 group">
                <h4 className="text-base font-medium text-gray-900 truncate">
                  {currentTitle}
                </h4>
                <Button
                  onClick={() => onStartEditing(case_.id, currentTitle)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                  title="Edit case title"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            )}

            {!isEditing && (
              <>
                <StatusBadge status={case_.status} />
                {latestSummary?.urgency && (
                  <UrgencyBadge urgency={latestSummary.urgency} />
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {case_._count.messages} messages
                </span>
                <span>📍 {countryName}</span>
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(case_.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {latestSummary && <SummaryPreview summary={latestSummary} />}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="ml-4 flex-shrink-0">
            <Link href={`/chat/${case_.id}`}>
              <Button variant="outline" size="sm">
                Continue
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    active: { className: "bg-green-100 text-green-800", icon: CheckCircle },
    closed: { className: "bg-gray-100 text-gray-800", icon: null },
    archived: { className: "bg-blue-100 text-blue-800", icon: null },
  };

  const variant = variants[status as keyof typeof variants] || variants.closed;
  const Icon = variant.icon;

  return (
    <Badge className={`hover:${variant.className} ${variant.className}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const variants = {
    high: {
      className: "bg-red-100 text-red-800",
      icon: AlertTriangle,
      text: "High Priority",
    },
    medium: {
      className: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      text: "Medium Priority",
    },
    low: {
      className: "bg-green-100 text-green-800",
      icon: null,
      text: "Low Priority",
    },
  };

  const variant = variants[urgency as keyof typeof variants];
  if (!variant) return null;

  const Icon = variant.icon;

  return (
    <Badge className={`hover:${variant.className} ${variant.className}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {variant.text}
    </Badge>
  );
}

function SummaryPreview({ summary }: { summary: CaseSummary }) {
  return (
    <div className="mb-3">
      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">Current situation:</span>{" "}
        {summary.caseDescription}
      </p>
    </div>
  );
}

function groupCasesByType(cases: CaseWithDetails[]) {
  return cases.reduce((acc, case_) => {
    const caseType = caseTypes.find((type) => type.id === case_.caseType);
    const typeTitle = caseType?.title || "Other";

    if (!acc[typeTitle]) {
      acc[typeTitle] = [];
    }
    acc[typeTitle].push(case_);
    return acc;
  }, {} as Record<string, CaseWithDetails[]>);
}

function getCaseTypeIcon(caseTypeId: string) {
  const caseType = caseTypes.find((type) => type.id === caseTypeId);
  return caseType?.icon || FileText;
}

function getCountryName(countryCode: string) {
  const country = (countries as Country[]).find((c) => c.code === countryCode);
  return country?.name || countryCode;
}
