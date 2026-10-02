import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHamixInsights } from '@/lib/ai/extraction';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const insight = await generateHamixInsights(body);
    return NextResponse.json({ insight });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI request failed' }, { status: 500 });
  }
}
