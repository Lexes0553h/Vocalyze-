'use client';

import { useState } from 'react';
import { User, Mail, Phone, Shield, Lock, Building2, Save } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar } from '@/components/crm/crm-ui';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from '@/components/ui/toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'User');
  const [email] = useState(user?.email || 'user@xyzcompany.com');
  const [title, setTitle] = useState(user?.title || 'Telecalling Representative');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Profile Updated', description: 'Your personal information has been saved.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="User Profile & Account Settings" subtitle="Personal Info • Workspace Preferences & Security Credentials" />

      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <Avatar name={name} src={user?.avatar} size={72} ring />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{name}</h2>
              <p className="text-xs text-slate-500">{email}</p>
              <div className="mt-1.5 flex gap-2">
                <Badge variant="green">{user?.role ? user.role.replace('_', ' ') : 'Employee'}</Badge>
                <Badge variant="primary">Vocalyze Workspace</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Designation</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization</label>
              <input
                type="text"
                disabled
                value="Vocalyze Global"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" /> Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
