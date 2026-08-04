'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Search, Ban, CheckCircle2, Trash2, Edit3, X, MoreVertical } from 'lucide-react';
import { PageHeader, Card, Badge, Button, EmptyState, StatCard } from '@/components/crm/crm-ui';
import { useTenants, useSubscriptionPlans } from '@/lib/data/enterprise-hooks';
import { cn } from '@/lib/utils';

export default function PlatformCompaniesPage() {
  const { data: tenants = [] } = useTenants();
  const { data: plans = [] } = useSubscriptionPlans();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', industry: '', website: '', location: '', planId: '', maxUsers: '10' });

  const filtered = useMemo(() => tenants.filter((t) => {
    const ms = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
    const mf = statusFilter === 'all' || t.status === statusFilter;
    return ms && mf;
  }), [tenants, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Companies" subtitle={`${tenants.length} companies on the platform`} actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />New Company</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={String(tenants.length)} icon={<Building2 className="h-5 w-5" />} index={0} />
        <StatCard label="Active" value={String(tenants.filter((t) => t.status === 'active').length)} icon={<CheckCircle2 className="h-5 w-5" />} index={1} />
        <StatCard label="Suspended" value={String(tenants.filter((t) => t.status === 'suspended').length)} icon={<Ban className="h-5 w-5" />} index={2} />
        <StatCard label="Trial" value={String(tenants.filter((t) => t.status === 'trial').length)} icon={<Building2 className="h-5 w-5" />} index={3} />
      </div>

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
            <option value="all" className="bg-background">All</option>
            <option value="active" className="bg-background">Active</option>
            <option value="suspended" className="bg-background">Suspended</option>
            <option value="trial" className="bg-background">Trial</option>
            <option value="cancelled" className="bg-background">Cancelled</option>
          </select>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className="flex items-center gap-3 p-4 transition-colors hover:bg-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Building2 className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t.industry} • {t.location} • {t.maxUsers} seats</p>
              </div>
              <Badge variant={t.status === 'active' ? 'green' : t.status === 'suspended' ? 'red' : t.status === 'trial' ? 'yellow' : 'muted'}>{t.status}</Badge>
              <div className="flex gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><Edit3 className="h-3.5 w-3.5" /></button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-yellow-400"><Ban className="h-3.5 w-3.5" /></button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="p-12"><EmptyState icon={<Building2 className="h-6 w-6" />} title="No companies" desc="Create your first company." /></div>}
        </div>
      </Card>

      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">Create Company</h2>
                  <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Company Name</p><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Slug</p><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="acme-corp" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Industry</p><input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Location</p><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Plan</p><select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"><option value="" className="bg-background">Select plan</option>{plans.map((p) => <option key={p.id} value={p.id} className="bg-background">{p.name}</option>)}</select></div>
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Max Users</p><input value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: e.target.value })} type="number" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" disabled={!form.name || !form.slug} onClick={() => { setForm({ name: '', slug: '', industry: '', website: '', location: '', planId: '', maxUsers: '10' }); setShowCreate(false); }}>Create Company</Button>
                    <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
