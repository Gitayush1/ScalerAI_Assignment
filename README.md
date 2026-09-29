# Meetly — Video Conferencing Web Application

A full-stack Zoom-inspired video conferencing app built as a fullstack SDE assignment.
Meetly supports instant meetings, scheduled meetings, real camera/microphone preview,
participant management, in-meeting chat, screen sharing, and shareable invite links.

---

## Features

| Feature | Details |
|---|---|
| Instant meeting | One-click → unique meeting ID generated → enter room |
| Join by ID/link | Enter `123 456 789` or a full invite URL |
| Schedule meeting | Date, time, duration picker → confirmation with copy invite |
| Pre-join screen | Camera preview, toggle mic/video before entering |
| Meeting room | Live camera feed via `getUserMedia`, mute/video toggle |
| Screen sharing | `getDisplayMedia` — graceful error if denied |
| Participants panel | Avatar, mic state, host badge, mute-all, remove participant |
| In-meeting chat | Real-time-feel local chat with scrolling message list |
| Copy invite link | `clipboard.writeText` + toast confirmation |
| Upcoming meetings | Dashboard + Calendar page |
| Recent meetings | Dashboard + Meetings page (tabbed) |
| Settings page | Preference overview |
| Responsive | Mobile drawer, stacked cards, full-screen dialogs |
| Seed data | 5 realistic demo meetings inserted on first run |

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **React 18** with hooks
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icons
- **date-fns** — date formatting

### Backend
- **Python 3.13**
- **FastAPI** — REST API framework
- **SQLAlchemy 2** — ORM
- **Pydantic v2** — request/response validation
- **SQLite** — embedded database
- **Uvicorn** — ASGI server

---

## Architecture

```
Browser
  └── Next.js (App Router)
        ├── app/page.tsx                  — Dashboard
        ├── app/meeting/[meetingId]/      — Pre-join + Meeting room
        ├── app/meetings/                 — Meetings list
        ├── app/calendar/                 — Calendar view
        ├── app/settings/                 — Settings
        ├── components/
        │   ├── layout/     AppShell, Sidebar, Header
        │   ├── dashboard/  QuickActions, MeetingCard, Upcoming, Recent
        │   ├── meetings/   CreateMeetingModal, JoinMeetingModal, ScheduleMeetingModal
        │   ├── meeting-room/ MeetingRoom, VideoGrid, VideoTile, MeetingControls,
        │   │                 ParticipantsPanel, ChatPanel
        │   └── ui/         Button, Input, Modal, Toast, EmptyState, Skeleton
        ├── hooks/           useMeetings, useMedia, useToast
        ├── lib/api.ts       — All fetch() calls centralised here
        ├── lib/utils.ts     — Formatting helpers
        └── types/index.ts   — Shared TypeScript interfaces

FastAPI (localhost:8000)
  ├── /api/meetings          — CRUD + upcoming/recent
  ├── /api/meetings/{id}/join
  ├── /api/meetings/{id}/leave
  └── /api/meetings/{id}/participants

SQLite (meetly.db)
  ├── meetings      — id, meeting_id, title, type, status, scheduled_at …
  └── participants  — id, meeting_id (FK), display_name, joined_at, left_at …
```

### Participant State Architecture

Three distinct layers are kept separate intentionally:

1. **UI state** (`MeetingRoom.tsx`) — local React state for mute/video toggles, participant list rendered on screen.
2. **Backend persistence** (`participants` table) — durable join/leave records written via the REST API.
3. **Future real-time layer** — a WebSocket/WebRTC server would sit between 1 and 2, broadcasting state changes. The code is structured so this layer can be added without refactoring the existing two layers.

---

## Database Schema

```sql
CREATE TABLE meetings (
    id              INTEGER PRIMARY KEY,
    meeting_id      VARCHAR(20) UNIQUE NOT NULL,   -- 9-digit random ID
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    host_name       VARCHAR(100) DEFAULT 'Ayush',
    meeting_type    VARCHAR(20) DEFAULT 'instant', -- 'instant' | 'scheduled'
    scheduled_at    DATETIME,
    duration_minutes INTEGER DEFAULT 60,
    join_url        VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled'|'active'|'completed'
    created_at      DATETIME NOT NULL,
    updated_at      DATETIME NOT NULL
);

CREATE TABLE participants (
    id               INTEGER PRIMARY KEY,
    meeting_id       INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    display_name     VARCHAR(100) NOT NULL,
    joined_at        DATETIME NOT NULL,
    left_at          DATETIME,          -- NULL while still in the meeting
    is_host          BOOLEAN DEFAULT FALSE,
    is_muted         BOOLEAN DEFAULT FALSE,
    is_video_enabled BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX ix_meetings_meeting_id   ON meetings(meeting_id);
CREATE INDEX ix_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX ix_participants_meeting_id ON participants(meeting_id);
```

### Meeting ID generation
Random 9-digit integer (`100_000_000`–`999_999_999`), collision-checked against the DB, retried up to 10 times. Displayed as `123 456 789` (spaces added client-side for readability).

---

## API Documentation

| Method | Path | Description |
|---|---|---|
| POST | `/api/meetings` | Create meeting (instant or scheduled) |
| GET | `/api/meetings` | List all meetings |
| GET | `/api/meetings/upcoming` | Future scheduled meetings |
| GET | `/api/meetings/recent` | Completed / active meetings |
| GET | `/api/meetings/{id}` | Get single meeting |
| POST | `/api/meetings/{id}/join` | Join meeting (activates if scheduled) |
| POST | `/api/meetings/{id}/leave` | Leave meeting (marks completed) |
| PATCH | `/api/meetings/{id}` | Update meeting fields |
| DELETE | `/api/meetings/{id}` | Delete / cancel meeting |
| GET | `/api/meetings/{id}/participants` | List participants |
| POST | `/api/meetings/{id}/participants` | Add participant |
| PATCH | `/api/meetings/{id}/participants/{pid}` | Update participant state |

Interactive docs: http://localhost:8000/docs

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Seed demo data
python -m app.seed

# Start the API server
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Swagger UI at  http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start dev server
npm run dev
# App available at http://localhost:3000
```

---

## Environment Variables

### backend/.env
```
DATABASE_URL=sqlite:///./meetly.db
FRONTEND_URL=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Project Structure

```
/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    Dashboard
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── meeting/[meetingId]/
│   │   │   ├── page.tsx                Meeting page (pre-join + room)
│   │   │   └── PreJoinScreen.tsx
│   │   ├── meetings/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── layout/     Sidebar, Header, AppShell
│   │   ├── dashboard/  QuickActions, MeetingCard, Upcoming, Recent
│   │   ├── meetings/   Create, Join, Schedule modals
│   │   ├── meeting-room/ MeetingRoom, VideoGrid, VideoTile, Controls,
│   │   │                 ParticipantsPanel, ChatPanel
│   │   └── ui/         Button, Input, Modal, Toast, EmptyState, Skeleton
│   ├── hooks/           useMeetings, useMedia, useToast
│   ├── lib/             api.ts, utils.ts
│   └── types/           index.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py        FastAPI app + CORS + startup
│   │   ├── database.py    SQLAlchemy engine + session
│   │   ├── models/        meeting.py, participant.py
│   │   ├── schemas/       meeting.py, participant.py
│   │   ├── routers/       meetings.py, participants.py
│   │   ├── services/      meeting_service.py, participant_service.py
│   │   └── seed.py        Demo data
│   └── requirements.txt
│
└── README.md
```

---

## Assumptions

1. **Authentication intentionally omitted.** All actions run as a default user "Ayush". The schema is designed to add a `users` table and `user_id` FK to meetings/participants without breaking existing logic.

2. **Real multi-user WebRTC signaling is outside scope.** The meeting room shows the user's actual camera/microphone via `getUserMedia`. Simulated remote participants are added after 2 seconds to demonstrate the multi-participant UI. A production system would add a WebSocket/WebRTC signaling server (e.g. mediasoup, LiveKit) as a third layer between the UI state and the backend persistence — the code is structured to support this cleanly.

3. **Chat is local-only.** Messages are stored in React state and not persisted. In production, a WebSocket channel would sync messages.

4. **Screen sharing is real** — it uses `getDisplayMedia()` and shares the actual screen stream within the local tab.

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
# Push to GitHub, connect repo to Vercel
# Set environment variable: NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend → Render / Railway
```bash
# Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
# Set environment variables: DATABASE_URL, FRONTEND_URL
```

### Database note
SQLite works fine for development and single-instance deployments with a persistent volume.
For production on ephemeral filesystems (Render free tier, Railway), either:
- Mount a persistent volume and point `DATABASE_URL` to it, or
- Migrate to PostgreSQL by changing `DATABASE_URL` to a Postgres connection string — SQLAlchemy handles both transparently.
