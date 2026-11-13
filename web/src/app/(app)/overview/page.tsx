'use client';

import Link from 'next/link';
import { BarChart3, Bird, Camera, Map as MapIcon, MapPin, Table2, TriangleAlert, Warehouse } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import FarmMap from '@/components/dashboard/FarmMap';
import ComparisonChart from '@/components/dashboard/ComparisonChart';
import FarmTable from '@/components/dashboard/FarmTable';
import { PageHeading, Panel, StatCard } from '@/components/dashboard/ui';
import { STATES, farmPath } from '@/lib/farms-data';
import { activeAlarms } from '@/lib/simulation';

export default function OverviewPage() {
  const { farms, live, now, user } = useFarmData();
  const birds = farms.reduce((sum, farm) => sum + (farm.bird_count || 0), 0);
  const attention = farms.filter(farm => live[farm.id]?.alarm_active);
  const cameras = farms.filter(farm => farm.has_camera).length;
  const states = STATES.map(state => {
    const inState = farms.filter(farm => farm.state === state.name);
    return { ...state, farms: inState.length, birds: inState.reduce((sum, farm) => sum + (farm.bird_count || 0), 0), attention: inState.filter(farm => live[farm.id]?.alarm_active).length };
  });

  return <>
    <PageHeading eyebrow="Youth4Climate · AIPMS deployments 2026" title={`Good ${greeting(now)}, ${user.name}`} description="Every deployed poultry house at a glance. Readings refresh every few seconds." />

    <section className="stat-grid" aria-label="Summary">
      <StatCard icon={<Warehouse size={18} />} label="Farms" value={farms.length} caption="AIPMS installations" />
      <StatCard icon={<MapPin size={18} />} label="States" value={states.length} caption={states.map(state => state.name).join(' · ')} />
      <StatCard icon={<Bird size={18} />} label="Birds monitored" value={birds.toLocaleString()} caption="Combined poultry population" />
      <StatCard icon={<TriangleAlert size={18} />} label="Need attention" value={attention.length} caption={attention.length ? 'Active environmental warnings' : 'No active warnings'} danger={attention.length > 0} />
      <StatCard icon={<Camera size={18} />} label="AI cameras" value={cameras} caption="Farms with threat detection" />
    </section>

    <div className="overview-grid">
      <Panel title="Farm locations" subtitle="Benue, Plateau and Nasarawa States" icon={<MapIcon size={19} />} className="map-panel">
        <FarmMap farms={farms} live={live} />
      </Panel>
      <Panel title="By state" subtitle="Farms and birds per state" icon={<MapPin size={19} />}>
        <ul className="state-breakdown">
          {states.map(state => <li key={state.slug}>
            <Link href={`/farms/${state.slug}`}>
              <div className="state-breakdown-top"><span><i style={{ background: state.color }} />{state.name}</span><strong>{state.farms} farms</strong></div>
              <div className="share-bar" aria-hidden="true"><span style={{ width: `${(state.birds / birds) * 100}%`, background: state.color }} /></div>
              <div className="state-breakdown-meta"><span>{state.birds.toLocaleString()} birds · {Math.round((state.birds / birds) * 100)}%</span><span className={state.attention ? 'danger-text' : ''}>{state.attention ? `${state.attention} need attention` : 'All normal'}</span></div>
            </Link>
          </li>)}
        </ul>
        {attention.length > 0 && <div className="attention-list">
          <h3><TriangleAlert size={14} />Needs attention now</h3>
          <ul>{attention.map(farm => <li key={farm.id}><Link href={farmPath(farm)}>{farm.name}</Link><span>{activeAlarms(live[farm.id]).join(', ')}</span></li>)}</ul>
        </div>}
      </Panel>
    </div>

    <Panel title="Compare farms" subtitle="Latest reading per farm, colored by state" icon={<BarChart3 size={19} />} className="section-gap">
      <ComparisonChart farms={farms} live={live} />
    </Panel>

    <Panel title="All farms" subtitle="Sort by any column · select a farm for full details" icon={<Table2 size={19} />} className="section-gap">
      <FarmTable farms={farms} live={live} />
    </Panel>
  </>;
}

function greeting(now: number | null) {
  if (!now) return 'day';
  const hour = new Date(now).getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}
