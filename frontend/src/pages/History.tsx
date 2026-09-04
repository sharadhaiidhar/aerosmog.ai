// pages/History.tsx — plain CSS version
import { useState, useEffect } from 'react';
import { History, TrendingUp } from 'lucide-react';
import { getSessionId } from '../utils/session';
import { getAlertHistory, getAqiTrend } from '../api/client';
import type { AlertHistory, TrendEntry } from '../types';
import { getAqiInfo, getRiskColor } from '../utils/aqi';
import { TrendChart } from '../components/TrendChart';
import { CardSkeleton } from '../components/Skeleton';

export default function HistoryPage() {
  const sessionId = getSessionId();
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [trend, setTrend] = useState<TrendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAlertHistory(sessionId, days), getAqiTrend(sessionId, days)])
      .then(([h, t]) => { setHistory(h); setTrend(t.trend ?? []); })
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="page space-y">
      <div className="flex-between flex-wrap gap-3">
        <div className="flex-center gap-3">
          <div style={{ padding: 10, borderRadius: 12, background: 'var(--accent-bg)' }}>
            <History size={20} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-white">Alert History</h1>
        </div>
        <select value={days} onChange={e => setDays(+e.target.value)}
          style={{ width: 'auto', padding: '8px 14px' }}>
          {[7, 14, 30].map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y"><CardSkeleton /><CardSkeleton /></div>
      ) : (
        <>
          <div className="flex-center gap-2">
            <TrendingUp size={13} className="text-muted" />
            <span className="text-xs font-semibold text-muted">AQI TREND</span>
          </div>
          <TrendChart trend={trend} />

          {history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📋</div>
              <p className="text-sm text-muted">No history yet. Go to Dashboard and click Refresh to generate your first advisory.</p>
            </div>
          ) : (
            <div className="card">
              <div className="text-xs font-semibold text-muted mb-4">{history.length} RECORDS</div>
              <div className="space-y-sm">
                {history.map(h => {
                  const info = getAqiInfo(h.aqi);
                  return (
                    <div key={h.id} className="inner-card" style={{ border: '1px solid var(--border)' }}>
                      <div className="flex-between flex-wrap gap-3" style={{ marginBottom: 8 }}>
                        <div className="flex-center gap-3">
                          {/* AQI circle */}
                          <div style={{
                            width: 48, height: 48, borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 17, flexShrink: 0,
                            background: info.bg, color: info.color,
                            border: `2px solid ${info.color}44`,
                          }}>{h.aqi}</div>
                          <div>
                            <div className="font-semibold text-white text-sm">{h.city}</div>
                            <div className="text-xs" style={{ color: info.color }}>{h.aqi_category}</div>
                            <div className="text-xs text-muted">{h.created_at.slice(0,16).replace('T',' ')}</div>
                          </div>
                        </div>
                        <span className="badge" style={{
                          background: getRiskColor(h.risk_level) + '22',
                          color: getRiskColor(h.risk_level), flexShrink: 0
                        }}>{h.risk_level.replace('_',' ')}</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{h.advisory_text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
