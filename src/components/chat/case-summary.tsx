"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  DollarSign,
  CreditCard,
  Camera,
  Users,
  BarChart3,
  Building,
  Receipt,
  Paperclip,
  File,
} from "lucide-react";
import type {
  CaseSummary,
  TimelineEvent,
  EvidenceItem,
} from "@/app/api/cases/schema";

interface CaseSummaryProps {
  summaryData: CaseSummary | null;
  onFileUpload?: () => void;
  onEdit?: () => void;
}

export function CaseSummary({
  summaryData,
  onFileUpload,
  onEdit,
}: CaseSummaryProps) {
  if (!summaryData) {
    return <CaseSummaryPlaceholder />;
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "High Risk";
      case "medium":
        return "Medium Risk";
      default:
        return "Low Risk";
    }
  };

  const missingEvidenceCount = summaryData.evidenceChecklist.filter(
    (item) => !item.isUploaded
  ).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 xs:p-3 sm:p-4 lg:p-6 space-y-3 xs:space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-2 xs:p-3 sm:p-4 border-b">
            <div className="flex items-center space-x-2 xs:space-x-2 sm:space-x-3">
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2">
                  <span className="font-medium text-blue-600 text-xs xs:text-sm sm:text-base">
                    Case Summary
                  </span>
                  <Badge
                    className={`${getUrgencyColor(
                      summaryData.urgency
                    )} text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 w-fit`}
                  >
                    {getUrgencyText(summaryData.urgency)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 xs:p-3 sm:p-4">
            <div className="mb-2 xs:mb-3 sm:mb-4">
              <h3 className="font-medium text-gray-900 mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">
                Legal Issue Analysis
              </h3>
              <p className="text-gray-600 text-xs xs:text-xs sm:text-sm leading-relaxed">
                {summaryData.legalAnalysis?.keyLegalIssues?.length > 0
                  ? summaryData.legalAnalysis.keyLegalIssues[0]
                  : "Need more information to assess properly"}
              </p>
            </div>

            {summaryData.legalAnalysis?.keyLegalIssues?.length > 1 && (
              <div className="mb-2 xs:mb-3 sm:mb-4">
                <ul className="text-xs xs:text-xs sm:text-sm text-gray-600 space-y-0.5 xs:space-y-1">
                  {summaryData.legalAnalysis.keyLegalIssues
                    .slice(1)
                    .map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-1 xs:mt-1.5 sm:mt-2 mr-1.5 xs:mr-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{issue}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-2 xs:p-3 sm:p-4 border-b">
            <div className="flex items-center space-x-2 xs:space-x-2 sm:space-x-3">
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="font-medium text-blue-600 text-xs xs:text-sm sm:text-base">
                Evidence Checklist
              </span>
            </div>
          </div>

          <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4">
            {summaryData.evidenceChecklist &&
            summaryData.evidenceChecklist.length > 0 ? (
              summaryData.evidenceChecklist.map((item, index) => (
                <EvidenceItem
                  key={index}
                  item={item}
                  onFileUpload={onFileUpload}
                />
              ))
            ) : (
              <div className="text-center py-4 xs:py-6 sm:py-8 text-gray-500">
                <FileText className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto mb-2 xs:mb-3 opacity-50" />
                <p className="text-xs xs:text-sm">No evidence analysis yet</p>
                <p className="text-xs mt-1 px-2">
                  Continue chatting to get AI-generated document recommendations
                </p>
              </div>
            )}

            {summaryData.evidenceChecklist && missingEvidenceCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 xs:p-3 mt-2 xs:mt-3 sm:mt-4">
                <div className="flex items-start space-x-1.5 xs:space-x-2">
                  <AlertTriangle className="w-3 h-3 xs:w-4 xs:h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs xs:text-xs sm:text-sm text-yellow-800 leading-relaxed">
                    <strong>Missing evidence flagged</strong> - Upload documents
                    to strengthen your case.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-2 xs:p-3 sm:p-4 border-b">
            <div className="flex items-center space-x-2 xs:space-x-2 sm:space-x-3">
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="font-medium text-blue-600 text-xs xs:text-sm sm:text-base">
                Suggested Timeline
              </span>
            </div>
          </div>

          <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4">
            {summaryData.timelineEvents &&
            summaryData.timelineEvents.length > 0 ? (
              summaryData.timelineEvents.map((event, index) => (
                <TimelineItem key={index} event={event} isFirst={index === 0} />
              ))
            ) : (
              <div className="text-center py-4 xs:py-6 sm:py-8 text-gray-500">
                <Calendar className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto mb-2 xs:mb-3 opacity-50" />
                <p className="text-xs xs:text-sm">No timeline analysis yet</p>
                <p className="text-xs mt-1 px-2">
                  Share case details to get AI-generated timeline
                  recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceItem({
  item,
  onFileUpload,
}: {
  item: EvidenceItem;
  onFileUpload?: () => void;
}) {
  const getEvidenceIcon = (category: string) => {
    switch (category) {
      case "contracts":
        return File;
      case "communications":
        return Mail;
      case "financial_records":
        return DollarSign;
      case "identity_documents":
        return CreditCard;
      case "photos_videos":
        return Camera;
      case "witness_statements":
        return Users;
      case "expert_reports":
        return BarChart3;
      case "government_documents":
        return Building;
      case "receipts_invoices":
        return Receipt;
      default:
        return Paperclip;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "important":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-green-500 bg-green-50";
    }
  };

  const IconComponent = getEvidenceIcon(item.category);

  return (
    <div
      className={`border-l-4 rounded-lg p-2 xs:p-3 ${getPriorityColor(
        item.priority
      )}`}
    >
      <div className="flex items-start justify-between gap-2 xs:gap-3">
        <div className="flex items-start space-x-2 xs:space-x-3 flex-1 min-w-0">
          <div className="p-1 xs:p-1.5 bg-white rounded-lg border">
            <IconComponent className="w-3 h-3 xs:w-4 xs:h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2 mb-1">
              <span className="font-medium text-gray-900 capitalize text-xs xs:text-sm sm:text-base truncate">
                {item.category.replace("_", " ")}
              </span>
              <div className="flex items-center space-x-1 xs:space-x-2">
                <Badge
                  variant={
                    item.priority === "critical" ? "destructive" : "outline"
                  }
                  className="text-xs px-1 xs:px-1.5 py-0.5"
                >
                  {item.priority}
                </Badge>
                {item.isRequired && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1 xs:px-1.5 py-0.5"
                  >
                    Required
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs xs:text-xs sm:text-sm text-gray-700 mb-1 xs:mb-2 leading-relaxed">
              {item.description}
            </p>
            {item.notes && (
              <p className="text-xs text-gray-600 italic leading-relaxed">
                {item.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
          {item.isUploaded ? (
            <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2">
              <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-green-600" />
              <span className="text-xs xs:text-sm text-green-700">
                {item.uploadedFileIds.length}
              </span>
            </div>
          ) : (
            <Button
              onClick={onFileUpload}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs px-2 py-1 xs:px-3 xs:py-1.5 h-auto"
            >
              <Upload className="w-3 h-3 xs:mr-1" />
              <span className="hidden xs:inline ml-1">Upload</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  isFirst = false,
}: {
  event:
    | TimelineEvent
    | {
        date: string;
        description: string;
        status: string;
        type: string;
        priority: string;
      };
  isFirst?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "overdue":
        return "bg-red-500";
      case "upcoming":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "completed" ? (
      <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
    ) : (
      <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
    );
  };

  return (
    <div className="flex items-start space-x-2 xs:space-x-2 sm:space-x-3">
      <div
        className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(
          event.status
        )}`}
      >
        {getStatusIcon(event.status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-0.5 xs:space-y-1">
          <div className="flex flex-col xs:flex-row xs:items-start space-y-0.5 xs:space-y-0 xs:space-x-1.5">
            <span className="font-medium text-gray-900 text-xs xs:text-sm sm:text-base">
              {event.date}:
            </span>
            <span className="text-gray-700 text-xs xs:text-sm sm:text-base leading-relaxed">
              {event.description}
            </span>
          </div>
          {"daysFromNow" in event && event.daysFromNow !== undefined && (
            <p className="text-xs text-gray-500">
              {event.daysFromNow === 0
                ? "Today"
                : event.daysFromNow > 0
                ? `In ${event.daysFromNow} days`
                : `${Math.abs(event.daysFromNow)} days ago`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseSummaryPlaceholder() {
  return (
    <div className="h-full overflow-y-auto flex items-center">
      <div className="p-2 xs:p-3 sm:p-4 lg:p-6 flex justify-center">
        <div className="flex flex-col items-center justify-center h-32 xs:h-40 sm:h-48 md:h-64">
          <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
            <FileText className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">
            Case Analysis
          </h4>
          <p className="text-xs xs:text-xs sm:text-sm text-gray-500 text-center leading-relaxed max-w-xs px-2 xs:px-4">
            Continue chatting and uploading documents to build your
            comprehensive case analysis
          </p>
        </div>
      </div>
    </div>
  );
}
