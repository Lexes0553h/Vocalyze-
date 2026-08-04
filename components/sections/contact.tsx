'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/cursor/magnetic';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'hello@vocalyze.io' },
  { icon: Phone, label: 'Phone', value: '+1 (415) 555-0192' },
  { icon: MapPin, label: 'Office', value: '548 Market St, San Francisco' },
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setMsg('');
  };

  return (
    <section id="contact" className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80">Contact</span>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            Let&apos;s talk.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Questions, partnerships, or just want to say hi? We reply to every
            message within one business hour.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info */}
          <Reveal className="lg:col-span-2">
            <div className="space-y-4">
              {CONTACT_INFO.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-center gap-4 rounded-2xl glass-card p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground/60">{c.label}</p>
                      <p className="text-sm font-medium">{c.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Message form */}
          <Reveal delay={0.15} className="lg:col-span-3">
            <div className="rounded-3xl glass-strong p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/10"
                    >
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h3 className="mb-1 text-lg font-medium">Message sent</h3>
                    <p className="text-sm text-muted-foreground">We&apos;ll be in touch shortly.</p>
                    <button onClick={() => setSent(false)} className="mt-4 text-sm text-primary hover:underline">
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <input
                      required
                      type="email"
                      placeholder="Your email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground/50 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <textarea
                      required
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      placeholder="What can we help with?"
                      rows={5}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground/50 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Magnetic strength={0.2}>
                      <button
                        type="submit"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                      >
                        Send message
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Magnetic>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
