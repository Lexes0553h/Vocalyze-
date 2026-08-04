'use client';

import { motion } from 'framer-motion';
import {
  Gauge,
  ShieldCheck,
  Headphones,
  Layers,
  Globe2,
  Award,
} from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

const REASONS = [
  {
    icon: Gauge,
    title: 'Blazing fast',
    desc: 'Built on a real-time engine. Sub-100ms updates, zero lag on large lists.',
    stat: '99.99%',
    statLabel: 'uptime SLA',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise secure',
    desc: 'SOC 2 Type II, GDPR, and HIPAA-ready with end-to-end encryption.',
    stat: '256-bit',
    statLabel: 'encryption',
  },
  {
    icon: Headphones,
    title: 'Human support',
    desc: 'Real humans on chat, email, and phone — 24/7, in under 2 minutes.',
    stat: '< 2 min',
    statLabel: 'avg response',
  },
  {
    icon: Layers,
    title: 'Scales with you',
    desc: 'From 5 reps to 5,000. Multi-region, multi-tenant, no re-platforming.',
    stat: '5,000+',
    statLabel: 'seats supported',
  },
  {
    icon: Globe2,
    title: 'Global by default',
    desc: 'Local numbers in 70+ countries with smart routing and failover.',
    stat: '70+',
    statLabel: 'countries',
  },
  {
    icon: Award,
    title: 'Loved by teams',
    desc: '4.9/5 average across G2, Capterra, and Trustpilot from 2,800 reviews.',
    stat: '4.9/5',
    statLabel: 'customer rating',
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80">Why Choose Us</span>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            Built for teams that
            <span className="gradient-text"> refuse to settle.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            The performance of a platform ten times the price, with the polish of
            one you actually want to use.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl glass-card p-7 transition-all duration-500 hover:border-primary/30"
                data-cursor="hover"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/25">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold gradient-text">{r.stat}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{r.statLabel}</div>
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-medium">{r.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
