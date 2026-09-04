// components/WeatherCard.tsx — plain CSS version
import { Wind, Droplets, Thermometer, Sun, CloudRain } from 'lucide-react';
import type { WeatherData } from '../types';
import { getWeatherEmoji } from '../utils/aqi';

export function WeatherCard({ data }: { data: WeatherData }) {
  const metrics = [
    { icon: <Thermometer size={15} />, label: 'Feels Like',   value: `${data.feels_like}°C` },
    { icon: <Droplets size={15} />,    label: 'Humidity',     value: `${data.humidity}%` },
    { icon: <Wind size={15} />,        label: 'Wind',         value: `${data.wind_speed} km/h` },
    { icon: <Sun size={15} />,         label: 'UV Index',     value: String(data.uv_index) },
    { icon: <CloudRain size={15} />,   label: 'Precipitation',value: `${data.precipitation} mm` },
  ];

  return (
    <div className="card h-full">
      <div className="flex-center gap-3 mb-3">
        <span style={{ fontSize: 40 }}>{getWeatherEmoji(data.weather_description)}</span>
        <div>
          <div className="text-3xl font-bold text-white">{data.temperature}°C</div>
          <div className="text-sm text-muted">{data.weather_description}</div>
        </div>
      </div>
      <div className="grid-2-sm">
        {metrics.map(m => (
          <div key={m.label} className="inner-card flex-center gap-2">
            <span className="text-accent">{m.icon}</span>
            <div>
              <div className="text-xs text-muted">{m.label}</div>
              <div className="text-sm font-semibold text-white">{m.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
