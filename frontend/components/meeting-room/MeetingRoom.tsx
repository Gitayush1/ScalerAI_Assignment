"use client";

/**
 * MeetingRoom — the core meeting UI.
 *
 * Architecture decisions:
 *  - useMedia hook owns all getUserMedia / getDisplayMedia calls.
 *  - Local participant state (mute, video, participants list) is managed here
 *    via useState. This is the "UI layer" of participant management.
 *  - Backend participant records (Participant table) are written via the API
 *    when joining/leaving — those are the "persistence layer".
 *  - A future WebSocket/WebRTC layer would sit between these two layers,
 *    syncing UI state across clients in real time.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Copy, Check, Wifi, WifiOff } from "lucide-react";
import { VideoGrid } from "./VideoGrid";
import { MeetingControls } from "./MeetingControls";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { ChatPanel } from "./ChatPanel";
import { ToastContainer } from "@/components/ui/Toast";
import { useMedia } from "@/hooks/useMedia";
import { useToast } from "@/hooks/useToast";
import { leaveMeeting } from "@/lib/api";
import { formatMeetingId, buildJoinUrl, localId } from "@/lib/utils";
import type { Meeting, LocalParticipant } from "@/types";

interface MeetingRoomProps {
  meeting: Meeting;
  displayName: string;
}

export function MeetingRoom({ meeting, displayName }: MeetingRoomProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const {
    stream,
    isMuted,
    isVideoEnabled,
    cameraError,
    toggleMute,
    toggleVideo,
    stopAll,
  } = useMedia();

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Local participant ID — stable across renders
  const localParticipantId = useRef(localId()).current;

  /**
   * Participants list — the "UI state layer".
   * Starts with just the current user. Simulated remote participants
   * are added below to demonstrate the UI without a real signaling server.
   */
  const [participants, setParticipants] = useState<LocalParticipant[]>([]);

  // Keep the local participant in sync with media hook state
  useEffect(() => {
    setParticipants((prev) => {
      const localIdx = prev.findIndex((p) => p.id === localParticipantId);
      const localP: LocalParticipant = {
        id: localParticipantId,
        display_name: displayName,
        is_host: true,
        is_muted: isMuted,
        is_video_enabled: isVideoEnabled,
        is_screen_sharing: isScreenSharing,
        stream,
      };
      if (localIdx === -1) return [localP, ...prev];
      const next = [...prev];
      next[localIdx] = localP;
      return next;
    });
  }, [displayName, isMuted, isVideoEnabled, isScreenSharing, stream, localParticipantId]);

  // Add a simulated remote participant after 2 s to demonstrate the UI
  useEffect(() => {
    const timer = setTimeout(() => {
      const simulatedNames = ["Priya Sharma", "Rahul Verma", "Neha Gupta"];
      const count = Math.min(meeting.participant_count - 1, simulatedNames.length);
      if (count <= 0) return;

      const simulated: LocalParticipant[] = simulatedNames
        .slice(0, count)
        .map((name) => ({
          id: localId(),
          display_name: name,
          is_host: false,
          is_muted: Math.random() > 0.5,
          is_video_enabled: Math.random() > 0.3,
          is_screen_sharing: false,
          stream: null, // no real stream for simulated participants
        }));

      setParticipants((prev) => [...prev, ...simulated]);
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show camera error as toast once
  useEffect(() => {
    if (cameraError) addToast(cameraError, "info");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraError]);

  // ─── Screen sharing ────────────────────────────────────────────────────────
  async function handleToggleScreenShare() {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      addToast("Screen sharing stopped.", "info");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      // Stop sharing automatically when the browser's native stop button is clicked
      s.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        setIsScreenSharing(false);
      };
      setScreenStream(s);
      setIsScreenSharing(true);
      addToast("Screen sharing started.", "success");
    } catch (err) {
      const name = (err as DOMException).name;
      if (name !== "NotAllowedError") {
        addToast("Screen sharing is not available in this browser.", "error");
      }
    }
  }

  // ─── Copy invite ───────────────────────────────────────────────────────────
  async function handleCopyInvite() {
    const url = buildJoinUrl(meeting.meeting_id);
    await navigator.clipboard.writeText(url);
    setInviteCopied(true);
    addToast("Invite link copied!", "success");
    setTimeout(() => setInviteCopied(false), 2500);
  }

  // ─── Leave meeting ─────────────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    stopAll();
    screenStream?.getTracks().forEach((t) => t.stop());
    try {
      await leaveMeeting(meeting.meeting_id);
    } catch {
      // Non-critical — navigate away regardless
    }
    router.push("/");
  }, [isLeaving, meeting.meeting_id, router, screenStream, stopAll]);

  // ─── Host controls ─────────────────────────────────────────────────────────
  function handleMuteAll() {
    setParticipants((prev) =>
      prev.map((p) => (p.id === localParticipantId ? p : { ...p, is_muted: true }))
    );
    addToast("All participants muted.", "info");
  }

  function handleRemoveParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    addToast("Participant removed.", "info");
  }

  const elapsed = Math.floor(
    (Date.now() - new Date(meeting.created_at).getTime()) / 1000
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
          <span className="text-gray-300 text-sm font-medium truncate max-w-[180px] md:max-w-xs">
            {meeting.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-gray-400 text-xs">
            <Shield size={12} className="text-green-400" />
            <span>Encrypted</span>
          </div>
          <span className="text-gray-400 text-xs font-mono hidden sm:block">
            {formatMeetingId(meeting.meeting_id)}
          </span>
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            {inviteCopied ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
            <span className="hidden sm:inline">
              {inviteCopied ? "Copied!" : "Copy Invite"}
            </span>
          </button>
          <div className="flex items-center gap-1 text-gray-400">
            <Wifi size={14} className="text-green-400" />
          </div>
        </div>
      </div>

      {/* Main area: video + side panels */}
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid participants={participants} screenStream={screenStream} />

        {/* Participants panel */}
        {participantsOpen && (
          <ParticipantsPanel
            participants={participants}
            localId={localParticipantId}
            onClose={() => setParticipantsOpen(false)}
            onMuteAll={handleMuteAll}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}

        {/* Chat panel */}
        {chatOpen && (
          <ChatPanel
            displayName={displayName}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>

      {/* Control bar */}
      <MeetingControls
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        isScreenSharing={isScreenSharing}
        isParticipantsOpen={participantsOpen}
        isChatOpen={chatOpen}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleParticipants={() => setParticipantsOpen((v) => !v)}
        onToggleChat={() => setChatOpen((v) => !v)}
        onLeave={handleLeave}
        onCopyInvite={handleCopyInvite}
        inviteCopied={inviteCopied}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
