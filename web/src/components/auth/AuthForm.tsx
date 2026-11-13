'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import '@/styles/auth.css';
import AppLogo from '@/components/ui/AppLogo';
import { withBasePath } from '@/lib/basePath';
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
        router.replace('/overview');
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
        emailRedirectTo: `${window.location.origin}${withBasePath('/overview')}`,
        data: { username: String(form.get('username') || '').trim(), device_id: deviceId, device_name: String(form.get('deviceName') || '').trim() },
      }});
      if (error) setMessage(error.message);
      else if (data.session) {
        const { error: claimError } = await supabase.rpc('claim_device', {
          requested_device_id: deviceId,
          requested_name: String(form.get('deviceName') || '').trim() || null,
        });
        if (claimError) setMessage(claimError.message);
        else router.push('/overview');
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
        router.push('/overview');
      }
    }
    setLoading(false);
  }

  return <main className="auth-page">
    <Image src={withBasePath('/assets/images/hero_background.png')} alt="" fill priority sizes="100vw" className="auth-background" />
    <div className="auth-overlay" aria-hidden="true" />
    <header className="auth-brand"><Link href="/" aria-label="Anatsor home"><span><AppLogo size={42} /></span><strong>Anatsor</strong></Link></header>
    <div className="auth-layout">
      <section className="auth-caption" aria-label="Farm monitoring"><h1>Your farm.<br />Always within reach.</h1></section>
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-eyebrow">{signup ? 'Get started' : 'Welcome back'}</p>
        <h2 id="auth-title">{signup ? 'Create your account' : 'Sign in to your farm'}</h2>
        <p className="auth-description">{signup ? 'Register your AIPMS device to start monitoring.' : 'See what is happening in your poultry house.'}</p>
        <form onSubmit={submit} className="mt-9 space-y-5">
          {signup && <><Field label="Username" name="username" placeholder="e.g. ade.farms" required /><div className="grid gap-5 sm:grid-cols-2"><Field label="Device name" name="deviceName" placeholder="Brooder house" required /><Field label="Device ID" name="deviceId" placeholder="AIPMS1234" required /></div></>}
          <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="farmer@example.com" required />
          <label className="block"><span className="mb-2 block text-sm font-bold text-primary">Password</span><span className="relative block"><input name="password" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required placeholder={signup ? 'At least 8 characters' : 'Enter your password'} className="auth-input pr-12" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
          {message && <div role="status" className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">{message}</div>}
          {!isSupabaseConfigured && <p className="text-xs text-muted-foreground">Supabase setup is required before authentication can complete.</p>}
          <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:bg-secondary disabled:opacity-60">{loading ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} <ArrowRight size={18} /></button>
        </form>
        <p className="mt-7 text-center text-sm text-muted-foreground">{signup ? 'Already have an account?' : 'New to Anatsor?'} <Link className="font-extrabold text-secondary hover:underline" href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p>
      </section>
    </div>
  </main>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-primary">{label}</span><input {...props} className="auth-input" /></label>;
}
