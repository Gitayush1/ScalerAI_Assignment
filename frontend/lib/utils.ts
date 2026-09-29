/**
 * Utility helpers used across the frontend.
 */

import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

/** Format "123456789" → "123 456 789" for display */
export function formatMeetingId(id: string): string {
  return id.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

/** Strip spaces/dashes from a user-entered meeting ID */
export function normalizeMeetingId(input: string): string {
  // Also handle full URLs: extract the last path segment
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/meeting\/(\d+)/);
  if (urlMatch) return urlMatch[1];
  return trimmed.replace(/[\s\-]/g, "");
}

/** Format a date string for display in meeting cards */
export function formatMeetingDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  return format(date, "MMM d, yyyy · h:mm a");
}

/** Relative time string, e.g. "2 hours ago" */
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

/** Build a shareable join URL from a meeting ID */
export function buildJoinUrl(meetingId: string): string {
  if (typeof window === "undefined") return `/meeting/${meetingId}`;
  return `${window.location.origin}/meeting/${meetingId}`;
}

/** Generate a random local UUID for client-side use */
export function localId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Returns initials from a display name, e.g. "Ayush Sharma" → "AS" */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic avatar colour from a name string */
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-indigo-500",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
