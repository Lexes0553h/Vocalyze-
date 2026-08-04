'use client';

import { useState } from 'react';
import { Shield, Lock, Users, Check, AlertCircle, Key } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/auth-context';
import { isCompanyAdmin, isSuperAdmin } from '@/lib/auth/permissions';

interface RolePermItem {
  id: string;
  category: string;
  name: string;
  description: string;
  admin: boolean;
  manager: boolean;
  employee: boolean;
}

const PERMISSION_MATRIX: RolePermItem[] = [
  { id: '1', category: 'Leads & Contacts', name: 'View Assigned Leads', description: 'Access leads assigned to self or team', admin: true, manager: true, employee: true },
  { id: '2', category: 'Leads & Contacts', name: 'View All Company Leads', description: 'Cross-departmental visibility into company lead repository', admin: true, manager: true, employee: false },
  { id: '3', category: 'Leads & Contacts', name: 'Export Lead Data (CSV / PDF)', description: 'Download contact details & export records', admin: true, manager: true, employee: false },
  { id: '4', category: 'Calling & Telephony', name: 'Make Outbound Calls', description: 'Dial prospects via integrated telephony gateway', admin: true, manager: true, employee: true },
  { id: '5', category: 'Calling & Telephony', name: 'Listen to Call Recordings', description: 'Access recorded telecaller audio logs', admin: true, manager: true, employee: false },
  { id: '6', category: 'Team & Staff', name: 'Invite & Manage Employees', description: 'Send invitation links, assign roles, reset passwords', admin: true, manager: false, employee: false },
  { id: '7', category: 'Team & Staff', name: 'Manage Departments & Teams', description: 'Configure organization structure & hierarchy', admin: true, manager: true, employee: false },
  { id: '8', category: 'System & Config', name: 'Configure Telephony Integrations', description: 'Manage Twilio, Exotel, WhatsApp & Gateway credentials', admin: true, manager: false, employee: false },
  { id: '9', category: 'System & Config', name: 'View Audit Logs & Billing', description: 'Access financial transactions & security logs', admin: true, manager: false, employee: false },
];

export default function RolesPermissionsPage() {
  const { user } = useAuth();
  const isAdmin = isCompanyAdmin(user?.role ?? null) || isSuperAdmin(user?.role ?? null);

  const [matrix, setMatrix] = useState<RolePermItem[]>(PERMISSION_MATRIX);

  const togglePermission = (id: string, role: 'manager' | 'employee') => {
    setMatrix((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [role]: !item[role] } : item))
    );
    toast({ title: 'Permission Updated', description: 'Role access policy saved.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role-Based Access Control (RBAC)"
        subtitle="Admin Portal • Manage Access Levels for Company Admins, Managers & Telecallers"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Company Admin</h3>
              <p className="text-xs text-slate-500">Full system control</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Manager / Team Lead</h3>
              <p className="text-xs text-slate-500">Team & report access</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Employee / Telecaller</h3>
              <p className="text-xs text-slate-500">Workstation focused</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Matrix Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Capability / Permission</th>
                <th className="px-6 py-3.5 text-center">Company Admin</th>
                <th className="px-6 py-3.5 text-center">Manager</th>
                <th className="px-6 py-3.5 text-center">Telecaller (Employee)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <Check className="h-4 w-4" />
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={item.manager}
                      disabled={!isAdmin}
                      onChange={() => togglePermission(item.id, 'manager')}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={item.employee}
                      disabled={!isAdmin}
                      onChange={() => togglePermission(item.id, 'employee')}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
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
