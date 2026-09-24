import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Device } from '../types';

type AuthValue = { session: Session | null; user: User | null; device: Device | null; loading: boolean; refreshDevice: () => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshDevice() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setDevice(null); return; }
    const { data } = await supabase.from('devices').select('*').eq('owner_user_id', auth.user.id).order('claimed_at').limit(1).maybeSingle();
    setDevice(data as Device | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); if (data.session) await refreshDevice(); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); if (!next) setDevice(null); else setTimeout(refreshDevice, 0); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() { await supabase.auth.signOut(); setDevice(null); }
  return <AuthContext.Provider value={{ session, user: session?.user || null, device, loading, refreshDevice, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be inside AuthProvider'); return value; }
