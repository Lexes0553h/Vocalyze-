import {
  LayoutDashboard, Users, Contact as ContactIcon, Building2,
  KanbanSquare, Phone, PhoneMissed, MessageCircle, MessageSquare,
  Mail, Calendar, CheckSquare, BarChart3, FileText, Zap,
  Users2, FolderOpen, Bell, Settings, CreditCard, LifeBuoy,
  Search, GitBranch, Globe, Shield, Database, Tag, Megaphone,
  UserCheck, Target, Clock, Disc, FileSpreadsheet, User,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/lib/auth/permissions';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  group: string;
  permission?: Permission;
  adminOnly?: boolean;
}

// Dedicated Employee Navigation (Telecaller Workstation)
export const EMPLOYEE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard', group: 'Overview' },
  { label: 'Leads', icon: Users, href: '/app/leads', group: 'Sales', badge: '12' },
  { label: 'Contacts', icon: ContactIcon, href: '/app/contacts', group: 'Sales' },
  { label: 'Pipeline', icon: KanbanSquare, href: '/app/pipeline', group: 'Sales' },
  { label: 'Today’s Tasks', icon: CheckSquare, href: '/app/tasks', group: 'Work', badge: '4' },
  { label: 'Calls', icon: Phone, href: '/app/calls', group: 'Calling' },
  { label: 'Call History', icon: PhoneMissed, href: '/app/call-history', group: 'Calling' },
  { label: 'Notes', icon: FileText, href: '/app/notes', group: 'Work' },
  { label: 'Calendar', icon: Calendar, href: '/app/calendar', group: 'Work' },
  { label: 'Notifications', icon: Bell, href: '/app/notifications', group: 'Account', badge: '4' },
  { label: 'Profile', icon: User, href: '/app/profile', group: 'Account' },
  { label: 'Settings', icon: Settings, href: '/app/settings', group: 'Account' },
];

// Dedicated Admin Navigation (Executive Dashboard)
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, href: '/app/admin', group: 'Overview', adminOnly: true },
  { label: 'Employees', icon: UserCheck, href: '/app/admin/employees', group: 'Team Management', adminOnly: true },
  { label: 'Team Performance', icon: Users2, href: '/app/admin/team-performance', group: 'Team Management', adminOnly: true },
  { label: 'Companies', icon: Building2, href: '/app/companies', group: 'Organization', adminOnly: true },
  { label: 'Departments', icon: Building2, href: '/app/departments', group: 'Organization', adminOnly: true },
  { label: 'Leads Overview', icon: Users, href: '/app/admin/leads-overview', group: 'Sales & Calls', adminOnly: true },
  { label: 'Calls Analytics', icon: BarChart3, href: '/app/admin/calls-analytics', group: 'Sales & Calls', adminOnly: true },
  { label: 'Reports', icon: FileSpreadsheet, href: '/app/reports', group: 'Sales & Calls', adminOnly: true },
  { label: 'Targets', icon: Target, href: '/app/admin/targets', group: 'Operations', adminOnly: true },
  { label: 'Attendance', icon: Clock, href: '/app/admin/attendance', group: 'Operations', adminOnly: true },
  { label: 'Recordings', icon: Disc, href: '/app/admin/recordings', group: 'Operations', adminOnly: true },
  { label: 'Settings', icon: Settings, href: '/app/company-settings', group: 'System', adminOnly: true },
  { label: 'Integrations', icon: Zap, href: '/app/admin/integrations', group: 'System', adminOnly: true },
  { label: 'Roles & Permissions', icon: Shield, href: '/app/admin/roles', group: 'System', adminOnly: true },
  { label: 'Audit Logs', icon: Shield, href: '/app/audit-logs', group: 'System', adminOnly: true },
  { label: 'Billing', icon: CreditCard, href: '/app/billing', group: 'System', adminOnly: true },
  { label: 'Subscription', icon: Tag, href: '/app/platform/plans', group: 'System', adminOnly: true },
  { label: 'Profile', icon: User, href: '/app/profile', group: 'Account' },
];

export const NAV_ITEMS: NavItem[] = [...ADMIN_NAV_ITEMS, ...EMPLOYEE_NAV_ITEMS];

export const NAV_GROUPS: Record<string, string> = {
  Overview: 'Overview',
  Sales: 'Sales & Leads',
  Calling: 'Telephony',
  Work: 'Productivity',
  'Team Management': 'Team Management',
  Organization: 'Organization',
  'Sales & Calls': 'Analytics & Reports',
  Operations: 'Operations & Quality',
  System: 'System & Admin',
  Account: 'Account',
};

export const GROUP_ORDER = [
  'Overview',
  'Sales',
  'Calling',
  'Work',
  'Team Management',
  'Organization',
  'Sales & Calls',
  'Operations',
  'System',
  'Account',
];
