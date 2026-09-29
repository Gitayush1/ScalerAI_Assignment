"""
Pydantic schemas for Participant request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class JoinMeetingRequest(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)


class ParticipantCreate(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    is_host: bool = False
    is_muted: bool = False
    is_video_enabled: bool = True


class ParticipantUpdate(BaseModel):
    is_muted: Optional[bool] = None
    is_video_enabled: Optional[bool] = None
    left_at: Optional[datetime] = None


class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    display_name: str
    joined_at: datetime
    left_at: Optional[datetime]
    is_host: bool
    is_muted: bool
    is_video_enabled: bool

    model_config = {"from_attributes": True}
