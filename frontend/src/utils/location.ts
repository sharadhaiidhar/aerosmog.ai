// utils/location.ts — Auto-detect location (browser GPS -> backend IP -> client IP -> fallback)
import { detectLocation as apiDetectLocation } from '../api/client';

export interface LocationResult {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  source: 'browser' | 'ip' | 'manual';
}

export async function detectLocation(): Promise<LocationResult> {
  // 1. Try browser GPS first
  try {
    const browserCoords = await getBrowserCoords();
    if (browserCoords) {
      const res = await apiDetectLocation(browserCoords.lat, browserCoords.lon);
      if (res?.success && res.location) {
        return { ...res.location, source: 'browser' };
      }
      // Fallback reverse geocode directly if backend returned empty
      return {
        city: 'Current Location',
        region: '',
        country: '',
        lat: browserCoords.lat,
        lon: browserCoords.lon,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        source: 'browser',
      };
    }
  } catch {
    /* continue to IP detection */
  }

  // 2. Try backend IP-based detection
  try {
    const res = await apiDetectLocation();
    if (res?.success && res.location) {
      return { ...res.location, source: 'ip' };
    }
  } catch {
    /* continue to client-side IP */
  }

  // 3. Fallback: Client-side IP lookup directly from browser (bypasses cloud proxy)
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          city: data.city || 'Detected City',
          region: data.region || '',
          country: data.country_name || '',
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          timezone: data.timezone || 'UTC',
          source: 'ip',
        };
      }
    }
  } catch {
    /* continue to default */
  }

  // 4. Default fallback: New Delhi (so user never sees a broken/blank dashboard)
  return {
    city: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
    timezone: 'Asia/Kolkata',
    source: 'manual',
  };
}

function getBrowserCoords(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 4000, enableHighAccuracy: false }
    );
  });
}
