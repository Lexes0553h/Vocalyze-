'use client';

import { motion } from 'framer-motion';
import { Users, Phone, DollarSign, Crown, Award, UserPlus, Activity } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, StatCard, ProgressBar } from '@/components/crm/crm-ui';
import { useTeam } from '@/lib/data/derived-hooks';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const { data: TEAM = [] } = useTeam();
  const sorted = [...TEAM].sort((a, b) => b.revenue - a.revenue);
  const online = TEAM.filter((t) => t.status === 'online').length;
  const callsToday = TEAM.reduce((s, t) => s + t.callsToday, 0);
  const revenueMtd = TEAM.reduce((s, t) => s + t.revenue, 0);
  const present = TEAM.filter((t) => t.attendance >= 90).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle={`${TEAM.length} members`}
        actions={<Button variant="primary"><UserPlus className="h-4 w-4" />Invite Member</Button>}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Total Members" value={String(TEAM.length)} icon={<Users className="h-5 w-5" />} />
        <StatCard index={1} label="Online Now" value={String(online)} icon={<Activity className="h-5 w-5" />} />
        <StatCard index={2} label="Calls Today" value={String(callsToday)} icon={<Phone className="h-5 w-5" />} />
        <StatCard index={3} label="Revenue (MTD)" value={`$${(revenueMtd / 1000).toFixed(0)}K`} change={15.2} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Leaderboard */}
      <Card title="Leaderboard" delay={0.1}>
        <div className="space-y-2">
          {sorted.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('flex items-center gap-3 rounded-xl p-3', i < 3 ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-white/5')}
            >
              <div className="flex w-8 items-center justify-center">
                {i === 0 ? <Crown className="h-5 w-5 text-primary" /> : i === 1 ? <Award className="h-5 w-5 text-cyan" /> : i === 2 ? <Award className="h-5 w-5 text-muted-foreground" /> : <span className="text-sm text-muted-foreground">{i + 1}</span>}
              </div>
              <Avatar src={m.avatar} name={m.name} size={36} />
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-primary">${(m.revenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{m.conversion}%</p>
                <p className="text-xs text-muted-foreground">Conv.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{m.callsToday}</p>
                <p className="text-xs text-muted-foreground">Calls</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Members grid + attendance */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass-card p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="relative">
                  <Avatar src={m.avatar} name={m.name} size={44} ring />
                  <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-background', m.status === 'online' ? 'bg-green-400' : m.status === 'away' ? 'bg-cyan' : 'bg-muted-foreground/40')} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <p className="mb-3 truncate text-xs text-muted-foreground">{m.email}</p>
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                <div><p className="text-sm font-medium">{m.callsToday}</p><p className="text-[10px] text-muted-foreground">Calls</p></div>
                <div><p className="text-sm font-medium">{m.dealsClosed}</p><p className="text-[10px] text-muted-foreground">Deals</p></div>
                <div><p className="text-sm font-medium text-primary">${(m.revenue / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Revenue</p></div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Attendance</span>
                  <span className="font-medium">{m.attendance}%</span>
                </div>
                <ProgressBar value={m.attendance} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Attendance card */}
        <Card title="Today's Attendance" delay={0.15} className="h-fit">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-3xl font-semibold">{present}/{TEAM.length}</div>
            <Badge variant="green">Present</Badge>
          </div>
          <ProgressBar value={(present / TEAM.length) * 100} color="cyan" />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
              <span className="text-sm">Present</span>
              <span className="font-medium text-green-400">{present}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
              <span className="text-sm">Absent / Away</span>
              <span className="font-medium text-muted-foreground">{TEAM.length - present}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
