"use client";

import { useState, useEffect } from "react";
import { getMeeting, joinMeeting } from "@/lib/api";
import { MeetingRoom } from "@/components/meeting-room/MeetingRoom";
import type { Meeting } from "@/types";
import { PreJoinScreen } from "./PreJoinScreen";

interface PageProps {
  params: { meetingId: string };
}

type PageState = "loading" | "prejoin" | "room" | "error";

export default function MeetingPage({ params }: PageProps) {
  const { meetingId } = params;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [displayName, setDisplayName] = useState("Ayush");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const m = await getMeeting(meetingId);
        setMeeting(m);

        // Read display name from sessionStorage if set by the join modal
        const stored = sessionStorage.getItem("meetly_display_name");
        if (stored) setDisplayName(stored);

        setPageState("prejoin");
      } catch {
        setErrorMsg("Meeting not found. Please check the meeting ID or invitation link.");
        setPageState("error");
      }
    }
    fetchMeeting();
  }, [meetingId]);

  async function handleJoin(name: string) {
    if (!meeting) return;
    setDisplayName(name);
    try {
      await joinMeeting(meeting.meeting_id, { display_name: name });
      sessionStorage.removeItem("meetly_display_name");
      setPageState("room");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to join meeting.");
    }
  }

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">Meeting Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (pageState === "prejoin" && meeting) {
    return (
      <PreJoinScreen
        meeting={meeting}
        initialName={displayName}
        onJoin={handleJoin}
      />
    );
  }

  if (pageState === "room" && meeting) {
    return <MeetingRoom meeting={meeting} displayName={displayName} />;
  }

  return null;
}
