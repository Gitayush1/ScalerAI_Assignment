"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { format } from "date-fns";
import { localId, getInitials, avatarColor } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import clsx from "clsx";

interface ChatPanelProps {
  displayName: string;
  onClose: () => void;
}

export function ChatPanel({ displayName, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: localId(),
      sender: "Meetly",
      text: "Welcome to the meeting chat!",
      timestamp: new Date(),
      isMe: false,
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: localId(),
        sender: displayName,
        text,
        timestamp: new Date(),
        isMe: true,
      },
    ]);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-white font-semibold text-sm">In-Meeting Chat</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto dark-scrollbar px-4 py-3 space-y-4">
        {messages.map((msg) => {
          const initials = getInitials(msg.sender);
          const color = avatarColor(msg.sender);
          return (
            <div key={msg.id} className={clsx("flex gap-2", msg.isMe && "flex-row-reverse")}>
              <div
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0 mt-0.5",
                  color
                )}
              >
                {initials}
              </div>
              <div className={clsx("flex flex-col gap-1 max-w-[180px]", msg.isMe && "items-end")}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {msg.isMe ? "You" : msg.sender}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {format(msg.timestamp, "h:mm a")}
                  </span>
                </div>
                <div
                  className={clsx(
                    "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                    msg.isMe
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-gray-700 text-gray-100 rounded-tl-sm"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-700">
        <div className="flex gap-2 items-center bg-gray-700 rounded-xl px-3 py-2">
          <input
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
