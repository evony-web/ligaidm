'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Swords, Crown, Shield, Users, Flame, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TierBadge } from './tier-badge';
import { ClubProfile } from './club-profile';
import { useState } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface StatsData {
  hasData: boolean;
  division: string;
  clubs: { id: string; name: string; wins: number; losses: number; points: number; gameDiff: number; _count?: { members: number } }[];
  leagueMatches: { id: string; week: number; score1: number | null; score2: number | null; status: string; format: string;
    club1: { name: string }; club2: { name: string } }[];
  playoffMatches: { id: string; round: string; score1: number | null; score2: number | null; status: string; format: string;
    club1: { name: string }; club2: { name: string } }[];
  season: { id: string; name: string };
  topPlayers: { id: string; name: string; gamertag: string; tier: string; points: number; totalWins: number; streak: number; maxStreak: number; totalMvp: number; matches: number }[];
}

function SectionHeader({ icon: Icon, title, badge, className = '' }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  className?: string;
}) {
  const dt = useDivisionTheme();
  return (
    <div className={`flex items-center gap-2 mb-3 ${className}`}>
      <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${dt.neonText}`} />
      </div>
      <h3 className="text-sm font-semibold section-header-line">{title}</h3>
      {badge && <Badge className={`${dt.casinoBadge} ml-auto`}>{badge}</Badge>}
    </div>
  );
}

export function LeagueView() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const [selectedClub, setSelectedClub] = useState<StatsData['clubs'][0] | null>(null);
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

  if (isLoading || !data?.hasData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`w-8 h-8 border-2 ${dt.neonText} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  const clubs = data.clubs || [];
  const leagueMatches = data.leagueMatches || [];
  const playoffMatches = data.playoffMatches || [];

  // Group league matches by week
  const weeks = [...new Set(leagueMatches.map(m => m.week))].sort((a, b) => a - b);

  return (
    <>
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div variants={item} className={`relative rounded-2xl overflow-hidden ${dt.casinoCard} ${dt.cornerAccent}`}>
        <div className={dt.casinoBar} />
        <div className="relative p-4 lg:p-5 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${dt.iconBg} flex items-center justify-center ${dt.glow}`}>
              <Trophy className={`w-6 h-6 ${dt.neonText}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${dt.neonGradient}`}>IDM League</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={`${dt.casinoBadge}`}>{data.season?.name}</Badge>
                <Badge className={`${dt.casinoBadge}`}>
                  {division === 'male' ? '⚔️ Male' : '🗡️ Female'}
                </Badge>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className={`text-lg font-bold ${dt.neonText}`}>{clubs.length}</p>
                  <p className="text-[9px] text-muted-foreground">Clubs</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${dt.neonText}`}>{weeks.length}</p>
                  <p className="text-[9px] text-muted-foreground">Weeks</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${dt.neonText}`}>{leagueMatches.filter(m => m.status === 'completed').length}</p>
                  <p className="text-[9px] text-muted-foreground">Played</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 h-auto p-1">
          <TabsTrigger value="standings" className="text-[11px] py-2 tab-premium">Standings</TabsTrigger>
          <TabsTrigger value="schedule" className="text-[11px] py-2 tab-premium">Schedule</TabsTrigger>
          <TabsTrigger value="stats" className="text-[11px] py-2 tab-premium">Stats</TabsTrigger>
          <TabsTrigger value="playoff" className="text-[11px] py-2 tab-premium">Playoff</TabsTrigger>
        </TabsList>

        {/* STANDINGS - Premium table with cards */}
        <TabsContent value="standings" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
            {clubs.map((club, idx) => (
              <motion.div key={club.id} variants={item}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer interactive-scale ${
                    idx === 0 ? `${dt.cardGold} ${dt.glowChampion}` :
                    idx < 4 ? `${dt.casinoCard} ${dt.casinoGlow} casino-shimmer` :
                    `${dt.casinoGlow} bg-muted/20 border border-border/30`
                  }`}
                  onClick={() => setSelectedClub(club)}
                >
                  {/* Rank */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                    idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                    idx < 4 ? `${dt.iconBg} ${dt.neonText}` :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                  </div>

                  {/* Club Avatar */}
                  <div className={`w-10 h-10 rounded-xl ${dt.iconBg} flex items-center justify-center shrink-0`}>
                    <Shield className={`w-5 h-5 ${idx === 0 ? 'text-yellow-500' : dt.neonText}`} />
                  </div>

                  {/* Club Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${idx === 0 ? dt.neonGradient : ''}`}>{club.name}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-green-500 font-medium">{club.wins}W</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-red-500 font-medium">{club.losses}L</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">GD: <span className={club.gameDiff > 0 ? 'text-green-500' : club.gameDiff < 0 ? 'text-red-500' : ''}>{club.gameDiff > 0 ? '+' : ''}{club.gameDiff}</span></span>
                    </div>
                  </div>

                  {/* Stats mini grid */}
                  <div className="hidden sm:flex items-center gap-3 text-center">
                    <div className="px-2">
                      <p className="text-xs text-muted-foreground">M</p>
                      <p className="text-sm font-bold">{club.wins + club.losses}</p>
                    </div>
                    <div className="px-2">
                      <p className="text-xs text-green-500">W</p>
                      <p className="text-sm font-bold text-green-500">{club.wins}</p>
                    </div>
                    <div className="px-2">
                      <p className="text-xs text-red-500">L</p>
                      <p className="text-sm font-bold text-red-500">{club.losses}</p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0 pl-3 border-l border-border/50">
                    <p className={`text-xl font-bold ${idx === 0 ? dt.neonGradient : dt.neonText}`}>{club.points}</p>
                    <p className="text-[9px] text-muted-foreground">PTS</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* SCHEDULE - Enhanced with premium cards */}
        <TabsContent value="schedule" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {weeks.map(week => {
              const weekMatches = leagueMatches.filter(m => m.week === week);
              const completed = weekMatches.filter(m => m.status === 'completed').length;
              return (
                <motion.div key={week} variants={item}>
                  <Card className={`${dt.casinoCard} overflow-hidden casino-shimmer`}>
                    <div className={dt.casinoBar} />
                    <CardContent className="p-0 relative z-10">
                      {/* Week header */}
                      <div className={`flex items-center justify-between px-4 py-3 ${dt.bgSubtle} border-b ${dt.borderSubtle}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${dt.neonText}`} />
                          <h3 className="text-sm font-semibold section-header-line">Week {week}</h3>
                        </div>
                        <Badge className={`text-[10px] border-0 ${
                          completed === weekMatches.length ? 'bg-green-500/10 text-green-500' :
                          completed > 0 ? 'bg-yellow-500/10 text-yellow-500' :
                          `${dt.casinoBadge}`
                        }`}>
                          {completed === weekMatches.length ? '✅ Complete' : `${completed}/${weekMatches.length} Played`}
                        </Badge>
                      </div>

                      {/* Matches */}
                      <div className="p-3 space-y-2">
                        {weekMatches.map(m => (
                          <div key={m.id} className={`p-3 rounded-xl transition-all ${
                            m.status === 'completed'
                              ? 'bg-muted/30 border border-border/20'
                              : `${dt.cardPrize} ${dt.prizeBg} ${dt.prizeBorder}`
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  m.status === 'completed' && m.score1! > m.score2! ? `${dt.iconBg} ${dt.neonText}` : 'bg-muted text-muted-foreground'
                                }`}>
                                  {m.club1.name.slice(0, 2).toUpperCase()}
                                </div>
                                <span className={`text-sm font-medium truncate ${
                                  m.status === 'completed' && m.score1! > m.score2! ? `${dt.neonText} font-bold` : ''
                                }`}>
                                  {m.club1.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mx-3">
                                {m.status === 'completed' ? (
                                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg casino-pill`}>
                                    <span className={`text-base font-bold casino-score ${m.score1! > m.score2! ? dt.neonText : 'text-muted-foreground'}`}>{m.score1}</span>
                                    <span className="text-[10px] text-muted-foreground">-</span>
                                    <span className={`text-base font-bold casino-score ${m.score2! > m.score1! ? dt.neonText : 'text-muted-foreground'}`}>{m.score2}</span>
                                  </div>
                                ) : (
                                  <Badge className={`${dt.casinoBadge} ${dt.neonPulse}`}>vs</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                <span className={`text-sm font-medium truncate ${
                                  m.status === 'completed' && m.score2! > m.score1! ? `${dt.neonText} font-bold` : ''
                                }`}>
                                  {m.club2.name}
                                </span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  m.status === 'completed' && m.score2! > m.score1! ? `${dt.iconBg} ${dt.neonText}` : 'bg-muted text-muted-foreground'
                                }`}>
                                  {m.club2.name.slice(0, 2).toUpperCase()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center mt-2">
                              <Badge className={`text-[9px] border-0 ${
                                m.format === 'BO5' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted text-muted-foreground'
                              }`}>
                                {m.format}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* STATS TAB - New! */}
        <TabsContent value="stats" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* Top Performers */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard}`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <SectionHeader icon={Crown} title="Top Performers" badge="MVP RACE" />
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {data.topPlayers?.slice(0, 5).map((p, idx) => (
                      <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-lg interactive-scale ${
                        idx === 0 ? 'bg-yellow-500/5 border border-yellow-500/10' : 'bg-muted/30 border border-border/20'
                      }`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          idx === 0 ? `bg-yellow-500/20 text-yellow-500 ${dt.glowChampion}` :
                          idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-muted text-muted-foreground'
                        }`}>{idx + 1}</span>
                        <div className={`w-8 h-8 rounded-full ${dt.iconBg} flex items-center justify-center text-[10px] font-bold ${dt.neonText} shrink-0`}>
                          {p.gamertag.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{p.gamertag}</span>
                            <TierBadge tier={p.tier} />
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{p.totalMvp} MVP</span>
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{p.streak} streak</span>
                            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{p.totalWins}W</span>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${dt.neonText}`}>{p.points} pts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Club Stats Grid */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard}`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <SectionHeader icon={TrendingUp} title="Club Power Rankings" />
                  <div className="grid grid-cols-2 gap-2">
                    {clubs.slice(0, 4).map((club, idx) => {
                      const wr = club.wins + club.losses > 0 ? Math.round((club.wins / (club.wins + club.losses)) * 100) : 0;
                      return (
                        <div key={club.id} className={`p-3 rounded-xl cursor-pointer interactive-scale ${
                          idx === 0 ? dt.cardGold : `bg-muted/30 border border-border/20 ${dt.casinoGlow} casino-shimmer`
                        }`} onClick={() => setSelectedClub(club)}>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className={`w-4 h-4 ${idx === 0 ? 'text-yellow-500' : dt.neonText}`} />
                            <span className={`text-xs font-semibold truncate ${idx === 0 ? dt.neonGradient : ''}`}>{club.name}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div>
                              <p className="text-sm font-bold text-green-500">{club.wins}</p>
                              <p className="text-[8px] text-muted-foreground">WINS</p>
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${dt.neonText}`}>{wr}%</p>
                              <p className="text-[8px] text-muted-foreground">WR</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold">{club.gameDiff > 0 ? `+${club.gameDiff}` : club.gameDiff}</p>
                              <p className="text-[8px] text-muted-foreground">GD</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* PLAYOFF BRACKET - Enhanced */}
        <TabsContent value="playoff" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show">
            <Card className={`${dt.casinoCard} ${dt.cornerAccent} overflow-hidden`}>
              <div className={dt.casinoBar} />
              <CardContent className="p-0 relative z-10">
                <div className={`px-4 py-3 casino-img-overlay border-b ${dt.borderSubtle}`}>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold">Playoff Bracket</h3>
                    <Badge className="bg-yellow-500/10 text-yellow-500 text-[10px] border-0 ml-auto">🏆 BO5 Format</Badge>
                  </div>
                </div>
                <div className="p-4">
                  {/* MPL-style horizontal bracket */}
                  <div className="flex items-center justify-center gap-4 lg:gap-8 overflow-x-auto py-4">
                    {/* Semifinals */}
                    <div className="space-y-6">
                      <p className="text-[10px] text-muted-foreground text-center font-semibold mb-2 uppercase tracking-wider">Semi Final</p>
                      {playoffMatches.filter(m => m.round.startsWith('semifinal')).map(m => (
                        <div key={m.id} className={`p-3 rounded-xl bg-muted/50 min-w-[160px] ${dt.casinoGlow} interactive-scale border border-border/30 casino-shimmer`}>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score1! > m.score2! ? `font-bold ${dt.neonText}` : ''}`}>
                              <span>{m.club1.name}</span>
                              <span className="font-mono casino-score">{m.score1 ?? '-'}</span>
                            </div>
                            <div className="h-px bg-border" />
                            <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score2! > m.score1! ? `font-bold ${dt.neonText}` : ''}`}>
                              <span>{m.club2.name}</span>
                              <span className="font-mono casino-score">{m.score2 ?? '-'}</span>
                            </div>
                          </div>
                          <Badge className={`mt-2 text-[9px] border-0 ${dt.casinoBadge}`}>BO5</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Connector */}
                    <div className="hidden lg:flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-8 h-px bg-border" />
                      <Swords className={`w-4 h-4 ${dt.neonText}`} />
                      <div className="w-8 h-px bg-border" />
                    </div>

                    {/* Grand Final */}
                    <div>
                      <p className="text-[10px] text-muted-foreground text-center font-semibold mb-2 uppercase tracking-wider">Grand Final</p>
                      {playoffMatches.filter(m => m.round === 'grand_final').map(m => (
                        <div key={m.id} className={`p-4 rounded-xl ${dt.cardChampion} min-w-[180px]`}>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score1! > m.score2! ? `font-bold ${dt.neonText}` : ''}`}>
                              <span>{m.club1.name}</span>
                              <span className="font-mono casino-score">{m.score1 ?? '-'}</span>
                            </div>
                            <div className={`h-px ${dt.borderSubtle}`} />
                            <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score2! > m.score1! ? `font-bold ${dt.neonText}` : ''}`}>
                              <span>{m.club2.name}</span>
                              <span className="font-mono casino-score">{m.score2 ?? '-'}</span>
                            </div>
                          </div>
                          <div className="mt-3 text-center">
                            <Badge className={`text-[9px] border-0 ${dt.casinoBadge} ${dt.glowChampion}`}>🏆 BO5 Grand Final</Badge>
                          </div>
                        </div>
                      ))}
                      {playoffMatches.filter(m => m.round === 'grand_final').length === 0 && (
                        <div className="p-4 rounded-xl bg-muted/30 min-w-[180px] text-center border border-dashed border-border">
                          <Crown className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Coming Soon</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>

    {/* Club Profile Modal */}
    {selectedClub && (
      <ClubProfile
        club={{
          ...selectedClub,
          division: division,
          rank: clubs.findIndex(c => c.id === selectedClub.id) + 1,
        }}
        onClose={() => setSelectedClub(null)}
        rank={clubs.findIndex(c => c.id === selectedClub.id) + 1}
      />
    )}
    </>
  );
}
