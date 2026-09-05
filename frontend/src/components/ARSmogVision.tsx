// components/ARSmogVision.tsx — Augmented Reality Live Camera PM2.5 Particle Scanner
import { useState, useRef, useEffect } from 'react';
import { Camera, X, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  aqi: number;
  pm25: number;
  city: string;
}

export function ARSmogVision({ aqi, pm25, city }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam when opened
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      })
      .catch(() => {
        setHasPermission(false);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Render AR particle simulation over camera feed
  useEffect(() => {
    if (!isOpen || !hasPermission) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = 640);
    const height = (canvas.height = 480);

    // Particle density based on AQI
    const count = Math.min(220, Math.max(25, Math.floor(aqi * 0.75)));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * (aqi > 150 ? 4.5 : 2.5) + 1,
      speedX: (Math.random() - 0.5) * (aqi > 150 ? 1.5 : 0.6),
      speedY: (Math.random() - 0.5) * (aqi > 150 ? 1.5 : 0.6),
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Color based on AQI
      let pColor = 'rgba(0, 228, 0, ';
      if (aqi > 200) pColor = 'rgba(180, 0, 50, ';
      else if (aqi > 150) pColor = 'rgba(255, 60, 60, ';
      else if (aqi > 100) pColor = 'rgba(255, 130, 0, ';
      else if (aqi > 50) pColor = 'rgba(255, 200, 0, ';

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${pColor}${p.opacity})`;
        ctx.shadowBlur = aqi > 100 ? 6 : 2;
        ctx.shadowColor = '#ff4444';
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, hasPermission, aqi]);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn"
        style={{
          background: 'linear-gradient(135deg, #1f2235, #291b38)',
          border: '1px solid rgba(255,126,229,0.4)',
          color: '#ff7ee5',
          fontSize: 12,
          padding: '6px 14px',
          borderRadius: 20,
          boxShadow: '0 0 12px rgba(255,126,229,0.2)',
        }}
      >
        <Eye size={14} />
        <span>👁️ AR Smog Vision</span>
        <Sparkles size={11} />
      </button>

      {/* AR Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 7, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 680,
              width: '100%',
              background: '#0e1117',
              border: '1px solid rgba(79,163,224,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div className="flex-between mb-3">
              <div className="flex-center gap-2">
                <Camera size={18} className="text-accent" />
                <span className="font-bold text-white text-base">AR Smog Particle Vision</span>
                <span className="badge badge-accent">Live Sensor</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn"
                style={{ padding: 6, background: 'transparent', color: '#fff' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Viewport with AR Overlay */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 380,
                background: '#000',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {hasPermission === false ? (
                <div className="flex-col flex-center h-full gap-2 p-4 text-center text-muted">
                  <ShieldAlert size={32} style={{ color: '#ff4444' }} />
                  <p>Camera access was blocked or not available.</p>
                  <p className="text-xs">Please allow camera permissions in your browser bar.</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)', // Mirror mode
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Cyberpunk HUD Info Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(10,14,24,0.75)',
                      backdropFilter: 'blur(6px)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(79,163,224,0.3)',
                    }}
                  >
                    <div className="text-xs font-bold text-accent">📍 {city} ATMOSPHERE</div>
                    <div className="text-sm font-extrabold text-white">AQI: {aqi} | PM2.5: {pm25} µg/m³</div>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      right: 12,
                      background: 'rgba(10,14,24,0.85)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span className="text-xs text-muted">
                      Simulating real-time particulate matter floating in your environment.
                    </span>
                    <span className="badge" style={{ background: aqi > 100 ? '#ff444433' : '#00e40033', color: aqi > 100 ? '#ff4444' : '#00e400' }}>
                      {aqi > 100 ? 'Toxic Density' : 'Breathable'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
