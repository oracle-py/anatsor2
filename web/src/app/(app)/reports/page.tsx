'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Download, FileText, Printer, ShieldAlert, Thermometer, TriangleAlert } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import { PageHeading, Panel, Segmented, StatCard, StateSwatch } from '@/components/dashboard/ui';
import { PERIODS, Period, summarizeFarm, toCsv } from '@/lib/analytics';
import { STATES, farmPath } from '@/lib/farms-data';

type StateFilter = 'All' | string;

export default function ReportsPage() {
  const { farms, now } = useFarmData();
  const [period, setPeriod] = useState<Period>('7d');
  const [state, setState] = useState<StateFilter>('All');

  // Recompute every 10 minutes of wall time, not on every live tick.
  const bucket = now ? Math.floor(now / 600_000) : null;
  const summaries = useMemo(() => {
    if (!bucket) return [];
    const at = bucket * 600_000;
    return farms.filter(farm => state === 'All' || farm.state === state).map(farm => summarizeFarm(farm, at, period));
  }, [farms, bucket, period, state]);

  const totals = useMemo(() => {
    const weighted = (pick: (s: (typeof summaries)[number]) => number) => {
      const birds = summaries.reduce((sum, s) => sum + (s.farm.bird_count || 0), 0);
      return birds ? summaries.reduce((sum, s) => sum + pick(s) * (s.farm.bird_count || 0), 0) / birds : NaN;
    };
    return {
      avgTemp: weighted(s => s.temp.avg),
      alarmHours: summaries.reduce((sum, s) => sum + s.alarmHours, 0),
      detections: summaries.reduce((sum, s) => sum + (s.farm.has_camera ? s.detections : 0), 0),
      flagged: summaries.filter(s => s.alarmPct >= 10).length,
    };
  }, [summaries]);

  function downloadCsv() {
    const blob = new Blob([toCsv(summaries, period)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: `aipms-report-${period}-${state.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  }

  const n = (value: number, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '—';

  return <>
    <PageHeading eyebrow="Reports" title="Farm performance report" description={`${PERIODS[period].label} · ${state === 'All' ? 'all states' : `${state} State`} · ${summaries.length} farms`}>
      <button type="button" className="farm-button secondary" onClick={() => window.print()}><Printer size={16} />Print / PDF</button>
      <button type="button" className="farm-button" onClick={downloadCsv} disabled={!summaries.length}><Download size={16} />Download CSV</button>
    </PageHeading>

    <div className="filter-row no-print">
      <Segmented label="Period" value={period} onChange={setPeriod} options={(Object.keys(PERIODS) as Period[]).map(value => ({ value, label: value }))} />
      <Segmented label="State" value={state} onChange={setState} options={[{ value: 'All', label: 'All states' }, ...STATES.map(s => ({ value: s.name, label: s.name }))]} />
    </div>

    <section className="farm-metrics" aria-label="Report summary">
      <StatCard icon={<Thermometer size={18} />} label="Average temperature" value={<>{n(totals.avgTemp)}<small>°C</small></>} caption="Weighted by flock size" />
      <StatCard icon={<Clock size={18} />} label="Alarm hours" value={n(totals.alarmHours, 0)} caption="Total time with an active warning" />
      <StatCard icon={<TriangleAlert size={18} />} label="Farms ≥10% in alarm" value={totals.flagged} caption="Candidates for a site visit" danger={totals.flagged > 0} />
      <StatCard icon={<ShieldAlert size={18} />} label="AI detections" value={totals.detections} caption="Rats and snakes, camera farms" />
    </section>

    <Panel title="Per-farm summary" subtitle="Averages with min–max range · time-in-alarm and equipment runtime as % of the period" icon={<FileText size={19} />}>
      <div className="table-scroll">
        <table className="farm-table report-table">
          <thead><tr>
            <th scope="col">Farm</th><th scope="col">State</th><th scope="col" className="num">Birds</th>
            <th scope="col" className="num">Temp °C<small>avg (min–max)</small></th>
            <th scope="col" className="num">Humidity %<small>avg (min–max)</small></th>
            <th scope="col" className="num">NH₃ ppm<small>avg (max)</small></th>
            <th scope="col" className="num">In alarm</th><th scope="col" className="num">Fan on</th><th scope="col" className="num">Humidifier on</th><th scope="col" className="num">Detections</th>
          </tr></thead>
          <tbody>{summaries.map(s => <tr key={s.farm.id}>
            <th scope="row"><Link href={farmPath(s.farm)}>{s.farm.name}</Link><small>{s.farm.id}</small></th>
            <td><span className="state-cell"><StateSwatch state={s.farm.state} />{s.farm.state}</span></td>
            <td className="num">{(s.farm.bird_count || 0).toLocaleString()}</td>
            <td className="num">{n(s.temp.avg)} <small>({n(s.temp.min)}–{n(s.temp.max)})</small></td>
            <td className="num">{n(s.humidity.avg)} <small>({n(s.humidity.min)}–{n(s.humidity.max)})</small></td>
            <td className="num">{n(s.air.avg)} <small>({n(s.air.max)})</small></td>
            <td className={`num ${s.alarmPct >= 10 ? 'danger-text' : ''}`}>{n(s.alarmPct)}%<small>{n(s.alarmHours, 0)} h</small></td>
            <td className="num">{n(s.fanPct, 0)}%</td>
            <td className="num">{n(s.humidifierPct, 0)}%</td>
            <td className="num">{s.farm.has_camera ? s.detections : '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="chart-footnote">Generated {now ? new Date(now).toLocaleString() : '—'}. Periods before a farm&apos;s installation date are excluded.</p>
    </Panel>
  </>;
}
