import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { playerId, tier, approve } = body;

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
  }

  const tournament = await db.tournament.findUnique({ where: { id } });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  const participation = await db.participation.findUnique({
    where: { playerId_tournamentId: { playerId, tournamentId: id } },
  });

  if (!participation) {
    return NextResponse.json({ error: 'Player not registered' }, { status: 404 });
  }

  // If approving and assigning tier
  if (approve) {
    // Update player tier
    if (tier) {
      await db.player.update({ where: { id: playerId }, data: { tier } });
    }
    await db.participation.update({
      where: { id: participation.id },
      data: { status: 'approved' },
    });
  } else {
    await db.participation.update({
      where: { id: participation.id },
      data: { status: 'rejected' },
    });
  }

  // Update tournament status to approval if in registration
  if (tournament.status === 'registration') {
    await db.tournament.update({ where: { id }, data: { status: 'approval' } });
  }

  return NextResponse.json({ success: true });
}
