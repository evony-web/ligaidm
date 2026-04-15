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
  const { matchId, score1, score2 } = body;

  if (!matchId || score1 === undefined || score2 === undefined) {
    return NextResponse.json({ error: 'matchId, score1, score2 required' }, { status: 400 });
  }

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  if (match.tournamentId !== id) {
    return NextResponse.json({ error: 'Match does not belong to this tournament' }, { status: 400 });
  }

  const updatedMatch = await db.match.update({
    where: { id: matchId },
    data: {
      score1,
      score2,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Mark winning team
  const winnerTeamId = score1 > score2 ? match.team1Id : score2 > score1 ? match.team2Id : null;
  if (winnerTeamId) {
    await db.team.update({ where: { id: winnerTeamId }, data: { isWinner: true } });
  }

  // Update tournament status to scoring
  await db.tournament.update({ where: { id }, data: { status: 'scoring' } });

  return NextResponse.json(updatedMatch);
}
