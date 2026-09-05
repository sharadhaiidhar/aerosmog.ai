// api/client.ts — Axios instance + all API calls
import axios from 'axios';
import type { AdvisoryResponse, UserProfile, AlertHistory, TrendEntry } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://aerosmog-ai-1.onrender.com/api';
const api = axios.create({ baseURL: BASE_URL, timeout: 60000 });

// ── Location ──────────────────────────────────────────────────────────────────
export const detectLocation = (lat?: number, lon?: number) =>
  api.get('/location/detect', { params: lat ? { lat, lon } : {} }).then(r => r.data);

// ── Weather ───────────────────────────────────────────────────────────────────
export const getCurrentWeather = (lat: number, lon: number) =>
  api.get('/weather/current', { params: { lat, lon } }).then(r => r.data.data);

export const getWeatherForecast = (lat: number, lon: number, days = 7) =>
  api.get('/weather/forecast', { params: { lat, lon, days } }).then(r => r.data.data);

// ── AQI ───────────────────────────────────────────────────────────────────────
export const getLiveAqi = (lat: number, lon: number) =>
  api.get('/aqi/live', { params: { lat, lon } }).then(r => r.data.data);

// ── Profile ───────────────────────────────────────────────────────────────────
export const getProfile = (sessionId: string): Promise<UserProfile | null> =>
  api.get(`/profile/${sessionId}`).then(r => r.data).catch(() => null);

export const createProfile = (payload: object): Promise<UserProfile> =>
  api.post('/profile/', payload).then(r => r.data);

export const updateProfile = (sessionId: string, payload: object): Promise<UserProfile> =>
  api.patch(`/profile/${sessionId}`, payload).then(r => r.data);

export const getProfileOptions = () =>
  api.get('/profile/options/all').then(r => r.data);

// ── Advisory ─────────────────────────────────────────────────────────────────
export const generateAdvisory = (
  sessionId: string, lat: number, lon: number
): Promise<AdvisoryResponse> =>
  api.post('/advisory/generate', null, {
    params: { session_id: sessionId, lat, lon },
  }).then(r => r.data);

export const getAlertHistory = (sessionId: string, days = 7): Promise<AlertHistory[]> =>
  api.get('/advisory/history', { params: { session_id: sessionId, days } }).then(r => r.data);

export const getAqiTrend = (sessionId: string, days = 7): Promise<{ trend: TrendEntry[] }> =>
  api.get('/advisory/trend', { params: { session_id: sessionId, days } }).then(r => r.data);
