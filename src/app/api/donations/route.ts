import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  const seasonId = searchParams.get('seasonId');
  const type = searchParams.get('type');

  const where: Record<string, unknown> = {};
  if (tournamentId) where.tournamentId = tournamentId;
  if (seasonId) where.seasonId = seasonId;
  if (type) where.type = type;

  const donations = await db.donation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(donations);
}

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { donorName, amount, message, type, tournamentId, seasonId } = body;

  if (!donorName || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const donation = await db.donation.create({
    data: {
      donorName,
      amount,
      message: message || null,
      type: type || 'weekly',
      tournamentId: tournamentId || null,
      seasonId: seasonId || null,
    },
  });

  return NextResponse.json(donation, { status: 201 });
}
