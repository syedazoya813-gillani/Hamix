import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Allow the public/demo pages to build even before Vercel env vars are configured.
  if (!url || !key) return response;

  const supabase = createServerClient(
    url,
    key,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options); }) } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const protectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/onboarding');
  if (protectedRoute && !user) return NextResponse.redirect(new URL('/login', request.url));
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  if (request.nextUrl.pathname === '/signup') return NextResponse.redirect(new URL('/login', request.url));
  return response;
}
export const config = { matcher: ['/dashboard/:path*', '/onboarding', '/login', '/signup'] };
