'use client';

import { Users, Award, Phone, CheckCircle2, DollarSign } from 'lucide-react';
import { PageHeader, Card, StatCard, Avatar, ProgressBar } from '@/components/crm/crm-ui';
import { useTeam } from '@/lib/data/derived-hooks';
import { useCalls, useDeals } from '@/lib/data/hooks';

export default function TeamPerformancePage() {
  const { data: teamMembers = [] } = useTeam();
  const { data: calls = [] } = useCalls();
  const { data: deals = [] } = useDeals();

  const totalCalls = calls.length;
  const totalConnected = calls.filter((c) => c.status === 'Completed' || c.duration).length;
  const dealsClosed = deals.filter((d) => d.stage === 'Closed').length;
  const totalRevenue = deals
    .filter((d) => d.stage === 'Closed')
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Performance & Telecaller Ranking"
        subtitle="Admin Analytics • Individual Conversion Rates, Call Volume & Revenue Achievements"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Team Calls" value={totalCalls.toLocaleString()} change={0} icon={<Phone className="h-5 w-5 text-emerald-600" />} index={0} />
        <StatCard label="Total Connected" value={totalConnected.toLocaleString()} change={0} icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />} index={1} />
        <StatCard label="Deals Closed" value={dealsClosed.toLocaleString()} change={0} icon={<Award className="h-5 w-5 text-amber-600" />} index={2} />
        <StatCard label="Total Team Revenue" value={`$${totalRevenue.toLocaleString()}`} change={0} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} index={3} />
      </div>

      <Card title="Telecaller Performance Rankings">
        <div className="space-y-4">
          {teamMembers.length > 0 ? (
            teamMembers.map((member, index) => (
              <div key={member.id || member.name} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 transition-colors shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700">
                    #{index + 1}
                  </span>
                  <Avatar name={member.name} size={42} ring />
                  <div>
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role || 'Telecaller'} • {member.callsToday || 0} calls today</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center md:text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Deals Closed</span>
                    <p className="text-sm font-bold text-slate-800">{member.dealsClosed || 0} deals</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Conversion</span>
                    <p className="text-sm font-bold text-emerald-600">{member.conversion || 0}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Revenue</span>
                    <p className="text-sm font-bold text-slate-900">${(member.revenue || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="w-full md:w-36">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Quota</span>
                    <span className="text-emerald-700">{member.conversion || 0}%</span>
                  </div>
                  <ProgressBar value={Math.min(member.conversion || 0, 100)} />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 px-4 text-center">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Team Members Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your team performance will appear here once you add employees and they start working.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
