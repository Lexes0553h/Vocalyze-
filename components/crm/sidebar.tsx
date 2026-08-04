'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, ChevronLeft, Globe } from 'lucide-react';
import { EMPLOYEE_NAV_ITEMS, ADMIN_NAV_ITEMS, NAV_GROUPS, GROUP_ORDER } from '@/components/crm/nav-config';
import { useAuth } from '@/lib/auth/auth-context';
import { isCompanyAdmin, isSuperAdmin } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdminRole = isCompanyAdmin(user?.role ?? null) || isSuperAdmin(user?.role ?? null) || user?.role === 'manager';
  const visibleItems = isAdminRole ? ADMIN_NAV_ITEMS : EMPLOYEE_NAV_ITEMS;

  const userName = user?.name ?? 'Loading…';
  const userRole = user?.role ?? '';
  const userAvatar = user?.avatar || '';
  const tenantName = user?.tenant?.name ?? '';

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo + tenant */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link href={isAdminRole ? '/app/admin' : '/app/dashboard'} className="flex items-center gap-2">
          {user?.tenant?.logo ? (
            <img src={user.tenant.logo} alt="Company Logo" className="h-8 w-8 rounded-lg object-cover ring-1 ring-primary/20" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight leading-none truncate max-w-[130px]">
              {user?.tenant?.name || 'My Company'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">CRM Workspace</span>
          </div>
        </Link>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-100 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {GROUP_ORDER.map((group) => {
          const items = visibleItems.filter((i) => i.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-4">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {NAV_GROUPS[group]}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/80'
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/20"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={cn('relative z-10 h-4 w-4 shrink-0', active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')} />
                      <span className="relative z-10 flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User card */}
      <div className="shrink-0 border-t border-slate-200/80 p-3">
        <Link href="/app/settings" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary ring-2 ring-primary/30">
              {userName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{userRole.replace('_', ' ')}</p>
          </div>
          <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-200 bg-white/95 backdrop-blur-xl lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 380, damping: 40 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white backdrop-blur-xl lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
