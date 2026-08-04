'use client';

import { Phone, Twitter, Linkedin, Github, Youtube, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/cursor/magnetic';

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'AI Co-pilot', 'Integrations', 'Dashboard', 'Pricing', 'Changelog'],
  },
  {
    title: 'Solutions',
    links: ['Call Centers', 'Sales Teams', 'Customer Support', 'Collections', 'Real Estate', 'Healthcare'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press', 'Partners', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Help Center', 'Community', 'Templates', 'Status'],
  },
];

const SOCIALS = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-bg-secondary/60 pt-20">
      <div className="absolute inset-0 mesh-emerald opacity-20" />
      <div className="relative mx-auto max-w-6xl px-6">
        {/* CTA banner */}
        <Reveal>
          <div className="mb-16 flex flex-col items-center justify-between gap-6 rounded-3xl glass-strong p-8 text-center sm:p-12 lg:flex-row lg:text-left">
            <div>
              <h3 className="font-display text-2xl font-light tracking-tight sm:text-3xl">
                Ready to close more deals?
              </h3>
              <p className="mt-2 text-muted-foreground">
                Start your free trial today. No credit card. Cancel anytime.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Magnetic href="/signup" strength={0.3}>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20">
                  Start Free Trial
                </span>
              </Magnetic>
              <Magnetic href="#book-demo" strength={0.3}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur-md">
                  Book Demo
                </span>
              </Magnetic>
            </div>
          </div>
        </Reveal>

        {/* Links */}
        <div className="grid gap-10 pb-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="#home" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Vocalyze</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI-powered telecalling CRM that helps teams manage leads, monitor
              calls, and close more deals — faster.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-medium">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-8 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">
            © 2026 Vocalyze, Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground/60">
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="transition-colors hover:text-foreground">Security</a>
            <a href="#" className="transition-colors hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>

      {/* Giant watermark text */}
      <div className="relative select-none overflow-hidden">
        <p className="pointer-events-none translate-y-[20%] bg-gradient-to-b from-white/5 to-transparent bg-clip-text text-center font-display text-[18vw] font-light leading-none tracking-tighter text-transparent">
          VOCALYZE
        </p>
      </div>
    </footer>
  );
}
