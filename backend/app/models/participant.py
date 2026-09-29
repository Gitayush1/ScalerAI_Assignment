"""
Participant ORM model.

Each row represents one user's presence in one meeting session.
Designed so that future WebSocket/WebRTC signaling can reference
participant rows by id for real-time state updates.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


def _now():
    return datetime.now(timezone.utc)


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)

    # FK to meetings.id (not the human-readable meeting_id)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)

    display_name = Column(String(100), nullable=False)

    joined_at = Column(DateTime, nullable=False, default=_now)
    left_at = Column(DateTime, nullable=True)  # null while still in the meeting

    is_host = Column(Boolean, nullable=False, default=False)
    is_muted = Column(Boolean, nullable=False, default=False)
    is_video_enabled = Column(Boolean, nullable=False, default=True)

    meeting = relationship("Meeting", back_populates="participants")

    # Index for fast look-up of participants by meeting
    __table_args__ = (
        Index("ix_participants_meeting_id", "meeting_id"),
    )
