'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useSubscriptionPlans } from '@/lib/data/enterprise-hooks';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PlatformPlansPage() {
  const { data: plans = [] } = useSubscriptionPlans();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription Plans" subtitle={`${plans.length} plans available`} actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />New Plan</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }} whileHover={{ y: -4 }}>
            <Card className={cn(p.tier === 'professional' && 'border-primary/30 bg-primary/5')}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><CreditCard className="h-5 w-5" /></div>
                <Badge variant={p.isActive ? 'green' : 'muted'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <h3 className="mt-3 text-lg font-medium">{p.name}</h3>
              <p className="mt-1 text-xs capitalize text-muted-foreground">{p.tier} tier</p>
              <div className="mt-3">
                <span className="text-2xl font-semibold">${p.priceMonthly}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">${p.priceYearly}/year</p>
              <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-primary" />{p.maxUsers} users</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-primary" />{(p.maxStorageMb / 1024).toFixed(0)} GB storage</p>
                {Object.keys(p.features).length > 0 && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-primary" />{Object.keys(p.features).length} features</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1"><Edit3 className="h-3 w-3" />Edit</Button>
                <Button size="sm" variant="ghost"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">New Plan</h2>
                  <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <p className="text-sm text-muted-foreground">Plan creation form would go here with name, tier, pricing, limits, and feature toggles.</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="primary" className="flex-1" onClick={() => setShowCreate(false)}>Create Plan</Button>
                  <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
