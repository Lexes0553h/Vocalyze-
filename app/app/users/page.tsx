'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, MoreVertical, Ban, CheckCircle2, Trash2,
  KeyRound, Edit3, X, Mail, Shield, Users as UsersIcon,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useTenantUsers, useDepartments, useTeams } from '@/lib/data/enterprise-hooks';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const { data: users = [] } = useTenantUsers();
  const { data: departments = [] } = useDepartments();
  const { data: teams = [] } = useTeams();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const mr = roleFilter === 'all' || u.role === roleFilter;
      const mst = statusFilter === 'all' || (statusFilter === 'active' && !u.disabled) || (statusFilter === 'disabled' && u.disabled);
      return ms && mr && mst;
    });
  }, [users, search, roleFilter, statusFilter]);

  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? '—';
  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle={`${users.length} users • ${users.filter((u) => !u.disabled).length} active`} actions={<Button variant="primary" onClick={() => setShowInvite(true)}><UserPlus className="h-4 w-4" />Invite User</Button>} />

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
            <option value="all" className="bg-background">All Roles</option>
            <option value="company_admin" className="bg-background">Company Admin</option>
            <option value="manager" className="bg-background">Manager</option>
            <option value="team_leader" className="bg-background">Team Leader</option>
            <option value="employee" className="bg-background">Employee</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
            <option value="all" className="bg-background">All Status</option>
            <option value="active" className="bg-background">Active</option>
            <option value="disabled" className="bg-background">Disabled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Role</th>
                <th className="hidden p-3 font-medium md:table-cell">Department</th>
                <th className="hidden p-3 font-medium lg:table-cell">Team</th>
                <th className="hidden p-3 font-medium lg:table-cell">Last Login</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">{u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
                        <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background', u.status === 'online' ? 'bg-green-400' : 'bg-muted-foreground/40')} />
                      </div>
                      <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="p-3"><Badge variant="muted">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}</Badge></td>
                  <td className="hidden p-3 text-muted-foreground md:table-cell">{deptName(u.departmentId)}</td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{teamName(u.teamId)}</td>
                  <td className="hidden p-3 text-xs text-muted-foreground lg:table-cell">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="p-3"><Badge variant={u.disabled ? 'red' : 'green'}>{u.disabled ? 'Disabled' : 'Active'}</Badge></td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button title="Reset Password" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><KeyRound className="h-3.5 w-3.5" /></button>
                      <button title={u.disabled ? 'Activate' : 'Disable'} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground">{u.disabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}</button>
                      <button title="Remove" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">No users found.</div>}
        </div>
      </Card>

      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvite(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">Invite User</h2>
                  <button onClick={() => setShowInvite(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Full Name</p>
                    <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jane Smith" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Email Address</p>
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jane@company.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Role</p>
                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none">
                      <option value="employee" className="bg-background">Employee</option>
                      <option value="team_leader" className="bg-background">Team Leader</option>
                      <option value="manager" className="bg-background">Manager</option>
                      <option value="company_admin" className="bg-background">Company Admin</option>
                    </select>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-medium text-primary"><Mail className="h-3.5 w-3.5" />Invitation</p>
                    <p className="mt-1">An email invitation will be sent with a secure sign-up link valid for 7 days.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" disabled={!inviteEmail || !inviteName}><UserPlus className="h-4 w-4" />Send Invitation</Button>
                    <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
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
