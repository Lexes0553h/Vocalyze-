'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import Link from 'next/link';
import { Magnetic } from '@/components/cursor/magnetic';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#home');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(
      Boolean
    ) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const handleClick = (href: string) => {
    setOpen(false);
    const targetId = href.startsWith('#') ? href.slice(1) : href;
    const el = document.getElementById(targetId);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      if (targetId === 'book-demo') {
        el.classList.add('section-highlight');
        setTimeout(() => el.classList.remove('section-highlight'), 2000);
      }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={cn(
            'flex items-center justify-between rounded-2xl px-4 transition-all duration-500 ease-smooth',
            scrolled
              ? 'bg-white/90 border border-slate-200/80 h-14 w-full max-w-5xl shadow-xl shadow-slate-200/50 backdrop-blur-xl'
              : 'h-16 w-full max-w-6xl border border-transparent bg-white/50 backdrop-blur-md'
          )}
        >
          {/* Logo */}
          <Link href="#home" className="flex items-center gap-2 pl-1" onClick={() => handleClick('#home')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Vocalyze</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleClick(link.href)}
                className="relative px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {active === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-slate-100"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={cn('relative z-10', active === link.href && 'text-primary font-semibold')}>
                  {link.label}
                </span>
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              Login
            </Link>
            <Magnetic href="/signup" strength={0.3}>
              <span className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90">
                Sign Up
              </span>
            </Magnetic>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-4 right-4 top-20 rounded-2xl glass-strong p-4"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleClick(link.href)}
                    className={cn(
                      'rounded-lg px-4 py-3 text-left text-sm transition-colors',
                      active === link.href ? 'bg-white/8 text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="my-2 h-px bg-white/10" />
                <Link href="/login" className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Link href="/signup" className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">
                  Sign Up
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
