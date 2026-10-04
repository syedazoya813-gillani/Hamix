import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During `next build`, client components can be pre-rendered on the server.
  // Do not initialize Supabase there when Vercel env vars are not present yet.
  if (!url || !key) {
    if (typeof window === 'undefined') return null as any;
    throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.');
  }

  return createBrowserClient(url, key);
}
