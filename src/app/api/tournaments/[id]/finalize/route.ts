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

  // Calculate and distribute points
  const mvpPoints = Math.floor(tournament.prizePool / 1000); // e.g. 50000 / 1000 = 50

  // Get all participants
  const participations = await db.participation.findMany({
    where: { tournamentId: id },
    include: { player: true },
  });

  for (const p of participations) {
    let pointsEarned = 10; // participation bonus

    // Check if player is on winning team
    const winningTeams = tournament.teams.filter(t => t.isWinner);
    for (const wt of winningTeams) {
      const isOnWinningTeam = wt.teamPlayers.some(tp => tp.playerId === p.playerId);
      if (isOnWinningTeam) {
        pointsEarned += 2; // win bonus

        // Streak update
        const newStreak = p.player.streak + 1;
        const newMaxStreak = Math.max(newStreak, p.player.maxStreak);

        // Streak bonus
        if (newStreak === 2) pointsEarned += 10;
        else if (newStreak === 3) pointsEarned += 20;
        else if (newStreak >= 4) pointsEarned += 30;

        await db.player.update({
          where: { id: p.playerId },
          data: {
            points: p.player.points + pointsEarned,
            totalWins: p.player.totalWins + 1,
            streak: newStreak,
            maxStreak: newMaxStreak,
            matches: p.player.matches + 1,
          },
        });
      } else {
        // Losing team - reset streak
        await db.player.update({
          where: { id: p.playerId },
          data: {
            points: p.player.points + pointsEarned,
            matches: p.player.matches + 1,
            streak: 0,
          },
        });
      }
    }

    // MVP bonus
    if (mvpPlayerId && p.playerId === mvpPlayerId) {
      pointsEarned += mvpPoints;
      await db.player.update({
        where: { id: p.playerId },
        data: {
          points: { increment: mvpPoints },
          totalMvp: { increment: 1 },
        },
      });

      await db.participation.update({
        where: { id: p.id },
        data: { isMvp: true },
      });
    }

    // Update participation points
    await db.participation.update({
      where: { id: p.id },
      data: { pointsEarned },
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
