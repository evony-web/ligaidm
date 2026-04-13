import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear existing data
    await db.teamPlayer.deleteMany();
    await db.match.deleteMany();
    await db.team.deleteMany();
    await db.participation.deleteMany();
    await db.donation.deleteMany();
    await db.clubMember.deleteMany();
    await db.leagueMatch.deleteMany();
    await db.playoffMatch.deleteMany();
    await db.club.deleteMany();
    await db.tournament.deleteMany();
    await db.season.deleteMany();
    await db.player.deleteMany();

    // ======== PLAYERS ========
    const maleNames = [
      { name: 'Ryujin', gamertag: 'Ryujin', tier: 'S' },
      { name: 'StormBlade', gamertag: 'StormBlade', tier: 'S' },
      { name: 'NightFury', gamertag: 'NightFury', tier: 'S' },
      { name: 'DragonHeart', gamertag: 'DragonHeart', tier: 'S' },
      { name: 'PhoenixX', gamertag: 'PhoenixX', tier: 'S' },
      { name: 'ShadowKing', gamertag: 'ShadowKing', tier: 'S' },
      { name: 'IronFist', gamertag: 'IronFist', tier: 'A' },
      { name: 'BoltStrike', gamertag: 'BoltStrike', tier: 'A' },
      { name: 'AceViper', gamertag: 'AceViper', tier: 'A' },
      { name: 'FrostWolf', gamertag: 'FrostWolf', tier: 'A' },
      { name: 'ThunderGod', gamertag: 'ThunderGod', tier: 'A' },
      { name: 'DarkMatter', gamertag: 'DarkMatter', tier: 'A' },
      { name: 'BlazeSword', gamertag: 'BlazeSword', tier: 'B' },
      { name: 'SteelNerve', gamertag: 'SteelNerve', tier: 'B' },
      { name: 'VoidWalker', gamertag: 'VoidWalker', tier: 'B' },
      { name: 'CosmicRage', gamertag: 'CosmicRage', tier: 'B' },
      { name: 'NeonHunter', gamertag: 'NeonHunter', tier: 'B' },
      { name: 'TitanFall', gamertag: 'TitanFall', tier: 'B' },
    ];

    const femaleNames = [
      { name: 'AuroraBlade', gamertag: 'AuroraBlade', tier: 'S' },
      { name: 'LunaStorm', gamertag: 'LunaStorm', tier: 'S' },
      { name: 'CrystalFang', gamertag: 'CrystalFang', tier: 'S' },
      { name: 'PhoenixMaiden', gamertag: 'PhoenixMaiden', tier: 'S' },
      { name: 'StarDust', gamertag: 'StarDust', tier: 'S' },
      { name: 'VelvetFury', gamertag: 'VelvetFury', tier: 'S' },
      { name: 'IceQueen', gamertag: 'IceQueen', tier: 'A' },
      { name: 'RubyHeart', gamertag: 'RubyHeart', tier: 'A' },
      { name: 'SilverArrow', gamertag: 'SilverArrow', tier: 'A' },
      { name: 'EmeraldWitch', gamertag: 'EmeraldWitch', tier: 'A' },
      { name: 'DiamondFist', gamertag: 'DiamondFist', tier: 'A' },
      { name: 'JadeDragon', gamertag: 'JadeDragon', tier: 'A' },
      { name: 'SapphireSoul', gamertag: 'SapphireSoul', tier: 'B' },
      { name: 'AmberStrike', gamertag: 'AmberStrike', tier: 'B' },
      { name: 'OpalDream', gamertag: 'OpalDream', tier: 'B' },
      { name: 'TopazFlame', gamertag: 'TopazFlame', tier: 'B' },
      { name: 'PearlShadow', gamertag: 'PearlShadow', tier: 'B' },
      { name: 'OnyxRose', gamertag: 'OnyxRose', tier: 'B' },
    ];

    const tierBasePoints: Record<string, number> = { S: 200, A: 100, B: 30 };

    const malePlayers = [];
    for (const p of maleNames) {
      const base = tierBasePoints[p.tier];
      const player = await db.player.create({
        data: {
          name: p.name,
          gamertag: p.gamertag,
          division: 'male',
          tier: p.tier,
          points: base + Math.floor(Math.random() * base * 0.5),
          totalWins: Math.floor(Math.random() * 6) + (p.tier === 'S' ? 4 : p.tier === 'A' ? 2 : 0),
          totalMvp: Math.floor(Math.random() * 3),
          streak: Math.floor(Math.random() * 4),
          maxStreak: Math.floor(Math.random() * 5) + 1,
          matches: Math.floor(Math.random() * 8) + 2,
          isActive: true,
        },
      });
      malePlayers.push(player);
    }

    const femalePlayers = [];
    for (const p of femaleNames) {
      const base = tierBasePoints[p.tier];
      const player = await db.player.create({
        data: {
          name: p.name,
          gamertag: p.gamertag,
          division: 'female',
          tier: p.tier,
          points: base + Math.floor(Math.random() * base * 0.5),
          totalWins: Math.floor(Math.random() * 6) + (p.tier === 'S' ? 4 : p.tier === 'A' ? 2 : 0),
          totalMvp: Math.floor(Math.random() * 3),
          streak: Math.floor(Math.random() * 4),
          maxStreak: Math.floor(Math.random() * 5) + 1,
          matches: Math.floor(Math.random() * 8) + 2,
          isActive: true,
        },
      });
      femalePlayers.push(player);
    }

    // ======== SEASONS ========
    const maleSeason = await db.season.create({
      data: {
        name: 'Season 1 - Dragon Rise',
        number: 1,
        division: 'male',
        status: 'active',
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-03-01'),
      },
    });

    const femaleSeason = await db.season.create({
      data: {
        name: 'Season 1 - Crystal Dawn',
        number: 1,
        division: 'female',
        status: 'active',
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-03-01'),
      },
    });

    // ======== CLUBS ========
    const maleClubData = [
      { name: 'Dragon Empire', members: [0, 6, 12] },
      { name: 'Shadow Legion', members: [1, 7, 13] },
      { name: 'Storm Riders', members: [2, 8, 14] },
      { name: 'Titan Force', members: [3, 9, 15] },
      { name: 'Phoenix Guard', members: [4, 10, 16] },
      { name: 'Void Legion', members: [5, 11, 17] },
    ];

    const femaleClubData = [
      { name: 'Crystal Queens', members: [0, 6, 12] },
      { name: 'Aurora Squad', members: [1, 7, 13] },
      { name: 'Valkyrie Force', members: [2, 8, 14] },
      { name: 'Phoenix Rising', members: [3, 9, 15] },
      { name: 'Diamond Order', members: [4, 10, 16] },
      { name: 'Sapphire Legion', members: [5, 11, 17] },
    ];

    const maleClubs = [];
    for (const cd of maleClubData) {
      const club = await db.club.create({
        data: {
          name: cd.name,
          division: 'male',
          seasonId: maleSeason.id,
          wins: Math.floor(Math.random() * 4),
          losses: Math.floor(Math.random() * 3),
          points: Math.floor(Math.random() * 10) + 2,
          gameDiff: Math.floor(Math.random() * 6) - 2,
        },
      });
      for (let mi = 0; mi < cd.members.length; mi++) {
        await db.clubMember.create({
          data: {
            clubId: club.id,
            playerId: malePlayers[cd.members[mi]].id,
            role: mi === 0 ? 'captain' : 'member',
          },
        });
      }
      maleClubs.push(club);
    }

    const femaleClubs = [];
    for (const cd of femaleClubData) {
      const club = await db.club.create({
        data: {
          name: cd.name,
          division: 'female',
          seasonId: femaleSeason.id,
          wins: Math.floor(Math.random() * 4),
          losses: Math.floor(Math.random() * 3),
          points: Math.floor(Math.random() * 10) + 2,
          gameDiff: Math.floor(Math.random() * 6) - 2,
        },
      });
      for (let mi = 0; mi < cd.members.length; mi++) {
        await db.clubMember.create({
          data: {
            clubId: club.id,
            playerId: femalePlayers[cd.members[mi]].id,
            role: mi === 0 ? 'captain' : 'member',
          },
        });
      }
      femaleClubs.push(club);
    }

    // ======== TOURNAMENTS (4 completed + 1 active per division) ========
    const maleTournaments = [];
    const femaleTournaments = [];

    for (let week = 1; week <= 5; week++) {
      const isCompleted = week <= 4;
      const status = isCompleted ? 'completed' : 'registration';
      const prizePool = [50000, 75000, 100000, 150000, 200000][week - 1];

      // Male tournament
      const mt = await db.tournament.create({
        data: {
          name: `Week ${week} Tournament`,
          weekNumber: week,
          division: 'male',
          seasonId: maleSeason.id,
          status,
          prizePool,
          bpm: Math.floor(Math.random() * 21) + 120,
          location: 'Online - IDM Arena',
          scheduledAt: new Date(2025, 0, 6 + (week - 1) * 7, 19, 0),
          completedAt: isCompleted ? new Date(2025, 0, 6 + (week - 1) * 7, 21, 0) : null,
        },
      });
      maleTournaments.push(mt);

      // Female tournament
      const ft = await db.tournament.create({
        data: {
          name: `Week ${week} Tournament`,
          weekNumber: week,
          division: 'female',
          seasonId: femaleSeason.id,
          status,
          prizePool,
          bpm: Math.floor(Math.random() * 21) + 120,
          location: 'Online - IDM Arena',
          scheduledAt: new Date(2025, 0, 6 + (week - 1) * 7, 19, 0),
          completedAt: isCompleted ? new Date(2025, 0, 6 + (week - 1) * 7, 21, 0) : null,
        },
      });
      femaleTournaments.push(ft);

      // Add participations for completed tournaments
      if (isCompleted) {
        const players = week % 2 === 0 ? malePlayers : malePlayers;
        for (const p of players) {
          await db.participation.create({
            data: {
              playerId: p.id,
              tournamentId: mt.id,
              status: 'assigned',
              pointsEarned: 10 + (Math.random() > 0.5 ? 2 : 0),
            },
          });
        }
        for (const p of femalePlayers) {
          await db.participation.create({
            data: {
              playerId: p.id,
              tournamentId: ft.id,
              status: 'assigned',
              pointsEarned: 10 + (Math.random() > 0.5 ? 2 : 0),
            },
          });
        }

        // Create teams for completed tournaments
        const sMale = malePlayers.filter(p => p.tier === 'S');
        const aMale = malePlayers.filter(p => p.tier === 'A');
        const bMale = malePlayers.filter(p => p.tier === 'B');

        const sFemale = femalePlayers.filter(p => p.tier === 'S');
        const aFemale = femalePlayers.filter(p => p.tier === 'A');
        const bFemale = femalePlayers.filter(p => p.tier === 'B');

        // Create 2 teams per tournament
        for (let ti = 0; ti < 2; ti++) {
          const si = ti;
          const ai = ti;
          const bi = ti;
          // Male teams
          const mTeam = await db.team.create({
            data: {
              name: `Team ${String.fromCharCode(65 + ti)}`,
              tournamentId: mt.id,
              power: sMale[si].points + aMale[ai].points + bMale[bi].points,
              isWinner: ti === (week % 2),
            },
          });
          await db.teamPlayer.createMany({
            data: [
              { teamId: mTeam.id, playerId: sMale[si].id },
              { teamId: mTeam.id, playerId: aMale[ai].id },
              { teamId: mTeam.id, playerId: bMale[bi].id },
            ],
          });

          // Female teams
          const fTeam = await db.team.create({
            data: {
              name: `Team ${String.fromCharCode(65 + ti)}`,
              tournamentId: ft.id,
              power: sFemale[si].points + aFemale[ai].points + bFemale[bi].points,
              isWinner: ti === (week % 2),
            },
          });
          await db.teamPlayer.createMany({
            data: [
              { teamId: fTeam.id, playerId: sFemale[si].id },
              { teamId: fTeam.id, playerId: aFemale[ai].id },
              { teamId: fTeam.id, playerId: bFemale[bi].id },
            ],
          });
        }

        // Create matches for completed tournaments
        const mTeams = await db.team.findMany({ where: { tournamentId: mt.id } });
        if (mTeams.length >= 2) {
          const score1 = Math.random() > 0.3 ? 2 : 1;
          const score2 = score1 === 2 ? (Math.random() > 0.5 ? 1 : 0) : 2;
          await db.match.create({
            data: {
              tournamentId: mt.id,
              team1Id: mTeams[0].id,
              team2Id: mTeams[1].id,
              score1,
              score2,
              status: 'completed',
              round: 1,
              mvpPlayerId: (score1 > score2 ? mTeams[0] : mTeams[1]).isWinner
                ? malePlayers[week % 6].id
                : malePlayers[(week + 1) % 6].id,
              completedAt: new Date(2025, 0, 6 + (week - 1) * 7, 21, 0),
            },
          });
        }

        const fTeams = await db.team.findMany({ where: { tournamentId: ft.id } });
        if (fTeams.length >= 2) {
          const score1 = Math.random() > 0.3 ? 2 : 1;
          const score2 = score1 === 2 ? (Math.random() > 0.5 ? 1 : 0) : 2;
          await db.match.create({
            data: {
              tournamentId: ft.id,
              team1Id: fTeams[0].id,
              team2Id: fTeams[1].id,
              score1,
              score2,
              status: 'completed',
              round: 1,
              mvpPlayerId: femalePlayers[week % 6].id,
              completedAt: new Date(2025, 0, 6 + (week - 1) * 7, 21, 0),
            },
          });
        }
      } else {
        // Active tournament - just add participations (registered)
        for (const p of malePlayers.slice(0, 12)) {
          await db.participation.create({
            data: { playerId: p.id, tournamentId: mt.id, status: 'registered', pointsEarned: 0 },
          });
        }
        for (const p of femalePlayers.slice(0, 12)) {
          await db.participation.create({
            data: { playerId: p.id, tournamentId: ft.id, status: 'registered', pointsEarned: 0 },
          });
        }
      }
    }

    // ======== DONATIONS ========
    const donorNames = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Galih', 'Hana'];
    for (const t of maleTournaments) {
      for (let d = 0; d < 3; d++) {
        await db.donation.create({
          data: {
            donorName: donorNames[Math.floor(Math.random() * donorNames.length)],
            amount: [25000, 50000, 100000][Math.floor(Math.random() * 3)],
            message: 'Semangat tim! 🔥',
            type: 'weekly',
            tournamentId: t.id,
            seasonId: maleSeason.id,
          },
        });
      }
    }
    for (const t of femaleTournaments) {
      for (let d = 0; d < 3; d++) {
        await db.donation.create({
          data: {
            donorName: donorNames[Math.floor(Math.random() * donorNames.length)],
            amount: [25000, 50000, 100000][Math.floor(Math.random() * 3)],
            message: 'Go girls! 💪',
            type: 'weekly',
            tournamentId: t.id,
            seasonId: femaleSeason.id,
          },
        });
      }
    }

    // ======== LEAGUE MATCHES ========
    for (let week = 1; week <= 4; week++) {
      // Male league matches
      const mPairs = [[0,1],[2,3],[4,5]];
      for (const [a, b] of mPairs) {
        if (a < maleClubs.length && b < maleClubs.length) {
          const s1 = Math.random() > 0.3 ? 2 : 1;
          const s2 = s1 === 2 ? (Math.random() > 0.5 ? 1 : 0) : 2;
          await db.leagueMatch.create({
            data: {
              seasonId: maleSeason.id,
              club1Id: maleClubs[a].id,
              club2Id: maleClubs[b].id,
              week,
              format: 'BO3',
              status: 'completed',
              score1: s1,
              score2: s2,
            },
          });
        }
      }
      // Female league matches
      const fPairs = [[0,1],[2,3],[4,5]];
      for (const [a, b] of fPairs) {
        if (a < femaleClubs.length && b < femaleClubs.length) {
          const s1 = Math.random() > 0.3 ? 2 : 1;
          const s2 = s1 === 2 ? (Math.random() > 0.5 ? 1 : 0) : 2;
          await db.leagueMatch.create({
            data: {
              seasonId: femaleSeason.id,
              club1Id: femaleClubs[a].id,
              club2Id: femaleClubs[b].id,
              week,
              format: 'BO3',
              status: 'completed',
              score1: s1,
              score2: s2,
            },
          });
        }
      }
    }

    // Upcoming league matches (week 5+)
    const mPairs5 = [[0,2],[1,3],[4,5]];
    for (const [a, b] of mPairs5) {
      if (a < maleClubs.length && b < maleClubs.length) {
        await db.leagueMatch.create({
          data: {
            seasonId: maleSeason.id,
            club1Id: maleClubs[a].id,
            club2Id: maleClubs[b].id,
            week: 5,
            format: 'BO3',
            status: 'upcoming',
          },
        });
      }
    }
    const fPairs5 = [[0,2],[1,3],[4,5]];
    for (const [a, b] of fPairs5) {
      if (a < femaleClubs.length && b < femaleClubs.length) {
        await db.leagueMatch.create({
          data: {
            seasonId: femaleSeason.id,
            club1Id: femaleClubs[a].id,
            club2Id: femaleClubs[b].id,
            week: 5,
            format: 'BO3',
            status: 'upcoming',
          },
        });
      }
    }

    // ======== PLAYOFF MATCHES ========
    if (maleClubs.length >= 4) {
      await db.playoffMatch.create({ data: { seasonId: maleSeason.id, club1Id: maleClubs[0].id, club2Id: maleClubs[3].id, round: 'semifinal1', format: 'BO5', status: 'upcoming' } });
      await db.playoffMatch.create({ data: { seasonId: maleSeason.id, club1Id: maleClubs[1].id, club2Id: maleClubs[2].id, round: 'semifinal2', format: 'BO5', status: 'upcoming' } });
      await db.playoffMatch.create({ data: { seasonId: maleSeason.id, club1Id: maleClubs[0].id, club2Id: maleClubs[1].id, round: 'grand_final', format: 'BO5', status: 'upcoming' } });
    }
    if (femaleClubs.length >= 4) {
      await db.playoffMatch.create({ data: { seasonId: femaleSeason.id, club1Id: femaleClubs[0].id, club2Id: femaleClubs[3].id, round: 'semifinal1', format: 'BO5', status: 'upcoming' } });
      await db.playoffMatch.create({ data: { seasonId: femaleSeason.id, club1Id: femaleClubs[1].id, club2Id: femaleClubs[2].id, round: 'semifinal2', format: 'BO5', status: 'upcoming' } });
      await db.playoffMatch.create({ data: { seasonId: femaleSeason.id, club1Id: femaleClubs[0].id, club2Id: femaleClubs[1].id, round: 'grand_final', format: 'BO5', status: 'upcoming' } });
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
