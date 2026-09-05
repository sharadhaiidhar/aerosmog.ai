// components/VoiceDoctor.tsx — AI Voice Doctor Audio Synthesizer (Web Speech API)
import { useState, useEffect } from 'react';
import { Volume2, Square, Sparkles } from 'lucide-react';

interface Props {
  text: string;
  city: string;
  riskLevel: string;
}

export function VoiceDoctor({ text, city, riskLevel }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!supported) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const spokenText = `AeroSmog AI Health Advisory for ${city}. Risk level is ${riskLevel}. ${text}`;
    const utterance = new SpeechSynthesisUtterance(spokenText);

    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return null;

  return (
    <div className="flex-center gap-2">
      <button
        type="button"
        onClick={handleSpeak}
        className="btn"
        style={{
          background: speaking ? '#ff4444' : 'linear-gradient(135deg, #4fa3e0, #7b5ea7)',
          color: '#fff',
          padding: '6px 14px',
          fontSize: 12,
          borderRadius: 20,
          boxShadow: speaking ? '0 0 15px rgba(255,68,68,0.5)' : '0 0 12px rgba(79,163,224,0.35)',
          transition: 'all 0.3s ease',
        }}
        title="Listen to Personalized AI Health Advisory"
      >
        {speaking ? (
          <>
            <Square size={13} /> Stop Voice Doctor
          </>
        ) : (
          <>
            <Volume2 size={14} className="pulse" />
            <span>🔊 Listen to AI Doctor</span>
            <Sparkles size={11} style={{ color: '#ffd700' }} />
          </>
        )}
      </button>

      {/* Animated Sound Wave Equalizer when speaking */}
      {speaking && (
        <div className="flex-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <span className="wave-bar" style={{ animationDelay: '0ms' }} />
          <span className="wave-bar" style={{ animationDelay: '150ms' }} />
          <span className="wave-bar" style={{ animationDelay: '300ms' }} />
          <span className="wave-bar" style={{ animationDelay: '75ms' }} />
        </div>
      )}

      <style>{`
        .wave-bar {
          display: inline-block;
          width: 3px;
          height: 12px;
          background: #4fa3e0;
          border-radius: 2px;
          animation: soundWave 0.8s ease-in-out infinite alternate;
        }
        @keyframes soundWave {
          from { height: 4px; }
          to { height: 16px; background: #ff7ee5; }
        }
      `}</style>
    </div>
  );
}
