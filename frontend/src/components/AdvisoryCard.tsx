// components/AdvisoryCard.tsx — plain CSS version
import { getRiskColor, getRiskEmoji } from '../utils/aqi';
import { ShieldAlert, CheckCircle } from 'lucide-react';

import { VoiceDoctor } from './VoiceDoctor';

interface Props {
  text: string;
  risk: string;
  actions: string[];
  city?: string;
}

export function AdvisoryCard({ text, risk, actions, city = 'Your Area' }: Props) {
  const rColor = getRiskColor(risk);
  const rEmoji = getRiskEmoji(risk);
  const rLabel = risk.replace('_', ' ').toUpperCase();

  return (
    <div className="card">
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="flex-center gap-2 flex-wrap">
          <ShieldAlert size={18} className="text-accent" />
          <span className="font-semibold text-white text-sm">AI Health Advisory</span>
          <span className="badge badge-accent">Groq LLaMA-3.3</span>
          {/* AI Voice Doctor Button */}
          <VoiceDoctor text={text} city={city} riskLevel={rLabel} />
        </div>
        <div className="badge" style={{
          background: rColor + '22', color: rColor,
          border: `1px solid ${rColor}44`
        }}>
          {rEmoji} {rLabel}
        </div>
      </div>

      <p className="text-base leading-relaxed mb-3" style={{ color: '#c8cfe0' }}>{text}</p>

      {actions.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted mb-2">RECOMMENDED ACTIONS</div>
          <div className="flex-center flex-wrap gap-2">
            {actions.map((a, i) => (
              <div key={i} className="chip">
                <CheckCircle size={11} className="text-accent" />
                {a}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
