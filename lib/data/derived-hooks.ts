'use client';

import { useSupabaseQueryWithDefault } from './use-supabase-query';
import { mapTeamMember } from './mappers';
import type { TeamMember } from '@/lib/crm-data';
import type { ProfileRow, CallRow, DealRow } from '@/lib/supabase/types';

export function useTeam() {
  return useSupabaseQueryWithDefault<TeamMember[]>(async (c) => {
    const [profilesRes, callsRes, dealsRes] = await Promise.all([
      c.from('profiles').select('*').order('created_at', { ascending: true }),
      c.from('calls').select('id, agent, assigned_to, created_at'),
      c.from('deals').select('id, agent, assigned_to, stage, value'),
    ]);
    if (profilesRes.error) throw profilesRes.error;
    if (callsRes.error) throw callsRes.error;
    if (dealsRes.error) throw dealsRes.error;

    const profiles = (profilesRes.data ?? []) as ProfileRow[];
    const calls = (callsRes.data ?? []) as CallRow[];
    const deals = (dealsRes.data ?? []) as DealRow[];

    const isToday = (ts: string | null) => {
      if (!ts) return false;
      const d = new Date(ts);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    };

    return profiles.map((p) => {
      const userCalls = calls.filter(
        (call) => call.assigned_to === p.id || call.agent === p.name
      );
      const userDeals = deals.filter(
        (d) => d.assigned_to === p.id || d.agent === p.name
      );
      const closed = userDeals.filter((d) => d.stage === 'Closed');
      const revenue = closed.reduce((sum, d) => sum + Number(d.value), 0);
      const callsToday = userCalls.filter((call) => isToday(call.created_at)).length;
      const conversion = userDeals.length > 0
        ? Math.round((closed.length / userDeals.length) * 1000) / 10
        : 0;
      return mapTeamMember(p, {
        callsToday,
        dealsClosed: closed.length,
        revenue,
        conversion,
        attendance: 0,
      });
    });
  }, []);
}

export interface DashboardStats {
  label: string;
  value: number;
  change: number;
  icon: string;
  format: string;
}

export function useDashboardStats() {
  return useSupabaseQueryWithDefault<DashboardStats[]>(async (c) => {
    const [callsRes, leadsRes, dealsRes] = await Promise.all([
      c.from('calls').select('id, created_at'),
      c.from('leads').select('id, status'),
      c.from('deals').select('id, stage, value'),
    ]);
    if (callsRes.error) throw callsRes.error;
    if (leadsRes.error) throw leadsRes.error;
    if (dealsRes.error) throw dealsRes.error;

    const calls = callsRes.data ?? [];
    const leads = leadsRes.data ?? [];
    const deals = dealsRes.data ?? [];

    const isThisMonth = (ts: string) => {
      const d = new Date(ts);
      return d.getMonth() === new Date().getMonth();
    };

    const callsToday = calls.filter((call) => {
      const d = new Date(call.created_at);
      return d.toDateString() === new Date().toDateString();
    }).length;

    const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
    const revenueMtd = deals
      .filter((d) => d.stage === 'Closed' && isThisMonth(new Date().toISOString()))
      .reduce((sum, d) => sum + Number(d.value), 0);
    const closedCount = deals.filter((d) => d.stage === 'Closed').length;
    const conversion = deals.length > 0 ? Math.round((closedCount / deals.length) * 1000) / 10 : 0;

    return [
      { label: 'Calls Today', value: callsToday, change: 0, icon: 'phone', format: 'number' },
      { label: 'Active Leads', value: activeLeads, change: 0, icon: 'users', format: 'number' },
      { label: 'Revenue (MTD)', value: revenueMtd, change: 0, icon: 'dollar', format: 'currency' },
      { label: 'Conversion Rate', value: conversion, change: 0, icon: 'percent', format: 'percent' },
    ];
  }, []);
}

export interface RevenuePoint { month: string; value: number; }
export interface FunnelPoint { stage: string; value: number; percent: number; }
export interface CallAnalyticsPoint { day: string; inbound: number; outbound: number; missed: number; }
export interface SalesPerfPoint { name: string; value: number; target: number; calls?: number; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const EMPTY_REVENUE: RevenuePoint[] = MONTHS.map((m) => ({ month: m, value: 0 }));

const EMPTY_FUNNEL: FunnelPoint[] = [
  { stage: 'Leads', value: 0, percent: 0 },
  { stage: 'Contacted', value: 0, percent: 0 },
  { stage: 'Qualified', value: 0, percent: 0 },
  { stage: 'Proposal', value: 0, percent: 0 },
  { stage: 'Negotiation', value: 0, percent: 0 },
  { stage: 'Won', value: 0, percent: 0 },
];

const EMPTY_CALL_ANALYTICS: CallAnalyticsPoint[] = [
  { day: 'Mon', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Tue', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Wed', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Thu', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Fri', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Sat', inbound: 0, outbound: 0, missed: 0 },
  { day: 'Sun', inbound: 0, outbound: 0, missed: 0 },
];

export function useRevenueData() {
  return useSupabaseQueryWithDefault<RevenuePoint[]>(async (c) => {
    const { data, error } = await c.from('deals').select('value, stage, created_at, expected_close');
    if (error) throw error;
    const deals = data ?? [];
    const byMonth: Record<string, number> = {};
    MONTHS.forEach((m) => { byMonth[m] = 0; });
    deals.forEach((d) => {
      if (d.stage === 'Closed' && d.expected_close) {
        const month = MONTHS[new Date(d.expected_close).getMonth()];
        if (month) byMonth[month] += Number(d.value);
      }
    });
    return MONTHS.map((m) => ({ month: m, value: byMonth[m] }));
  }, EMPTY_REVENUE);
}

export function useFunnelData() {
  return useSupabaseQueryWithDefault<FunnelPoint[]>(async (c) => {
    const { data, error } = await c.from('leads').select('status');
    if (error) throw error;
    const leads = data ?? [];
    if (leads.length === 0) return EMPTY_FUNNEL;
    const stages = ['Leads', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
    const statusMap: Record<string, string> = {
      New: 'Leads', Contacted: 'Contacted', Qualified: 'Qualified',
      Proposal: 'Proposal', Negotiation: 'Negotiation', Won: 'Won', Lost: 'Leads',
    };
    const counts: Record<string, number> = {};
    stages.forEach((s) => { counts[s] = 0; });
    leads.forEach((l) => {
      const stage = statusMap[l.status] ?? 'Leads';
      counts[stage] = (counts[stage] ?? 0) + 1;
    });
    const total = leads.length;
    return stages.map((s) => ({
      stage: s,
      value: counts[s],
      percent: Math.round((counts[s] / total) * 1000) / 10,
    }));
  }, EMPTY_FUNNEL);
}

export function useCallAnalytics() {
  return useSupabaseQueryWithDefault<CallAnalyticsPoint[]>(async (c) => {
    const { data, error } = await c.from('calls').select('direction, created_at');
    if (error) throw error;
    const calls = data ?? [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const buckets: Record<string, CallAnalyticsPoint> = {};
    days.forEach((d) => { buckets[d] = { day: d, inbound: 0, outbound: 0, missed: 0 }; });
    calls.forEach((call) => {
      const d = new Date(call.created_at);
      const day = days[(d.getDay() + 6) % 7];
      const dir = (call.direction as 'inbound' | 'outbound' | 'missed') || 'outbound';
      if (buckets[day] && buckets[day][dir] !== undefined) {
        buckets[day][dir] += 1;
      }
    });
    return days.map((d) => buckets[d]);
  }, EMPTY_CALL_ANALYTICS);
}

export function useSalesPerformance() {
  return useSupabaseQueryWithDefault<SalesPerfPoint[]>(async (c) => {
    const [profilesRes, dealsRes] = await Promise.all([
      c.from('profiles').select('id, name'),
      c.from('deals').select('agent, assigned_to, stage, value'),
    ]);
    if (profilesRes.error) throw profilesRes.error;
    if (dealsRes.error) throw dealsRes.error;
    const profiles = profilesRes.data ?? [];
    const deals = dealsRes.data ?? [];
    const byName: Record<string, number> = {};
    deals.forEach((d) => {
      if (d.stage === 'Closed') {
        const name = d.agent ?? '';
        byName[name] = (byName[name] ?? 0) + Number(d.value) / 1000;
      }
    });
    if (profiles.length === 0) return [];
    return profiles.map((p) => ({
      name: p.name,
      value: Math.round(byName[p.name] ?? 0),
      target: 200,
    })).sort((a, b) => b.value - a.value);
  }, []);
}

export interface PipelineStage { id: string; name: string; color: string; count: number; }

export interface MessageTemplate {
  id: string;
  type: 'whatsapp' | 'sms' | 'email';
  title: string;
  body: string;
  category: string;
}

export function usePipelineStages() {
  return useSupabaseQueryWithDefault<PipelineStage[]>(async (c) => {
    const { data, error } = await c.from('deals').select('stage');
    if (error) throw error;
    const deals = data ?? [];
    const stages: PipelineStage[] = [
      { id: 'lead', name: 'Lead', color: 'muted', count: 0 },
      { id: 'qualified', name: 'Qualified', color: 'cyan', count: 0 },
      { id: 'proposal', name: 'Proposal', color: 'primary', count: 0 },
      { id: 'negotiation', name: 'Negotiation', color: 'primary', count: 0 },
      { id: 'closed', name: 'Closed', color: 'primary', count: 0 },
    ];
    const stageMap: Record<string, string> = {
      Lead: 'lead', Qualified: 'qualified', Proposal: 'proposal',
      Negotiation: 'negotiation', Closed: 'closed',
    };
    deals.forEach((d) => {
      const id = stageMap[d.stage] ?? 'lead';
      const s = stages.find((st) => st.id === id);
      if (s) s.count += 1;
    });
    return stages;
  }, []);
}
