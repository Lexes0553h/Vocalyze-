'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  Users,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Target,
  TrendingUp,
  MessageCircle,
  Plus,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader, StatCard, Card, Badge, Button, Avatar, ProgressBar } from '@/components/crm/crm-ui';
import { useAuth } from '@/lib/auth/auth-context';
import { isCompanyAdmin, isSuperAdmin, isManagerOrAbove } from '@/lib/auth/permissions';
import {
  useCalls, useLeads, useTasks, useActivity,
} from '@/lib/data/hooks';
import { CommunicationModal, CommType } from '@/components/crm/communication-dialog';
import { toast } from '@/components/ui/toast';
import { AiCallInsightsCard } from '@/components/ai/ai-call-insights-card';

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? 'employee';
  const isAdmin = isCompanyAdmin(role) || isSuperAdmin(role) || isManagerOrAbove(role);

  // Communication modal
  const [commModal, setCommModal] = useState<{ open: boolean; type: CommType; name?: string; contact?: string }>({
    open: false,
    type: 'call',
  });

  const { data: calls = [] } = useCalls();
  const { data: leads = [] } = useLeads();
  const { data: tasks = [] } = useTasks();
  const { data: activity = [] } = useActivity();

  const userName = user?.name?.split(' ')[0] ?? 'Telecaller';

  const todayCalls = calls.filter((c) => c.date === 'Today' || !c.date);
  const missedCalls = calls.filter((c) => c.direction === 'missed' || c.disposition === 'No Answer');
  const pendingFollowups = leads.filter((l) => l.status === 'Contacted' || l.status === 'Qualified');
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');

  const triggerComm = (type: CommType, name?: string, contact?: string) => {
    setCommModal({ open: true, type, name, contact });
  };

  return (
    <div className="space-y-6">
      <CommunicationModal
        open={commModal.open}
        onOpenChange={(open) => setCommModal((prev) => ({ ...prev, open }))}
        type={commModal.type}
        recipientName={commModal.name}
        recipientContact={commModal.contact}
      />

      {/* Admin Notice Banner if Admin accesses Employee Dashboard */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-md border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">You are viewing the Employee Telecaller Dashboard</p>
              <p className="text-xs text-slate-400">Switch to the Executive Admin Dashboard for company-wide analytics & management.</p>
            </div>
          </div>
          <Link href="/app/admin" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              Go to Admin Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={`Hello, ${userName}`}
        subtitle="Telecaller Workstation • Daily Calling Targets & Assigned Queue"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/app/notes" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                <FileText className="h-4 w-4" /> Add Quick Note
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => triggerComm('call', todayCalls[0]?.contact || 'Next Lead', todayCalls[0]?.phone || '+1 (555) 019-2834')}
            >
              <PhoneCall className="h-4 w-4" /> Start Dialing Session
            </Button>
          </div>
        }
      />

      {/* Employee Key Stat Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Today's Calls"
          value={String(todayCalls.length)}
          change={0}
          icon={<Phone className="h-5 w-5 text-emerald-600" />}
          index={0}
        />
        <StatCard
          label="Pending Follow-ups"
          value={String(pendingFollowups.length)}
          change={0}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          index={1}
        />
        <StatCard
          label="Today's Target"
          value={`${todayCalls.length} / 30 Calls`}
          change={0}
          icon={<Target className="h-5 w-5 text-blue-600" />}
          index={2}
        />
        <StatCard
          label="Completed Calls"
          value={String(calls.filter((c) => c.status === 'Completed' || c.duration).length)}
          change={0}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          index={3}
        />
        <StatCard
          label="Conversion %"
          value={leads.length > 0 ? `${Math.round((leads.filter((l) => l.status === 'Won').length / leads.length) * 100)}%` : '0%'}
          change={0}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          index={4}
        />
        <StatCard
          label="Missed Calls"
          value={String(missedCalls.length)}
          change={0}
          icon={<PhoneMissed className="h-5 w-5 text-red-500" />}
          index={5}
        />
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => triggerComm('call', 'Assigned Lead Queue', '+1 (555) 012-3456')}
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Make New Call</p>
            <p className="text-xs text-slate-500">Launch dialer</p>
          </div>
        </button>

        <Link href="/app/leads" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">My Leads ({leads.length})</p>
            <p className="text-xs text-slate-500">Manage pipeline</p>
          </div>
        </Link>

        <Link href="/app/tasks" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Follow-up Tasks</p>
            <p className="text-xs text-slate-500">{pendingTasks.length} pending</p>
          </div>
        </Link>

        <Link href="/app/notes" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Notes & Logs</p>
            <p className="text-xs text-slate-500">Call remarks</p>
          </div>
        </Link>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Scheduled Calls & Hot Leads */}
        <div className="space-y-6 lg:col-span-2">
          {/* Scheduled Calls Queue */}
          <Card
            title="Today's Scheduled Calls Queue"
            action={<Link href="/app/calls" className="text-xs font-semibold text-emerald-700 hover:underline">View All Calls</Link>}
          >
            <div className="space-y-3">
              {todayCalls.length > 0 ? (
                todayCalls.slice(0, 5).map((call) => (
                  <div key={call.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={call.contact} size={40} ring />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{call.contact}</p>
                        <p className="text-xs text-slate-500 truncate">{call.company} • Scheduled {call.time || '10:30 AM'}</p>
                        {call.notes && <p className="text-[11px] text-slate-400 truncate mt-0.5">&ldquo;{call.notes}&rdquo;</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="primary" onClick={() => triggerComm('call', call.contact, call.phone)}>
                        <Phone className="h-3.5 w-3.5" /> Call Now
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => triggerComm('whatsapp', call.contact, call.phone)}>
                        <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No calls scheduled for today.</p>
              )}
            </div>
          </Card>

          {/* Assigned Hot Leads */}
          <Card
            title="Assigned Hot Prospects"
            action={<Link href="/app/leads" className="text-xs font-semibold text-emerald-700 hover:underline">All Assigned Leads</Link>}
          >
            <div className="space-y-3">
              {leads.length > 0 ? (
                leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 transition-colors shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={lead.avatar} name={lead.name} size={40} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                        <p className="text-xs text-slate-500 truncate">{lead.company} • Value: ${lead.value?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={lead.priority === 'Urgent' ? 'red' : 'primary'}>{lead.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => triggerComm('call', lead.name, lead.phone)}>
                        Call
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No leads assigned.</p>
              )}
            </div>
          </Card>

          {/* Employee-Specific AI Insights */}
          <AiCallInsightsCard
            calls={calls}
            title="Your AI Call Intelligence & Follow-up Drafts"
            subtitle="Automated summaries, sentiment analysis, and follow-up drafts for your completed calls."
            employeeOnlyName={user?.name}
          />
        </div>

        {/* Right Column: Daily Target Progress, Pending Tasks, Recent Logs */}
        <div className="space-y-6">
          {/* Today's Target Card */}
          <Card title="Daily Target & Completion">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Calls Target ({todayCalls.length} / 30 Calls)</span>
                  <span className="text-emerald-700 font-extrabold">{Math.min(Math.round((todayCalls.length / 30) * 100), 100)}%</span>
                </div>
                <ProgressBar value={Math.min(Math.round((todayCalls.length / 30) * 100), 100)} />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Follow-Ups Contacted ({pendingFollowups.filter((f) => f.status === 'Contacted' || f.status === 'Won').length} / {pendingFollowups.length || 1})</span>
                  <span className="text-blue-700 font-extrabold">
                    {pendingFollowups.length > 0 ? Math.round((pendingFollowups.filter((f) => f.status === 'Contacted' || f.status === 'Won').length / pendingFollowups.length) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar value={pendingFollowups.length > 0 ? Math.round((pendingFollowups.filter((f) => f.status === 'Contacted' || f.status === 'Won').length / pendingFollowups.length) * 100) : 0} />
              </div>
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card title="Today's Pending Tasks">
            <div className="space-y-2.5">
              {pendingTasks.length > 0 ? (
                pendingTasks.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{t.title}</p>
                      <p className="text-slate-500">{t.description || 'Follow up with prospect'}</p>
                      <span className="text-[10px] text-amber-600 font-medium">Due {t.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No tasks assigned.</p>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Your Recent Activity">
            <div className="space-y-3 text-xs">
              {activity.length > 0 ? (
                activity.slice(0, 4).map((a) => (
                  <div key={a.id} className="border-b border-slate-100 pb-2.5 last:border-0">
                    <p className="font-semibold text-slate-800">{a.title}</p>
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
