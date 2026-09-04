// components/AqiGauge.tsx — SVG donut AQI gauge
import { getAqiInfo } from '../utils/aqi';

interface Props { aqi: number; category: string; }

export function AqiGauge({ aqi, category }: Props) {
  const info = getAqiInfo(aqi);
  const pct = Math.min(aqi / 500, 1);
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75; // 270° arc
  const offset = dash - dash * pct;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={180} height={160} viewBox="0 0 180 160">
        {/* Background arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2d3e"
          strokeWidth={14} strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={0} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`} />
        {/* Value arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={info.color}
          strokeWidth={14} strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }} />
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={info.color}
          fontSize={36} fontWeight="bold">{aqi}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#9196a8" fontSize={11}>AQI</text>
      </svg>
      <span className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: info.bg, color: info.color }}>{info.emoji} {category}</span>
    </div>
  );
}
