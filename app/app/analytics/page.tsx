'use client';

import { motion } from 'framer-motion';
import { Phone, Users, DollarSign, Target, Activity } from 'lucide-react';
import { PageHeader, Card, Badge, StatCard, ProgressBar } from '@/components/crm/crm-ui';
import { useCallAnalytics, useRevenueData, useSalesPerformance, useFunnelData } from '@/lib/data/derived-hooks';
import { useCalls, useLeads } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS_LABELS = ['12a', '6a', '12p', '6p'];

const HEATMAP_DATA = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

export default function AnalyticsPage() {
  const { data: calls = [] } = useCalls();
  const { data: leads = [] } = useLeads();
  const { data: CALL_ANALYTICS = [] } = useCallAnalytics();
  const { data: REVENUE_DATA = [] } = useRevenueData();
  const { data: SALES_PERFORMANCE = [] } = useSalesPerformance();
  const { data: FUNNEL_DATA = [] } = useFunnelData();

  const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.value), 1);
  const totalRevenue = REVENUE_DATA.reduce((acc, r) => acc + r.value, 0);
  const totalWon = leads.filter((l) => l.status === 'Won').length;
  const conversionRate = leads.length > 0 ? Math.round((totalWon / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into your sales performance"
        actions={<Badge variant="primary">Real-time Data</Badge>}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change={0} icon={<DollarSign className="h-5 w-5" />} index={0} />
        <StatCard label="Calls Made" value={calls.length.toLocaleString()} change={0} icon={<Phone className="h-5 w-5" />} index={1} />
        <StatCard label="Total Leads" value={leads.length.toLocaleString()} change={0} icon={<Users className="h-5 w-5" />} index={2} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} change={0} icon={<Target className="h-5 w-5" />} index={3} />
      </div>

      {/* Revenue growth chart */}
      <Card title="Revenue Growth" delay={0.1}>
        {REVENUE_DATA.length > 0 && REVENUE_DATA.some((d) => d.value > 0) ? (
          <div className="relative h-56">
            <div className="absolute inset-0 flex items-end justify-between gap-3">
              {REVENUE_DATA.map((d, i) => (
                <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / maxRevenue) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary/80"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                        ${(d.value / 1000).toFixed(0)}K
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No revenue data recorded yet.
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call analytics */}
        <Card title="Call Volume — This Week" delay={0.15}>
          {CALL_ANALYTICS.length > 0 && CALL_ANALYTICS.some((d) => d.inbound > 0 || d.outbound > 0 || d.missed > 0) ? (
            <>
              <div className="flex h-44 items-end gap-3">
                {CALL_ANALYTICS.map((d, i) => {
                  const max = 100;
                  return (
                    <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                      <div className="relative flex w-full flex-1 flex-col-reverse">
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(d.outbound / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 }} className="w-full rounded-b-sm bg-primary/70" />
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(d.inbound / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 + 0.1 }} className="w-full bg-cyan/60" />
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(d.missed / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 + 0.2 }} className="w-full rounded-t-sm bg-red-500/40" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary/70" />Outbound</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan/60" />Inbound</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500/40" />Missed</span>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No weekly call analytics recorded.
            </div>
          )}
        </Card>

        {/* Lead funnel */}
        <Card title="Lead Conversion Funnel" delay={0.2}>
          {FUNNEL_DATA.length > 0 && FUNNEL_DATA.some((f) => f.value > 0) ? (
            <div className="space-y-3">
              {FUNNEL_DATA.map((stage, i) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">{stage.stage}</span>
                  <div className="h-7 flex-1 overflow-hidden rounded-lg bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percent}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-primary/40 to-primary/70 px-2"
                    >
                      <span className="text-[10px] font-medium text-primary-foreground">{stage.value.toLocaleString()}</span>
                    </motion.div>
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">{stage.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No lead funnel data available.
            </div>
          )}
        </Card>
      </div>

      {/* Activity heatmap */}
      <Card title="Activity Heatmap — Calls by Day & Hour" action={<Activity className="h-4 w-4 text-muted-foreground" />} delay={0.25}>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex">
              <div className="w-12 shrink-0" />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="flex-1 text-center text-[8px] text-muted-foreground/50">
                  {h % 6 === 0 ? HOURS_LABELS[h / 6] : ''}
                </div>
              ))}
            </div>
            {HEATMAP_DATA.map((row, di) => (
              <div key={di} className="flex items-center">
                <div className="w-12 shrink-0 text-xs text-muted-foreground">{DAYS[di]}</div>
                {row.map((val, hi) => (
                  <motion.div
                    key={hi}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: di * 0.02 + hi * 0.005 }}
                    className={cn('m-0.5 h-6 flex-1 rounded-sm', val === 0 ? 'bg-slate-100' : 'bg-primary/20')}
                    title={`${DAYS[di]} ${hi}:00 — ${val} calls`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Agent performance */}
      <Card title="Agent Performance" delay={0.3}>
        {SALES_PERFORMANCE.length > 0 ? (
          <div className="space-y-4">
            {SALES_PERFORMANCE.map((rep, i) => (
              <motion.div
                key={rep.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4"
              >
                <span className="w-32 shrink-0 truncate text-sm font-medium">{rep.name}</span>
                <div className="flex-1">
                  <ProgressBar value={rep.target > 0 ? (rep.value / rep.target) * 100 : 0} />
                </div>
                <span className="w-16 text-right text-sm font-medium">${rep.value}K</span>
                <span className="w-12 text-right text-xs text-muted-foreground">
                  {rep.target > 0 ? ((rep.value / rep.target) * 100).toFixed(0) : 0}%
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No agent performance records available.
          </div>
        )}
      </Card>
    </div>
  );
}
