'use client';

import { useState } from 'react';
import {
  Users, UserPlus, Search, Filter, Shield, Key, Lock, Mail,
  Phone, UserCheck, Trash2, Edit3, Target, Clock, CheckCircle2, XCircle,
  Copy, Share2, Send, RefreshCw, MessageSquare
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, Modal } from '@/components/crm/crm-ui';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/auth-context';
import { createInvitationRecord, generateInviteUrl } from '@/lib/auth/invitations';

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  callsToday: number;
  conversionRate: number;
  status: 'Active' | 'Suspended' | 'Invited';
  joinedDate: string;
}

const INITIAL_EMPLOYEES: EmployeeItem[] = [];

export default function EmployeeManagementPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeItem[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteLinkModalOpen, setInviteLinkModalOpen] = useState(false);
  const [resetPwModalOpen, setResetPwModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeItem | null>(null);

  // Invite Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Telecaller');
  const [department, setDepartment] = useState('Outbound Sales');
  const [createdInviteUrl, setCreatedInviteUrl] = useState('');

  const filtered = employees.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Validation Error', description: 'Please enter employee email.' });
      return;
    }

    const companyName = user?.tenant?.name || 'Vocalyze Global';
    const tenantId = user?.tenantId || 'tenant_default';

    const invRecord = createInvitationRecord({
      tenant_id: tenantId,
      tenant_name: companyName,
      email,
      name,
      role,
      department,
      invited_by: user?.name || 'Company Admin',
    });

    const inviteUrl = generateInviteUrl(invRecord.token, email, companyName);

    const newEmp: EmployeeItem = {
      id: `emp_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      phone: phone || '+1 (555) 000-0000',
      role,
      department,
      callsToday: 0,
      conversionRate: 0,
      status: 'Invited',
      joinedDate: 'Pending Acceptance',
    };

    setEmployees([newEmp, ...employees]);
    setCreatedInviteUrl(inviteUrl);
    setModalOpen(false);
    setInviteLinkModalOpen(true);
    toast({ title: 'Invitation Generated!', description: `Invitation generated and stored for ${email}.` });
  };

  const handleResendInvite = (emp: EmployeeItem) => {
    const companyName = user?.tenant?.name || 'Vocalyze Global';
    const tenantId = user?.tenantId || 'tenant_default';

    const invRecord = createInvitationRecord({
      tenant_id: tenantId,
      tenant_name: companyName,
      email: emp.email,
      name: emp.name,
      role: emp.role,
      department: emp.department,
      invited_by: user?.name || 'Company Admin',
    });

    const inviteUrl = generateInviteUrl(invRecord.token, emp.email, companyName);
    setCreatedInviteUrl(inviteUrl);
    setInviteLinkModalOpen(true);
    toast({ title: 'Invitation Resent!', description: `Fresh invitation link created for ${emp.email}.` });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Invitation link copied to clipboard.' });
  };

  const shareViaWhatsApp = (url: string) => {
    const text = encodeURIComponent(`Hi ${name || 'there'}! You have been invited to join ${user?.tenant?.name || 'Vocalyze Global'} CRM workspace as a ${role} (${department}). Set up your password and log in here: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const sendViaEmail = () => {
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Invitation to join ${user?.tenant?.name || 'Vocalyze Global'}`)}&body=${encodeURIComponent(
      `Hi ${name || 'there'},\n\nYou have been invited to join ${user?.tenant?.name || 'Vocalyze Global'} CRM as a ${role} in ${department}.\n\nAccept your invitation and activate your account using the link below:\n${createdInviteUrl}\n\nNote: This link expires in 7 days.\n\nBest regards,\n${user?.name || 'Admin'}`
    )}`;
    window.open(mailto, '_blank');
    toast({ title: 'Email Mailto Opened', description: 'Generated email template in your mail app. Configure SMTP in Integrations for automated server dispatch.' });
  };

  const downloadInviteText = () => {
    const content = `COMPANY INVITATION
Company: ${user?.tenant?.name || 'Vocalyze Global'}
Invited Employee: ${name || email}
Role: ${role} (${department})
Expiry Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Invitation Link:
${createdInviteUrl}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitation_${email.split('@')[0]}.txt`;
    a.click();
    toast({ title: 'Downloaded', description: 'Invitation details saved as text file.' });
  };

  const toggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, status: emp.status === 'Active' ? 'Suspended' : 'Active' } : emp
      )
    );
    toast({ title: 'Status Updated', description: 'Employee account status was updated.' });
  };

  const triggerResetPw = (emp: EmployeeItem) => {
    setSelectedEmp(emp);
    setResetPwModalOpen(true);
  };

  const confirmResetPw = () => {
    if (selectedEmp) {
      toast({ title: 'Password Reset Sent', description: `Password reset link emailed to ${selectedEmp.email}` });
    }
    setResetPwModalOpen(false);
  };

  const deleteEmp = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    toast({ title: 'Employee Removed', description: 'Employee account was removed.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee & Telecaller Management"
        subtitle="Admin Portal • Invite Staff, Multi-Tenant Roles, Reset Passwords & Monitor Activity"
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4" /> Invite Employee
          </Button>
        }
      />

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span>Active: {employees.filter((e) => e.status === 'Active').length}</span>
          <span>•</span>
          <span>Invited: {employees.filter((e) => e.status === 'Invited').length}</span>
          <span>•</span>
          <span>Total: {employees.length} Staff</span>
        </div>
      </div>

      {/* Employee Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Role & Department</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Calls Today</th>
                <th className="px-6 py-3.5">Conversion</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size={40} ring />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{emp.role}</p>
                      <p className="text-xs text-slate-500">{emp.department}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">{emp.phone}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">{emp.callsToday} calls</td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">{emp.conversionRate}%</td>
                    <td className="px-6 py-4">
                      <Badge variant={emp.status === 'Active' ? 'green' : emp.status === 'Invited' ? 'yellow' : 'red'}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => triggerResetPw(emp)}>
                          <Key className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(emp.id)}>
                          {emp.status === 'Active' ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteEmp(emp.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                    No employees found. Click &quot;Invite Employee&quot; to add staff members.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Employee Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite Employee to Company Workspace">
        <form onSubmit={handleInvite} className="space-y-4">
          <p className="text-xs text-slate-500">
            Employees will receive a unique invitation link to set their password and join your company CRM automatically.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. robert.vance@xyzcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Robert Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="Telecaller">Telecaller (Employee)</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="Outbound Sales">Outbound Sales</option>
                <option value="Inbound Sales">Inbound Sales</option>
                <option value="Enterprise Sales">Enterprise Sales</option>
                <option value="Renewals">Renewals</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">
              <Mail className="h-4 w-4" /> Generate Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invitation Created Link Modal */}
      <Modal open={inviteLinkModalOpen} onClose={() => setInviteLinkModalOpen(false)} title="Employee Invitation Ready">
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Choose your preferred method to invite <span className="font-bold text-slate-900 dark:text-white">{name || email}</span> to your CRM workspace:
          </p>

          {/* Invitation Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => copyToClipboard(createdInviteUrl)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <Copy className="h-4 w-4 text-primary shrink-0" />
              <span>Copy Invitation Link</span>
            </button>

            <button
              onClick={() => shareViaWhatsApp(createdInviteUrl)}
              className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={sendViaEmail}
              className="flex items-center gap-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors"
            >
              <Mail className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Send via Email</span>
            </button>

            <button
              onClick={downloadInviteText}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <Share2 className="h-4 w-4 text-slate-500 shrink-0" />
              <span>Download Invite Text</span>
            </button>
          </div>

          {/* Invitation Link Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Direct Invitation Link</label>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 p-2.5 border border-slate-200 dark:border-white/10">
              <input
                type="text"
                readOnly
                value={createdInviteUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 outline-none"
              />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdInviteUrl)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Generated Email Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> Generated Email Template</p>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Expires in 7 Days</span>
            </div>
            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 font-sans">
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Company:</span> {user?.tenant?.name || 'Vocalyze Global'}</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Invited Employee:</span> {name || email}</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Role:</span> {role} ({department})</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Expiry Date:</span> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p className="pt-1 italic text-[11px] text-muted-foreground">&quot;Welcome to {user?.tenant?.name || 'Vocalyze Global'}! Click the invitation link above to set up your password and access your workspace.&quot;</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setInviteLinkModalOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={resetPwModalOpen} onClose={() => setResetPwModalOpen(false)} title="Reset Employee Password">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Send a secure password reset link to <span className="font-bold">{selectedEmp?.email}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setResetPwModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmResetPw}>
              <RefreshCw className="h-4 w-4" /> Send Reset Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
