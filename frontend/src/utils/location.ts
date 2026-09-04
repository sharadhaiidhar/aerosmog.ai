// utils/location.ts — Auto-detect location (browser GPS → IP fallback)
import axios from 'axios';

export interface LocationResult {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  source: 'browser' | 'ip' | 'manual';
}

export async function detectLocation(): Promise<LocationResult | null> {
  // 1. Try browser GPS first (most accurate)
  const browserCoords = await getBrowserCoords();

  if (browserCoords) {
    const res = await axios.get(`/api/location/detect`, {
      params: { lat: browserCoords.lat, lon: browserCoords.lon },
    });
    if (res.data?.success) return res.data.location;
  }

  // 2. Fall back to IP-based detection
  try {
    const res = await axios.get(`/api/location/detect`);
    if (res.data?.success) return res.data.location;
  } catch { /* ignore */ }

  return null;
}

function getBrowserCoords(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
