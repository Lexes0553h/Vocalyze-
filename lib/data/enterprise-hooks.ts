'use client';

import { useSupabaseQueryWithDefault } from './use-supabase-query';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  industry: string;
  website: string;
  location: string;
  brandColor: string;
  timezone: string;
  currency: string;
  workingDays: string[];
  workingHours: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  planId: string | null;
  maxUsers: number;
  storageUsedMb: number;
  createdAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  headId: string | null;
}

export interface Team {
  id: string;
  tenantId: string;
  departmentId: string | null;
  name: string;
  managerId: string | null;
  teamLeaderId: string | null;
}

export interface AuditLog {
  id: string;
  tenantId: string | null;
  userId: string | null;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxStorageMb: number;
  features: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
}

export interface FeatureFlag {
  id: string;
  tenantId: string | null;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  isGlobal: boolean;
}

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  audience: 'all' | 'admins' | 'managers' | 'employees';
  isActive: boolean;
  createdAt: string;
}

export interface TeamMemberUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
  title: string;
  departmentId: string | null;
  teamId: string | null;
  tenantId: string | null;
  lastLogin: string | null;
  disabled: boolean;
}

export function useTenants() {
  return useSupabaseQueryWithDefault<Tenant[]>(async (c) => {
    const { data, error } = await c.from('tenants').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, name: r.name as string, slug: r.slug as string, logo: (r.logo as string) ?? '',
      industry: (r.industry as string) ?? '', website: (r.website as string) ?? '', location: (r.location as string) ?? '',
      brandColor: (r.brand_color as string) ?? '#10b981', timezone: (r.timezone as string) ?? 'UTC',
      currency: (r.currency as string) ?? 'USD', workingDays: (r.working_days as string[]) ?? [],
      workingHours: (r.working_hours as string) ?? '09:00-17:00', status: (r.status as Tenant['status']) ?? 'active',
      planId: (r.plan_id as string) ?? null, maxUsers: (r.max_users as number) ?? 10,
      storageUsedMb: Number(r.storage_used_mb ?? 0), createdAt: r.created_at as string,
    }));
  }, []);
}

export function useCurrentTenant() {
  return useSupabaseQueryWithDefault<Tenant | null>(async (c) => {
    const { data: { user } } = await c.auth.getUser();
    if (!user) return null;
    const { data: profile } = await c.from('profiles').select('tenant_id').eq('id', user.id).maybeSingle();
    if (!profile?.tenant_id) return null;
    const { data, error } = await c.from('tenants').select('*').eq('id', profile.tenant_id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id, name: data.name, slug: data.slug, logo: data.logo ?? '',
      industry: data.industry ?? '', website: data.website ?? '', location: data.location ?? '',
      brandColor: data.brand_color ?? '#10b981', timezone: data.timezone ?? 'UTC',
      currency: data.currency ?? 'USD', workingDays: data.working_days ?? [],
      workingHours: data.working_hours ?? '09:00-17:00', status: data.status ?? 'active',
      planId: data.plan_id ?? null, maxUsers: data.max_users ?? 10,
      storageUsedMb: Number(data.storage_used_mb ?? 0), createdAt: data.created_at,
    } as Tenant;
  }, null);
}

export function useDepartments() {
  return useSupabaseQueryWithDefault<Department[]>(async (c) => {
    let results: Department[] = [];
    try {
      const { data, error } = await c.from('departments').select('*').order('name', { ascending: true });
      if (!error && data) {
        results = data.map((r: Record<string, unknown>) => ({
          id: r.id as string, tenantId: r.tenant_id as string, name: r.name as string,
          description: (r.description as string) ?? '', headId: (r.head_id as string) ?? null,
        }));
      }
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem('mock_departments');
      if (existingStr) {
        const local = JSON.parse(existingStr);
        results = [...results, ...local.map((r: any) => ({
          id: r.id, tenantId: r.tenant_id, name: r.name,
          description: r.description ?? '', headId: r.head_id ?? null,
        }))];
      }
    }
    return results;
  }, []);
}

export function useTeams() {
  return useSupabaseQueryWithDefault<Team[]>(async (c) => {
    const { data, error } = await c.from('teams').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, tenantId: r.tenant_id as string, departmentId: (r.department_id as string) ?? null,
      name: r.name as string, managerId: (r.manager_id as string) ?? null, teamLeaderId: (r.team_leader_id as string) ?? null,
    }));
  }, []);
}

export function useTenantUsers() {
  return useSupabaseQueryWithDefault<TeamMemberUser[]>(async (c) => {
    const { data, error } = await c.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, name: r.name as string, email: (r as Record<string, unknown>).email as string ?? '',
      role: r.role as string, avatar: (r.avatar as string) ?? '', status: (r.status as string) ?? 'offline',
      title: (r.title as string) ?? '', departmentId: (r.department_id as string) ?? null,
      teamId: (r.team_id as string) ?? null, tenantId: (r.tenant_id as string) ?? null,
      lastLogin: (r.last_login as string) ?? null, disabled: (r.disabled as boolean) ?? false,
    }));
  }, []);
}

export function useAuditLogs() {
  return useSupabaseQueryWithDefault<AuditLog[]>(async (c) => {
    const { data, error } = await c.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, tenantId: (r.tenant_id as string) ?? null, userId: (r.user_id as string) ?? null,
      userName: (r.user_name as string) ?? '', userRole: (r.user_role as string) ?? '',
      action: r.action as string, entityType: (r.entity_type as string) ?? '', entityId: (r.entity_id as string) ?? '',
      description: (r.description as string) ?? '', ipAddress: (r.ip_address as string) ?? '—',
      createdAt: r.created_at as string,
    }));
  }, []);
}

export function useSubscriptionPlans() {
  return useSupabaseQueryWithDefault<SubscriptionPlan[]>(async (c) => {
    const { data, error } = await c.from('subscription_plans').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, name: r.name as string, tier: r.tier as SubscriptionPlan['tier'],
      priceMonthly: Number(r.price_monthly ?? 0), priceYearly: Number(r.price_yearly ?? 0),
      maxUsers: (r.max_users as number) ?? 5, maxStorageMb: Number(r.max_storage_mb ?? 500),
      features: (r.features as Record<string, unknown>) ?? {}, isActive: (r.is_active as boolean) ?? true,
      sortOrder: (r.sort_order as number) ?? 0,
    }));
  }, []);
}

export function useFeatureFlags() {
  return useSupabaseQueryWithDefault<FeatureFlag[]>(async (c) => {
    const { data, error } = await c.from('feature_flags').select('*').order('key', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, tenantId: (r.tenant_id as string) ?? null, key: r.key as string,
      label: (r.label as string) ?? '', description: (r.description as string) ?? '',
      enabled: (r.enabled as boolean) ?? false, isGlobal: (r.is_global as boolean) ?? false,
    }));
  }, []);
}

export function useInvitations() {
  return useSupabaseQueryWithDefault<Invitation[]>(async (c) => {
    const { data, error } = await c.from('invitations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, tenantId: r.tenant_id as string, email: r.email as string,
      name: (r.name as string) ?? '', role: r.role as string, status: r.status as Invitation['status'],
      expiresAt: r.expires_at as string, createdAt: r.created_at as string,
    }));
  }, []);
}

export function useAnnouncements() {
  return useSupabaseQueryWithDefault<Announcement[]>(async (c) => {
    const { data, error } = await c.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, title: r.title as string, body: r.body as string,
      type: r.type as Announcement['type'], audience: r.audience as Announcement['audience'],
      isActive: (r.is_active as boolean) ?? true, createdAt: r.created_at as string,
    }));
  }, []);
}


