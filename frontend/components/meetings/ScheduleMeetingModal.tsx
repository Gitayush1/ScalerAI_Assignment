"use client";

import { useState } from "react";
import { CalendarCheck, Copy, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createMeeting } from "@/lib/api";
import { formatMeetingId, buildJoinUrl } from "@/lib/utils";
import type { Meeting } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onScheduled: (meeting: Meeting) => void;
  onError: (msg: string) => void;
}

type Step = "form" | "success";

export function ScheduleMeetingModal({ open, onClose, onScheduled, onError }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [scheduledMeeting, setScheduledMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Meeting title is required.";
    if (!date) e.date = "Please select a date.";
    if (!time) e.time = "Please select a time.";
    if (date && time) {
      const dt = new Date(`${date}T${time}`);
      if (dt <= new Date()) e.date = "Meeting must be scheduled in the future.";
    }
    const d = parseInt(duration, 10);
    if (isNaN(d) || d < 1 || d > 1440) e.duration = "Duration must be between 1 and 1440 minutes.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSchedule() {
    if (!validate()) return;
    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const meeting = await createMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        meeting_type: "scheduled",
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(duration, 10),
        host_name: "Ayush",
      });
      setScheduledMeeting(meeting);
      setStep("success");
      onScheduled(meeting);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!scheduledMeeting) return;
    const url = buildJoinUrl(scheduledMeeting.meeting_id);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    // Reset form on close
    setStep("form");
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setDuration("60");
    setErrors({});
    setScheduledMeeting(null);
    setCopied(false);
    onClose();
  }

  // Min date for the date picker = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal open={open} onClose={handleClose} title="Schedule a Meeting" size="lg">
      {step === "form" ? (
        <div className="px-6 py-5 flex flex-col gap-4">
          <Input
            label="Meeting title *"
            placeholder="e.g. Weekly Standup"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Optional — what is this meeting about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date *"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
            <Input
              label="Time *"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              error={errors.time}
            />
          </div>
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            max={1440}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            error={errors.duration}
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSchedule} loading={loading}>
              Schedule Meeting
            </Button>
          </div>
        </div>
      ) : (
        /* Success state */
        scheduledMeeting && (
          <div className="px-6 py-6 flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CalendarCheck size={26} className="text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                Meeting Scheduled!
              </h3>
              <p className="text-sm text-gray-500">
                Your meeting has been created successfully.
              </p>
            </div>
            <div className="w-full bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Title</span>
                <span className="font-medium text-gray-900">{scheduledMeeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Meeting ID</span>
                <span className="font-mono font-medium text-gray-900">
                  {formatMeetingId(scheduledMeeting.meeting_id)}
                </span>
              </div>
              {scheduledMeeting.scheduled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-medium text-gray-900">
                    {new Date(scheduledMeeting.scheduled_at).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">
                  {scheduledMeeting.duration_minutes} min
                </span>
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" onClick={handleClose}>
                Done
              </Button>
              <Button className="flex-1 gap-2" onClick={handleCopy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy Invite Link"}
              </Button>
            </div>
          </div>
        )
      )}
    </Modal>
  );
}
