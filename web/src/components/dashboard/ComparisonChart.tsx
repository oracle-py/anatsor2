'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FarmRecord } from '@/lib/farms-data';
import { STATES, farmPath, stateColor } from '@/lib/farms-data';
import { Reading, THRESHOLDS } from '@/lib/simulation';
import { Segmented } from './ui';

export type Metric = 'temperature' | 'humidity' | 'air_quality' | 'bird_count';

export const METRICS: { value: Metric; label: string; unit: string; lines: { value: number; label: string }[] }[] = [
  { value: 'temperature', label: 'Temperature', unit: '°C', lines: [{ value: THRESHOLDS.tempHigh, label: `High ${THRESHOLDS.tempHigh}` }, { value: THRESHOLDS.tempLow, label: `Low ${THRESHOLDS.tempLow}` }] },
  { value: 'humidity', label: 'Humidity', unit: '%', lines: [{ value: THRESHOLDS.humidityHigh, label: `High ${THRESHOLDS.humidityHigh}` }, { value: THRESHOLDS.humidityLow, label: `Low ${THRESHOLDS.humidityLow}` }] },
  { value: 'air_quality', label: 'Ammonia', unit: 'ppm', lines: [{ value: THRESHOLDS.airBad, label: `Limit ${THRESHOLDS.airBad}` }] },
  { value: 'bird_count', label: 'Birds', unit: 'birds', lines: [] },
];

export default function ComparisonChart({ farms, live }: { farms: FarmRecord[]; live: Record<string, Reading> }) {
  const router = useRouter();
  const [metric, setMetric] = useState<Metric>('temperature');
  const meta = METRICS.find(item => item.value === metric)!;

  const data = useMemo(() => farms
    .map(farm => ({ farm, name: farm.name, state: farm.state, value: metric === 'bird_count' ? farm.bird_count || 0 : live[farm.id]?.[metric] ?? null }))
    .filter(row => row.value != null)
    .sort((a, b) => (b.value as number) - (a.value as number)), [farms, live, metric]);

  const states = STATES.filter(state => farms.some(farm => farm.state === state.name));
  const format = (value: number) => metric === 'bird_count' ? value.toLocaleString() : value.toFixed(1);

  return <div>
    <div className="chart-toolbar">
      <Segmented label="Compare by" value={metric} onChange={setMetric} options={METRICS.map(({ value, label }) => ({ value, label }))} />
      <div className="chart-legend" aria-label="Legend">{states.map(state => <span key={state.slug}><i style={{ background: state.color }} />{state.name}</span>)}</div>
    </div>
    <div style={{ height: Math.max(240, data.length * 30 + 60) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 22, right: 24, left: 4, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 'auto']} tickFormatter={value => metric === 'bird_count' ? Number(value).toLocaleString() : String(value)} />
          <YAxis type="category" dataKey="name" width={175} tick={{ fontSize: 11, fill: 'var(--text-body)' }} axisLine={false} tickLine={false} interval={0} />
          <Tooltip cursor={{ fill: 'var(--background)' }} content={({ active, payload }) => {
            const row = active && payload?.[0]?.payload as (typeof data)[number] | undefined;
            if (!row) return null;
            return <div className="chart-tooltip"><strong>{row.name}</strong><span><i style={{ background: stateColor(row.state) }} />{row.state}</span><span>{meta.label}: <b>{format(row.value as number)}</b> {meta.unit}</span></div>;
          }} />
          {meta.lines.map(line => <ReferenceLine key={line.label} x={line.value} stroke="#b91c1c" strokeDasharray="4 3" label={{ value: line.label, position: 'top', fontSize: 10, fill: '#b91c1c' }} />)}
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} onClick={(row: { farm?: FarmRecord }) => row.farm && router.push(farmPath(row.farm))} style={{ cursor: 'pointer' }}>
            {data.map(row => <Cell key={row.farm.id} fill={stateColor(row.state)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <p className="chart-footnote">{meta.lines.length ? 'Dashed lines mark alert thresholds. ' : ''}Live values · click a bar to open the farm.</p>
  </div>;
}
