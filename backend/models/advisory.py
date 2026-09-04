"""
AeroSmog.AI — Advisory Response Schema (not a DB table)
Used only for API response typing.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WeatherData(BaseModel):
    temperature: float          # °C
    feels_like: float
    humidity: float             # %
    wind_speed: float           # km/h
    wind_direction: int         # degrees
    uv_index: float
    precipitation: float        # mm
    weather_code: int
    weather_description: str


class AQIData(BaseModel):
    aqi: int
    aqi_category: str           # Good / Moderate / Unhealthy etc.
    dominant_pollutant: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    city: str
    station: str
    last_updated: Optional[str] = None


class ForecastDay(BaseModel):
    date: str
    max_temp: float
    min_temp: float
    aqi_avg: Optional[float] = None
    weather_description: str
    precipitation_sum: float


class AdvisoryResponse(BaseModel):
    session_id: str
    city: str
    lat: float
    lon: float
    weather: WeatherData
    aqi: AQIData
    advisory_text: str          # AI personalized advisory
    risk_level: str             # low / moderate / high / very_high
    action_items: List[str]     # Quick action bullet points
    forecast: List[ForecastDay] # 7-day forecast
    generated_at: datetime
