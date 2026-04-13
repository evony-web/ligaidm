import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division');
  const seasonId = searchParams.get('seasonId');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (division) where.division = division;
  if (seasonId) where.seasonId = seasonId;
  if (status) where.status = status;

  const tournaments = await db.tournament.findMany({
    where,
    orderBy: { weekNumber: 'desc' },
    include: {
      _count: { select: { teams: true, participations: true, matches: true } },
      season: { select: { name: true, number: true } },
    },
  });

  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, weekNumber, division, seasonId, prizePool, location, scheduledAt } = body;

  if (!name || !weekNumber || !division || !seasonId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const tournament = await db.tournament.create({
    data: {
      name,
      weekNumber,
      division,
      seasonId,
      status: 'setup',
      prizePool: prizePool || 0,
      location: location || 'Online',
      bpm: Math.floor(Math.random() * 21) + 120,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  return NextResponse.json(tournament, { status: 201 });
}
