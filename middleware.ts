// Route protection is handled client-side via AuthProvider + AuthGuard,
// because @supabase/supabase-js stores sessions in localStorage by default
// and edge middleware cannot reliably read them. This file is kept as a
// no-op so future server-side guards can be added without changing config.

export function middleware() {
  return undefined;
}

export const config = {
  matcher: ['/app/:path*'],
};
