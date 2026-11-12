'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bird, Camera, Droplets, LogOut, MapPin, RefreshCw, Thermometer, TriangleAlert, Warehouse, Wind, ArrowUpRight, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import '@/styles/dashboard.css';
import { getSupabaseClient } from '@/lib/supabase';
import { FARM_COLUMNS, Farm, LIVE_TICK_MS, activeAlarms, simulateReading } from '@/lib/simulation';

const STATES = ['All', 'Benue', 'Plateau', 'Nasarawa'] as const;
type StateFilter = (typeof STATES)[number];

export default function FarmsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState<number | null>(null);
  const [filter, setFilter] = useState<StateFilter>('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseClient();
      if (!supabase) { setError('Supabase is not configured. Add your project keys to .env.local.'); return; }
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!auth.user || authError) { await supabase.auth.signOut({ scope: 'local' }); router.replace('/login'); return; }
      setUserName(auth.user.user_metadata?.username || auth.user.email?.split('@')[0] || 'Admin');
      const { data, error: farmError } = await supabase.from('devices').select(FARM_COLUMNS).order('id');
      if (farmError) throw farmError;
      setFarms((data || []) as Farm[]);
    } catch (cause) {
      setError((cause as { message?: string })?.message || 'Unable to load farms. Please refresh to try again.');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const live = useMemo(() => farms.map(farm => ({ farm, reading: now ? simulateReading(farm, now) : null })), [farms, now]);
  const visible = filter === 'All' ? live : live.filter(({ farm }) => farm.state === filter);
  const totals = {
    farms: visible.length,
    birds: visible.reduce((sum, { farm }) => sum + (farm.bird_count || 0), 0),
    attention: visible.filter(({ reading }) => reading?.alarm_active).length,
    cameras: visible.filter(({ farm }) => farm.has_camera).length,
  };
  const countFor = (state: StateFilter) => state === 'All' ? farms.length : farms.filter(farm => farm.state === state).length;

  async function signOut() {
    try {
      const result = await getSupabaseClient()?.auth.signOut();
      if (result?.error) throw result.error;
      router.push('/login');
    } catch { setError('Unable to sign out. Please try again.'); }
  }

  const nav = (mobile = false) => <nav aria-label={mobile ? 'Mobile state filter' : 'Filter farms by state'} className={mobile ? 'farm-mobile-nav' : 'farm-navigation'}>
    {STATES.map(state => <button key={state} type="button" onClick={() => setFilter(state)} aria-pressed={filter === state} className={filter === state ? 'active' : ''}>
      {state === 'All' ? <LayoutGrid size={18} /> : <MapPin size={18} />}<span>{state === 'All' ? 'All farms' : state}</span>{!mobile && <small className="nav-count">{countFor(state)}</small>}
    </button>)}
  </nav>;

  return <div className="farm-dashboard">
    <aside className="farm-sidebar">
      <Link href="/farms" className="farm-brand"><span><AppLogo size={36} /></span><div>Anatsor<small>Farm monitoring</small></div></Link>
      <p className="sidebar-caption">Deployments</p>{nav()}
      <div className="sidebar-device"><Warehouse size={18} /><p>Youth4Climate<small>{farms.length} AIPMS deployments</small></p></div>
      <div className="sidebar-account"><span className="farm-avatar">{userName.slice(0, 2).toUpperCase()}</span><p>{userName}<small>Project administrator</small></p><button onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    </aside>
    <div className="farm-workspace">
      <header className="farm-header"><Link href="/farms" className="mobile-brand"><AppLogo size={32} /><strong>Anatsor</strong></Link><span className="header-breadcrumb">Workspace <span>/</span> <strong>All farms</strong></span><div className="header-actions"><span className="demo-badge" title="Sensor readings on this page are simulated for demonstration">Demo data</span><span className="farm-avatar">{userName.slice(0, 2).toUpperCase()}</span><button onClick={signOut} aria-label="Sign out" className="mobile-signout"><LogOut size={18} /></button></div></header>
      <main className="farm-content" aria-busy={loading}>
        <div className="farm-page-heading"><div><p className="farm-eyebrow">Youth4Climate · AIPMS deployments 2026</p><h1>{filter === 'All' ? 'All farms' : `${filter} State`}</h1><p>Live conditions across every poultry house. Select a farm for full details.</p></div><button className="farm-button" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing…' : 'Refresh farms'}</button></div>
        {error && <div role="alert" className="farm-notice error"><TriangleAlert size={18} /><p>{error}</p></div>}
        {!loading && !error && !farms.length && <div className="farm-notice"><Warehouse size={19} /><p><strong>No farms yet.</strong> Run <code>supabase/seed_farms.sql</code> with this account&apos;s email to add the 15 deployments.</p></div>}

        <section className="farm-metrics" aria-label="Deployment totals">
          <Total icon={<Warehouse size={18} />} label="Farms" value={totals.farms} caption={filter === 'All' ? 'Benue · Plateau · Nasarawa' : `${filter} State`} />
          <Total icon={<Bird size={18} />} label="Birds monitored" value={totals.birds.toLocaleString()} caption="Combined poultry population" />
          <Total icon={<TriangleAlert size={18} />} label="Need attention" value={totals.attention} caption={totals.attention ? 'Active environmental warnings' : 'No active warnings'} danger={totals.attention > 0} />
          <Total icon={<Camera size={18} />} label="AI cameras" value={totals.cameras} caption="Farms with threat detection" />
        </section>

        <section className="farm-grid" aria-label="Farms">
          {loading && !farms.length && Array.from({ length: 6 }, (_, i) => <div key={i} className="farm-card farm-card-loading" aria-hidden="true" />)}
          {visible.map(({ farm, reading }) => {
            const alarms = activeAlarms(reading);
            return <Link key={farm.id} href={`/dashboard?farm=${encodeURIComponent(farm.id)}`} className={`farm-card ${alarms.length ? 'attention' : ''}`}>
              <div className="farm-card-top">
                <div><h2>{farm.name}</h2><p><MapPin size={12} />{[farm.location, farm.state && `${farm.state} State`].filter(Boolean).join(', ') || 'Location not set'}</p></div>
                <span className={`farm-status ${alarms.length ? 'danger' : 'healthy'}`}>{alarms.length ? 'ATTENTION' : 'NORMAL'}</span>
              </div>
              <div className="farm-card-readings">
                <Value icon={<Thermometer size={14} />} value={reading?.temperature} unit="°C" danger={reading?.temperature_high || reading?.temperature_low} />
                <Value icon={<Droplets size={14} />} value={reading?.humidity} unit="%" danger={reading?.humidity_high || reading?.humidity_low} />
                <Value icon={<Wind size={14} />} value={reading?.air_quality} unit="ppm" danger={reading?.air_quality_bad} />
              </div>
              {alarms.length > 0 && <p className="alarm-note">{alarms.join(' · ')}</p>}
              <div className="farm-card-footer">
                <span><Bird size={13} />{(farm.bird_count || 0).toLocaleString()} birds</span>
                {farm.has_camera && <span><Camera size={13} />AI camera</span>}
                <span className="farm-card-link">Open <ArrowUpRight size={13} /></span>
              </div>
            </Link>;
          })}
        </section>
        <footer className="farm-device-footer"><div><strong>Simulated readings</strong><span>Farm records are real deployments; sensor values are generated for demonstration.</span></div><p>Updated {now ? new Date(now).toLocaleTimeString() : '—'}<span>Refreshes every {LIVE_TICK_MS / 1000} seconds</span></p></footer>
      </main>
    </div>{nav(true)}
  </div>;
}

function Total({ icon, label, value, caption, danger }: { icon: React.ReactNode; label: string; value: number | string; caption: string; danger?: boolean }) {
  return <article className="farm-metric"><div className="metric-top"><p>{label}</p><span>{icon}</span></div><p className="metric-value">{value}</p><p className={`metric-caption ${danger ? 'danger-text' : ''}`}>{caption}</p></article>;
}

function Value({ icon, value, unit, danger }: { icon: React.ReactNode; value?: number | null; unit: string; danger?: boolean }) {
  return <p className={danger ? 'danger-text' : ''}>{icon}<strong className={danger ? 'danger-text' : ''}>{value == null ? '—' : value.toFixed(1)}</strong><small>{unit}</small></p>;
}
