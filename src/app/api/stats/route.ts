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

  // Weekly champions — 1 winning team per completed tournament + MVP (admin-assigned, highest scorer)
  const completedTournaments = await db.tournament.findMany({
    where: { division, seasonId: season.id, status: 'completed' },
    orderBy: { weekNumber: 'asc' },
    include: {
      teams: {
        where: { isWinner: true },
        take: 1,
        include: { teamPlayers: { include: { player: true } } },
      },
      participations: {
        where: { isMvp: true },
        include: { player: true },
      },
    },
  });
  const weeklyChampions = completedTournaments.map(t => {
    const winnerTeam = t.teams[0]; // Only 1 winning team
    const mvpParticipation = t.participations.find(p => p.isMvp); // Admin-assigned MVP
    const mvpPlayer = mvpParticipation?.player;
    return {
      weekNumber: t.weekNumber,
      tournamentName: t.name,
      prizePool: t.prizePool,
      completedAt: t.completedAt,
      winnerTeam: winnerTeam ? {
        name: winnerTeam.name,
        players: winnerTeam.teamPlayers.map(tp => ({
          id: tp.player.id,
          gamertag: tp.player.gamertag,
          tier: tp.player.tier,
          points: tp.player.points,
          totalWins: tp.player.totalWins,
          totalMvp: tp.player.totalMvp,
          streak: tp.player.streak,
          matches: tp.player.matches,
        })),
      } : null,
      mvp: mvpPlayer ? { id: mvpPlayer.id, gamertag: mvpPlayer.gamertag, tier: mvpPlayer.tier, totalMvp: mvpPlayer.totalMvp, points: mvpPlayer.points } : null,
    };
  });

  // Season progress
  const totalWeeks = 11; // 11 weeks per season
  const completedWeeks = tournaments.filter(t => t.status === 'completed').length;

  // MVP Hall of Fame — all MVPs from completed tournaments this season
  const mvpParticipations = await db.participation.findMany({
    where: {
      isMvp: true,
      tournament: { division, seasonId: season.id, status: 'completed' },
    },
    include: {
      player: true,
      tournament: { select: { weekNumber: true, name: true, prizePool: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  const mvpHallOfFame = mvpParticipations.map(mp => ({
    id: mp.player.id,
    gamertag: mp.player.gamertag,
    tier: mp.player.tier,
    totalMvp: mp.player.totalMvp,
    points: mp.player.points,
    totalWins: mp.player.totalWins,
    streak: mp.player.streak,
    weekNumber: mp.tournament.weekNumber,
    tournamentName: mp.tournament.name,
  }));

  // Top donors — ego-driven showcase with tier system
  const donorTiers = topDonors.map(d => {
    const total = d._sum.amount || 0;
    let tier = 'Bronze';
    let tierColor = '#CD7F32';
    let tierIcon = '🥉';
    if (total >= 500000) { tier = 'Diamond'; tierColor = '#b9f2ff'; tierIcon = '💎'; }
    else if (total >= 200000) { tier = 'Platinum'; tierColor = '#E5E4E2'; tierIcon = '💍'; }
    else if (total >= 100000) { tier = 'Gold'; tierColor = '#FFD700'; tierIcon = '🥇'; }
    else if (total >= 50000) { tier = 'Silver'; tierColor = '#C0C0C0'; tierIcon = '🥈'; }
    return {
      donorName: d.donorName,
      totalAmount: total,
      donationCount: d._count.id,
      tier,
      tierColor,
      tierIcon,
    };
  });

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
    weeklyChampions,
    leagueMatches,
    topDonors: donorTiers,
    mvpHallOfFame,
    seasonProgress: {
      totalWeeks,
      completedWeeks,
      percentage: Math.round((completedWeeks / totalWeeks) * 100),
    },
  });
}
