"use client";

import {
  Mic, MicOff,
  Video, VideoOff,
  Monitor, MonitorOff,
  Users, MessageSquare,
  PhoneOff, MoreHorizontal,
  Copy, Check,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isParticipantsOpen: boolean;
  isChatOpen: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
  onCopyInvite: () => void;
  inviteCopied: boolean;
}

interface ControlButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  className?: string;
}

function ControlButton({ onClick, icon, label, active, danger, className }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={clsx(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150",
        danger
          ? "bg-red-600 hover:bg-red-700 text-white"
          : active
          ? "bg-gray-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white",
        className
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-[10px] font-medium hidden sm:block">{label}</span>
    </button>
  );
}

export function MeetingControls({
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  isParticipantsOpen,
  isChatOpen,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleParticipants,
  onToggleChat,
  onLeave,
  onCopyInvite,
  inviteCopied,
}: MeetingControlsProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="relative bg-gray-900 border-t border-gray-700 px-4 py-3 flex items-center justify-between gap-2">
      {/* Left — mute / video */}
      <div className="flex items-center gap-1">
        <ControlButton
          onClick={onToggleMute}
          icon={isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          label={isMuted ? "Unmute" : "Mute"}
          active={isMuted}
        />
        <ControlButton
          onClick={onToggleVideo}
          icon={isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
          label={isVideoEnabled ? "Stop Video" : "Start Video"}
          active={!isVideoEnabled}
        />
      </div>

      {/* Centre — secondary controls */}
      <div className="flex items-center gap-1">
        <ControlButton
          onClick={onToggleScreenShare}
          icon={isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
          label={isScreenSharing ? "Stop Share" : "Share Screen"}
          active={isScreenSharing}
        />
        <ControlButton
          onClick={onToggleParticipants}
          icon={<Users size={18} />}
          label="Participants"
          active={isParticipantsOpen}
        />
        <ControlButton
          onClick={onToggleChat}
          icon={<MessageSquare size={18} />}
          label="Chat"
          active={isChatOpen}
        />

        {/* More dropdown */}
        <div className="relative">
          <ControlButton
            onClick={() => setMoreOpen((v) => !v)}
            icon={<MoreHorizontal size={18} />}
            label="More"
          />
          {moreOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 w-44">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                  onClick={() => { onCopyInvite(); setMoreOpen(false); }}
                >
                  {inviteCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {inviteCopied ? "Copied!" : "Copy Invite Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right — leave */}
      <ControlButton
        onClick={onLeave}
        icon={<PhoneOff size={18} />}
        label="Leave"
        danger
      />
    </div>
  );
}
