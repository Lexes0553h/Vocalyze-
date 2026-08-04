import type { UserRole } from '@/lib/supabase/types';

export type Permission =
  | 'view_dashboard'
  | 'manage_leads' | 'delete_leads' | 'assign_leads'
  | 'manage_contacts' | 'delete_contacts'
  | 'manage_deals'
  | 'manage_calls'
  | 'manage_tasks' | 'assign_tasks'
  | 'manage_whatsapp' | 'manage_sms' | 'manage_email'
  | 'manage_calendar'
  | 'manage_documents'
  | 'manage_users' | 'invite_users' | 'reset_passwords'
  | 'manage_departments' | 'manage_teams'
  | 'manage_billing' | 'manage_subscription'
  | 'manage_reports' | 'view_reports'
  | 'manage_company_settings' | 'manage_company_branding'
  | 'view_audit_logs'
  | 'manage_companies' | 'delete_companies'
  | 'manage_platform' | 'manage_plans' | 'manage_feature_flags'
  | 'send_announcements' | 'manage_licenses' | 'view_api_usage'
  | 'view_all_data' | 'view_team_data' | 'view_own_data';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  manager: 'Manager',
  team_leader: 'Team Leader',
  employee: 'Employee',
  admin: 'Company Admin',
  agent: 'Employee',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full platform access across all companies',
  company_admin: 'Manage your company, users, and settings',
  manager: 'Manage teams, assign work, track performance',
  team_leader: 'Lead a team, monitor daily activity',
  employee: 'Access your assigned leads and workspace',
  admin: 'Manage your company, users, and settings',
  agent: 'Access your assigned leads and workspace',
};

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_dashboard', 'manage_leads', 'delete_leads', 'assign_leads',
    'manage_contacts', 'delete_contacts', 'manage_deals', 'manage_calls',
    'manage_tasks', 'assign_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'manage_users', 'invite_users', 'reset_passwords',
    'manage_departments', 'manage_teams',
    'manage_billing', 'manage_subscription',
    'manage_reports', 'view_reports',
    'manage_company_settings', 'manage_company_branding',
    'view_audit_logs',
    'manage_companies', 'delete_companies',
    'manage_platform', 'manage_plans', 'manage_feature_flags',
    'send_announcements', 'manage_licenses', 'view_api_usage',
    'view_all_data',
  ],
  company_admin: [
    'view_dashboard', 'manage_leads', 'delete_leads', 'assign_leads',
    'manage_contacts', 'delete_contacts', 'manage_deals', 'manage_calls',
    'manage_tasks', 'assign_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'manage_users', 'invite_users', 'reset_passwords',
    'manage_departments', 'manage_teams',
    'manage_billing', 'manage_subscription',
    'manage_reports', 'view_reports',
    'manage_company_settings', 'manage_company_branding',
    'view_audit_logs', 'view_all_data',
  ],
  admin: [
    'view_dashboard', 'manage_leads', 'delete_leads', 'assign_leads',
    'manage_contacts', 'delete_contacts', 'manage_deals', 'manage_calls',
    'manage_tasks', 'assign_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'manage_users', 'invite_users', 'reset_passwords',
    'manage_departments', 'manage_teams',
    'manage_billing', 'manage_subscription',
    'manage_reports', 'view_reports',
    'manage_company_settings', 'manage_company_branding',
    'view_audit_logs', 'view_all_data',
  ],
  manager: [
    'view_dashboard', 'manage_leads', 'assign_leads',
    'manage_contacts', 'manage_deals', 'manage_calls',
    'manage_tasks', 'assign_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'manage_teams',
    'view_reports', 'manage_reports',
    'view_audit_logs', 'view_team_data',
  ],
  team_leader: [
    'view_dashboard', 'manage_leads', 'assign_leads',
    'manage_contacts', 'manage_calls',
    'manage_tasks', 'assign_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'view_reports', 'view_team_data',
  ],
  employee: [
    'view_dashboard', 'manage_leads',
    'manage_contacts', 'manage_calls',
    'manage_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'view_own_data',
  ],
  agent: [
    'view_dashboard', 'manage_leads',
    'manage_contacts', 'manage_calls',
    'manage_tasks', 'manage_whatsapp', 'manage_sms',
    'manage_email', 'manage_calendar', 'manage_documents',
    'view_own_data',
  ],
};

export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole | null, ...permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

export function getPermissions(role: UserRole | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export function isSuperAdmin(role: UserRole | null): boolean {
  return role === 'super_admin';
}

export function isCompanyAdmin(role: UserRole | null): boolean {
  return role === 'company_admin' || role === 'admin';
}

export function isManagerOrAbove(role: UserRole | null): boolean {
  return isSuperAdmin(role) || isCompanyAdmin(role) || role === 'manager' || role === 'team_leader';
}

export function canAccessTenant(role: UserRole | null): boolean {
  return isSuperAdmin(role) || isCompanyAdmin(role);
}

export function getDashboardPath(role: UserRole | null): string {
  if (!role) return '/app/dashboard';
  if (isSuperAdmin(role) || isCompanyAdmin(role) || role === 'manager') return '/app/admin';
  return '/app/dashboard';
}

export const PERMISSION_GROUPS: { label: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    label: 'Data Visibility',
    permissions: [
      { key: 'view_all_data', label: 'View All Company Data' },
      { key: 'view_team_data', label: 'View Team Data' },
      { key: 'view_own_data', label: 'View Own Data Only' },
    ],
  },
  {
    label: 'CRM',
    permissions: [
      { key: 'manage_leads', label: 'Manage Leads' },
      { key: 'delete_leads', label: 'Delete Leads' },
      { key: 'assign_leads', label: 'Assign Leads' },
      { key: 'manage_contacts', label: 'Manage Contacts' },
      { key: 'manage_deals', label: 'Manage Deals' },
      { key: 'manage_calls', label: 'Manage Calls' },
    ],
  },
  {
    label: 'Communication',
    permissions: [
      { key: 'manage_whatsapp', label: 'WhatsApp' },
      { key: 'manage_sms', label: 'SMS' },
      { key: 'manage_email', label: 'Email' },
    ],
  },
  {
    label: 'Productivity',
    permissions: [
      { key: 'manage_tasks', label: 'Manage Tasks' },
      { key: 'assign_tasks', label: 'Assign Tasks' },
      { key: 'manage_calendar', label: 'Calendar' },
      { key: 'manage_documents', label: 'Documents' },
    ],
  },
  {
    label: 'Administration',
    permissions: [
      { key: 'manage_users', label: 'Manage Users' },
      { key: 'invite_users', label: 'Invite Users' },
      { key: 'reset_passwords', label: 'Reset Passwords' },
      { key: 'manage_departments', label: 'Departments' },
      { key: 'manage_teams', label: 'Teams' },
    ],
  },
  {
    label: 'Billing & Reports',
    permissions: [
      { key: 'manage_billing', label: 'Billing' },
      { key: 'manage_subscription', label: 'Subscriptions' },
      { key: 'view_reports', label: 'View Reports' },
      { key: 'manage_reports', label: 'Manage Reports' },
    ],
  },
  {
    label: 'Platform (Super Admin)',
    permissions: [
      { key: 'manage_companies', label: 'Manage Companies' },
      { key: 'delete_companies', label: 'Delete Companies' },
      { key: 'manage_platform', label: 'Platform Settings' },
      { key: 'manage_plans', label: 'Subscription Plans' },
      { key: 'manage_feature_flags', label: 'Feature Flags' },
      { key: 'send_announcements', label: 'Announcements' },
      { key: 'view_audit_logs', label: 'Audit Logs' },
    ],
  },
];
