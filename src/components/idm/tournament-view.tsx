'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Swords, Users, Play, CheckCircle, Crown, Clock,
  Trophy, ChevronRight, Zap, UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { useState } from 'react';
import { toast } from 'sonner';

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
          <Swords className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gradient-fury">Weekly Tournaments</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tournaments?.map(t => (
            <motion.div key={t.id} variants={item}>
              <Card
                className="glass card-hover border-0 cursor-pointer"
                onClick={() => setSelectedId(t.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Week {t.weekNumber}</p>
                      <p className="text-sm font-semibold">{t.name}</p>
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
            <Card className="glass glow-pulse border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gradient-fury">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">Week {selected.weekNumber} • {selected.location}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
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
                      <Swords className="w-3 h-3 mr-1" /> Generate Bracket
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
            {/* Registered Players */}
            <motion.div variants={item}>
              <Card className="glass border-0 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Registered Players ({selected.participations?.length || 0})</h3>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {selected.participations?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
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

            {/* Teams */}
            <motion.div variants={item}>
              <Card className="glass border-0 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Teams ({selected.teams?.length || 0})</h3>
                  </div>
                  {selected.teams?.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {selected.teams.map(t => (
                        <div key={t.id} className={`p-3 rounded-xl ${t.isWinner ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">{t.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">Power: {t.power}</span>
                              {t.isWinner && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {t.teamPlayers.map(tp => (
                              <div key={tp.player.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 text-xs">
                                <TierBadge tier={tp.player.tier} />
                                <span>{tp.player.gamertag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">Teams not yet generated</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Matches */}
          {selected.matches?.length > 0 && (
            <motion.div variants={item}>
              <Card className="glass border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Match Results</h3>
                  </div>
                  {selected.matches.map(m => (
                    <div key={m.id} className="p-4 rounded-xl bg-muted/50 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <p className="text-sm font-semibold">{m.team1.name}</p>
                          <p className="text-2xl font-bold text-primary">{m.score1 ?? '-'}</p>
                        </div>
                        <div className="px-4 text-xs text-muted-foreground font-bold">VS</div>
                        <div className="text-center flex-1">
                          <p className="text-sm font-semibold">{m.team2.name}</p>
                          <p className="text-2xl font-bold text-primary">{m.score2 ?? '-'}</p>
                        </div>
                      </div>
                      {m.mvpPlayer && (
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-500">MVP: {m.mvpPlayer.gamertag}</span>
                        </div>
                      )}
                      {/* Scoring input for live/pending matches */}
                      {(m.status === 'pending' || m.status === 'live') && selected.status === 'main_event' && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 2, score2: 0 })}>
                            {m.team1.name} 2-0
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 2, score2: 1 })}>
                            {m.team1.name} 2-1
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 0, score2: 2 })}>
                            {m.team2.name} 2-0
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => scoreMutation.mutate({ matchId: m.id, score1: 1, score2: 2 })}>
                            {m.team2.name} 2-1
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Finalize button */}
                  {selected.status === 'scoring' && selected.matches.some(m => m.status === 'completed') && (
                    <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
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
