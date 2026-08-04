'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/cursor/magnetic';

export function BookDemo() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/50 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <section id="book-demo" className="relative overflow-hidden py-28">
      <div className="absolute inset-0 mesh-emerald opacity-40" />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="flex flex-col justify-center">
            <Reveal>
              <span className="text-xs uppercase tracking-[0.3em] text-primary/80">Book Demo</span>
              <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
                See Vocalyze run on
                <span className="gradient-text"> your real numbers.</span>
              </h2>
              <p className="mt-5 text-muted-foreground">
                Book a 30-minute live walkthrough. We&apos;ll dial into your use
                case, import a sample of your leads, and show you exactly how the
                AI shaves hours off your team&apos;s week.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 space-y-4">
                {[
                  'Personalized to your sales process',
                  'Live call + AI follow-up demo',
                  'No pressure, no credit card',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-10 flex items-center gap-4 rounded-2xl glass-card p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">Prefer to explore first?</p>
                  <p className="text-xs text-muted-foreground">Start a free 14-day trial — no card needed.</p>
                </div>
                <Magnetic href="/signup" strength={0.3} className="ml-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                    Try free <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Magnetic>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={0.2}>
            <div className="relative overflow-hidden rounded-3xl glass-strong p-6 shadow-2xl shadow-black/40 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/10"
                    >
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </motion.div>
                    <h3 className="mb-2 text-xl font-medium">You&apos;re booked!</h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      We&apos;ve sent a confirmation to <span className="text-foreground">{form.email || 'your inbox'}</span>. A specialist will reach out within 1 business hour.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', company: '', email: '', phone: '', date: '', message: '' });
                      }}
                      className="mt-6 text-sm text-primary hover:underline"
                    >
                      Book another demo
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
                    <div className="mb-2 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Request your demo</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          placeholder="Jordan Avery"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Company</label>
                        <input
                          required
                          value={form.company}
                          onChange={(e) => update('company', e.target.value)}
                          placeholder="Acme Corp"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="jordan@acme.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone</label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Preferred Date</label>
                      <input
                        required
                        type="date"
                        value={form.date}
                        onChange={(e) => update('date', e.target.value)}
                        className={`${inputClass} [color-scheme:dark]`}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => update('message', e.target.value)}
                        placeholder="Tell us about your team size and biggest challenge…"
                        rows={3}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <Magnetic strength={0.2}>
                      <button
                        type="submit"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                      >
                        Book my live demo
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Magnetic>
                    <p className="text-center text-xs text-muted-foreground/60">
                      By submitting, you agree to our privacy policy. We&apos;ll never share your data.
                    </p>
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
