// components/TrendChart.tsx — 7-day AQI trend line chart using Recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { TrendEntry } from '../types';
import { getAqiInfo } from '../utils/aqi';

interface Props { trend: TrendEntry[] }

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  const info = getAqiInfo(payload.aqi);
  return <circle cx={cx} cy={cy} r={6} fill={info.color} stroke="#0e1117" strokeWidth={2} />;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TrendEntry;
  const info = getAqiInfo(d.aqi);
  return (
    <div className="card text-sm" style={{ padding: '10px 14px', minWidth: 140 }}>
      <div style={{ color: '#9196a8' }}>{d.date}</div>
      <div className="font-bold mt-1" style={{ color: info.color }}>
        AQI {d.aqi} — {d.aqi_category}
      </div>
    </div>
  );
}

export function TrendChart({ trend }: Props) {
  if (!trend.length) return (
    <div className="card flex items-center justify-center h-40 text-sm" style={{ color: '#9196a8' }}>
      No trend data yet — generate more advisories over time
    </div>
  );

  const data = trend.map(t => ({ ...t, date: t.date.slice(5) }));

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#9196a8' }}>AQI TREND — PAST 7 DAYS</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#2a2d3e" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#9196a8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 'auto']} tick={{ fill: '#9196a8', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} />
          {/* AQI zone bands */}
          <ReferenceLine y={50}  stroke="#00e40033" strokeDasharray="4 4" label={{ value: 'Good', fill: '#00e400', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={100} stroke="#ffcc0033" strokeDasharray="4 4" label={{ value: 'Moderate', fill: '#ffcc00', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={150} stroke="#ff7e0033" strokeDasharray="4 4" label={{ value: 'Sensitive', fill: '#ff7e00', fontSize: 10, position: 'right' }} />
          <Line
            type="monotone" dataKey="aqi" stroke="#4fa3e0" strokeWidth={2}
            dot={<CustomDot />} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
