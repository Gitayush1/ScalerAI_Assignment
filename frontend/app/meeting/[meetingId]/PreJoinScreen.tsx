"use client";

/**
 * PreJoinScreen — camera/mic preview before entering the meeting room.
 * Uses a separate local getUserMedia call so the main room's stream
 * isn't started until the user actually clicks Join.
 */

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatMeetingId } from "@/lib/utils";
import { getInitials, avatarColor } from "@/lib/utils";
import type { Meeting } from "@/types";
import clsx from "clsx";

interface PreJoinScreenProps {
  meeting: Meeting;
  initialName: string;
  onJoin: (displayName: string) => Promise<void>;
}

export function PreJoinScreen({ meeting, initialName, onJoin }: PreJoinScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [displayName, setDisplayName] = useState(initialName);
  const [nameError, setNameError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [joining, setJoining] = useState(false);

  // Start camera preview
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCameraReady(true);
      })
      .catch(() => {
        if (!cancelled) setCameraError(true);
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function togglePreviewMute() {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((v) => !v);
  }

  function togglePreviewVideo() {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsVideoEnabled((v) => !v);
  }

  async function handleJoin() {
    if (!displayName.trim()) {
      setNameError("Please enter your display name.");
      return;
    }
    setNameError("");
    setJoining(true);
    // Stop the preview stream — MeetingRoom will open its own
    streamRef.current?.getTracks().forEach((t) => t.stop());
    await onJoin(displayName.trim());
  }

  const initials = getInitials(displayName || "?");
  const color = avatarColor(displayName || "?");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-6 items-center">
        {/* Preview */}
        <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden">
          {cameraReady && isVideoEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" // mirror effect
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className={clsx(
                  "w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold",
                  color
                )}
              >
                {initials}
              </div>
            </div>
          )}

          {/* Camera / mic toggles overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={togglePreviewMute}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isMuted ? "bg-red-600 text-white" : "bg-gray-700/80 text-gray-200 hover:bg-gray-600"
              )}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={togglePreviewVideo}
              disabled={cameraError}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                !isVideoEnabled ? "bg-red-600 text-white" : "bg-gray-700/80 text-gray-200 hover:bg-gray-600",
                cameraError && "opacity-50 cursor-not-allowed"
              )}
              title={isVideoEnabled ? "Stop Video" : "Start Video"}
            >
              {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
          </div>

          {cameraError && (
            <div className="absolute top-3 left-3 right-3 text-center bg-gray-900/70 rounded-lg py-1 text-xs text-gray-300">
              Camera unavailable — you can still join
            </div>
          )}
        </div>

        {/* Join form */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{meeting.title}</h1>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <span className="font-mono">{formatMeetingId(meeting.meeting_id)}</span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {meeting.participant_count} joined
              </span>
            </div>
            {meeting.description && (
              <p className="text-gray-500 text-sm mt-2">{meeting.description}</p>
            )}
          </div>

          {/* Inline dark-themed input — avoids light-mode color conflicts from the shared Input component */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              Your display name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-500"
            />
            {nameError && (
              <p className="text-xs text-red-400">{nameError}</p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleJoin}
            loading={joining}
          >
            Join Meeting
          </Button>

          <a
            href="/"
            className="text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
