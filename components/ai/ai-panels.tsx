'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Sparkles, RefreshCw, Copy, Check, ThumbsUp, ThumbsDown,
  Phone, Smile, Frown, Meh, TrendingUp, Target, Zap, AlertCircle,
  CheckCircle2, Clock, Mail, MessageCircle, MessageSquare, Send,
  Lightbulb, ChevronDown, Star,
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '@/components/crm/crm-ui';
import { useAiRequest } from '@/lib/data/ai-hooks';
import { cn } from '@/lib/utils';

// ============================================================
// AI Call Summary Panel
// ============================================================

interface CallSummaryData {
  summary: string;
  keyDiscussion: string[];
  sentiment: string;
  sentimentScore: number;
  objections: string[];
  nextActions: string[];
  followUpReminder: string;
  riskLevel: string;
  importantKeywords: string[];
  callScore: number;
  agentPerformance: { rating: string; talkRatio: number; questionCount: number; objectionHandling: string; notes: string };
}

export function AiCallSummaryPanel({ contactName }: { contactName?: string }) {
  const { request, loading } = useAiRequest();
  const [data, setData] = useState<CallSummaryData | null>(null);
  const [copied, setCopied] = useState(false);

  const analyze = () => request('call-summary', 'Analyze this call', { contactName }).then((res) => res?.structured && setData(res.structured as CallSummaryData));

  useEffect(() => { analyze(); }, []);

  const copySummary = () => { if (data) { navigator.clipboard.writeText(data.summary); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  if (loading && !data) return <div className="h-48 animate-pulse rounded-xl bg-white/5" />;

  return (
    <div className="space-y-4">
      <Card title="AI Call Summary" action={<Button size="sm" variant="ghost" onClick={analyze} disabled={loading}><RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /></Button>}>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Bot className="h-4 w-4" /></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{data?.summary}</p>
            <button onClick={copySummary} className="mt-2 flex items-center gap-1 text-xs text-primary"><Copy className="h-3 w-3" />{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        </div>
      </Card>

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Key Discussion Points">
            <ul className="space-y-2">
              {data.keyDiscussion.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />{p}</li>)}
            </ul>
          </Card>

          <Card title="Objections">
            <ul className="space-y-2">
              {data.objections.map((o, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-400" />{o}</li>)}
            </ul>
          </Card>

          <Card title="Next Actions">
            <ul className="space-y-2">
              {data.nextActions.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />{a}</li>)}
            </ul>
          </Card>

          <Card title="Important Keywords">
            <div className="flex flex-wrap gap-2">
              {data.importantKeywords.map((k) => <Badge key={k} variant="muted">{k}</Badge>)}
            </div>
          </Card>
        </div>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><ScoreCard label="Call Score" value={data.callScore} max={10} icon={<Star className="h-4 w-4" />} /></Card>
          <Card><ScoreCard label="Sentiment" value={data.sentimentScore} max={100} icon={<Smile className="h-4 w-4" />} suffix="%" sentiment={data.sentiment} /></Card>
          <Card>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><p className="text-xs font-medium">Follow-up Reminder</p></div>
            <p className="mt-2 text-sm">{data.followUpReminder ? new Date(data.followUpReminder).toLocaleString() : 'Not scheduled'}</p>
            <Badge variant={data.riskLevel === 'low' ? 'green' : data.riskLevel === 'medium' ? 'yellow' : 'red'} className="mt-3">Risk: {data.riskLevel}</Badge>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AI Sentiment Analysis Panel
// ============================================================

export function AiSentimentPanel({ contactName }: { contactName?: string }) {
  const { request, loading } = useAiRequest();
  const [data, setData] = useState<{
    overall: string; score: number; confidence: number;
    emotionTimeline: { time: string; emotion: string; score: number }[];
    moodIndicator: string; breakdown: { positive: number; neutral: number; negative: number };
    keyEmotions: string[];
  } | null>(null);

  useEffect(() => { request('sentiment', 'Analyze sentiment', { contactName }).then((res) => res?.structured && setData(res.structured as typeof data)); }, []);

  if (loading && !data) return <div className="h-48 animate-pulse rounded-xl bg-white/5" />;

  const sentimentIcon = data?.overall === 'positive' ? <Smile className="h-5 w-5 text-green-400" /> : data?.overall === 'negative' ? <Frown className="h-5 w-5 text-red-400" /> : <Meh className="h-5 w-5 text-yellow-400" />;

  return (
    <div className="space-y-4">
      <Card title="Sentiment Analysis">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">{sentimentIcon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium capitalize">{data?.overall ?? '—'}</p>
              <Badge variant="muted">Confidence: {data ? Math.round(data.confidence * 100) : 0}%</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Mood: {data?.moodIndicator ?? '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">{data?.score ?? 0}<span className="text-sm text-muted-foreground">/100</span></p>
          </div>
        </div>
        {data && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-green-400">Positive {data.breakdown.positive}%</span><span className="text-muted-foreground">Neutral {data.breakdown.neutral}%</span><span className="text-red-400">Negative {data.breakdown.negative}%</span></div>
            <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
              <div className="bg-green-400" style={{ width: `${data.breakdown.positive}%` }} />
              <div className="bg-muted-foreground/40" style={{ width: `${data.breakdown.neutral}%` }} />
              <div className="bg-red-400" style={{ width: `${data.breakdown.negative}%` }} />
            </div>
          </div>
        )}
      </Card>

      {data && (
        <Card title="Emotion Timeline">
          <div className="flex h-32 items-end gap-1">
            {data.emotionTimeline.map((e, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${e.score}%` }} transition={{ delay: i * 0.08, duration: 0.5 }} className="group relative flex flex-1 flex-col items-center">
                <div className={cn('w-full rounded-t', e.score > 70 ? 'bg-green-400/60' : e.score > 50 ? 'bg-primary/60' : e.score > 30 ? 'bg-yellow-400/60' : 'bg-red-400/60')} style={{ height: '100%' }} />
                <span className="mt-1 text-[8px] text-muted-foreground/60">{e.time}</span>
                <span className="absolute -top-6 hidden whitespace-nowrap rounded bg-background px-1.5 py-0.5 text-[10px] group-hover:block">{e.emotion} ({e.score})</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.keyEmotions.map((e) => <Badge key={e} variant="muted">{e}</Badge>)}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// AI Lead Scoring Panel
// ============================================================

export function AiLeadScoringPanel({ leadName }: { leadName?: string }) {
  const { request, loading } = useAiRequest();
  const [data, setData] = useState<{
    score: number; tier: string; buyingIntent: string; intentSignals: string[];
    priority: string; bestContactTime: string; recommendedAction: string; conversionProb: number;
  } | null>(null);

  useEffect(() => { request('lead-score', 'Score this lead', { leadName }).then((res) => res?.structured && setData(res.structured as typeof data)); }, []);

  if (loading && !data) return <div className="h-48 animate-pulse rounded-xl bg-white/5" />;

  const tierColor = data?.tier === 'hot' ? 'red' : data?.tier === 'warm' ? 'yellow' : 'muted';
  const tierIcon = data?.tier === 'hot' ? <Zap className="h-4 w-4" /> : data?.tier === 'warm' ? <TrendingUp className="h-4 w-4" /> : <Meh className="h-4 w-4" />;

  return (
    <Card title="AI Lead Score">
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
            <motion.circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-primary" initial={{ strokeDasharray: '0 214' }} animate={{ strokeDasharray: `${(data?.score ?? 0) * 2.14} 214` }} transition={{ duration: 1 }} />
          </svg>
          <span className="text-2xl font-semibold">{data?.score ?? 0}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={tierColor as 'red' | 'yellow' | 'muted'}>{tierIcon}{data?.tier ?? '—'}</Badge>
            <Badge variant="primary">Intent: {data?.buyingIntent ?? '—'}</Badge>
            <Badge variant={data?.priority === 'high' ? 'red' : data?.priority === 'medium' ? 'primary' : 'muted'}>Priority: {data?.priority ?? '—'}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{data?.recommendedAction ?? 'Analyzing lead…'}</p>
          <p className="mt-1 text-xs text-muted-foreground">Best time to contact: {data?.bestContactTime ?? '—'}</p>
        </div>
      </div>

      {data && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Buying Intent Signals</p>
          <ul className="space-y-1.5">
            {data.intentSignals.map((s, i) => <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><Target className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />{s}</li>)}
          </ul>
        </div>
      )}

      {data && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Conversion Probability</span><span className="font-medium text-primary">{Math.round(data.conversionProb * 100)}%</span></div>
          <ProgressBar value={data.conversionProb * 100} className="mt-2" />
        </div>
      )}
    </Card>
  );
}

// ============================================================
// AI Follow-up Generator Panel
// ============================================================

const FOLLOWUP_TONES = [
  { id: 'professional', label: 'Professional', icon: Mail },
  { id: 'friendly', label: 'Friendly', icon: Smile },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
];

export function AiFollowupGeneratorPanel({ contactName }: { contactName?: string }) {
  const { request, loading } = useAiRequest();
  const [tone, setTone] = useState('professional');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => request('follow-up', `Generate a ${tone} follow-up`, { contactName, tone }).then((res) => res?.content && setOutput(res.content));

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Card title="AI Follow-up Generator">
      <div className="mb-3 flex flex-wrap gap-2">
        {FOLLOWUP_TONES.map((t) => (
          <button key={t.id} onClick={() => setTone(t.id)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', tone === t.id ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-white/5 text-muted-foreground hover:bg-white/10')}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>
      <Button variant="primary" size="sm" onClick={generate} disabled={loading} className="mb-3"><Sparkles className="h-3.5 w-3.5" />{loading ? 'Generating…' : 'Generate Follow-up'}</Button>
      {output && (
        <div className="relative rounded-xl bg-white/5 p-4">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{output}</pre>
          <button onClick={copy} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground">{copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}</button>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// AI Email Writer Panel
// ============================================================

const EMAIL_TYPES = [
  { id: 'sales', label: 'Sales Email' },
  { id: 'follow-up', label: 'Follow-up' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'meeting', label: 'Meeting Invite' },
];
const EMAIL_TONES = ['Professional', 'Friendly', 'Urgent', 'Casual'];
const EMAIL_LENGTHS = ['Short', 'Medium', 'Long'];

export function AiEmailWriterPanel({ recipientName }: { recipientName?: string }) {
  const { request, loading } = useAiRequest();
  const [emailType, setEmailType] = useState('sales');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => request('email-writer', `Write a ${tone.toLowerCase()} ${emailType} email`, { emailType, recipientName, tone: tone.toLowerCase(), length: length.toLowerCase() }).then((res) => res?.content && setOutput(res.content));
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Card title="AI Email Writer">
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Type</p>
          <select value={emailType} onChange={(e) => setEmailType(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs focus:border-primary/50 focus:outline-none">
            {EMAIL_TYPES.map((t) => <option key={t.id} value={t.id} className="bg-background">{t.label}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Tone</p>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs focus:border-primary/50 focus:outline-none">
            {EMAIL_TONES.map((t) => <option key={t} value={t} className="bg-background">{t}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Length</p>
          <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs focus:border-primary/50 focus:outline-none">
            {EMAIL_LENGTHS.map((l) => <option key={l} value={l} className="bg-background">{l}</option>)}
          </select>
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={generate} disabled={loading} className="mb-3"><Sparkles className="h-3.5 w-3.5" />{loading ? 'Writing…' : 'Generate Email'}</Button>
      {output && (
        <div className="relative rounded-xl bg-white/5 p-4">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{output}</pre>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={copy}>{copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}Copy</Button>
            <Button size="sm" variant="secondary"><Send className="h-3.5 w-3.5" />Send</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// AI WhatsApp/SMS Reply Panel
// ============================================================

const REPLY_TYPES = [
  { id: 'quick', label: 'Quick Reply', icon: Zap },
  { id: 'auto', label: 'Auto Reply', icon: Bot },
  { id: 'sales', label: 'Sales Reply', icon: TrendingUp },
  { id: 'support', label: 'Support Reply', icon: AlertCircle },
];

export function AiMessageReplyPanel({ channel }: { channel: 'whatsapp' | 'sms' }) {
  const { request, loading } = useAiRequest();
  const [replyType, setReplyType] = useState('quick');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const feature = channel === 'whatsapp' ? 'whatsapp-reply' : 'sms-writer';
  const generate = () => request(feature, `Generate a ${replyType} ${channel} reply`, { replyType }).then((res) => res?.content && setOutput(res.content));
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Card title={`AI ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} Assistant`}>
      <div className="mb-3 flex flex-wrap gap-2">
        {REPLY_TYPES.map((t) => (
          <button key={t.id} onClick={() => setReplyType(t.id)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', replyType === t.id ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-white/5 text-muted-foreground hover:bg-white/10')}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>
      <Button variant="primary" size="sm" onClick={generate} disabled={loading} className="mb-3"><Sparkles className="h-3.5 w-3.5" />{loading ? 'Generating…' : 'Generate Reply'}</Button>
      {output && (
        <div className="relative rounded-xl bg-white/5 p-4">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{output}</pre>
          <button onClick={copy} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground">{copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}</button>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// AI Task Assistant Panel
// ============================================================

export function AiTaskAssistantPanel() {
  const { request, loading } = useAiRequest();
  const [data, setData] = useState<{
    priorities: { task: string; priority: string; reason: string }[];
    importantLeads: string[];
    missedFollowUps: { lead: string; overdue: string; impact: string }[];
    urgentCalls: { contact: string; reason: string }[];
    pendingTasks: number; completedToday: number;
  } | null>(null);

  useEffect(() => { request('task-assistant', "What should I focus on today?").then((res) => res?.structured && setData(res.structured as typeof data)); }, []);

  if (loading && !data) return <div className="h-48 animate-pulse rounded-xl bg-white/5" />;

  return (
    <div className="space-y-4">
      <Card title="AI Task Assistant" action={<Badge variant="primary"><Bot className="h-3 w-3" />Smart Priorities</Badge>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-semibold">{data?.pendingTasks ?? 0}</p><p className="text-xs text-muted-foreground">Pending Tasks</p></div>
          <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-semibold text-green-400">{data?.completedToday ?? 0}</p><p className="text-xs text-muted-foreground">Completed Today</p></div>
        </div>
      </Card>

      {data?.priorities && (
        <Card title="Today's Priorities">
          <div className="space-y-2">
            {data.priorities.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
                <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', p.priority === 'urgent' ? 'bg-red-500/15 text-red-400' : p.priority === 'high' ? 'bg-primary/15 text-primary' : 'bg-yellow-500/15 text-yellow-400')}>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium">{p.task}</p><Badge variant={p.priority === 'urgent' ? 'red' : p.priority === 'high' ? 'primary' : 'yellow'}>{p.priority}</Badge></div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.missedFollowUps && data.missedFollowUps.length > 0 && (
          <Card title="Missed Follow-ups">
            <div className="space-y-2">
              {data.missedFollowUps.map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                  <div className="flex-1"><p className="text-sm font-medium">{f.lead}</p><p className="text-xs text-muted-foreground">Overdue: {f.overdue} • Impact: {f.impact}</p></div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {data?.urgentCalls && data.urgentCalls.length > 0 && (
          <Card title="Urgent Calls">
            <div className="space-y-2">
              {data.urgentCalls.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-red-400" />
                  <div className="flex-1"><p className="text-sm font-medium">{c.contact}</p><p className="text-xs text-muted-foreground">{c.reason}</p></div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// AI Sales Coach Panel
// ============================================================

export function AiSalesCoachPanel() {
  const { request, loading } = useAiRequest();
  const [data, setData] = useState<{
    performanceScore: number; conversionRate: number; avgTalkTime: string;
    strengths: string[]; weaknesses: string[]; improvementSuggestions: string[];
    dailyTips: string[]; weeklyProgress: { calls: number; deals: number; revenue: number };
  } | null>(null);

  useEffect(() => { request('sales-coach', 'Analyze my sales performance').then((res) => res?.structured && setData(res.structured as typeof data)); }, []);

  if (loading && !data) return <div className="h-48 animate-pulse rounded-xl bg-white/5" />;

  return (
    <div className="space-y-4">
      <Card title="AI Sales Coach">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-semibold">{data?.performanceScore ?? 0}</p><p className="text-xs text-muted-foreground">Performance Score</p></div>
          <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-semibold text-primary">{data?.conversionRate ?? 0}%</p><p className="text-xs text-muted-foreground">Conversion Rate</p></div>
          <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-semibold">{data?.avgTalkTime ?? '—'}</p><p className="text-xs text-muted-foreground">Avg Talk Time</p></div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Strengths">
          <ul className="space-y-2">
            {data?.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />{s}</li>)}
          </ul>
        </Card>
        <Card title="Areas for Improvement">
          <ul className="space-y-2">
            {data?.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-400" />{w}</li>)}
          </ul>
        </Card>
      </div>

      {data?.improvementSuggestions && (
        <Card title="Improvement Suggestions">
          <ul className="space-y-2">
            {data.improvementSuggestions.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><TrendingUp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />{s}</li>)}
          </ul>
        </Card>
      )}

      {data?.dailyTips && (
        <Card title="Daily Coaching Tips">
          <div className="grid gap-3 sm:grid-cols-3">
            {data.dailyTips.map((t, i) => (
              <div key={i} className="rounded-xl bg-primary/5 p-3">
                <Lightbulb className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">{t}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Helper: Score Card
// ============================================================

function ScoreCard({ label, value, max, icon, suffix, sentiment }: { label: string; value: number; max: number; icon: React.ReactNode; suffix?: string; sentiment?: string }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex items-center gap-2">{icon}<p className="text-xs font-medium">{label}</p></div>
      <p className="mt-2 text-2xl font-semibold">{value}{suffix}</p>
      <ProgressBar value={pct} className="mt-2" />
      {sentiment && <p className="mt-2 text-xs capitalize text-muted-foreground">{sentiment}</p>}
    </div>
  );
}
