// components/AtmosphericBackground.tsx — Immersive Dynamic Weather Ambience (Sun rays, 3D Clouds, Rain Particles)
import { useEffect, useRef } from 'react';

interface Props {
  weatherDesc?: string;
  aqi?: number;
}

type WeatherType = 'sunny' | 'rain' | 'cloudy' | 'smog' | 'default';

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
    const raindrops = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 8 + 7,
      opacity: Math.random() * 0.4 + 0.2,
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
        ctx.strokeStyle = 'rgba(120, 185, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 0.8;
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
              width: '450px',
              height: '450px',
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
              width: '800px',
              height: '800px',
              background:
                'conic-gradient(from 180deg at 70% 20%, transparent 0deg, rgba(255, 220, 100, 0.12) 20deg, transparent 40deg, rgba(255, 200, 50, 0.15) 65deg, transparent 90deg, rgba(255, 230, 130, 0.1) 120deg, transparent 150deg)',
              filter: 'blur(12px)',
              animation: 'spinRays 40s linear infinite',
              opacity: 0.85,
            }}
          />
        </>
      )}

      {/* ── 2. RAIN / CLOUDS: Floating 3D Clouds & Mist ── */}
      {(weatherType === 'rain' || weatherType === 'cloudy') && (
        <>
          {/* Volumetric Dark Cloud Layer 1 */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              left: '-15%',
              width: '130%',
              height: '240px',
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(45, 55, 80, 0.55), transparent 70%), radial-gradient(ellipse at 70% 30%, rgba(35, 45, 70, 0.6), transparent 75%)',
              filter: 'blur(45px)',
              animation: 'floatCloud 24s ease-in-out infinite alternate',
            }}
          />
          {/* Volumetric Dark Cloud Layer 2 (3D Depth) */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '-20%',
              width: '140%',
              height: '280px',
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(30, 40, 65, 0.4), transparent 65%), radial-gradient(ellipse at 85% 40%, rgba(40, 50, 75, 0.45), transparent 60%)',
              filter: 'blur(55px)',
              animation: 'floatCloudReverse 32s ease-in-out infinite alternate',
            }}
          />
          {/* Cool storm gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(16, 22, 38, 0.4) 0%, rgba(10, 14, 24, 0.1) 100%)',
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
        @keyframes floatCloud {
          0% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(40px) translateY(12px); }
          100% { transform: translateX(-30px) translateY(-8px); }
        }
        @keyframes floatCloudReverse {
          0% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-45px) translateY(-15px); }
          100% { transform: translateX(35px) translateY(10px); }
        }
      `}</style>
    </div>
  );
}
