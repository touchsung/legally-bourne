"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  File,
  FileText,
  Image as ImageIcon,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface UploadedFile {
  id: string;
  filename: string;
  filesize: number;
  mimetype: string;
  uploadedAt: Date;
}

interface FileListProps {
  caseId: string;
  files: UploadedFile[];
  onFileDeleted?: (fileId: string) => void;
  onRefresh?: () => void;
}

export function FileList({
  caseId,
  files,
  onFileDeleted,
  onRefresh,
}: FileListProps) {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return ImageIcon;
    if (
      mimetype.includes("pdf") ||
      mimetype.includes("document") ||
      mimetype.includes("text")
    )
      return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setDeletingFiles((prev) => new Set([...prev, fileId]));

    try {
      const response = await fetch(
        `/api/cases/files/${caseId}?fileId=${fileId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete file");
      }

      toast.success("File deleted successfully");
      onFileDeleted?.(fileId);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete file";
      toast.error(errorMessage);
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No files uploaded yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Upload documents related to your case
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-700">
          Uploaded Files ({files.length})
        </h4>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-xs"
          >
            Refresh
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {files.map((file) => {
          const FileIcon = getFileIcon(file.mimetype);
          const isDeleting = deletingFiles.has(file.id);
          const uploadDate = new Date(file.uploadedAt);

          return (
            <div
              key={file.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
            >
              <FileIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.filename}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(file.filesize)}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>
                      {formatDistanceToNow(uploadDate, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file.id, file.filename)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
