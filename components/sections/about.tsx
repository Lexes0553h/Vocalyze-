'use client';

import { motion } from 'framer-motion';
import { Target, Heart, Rocket, Eye } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

const VALUES = [
  { icon: Target, title: 'Mission', desc: 'Make every conversation count. We turn the chaos of calling into a calm, data-driven engine for growth.' },
  { icon: Eye, title: 'Vision', desc: 'A world where no lead is forgotten, no follow-up missed, and every rep performs like your best rep.' },
  { icon: Heart, title: 'Values', desc: 'Craft over speed. Honesty over hype. Customers over features. We sweat the details so you don\'t have to.' },
  { icon: Rocket, title: 'Trajectory', desc: 'From a 3-person team in 2021 to 4,000+ customers across 40 countries — and we\'re just getting started.' },
];

const STATS = [
  { value: '4,000+', label: 'Customers' },
  { value: '120M+', label: 'Calls logged' },
  { value: '$2.4B', label: 'Pipeline managed' },
  { value: '40', label: 'Countries' },
];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden border-y border-white/5 bg-bg-secondary/40 py-28">
      <div className="absolute inset-0 mesh-emerald opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="text-xs uppercase tracking-[0.3em] text-primary/80">About</span>
              <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
                We&apos;re building the
                <span className="gradient-text"> operating system for voice-led sales.</span>
              </h2>
              <p className="mt-6 text-muted-foreground">
                Vocalyze started in a cramped apartment with one belief: the phone
                is still the highest-leverage channel in sales — it just needed
                software that treated it that way. Today we power millions of
                conversations for teams who refuse to let a single lead slip
                through the cracks.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.1}>
                  <div className="rounded-2xl glass-card p-6">
                    <div className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl glass-card p-6 transition-colors hover:border-primary/30"
                  data-cursor="hover"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-medium">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
