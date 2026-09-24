import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = { title: 'Create account | Anatsor AIPMS' };
export default function SignupPage() { return <AuthForm mode="signup" />; }
