'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Users, KanbanSquare, CheckSquare, MessageCircle, Bell,
  CheckCheck, X, Bot, Circle, Dot,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, EmptyState, Avatar } from '@/components/crm/crm-ui';
import { useNotifications, useActivity } from '@/lib/data/hooks';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { icon: typeof Phone; color: string }> = {
  call: { icon: Phone, color: 'text-primary' },
  lead: { icon: Users, color: 'text-cyan' },
  deal: { icon: KanbanSquare, color: 'text-primary' },
  task: { icon: CheckSquare, color: 'text-yellow-400' },
  message: { icon: MessageCircle, color: 'text-green-400' },
  system: { icon: Bell, color: 'text-muted-foreground' },
};

const FILTERS = ['All', 'Unread', 'High Priority'] as const;
type NotifFilter = (typeof FILTERS)[number];

export default function NotificationsPage() {
  const { data: NOTIFICATIONS = [] } = useNotifications();
  const { data: ACTIVITY = [] } = useActivity();
  const [filter, setFilter] = useState<NotifFilter>('All');

  const notifications = NOTIFICATIONS as unknown as { id: string; type: string; title: string; description: string; time: string; read: boolean; priority: string; link?: string }[];
  const activity = ACTIVITY as unknown as { id: string; title: string; desc: string; time: string; icon: string; color: string; source: string | null }[];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriority = notifications.filter((n) => n.priority === 'high').length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'Unread') return !n.read;
      if (filter === 'High Priority') return n.priority === 'high';
      return true;
    });
  }, [notifications, filter]);

  const markAllRead = () => {
    // PATCH via API would go here
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread • ${highPriority} high priority`}
        actions={
          <Button variant="secondary" size="md" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notification center */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex gap-1 rounded-xl bg-white/5 p-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('relative flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filter === f ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {filter === f && <motion.span layoutId="notif-filter" className="absolute inset-0 rounded-lg bg-primary/20 ring-1 ring-primary/30" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>

          <Card className="p-0">
            {filtered.length > 0 ? (
              <div className="divide-y divide-white/5">
                {filtered.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG['system'];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className={cn('flex items-start gap-3 p-4 transition-colors hover:bg-white/5', !n.read && 'bg-primary/[0.03]')}
                    >
                      <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', !n.read ? 'bg-primary/15' : 'bg-white/5')}>
                        <Icon className={cn('h-5 w-5', cfg.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn('text-sm', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                          {n.priority === 'high' && <Badge variant="red">High</Badge>}
                          {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.description}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground/60">{n.time}</p>
                      </div>
                      {!n.read && (
                        <button className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-primary" title="Mark as read">
                          <CheckCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12"><EmptyState icon={<Bell className="h-6 w-6" />} title="All caught up" desc="No notifications match this filter." /></div>
            )}
          </Card>
        </div>

        {/* Activity feed */}
        <div className="space-y-4">
          <Card title="Activity Feed">
            <div className="relative space-y-4 pl-4">
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/10" />
              {activity.slice(0, 8).map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-3 top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/50">{item.time}</p>
                </div>
              ))}
              {activity.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
            </div>
          </Card>

          <Card title="AI Insights">
            <div className="rounded-xl bg-primary/5 p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-primary"><Bot className="h-4 w-4" />AI Analytics</p>
              <p className="mt-2 text-xs text-muted-foreground">Get AI-powered notification summaries and smart alerts. Connect a provider via <code className="text-cyan">/api/ai/analytics</code>.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
