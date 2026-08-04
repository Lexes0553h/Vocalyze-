'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Users, MoreVertical, Edit3, Trash2, X } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useDepartments, useTenantUsers, useCurrentTenant } from '@/lib/data/enterprise-hooks';
import { insertRecord } from '@/lib/data/crud';
import { cn } from '@/lib/utils';

export default function DepartmentsPage() {
  const { data: currentTenant } = useCurrentTenant();
  const { data: departments = [], refetch } = useDepartments();
  const { data: users = [] } = useTenantUsers();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberCount = (deptId: string) => users.filter((u) => u.departmentId === deptId).length;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await insertRecord('departments', {
        tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000000',
        name: name.trim(),
        description: description.trim(),
      });
      refetch();
      setName('');
      setDescription('');
      setShowCreate(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" subtitle={`${departments.length} departments in your company`} actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />New Department</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }} whileHover={{ y: -4 }}>
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary"><Building2 className="h-6 w-6" /></div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-3 font-medium">{d.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{d.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{memberCount(d.id)} members</span>
                <div className="flex gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
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
                  <h2 className="text-lg font-medium">New Department</h2>
                  <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Department Name</p>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales, Marketing, Support" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Description</p>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does this department do?" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" disabled={!name.trim() || isSubmitting} onClick={handleCreate}>
                      {isSubmitting ? 'Creating...' : 'Create Department'}
                    </Button>
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
