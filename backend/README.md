# AeroSmog.AI — Backend README

## 🌫️ AI-Powered Personalized Weather & AQI Health Advisory

FastAPI backend for PS-4: auto-detects location, fetches live AQI + weather, generates personalized AI health advisories using Groq LLaMA-3.

---

## 📁 Project Structure

```
backend/
├── main.py                    ← FastAPI app entry point
├── config.py                  ← Settings (reads from .env)
├── database.py                ← SQLite DB setup
├── requirements.txt
├── .env.example               ← Copy → .env and add keys
│
├── models/
│   ├── user.py                ← User profile model (age, health, occupation)
│   ├── alert.py               ← Alert history model
│   └── advisory.py            ← API response schemas
│
├── routers/
│   ├── location.py            ← GET /api/location/detect
│   ├── aqi.py                 ← GET /api/aqi/live
│   ├── weather.py             ← GET /api/weather/current, /forecast
│   ├── profile.py             ← CRUD /api/profile/
│   └── advisory.py            ← POST /api/advisory/generate
│
└── services/
    ├── geolocation.py         ← IP → city (ip-api.com)
    ├── aqi_service.py         ← WAQI real-time AQI
    ├── weather_service.py     ← Open-Meteo (free, no key)
    └── ai_service.py          ← Groq LLaMA-3 advisory generator
```

---

## ⚡ Quick Start

### 1. Get API Keys (both free)

| Key | Where to get |
|-----|-------------|
| **WAQI_API_KEY** | https://aqicn.org/data-platform/token/ (instant, free) |
| **GROQ_API_KEY** | https://console.groq.com (free tier, no credit card) |

### 2. Setup

```bash
cd backend

# Copy and fill environment file
copy .env.example .env
# Edit .env — add your WAQI_API_KEY and GROQ_API_KEY

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Verify

Open http://localhost:8000/docs — you'll see the full interactive API docs.

Test auto-location:
```
http://localhost:8000/api/location/detect
```

---

## 🔑 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check + endpoint list |
| GET | `/api/location/detect` | **Auto-detect city from IP / GPS** |
| GET | `/api/aqi/live?lat=&lon=` | Live AQI data |
| GET | `/api/aqi/category/{aqi}` | AQI label + color |
| GET | `/api/weather/current?lat=&lon=` | Current weather |
| GET | `/api/weather/forecast?lat=&lon=` | 7-day forecast |
| POST | `/api/profile/` | Create user profile |
| GET | `/api/profile/{session_id}` | Get profile |
| PATCH | `/api/profile/{session_id}` | Update profile |
| DELETE | `/api/profile/{session_id}` | Delete profile |
| GET | `/api/profile/options/all` | Dropdown options |
| POST | `/api/advisory/generate` | **Generate AI advisory** |
| GET | `/api/advisory/history` | Past 7-day advisories |
| GET | `/api/advisory/trend` | AQI trend for chart |

---

## 🤖 AI Advisory

- **With Groq key**: Uses `llama-3.1-70b-versatile` for personalized plain-English advisory
- **Without Groq key**: Falls back to smart rule-based advisory (still personalized)
- Advisory is saved to DB every time it's generated → powers trend chart

---

## 🗄️ Database

SQLite (`aerosmog.db`) — auto-created on first run. No setup needed.

Tables:
- `user_profiles` — profile per browser session
- `alert_history` — every advisory generated (for trend chart)

---

## 🌐 External APIs Used (All Free)

| API | Purpose | Key Required |
|-----|---------|-------------|
| ip-api.com | IP → city/coords | ❌ No |
| Nominatim (OSM) | Reverse geocode | ❌ No |
| Open-Meteo | Weather + forecast | ❌ No |
| WAQI (aqicn.org) | Real-time AQI | ✅ Yes (free) |
| Groq | AI advisory text | ✅ Yes (free) |
