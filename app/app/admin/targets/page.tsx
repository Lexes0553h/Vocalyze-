'use client';

import { useState } from 'react';
import { Target, Award, Plus, CheckCircle2, Trophy, Users, DollarSign } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, ProgressBar, Modal } from '@/components/crm/crm-ui';
import { toast } from '@/components/ui/toast';

import { useTeam } from '@/lib/data/derived-hooks';

export default function TargetsPage() {
  const { data: teamMembers = [] } = useTeam();
  const [modalOpen, setModalOpen] = useState(false);
  const [employee, setEmployee] = useState('');
  const [targetCalls, setTargetCalls] = useState('250');
  const [targetRevenue, setTargetRevenue] = useState('50000');

  const handleSetTarget = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);
    toast({ title: 'Target Set', description: `New targets set for ${employee || 'employee'}.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telecaller Targets & Bonus Quotas"
        subtitle="Admin Portal • Set Daily & Monthly Call Targets, Revenue Expectations & Rewards"
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Assign New Target
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {teamMembers.length > 0 ? (
          teamMembers.map((t) => (
            <Card key={t.id}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} size={40} ring />
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Call Quota:</span>
                    <span className="font-bold text-slate-900">{t.callsToday || 0} / 250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Revenue Quota:</span>
                    <span className="font-bold text-slate-900">${(t.revenue || 0).toLocaleString()} / $50,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Achievement</span>
                    <span className="text-emerald-600">{t.conversion || 0}%</span>
                  </div>
                  <ProgressBar value={Math.min(t.conversion || 0, 100)} />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No telecaller targets set.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set Telecaller Target">
        <form onSubmit={handleSetTarget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Telecaller</label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="James Holt">James Holt</option>
              <option value="Lena Ortiz">Lena Ortiz</option>
              <option value="Marcus Reid">Marcus Reid</option>
              <option value="Aisha Patel">Aisha Patel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Call Target</label>
            <input
              type="number"
              value={targetCalls}
              onChange={(e) => setTargetCalls(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Revenue Target ($)</label>
            <input
              type="number"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Target</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
