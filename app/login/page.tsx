'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell, SocialButtons, Divider, authInputClass } from '@/components/auth/auth-shell';
import { useAuth } from '@/lib/auth/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }
      
      const emailLower = email.toLowerCase();
      const isAdmin = emailLower.includes('admin') || emailLower.includes('manager') || emailLower.includes('owner') || emailLower === 'admin@xyzcompany.com';
      router.push(isAdmin ? '/app/admin' : '/app/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Vocalyze CRM workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Work Email *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={`${authInputClass} pl-11`}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Password *</label>
            <Link href="/forgot-password" className="text-xs text-emerald-700 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${authInputClass} pl-11 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Remember me on this browser
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <Divider label="or continue with" />
      <SocialButtons />

      <p className="mt-8 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-bold text-emerald-700 hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  );
}
