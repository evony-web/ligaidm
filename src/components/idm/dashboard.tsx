'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Heart, MapPin, Users, Trophy, Clock, Flame,
  TrendingUp, Award, Gift, Zap, Crown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from './tier-badge';

interface StatsData {
  hasData: boolean;
  division: string;
  season: { id: string; name: string; number: number; status: string };
  activeTournament: {
    id: string; name: string; weekNumber: number; status: string;
    prizePool: number; bpm: number; location: string; scheduledAt: string;
    teams: { id: string; name: string; isWinner: boolean; power: number;
      teamPlayers: { player: { id: string; name: string; gamertag: string; tier: string; points: number } }[]
    }[];
    matches: { id: string; score1: number | null; score2: number | null; status: string;
      team1: { id: string; name: string }; team2: { id: string; name: string };
      mvpPlayer: { id: string; name: string; gamertag: string } | null
    }[];
    donations: { id: string; donorName: string; amount: number; message: string | null }[];
  } | null;
  totalPlayers: number;
  totalPrizePool: number;
  seasonDonationTotal: number;
  topPlayers: { id: string; name: string; gamertag: string; tier: string; points: number; totalWins: number; streak: number; totalMvp: number }[];
  recentMatches: { id: string; score1: number; score2: number; club1: { name: string }; club2: { name: string }; week: number }[];
  upcomingMatches: { id: string; club1: { name: string }; club2: { name: string }; week: number }[];
  seasonProgress: { totalWeeks: number; completedWeeks: number; percentage: number };
  topDonors: { donorName: string; totalAmount: number; donationCount: number }[];
  clubs: { id: string; name: string; wins: number; losses: number; points: number; gameDiff: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    setup: { label: 'Setup', cls: 'bg-muted text-muted-foreground' },
    registration: { label: 'Registration Open', cls: 'bg-green-500/10 text-green-500' },
    approval: { label: 'Approval', cls: 'bg-yellow-500/10 text-yellow-500' },
    team_generation: { label: 'Teams Generated', cls: 'bg-blue-500/10 text-blue-500' },
    bracket_generation: { label: 'Bracket Ready', cls: 'bg-blue-500/10 text-blue-500' },
    main_event: { label: '🔴 LIVE', cls: 'bg-red-500/10 text-red-500' },
    scoring: { label: 'Scoring', cls: 'bg-yellow-500/10 text-yellow-500' },
    completed: { label: 'Completed', cls: 'bg-muted text-muted-foreground' },
  };
  const c = config[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge className={`${c.cls} text-[10px] font-semibold border-0`}>{c.label}</Badge>;
}

export function Dashboard() {
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

  const t = data.activeTournament;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">

      {/* HERO CARD */}
      <motion.div variants={item}>
        <Card className="glass glow-pulse overflow-hidden border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <CardContent className="relative p-4 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">WEEKLY TOURNAMENT</p>
                <h2 className="text-xl lg:text-2xl font-bold text-gradient-fury">
                  {t?.name || `Week 5 Tournament`}
                </h2>
                <div className="mt-2"><StatusBadge status={t?.status || 'registration'} /></div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-red-400">
                  <Heart className="w-3 h-3" />
                  <span className="text-xs font-mono">{t?.bpm || 128} BPM</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{t?.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Coming Soon'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{t?.location || 'Online'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>{data.totalPlayers} Players</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className="w-3.5 h-3.5 text-primary" />
                <span>Week {t?.weekNumber || 5}</span>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Prize Pool</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(t?.prizePool || 0)}</span>
              </div>
              <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Target: {formatCurrency(500000)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LATEST MATCH RESULT */}
        <motion.div variants={item}>
          <Card className="glass card-hover border-0 h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Latest Match Result</h3>
              </div>
              {t?.matches?.filter(m => m.status === 'completed').slice(-1).map(m => (
                <div key={m.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-sm font-semibold">{m.team1.name}</p>
                      <p className="text-2xl font-bold text-primary">{m.score1}</p>
                    </div>
                    <div className="px-3 text-xs text-muted-foreground font-bold">VS</div>
                    <div className="text-center flex-1">
                      <p className="text-sm font-semibold">{m.team2.name}</p>
                      <p className="text-2xl font-bold text-primary">{m.score2}</p>
                    </div>
                  </div>
                  {m.mvpPlayer && (
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-500">MVP: {m.mvpPlayer.gamertag}</span>
                    </div>
                  )}
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-6">No matches yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SEASON PROGRESS */}
        <motion.div variants={item}>
          <Card className="glass card-hover border-0 h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Season Progress</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{data.season?.name}</span>
                    <span className="font-semibold">{data.seasonProgress?.completedWeeks}/{data.seasonProgress?.totalWeeks} Weeks</span>
                  </div>
                  <Progress value={data.seasonProgress?.percentage || 0} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold text-primary">{data.totalPlayers}</p>
                    <p className="text-[10px] text-muted-foreground">Players</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold text-primary">{data.clubs?.length || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Clubs</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold text-primary">{formatCurrency(data.seasonDonationTotal || 0)}</p>
                    <p className="text-[10px] text-muted-foreground">Funded</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* LEADERBOARD TOP 5 */}
        <motion.div variants={item}>
          <Card className="glass card-hover border-0 h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Leaderboard</h3>
                </div>
                <span className="text-[10px] text-muted-foreground">Top 5</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {data.topPlayers?.slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                      idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{p.gamertag}</span>
                        <TierBadge tier={p.tier} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{p.points} pts</span>
                        <span>•</span>
                        <span>{p.totalWins}W</span>
                        {p.streak > 1 && <span className="text-orange-400">🔥{p.streak}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* DONATION TRACKER */}
        <motion.div variants={item}>
          <Card className="glass card-hover border-0 h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Donation & Sawer</h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Total Prize Pool</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(data.totalPrizePool)}</p>
                <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Top Contributors</p>
                {data.topDonors?.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                      {d.donorName}
                    </span>
                    <span className="font-semibold text-primary">{formatCurrency(d.totalAmount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* UPCOMING MATCHES */}
      {data.upcomingMatches?.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Upcoming League Matches</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {data.upcomingMatches.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-muted/50 text-center card-hover">
                    <p className="text-[10px] text-muted-foreground mb-1">Week {m.week}</p>
                    <p className="text-sm font-semibold">{m.club1.name} <span className="text-muted-foreground">vs</span> {m.club2.name}</p>
                    <Badge className="mt-1 bg-primary/10 text-primary text-[10px] border-0">BO3</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
