import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { mvpPlayerId } = body;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      matches: true,
      teams: { include: { teamPlayers: true } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  // Assign MVP to match
  if (mvpPlayerId) {
    const completedMatch = tournament.matches.find(m => m.status === 'completed');
    if (completedMatch) {
      await db.match.update({
        where: { id: completedMatch.id },
        data: { mvpPlayerId },
      });
    }
  }

  // Calculate MVP points based on prize pool
  const mvpPoints = Math.floor(tournament.prizePool / 1000); // e.g. 50000 / 1000 = 50

  // Get all participants
  const participations = await db.participation.findMany({
    where: { tournamentId: id },
    include: { player: true },
  });

  for (const p of participations) {
    let pointsEarned = 10; // participation bonus
    let isWinner = false;

    // Check if player is on winning team
    const winningTeams = tournament.teams.filter(t => t.isWinner);
    for (const wt of winningTeams) {
      const isOnWinningTeam = wt.teamPlayers.some(tp => tp.playerId === p.playerId);
      if (isOnWinningTeam) {
        isWinner = true;
        pointsEarned += 2; // win bonus

        // Streak update
        const newStreak = p.player.streak + 1;
        const newMaxStreak = Math.max(newStreak, p.player.maxStreak);

        // Streak bonus
        if (newStreak === 2) pointsEarned += 10;
        else if (newStreak === 3) pointsEarned += 20;
        else if (newStreak >= 4) pointsEarned += 30;

        // MVP bonus (only add once)
        const isMvp = mvpPlayerId && p.playerId === mvpPlayerId;
        if (isMvp) {
          pointsEarned += mvpPoints;
        }

        await db.player.update({
          where: { id: p.playerId },
          data: {
            points: p.player.points + pointsEarned,
            totalWins: p.player.totalWins + 1,
            streak: newStreak,
            maxStreak: newMaxStreak,
            matches: p.player.matches + 1,
            ...(isMvp && { totalMvp: p.player.totalMvp + 1 }),
          },
        });
      }
    }

    // Losing team player
    if (!isWinner) {
      pointsEarned = 10; // just participation

      // MVP can also be from losing team
      const isMvp = mvpPlayerId && p.playerId === mvpPlayerId;
      if (isMvp) {
        pointsEarned += mvpPoints;
      }

      await db.player.update({
        where: { id: p.playerId },
        data: {
          points: p.player.points + pointsEarned,
          matches: p.player.matches + 1,
          streak: 0,
          ...(isMvp && { totalMvp: p.player.totalMvp + 1 }),
        },
      });
    }

    // Update participation record
    await db.participation.update({
      where: { id: p.id },
      data: {
        pointsEarned,
        ...(mvpPlayerId && p.playerId === mvpPlayerId && { isMvp: true }),
        ...(isWinner && { isWinner: true }),
      },
    });
  }

  // Mark tournament as completed
  await db.tournament.update({
    where: { id },
    data: { status: 'completed', completedAt: new Date() },
  });

  const result = await db.tournament.findUnique({
    where: { id },
    include: {
      matches: { include: { mvpPlayer: true } },
      teams: { include: { teamPlayers: { include: { player: true } } } },
    },
  });

  return NextResponse.json(result);
}
