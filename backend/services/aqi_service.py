"""
AeroSmog.AI — AQI Service
Fetches real-time AQI data from WAQI (World Air Quality Index) API.
WAQI token: https://aqicn.org/data-platform/token/ (free)
"""
import httpx
import logging
from typing import Optional
from models.advisory import AQIData
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

WAQI_BASE = "https://api.waqi.info"


def _aqi_category(aqi: int) -> str:
    """Convert AQI number to WHO/EPA category label."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


def _parse_iaqi(iaqi: dict, key: str) -> Optional[float]:
    entry = iaqi.get(key)
    if entry and "v" in entry:
        return float(entry["v"])
    return None


async def get_aqi_by_city(city: str) -> Optional[AQIData]:
    """Fetch AQI for a named city from WAQI."""
    token = settings.waqi_api_key
    url = f"{WAQI_BASE}/feed/{city}/?token={token}"
    return await _fetch_and_parse(url, city)


async def get_aqi_by_coords(lat: float, lon: float, city: str = "") -> Optional[AQIData]:
    """Fetch AQI for the nearest station from WAQI, falling back to Open-Meteo Air Quality."""
    token = settings.waqi_api_key
    url = f"{WAQI_BASE}/feed/geo:{lat};{lon}/?token={token}"
    result = await _fetch_and_parse(url, f"{lat},{lon}")
    if result:
        return result

    # Fallback to Open-Meteo Air Quality (always works, free, no key needed)
    return await get_aqi_from_open_meteo(lat, lon, city)


async def get_aqi_from_open_meteo(lat: float, lon: float, city: str = "") -> Optional[AQIData]:
    """Fallback: Fetch real-time AQI and pollutants from Open-Meteo Air Quality API."""
    try:
        url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality"
            f"?latitude={lat}&longitude={lon}"
            f"&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide"
        )
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            curr = data.get("current", {})
            aqi_val = int(curr.get("us_aqi") or 35)

            return AQIData(
                aqi=aqi_val,
                aqi_category=_aqi_category(aqi_val),
                dominant_pollutant="pm25",
                pm25=float(curr.get("pm2_5") or 0),
                pm10=float(curr.get("pm10") or 0),
                o3=float(curr.get("ozone") or 0),
                no2=float(curr.get("nitrogen_dioxide") or 0),
                so2=float(curr.get("sulphur_dioxide") or 0),
                co=float(curr.get("carbon_monoxide") or 0),
                city=city or f"Lat {lat:.2f}, Lon {lon:.2f}",
                station="Open-Meteo Satellite Station",
                last_updated=curr.get("time", ""),
            )
    except Exception as e:
        logger.error(f"Open-Meteo AQI error: {e}")
        return None


async def _fetch_and_parse(url: str, fallback_city: str) -> Optional[AQIData]:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        if data.get("status") != "ok":
            logger.warning(f"WAQI returned non-ok: {data}")
            return None

        d = data["data"]
        aqi_raw = d.get("aqi", 0)
        try:
            aqi_val = int(aqi_raw)
        except (ValueError, TypeError):
            aqi_val = 0

        iaqi = d.get("iaqi", {})
        city_name = (d.get("city", {}).get("name") or fallback_city)
        station = city_name
        dominant = d.get("dominentpol", "pm25")
        time_str = d.get("time", {}).get("s", "")

        return AQIData(
            aqi=aqi_val,
            aqi_category=_aqi_category(aqi_val),
            dominant_pollutant=dominant,
            pm25=_parse_iaqi(iaqi, "pm25"),
            pm10=_parse_iaqi(iaqi, "pm10"),
            o3=_parse_iaqi(iaqi, "o3"),
            no2=_parse_iaqi(iaqi, "no2"),
            so2=_parse_iaqi(iaqi, "so2"),
            co=_parse_iaqi(iaqi, "co"),
            city=city_name,
            station=station,
            last_updated=time_str,
        )
    except Exception as e:
        logger.error(f"WAQI fetch error: {e}")
        return None


async def get_aqi_history_by_coords(lat: float, lon: float) -> list:
    """
    Fetch 7-day historical AQI from WAQI historical endpoint.
    Returns list of {date, aqi} dicts.
    """
    # WAQI doesn't provide history directly; we return stored DB data instead.
    # This function is a placeholder — history is served from DB alert_history.
    return []
