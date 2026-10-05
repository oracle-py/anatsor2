'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Bell, Camera, Droplets, LogOut, RefreshCw, ShieldAlert, Thermometer, TriangleAlert, Video, Wind, LayoutDashboard, BarChart3, Wifi, Fan, ArrowUpRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import EnvironmentalTrends from '@/components/dashboard/EnvironmentalTrends';
import '@/styles/dashboard.css';
import { getSupabaseClient } from '@/lib/supabase';

type Device = { id: string; name: string; status?: string; last_seen_at?: string };
type Reading = {
  id?: number;
  device_id: string;
  temperature: number | null;
  humidity: number | null;
  air_quality: number | null;
  fan_on: boolean;
  humidifier_on: boolean;
  alarm_active: boolean;
  temperature_high: boolean;
  temperature_low: boolean;
  humidity_high: boolean;
  humidity_low: boolean;
  air_quality_bad: boolean;
  camera_live: boolean | null;
  detection_label: 'rat' | 'snake' | null;
  detection_confidence: number | null;
  detection_at: string | null;
  created_at: string;
};

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'environment', label: 'Conditions', icon: Thermometer },
  { id: 'equipment', label: 'Equipment', icon: Fan },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'detections', label: 'Detections', icon: ShieldAlert },
];

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Farmer');
  const [device, setDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [detections, setDetections] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('overview');
  const [now, setNow] = useState<number | null>(null);
  const [realtime, setRealtime] = useState('Connecting');
  const reading = readings[readings.length - 1] || null;

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
      const { data: devices, error: deviceError } = await supabase.from('devices').select('id,name,status,last_seen_at').order('created_at').limit(1);
      if (deviceError) throw deviceError;
      const current = devices?.[0] as Device | undefined;
      setDevice(current || null);
      if (!current) { setReadings([]); setDetections([]); return; }
      const [history, threats] = await Promise.all([
        supabase.from('sensor_readings').select('*').eq('device_id', current.id).order('created_at', { ascending: false }).limit(200),
        supabase.from('sensor_readings').select('*').eq('device_id', current.id).in('detection_label', ['rat', 'snake']).order('created_at', { ascending: false }).limit(10),
      ]);
      if (history.error) throw history.error;
      setReadings((history.data as Reading[]).reverse());
      if (threats.error) throw threats.error;
      setDetections(threats.data as Reading[]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : (cause as { message?: string })?.message || 'Unable to load farm data. Please refresh to try again.'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !device) return;
    const channel = supabase.channel(`readings-${device.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `device_id=eq.${device.id}` }, payload => {
      const row = payload.new as Reading;
      setReadings(previous => [...previous.filter(item => item.id !== row.id), row].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)).slice(-200));
      if (row.detection_label) setDetections(previous => [row, ...previous.filter(item => item.id !== row.id)].slice(0, 10));
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

  async function signOut() {
    try {
      const result = await getSupabaseClient()?.auth.signOut();
      if (result?.error) throw result.error;
      router.push('/login');
    } catch { setError('Unable to sign out. Please try again.'); }
  }
  const stale = !reading || !now || !Number.isFinite(Date.parse(reading.created_at)) || now - Date.parse(reading.created_at) > 120000;
  const alarms = getActiveAlarms(reading);
  const unsafe = Boolean(reading?.alarm_active || alarms.length);
  const status = (danger: boolean | undefined, normal: string) => !reading ? 'Not reported' : stale ? 'Last reading · stale' : danger ? 'Attention required' : normal;
  const nav = (mobile = false) => <nav aria-label={mobile ? 'Mobile dashboard navigation' : 'Dashboard navigation'} className={mobile ? 'farm-mobile-nav' : 'farm-navigation'}>{navigation.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} onClick={() => setActive(id)} aria-current={active === id ? 'location' : undefined} className={active === id ? 'active' : ''}><Icon size={18} /><span>{label}</span></a>)}</nav>;

  return <div className="farm-dashboard">
    <a href="#overview" className="farm-skip">Skip to farm overview</a>
    <aside className="farm-sidebar">
      <Link href="/" className="farm-brand"><span><AppLogo size={36} /></span><div>Anatsor<small>Farm monitoring</small></div></Link>
      <p className="sidebar-caption">Workspace</p>{nav()}
      <div className="sidebar-device"><Wifi size={18} /><p>{device?.name || 'Monitoring device'}<small>{device?.id || 'No device connected'}</small></p></div>
      <div className="sidebar-account"><span className="farm-avatar">{userName.slice(0, 2).toUpperCase()}</span><p>{userName}<small>Farm administrator</small></p><button onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    </aside>
    <div className="farm-workspace">
      <header className="farm-header"><Link href="/" className="mobile-brand"><AppLogo size={32} /><strong>Anatsor</strong></Link><span className="header-breadcrumb">Workspace <span>/</span> <strong>Farm overview</strong></span><div className="header-actions"><a href="#environment" aria-label={`Environmental warnings, ${alarms.length} active`} onClick={() => setActive('environment')} className="farm-icon-button"><Bell size={19} />{unsafe && <span className="notification-dot" />}</a><span className="farm-avatar">{userName.slice(0, 2).toUpperCase()}</span><button onClick={signOut} aria-label="Sign out" className="mobile-signout"><LogOut size={18} /></button></div></header>
      <main className="farm-content" id="overview" aria-busy={loading}>
        <div className="farm-page-heading"><div><p className="farm-eyebrow">Your poultry house, at a glance</p><h1>Good {greeting(now)}, {userName}</h1><p>Stay close to your farm. Know when something needs attention.</p></div><button className="farm-button" onClick={loadData} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing…' : 'Refresh data'}</button></div>
        {error && <div role="alert" className="farm-notice error"><TriangleAlert size={18} /><p>{error}</p></div>}
        {!loading && !device && !error && <div className="farm-notice"><Wifi size={19} /><p><strong>No monitoring device yet.</strong> Sign in with the account that claimed your AIPMS device to see farm readings.</p></div>}
        <section className="farm-metrics" aria-label="Latest farm readings">
          <Metric icon={<Thermometer size={18} />} label="Temperature" value={reading?.temperature} unit="°C" status={status(reading?.temperature_high || reading?.temperature_low, conditionStatus(reading?.temperature_high, reading?.temperature_low, 'temperature'))} danger={reading?.temperature_high || reading?.temperature_low} loading={loading && !reading} />
          <Metric icon={<Droplets size={18} />} label="Humidity" value={reading?.humidity} unit="%" status={status(reading?.humidity_high || reading?.humidity_low, conditionStatus(reading?.humidity_high, reading?.humidity_low, 'humidity'))} danger={reading?.humidity_high || reading?.humidity_low} loading={loading && !reading} />
          <Metric icon={<Wind size={18} />} label="Ammonia / air quality" value={reading?.air_quality} unit="ppm" status={status(reading?.air_quality_bad, 'No air-quality warning')} danger={reading?.air_quality_bad} loading={loading && !reading} />
          <Metric icon={<Wifi size={18} />} label="Device connection" text={stale ? 'Waiting' : 'Live'} status={reading ? stale ? 'Latest reading is stale' : 'Updated within 2 minutes' : 'Awaiting sensor readings'} live={!stale} loading={loading && !reading} />
        </section>
        <section className="farm-main-grid" id="environment" aria-label="Camera and environmental conditions">
          <article className="farm-panel camera-panel"><PanelTitle title="Camera monitor" subtitle={device?.name || 'Your poultry house'} icon={<Camera size={19} />} /><div className="camera-view"><Video size={42} strokeWidth={1.2} /><h3>{stale ? 'Awaiting camera update' : reading?.camera_live === true ? 'Camera is reporting' : reading?.camera_live === false ? 'Camera offline' : 'Camera status unavailable'}</h3><p>Video remains on the local device.<br />Camera status and AI detections appear here.</p><span className={`farm-status ${!stale && reading?.camera_live === true ? 'healthy' : 'neutral'}`}>{stale ? 'STALE / NO DATA' : reading?.camera_live === true ? 'LIVE' : reading?.camera_live === false ? 'OFFLINE' : 'NOT REPORTED'}</span></div><div className="camera-footer"><span>AI threat monitoring</span><a href="#detections" onClick={() => setActive('detections')}>View detections <ArrowUpRight size={15} /></a></div></article>
          <article className="farm-panel"><PanelTitle title="Environmental conditions" subtitle={stale ? 'Waiting for fresh sensor data' : 'Latest device-reported warnings'} icon={<Activity size={19} />} /><div className={`condition-summary ${unsafe ? 'warning' : ''}`}><TriangleAlert size={20} /><div><strong>{!reading ? 'No conditions reported' : stale ? 'Readings need an update' : unsafe ? 'Attention required' : 'No environmental warnings'}</strong><p>{unsafe ? 'Review the reported conditions below.' : stale ? 'Safe conditions cannot be confirmed without fresh data.' : 'The device reports no active condition flags.'}</p></div></div><div className="condition-list"><StatusRow label="Temperature high" active={reading?.temperature_high} stale={stale} alarm /><StatusRow label="Temperature low" active={reading?.temperature_low} stale={stale} alarm /><StatusRow label="Humidity high" active={reading?.humidity_high} stale={stale} alarm /><StatusRow label="Humidity low" active={reading?.humidity_low} stale={stale} alarm /><StatusRow label="Poor air quality / ammonia" active={reading?.air_quality_bad} stale={stale} alarm /></div>{unsafe && <p className="alarm-note">{alarms.length ? alarms.join(' · ') : 'Environmental alarm active'}</p>}</article>
        </section>
        <section id="equipment" className="farm-panel"><PanelTitle title="Equipment status" subtitle="Automatic responses reported by your device" icon={<Fan size={19} />} /><div className="equipment-grid"><Equipment icon={<Fan size={22} />} label="Ventilation fan" active={reading?.fan_on} stale={stale} /><Equipment icon={<Droplets size={22} />} label="Humidifier" active={reading?.humidifier_on} stale={stale} /><Equipment icon={<Bell size={22} />} label="Environmental alarm" active={reading?.alarm_active} stale={stale} alarm /></div></section>
        <section className="farm-lower-grid" aria-label="Historical monitoring">
          <article className="farm-panel" id="trends"><PanelTitle title="Environmental trends" subtitle="Latest 200 samples · separate scales for each measurement" icon={<BarChart3 size={19} />} />{loading && !readings.length ? <div className="farm-empty">Loading sensor history…</div> : !readings.length ? <div className="farm-empty"><BarChart3 size={28} /><h3>Your farm history will appear here</h3><p>Trends use real sensor readings once your device starts reporting.</p></div> : <EnvironmentalTrends readings={readings} />}</article>
          <article className="farm-panel" id="detections"><PanelTitle title="AI detections" subtitle="Latest 10 reports · rats and snakes" icon={<ShieldAlert size={19} />} />{!detections.length ? <div className="farm-empty"><ShieldAlert size={28} /><h3>{loading ? 'Loading detections…' : 'No threat detections recorded'}</h3><p>Reported threats appear with confidence and detection time.</p></div> : <ul className="detection-list">{detections.map((detection, index) => <li key={detection.id || `${detection.created_at}-${index}`}><span className="detection-icon"><ShieldAlert size={18} /></span><div><strong>{detection.detection_label}</strong><p>{detection.detection_confidence == null ? 'Confidence unavailable' : `${Math.round(detection.detection_confidence * 100)}% confidence`}</p><time dateTime={detection.detection_at || detection.created_at}>{new Date(detection.detection_at || detection.created_at).toLocaleString()}</time></div><span className="farm-status danger">Threat</span></li>)}</ul>}</article>
        </section>
        <footer className="farm-device-footer"><div><strong>{device?.name || 'No device connected'}</strong><span>{device?.id || '—'}</span></div><p>Last sensor update: {reading ? new Date(reading.created_at).toLocaleString() : 'No data received'}<span>Live updates: {device ? realtime : 'Not connected'}</span></p></footer>
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
function getActiveAlarms(reading: Reading | null) { if (!reading) return []; return [reading.temperature_high && 'High temperature', reading.temperature_low && 'Low temperature', reading.humidity_high && 'High humidity', reading.humidity_low && 'Low humidity', reading.air_quality_bad && 'Poor air quality / high ammonia'].filter((alarm): alarm is string => Boolean(alarm)); }
function greeting(now: number | null) { if (!now) return 'day'; const hour = new Date(now).getHours(); return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'; }
