'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Heart, MapPin, Users, Trophy, Clock, Flame,
  TrendingUp, Award, Gift, Zap, Crown, Sparkles,
  Activity, Radio, Shield, Swords, BarChart3,
  Gamepad2, Calendar, Target, Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TierBadge } from './tier-badge';
import { CountdownTimer } from './countdown-timer';
import { PlayerCard } from './player-card';
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { useEffect, useCallback, useState } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';

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
    registration: { label: 'Registration Open', cls: 'bg-green-500/10 text-green-500' },
    approval: { label: 'Approval', cls: 'bg-yellow-500/10 text-yellow-500' },
    team_generation: { label: 'Teams Ready', cls: 'bg-blue-500/10 text-blue-500' },
    bracket_generation: { label: 'Bracket Ready', cls: 'bg-blue-500/10 text-blue-500' },
    main_event: { label: 'LIVE NOW', cls: 'bg-red-500/10 text-red-500', pulse: true },
    scoring: { label: 'Scoring', cls: 'bg-yellow-500/10 text-yellow-500' },
    completed: { label: 'Completed', cls: 'bg-muted text-muted-foreground' },
  };
  const c = config[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  return (
    <Badge className={`${c.cls} text-[10px] font-semibold border-0 ${c.pulse ? 'live-dot' : ''}`}>
      {c.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />}
      {c.label}
    </Badge>
  );
}

/* Casino-style card with image header — SpinWin inspired */
function CasinoHeaderCard({ icon: Icon, title, badge, children, className = '' }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const dt = useDivisionTheme();
  return (
    <Card className={`${dt.casinoCard} ${dt.casinoGlow} casino-shimmer overflow-hidden group ${className}`}>
      {/* Neon accent bar */}
      <div className={dt.casinoBar} />
      {/* Image Header */}
      <div className="relative img-zoom h-28 sm:h-32">
        <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover card-cover" aria-hidden="true" />
        <div className="casino-img-overlay" />
        {/* Corner accents */}
        <div className={`absolute top-2 left-2 ${dt.cornerAccent}`} />
        <div className={`absolute top-2 right-2 rotate-90 ${dt.cornerAccent}`} />
        {badge && <Badge className={`absolute top-3 right-3 ${dt.casinoBadge} backdrop-blur-sm`}>{badge}</Badge>}
        <div className="absolute bottom-3 left-4 flex items-center gap-3 z-10">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dt.division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-sm font-bold ${dt.neonText}`}>{title}</h3>
        </div>
      </div>
      {/* Content */}
      <CardContent className="p-4 relative z-10">{children}</CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] | null>(null);
  const [selectedClub, setSelectedClub] = useState<StatsData['clubs'][0] | null>(null);
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

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
        <div className={`w-8 h-8 border-2 ${dt.border} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  const t = data.activeTournament;

  return (
    <>
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-5xl mx-auto">

      {/* ========== HERO BANNER — Casino Immersive ========== */}
      <motion.div variants={item} className={`relative rounded-2xl overflow-hidden ${dt.casinoCard} ${dt.neonPulse} min-h-[220px] casino-shimmer`}>
        {/* Neon bar */}
        <div className={dt.casinoBar} />
        {/* Banner Background */}
        <div className="absolute inset-0 hidden sm:block">
          <img src="/bg-default.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 sm:hidden">
          <img src="/bg-mobiledefault.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        {/* Casino overlay */}
        <div className="casino-img-overlay" />
        {/* Division ambient light */}
        <div className={`absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl ${dt.bg} opacity-30`} />
        {/* Corner accents */}
        <div className={`absolute top-3 left-3 ${dt.cornerAccent}`} />
        <div className={`absolute top-3 right-3 rotate-90 ${dt.cornerAccent}`} />
        <div className="absolute bottom-4 left-5 right-5 z-10">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
              🐉 Season {data.season?.number || 1}
            </Badge>
            <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
              {division === 'male' ? '⚔️ Male' : '🗡️ Female'}
            </Badge>
          </div>
          <h2 className={`text-2xl lg:text-3xl font-black ${dt.neonGradient}`}>IDM League Arena</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{data.season?.name}</p>
        </div>
      </motion.div>

      {/* ========== TOURNAMENT INFO — Casino Card ========== */}
      <motion.div variants={item}>
        <Card className={`${dt.casinoCard} ${dt.casinoGlow} overflow-hidden casino-shimmer group`}>
          {/* Neon bar */}
          <div className={dt.casinoBar} />
          {/* Image Header Section */}
          <div className="relative img-zoom h-36 sm:h-44">
            <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover card-cover" aria-hidden="true" />
            <div className="casino-img-overlay" />
            {/* Corner accents */}
            <div className={`absolute top-2 left-2 ${dt.cornerAccent}`} />
            <div className={`absolute top-2 right-2 rotate-90 ${dt.cornerAccent}`} />
            {/* Status badge */}
            <div className="absolute top-3 right-3 z-10">
              <StatusBadge status={t?.status || 'registration'} />
            </div>
            {/* Tournament title on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={`w-3.5 h-3.5 ${dt.neonText}`} />
                <span className={`text-[10px] font-semibold ${dt.neonText} uppercase tracking-wider`}>Weekly Tournament</span>
              </div>
              <h2 className={`text-xl lg:text-2xl font-bold ${dt.neonGradient}`}>
                {t?.name || `Week 5 Tournament`}
              </h2>
              <div className="flex items-center gap-1 text-red-400 mt-1">
                <Heart className="w-3 h-3 live-dot" />
                <span className="text-xs font-mono">{t?.bpm || 128} BPM</span>
              </div>
            </div>
          </div>
          {/* Content Below Image */}
          <CardContent className="p-4 lg:p-5 space-y-4 relative z-10">
            {/* Info Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className={`w-3.5 h-3.5 ${dt.neonText}`} />
                <span>{t?.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Coming Soon'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className={`w-3.5 h-3.5 ${dt.neonText}`} />
                <span>{t?.location || 'Online'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className={`w-3.5 h-3.5 ${dt.neonText}`} />
                <span>{data.totalPlayers} Players</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className={`w-3.5 h-3.5 ${dt.neonText}`} />
                <span>Week {t?.weekNumber || 5}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            {t?.scheduledAt && t.status !== 'completed' && (
              <div className="flex justify-center">
                <CountdownTimer targetDate={t.scheduledAt} />
              </div>
            )}

            {/* Prize Pool */}
            <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">💰 Prize Pool</span>
                <span className={`text-lg font-bold ${dt.neonGradient}`}>{formatCurrency(t?.prizePool || 0)}</span>
              </div>
              <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Target: {formatCurrency(500000)} • Collected: {formatCurrency(data.totalPrizePool)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== QUICK STATS — Casino Pills ========== */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, value: `${data.totalPlayers}`, label: 'Players', color: 'from-idm-male to-idm-male-light' },
          { icon: Shield, value: `${data.clubs?.length || 0}`, label: 'Clubs', color: 'from-idm-female to-idm-female-light' },
          { icon: Wallet, value: formatCurrency(data.totalPrizePool).replace('Rp', '').trim(), label: 'Prize Pool', color: 'from-[#d4a853] to-[#b8860b]' },
          { icon: Target, value: `${data.seasonProgress?.percentage || 0}%`, label: 'Progress', color: 'from-green-500 to-green-600' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03, y: -2 }}
            className="group"
          >
            <div className={`casino-pill ${dt.casinoGlow}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shrink-0`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-lg font-bold ${dt.neonGradient}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ========== MATCH RESULTS — Casino Match Cards ========== */}
      {data.recentMatches?.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
              <Radio className={`w-3.5 h-3.5 ${dt.neonText}`} />
            </div>
            <h3 className="text-sm font-semibold">Recent Results</h3>
            <Badge className={`${dt.casinoBadge} ml-auto`}>LIVE</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentMatches.slice(0, 6).map(m => (
              <motion.div key={m.id} whileHover={{ scale: 1.02 }} className={`${dt.casinoCard} ${dt.casinoGlow} casino-shimmer rounded-xl overflow-hidden`}>
                {/* Neon bar */}
                <div className={dt.casinoBar} />
                {/* Mini image header */}
                <div className="relative h-16 overflow-hidden">
                  <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                  <div className="casino-img-overlay" />
                  <Badge className="absolute top-2 right-2 text-[9px] bg-black/60 backdrop-blur-sm text-foreground border-0">W{m.week}</Badge>
                </div>
                {/* Score */}
                <div className="p-3 flex items-center justify-between relative z-10">
                  <div className="text-center flex-1">
                    <p className={`text-xs font-semibold truncate ${m.score1 > m.score2 ? dt.neonText : 'text-muted-foreground'}`}>{m.club1.name}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${dt.bg}`}>
                    <span className={`text-sm font-bold ${dt.neonText} casino-score`}>{m.score1}</span>
                    <span className="text-[10px] text-muted-foreground">-</span>
                    <span className={`text-sm font-bold ${dt.neonText} casino-score`}>{m.score2}</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className={`text-xs font-semibold truncate ${m.score2 > m.score1 ? dt.neonText : 'text-muted-foreground'}`}>{m.club2.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========== TOP 3 PLAYER CARDS ========== */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
            <Crown className={`w-3.5 h-3.5 ${dt.neonText}`} />
          </div>
          <h3 className="text-sm font-semibold">Top Players</h3>
          <Badge className={`${dt.casinoBadge} ml-auto`}>LEADERBOARD</Badge>
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

      {/* SECTION DIVIDER */}
      <div className="section-divider" />

      {/* ========== MAIN CONTENT WITH TABS ========== */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-white/[0.03] border border-white/[0.06] h-auto p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-[11px] py-2 tab-premium data-[state=active]:text-foreground">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-[11px] py-2 tab-premium data-[state=active]:text-foreground">Leaderboard</TabsTrigger>
          <TabsTrigger value="clubs" className="text-[11px] py-2 tab-premium data-[state=active]:text-foreground">Clubs</TabsTrigger>
          <TabsTrigger value="activity" className="text-[11px] py-2 tab-premium data-[state=active]:text-foreground">Activity</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Latest Match */}
            <motion.div variants={item}>
              <CasinoHeaderCard icon={Trophy} title="Latest Match" badge="RESULT">
                {t?.matches?.filter(m => m.status === 'completed').slice(-1).map(m => (
                  <div key={m.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-sm font-semibold">{m.team1.name}</p>
                        <p className={`text-3xl font-bold ${dt.neonText} mt-1 casino-score`}>{m.score1}</p>
                      </div>
                      <div className="px-4 text-center">
                        <span className="text-xs text-muted-foreground font-bold">VS</span>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-sm font-semibold">{m.team2.name}</p>
                        <p className={`text-3xl font-bold ${dt.neonText} mt-1 casino-score`}>{m.score2}</p>
                      </div>
                    </div>
                    {m.mvpPlayer && (
                      <div className={`mt-3 flex items-center justify-center gap-1.5 p-2 rounded-lg ${dt.bgSubtle}`}>
                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        <span className={`text-xs font-semibold ${dt.neonText}`}>MVP: {m.mvpPlayer.gamertag}</span>
                      </div>
                    )}
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-6">No matches yet</p>
                )}
              </CasinoHeaderCard>
            </motion.div>

            {/* Season Progress */}
            <motion.div variants={item}>
              <CasinoHeaderCard icon={TrendingUp} title="Season Progress" badge={`${data.seasonProgress?.percentage}%`}>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{data.season?.name}</span>
                      <span className={`font-semibold ${dt.neonText}`}>{data.seasonProgress?.completedWeeks}/{data.seasonProgress?.totalWeeks} Weeks</span>
                    </div>
                    <Progress value={data.seasonProgress?.percentage || 0} className="h-2.5" />
                    <p className={`text-[10px] ${dt.neonText} font-semibold mt-1`}>{data.seasonProgress?.percentage}% Complete</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center interactive-scale">
                      <p className={`text-lg font-bold ${dt.neonText}`}>{data.totalPlayers}</p>
                      <p className="text-[10px] text-muted-foreground">Players</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center interactive-scale cursor-pointer" onClick={() => setSelectedClub(data.clubs?.[0])}>
                      <p className={`text-lg font-bold ${dt.neonText}`}>{data.clubs?.length || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Clubs</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center interactive-scale">
                      <p className={`text-sm font-bold ${dt.neonText}`}>{formatCurrency(data.seasonDonationTotal || 0)}</p>
                      <p className="text-[10px] text-muted-foreground">Funded</p>
                    </div>
                  </div>
                </div>
              </CasinoHeaderCard>
            </motion.div>

            {/* Donation Tracker */}
            <motion.div variants={item}>
              <CasinoHeaderCard icon={Gift} title="Donation & Sawer" badge="LIVE">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Prize Pool</p>
                  <p className={`text-xl font-bold ${dt.neonGradient}`}>{formatCurrency(data.totalPrizePool)}</p>
                  <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Top Contributors</p>
                  {data.topDonors?.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] interactive-scale">
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          i === 1 ? 'bg-gray-400/20 text-gray-400' :
                          `${dt.iconBg} ${dt.text}`
                        }`}>{i + 1}</span>
                        {d.donorName}
                      </span>
                      <span className={`font-semibold ${dt.neonText}`}>{formatCurrency(d.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </CasinoHeaderCard>
            </motion.div>

            {/* Upcoming Matches */}
            <motion.div variants={item}>
              <CasinoHeaderCard icon={Zap} title="Upcoming Matches" badge="SCHEDULE">
                {data.upcomingMatches?.length > 0 ? (
                  <div className="space-y-2">
                    {data.upcomingMatches.slice(0, 3).map(m => (
                      <div key={m.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center interactive-scale">
                        <div className="flex items-center gap-2 justify-center">
                          <Calendar className={`w-3 h-3 ${dt.neonText}`} />
                          <p className="text-[10px] text-muted-foreground">Week {m.week}</p>
                        </div>
                        <p className="text-sm font-semibold mt-1">{m.club1.name} <span className="text-muted-foreground">vs</span> {m.club2.name}</p>
                        <Badge className={`mt-1.5 ${dt.casinoBadge}`}>BO3</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No upcoming matches</p>
                )}
              </CasinoHeaderCard>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* LEADERBOARD TAB */}
        <TabsContent value="leaderboard" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} ${dt.casinoGlow}`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Award className={`w-3.5 h-3.5 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-sm font-semibold">Leaderboard</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto`}>TOP 10</Badge>
                  </div>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
                    {data.topPlayers?.slice(0, 10).map((p, idx) => (
                      <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer interactive-scale ${
                        idx < 3 ? `${dt.bgSubtle} border ${dt.borderSubtle}` : 'hover:bg-white/[0.02] border border-transparent'
                      }`} onClick={() => setSelectedPlayer(p)}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-white/[0.03] text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className={`w-8 h-8 rounded-full ${dt.iconBg} flex items-center justify-center text-[10px] font-bold ${dt.text} shrink-0`}>
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
                            {p.streak > 1 && <span className="text-orange-400 font-semibold">🔥{p.streak}</span>}
                          </div>
                        </div>
                        {idx < 3 && (
                          <div className="shrink-0">
                            <BarChart3 className={`w-4 h-4 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* CLUBS TAB */}
        <TabsContent value="clubs" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} ${dt.casinoGlow}`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Shield className={`w-3.5 h-3.5 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-sm font-semibold">Club Standings</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto`}>{data.clubs?.length || 0} Clubs</Badge>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {data.clubs?.map((club, idx) => (
                      <div key={club.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer interactive-scale ${
                        idx === 0 ? `${dt.bgSubtle} border ${dt.borderSubtle} ${dt.casinoGlow}` :
                        idx < 4 ? `${dt.bgSubtle} border ${dt.borderSubtle}` :
                        'hover:bg-white/[0.02] border border-transparent'
                      }`} onClick={() => setSelectedClub(club)}>
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-white/[0.03] text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className={`w-10 h-10 rounded-xl ${dt.iconBg} flex items-center justify-center shrink-0`}>
                          <Shield className={`w-5 h-5 ${dt.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{club.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="text-green-500 font-medium">{club.wins}W</span>
                            <span>-</span>
                            <span className="text-red-500 font-medium">{club.losses}L</span>
                            <span>•</span>
                            <span>GD: {club.gameDiff > 0 ? '+' : ''}{club.gameDiff}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-lg font-bold ${idx === 0 ? dt.neonGradient : dt.neonText}`}>{club.points}</p>
                          <p className="text-[9px] text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} ${dt.casinoGlow}`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Activity className={`w-3.5 h-3.5 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-sm font-semibold">Activity Feed</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto`}>LIVE</Badge>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {/* Recent Match Events */}
                    {data.recentMatches?.slice(0, 3).map((m) => (
                      <div key={`match-${m.id}`} className="timeline-item">
                        <div className="timeline-dot" style={{ borderColor: 'var(--idm-gold)' }} />
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className={`w-8 h-8 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                            <Trophy className={`w-4 h-4 ${dt.neonText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">
                              <span className={dt.neonText}>{m.club1.name}</span> vs <span className={dt.neonText}>{m.club2.name}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">Week {m.week} • League Match</p>
                          </div>
                          <Badge className={`text-[10px] border-0 ${
                            m.score1 > m.score2 ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {m.score1}-{m.score2}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Top Player Events */}
                    {data.topPlayers?.slice(0, 2).map((p) => (
                      <div key={`player-${p.id}`} className="timeline-item">
                        <div className="timeline-dot" style={{ borderColor: 'var(--idm-gold)' }} />
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">
                              <span className={dt.neonText}>{p.gamertag}</span> earned MVP
                            </p>
                            <p className="text-[10px] text-muted-foreground">{p.points} pts • {p.totalMvp}x MVP this season</p>
                          </div>
                          <TierBadge tier={p.tier} />
                        </div>
                      </div>
                    ))}

                    {/* Streak Events */}
                    {data.topPlayers?.filter(p => p.streak >= 2).slice(0, 1).map((p) => (
                      <div key={`streak-${p.id}`} className="timeline-item">
                        <div className="timeline-dot" style={{ borderColor: '#f97316' }} />
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10">
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
                      </div>
                    ))}

                    {/* Donation Events */}
                    {data.topDonors?.slice(0, 1).map((d, i) => (
                      <div key={`donation-${i}`} className="timeline-item">
                        <div className="timeline-dot" style={{ borderColor: 'var(--idm-gold)' }} />
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className={`w-8 h-8 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                            <Gift className={`w-4 h-4 ${dt.neonText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">
                              <span className={dt.neonText}>{d.donorName}</span> donated
                            </p>
                            <p className="text-[10px] text-muted-foreground">{d.donationCount} contributions this season</p>
                          </div>
                          <span className={`text-xs font-bold ${dt.neonText}`}>{formatCurrency(d.totalAmount)}</span>
                        </div>
                      </div>
                    ))}

                    {/* Upcoming Match Event */}
                    {data.upcomingMatches?.slice(0, 1).map((m) => (
                      <div key={`upcoming-${m.id}`} className="timeline-item">
                        <div className="timeline-dot" style={{ borderColor: 'var(--idm-gold)' }} />
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className={`w-8 h-8 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                            <Zap className={`w-4 h-4 ${dt.neonText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">
                              <span className={dt.neonText}>{m.club1.name}</span> vs <span className={dt.neonText}>{m.club2.name}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">Week {m.week} • Upcoming</p>
                          </div>
                          <Badge className={`${dt.casinoBadge}`}>SOON</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Player & Club Profiles */}
      {selectedPlayer && (
        <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
      {selectedClub && (
        <ClubProfile club={selectedClub} onClose={() => setSelectedClub(null)} />
      )}
    </motion.div>
    </>
  );
}
