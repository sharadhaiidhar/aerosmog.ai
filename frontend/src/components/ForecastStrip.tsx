// components/ForecastStrip.tsx — plain CSS version
import type { ForecastDay } from '../types';
import { getWeatherEmoji } from '../utils/aqi';

export function ForecastStrip({ forecast }: { forecast: ForecastDay[] }) {
  return (
    <div className="card">
      <div className="text-xs font-semibold text-muted mb-3">7-DAY FORECAST</div>
      <div className="grid-7">
        {forecast.map((day, i) => {
          const date = new Date(day.date);
          const label = i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' });
          const isToday = i === 0;
          return (
            <div key={day.date} className="flex-col" style={{
              alignItems: 'center', gap: 6, padding: 10,
              borderRadius: 12, textAlign: 'center',
              background: isToday ? 'rgba(79,163,224,0.1)' : 'var(--bg-inner)',
              border: `1px solid ${isToday ? 'rgba(79,163,224,0.3)' : 'var(--border)'}`,
            }}>
              <div className="text-xs font-semibold" style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}>
                {label}
              </div>
              <div style={{ fontSize: 22 }}>{getWeatherEmoji(day.weather_description)}</div>
              <div className="text-sm font-bold text-white">{Math.round(day.max_temp)}°</div>
              <div className="text-xs text-muted">{Math.round(day.min_temp)}°</div>
              {day.precipitation_sum > 0 && (
                <div className="text-xs text-accent">💧{day.precipitation_sum}mm</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
