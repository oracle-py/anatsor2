import type { FarmRecord } from './farms-data';
import { STATES } from './farms-data';
import { Reading, detectionsBetween, sampleHistory } from './simulation';

const HOUR = 3600_000;

export const PERIODS = {
  '24h': { label: 'Last 24 hours', window: 24 * HOUR, step: 10 * 60_000 },
  '7d': { label: 'Last 7 days', window: 7 * 24 * HOUR, step: HOUR },
  '30d': { label: 'Last 30 days', window: 30 * 24 * HOUR, step: 3 * HOUR },
} as const;
export type Period = keyof typeof PERIODS;

export type FarmSummary = {
  farm: FarmRecord;
  samples: number;
  temp: { avg: number; min: number; max: number };
  humidity: { avg: number; min: number; max: number };
  air: { avg: number; min: number; max: number };
  alarmPct: number;
  alarmHours: number;
  fanPct: number;
  humidifierPct: number;
  detections: number;
};

function stats(values: (number | null)[]) {
  const list = values.filter((value): value is number => value != null);
  if (!list.length) return { avg: NaN, min: NaN, max: NaN };
  return { avg: list.reduce((sum, value) => sum + value, 0) / list.length, min: Math.min(...list), max: Math.max(...list) };
}

const share = (rows: Reading[], pick: (row: Reading) => boolean) => rows.length ? (rows.filter(pick).length / rows.length) * 100 : 0;

export function summarizeFarm(farm: FarmRecord, now: number, period: Period): FarmSummary {
  const { window, step } = PERIODS[period];
  const rows = sampleHistory(farm, now, window, step);
  const alarmPct = share(rows, row => row.alarm_active);
  const covered = Math.min(window, now - (farm.installed_at ? Date.parse(farm.installed_at) : 0));
  return {
    farm,
    samples: rows.length,
    temp: stats(rows.map(row => row.temperature)),
    humidity: stats(rows.map(row => row.humidity)),
    air: stats(rows.map(row => row.air_quality)),
    alarmPct,
    alarmHours: (alarmPct / 100) * (covered / HOUR),
    fanPct: share(rows, row => row.fan_on),
    humidifierPct: share(rows, row => row.humidifier_on),
    detections: detectionsBetween(farm, now - window, now).length,
  };
}

export type StateSeriesPoint = { t: number } & Record<string, number | null>;

/** Average of `metric` per state at each step over the window (for line charts). */
export function stateSeries(farms: FarmRecord[], now: number, period: Period, metric: 'temperature' | 'humidity' | 'air_quality'): StateSeriesPoint[] {
  const { window, step } = PERIODS[period];
  const histories = farms.map(farm => ({ farm, rows: sampleHistory(farm, now, window, step) }));
  const byTime = new Map<number, Record<string, number[]>>();
  for (const { farm, rows } of histories) {
    for (const row of rows) {
      const t = Math.floor(Date.parse(row.created_at) / step) * step;
      const bucket = byTime.get(t) || {};
      (bucket[farm.state || 'Other'] ||= []).push(row[metric] as number);
      byTime.set(t, bucket);
    }
  }
  return [...byTime.entries()].sort(([a], [b]) => a - b).map(([t, bucket]) => {
    const point: StateSeriesPoint = { t };
    for (const state of STATES) {
      const values = bucket[state.name];
      point[state.name] = values?.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : null;
    }
    return point;
  });
}

/** Average of `metric` per state by local hour of day (0–23) over the window. */
export function dailyPattern(farms: FarmRecord[], now: number, period: Period, metric: 'temperature' | 'humidity' | 'air_quality') {
  const { window } = PERIODS[period];
  const sums = STATES.map(() => Array.from({ length: 24 }, () => ({ sum: 0, n: 0 })));
  for (const farm of farms) {
    const index = STATES.findIndex(state => state.name === farm.state);
    if (index < 0) continue;
    for (const row of sampleHistory(farm, now, window, HOUR)) {
      const hour = new Date(row.created_at).getHours();
      const value = row[metric];
      if (value != null) { sums[index][hour].sum += value; sums[index][hour].n += 1; }
    }
  }
  return Array.from({ length: 24 }, (_, hour) => {
    const point: Record<string, number | null> & { hour: number } = { hour };
    STATES.forEach((state, index) => { const { sum, n } = sums[index][hour]; point[state.name] = n ? Math.round((sum / n) * 10) / 10 : null; });
    return point;
  });
}

export function toCsv(summaries: FarmSummary[], period: Period) {
  const header = ['Farm', 'Device ID', 'State', 'Birds', 'Installed', 'Avg temp (°C)', 'Min temp', 'Max temp', 'Avg humidity (%)', 'Min humidity', 'Max humidity', 'Avg ammonia (ppm)', 'Max ammonia', 'Time in alarm (%)', 'Alarm hours', 'Fan runtime (%)', 'Humidifier runtime (%)', 'AI detections', 'Period'];
  const fixed = (value: number) => Number.isFinite(value) ? value.toFixed(1) : '';
  const rows = summaries.map(s => [s.farm.name, s.farm.id, s.farm.state, s.farm.bird_count, s.farm.installed_at, fixed(s.temp.avg), fixed(s.temp.min), fixed(s.temp.max), fixed(s.humidity.avg), fixed(s.humidity.min), fixed(s.humidity.max), fixed(s.air.avg), fixed(s.air.max), fixed(s.alarmPct), fixed(s.alarmHours), fixed(s.fanPct), fixed(s.humidifierPct), s.farm.has_camera ? s.detections : '', PERIODS[period].label]);
  return [header, ...rows].map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}
