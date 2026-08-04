'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users,
  PhoneCall,
  Mic,
  Radio,
  MessageCircle,
  Mail,
  Send,
  Filter,
  BarChart3,
  FileText,
  Bot,
  Bell,
  ShieldCheck,
  Zap,
  Users2,
  Cloud,
} from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

interface Feature {
  icon: typeof Users;
  title: string;
  desc: string;
  accent?: boolean;
}

const FEATURES: Feature[] = [
  { icon: Users, title: 'Lead Management', desc: 'Capture, segment, and route leads with intelligent scoring and lifecycle tracking.' },
  { icon: PhoneCall, title: 'Smart Auto Dialer', desc: 'Power through call lists with predictive dialing and zero idle time.' },
  { icon: Mic, title: 'Call Recording', desc: 'Every call captured, transcribed, and searchable in seconds.' },
  { icon: Radio, title: 'Live Monitoring', desc: 'Whisper, barge, and listen in on live calls to coach in real time.' },
  { icon: MessageCircle, title: 'WhatsApp', desc: 'Reach leads on WhatsApp with templates, media, and two-way chat.' },
  { icon: Mail, title: 'Email', desc: 'Sequences, tracking, and AI-drafted replies synced to every lead.' },
  { icon: Send, title: 'SMS', desc: 'Bulk and transactional SMS with delivery insights and auto-replies.' },
  { icon: Filter, title: 'Pipeline', desc: 'Drag-and-drop deal stages with revenue forecasting and alerts.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Live dashboards for calls, conversions, and team performance.' },
  { icon: FileText, title: 'Reports', desc: 'Automated, schedulable reports delivered to the right inboxes.' },
  { icon: Bot, title: 'AI Follow Ups', desc: 'AI drafts and schedules follow-ups based on call sentiment.' },
  { icon: Bell, title: 'Reminders', desc: 'Never miss a touchpoint with smart, context-aware reminders.' },
  { icon: ShieldCheck, title: 'Role Permissions', desc: 'Granular, role-based access for every team and workspace.' },
  { icon: Zap, title: 'Automation', desc: 'Trigger workflows on any event — no code required.' },
  { icon: Users2, title: 'Team Collaboration', desc: 'Shared views, notes, mentions, and handoffs across teams.' },
  { icon: Cloud, title: 'Cloud Sync', desc: 'Real-time sync across devices with 99.99% uptime SLA.' },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl glass-card p-6 transition-all duration-500 hover:border-primary/30"
      data-cursor="hover"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all duration-500 group-hover:bg-primary/25 group-hover:ring-primary/40">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-base font-medium text-foreground">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80">Features</span>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            Everything your call center needs,
            <span className="gradient-text"> nothing it doesn&apos;t.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Sixteen purpose-built tools that turn cold calls into closed deals —
            unified in one fast, beautiful workspace.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
