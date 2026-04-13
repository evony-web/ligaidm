'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Swords, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface StatsData {
  hasData: boolean;
  clubs: { id: string; name: string; wins: number; losses: number; points: number; gameDiff: number; _count?: { members: number } }[];
  leagueMatches: { id: string; week: number; score1: number | null; score2: number | null; status: string; format: string;
    club1: { name: string }; club2: { name: string } }[];
  playoffMatches: { id: string; round: string; score1: number | null; score2: number | null; status: string; format: string;
    club1: { name: string }; club2: { name: string } }[];
  season: { id: string; name: string };
}

export function LeagueView() {
  const { division } = useAppStore();
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const clubs = data.clubs || [];
  const leagueMatches = data.leagueMatches || [];
  const playoffMatches = data.playoffMatches || [];

  // Group league matches by week
  const weeks = [...new Set(leagueMatches.map(m => m.week))].sort((a, b) => a - b);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-gradient-fury">IDM League</h2>
        <Badge className="bg-primary/10 text-primary text-[10px] border-0 ml-2">{data.season?.name}</Badge>
      </div>

      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-muted/50">
          <TabsTrigger value="standings" className="text-xs">Standings</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
          <TabsTrigger value="playoff" className="text-xs">Playoff</TabsTrigger>
        </TabsList>

        {/* STANDINGS */}
        <TabsContent value="standings">
          <motion.div variants={container} initial="hidden" animate="show">
            <Card className="glass border-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs font-semibold text-muted-foreground">#</th>
                        <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Club</th>
                        <th className="text-center p-3 text-xs font-semibold text-muted-foreground">M</th>
                        <th className="text-center p-3 text-xs font-semibold text-muted-foreground">W</th>
                        <th className="text-center p-3 text-xs font-semibold text-muted-foreground">L</th>
                        <th className="text-center p-3 text-xs font-semibold text-muted-foreground">GD</th>
                        <th className="text-center p-3 text-xs font-semibold text-primary">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map((club, idx) => (
                        <motion.tr
                          key={club.id}
                          variants={item}
                          className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                            idx < 4 ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="p-3">
                            <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                              idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                              idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">{club.name}</td>
                          <td className="p-3 text-center text-muted-foreground">{club.wins + club.losses}</td>
                          <td className="p-3 text-center">{club.wins}</td>
                          <td className="p-3 text-center">{club.losses}</td>
                          <td className="p-3 text-center text-muted-foreground">{club.gameDiff > 0 ? `+${club.gameDiff}` : club.gameDiff}</td>
                          <td className="p-3 text-center font-bold text-primary text-lg">{club.points}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* SCHEDULE */}
        <TabsContent value="schedule">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {weeks.map(week => (
              <motion.div key={week} variants={item}>
                <Card className="glass border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold">Week {week}</h3>
                      </div>
                      <Badge className="bg-primary/10 text-primary text-[10px] border-0">
                        {leagueMatches.filter(m => m.week === week && m.status === 'completed').length}/{leagueMatches.filter(m => m.week === week).length} Played
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {leagueMatches.filter(m => m.week === week).map(m => (
                        <div key={m.id} className={`p-3 rounded-xl transition-all ${
                          m.status === 'completed'
                            ? 'bg-muted/30 border border-border/20'
                            : 'bg-primary/5 border border-primary/10 card-hover'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                m.status === 'completed' && m.score1! > m.score2! ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                              }`}>
                                {m.club1.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className={`text-sm font-medium truncate ${
                                m.status === 'completed' && m.score1! > m.score2! ? 'text-primary font-bold' : ''
                              }`}>
                                {m.club1.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mx-3">
                              {m.status === 'completed' ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10">
                                  <span className={`text-base font-bold ${m.score1! > m.score2! ? 'text-primary' : 'text-muted-foreground'}`}>{m.score1}</span>
                                  <span className="text-[10px] text-muted-foreground">-</span>
                                  <span className={`text-base font-bold ${m.score2! > m.score1! ? 'text-primary' : 'text-muted-foreground'}`}>{m.score2}</span>
                                </div>
                              ) : (
                                <Badge className="bg-primary/10 text-primary text-[10px] border-0">vs</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                              <span className={`text-sm font-medium truncate ${
                                m.status === 'completed' && m.score2! > m.score1! ? 'text-primary font-bold' : ''
                              }`}>
                                {m.club2.name}
                              </span>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                m.status === 'completed' && m.score2! > m.score1! ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
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
            ))}
          </motion.div>
        </TabsContent>

        {/* PLAYOFF BRACKET */}
        <TabsContent value="playoff">
          <motion.div variants={container} initial="hidden" animate="show">
            <Card className="glass border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Playoff Bracket</h3>
                </div>

                {/* MPL-style horizontal bracket */}
                <div className="flex items-center justify-center gap-4 lg:gap-8 overflow-x-auto py-4">
                  {/* Semifinals */}
                  <div className="space-y-8">
                    <p className="text-[10px] text-muted-foreground text-center font-semibold mb-2">SEMI FINAL</p>
                    {playoffMatches.filter(m => m.round.startsWith('semifinal')).map(m => (
                      <div key={m.id} className="p-3 rounded-xl bg-muted/50 min-w-[160px] card-hover">
                        <div className="space-y-2">
                          <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score1! > m.score2! ? 'font-bold text-primary' : ''}`}>
                            <span>{m.club1.name}</span>
                            <span>{m.score1 ?? '-'}</span>
                          </div>
                          <div className="h-px bg-border" />
                          <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score2! > m.score1! ? 'font-bold text-primary' : ''}`}>
                            <span>{m.club2.name}</span>
                            <span>{m.score2 ?? '-'}</span>
                          </div>
                        </div>
                        <Badge className="mt-2 text-[9px] border-0 bg-primary/10 text-primary">BO5</Badge>
                      </div>
                    ))}
                  </div>

                  {/* Connector */}
                  <div className="hidden lg:flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="w-8 h-px bg-border" />
                    <Swords className="w-4 h-4" />
                    <div className="w-8 h-px bg-border" />
                  </div>

                  {/* Grand Final */}
                  <div>
                    <p className="text-[10px] text-muted-foreground text-center font-semibold mb-2">GRAND FINAL</p>
                    {playoffMatches.filter(m => m.round === 'grand_final').map(m => (
                      <div key={m.id} className="p-4 rounded-xl bg-primary/5 border border-primary/20 min-w-[180px] glow-pulse card-hover">
                        <div className="space-y-2">
                          <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score1! > m.score2! ? 'font-bold text-primary' : ''}`}>
                            <span>{m.club1.name}</span>
                            <span>{m.score1 ?? '-'}</span>
                          </div>
                          <div className="h-px bg-primary/20" />
                          <div className={`flex items-center justify-between text-xs ${m.status === 'completed' && m.score2! > m.score1! ? 'font-bold text-primary' : ''}`}>
                            <span>{m.club2.name}</span>
                            <span>{m.score2 ?? '-'}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <Badge className="text-[9px] border-0 bg-yellow-500/10 text-yellow-500">🏆 BO5</Badge>
                        </div>
                      </div>
                    ))}
                    {playoffMatches.filter(m => m.round === 'grand_final').length === 0 && (
                      <div className="p-4 rounded-xl bg-muted/30 min-w-[180px] text-center">
                        <p className="text-xs text-muted-foreground">Coming Soon</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
