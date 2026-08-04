import { createBrowserClient } from '@/lib/supabase/client';
import type { NextRequest } from 'next/server';

export async function POST(_req: NextRequest) {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
  return Response.json({ data: { signedOut: true } });
}
