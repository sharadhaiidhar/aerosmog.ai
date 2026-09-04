"""
AeroSmog.AI — Advisory Router
Main endpoint: POST /api/advisory/generate
Pulls weather + AQI + profile → generates AI advisory → saves to DB → returns full response.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import Optional, List
from database import get_session
from models.user import UserProfile
from models.alert import AlertHistory, AlertHistoryRead
from models.advisory import AdvisoryResponse
from services.aqi_service import get_aqi_by_coords, get_aqi_by_city
from services.weather_service import get_current_weather, get_weather_forecast
from services.ai_service import generate_advisory, get_action_items, get_risk_level
from services.geolocation import reverse_geocode

router = APIRouter(prefix="/api/advisory", tags=["Advisory"])


@router.post("/generate", response_model=AdvisoryResponse)
async def generate_health_advisory(
    session_id: str = Query(..., description="Browser session UUID"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_session),
):
    """
    Core endpoint. Fetches live AQI + weather, loads user profile,
    generates personalized AI advisory, saves to history, and returns full response.
    """
    # ── 1. Load user profile (or use defaults) ─────────────────────────────
    profile = db.exec(
        select(UserProfile).where(UserProfile.session_id == session_id)
    ).first()

    age_group = profile.age_group.value if profile else "adult"
    health_condition = profile.health_condition.value if profile else "none"
    occupation = profile.occupation.value if profile else "indoor_worker"

    # ── 2. Resolve location ─────────────────────────────────────────────────
    if lat is None or lon is None:
        if profile and profile.preferred_lat:
            lat, lon = profile.preferred_lat, profile.preferred_lon
            city = profile.preferred_city or city
        elif city:
            # Rough geocode via Open-Meteo geocoding
            lat, lon = await _geocode_city(city)
        else:
            raise HTTPException(status_code=400, detail="Provide lat+lon or city parameter")

    if not city:
        city = await reverse_geocode(lat, lon)

    # ── 3. Fetch AQI and weather concurrently ───────────────────────────────
    import asyncio
    aqi_data, weather_data, forecast = await asyncio.gather(
        get_aqi_by_coords(lat, lon),
        get_current_weather(lat, lon),
        get_weather_forecast(lat, lon, 7),
    )

    if not aqi_data:
        # Retry by city name
        aqi_data = await get_aqi_by_city(city)
    if not aqi_data:
        raise HTTPException(status_code=503, detail="AQI data unavailable for this location")
    if not weather_data:
        raise HTTPException(status_code=503, detail="Weather data unavailable for this location")

    # ── 4. Generate AI advisory ─────────────────────────────────────────────
    advisory_text = await generate_advisory(
        city=city,
        aqi=aqi_data.aqi,
        aqi_category=aqi_data.aqi_category,
        pm25=aqi_data.pm25,
        temperature=weather_data.temperature,
        humidity=weather_data.humidity,
        wind_speed=weather_data.wind_speed,
        uv_index=weather_data.uv_index,
        age_group=age_group,
        health_condition=health_condition,
        occupation=occupation,
    )

    risk = get_risk_level(aqi_data.aqi, health_condition, age_group)
    actions = get_action_items(aqi_data.aqi, health_condition, occupation,
                               age_group, weather_data.uv_index)

    # ── 5. Save to alert history ────────────────────────────────────────────
    alert = AlertHistory(
        session_id=session_id,
        city=city,
        lat=lat,
        lon=lon,
        aqi=aqi_data.aqi,
        aqi_category=aqi_data.aqi_category,
        pm25=aqi_data.pm25,
        pm10=aqi_data.pm10,
        temperature=weather_data.temperature,
        humidity=weather_data.humidity,
        wind_speed=weather_data.wind_speed,
        uv_index=weather_data.uv_index,
        advisory_text=advisory_text,
        risk_level=risk,
        age_group=age_group,
        health_condition=health_condition,
        occupation=occupation,
    )
    db.add(alert)
    db.commit()

    # ── 6. Build and return full response ───────────────────────────────────
    return AdvisoryResponse(
        session_id=session_id,
        city=city,
        lat=lat,
        lon=lon,
        weather=weather_data,
        aqi=aqi_data,
        advisory_text=advisory_text,
        risk_level=risk,
        action_items=actions,
        forecast=forecast,
        generated_at=datetime.utcnow(),
    )


@router.get("/history", response_model=List[AlertHistoryRead])
def get_alert_history(
    session_id: str = Query(...),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_session),
):
    """Fetch past N days of advisory history for a session (7-day trend view)."""
    since = datetime.utcnow() - timedelta(days=days)
    alerts = db.exec(
        select(AlertHistory)
        .where(AlertHistory.session_id == session_id)
        .where(AlertHistory.created_at >= since)
        .order_by(AlertHistory.created_at.desc())
    ).all()
    return alerts


@router.get("/trend")
def get_aqi_trend(
    session_id: str = Query(...),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_session),
):
    """
    Return AQI trend data for charting — [{date, aqi, risk_level}] per day.
    """
    since = datetime.utcnow() - timedelta(days=days)
    alerts = db.exec(
        select(AlertHistory)
        .where(AlertHistory.session_id == session_id)
        .where(AlertHistory.created_at >= since)
        .order_by(AlertHistory.created_at.asc())
    ).all()

    # Group by date (take max AQI per day)
    trend_map = {}
    for a in alerts:
        day_key = a.created_at.strftime("%Y-%m-%d")
        if day_key not in trend_map or a.aqi > trend_map[day_key]["aqi"]:
            trend_map[day_key] = {
                "date": day_key,
                "aqi": a.aqi,
                "aqi_category": a.aqi_category,
                "risk_level": a.risk_level,
                "city": a.city,
            }

    return {"success": True, "trend": list(trend_map.values())}


async def _geocode_city(city: str):
    """Rough geocode city name → lat/lon using Nominatim."""
    import httpx
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": city, "format": "json", "limit": 1}
    headers = {"User-Agent": "AeroSmogAI/1.0"}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            data = resp.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception:
        pass
    raise HTTPException(status_code=400, detail=f"Could not geocode city: {city}")
