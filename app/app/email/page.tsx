'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Inbox, Send, FileEdit, Trash2, Archive, Star, Paperclip,
  X, Bot, ChevronDown, Tag, Reply, Forward, PenSquare,
} from 'lucide-react';
import { PageHeader, Avatar, Button, Badge, Card, EmptyState } from '@/components/crm/crm-ui';
import { useEmails, useMessageTemplates } from '@/lib/data/hooks';
import type { Email } from '@/lib/data/mappers';
import { cn } from '@/lib/utils';

const FOLDERS = [
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'drafts', label: 'Drafts', icon: FileEdit },
  { key: 'sent', label: 'Sent', icon: Send },
  { key: 'archive', label: 'Archive', icon: Archive },
  { key: 'trash', label: 'Trash', icon: Trash2 },
] as const;

const LABEL_COLORS: Record<string, string> = {
  Important: 'bg-red-500/15 text-red-400',
  Client: 'bg-primary/15 text-primary',
  Internal: 'bg-cyan/15 text-cyan',
  Finance: 'bg-yellow-500/15 text-yellow-400',
};

export default function EmailPage() {
  const { data: EMAILS = [] } = useEmails();
  const { data: dbTemplates = [] } = useMessageTemplates('email');
  const [folder, setFolder] = useState<string>('inbox');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showCompose, setShowCompose] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [labelFilter, setLabelFilter] = useState<string>('All');

  const emails = EMAILS as unknown as Email[];
  const selected = emails.find((e) => e.id === selectedId);

  const folderEmails = useMemo(() => {
    return emails.filter((e) => {
      const mf = e.folder === folder;
      const ms = e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase()) || e.preview.toLowerCase().includes(search.toLowerCase());
      const ml = labelFilter === 'All' || e.labels.includes(labelFilter);
      return mf && ms && ml;
    });
  }, [emails, folder, search, labelFilter]);

  const allLabels = Array.from(new Set(emails.flatMap((e) => e.labels)));
  const unreadCount = emails.filter((e) => e.folder === 'inbox' && e.unread).length;
  const templates = dbTemplates.length > 0 ? dbTemplates.map((t) => ({ title: t.title, body: t.body })) : [
    { title: 'Follow-up', body: 'Hi {name},\n\nI wanted to follow up on our last conversation. Are you available for a quick call this week?\n\nBest regards' },
    { title: 'Proposal', body: 'Hi {name},\n\nPlease find attached the proposal we discussed. I am happy to walk through it whenever convenient.\n\nBest regards' },
    { title: 'Demo Invite', body: 'Hi {name},\n\nHere is the calendar invite for your Vocalyze demo. Looking forward to showing you the platform!\n\nBest' },
  ];

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <PageHeader
        title="Email"
        subtitle={`${unreadCount} unread in inbox`}
        actions={
          <Button variant="primary" size="md" onClick={() => setShowCompose(true)}>
            <PenSquare className="h-4 w-4" /> Compose
          </Button>
        }
      />

      <div className="mt-2 grid flex-1 grid-cols-1 overflow-hidden rounded-2xl glass-card md:grid-cols-[200px_360px_1fr]">
        {/* Folder sidebar */}
        <div className="hidden flex-col border-b border-white/5 p-3 md:flex md:border-b-0 md:border-r">
          {FOLDERS.map((f) => {
            const count = emails.filter((e) => e.folder === f.key).length;
            const unread = f.key === 'inbox' ? unreadCount : 0;
            return (
              <button key={f.key} onClick={() => { setFolder(f.key); setSelectedId(''); }} className={cn('flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors', folder === f.key ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}>
                <span className="flex items-center gap-2.5"><f.icon className="h-4 w-4" />{f.label}</span>
                <span className="text-xs">{unread > 0 ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{unread}</span> : count > 0 ? count : ''}</span>
              </button>
            );
          })}
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Labels</p>
            {allLabels.length > 0 ? allLabels.map((l) => (
              <button key={l} onClick={() => setLabelFilter(labelFilter === l ? 'All' : l)} className={cn('flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors', labelFilter === l ? LABEL_COLORS[l] || 'bg-white/8' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}>
                <Tag className="h-3.5 w-3.5" />{l}
              </button>
            )) : <p className="px-3 text-xs text-muted-foreground/50">No labels yet</p>}
          </div>
        </div>

        {/* Email list */}
        <div className="flex flex-col border-b border-white/5 md:border-b-0 md:border-r">
          <div className="border-b border-white/5 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{folderEmails.length} emails</span>
              {labelFilter !== 'All' && <button onClick={() => setLabelFilter('All')} className="text-xs text-primary">{labelFilter} ✕</button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {folderEmails.map((email) => (
              <button key={email.id} onClick={() => setSelectedId(email.id)} className={cn('flex w-full flex-col gap-1 border-b border-white/5 p-3 text-left transition-colors', email.id === selectedId ? 'bg-primary/10' : 'hover:bg-white/5', email.unread && 'bg-white/[0.02]')}>
                <div className="flex items-center gap-2">
                  <Avatar src={email.avatar} name={email.from} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm', email.unread ? 'font-semibold' : 'font-medium')}>{email.from}</p>
                    <p className="truncate text-xs text-muted-foreground">{email.subject || '(no subject)'}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground/60">{email.time}</span>
                    {email.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                <p className="truncate pl-10 text-xs text-muted-foreground">{email.preview}</p>
                {email.labels.length > 0 && (
                  <div className="flex gap-1 pl-10">
                    {email.labels.map((l) => <span key={l} className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', LABEL_COLORS[l] || 'bg-white/8 text-muted-foreground')}>{l}</span>)}
                  </div>
                )}
              </button>
            ))}
            {folderEmails.length === 0 && <div className="p-12"><EmptyState icon={<Inbox className="h-6 w-6" />} title="No emails" desc="This folder is empty." /></div>}
          </div>
        </div>

        {/* Email detail */}
        <div className="hidden flex-col md:flex">
          {selected ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="border-b border-white/5 p-4">
                <h2 className="text-lg font-medium">{selected.subject || '(no subject)'}</h2>
                <div className="mt-3 flex items-start gap-3">
                  <Avatar src={selected.avatar} name={selected.from} size={40} ring />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{selected.from}</p>
                      <span className="text-xs text-muted-foreground">{selected.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selected.fromEmail}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"><Star className="h-4 w-4" /></button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"><Tag className="h-4 w-4" onClick={() => setShowLabels((s) => !s)} /></button>
                  </div>
                </div>
                {selected.labels.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {selected.labels.map((l) => <Badge key={l} variant="muted">{l}</Badge>)}
                  </div>
                )}
              </div>
              <div className="flex-1 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{selected.preview}</p>
                <div className="mt-6 rounded-xl bg-primary/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Bot className="h-3.5 w-3.5" />AI Email Writer</p>
                  <p className="mt-1 text-xs text-muted-foreground">Connect an AI provider to draft replies. Endpoint ready at <code className="text-cyan">/api/ai/email-writer</code>.</p>
                </div>
                {selected.hasAttachment && selected.attachments.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Paperclip className="h-3.5 w-3.5" />Attachments</p>
                    <div className="space-y-2">
                      {selected.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><FileEdit className="h-5 w-5" /></div>
                          <div className="flex-1"><p className="text-sm font-medium">{att.name}</p><p className="text-xs text-muted-foreground">{att.size} • {att.type}</p></div>
                          <Button size="sm" variant="secondary">Download</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-white/5 p-4">
                <div className="flex gap-2">
                  <Button variant="primary" size="md" onClick={() => setShowCompose(true)}><Reply className="h-4 w-4" />Reply</Button>
                  <Button variant="secondary" size="md"><Forward className="h-4 w-4" />Forward</Button>
                  <Button variant="secondary" size="md" onClick={() => setShowLabels((s) => !s)}><Tag className="h-4 w-4" />Label</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center"><EmptyState icon={<Inbox className="h-6 w-6" />} title="Select an email" desc="Choose a message from the list to read it here." /></div>
          )}
        </div>
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCompose(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-2xl rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">Compose Email</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Button variant="secondary" size="sm" onClick={() => setShowTemplates((s) => !s)}>Templates<ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showTemplates && 'rotate-180')} /></Button>
                      <AnimatePresence>
                        {showTemplates && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-10 z-20 w-56 rounded-xl glass-strong p-2">
                            {templates.map((t) => <button key={t.title} onClick={() => setShowTemplates(false)} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground">{t.title}</button>)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={() => setShowCompose(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  <input placeholder="To: recipient@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  <input placeholder="Subject" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  <textarea rows={8} placeholder="Write your email…" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
                    <div className="ml-auto flex gap-2">
                      <Button variant="secondary" size="md" onClick={() => setShowCompose(false)}><FileEdit className="h-4 w-4" />Save Draft</Button>
                      <Button variant="primary" size="md" onClick={() => setShowCompose(false)}><Send className="h-4 w-4" />Send</Button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-3">
                    <p className="flex items-center gap-1.5 text-xs text-primary"><Bot className="h-3.5 w-3.5" />AI Writer</p>
                    <p className="mt-1 text-xs text-muted-foreground">Generate a polished draft with AI. Connect a provider via <code className="text-cyan">/api/ai/email-writer</code>.</p>
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
