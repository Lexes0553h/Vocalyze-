'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  CreditCard,
  ChevronRight,
  Plus,
  PhoneCall,
  Users,
  Mail,
  CheckSquare,
  Command,
  ChevronDown,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/crm-data';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: 'New Call', icon: PhoneCall, href: '/app/calls' },
  { label: 'New Lead', icon: Users, href: '/app/leads' },
  { label: 'New Email', icon: Mail, href: '/app/email' },
  { label: 'New Task', icon: CheckSquare, href: '/app/tasks' },
];

const PROFILE_MENU = [
  { label: 'Profile', icon: User, href: '/app/settings' },
  { label: 'Settings', icon: Settings, href: '/app/settings' },
  { label: 'Billing', icon: CreditCard, href: '/app/billing' },
];

function useClickOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

export function TopNav({ onMenuClick, breadcrumb }: { onMenuClick: () => void; breadcrumb: ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ type: string; id: string; title: string; subtitle: string; href: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { user, signOut } = useAuth();
  const router = useRouter();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(quickRef, () => setQuickOpen(false));
  useClickOutside(searchContainerRef, () => setSearchOpen(false));

  // Global Cmd/Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live search query fetching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl lg:px-6">
      {/* Left section: Hamburger menu + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-100 hover:text-foreground lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center min-w-0 sm:flex">{breadcrumb}</div>
      </div>

      {/* Middle section: Search bar (desktop/tablet) */}
      <div ref={searchContainerRef} className="relative hidden max-w-xs flex-1 md:block mx-4">
        <form onSubmit={handleSearchSubmit}>
          <div className={cn(
            'relative flex items-center rounded-xl border bg-slate-50 transition-all',
            searchFocused || searchOpen ? 'border-primary/50 ring-2 ring-primary/20 bg-white' : 'border-slate-200'
          )}>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground/60" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                setSearchFocused(true);
                setSearchOpen(true);
              }}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search leads, calls, deals…"
              className="w-full rounded-xl bg-transparent py-2 pl-10 pr-16 text-sm placeholder:text-muted-foreground/50 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/70 hover:bg-slate-200/60 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 flex items-center gap-0.5 rounded-md bg-slate-200/60 px-1.5 py-0.5 text-[10px] text-muted-foreground pointer-events-none">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            )}
          </div>
        </form>

        {/* Live Search Results Dropdown */}
        <AnimatePresence>
          {searchOpen && searchQuery.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60"
            >
              <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Searching CRM records…
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Top Results ({searchResults.length})
                    </p>
                    {searchResults.slice(0, 6).map((item) => (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-slate-100"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 text-xs">{item.title}</p>
                          <p className="truncate text-[11px] text-slate-500">{item.subtitle}</p>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60">
                          {item.type}
                        </span>
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                      <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No matching records found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right section: Quick actions, Notifications, Profile */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick actions */}
        <div ref={quickRef} className="relative">
          <button
            onClick={() => setQuickOpen((v) => !v)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 sm:px-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
          </button>
          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl bg-white border border-slate-200 p-1.5 shadow-xl shadow-slate-200/60"
              >
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Quick Actions</p>
                {QUICK_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link
                      key={a.label}
                      href={a.href}
                      onClick={() => setQuickOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      {a.label}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-5 w-5 shrink-0" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-xs sm:w-80 overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{unread} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={cn('flex gap-3 border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50', !n.read && 'bg-emerald-50/40')}
                    >
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <div className={cn('min-w-0 flex-1', n.read && 'pl-5')}>
                        <p className="truncate text-sm font-medium text-slate-900">{n.title}</p>
                        <p className="truncate text-xs text-slate-500">{n.description}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/app/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-slate-50"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex h-9 items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-xs text-primary ring-2 ring-primary/20 shrink-0">
              {(user?.name || 'User').split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block shrink-0" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl bg-white border border-slate-200 p-1.5 shadow-xl shadow-slate-200/60"
              >
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                </div>
                {PROFILE_MENU.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Link
                      key={m.label}
                      href={m.href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      {m.label}
                    </Link>
                  );
                })}
                <div className="my-1 h-px bg-slate-100" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const labels: Record<string, string> = {
    app: 'App',
    dashboard: 'Dashboard',
    leads: 'Leads',
    contacts: 'Contacts',
    companies: 'Companies',
    pipeline: 'Pipeline',
    calls: 'Calls',
    'call-history': 'Call History',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    email: 'Email',
    calendar: 'Calendar',
    tasks: 'Tasks',
    analytics: 'Analytics',
    reports: 'Reports',
    automation: 'Automation',
    'ai-assistant': 'AI Assistant',
    team: 'Team',
    documents: 'Documents',
    notifications: 'Notifications',
    settings: 'Settings',
    billing: 'Billing',
    support: 'Support',
  };

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const href = '/' + segments.slice(0, i + 1).join('/');
        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
            {isLast ? (
              <span className="font-medium text-foreground">{labels[seg] || seg}</span>
            ) : (
              <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
                {labels[seg] || seg}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
