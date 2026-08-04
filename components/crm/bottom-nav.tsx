'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Phone, CheckSquare, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { isCompanyAdmin, isSuperAdmin } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export function BottomNav({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdminRole = isCompanyAdmin(user?.role ?? null) || isSuperAdmin(user?.role ?? null) || user?.role === 'manager';
  const dashboardHref = isAdminRole ? '/app/admin' : '/app/dashboard';
  const leadsHref = isAdminRole ? '/app/admin/leads-overview' : '/app/leads';

  const items = [
    { label: 'Dashboard', icon: LayoutDashboard, href: dashboardHref },
    { label: 'Leads', icon: Users, href: leadsHref },
    { label: 'Calls', icon: Phone, href: '/app/calls' },
    { label: 'Tasks', icon: CheckSquare, href: '/app/tasks' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 backdrop-blur-xl shadow-lg lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/app/dashboard' && item.href !== '/app/admin' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-medium transition-colors min-h-[44px]',
              isActive ? 'text-primary font-semibold' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Icon className={cn('h-5 w-5 transition-transform active:scale-95', isActive ? 'text-primary scale-105' : 'text-slate-400')} />
            <span className="truncate max-w-[64px]">{item.label}</span>
          </Link>
        );
      })}
      <button
        onClick={onOpenMore}
        type="button"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-900 transition-colors min-h-[44px]"
      >
        <MoreHorizontal className="h-5 w-5 text-slate-400 active:scale-95 transition-transform" />
        <span>More</span>
      </button>
    </nav>
  );
}
