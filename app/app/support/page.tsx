'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, LifeBuoy, ThumbsUp, Plus, ChevronDown, ArrowRight, Globe, CheckCircle2, Send, HelpCircle, Video } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { cn } from '@/lib/utils';

const FAQ_SUPPORT = [
  { q: 'How do I port my existing phone number?', a: 'Go to Settings → Phone Numbers → Port Number. Enter your current carrier details and we handle the rest. Porting typically takes 3-5 business days.' },
  { q: 'Can I customize the dispositions after a call?', a: 'Yes. Navigate to Settings → Call Settings → Dispositions. You can add, edit, or reorder dispositions anytime. Changes apply instantly across your team.' },
  { q: 'How does the AI follow-up work?', a: 'After each recorded call, our AI transcribes the conversation, identifies action items, and drafts a follow-up email or SMS you can review and send with one click.' },
  { q: 'What happens when I hit my call limit?', a: 'You\'ll get a notification at 80% and 100% usage. You can upgrade your plan instantly in Billing, or enable overage billing to keep calling without interruption.' },
  { q: 'How do I add team members?', a: 'Go to Team → Invite Member. Enter their email and assign a role. They\'ll get an invite link valid for 7 days.' },
];

const QUICK_ACTIONS = [
  { icon: FileText, title: 'Documentation', desc: 'Browse guides, API refs & tutorials', color: 'text-primary' },
  { icon: LifeBuoy, title: 'Contact Support', desc: 'Reach our team via chat or email', color: 'text-cyan' },
  { icon: ThumbsUp, title: 'Send Feedback', desc: 'Help us improve Vocalyze', color: 'text-primary' },
];

const RESOURCES = [
  { icon: FileText, label: 'API Docs', href: '#' },
  { icon: Globe, label: 'Status Page', href: '#' },
  { icon: HelpCircle, label: 'Community Forum', href: '#' },
  { icon: Video, label: 'Video Tutorials', href: '#' },
];

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Help & Support" subtitle="We're here to help" />

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer rounded-2xl glass-card p-5 transition hover:border-primary/30"
            >
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20', a.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium">{a.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
              <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground" />
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* FAQ */}
        <Card title="Frequently Asked Questions" delay={0.1}>
          <div className="space-y-2">
            {FAQ_SUPPORT.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white/5">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                >
                  {f.q}
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open === i && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-4 pb-3 text-sm text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact form + resources */}
        <div className="space-y-6">
          <Card title="Contact Support" delay={0.15}>
            {sent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Message sent!</p>
                <p className="mt-1 text-xs text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSent(false)}>Send another</Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-3"
              >
                <input
                  placeholder="Subject"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                />
                <select className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none">
                  <option>Priority: Low</option>
                  <option>Priority: Medium</option>
                  <option>Priority: High</option>
                  <option>Priority: Urgent</option>
                </select>
                <textarea
                  rows={4}
                  placeholder="Describe your issue…"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                />
                <Button variant="primary" className="w-full">
                  <Send className="h-4 w-4" />Submit Ticket
                </Button>
              </form>
            )}
          </Card>

          <Card title="Resources" delay={0.2}>
            <div className="space-y-2">
              {RESOURCES.map((r) => {
                const Icon = r.icon;
                return (
                  <a
                    key={r.label}
                    href={r.href}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm transition hover:bg-white/8"
                  >
                    <Icon className="h-4 w-4 text-cyan" />
                    <span className="flex-1">{r.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
