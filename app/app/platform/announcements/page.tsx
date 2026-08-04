'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useAnnouncements } from '@/lib/data/enterprise-hooks';
import { cn } from '@/lib/utils';

const TYPE_ICONS = { info: Info, success: CheckCircle, warning: AlertTriangle, error: AlertCircle };
const TYPE_COLORS = { info: 'text-cyan', success: 'text-green-400', warning: 'text-yellow-400', error: 'text-red-400' };

export default function AnnouncementsPage() {
  const { data: announcements = [] } = useAnnouncements();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [audience, setAudience] = useState<'all' | 'admins' | 'managers' | 'employees'>('all');

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle={`${announcements.length} active announcements`} actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />New Announcement</Button>} />

      <div className="space-y-3">
        {announcements.map((a, i) => {
          const Icon = TYPE_ICONS[a.type];
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card>
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5', TYPE_COLORS[a.type])}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{a.title}</h3>
                      <Badge variant="muted" className="capitalize">{a.audience}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground/60">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {announcements.length === 0 && <Card><div className="py-12 text-center text-sm text-muted-foreground">No announcements yet. Send platform-wide updates to all companies.</div></Card>}
      </div>

      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium">New Announcement</h2>
                  <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Title</p><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                  <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Body</p><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Type</p><select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"><option value="info" className="bg-background">Info</option><option value="success" className="bg-background">Success</option><option value="warning" className="bg-background">Warning</option><option value="error" className="bg-background">Error</option></select></div>
                    <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">Audience</p><select value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"><option value="all" className="bg-background">All Users</option><option value="admins" className="bg-background">Admins</option><option value="managers" className="bg-background">Managers</option><option value="employees" className="bg-background">Employees</option></select></div>
                  </div>
                  <div className="flex gap-2"><Button variant="primary" className="flex-1" disabled={!title || !body} onClick={() => { setTitle(''); setBody(''); setShowCreate(false); }}><Megaphone className="h-4 w-4" />Send</Button><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button></div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
