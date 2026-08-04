'use client';

import { Star } from 'lucide-react';

const COMPANIES = [
  'Northwind',
  'Vertex',
  'Lumen',
  'Quanta',
  'Helios',
  'Apex',
  'Orbital',
  'Nimbus',
  'Strata',
  'Pinnacle',
];

export function TrustedCompanies() {
  return (
    <section id="trusted" className="relative border-y border-white/5 bg-bg-secondary/50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
          Trusted by 4,000+ high-performing sales teams
        </p>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max animate-marquee items-center gap-16">
            {[...COMPANIES, ...COMPANIES].map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
              >
                <Star className="h-4 w-4 fill-current" />
                <span className="font-display">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
