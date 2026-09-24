'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Bell, Camera, Cloud, Droplets, LogOut, RefreshCw, ShieldAlert, Thermometer, TriangleAlert, Video, Wind } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
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

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Farmer');
  const [device, setDevice] = useState<Device | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) { setError('Supabase is not configured. Add your project keys to .env.local.'); setLoading(false); return; }
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (!auth.user || authError) {
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/login');
      return;
    }
    setUserName(auth.user.user_metadata?.username || auth.user.email?.split('@')[0] || 'Farmer');
    const { data: devices, error: deviceError } = await supabase.from('devices').select('id,name,status,last_seen_at').order('created_at').limit(1);
    if (deviceError) { setError(deviceError.message); setLoading(false); return; }
    const current = devices?.[0] as Device | undefined;
    setDevice(current || null);
    if (current) {
      const { data, error: readingError } = await supabase.from('sensor_readings').select('*').eq('device_id', current.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (readingError) setError(readingError.message); else setReading(data as Reading | null);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !device) return;
    const channel = supabase.channel(`readings-${device.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `device_id=eq.${device.id}` }, payload => setReading(payload.new as Reading)).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [device]);

  async function signOut() { await getSupabaseClient()?.auth.signOut(); router.push('/login'); }
  const stale = reading ? Date.now() - new Date(reading.created_at).getTime() > 120000 : true;
  const ammonia = reading?.air_quality ?? null;
  const unsafe = Boolean(reading?.alarm_active || reading?.temperature_high || reading?.temperature_low || reading?.humidity_high || reading?.humidity_low || reading?.air_quality_bad);
  const activeAlarms = getActiveAlarms(reading);

  return <main className="min-h-screen bg-[#f5f7f2] text-foreground">
    <header className="border-b border-border bg-white/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2"><AppLogo size={48} /><span className="hidden font-extrabold text-primary sm:block">Anatsor <span className="font-medium text-muted-foreground">AIPMS</span></span></Link>
        <div className="flex items-center gap-3"><button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-primary"><Bell size={18} />{unsafe && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}</button><div className="hidden text-right sm:block"><p className="text-sm font-bold capitalize">{userName}</p><p className="text-xs text-muted-foreground">Farm administrator</p></div><button onClick={signOut} title="Sign out" className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white hover:bg-secondary"><LogOut size={17} /></button></div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Farm overview</p><h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Good {greeting()}, {userName}</h1><p className="mt-2 text-muted-foreground">Here is what is happening in your poultry house right now.</p></div>
        <button onClick={() => { setLoading(true); loadData(); }} className="flex w-fit items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-primary shadow-sm hover:border-secondary"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh data</button>
      </section>

      {error && <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm"><strong>Setup notice:</strong> {error}</div>}
      <section className={`mb-7 flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between ${unsafe ? 'border-red-200 bg-red-50' : 'border-secondary/15 bg-white'}`}>
        <div className="flex items-center gap-4"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${unsafe ? 'bg-red-100 text-red-600' : 'bg-secondary/10 text-secondary'}`}>{unsafe ? <TriangleAlert /> : <Activity />}</span><div><h2 className="font-extrabold text-primary">{unsafe ? 'Attention required' : device ? 'Farm conditions are stable' : 'Connect your monitoring device'}</h2><p className="mt-1 text-sm text-muted-foreground">{unsafe ? 'An environmental threshold has been exceeded.' : device ? 'No active environmental alarms.' : 'Your device will appear after it is enrolled.'}</p></div></div>
        <div className="flex items-center gap-2 text-sm font-bold"><span className={`h-2.5 w-2.5 rounded-full ${stale ? 'bg-slate-400' : 'bg-green-500 animate-pulse'}`} />{stale ? 'Awaiting live data' : 'Live data'}</div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Wind />} label="Ammonia / air quality" value={ammonia} unit=" ppm" status={flagStatus(reading?.air_quality_bad, 'Poor air quality')} featured danger={reading?.air_quality_bad} />
        <Metric icon={<Thermometer />} label="Temperature" value={reading?.temperature ?? null} unit="°C" status={conditionStatus(reading?.temperature_high, reading?.temperature_low)} danger={reading?.temperature_high || reading?.temperature_low} />
        <Metric icon={<Droplets />} label="Humidity" value={reading?.humidity ?? null} unit="%" status={conditionStatus(reading?.humidity_high, reading?.humidity_low)} danger={reading?.humidity_high || reading?.humidity_low} />
        <Metric icon={<Cloud />} label="System status" text={reading ? (reading.alarm_active ? 'Alarm' : 'Normal') : 'Waiting'} status={reading ? 'Sensors reporting' : 'No readings received'} />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Condition flags</p><h2 className="mt-2 text-xl font-extrabold text-primary">Environmental alerts</h2></div><ShieldAlert className={unsafe ? 'text-red-500' : 'text-secondary'} /></div><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><StatusRow label="Temperature high" active={reading?.temperature_high} alarm inactiveLabel="NORMAL" /><StatusRow label="Temperature low" active={reading?.temperature_low} alarm inactiveLabel="NORMAL" /><StatusRow label="Humidity high" active={reading?.humidity_high} alarm inactiveLabel="NORMAL" /><StatusRow label="Humidity low" active={reading?.humidity_low} alarm inactiveLabel="NORMAL" /><StatusRow label="Ammonia / air quality bad" active={reading?.air_quality_bad} alarm inactiveLabel="NORMAL" /></div></div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Automatic response</p><h2 className="mt-2 text-xl font-extrabold text-primary">Equipment status</h2></div><Activity className="text-secondary" /></div><div className="mt-7 grid gap-3"><StatusRow label="Ventilation fan" active={reading?.fan_on} /><StatusRow label="Humidifier" active={reading?.humidifier_on} /><StatusRow label="Environmental alarm" active={reading?.alarm_active} alarm inactiveLabel="CLEAR" /><StatusRow label="Data connection" active={!stale} inactiveLabel="OFFLINE" /></div><div className={`mt-4 rounded-2xl border p-4 ${activeAlarms.length ? 'border-red-200 bg-red-50' : 'border-border bg-muted/60'}`}><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alarm type</p>{activeAlarms.length ? <ul className="mt-2 space-y-1">{activeAlarms.map(alarm => <li key={alarm} className="text-sm font-extrabold text-red-700">• {alarm}</li>)}</ul> : <p className="mt-1 text-sm font-extrabold text-secondary">No active alarm</p>}</div></div>

        <div className="overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-widest text-white/50">AI threat monitor</p><h2 className="mt-2 text-xl font-extrabold">Camera detection</h2></div><Camera className="text-accent" /></div><div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center gap-3"><Video size={20} className={reading?.camera_live === true ? 'text-green-400' : 'text-white/30'} /><span className="font-bold">Camera</span></div><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${reading?.camera_live === true ? 'bg-green-400/15 text-green-300' : 'bg-white/10 text-white/45'}`}>{reading?.camera_live === true ? 'LIVE' : reading?.camera_live === false ? 'OFFLINE' : 'STATUS UNAVAILABLE'}</span></div><div className={`mt-4 rounded-2xl border p-5 ${reading?.detection_label ? 'border-red-400/30 bg-red-400/10' : 'border-white/10 bg-white/[0.04]'}`}><p className="text-xs font-bold uppercase tracking-widest text-white/45">Latest relevant detection</p><p className={`mt-3 text-3xl font-extrabold capitalize ${reading?.detection_label ? 'text-red-300' : 'text-white/55'}`}>{reading?.detection_label || 'None'}</p>{reading?.detection_label && <><p className="mt-2 text-sm text-white/70">{Math.round((reading.detection_confidence || 0) * 100)}% confidence</p><p className="mt-1 text-xs text-white/40">{new Date(reading.detection_at || reading.created_at).toLocaleString()}</p></>}</div><p className="mt-4 text-xs leading-relaxed text-white/45">Only rat and snake detections are stored and displayed. Video remains on the local device.</p></div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Connected device</p><h2 className="mt-2 text-2xl font-extrabold text-primary">{device?.name || 'No device yet'}</h2><p className="mt-1 font-mono text-sm text-secondary">{device?.id || '—'}</p></div><div className="sm:text-right"><p className="text-sm text-muted-foreground">Last sensor update</p><p className="mt-1 font-bold text-primary">{reading ? new Date(reading.created_at).toLocaleString() : 'No data received'}</p></div></div></section>
    </div>
  </main>;
}

function Metric({ icon, label, value, unit = '', status, text, featured, danger }: { icon: React.ReactNode; label: string; value?: number | null; unit?: string; status: string; text?: string; featured?: boolean; danger?: boolean }) {
  return <article className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm ${featured ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}><div className={`mb-8 grid h-11 w-11 place-items-center rounded-2xl ${featured ? 'bg-white/10 text-accent' : 'bg-secondary/10 text-secondary'}`}>{icon}</div><p className={`text-xs font-bold uppercase tracking-widest ${featured ? 'text-white/55' : 'text-muted-foreground'}`}>{label}</p><p className={`mt-2 text-4xl font-extrabold tracking-tight ${danger ? 'text-red-300' : ''}`}>{text || (value === null || value === undefined ? '—' : value.toFixed(1))}<span className="text-lg font-semibold">{text ? '' : unit}</span></p><p className={`mt-3 text-sm font-semibold ${danger ? 'text-red-300' : featured ? 'text-white/65' : 'text-secondary'}`}>{status}</p></article>;
}
function StatusRow({ label, active, alarm, inactiveLabel = 'OFF' }: { label: string; active?: boolean; alarm?: boolean; inactiveLabel?: string }) { return <div className="flex items-center justify-between rounded-2xl border border-border p-4"><span className="text-sm font-bold">{label}</span><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${active ? (alarm ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700') : 'bg-slate-100 text-slate-500'}`}>{active ? 'ACTIVE' : inactiveLabel}</span></div>; }
function conditionStatus(high?: boolean, low?: boolean) { if (high) return 'High condition'; if (low) return 'Low condition'; return 'Normal range'; }
function flagStatus(active: boolean | undefined, warning: string) { return active ? warning : 'Safe range'; }
function getActiveAlarms(reading: Reading | null) {
  if (!reading) return [];
  return [
    reading.temperature_high && 'High temperature',
    reading.temperature_low && 'Low temperature',
    reading.humidity_high && 'High humidity',
    reading.humidity_low && 'Low humidity',
    reading.air_quality_bad && 'Poor air quality / high ammonia',
  ].filter((alarm): alarm is string => Boolean(alarm));
}
function greeting() { const hour = new Date().getHours(); return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'; }
