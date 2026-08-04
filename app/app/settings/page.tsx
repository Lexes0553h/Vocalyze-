'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Settings, Palette, Bell, Lock, Check, Sun, Moon, Laptop, ShieldCheck, Key, Upload, ExternalLink } from 'lucide-react';
import { PageHeader, Card, Button, Avatar, Badge } from '@/components/crm/crm-ui';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TABS = [
  { id: 'Profile', icon: User },
  { id: 'Company', icon: Building2 },
  { id: 'Preferences', icon: Settings },
  { id: 'Appearance', icon: Palette },
  { id: 'Notifications', icon: Bell },
  { id: 'Security', icon: Lock },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('Profile');

  // Profile state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '+1 (415) 555-0100');
  const [title, setTitle] = useState(user?.title ?? 'Telecalling Specialist');
  const [bio, setBio] = useState(user?.bio ?? 'Senior representative driving sales pipeline and customer relations.');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');

  // Preferences
  const [language, setLanguage] = useState('English (US)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour (AM/PM)');
  const [landingPage, setLandingPage] = useState('Dashboard');

  // Appearance
  const [theme, setTheme] = useState<'Dark' | 'Light' | 'System'>('Dark');
  const [accent, setAccent] = useState('emerald');
  const [compact, setCompact] = useState(false);
  const [fontSize, setFontSize] = useState('Medium');

  // Notifications
  const [notifDeals, setNotifDeals] = useState(true);
  const [notifSummary, setNotifSummary] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifCalls, setNotifCalls] = useState(true);
  const [notifTasks, setNotifTasks] = useState(true);
  const [notifSounds, setNotifSounds] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'MacBook Pro 16"', location: 'San Francisco, CA', active: 'Current Session', ip: '192.168.1.45' },
    { id: 's2', device: 'iPhone 15 Pro', location: 'San Francisco, CA', active: '2 hours ago', ip: '10.0.0.12' },
    { id: 's3', device: 'Chrome on Windows', location: 'Austin, TX', active: '3 days ago', ip: '172.16.0.4' },
  ]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '+1 (415) 555-0100');
      setTitle(user.title ?? 'Telecalling Specialist');
      setBio(user.bio ?? 'Senior representative driving sales pipeline and customer relations.');
      setAvatar(user.avatar ?? '');
    }
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      toast({ title: 'Photo Uploaded', description: 'Your profile photo preview is ready.' });
    }
  };

  const saveProfile = () => {
    updateUser({
      name,
      email,
      phone,
      title,
      bio,
      avatar,
    });
    toast({ title: 'Profile Updated', description: 'Your profile details have been saved.' });
  };

  const savePreferences = () => {
    toast({ title: 'Preferences Saved', description: 'Your regional and display settings have been updated.' });
  };

  const handleThemeChange = (newTheme: 'Dark' | 'Light' | 'System') => {
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'Light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
    toast({ title: 'Theme Updated', description: `Appearance mode set to ${newTheme}.` });
  };

  const savePassword = () => {
    if (!currentPassword) {
      toast({ title: 'Error', description: 'Please enter your current password.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'New password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast({ title: 'Password Changed', description: 'Your security credentials have been updated.' });
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast({ title: 'Session Revoked', description: 'The device session has been terminated.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employee & Account Settings" subtitle="Configure your profile, preferences, appearance, notifications, and security." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar Navigation */}
        <div className="flex flex-row lg:flex-col overflow-x-auto gap-1.5 pb-2 lg:pb-0 scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex shrink-0 w-auto lg:w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                  tab === t.id ? 'bg-primary/15 text-primary ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t.id}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card title={tab}>
            <div className="space-y-5">
              {/* PROFILE TAB */}
              {tab === 'Profile' && (
                <>
                  <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                    <Avatar src={avatar} name={name} size={64} ring />
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors">
                        <Upload className="h-3.5 w-3.5" /> Upload Photo
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF, max 5MB</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Designation / Role</label>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Bio / Work Summary</label>
                    <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="primary" onClick={saveProfile}>Save Profile</Button>
                  </div>
                </>
              )}

              {/* COMPANY TAB */}
              {tab === 'Company' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.tenant?.logo ? (
                        <img src={user.tenant.logo} alt="Logo" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold text-lg">
                          {(user?.tenant?.name || 'V').charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{user?.tenant?.name || 'Vocalyze Global'}</h3>
                        <p className="text-xs text-muted-foreground">Tenant ID: {user?.tenantId || 'tenant_default'}</p>
                      </div>
                    </div>
                    {user?.role === 'company_admin' && (
                      <Link href="/app/company-settings" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                        Manage Company <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="Employee ID" value={user?.employeeId || 'EMP-2026-889'} />
                    <ReadOnlyField label="Department" value="Sales Operations & Telecalling" />
                    <ReadOnlyField label="Assigned Manager" value={user?.manager || 'Sarah Jenkins (VP of Sales)'} />
                    <ReadOnlyField label="Date Joined" value={user?.joinedDate || 'January 15, 2024'} />
                    <ReadOnlyField label="Timezone" value={user?.tenant?.timezone || 'America/Los_Angeles'} />
                    <ReadOnlyField label="Base Currency" value={user?.tenant?.currency || 'USD'} />
                  </div>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {tab === 'Preferences' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                        {['English (US)', 'Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Hindi (हिंदी)'].map((o) => <option key={o} value={o} className="bg-background text-foreground">{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Date Format</label>
                      <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                        {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((o) => <option key={o} value={o} className="bg-background text-foreground">{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Time Display</label>
                      <select value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                        {['12-hour (AM/PM)', '24-hour'].map((o) => <option key={o} value={o} className="bg-background text-foreground">{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Default Startup Page</label>
                      <select value={landingPage} onChange={(e) => setLandingPage(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                        {['Dashboard', 'Pipeline', 'Calls', 'Leads', 'Tasks'].map((o) => <option key={o} value={o} className="bg-background text-foreground">{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="primary" onClick={savePreferences}>Save Preferences</Button>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {tab === 'Appearance' && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">Interface Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'Dark', label: 'Dark Mode', icon: Moon },
                        { key: 'Light', label: 'Light Mode', icon: Sun },
                        { key: 'System', label: 'System Default', icon: Laptop },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => handleThemeChange(t.key as 'Dark' | 'Light' | 'System')}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold transition-all',
                            theme === t.key ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30' : 'border-slate-200 dark:border-white/10 text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5'
                          )}
                        >
                          <t.icon className="h-5 w-5" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">Accent Color</p>
                    <div className="flex gap-3">
                      {[
                        { n: 'emerald', c: 'bg-emerald-500' },
                        { n: 'cyan', c: 'bg-cyan-500' },
                        { n: 'indigo', c: 'bg-indigo-500' },
                        { n: 'amber', c: 'bg-amber-500' },
                        { n: 'rose', c: 'bg-rose-500' },
                      ].map((a) => (
                        <button
                          key={a.n}
                          onClick={() => setAccent(a.n)}
                          className={cn('flex h-9 w-9 items-center justify-center rounded-full ring-2 transition-all', a.c, accent === a.n ? 'ring-primary ring-offset-2' : 'ring-transparent')}
                        >
                          {accent === a.n && <Check className="h-4 w-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Toggle label="Compact Interface Density" desc="Reduce row padding for dense data views" on={compact} onChange={setCompact} />
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {tab === 'Notifications' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Notifications</p>
                  <Toggle label="Deal & Lead Status Updates" desc="Receive instant email when a deal moves stage" on={notifDeals} onChange={setNotifDeals} />
                  <Toggle label="Daily Performance Digest" desc="Summary report sent every morning at 8:00 AM" on={notifSummary} onChange={setNotifSummary} />
                  <Toggle label="Security & Login Alerts" desc="Alerts on new sign-ins or password modifications" on={notifSecurity} onChange={setNotifSecurity} />

                  <p className="pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">In-App & Sound Alerts</p>
                  <Toggle label="Missed Call Notifications" desc="Popup banner when a phone call is missed" on={notifCalls} onChange={setNotifCalls} />
                  <Toggle label="Task & Follow-up Reminders" desc="Reminders before scheduled meetings or calls" on={notifTasks} onChange={setNotifTasks} />
                  <Toggle label="Sound Effects" desc="Play subtle chime on incoming call or new lead" on={notifSounds} onChange={setNotifSounds} />

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" onClick={() => toast({ title: 'Notifications Saved', description: 'Your alert preferences have been updated.' })}>Save Notification Preferences</Button>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {tab === 'Security' && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Change Password</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none" />
                      </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={savePassword}>Update Password</Button>
                  </div>

                  <Toggle label="Two-Factor Authentication (2FA)" desc="Secure your login with an authenticator app or SMS code" on={twoFactor} onChange={setTwoFactor} />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Sessions</p>
                      <button onClick={() => { setSessions([sessions[0]]); toast({ title: 'Logged Out Other Devices', description: 'All other active sessions have been ended.' }); }} className="text-xs font-semibold text-primary hover:underline">Log Out Other Sessions</button>
                    </div>
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{s.device}</p>
                          <p className="text-[11px] text-muted-foreground">{s.location} • {s.ip} • <span className="text-primary">{s.active}</span></p>
                        </div>
                        {s.id !== 's1' && (
                          <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)}>Revoke</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
        {value}
      </div>
    </div>
  );
}

function Toggle({ label, desc, on, onChange }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button onClick={() => onChange(!on)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20')}>
        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-md', on ? 'left-6' : 'left-1')} />
      </button>
    </div>
  );
}
