import { createRouteClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const client = createRouteClient(req);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return Response.json({ data: { user: null, profile: null } }, { status: 200 });
  }
  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  return Response.json({ data: { user, profile } });
}
