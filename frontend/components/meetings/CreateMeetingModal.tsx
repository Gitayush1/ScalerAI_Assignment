"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createMeeting } from "@/lib/api";
import type { Meeting } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (meeting: Meeting) => void;
  onError: (msg: string) => void;
}

export function CreateMeetingModal({ open, onClose, onCreated, onError }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const meeting = await createMeeting({
        title: "Instant Meeting",
        meeting_type: "instant",
        host_name: "Ayush",
      });
      onCreated(meeting);
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create meeting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Start a New Meeting">
      <div className="px-6 py-6 flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Video size={30} className="text-blue-600" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 text-sm leading-relaxed">
            You&apos;ll be taken straight into a new meeting room. Share the invite
            link with others once you&apos;re inside.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleStart} loading={loading}>
            Start Meeting
          </Button>
        </div>
      </div>
    </Modal>
  );
}
