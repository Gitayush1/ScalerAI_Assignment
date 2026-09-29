"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useMeetings } from "@/hooks/useMeetings";
import { formatMeetingDate, formatMeetingId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Calendar, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MeetingCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CalendarPage() {
  const { upcoming, loading } = useMeetings();
  const router = useRouter();

  return (
    <AppShell title="Calendar">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendar</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your upcoming scheduled meetings.
        </p>

        {loading ? (
          <div className="space-y-2">
            <MeetingCardSkeleton />
            <MeetingCardSkeleton />
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No scheduled meetings"
            description="Schedule a meeting from the dashboard and it will appear here."
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Video size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{m.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {m.scheduled_at ? formatMeetingDate(m.scheduled_at) : "—"}
                    {" · "}
                    {m.duration_minutes} min
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {formatMeetingId(m.meeting_id)}
                  </p>
                </div>
                <Button size="sm" onClick={() => router.push(`/meeting/${m.meeting_id}`)}>
                  Join
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
