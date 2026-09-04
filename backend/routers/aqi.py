"""
AeroSmog.AI — AQI Router
Endpoints for live AQI data and 7-day trend.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services.aqi_service import get_aqi_by_city, get_aqi_by_coords

router = APIRouter(prefix="/api/aqi", tags=["AQI"])


@router.get("/live")
async def get_live_aqi(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    city: Optional[str] = Query(None, description="City name (fallback)"),
):
    """
    Get real-time AQI for a location.
    Priority: lat/lon > city name.
    """
    if lat is not None and lon is not None:
        data = await get_aqi_by_coords(lat, lon)
    elif city:
        data = await get_aqi_by_city(city)
    else:
        raise HTTPException(status_code=400, detail="Provide lat+lon or city")

    if not data:
        raise HTTPException(status_code=503, detail="AQI data unavailable for this location")

    return {"success": True, "data": data}


@router.get("/category/{aqi}")
async def get_aqi_category(aqi: int):
    """Return AQI category label and color code for a given AQI value."""
    if aqi <= 50:
        return {"aqi": aqi, "category": "Good", "color": "#00e400", "hex": "green"}
    elif aqi <= 100:
        return {"aqi": aqi, "category": "Moderate", "color": "#ffff00", "hex": "yellow"}
    elif aqi <= 150:
        return {"aqi": aqi, "category": "Unhealthy for Sensitive Groups", "color": "#ff7e00", "hex": "orange"}
    elif aqi <= 200:
        return {"aqi": aqi, "category": "Unhealthy", "color": "#ff0000", "hex": "red"}
    elif aqi <= 300:
        return {"aqi": aqi, "category": "Very Unhealthy", "color": "#8f3f97", "hex": "purple"}
    else:
        return {"aqi": aqi, "category": "Hazardous", "color": "#7e0023", "hex": "maroon"}
