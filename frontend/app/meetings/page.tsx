"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { MeetingCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useMeetings } from "@/hooks/useMeetings";
import { deleteMeeting } from "@/lib/api";
import { Video } from "lucide-react";

export default function MeetingsPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { upcoming, recent, loading, refresh } = useMeetings();
  const [tab, setTab] = useState<"upcoming" | "recent">("upcoming");

  const meetings = tab === "upcoming" ? upcoming : recent;

  function handleJoin(id: string) {
    router.push(`/meeting/${id}`);
  }

  async function handleDelete(id: string) {
    try {
      await deleteMeeting(id);
      addToast("Meeting cancelled.", "success");
      refresh();
    } catch {
      addToast("Failed to cancel meeting.", "error");
    }
  }

  function handleCopyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => addToast("Invite link copied!", "success"));
  }

  return (
    <AppShell title="Meetings">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meetings</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
          {(["upcoming", "recent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {loading ? (
            <>
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
            </>
          ) : meetings.length === 0 ? (
            <EmptyState
              icon={Video}
              title={`No ${tab} meetings`}
              description={
                tab === "upcoming"
                  ? "Schedule a meeting from the dashboard."
                  : "Your completed meetings will appear here."
              }
            />
          ) : (
            meetings.map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                variant={tab}
                onJoin={handleJoin}
                onDelete={tab === "upcoming" ? handleDelete : undefined}
                onCopyLink={handleCopyLink}
              />
            ))
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppShell>
  );
}
