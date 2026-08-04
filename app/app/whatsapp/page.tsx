'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Paperclip, Pin, MoreVertical, Smile, ChevronDown,
  Check, CheckCheck, Clock, Image as ImageIcon, FileText, Mic,
  Bot, Tag, Zap, X, User, Phone, Building2, Star, Reply,
} from 'lucide-react';
import { PageHeader, Avatar, Badge, Button } from '@/components/crm/crm-ui';
import { useWhatsappConversations, useWhatsappMessages } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string;
  company: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  pinned: boolean;
  online: boolean;
  labels: string[];
  status: 'open' | 'pending' | 'resolved';
  autoReply: boolean;
  lastMsgStatus: 'sent' | 'delivered' | 'read' | null;
}

interface Message {
  id: number | string;
  fromMe: boolean;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read' | null;
  kind: string;
  mediaUrl?: string;
}

const FILTERS = ['All', 'Unread', 'Pinned'] as const;
type ConvFilter = (typeof FILTERS)[number];

const LABEL_COLORS: Record<string, string> = {
  'VIP': 'bg-yellow-500/15 text-yellow-400',
  'Lead': 'bg-primary/15 text-primary',
  'Customer': 'bg-cyan/15 text-cyan',
  'Support': 'bg-red-500/15 text-red-400',
};

const TEMPLATES = [
  'Hi {name}, just following up on our last conversation. Are you available for a quick call this week?',
  'Thanks for your interest in Vocalyze! I have attached the pricing breakdown for your team.',
  'Just checking in — let me know if you have any questions about the proposal. Happy to jump on a call.',
];

const QUICK_REPLIES = ['Yes, sounds good!', 'Let me check and get back to you.', 'Can we schedule a call?', 'Thank you!', 'I will send the details shortly.'];

function StatusTicks({ status }: { status: 'sent' | 'delivered' | 'read' | null }) {
  if (!status) return null;
  if (status === 'sent') return <Check className="h-3 w-3 text-primary-foreground/50" />;
  if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-primary-foreground/50" />;
  return <CheckCheck className="h-3 w-3 text-cyan" />;
}

function ChatMessage({ msg }: { msg: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex', msg.fromMe ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', msg.fromMe ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-white/5 text-foreground')}>
        {msg.kind === 'voice' ? (
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><Mic className="h-4 w-4" /></button>
            <div className="flex h-6 items-end gap-0.5">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-0.5 rounded-full bg-white/40" style={{ height: `${4 + ((i * 7) % 16)}px` }} />)}
            </div>
            <span className="text-xs">{msg.time}</span>
          </div>
        ) : msg.kind === 'image' ? (
          <div>
            <div className="mb-2 h-32 w-48 rounded-lg bg-white/10" />
            <p>{msg.text}</p>
          </div>
        ) : msg.kind === 'document' ? (
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8" />
            <div><p className="text-sm">{msg.text}</p><p className="text-xs opacity-60">PDF · 240 KB</p></div>
          </div>
        ) : (
          <p>{msg.text}</p>
        )}
        <div className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', msg.fromMe ? 'text-primary-foreground/60' : 'text-muted-foreground/60')}>
          <span>{msg.time}</span>
          {msg.fromMe && <StatusTicks status={msg.status} />}
        </div>
      </div>
    </motion.div>
  );
}

export default function WhatsAppPage() {
  const { data: WHATSAPP_CONVERSATIONS = [] } = useWhatsappConversations();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConvFilter>('All');
  const [selectedId, setSelectedId] = useState<string>('');
  const { data: dbMessages = [] } = useWhatsappMessages(selectedId || null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = WHATSAPP_CONVERSATIONS as unknown as Conversation[];
  const messages = (localMessages.length > 0 ? localMessages : (dbMessages as unknown as Message[]));

  useEffect(() => {
    if (!selectedId && conversations.length > 0) setSelectedId(conversations[0].id);
  }, [selectedId, conversations]);

  useEffect(() => { setLocalMessages([]); }, [selectedId]);

  const selected = conversations.find((c) => c.id === selectedId);

  const filteredConversations = useMemo(() => {
    const pinned = conversations.filter((c) => c.pinned);
    const rest = conversations.filter((c) => !c.pinned);
    return [...pinned, ...rest].filter((c) => {
      const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
      const mf = filter === 'All' || (filter === 'Unread' && c.unread > 0) || (filter === 'Pinned' && c.pinned);
      return ms && mf;
    });
  }, [search, filter, conversations]);

  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const otherConversations = filteredConversations.filter((c) => !c.pinned);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selectedId]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setLocalMessages((prev) => [...prev, { id: `local-${Date.now()}`, fromMe: true, text: text.trim(), time: 'Now', status: 'sent', kind: 'text' }]);
    setDraft('');
  };

  const applyTemplate = (tpl: string) => {
    if (!selected) return;
    setDraft(tpl.replace('{name}', selected.name.split(' ')[0]));
    setShowTemplates(false);
  };

  const toggleAutoReply = () => {
    // UI-only toggle; backend wired via API PATCH on conversation
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <PageHeader title="WhatsApp" subtitle={`${totalUnread} unread across ${conversations.length} conversations`} />

      <div className="mt-2 grid flex-1 grid-cols-1 overflow-hidden rounded-2xl glass-card lg:grid-cols-[340px_1fr]">
        {/* Conversation list */}
        <div className="flex flex-col border-b border-white/5 lg:border-b-0 lg:border-r">
          <div className="border-b border-white/5 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="mt-3 flex gap-1 rounded-xl bg-white/5 p-1">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn('relative flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors', filter === f ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {filter === f && <motion.span layoutId="wa-filter" className="absolute inset-0 rounded-lg bg-primary/20 ring-1 ring-primary/30" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  <span className="relative z-10">{f}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {pinnedConversations.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Pinned</p>
                {pinnedConversations.map((c) => <ConversationItem key={c.id} conversation={c} active={c.id === selectedId} onClick={() => setSelectedId(c.id)} />)}
              </div>
            )}
            {otherConversations.length > 0 && (
              <div>
                {pinnedConversations.length > 0 && <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">All Conversations</p>}
                {otherConversations.map((c) => <ConversationItem key={c.id} conversation={c} active={c.id === selectedId} onClick={() => setSelectedId(c.id)} />)}
              </div>
            )}
            {filteredConversations.length === 0 && <div className="px-3 py-10 text-center text-sm text-muted-foreground">No conversations found.</div>}
          </div>
        </div>

        {/* Chat window + profile panel */}
        {selected && (
          <div className="flex">
            <div className="flex flex-1 flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={selected.avatar} name={selected.name} size={40} ring />
                    {selected.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-background" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selected.name}</p>
                      {selected.labels.map((l) => <span key={l} className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', LABEL_COLORS[l] || 'bg-white/8 text-muted-foreground')}>{l}</span>)}
                    </div>
                    <p className="text-xs text-muted-foreground">{selected.online ? 'Online' : `Last seen ${selected.time}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowLabels((s) => !s)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"><Tag className="h-4 w-4" /></button>
                  <button onClick={() => setShowMedia((s) => !s)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"><ImageIcon className="h-4 w-4" /></button>
                  <button onClick={() => setShowProfile((s) => !s)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"><User className="h-4 w-4" /></button>
                  <button className="text-muted-foreground transition-colors hover:text-foreground"><MoreVertical className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Auto-reply banner */}
              {selected.autoReply && (
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 text-xs text-primary">
                  <Bot className="h-3.5 w-3.5" /> Auto-reply is active for this conversation
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/5 p-4">
                <div className="flex items-end gap-2">
                  <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"><Paperclip className="h-5 w-5" /></button>
                  <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"><Mic className="h-5 w-5" /></button>
                  <div className="relative">
                    <Button variant="secondary" size="md" onClick={() => setShowTemplates((s) => !s)} className="flex-shrink-0">Templates<ChevronDown className={cn('h-4 w-4 transition-transform', showTemplates && 'rotate-180')} /></Button>
                    <AnimatePresence>
                      {showTemplates && (
                        <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.2 }} className="absolute bottom-12 left-0 z-20 w-72 rounded-xl glass-strong p-2">
                          {TEMPLATES.map((tpl, i) => <button key={i} onClick={() => applyTemplate(tpl)} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">{tpl.length > 60 ? `${tpl.slice(0, 60)}…` : tpl}</button>)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <Button variant="secondary" size="md" onClick={() => setShowQuickReplies((s) => !s)} className="flex-shrink-0"><Reply className="h-4 w-4" /></Button>
                    <AnimatePresence>
                      {showQuickReplies && (
                        <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.2 }} className="absolute bottom-12 left-0 z-20 w-56 rounded-xl glass-strong p-2">
                          {QUICK_REPLIES.map((qr, i) => <button key={i} onClick={() => { sendMessage(qr); setShowQuickReplies(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">{qr}</button>)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex-1">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(draft)} placeholder="Type a message…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-4 pr-12 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button onClick={() => sendMessage(draft)} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"><Send className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile panel */}
            <AnimatePresence>
              {showProfile && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden flex-col border-l border-white/5 lg:flex">
                  <div className="flex items-center justify-between border-b border-white/5 p-4">
                    <p className="text-sm font-medium">Contact Info</p>
                    <button onClick={() => setShowProfile(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6 flex flex-col items-center">
                      <Avatar src={selected.avatar} name={selected.name} size={80} ring />
                      <p className="mt-3 text-base font-medium">{selected.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.company}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="secondary"><Phone className="h-3.5 w-3.5" />Call</Button>
                        <Button size="sm" variant="secondary"><Star className="h-3.5 w-3.5" />Pin</Button>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company" value={selected.company} />
                      <InfoRow icon={<Tag className="h-4 w-4" />} label="Labels" value={selected.labels.join(', ') || 'None'} />
                      <InfoRow icon={<Clock className="h-4 w-4" />} label="Status" value={selected.status} />
                    </div>
                    <div className="mt-6">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Auto Reply</p>
                      <button onClick={toggleAutoReply} className={cn('flex w-full items-center justify-between rounded-xl p-3 transition-colors', selected.autoReply ? 'bg-primary/15' : 'bg-white/5')}>
                        <span className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4 text-primary" />Enabled</span>
                        <span className={cn('h-5 w-9 rounded-full transition-colors', selected.autoReply ? 'bg-primary' : 'bg-white/15')}>
                          <span className={cn('block h-4 w-4 rounded-full bg-white transition-transform', selected.autoReply ? 'translate-x-4' : 'translate-x-0.5')} style={{ marginTop: '2px' }} />
                        </span>
                      </button>
                    </div>
                    <div className="mt-6 rounded-xl bg-primary/5 p-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Bot className="h-3.5 w-3.5" />AI Reply</p>
                      <p className="mt-1 text-xs text-muted-foreground">Connect an AI provider to auto-suggest replies. Endpoint ready at <code className="text-cyan">/api/ai/whatsapp-reply</code>.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Media gallery */}
            <AnimatePresence>
              {showMedia && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden flex-col border-l border-white/5 lg:flex">
                  <div className="flex items-center justify-between border-b border-white/5 p-4">
                    <p className="text-sm font-medium">Media & Files</p>
                    <button onClick={() => setShowMedia(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-cyan/10" />)}
                    </div>
                    <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Documents</p>
                    <div className="space-y-2">
                      {['Proposal.pdf', 'Contract.pdf', 'Pricing.xlsx'].map((d) => (
                        <div key={d} className="flex items-center gap-2 rounded-lg bg-white/5 p-2"><FileText className="h-4 w-4 text-primary" /><span className="text-xs">{d}</span></div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Labels panel */}
            <AnimatePresence>
              {showLabels && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden flex-col border-l border-white/5 lg:flex">
                  <div className="flex items-center justify-between border-b border-white/5 p-4">
                    <p className="text-sm font-medium">Labels</p>
                    <button onClick={() => setShowLabels(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {Object.keys(LABEL_COLORS).map((label) => (
                        <button key={label} className={cn('flex w-full items-center gap-2 rounded-lg p-2.5 text-sm transition-colors', selected.labels.includes(label) ? LABEL_COLORS[label] : 'bg-white/5 hover:bg-white/10')}>
                          <Tag className="h-4 w-4" />{label}
                          {selected.labels.includes(label) && <Check className="ml-auto h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({ conversation, active, onClick }: { conversation: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors', active ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-white/5')}>
      <div className="relative flex-shrink-0">
        <Avatar src={conversation.avatar} name={conversation.name} size={44} />
        {conversation.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-background" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">{conversation.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}<p className="truncate text-sm font-medium">{conversation.name}</p></div>
          <span className="flex-shrink-0 text-[10px] text-muted-foreground/60">{conversation.time}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{conversation.lastMsg}</p>
      </div>
      {conversation.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-400 px-1.5 text-[10px] font-semibold text-background">{conversation.unread}</span>}
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm">{value}</p></div>
    </div>
  );
}
