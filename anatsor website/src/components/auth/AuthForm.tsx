'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const signup = mode === 'signup';
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // getSession() only reads the browser cache. getUser() verifies that the
    // account still exists on Supabase, preventing redirect loops after an
    // administrator deletes a logged-in user.
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (data.user && !error) {
        router.replace('/dashboard');
        return;
      }

      await supabase.auth.signOut({ scope: 'local' });
    });
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    const supabase = getSupabaseClient();
    if (!supabase) return setMessage('Connect Supabase using the environment variables in .env.example.');
    setLoading(true);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    if (signup) {
      const deviceId = String(form.get('deviceId') || '').trim().toUpperCase();
      const { data: deviceAvailable, error: availabilityError } = await supabase.rpc(
        'is_device_available',
        { candidate_id: deviceId },
      );

      if (availabilityError) {
        setMessage('Unable to verify the device ID. Run the latest Supabase schema and try again.');
        setLoading(false);
        return;
      }

      if (!deviceAvailable) {
        setMessage('That device ID is unknown or already registered. Check the ID printed on your physical unit or contact support.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { username: String(form.get('username') || '').trim(), device_id: deviceId, device_name: String(form.get('deviceName') || '').trim() },
      }});
      if (error) setMessage(error.message);
      else if (data.session) {
        const { error: claimError } = await supabase.rpc('claim_device', {
          requested_device_id: deviceId,
          requested_name: String(form.get('deviceName') || '').trim() || null,
        });
        if (claimError) setMessage(claimError.message);
        else router.push('/dashboard');
      }
      else setMessage('Account created. Check your email to confirm your address, then sign in.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        const metadata = data.user?.user_metadata;
        if (metadata?.device_id) {
          const { data: existing } = await supabase.from('devices').select('id').limit(1).maybeSingle();
          if (!existing) await supabase.rpc('claim_device', { requested_device_id: metadata.device_id, requested_name: metadata.device_name || null });
        }
        router.push('/dashboard');
      }
    }
    setLoading(false);
  }

  return <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1.08fr_0.92fr]">
    <section className="relative hidden lg:flex overflow-hidden bg-primary p-14 text-primary-foreground flex-col justify-between">
      <div className="absolute inset-0 opacity-30 auth-grid" aria-hidden="true" />
      <Link href="/" className="relative z-10 flex items-center gap-3 w-fit"><span className="grid place-items-center rounded-2xl bg-white p-2"><AppLogo size={52} /></span><span className="font-extrabold text-xl">Anatsor</span></Link>
      <div className="relative z-10 max-w-xl">
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"><span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> AIPMS farm intelligence</span>
        <h1 className="text-5xl font-extrabold leading-[1.02] tracking-[-0.04em]">Your poultry house,<br /><span className="font-light italic text-accent">always within reach.</span></h1>
        <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/65">Monitor temperature, humidity and ammonia remotely. Catch unsafe conditions early and protect every flock.</p>
      </div>
      <div className="relative z-10 grid grid-cols-3 gap-3">{['Live conditions', 'Instant alerts', 'Secure access'].map((item, i) => <div key={item} className="rounded-2xl border border-white/15 bg-white/[0.07] p-4"><span className="text-accent font-extrabold">0{i + 1}</span><p className="mt-2 text-sm font-semibold text-white/80">{item}</p></div>)}</div>
    </section>
    <section className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-12">
      <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft size={17} /> Back home</Link>
      <div className="w-full max-w-md">
        <div className="mb-9 lg:hidden"><AppLogo size={60} /></div>
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">{signup ? 'Start monitoring' : 'Welcome back'}</p>
        <h2 className="text-4xl font-extrabold tracking-[-0.035em] text-primary">{signup ? 'Create your farm account' : 'Sign in to AIPMS'}</h2>
        <p className="mt-3 text-muted-foreground">{signup ? 'Connect your first monitoring device in a few steps.' : 'View the latest conditions across your poultry farm.'}</p>
        <form onSubmit={submit} className="mt-9 space-y-5">
          {signup && <><Field label="Username" name="username" placeholder="e.g. ade.farms" required /><div className="grid gap-5 sm:grid-cols-2"><Field label="Device name" name="deviceName" placeholder="Brooder house" required /><Field label="Device ID" name="deviceId" placeholder="AIPMS1234" required /></div></>}
          <Field label="Email address" name="email" type="email" placeholder="farmer@example.com" required />
          <label className="block"><span className="mb-2 block text-sm font-bold text-primary">Password</span><span className="relative block"><input name="password" type={visible ? 'text' : 'password'} minLength={8} required placeholder="At least 8 characters" className="auth-input pr-12" /><button type="button" aria-label="Show password" onClick={() => setVisible(!visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
          {message && <div role="status" className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">{message}</div>}
          {!isSupabaseConfigured && <p className="text-xs text-muted-foreground">Supabase setup is required before authentication can complete.</p>}
          <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:bg-secondary disabled:opacity-60">{loading ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} <ArrowRight size={18} /></button>
        </form>
        <p className="mt-7 text-center text-sm text-muted-foreground">{signup ? 'Already have an account?' : 'New to Anatsor?'} <Link className="font-extrabold text-secondary hover:underline" href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={16} /> Farm data protected by row-level security</div>
      </div>
    </section>
  </main>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-primary">{label}</span><input {...props} className="auth-input" /></label>;
}
