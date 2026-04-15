import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const session = getSessionFromCookies(cookieHeader);
  if (session) {
    return NextResponse.json({ authenticated: true, user: session });
  }
  return NextResponse.json({ authenticated: false });
}
