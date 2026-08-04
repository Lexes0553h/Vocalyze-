'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Clock } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState } from '@/components/crm/crm-ui';
import { useAuditLogs } from '@/lib/data/enterprise-hooks';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export default function AuditLogsPage() {
  const { data: logs = [] } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const ms = l.action.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase()) || (l.description || '').toLowerCase().includes(search.toLowerCase());
      const ma = actionFilter === 'all' || l.action === actionFilter;
      return ms && ma;
    });
  }, [logs, search, actionFilter]);

  const actionColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) return 'red';
    if (action.includes('create') || action.includes('add')) return 'green';
    if (action.includes('update') || action.includes('change')) return 'yellow';
    return 'muted';
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle={`${logs.length} tracked actions`} />

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit logs…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none" />
          </div>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
            <option value="all" className="bg-background">All Actions</option>
            {actions.map((a) => <option key={a} value={a} className="bg-background">{a}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                <th className="p-3 font-medium">Timestamp</th>
                <th className="p-3 font-medium">User</th>
                <th className="hidden p-3 font-medium md:table-cell">Role</th>
                <th className="p-3 font-medium">Action</th>
                <th className="hidden p-3 font-medium lg:table-cell">Description</th>
                <th className="hidden p-3 font-medium lg:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: i * 0.02 }} className="border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">{log.userName.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div><span className="font-medium">{log.userName}</span></div></td>
                  <td className="hidden p-3 md:table-cell"><Badge variant="muted">{ROLE_LABELS[log.userRole as keyof typeof ROLE_LABELS] ?? log.userRole}</Badge></td>
                  <td className="p-3"><Badge variant={actionColor(log.action) as 'red' | 'green' | 'yellow' | 'muted'}>{log.action}</Badge></td>
                  <td className="hidden p-3 text-xs text-muted-foreground lg:table-cell">{log.description}</td>
                  <td className="hidden p-3 text-xs text-muted-foreground lg:table-cell">{log.ipAddress}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-12"><EmptyState icon={<Shield className="h-6 w-6" />} title="No audit logs" desc="No actions match your filters." /></div>}
        </div>
      </Card>
    </div>
  );
}
