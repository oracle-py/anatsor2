'use client';

import Link from 'next/link';
import { ArrowUpRight, Bird, Droplets, Map as MapIcon, Thermometer, TriangleAlert, Wind } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import FarmMap from '@/components/dashboard/FarmMap';
import { PageHeading, Panel } from '@/components/dashboard/ui';
import { STATES } from '@/lib/farms-data';

const average = (values: (number | null | undefined)[]) => {
  const list = values.filter((value): value is number => value != null);
  return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : null;
};

export default function FarmsPage() {
  const { farms, live } = useFarmData();

  return <>
    <PageHeading eyebrow="Farms" title="Farms by state" description={`${farms.length} farms across ${STATES.length} states. Open a state to see its farms, details and readings.`} />

    <section className="state-grid" aria-label="States">
      {STATES.map(state => {
        const inState = farms.filter(farm => farm.state === state.name);
        const readings = inState.map(farm => live[farm.id]);
        const attention = readings.filter(reading => reading?.alarm_active).length;
        const temp = average(readings.map(r => r?.temperature)), humidity = average(readings.map(r => r?.humidity)), air = average(readings.map(r => r?.air_quality));
        return <Link key={state.slug} href={`/farms/${state.slug}`} className="state-card" style={{ '--state-color': state.color } as React.CSSProperties}>
          <div className="state-card-top">
            <div><p className="farm-eyebrow">{state.capital} region</p><h2>{state.name} State</h2></div>
            <span className={`farm-status ${attention ? 'danger' : 'healthy'}`}>{attention ? `${attention} ATTENTION` : 'ALL NORMAL'}</span>
          </div>
          <div className="state-card-stats">
            <p><strong>{inState.length}</strong><span>Farms</span></p>
            <p><strong>{inState.reduce((sum, farm) => sum + (farm.bird_count || 0), 0).toLocaleString()}</strong><span>Birds</span></p>
            <p><strong>{inState.filter(farm => farm.has_camera).length}</strong><span>AI cameras</span></p>
          </div>
          <div className="farm-card-readings" aria-label="State averages">
            <p><Thermometer size={14} /><strong>{temp?.toFixed(1) ?? '—'}</strong><small>°C avg</small></p>
            <p><Droplets size={14} /><strong>{humidity?.toFixed(1) ?? '—'}</strong><small>% avg</small></p>
            <p><Wind size={14} /><strong>{air?.toFixed(1) ?? '—'}</strong><small>ppm avg</small></p>
          </div>
          <ul className="state-card-farms">{inState.map(farm => <li key={farm.id}><span>{farm.name}</span><span>{live[farm.id]?.alarm_active ? <TriangleAlert size={12} className="danger-text" aria-label="Needs attention" /> : null}<Bird size={12} />{(farm.bird_count || 0).toLocaleString()}</span></li>)}</ul>
          <span className="farm-card-link">View {state.name} farms <ArrowUpRight size={13} /></span>
        </Link>;
      })}
    </section>

    <Panel title="Map" subtitle="All deployments" icon={<MapIcon size={19} />} className="section-gap">
      <FarmMap farms={farms} live={live} height={460} />
    </Panel>
  </>;
}
