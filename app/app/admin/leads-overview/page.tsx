'use client';

import { useState } from 'react';
import { Users, Filter, Search, UserCheck, Shield, ChevronRight } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { useLeads } from '@/lib/data/hooks';
import { toast } from '@/components/ui/toast';

export default function AdminLeadsOverviewPage() {
  const { data: leads = [] } = useLeads();
  const [search, setSearch] = useState('');

  const filtered = leads.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Leads Overview"
        subtitle="Executive Lead Distribution, Pipeline Assignment & Telecaller Allocation"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads across company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Lead / Company</th>
                <th className="px-6 py-3.5">Assigned Telecaller</th>
                <th className="px-6 py-3.5">Stage</th>
                <th className="px-6 py-3.5">Value</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={lead.avatar} name={lead.name} size={36} />
                      <div>
                        <p className="font-bold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{lead.agent || 'Unassigned'}</td>
                  <td className="px-6 py-4"><Badge variant="primary">{lead.status}</Badge></td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900">${lead.value?.toLocaleString()}</td>
                  <td className="px-6 py-4"><Badge variant={lead.priority === 'Urgent' ? 'red' : 'green'}>{lead.priority}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => toast({ title: 'Lead Reassigned', description: 'Assigned to next available telecaller.' })}>
                      Reassign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
