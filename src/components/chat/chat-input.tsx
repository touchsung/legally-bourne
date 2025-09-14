// src/components/chat/chat-input.tsx - Integrated file upload
"use client";

import { useState, KeyboardEvent, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Paperclip, X, Upload } from "lucide-react";
import { toast } from "sonner";

interface AttachedFile {
  id: string;
  filename: string;
  mimetype: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  filesize: number;
  mimetype: string;
  uploadedAt: Date;
}

interface ChatInputProps {
  caseId: string;
  onSendMessage: (message: string, fileIds?: string[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  availableFiles?: AttachedFile[];
  onFileUploaded?: (file: UploadedFile) => void;
}

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ChatInput({
  caseId,
  onSendMessage,
  isLoading,
  disabled,
  availableFiles = [],
  onFileUploaded,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploaded = useCallback(
    (file: UploadedFile) => {
      onFileUploaded?.(file);
    },
    [onFileUploaded]
  );

  const handleSend = () => {
    if (
      (message.trim() || selectedFiles.length > 0) &&
      !isLoading &&
      !disabled
    ) {
      onSendMessage(
        message.trim() || "Please analyze these documents:",
        selectedFiles
      );
      setMessage("");
      setSelectedFiles([]);
      setShowFileSelector(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 10MB");
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
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

      const uploadedFile: UploadedFile = {
        ...result.file,
        uploadedAt: new Date(result.file.uploadedAt),
      };

      handleFileUploaded(uploadedFile);

      setSelectedFiles((prev) => [...prev, uploadedFile.id]);

      toast.success(`File "${file.name}" uploaded successfully`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caseId, handleFileUploaded]
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

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = "";
  };

  const toggleFileSelector = () => {
    setShowFileSelector(!showFileSelector);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const removeSelectedFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("document")) return "📝";
    return "📎";
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  const getSelectedFileNames = () => {
    return selectedFiles.map((fileId) => {
      const file = availableFiles.find((f) => f.id === fileId);
      return file ? file.filename : "Unknown file";
    });
  };

  const hasAvailableFiles = availableFiles.length > 0;

  return (
    <div className="border-t bg-white">
      {/* File Management Panel - Upload Left, Select Right */}
      {showFileSelector && (
        <div className="border-b bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Attach Files
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFileSelector}
                className="p-1 h-auto hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Upload Section */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Upload New Files
                </h5>

                {/* Upload Area */}
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                    ${
                      dragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }
                    ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!uploading ? handleFileUploadClick : undefined}
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
              </div>

              {/* Right Side - Select Files */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Select from Uploaded Files ({availableFiles.length})
                </h5>

                {hasAvailableFiles ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableFiles.map((file) => (
                      <label
                        key={file.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedFiles.includes(file.id)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-lg">
                          {getFileIcon(file.mimetype)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.mimetype}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files uploaded yet</p>
                    <p className="text-xs mt-1">
                      Upload files using the area on the left
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="border-b bg-blue-50 p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Paperclip className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Files to include ({selectedFiles.length}):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedFileNames().map((filename, index) => {
              const fileId = selectedFiles[index];
              const file = availableFiles.find((f) => f.id === fileId);
              return (
                <div
                  key={fileId}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                >
                  <span>{getFileIcon(file?.mimetype || "")}</span>
                  <span className="max-w-24 truncate">{filename}</span>
                  <button
                    onClick={() => removeSelectedFile(fileId)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      {dragOver && (
        <div className="border-b bg-blue-50 border-blue-200 p-4">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-600">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className="p-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          className="hidden"
          disabled={disabled || uploading}
        />

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFileSelector}
            disabled={isLoading || disabled}
            className={`px-2 py-2 h-10 ${
              showFileSelector || selectedFiles.length > 0
                ? "bg-blue-50 text-blue-600"
                : ""
            }`}
            title="Select from uploaded files"
          >
            <Paperclip className="h-4 w-4" />
            {selectedFiles.length > 0 && (
              <span className="ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                {selectedFiles.length}
              </span>
            )}
          </Button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyPress}
            placeholder={
              uploading
                ? "Uploading file..."
                : selectedFiles.length > 0
                ? "Add a message or send files directly..."
                : "Type your message..."
            }
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={1}
            style={{
              minHeight: "40px",
              maxHeight: "120px",
            }}
            disabled={isLoading || disabled || uploading}
          />

          <Button
            onClick={handleSend}
            disabled={
              (!message.trim() && selectedFiles.length === 0) ||
              isLoading ||
              disabled ||
              uploading
            }
            size="sm"
            className="px-3 py-2 h-10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {uploading && <span className="text-blue-600">Uploading...</span>}
            {availableFiles.length > 0 && (
              <span>{availableFiles.length} file(s) available</span>
            )}
            <span>PDF, Word, images up to 10MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
