import { createRouteClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/supabase/types';

export interface AuthContext {
  client: SupabaseClient;
  userId: string | null;
  role: UserRole | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isManagerOrAbove: boolean;
  isAdminOrManager: boolean;
}

export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const client = createRouteClient(req);
  const { data: { user } } = await client.auth.getUser();
  const userId = user?.id ?? null;

  let role: UserRole | null = null;
  let tenantId: string | null = null;
  if (userId) {
    const { data: profile } = await client
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', userId)
      .maybeSingle();
    role = (profile?.role as UserRole) ?? null;
    tenantId = profile?.tenant_id ?? null;
  }

  const isSuperAdmin = role === 'super_admin';
  const isCompanyAdmin = role === 'company_admin' || role === 'admin';
  const isManagerOrAbove = isSuperAdmin || isCompanyAdmin || role === 'manager' || role === 'team_leader';
  const isAdminOrManager = isCompanyAdmin || role === 'manager';

  return {
    client,
    userId,
    role,
    tenantId,
    isAuthenticated: !!userId,
    isSuperAdmin,
    isCompanyAdmin,
    isManagerOrAbove,
    isAdminOrManager,
  };
}

export function unauthorized(message = 'Authentication required') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Insufficient permissions') {
  return Response.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Resource not found') {
  return Response.json({ error: message }, { status: 404 });
}

export function badRequest(message = 'Invalid request') {
  return Response.json({ error: message }, { status: 400 });
}

export function ok(data: unknown) {
  return Response.json({ data });
}

export function requireRole(ctx: AuthContext, ...roles: UserRole[]): Response | null {
  if (!ctx.isAuthenticated) return unauthorized();
  if (!ctx.role || !roles.includes(ctx.role)) return forbidden();
  return null;
}

export function requireSuperAdmin(ctx: AuthContext): Response | null {
  if (!ctx.isAuthenticated) return unauthorized();
  if (!ctx.isSuperAdmin) return forbidden();
  return null;
}

export function requireCompanyAdmin(ctx: AuthContext): Response | null {
  if (!ctx.isAuthenticated) return unauthorized();
  if (!ctx.isSuperAdmin && !ctx.isCompanyAdmin) return forbidden();
  return null;
}

export function requireManagerOrAbove(ctx: AuthContext): Response | null {
  if (!ctx.isAuthenticated) return unauthorized();
  if (!ctx.isManagerOrAbove) return forbidden();
  return null;
}
