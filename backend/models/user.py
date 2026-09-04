"""
AeroSmog.AI — User Profile Model
Stores age group, health condition, occupation for personalization.
Compatible with SQLModel 0.0.42 + Pydantic v2.
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AgeGroup(str, Enum):
    child = "child"           # 0–12
    teen = "teen"             # 13–17
    adult = "adult"           # 18–59
    senior = "senior"         # 60+


class HealthCondition(str, Enum):
    none = "none"
    asthma = "asthma"
    copd = "copd"
    heart_disease = "heart_disease"
    diabetes = "diabetes"
    pregnancy = "pregnancy"
    allergies = "allergies"


class Occupation(str, Enum):
    indoor_worker = "indoor_worker"
    outdoor_worker = "outdoor_worker"
    athlete = "athlete"
    student = "student"
    retired = "retired"
    other = "other"


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)               # browser session UUID
    name: Optional[str] = None
    age_group: AgeGroup = AgeGroup.adult
    health_condition: HealthCondition = HealthCondition.none
    occupation: Occupation = Occupation.indoor_worker
    preferred_city: Optional[str] = None              # optional override
    preferred_lat: Optional[float] = None
    preferred_lon: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Pydantic schemas (request/response) ───────────────────────────────────────

class UserProfileCreate(SQLModel):
    session_id: str
    name: Optional[str] = None
    age_group: AgeGroup = AgeGroup.adult
    health_condition: HealthCondition = HealthCondition.none
    occupation: Occupation = Occupation.indoor_worker
    preferred_city: Optional[str] = None
    preferred_lat: Optional[float] = None
    preferred_lon: Optional[float] = None


class UserProfileUpdate(SQLModel):
    name: Optional[str] = None
    age_group: Optional[AgeGroup] = None
    health_condition: Optional[HealthCondition] = None
    occupation: Optional[Occupation] = None
    preferred_city: Optional[str] = None
    preferred_lat: Optional[float] = None
    preferred_lon: Optional[float] = None


class UserProfileRead(SQLModel):
    id: int
    session_id: str
    name: Optional[str]
    age_group: AgeGroup
    health_condition: HealthCondition
    occupation: Occupation
    preferred_city: Optional[str]
    preferred_lat: Optional[float]
    preferred_lon: Optional[float]
    created_at: datetime
    updated_at: datetime
