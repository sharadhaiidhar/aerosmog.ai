// components/JudgeSimulator.tsx — Interactive Hackathon Judge Sandbox & Disaster Simulator
import { useState } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, CloudRain, RotateCcw, Award } from 'lucide-react';
import type { AdvisoryResponse } from '../types';

interface Props {
  currentAdvisory: AdvisoryResponse;
  onSimulate: (simulated: AdvisoryResponse | null) => void;
}

export function JudgeSimulator({ currentAdvisory, onSimulate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [simAqi, setSimAqi] = useState(currentAdvisory.aqi.aqi);
  const [isSimulating, setIsSimulating] = useState(false);

  // Apply slider simulation
  const handleSliderChange = (newVal: number) => {
    setSimAqi(newVal);
    setIsSimulating(true);

    let cat = 'Good';
    let risk = 'low';
    let text = 'Air quality is pristine. Outdoor exposure is completely safe for all demographics.';
    let actions = ['Enjoy outdoor recreation', 'Ventilate indoor spaces'];

    if (newVal > 300) {
      cat = 'Hazardous';
      risk = 'very_high';
      text = 'EMERGENCY CRISIS LEVEL: Extreme particulate saturation. Severe respiratory hazard for everyone. Avoid any outdoor presence.';
      actions = ['Strict indoor confinement', 'High-efficiency HEPA filtration', 'N99 respirator required'];
    } else if (newVal > 200) {
      cat = 'Very Unhealthy';
      risk = 'high';
      text = 'Severe smog alert. Trigger warning for asthma and pulmonary patients. Serious irritation likely.';
      actions = ['Wear sealed N95 mask', 'Keep rescue inhalers primed', 'Keep windows sealed'];
    } else if (newVal > 100) {
      cat = 'Unhealthy for Sensitive Groups';
      risk = 'moderate';
      text = 'Moderate atmospheric pollution. Sensitive groups will experience throat dryness and breathing resistance.';
      actions = ['Reduce intense cardio outdoors', 'Hydrate frequently'];
    }

    const sim: AdvisoryResponse = {
      ...currentAdvisory,
      aqi: {
        ...currentAdvisory.aqi,
        aqi: newVal,
        aqi_category: cat,
        pm25: +(newVal * 0.55).toFixed(1),
      },
      risk_level: risk,
      advisory_text: text,
      action_items: actions,
    };

    onSimulate(sim);
  };

  // 1-Click Crisis Presets
  const applyPreset = (type: 'delhi' | 'alps' | 'monsoon') => {
    setIsSimulating(true);
    if (type === 'delhi') {
      handleSliderChange(485);
    } else if (type === 'alps') {
      handleSliderChange(14);
    } else if (type === 'monsoon') {
      setSimAqi(32);
      const sim: AdvisoryResponse = {
        ...currentAdvisory,
        city: 'Mumbai (Monsoon Deluge)',
        weather: {
          ...currentAdvisory.weather,
          temperature: 24.5,
          weather_description: 'Heavy Rain & Thunderstorm',
          precipitation: 45.0,
          humidity: 95,
        },
        aqi: {
          ...currentAdvisory.aqi,
          aqi: 32,
          aqi_category: 'Good',
          pm25: 6.2,
        },
        risk_level: 'low',
        advisory_text: 'Intense rain wash-out has scrubbed all airborne particulates clean! Waterlogging precautions advised.',
        action_items: ['Air is pristine', 'Carry waterproof gear', 'Avoid low-lying flooded zones'],
      };
      onSimulate(sim);
    }
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimAqi(currentAdvisory.aqi.aqi);
    onSimulate(null);
  };

  return (
    <>
      {/* Trigger floating button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        style={{
          background: isSimulating
            ? 'linear-gradient(135deg, #ff4444, #ff7e00)'
            : 'linear-gradient(135deg, #ffd700, #ff8800)',
          color: '#000',
          fontWeight: 800,
          fontSize: 12,
          padding: '6px 14px',
          borderRadius: 20,
          boxShadow: '0 0 15px rgba(255,215,0,0.4)',
          border: 'none',
        }}
      >
        <Award size={14} />
        <span>{isSimulating ? '🚨 SIMULATION ACTIVE' : '🎮 Judge Sandbox'}</span>
      </button>

      {/* Simulator Modal / Drawer */}
      {isOpen && (
        <div
          className="card"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9998,
            maxWidth: 420,
            width: 'calc(100vw - 48px)',
            background: 'rgba(14, 17, 26, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '2px solid #ffd700',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}
        >
          <div className="flex-between mb-3">
            <div className="flex-center gap-2">
              <Sliders size={16} style={{ color: '#ffd700' }} />
              <span className="font-extrabold text-sm text-white">Judge Crisis Simulator</span>
            </div>
            {isSimulating && (
              <button
                type="button"
                onClick={handleReset}
                className="badge"
                style={{ background: '#ff444433', color: '#ff6666', border: 'none', cursor: 'pointer' }}
              >
                <RotateCcw size={11} /> Reset to Live
              </button>
            )}
          </div>

          <p className="text-xs text-muted mb-3">
            Judges can drag this slider to test how AeroSmog.AI dynamically recalculates health risk, AI advisory, and UI in real-time:
          </p>

          {/* Interactive AQI Slider */}
          <div className="inner-card mb-3">
            <div className="flex-between mb-1">
              <span className="text-xs font-semibold text-muted">SIMULATED AQI</span>
              <span className="text-base font-extrabold" style={{ color: simAqi > 150 ? '#ff4444' : simAqi > 50 ? '#ffcc00' : '#00e400' }}>
                {simAqi} AQI
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              value={simAqi}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* 1-Click Crisis Presets */}
          <div className="text-xs font-semibold text-muted mb-2">1-CLICK DEMO PRESETS:</div>
          <div className="grid-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('delhi')}
              className="btn"
              style={{ background: '#ff444422', border: '1px solid #ff4444', color: '#ff6666', padding: '6px 4px', fontSize: 11 }}
            >
              <AlertTriangle size={12} /> Delhi Code Red
            </button>
            <button
              type="button"
              onClick={() => applyPreset('alps')}
              className="btn"
              style={{ background: '#00e40022', border: '1px solid #00e400', color: '#00e400', padding: '6px 4px', fontSize: 11 }}
            >
              <ShieldCheck size={12} /> Swiss Alps
            </button>
            <button
              type="button"
              onClick={() => applyPreset('monsoon')}
              className="btn"
              style={{ background: '#4fa3e022', border: '1px solid #4fa3e0', color: '#4fa3e0', padding: '6px 4px', fontSize: 11 }}
            >
              <CloudRain size={12} /> Monsoon Storm
            </button>
          </div>
        </div>
      )}
    </>
  );
}
