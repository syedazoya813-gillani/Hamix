import { NextResponse } from 'next/server';
import { getAIProviderStatus } from '@/lib/ai/extraction';
export async function GET() { return NextResponse.json(getAIProviderStatus()); }
