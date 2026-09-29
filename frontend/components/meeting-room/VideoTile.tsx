"use client";

import { useEffect, useRef } from "react";
import { MicOff, Crown } from "lucide-react";
import clsx from "clsx";
import { getInitials, avatarColor } from "@/lib/utils";

interface VideoTileProps {
  displayName: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isHost: boolean;
  isLocal?: boolean;
  isLarge?: boolean;
}

export function VideoTile({
  displayName,
  stream,
  isMuted,
  isVideoEnabled,
  isHost,
  isLocal = false,
  isLarge = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach the MediaStream to the <video> element whenever it changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = getInitials(displayName);
  const color = avatarColor(displayName);
  const showVideo = isVideoEnabled && stream !== null;

  return (
    <div
      className={clsx(
        "relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center",
        isLarge ? "aspect-video w-full" : "aspect-video"
      )}
    >
      {/* Video element */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // mute local video to prevent echo
          className="w-full h-full object-cover"
        />
      ) : (
        /* Avatar fallback when video is off */
        <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold", color)}>
          {initials}
        </div>
      )}

      {/* Name + indicators bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-1.5">
          {isHost && (
            <Crown size={12} className="text-yellow-400" />
          )}
          <span className="text-white text-xs font-medium truncate max-w-[120px]">
            {displayName} {isLocal && "(You)"}
          </span>
        </div>
        {isMuted && (
          <div className="bg-red-500 rounded-full p-0.5">
            <MicOff size={10} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
