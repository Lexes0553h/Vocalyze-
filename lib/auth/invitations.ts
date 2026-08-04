import { getBaseUrl } from '@/lib/utils';

export interface InvitationRecord {
  id: string;
  token: string;
  tenant_id: string;
  tenant_name: string;
  email: string;
  name: string;
  role: string;
  department: string;
  team?: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
}

declare global {
  // Persistent global memory for fallback and cross-request memory during dev
  var __invitationStore: Map<string, InvitationRecord> | undefined;
}

export function getInvitationStore(): Map<string, InvitationRecord> {
  if (!globalThis.__invitationStore) {
    globalThis.__invitationStore = new Map<string, InvitationRecord>();
    // Seed default demo invitation
    const demoToken = 'inv_demo_123';
    globalThis.__invitationStore.set(demoToken, {
      id: 'inv_demo_123',
      token: demoToken,
      tenant_id: 'tenant_default',
      tenant_name: 'Vocalyze Global',
      email: 'employee@xyzcompany.com',
      name: 'Robert Vance',
      role: 'employee',
      department: 'Outbound Sales',
      invited_by: 'Admin',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });
  }
  return globalThis.__invitationStore;
}

export function generateInviteUrl(token: string, email: string, companyName: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&company=${encodeURIComponent(companyName)}`;
}

export function createInvitationRecord(data: {
  tenant_id: string;
  tenant_name: string;
  email: string;
  name?: string;
  role?: string;
  department?: string;
  team?: string;
  invited_by?: string;
}): InvitationRecord {
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const record: InvitationRecord = {
    id: token,
    token,
    tenant_id: data.tenant_id,
    tenant_name: data.tenant_name,
    email: data.email.toLowerCase().trim(),
    name: data.name?.trim() || data.email.split('@')[0],
    role: data.role || 'employee',
    department: data.department || 'Outbound Sales',
    team: data.team || 'Sales Alpha',
    invited_by: data.invited_by || 'Company Admin',
    status: 'pending',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };

  const store = getInvitationStore();
  store.set(token, record);
  return record;
}
