import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-cookie';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({ authenticated: true, user: session });
}