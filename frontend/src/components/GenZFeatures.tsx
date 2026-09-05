// components/GenZFeatures.tsx — Gen-Z Viral Cards (Aura Check, Cigarette Equiv, Drip Check, Touch Grass Meter)
import { useState } from 'react';
import { Sparkles, Dumbbell, Shirt, Cigarette, Share2, Check, Flame } from 'lucide-react';
import type { WeatherData, AQIData } from '../types';

interface Props {
  weather: WeatherData;
  aqi: AQIData;
  city: string;
}

export function GenZFeatures({ weather, aqi, city }: Props) {
  const [copied, setCopied] = useState(false);

  // ── 1. Berkeley Earth Cigarette Calculation (22 ug/m3 PM2.5 ≈ 1 cigarette/day)
  const pm25 = aqi.pm25 || (aqi.aqi * 0.45);
  const cigs = Math.max(0.1, +(pm25 / 22).toFixed(1));

  // ── 2. Aura & Vibe Check
  const aqiVal = aqi.aqi;
  let auraPoints = '+5,000';
  let auraColor = '#00e400';
  let vibeTitle = 'Main Character Glow ✨';
  let vibeQuote = 'Air is pure dopamine. Go outside, touch grass, shoot your content.';

  if (aqiVal > 200) {
    auraPoints = '-10,000';
    auraColor = '#8f3f97';
    vibeTitle = 'Literally Cooked 💀';
    vibeQuote = 'It\'s giving Blade Runner 2049. Cancel outdoor plans, air-purifier on max, doomscroll inside.';
  } else if (aqiVal > 150) {
    auraPoints = '-3,500';
    auraColor = '#ff4444';
    vibeTitle = 'Down Bad (Smog Era) 😷';
    vibeQuote = 'The air is crunchy today. Outdoor runners are officially tweaking. N95 is non-negotiable.';
  } else if (aqiVal > 100) {
    auraPoints = '-500';
    auraColor = '#ff7e00';
    vibeTitle = 'Kinda Mid 😐';
    vibeQuote = 'Not unlivable, but definitely not aesthetic. Keep the afternoon runs short.';
  } else if (aqiVal > 50) {
    auraPoints = '+1,500';
    auraColor = '#ffcc00';
    vibeTitle = 'Decent Vibes ✌️';
    vibeQuote = 'Solid campus commute energy. Get your coffee walk in before traffic peaks.';
  }

  // ── 3. Drip & Fit-Check (OOTD)
  const fitItems: string[] = [];
  if (pm25 > 35) fitItems.push('Mask drip (Black N95 essential) 😷');
  if (weather.uv_index >= 5) fitItems.push('Polarized shades (UV protection) 🕶️');
  if (weather.precipitation > 0) fitItems.push('Techwear rain shell / Waterproof kicks 🌧️');
  else if (weather.temperature >= 28) fitItems.push('Breathable oversized tee & shorts 👕');
  else if (weather.temperature <= 18) fitItems.push('Layered boxy hoodie / Streetwear fleece 🧥');
  else fitItems.push('Vintage bomber / Lightweight layer 🧢');
  fitItems.push(weather.humidity > 75 ? 'Anti-frizz hair product 🧴' : 'Hydrating lip balm 💧');

  // ── 4. Touch Grass vs. Gym Meter
  let workoutBadge = 'GO BEAST MODE OUTSIDE 🏃‍♂️';
  let workoutColor = '#00e400';
  let workoutAdvice = 'Perfect air for outdoor 5k runs, Calisthenics, or football.';
  if (aqiVal > 150) {
    workoutBadge = 'TREADMILL ONLY BRO 🏋️‍♂️';
    workoutColor = '#ff4444';
    workoutAdvice = 'Outdoor sprints will toast your lungs. Hit the air-conditioned gym.';
  } else if (aqiVal > 100) {
    workoutBadge = 'LIGHT JOG ONLY 🚶‍♂️';
    workoutColor = '#ffcc00';
    workoutAdvice = 'Keep heart rate moderate outdoors. Prefer indoor lifting.';
  }

  // ── Share Story text
  const shareText = `🌫️ AeroSmog.AI Vibe Check for ${city}:\n✨ Aura: ${auraPoints} (${vibeTitle})\n💨 AQI: ${aqiVal} (${aqi.aqi_category})\n🚬 Breathing today = ~${cigs} cigs\n👟 OOTD: ${fitItems[0]}\nCheck your air vibe: https://aerosmog-ai-2.onrender.com`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="card" style={{ border: '1px solid rgba(79,163,224,0.3)', background: 'linear-gradient(135deg, #131726, #1c1830)' }}>
      {/* Header with Share Button */}
      <div className="flex-between flex-wrap gap-2 mb-4">
        <div className="flex-center gap-2">
          <Sparkles size={18} style={{ color: '#ff7ee5' }} />
          <span className="font-bold text-base text-white">Gen-Z Vibe & Smog Index</span>
          <span className="badge" style={{ background: 'rgba(255,126,229,0.15)', color: '#ff7ee5' }}>
            Aesthetic Check 🔥
          </span>
        </div>
        <button
          className="btn"
          onClick={handleShare}
          style={{
            background: copied ? '#00e400' : 'rgba(255,255,255,0.08)',
            color: copied ? '#000' : '#fff',
            padding: '6px 14px',
            fontSize: 12,
          }}
        >
          {copied ? <><Check size={13} /> Copied to Clipboard!</> : <><Share2 size={13} /> Share Story Card</>}
        </button>
      </div>

      <div className="grid-2 gap-3">
        {/* Card A: Aura Check */}
        <div className="inner-card flex-col gap-2" style={{ background: 'rgba(18,20,31,0.7)', border: `1px solid ${auraColor}33` }}>
          <div className="flex-between">
            <span className="text-xs font-semibold text-muted flex-center gap-1">
              <Flame size={13} style={{ color: auraColor }} /> AIR AURA
            </span>
            <span className="badge" style={{ background: `${auraColor}22`, color: auraColor, fontWeight: 700 }}>
              {auraPoints} Aura
            </span>
          </div>
          <div className="text-base font-bold text-white">{vibeTitle}</div>
          <div className="text-xs text-muted leading-relaxed">{vibeQuote}</div>
        </div>

        {/* Card B: Cigarette Equivalent */}
        <div className="inner-card flex-col gap-2" style={{ background: 'rgba(18,20,31,0.7)', border: '1px solid rgba(255,100,100,0.2)' }}>
          <div className="flex-between">
            <span className="text-xs font-semibold text-muted flex-center gap-1">
              <Cigarette size={13} style={{ color: '#ff6666' }} /> PASSIVE SMOKING SHOCK
            </span>
            <span className="badge" style={{ background: 'rgba(255,100,100,0.15)', color: '#ff6666' }}>
              Berkeley Earth Metric
            </span>
          </div>
          <div className="flex-center gap-2">
            <span className="text-2xl font-bold" style={{ color: cigs > 2 ? '#ff4444' : '#ffcc00' }}>
              ~{cigs}
            </span>
            <span className="text-xs text-muted">cigarettes / day</span>
          </div>
          <div className="text-xs text-muted leading-relaxed">
            Breathing today's air is like passive-smoking <strong>{cigs} cigarettes</strong> just by existing outside.
          </div>
        </div>

        {/* Card C: Fit-Check / Drip */}
        <div className="inner-card flex-col gap-2" style={{ background: 'rgba(18,20,31,0.7)', border: '1px solid rgba(79,163,224,0.2)' }}>
          <div className="flex-between">
            <span className="text-xs font-semibold text-muted flex-center gap-1">
              <Shirt size={13} className="text-accent" /> DRIP & FIT-CHECK
            </span>
            <span className="badge badge-accent">OOTD</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {fitItems.map((item, idx) => (
              <div key={idx} className="chip" style={{ fontSize: 11, padding: '4px 10px' }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Card D: Touch Grass Workout Meter */}
        <div className="inner-card flex-col gap-2" style={{ background: 'rgba(18,20,31,0.7)', border: `1px solid ${workoutColor}33` }}>
          <div className="flex-between">
            <span className="text-xs font-semibold text-muted flex-center gap-1">
              <Dumbbell size={13} style={{ color: workoutColor }} /> TOUCH GRASS METER
            </span>
            <span className="badge" style={{ background: `${workoutColor}22`, color: workoutColor }}>
              Gym Bros
            </span>
          </div>
          <div className="text-xs font-bold" style={{ color: workoutColor }}>
            {workoutBadge}
          </div>
          <div className="text-xs text-muted leading-relaxed">
            {workoutAdvice}
          </div>
        </div>
      </div>
    </div>
  );
}
