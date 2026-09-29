"""
Seed script — populates the database with realistic demo data.

Run from the backend/ directory:
    python -m app.seed

What it creates:
  - 2 upcoming scheduled meetings (future dates)
  - 3 recent meetings (active / completed)
  - Sample participants for each meeting
"""

import sys
import os
import random
from datetime import datetime, timedelta, timezone

# Ensure the backend/ directory is on sys.path when run directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
import app.models  # noqa: F401 — registers ORM classes with Base
from app.models.meeting import Meeting
from app.models.participant import Participant

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _random_meeting_id(db) -> str:
    for _ in range(20):
        candidate = str(random.randint(100_000_000, 999_999_999))
        if not db.query(Meeting).filter(Meeting.meeting_id == candidate).first():
            return candidate
    raise RuntimeError("Could not generate unique meeting ID during seeding.")


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

now = _now()

SEED_MEETINGS = [
    # --- Upcoming scheduled meetings ---
    {
        "title": "Product Team Sync",
        "description": "Weekly product review and roadmap discussion with the full product team.",
        "host_name": "Ayush",
        "meeting_type": "scheduled",
        "scheduled_at": now + timedelta(days=1, hours=2),
        "duration_minutes": 60,
        "status": "scheduled",
        "participants": [
            {"display_name": "Ayush", "is_host": True},
            {"display_name": "Priya Sharma"},
            {"display_name": "Rahul Verma"},
        ],
    },
    {
        "title": "Interview Preparation",
        "description": "Mock technical interview session for upcoming SDE-2 round.",
        "host_name": "Ayush",
        "meeting_type": "scheduled",
        "scheduled_at": now + timedelta(days=3, hours=5),
        "duration_minutes": 90,
        "status": "scheduled",
        "participants": [
            {"display_name": "Ayush", "is_host": True},
            {"display_name": "Neha Gupta"},
        ],
    },
    # --- Recent / active meetings ---
    {
        "title": "Project Discussion",
        "description": "Architecture review for the new microservices migration.",
        "host_name": "Ayush",
        "meeting_type": "instant",
        "scheduled_at": None,
        "duration_minutes": 45,
        "status": "completed",
        "participants": [
            {"display_name": "Ayush", "is_host": True},
            {"display_name": "Amit Joshi"},
            {"display_name": "Sara Khan"},
            {"display_name": "Dev Patel"},
        ],
    },
    {
        "title": "Weekly Standup",
        "description": "15-minute daily standup — what did we do, what are we doing, any blockers.",
        "host_name": "Ayush",
        "meeting_type": "instant",
        "scheduled_at": None,
        "duration_minutes": 15,
        "status": "completed",
        "participants": [
            {"display_name": "Ayush", "is_host": True},
            {"display_name": "Priya Sharma"},
            {"display_name": "Rahul Verma"},
            {"display_name": "Neha Gupta"},
            {"display_name": "Amit Joshi"},
        ],
    },
    {
        "title": "Design Review",
        "description": "Reviewing new UI mockups for the dashboard redesign project.",
        "host_name": "Ayush",
        "meeting_type": "instant",
        "scheduled_at": None,
        "duration_minutes": 30,
        "status": "active",
        "participants": [
            {"display_name": "Ayush", "is_host": True},
            {"display_name": "Sara Khan"},
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Meeting).count()
        if existing > 0:
            print(f"Database already has {existing} meetings. Skipping seed to avoid duplicates.")
            print("To re-seed, delete meetly.db and run this script again.")
            return

        for m_data in SEED_MEETINGS:
            meeting_id = _random_meeting_id(db)
            join_url = f"{FRONTEND_URL}/meeting/{meeting_id}"

            # Adjust created_at for recent meetings to look realistic
            created_offset = timedelta(hours=random.randint(1, 72))
            created_at = _now() - created_offset if m_data["status"] in ("completed", "active") else _now()

            meeting = Meeting(
                meeting_id=meeting_id,
                title=m_data["title"],
                description=m_data["description"],
                host_name=m_data["host_name"],
                meeting_type=m_data["meeting_type"],
                scheduled_at=m_data["scheduled_at"],
                duration_minutes=m_data["duration_minutes"],
                join_url=join_url,
                status=m_data["status"],
                created_at=created_at,
                updated_at=created_at,
            )
            db.add(meeting)
            db.flush()  # get meeting.id before adding participants

            for p_data in m_data["participants"]:
                joined_offset = timedelta(minutes=random.randint(0, 5))
                left_at = None
                if m_data["status"] == "completed":
                    left_at = created_at + timedelta(minutes=m_data["duration_minutes"])

                participant = Participant(
                    meeting_id=meeting.id,
                    display_name=p_data["display_name"],
                    is_host=p_data.get("is_host", False),
                    is_muted=random.choice([True, False]),
                    is_video_enabled=random.choice([True, True, False]),
                    joined_at=created_at + joined_offset,
                    left_at=left_at,
                )
                db.add(participant)

            print(f"  ✓ Created meeting: '{m_data['title']}' ({meeting_id})")

        db.commit()
        print(f"\nSeeding complete. {len(SEED_MEETINGS)} meetings created.")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding Meetly database...")
    seed()
