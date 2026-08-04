'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Target, Zap, AlertCircle, CheckCircle2,
  Lightbulb, DollarSign, Users, Activity, ArrowUpRight, Bot,
  RefreshCw, Clock,
} from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, Button, ProgressBar } from '@/components/crm/crm-ui';
import { useAiRequest } from '@/lib/data/ai-hooks';
import { useCalls } from '@/lib/data/hooks';
import { AiCallInsightsCard } from '@/components/ai/ai-call-insights-card';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  revenueForecast: { thisMonth: number; nextMonth: number; thisQuarter: number; confidence: number; trend: string };
  leadForecast: { expectedNew: number; expectedConversion: number; pipelineValue: number };
  salesPrediction: { dealsExpected: number; avgDealSize: number; closingProbability: number };
  monthlyInsights: string[];
  weeklyInsights: string[];
  growthOpportunities: { opportunity: string; potentialValue: number; probability: number }[];
}

export default function AiDashboardPage() {
  const { request, loading } = useAiRequest();
  const { data: calls = [] } = useCalls();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    request('analytics', 'Generate AI dashboard insights for this company').then((res) => {
      if (res?.structured) setData(res.structured as AnalyticsData);
    });
  }, []);

  const insights = data?.monthlyInsights ?? [];
  const weekly = data?.weeklyInsights ?? [];
  const opportunities = data?.growthOpportunities ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Dashboard"
        subtitle="AI-powered overview, recommendations, and forecasts."
        actions={<Button variant="secondary" onClick={() => request('analytics', 'Refresh insights').then((res) => res?.structured && setData(res.structured))} disabled={loading}><RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />Refresh</Button>}
      />

      {/* AI Overview banner */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">AI Overview</h3>
              <Badge variant="primary"><Bot className="h-3 w-3" />Active</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading && !data ? 'Analyzing your CRM data…' : data
                ? `Revenue trending ${data.revenueForecast.trend}. Pipeline value at $${(data.leadForecast.pipelineValue / 1000).toFixed(0)}K with ${(data.leadForecast.expectedConversion * 100).toFixed(0)}% expected conversion. ${data.salesPrediction.dealsExpected} deals expected to close this quarter.`
                : 'Connect an AI provider to unlock real-time insights, forecasts, and recommendations powered by your live CRM data.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Forecast stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue Forecast (Month)" value={data ? `$${data.revenueForecast.thisMonth.toLocaleString()}` : '—'} change={15} icon={<DollarSign className="h-5 w-5" />} index={0} />
        <StatCard label="Quarter Forecast" value={data ? `$${data.revenueForecast.thisQuarter.toLocaleString()}` : '—'} change={12} icon={<TrendingUp className="h-5 w-5" />} index={1} />
        <StatCard label="Expected Deals" value={data ? String(data.salesPrediction.dealsExpected) : '—'} icon={<Target className="h-5 w-5" />} index={2} />
        <StatCard label="Pipeline Value" value={data ? `$${(data.leadForecast.pipelineValue / 1000).toFixed(0)}K` : '—'} change={8} icon={<Activity className="h-5 w-5" />} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Insights */}
        <Card title="Monthly Insights" delay={0.05}>
          <div className="space-y-3">
            {insights.length > 0 ? insights.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">{ins}</p>
              </motion.div>
            )) : Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </Card>

        {/* Weekly Insights */}
        <Card title="Weekly Insights" delay={0.1}>
          <div className="space-y-3">
            {weekly.length > 0 ? weekly.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan" />
                <p className="text-sm text-muted-foreground">{ins}</p>
              </motion.div>
            )) : Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </Card>
      </div>

      {/* Growth Opportunities */}
      <Card title="Growth Opportunities" delay={0.15}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.length > 0 ? opportunities.map((opp, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <Badge variant="primary">{Math.round(opp.probability * 100)}% likely</Badge>
              </div>
              <p className="text-sm font-medium">{opp.opportunity}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-muted-foreground">Potential Value</span>
                <span className="text-sm font-semibold text-primary">${opp.potentialValue.toLocaleString()}</span>
              </div>
            </motion.div>
          )) : Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card title="AI Recommendations" delay={0.2}>
        <div className="space-y-3">
          {[
            { icon: AlertCircle, color: 'text-red-400', title: 'Re-engage 12 cold leads with high buying intent', desc: 'AI detected engagement signals suggesting these leads are ready to re-engage. Potential: $95K.', priority: 'high' },
            { icon: TrendingUp, color: 'text-primary', title: 'Expand Helios Energy deal to 80 seats', desc: 'Current negotiation at 60 seats. Analysis suggests openness to expansion. Potential: +$18K.', priority: 'medium' },
            { icon: Users, color: 'text-cyan', title: 'Upsell automation features to 8 customers', desc: 'These customers have high engagement and would benefit from automation. Potential: $24K.', priority: 'medium' },
            { icon: CheckCircle2, color: 'text-green-400', title: 'Tuesday is your best conversion day', desc: '32% close rate on Tuesdays vs 18% average. Schedule important demos on Tuesdays.', priority: 'low' },
          ].map((rec, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-4 transition-colors hover:bg-white/5">
              <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5', rec.color)}>
                <rec.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <Badge variant={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'primary' : 'muted'}>{rec.priority}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{rec.desc}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* AI Call Intelligence & Follow-up Insights */}
      <AiCallInsightsCard calls={calls} />

      {/* Activity Summary */}
      <Card title="Activity Summary" delay={0.25}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActivityItem label="Calls Analyzed" value="42" icon={<Activity className="h-4 w-4" />} />
          <ActivityItem label="Leads Scored" value="28" icon={<Target className="h-4 w-4" />} />
          <ActivityItem label="Follow-ups Generated" value="15" icon={<Zap className="h-4 w-4" />} />
          <ActivityItem label="Insights Generated" value="7" icon={<Lightbulb className="h-4 w-4" />} />
        </div>
      </Card>
    </div>
  );
}

function ActivityItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
