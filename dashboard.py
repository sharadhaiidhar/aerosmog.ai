"""
AeroSmog.AI — Streamlit Dashboard
Runs standalone — calls the FastAPI backend automatically.
Run: streamlit run dashboard.py
"""
import streamlit as st
import requests
import uuid
import json
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px

# ── Config ────────────────────────────────────────────────────────────────────
BACKEND = "http://localhost:8000"
st.set_page_config(
    page_title="AeroSmog.AI",
    page_icon="🌫️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── AQI color map ─────────────────────────────────────────────────────────────
AQI_COLORS = {
    "Good":                              "#00e400",
    "Moderate":                          "#ffff00",
    "Unhealthy for Sensitive Groups":    "#ff7e00",
    "Unhealthy":                         "#ff0000",
    "Very Unhealthy":                    "#8f3f97",
    "Hazardous":                         "#7e0023",
}
RISK_COLORS = {
    "low":       "🟢",
    "moderate":  "🟡",
    "high":      "🔴",
    "very_high": "🟣",
}

# ── Session management (persistent via st.session_state) ─────────────────────
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())
if "profile_saved" not in st.session_state:
    st.session_state.profile_saved = False
if "location" not in st.session_state:
    st.session_state.location = None

SESSION_ID = st.session_state.session_id


# ── Helper functions ──────────────────────────────────────────────────────────
def api(path, method="GET", **kwargs):
    """Call backend API, return JSON or None."""
    try:
        r = requests.request(method, f"{BACKEND}{path}", timeout=20, **kwargs)
        if r.ok:
            return r.json()
    except Exception as e:
        st.error(f"Backend error: {e}")
    return None


def check_backend():
    try:
        r = requests.get(f"{BACKEND}/", timeout=5)
        return r.ok
    except Exception:
        return False


def get_aqi_color(category):
    return AQI_COLORS.get(category, "#999999")


def aqi_gauge(aqi_val, category):
    color = get_aqi_color(category)
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=aqi_val,
        domain={"x": [0, 1], "y": [0, 1]},
        title={"text": category, "font": {"size": 14}},
        gauge={
            "axis": {"range": [0, 500], "tickwidth": 1},
            "bar": {"color": color},
            "steps": [
                {"range": [0, 50],   "color": "#00e400"},
                {"range": [50, 100], "color": "#ffff00"},
                {"range": [100, 150],"color": "#ff7e00"},
                {"range": [150, 200],"color": "#ff0000"},
                {"range": [200, 300],"color": "#8f3f97"},
                {"range": [300, 500],"color": "#7e0023"},
            ],
            "threshold": {"line": {"color": "white", "width": 3}, "value": aqi_val},
        },
    ))
    fig.update_layout(height=220, margin=dict(t=30, b=0, l=20, r=20),
                      paper_bgcolor="rgba(0,0,0,0)", font_color="white")
    return fig


# ── CSS ───────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
body { background-color: #0e1117; }
.metric-card {
    background: linear-gradient(135deg, #1e2130, #252940);
    border-radius: 12px; padding: 16px; text-align: center;
    border: 1px solid #333;
}
.advisory-box {
    background: linear-gradient(135deg, #1a2a3a, #1e3045);
    border-left: 4px solid #4fa3e0;
    border-radius: 8px; padding: 20px; margin: 10px 0;
    font-size: 16px; line-height: 1.7;
}
.action-chip {
    background: #2a3a4a; border-radius: 20px;
    padding: 6px 14px; display: inline-block;
    margin: 4px; font-size: 13px;
}
.stMetric { border-radius: 10px; }
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
#  SIDEBAR — Location & Profile
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.title("🌫️ AeroSmog.AI")
    st.caption("AI-Powered Health Advisory")
    st.divider()

    # ── Backend status ──
    if check_backend():
        st.success("✅ Backend connected", icon="✅")
    else:
        st.error("❌ Backend offline — run start_server.bat first!", icon="🔴")
        st.stop()

    # ── Location ──
    st.subheader("📍 Location")
    loc_mode = st.radio("Detection mode", ["Auto (IP)", "Manual city"], label_visibility="collapsed")

    if loc_mode == "Auto (IP)":
        if st.button("🔍 Detect My Location", use_container_width=True):
            with st.spinner("Detecting location..."):
                loc_data = api("/api/location/detect")
                if loc_data and loc_data.get("success"):
                    st.session_state.location = loc_data["location"]
                    st.success(f"📍 {loc_data['location']['city']}, {loc_data['location']['country']}")
                else:
                    st.warning("Auto-detect failed (local network). Use Manual instead.")
        if st.session_state.location:
            loc = st.session_state.location
            st.info(f"**{loc['city']}**, {loc.get('region','')}, {loc['country']}\n\nLat: {loc['lat']:.3f} | Lon: {loc['lon']:.3f}")
    else:
        city_input = st.text_input("Enter city name", placeholder="e.g. Delhi, Mumbai, Bengaluru")
        if st.button("🔍 Search", use_container_width=True) and city_input:
            with st.spinner("Looking up city..."):
                # Geocode via Nominatim
                try:
                    r = requests.get(
                        "https://nominatim.openstreetmap.org/search",
                        params={"q": city_input, "format": "json", "limit": 1},
                        headers={"User-Agent": "AeroSmogAI/1.0"}, timeout=8
                    )
                    data = r.json()
                    if data:
                        st.session_state.location = {
                            "city": city_input.title(),
                            "region": "", "country": "",
                            "lat": float(data[0]["lat"]),
                            "lon": float(data[0]["lon"]),
                            "source": "manual"
                        }
                        st.success(f"✅ Found: {city_input.title()}")
                    else:
                        st.error("City not found")
                except Exception as e:
                    st.error(f"Search failed: {e}")

    st.divider()

    # ── User Profile ──
    st.subheader("👤 My Health Profile")

    opts = api("/api/profile/options/all") or {
        "age_groups": ["child","teen","adult","senior"],
        "health_conditions": ["none","asthma","copd","heart_disease","diabetes","pregnancy","allergies"],
        "occupations": ["indoor_worker","outdoor_worker","athlete","student","retired","other"]
    }

    # Try to load existing profile
    existing = api(f"/api/profile/{SESSION_ID}")

    with st.form("profile_form"):
        name = st.text_input("Name (optional)", value=existing.get("name","") if existing else "")
        age_group = st.selectbox("Age Group", opts["age_groups"],
                                 index=opts["age_groups"].index(existing["age_group"]) if existing else 2)
        health = st.selectbox("Health Condition", opts["health_conditions"],
                              index=opts["health_conditions"].index(existing["health_condition"]) if existing else 0)
        occupation = st.selectbox("Occupation", opts["occupations"],
                                  index=opts["occupations"].index(existing["occupation"]) if existing else 0)

        if st.form_submit_button("💾 Save Profile", use_container_width=True):
            payload = {
                "session_id": SESSION_ID,
                "name": name or None,
                "age_group": age_group,
                "health_condition": health,
                "occupation": occupation,
            }
            if existing:
                r = api(f"/api/profile/{SESSION_ID}", method="PATCH", json=payload)
            else:
                r = api("/api/profile/", method="POST", json=payload)
            if r:
                st.session_state.profile_saved = True
                st.success("Profile saved!")
                st.rerun()

    st.divider()
    st.caption(f"Session: `{SESSION_ID[:8]}...`")


# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
st.title("🌫️ AeroSmog.AI — Personalized Health Advisory")

# ── Guard: need location ──────────────────────────────────────────────────────
if not st.session_state.location:
    st.info("👈 **Step 1:** Set your location in the sidebar")
    st.info("👈 **Step 2:** Save your health profile")
    st.info("👆 Then click **Generate Advisory** above")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("### 🌡️ Weather")
        st.markdown("Real-time temperature, humidity, wind speed, UV index from **Open-Meteo** (free)")
    with col2:
        st.markdown("### 💨 Air Quality")
        st.markdown("Live AQI, PM2.5, PM10, O3, NO2 from **WAQI** global network")
    with col3:
        st.markdown("### 🤖 AI Advisory")
        st.markdown("Personalized health advice from **Groq LLaMA-3.3** based on your profile")
    st.stop()

loc = st.session_state.location
lat, lon = loc["lat"], loc["lon"]
city = loc["city"]

# ── Generate Advisory Button ──────────────────────────────────────────────────
col_hdr, col_btn = st.columns([3, 1])
with col_hdr:
    st.subheader(f"📍 {city}  —  {datetime.now().strftime('%d %b %Y, %I:%M %p')}")
with col_btn:
    gen_btn = st.button("🔄 Get Advisory", type="primary", use_container_width=True)

# ── Load or refresh data ──────────────────────────────────────────────────────
if gen_btn or "advisory_data" not in st.session_state:
    with st.spinner("Fetching live data + generating AI advisory..."):
        adv = api(
            f"/api/advisory/generate?session_id={SESSION_ID}&lat={lat}&lon={lon}",
            method="POST"
        )
        if adv:
            st.session_state.advisory_data = adv
        else:
            # Fallback: fetch weather + AQI individually
            w = api(f"/api/weather/current?lat={lat}&lon={lon}")
            a = api(f"/api/aqi/live?lat={lat}&lon={lon}")
            st.session_state.advisory_data = None
            st.session_state.weather_fallback = w
            st.session_state.aqi_fallback = a

adv = st.session_state.get("advisory_data")

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 1 — AQI + Weather Cards
# ═══════════════════════════════════════════════════════════════════════════════
if adv:
    weather = adv["weather"]
    aqi     = adv["aqi"]
    risk    = adv["risk_level"]
    aqi_color = get_aqi_color(aqi["aqi_category"])

    col1, col2 = st.columns([1, 1])

    # Left — AQI Gauge
    with col1:
        st.markdown("#### 💨 Air Quality Index")
        st.plotly_chart(aqi_gauge(aqi["aqi"], aqi["aqi_category"]),
                        use_container_width=True, config={"displayModeBar": False})

        # Pollutant breakdown
        pollutants = {k: aqi.get(k) for k in ["pm25","pm10","o3","no2","so2","co"] if aqi.get(k) is not None}
        if pollutants:
            st.markdown("**Pollutant Breakdown**")
            p_cols = st.columns(len(pollutants))
            labels = {"pm25":"PM2.5","pm10":"PM10","o3":"O3","no2":"NO2","so2":"SO2","co":"CO"}
            for i, (k, v) in enumerate(pollutants.items()):
                p_cols[i].metric(labels.get(k, k), f"{v:.0f}", help="µg/m³")

    # Right — Weather
    with col2:
        st.markdown("#### 🌤️ Current Weather")
        wc1, wc2 = st.columns(2)
        wc1.metric("🌡️ Temperature", f"{weather['temperature']}°C", f"Feels {weather['feels_like']}°C")
        wc2.metric("💧 Humidity", f"{weather['humidity']}%")
        wc3, wc4 = st.columns(2)
        wc3.metric("🌬️ Wind Speed", f"{weather['wind_speed']} km/h")
        wc4.metric("☀️ UV Index", str(weather["uv_index"]))
        wc5, wc6 = st.columns(2)
        wc5.metric("🌧️ Precipitation", f"{weather['precipitation']} mm")
        wc6.metric("🌥️ Condition", weather["weather_description"])

    st.divider()

    # ═══════════════════════════════════════════════════════════════════════════
    #  SECTION 2 — AI Advisory
    # ═══════════════════════════════════════════════════════════════════════════
    risk_icon = RISK_COLORS.get(risk, "⚪")
    risk_label = risk.replace("_", " ").upper()

    st.markdown(f"#### 🤖 Personalized Health Advisory — Risk: {risk_icon} **{risk_label}**")

    st.markdown(
        f'<div class="advisory-box">{adv["advisory_text"]}</div>',
        unsafe_allow_html=True
    )

    # Action chips
    if adv.get("action_items"):
        st.markdown("**⚡ Recommended Actions:**")
        chips_html = " ".join(
            f'<span class="action-chip">✅ {item}</span>'
            for item in adv["action_items"]
        )
        st.markdown(chips_html, unsafe_allow_html=True)

    st.divider()

    # ═══════════════════════════════════════════════════════════════════════════
    #  SECTION 3 — 7-Day Forecast
    # ═══════════════════════════════════════════════════════════════════════════
    st.markdown("#### 📅 7-Day Weather Forecast")
    forecast = adv.get("forecast", [])
    if forecast:
        f_cols = st.columns(len(forecast))
        icons = {
            "Clear Sky": "☀️", "Mainly Clear": "🌤️", "Partly Cloudy": "⛅",
            "Overcast": "☁️", "Foggy": "🌫️", "Light Drizzle": "🌦️",
            "Moderate Drizzle": "🌧️", "Dense Drizzle": "🌧️", "Light Rain": "🌦️",
            "Moderate Rain": "🌧️", "Heavy Rain": "⛈️", "Thunderstorm": "⛈️",
            "Light Snow": "🌨️", "Moderate Snow": "❄️", "Heavy Snow": "❄️",
        }
        for i, day in enumerate(forecast):
            with f_cols[i]:
                date_str = datetime.strptime(day["date"], "%Y-%m-%d").strftime("%a\n%d %b")
                icon = icons.get(day["weather_description"], "🌡️")
                st.markdown(f"""
                <div class="metric-card">
                    <div style="font-size:11px;color:#888">{date_str}</div>
                    <div style="font-size:24px">{icon}</div>
                    <div style="font-size:14px;font-weight:bold">{day['max_temp']}°</div>
                    <div style="font-size:11px;color:#aaa">{day['min_temp']}°</div>
                    <div style="font-size:10px;color:#888;margin-top:4px">{day['precipitation_sum']}mm</div>
                </div>
                """, unsafe_allow_html=True)

    st.divider()

    # ═══════════════════════════════════════════════════════════════════════════
    #  SECTION 4 — 7-Day AQI Trend (History)
    # ═══════════════════════════════════════════════════════════════════════════
    st.markdown("#### 📊 Your AQI History (Past 7 Days)")
    trend = api(f"/api/advisory/trend?session_id={SESSION_ID}&days=7")
    if trend and trend.get("trend") and len(trend["trend"]) > 1:
        tdata = trend["trend"]
        dates  = [t["date"] for t in tdata]
        values = [t["aqi"] for t in tdata]
        cats   = [t["aqi_category"] for t in tdata]
        colors = [get_aqi_color(c) for c in cats]

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=dates, y=values, mode="lines+markers+text",
            text=[str(v) for v in values], textposition="top center",
            line=dict(color="#4fa3e0", width=2),
            marker=dict(color=colors, size=12, line=dict(color="white", width=1)),
            hovertemplate="<b>%{x}</b><br>AQI: %{y}<extra></extra>"
        ))
        # AQI zone bands
        fig.add_hrect(y0=0,   y1=50,  fillcolor="#00e400", opacity=0.07, line_width=0)
        fig.add_hrect(y0=50,  y1=100, fillcolor="#ffff00", opacity=0.07, line_width=0)
        fig.add_hrect(y0=100, y1=150, fillcolor="#ff7e00", opacity=0.07, line_width=0)
        fig.add_hrect(y0=150, y1=200, fillcolor="#ff0000", opacity=0.07, line_width=0)
        fig.update_layout(
            xaxis_title="Date", yaxis_title="AQI",
            height=300, paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font_color="white", margin=dict(t=10, b=30)
        )
        fig.update_xaxes(gridcolor="#333")
        fig.update_yaxes(gridcolor="#333", range=[0, max(values) + 50])
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Generate more advisories over time to see your AQI trend chart here.")

    st.divider()

    # ═══════════════════════════════════════════════════════════════════════════
    #  SECTION 5 — Alert History Table
    # ═══════════════════════════════════════════════════════════════════════════
    st.markdown("#### 🗂️ Alert History (Last 7 Days)")
    history = api(f"/api/advisory/history?session_id={SESSION_ID}&days=7")
    if history and len(history) > 0:
        import pandas as pd
        rows = []
        for h in history:
            rows.append({
                "Date": h["created_at"][:16].replace("T"," "),
                "City": h["city"],
                "AQI": h["aqi"],
                "Category": h["aqi_category"],
                "PM2.5": h.get("pm25","–"),
                "Risk": RISK_COLORS.get(h["risk_level"],"⚪") + " " + h["risk_level"],
                "Advisory Snippet": h["advisory_text"][:80] + "...",
            })
        df = pd.DataFrame(rows)
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("No history yet — hit Get Advisory a few times!")

else:
    # ── Fallback if advisory failed — show individual data ──
    st.warning("Advisory generation taking long — showing individual data:")
    w = st.session_state.get("weather_fallback")
    a = st.session_state.get("aqi_fallback")
    if w:
        st.json(w["data"])
    if a:
        st.json(a["data"])
