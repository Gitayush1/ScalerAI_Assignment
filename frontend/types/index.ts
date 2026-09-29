// ─── Core domain types — mirrors the FastAPI Pydantic schemas ───────────────

export type MeetingType = "instant" | "scheduled";
export type MeetingStatus = "scheduled" | "active" | "completed";

export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  host_name: string;
  meeting_type: MeetingType;
  scheduled_at: string | null; // ISO 8601 string from API
  duration_minutes: number;
  join_url: string | null;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
  participant_count: number;
}

export interface Participant {
  id: number;
  meeting_id: number;
  display_name: string;
  joined_at: string;
  left_at: string | null;
  is_host: boolean;
  is_muted: boolean;
  is_video_enabled: boolean;
}

// ─── API request payloads ────────────────────────────────────────────────────

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  host_name?: string;
  meeting_type: MeetingType;
  scheduled_at?: string; // ISO 8601
  duration_minutes?: number;
}

export interface JoinMeetingPayload {
  display_name: string;
}

export interface UpdateParticipantPayload {
  is_muted?: boolean;
  is_video_enabled?: boolean;
  left_at?: string;
}

// ─── UI-only types ────────────────────────────────────────────────────────────

/** A participant as tracked locally inside the meeting room (not persisted) */
export interface LocalParticipant {
  id: string; // local UUID
  display_name: string;
  is_host: boolean;
  is_muted: boolean;
  is_video_enabled: boolean;
  is_screen_sharing: boolean;
  /** The actual MediaStream from getUserMedia — null when camera is off */
  stream: MediaStream | null;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

// ─── Toast notification ───────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
