'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { isManagerOrAbove, isCompanyAdmin, isSuperAdmin } from '@/lib/auth/permissions';
import { toast } from '@/components/ui/toast';

const ADMIN_ONLY_PREFIXES = [
  '/app/admin',
  '/app/users',
  '/app/company-settings',
  '/app/departments',
  '/app/teams',
  '/app/audit-logs',
  '/app/platform',
  '/app/company',
];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      // Check role restriction for admin routes
      const role = user.role ?? 'employee';
      const isAdmin = isCompanyAdmin(role) || isSuperAdmin(role) || isManagerOrAbove(role);
      const isTryingAdminRoute = ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));

      if (isTryingAdminRoute && !isAdmin) {
        toast({
          title: 'Access Restricted',
          description: 'Employee accounts do not have permission to access administration pages.',
        });
        router.replace('/app/dashboard');
      }
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm font-medium text-slate-500">Redirecting to sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
