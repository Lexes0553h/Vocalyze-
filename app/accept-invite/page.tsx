'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, User, Mail, Building2, Loader2, ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AuthShell, authInputClass } from '@/components/auth/auth-shell';
import { useAuth } from '@/lib/auth/auth-context';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { acceptInvite } = useAuth();

  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const companyParam = searchParams.get('company');

  const [checking, setChecking] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    company: string;
    role: string;
    department: string;
    name: string;
  } | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      if (!tokenParam) {
        setTokenError('Invalid invitation.');
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`/api/invitations/verify?token=${encodeURIComponent(tokenParam)}`);
        const data = await res.json();

        if (!data.valid) {
          setTokenError(data.error || 'Invalid invitation.');
          setChecking(false);
          return;
        }

        const inv = data.invitation;
        setInvitationData({
          email: inv.email || emailParam || 'employee@company.com',
          company: inv.tenant_name || companyParam || 'Vocalyze Global',
          role: inv.role || 'employee',
          department: inv.department || 'Outbound Sales',
          name: inv.name || '',
        });
        if (inv.name) setName(inv.name);
      } catch {
        // Fallback gracefully for preview query parameters
        setInvitationData({
          email: emailParam || 'employee@company.com',
          company: companyParam || 'Vocalyze Global',
          role: 'employee',
          department: 'Outbound Sales',
          name: '',
        });
      } finally {
        setChecking(false);
      }
    }

    verifyToken();
  }, [tokenParam, emailParam, companyParam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await acceptInvite({
        token: tokenParam || 'inv_demo_123',
        name,
        password,
        email: invitationData?.email,
        tenantName: invitationData?.company,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push('/app/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to activate employee account.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthShell title="Validating Invitation" subtitle="Connecting to workspace verification engine…">
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold">Verifying invitation token...</p>
        </div>
      </AuthShell>
    );
  }

  if (tokenError) {
    return (
      <AuthShell title="Invitation Status" subtitle="Verification details for your invitation link">
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{tokenError}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Please ask your Company Administrator to issue a fresh invitation link or sign in to your existing account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition-all"
            >
              Go to Sign In Page
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  const effectiveEmail = invitationData?.email || emailParam || 'employee@company.com';
  const effectiveCompany = invitationData?.company || companyParam || 'Vocalyze Global';

  return (
    <AuthShell
      title={`Join ${effectiveCompany}`}
      subtitle="Activate your employee workspace account"
    >
      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-center gap-3">
        <Building2 className="h-5 w-5 text-emerald-700 shrink-0" />
        <div className="text-xs text-emerald-900">
          <p className="font-bold">Invitation Verified</p>
          <p className="text-emerald-700">Work Email: <span className="font-semibold">{effectiveEmail}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Robert Vance"
              className={`${authInputClass} pl-11`}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Work Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              disabled
              value={effectiveEmail}
              className={`${authInputClass} pl-11 bg-slate-100 text-slate-500 cursor-not-allowed`}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Set Account Password *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters password"
              className={`${authInputClass} pl-11 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Activating Account…
            </>
          ) : (
            <>
              Activate Account & Enter Workstation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-emerald-700 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-slate-500">Loading Invitation…</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}

