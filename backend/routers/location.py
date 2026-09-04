"""
AeroSmog.AI — Location Router
Endpoint: GET /api/location/detect
Automatically detects city + coords from client IP address.
No manual input required from the user.
"""
from fastapi import APIRouter, Request, Query
from typing import Optional
from services.geolocation import (
    detect_location_from_ip,
    reverse_geocode,
    location_from_browser_coords,
)

router = APIRouter(prefix="/api/location", tags=["Location"])


@router.get("/detect")
async def detect_location(
    request: Request,
    lat: Optional[float] = Query(None, description="Override: browser GPS latitude"),
    lon: Optional[float] = Query(None, description="Override: browser GPS longitude"),
):
    """
    Auto-detect location from client IP address.
    If browser sends GPS coords via query params, those take priority.
    Returns: { city, region, country, lat, lon, timezone, source }
    """
    # 1. Browser GPS coords take highest priority (most accurate)
    if lat is not None and lon is not None:
        city = await reverse_geocode(lat, lon)
        result = location_from_browser_coords(lat, lon, city)
        return {"success": True, "location": result.dict()}

    # 2. Auto-detect from client IP
    client_ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or request.headers.get("X-Real-IP", "")
        or request.client.host
    )

    location = await detect_location_from_ip(client_ip)

    if location:
        return {"success": True, "location": location.dict()}

    # 3. Fallback — couldn't detect (private network / localhost)
    return {
        "success": False,
        "location": None,
        "message": "Could not auto-detect location. Please allow browser GPS access.",
        "client_ip": client_ip,
    }
