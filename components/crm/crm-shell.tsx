'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/crm/sidebar';
import { TopNav, Breadcrumb } from '@/components/crm/topnav';
import { BottomNav } from '@/components/crm/bottom-nav';
import { FloatingAiAssistant } from '@/components/ai/floating-assistant';

export function CrmShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <TopNav onMenuClick={() => setMobileOpen(true)} breadcrumb={<Breadcrumb />} />

        <main className="relative px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav onOpenMore={() => setMobileOpen(true)} />
      <FloatingAiAssistant />
    </div>
  );
}
