"""
Meeting router — all /api/meetings endpoints.
Routers are thin: validate input via Pydantic, delegate to MeetingService.
"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse, MeetingListResponse
from app.schemas.participant import JoinMeetingRequest, ParticipantResponse
from app.services.meeting_service import MeetingService
from app.services.participant_service import ParticipantService
from app.schemas.participant import ParticipantCreate

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _to_response(meeting) -> MeetingResponse:
    """Convert ORM Meeting to MeetingResponse, injecting participant_count."""
    data = MeetingResponse.model_validate(meeting)
    data.participant_count = len(meeting.participants)
    return data


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db)):
    meeting = MeetingService.create_meeting(db, data)
    return _to_response(meeting)


@router.get("", response_model=MeetingListResponse)
def list_meetings(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    meetings = MeetingService.get_meetings(db, skip=skip, limit=limit)
    return MeetingListResponse(
        meetings=[_to_response(m) for m in meetings],
        total=len(meetings),
    )


@router.get("/upcoming", response_model=List[MeetingResponse])
def upcoming_meetings(db: Session = Depends(get_db)):
    meetings = MeetingService.get_upcoming_meetings(db)
    return [_to_response(m) for m in meetings]


@router.get("/recent", response_model=List[MeetingResponse])
def recent_meetings(db: Session = Depends(get_db)):
    meetings = MeetingService.get_recent_meetings(db)
    return [_to_response(m) for m in meetings]


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = MeetingService.get_meeting_by_meeting_id(db, meeting_id)
    return _to_response(meeting)


@router.post("/{meeting_id}/join", response_model=MeetingResponse)
def join_meeting(
    meeting_id: str,
    body: JoinMeetingRequest,
    db: Session = Depends(get_db),
):
    """
    Join a meeting: activates it if scheduled, then adds the participant.
    Returns updated meeting details so the frontend can proceed to the room.
    """
    meeting = MeetingService.join_meeting(db, meeting_id)
    # Add participant record
    ParticipantService.add_participant(
        db,
        meeting_id,
        ParticipantCreate(
            display_name=body.display_name,
            is_host=False,
        ),
    )
    return _to_response(meeting)


@router.post("/{meeting_id}/leave", response_model=MeetingResponse)
def leave_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = MeetingService.leave_meeting(db, meeting_id)
    return _to_response(meeting)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: str, data: MeetingUpdate, db: Session = Depends(get_db)
):
    meeting = MeetingService.update_meeting(db, meeting_id, data)
    return _to_response(meeting)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    MeetingService.delete_meeting(db, meeting_id)
