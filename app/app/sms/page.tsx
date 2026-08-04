'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Paperclip, MoreVertical, ChevronDown, Phone,
  CheckCheck, Check, Clock, AlertCircle, Users, X, Bot, ListFilter,
} from 'lucide-react';
import { PageHeader, Avatar, Button, Badge, Card } from '@/components/crm/crm-ui';
import { useSmsConversations, useSmsMessages, useMessageTemplates } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

interface SmsConversation {
  id: string;
  name: string;
  company: string;
  phone: string;
  lastMsg: string;
  time: string;
  unread: number;
  labels: string[];
  status: 'open' | 'pending' | 'resolved';
  pinned: boolean;
}

interface SmsMessage {
  id: number | string;
  fromMe: boolean;
  text: string;
  time: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | null;
  kind: string;
}

const FILTERS = ['All', 'Unread', 'Open', 'Pending'] as const;
type SmsFilter = (typeof FILTERS)[number];

function DeliveryIcon({ status }: { status: SmsMessage['status'] }) {
  if (!status) return null;
  if (status === 'queued') return <Clock className="h-3 w-3 text-yellow-400" />;
  if (status === 'sent') return <Check className="h-3 w-3 text-primary-foreground/50" />;
  if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-cyan" />;
  if (status === 'failed') return <AlertCircle className="h-3 w-3 text-red-400" />;
  return null;
}

function Bubble({ msg }: { msg: SmsMessage }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={cn('flex', msg.fromMe ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', msg.fromMe ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-white/5 text-foreground')}>
        <p>{msg.text}</p>
        <div className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', msg.fromMe ? 'text-primary-foreground/60' : 'text-muted-foreground/60')}>
          <span>{msg.time}</span>
          {msg.fromMe && <DeliveryIcon status={msg.status} />}
        </div>
      </div>
    </motion.div>
  );
}

export default function SmsPage() {
  const { data: SMS_CONVERSATIONS = [] } = useSmsConversations();
  const { data: dbTemplates = [] } = useMessageTemplates('sms');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SmsFilter>('All');
  const [selectedId, setSelectedId] = useState<string>('');
  const { data: dbMessages = [] } = useSmsMessages(selectedId || null);
  const [localMessages, setLocalMessages] = useState<SmsMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkRecipients, setBulkRecipients] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = SMS_CONVERSATIONS as unknown as SmsConversation[];
  const messages = localMessages.length > 0 ? localMessages : (dbMessages as unknown as SmsMessage[]);

  useEffect(() => { if (!selectedId && conversations.length > 0) setSelectedId(conversations[0].id); }, [selectedId, conversations]);
  useEffect(() => { setLocalMessages([]); }, [selectedId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selectedId]);

  const selected = conversations.find((c) => c.id === selectedId);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const mf = filter === 'All' || (filter === 'Unread' && c.unread > 0) || (filter === 'Open' && c.status === 'open') || (filter === 'Pending' && c.status === 'pending');
      return ms && mf;
    });
  }, [search, filter, conversations]);

  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const templates = dbTemplates.length > 0 ? dbTemplates.map((t) => t.body) : [
    'Hi {name}, this is Sarah from Vocalyze. Following up — do you have 10 minutes this week?',
    'Your demo is confirmed! We will send a calendar invite shortly. Reply STOP to opt out.',
    'Quick reminder: your proposal expires in 3 days. Let me know if you need an extension.',
  ];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setLocalMessages((prev) => [...prev, { id: `local-${Date.now()}`, fromMe: true, text: text.trim(), time: 'Now', status: 'sent', kind: 'text' }]);
    setDraft('');
  };

  const applyTemplate = (tpl: string) => { if (!selected) return; setDraft(tpl.replace('{name}', selected.name.split(' ')[0])); setShowTemplates(false); };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <PageHeader
        title="SMS"
        subtitle={`${totalUnread} unread • ${conversations.length} threads`}
        actions={
          <Button variant="primary" size="md" onClick={() => setShowBulk(true)}>
            <Users className="h-4 w-4" /> Bulk SMS
          </Button>
        }
      />

      <div className="mt-2 grid flex-1 grid-cols-1 overflow-hidden rounded-2xl glass-card lg:grid-cols-[340px_1fr]">
        {/* Conversation list */}
        <div className="flex flex-col border-b border-white/5 lg:border-b-0 lg:border-r">
          <div className="border-b border-white/5 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or number…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="mt-3 flex gap-1 rounded-xl bg-white/5 p-1">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn('relative flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors', filter === f ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {filter === f && <motion.span layoutId="sms-filter" className="absolute inset-0 rounded-lg bg-primary/20 ring-1 ring-primary/30" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  <span className="relative z-10">{f}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredConversations.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className={cn('flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors', c.id === selectedId ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-white/5')}>
                <Avatar name={c.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <span className="flex-shrink-0 text-[10px] text-muted-foreground/60">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-400 px-1.5 text-[10px] font-semibold text-background">{c.unread}</span>}
              </button>
            ))}
            {filteredConversations.length === 0 && <div className="px-3 py-10 text-center text-sm text-muted-foreground">No threads found.</div>}
          </div>
        </div>

        {/* Thread view */}
        {selected && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.name} size={40} ring />
                <div>
                  <p className="font-medium">{selected.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{selected.phone}</p>
                </div>
              </div>
              <Badge variant={selected.status === 'open' ? 'green' : selected.status === 'pending' ? 'yellow' : 'muted'}>{selected.status}</Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/5 p-4">
              <div className="flex items-end gap-2">
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"><Paperclip className="h-5 w-5" /></button>
                <div className="relative">
                  <Button variant="secondary" size="md" onClick={() => setShowTemplates((s) => !s)} className="flex-shrink-0">Templates<ChevronDown className={cn('h-4 w-4 transition-transform', showTemplates && 'rotate-180')} /></Button>
                  <AnimatePresence>
                    {showTemplates && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.2 }} className="absolute bottom-12 left-0 z-20 w-72 rounded-xl glass-strong p-2">
                        {templates.map((tpl, i) => <button key={i} onClick={() => applyTemplate(tpl)} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">{tpl.length > 60 ? `${tpl.slice(0, 60)}…` : tpl}</button>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative flex-1">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(draft)} placeholder="Type a text message…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-4 pr-12 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button onClick={() => sendMessage(draft)} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"><Send className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk SMS modal */}
      <AnimatePresence>
        {showBulk && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulk(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">Bulk SMS</h2>
                    <p className="text-xs text-muted-foreground">Send a message to multiple recipients at once.</p>
                  </div>
                  <button onClick={() => setShowBulk(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Recipients (comma-separated numbers or a label)</p>
                    <input value={bulkRecipients} onChange={(e) => setBulkRecipients(e.target.value)} placeholder="+1 555-0100, +1 555-0101, or label:VIP" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Message</p>
                    <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={4} placeholder="Type your bulk message…" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                    <p className="mt-1 text-xs text-muted-foreground">{bulkText.length}/160 characters • {bulkRecipients.split(',').filter(Boolean).length} recipients</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-medium text-primary"><Bot className="h-3.5 w-3.5" />Delivery Architecture</p>
                    <p className="mt-1">Messages are queued with status tracking (queued → sent → delivered → failed). Connect an SMS gateway provider to enable real delivery. The bulk endpoint is ready.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" disabled={!bulkText || !bulkRecipients}><Send className="h-4 w-4" /> Queue Bulk Send</Button>
                    <Button variant="secondary" onClick={() => setShowBulk(false)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
