'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'How long does it take to get set up?',
    a: 'Most teams are making their first call within five minutes. Import leads via CSV or CRM sync, pick a number, and start dialing. No IT ticket required — our onboarding team guides you live if you want a hand.',
  },
  {
    q: 'Do I need to install any software?',
    a: 'No. Vocalyze runs entirely in your browser. We also offer a Chrome extension and mobile apps for iOS and Android so reps can call from anywhere.',
  },
  {
    q: 'Can I keep my existing phone number?',
    a: 'Yes. Port your existing numbers in a few clicks, or choose new local numbers in 70+ countries. Number porting is free and typically completes in 3–5 business days.',
  },
  {
    q: 'Is my call data secure?',
    a: 'Absolutely. We\'re SOC 2 Type II certified, GDPR compliant, and HIPAA-ready. All data is encrypted in transit and at rest with 256-bit AES. Calls are stored in your region of choice.',
  },
  {
    q: 'How does the AI follow-up feature work?',
    a: 'After each call, Vocalyze AI transcribes the conversation, identifies action items and sentiment, and drafts a personalized follow-up email or SMS you can review, edit, and send with one click — or auto-send based on rules you set.',
  },
  {
    q: 'What if I need to scale beyond my current plan?',
    a: 'Upgrade or downgrade anytime with no downtime. Our platform supports teams from 1 to 5,000+ seats with multi-region deployment, custom routing, and dedicated infrastructure for enterprise needs.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes — 14 days, full access, no credit card required. You can also book a live demo with a product specialist who will tailor the walkthrough to your use case.',
  },
  {
    q: 'Can I integrate Vocalyze with my existing CRM?',
    a: 'We have native integrations with HubSpot, Salesforce, Pipedrive, Zoho, and more. Need something custom? Our REST API and webhooks let you build any integration in minutes.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden border-y border-white/5 bg-bg-secondary/40 py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80">FAQ</span>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            Questions, answered.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Everything you need to know before you book a demo.
          </p>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.04}>
                <div
                  className={cn(
                    'overflow-hidden rounded-2xl glass-card transition-all duration-300',
                    isOpen && 'border-primary/30'
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    data-cursor="hover"
                  >
                    <span className="text-base font-medium text-foreground">{faq.q}</span>
                    <span className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                      isOpen ? 'bg-primary text-primary-foreground rotate-180' : 'bg-white/5 text-muted-foreground'
                    )}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
