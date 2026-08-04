import { createBrowserClient } from '@/lib/supabase/client';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name ?? '' } },
  });
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ data: { user: data.user, session: data.session } });
}
