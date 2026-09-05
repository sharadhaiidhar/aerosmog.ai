// components/ForecastStrip.tsx — OnePlus Nord CE5 inspired 7-day forecast strip
import type { ForecastDay } from '../types';
import { getWeatherEmoji } from '../utils/aqi';

/**
 * Safely parse date and return robust day name and calendar date.
 * Avoids browser UTC-midnight timezone shift bugs by parsing local date parts.
 */
function getDayAndDate(dateStr: string, index: number): { dayName: string; dateNum: string; isToday: boolean } {
  let d: Date;

  if (dateStr && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      d = new Date(y, m, day);
    } else {
      d = new Date();
      d.setDate(d.getDate() + index);
    }
  } else {
    // If the date is already a word like "Today", "Tomorrow", or empty
    d = new Date();
    d.setDate(d.getDate() + index);
  }

  if (isNaN(d.getTime())) {
    d = new Date();
    d.setDate(d.getDate() + index);
  }

  const isToday = index === 0;
  let dayName = '';
  if (isToday) {
    dayName = 'Today';
  } else if (index === 1) {
    dayName = 'Tomorrow';
  } else {
    dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  const dateNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return { dayName, dateNum, isToday };
}

export function ForecastStrip({ forecast }: { forecast: ForecastDay[] }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div className="flex-between mb-3">
        <div className="text-xs font-semibold text-muted" style={{ letterSpacing: '0.05em' }}>
          7-DAY FORECAST
        </div>
        <div className="text-xs text-muted">Daily High / Low</div>
      </div>

      <div className="grid-7" style={{ gap: '8px' }}>
        {forecast.map((day, i) => {
          const { dayName, dateNum, isToday } = getDayAndDate(day.date, i);

          return (
            <div
              key={`${day.date}-${i}`}
              className="flex-col"
              style={{
                alignItems: 'center',
                gap: 6,
                padding: '12px 8px',
                borderRadius: 14,
                textAlign: 'center',
                background: isToday
                  ? 'linear-gradient(180deg, rgba(79,163,224,0.18) 0%, rgba(20,25,35,0.7) 100%)'
                  : 'var(--bg-inner)',
                border: isToday
                  ? '1px solid rgba(79,163,224,0.45)'
                  : '1px solid var(--border)',
                boxShadow: isToday ? '0 4px 16px rgba(79,163,224,0.15)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Day title: "Today", "Tomorrow", "Mon" */}
              <div
                className="text-xs font-bold"
                style={{
                  color: isToday ? 'var(--accent)' : '#e2e8f0',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {dayName}
              </div>

              {/* Date subtitle: "5 Sep", "6 Sep" */}
              <div
                style={{
                  color: isToday ? 'rgba(79,163,224,0.85)' : '#718096',
                  fontSize: '10px',
                  fontWeight: 500,
                  marginTop: -4,
                }}
              >
                {dateNum}
              </div>

              {/* Weather icon */}
              <div style={{ fontSize: 24, margin: '2px 0' }}>
                {getWeatherEmoji(day.weather_description)}
              </div>

              {/* Max temp */}
              <div className="text-sm font-bold text-white">
                {Math.round(day.max_temp)}°
              </div>

              {/* Min temp */}
              <div className="text-xs" style={{ color: '#94a3b8' }}>
                {Math.round(day.min_temp)}°
              </div>

              {/* Rain if any */}
              {day.precipitation_sum > 0 ? (
                <div
                  style={{
                    fontSize: '10px',
                    color: '#38bdf8',
                    background: 'rgba(56,189,248,0.12)',
                    padding: '1px 5px',
                    borderRadius: 6,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  💧{day.precipitation_sum}mm
                </div>
              ) : (
                <div style={{ height: 16 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

