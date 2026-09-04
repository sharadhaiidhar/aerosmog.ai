"""
AeroSmog.AI — FastAPI Application Entry Point
Run with: uvicorn main:app --reload --port 8000
Docs at: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from database import create_db_and_tables
from routers import location, aqi, weather, profile, advisory

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables. Shutdown: nothing needed."""
    create_db_and_tables()
    print(f"[OK] AeroSmog.AI backend started - {settings.app_name} v{settings.app_version}")
    print(f"[DOCS] API Docs: http://localhost:8000/docs")
    yield
    print("[STOP] AeroSmog.AI shutting down.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "AI-Powered Personalized Weather & AQI Health Advisory API. "
        "Auto-detects location, fetches live AQI + weather, and generates "
        "personalized health advisories using Groq LLaMA-3."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allow React/Next.js frontend) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(location.router)
app.include_router(aqi.router)
app.include_router(weather.router)
app.include_router(profile.router)
app.include_router(advisory.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "endpoints": {
            "auto_location": "GET /api/location/detect",
            "live_aqi": "GET /api/aqi/live?lat=&lon=",
            "current_weather": "GET /api/weather/current?lat=&lon=",
            "weather_forecast": "GET /api/weather/forecast?lat=&lon=",
            "create_profile": "POST /api/profile/",
            "get_profile": "GET /api/profile/{session_id}",
            "update_profile": "PATCH /api/profile/{session_id}",
            "generate_advisory": "POST /api/advisory/generate?session_id=&lat=&lon=",
            "alert_history": "GET /api/advisory/history?session_id=",
            "aqi_trend": "GET /api/advisory/trend?session_id=",
        },
    }
