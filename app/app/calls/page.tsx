'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Mic, MicOff,
  PhoneOff, Pause, Play, Volume2, UserPlus, Delete, Star, Search,
  PhoneForwarded, Clock, Bot, CheckCircle2, X, User, ArrowLeft,
  History, Voicemail, ListFilter, Loader2, RefreshCw,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, EmptyState } from '@/components/crm/crm-ui';
import { useCalls, useCallFavorites, useContacts } from '@/lib/data/hooks';
import type { Call } from '@/lib/crm-data';
import { cn } from '@/lib/utils';
import { getTelephonyProvider, type CallSession } from '@/lib/telephony/provider';
import { useAuth } from '@/lib/auth/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/toast';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const DISPOSITIONS = ['Interested', 'Follow-up', 'Not Interested', 'Voicemail', 'No Answer', 'Demo Scheduled', 'Callback Requested'];
const FILTERS = ['All', 'Inbound', 'Outbound', 'Missed'] as const;

const telephony = getTelephonyProvider();

export default function CallsPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createBrowserClient(), []);
  const { data: CALLS = [], refetch: refreshCalls } = useCalls();
  const { data: FAVORITES = [] } = useCallFavorites();
  const { data: CONTACTS = [] } = useContacts();

  const [activeTab, setActiveTab] = useState<'dialer' | 'recent' | 'favorites'>('dialer');
  const [number, setNumber] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [session, setSession] = useState<CallSession | null>(null);
  const [duration, setDuration] = useState(0);
  const [isInitiating, setIsInitiating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [lastCall, setLastCall] = useState<{ name: string; number: string; duration: number } | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [disposition, setDisposition] = useState('Interested');
  const [followUp, setFollowUp] = useState(false);

  const backspaceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startCallRef = useRef<() => void>(() => {});

  useEffect(() => {
    startCallRef.current = startCall;
  });


  // Active Call Timer
  useEffect(() => {
    if (!session || session.status === 'ended') return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Keyboard Support for Dialer
  useEffect(() => {
    if (activeTab !== 'dialer' || session || showSummary || showTransfer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in active search inputs or textareas
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.getAttribute('type') !== 'tel'))) {
        return;
      }

      if ((e.key >= '0' && e.key <= '9') || e.key === '*' || e.key === '#') {
        e.preventDefault();
        setNumber((n) => n + e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setNumber((n) => n.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (number) startCallRef.current();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setNumber('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, session, showSummary, showTransfer, number]);


  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const matchName = (phone: string): string => {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return 'Unknown Customer';
    const c = CONTACTS.find((x) => x.phone && x.phone.replace(/\D/g, '').includes(clean));
    return c?.name ?? 'Unknown Customer';
  };

  const matchCompany = (phone: string): string => {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return 'Vocalyze Customer';
    const c = CONTACTS.find((x) => x.phone && x.phone.replace(/\D/g, '').includes(clean));
    return c?.company ?? 'Vocalyze Customer';
  };

  const startCall = async () => {
    const clean = number.trim();
    if (!clean || clean.replace(/\D/g, '').length < 3) {
      toast({ title: 'Invalid Phone Number', description: 'Please enter a valid phone number (at least 3 digits).' });
      return;
    }
    if (isInitiating || session) return;

    setIsInitiating(true);
    try {
      const contactName = matchName(clean);
      const s = await telephony.dial(clean, contactName);
      setSession(s);
      setDuration(0);
      setNotes('');
      toast({ title: 'Calling...', description: `Initiating call to ${contactName} (${clean})` });
    } catch (err: unknown) {
      toast({ title: 'Call Error', description: err instanceof Error ? err.message : 'Unable to complete call.' });
    } finally {
      setIsInitiating(false);
    }
  };

  const endCall = async () => {
    if (!session) return;
    try {
      const { durationSec } = await telephony.hangup(session.id);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];
      const durFormatted = formatTime(durationSec);

      setLastCall({ name: session.contactName, number: session.phoneNumber, duration: durationSec });
      setSession(null);
      setShowSummary(true);

      // Save call to Supabase for multi-tenant persistence
      const tenantId = user?.tenantId || 'tenant_default';
      const agentName = user?.name || 'Employee Agent';
      const recUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || 'demo'}/Recordings/RE_${Date.now()}.mp3`;

      const newCallRow = {
        contact: session.contactName,
        company: matchCompany(session.phoneNumber),
        agent: agentName,
        assigned_to: user?.id || null,
        direction: 'outbound' as const,
        duration: durFormatted,
        call_time: timeStr,
        call_date: dateStr,
        disposition: disposition || 'Interested',
        recording: true,
        notes: notes || 'Call session completed via Twilio Telephony.',
        phone: session.phoneNumber,
        contact_phone: session.phoneNumber,
        status: 'ended' as const,
        muted: false,
        speaker: false,
        recording_url: recUrl,
        summary: 'Call completed successfully. AI summary pending.',
        tenant_id: tenantId,
      };

      const { data: insertedRow, error: insertErr } = await supabase
        .from('calls')
        .insert([newCallRow])
        .select('id')
        .single();

      if (refreshCalls) refreshCalls();
      toast({ title: 'Call Ended', description: `Logged call with ${session.contactName} (${durFormatted}).` });

      // Automatically trigger AI Processing (Phase 4 requirement)
      const callId = insertedRow?.id;
      if (callId) {
        fetch('/api/ai/call-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId,
            contactName: session.contactName,
            companyName: matchCompany(session.phoneNumber),
            callNotes: notes || 'Phone call completed via Twilio Voice.',
            callDirection: 'outbound',
            agentName: agentName,
            recordingUrl: recUrl,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && refreshCalls) {
              refreshCalls();
              toast({ title: 'AI Insights Ready', description: `Call analysis generated for ${session.contactName}` });
            }
          })
          .catch((err) => {
            console.error('AI processing auto-trigger error:', err);
          });
      }
    } catch (err: unknown) {
      console.error('Failed to log call:', err);
      toast({ title: 'Call Ended', description: 'Call completed.' });
    }
  };

  const startContinuousDelete = () => {
    setNumber((n) => n.slice(0, -1));
    backspaceTimerRef.current = setInterval(() => {
      setNumber((n) => n.slice(0, -1));
    }, 120);
  };

  const stopContinuousDelete = () => {
    if (backspaceTimerRef.current) {
      clearInterval(backspaceTimerRef.current);
      backspaceTimerRef.current = null;
    }
  };

  const toggleMute = async () => {
    if (!session) return;
    const s = await telephony.mute(session.id, !session.muted);
    setSession(s);
  };
  const toggleHold = async () => {
    if (!session) return;
    const s = session.status === 'on_hold' ? await telephony.resume(session.id) : await telephony.hold(session.id);
    setSession(s);
  };
  const toggleSpeaker = async () => {
    if (!session) return;
    const s = await telephony.speaker(session.id, !session.speaker);
    setSession(s);
  };
  const doTransfer = async () => {
    if (!session || !transferTarget) return;
    const s = await telephony.transfer(session.id, transferTarget);
    setSession(null);
    setShowTransfer(false);
    setLastCall({ name: session.contactName, number: session.phoneNumber, duration });
    setShowSummary(true);
    setTransferTarget('');
  };

  const filteredCalls = useMemo(() => {
    return CALLS.filter((c) => {
      const matchesSearch =
        c.contact.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        (c.contactPhone || c.phone || '').includes(search);
      const matchesFilter = filter === 'All' || c.direction === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [CALLS, search, filter]);

  const recent = filteredCalls.slice(0, 30);
  const missed = useMemo(() => CALLS.filter((c) => c.direction === 'missed'), [CALLS]);
  const incoming = useMemo(() => CALLS.filter((c) => c.direction === 'inbound'), [CALLS]);
  const outgoing = useMemo(() => CALLS.filter((c) => c.direction === 'outbound'), [CALLS]);

  // Live Stats Computation
  const stats = useMemo(() => {
    const totalCalls = CALLS.length;
    const connected = CALLS.filter((c) => c.direction === 'outbound' || c.status === 'connected' || c.status === 'ended').length;
    const totalSec = CALLS.reduce((acc, c) => {
      if (!c.duration) return acc;
      const parts = c.duration.split(':');
      if (parts.length === 2) {
        return acc + (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
      }
      return acc;
    }, 0);
    const avgSec = totalCalls > 0 ? Math.floor(totalSec / totalCalls) : 0;

    return {
      total: String(totalCalls),
      connected: String(connected),
      missed: String(missed.length),
      avgDuration: formatTime(avgSec),
    };
  }, [CALLS, missed.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Center"
        subtitle="Professional dialer workspace connected to Twilio Telephony."
        actions={
          <div className="flex overflow-x-auto max-w-full gap-1 rounded-xl bg-white/5 p-1">
            {(['dialer', 'recent', 'favorites'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={cn(
                  'relative shrink-0 rounded-lg px-3 sm:px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                  activeTab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {activeTab === t && <motion.span layoutId="calls-tab" className="absolute inset-0 rounded-lg bg-primary/20 ring-1 ring-primary/30" />}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'dialer' && (
            <Card>
              {!session ? (
                <div className="mx-auto max-w-sm">
                  <div className="mb-6 text-center">
                    <div className="mb-2 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                      <Phone className="h-7 w-7" />
                    </div>
                    <input
                      type="tel"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Enter a number…"
                      className="w-full bg-transparent text-center text-2xl font-light tracking-wider focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Provider: {telephony.name} • Active Workspace
                    </p>
                  </div>

                  {/* Responsive Instant Keypad */}
                  <div className="grid grid-cols-3 gap-3">
                    {KEYPAD.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setNumber((n) => n + key);
                        }}
                        className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 text-xl font-semibold transition-colors hover:bg-white/10 active:bg-white/20 select-none touch-manipulation cursor-pointer border border-white/5"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      title="Backspace (Hold to clear)"
                      onMouseDown={startContinuousDelete}
                      onMouseUp={stopContinuousDelete}
                      onMouseLeave={stopContinuousDelete}
                      onTouchStart={startContinuousDelete}
                      onTouchEnd={stopContinuousDelete}
                      onClick={() => setNumber((n) => n.slice(0, -1))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground active:bg-white/20 transition-colors select-none touch-manipulation cursor-pointer"
                    >
                      <Delete className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={startCall}
                      disabled={!number || isInitiating}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:shadow-primary/50 disabled:opacity-40 select-none touch-manipulation cursor-pointer"
                    >
                      {isInitiating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Phone className="h-6 w-6" />}
                    </button>

                    <button
                      type="button"
                      title="Clear Number"
                      onClick={() => setNumber('')}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground active:bg-white/20 transition-colors select-none touch-manipulation cursor-pointer text-xs font-bold"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-sm text-center">
                  <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-primary/30"
                    />
                    <Avatar name={session.contactName} size={80} ring />
                  </div>
                  <h2 className="text-xl font-medium">{session.contactName}</h2>
                  <p className="text-sm text-muted-foreground">{session.phoneNumber}</p>
                  <p className="mt-2 font-mono text-2xl text-primary">{formatTime(duration)}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Badge variant={session.status === 'on_hold' ? 'yellow' : 'primary'}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">
                    <Bot className="h-3.5 w-3.5" />
                    Twilio Voice Connected
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={cn('flex h-12 w-12 items-center justify-center rounded-full transition-colors', session.muted ? 'bg-red-500/20 text-red-400' : 'bg-white/8 text-foreground hover:bg-white/12')}
                    >
                      {session.muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleHold}
                      className={cn('flex h-12 w-12 items-center justify-center rounded-full transition-colors', session.status === 'on_hold' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/8 text-foreground hover:bg-white/12')}
                    >
                      {session.status === 'on_hold' ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleSpeaker}
                      className={cn('flex h-12 w-12 items-center justify-center rounded-full transition-colors', session.speaker ? 'bg-cyan/20 text-cyan' : 'bg-white/8 text-foreground hover:bg-white/12')}
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTransfer(true)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 text-foreground transition-colors hover:bg-white/12"
                    >
                      <PhoneForwarded className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={endCall}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 transition-all hover:shadow-red-500/50"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'recent' && (
            <Card className="p-0">
              <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search calls…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"
                >
                  {FILTERS.map((f) => (
                    <option key={f} value={f} className="bg-background">{f}</option>
                  ))}
                </select>
              </div>
              <div className="divide-y divide-white/5">
                {recent.map((call) => (
                  <CallRow key={call.id} call={call} onRedial={(n) => { setNumber(n); setActiveTab('dialer'); }} />
                ))}
                {recent.length === 0 && (
                  <div className="p-12"><EmptyState icon={<History className="h-6 w-6" />} title="No calls found" desc="Try adjusting your search or filters." /></div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'favorites' && (
            <Card>
              {FAVORITES.length > 0 ? (
                <div className="space-y-2">
                  {FAVORITES.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-400">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{f.phone} • {f.company}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNumber(f.phone); setActiveTab('dialer'); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Star className="h-6 w-6" />} title="No favorites yet" desc="Star frequent contacts to pin them here for quick dialing." />
              )}
            </Card>
          )}
        </div>

        {/* Right column: stats + segments */}
        <div className="space-y-6">
          <Card title="Call Stats Today">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total Calls" value={stats.total} />
              <Stat label="Avg Duration" value={stats.avgDuration} />
              <Stat label="Connected" value={stats.connected} color="text-primary" />
              <Stat label="Missed" value={stats.missed} color="text-red-400" />
            </div>
          </Card>

          <Card title="Segments">
            <div className="space-y-2">
              {[
                { label: 'Incoming', count: incoming.length, icon: PhoneIncoming, color: 'text-cyan' },
                { label: 'Outgoing', count: outgoing.length, icon: PhoneOutgoing, color: 'text-primary' },
                { label: 'Missed', count: missed.length, icon: PhoneMissed, color: 'text-red-400' },
              ].map((seg) => (
                <button
                  key={seg.label}
                  type="button"
                  onClick={() => { setFilter(seg.label === 'Incoming' ? 'Inbound' : seg.label === 'Outgoing' ? 'Outbound' : 'Missed'); setActiveTab('recent'); }}
                  className="flex w-full items-center justify-between rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <seg.icon className={cn('h-5 w-5', seg.color)} />
                    <span className="text-sm font-medium">{seg.label}</span>
                  </div>
                  <Badge variant="muted">{seg.count}</Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Transfer modal */}
      <AnimatePresence>
        {showTransfer && session && (
          <Modal onClose={() => setShowTransfer(false)} title="Transfer Call">
            <p className="mb-4 text-sm text-muted-foreground">Transfer {session.contactName} to another number or contact.</p>
            <input
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
              placeholder="Number or name…"
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={doTransfer} disabled={!transferTarget}>
                <PhoneForwarded className="h-4 w-4" /> Transfer
              </Button>
              <Button variant="secondary" onClick={() => setShowTransfer(false)}>Cancel</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Post-call summary */}
      <AnimatePresence>
        {showSummary && lastCall && (
          <Modal onClose={() => setShowSummary(false)} title="Call Summary">
            <div className="mb-4 flex items-center justify-between rounded-xl bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <Avatar name={lastCall.name} size={36} />
                <div>
                  <p className="text-sm font-medium">{lastCall.name}</p>
                  <p className="text-xs text-muted-foreground">{lastCall.number}</p>
                </div>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatTime(lastCall.duration)}</p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Disposition</p>
              <div className="flex flex-wrap gap-2">
                {DISPOSITIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDisposition(d)}
                    className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', disposition === d ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-white/5 text-muted-foreground hover:bg-white/10')}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Call Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this call…"
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              />
            </div>
            <label className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} className="rounded border-white/20 bg-white/5" />
              Schedule follow-up
            </label>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={() => setShowSummary(false)}>
                <CheckCircle2 className="h-4 w-4" /> Save & {followUp ? 'Follow-up' : 'Done'}
              </Button>
              <Button variant="secondary" onClick={() => setShowSummary(false)}>Skip</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function CallRow({ call, onRedial }: { call: Call; onRedial: (n: string) => void }) {
  const phone = call.contactPhone || call.phone || '';
  return (
    <div className="flex items-center gap-3 p-3 transition-colors hover:bg-white/5">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        call.direction === 'inbound' ? 'bg-cyan/15 text-cyan' : call.direction === 'missed' ? 'bg-red-500/15 text-red-400' : 'bg-primary/15 text-primary')}>
        {call.direction === 'inbound' ? <PhoneIncoming className="h-5 w-5" /> : call.direction === 'missed' ? <PhoneMissed className="h-5 w-5" /> : <PhoneOutgoing className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{call.contact}</p>
        <p className="truncate text-xs text-muted-foreground">{call.company} • {call.date} {call.time}</p>
      </div>
      <div className="hidden text-right sm:block">
        <Badge variant="muted">{call.disposition || 'Completed'}</Badge>
        <p className="mt-1 text-xs text-muted-foreground">{call.duration}</p>
      </div>
      {call.recordingUrl && (
        <a
          href={call.recordingUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Recording Available"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-primary hover:bg-white/10"
        >
          <Play className="h-4 w-4" />
        </a>
      )}
      {call.isFavorite && <Star className="h-4 w-4 text-yellow-400" />}
      <button
        type="button"
        onClick={() => onRedial(phone)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25"
      >
        <Phone className="h-4 w-4" />
      </button>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-2xl font-semibold', color)}>{value}</p>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl glass-strong p-4 sm:p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">{title}</h2>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </>
  );
}

