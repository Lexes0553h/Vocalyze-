'use client';

import { motion } from 'framer-motion';
import {
  Slack,
  Globe,
  Chrome,
  Github,
  Figma,
  Mail,
  MessageCircle,
  Calendar,
  Database,
  Cloud,
  Webhook,
  Zap,
} from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

const INTEGRATIONS = [
  { icon: Slack, name: 'Slack', color: '#E01E5A' },
  { icon: Globe, name: 'Google', color: '#4285F4' },
  { icon: Chrome, name: 'Chrome', color: '#4285F4' },
  { icon: Github, name: 'GitHub', color: '#ffffff' },
  { icon: Figma, name: 'Figma', color: '#F24E1E' },
  { icon: Mail, name: 'Gmail', color: '#EA4335' },
  { icon: MessageCircle, name: 'WhatsApp', color: '#25D366' },
  { icon: Calendar, name: 'Calendly', color: '#006BFF' },
  { icon: Database, name: 'HubSpot', color: '#FF7A59' },
  { icon: Cloud, name: 'Salesforce', color: '#00A1E0' },
  { icon: Webhook, name: 'Zapier', color: '#FF4A00' },
  { icon: Zap, name: 'Make', color: '#6D00CC' },
];

export function Integrations() {
  return (
    <section id="integrations" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80">Integrations</span>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            Connects with the tools
            <span className="gradient-text"> your team already loves.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            100+ native integrations and a flexible API. Sync data both ways in
            minutes — no engineering required.
          </p>
        </Reveal>

        <div className="relative">
          {/* Orbit / grid of integration cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {INTEGRATIONS.map((int, i) => {
              const Icon = int.icon;
              return (
                <motion.div
                  key={int.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl glass-card p-6 transition-all duration-300 hover:border-primary/30"
                  data-cursor="hover"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition-all duration-300 group-hover:scale-110"
                    style={{ boxShadow: `0 0 0 1px ${int.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: int.color }} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{int.name}</span>
                </motion.div>
              );
            })}
          </div>

          <Reveal delay={0.3}>
            <p className="mt-12 text-center text-sm text-muted-foreground">
              Don&apos;t see your tool?{' '}
              <span className="font-medium text-foreground">Build a custom integration</span> with our REST API &amp; webhooks.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
