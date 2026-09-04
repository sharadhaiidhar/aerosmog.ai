"""
AeroSmog.AI — Alert History Model
Stores every AI advisory generated so we can show a 7-day trend.
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class AlertHistory(SQLModel, table=True):
    __tablename__ = "alert_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    city: str
    lat: float
    lon: float
    aqi: int
    aqi_category: str          # Good / Moderate / Unhealthy / ...
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    uv_index: Optional[float] = None
    advisory_text: str         # AI-generated advisory
    risk_level: str            # low / moderate / high / very_high
    age_group: str
    health_condition: str
    occupation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AlertHistoryRead(SQLModel):
    id: int
    session_id: str
    city: str
    aqi: int
    aqi_category: str
    pm25: Optional[float]
    temperature: Optional[float]
    advisory_text: str
    risk_level: str
    created_at: datetime
