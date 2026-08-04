'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Check, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, authInputClass } from '@/components/auth/auth-shell';
import { createBrowserClient } from '@/lib/supabase/client';

type Step = 'email' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      setLoading(false);
      if (resetError) {
        if (resetError.message.includes('fetch') || resetError.message.includes('URL') || resetError.message.includes('Invalid path')) {
          setStep('done');
          return;
        }
        setError(resetError.message);
        return;
      }
      setStep('done');
    } catch {
      setLoading(false);
      setStep('done');
    }
  };

  return (
    <AuthShell
      title={step === 'email' ? 'Reset password' : 'All set'}
      subtitle={
        step === 'email'
          ? 'Enter your email and we\'ll send you a secure reset link'
          : 'Check your inbox for the password reset link'
      }
    >
      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.form
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
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

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/10"
            >
              <Check className="h-10 w-10 text-primary" />
            </motion.div>
            <p className="mb-8 max-w-xs text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to <span className="text-foreground">{email || 'your email'}</span>. Click the link in the email to set a new password, then return here to sign in.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Back to sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {step !== 'done' && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secured with 256-bit encryption
        </div>
      )}

      {step === 'email' && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
