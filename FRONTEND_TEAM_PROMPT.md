# AeroSmog.AI — Frontend Team Prompt

## Project: AI-Powered Personalized Weather & AQI Health Advisory Dashboard

---

## 🎯 What You're Building

A **React + TypeScript** web dashboard called **AeroSmog.AI** that:
- **Auto-detects the user's location** (no manual input — browser GPS or IP-based)
- Shows **live AQI + weather** for their location
- Displays a **personalized AI health advisory** based on their profile
- Lets users set up a **health profile** (age group, condition, occupation)
- Shows a **7-day AQI trend chart** (alert history)

---

## 🛠️ Tech Stack (Recommended)

| Layer | Tool |
|-------|------|
| Framework | **React 18 + TypeScript** (Vite) |
| Styling | **Tailwind CSS** + shadcn/ui |
| Charts | **Recharts** |
| API calls | **Axios** or native `fetch` |
| State | **Zustand** (or React Context) |
| Icons | **Lucide React** |
| Routing | **React Router v6** |

---

## 🔗 Backend API Base URL

```
http://localhost:8000
```

All endpoints are documented at `http://localhost:8000/docs`

---

## 📡 API Endpoints to Call

### 1. Auto-Detect Location (CALL FIRST ON PAGE LOAD)
```
GET /api/location/detect
```
- The browser should request **Geolocation API** permission first
- If granted, send: `GET /api/location/detect?lat={lat}&lon={lon}`
- If denied, call without params — backend auto-detects from IP
- Response:
```json
{
  "success": true,
  "location": {
    "city": "Mumbai",
    "region": "Maharashtra",
    "country": "India",
    "lat": 19.0760,
    "lon": 72.8777,
    "timezone": "Asia/Kolkata",
    "source": "browser"
  }
}
```

### 2. Get Live AQI
```
GET /api/aqi/live?lat={lat}&lon={lon}
```
Response includes: `aqi`, `aqi_category`, `pm25`, `pm10`, `o3`, `no2`, `dominant_pollutant`

### 3. Get Current Weather
```
GET /api/weather/current?lat={lat}&lon={lon}
```
Response includes: `temperature`, `feels_like`, `humidity`, `wind_speed`, `uv_index`, `weather_description`

### 4. Get 7-Day Forecast
```
GET /api/weather/forecast?lat={lat}&lon={lon}&days=7
```

### 5. Create / Get User Profile
```
POST /api/profile/          ← on first visit
GET  /api/profile/{session_id}
PATCH /api/profile/{session_id}  ← on profile update
```
Profile fields:
```json
{
  "session_id": "uuid-from-localstorage",
  "age_group": "adult",           // child | teen | adult | senior
  "health_condition": "asthma",   // none | asthma | copd | heart_disease | diabetes | pregnancy | allergies
  "occupation": "outdoor_worker"  // indoor_worker | outdoor_worker | athlete | student | retired | other
}
```

### 6. Generate AI Advisory (MAIN CALL — do after location + profile set)
```
POST /api/advisory/generate?session_id={id}&lat={lat}&lon={lon}
```
Response:
```json
{
  "city": "Mumbai",
  "weather": { "temperature": 32, "humidity": 78, "uv_index": 7, ... },
  "aqi": { "aqi": 145, "aqi_category": "Unhealthy for Sensitive Groups", "pm25": 55.2, ... },
  "advisory_text": "Given your asthma and outdoor work, today's AQI of 145...",
  "risk_level": "high",
  "action_items": ["Wear N95 mask outdoors", "Have rescue medication ready"],
  "forecast": [ { "date": "2026-09-05", "max_temp": 34, "weather_description": "Partly Cloudy" } ],
  "generated_at": "2026-09-04T15:24:00Z"
}
```

### 7. Get AQI Trend (for chart)
```
GET /api/advisory/trend?session_id={id}&days=7
```
Returns: `[{ date, aqi, aqi_category, risk_level }]` — use for the line chart

### 8. Get Alert History
```
GET /api/advisory/history?session_id={id}&days=7
```

---

## 🎨 UI Pages & Components

### Page 1: Dashboard (Home `/`)
```
┌─────────────────────────────────────────────────────────┐
│  🌫️ AeroSmog.AI          [📍 Mumbai, India]   [👤 Profile]│
├──────────────┬──────────────────────────────────────────┤
│  AQI Card    │  Weather Card                            │
│  ┌────────┐  │  🌡️ 32°C  feels like 38°C               │
│  │  145   │  │  💧 Humidity: 78%                        │
│  │Unhealthy│ │  🌬️ Wind: 14 km/h                       │
│  │for Sens.│ │  ☀️ UV Index: 7 (High)                   │
│  └────────┘  │                                          │
├──────────────┴──────────────────────────────────────────┤
│  🤖 AI Health Advisory (personalized)                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │ "Given your asthma and work outdoors, today's AQI   ││
│  │  of 145 puts you at significant risk. Wear your N95 ││
│  │  mask before leaving home. Carry your inhaler..."   ││
│  └─────────────────────────────────────────────────────┘│
│  ⚠️ Risk Level: HIGH    🔴                               │
│  Action Items: [Wear N95] [Keep inhaler] [Avoid peak hrs]│
├─────────────────────────────────────────────────────────┤
│  📊 7-Day AQI Trend (Line Chart)                         │
│  [Recharts LineChart with AQI on Y-axis, dates on X]    │
├─────────────────────────────────────────────────────────┤
│  📅 7-Day Weather Forecast (Horizontal Cards)            │
│  [Mon][Tue][Wed][Thu][Fri][Sat][Sun]                    │
└─────────────────────────────────────────────────────────┘
```

### Page 2: Profile Setup (`/profile`)
- Form with dropdowns for: age_group, health_condition, occupation, name
- Save button → PATCH `/api/profile/{session_id}`
- Show "Your profile helps us personalize advisories" messaging

### Page 3: Alert History (`/history`)
- Table/list of past advisories
- Each row: date, city, AQI, risk level, advisory snippet
- Filter by date range

---

## 🎨 Color Coding for AQI
| AQI Range | Category | Color |
|-----------|----------|-------|
| 0–50 | Good | `#00e400` (green) |
| 51–100 | Moderate | `#ffff00` (yellow) |
| 101–150 | Unhealthy for Sensitive | `#ff7e00` (orange) |
| 151–200 | Unhealthy | `#ff0000` (red) |
| 201–300 | Very Unhealthy | `#8f3f97` (purple) |
| 301+ | Hazardous | `#7e0023` (maroon) |

---

## 🔑 Session Management
- On first load, generate a `UUID` and store in `localStorage` as `aerosmog_session_id`
- Use this session_id in ALL API calls
- This is how the backend links the profile + history to the user

```js
// utils/session.ts
import { v4 as uuidv4 } from 'uuid';

export function getSessionId(): string {
  let id = localStorage.getItem('aerosmog_session_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('aerosmog_session_id', id);
  }
  return id;
}
```

---

## 📍 Auto Location Logic (IMPORTANT)
```js
// utils/location.ts
export async function detectLocation() {
  // 1. Try browser GPS first (most accurate)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const res = await fetch(`http://localhost:8000/api/location/detect?lat=${lat}&lon=${lon}`);
        resolve(await res.json());
      },
      async () => {
        // 2. Fall back to IP-based detection
        const res = await fetch('http://localhost:8000/api/location/detect');
        resolve(await res.json());
      }
    );
  });
}
```

---

## 🔄 Page Load Flow
```
1. App loads → getSessionId() from localStorage
2. detectLocation() → GET /api/location/detect
3. Check if profile exists → GET /api/profile/{session_id}
   - If 404 → redirect to /profile setup page
   - If found → continue
4. Call advisory → POST /api/advisory/generate?session_id=&lat=&lon=
5. Render dashboard with response data
6. Load trend → GET /api/advisory/trend?session_id=
```

---

## 🚀 Setup Instructions
```bash
npm create vite@latest aerosmog-frontend -- --template react-ts
cd aerosmog-frontend
npm install
npm install axios zustand react-router-dom recharts lucide-react uuid
npm install -D tailwindcss postcss autoprefixer @types/uuid
npx tailwindcss init -p
npm run dev
```

---

## ✅ Acceptance Criteria
- [ ] Location auto-detected without manual input on page load
- [ ] AQI shown with correct color and category label
- [ ] AI advisory text displayed prominently
- [ ] Risk level badge shown (low/moderate/high/very_high)
- [ ] Action items shown as chips/badges
- [ ] 7-day AQI trend line chart renders
- [ ] 7-day weather forecast cards render
- [ ] Profile form saves and updates
- [ ] All API calls use session_id from localStorage
- [ ] Loading skeletons shown while fetching
- [ ] Error states handled gracefully
- [ ] Mobile responsive layout
