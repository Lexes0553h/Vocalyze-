'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Phone, TrendingUp, DollarSign, Users, Activity,
  Download, FileText, CheckCircle2, Clock, Filter,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  { icon: BarChart3, title: 'Sales Performance', desc: 'Rep-level metrics, quotas & win rates', color: 'text-primary' },
  { icon: Phone, title: 'Call Analytics', desc: 'Volume, duration & disposition breakdown', color: 'text-cyan' },
  { icon: TrendingUp, title: 'Lead Conversion', desc: 'Funnel drop-off & stage velocity', color: 'text-primary' },
  { icon: DollarSign, title: 'Revenue Summary', desc: 'MRR, ARPU & cohort retention', color: 'text-cyan' },
  { icon: Users, title: 'Agent Activity', desc: 'Calls, tasks & productivity per rep', color: 'text-primary' },
  { icon: Activity, title: 'Pipeline Health', desc: 'Deal aging, slippage & coverage', color: 'text-cyan' },
];

const RECENT_REPORTS = [
  { name: 'Sales Performance — July', date: 'Jul 27, 2026', format: 'PDF', status: 'Ready' },
  { name: 'Call Analytics — Week 30', date: 'Jul 26, 2026', format: 'CSV', status: 'Ready' },
  { name: 'Lead Conversion — Q3', date: 'Jul 25, 2026', format: 'Excel', status: 'Generating' },
  { name: 'Revenue Summary — July', date: 'Jul 24, 2026', format: 'PDF', status: 'Ready' },
  { name: 'Pipeline Health — Weekly', date: 'Jul 23, 2026', format: 'CSV', status: 'Ready' },
];

export default function ReportsPage() {
  const [range, setRange] = useState('Last 30 days');
  const [format, setFormat] = useState('PDF');

  const downloadCSVReport = (reportName: string) => {
    const csvContent = `Report Name,Generated Date,Organization,Status\n"${reportName}",${new Date().toLocaleDateString()},Vocalyze Global,Exported\n\nMetric,Value\nTotal Calls,1284\nAnswered Calls,1140\nConversion Rate,24.8%\nRevenue MTD,$689000`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (rName: string, rFormat: string) => {
    if (rFormat === 'CSV' || format === 'CSV') {
      downloadCSVReport(rName);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Generate and export interactive reports" />

      {/* Report type cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl glass-card p-5 transition-all hover:border-primary/30"
            >
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20', r.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium">{r.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
              <Button variant="secondary" size="sm" className="mt-4 w-full">
                <FileText className="h-3.5 w-3.5" />Generate
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Date filter bar */}
      <Card title="Report Builder" action={<Filter className="h-4 w-4 text-muted-foreground" />} delay={0.1}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Date Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            >
              {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            >
              {['PDF', 'CSV', 'Excel'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto" onClick={() => handleDownload('Executive_Report', format)}><FileText className="h-4 w-4" />Generate</Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleDownload('Executive_Report', format)}><Download className="h-4 w-4" />Download</Button>
          </div>
        </div>
      </Card>

      {/* Recent reports */}
      <Card title="Recent Reports" delay={0.15}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Report Name</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Format</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS.map((r) => (
                <tr key={r.name} className="border-b border-white/5 last:border-0">
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3 text-muted-foreground">{r.date}</td>
                  <td className="py-3"><Badge variant="muted">{r.format}</Badge></td>
                  <td className="py-3">
                    {r.status === 'Ready' ? (
                      <Badge variant="green"><CheckCircle2 className="mr-1 h-3 w-3" />Ready</Badge>
                    ) : (
                      <Badge variant="cyan"><Clock className="mr-1 h-3 w-3" />Generating</Badge>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={r.status !== 'Ready'}
                      onClick={() => handleDownload(r.name, r.format)}
                    >
                      <Download className="h-3.5 w-3.5" />
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
