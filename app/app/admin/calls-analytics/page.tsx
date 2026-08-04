'use client';

import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { PageHeader, Card, StatCard, Badge, ProgressBar } from '@/components/crm/crm-ui';

import { useCalls } from '@/lib/data/hooks';

export default function CallsAnalyticsPage() {
  const { data: calls = [] } = useCalls();

  const totalCalls = calls.length;
  const inboundCount = calls.filter((c) => c.direction === 'inbound').length;
  const outboundCount = calls.filter((c) => c.direction === 'outbound').length;
  const missedCount = calls.filter((c) => c.direction === 'missed').length;
  const missedRate = totalCalls > 0 ? Math.round((missedCount / totalCalls) * 100) : 0;

  // Group by hour
  const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
  const hourlyData = hours.map((hour, idx) => {
    const targetHour = idx + 9;
    const hourCalls = calls.filter((c) => {
      const d = new Date(c.date || Date.now());
      return d.getHours() === targetHour;
    }).length;
    return { hour, calls: hourCalls };
  });

  const maxCalls = Math.max(...hourlyData.map((d) => d.calls), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calls Analytics & Peak Hour Intelligence"
        subtitle="Telephony Metrics • Inbound, Outbound, Missed Calls & Disposition Breakdown"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Dialed" value={totalCalls.toLocaleString()} change={0} icon={<PhoneOutgoing className="h-5 w-5 text-blue-600" />} index={0} />
        <StatCard label="Inbound Calls" value={inboundCount.toLocaleString()} change={0} icon={<PhoneIncoming className="h-5 w-5 text-emerald-600" />} index={1} />
        <StatCard label="Missed Rate" value={`${missedRate}%`} change={0} icon={<PhoneMissed className="h-5 w-5 text-red-500" />} index={2} />
        <StatCard label="Outbound Calls" value={outboundCount.toLocaleString()} change={0} icon={<Clock className="h-5 w-5 text-purple-600" />} index={3} />
      </div>

      <Card title="Hourly Call Distribution (Peak Hours)">
        {totalCalls > 0 ? (
          <div className="flex h-56 items-end gap-3 pt-6">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    style={{ height: `${(d.calls / maxCalls) * 100}%` }}
                    className="w-full rounded-t-lg bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs"
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{d.hour}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No call analytics available.
          </div>
        )}
      </Card>
    </div>
  );
}
