'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Heart, MapPin, Users, Trophy, Clock, Flame,
  TrendingUp, Award, Gift, Zap, Crown, Sparkles,
  Activity, Radio
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from './tier-badge';
import { CountdownTimer } from './countdown-timer';
import { PlayerCard } from './player-card';
import { PlayerProfile } from './player-profile';
import { useEffect, useCallback, useState } from 'react';

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
  topPlayers: { id: string; name: string; gamertag: string; tier: string; points: number; totalWins: number; streak: number; maxStreak: number; totalMvp: number; matches: number; club?: string; division?: string }[];
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
  const config: Record<string, { label: string; cls: string; pulse?: boolean }> = {
    setup: { label: 'Setup', cls: 'bg-muted text-muted-foreground' },
    registration: { label: '🟢 Registration Open', cls: 'bg-green-500/10 text-green-500' },
    approval: { label: '⏳ Approval', cls: 'bg-yellow-500/10 text-yellow-500' },
    team_generation: { label: '✅ Teams Ready', cls: 'bg-blue-500/10 text-blue-500' },
    bracket_generation: { label: '✅ Bracket Ready', cls: 'bg-blue-500/10 text-blue-500' },
    main_event: { label: '🔴 LIVE NOW', cls: 'bg-red-500/10 text-red-500', pulse: true },
    scoring: { label: '📊 Scoring', cls: 'bg-yellow-500/10 text-yellow-500' },
    completed: { label: '🏆 Completed', cls: 'bg-muted text-muted-foreground' },
  };
  const c = config[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  return (
    <Badge className={`${c.cls} text-[10px] font-semibold border-0 ${c.pulse ? 'live-dot' : ''}`}>
      {c.label}
    </Badge>
  );
}

export function Dashboard() {
  const { division } = useAppStore();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] | null>(null);
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

  // Donation popup simulation
  const showDonationPopup = useAppStore(s => s.showDonationPopup);
  const addNotification = useAppStore(s => s.addNotification);

  const simulateDonation = useCallback(() => {
    const donors = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Galih', 'Hana'];
    const amounts = [25000, 50000, 100000];
    const donor = donors[Math.floor(Math.random() * donors.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    showDonationPopup(`🔥 Donasi masuk ${formatCurrency(amount)} dari ${donor}`);
    addNotification('donation', `${donor} donated ${formatCurrency(amount)}`);
  }, [showDonationPopup, addNotification]);

  useEffect(() => {
    const interval = setInterval(simulateDonation, 15000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [simulateDonation]);

  if (isLoading || !data?.hasData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const t = data.activeTournament;

  return (
    <>
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">

      {/* HERO BANNER */}
      <motion.div variants={item} className="relative rounded-2xl overflow-hidden">
        <img src="/idm-hero.png" alt="IDM League Arena" className="w-full h-32 lg:h-48 object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gradient-fury">IDM League Arena</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{data.season?.name} • {division === 'male' ? '⚔️ Male' : '🗡️ Female'} Division</p>
        </div>
      </motion.div>

      {/* HERO CARD */}
      <motion.div variants={item}>
        <Card className="glass glow-pulse overflow-hidden border-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-idm-purple/5 pointer-events-none" />
          <CardContent className="relative p-4 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Weekly Tournament</p>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gradient-fury">
                  {t?.name || `Week 5 Tournament`}
                </h2>
                <div className="mt-2"><StatusBadge status={t?.status || 'registration'} /></div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-red-400">
                  <Heart className="w-3 h-3 live-dot" />
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

            {/* Countdown Timer */}
            {t?.scheduledAt && t.status !== 'completed' && (
              <div className="mt-4 flex justify-center">
                <CountdownTimer targetDate={t.scheduledAt} />
              </div>
            )}

            {/* Prize Pool */}
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">💰 Prize Pool</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(t?.prizePool || 0)}</span>
              </div>
              <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Target: {formatCurrency(500000)} • Collected: {formatCurrency(data.totalPrizePool)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* LIVE MATCH TICKER */}
      {data.recentMatches?.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/10">
                <Radio className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Recent Results</span>
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500 ml-1" />
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-3 p-3 min-w-max">
                  {data.recentMatches.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/30 border border-border/30 shrink-0">
                      <div className="text-right min-w-[70px]">
                        <p className={`text-xs font-semibold ${m.score1 > m.score2 ? 'text-primary' : 'text-muted-foreground'}`}>{m.club1.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10">
                        <span className="text-sm font-bold text-primary">{m.score1}</span>
                        <span className="text-[10px] text-muted-foreground">-</span>
                        <span className="text-sm font-bold text-primary">{m.score2}</span>
                      </div>
                      <div className="text-left min-w-[70px]">
                        <p className={`text-xs font-semibold ${m.score2 > m.score1 ? 'text-primary' : 'text-muted-foreground'}`}>{m.club2.name}</p>
                      </div>
                      <Badge className="text-[9px] border-0 bg-muted text-muted-foreground">W{m.week}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* TOP 3 PLAYER CARDS */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-semibold">Top Players</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {data.topPlayers?.slice(0, 3).map((p, idx) => (
            <PlayerCard
              key={p.id}
              gamertag={p.gamertag}
              tier={p.tier}
              points={p.points}
              totalWins={p.totalWins}
              totalMvp={p.totalMvp}
              streak={p.streak}
              rank={idx + 1}
              isMvp={p.totalMvp > 0 && idx === 0}
              club={p.club}
              onClick={() => setSelectedPlayer(p)}
            />
          ))}
        </div>
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
                <div key={m.id} className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-sm font-semibold">{m.team1.name}</p>
                      <p className="text-3xl font-bold text-primary mt-1">{m.score1}</p>
                    </div>
                    <div className="px-4 text-center">
                      <span className="text-xs text-muted-foreground font-bold">VS</span>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-sm font-semibold">{m.team2.name}</p>
                      <p className="text-3xl font-bold text-primary mt-1">{m.score2}</p>
                    </div>
                  </div>
                  {m.mvpPlayer && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-yellow-500/5">
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
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{data.season?.name}</span>
                    <span className="font-semibold text-primary">{data.seasonProgress?.completedWeeks}/{data.seasonProgress?.totalWeeks} Weeks</span>
                  </div>
                  <Progress value={data.seasonProgress?.percentage || 0} className="h-2.5" />
                  <p className="text-[10px] text-primary font-semibold mt-1">{data.seasonProgress?.percentage}% Complete</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-center border border-primary/10">
                    <p className="text-lg font-bold text-primary">{data.totalPlayers}</p>
                    <p className="text-[10px] text-muted-foreground">Players</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary/5 text-center border border-primary/10">
                    <p className="text-lg font-bold text-primary">{data.clubs?.length || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Clubs</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary/5 text-center border border-primary/10">
                    <p className="text-sm font-bold text-primary">{formatCurrency(data.seasonDonationTotal || 0)}</p>
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
                <span className="text-[10px] text-primary font-semibold">TOP 5</span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                {data.topPlayers?.slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedPlayer(p)}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                      idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {p.gamertag.slice(0, 2).toUpperCase()}
                    </div>
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
                <span className="live-dot w-2 h-2 rounded-full bg-red-500 ml-auto" />
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
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        i === 1 ? 'bg-gray-400/20 text-gray-400' :
                        'bg-primary/10 text-primary'
                      }`}>{i + 1}</span>
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

      {/* ACTIVITY FEED */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Activity Feed</h3>
              <span className="live-dot w-2 h-2 rounded-full bg-red-500 ml-auto" />
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {/* Recent Match Events */}
              {data.recentMatches?.slice(0, 3).map((m, i) => (
                <div key={`match-${m.id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      <span className="text-primary">{m.club1.name}</span> vs <span className="text-primary">{m.club2.name}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">Week {m.week} • League Match</p>
                  </div>
                  <Badge className={`text-[10px] border-0 ${
                    m.score1 > m.score2
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {m.score1}-{m.score2}
                  </Badge>
                </div>
              ))}

              {/* Top Player Events */}
              {data.topPlayers?.slice(0, 2).map((p) => (
                <div key={`player-${p.id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      <span className="text-yellow-500">{p.gamertag}</span> earned MVP
                    </p>
                    <p className="text-[10px] text-muted-foreground">{p.points} pts • {p.totalMvp}x MVP this season</p>
                  </div>
                  <TierBadge tier={p.tier} />
                </div>
              ))}

              {/* Streak Events */}
              {data.topPlayers?.filter(p => p.streak >= 2).slice(0, 1).map((p) => (
                <div key={`streak-${p.id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      <span className="text-orange-500">{p.gamertag}</span> is on a {p.streak}-win streak!
                    </p>
                    <p className="text-[10px] text-muted-foreground">+{Math.min(p.streak * 5, 30)} bonus pts</p>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-500 text-[10px] border-0">🔥{p.streak}</Badge>
                </div>
              ))}

              {/* Donation Events */}
              {data.topDonors?.slice(0, 1).map((d, i) => (
                <div key={`donation-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      <span className="text-primary">{d.donorName}</span> donated
                    </p>
                    <p className="text-[10px] text-muted-foreground">{d.donationCount} contributions this season</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{formatCurrency(d.totalAmount)}</span>
                </div>
              ))}

              {/* Upcoming Match Event */}
              {data.upcomingMatches?.slice(0, 1).map((m) => (
                <div key={`upcoming-${m.id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-idm-purple/5 border border-idm-purple/10">
                  <div className="w-8 h-8 rounded-lg bg-idm-purple/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-idm-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      <span className="text-idm-purple">{m.club1.name}</span> vs <span className="text-idm-purple">{m.club2.name}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">Week {m.week} • Upcoming</p>
                  </div>
                  <Badge className="bg-idm-purple/10 text-idm-purple text-[10px] border-0">BO3</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                  <div key={m.id} className="p-3 rounded-xl bg-muted/50 text-center card-hover border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">Week {m.week}</p>
                    <p className="text-sm font-semibold">{m.club1.name} <span className="text-muted-foreground">vs</span> {m.club2.name}</p>
                    <Badge className="mt-1.5 bg-primary/10 text-primary text-[10px] border-0">BO3</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          rank={data.topPlayers?.findIndex(p => p.id === selectedPlayer.id) + 1}
        />
      )}
    </>
  );
}
