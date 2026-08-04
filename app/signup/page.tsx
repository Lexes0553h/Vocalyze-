'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Check, Loader2, ShieldCheck, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell, authInputClass } from '@/components/auth/auth-shell';
import { useAuth } from '@/lib/auth/auth-context';

export default function CompanySignupPage() {
  const router = useRouter();
  const { registerCompany } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [businessType, setBusinessType] = useState('B2B SaaS');
  const [selectedPlan, setSelectedPlan] = useState('Growth Pro');

  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const validCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthPercent = (validCount / 5) * 100;
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  if (validCount >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  } else if (validCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
  }

  const DISPOSABLE_DOMAINS = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'yopmail.com', 'trashmail.com', 'dispostable.com', 'getnada.com'];
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^([+]?[\s0-9.()-]{7,20})$/;

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || companyName.trim().length < 2) {
      setError('Company Name must be at least 2 characters long.');
      return;
    }
    if (companyName.trim().length > 100) {
      setError('Company Name cannot exceed 100 characters.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agree) {
      setError('Please accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }
    if (!adminName.trim() || adminName.trim().length < 2) {
      setError('Please enter a valid administrator full name.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid RFC-compliant business email address.');
      return;
    }

    const domain = cleanEmail.split('@')[1] || '';
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      setError('Disposable/temporary email addresses are not allowed. Please use a business domain.');
      return;
    }

    if (!phone.trim() || !PHONE_REGEX.test(phone.trim())) {
      setError('Please enter a valid business phone number (e.g. +1 (555) 019-2834).');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError('Password must meet all security requirements (8+ chars, upper, lower, number, special character).');
      return;
    }
    if (!passwordsMatch) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerCompany({
        companyName,
        adminName,
        email,
        phone,
        password,
        companySize,
        businessType,
        selectedPlan,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push('/app/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Company registration failed.');
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 1 ? 'Start Free Trial • Register Company' : 'Set Up Company Admin Account'}
      subtitle={step === 1 ? 'Step 1 of 2: Organization & Business Details' : 'Step 2 of 2: Create Administrator Credentials'}
    >
      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-100 p-2 text-xs font-semibold text-slate-700">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${step === 1 ? 'bg-white shadow text-emerald-800 font-bold' : ''}`}>
          <Building2 className="h-4 w-4 text-emerald-600" /> 1. Company
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${step === 2 ? 'bg-white shadow text-emerald-800 font-bold' : ''}`}>
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> 2. Admin Account
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Company / Organization Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Global Inc."
                className={`${authInputClass} pl-11`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Company Size *</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className={`${authInputClass} bg-white`}
              >
                <option value="1-10">1 - 10 Employees</option>
                <option value="11-50">11 - 50 Employees</option>
                <option value="51-200">51 - 200 Employees</option>
                <option value="201-500">201 - 500 Employees</option>
                <option value="500+">500+ Enterprise</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Industry / Type *</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className={`${authInputClass} bg-white`}
              >
                <option value="B2B SaaS">B2B SaaS / Tech</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Real Estate">Real Estate & Construction</option>
                <option value="Healthcare">Healthcare & Wellness</option>
                <option value="E-commerce">E-commerce & Retail</option>
                <option value="Other">Other Services</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Selected CRM Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Starter', badge: '10 Agents' },
                { name: 'Growth Pro', badge: '50 Agents' },
                { name: 'Enterprise', badge: 'Unlimited' },
              ].map((plan) => (
                <button
                  type="button"
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                    selectedPlan === plan.name
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{plan.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{plan.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 font-semibold">{error}</p>}

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800"
          >
            Continue to Admin Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Administrator Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Sarah Chen"
                className={`${authInputClass} pl-11`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Business Work Email *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@acmeglobal.com"
                className={`${authInputClass} pl-11`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Business Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className={`${authInputClass} pl-11`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
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

            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <span>Strength: {strengthLabel}</span>
                  <span>{validCount}/5 rules met</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strengthPercent}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    {hasMinLength ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                    <span>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasUppercase ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasLowercase ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasNumber ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    {hasSpecial ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                    <span>Special character (!@#$)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`${authInputClass} pl-11 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-[11px] text-red-500 font-medium">Passwords do not match</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>I agree to the <span className="text-emerald-700 font-semibold underline">Terms of Service</span> and <span className="text-emerald-700 font-semibold underline">Privacy Policy</span>.</span>
          </label>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 font-semibold">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:bg-emerald-800 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Enterprise Workspace…
                </>
              ) : (
                <>
                  Register Company & Launch CRM
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Already have a company workspace?{' '}
        <Link href="/login" className="font-bold text-emerald-700 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
