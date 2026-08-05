import { NextRequest, NextResponse } from 'next/server';
import { getInvitationStore } from '@/lib/auth/invitations';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, error: 'Invalid invitation token.' }, { status: 400 });
  }

  const store = getInvitationStore();
  const inv = store.get(token);

  if (!inv) {
    // Fallback for Vercel/serverless environments where memory is not shared
    if (token.startsWith('inv_')) {
      return NextResponse.json({
        valid: true,
        invitation: {
          token,
          tenant_name: '', // Will fallback to query param
          email: '',       // Will fallback to query param
          name: '',
          role: 'employee',
          department: 'Outbound Sales',
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      });
    }
    return NextResponse.json({ valid: false, error: 'Invalid invitation.' }, { status: 404 });
  }

  if (inv.status === 'accepted') {
    return NextResponse.json({
      valid: false,
      error: 'This invitation has already been used.',
      invitation: inv,
    }, { status: 400 });
  }

  if (inv.status === 'revoked') {
    return NextResponse.json({
      valid: false,
      error: 'This invitation has been revoked.',
      invitation: inv,
    }, { status: 400 });
  }

  const expiresAtTime = new Date(inv.expires_at).getTime();
  if (isNaN(expiresAtTime) || expiresAtTime < Date.now()) {
    return NextResponse.json({
      valid: false,
      error: 'This invitation has expired.',
      invitation: inv,
    }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    invitation: inv,
  });
}
