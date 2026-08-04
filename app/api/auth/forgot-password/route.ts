import { createBrowserClient } from '@/lib/supabase/client';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(req.url).origin}/reset-password`,
  });
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ data: { sent: true } });
}
