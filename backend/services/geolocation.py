"""
AeroSmog.AI — Geolocation Service
Converts a client IP address → city name + lat/lon automatically.
Uses ip-api.com (free, no key required, 1000 req/min).
Falls back to browser Geolocation API coords if passed.
"""
import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)

IP_API_URL = "http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,lat,lon,timezone,isp"


class LocationResult:
    def __init__(self, city: str, region: str, country: str,
                 lat: float, lon: float, timezone: str, source: str):
        self.city = city
        self.region = region
        self.country = country
        self.lat = lat
        self.lon = lon
        self.timezone = timezone
        self.source = source  # "ip" | "browser" | "manual"

    def dict(self):
        return {
            "city": self.city,
            "region": self.region,
            "country": self.country,
            "lat": self.lat,
            "lon": self.lon,
            "timezone": self.timezone,
            "source": self.source,
        }


async def detect_location_from_ip(ip: str) -> Optional[LocationResult]:
    """
    Given a client IP address, returns city + coordinates.
    Returns None if lookup fails (e.g., private IP / localhost).
    """
    # Private / localhost IPs — ip-api returns fail for these
    private_prefixes = ("127.", "::1", "10.", "192.168.", "172.16.", "172.17.",
                        "172.18.", "172.19.", "172.20.", "172.21.", "172.22.",
                        "172.23.", "172.24.", "172.25.", "172.26.", "172.27.",
                        "172.28.", "172.29.", "172.30.", "172.31.")
    if any(ip.startswith(p) for p in private_prefixes):
        logger.info(f"Private IP {ip} — skipping ip-api lookup")
        return None

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(IP_API_URL.format(ip=ip))
            resp.raise_for_status()
            data = resp.json()

        if data.get("status") == "success":
            return LocationResult(
                city=data.get("city", "Unknown"),
                region=data.get("regionName", ""),
                country=data.get("country", ""),
                lat=float(data["lat"]),
                lon=float(data["lon"]),
                timezone=data.get("timezone", "UTC"),
                source="ip",
            )
        else:
            logger.warning(f"ip-api failed for {ip}: {data.get('message')}")
            return None
    except Exception as e:
        logger.error(f"Geolocation lookup error for {ip}: {e}")
        return None


def location_from_browser_coords(lat: float, lon: float, city: str = "Your Location") -> LocationResult:
    """Creates a LocationResult from browser Geolocation API coordinates."""
    return LocationResult(
        city=city,
        region="",
        country="",
        lat=lat,
        lon=lon,
        timezone="UTC",
        source="browser",
    )


async def reverse_geocode(lat: float, lon: float) -> str:
    """
    Reverse geocode lat/lon → city name using Open-Meteo geocoding API.
    Returns city string or "Unknown Location".
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    headers = {"User-Agent": "AeroSmogAI/1.0"}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        address = data.get("address", {})
        city = (address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("county")
                or "Unknown Location")
        return city
    except Exception as e:
        logger.warning(f"Reverse geocode failed: {e}")
        return "Unknown Location"
