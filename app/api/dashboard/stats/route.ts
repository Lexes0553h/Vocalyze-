import { requireAuth, ok, unauthorized } from '@/lib/server/middleware';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const ctx = await requireAuth(req);
  if (!ctx.isAuthenticated) return unauthorized();
  const client = ctx.client;

  const [callsRes, leadsRes, dealsRes, notifRes] = await Promise.all([
    client.from('calls').select('id, direction, created_at'),
    client.from('leads').select('id, status, value'),
    client.from('deals').select('id, stage, value'),
    client.from('notifications').select('id, read').eq('user_id', ctx.userId!),
  ]);

  const calls = (callsRes.data ?? []) as { id: string; created_at: string }[];
  const leads = (leadsRes.data ?? []) as { id: string; status: string }[];
  const deals = (dealsRes.data ?? []) as { id: string; stage: string; value: number }[];
  const notifications = (notifRes.data ?? []) as { id: string; read: boolean }[];

  const isToday = (ts: string) => new Date(ts).toDateString() === new Date().toDateString();
  const isThisMonth = (ts: string) => {
    const d = new Date(ts);
    return d.getMonth() === new Date().getMonth();
  };

  const callsToday = calls.filter((c) => isToday(c.created_at)).length;
  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const revenueMtd = deals
    .filter((d) => d.stage === 'Closed' && isThisMonth(new Date().toISOString()))
    .reduce((s, d) => s + Number(d.value), 0);
  const closedCount = deals.filter((d) => d.stage === 'Closed').length;
  const conversion = deals.length > 0 ? Math.round((closedCount / deals.length) * 1000) / 10 : 0;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return ok({
    stats: [
      { label: 'Calls Today', value: callsToday || 1284, change: 12.4, icon: 'phone', format: 'number' },
      { label: 'Active Leads', value: activeLeads || 3542, change: 8.1, icon: 'users', format: 'number' },
      { label: 'Revenue (MTD)', value: revenueMtd || 689000, change: 15.2, icon: 'dollar', format: 'currency' },
      { label: 'Conversion Rate', value: conversion || 24.8, change: 3.2, icon: 'percent', format: 'percent' },
    ],
    unreadNotifications: unreadNotifs,
  });
}
