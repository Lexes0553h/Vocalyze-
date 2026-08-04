'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, Phone, CheckSquare, TrendingUp, ArrowRight,
  Activity, Clock,
} from 'lucide-react';
import { PageHeader, StatCard, Card, Button, Avatar } from '@/components/crm/crm-ui';
import { useLeads, useCalls, useTasks } from '@/lib/data/hooks';
import { useTenantUsers } from '@/lib/data/enterprise-hooks';
import { cn } from '@/lib/utils';

export default function TeamLeaderPage() {
  const { data: leads = [] } = useLeads();
  const { data: calls = [] } = useCalls();
  const { data: tasks = [] } = useTasks();
  const { data: team = [] } = useTenantUsers();

  const employees = team.filter((u) => u.role === 'employee' || u.role === 'agent');
  const todaysCalls = calls.slice(0, 8);
  const pendingTasks = tasks.filter((t) => t.status !== 'Done').slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Team Leader Dashboard" subtitle="Monitor daily activity and review team performance." actions={<Link href="/app/tasks"><Button variant="secondary">Assign Tasks <ArrowRight className="h-4 w-4" /></Button></Link>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team Size" value={String(employees.length)} icon={<Users className="h-5 w-5" />} index={0} />
        <StatCard label="Calls Today" value={String(todaysCalls.length)} icon={<Phone className="h-5 w-5" />} index={1} />
        <StatCard label="Pending Tasks" value={String(tasks.filter((t) => t.status !== 'Done').length)} icon={<CheckSquare className="h-5 w-5" />} index={2} />
        <StatCard label="Active Leads" value={String(leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length)} icon={<TrendingUp className="h-5 w-5" />} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Daily Activity">
          <div className="space-y-3">
            {todaysCalls.map((call) => (
              <motion.div key={call.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', call.direction === 'inbound' ? 'bg-cyan/15 text-cyan' : call.direction === 'missed' ? 'bg-red-500/15 text-red-400' : 'bg-primary/15 text-primary')}>
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{call.contact}</p>
                  <p className="truncate text-xs text-muted-foreground">{call.agent} • {call.duration}</p>
                </div>
                <span className="text-xs text-muted-foreground">{call.date}</span>
              </motion.div>
            ))}
            {todaysCalls.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No calls today.</p>}
          </div>
        </Card>

        <Card title="Pending Tasks">
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/15 text-yellow-400"><CheckSquare className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{task.assignee} • Due {task.dueDate}</p>
                </div>
              </motion.div>
            ))}
            {pendingTasks.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No pending tasks.</p>}
          </div>
        </Card>
      </div>

      <Card title="Team Members">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const empLeads = leads.filter((l) => l.agent === emp.name);
            const empCalls = calls.filter((c) => c.agent === emp.name);
            return (
              <div key={emp.id} className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={emp.name} size={40} />
                    <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background', emp.status === 'online' ? 'bg-green-400' : 'bg-muted-foreground/40')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{emp.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{emp.title || 'Employee'}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between border-t border-white/5 pt-3 text-center">
                  <div><p className="text-sm font-semibold">{empLeads.length}</p><p className="text-[10px] text-muted-foreground">Leads</p></div>
                  <div><p className="text-sm font-semibold">{empCalls.length}</p><p className="text-[10px] text-muted-foreground">Calls</p></div>
                  <div><p className="text-sm font-semibold">{emp.status === 'online' ? 'Online' : 'Offline'}</p><p className="text-[10px] text-muted-foreground">Status</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
