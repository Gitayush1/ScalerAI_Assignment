"use client";

import { Calendar, Clock, Users, Copy, MoreHorizontal, Trash2, Video } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { Meeting } from "@/types";
import { formatMeetingId, formatMeetingDate, timeAgo, buildJoinUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface MeetingCardProps {
  meeting: Meeting;
  variant: "upcoming" | "recent";
  onJoin: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
  onCopyLink?: (link: string) => void;
}

export function MeetingCard({
  meeting,
  variant,
  onJoin,
  onDelete,
  onCopyLink,
}: MeetingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    active: "bg-green-50 text-green-700",
    completed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
        <Video size={18} className="text-blue-600" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {meeting.title}
          </h3>
          <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              statusColors[meeting.status]
            )}
          >
            {meeting.status}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {variant === "upcoming" && meeting.scheduled_at && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              {formatMeetingDate(meeting.scheduled_at)}
            </span>
          )}
          {variant === "recent" && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {timeAgo(meeting.created_at)}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {meeting.duration_minutes} min
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            {meeting.participant_count} participant{meeting.participant_count !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {formatMeetingId(meeting.meeting_id)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={variant === "recent" ? "secondary" : "primary"}
          onClick={() => onJoin(meeting.meeting_id)}
        >
          {variant === "recent" ? "Rejoin" : "Join"}
        </Button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    onCopyLink?.(buildJoinUrl(meeting.meeting_id));
                    setMenuOpen(false);
                  }}
                >
                  <Copy size={14} />
                  Copy invite link
                </button>
                {onDelete && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onDelete(meeting.meeting_id);
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={14} />
                    Cancel meeting
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
