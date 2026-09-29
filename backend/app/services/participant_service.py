"""
ParticipantService — business logic for participant management.

Architecture note:
  Participant rows represent persistent join/leave records.
  Real-time mute/video state is updated via PATCH.
  In a future WebRTC implementation, a WebSocket layer would call
  these same service methods to persist state changes.
"""

from datetime import datetime, timezone
from typing import List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.meeting import Meeting
from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate, ParticipantUpdate


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ParticipantService:

    @staticmethod
    def _get_meeting(db: Session, meeting_id: str) -> Meeting:
        meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meeting '{meeting_id}' not found.",
            )
        return meeting

    @staticmethod
    def get_participants(db: Session, meeting_id: str) -> List[Participant]:
        meeting = ParticipantService._get_meeting(db, meeting_id)
        return (
            db.query(Participant)
            .filter(Participant.meeting_id == meeting.id)
            .order_by(Participant.joined_at.asc())
            .all()
        )

    @staticmethod
    def add_participant(
        db: Session, meeting_id: str, data: ParticipantCreate
    ) -> Participant:
        meeting = ParticipantService._get_meeting(db, meeting_id)
        participant = Participant(
            meeting_id=meeting.id,
            display_name=data.display_name,
            is_host=data.is_host,
            is_muted=data.is_muted,
            is_video_enabled=data.is_video_enabled,
            joined_at=_now(),
        )
        db.add(participant)
        db.commit()
        db.refresh(participant)
        return participant

    @staticmethod
    def update_participant(
        db: Session, meeting_id: str, participant_id: int, data: ParticipantUpdate
    ) -> Participant:
        meeting = ParticipantService._get_meeting(db, meeting_id)
        participant = (
            db.query(Participant)
            .filter(
                Participant.id == participant_id,
                Participant.meeting_id == meeting.id,
            )
            .first()
        )
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant {participant_id} not found in meeting {meeting_id}.",
            )
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(participant, field, value)
        db.commit()
        db.refresh(participant)
        return participant

    @staticmethod
    def mark_left(db: Session, meeting_id: str, participant_id: int) -> Participant:
        """Record when a participant leaves."""
        meeting = ParticipantService._get_meeting(db, meeting_id)
        participant = (
            db.query(Participant)
            .filter(
                Participant.id == participant_id,
                Participant.meeting_id == meeting.id,
            )
            .first()
        )
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant {participant_id} not found.",
            )
        participant.left_at = _now()
        db.commit()
        db.refresh(participant)
        return participant
