'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export function AuthShell({
  children,
  title,
  subtitle,
  backHref = '/',
  backLabel = 'Back to home',
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50 pointer-events-none" />

      {/* Back link */}
      <Link
        href={backHref}
        className="absolute left-6 top-6 z-20 flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/60 sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Vocalyze</span>
            </Link>
            <h1 className="font-display text-2xl font-light tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}

import { toast } from '@/components/ui/toast';

export function SocialButtons() {
  const handleGoogle = () => {
    toast({
      title: 'Google Sign-In',
      description: 'Google Sign-In will be available in a future update.',
    });
  };

  const handleMicrosoft = () => {
    toast({
      title: 'Microsoft Sign-In',
      description: 'Microsoft Sign-In will be available in a future update.',
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={handleGoogle}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>

      <button
        type="button"
        onClick={handleMicrosoft}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
      >
        <svg className="h-4 w-4" viewBox="0 0 23 23">
          <path fill="#f25022" d="M1 1h10v10H1z"/>
          <path fill="#7fba00" d="M12 1h10v10H1z"/>
          <path fill="#00a4ef" d="M1 12h10v10H1z"/>
          <path fill="#ffb900" d="M12 12h10v10H1z"/>
        </svg>
        Microsoft
      </button>
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export const authInputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20';
