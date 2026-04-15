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

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: { teams: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  if (tournament.teams.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 teams to generate bracket' }, { status: 400 });
  }

  // Check if matches already exist
  const existingMatches = await db.match.findMany({ where: { tournamentId: id } });
  if (existingMatches.length > 0) {
    return NextResponse.json({ error: 'Bracket already generated' }, { status: 400 });
  }

  // For weekly tournament: only 1 match (main event) between random teams
  // Shuffle teams for randomization
  const shuffledTeams = [...tournament.teams].sort(() => Math.random() - 0.5);

  // Create matches - for the main event, just 1 match
  // If more teams, create elimination rounds
  const matches = [];

  if (shuffledTeams.length === 2) {
    // Single main event match
    const match = await db.match.create({
      data: {
        tournamentId: id,
        team1Id: shuffledTeams[0].id,
        team2Id: shuffledTeams[1].id,
        status: 'pending',
        round: 1,
        scheduledAt: tournament.scheduledAt,
      },
    });
    matches.push(match);
  } else {
    // Create bracket rounds for more teams
    let round = 1;
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (i + 1 < shuffledTeams.length) {
        const match = await db.match.create({
          data: {
            tournamentId: id,
            team1Id: shuffledTeams[i].id,
            team2Id: shuffledTeams[i + 1].id,
            status: 'pending',
            round,
            scheduledAt: tournament.scheduledAt,
          },
        });
        matches.push(match);
      }
    }
  }

  await db.tournament.update({ where: { id }, data: { status: 'bracket_generation' } });

  return NextResponse.json({ matches });
}
