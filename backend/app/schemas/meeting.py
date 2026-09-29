"""
Pydantic schemas for Meeting request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    host_name: str = Field(default="Ayush", max_length=100)
    meeting_type: str = Field(default="instant")
    scheduled_at: Optional[datetime] = None
    duration_minutes: int = Field(default=60, ge=1, le=1440)

    @field_validator("meeting_type")
    @classmethod
    def validate_meeting_type(cls, v: str) -> str:
        allowed = {"instant", "scheduled"}
        if v not in allowed:
            raise ValueError(f"meeting_type must be one of {allowed}")
        return v

    @field_validator("scheduled_at")
    @classmethod
    def validate_scheduled_at(cls, v: Optional[datetime]) -> Optional[datetime]:
        # scheduled meetings must have a future scheduled_at
        # Strict validation is done in the service layer where meeting_type is also known
        return v


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"scheduled", "active", "completed"}
            if v not in allowed:
                raise ValueError(f"status must be one of {allowed}")
        return v


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    title: str
    description: Optional[str]
    host_name: str
    meeting_type: str
    scheduled_at: Optional[datetime]
    duration_minutes: int
    join_url: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    participant_count: int = 0

    model_config = {"from_attributes": True}


class MeetingListResponse(BaseModel):
    meetings: List[MeetingResponse]
    total: int
