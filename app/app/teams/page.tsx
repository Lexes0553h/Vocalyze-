'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, UserCog, Crown, MoreVertical, X, Building2 } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { useTeams, useTenantUsers, useDepartments } from '@/lib/data/enterprise-hooks';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export default function TeamsPage() {
  const { data: teams = [] } = useTeams();
  const { data: users = [] } = useTenantUsers();
  const { data: departments = [] } = useDepartments();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [leaderId, setLeaderId] = useState('');

  const userName = (id: string | null) => users.find((u) => u.id === id)?.name ?? 'Unassigned';
  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Teams" subtitle={`${teams.length} teams across ${departments.length} departments`} actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />New Team</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }} whileHover={{ y: -4 }}>
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary"><Users className="h-6 w-6" /></div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-3 font-medium">{t.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="h-3 w-3" />{deptName(t.departmentId)}</p>
              <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Manager:</span>
                  <span className="text-xs font-medium">{userName(t.managerId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCog className="h-3.5 w-3.5 text-cyan" />
                  <span className="text-xs text-muted-foreground">Team Leader:</span>
                  <span className="text-xs font-medium">{userName(t.teamLeaderId)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">New Team</h2>
                  <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Team Name</p>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales Team A" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Department</p>
                    <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                      <option value="" className="bg-background">Select department</option>
                      {departments.map((d) => <option key={d.id} value={d.id} className="bg-background">{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Manager</p>
                    <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                      <option value="" className="bg-background">Select manager</option>
                      {users.filter((u) => u.role === 'manager' || u.role === 'company_admin').map((u) => <option key={u.id} value={u.id} className="bg-background">{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Team Leader</p>
                    <select value={leaderId} onChange={(e) => setLeaderId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                      <option value="" className="bg-background">Select team leader</option>
                      {users.filter((u) => u.role === 'team_leader').map((u) => <option key={u.id} value={u.id} className="bg-background">{u.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" disabled={!name} onClick={() => { setName(''); setShowCreate(false); }}>Create Team</Button>
                    <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
