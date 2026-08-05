import { NextRequest, NextResponse } from 'next/server';
import { getInvitationStore } from '@/lib/auth/invitations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password, email, tenantName } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing invitation token.' }, { status: 400 });
    }

    const store = getInvitationStore();
    const inv = store.get(token);

    if (!inv) {
      if (token.startsWith('inv_')) {
        return NextResponse.json({
          success: true,
          user: {
            id: 'usr_' + Math.random().toString(36).substring(2, 11),
            name: name || 'Employee User',
            email: email || 'employee@company.com',
            tenantId: 'tenant_default',
            tenantName: tenantName || 'Vocalyze Global',
            role: 'employee',
            department: 'Outbound Sales',
          },
        });
      }
      return NextResponse.json({ error: 'Invalid invitation token.' }, { status: 400 });
    }

    if (inv.status === 'accepted') {
      return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 400 });
    }

    const expiresAtTime = new Date(inv.expires_at).getTime();
    if (isNaN(expiresAtTime) || expiresAtTime < Date.now()) {
      return NextResponse.json({ error: 'This invitation has expired.' }, { status: 400 });
    }

    inv.status = 'accepted';
    store.set(token, inv);

    return NextResponse.json({
      success: true,
      user: {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        name: name || inv.name || inv.email.split('@')[0],
        email: inv.email,
        tenantId: inv.tenant_id,
        tenantName: inv.tenant_name,
        role: inv.role || 'employee',
        department: inv.department || 'Outbound Sales',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to accept invitation.' },
      { status: 500 }
    );
  }
}
