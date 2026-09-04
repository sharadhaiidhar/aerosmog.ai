"""
AeroSmog.AI — Weather Router
Endpoints for current weather + 7-day forecast.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services.weather_service import get_current_weather, get_weather_forecast

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("/current")
async def current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Get current weather conditions from Open-Meteo (free, no key)."""
    data = await get_current_weather(lat, lon)
    if not data:
        raise HTTPException(status_code=503, detail="Weather data unavailable")
    return {"success": True, "data": data}


@router.get("/forecast")
async def weather_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    days: int = Query(7, ge=1, le=14, description="Forecast days (1–14)"),
):
    """Get N-day weather forecast from Open-Meteo."""
    data = await get_weather_forecast(lat, lon, days)
    return {"success": True, "data": data, "days": len(data)}
