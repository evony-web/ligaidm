'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Music, Users, Play, CheckCircle, Crown, Clock,
  Trophy, ChevronRight, Zap, UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDivisionTheme } from '@/hooks/use-division-theme';

interface Tournament {
  id: string; name: string; weekNumber: number; division: string; status: string;
  prizePool: number; bpm: number; location: string; scheduledAt: string | null;
  teams: { id: string; name: string; isWinner: boolean; power: number;
    teamPlayers: { player: { id: string; name: string; gamertag: string; tier: string; points: number } }[]
  }[];
  matches: { id: string; score1: number | null; score2: number | null; status: string; round: number;
    team1: { id: string; name: string }; team2: { id: string; name: string };
    mvpPlayer: { id: string; name: string; gamertag: string } | null
  }[];
  participations: { id: string; status: string; pointsEarned: number; isMvp: boolean; isWinner: boolean;
    player: { id: string; name: string; gamertag: string; tier: string; points: number }
  }[];
  donations: { id: string; donorName: string; amount: number }[];
  _count?: { teams: number; participations: number };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    setup: { label: 'Setup', cls: 'bg-muted text-muted-foreground' },
    registration: { label: 'Open Registration', cls: 'bg-green-500/10 text-green-500' },
    approval: { label: 'Approval Phase', cls: 'bg-yellow-500/10 text-yellow-500' },
    team_generation: { label: 'Teams Ready', cls: 'bg-blue-500/10 text-blue-500' },
    bracket_generation: { label: 'Bracket Ready', cls: 'bg-blue-500/10 text-blue-500' },
    main_event: { label: '🔴 LIVE', cls: 'bg-red-500/10 text-red-500' },
    scoring: { label: 'Scoring', cls: 'bg-yellow-500/10 text-yellow-500' },
    completed: { label: 'Completed ✓', cls: 'bg-muted text-muted-foreground' },
  };
  const c = config[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge className={`${c.cls} text-[10px] font-semibold border-0`}>{c.label}</Badge>;
}

export function TournamentView() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['tournaments', division],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments?division=${division}`);
      return res.json();
    },
  });

  const { data: selected } = useQuery<Tournament>({
    queryKey: ['tournament', selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${selectedId}`);
      return res.json();
    },
    enabled: !!selectedId,
  });

  const registerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      if (!selectedId) return;
      const res = await fetch(`/api/tournaments/${selectedId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournament', selectedId] }); toast.success('Registered!'); },
    onError: () => { toast.error('Registration failed'); },
  });

  const generateTeamsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tournaments/${selectedId}/generate-teams`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournament', selectedId] }); toast.success('Teams generated!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const generateBracketMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tournaments/${selectedId}/generate-bracket`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournament', selectedId] }); toast.success('Bracket generated!'); },
  });

  const advanceStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/tournaments/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournament', selectedId] }); toast.success('Status updated!'); },
  });

  const scoreMutation = useMutation({
    mutationFn: async ({ matchId, score1, score2 }: { matchId: string; score1: number; score2: number }) => {
      const res = await fetch(`/api/tournaments/${selectedId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, score1, score2 }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournament', selectedId] }); toast.success('Score saved!'); },
  });

  const finalizeMutation = useMutation({
    mutationFn: async (mvpPlayerId: string) => {
      const res = await fetch(`/api/tournaments/${selectedId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mvpPlayerId }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournament', selectedId] }); toast.success('Tournament finalized!'); },
  });

  // Tournament List View
  if (!selectedId) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Music className={`w-5 h-5 ${dt.neonText}`} />
          <h2 className="text-lg font-bold text-gradient-fury">Weekly Tournaments</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tournaments?.map(t => (
            <motion.div key={t.id} variants={item}>
              <Card
                className={`${dt.casinoCard} ${dt.casinoGlow} casino-shimmer card-lift cursor-pointer ${t.status === 'main_event' ? dt.neonPulse : ''}`}
                onClick={() => setSelectedId(t.id)}
              >
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`text-[10px] ${dt.neonText} font-semibold uppercase tracking-wider`}>Week {t.weekNumber}</p>
                      <p className="text-sm font-bold">{t.name}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t._count?.participations || 0}</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {formatCurrency(t.prizePool)}</span>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Tournament Detail View
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">
      <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        ← Back to tournaments
      </button>

      {selected && (
        <>
          {/* Header */}
          <motion.div variants={item}>
            <Card className={`${dt.casinoCard} ${dt.cornerAccent} overflow-hidden`}>
              <div className={dt.casinoBar} />
              <CardContent className="p-0 relative z-10">
                <div className="relative p-4 casino-img-overlay">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-[10px] ${dt.neonText} font-semibold uppercase tracking-wider mb-1`}>Week {selected.weekNumber}</p>
                      <h2 className={`text-xl font-bold ${dt.neonGradient}`}>{selected.name}</h2>
                      <p className="text-xs text-muted-foreground mt-1">📍 {selected.location} • {selected.bpm} BPM</p>
                    </div>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
                <div className="flex gap-2 p-4 pt-3 flex-wrap">
                  {selected.status === 'setup' && (
                    <Button size="sm" onClick={() => advanceStatusMutation.mutate('registration')}>
                      <Play className="w-3 h-3 mr-1" /> Open Registration
                    </Button>
                  )}
                  {selected.status === 'registration' && (
                    <Button size="sm" onClick={() => advanceStatusMutation.mutate('approval')}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Start Approval
                    </Button>
                  )}
                  {selected.status === 'approval' && (
                    <Button size="sm" onClick={() => generateTeamsMutation.mutate()}>
                      <Users className="w-3 h-3 mr-1" /> Generate Teams
                    </Button>
                  )}
                  {selected.status === 'team_generation' && (
                    <Button size="sm" onClick={() => generateBracketMutation.mutate()}>
                      <Music className="w-3 h-3 mr-1" /> Generate Bracket
                    </Button>
                  )}
                  {selected.status === 'bracket_generation' && (
                    <Button size="sm" onClick={() => advanceStatusMutation.mutate('main_event')}>
                      <Zap className="w-3 h-3 mr-1" /> Start Main Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Registered Players — Toornament-style list */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} h-full`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-0 relative z-10">
                  {/* Toornament-style section header */}
                  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                    <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Users className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Registered Players</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{selected.participations?.length || 0}</Badge>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {selected.participations?.map(p => (
                      <div key={p.id} className={`flex items-center justify-between px-2 py-2 rounded-lg hover:${dt.bgSubtle} transition-colors border-b ${dt.borderSubtle} last:border-0`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${dt.iconBg} flex items-center justify-center text-[10px] font-bold ${dt.neonText}`}>
                            {p.player.gamertag.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{p.player.gamertag}</p>
                            <p className="text-[10px] text-muted-foreground">{p.player.points} pts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TierBadge tier={p.player.tier} />
                          <Badge className={`text-[9px] border-0 ${
                            p.status === 'registered' ? 'bg-blue-500/10 text-blue-500' :
                            p.status === 'approved' || p.status === 'assigned' ? 'bg-green-500/10 text-green-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teams — Toornament-style list */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} h-full`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-0 relative z-10">
                  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                    <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Music className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Teams</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{selected.teams?.length || 0}</Badge>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {selected.teams?.length > 0 ? (
                      selected.teams.map(t => (
                        <div key={t.id} className={`p-2.5 rounded-lg mb-1.5 border ${dt.borderSubtle} ${t.isWinner ? dt.bgSubtle : ''}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold">{t.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-muted-foreground">Power: {t.power}</span>
                              {t.isWinner && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {t.teamPlayers.map(tp => (
                              <div key={tp.player.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${dt.bgSubtle} text-[10px]`}>
                                <TierBadge tier={tp.player.tier} />
                                <span>{tp.player.gamertag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Teams not yet generated</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Matches — Toornament-style Bracket View */}
          {selected.matches?.length > 0 && (
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} overflow-hidden`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-0 relative z-10">
                  {/* Section header */}
                  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                    <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Trophy className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Bracket</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{selected.matches.length} Matches</Badge>
                  </div>

                  {/* Horizontal bracket layout */}
                  <div className="overflow-x-auto custom-scrollbar p-4 pb-2">
                    <div className="flex gap-8 min-w-max">
                      {Object.entries(
                        selected.matches.reduce((acc, m) => {
                          if (!acc[m.round]) acc[m.round] = [];
                          acc[m.round].push(m);
                          return acc;
                        }, {} as Record<number, typeof selected.matches>)
                      ).map(([round, matches], roundIdx) => (
                        <div key={round} className="flex flex-col">
                          {/* Round label */}
                          <div className={`text-center mb-3 px-3 py-1.5 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                            {roundIdx === 0 ? 'Quarter Final' : roundIdx === 1 ? 'Semi Final' : roundIdx === 2 ? 'Final' : `Round ${round}`}
                          </div>
                          {/* Match cards with progressive spacing */}
                          <div className="flex-1 flex flex-col justify-around" style={{ gap: `${Math.pow(2, roundIdx) * 16}px` }}>
                            {matches.map((m, matchIdx) => {
                              const hasScore = m.score1 !== null && m.score2 !== null;
                              const winner1 = hasScore && m.score1! > m.score2!;
                              const winner2 = hasScore && m.score2! > m.score1!;
                              const isLive = m.status === 'live';
                              return (
                                <div key={m.id} className="relative">
                                  {/* Connector line */}
                                  {roundIdx > 0 && (
                                    <div className="absolute -left-5 top-1/2 w-5 flex items-center">
                                      <div className={`w-full h-px ${dt.borderSubtle}`} />
                                    </div>
                                  )}
                                  <div className={`rounded-lg overflow-hidden border ${dt.borderSubtle} ${isLive ? `border-red-500/30 ${dt.neonPulse}` : ''} transition-all hover:${dt.border} hover:shadow-sm`} style={{ background: 'var(--card-bg, rgba(20,17,10,0.6))' }}>
                                    {/* Team 1 */}
                                    <div className={`flex items-center px-2.5 py-1.5 border-b ${dt.borderSubtle} ${winner1 ? dt.bgSubtle : ''}`}>
                                      <span className={`text-[11px] font-semibold truncate flex-1 ${winner1 ? dt.neonText : 'text-foreground/80'}`}>
                                        {winner1 && <span className="mr-1">▸</span>}
                                        {m.team1.name}
                                      </span>
                                      <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner1 ? dt.neonText : 'text-muted-foreground'}`}>
                                        {hasScore ? m.score1 : '-'}
                                      </span>
                                    </div>
                                    {/* Team 2 */}
                                    <div className={`flex items-center px-2.5 py-1.5 ${winner2 ? dt.bgSubtle : ''}`}>
                                      <span className={`text-[11px] font-semibold truncate flex-1 ${winner2 ? dt.neonText : 'text-foreground/80'}`}>
                                        {winner2 && <span className="mr-1">▸</span>}
                                        {m.team2.name}
                                      </span>
                                      <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner2 ? dt.neonText : 'text-muted-foreground'}`}>
                                        {hasScore ? m.score2 : '-'}
                                      </span>
                                    </div>
                                    {/* MVP & Scoring controls */}
                                    {m.mvpPlayer && (
                                      <div className={`flex items-center justify-center gap-1 px-2 py-1 border-t ${dt.borderSubtle}`}>
                                        <Crown className="w-2.5 h-2.5 text-yellow-500" />
                                        <span className="text-[9px] text-yellow-500 font-semibold">{m.mvpPlayer.gamertag}</span>
                                      </div>
                                    )}
                                    {/* Scoring input */}
                                    {(m.status === 'pending' || m.status === 'live') && selected.status === 'main_event' && (
                                      <div className={`flex items-center justify-center gap-1 px-2 py-1.5 border-t ${dt.borderSubtle}`}>
                                        <Button size="sm" variant="outline" className="text-[9px] h-5 px-1.5"
                                          onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 2, score2: 0 })}>
                                          2-0
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-[9px] h-5 px-1.5"
                                          onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 2, score2: 1 })}>
                                          2-1
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-[9px] h-5 px-1.5"
                                          onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 0, score2: 2 })}>
                                          0-2
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-[9px] h-5 px-1.5"
                                          onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 1, score2: 2 })}>
                                          1-2
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Finalize button */}
                  {selected.status === 'scoring' && selected.matches.some(m => m.status === 'completed') && (
                    <div className={`mx-4 mb-4 p-3 rounded-xl ${dt.bg} border ${dt.border}`}>
                      <p className="text-xs font-semibold mb-2">Assign MVP & Finalize</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.teams.flatMap(t => t.teamPlayers).map(tp => (
                          <Button key={tp.player.id} size="sm" variant="outline" className="text-xs h-7"
                            onClick={() => finalizeMutation.mutate(tp.player.id)}>
                            <Crown className="w-3 h-3 mr-1 text-yellow-500" /> {tp.player.gamertag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
