'use client';

import { motion } from 'framer-motion';
import { UserPlus, PhoneCall, Bot, TrendingUp } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

const STEPS = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Import your leads',
    desc: 'CSV upload, CRM sync, or API. Vocalyze cleans, dedupes, and scores every lead automatically.',
  },
  {
    icon: PhoneCall,
    step: '02',
    title: 'Start calling',
    desc: 'The smart dialer queues your list, skips busy signals, and logs every call with one click.',
  },
  {
    icon: Bot,
    step: '03',
    title: 'Let AI do the busywork',
    desc: 'Transcripts, summaries, sentiment, and follow-up drafts are generated instantly after each call.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Close more deals',
    desc: 'Track pipeline, automate reminders, and watch your conversion climb with live analytics.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden border-y border-white/5 bg-bg-secondary/40 py-28">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-20 max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80">How It Works</span>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            From signup to first call in
            <span className="gradient-text"> under five minutes.</span>
          </h2>
        </Reveal>

        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.step} delay={i * 0.12}>
                <div className="group relative flex flex-col items-center text-center">
                  <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl glass-card transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/25">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-lg">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-medium">{s.title}</h3>
                  <p className="max-w-xs text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
