"use client";

import { Calendar } from "lucide-react";
import { Meeting } from "@/types";
import { MeetingCard } from "./MeetingCard";
import { MeetingCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  meetings: Meeting[];
  loading: boolean;
  onJoin: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyLink: (link: string) => void;
}

export function UpcomingMeetings({ meetings, loading, onJoin, onDelete, onCopyLink }: Props) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        Upcoming Meetings
      </h2>
      <div className="space-y-2">
        {loading ? (
          <>
            <MeetingCardSkeleton />
            <MeetingCardSkeleton />
          </>
        ) : meetings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming meetings"
            description="Schedule a meeting to see it here."
          />
        ) : (
          meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              variant="upcoming"
              onJoin={onJoin}
              onDelete={onDelete}
              onCopyLink={onCopyLink}
            />
          ))
        )}
      </div>
    </section>
  );
}
