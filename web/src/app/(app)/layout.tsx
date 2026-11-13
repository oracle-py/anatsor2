'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, FileText, LayoutDashboard, LogOut, Settings, TriangleAlert, Warehouse } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { FarmDataProvider } from '@/components/app/FarmDataProvider';
import { getSupabaseClient } from '@/lib/supabase';
import { farmById, stateBySlug } from '@/lib/farms-data';
import '@/styles/dashboard.css';

const navigation = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/farms', label: 'Farms', icon: Warehouse },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Local preview without signing in: `NEXT_PUBLIC_DEV_PREVIEW=1 npm run dev`.
    // NODE_ENV is 'production' in every build, so this never applies when deployed.
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_PREVIEW === '1') {
      setUser({ id: 'preview', name: 'Preview', email: 'preview@localhost' });
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) { setError('Supabase is not configured. Add your project keys to .env.local.'); return; }
    supabase.auth.getUser().then(async ({ data, error: authError }) => {
      if (!data.user || authError) {
        await supabase.auth.signOut({ scope: 'local' });
        router.replace('/');
        return;
      }
      setUser({ id: data.user.id, name: displayName(data.user.user_metadata, data.user.email), email: data.user.email || '' });
    });
  }, [router]);

  async function signOut() {
    try {
      const result = await getSupabaseClient()?.auth.signOut();
      if (result?.error) throw result.error;
      router.replace('/');
    } catch { setError('Unable to sign out. Please try again.'); }
  }

  const crumbs = useMemo(() => breadcrumbs(pathname), [pathname]);
  const initials = user ? initialsOf(user.name) : '··';
  const nav = (mobile = false) => <nav aria-label={mobile ? 'Mobile navigation' : 'Main navigation'} className={mobile ? 'farm-mobile-nav' : 'farm-navigation'}>
    {navigation.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={active ? 'active' : ''}><Icon size={18} /><span>{label}</span></Link>;
    })}
  </nav>;

  return <div className="farm-dashboard">
    <a href="#main" className="farm-skip">Skip to content</a>
    <aside className="farm-sidebar">
      <Link href="/overview" className="farm-brand"><span><AppLogo size={36} /></span><div>Anatsor<small>AIPMS monitoring</small></div></Link>
      <p className="sidebar-caption">Workspace</p>{nav()}
      <div className="sidebar-device"><Warehouse size={18} /><p>Youth4Climate<small>15 farms · 3 states</small></p></div>
      <div className="sidebar-account"><span className="farm-avatar">{initials}</span><p>{user?.name || 'Loading…'}<small>Project administrator</small></p><button onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    </aside>
    <div className="farm-workspace">
      <header className="farm-header">
        <Link href="/overview" className="mobile-brand"><AppLogo size={32} /><strong>Anatsor</strong></Link>
        <nav aria-label="Breadcrumb" className="header-breadcrumb">{crumbs.map((crumb, index) => <span key={crumb.href} className="crumb">{index > 0 && <span className="crumb-sep">/</span>}{index === crumbs.length - 1 ? <strong>{crumb.label}</strong> : <Link href={crumb.href}>{crumb.label}</Link>}</span>)}</nav>
        <div className="header-actions"><span className="farm-avatar">{initials}</span><button onClick={signOut} aria-label="Sign out" className="mobile-signout"><LogOut size={18} /></button></div>
      </header>
      <main id="main" className="farm-content">
        {error && <div role="alert" className="farm-notice error"><TriangleAlert size={18} /><p>{error}</p></div>}
        {user ? <FarmDataProvider user={user} onRename={name => setUser(current => current && { ...current, name })}>{children}</FarmDataProvider> : !error && <div className="farm-empty" aria-busy="true">Loading workspace…</div>}
      </main>
    </div>{nav(true)}
  </div>;
}

/** Prefer the full name, then the username chosen at signup, then the email prefix. */
function displayName(metadata: Record<string, unknown> | undefined, email?: string) {
  const pick = (key: string) => typeof metadata?.[key] === 'string' ? (metadata[key] as string).trim() : '';
  return pick('full_name') || pick('username') || email?.split('@')[0] || 'Admin';
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

function breadcrumbs(pathname: string) {
  const [section, stateSlug, farmId] = pathname.split('/').filter(Boolean);
  const top = navigation.find(item => item.href === `/${section}`);
  const crumbs = [{ href: top?.href || '/overview', label: top?.label || 'Overview' }];
  const state = stateSlug ? stateBySlug(stateSlug) : undefined;
  if (section === 'farms' && state) crumbs.push({ href: `/farms/${state.slug}`, label: state.name });
  const farm = farmId ? farmById(farmId) : undefined;
  if (section === 'farms' && farm) crumbs.push({ href: pathname, label: farm.name });
  return crumbs;
}
