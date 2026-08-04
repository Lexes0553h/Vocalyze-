'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Mail,
  MessageCircle, MessageSquare, FileText, Calendar, CheckSquare,
  StickyNote, Paperclip, ChevronDown, Bot, Building2, X, Search,
  Clock, ArrowUpRight,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, EmptyState } from '@/components/crm/crm-ui';
import { useContacts, useCalls, useEmails, useTasks, useWhatsappConversations, useSmsConversations, useActivity, useCalendarEvents, useDocuments, useCustomerNotes } from '@/lib/data/hooks';
import type { Contact } from '@/lib/crm-data';
import { cn } from '@/lib/utils';

type Source = 'call' | 'whatsapp' | 'sms' | 'email' | 'note' | 'meeting' | 'task' | 'document';

interface TimelineEntry {
  id: string;
  source: Source;
  title: string;
  description: string;
  time: string;
  meta?: string;
}

const SOURCE_CONFIG: Record<Source, { icon: typeof Phone; color: string; label: string }> = {
  call: { icon: Phone, color: 'text-primary', label: 'Call' },
  whatsapp: { icon: MessageCircle, color: 'text-green-400', label: 'WhatsApp' },
  sms: { icon: MessageSquare, color: 'text-cyan', label: 'SMS' },
  email: { icon: Mail, color: 'text-cyan', label: 'Email' },
  note: { icon: StickyNote, color: 'text-yellow-400', label: 'Note' },
  meeting: { icon: Calendar, color: 'text-primary', label: 'Meeting' },
  task: { icon: CheckSquare, color: 'text-muted-foreground', label: 'Task' },
  document: { icon: Paperclip, color: 'text-primary', label: 'Document' },
};

const FILTERS: Source[] = ['call', 'whatsapp', 'sms', 'email', 'note', 'meeting', 'task', 'document'];

export default function TimelinePage() {
  const { data: CONTACTS = [] } = useContacts();
  const { data: CALLS = [] } = useCalls();
  const { data: EMAILS = [] } = useEmails();
  const { data: TASKS = [] } = useTasks();
  const { data: WA = [] } = useWhatsappConversations();
  const { data: SMS = [] } = useSmsConversations();
  const { data: EVENTS = [] } = useCalendarEvents();
  const { data: DOCS = [] } = useDocuments();
  const { data: ACTIVITY = [] } = useActivity();

  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<Source>>(new Set(FILTERS));
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const { data: NOTES = [] } = useCustomerNotes(selectedContactId || null);

  useEffect(() => {
    if (!selectedContactId && CONTACTS.length > 0) setSelectedContactId(CONTACTS[0].id);
  }, [selectedContactId, CONTACTS]);
  const selectedContact = CONTACTS.find((c) => c.id === selectedContactId);

  const timeline = useMemo<TimelineEntry[]>(() => {
    if (!selectedContact) return [];
    const name = selectedContact.name.toLowerCase();
    const entries: TimelineEntry[] = [];

    CALLS.forEach((c) => {
      if (c.contact.toLowerCase().includes(name) || c.company.toLowerCase().includes(selectedContact.company.toLowerCase())) {
        entries.push({ id: `call-${c.id}`, source: 'call', title: `${c.direction} call • ${c.duration}`, description: c.disposition || c.notes || 'No notes', time: `${c.date} ${c.time}`, meta: c.agent });
      }
    });

    (WA as unknown as { id: string; name: string; lastMsg: string; time: string; company: string }[]).forEach((c) => {
      if (c.name.toLowerCase().includes(name)) {
        entries.push({ id: `wa-${c.id}`, source: 'whatsapp', title: 'WhatsApp conversation', description: c.lastMsg, time: c.time });
      }
    });

    (SMS as unknown as { id: string; name: string; lastMsg: string; time: string }[]).forEach((c) => {
      if (c.name.toLowerCase().includes(name)) {
        entries.push({ id: `sms-${c.id}`, source: 'sms', title: 'SMS thread', description: c.lastMsg, time: c.time });
      }
    });

    (EMAILS as unknown as { id: string; from: string; subject: string; preview: string; time: string }[]).forEach((e) => {
      if (e.from.toLowerCase().includes(name)) {
        entries.push({ id: `email-${e.id}`, source: 'email', title: e.subject || '(no subject)', description: e.preview, time: e.time });
      }
    });

    TASKS.forEach((t) => {
      if (t.title.toLowerCase().includes(name) || (t.description || '').toLowerCase().includes(name)) {
        entries.push({ id: `task-${t.id}`, source: 'task', title: t.title, description: t.description || '', time: t.dueDate || '', meta: t.status });
      }
    });

    (EVENTS as unknown as { id: string; title: string; time: string; type: string }[]).forEach((e) => {
      if (e.title.toLowerCase().includes(name)) {
        entries.push({ id: `event-${e.id}`, source: 'meeting', title: e.title, description: `${e.type} • ${e.time}`, time: e.time });
      }
    });

    (DOCS as unknown as { id: string; name: string; modified: string; folder: string }[]).forEach((d) => {
      if (d.name.toLowerCase().includes(name) || d.folder.toLowerCase().includes(selectedContact.company.toLowerCase())) {
        entries.push({ id: `doc-${d.id}`, source: 'document', title: d.name, description: d.folder, time: d.modified });
      }
    });

    (NOTES as unknown as { id: string; body: string; time: string }[]).forEach((n) => {
      entries.push({ id: `note-${n.id}`, source: 'note', title: 'Note', description: n.body, time: n.time });
    });

    (ACTIVITY as unknown as { id: string; title: string; desc: string; time: string; source: string | null }[]).forEach((a) => {
      if (a.source && FILTERS.includes(a.source as Source)) {
        entries.push({ id: `act-${a.id}`, source: a.source as Source, title: a.title, description: a.desc, time: a.time });
      }
    });

    return entries.sort((a, b) => (b.time > a.time ? 1 : -1));
  }, [selectedContact, CALLS, WA, SMS, EMAILS, TASKS, EVENTS, DOCS, NOTES, ACTIVITY]);

  const filteredTimeline = timeline.filter((e) => activeFilters.has(e.source));
  const filteredContacts = CONTACTS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()));

  const toggleFilter = (s: Source) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Customer Timeline"
        subtitle="Every interaction with a customer in one chronological view."
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Contact selector */}
        <Card className="p-0">
          <div className="border-b border-white/5 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none" />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-2">
            {filteredContacts.map((c) => (
              <button key={c.id} onClick={() => setSelectedContactId(c.id)} className={cn('flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors', c.id === selectedContactId ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-white/5')}>
                <Avatar src={c.avatar} name={c.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.company}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Timeline */}
        <div className="space-y-6">
          {selectedContact && (
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar src={selectedContact.avatar} name={selectedContact.name} size={56} ring />
                  <div>
                    <h2 className="text-lg font-medium">{selectedContact.name}</h2>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Building2 className="h-3.5 w-3.5" />{selectedContact.company} • {selectedContact.role}</p>
                  </div>
                </div>
                <Button variant="primary" size="md" onClick={() => setShowAddNote(true)}><StickyNote className="h-4 w-4" />Add Note</Button>
              </div>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const cfg = SOURCE_CONFIG[f];
              const Icon = cfg.icon;
              const active = activeFilters.has(f);
              return (
                <button key={f} onClick={() => toggleFilter(f)} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors', active ? cn('bg-white/8 text-foreground') : 'bg-white/3 text-muted-foreground/50')}>
                  <Icon className={cn('h-3.5 w-3.5', active ? cfg.color : '')} />{cfg.label}
                </button>
              );
            })}
          </div>

          {/* Timeline entries */}
          <Card className="p-0">
            {filteredTimeline.length > 0 ? (
              <div className="relative p-6">
                <div className="absolute left-9 top-6 bottom-6 w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent" />
                <div className="space-y-6">
                  {filteredTimeline.map((entry, i) => {
                    const cfg = SOURCE_CONFIG[entry.source];
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className="relative flex gap-4">
                        <div className={cn('relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-background', activeFilters.has(entry.source) ? 'bg-white/8' : 'bg-white/3')}>
                          <Icon className={cn('h-4 w-4', cfg.color)} />
                        </div>
                        <div className="flex-1 rounded-xl bg-white/[0.03] p-4 transition-colors hover:bg-white/5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{entry.title}</p>
                                <Badge variant="muted">{cfg.label}</Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{entry.description}</p>
                              {entry.meta && <p className="mt-1 text-[10px] text-muted-foreground/60">{entry.meta}</p>}
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60"><Clock className="h-3 w-3" />{entry.time}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12"><EmptyState icon={<Clock className="h-6 w-6" />} title="No activity yet" desc="Select a contact to see their unified timeline." /></div>
            )}
          </Card>

          {selectedContact && (
            <Card title="AI Insights">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-primary"><Bot className="h-4 w-4" />AI Lead Score & Insights</p>
                <p className="mt-2 text-sm text-muted-foreground">Connect an AI provider to get lead scoring, sentiment analysis, and engagement insights for this contact. Endpoints ready at <code className="text-xs text-cyan">/api/ai/lead-score</code> and <code className="text-xs text-cyan">/api/ai/insights</code>.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add note modal */}
      <AnimatePresence>
        {showAddNote && selectedContact && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddNote(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">Add Note — {selectedContact.name}</h2>
                  <button onClick={() => setShowAddNote(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="Write a note about this contact…" className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1" disabled={!noteText} onClick={() => { setNoteText(''); setShowAddNote(false); }}>Save Note</Button>
                  <Button variant="secondary" onClick={() => setShowAddNote(false)}>Cancel</Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
