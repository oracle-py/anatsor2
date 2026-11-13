'use client';

import { Database, Gauge, UserRound } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import { PageHeading, Panel } from '@/components/dashboard/ui';
import { LIVE_TICK_MS, THRESHOLDS } from '@/lib/simulation';

const thresholds = [
  { label: 'High temperature', value: `> ${THRESHOLDS.tempHigh} °C`, action: 'Fans on, alarm' },
  { label: 'Low temperature', value: `< ${THRESHOLDS.tempLow} °C`, action: 'Alarm' },
  { label: 'High humidity', value: `> ${THRESHOLDS.humidityHigh} %`, action: 'Fans on, alarm' },
  { label: 'Low humidity', value: `< ${THRESHOLDS.humidityLow} %`, action: 'Humidifier on, alarm' },
  { label: 'Poor air quality (ammonia)', value: `> ${THRESHOLDS.airBad} ppm`, action: 'Exhaust fans on, alarm' },
];

export default function SettingsPage() {
  const { user, farms } = useFarmData();

  return <>
    <PageHeading eyebrow="Settings" title="Workspace settings" description="Account, alert thresholds and data source." />

    <div className="settings-grid">
      <Panel title="Account" subtitle="Signed-in administrator" icon={<UserRound size={19} />}>
        <dl className="record-list">
          <div><dt>Name</dt><dd>{user.name}</dd></div>
          <div><dt>Email</dt><dd>{user.email || '—'}</dd></div>
          <div><dt>Role</dt><dd>Project administrator</dd></div>
          <div><dt>Access</dt><dd>All {farms.length} farms</dd></div>
        </dl>
      </Panel>

      <Panel title="Data source" subtitle="Where readings come from" icon={<Database size={19} />}>
        <dl className="record-list">
          <div><dt>Readings</dt><dd>Simulated per farm from local climate profiles</dd></div>
          <div><dt>Refresh</dt><dd>Every {LIVE_TICK_MS / 1000} seconds</dd></div>
          <div><dt>Map positions</dt><dd>Approximate, within each state</dd></div>
        </dl>
        <p className="chart-footnote">Switch to live device data once each farm&apos;s AIPMS unit is reporting to Supabase.</p>
      </Panel>
    </div>

    <Panel title="Alert thresholds" subtitle="Applied to every farm · the controller acts automatically when a limit is crossed" icon={<Gauge size={19} />} className="section-gap">
      <div className="table-scroll">
        <table className="farm-table">
          <thead><tr><th scope="col">Condition</th><th scope="col">Limit</th><th scope="col">Automatic response</th></tr></thead>
          <tbody>{thresholds.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td><td>{row.action}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="chart-footnote">Per-farm thresholds can be added later (e.g. brooder houses need warmer limits).</p>
    </Panel>
  </>;
}
