'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bird, Camera, Map as MapIcon, Table2, TriangleAlert, Warehouse } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import FarmMap from '@/components/dashboard/FarmMap';
import FarmTable from '@/components/dashboard/FarmTable';
import { FarmCard, PageHeading, Panel, StatCard } from '@/components/dashboard/ui';
import { STATES, stateBySlug } from '@/lib/farms-data';

export default function StatePage() {
  const { state: slug } = useParams<{ state: string }>();
  const { farms, live } = useFarmData();
  const state = stateBySlug(slug);

  if (!state) return <div className="farm-empty"><h3>State not found</h3><p>Choose one of the deployment states.</p><div className="state-links">{STATES.map(s => <Link key={s.slug} href={`/farms/${s.slug}`} className="farm-button">{s.name}</Link>)}</div></div>;

  const inState = farms.filter(farm => farm.state === state.name);
  const attention = inState.filter(farm => live[farm.id]?.alarm_active).length;

  return <>
    <PageHeading eyebrow={`${state.capital} region`} title={`${state.name} State`} description={`${inState.length} AIPMS farms. Select a farm for live readings, equipment and history.`}>
      <nav className="state-switch" aria-label="Switch state">{STATES.map(s => <Link key={s.slug} href={`/farms/${s.slug}`} aria-current={s.slug === state.slug ? 'page' : undefined} className={s.slug === state.slug ? 'active' : ''}><i style={{ background: s.color }} />{s.name}</Link>)}</nav>
    </PageHeading>

    <section className="farm-metrics" aria-label={`${state.name} summary`}>
      <StatCard icon={<Warehouse size={18} />} label="Farms" value={inState.length} caption={`${state.name} State`} />
      <StatCard icon={<Bird size={18} />} label="Birds" value={inState.reduce((sum, farm) => sum + (farm.bird_count || 0), 0).toLocaleString()} caption="Combined flock" />
      <StatCard icon={<TriangleAlert size={18} />} label="Need attention" value={attention} caption={attention ? 'Active warnings' : 'No active warnings'} danger={attention > 0} />
      <StatCard icon={<Camera size={18} />} label="AI cameras" value={inState.filter(farm => farm.has_camera).length} caption="Threat detection" />
    </section>

    <section className="farm-grid" aria-label={`${state.name} farms`}>
      {inState.map(farm => <FarmCard key={farm.id} farm={farm} reading={live[farm.id]} />)}
    </section>

    <Panel title="Map" subtitle={`${state.name} deployments`} icon={<MapIcon size={19} />} className="section-gap">
      <FarmMap farms={inState} live={live} states={[state.name]} height={380} />
    </Panel>
    <Panel title="Farm details" subtitle="Live readings · sort by any column" icon={<Table2 size={19} />} className="section-gap">
      <FarmTable farms={inState} live={live} searchable={false} />
    </Panel>
  </>;
}
