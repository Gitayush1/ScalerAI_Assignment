"""
Meeting ORM model.

meeting_type: 'instant' | 'scheduled'
status:       'scheduled' | 'active' | 'completed'
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from sqlalchemy.orm import relationship
from app.database import Base


def _now():
    return datetime.now(timezone.utc)


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    # Human-readable Zoom-style ID, e.g. "123456789"
    meeting_id = Column(String(20), unique=True, nullable=False, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    host_name = Column(String(100), nullable=False, default="Ayush")

    # 'instant' or 'scheduled'
    meeting_type = Column(String(20), nullable=False, default="instant")

    # When the meeting is planned to start (null for instant meetings until they go active)
    scheduled_at = Column(DateTime, nullable=True)

    duration_minutes = Column(Integer, nullable=False, default=60)

    # Shareable join URL stored for convenience
    join_url = Column(String(500), nullable=True)

    # 'scheduled' | 'active' | 'completed'
    status = Column(String(20), nullable=False, default="scheduled")

    created_at = Column(DateTime, nullable=False, default=_now)
    updated_at = Column(DateTime, nullable=False, default=_now, onupdate=_now)

    # One meeting → many participants
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")

    # Index on scheduled_at for efficient upcoming-meetings queries
    __table_args__ = (
        Index("ix_meetings_scheduled_at", "scheduled_at"),
    )
