'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Activity, Bell, Bird, Camera, Droplets, LogOut, RefreshCw, ShieldAlert, Thermometer, TriangleAlert, Video, Wind, LayoutDashboard, LayoutGrid, BarChart3, Wifi, Fan, ArrowUpRight, MapPin } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import EnvironmentalTrends from '@/components/dashboard/EnvironmentalTrends';
import '@/styles/dashboard.css';
import { getSupabaseClient } from '@/lib/supabase';
import { FARM_COLUMNS, Farm, LIVE_TICK_MS, Reading, activeAlarms, buildHistory, mergeDetections } from '@/lib/simulation';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'environment', label: 'Conditions', icon: Thermometer },
  { id: 'equipment', label: 'Equipment', icon: Fan },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'detections', label: 'Detections', icon: ShieldAlert },
];

export default function DashboardPage() {
  return <Suspense fallback={null}><FarmDashboard /></Suspense>;
}

function FarmDashboard() {
  const router = useRouter();
  const requestedFarm = useSearchParams().get('farm');
  const [userName, setUserName] = useState('Farmer');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [device, setDevice] = useState<Farm | null>(null);
  const [stored, setStored] = useState<Reading[]>([]);
  const [storedDetections, setStoredDetections] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('overview');
  const [now, setNow] = useState<number | null>(null);
  const [realtime, setRealtime] = useState('Connecting');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseClient();
      if (!supabase) { setError('Supabase is not configured. Add your project keys to .env.local.'); return; }
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!auth.user || authError) {
        await supabase.auth.signOut({ scope: 'local' });
        router.replace('/login'); return;
      }
      setUserName(auth.user.user_metadata?.username || auth.user.email?.split('@')[0] || 'Farmer');
      const { data: devices, error: deviceError } = await supabase.from('devices').select(FARM_COLUMNS).order('id');
      if (deviceError) throw deviceError;
      const list = (devices || []) as Farm[];
      setFarms(list);
      const current = list.find(item => item.id === requestedFarm) || list[0];
      setDevice(current || null);
      if (!current) { setStored([]); setStoredDetections([]); return; }
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      const [history, threats] = await Promise.all([
        supabase.from('sensor_readings').select('*').eq('device_id', current.id).gte('created_at', since).order('created_at', { ascending: false }).limit(300),
        supabase.from('sensor_readings').select('*').eq('device_id', current.id).in('detection_label', ['rat', 'snake']).order('created_at', { ascending: false }).limit(10),
      ]);
      if (history.error) throw history.error;
      if (threats.error) throw threats.error;
      setStored((history.data as Reading[]).reverse());
      setStoredDetections(threats.data as Reading[]);
    } catch (cause) { setError((cause as { message?: string })?.message || 'Unable to load farm data. Please refresh to try again.'); }
    finally { setLoading(false); }
  }, [router, requestedFarm]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !device) return;
    const channel = supabase.channel(`readings-${device.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `device_id=eq.${device.id}` }, payload => {
      const row = payload.new as Reading;
      setStored(previous => [...previous.filter(item => item.id !== row.id), row].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)).slice(-300));
      if (row.detection_label) setStoredDetections(previous => [row, ...previous.filter(item => item.id !== row.id)].slice(0, 10));
    }).subscribe(status => setRealtime(status === 'SUBSCRIBED' ? 'Connected' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' ? 'Disconnected' : 'Connecting'));
    return () => { supabase.removeChannel(channel); };
  }, [device]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-80px 0px -55% 0px', threshold: 0 });
    navigation.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  // Stored history topped up with simulated samples; the last one is "now".
  const readings = useMemo(() => device && now ? buildHistory(device, stored, now) : [], [device, stored, now]);
  const detections = useMemo(() => {
    if (!device || !now) return storedDetections;
    const latestStored = stored.length ? Date.parse(stored[stored.length - 1].created_at) : null;
    return mergeDetections(device, storedDetections, latestStored, now);
  }, [device, stored, storedDetections, now]);
  const reading = readings[readings.length - 1] || null;

  async function signOut() {
    try {
      const result = await getSupabaseClient()?.auth.signOut();
      if (result?.error) throw result.error;
      router.push('/login');
    } catch { setError('Unable to sign out. Please try again.'); }
  }
  const stale = !reading || !now || !Number.isFinite(Date.parse(reading.created_at)) || now - Date.parse(reading.created_at) > 120000;
  const alarms = activeAlarms(reading);
  const unsafe = Boolean(reading?.alarm_active || alarms.length);
  const hasCamera = Boolean(device?.has_camera);
  const status = (danger: boolean | undefined, normal: string) => !reading ? 'Not reported' : stale ? 'Last reading · stale' : danger ? 'Attention required' : normal;
  const place = device ? [device.location, device.state && `${device.state} State`].filter(Boolean).join(', ') : '';
  const nav = (mobile = false) => <nav aria-label={mobile ? 'Mobile dashboard navigation' : 'Dashboard navigation'} className={mobile ? 'farm-mobile-nav' : 'farm-navigation'}>
    <Link href="/farms"><LayoutGrid size={18} /><span>{mobile ? 'Farms' : 'All farms'}</span></Link>
    {navigation.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} onClick={() => setActive(id)} aria-current={active === id ? 'location' : undefined} className={active === id ? 'active' : ''}><Icon size={18} /><span>{label}</span></a>)}
  </nav>;

  return <div className="farm-dashboard">
    <a href="#overview" className="farm-skip">Skip to farm overview</a>
    <aside className="farm-sidebar">
      <Link href="/farms" className="farm-brand"><span><AppLogo size={36} /></span><div>Anatsor<small>Farm monitoring</small></div></Link>
      <p className="sidebar-caption">Workspace</p>{nav()}
      <div className="sidebar-device"><Wifi size={18} /><p>{device?.name || 'Monitoring device'}<small>{device?.id || 'No device connected'}</small></p></div>
      <div className="sidebar-account"><span className="farm-avatar">{userName.slice(0, 2).toUpperCase()}</span><p>{userName}<small>Project administrator</small></p><button onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    </aside>
    <div className="farm-workspace">
      <header className="farm-header"><Link href="/farms" className="mobile-brand"><AppLogo size={32} /><strong>Anatsor</strong></Link><span className="header-breadcrumb"><Link href="/farms">All farms</Link> <span>/</span> <strong>{device?.name || 'Farm overview'}</strong></span><div className="header-actions"><span className="demo-badge" title="Sensor readings on this page are simulated for demonstration">Demo data</span><a href="#environment" aria-label={`Environmental warnings, ${alarms.length} active`} onClick={() => setActive('environment')} className="farm-icon-button"><Bell size={19} />{unsafe && <span className="notification-dot" />}</a><span className="farm-avatar">{userName.slice(0, 2).toUpperCase()}</span><button onClick={signOut} aria-label="Sign out" className="mobile-signout"><LogOut size={18} /></button></div></header>
      <main className="farm-content" id="overview" aria-busy={loading}>
        <div className="farm-page-heading">
          <div><p className="farm-eyebrow">{place || 'Your poultry house, at a glance'}</p><h1>{device?.name || `Good ${greeting(now)}, ${userName}`}</h1><p>{device ? [device.bird_count != null && `${device.bird_count.toLocaleString()} birds`, device.installed_at && `Installed ${new Date(device.installed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`, hasCamera && 'AI camera'].filter(Boolean).join(' · ') : 'Stay close to your farm. Know when something needs attention.'}</p></div>
          <div className="farm-heading-actions">
            {farms.length > 1 && <label className="farm-select"><span className="sr-only">Switch farm</span><MapPin size={15} /><select value={device?.id || ''} onChange={event => router.push(`/dashboard?farm=${encodeURIComponent(event.target.value)}`)}>{farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}{farm.state ? ` · ${farm.state}` : ''}</option>)}</select></label>}
            <button className="farm-button" onClick={loadData} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing…' : 'Refresh data'}</button>
          </div>
        </div>
        {error && <div role="alert" className="farm-notice error"><TriangleAlert size={18} /><p>{error}</p></div>}
        {!loading && !device && !error && <div className="farm-notice"><Wifi size={19} /><p><strong>No farms yet.</strong> Run <code>supabase/seed_farms.sql</code> with this account&apos;s email to add the deployments.</p></div>}
        {device?.summary && <p className="farm-summary-note"><Bird size={15} />{device.summary}</p>}
        <section className="farm-metrics" aria-label="Latest farm readings">
          <Metric icon={<Thermometer size={18} />} label="Temperature" value={reading?.temperature} unit="°C" status={status(reading?.temperature_high || reading?.temperature_low, conditionStatus(reading?.temperature_high, reading?.temperature_low, 'temperature'))} danger={reading?.temperature_high || reading?.temperature_low} loading={loading && !reading} />
          <Metric icon={<Droplets size={18} />} label="Humidity" value={reading?.humidity} unit="%" status={status(reading?.humidity_high || reading?.humidity_low, conditionStatus(reading?.humidity_high, reading?.humidity_low, 'humidity'))} danger={reading?.humidity_high || reading?.humidity_low} loading={loading && !reading} />
          <Metric icon={<Wind size={18} />} label="Ammonia / air quality" value={reading?.air_quality} unit="ppm" status={status(reading?.air_quality_bad, 'No air-quality warning')} danger={reading?.air_quality_bad} loading={loading && !reading} />
          <Metric icon={<Wifi size={18} />} label="Device connection" text={stale ? 'Waiting' : 'Live'} status={reading ? stale ? 'Latest reading is stale' : `Updates every ${LIVE_TICK_MS / 1000} seconds` : 'Awaiting sensor readings'} live={!stale} loading={loading && !reading} />
        </section>
        <section className="farm-main-grid" id="environment" aria-label="Camera and environmental conditions">
          <article className="farm-panel camera-panel"><PanelTitle title="Camera monitor" subtitle={device?.name || 'Your poultry house'} icon={<Camera size={19} />} /><div className="camera-view"><Video size={42} strokeWidth={1.2} />{!hasCamera ? <><h3>No AI camera at this farm</h3><p>This deployment monitors environment and equipment only.<br />Camera farms report threat detections here.</p><span className="farm-status neutral">NOT INSTALLED</span></> : <><h3>{stale ? 'Awaiting camera update' : reading?.camera_live === true ? 'Camera is reporting' : reading?.camera_live === false ? 'Camera offline' : 'Camera status unavailable'}</h3><p>Video remains on the local device.<br />Camera status and AI detections appear here.</p><span className={`farm-status ${!stale && reading?.camera_live === true ? 'healthy' : 'neutral'}`}>{stale ? 'STALE / NO DATA' : reading?.camera_live === true ? 'LIVE' : reading?.camera_live === false ? 'OFFLINE' : 'NOT REPORTED'}</span></>}</div><div className="camera-footer"><span>AI threat monitoring</span><a href="#detections" onClick={() => setActive('detections')}>View detections <ArrowUpRight size={15} /></a></div></article>
          <article className="farm-panel"><PanelTitle title="Environmental conditions" subtitle={stale ? 'Waiting for fresh sensor data' : 'Latest device-reported warnings'} icon={<Activity size={19} />} /><div className={`condition-summary ${unsafe ? 'warning' : ''}`}><TriangleAlert size={20} /><div><strong>{!reading ? 'No conditions reported' : stale ? 'Readings need an update' : unsafe ? 'Attention required' : 'No environmental warnings'}</strong><p>{unsafe ? 'Review the reported conditions below.' : stale ? 'Safe conditions cannot be confirmed without fresh data.' : 'The device reports no active condition flags.'}</p></div></div><div className="condition-list"><StatusRow label="Temperature high" active={reading?.temperature_high} stale={stale} alarm /><StatusRow label="Temperature low" active={reading?.temperature_low} stale={stale} alarm /><StatusRow label="Humidity high" active={reading?.humidity_high} stale={stale} alarm /><StatusRow label="Humidity low" active={reading?.humidity_low} stale={stale} alarm /><StatusRow label="Poor air quality / ammonia" active={reading?.air_quality_bad} stale={stale} alarm /></div>{unsafe && <p className="alarm-note">{alarms.length ? alarms.join(' · ') : 'Environmental alarm active'}</p>}</article>
        </section>
        <section id="equipment" className="farm-panel"><PanelTitle title="Equipment status" subtitle="Automatic responses reported by your device" icon={<Fan size={19} />} /><div className="equipment-grid"><Equipment icon={<Fan size={22} />} label="Ventilation fan" active={reading?.fan_on} stale={stale} /><Equipment icon={<Droplets size={22} />} label="Humidifier" active={reading?.humidifier_on} stale={stale} /><Equipment icon={<Bell size={22} />} label="Environmental alarm" active={reading?.alarm_active} stale={stale} alarm /></div></section>
        <section className="farm-lower-grid" aria-label="Historical monitoring">
          <article className="farm-panel" id="trends"><PanelTitle title="Environmental trends" subtitle="Last 24 hours · separate scales for each measurement" icon={<BarChart3 size={19} />} />{loading && !readings.length ? <div className="farm-empty">Loading sensor history…</div> : !readings.length ? <div className="farm-empty"><BarChart3 size={28} /><h3>Your farm history will appear here</h3><p>Trends use sensor readings once your device starts reporting.</p></div> : <EnvironmentalTrends readings={readings} />}</article>
          <article className="farm-panel" id="detections"><PanelTitle title="AI detections" subtitle={hasCamera ? 'Latest 10 reports · rats and snakes' : 'Requires an AI-powered camera'} icon={<ShieldAlert size={19} />} />{!detections.length ? <div className="farm-empty"><ShieldAlert size={28} /><h3>{loading ? 'Loading detections…' : hasCamera ? 'No threat detections recorded' : 'No camera installed'}</h3><p>{hasCamera ? 'Reported threats appear with confidence and detection time.' : 'Threat detection is available on farms with the AI camera.'}</p></div> : <ul className="detection-list">{detections.map((detection, index) => <li key={detection.id || `${detection.detection_at || detection.created_at}-${index}`}><span className="detection-icon"><ShieldAlert size={18} /></span><div><strong>{detection.detection_label}</strong><p>{detection.detection_confidence == null ? 'Confidence unavailable' : `${Math.round(detection.detection_confidence * 100)}% confidence`}</p><time dateTime={detection.detection_at || detection.created_at}>{new Date(detection.detection_at || detection.created_at).toLocaleString()}</time></div><span className="farm-status danger">Threat</span></li>)}</ul>}</article>
        </section>
        <footer className="farm-device-footer"><div><strong>{device?.name || 'No device connected'}</strong><span>{device?.id || '—'}</span></div><p>Last sensor update: {reading ? new Date(reading.created_at).toLocaleString() : 'No data received'}<span>Readings simulated for demonstration · Realtime: {device ? realtime : 'Not connected'}</span></p></footer>
      </main>
    </div>{nav(true)}
  </div>;
}

function PanelTitle({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) { return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><span>{icon}</span></div>; }
function Metric({ icon, label, value, unit, status, text, danger, live, loading }: { icon: React.ReactNode; label: string; value?: number | null; unit?: string; status: string; text?: string; danger?: boolean; live?: boolean; loading?: boolean }) {
  return <article className="farm-metric"><div className="metric-top"><p>{label}</p><span>{icon}</span></div><p className={`metric-value ${loading ? 'metric-loading' : ''}`}>{loading ? '—' : text || (value == null ? '—' : value.toFixed(1))}{!text && !loading && <small>{unit}</small>}</p><p className={`metric-caption ${danger ? 'danger-text' : live ? 'healthy-text' : ''}`}>{live && <span className="live-dot" />}{loading ? 'Loading reading…' : status}</p></article>;
}
function StatusRow({ label, active, stale, alarm }: { label: string; active?: boolean; stale: boolean; alarm?: boolean }) { return <div className="condition-row"><span>{label}</span><span className={`farm-status ${active && alarm ? 'danger' : stale || active === undefined ? 'neutral' : 'healthy'}`}>{active ? stale ? 'ACTIVE · STALE' : 'ACTIVE' : active === undefined ? 'NOT REPORTED' : stale ? 'STALE' : 'NORMAL'}</span></div>; }
function Equipment({ icon, label, active, stale, alarm }: { icon: React.ReactNode; label: string; active?: boolean; stale: boolean; alarm?: boolean }) { return <div className="equipment-item"><span className="equipment-icon">{icon}</span><div><h3>{label}</h3><p>{stale ? 'Awaiting fresh data' : 'Device-reported state'}</p></div><span className={`farm-status ${active && alarm ? 'danger' : stale || active === undefined ? 'neutral' : active ? 'healthy' : 'neutral'}`}>{active === undefined ? 'UNKNOWN' : stale ? active ? 'ON · STALE' : 'OFF · STALE' : active ? alarm ? 'ACTIVE' : 'ON' : alarm ? 'CLEAR' : 'OFF'}</span></div>; }
function conditionStatus(high: boolean | undefined, low: boolean | undefined, measurement: string) { return high ? `High ${measurement}` : low ? `Low ${measurement}` : 'Within reported range'; }
function greeting(now: number | null) { if (!now) return 'day'; const hour = new Date(now).getHours(); return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'; }
