// components/AtmosphericBackground.tsx — Immersive Dynamic Weather Ambience (OnePlus 3D Clouds, Sun Rays, Rain Particles)
import { useEffect, useRef } from 'react';

interface Props {
  weatherDesc?: string;
  aqi?: number;
}

type WeatherType = 'sunny' | 'rain' | 'cloudy' | 'smog' | 'default';

// ── OnePlus / OxygenOS Stylized 3D Volumetric Cloud SVG ────────────────────────
function OnePlus3DCloud({
  id,
  width = 460,
  height = 190,
  style = {},
  className = '',
}: {
  id: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 460 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0px 24px 38px rgba(10, 16, 28, 0.65))` }}
      >
        <defs>
          {/* Main 3D Volumetric Gradient: Bright silver rim on top, soft shadowy slate-blue on bottom */}
          <linearGradient id={`oneplus-cloud-main-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#e4edf7" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#8ba5c4" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#485c78" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#253245" stopOpacity="0.90" />
          </linearGradient>

          {/* Top Rim Luminous Glow */}
          <radialGradient id={`oneplus-rim-glow-${id}`} cx="45%" cy="20%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#d2e3f5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Underbelly 3D Occlusion Shadow */}
          <linearGradient id={`oneplus-shadow-${id}`} x1="50%" y1="60%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1a2332" stopOpacity="0" />
            <stop offset="100%" stopColor="#121824" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* ── 3D Puffy Cumulus Silhouette ── */}
        <path
          d="M 85,155 
             C 45,155 20,130 20,95 
             C 20,65 45,45 75,45 
             C 85,45 92,48 100,52 
             C 115,22 150,5 195,5 
             C 245,5 285,25 300,60 
             C 315,55 330,52 345,52 
             C 385,52 415,75 425,108 
             C 438,114 445,126 445,140 
             C 445,158 428,172 405,172 
             L 85,172 
             Z"
          fill={`url(#oneplus-cloud-main-${id})`}
        />

        {/* Top Highlight Dome (3D Sphere shine effect) */}
        <path
          d="M 100,52 
             C 115,22 150,5 195,5 
             C 245,5 285,25 300,60 
             C 260,35 220,25 180,28 
             C 135,32 108,45 100,52 
             Z"
          fill={`url(#oneplus-rim-glow-${id})`}
        />

        {/* Secondary Left Highlight Puff */}
        <ellipse cx="65" cy="80" rx="35" ry="25" fill={`url(#oneplus-rim-glow-${id})`} opacity="0.6" />

        {/* Secondary Right Highlight Puff */}
        <ellipse cx="360" cy="85" rx="45" ry="30" fill={`url(#oneplus-rim-glow-${id})`} opacity="0.5" />

        {/* Underbelly 3D Shadow Depth */}
        <path
          d="M 50,140 
             C 120,135 220,138 320,135 
             C 370,135 410,142 430,150 
             L 405,172 
             L 85,172 
             Z"
          fill={`url(#oneplus-shadow-${id})`}
        />
      </svg>
    </div>
  );
}

export function AtmosphericBackground({ weatherDesc = '', aqi = 50 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine weather type
  const desc = weatherDesc.toLowerCase();
  let weatherType: WeatherType = 'default';

  if (aqi > 180) {
    weatherType = 'smog';
  } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower') || desc.includes('thunder')) {
    weatherType = 'rain';
  } else if (desc.includes('clear') || desc.includes('sun')) {
    weatherType = 'sunny';
  } else if (desc.includes('cloud') || desc.includes('overcast')) {
    weatherType = 'cloudy';
  }

  // Canvas particle animation (Raindrops or Solar Dust)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle setups
    const raindrops = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 22 + 10,
      speed: Math.random() * 9 + 8,
      opacity: Math.random() * 0.4 + 0.25,
    }));

    const sunMotes = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.3) * 0.6,
      speedY: (Math.random() - 0.7) * 0.7,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (weatherType === 'rain') {
        // Draw falling raindrops
        ctx.strokeStyle = 'rgba(130, 195, 255, 0.45)';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';

        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 0.9;
          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 50);
          }
        });
      } else if (weatherType === 'sunny') {
        // Draw shimmering golden sun dust motes
        sunMotes.forEach((mote) => {
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 225, 120, ${mote.opacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffd700';
          ctx.fill();

          mote.x += mote.speedX;
          mote.y += mote.speedY;

          if (mote.y < 0) mote.y = height;
          if (mote.x > width) mote.x = 0;
          if (mote.x < 0) mote.x = width;
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weatherType]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        transition: 'background 1.5s ease',
      }}
    >
      {/* ── 1. SUNNY: Golden God Rays & Warm Radial Flare ── */}
      {weatherType === 'sunny' && (
        <>
          {/* Glowing Solar Orb in top corner */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '460px',
              height: '460px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.45) 0%, rgba(255, 140, 0, 0.25) 40%, transparent 70%)',
              filter: 'blur(30px)',
              animation: 'solarPulse 6s ease-in-out infinite alternate',
            }}
          />
          {/* Beaming Sun Rays across the viewport */}
          <div
            style={{
              position: 'absolute',
              top: '-200px',
              right: '-100px',
              width: '850px',
              height: '850px',
              background:
                'conic-gradient(from 180deg at 70% 20%, transparent 0deg, rgba(255, 220, 100, 0.14) 20deg, transparent 40deg, rgba(255, 200, 50, 0.16) 65deg, transparent 90deg, rgba(255, 230, 130, 0.12) 120deg, transparent 150deg)',
              filter: 'blur(12px)',
              animation: 'spinRays 40s linear infinite',
              opacity: 0.9,
            }}
          />
        </>
      )}

      {/* ── 2. ONEPLUS 3D VOLUMETRIC CLOUDS (Rain or Cloudy) ── */}
      {(weatherType === 'rain' || weatherType === 'cloudy') && (
        <>
          {/* Background Atmospheric Storm Gradient Tint */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(20, 28, 45, 0.5) 0%, rgba(10, 14, 24, 0.2) 100%)',
            }}
          />

          {/* Cloud 1: Massive Background Puffy Cloud (Slow Drift) */}
          <OnePlus3DCloud
            id="bg-cloud-1"
            width={620}
            height={240}
            style={{
              top: '-20px',
              left: '-80px',
              opacity: 0.45,
              transform: 'scale(1.15)',
              animation: 'oneplusDriftSlow 48s ease-in-out infinite alternate',
            }}
          />

          {/* Cloud 2: Signature OnePlus 3D Foreground Cumulus Cloud (Mid-top) */}
          <OnePlus3DCloud
            id="fg-cloud-2"
            width={480}
            height={200}
            style={{
              top: '35px',
              right: '-60px',
              opacity: 0.72,
              animation: 'oneplusDriftMid 34s ease-in-out infinite alternate',
            }}
          />

          {/* Cloud 3: Floating Billowing Cloud (Center Depth) */}
          <OnePlus3DCloud
            id="mid-cloud-3"
            width={410}
            height={170}
            style={{
              top: '110px',
              left: '12%',
              opacity: 0.55,
              animation: 'oneplusBreathing 26s ease-in-out infinite alternate',
            }}
          />

          {/* Ambient Mist Haze on horizon */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '280px',
              background:
                'radial-gradient(ellipse at 50% 15%, rgba(65, 85, 120, 0.35) 0%, transparent 75%)',
              filter: 'blur(40px)',
            }}
          />
        </>
      )}

      {/* ── 3. SMOG / HAZARDOUS: Amber Cyberpunk Haze ── */}
      {weatherType === 'smog' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 10%, rgba(255, 120, 0, 0.15) 0%, rgba(140, 40, 80, 0.1) 50%, transparent 80%)',
            filter: 'blur(30px)',
          }}
        />
      )}

      {/* Interactive Canvas for Rain or Sun Motes */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Keyframe animations */}
      <style>{`
        @keyframes spinRays {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes solarPulse {
          from { transform: scale(1); opacity: 0.7; }
          to { transform: scale(1.15); opacity: 0.95; }
        }
        @keyframes oneplusDriftSlow {
          0% { transform: translateX(0px) translateY(0px) scale(1.15); }
          50% { transform: translateX(65px) translateY(14px) scale(1.18); }
          100% { transform: translateX(-40px) translateY(-10px) scale(1.15); }
        }
        @keyframes oneplusDriftMid {
          0% { transform: translateX(0px) translateY(0px) scale(1); }
          50% { transform: translateX(-55px) translateY(-12px) scale(1.04); }
          100% { transform: translateX(35px) translateY(8px) scale(0.98); }
        }
        @keyframes oneplusBreathing {
          0% { transform: translateX(0px) translateY(0px) scale(1); opacity: 0.55; }
          50% { transform: translateX(45px) translateY(15px) scale(1.06); opacity: 0.65; }
          100% { transform: translateX(-30px) translateY(-8px) scale(0.95); opacity: 0.50; }
        }
      `}</style>
    </div>
  );
}
