'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Phone } from 'lucide-react';
import Link from 'next/link';
import { Magnetic } from '@/components/cursor/magnetic';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      {/* Animated background */}
      <div className="absolute inset-0 mesh-emerald opacity-50" />
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />

      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[15%] top-[20%] h-80 w-80 rounded-full bg-primary/20 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[15%] bottom-[20%] h-96 w-96 rounded-full opacity-15 blur-[140px]"
        style={{ background: 'hsl(187 70% 45%)' }}
      />

      {/* Floating 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <div className="relative flex items-center justify-center">
          <motion.span
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="font-display text-[120px] font-light leading-none tracking-tighter gradient-text sm:text-[180px] md:text-[240px]"
          >
            4
          </motion.span>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="relative flex h-[120px] w-[120px] items-center justify-center rounded-3xl glass-strong shadow-2xl shadow-primary/20 sm:h-[180px] sm:w-[180px] md:h-[240px] md:w-[240px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="flex h-1/2 w-1/2 items-center justify-center"
            >
              <Phone className="h-1/2 w-1/2 text-primary" />
            </motion.div>
          </motion.div>
          <motion.span
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="font-display text-[120px] font-light leading-none tracking-tighter gradient-text sm:text-[180px] md:text-[240px]"
          >
            4
          </motion.span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 font-display text-3xl font-light tracking-tight sm:text-4xl"
        >
          This call went to voicemail.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-4 max-w-md text-muted-foreground"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on the line.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Magnetic href="/" strength={0.3}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
              <Home className="h-4 w-4" />
              Back to home
            </span>
          </Magnetic>
          <Magnetic strength={0.3}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-medium backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Sign in
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>
    </div>
  );
}
