/**
 * api.ts — single source of truth for all backend requests.
 *
 * All fetch() calls live here. Components import typed functions,
 * never raw fetch. This makes it easy to swap the transport layer later.
 *
 * Base URL comes from NEXT_PUBLIC_API_URL env var (default: localhost:8000).
 */

import type {
  Meeting,
  Participant,
  CreateMeetingPayload,
  JoinMeetingPayload,
  UpdateParticipantPayload,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Internal helper ─────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    // Try to surface the FastAPI error detail
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(detail);
  }

  // 204 No Content — return null
  if (res.status === 204) return null as T;

  return res.json();
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export async function createMeeting(
  payload: CreateMeetingPayload
): Promise<Meeting> {
  return request<Meeting>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMeetings(): Promise<Meeting[]> {
  const data = await request<{ meetings: Meeting[]; total: number }>(
    "/api/meetings"
  );
  return data.meetings;
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  return request<Meeting[]>("/api/meetings/upcoming");
}

export async function getRecentMeetings(): Promise<Meeting[]> {
  return request<Meeting[]>("/api/meetings/recent");
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${meetingId}`);
}

export async function joinMeeting(
  meetingId: string,
  payload: JoinMeetingPayload
): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${meetingId}/join`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function leaveMeeting(meetingId: string): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${meetingId}/leave`, {
    method: "POST",
  });
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  return request<void>(`/api/meetings/${meetingId}`, { method: "DELETE" });
}

// ─── Participants ─────────────────────────────────────────────────────────────

export async function getParticipants(
  meetingId: string
): Promise<Participant[]> {
  return request<Participant[]>(`/api/meetings/${meetingId}/participants`);
}

export async function addParticipant(
  meetingId: string,
  payload: { display_name: string; is_host?: boolean }
): Promise<Participant> {
  return request<Participant>(`/api/meetings/${meetingId}/participants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateParticipant(
  meetingId: string,
  participantId: number,
  payload: UpdateParticipantPayload
): Promise<Participant> {
  return request<Participant>(
    `/api/meetings/${meetingId}/participants/${participantId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
