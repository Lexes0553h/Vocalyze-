'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Phone,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  DollarSign,
  TrendingUp,
  BarChart3,
  Shield,
  FileText,
  UserPlus,
  Target,
  Clock,
  Disc,
  Building2,
  Bell,
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader, StatCard, Card, Badge, Button, Avatar, ProgressBar } from '@/components/crm/crm-ui';
import { useAuth } from '@/lib/auth/auth-context';
import {
  useCalls, useLeads, useTasks, useActivity,
} from '@/lib/data/hooks';
import {
  useDashboardStats, useRevenueData, useCallAnalytics, useSalesPerformance, useTeam,
} from '@/lib/data/derived-hooks';
import { AiCallInsightsCard } from '@/components/ai/ai-call-insights-card';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] ?? 'Admin';

  const { data: calls = [] } = useCalls();
  const { data: leads = [] } = useLeads();
  const { data: activity = [] } = useActivity();
  const { data: teamMembers = [] } = useTeam();
  const { data: statsData } = useDashboardStats();
  const { data: revenueData } = useRevenueData();
  const { data: callAnalytics } = useCallAnalytics();
  const { data: salesPerf } = useSalesPerformance();

  const maxRevenue = Math.max(...(revenueData ?? [{ value: 0 }]).map((d) => d.value), 1);
  const activeLeadsCount = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const wonDealsCount = leads.filter((l) => l.status === 'Won').length;
  const answeredCallsCount = calls.filter((c) => c.status === 'Completed' || c.duration).length;
  const missedCallsCount = calls.filter((c) => c.direction === 'missed').length;
  const totalCallsCount = calls.length;
  const conversionRate = leads.length > 0 ? Math.round((wonDealsCount / leads.length) * 100) : 0;
  const totalRevenueMtd = (revenueData ?? []).reduce((acc, r) => acc + r.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Executive Admin Dashboard • Welcome, ${userName}`}
        subtitle="Company Overview • Real-Time Telecalling Operations & Team Performance"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/app/admin/employees" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4" /> Add Employee
              </Button>
            </Link>
            <Link href="/app/reports" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <FileText className="h-4 w-4" /> Executive Reports
              </Button>
            </Link>
          </div>
        }
      />

      {/* Admin Executive Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-5 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="h-4 w-4 shrink-0" /> Vocalyze Enterprise Control Center
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Company Performance & Real-Time Call Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              {teamMembers.length} staff members • {totalCallsCount} calls completed today across departments.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <Link href="/app/admin/team-performance" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Users className="h-4 w-4" /> Team Performance
              </Button>
            </Link>
            <Link href="/app/company-settings" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Building2 className="h-4 w-4" /> Company Config
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Company Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={`${teamMembers.length} Staff`}
          change={0}
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          index={0}
        />
        <StatCard
          label="Calls Handled Today"
          value={totalCallsCount.toLocaleString()}
          change={0}
          icon={<Phone className="h-5 w-5 text-blue-600" />}
          index={1}
        />
        <StatCard
          label="Company Revenue (MTD)"
          value={`$${totalRevenueMtd.toLocaleString()}`}
          change={0}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          index={2}
        />
        <StatCard
          label="Overall Conversion Rate"
          value={`${conversionRate}%`}
          change={0}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          index={3}
        />
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Answered Calls</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {answeredCallsCount} <span className="text-xs text-emerald-600 font-semibold">({totalCallsCount > 0 ? Math.round((answeredCallsCount / totalCallsCount) * 100) : 0}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Missed Calls</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {missedCallsCount} <span className="text-xs text-red-500 font-semibold">({totalCallsCount > 0 ? Math.round((missedCallsCount / totalCallsCount) * 100) : 0}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Active Leads In Pipeline</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeLeadsCount} Leads</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Won Deals (This Month)</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{wonDealsCount} Closed</p>
        </div>
      </div>

      {/* Main Charts & Team Performance */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Revenue Trend & Telecaller Leaderboard */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Chart */}
          <Card title="Monthly Company Revenue Trend">
            <div className="flex h-52 items-end gap-3 pt-4">
              {(revenueData || []).map((d, i) => (
                <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${maxRevenue > 0 ? (d.value / maxRevenue) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="w-full rounded-t-lg bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{d.month}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Employee Performance Leaderboard */}
          <Card
            title="Telecaller Performance & Target Tracking"
            action={<Link href="/app/admin/team-performance" className="text-xs font-semibold text-emerald-700 hover:underline">Full Analytics</Link>}
          >
            <div className="space-y-4">
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={member.name} size={40} ring />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">{member.role} • {member.callsToday || 0} calls today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-emerald-700">${(member.revenue || 0).toLocaleString()}</p>
                      <span className="text-xs text-slate-500">{member.conversion || 0}% conversion</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 px-4 text-center">
                  <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No Team Members Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your team performance will appear here once you add employees and they start working.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Admin Company-Wide AI Call Insights */}
          <AiCallInsightsCard calls={calls} />
        </div>

        {/* Right Column: Admin Quick Navigation & Recent Logs */}
        <div className="space-y-6">
          <Card title="Admin Control Center">
            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/app/admin/employees" className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                <UserCheck className="h-5 w-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">Employees</span>
              </Link>
              <Link href="/app/admin/targets" className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                <Target className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">Targets</span>
              </Link>
              <Link href="/app/admin/attendance" className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                <Clock className="h-5 w-5 text-amber-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">Attendance</span>
              </Link>
              <Link href="/app/admin/recordings" className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                <Disc className="h-5 w-5 text-purple-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">Recordings</span>
              </Link>
              <Link href="/app/reports" className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                <FileText className="h-5 w-5 text-cyan-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">Reports</span>
              </Link>
              <Link href="/app/audit-logs" className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                <Shield className="h-5 w-5 text-slate-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">Audit Logs</span>
              </Link>
            </div>
          </Card>

          {/* Live Activity Stream */}
          <Card title="Live Activity Feed">
            <div className="space-y-3 text-xs">
              {activity.length > 0 ? (
                activity.slice(0, 5).map((a) => (
                  <div key={a.id} className="border-b border-slate-100 pb-2.5 last:border-0">
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <p className="text-slate-500">{a.desc}</p>
                    <span className="text-[10px] text-slate-400">{a.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No activity recorded yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
