'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, DollarSign, TrendingUp, HardDrive, Activity,
  Globe, Shield, Plus, Search, MoreVertical, Ban, CheckCircle2,
  Trash2, Edit3, ArrowUpRight,
} from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, Button, Avatar, EmptyState } from '@/components/crm/crm-ui';
import { useTenants, useTenantUsers, useSubscriptionPlans, useAuditLogs } from '@/lib/data/enterprise-hooks';
import { cn } from '@/lib/utils';

export default function PlatformDashboardPage() {
  const { data: tenants = [] } = useTenants();
  const { data: users = [] } = useTenantUsers();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: auditLogs = [] } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeCompanies = tenants.filter((t) => t.status === 'active');
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.disabled);
  const totalRevenue = activeCompanies.length * 79;
  const monthlyGrowth = 12.5;

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const ms = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
      const mf = statusFilter === 'all' || t.status === statusFilter;
      return ms && mf;
    });
  }, [tenants, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        subtitle="Super Admin overview across all companies on the platform."
        actions={<Button variant="primary"><Plus className="h-4 w-4" />New Company</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Companies" value={String(tenants.length)} change={8} icon={<Building2 className="h-5 w-5" />} index={0} />
        <StatCard label="Active Users" value={String(activeUsers.length)} change={15} icon={<Users className="h-5 w-5" />} index={1} />
        <StatCard label="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} change={monthlyGrowth} icon={<DollarSign className="h-5 w-5" />} index={2} />
        <StatCard label="Monthly Growth" value={`${monthlyGrowth}%`} change={3} icon={<TrendingUp className="h-5 w-5" />} index={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Companies" value={String(activeCompanies.length)} icon={<CheckCircle2 className="h-5 w-5" />} index={0} />
        <StatCard label="Suspended" value={String(tenants.filter((t) => t.status === 'suspended').length)} icon={<Ban className="h-5 w-5" />} index={1} />
        <StatCard label="Storage Used" value={`${(tenants.reduce((s, t) => s + t.storageUsedMb, 0) / 1024).toFixed(1)} GB`} icon={<HardDrive className="h-5 w-5" />} index={2} />
        <StatCard label="Subscription Plans" value={String(plans.length)} icon={<Activity className="h-5 w-5" />} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Companies">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
              <option value="all" className="bg-background">All Status</option>
              <option value="active" className="bg-background">Active</option>
              <option value="suspended" className="bg-background">Suspended</option>
              <option value="trial" className="bg-background">Trial</option>
              <option value="cancelled" className="bg-background">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            {filteredTenants.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Building2 className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.industry} • {t.location}</p>
                </div>
                <Badge variant={t.status === 'active' ? 'green' : t.status === 'suspended' ? 'red' : t.status === 'trial' ? 'yellow' : 'muted'}>{t.status}</Badge>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-muted-foreground">{t.maxUsers} seats</p>
                  <p className="text-xs text-muted-foreground">{t.storageUsedMb.toFixed(0)} MB</p>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
              </motion.div>
            ))}
            {filteredTenants.length === 0 && <EmptyState icon={<Building2 className="h-6 w-6" />} title="No companies" desc="Create your first company to get started." />}
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="relative space-y-4 pl-4">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/10" />
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-3 top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.userName} • {log.description}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/50">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {auditLogs.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
          </div>
        </Card>
      </div>

      <Card title="Subscription Plans">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.id} className={cn('rounded-xl border p-4', p.tier === 'professional' ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-white/[0.03]')}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.name}</p>
                {p.tier === 'professional' && <Badge variant="primary">Popular</Badge>}
              </div>
              <p className="mt-2 text-2xl font-semibold">${p.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{p.maxUsers} users • {(p.maxStorageMb / 1024).toFixed(0)} GB storage</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1"><Edit3 className="h-3 w-3" />Edit</Button>
                <Button size="sm" variant="ghost"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Platform Analytics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnalyticsItem icon={<Globe className="h-5 w-5" />} label="API Usage" value="1.2M requests" sub="Last 30 days" />
          <AnalyticsItem icon={<Shield className="h-5 w-5" />} label="Security Events" value="0 critical" sub="All systems secure" />
          <AnalyticsItem icon={<Activity className="h-5 w-5" />} label="Avg. Uptime" value="99.98%" sub="Last 90 days" />
        </div>
      </Card>
    </div>
  );
}

function AnalyticsItem({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground/60">{sub}</p>
    </div>
  );
}
