'use client';

import { motion } from 'framer-motion';
import {
  Users, Building2, DollarSign, TrendingUp, CreditCard,
  Settings, UserPlus, Shield, Activity, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader, StatCard, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useCurrentTenant, useTenantUsers, useDepartments, useTeams } from '@/lib/data/enterprise-hooks';
import { useLeads, useCalls, useTasks } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

export default function CompanyAdminPage() {
  const { data: tenant } = useCurrentTenant();
  const { data: users = [] } = useTenantUsers();
  const { data: departments = [] } = useDepartments();
  const { data: teams = [] } = useTeams();
  const { data: leads = [] } = useLeads();
  const { data: calls = [] } = useCalls();
  const { data: tasks = [] } = useTasks();

  const activeUsers = users.filter((u) => !u.disabled);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Admin"
        subtitle={tenant ? `${tenant.name} • ${tenant.status}` : 'Manage your company'}
        actions={
          <div className="flex gap-2">
            <Link href="/app/users"><Button variant="secondary"><UserPlus className="h-4 w-4" />Invite User</Button></Link>
            <Link href="/app/company-settings"><Button variant="primary"><Settings className="h-4 w-4" />Settings</Button></Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Employees" value={String(users.length)} change={5} icon={<Users className="h-5 w-5" />} index={0} />
        <StatCard label="Departments" value={String(departments.length)} icon={<Building2 className="h-5 w-5" />} index={1} />
        <StatCard label="Teams" value={String(teams.length)} icon={<Users className="h-5 w-5" />} index={2} />
        <StatCard label="Active Leads" value={String(leads.length)} change={10} icon={<TrendingUp className="h-5 w-5" />} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard href="/app/users" icon={<Users className="h-5 w-5" />} label="User Management" desc="Invite, edit, and manage employees" />
            <ActionCard href="/app/departments" icon={<Building2 className="h-5 w-5" />} label="Departments" desc="Create and organize departments" />
            <ActionCard href="/app/teams" icon={<Users className="h-5 w-5" />} label="Teams" desc="Assign managers and team leaders" />
            <ActionCard href="/app/billing" icon={<CreditCard className="h-5 w-5" />} label="Billing" desc="Manage subscription and invoices" />
            <ActionCard href="/app/audit-logs" icon={<Shield className="h-5 w-5" />} label="Audit Logs" desc="Track all company activity" />
            <ActionCard href="/app/company-settings" icon={<Settings className="h-5 w-5" />} label="Company Settings" desc="Branding, timezone, currency" />
          </div>
        </Card>

        <Card title="Subscription">
          {tenant && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge variant="primary">Professional</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={tenant.status === 'active' ? 'green' : 'red'}>{tenant.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Users</span>
                <span className="text-sm font-medium">{tenant.maxUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="text-sm font-medium">{tenant.storageUsedMb.toFixed(0)} MB</span>
              </div>
              <Link href="/app/billing"><Button variant="primary" className="w-full">Upgrade Plan</Button></Link>
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent Employees">
        <div className="space-y-2">
          {activeUsers.slice(0, 6).map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">{u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
                <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background', u.status === 'online' ? 'bg-green-400' : u.status === 'away' ? 'bg-yellow-400' : 'bg-muted-foreground/40')} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{u.role.replace('_', ' ')}{u.title ? ` • ${u.title}` : ''}</p>
              </div>
              {u.lastLogin && <span className="text-xs text-muted-foreground">Last seen {new Date(u.lastLogin).toLocaleDateString()}</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Calls" value={String(calls.length)} icon={<Activity className="h-5 w-5" />} index={0} />
        <StatCard label="Open Tasks" value={String(tasks.filter((t) => t.status !== 'Done').length)} icon={<Bell className="h-5 w-5" />} index={1} />
        <StatCard label="Won Leads" value={String(leads.filter((l) => l.status === 'Won').length)} icon={<TrendingUp className="h-5 w-5" />} index={2} />
      </div>
    </div>
  );
}

function ActionCard({ href, icon, label, desc }: { href: string; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -4 }} className="cursor-pointer rounded-xl bg-white/[0.03] p-4 transition-all hover:border-primary/30 hover:bg-white/5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </motion.div>
    </Link>
  );
}
