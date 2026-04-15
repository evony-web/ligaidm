import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { playerId } = body;

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
  }

  const tournament = await db.tournament.findUnique({ where: { id } });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  if (tournament.status !== 'registration' && tournament.status !== 'setup') {
    return NextResponse.json({ error: 'Registration is not open' }, { status: 400 });
  }

  // Check if already registered
  const existing = await db.participation.findUnique({
    where: { playerId_tournamentId: { playerId, tournamentId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already registered' }, { status: 409 });
  }

  // Check player division matches
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
  if (player.division !== tournament.division) {
    return NextResponse.json({ error: 'Division mismatch' }, { status: 400 });
  }

  const participation = await db.participation.create({
    data: {
      playerId,
      tournamentId: id,
      status: 'registered',
      pointsEarned: 10, // participation bonus
    },
  });

  // Update tournament status to registration if it was setup
  if (tournament.status === 'setup') {
    await db.tournament.update({ where: { id }, data: { status: 'registration' } });
  }

  return NextResponse.json(participation, { status: 201 });
}
