// utils/aqi.ts — AQI colors, labels, helpers
export interface AqiInfo {
  color: string;
  bg: string;
  label: string;
  emoji: string;
}

export function getAqiInfo(aqi: number): AqiInfo {
  if (aqi <= 50)  return { color: '#00e400', bg: '#00e40022', label: 'Good',                           emoji: '😊' };
  if (aqi <= 100) return { color: '#ffcc00', bg: '#ffcc0022', label: 'Moderate',                       emoji: '😐' };
  if (aqi <= 150) return { color: '#ff7e00', bg: '#ff7e0022', label: 'Unhealthy for Sensitive Groups', emoji: '😷' };
  if (aqi <= 200) return { color: '#ff0000', bg: '#ff000022', label: 'Unhealthy',                      emoji: '🤢' };
  if (aqi <= 300) return { color: '#8f3f97', bg: '#8f3f9722', label: 'Very Unhealthy',                 emoji: '🚨' };
  return               { color: '#7e0023', bg: '#7e002322', label: 'Hazardous',                        emoji: '☠️' };
}

export function getRiskColor(risk: string): string {
  return { low: '#00e400', moderate: '#ffcc00', high: '#ff4444', very_high: '#8f3f97' }[risk] ?? '#999';
}

export function getRiskEmoji(risk: string): string {
  return { low: '🟢', moderate: '🟡', high: '🔴', very_high: '🟣' }[risk] ?? '⚪';
}

export function getWeatherEmoji(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('clear') || d.includes('sunny')) return '☀️';
  if (d.includes('mainly clear')) return '🌤️';
  if (d.includes('partly cloudy')) return '⛅';
  if (d.includes('overcast') || d.includes('cloudy')) return '☁️';
  if (d.includes('fog')) return '🌫️';
  if (d.includes('thunder')) return '⛈️';
  if (d.includes('snow')) return '❄️';
  if (d.includes('drizzle') || d.includes('rain') || d.includes('shower')) return '🌧️';
  return '🌡️';
}
