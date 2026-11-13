'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Activity, BarChart3, Bell, Bird, Camera, CheckCircle2, ClipboardList, Droplets, Fan, MapPin, ShieldAlert, Thermometer, TriangleAlert, Video, Wifi, Wind } from 'lucide-react';
import { useFarmData } from '@/components/app/FarmDataProvider';
import EnvironmentalTrends from '@/components/dashboard/EnvironmentalTrends';
import { PageHeading, Panel, Segmented } from '@/components/dashboard/ui';
import { farmById, farmPath, formatInstalled, stateBySlug } from '@/lib/farms-data';
import { LIVE_TICK_MS, Reading, activeAlarms, mergeDetections, sampleHistory } from '@/lib/simulation';

const HOUR = 3600_000;
const RANGES = { '24h': { label: '24 hours', window: 24 * HOUR, step: 10 * 60_000 }, '7d': { label: '7 days', window: 7 * 24 * HOUR, step: HOUR } } as const;
type Range = keyof typeof RANGES;

const COMPONENTS = ['Environmental monitoring sensors', 'AIPMS controller', 'Ventilation fans', 'Exhaust fans', 'Humidifiers', 'Solar energy system', 'Mobile application connectivity'];

export default function FarmDetailPage() {
  const router = useRouter();
  const { state: slug, farmId } = useParams<{ state: string; farmId: string }>();
  const { farms, live, now } = useFarmData();
  const [range, setRange] = useState<Range>('24h');
  const farm = farmById(farmId);
  const state = stateBySlug(slug);

  // Recompute history once per minute rather than on every 5-second tick.
  const minute = now ? Math.floor(now / 60_000) : null;
  const history = useMemo(() => {
    if (!farm || !now) return [];
    const { window, step } = RANGES[range];
    return sampleHistory(farm, now, window, step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm, range, minute]);
  const detections = useMemo(() => farm && now ? mergeDetections(farm, [], null, now) : [], [farm, minute]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!farm) return <div className="farm-empty"><h3>Farm not found</h3><p>It may have been removed or the link is incorrect.</p><Link href="/farms" className="farm-button">Back to farms</Link></div>;

  const reading = live[farm.id] || null;
  const alarms = activeAlarms(reading);
  const unsafe = alarms.length > 0;
  const sameState = farms.filter(item => item.state === farm.state);
  const trendData = reading ? [...history.slice(0, -1), reading] : history;

  return <>
    <PageHeading eyebrow={[farm.location, `${farm.state} State`].filter(Boolean).join(', ')} title={farm.name}
      description={[`${(farm.bird_count || 0).toLocaleString()} birds`, `Installed ${formatInstalled(farm.installed_at)}`, farm.has_camera && 'AI camera', farm.id].filter(Boolean).join(' · ')}>
      <label className="farm-select"><span className="sr-only">Switch farm</span><MapPin size={15} />
        <select value={farm.id} onChange={event => { const next = farmById(event.target.value); if (next) router.push(farmPath(next)); }}>
          <optgroup label={`${state?.name || farm.state} State`}>{sameState.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>
          <optgroup label="Other states">{farms.filter(item => item.state !== farm.state).map(item => <option key={item.id} value={item.id}>{item.name} · {item.state}</option>)}</optgroup>
        </select>
      </label>
    </PageHeading>

    <section className="farm-metrics" aria-label="Latest readings">
      <Metric icon={<Thermometer size={18} />} label="Temperature" value={reading?.temperature} unit="°C" status={reading?.temperature_high ? 'High temperature' : reading?.temperature_low ? 'Low temperature' : 'Within range'} danger={reading?.temperature_high || reading?.temperature_low} />
      <Metric icon={<Droplets size={18} />} label="Humidity" value={reading?.humidity} unit="%" status={reading?.humidity_high ? 'High humidity' : reading?.humidity_low ? 'Low humidity' : 'Within range'} danger={reading?.humidity_high || reading?.humidity_low} />
      <Metric icon={<Wind size={18} />} label="Ammonia / air quality" value={reading?.air_quality} unit="ppm" status={reading?.air_quality_bad ? 'Poor air quality' : 'No air-quality warning'} danger={reading?.air_quality_bad} />
      <Metric icon={<Wifi size={18} />} label="Device connection" text={reading ? 'Live' : '—'} status={`Updates every ${LIVE_TICK_MS / 1000} seconds`} live={Boolean(reading)} />
    </section>

    <section className="farm-main-grid" aria-label="Camera and conditions">
      <Panel title="Camera monitor" subtitle={farm.name} icon={<Camera size={19} />}>
        <div className="camera-view"><Video size={42} strokeWidth={1.2} />
          {!farm.has_camera ? <><h3>No AI camera at this farm</h3><p>This deployment monitors environment and equipment only.</p><span className="farm-status neutral">NOT INSTALLED</span></>
            : <><h3>{reading?.camera_live ? 'Camera is reporting' : 'Camera offline'}</h3><p>Video remains on the local device.<br />Camera status and AI detections appear here.</p><span className={`farm-status ${reading?.camera_live ? 'healthy' : 'neutral'}`}>{reading?.camera_live ? 'LIVE' : 'OFFLINE'}</span></>}
        </div>
      </Panel>
      <Panel title="Environmental conditions" subtitle="Device-reported warnings" icon={<Activity size={19} />}>
        <div className={`condition-summary ${unsafe ? 'warning' : ''}`}><TriangleAlert size={20} /><div><strong>{unsafe ? 'Attention required' : 'No environmental warnings'}</strong><p>{unsafe ? alarms.join(' · ') : 'All readings are within the configured thresholds.'}</p></div></div>
        <div className="condition-list">
          <StatusRow label="Temperature high" active={reading?.temperature_high} />
          <StatusRow label="Temperature low" active={reading?.temperature_low} />
          <StatusRow label="Humidity high" active={reading?.humidity_high} />
          <StatusRow label="Humidity low" active={reading?.humidity_low} />
          <StatusRow label="Poor air quality / ammonia" active={reading?.air_quality_bad} />
        </div>
      </Panel>
    </section>

    <Panel title="Equipment status" subtitle="Automatic responses by the AIPMS controller" icon={<Fan size={19} />}>
      <div className="equipment-grid">
        <Equipment icon={<Fan size={22} />} label="Ventilation & exhaust fans" active={reading?.fan_on} />
        <Equipment icon={<Droplets size={22} />} label="Humidifier" active={reading?.humidifier_on} />
        <Equipment icon={<Bell size={22} />} label="Environmental alarm" active={reading?.alarm_active} alarm />
      </div>
    </Panel>

    <section className="farm-lower-grid" aria-label="History">
      <Panel title="Environmental trends" subtitle={`Last ${RANGES[range].label} · separate scale per measurement`} actions={<Segmented label="Time range" value={range} onChange={setRange} options={[{ value: '24h', label: '24h' }, { value: '7d', label: '7d' }]} />}>
        {trendData.length ? <EnvironmentalTrends readings={trendData} showDate={range === '7d'} /> : <div className="farm-empty"><BarChart3 size={28} /><p>Loading history…</p></div>}
      </Panel>
      <Panel title="AI detections" subtitle={farm.has_camera ? 'Last 7 days · rats and snakes' : 'Requires an AI-powered camera'} icon={<ShieldAlert size={19} />}>
        {!detections.length ? <div className="farm-empty"><ShieldAlert size={28} /><h3>{farm.has_camera ? 'No threat detections recorded' : 'No camera installed'}</h3><p>{farm.has_camera ? 'Reported threats appear with confidence and detection time.' : 'Threat detection is available on farms with the AI camera.'}</p></div>
          : <ul className="detection-list">{detections.map((detection: Reading) => <li key={detection.detection_at}><span className="detection-icon"><ShieldAlert size={18} /></span><div><strong>{detection.detection_label}</strong><p>{Math.round((detection.detection_confidence || 0) * 100)}% confidence</p><time dateTime={detection.detection_at || ''}>{new Date(detection.detection_at || detection.created_at).toLocaleString()}</time></div><span className="farm-status danger">Threat</span></li>)}</ul>}
      </Panel>
    </section>

    <Panel title="Deployment record" subtitle="From the Youth4Climate deployment report" icon={<ClipboardList size={19} />} className="section-gap">
      <div className="record-grid">
        <dl className="record-list">
          <div><dt>Device ID</dt><dd>{farm.id}</dd></div>
          <div><dt>Location</dt><dd>{[farm.location, `${farm.state} State`].filter(Boolean).join(', ')}</dd></div>
          <div><dt>Installation date</dt><dd>{formatInstalled(farm.installed_at)}</dd></div>
          <div><dt>Number of birds</dt><dd><Bird size={13} /> {(farm.bird_count || 0).toLocaleString()}</dd></div>
        </dl>
        <div>
          <h3 className="record-heading">Components installed</h3>
          <ul className="component-list">{[...COMPONENTS, ...(farm.has_camera ? ['AI-powered camera'] : [])].map(item => <li key={item}><CheckCircle2 size={14} />{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="record-heading">Deployment purpose</h3>
          <p className="record-summary">{farm.summary}</p>
        </div>
      </div>
    </Panel>
  </>;
}

function Metric({ icon, label, value, unit, status, text, danger, live }: { icon: React.ReactNode; label: string; value?: number | null; unit?: string; status: string; text?: string; danger?: boolean; live?: boolean }) {
  return <article className="farm-metric"><div className="metric-top"><p>{label}</p><span>{icon}</span></div><p className="metric-value">{text || (value == null ? '—' : value.toFixed(1))}{!text && <small>{unit}</small>}</p><p className={`metric-caption ${danger ? 'danger-text' : live ? 'healthy-text' : ''}`}>{live && <span className="live-dot" />}{status}</p></article>;
}
function StatusRow({ label, active }: { label: string; active?: boolean }) {
  return <div className="condition-row"><span>{label}</span><span className={`farm-status ${active ? 'danger' : active === undefined ? 'neutral' : 'healthy'}`}>{active ? 'ACTIVE' : active === undefined ? '—' : 'NORMAL'}</span></div>;
}
function Equipment({ icon, label, active, alarm }: { icon: React.ReactNode; label: string; active?: boolean; alarm?: boolean }) {
  return <div className="equipment-item"><span className="equipment-icon">{icon}</span><div><h3>{label}</h3><p>Controller-reported state</p></div><span className={`farm-status ${active && alarm ? 'danger' : active ? 'healthy' : 'neutral'}`}>{active === undefined ? '—' : active ? (alarm ? 'ACTIVE' : 'ON') : alarm ? 'CLEAR' : 'OFF'}</span></div>;
}
