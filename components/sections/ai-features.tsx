'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Languages,
  Smile,
  FileAudio,
  BrainCircuit,
  Check,
} from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/cursor/magnetic';

const AI_FEATURES = [
  {
    icon: Smile,
    title: 'Sentiment Analysis',
    desc: 'AI reads tone in real time and flags at-risk calls before they end.',
  },
  {
    icon: FileAudio,
    title: 'Smart Transcription',
    desc: 'Every call transcribed with speaker labels and searchable keywords.',
  },
  {
    icon: Bot,
    title: 'AI Follow-Ups',
    desc: 'Personalized follow-up emails and SMS drafted from call context.',
  },
  {
    icon: Languages,
    title: 'Real-Time Translation',
    desc: 'Break language barriers with live transcription in 40+ languages.',
  },
];

export function AIFeatures() {
  return (
    <section id="solutions" className="relative overflow-hidden border-y border-white/5 bg-bg-secondary/40 py-28">
      <div className="absolute inset-0 mesh-emerald opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <Reveal>
              <span className="text-xs uppercase tracking-[0.3em] text-primary/80">AI Features</span>
              <h2 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
                Your AI co-pilot for
                <span className="gradient-text"> every conversation.</span>
              </h2>
              <p className="mt-5 text-muted-foreground">
                Vocalyze AI listens, learns, and acts — surfacing insights,
                drafting follow-ups, and coaching reps so every call moves the
                needle.
              </p>
            </Reveal>

            <div className="mt-10 space-y-5">
              {AI_FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={i * 0.1}>
                    <div className="group flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/5" data-cursor="hover">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/25">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium">{f.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={0.4}>
              <Magnetic href="#book-demo" strength={0.3} className="mt-8 inline-block">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur-md transition-all hover:border-primary/40 hover:bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                  See AI in action
                </span>
              </Magnetic>
            </Reveal>
          </div>

          {/* Right: animated AI panel */}
          <Reveal delay={0.2}>
            <div className="relative">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative overflow-hidden rounded-2xl glass-strong p-6 shadow-2xl shadow-black/50"
              >
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan text-primary-foreground">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Vocalyze AI</p>
                      <p className="text-xs text-primary">Live analysis</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      Listening
                    </span>
                  </div>

                  {/* Transcript snippet */}
                  <div className="space-y-3 rounded-xl bg-black/20 p-4">
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-cyan">Caller</span>
                      <p className="text-xs text-muted-foreground">
                        &ldquo;I&apos;m worried about the pricing tier for our team size…&rdquo;
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-primary">Rep</span>
                      <p className="text-xs text-muted-foreground">
                        &ldquo;Let me pull up the team plan — it scales per seat and…&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* AI insights */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground/70">AI Insights</p>
                    {[
                      'Objection detected: pricing concern',
                      'Sentiment: slightly negative — coach empathy',
                      'Suggested next step: share team pricing PDF',
                    ].map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.15 }}
                        className="flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-2 text-xs"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {insight}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-6 -left-6 flex items-center gap-2 rounded-xl glass-strong px-4 py-3 shadow-xl"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/20 text-cyan">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">+38%</p>
                  <p className="text-[10px] text-muted-foreground">conversion lift</p>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
