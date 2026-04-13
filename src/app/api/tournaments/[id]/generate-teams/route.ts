import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      participations: {
        where: { status: 'approved' },
        include: { player: true },
      },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  // Group players by tier
  const sTier = tournament.participations.filter(p => p.player.tier === 'S').map(p => p.player).sort((a, b) => b.points - a.points);
  const aTier = tournament.participations.filter(p => p.player.tier === 'A').map(p => p.player).sort((a, b) => b.points - a.points);
  const bTier = tournament.participations.filter(p => p.player.tier === 'B').map(p => p.player).sort((a, b) => b.points - a.points);

  // Need at least 2 of each tier for 2 teams
  if (sTier.length < 2 || aTier.length < 2 || bTier.length < 2) {
    return NextResponse.json({
      error: 'Not enough players per tier. Need at least 2 S, 2 A, 2 B',
      sCount: sTier.length,
      aCount: aTier.length,
      bCount: bTier.length,
    }, { status: 400 });
  }

  // Determine number of teams (based on smallest tier / 1, capped at available)
  const teamCount = Math.min(Math.floor(sTier.length / 1), Math.floor(aTier.length / 1), Math.floor(bTier.length / 1));

  // Snake draft assignment
  const teamAssignments: { sPlayer: typeof sTier[0], aPlayer: typeof aTier[0], bPlayer: typeof bTier[0] }[] = [];

  for (let i = 0; i < teamCount; i++) {
    teamAssignments.push({
      sPlayer: sTier[i],
      aPlayer: aTier[i],
      bPlayer: bTier[i],
    });
  }

  // Create teams
  const teams = [];
  for (let i = 0; i < teamAssignments.length; i++) {
    const assignment = teamAssignments[i];
    const teamName = `Team ${String.fromCharCode(65 + i)}`; // Team A, Team B, etc.
    const power = assignment.sPlayer.points + assignment.aPlayer.points + assignment.bPlayer.points;

    const team = await db.team.create({
      data: {
        name: teamName,
        tournamentId: id,
        power,
      },
    });

    await db.teamPlayer.createMany({
      data: [
        { teamId: team.id, playerId: assignment.sPlayer.id },
        { teamId: team.id, playerId: assignment.aPlayer.id },
        { teamId: team.id, playerId: assignment.bPlayer.id },
      ],
    });

    teams.push(team);
  }

  // Auto-balance: swap B-tier players if power imbalance > 20%
  if (teams.length >= 2) {
    const teamsWithPlayers = await db.team.findMany({
      where: { tournamentId: id },
      include: { teamPlayers: { include: { player: true } } },
    });

    for (let i = 0; i < teamsWithPlayers.length - 1; i++) {
      for (let j = i + 1; j < teamsWithPlayers.length; j++) {
        const t1 = teamsWithPlayers[i];
        const t2 = teamsWithPlayers[j];
        const powerDiff = Math.abs(t1.power - t2.power);
        const maxPower = Math.max(t1.power, t2.power);

        if (maxPower > 0 && powerDiff / maxPower > 0.2) {
          // Find B-tier players to swap
          const b1 = t1.teamPlayers.find(tp => tp.player.tier === 'B');
          const b2 = t2.teamPlayers.find(tp => tp.player.tier === 'B');

          if (b1 && b2) {
            // Swap
            await db.teamPlayer.update({ where: { id: b1.id }, data: { playerId: b2.playerId } });
            await db.teamPlayer.update({ where: { id: b2.id }, data: { playerId: b1.playerId } });

            // Recalculate power
            const newPower1 = t1.power - b1.player.points + b2.player.points;
            const newPower2 = t2.power - b2.player.points + b1.player.points;
            await db.team.update({ where: { id: t1.id }, data: { power: newPower1 } });
            await db.team.update({ where: { id: t2.id }, data: { power: newPower2 } });
          }
        }
      }
    }
  }

  // Update tournament status
  await db.tournament.update({ where: { id }, data: { status: 'team_generation' } });

  // Update participation statuses
  await db.participation.updateMany({
    where: { tournamentId: id, status: 'approved' },
    data: { status: 'assigned' },
  });

  const finalTeams = await db.team.findMany({
    where: { tournamentId: id },
    include: { teamPlayers: { include: { player: true } } },
  });

  return NextResponse.json({ teams: finalTeams, teamCount });
}
