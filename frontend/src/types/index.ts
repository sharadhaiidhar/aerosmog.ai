// types/index.ts — All shared TypeScript types

export interface LocationResult {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  source: string;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  uv_index: number;
  precipitation: number;
  weather_code: number;
  weather_description: string;
}

export interface AQIData {
  aqi: number;
  aqi_category: string;
  dominant_pollutant: string;
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  so2?: number;
  co?: number;
  city: string;
  station: string;
  last_updated?: string;
}

export interface ForecastDay {
  date: string;
  max_temp: number;
  min_temp: number;
  aqi_avg?: number;
  weather_description: string;
  precipitation_sum: number;
}

export interface AdvisoryResponse {
  session_id: string;
  city: string;
  lat: number;
  lon: number;
  weather: WeatherData;
  aqi: AQIData;
  advisory_text: string;
  risk_level: string;
  action_items: string[];
  forecast: ForecastDay[];
  generated_at: string;
}

export interface UserProfile {
  id: number;
  session_id: string;
  name?: string;
  age_group: string;
  health_condition: string;
  occupation: string;
  preferred_city?: string;
  preferred_lat?: number;
  preferred_lon?: number;
  created_at: string;
  updated_at: string;
}

export interface AlertHistory {
  id: number;
  session_id: string;
  city: string;
  aqi: number;
  aqi_category: string;
  pm25?: number;
  temperature?: number;
  advisory_text: string;
  risk_level: string;
  created_at: string;
}

export interface TrendEntry {
  date: string;
  aqi: number;
  aqi_category: string;
  risk_level: string;
  city: string;
}
