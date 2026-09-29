"""
MeetingService — all business logic for meetings lives here.
Routers stay thin; they delegate to this service.

Meeting ID generation:
  - Generate a random 9-digit number (100_000_000 – 999_999_999).
  - Check the DB for collisions; retry up to 10 times.
  - Format for display: "123 456 789" (spaces added on the frontend for readability).
  This is easy to explain: random + collision check = uniqueness guarantee.
"""

import random
import os
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingUpdate


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _now() -> datetime:
    """Return current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)


def _generate_meeting_id(db: Session) -> str:
    """
    Generate a unique 9-digit numeric meeting ID.
    Retries up to 10 times to handle (extremely unlikely) collisions.
    """
    for _ in range(10):
        candidate = str(random.randint(100_000_000, 999_999_999))
        exists = db.query(Meeting).filter(Meeting.meeting_id == candidate).first()
        if not exists:
            return candidate
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not generate a unique meeting ID. Please try again.",
    )


class MeetingService:

    @staticmethod
    def create_meeting(db: Session, data: MeetingCreate) -> Meeting:
        """Create a new meeting (instant or scheduled)."""
        if data.meeting_type == "scheduled":
            if not data.scheduled_at:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="scheduled_at is required for scheduled meetings.",
                )
            # Make scheduled_at timezone-aware for comparison
            sched = data.scheduled_at
            if sched.tzinfo is None:
                sched = sched.replace(tzinfo=timezone.utc)
            if sched <= _now():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="scheduled_at must be a future date/time.",
                )

        meeting_id = _generate_meeting_id(db)
        join_url = f"{FRONTEND_URL}/meeting/{meeting_id}"

        # Instant meetings start as 'active'; scheduled ones as 'scheduled'
        initial_status = "active" if data.meeting_type == "instant" else "scheduled"

        now = _now()
        meeting = Meeting(
            meeting_id=meeting_id,
            title=data.title,
            description=data.description,
            host_name=data.host_name,
            meeting_type=data.meeting_type,
            scheduled_at=data.scheduled_at,
            duration_minutes=data.duration_minutes,
            join_url=join_url,
            status=initial_status,
            created_at=now,
            updated_at=now,
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        return meeting

    @staticmethod
    def get_meetings(db: Session, skip: int = 0, limit: int = 50) -> List[Meeting]:
        return (
            db.query(Meeting)
            .order_by(Meeting.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_upcoming_meetings(db: Session) -> List[Meeting]:
        """Return future scheduled meetings ordered by scheduled_at ASC."""
        now = _now()
        return (
            db.query(Meeting)
            .filter(
                Meeting.meeting_type == "scheduled",
                Meeting.status == "scheduled",
                Meeting.scheduled_at > now,
            )
            .order_by(Meeting.scheduled_at.asc())
            .all()
        )

    @staticmethod
    def get_recent_meetings(db: Session, limit: int = 10) -> List[Meeting]:
        """Return recently completed or active meetings ordered by created_at DESC."""
        return (
            db.query(Meeting)
            .filter(Meeting.status.in_(["completed", "active"]))
            .order_by(Meeting.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_meeting_by_meeting_id(db: Session, meeting_id: str) -> Meeting:
        meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meeting '{meeting_id}' not found.",
            )
        return meeting

    @staticmethod
    def update_meeting(db: Session, meeting_id: str, data: MeetingUpdate) -> Meeting:
        meeting = MeetingService.get_meeting_by_meeting_id(db, meeting_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(meeting, field, value)
        meeting.updated_at = _now()
        db.commit()
        db.refresh(meeting)
        return meeting

    @staticmethod
    def delete_meeting(db: Session, meeting_id: str) -> None:
        meeting = MeetingService.get_meeting_by_meeting_id(db, meeting_id)
        db.delete(meeting)
        db.commit()

    @staticmethod
    def join_meeting(db: Session, meeting_id: str) -> Meeting:
        """Mark a scheduled meeting as active when first person joins."""
        meeting = MeetingService.get_meeting_by_meeting_id(db, meeting_id)
        if meeting.status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This meeting has already ended.",
            )
        if meeting.status == "scheduled":
            meeting.status = "active"
            meeting.updated_at = _now()
            db.commit()
            db.refresh(meeting)
        return meeting

    @staticmethod
    def leave_meeting(db: Session, meeting_id: str) -> Meeting:
        """Called when the host leaves — marks meeting as completed."""
        meeting = MeetingService.get_meeting_by_meeting_id(db, meeting_id)
        meeting.status = "completed"
        meeting.updated_at = _now()
        db.commit()
        db.refresh(meeting)
        return meeting
