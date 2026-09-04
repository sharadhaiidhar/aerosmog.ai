"""
AeroSmog.AI — User Profile Router
CRUD endpoints for the user personalization profile.
Profile is keyed by session_id (browser UUID — set by frontend).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from database import get_session
from models.user import (
    UserProfile, UserProfileCreate, UserProfileUpdate, UserProfileRead,
    AgeGroup, HealthCondition, Occupation,
)

router = APIRouter(prefix="/api/profile", tags=["User Profile"])


@router.post("/", response_model=UserProfileRead, status_code=201)
def create_profile(profile: UserProfileCreate, db: Session = Depends(get_session)):
    """Create a new user profile. Call this on first visit."""
    # Prevent duplicate session profiles
    existing = db.exec(
        select(UserProfile).where(UserProfile.session_id == profile.session_id)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists for this session. Use PATCH to update.")

    db_profile = UserProfile(
        session_id=profile.session_id,
        name=profile.name,
        age_group=profile.age_group,
        health_condition=profile.health_condition,
        occupation=profile.occupation,
        preferred_city=profile.preferred_city,
        preferred_lat=profile.preferred_lat,
        preferred_lon=profile.preferred_lon,
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


@router.get("/{session_id}", response_model=UserProfileRead)
def get_profile(session_id: str, db: Session = Depends(get_session)):
    """Fetch user profile by session_id."""
    profile = db.exec(
        select(UserProfile).where(UserProfile.session_id == session_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/{session_id}", response_model=UserProfileRead)
def update_profile(
    session_id: str,
    updates: UserProfileUpdate,
    db: Session = Depends(get_session),
):
    """Update an existing user profile (partial update)."""
    profile = db.exec(
        select(UserProfile).where(UserProfile.session_id == session_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    profile.updated_at = datetime.utcnow()

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{session_id}", status_code=204)
def delete_profile(session_id: str, db: Session = Depends(get_session)):
    """Delete a user profile."""
    profile = db.exec(
        select(UserProfile).where(UserProfile.session_id == session_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.delete(profile)
    db.commit()


@router.get("/options/all")
def get_profile_options():
    """Return all valid enum options for profile form dropdowns."""
    return {
        "age_groups": [e.value for e in AgeGroup],
        "health_conditions": [e.value for e in HealthCondition],
        "occupations": [e.value for e in Occupation],
    }
