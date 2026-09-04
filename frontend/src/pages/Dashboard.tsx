// pages/Dashboard.tsx — plain CSS version
import { useState, useEffect, useCallback } from 'react';
import { MapPin, RefreshCw, Clock } from 'lucide-react';
import { getSessionId } from '../utils/session';
import { detectLocation } from '../utils/location';
import { generateAdvisory, getAqiTrend, getAlertHistory } from '../api/client';
import type { AdvisoryResponse, LocationResult, TrendEntry, AlertHistory } from '../types';
import { AqiGauge } from '../components/AqiGauge';
import { WeatherCard } from '../components/WeatherCard';
import { AdvisoryCard } from '../components/AdvisoryCard';
import { ForecastStrip } from '../components/ForecastStrip';
import { TrendChart } from '../components/TrendChart';
import { CardSkeleton } from '../components/Skeleton';
import { getAqiInfo, getRiskColor } from '../utils/aqi';

export default function Dashboard() {
  const sessionId = getSessionId();
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [trend, setTrend] = useState<TrendEntry[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLocLoading(true);
    detectLocation().then(loc => {
      if (loc) setLocation(loc);
      else setError('Could not detect location. Set it manually in Profile, or try again.');
      setLocLoading(false);
    });
  }, []);

  const fetchAll = useCallback(async () => {
    if (!location) return;
    setLoading(true); setError(null);
    try {
      const [adv, tr, hist] = await Promise.all([
        generateAdvisory(sessionId, location.lat, location.lon),
        getAqiTrend(sessionId, 7),
        getAlertHistory(sessionId, 7),
      ]);
      setAdvisory(adv);
      setTrend(tr.trend ?? []);
      setHistory(hist);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to generate advisory. Make sure the backend is running at localhost:8000.');
    } finally { setLoading(false); }
  }, [location, sessionId]);

  useEffect(() => { if (location) fetchAll(); }, [location]);

  if (locLoading) return (
    <div className="page space-y">
      <CardSkeleton /><div className="grid-2"><CardSkeleton /><CardSkeleton /></div><CardSkeleton />
    </div>
  );

  const aqiInfo = advisory ? getAqiInfo(advisory.aqi.aqi) : null;

  return (
    <div className="page space-y">
      {/* Header */}
      <div className="flex-between flex-wrap gap-3">
        <div>
          <div className="flex-center gap-2">
            <MapPin size={15} className="text-accent" />
            <span className="font-bold text-lg text-white">
              {location ? `${location.city}${location.country ? `, ${location.country}` : ''}` : 'Detecting...'}
            </span>
            {location && <span className="badge badge-accent">via {location.source}</span>}
          </div>
          {lastUpdated && (
            <div className="flex-center gap-1 text-xs text-muted mt-1">
              <Clock size={11} /> Updated {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchAll}
          disabled={loading || !location}
        >
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          {loading ? 'Fetching...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: 'rgba(255,68,68,0.4)', background: 'rgba(255,0,0,0.06)', color: '#ff8888' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Skeletons while loading */}
      {loading && !advisory && <div className="grid-2"><CardSkeleton /><CardSkeleton /></div>}

      {advisory && (() => {
        const pollutants = [
          { k: 'pm25', label: 'PM2.5', v: advisory.aqi.pm25 },
          { k: 'pm10', label: 'PM10',  v: advisory.aqi.pm10  },
          { k: 'o3',   label: 'O₃',   v: advisory.aqi.o3    },
          { k: 'no2',  label: 'NO₂',  v: advisory.aqi.no2   },
          { k: 'so2',  label: 'SO₂',  v: advisory.aqi.so2   },
          { k: 'co',   label: 'CO',   v: advisory.aqi.co    },
        ].filter(p => p.v != null);

        return (
          <>
            {/* Row 1: AQI + Weather */}
            <div className="grid-2">
              <div className="card flex-col" style={{ alignItems: 'center', gap: 8 }}>
                <div className="text-xs font-semibold text-muted self-start">AIR QUALITY INDEX</div>
                <AqiGauge aqi={advisory.aqi.aqi} category={advisory.aqi.aqi_category} />
                <div className="grid-3 w-full mt-1">
                  {pollutants.map(p => (
                    <div key={p.k} className="inner-card" style={{ textAlign: 'center' }}>
                      <div className="text-xs text-muted">{p.label}</div>
                      <div className="text-sm font-bold" style={{ color: aqiInfo?.color }}>{Math.round(p.v!)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <WeatherCard data={advisory.weather} />
            </div>

            {/* Row 2: AI Advisory */}
            <AdvisoryCard text={advisory.advisory_text} risk={advisory.risk_level} actions={advisory.action_items} />

            {/* Row 3: Forecast */}
            <ForecastStrip forecast={advisory.forecast} />

            {/* Row 4: Trend */}
            <TrendChart trend={trend} />

            {/* Row 5: History Table */}
            {history.length > 0 && (
              <div className="card">
                <div className="text-xs font-semibold text-muted mb-4">ALERT HISTORY — LAST 7 DAYS</div>
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        {['Date','City','AQI','Category','Risk','Advisory'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(h => {
                        const info = getAqiInfo(h.aqi);
                        return (
                          <tr key={h.id}>
                            <td className="text-xs text-muted">{h.created_at.slice(0,16).replace('T',' ')}</td>
                            <td>{h.city}</td>
                            <td style={{ fontWeight: 700, color: info.color }}>{h.aqi}</td>
                            <td className="text-xs">{h.aqi_category}</td>
                            <td>
                              <span className="badge" style={{ background: getRiskColor(h.risk_level) + '22', color: getRiskColor(h.risk_level) }}>
                                {h.risk_level}
                              </span>
                            </td>
                            <td className="text-xs text-muted">{h.advisory_text.slice(0,80)}...</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
