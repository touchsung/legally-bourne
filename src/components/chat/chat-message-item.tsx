"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "@/types/chat";

interface ChatMessageItemProps {
  message: ChatMessage;
  userImage?: string | null;
  userName?: string | null;
}

export function ChatMessageItem({
  message,
  userImage,
  userName,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-500">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? "bg-blue-600 text-white ml-auto"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={userImage || ""} alt={userName || "User"} />
          <AvatarFallback className="bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
