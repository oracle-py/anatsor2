'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Sample = { created_at: string; temperature: number | null; humidity: number | null; air_quality: number | null };
const series = [
  { key: 'temperature', name: 'Temperature', unit: '°C', color: 'var(--brand-primary)', dash: undefined },
  { key: 'humidity', name: 'Humidity', unit: '%', color: 'var(--brand-secondary)', dash: '6 3' },
  { key: 'air_quality', name: 'Ammonia / air quality', unit: 'ppm', color: 'var(--brand-gold)', dash: '2 3' },
];

export default function EnvironmentalTrends({ readings, showDate = false }: { readings: Sample[]; showDate?: boolean }) {
  const tick = (value: string) => showDate ? new Date(value).toLocaleDateString([], { weekday: 'short', day: 'numeric' }) : new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return <div className="trend-series">{series.map(series => <div key={series.key}>
    <p className="trend-label"><span style={{ background: series.color }} />{series.name} <small>{series.unit}</small></p>
    {readings.filter(row => row[series.key as keyof Sample] !== null).length < 2 ? <div className="trend-empty">Waiting for at least two readings.</div> : <div className="trend-chart"><ResponsiveContainer width="100%" height="100%">
      <LineChart data={readings} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="created_at" tickFormatter={tick} minTickGap={55} tick={{ fontSize: 10, fill: '#776C67' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#776C67' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip labelFormatter={value => new Date(String(value)).toLocaleString()} formatter={value => [`${value} ${series.unit}`, series.name]} />
        <Line type="monotone" dataKey={series.key} name={series.name} stroke={series.color} strokeWidth={2.5} strokeDasharray={series.dash} dot={false} connectNulls={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer></div>}
  </div>)}</div>;
}
