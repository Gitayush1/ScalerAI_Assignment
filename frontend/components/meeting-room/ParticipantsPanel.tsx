"use client";

import { X, Mic, MicOff, Crown, UserMinus } from "lucide-react";
import clsx from "clsx";
import { getInitials, avatarColor } from "@/lib/utils";
import type { LocalParticipant } from "@/types";

interface ParticipantsPanelProps {
  participants: LocalParticipant[];
  localId: string;
  onClose: () => void;
  onMuteAll: () => void;
  onRemoveParticipant: (id: string) => void;
}

export function ParticipantsPanel({
  participants,
  localId,
  onClose,
  onMuteAll,
  onRemoveParticipant,
}: ParticipantsPanelProps) {
  const isHost = participants.find((p) => p.id === localId)?.is_host ?? false;

  return (
    <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-white font-semibold text-sm">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto dark-scrollbar py-2">
        {participants.map((p) => {
          const initials = getInitials(p.display_name);
          const color = avatarColor(p.display_name);
          const isMe = p.id === localId;

          return (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/50 transition-colors group"
            >
              {/* Avatar */}
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                  color
                )}
              >
                {initials}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {p.display_name}
                  {isMe && (
                    <span className="text-gray-400 font-normal"> (You)</span>
                  )}
                </p>
                {p.is_host && (
                  <p className="text-xs text-yellow-400 flex items-center gap-1">
                    <Crown size={10} />
                    Host
                  </p>
                )}
              </div>

              {/* Mic indicator */}
              <div className="flex items-center gap-1">
                {p.is_muted ? (
                  <MicOff size={14} className="text-red-400" />
                ) : (
                  <Mic size={14} className="text-green-400" />
                )}
              </div>

              {/* Host controls — only visible to host, only on non-host participants */}
              {isHost && !isMe && (
                <button
                  onClick={() => onRemoveParticipant(p.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                  title="Remove participant"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Host controls footer */}
      {isHost && (
        <div className="px-4 py-3 border-t border-gray-700">
          <button
            onClick={onMuteAll}
            className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-white font-medium transition-colors"
          >
            Mute All
          </button>
        </div>
      )}
    </div>
  );
}
