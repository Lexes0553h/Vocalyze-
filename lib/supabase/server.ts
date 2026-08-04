import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

function getAccessToken(): string | undefined {
  const store = cookies();
  const token = store.get('sb-access-token')?.value;
  if (token && token.length > 0) return token;
  return undefined;
}

export async function createServerClient() {
  const token = getAccessToken();
  const options = token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...options,
  });
}

export function createRouteClient(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  const options = token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...options,
  });
}

export type ServerClient = ReturnType<typeof createClient>;
