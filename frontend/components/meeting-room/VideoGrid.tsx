"use client";

import clsx from "clsx";
import { VideoTile } from "./VideoTile";
import type { LocalParticipant } from "@/types";

interface VideoGridProps {
  participants: LocalParticipant[];
  screenStream: MediaStream | null;
}

export function VideoGrid({ participants, screenStream }: VideoGridProps) {
  const count = participants.length;

  // Choose grid layout based on participant count
  const gridClass = clsx(
    "grid gap-2 w-full h-full p-2",
    count === 1 && "grid-cols-1",
    count === 2 && "grid-cols-2",
    count === 3 && "grid-cols-2",
    count >= 4 && "grid-cols-2 md:grid-cols-3"
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gray-900 p-2 gap-2">
      {/* Screen share takes priority as main tile */}
      {screenStream && (
        <div className="w-full flex-1 bg-gray-800 rounded-xl overflow-hidden">
          <video
            autoPlay
            playsInline
            ref={(el) => {
              if (el) el.srcObject = screenStream;
            }}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            Screen Share
          </div>
        </div>
      )}

      {/* Participant tiles */}
      <div className={screenStream ? "grid grid-cols-4 gap-2 h-24" : gridClass}>
        {participants.map((p) => (
          <VideoTile
            key={p.id}
            displayName={p.display_name}
            stream={p.stream}
            isMuted={p.is_muted}
            isVideoEnabled={p.is_video_enabled}
            isHost={p.is_host}
            isLocal={p.id === "local"}
            isLarge={count === 1 && !screenStream}
          />
        ))}
      </div>
    </div>
  );
}
