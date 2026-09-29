"use client";

import { Clock } from "lucide-react";
import { Meeting } from "@/types";
import { MeetingCard } from "./MeetingCard";
import { MeetingCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  meetings: Meeting[];
  loading: boolean;
  onJoin: (id: string) => void;
  onCopyLink: (link: string) => void;
}

export function RecentMeetings({ meetings, loading, onJoin, onCopyLink }: Props) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        Recent Meetings
      </h2>
      <div className="space-y-2">
        {loading ? (
          <>
            <MeetingCardSkeleton />
            <MeetingCardSkeleton />
            <MeetingCardSkeleton />
          </>
        ) : meetings.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No recent meetings"
            description="Your completed and ongoing meetings will appear here."
          />
        ) : (
          meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              variant="recent"
              onJoin={onJoin}
              onCopyLink={onCopyLink}
            />
          ))
        )}
      </div>
    </section>
  );
}
