'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Heart, MapPin, Users, Trophy, Clock, Flame,
  TrendingUp, Award, Gift, Zap, Crown, Sparkles,
  Radio, Shield, Swords,
  Gamepad2, Calendar, Target, Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TierBadge } from './tier-badge';
import { CountdownTimer } from './countdown-timer';
import { PlayerCard } from './player-card';
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';

/* ─── Data Interfaces (unchanged) ─── */
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

/* ─── Animation variants (subtler) ─── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

/* ─── StatusBadge (unchanged) ─── */
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

/* ─── CasinoHeaderCard — kept but used only for hero area ─── */
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
      <div className={dt.casinoBar} />
      <div className="relative img-zoom h-28 sm:h-32">
        <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover card-cover" aria-hidden="true" />
        <div className="casino-img-overlay" />
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
      <CardContent className="p-4 relative z-10">{children}</CardContent>
    </Card>
  );
}

/* ─── Simple section card — no image header, clean Toornament style ─── */
function SectionCard({ title, icon: Icon, badge, children, className = '' }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const dt = useDivisionTheme();
  return (
    <Card className={`${dt.casinoCard} overflow-hidden ${className}`}>
      <div className={dt.casinoBar} />
      <CardContent className="p-4 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-md ${dt.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-3 h-3 ${dt.neonText}`} />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {badge && <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{badge}</Badge>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/* ─── Main Dashboard Component ─── */
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

  /* Group matches by week for the Matches tab */
  const recentMatches = data?.recentMatches ?? [];
  const upcomingMatches = data?.upcomingMatches ?? [];

  const matchesByWeek = useMemo(() => {
    if (recentMatches.length === 0) return {} as Record<number, StatsData['recentMatches']>;
    return recentMatches.reduce((acc, m) => {
      if (!acc[m.week]) acc[m.week] = [];
      acc[m.week].push(m);
      return acc;
    }, {} as Record<number, StatsData['recentMatches']>);
  }, [recentMatches]);

  const upcomingByWeek = useMemo(() => {
    if (upcomingMatches.length === 0) return {} as Record<number, StatsData['upcomingMatches']>;
    return upcomingMatches.reduce((acc, m) => {
      if (!acc[m.week]) acc[m.week] = [];
      acc[m.week].push(m);
      return acc;
    }, {} as Record<number, StatsData['upcomingMatches']>);
  }, [upcomingMatches]);

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

      {/* ========== HERO BANNER (kept, slightly more compact) ========== */}
      <motion.div variants={item} className={`relative rounded-2xl overflow-hidden ${dt.casinoCard} ${dt.neonPulse} min-h-[180px] casino-shimmer`}>
        <div className={dt.casinoBar} />
        <div className="absolute inset-0 hidden sm:block">
          <img src="/bg-default.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 sm:hidden">
          <img src="/bg-mobiledefault.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="casino-img-overlay" />
        <div className={`absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl ${dt.bg} opacity-30`} />
        <div className={`absolute top-3 left-3 ${dt.cornerAccent}`} />
        <div className={`absolute top-3 right-3 rotate-90 ${dt.cornerAccent}`} />
        {/* Tournament info overlay */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={t?.status || 'registration'} />
        </div>
        <div className="absolute bottom-4 left-5 right-5 z-10">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
              🐉 Season {data.season?.number || 1}
            </Badge>
            <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
              {division === 'male' ? '⚔️ Male' : '🗡️ Female'}
            </Badge>
          </div>
          <h2 className={`text-2xl lg:text-3xl font-black ${dt.neonGradient}`}>{t?.name || 'IDM League Arena'}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{data.season?.name}</p>
          {/* Quick info row inside hero */}
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className={`w-3 h-3 ${dt.neonText}`} />{t?.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Coming Soon'}</span>
            <span className="flex items-center gap-1"><MapPin className={`w-3 h-3 ${dt.neonText}`} />{t?.location || 'Online'}</span>
            <span className="flex items-center gap-1"><Flame className={`w-3 h-3 ${dt.neonText}`} />Week {t?.weekNumber || 5}</span>
            {t?.bpm && <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400 live-dot" />{t.bpm} BPM</span>}
          </div>
        </div>
      </motion.div>

      {/* ========== COUNTDOWN + PRIZE POOL (compact row) ========== */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Countdown */}
        {t?.scheduledAt && t.status !== 'completed' && (
          <div className={`flex items-center justify-center rounded-xl ${dt.bgSubtle} ${dt.border} p-3`}>
            <CountdownTimer targetDate={t.scheduledAt} />
          </div>
        )}
        {/* Prize Pool */}
        <div className={`p-3 rounded-xl ${dt.bgSubtle} ${dt.border}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">💰 Prize Pool</span>
            <span className={`text-lg font-bold ${dt.neonGradient}`}>{formatCurrency(t?.prizePool || 0)}</span>
          </div>
          <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1">Target: {formatCurrency(500000)} • Collected: {formatCurrency(data.totalPrizePool)}</p>
        </div>
      </motion.div>

      {/* ========== QUICK STATS — Casino Pills (kept) ========== */}
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

      {/* ========== SUB-NAVIGATION TABS — Toornament underline style ========== */}
      <Tabs defaultValue="overview" className="w-full">
        <div className={`border-b ${dt.border}`}>
          <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none">
            {[
              { value: 'overview', label: 'Overview', icon: Trophy },
              { value: 'standings', label: 'Standings', icon: Award },
              { value: 'matches', label: 'Matches', icon: Swords },
              { value: 'participants', label: 'Participants', icon: Gamepad2 },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`relative px-4 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none ${dt.text} data-[state=active]:${dt.text} text-muted-foreground hover:text-foreground transition-colors`}
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5 inline" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

            {/* Recent Results — compact match rows (Toornament style) */}
            {data.recentMatches?.length > 0 && (
              <motion.div variants={item}>
                <SectionCard title="Recent Results" icon={Radio} badge="LIVE">
                  <div className="space-y-1.5">
                    {data.recentMatches.slice(0, 6).map(m => (
                      <div key={m.id} className={`flex items-center gap-2 p-2.5 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} hover:${dt.bgSubtle} transition-colors`}>
                        <Badge variant="outline" className={`text-[9px] shrink-0 ${dt.casinoBadge}`}>W{m.week}</Badge>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`text-xs font-semibold truncate flex-1 text-right ${m.score1 > m.score2 ? dt.neonText : 'text-muted-foreground'}`}>{m.club1.name}</span>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${dt.bg} shrink-0`}>
                            <span className={`text-sm font-bold ${m.score1 > m.score2 ? dt.neonText : 'text-foreground'}`}>{m.score1}</span>
                            <span className="text-[10px] text-muted-foreground">-</span>
                            <span className={`text-sm font-bold ${m.score2 > m.score1 ? dt.neonText : 'text-foreground'}`}>{m.score2}</span>
                          </div>
                          <span className={`text-xs font-semibold truncate flex-1 ${m.score2 > m.score1 ? dt.neonText : 'text-muted-foreground'}`}>{m.club2.name}</span>
                        </div>
                        <Badge className={`text-[9px] border-0 shrink-0 ${m.score1 !== m.score2 ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                          {m.score1 !== m.score2 ? 'Completed' : 'Draw'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Top 3 Podium — keep PlayerCard component */}
            <motion.div variants={item}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                  <Crown className={`w-3.5 h-3.5 ${dt.neonText}`} />
                </div>
                <h3 className="text-sm font-semibold">Top Players</h3>
                <Badge className={`${dt.casinoBadge} ml-auto`}>PODIUM</Badge>
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

            {/* Donation & Season Progress — 2-column, simpler cards without image headers */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Donation Tracker */}
              <SectionCard title="Donation & Sawer" icon={Gift} badge="LIVE">
                <div className={`p-3 rounded-xl ${dt.bgSubtle} ${dt.border} mb-3`}>
                  <p className="text-xs text-muted-foreground mb-1">Total Prize Pool</p>
                  <p className={`text-xl font-bold ${dt.neonGradient}`}>{formatCurrency(data.totalPrizePool)}</p>
                  <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Top Contributors</p>
                  {data.topDonors?.slice(0, 3).map((d, i) => (
                    <div key={i} className={`flex items-center justify-between text-xs p-2 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle}`}>
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
              </SectionCard>

              {/* Season Progress */}
              <SectionCard title="Season Progress" icon={TrendingUp} badge={`${data.seasonProgress?.percentage}%`}>
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
                    <div className={`p-2.5 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                      <p className={`text-lg font-bold ${dt.neonText}`}>{data.totalPlayers}</p>
                      <p className="text-[10px] text-muted-foreground">Players</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${dt.bgSubtle} ${dt.border} text-center cursor-pointer`} onClick={() => setSelectedClub(data.clubs?.[0])}>
                      <p className={`text-lg font-bold ${dt.neonText}`}>{data.clubs?.length || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Clubs</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                      <p className={`text-sm font-bold ${dt.neonText}`}>{formatCurrency(data.seasonDonationTotal || 0)}</p>
                      <p className="text-[10px] text-muted-foreground">Funded</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Latest completed match highlight (from tournament matches) */}
            {t?.matches?.filter(m => m.status === 'completed').length > 0 && (
              <motion.div variants={item}>
                <CasinoHeaderCard icon={Trophy} title="Featured Match" badge="RESULT">
                  {t.matches.filter(m => m.status === 'completed').slice(-1).map(m => (
                    <div key={m.id} className={`p-4 rounded-xl ${dt.bgSubtle} ${dt.border}`}>
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
                  ))}
                </CasinoHeaderCard>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ═══════════════ STANDINGS TAB ═══════════════ */}
        <TabsContent value="standings" className="mt-4 space-y-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

            {/* Player Leaderboard TABLE */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} overflow-hidden`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-md ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Award className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-sm font-semibold">Player Leaderboard</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>TOP {Math.min(data.topPlayers?.length || 10, 10)}</Badge>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className={`hover:bg-transparent border-b ${dt.border}`}>
                          <TableHead className="w-10 text-center text-[10px]">#</TableHead>
                          <TableHead className="text-[10px]">Player</TableHead>
                          <TableHead className="w-14 text-center text-[10px]">Tier</TableHead>
                          <TableHead className="w-14 text-right text-[10px]">Pts</TableHead>
                          <TableHead className="w-10 text-center text-[10px]">W</TableHead>
                          <TableHead className="w-10 text-center text-[10px]">L</TableHead>
                          <TableHead className="w-14 text-center text-[10px]">Streak</TableHead>
                          <TableHead className="w-10 text-center text-[10px]">MVP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topPlayers?.slice(0, 10).map((p, idx) => {
                          const losses = p.matches - p.totalWins;
                          return (
                            <TableRow
                              key={p.id}
                              className={`cursor-pointer transition-colors ${
                                idx < 3 ? `${dt.bgSubtle}` : ''
                              }`}
                              onClick={() => setSelectedPlayer(p)}
                            >
                              <TableCell className="text-center">
                                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                                  idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                  idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                                  idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                                  'text-muted-foreground'
                                }`}>
                                  {idx + 1}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full ${dt.iconBg} flex items-center justify-center text-[9px] font-bold ${dt.text} shrink-0`}>
                                    {p.gamertag.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{p.gamertag}</p>
                                    {p.club && <p className="text-[9px] text-muted-foreground truncate">{p.club}</p>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center"><TierBadge tier={p.tier} /></TableCell>
                              <TableCell className={`text-right font-bold text-xs ${idx < 3 ? dt.neonText : ''}`}>{p.points}</TableCell>
                              <TableCell className="text-center text-xs text-green-500 font-medium">{p.totalWins}</TableCell>
                              <TableCell className="text-center text-xs text-red-500 font-medium">{losses > 0 ? losses : 0}</TableCell>
                              <TableCell className="text-center text-xs">
                                {p.streak > 1 ? (
                                  <span className="text-orange-400 font-semibold">🔥{p.streak}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center text-xs">
                                {p.totalMvp > 0 ? (
                                  <span className="text-yellow-500 font-semibold">{p.totalMvp}</span>
                                ) : (
                                  <span className="text-muted-foreground">0</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Club Standings TABLE */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} overflow-hidden`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-md ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Shield className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-sm font-semibold">Club Standings</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{data.clubs?.length || 0} Clubs</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className={`hover:bg-transparent border-b ${dt.border}`}>
                          <TableHead className="w-10 text-center text-[10px]">#</TableHead>
                          <TableHead className="text-[10px]">Club</TableHead>
                          <TableHead className="w-10 text-center text-[10px]">W</TableHead>
                          <TableHead className="w-10 text-center text-[10px]">L</TableHead>
                          <TableHead className="w-12 text-center text-[10px]">GD</TableHead>
                          <TableHead className="w-14 text-right text-[10px]">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.clubs?.map((club, idx) => (
                          <TableRow
                            key={club.id}
                            className={`cursor-pointer transition-colors ${
                              idx < 4 ? `${dt.bgSubtle}` : ''
                            }`}
                            onClick={() => setSelectedClub(club)}
                          >
                            <TableCell className="text-center">
                              <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                                idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                                idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                                'text-muted-foreground'
                              }`}>
                                {idx + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                                  <Shield className={`w-3.5 h-3.5 ${dt.text}`} />
                                </div>
                                <span className="text-xs font-semibold truncate">{club.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs text-green-500 font-medium">{club.wins}</TableCell>
                            <TableCell className="text-center text-xs text-red-500 font-medium">{club.losses}</TableCell>
                            <TableCell className="text-center text-xs">
                              <span className={club.gameDiff > 0 ? 'text-green-500' : club.gameDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                                {club.gameDiff > 0 ? '+' : ''}{club.gameDiff}
                              </span>
                            </TableCell>
                            <TableCell className={`text-right font-bold text-xs ${idx === 0 ? dt.neonGradient : idx < 4 ? dt.neonText : ''}`}>{club.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* ═══════════════ MATCHES TAB ═══════════════ */}
        <TabsContent value="matches" className="mt-4 space-y-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

            {/* Completed Matches — grouped by week */}
            {Object.keys(matchesByWeek).length > 0 && (
              <motion.div variants={item}>
                <SectionCard title="Match Results" icon={Trophy} badge={`${data.recentMatches?.length || 0} Matches`}>
                  <div className="space-y-4">
                    {Object.entries(matchesByWeek)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([week, matches]) => (
                        <div key={week}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${dt.casinoBadge} text-[9px]`}>Week {week}</Badge>
                            <div className={`flex-1 h-px ${dt.borderSubtle}`} />
                          </div>
                          <div className="space-y-1">
                            {matches.map(m => (
                              <div key={m.id} className={`flex items-center gap-2 p-2.5 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} transition-colors`}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className={`text-xs font-semibold truncate flex-1 text-right ${m.score1 > m.score2 ? dt.neonText : 'text-muted-foreground'}`}>{m.club1.name}</span>
                                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded ${dt.bg} shrink-0`}>
                                    <span className={`text-sm font-bold ${m.score1 > m.score2 ? dt.neonText : 'text-foreground'}`}>{m.score1}</span>
                                    <span className="text-[10px] text-muted-foreground">-</span>
                                    <span className={`text-sm font-bold ${m.score2 > m.score1 ? dt.neonText : 'text-foreground'}`}>{m.score2}</span>
                                  </div>
                                  <span className={`text-xs font-semibold truncate flex-1 ${m.score2 > m.score1 ? dt.neonText : 'text-muted-foreground'}`}>{m.club2.name}</span>
                                </div>
                                <Badge className={`text-[9px] border-0 shrink-0 ${m.score1 !== m.score2 ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                  Done
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Upcoming Matches — grouped by week */}
            {Object.keys(upcomingByWeek).length > 0 && (
              <motion.div variants={item}>
                <SectionCard title="Upcoming" icon={Calendar} badge="SCHEDULE">
                  <div className="space-y-4">
                    {Object.entries(upcomingByWeek)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([week, matches]) => (
                        <div key={week}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${dt.casinoBadge} text-[9px]`}>Week {week}</Badge>
                            <div className={`flex-1 h-px ${dt.borderSubtle}`} />
                          </div>
                          <div className="space-y-1">
                            {matches.map(m => (
                              <div key={m.id} className={`flex items-center gap-2 p-2.5 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} transition-colors`}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-xs font-semibold truncate flex-1 text-right">{m.club1.name}</span>
                                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded ${dt.bg} shrink-0`}>
                                    <span className="text-sm font-bold text-muted-foreground">—</span>
                                    <span className="text-[10px] text-muted-foreground">vs</span>
                                    <span className="text-sm font-bold text-muted-foreground">—</span>
                                  </div>
                                  <span className="text-xs font-semibold truncate flex-1">{m.club2.name}</span>
                                </div>
                                <Badge className={`${dt.casinoBadge} text-[9px] shrink-0`}>BO3</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {Object.keys(matchesByWeek).length === 0 && Object.keys(upcomingByWeek).length === 0 && (
              <motion.div variants={item}>
                <div className={`p-8 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                  <Gamepad2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No matches yet</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ═══════════════ PARTICIPANTS TAB ═══════════════ */}
        <TabsContent value="participants" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-md ${dt.iconBg} flex items-center justify-center shrink-0`}>
                  <Gamepad2 className={`w-3 h-3 ${dt.neonText}`} />
                </div>
                <h3 className="text-sm font-semibold">Participants</h3>
                <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{data.topPlayers?.length || 0} Players</Badge>
              </div>
              {/* Responsive grid of player mini-cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.topPlayers?.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`cursor-pointer rounded-xl ${dt.casinoCard} ${idx < 3 ? dt.casinoGlow : ''} overflow-hidden`}
                    onClick={() => setSelectedPlayer(p)}
                  >
                    <div className={idx < 3 ? dt.casinoBar : ''} />
                    <div className="p-3 relative z-10">
                      <div className="flex items-center gap-2.5 mb-2">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full ${idx < 3
                          ? 'bg-gradient-to-br ' + (division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light')
                          : dt.iconBg
                        } flex items-center justify-center text-[10px] font-bold ${idx < 3 ? 'text-white' : dt.text} shrink-0 shadow-sm`}>
                          {p.gamertag.slice(0, 2).toUpperCase()}
                        </div>
                        {/* Rank badge */}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                          `${dt.bgSubtle} text-muted-foreground`
                        }`}>
                          {idx + 1}
                        </span>
                      </div>
                      {/* Name + Tier */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-xs font-semibold truncate">{p.gamertag}</p>
                      </div>
                      <TierBadge tier={p.tier} />
                      {/* Stats */}
                      <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                        {p.club && (
                          <span className="truncate flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5" />
                            {p.club}
                          </span>
                        )}
                      </div>
                      <div className={`mt-1.5 pt-1.5 border-t ${dt.borderSubtle} flex items-center justify-between`}>
                        <span className={`text-xs font-bold ${dt.neonText}`}>{p.points} pts</span>
                        <span className="text-[9px] text-muted-foreground">{p.totalWins}W</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
