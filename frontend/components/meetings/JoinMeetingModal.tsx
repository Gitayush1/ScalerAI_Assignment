"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getMeeting } from "@/lib/api";
import { normalizeMeetingId } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the validated meetingId so the page can redirect to pre-join */
  onValidated: (meetingId: string, displayName: string) => void;
  onError: (msg: string) => void;
}

export function JoinMeetingModal({ open, onClose, onValidated, onError }: Props) {
  const [meetingInput, setMeetingInput] = useState("");
  const [displayName, setDisplayName] = useState("Ayush");
  const [loading, setLoading] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [nameError, setNameError] = useState("");

  function validate() {
    let ok = true;
    if (!meetingInput.trim()) {
      setMeetingError("Please enter a meeting ID or invite link.");
      ok = false;
    } else {
      setMeetingError("");
    }
    if (!displayName.trim()) {
      setNameError("Please enter your display name.");
      ok = false;
    } else {
      setNameError("");
    }
    return ok;
  }

  async function handleJoin() {
    if (!validate()) return;
    const id = normalizeMeetingId(meetingInput);
    setLoading(true);
    try {
      await getMeeting(id); // validates the meeting exists
      onValidated(id, displayName.trim());
      onClose();
    } catch {
      setMeetingError("Meeting not found. Please check the meeting ID or invitation link.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setMeetingInput("");
    setDisplayName("Ayush");
    setMeetingError("");
    setNameError("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Join a Meeting">
      <div className="px-6 py-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
          <LogIn size={18} className="text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700">
            Enter a meeting ID or paste an invite link.
          </p>
        </div>

        <Input
          label="Meeting ID or invite link"
          placeholder="e.g. 123 456 789 or https://..."
          value={meetingInput}
          onChange={(e) => setMeetingInput(e.target.value)}
          error={meetingError}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          autoFocus
        />

        <Input
          label="Your display name"
          placeholder="Enter your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={nameError}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        />

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleJoin} loading={loading}>
            Join Meeting
          </Button>
        </div>
      </div>
    </Modal>
  );
}
