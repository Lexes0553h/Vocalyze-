import type { Metadata } from 'next';
import { CrmShell } from '@/components/crm/crm-shell';
import { AuthGuard } from '@/components/auth/auth-guard';

export const metadata: Metadata = {
  title: 'Vocalyze CRM — Dashboard',
  description: 'AI-powered telecalling CRM workspace',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><CrmShell>{children}</CrmShell></AuthGuard>;
}
