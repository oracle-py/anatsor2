import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';
export const metadata: Metadata = { title: 'Sign in | Anatsor AIPMS' };
export default function HomePage() { return <AuthForm mode="login" />; }
