import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division') || 'male';

  // Get active season
  const season = await db.season.findFirst({
    where: { division, status: 'active' },
    orderBy: { number: 'desc' },
  });

  if (!season) {
    return NextResponse.json({ hasData: false, division });
  }

  // Get active/recent tournament
  const activeTournament = await db.tournament.findFirst({
    where: { division, seasonId: season.id },
    orderBy: { weekNumber: 'desc' },
    include: {
      teams: { include: { teamPlayers: { include: { player: true } } } },
      matches: { include: { team1: true, team2: true, mvpPlayer: true } },
      participations: { include: { player: true } },
      donations: true,
    },
  });

  // Total players
  const totalPlayers = await db.player.count({ where: { division, isActive: true } });

  // Total prize pool
  const donations = await db.donation.findMany({
    where: { type: 'weekly', tournament: { division } },
  });
  const totalPrizePool = donations.reduce((sum, d) => sum + d.amount, 0);

  // Season donations
  const seasonDonations = await db.donation.findMany({
    where: { seasonId: season.id },
  });
  const seasonDonationTotal = seasonDonations.reduce((sum, d) => sum + d.amount, 0);

  // Top players leaderboard
  const topPlayers = await db.player.findMany({
    where: { division },
    orderBy: [{ points: 'desc' }, { totalWins: 'desc' }],
    take: 10,
  });

  // Clubs standings
  const clubs = await db.club.findMany({
    where: { seasonId: season.id },
    orderBy: [{ points: 'desc' }, { gameDiff: 'desc' }],
    include: { _count: { select: { members: true } } },
  });

  // Recent matches
  const recentMatches = await db.leagueMatch.findMany({
    where: { seasonId: season.id, status: 'completed' },
    orderBy: { week: 'desc' },
    take: 3,
    include: { club1: true, club2: true },
  });

  // Upcoming matches
  const upcomingMatches = await db.leagueMatch.findMany({
    where: { seasonId: season.id, status: 'upcoming' },
    orderBy: { week: 'asc' },
    take: 3,
    include: { club1: true, club2: true },
  });

  // Playoff matches
  const playoffMatches = await db.playoffMatch.findMany({
    where: { seasonId: season.id },
    include: { club1: true, club2: true },
    orderBy: { round: 'asc' },
  });

  // Tournaments list
  const tournaments = await db.tournament.findMany({
    where: { division, seasonId: season.id },
    orderBy: { weekNumber: 'asc' },
    include: { _count: { select: { teams: true, participations: true } } },
  });

  // All league matches grouped by week
  const leagueMatches = await db.leagueMatch.findMany({
    where: { seasonId: season.id },
    orderBy: [{ week: 'asc' }],
    include: { club1: true, club2: true },
  });

  // Top donors
  const topDonors = await db.donation.groupBy({
    by: ['donorName'],
    where: { tournament: { division } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
  });

  // Season progress
  const totalWeeks = 8; // 8 weeks per season
  const completedWeeks = tournaments.filter(t => t.status === 'completed').length;

  return NextResponse.json({
    hasData: true,
    division,
    season,
    activeTournament,
    totalPlayers,
    totalPrizePool,
    seasonDonationTotal,
    topPlayers,
    clubs,
    recentMatches,
    upcomingMatches,
    playoffMatches,
    tournaments,
    leagueMatches,
    topDonors: topDonors.map(d => ({
      donorName: d.donorName,
      totalAmount: d._sum.amount,
      donationCount: d._count.id,
    })),
    seasonProgress: {
      totalWeeks,
      completedWeeks,
      percentage: Math.round((completedWeeks / totalWeeks) * 100),
    },
  });
}
