"""
AeroSmog.AI — AI Advisory Service
Uses Groq API (free tier — LLaMA-3.1-70B) to generate personalized,
plain-English health advisories based on AQI + weather + user profile.
Falls back to a rule-based advisory if Groq is unavailable.
"""
import logging
from typing import Optional
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _risk_level(aqi: int, health_condition: str, age_group: str) -> str:
    """Determine risk level from AQI + profile."""
    base = "low"
    if aqi > 300:
        base = "very_high"
    elif aqi > 200:
        base = "high"
    elif aqi > 150:
        base = "high" if health_condition != "none" else "moderate"
    elif aqi > 100:
        base = "moderate" if health_condition != "none" else "low"
    else:
        base = "low"

    # Sensitive groups get elevated risk
    sensitive = health_condition in ("asthma", "copd", "heart_disease", "pregnancy")
    vulnerable_age = age_group in ("child", "senior")
    if (sensitive or vulnerable_age) and base == "low" and aqi > 75:
        base = "moderate"

    return base


def _build_prompt(
    city: str,
    aqi: int,
    aqi_category: str,
    pm25: Optional[float],
    temperature: float,
    humidity: float,
    wind_speed: float,
    uv_index: float,
    age_group: str,
    health_condition: str,
    occupation: str,
) -> str:
    pm_info = f"PM2.5: {pm25} µg/m³" if pm25 is not None else "PM2.5: not available"
    return f"""You are AeroSmog AI, a health advisory assistant for air quality and weather.

Current conditions in {city}:
- AQI: {aqi} ({aqi_category})
- {pm_info}
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Wind Speed: {wind_speed} km/h
- UV Index: {uv_index}

User Profile:
- Age Group: {age_group}
- Health Condition: {health_condition}
- Occupation: {occupation}

Generate a personalized, plain-English health advisory (3-4 sentences). 
Be specific to this person's health condition and occupation. 
Do NOT use generic warnings. Mention specific risks and practical actions.
End with one encouraging sentence.
Keep it under 120 words."""


def _fallback_advisory(aqi: int, aqi_category: str, health_condition: str,
                       occupation: str, age_group: str) -> str:
    """Rule-based fallback if Groq API is unavailable."""
    if aqi <= 50:
        base = "Air quality is excellent today — great conditions for all outdoor activities."
    elif aqi <= 100:
        base = "Air quality is moderate. Most people can go outdoors normally."
    elif aqi <= 150:
        base = "Air quality is unhealthy for sensitive groups. Limit prolonged outdoor exertion."
    elif aqi <= 200:
        base = "Air quality is unhealthy. Avoid outdoor activities, especially strenuous ones."
    else:
        base = "Air quality is very unhealthy or hazardous. Stay indoors with windows closed."

    extras = []
    if health_condition == "asthma":
        extras.append("Keep your inhaler accessible and avoid dusty environments.")
    elif health_condition == "copd":
        extras.append("Limit outdoor time and monitor your breathing carefully.")
    elif health_condition == "heart_disease":
        extras.append("High pollution days strain the cardiovascular system — rest indoors.")
    elif health_condition == "pregnancy":
        extras.append("Protect yourself and your baby by staying indoors on high AQI days.")

    if occupation == "outdoor_worker" and aqi > 100:
        extras.append("As an outdoor worker, wear an N95 mask during work hours.")

    if age_group == "child" and aqi > 100:
        extras.append("Children should avoid outdoor play when AQI exceeds 100.")

    return base + " " + " ".join(extras)


async def generate_advisory(
    city: str,
    aqi: int,
    aqi_category: str,
    pm25: Optional[float],
    temperature: float,
    humidity: float,
    wind_speed: float,
    uv_index: float,
    age_group: str,
    health_condition: str,
    occupation: str,
) -> str:
    """
    Generate a personalized health advisory.
    Tries Groq first; falls back to rule-based advisory.
    """
    if not settings.groq_api_key:
        logger.info("No Groq API key — using rule-based fallback advisory")
        return _fallback_advisory(aqi, aqi_category, health_condition, occupation, age_group)

    prompt = _build_prompt(
        city=city, aqi=aqi, aqi_category=aqi_category, pm25=pm25,
        temperature=temperature, humidity=humidity, wind_speed=wind_speed,
        uv_index=uv_index, age_group=age_group,
        health_condition=health_condition, occupation=occupation,
    )

    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=settings.groq_api_key)
        
        for model_name in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are AeroSmog AI, a health advisory assistant."},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=200,
                    temperature=0.7,
                )
                text = response.choices[0].message.content.strip()
                logger.info(f"Groq advisory generated using {model_name} for {city} (AQI={aqi})")
                return text
            except Exception as m_err:
                logger.warning(f"Groq model {model_name} failed: {m_err}")
                continue

        return _fallback_advisory(aqi, aqi_category, health_condition, occupation, age_group)
    except Exception as e:
        logger.warning(f"Groq client error: {e} — using fallback")
        return _fallback_advisory(aqi, aqi_category, health_condition, occupation, age_group)


def get_action_items(aqi: int, health_condition: str,
                     occupation: str, age_group: str, uv_index: float) -> list:
    """Return quick-action bullet items shown on the dashboard card."""
    items = []
    if aqi > 150:
        items.append("Stay indoors as much as possible")
        items.append("Keep windows and doors closed")
    if aqi > 100:
        items.append("Wear an N95/KN95 mask outdoors")
    if health_condition in ("asthma", "copd"):
        items.append("Have rescue medication ready")
    if occupation == "outdoor_worker" and aqi > 100:
        items.append("Request indoor duties if possible today")
    if uv_index >= 6:
        items.append("Apply SPF 30+ sunscreen before going out")
    if uv_index >= 8:
        items.append("Seek shade between 10 AM – 4 PM")
    if age_group in ("child", "senior") and aqi > 100:
        items.append("Monitor symptoms closely; consult a doctor if needed")
    if not items:
        items.append("Enjoy outdoor activities — air quality is good today!")
    return items


def get_risk_level(aqi: int, health_condition: str, age_group: str) -> str:
    return _risk_level(aqi, health_condition, age_group)
