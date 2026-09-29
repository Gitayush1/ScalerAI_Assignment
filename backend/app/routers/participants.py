"""
Participant router — /api/meetings/{meeting_id}/participants endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.participant import ParticipantCreate, ParticipantUpdate, ParticipantResponse
from app.services.participant_service import ParticipantService

router = APIRouter(prefix="/api/meetings", tags=["participants"])


@router.get("/{meeting_id}/participants", response_model=List[ParticipantResponse])
def get_participants(meeting_id: str, db: Session = Depends(get_db)):
    return ParticipantService.get_participants(db, meeting_id)


@router.post(
    "/{meeting_id}/participants",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_participant(
    meeting_id: str, data: ParticipantCreate, db: Session = Depends(get_db)
):
    return ParticipantService.add_participant(db, meeting_id, data)


@router.patch(
    "/{meeting_id}/participants/{participant_id}",
    response_model=ParticipantResponse,
)
def update_participant(
    meeting_id: str,
    participant_id: int,
    data: ParticipantUpdate,
    db: Session = Depends(get_db),
):
    return ParticipantService.update_participant(db, meeting_id, participant_id, data)
