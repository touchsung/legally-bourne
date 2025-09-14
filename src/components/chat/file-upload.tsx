"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  filename: string;
  filesize: number;
  mimetype: string;
  uploadedAt: Date;
}

interface FileUploadProps {
  caseId: string;
  onFileUploaded?: (file: UploadedFile) => void;
  disabled?: boolean;
}

export function FileUpload({
  caseId,
  onFileUploaded,
  disabled,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "File type not supported. Please upload PDF, Word documents, text files, or images."
      );
    }
  };

  const uploadFile = async (file: File) => {
    try {
      validateFile(file);
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);

      const response = await fetch("/api/cases/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to upload file");
      }

      toast.success(`File "${file.name}" uploaded successfully`);
      onFileUploaded?.(result.file);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        uploadFile(file);
      });
    },
    [caseId, onFileUploaded]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value so same file can be uploaded again
    e.target.value = "";
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        className="hidden"
        disabled={disabled || uploading}
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${
            disabled || uploading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-blue-400 hover:bg-blue-50"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled && !uploading ? handleButtonClick : undefined}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Word docs, text files, and images up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
