"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";
import { RecentMeetings } from "@/components/dashboard/RecentMeetings";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";
import { JoinMeetingModal } from "@/components/meetings/JoinMeetingModal";
import { ScheduleMeetingModal } from "@/components/meetings/ScheduleMeetingModal";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useMeetings } from "@/hooks/useMeetings";
import { deleteMeeting } from "@/lib/api";
import type { Meeting } from "@/types";

type ActiveModal = "new" | "join" | "schedule" | null;

export default function DashboardPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { upcoming, recent, loading, refresh } = useMeetings();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  function handleJoinMeeting(meetingId: string) {
    router.push(`/meeting/${meetingId}`);
  }

  function handleModalJoin(meetingId: string, displayName: string) {
    // Store display name in sessionStorage so the pre-join screen can read it
    sessionStorage.setItem("meetly_display_name", displayName);
    router.push(`/meeting/${meetingId}`);
  }

  async function handleDeleteMeeting(meetingId: string) {
    try {
      await deleteMeeting(meetingId);
      addToast("Meeting cancelled successfully.", "success");
      refresh();
    } catch {
      addToast("Failed to cancel meeting.", "error");
    }
  }

  function handleCopyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      addToast("Invite link copied!", "success");
    });
  }

  function handleMeetingCreated(meeting: Meeting) {
    router.push(`/meeting/${meeting.meeting_id}`);
  }

  function handleMeetingScheduled() {
    addToast("Meeting scheduled successfully!", "success");
    refresh();
  }

  return (
    <AppShell title="Home">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {greeting}, Ayush 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            What would you like to do today?
          </p>
        </div>

        {/* Quick action buttons */}
        <QuickActions
          onNewMeeting={() => setActiveModal("new")}
          onJoin={() => setActiveModal("join")}
          onSchedule={() => setActiveModal("schedule")}
        />

        {/* Upcoming meetings */}
        <UpcomingMeetings
          meetings={upcoming}
          loading={loading}
          onJoin={handleJoinMeeting}
          onDelete={handleDeleteMeeting}
          onCopyLink={handleCopyLink}
        />

        {/* Recent meetings */}
        <RecentMeetings
          meetings={recent}
          loading={loading}
          onJoin={handleJoinMeeting}
          onCopyLink={handleCopyLink}
        />
      </div>

      {/* Modals */}
      <CreateMeetingModal
        open={activeModal === "new"}
        onClose={() => setActiveModal(null)}
        onCreated={handleMeetingCreated}
        onError={(msg) => addToast(msg, "error")}
      />
      <JoinMeetingModal
        open={activeModal === "join"}
        onClose={() => setActiveModal(null)}
        onValidated={handleModalJoin}
        onError={(msg) => addToast(msg, "error")}
      />
      <ScheduleMeetingModal
        open={activeModal === "schedule"}
        onClose={() => setActiveModal(null)}
        onScheduled={handleMeetingScheduled}
        onError={(msg) => addToast(msg, "error")}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppShell>
  );
}
