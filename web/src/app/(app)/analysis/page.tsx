'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Clock, Lightbulb, TriangleAlert } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import { PageHeading, Panel, Segmented } from '@/components/dashboard/ui';
import { PERIODS, Period, dailyPattern, stateSeries, summarizeFarm } from '@/lib/analytics';
import { STATES, farmPath, stateColor } from '@/lib/farms-data';
import { THRESHOLDS } from '@/lib/simulation';

type Metric = 'temperature' | 'humidity' | 'air_quality';
const METRICS: { value: Metric; label: string; unit: string; lines: number[] }[] = [
  { value: 'temperature', label: 'Temperature', unit: '°C', lines: [THRESHOLDS.tempHigh, THRESHOLDS.tempLow] },
  { value: 'humidity', label: 'Humidity', unit: '%', lines: [THRESHOLDS.humidityHigh, THRESHOLDS.humidityLow] },
  { value: 'air_quality', label: 'Ammonia', unit: 'ppm', lines: [THRESHOLDS.airBad] },
];
const axis = { fontSize: 10, fill: 'var(--text-muted)' };

export default function AnalysisPage() {
  const { farms, now } = useFarmData();
  const [metric, setMetric] = useState<Metric>('temperature');
  const [period, setPeriod] = useState<Exclude<Period, '30d'>>('7d');
  const meta = METRICS.find(item => item.value === metric)!;
  const bucket = now ? Math.floor(now / 600_000) : null;

  const { series, pattern, summaries } = useMemo(() => {
    if (!bucket) return { series: [], pattern: [], summaries: [] };
    const at = bucket * 600_000;
    return {
      series: stateSeries(farms, at, period, metric),
      pattern: dailyPattern(farms, at, '7d', metric),
      summaries: farms.map(farm => summarizeFarm(farm, at, period)),
    };
  }, [farms, bucket, period, metric]);

  // One tick per local midnight on the 7-day view, so day labels don't repeat.
  const dayTicks = period === '7d' && series.length ? (() => {
    const ticks: number[] = []; const d = new Date(series[0].t); d.setHours(24, 0, 0, 0);
    for (; d.getTime() <= series[series.length - 1].t; d.setDate(d.getDate() + 1)) ticks.push(d.getTime());
    return ticks;
  })() : undefined;
  const alarmRanking = [...summaries].sort((a, b) => b.alarmPct - a.alarmPct).map(s => ({ name: s.farm.name, state: s.farm.state, value: Math.round(s.alarmPct * 10) / 10, farm: s.farm }));
  const top = (pick: (s: (typeof summaries)[number]) => number) => [...summaries].sort((a, b) => pick(b) - pick(a))[0];
  const insights = summaries.length ? [
    { label: 'Hottest on average', s: top(s => s.temp.avg), value: (s: (typeof summaries)[number]) => `${s.temp.avg.toFixed(1)} °C` },
    { label: 'Coolest on average', s: top(s => -s.temp.avg), value: (s: (typeof summaries)[number]) => `${s.temp.avg.toFixed(1)} °C` },
    { label: 'Highest ammonia', s: top(s => s.air.avg), value: (s: (typeof summaries)[number]) => `${s.air.avg.toFixed(1)} ppm avg` },
    { label: 'Most time in alarm', s: top(s => s.alarmPct), value: (s: (typeof summaries)[number]) => `${s.alarmPct.toFixed(1)}% of the period` },
    { label: 'Longest fan runtime', s: top(s => s.fanPct), value: (s: (typeof summaries)[number]) => `${s.fanPct.toFixed(0)}% of the period` },
    { label: 'Most AI detections', s: top(s => (s.farm.has_camera ? s.detections : -1)), value: (s: (typeof summaries)[number]) => `${s.detections} detections` },
  ] : [];

  const legend = <div className="chart-legend" aria-label="Legend">{STATES.map(state => <span key={state.slug}><i style={{ background: state.color }} />{state.name}</span>)}</div>;
  const tooltip = (format: (label: unknown) => string) => ({ labelFormatter: format, formatter: (value: unknown, name: unknown) => [`${value} ${meta.unit}`, String(name)] as [string, string], contentStyle: { fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' } });

  return <>
    <PageHeading eyebrow="Analysis" title="Compare conditions" description="How states and farms differ over time, and where problems concentrate." />

    <div className="filter-row">
      <Segmented label="Measurement" value={metric} onChange={setMetric} options={METRICS.map(({ value, label }) => ({ value, label }))} />
      <Segmented label="Period" value={period} onChange={setPeriod} options={[{ value: '24h', label: '24h' }, { value: '7d', label: '7d' }]} />
    </div>

    <Panel title={`${meta.label} by state`} subtitle={`Average across each state's farms · ${PERIODS[period].label.toLowerCase()}`} icon={<Activity size={19} />}>
      {legend}
      <div className="analysis-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tick={axis} axisLine={false} tickLine={false} minTickGap={50} ticks={dayTicks}
              tickFormatter={t => period === '7d' ? new Date(t).toLocaleDateString([], { weekday: 'short', day: 'numeric' }) : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <YAxis tick={axis} axisLine={false} tickLine={false} domain={['auto', 'auto']} unit={metric === 'air_quality' ? '' : meta.unit} />
            <Tooltip {...tooltip(t => new Date(Number(t)).toLocaleString())} />
            {meta.lines.map(value => <ReferenceLine key={value} y={value} stroke="#b91c1c" strokeDasharray="4 3" />)}
            {STATES.map(state => <Line key={state.slug} type="monotone" dataKey={state.name} stroke={state.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footnote">Dashed red lines mark alert thresholds.</p>
    </Panel>

    <div className="farm-lower-grid">
      <Panel title="Time in alarm" subtitle={`Share of the ${PERIODS[period].label.toLowerCase()} with any active warning`} icon={<TriangleAlert size={19} />}>
        <div style={{ height: alarmRanking.length * 28 + 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alarmRanking} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }} barCategoryGap={6}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={axis} axisLine={false} tickLine={false} unit="%" domain={[0, 'auto']} />
              <YAxis type="category" dataKey="name" width={175} tick={{ fontSize: 11, fill: 'var(--text-body)' }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip cursor={{ fill: 'var(--background)' }} formatter={(value: unknown) => [`${value}%`, 'Time in alarm']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false}>
                {alarmRanking.map(row => <Cell key={row.farm.id} fill={stateColor(row.state)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {legend}
      </Panel>

      <Panel title="Highlights" subtitle={PERIODS[period].label} icon={<Lightbulb size={19} />}>
        <ul className="insight-list">{insights.map(({ label, s, value }) => <li key={label}><span>{label}</span><Link href={farmPath(s.farm)}>{s.farm.name}</Link><strong>{value(s)}</strong></li>)}</ul>
      </Panel>
    </div>

    <Panel title={`Daily ${meta.label.toLowerCase()} pattern`} subtitle="Average by hour of day over the last 7 days" icon={<Clock size={19} />} className="section-gap">
      {legend}
      <div className="analysis-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pattern} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={axis} axisLine={false} tickLine={false} tickFormatter={hour => `${String(hour).padStart(2, '0')}:00`} interval={2} />
            <YAxis tick={axis} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip {...tooltip(hour => `${String(hour).padStart(2, '0')}:00`)} />
            {STATES.map(state => <Line key={state.slug} type="monotone" dataKey={state.name} stroke={state.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footnote">Useful for scheduling ventilation and checks around the hottest hours.</p>
    </Panel>
  </>;
}
