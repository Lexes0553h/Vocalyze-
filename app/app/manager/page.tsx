'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, TrendingUp, Phone, CheckSquare, Target, ArrowRight,
  Activity, Clock, CheckCircle2,
} from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { useLeads, useCalls, useTasks } from '@/lib/data/hooks';
import { useTenantUsers } from '@/lib/data/enterprise-hooks';
import { cn } from '@/lib/utils';

export default function ManagerPage() {
  const { data: leads = [] } = useLeads();
  const { data: calls = [] } = useCalls();
  const { data: tasks = [] } = useTasks();
  const { data: team = [] } = useTenantUsers();

  const employees = team.filter((u) => u.role === 'employee' || u.role === 'agent');
  const openLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const completedCalls = calls.length;
  const openTasks = tasks.filter((t) => t.status !== 'Done');
  const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Manager Dashboard" subtitle="Track team performance, assignments, and conversions." actions={<Link href="/app/reports"><Button variant="secondary">View Reports <ArrowRight className="h-4 w-4" /></Button></Link>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team Members" value={String(employees.length)} icon={<Users className="h-5 w-5" />} index={0} />
        <StatCard label="Open Leads" value={String(openLeads.length)} change={8} icon={<TrendingUp className="h-5 w-5" />} index={1} />
        <StatCard label="Calls Made" value={String(completedCalls)} change={15} icon={<Phone className="h-5 w-5" />} index={2} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} change={5} icon={<Target className="h-5 w-5" />} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Team Performance">
          <div className="space-y-3">
            {employees.map((emp, i) => {
              const empLeads = leads.filter((l) => l.agent === emp.name);
              const empCalls = calls.filter((c) => c.agent === emp.name);
              const empTasks = tasks.filter((t) => t.assignee === emp.name);
              const empWon = empLeads.filter((l) => l.status === 'Won').length;
              const empConv = empLeads.length > 0 ? Math.round((empWon / empLeads.length) * 100) : 0;
              return (
                <motion.div key={emp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                  <div className="relative">
                    <Avatar name={emp.name} size={40} />
                    <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background', emp.status === 'online' ? 'bg-green-400' : 'bg-muted-foreground/40')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{emp.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{emp.title || 'Employee'}</p>
                  </div>
                  <div className="hidden gap-4 text-center sm:flex">
                    <div><p className="text-sm font-semibold">{empLeads.length}</p><p className="text-[10px] text-muted-foreground">Leads</p></div>
                    <div><p className="text-sm font-semibold">{empCalls.length}</p><p className="text-[10px] text-muted-foreground">Calls</p></div>
                    <div><p className="text-sm font-semibold">{empConv}%</p><p className="text-[10px] text-muted-foreground">Conv.</p></div>
                  </div>
                </motion.div>
              );
            })}
            {employees.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No team members yet.</p>}
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-2">
            <Link href="/app/leads"><ActionRow icon={<TrendingUp className="h-4 w-4" />} label="Assign Leads" desc="Distribute leads to team members" /></Link>
            <Link href="/app/tasks"><ActionRow icon={<CheckSquare className="h-4 w-4" />} label="Assign Tasks" desc="Create and assign tasks" /></Link>
            <Link href="/app/calls"><ActionRow icon={<Phone className="h-4 w-4" />} label="Track Calls" desc="Monitor team call activity" /></Link>
            <Link href="/app/reports"><ActionRow icon={<Activity className="h-4 w-4" />} label="Generate Reports" desc="Export team performance" /></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open Tasks" value={String(openTasks.length)} icon={<CheckSquare className="h-5 w-5" />} index={0} />
        <StatCard label="Won Deals" value={String(wonLeads.length)} icon={<CheckCircle2 className="h-5 w-5" />} index={1} />
        <StatCard label="Total Leads" value={String(leads.length)} icon={<TrendingUp className="h-5 w-5" />} index={2} />
      </div>
    </div>
  );
}

function ActionRow({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <motion.div whileHover={{ x: 4 }} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</div>
      <div className="flex-1"><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </motion.div>
  );
}
