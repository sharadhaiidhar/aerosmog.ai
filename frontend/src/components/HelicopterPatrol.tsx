// components/HelicopterPatrol.tsx — Atmospheric Air Quality Helicopter Patrol
import { useEffect, useState, useRef } from 'react';

export function HelicopterPatrol() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | 'idle'>('idle');
  const [isScrolling, setIsScrolling] = useState(false);
  const [visible, setVisible] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioOscRef = useRef<OscillatorNode | null>(null);

  // ── Web Audio Synth Rotor Sound (Tasteful, opt-in) ──────────────────────────
  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low rhythmic thumping frequency for helicopter blades
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(45, ctx.currentTime);

        // Low pass filter to create a muffled rotor hum
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        audioOscRef.current = osc;
        setSoundEnabled(true);
      } catch {
        // AudioContext blocked or not supported
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setSoundEnabled(false);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // ── Scroll Listener with RAF & Direction Detection ──────────────────────────
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? Math.min(Math.max(currentY / totalScroll, 0), 1) : 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollProgress(progress);

          const diff = currentY - lastScrollY.current;
          if (Math.abs(diff) > 2) {
            setScrollDirection(diff > 0 ? 'down' : 'up');
            setIsScrolling(true);

            // Modulate synth frequency on scroll if sound enabled
            if (audioOscRef.current && audioCtxRef.current) {
              const targetFreq = diff > 0 ? 58 : 42;
              audioOscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);
            }

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = window.setTimeout(() => {
              setScrollDirection('idle');
              setIsScrolling(false);
              if (audioOscRef.current && audioCtxRef.current) {
                audioOscRef.current.frequency.setTargetAtTime(45, audioCtxRef.current.currentTime, 0.2);
              }
            }, 300);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: 18,
          right: 18,
          zIndex: 99,
          background: 'rgba(26,29,46,0.85)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          borderRadius: 20,
          padding: '6px 12px',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        🚁 Deploy Air Patrol
      </button>
    );
  }

  // ── Kinematics & Flight Path ────────────────────────────────────────────────
  // Vertical position: descends smoothly down the right quadrant of viewport
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const topTravel = 75; // below topnav
  const bottomTravel = Math.max(viewportH - 240, 180);
  const targetTop = topTravel + scrollProgress * (bottomTravel - topTravel);

  // Horizontal sway: slight atmospheric turbulence & flight weaving
  const swayX = Math.sin(scrollProgress * Math.PI * 4) * 28;

  // Flight pitch & tilt:
  let tiltDeg = 0;
  if (scrollDirection === 'down') {
    tiltDeg = 14; // forward/downward dive
  } else if (scrollDirection === 'up') {
    tiltDeg = -10; // flare back / pull up
  }

  // Simulated altitude based on progress
  const simulatedAlt = Math.round(1650 - scrollProgress * 1480);

  return (
    <>
      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes rotorSpinFast {
          0% { transform: rotateY(0deg) scaleX(1); opacity: 0.85; }
          50% { transform: rotateY(180deg) scaleX(0.15); opacity: 0.35; }
          100% { transform: rotateY(360deg) scaleX(1); opacity: 0.85; }
        }
        @keyframes tailRotorSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes strobeBlink {
          0%, 88%, 100% { opacity: 0.2; }
          90%, 94% { opacity: 1; filter: drop-shadow(0 0 6px #ff3344); }
        }
        @keyframes greenNavBlink {
          0%, 80%, 100% { opacity: 0.3; }
          85%, 92% { opacity: 1; filter: drop-shadow(0 0 6px #00ff88); }
        }
        @keyframes searchBeamSweep {
          0% { transform: rotate(-5deg); opacity: 0.35; }
          50% { transform: rotate(8deg); opacity: 0.65; }
          100% { transform: rotate(-5deg); opacity: 0.35; }
        }
        @keyframes idleHoverBob {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* ── Helicopter Container (Fixed Viewport Layer) ── */}
      <div
        style={{
          position: 'fixed',
          top: `${targetTop}px`,
          right: `${Math.max(20 + swayX, 10)}px`,
          zIndex: 88,
          pointerEvents: 'none', // Never blocks clicking on underlying cards or buttons
          transition: isScrolling
            ? 'top 0.12s ease-out, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
            : 'top 0.4s ease-out, transform 0.4s ease-out',
          transform: `rotate(${tiltDeg}deg)`,
          transformOrigin: '70% 50%',
        }}
      >
        {/* Idle hover bob wrapper */}
        <div style={{ animation: isScrolling ? 'none' : 'idleHoverBob 3s ease-in-out infinite' }}>
          
          {/* ── Downward Luminous LIDAR Smog Scanner Beam ── */}
          <div
            style={{
              position: 'absolute',
              top: 70,
              right: 80,
              width: 140,
              height: 180,
              pointerEvents: 'none',
              transformOrigin: 'top center',
              animation: 'searchBeamSweep 4s ease-in-out infinite',
              opacity: isScrolling ? 0.75 : 0.4,
              transition: 'opacity 0.3s ease',
            }}
          >
            <svg width="140" height="180" viewBox="0 0 140 180" fill="none">
              <defs>
                <linearGradient id="beamGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.30" />
                  <stop offset="70%" stopColor="#00e5ff" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="70,0 0,180 140,180" fill="url(#beamGradient)" />
            </svg>
          </div>

          {/* ── Tactical Helicopter SVG Vector Illustration ── */}
          <div style={{ position: 'relative', width: 220, height: 95 }}>
            <svg
              width="220"
              height="95"
              viewBox="0 0 220 95"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 14px 20px rgba(0, 0, 0, 0.65))',
                overflow: 'visible',
              }}
            >
              <defs>
                {/* Helicopter Body Metallic Gradient */}
                <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2c3445" />
                  <stop offset="45%" stopColor="#1b212f" />
                  <stop offset="100%" stopColor="#0d111a" />
                </linearGradient>

                {/* Cockpit Cyan Glass Gradient */}
                <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                </linearGradient>

                {/* AeroSmog Cyan Accent Line */}
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* ── TAIL BOOM & FIN ── */}
              {/* Tail boom structure */}
              <path
                d="M 120 44 L 28 41 L 24 45 L 120 52 Z"
                fill="url(#fuselageGrad)"
                stroke="#3e4a61"
                strokeWidth="1"
              />
              {/* Tail stabilizer wing */}
              <path d="M 45 42 L 35 34 L 43 34 L 52 42 Z" fill="#2c3445" stroke="#4a5568" strokeWidth="0.8" />
              
              {/* Vertical tail fin */}
              <path
                d="M 28 42 L 14 18 L 24 16 L 36 44 Z"
                fill="#1f2635"
                stroke="#3e4a61"
                strokeWidth="1"
              />
              {/* Tail fin accent stripe */}
              <path d="M 20 22 L 23 21 L 28 32 L 25 33 Z" fill="url(#accentGrad)" />

              {/* Tail rotor hub & spinning blades */}
              <circle cx="17" cy="20" r="3.5" fill="#94a3b8" />
              <g
                style={{
                  transformOrigin: '17px 20px',
                  animation: 'tailRotorSpin 0.08s linear infinite',
                }}
              >
                <line x1="17" y1="7" x2="17" y2="33" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
                <line x1="4" y1="20" x2="30" y2="20" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
              </g>

              {/* ── MAIN CABIN / FUSELAGE ── */}
              <path
                d="M 105 32 C 145 32 175 42 178 56 C 180 66 166 73 138 74 C 110 74 95 68 85 58 L 105 32 Z"
                fill="url(#fuselageGrad)"
                stroke="#3e4a61"
                strokeWidth="1.2"
              />

              {/* High-tech Racing / Patrol Stripe */}
              <path
                d="M 102 52 Q 138 52 172 61 L 170 64 Q 136 55 98 55 Z"
                fill="url(#accentGrad)"
              />

              {/* AeroSmog Identifier Badge on fuselage */}
              <text x="108" y="47" fill="#7dd3fc" fontSize="5.5" fontWeight="bold" letterSpacing="0.6">
                AEROSMOG-01
              </text>

              {/* ── COCKPIT CANOPY (Glass) ── */}
              <path
                d="M 132 35 C 154 36 172 45 176 56 C 174 61 163 65 146 64 C 134 54 130 42 132 35 Z"
                fill="url(#canopyGrad)"
                stroke="#7dd3fc"
                strokeWidth="0.8"
              />
              {/* Canopy Glass Reflection Sheen */}
              <path
                d="M 138 37 C 150 39 162 45 166 52 L 158 54 C 154 48 144 43 138 41 Z"
                fill="#ffffff"
                opacity="0.5"
              />

              {/* Pilot Silhouette */}
              <circle cx="145" cy="48" r="3.2" fill="#0b111a" opacity="0.8" />
              <path d="M 140 56 C 142 52 148 52 150 56 Z" fill="#0b111a" opacity="0.8" />

              {/* ── SENSOR TURRET / LIDAR DOME UNDER NOSE ── */}
              <circle cx="166" cy="67" r="5" fill="#1b212f" stroke="#00e5ff" strokeWidth="1" />
              <circle cx="166" cy="67" r="2.5" fill="#38bdf8" />

              {/* ── LANDING GEAR / SKIDS ── */}
              {/* Struts */}
              <line x1="112" y1="68" x2="108" y2="82" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="148" y1="69" x2="144" y2="82" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
              {/* Horizontal skid with curved tips */}
              <path
                d="M 94 82 L 165 82 Q 174 82 178 75"
                stroke="#94a3b8"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* ── ROTOR MAST & SPINNING MAIN ROTOR ── */}
              {/* Mast column */}
              <rect x="123" y="24" width="5" height="10" fill="#475569" rx="1.5" />
              <rect x="120" y="22" width="11" height="3" fill="#64748b" rx="1" />

              {/* Anti-collision Red Strobe Beacon (Flashing) */}
              <circle
                cx="125.5"
                cy="20.5"
                r="3"
                fill="#ff2244"
                style={{ animation: 'strobeBlink 1.2s infinite' }}
              />

              {/* Starboard Green/Cyan Nav Light on skid */}
              <circle
                cx="165"
                cy="82"
                r="2.5"
                fill="#00ff88"
                style={{ animation: 'greenNavBlink 1.6s infinite' }}
              />

              {/* Rapid Rotor Blades (CSS 3D spin simulation + motion blur disc) */}
              <g
                style={{
                  transformOrigin: '125px 23px',
                  animation: `rotorSpinFast ${isScrolling ? '0.04s' : '0.12s'} linear infinite`,
                }}
              >
                {/* Elliptical Rotor Disc Blur */}
                <ellipse cx="125" cy="23" rx="88" ry="4" fill="rgba(226, 232, 240, 0.45)" />
                {/* Main Carbon Fiber Blade Spar */}
                <line x1="38" y1="23" x2="212" y2="23" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                {/* Blade tip neon tips */}
                <line x1="38" y1="23" x2="48" y2="23" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                <line x1="202" y1="23" x2="212" y2="23" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* ── Mini Tactical HUD Telemetry Plate ── */}
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: -130,
              background: 'rgba(14, 17, 23, 0.88)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 8,
              padding: '5px 9px',
              color: '#e2e8f0',
              fontSize: '10px',
              fontFamily: 'monospace',
              lineHeight: 1.3,
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'auto',
              minWidth: 125,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
              <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 10 }}>PATROL #01</span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isScrolling ? '#00e400' : '#38bdf8',
                  boxShadow: `0 0 6px ${isScrolling ? '#00e400' : '#38bdf8'}`,
                  display: 'inline-block',
                }}
              />
            </div>
            <div style={{ color: '#94a3b8', fontSize: 9 }}>
              ALT: <span style={{ color: '#ffffff', fontWeight: 600 }}>{simulatedAlt}m</span>
            </div>
            <div style={{ color: isScrolling ? '#38bdf8' : '#64748b', fontSize: 8, letterSpacing: '0.02em', marginTop: 2 }}>
              {isScrolling ? (scrollDirection === 'down' ? '▼ DIVING / SCAN' : '▲ CLIMBING') : '● STEADY HOVER'}
            </div>

            {/* Quick sound toggle button */}
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2a2d3e', paddingTop: 3 }}>
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Mute Rotor Hum' : 'Enable Rotor Sound'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: soundEnabled ? '#38bdf8' : '#64748b',
                  fontSize: 8,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {soundEnabled ? '🔊 AUDIO ON' : '🔇 AUDIO OFF'}
              </button>
              <button
                onClick={() => setVisible(false)}
                title="Dismiss Helicopter"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 8,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                HIDE ✕
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
