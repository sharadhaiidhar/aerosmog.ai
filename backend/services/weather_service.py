"""
AeroSmog.AI — Weather Service
Uses Open-Meteo API (https://open-meteo.com) — completely FREE, no API key.
Fetches current weather + 7-day hourly forecast for any lat/lon.
"""
import httpx
import logging
from typing import Optional, List
from models.advisory import WeatherData, ForecastDay

logger = logging.getLogger(__name__)

OPEN_METEO_BASE = "https://api.open-meteo.com/v1"

# WMO Weather Interpretation Codes → human-readable
WMO_DESCRIPTIONS = {
    0: "Clear Sky",
    1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
    85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Thunderstorm with Heavy Hail",
}


async def get_current_weather(lat: float, lon: float) -> Optional[WeatherData]:
    """Fetch current weather conditions from Open-Meteo."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m", "apparent_temperature", "relative_humidity_2m",
            "wind_speed_10m", "wind_direction_10m", "uv_index",
            "precipitation", "weather_code",
        ],
        "wind_speed_unit": "kmh",
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OPEN_METEO_BASE}/forecast", params=params)
            resp.raise_for_status()
            data = resp.json()

        c = data["current"]
        code = c.get("weather_code", 0)
        return WeatherData(
            temperature=round(c.get("temperature_2m", 0), 1),
            feels_like=round(c.get("apparent_temperature", 0), 1),
            humidity=round(c.get("relative_humidity_2m", 0), 1),
            wind_speed=round(c.get("wind_speed_10m", 0), 1),
            wind_direction=int(c.get("wind_direction_10m", 0)),
            uv_index=round(c.get("uv_index", 0), 1),
            precipitation=round(c.get("precipitation", 0), 2),
            weather_code=code,
            weather_description=WMO_DESCRIPTIONS.get(code, "Unknown"),
        )
    except Exception as e:
        logger.error(f"Open-Meteo current weather error: {e}")
        return None


async def get_weather_forecast(lat: float, lon: float, days: int = 7) -> List[ForecastDay]:
    """Fetch N-day daily weather forecast from Open-Meteo."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": [
            "temperature_2m_max", "temperature_2m_min",
            "weather_code", "precipitation_sum",
        ],
        "timezone": "auto",
        "forecast_days": days,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OPEN_METEO_BASE}/forecast", params=params)
            resp.raise_for_status()
            data = resp.json()

        daily = data["daily"]
        result = []
        for i, date in enumerate(daily["time"]):
            code = daily["weather_code"][i]
            result.append(ForecastDay(
                date=date,
                max_temp=round(daily["temperature_2m_max"][i], 1),
                min_temp=round(daily["temperature_2m_min"][i], 1),
                weather_description=WMO_DESCRIPTIONS.get(code, "Unknown"),
                precipitation_sum=round(daily.get("precipitation_sum", [0]*days)[i], 2),
                aqi_avg=None,  # filled in by advisory router from DB history
            ))
        return result
    except Exception as e:
        logger.error(f"Open-Meteo forecast error: {e}")
        return []
