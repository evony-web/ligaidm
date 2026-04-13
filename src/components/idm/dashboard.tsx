'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Heart, MapPin, Users, Trophy, Clock, Flame,
  TrendingUp, Award, Gift, Zap, Crown, Sparkles,
  Radio, Shield, Swords,
  Gamepad2, Calendar, Target, Wallet, Search, List, Grid3X3, ChevronDown, ChevronUp, Filter
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
import { BracketView } from './bracket-view';
import { ParticipantGrid } from './participant-grid';
import { EsportsMatchCard } from './match-card';
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

/* ─── StatusBadge ─── */
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

/* ─── Toornament-style Section Card — clean header with thin bottom border ─── */
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
      <CardContent className="p-0 relative z-10">
        {/* Toornament-style section header — full width, bordered bottom */}
        <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
          <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-3 h-3 ${dt.neonText}`} />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
          {badge && <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{badge}</Badge>}
        </div>
        <div className="p-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Toornament-style Match Row — clean, compact ─── */
function MatchRow({ club1, club2, score1, score2, week, status, mvp, isLive }: {
  club1: string; club2: string; score1: number; score2: number;
  week?: number; status?: string; mvp?: string; isLive?: boolean;
}) {
  const dt = useDivisionTheme();
  const isCompleted = status === 'completed' || (score1 !== score2);
  const winner1 = score1 > score2;
  const winner2 = score2 > score1;

  return (
    <div className={`group flex items-stretch rounded-lg overflow-hidden ${dt.bgSubtle} ${dt.borderSubtle} border transition-all hover:${dt.border} hover:shadow-sm`}>
      {/* Week/Round indicator — toornament style left bar */}
      {week && (
        <div className={`w-10 shrink-0 flex items-center justify-center ${dt.bg} border-r ${dt.borderSubtle}`}>
          <span className={`text-[9px] font-bold ${dt.neonText}`}>W{week}</span>
        </div>
      )}
      {/* Main match content */}
      <div className="flex-1 min-w-0">
        {/* Team 1 */}
        <div className={`flex items-center px-3 py-1.5 border-b ${dt.borderSubtle} ${winner1 ? '' : 'opacity-60'}`}>
          <span className={`text-xs font-semibold truncate flex-1 ${winner1 ? dt.neonText : 'text-muted-foreground'}`}>
            {winner1 && <span className="mr-1">▸</span>}
            {club1}
          </span>
          <span className={`text-sm font-bold tabular-nums w-6 text-right ${winner1 ? dt.neonText : 'text-foreground'}`}>{score1}</span>
        </div>
        {/* Team 2 */}
        <div className={`flex items-center px-3 py-1.5 ${winner2 ? '' : 'opacity-60'}`}>
          <span className={`text-xs font-semibold truncate flex-1 ${winner2 ? dt.neonText : 'text-muted-foreground'}`}>
            {winner2 && <span className="mr-1">▸</span>}
            {club2}
          </span>
          <span className={`text-sm font-bold tabular-nums w-6 text-right ${winner2 ? dt.neonText : 'text-foreground'}`}>{score2}</span>
        </div>
      </div>
      {/* Status / MVP indicator */}
      <div className="w-16 shrink-0 flex flex-col items-center justify-center border-l border-transparent">
        {isLive ? (
          <Badge className="bg-red-500/10 text-red-500 text-[8px] border-0 live-dot">LIVE</Badge>
        ) : isCompleted ? (
          <Badge className="bg-green-500/10 text-green-500 text-[8px] border-0">FT</Badge>
        ) : (
          <Badge className={`${dt.casinoBadge} text-[8px]`}>VS</Badge>
        )}
        {mvp && <span className="text-[8px] text-yellow-500 mt-0.5">MVP</span>}
      </div>
    </div>
  );
}

/* ─── Toornament-style Bracket Match ─── */
function BracketMatch({ team1, team2, score1, score2, status, round, matchIdx, isLast }: {
  team1: string; team2: string; score1: number | null; score2: number | null;
  status: string; round: number; matchIdx: number; isLast: boolean;
}) {
  const dt = useDivisionTheme();
  const hasScore = score1 !== null && score2 !== null;
  const winner1 = hasScore && score1! > score2!;
  const winner2 = hasScore && score2! > score1!;
  const isLive = status === 'live';

  return (
    <div className="relative" style={{ marginBottom: isLast ? 0 : 'var(--bracket-gap, 24px)' }}>
      {/* Connector lines for rounds > 0 */}
      {round > 0 && (
        <div className="absolute -left-5 top-1/2 w-5 flex items-center">
          <div className={`w-full h-px ${dt.borderSubtle}`} />
        </div>
      )}
      <div className={`rounded-lg overflow-hidden border ${dt.borderSubtle} ${isLive ? `border-red-500/30 ${dt.neonPulse}` : ''} transition-all hover:${dt.border} hover:shadow-sm`} style={{ background: 'var(--card-bg, rgba(20,17,10,0.6))' }}>
        {/* Team 1 row */}
        <div className={`flex items-center px-2.5 py-1.5 border-b ${dt.borderSubtle} ${winner1 ? dt.bgSubtle : ''}`}>
          <span className={`text-[11px] font-semibold truncate flex-1 ${winner1 ? dt.neonText : 'text-foreground/80'}`}>
            {team1 || 'TBD'}
          </span>
          <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner1 ? dt.neonText : 'text-muted-foreground'}`}>
            {hasScore ? score1 : '-'}
          </span>
        </div>
        {/* Team 2 row */}
        <div className={`flex items-center px-2.5 py-1.5 ${winner2 ? dt.bgSubtle : ''}`}>
          <span className={`text-[11px] font-semibold truncate flex-1 ${winner2 ? dt.neonText : 'text-foreground/80'}`}>
            {team2 || 'TBD'}
          </span>
          <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner2 ? dt.neonText : 'text-muted-foreground'}`}>
            {hasScore ? score2 : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Toornament-style Participant Row ─── */
function ParticipantRow({ player, rank, onClick }: {
  player: StatsData['topPlayers'][0];
  rank: number;
  onClick: () => void;
}) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border border-transparent hover:${dt.border} hover:${dt.bgSubtle}`}
      onClick={onClick}
    >
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
        rank === 2 ? 'bg-gray-400/20 text-gray-400' :
        rank === 3 ? 'bg-amber-600/20 text-amber-600' :
        `${dt.bgSubtle} text-muted-foreground`
      }`}>
        {rank}
      </span>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full ${rank <= 3
        ? 'bg-gradient-to-br ' + (division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light')
        : dt.iconBg
      } flex items-center justify-center text-[10px] font-bold ${rank <= 3 ? 'text-white' : dt.text} shrink-0 shadow-sm`}>
        {player.gamertag.slice(0, 2).toUpperCase()}
      </div>
      {/* Name & Club */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{player.gamertag}</p>
        {player.club && (
          <p className="text-[9px] text-muted-foreground truncate flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5" />
            {player.club}
          </p>
        )}
      </div>
      {/* Tier */}
      <div className="shrink-0">
        <TierBadge tier={player.tier} />
      </div>
      {/* Points */}
      <div className="w-14 text-right shrink-0">
        <p className={`text-xs font-bold ${rank <= 3 ? dt.neonText : ''}`}>{player.points}</p>
        <p className="text-[8px] text-muted-foreground">pts</p>
      </div>
      {/* Quick stats */}
      <div className="hidden sm:flex items-center gap-2 shrink-0 text-[9px] text-muted-foreground">
        <span className="text-green-500 font-medium">{player.totalWins}W</span>
        <span className="text-red-500 font-medium">{player.matches - player.totalWins}L</span>
        {player.streak > 1 && <span className="text-orange-400">🔥{player.streak}</span>}
      </div>
    </motion.div>
  );
}

/* ─── Main Dashboard Component ─── */
export function Dashboard() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] | null>(null);
  const [selectedClub, setSelectedClub] = useState<StatsData['clubs'][0] | null>(null);
  const [participantView, setParticipantView] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardSort, setLeaderboardSort] = useState<'players' | 'clubs'>('players');
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [bracketType, setBracketType] = useState<string>('single_elimination');

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

  /* Group tournament matches by round for bracket view */
  const tournamentMatchesByRound = useMemo(() => {
    if (!data?.activeTournament?.matches) return {} as Record<number, StatsData['activeTournament']['matches']>;
    return data.activeTournament.matches.reduce((acc, m) => {
      const round = 'round' in m ? (m as any).round || 1 : 1;
      if (!acc[round]) acc[round] = [];
      acc[round].push(m);
      return acc;
    }, {} as Record<number, StatsData['activeTournament']['matches']>);
  }, [data?.activeTournament?.matches]);

  /* Filtered participants */
  const filteredPlayers = useMemo(() => {
    if (!data?.topPlayers) return [];
    if (!searchQuery) return data.topPlayers;
    return data.topPlayers.filter(p =>
      p.gamertag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [data.topPlayers, searchQuery]);

  if (isLoading || !data?.hasData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`w-8 h-8 border-2 ${dt.border} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  const t = data.activeTournament;
  const displayedPlayers = showAllPlayers ? data.topPlayers : data.topPlayers?.slice(0, 10);
  const displayedClubs = showAllClubs ? data.clubs : data.clubs?.slice(0, 6);

  return (
    <>
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-5xl mx-auto">

      {/* ========== HERO BANNER ========== */}
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
          <h2 className={`text-2xl lg:text-3xl font-black ${dt.neonGradient}`}>{t?.name || 'IDM League Stage'}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{data.season?.name}</p>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className={`w-3 h-3 ${dt.neonText}`} />{t?.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Coming Soon'}</span>
            <span className="flex items-center gap-1"><MapPin className={`w-3 h-3 ${dt.neonText}`} />{t?.location || 'Online'}</span>
            <span className="flex items-center gap-1"><Flame className={`w-3 h-3 ${dt.neonText}`} />Week {t?.weekNumber || 5}</span>
            {t?.bpm && <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400 live-dot" />{t.bpm} BPM</span>}
          </div>
        </div>
      </motion.div>

      {/* ========== COUNTDOWN + PRIZE POOL ========== */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {t?.scheduledAt && t.status !== 'completed' && (
          <div className={`flex items-center justify-center rounded-xl ${dt.bgSubtle} ${dt.border} p-3`}>
            <CountdownTimer targetDate={t.scheduledAt} />
          </div>
        )}
        <div className={`p-3 rounded-xl ${dt.bgSubtle} ${dt.border}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">💰 Prize Pool</span>
            <span className={`text-lg font-bold ${dt.neonGradient}`}>{formatCurrency(t?.prizePool || 0)}</span>
          </div>
          <Progress value={Math.min((data.totalPrizePool / 500000) * 100, 100)} className="mt-2 h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1">Target: {formatCurrency(500000)} • Collected: {formatCurrency(data.totalPrizePool)}</p>
        </div>
      </motion.div>

      {/* ========== QUICK STATS — Casino Pills ========== */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, value: `${data.totalPlayers}`, label: 'Players', color: 'from-idm-male to-idm-male-light' },
          { icon: Shield, value: `${data.clubs?.length || 0}`, label: 'Clubs', color: 'from-idm-female to-idm-female-light' },
          { icon: Wallet, value: formatCurrency(data.totalPrizePool).replace('Rp', '').trim(), label: 'Prize Pool', color: 'from-[#d4a853] to-[#b8860b]' },
          { icon: Target, value: `${data.seasonProgress?.percentage || 0}%`, label: 'Progress', color: 'from-green-500 to-green-600' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="group">
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

            {/* Recent Results — Toornament match row style */}
            {data.recentMatches?.length > 0 && (
              <motion.div variants={item}>
                <SectionCard title="Recent Results" icon={Radio} badge="LIVE">
                  <div className="space-y-2">
                    {data.recentMatches.slice(0, 6).map(m => (
                      <MatchRow
                        key={m.id}
                        club1={m.club1.name}
                        club2={m.club2.name}
                        score1={m.score1}
                        score2={m.score2}
                        week={m.week}
                        status="completed"
                      />
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

            {/* Donation & Season Progress */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

            {/* Featured Match — EsportsMatchCard style */}
            {t?.matches?.filter(m => m.status === 'completed').length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                    <Swords className={`w-3.5 h-3.5 ${dt.neonText}`} />
                  </div>
                  <h3 className="text-sm font-semibold">Featured Match</h3>
                  <Badge className={`${dt.casinoBadge} ml-auto`}>RESULT</Badge>
                </div>
                {t.matches.filter(m => m.status === 'completed').slice(-1).map(m => (
                  <EsportsMatchCard
                    key={m.id}
                    team1={m.team1}
                    team2={m.team2}
                    score1={m.score1}
                    score2={m.score2}
                    status={m.status}
                    week={t.weekNumber}
                    mvpPlayer={m.mvpPlayer}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ═══════════════ STANDINGS TAB — Toornament Style ═══════════════ */}
        <TabsContent value="standings" className="mt-4 space-y-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

            {/* Toornament-style sub-tabs for Players/Clubs */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${dt.bgSubtle} ${dt.border} w-fit`}>
              <button
                onClick={() => setLeaderboardSort('players')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leaderboardSort === 'players' ? `${dt.bg} ${dt.text} shadow-sm` : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Users className="w-3 h-3" /> Players
              </button>
              <button
                onClick={() => setLeaderboardSort('clubs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leaderboardSort === 'clubs' ? `${dt.bg} ${dt.text} shadow-sm` : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Shield className="w-3 h-3" /> Clubs
              </button>
            </div>

            {/* Player Leaderboard — Toornament clean table */}
            {leaderboardSort === 'players' && (
              <motion.div variants={item}>
                <Card className={`${dt.casinoCard} overflow-hidden`}>
                  <div className={dt.casinoBar} />
                  {/* Toornament-style header bar */}
                  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                    <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Award className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Player Leaderboard</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>TOP {displayedPlayers?.length || 10}</Badge>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className={`hover:bg-transparent border-b ${dt.border} bg-muted/30`}>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">#</TableHead>
                          <TableHead className="text-[10px] font-semibold">Player</TableHead>
                          <TableHead className="w-14 text-center text-[10px] font-semibold">Tier</TableHead>
                          <TableHead className="w-14 text-right text-[10px] font-semibold">Pts</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">W</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">L</TableHead>
                          <TableHead className="w-14 text-center text-[10px] font-semibold">Streak</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">MVP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedPlayers?.map((p, idx) => {
                          const losses = p.matches - p.totalWins;
                          return (
                            <TableRow
                              key={p.id}
                              className={`cursor-pointer transition-colors border-b ${dt.borderSubtle} ${
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
                  {/* Show more / less toggle */}
                  {data.topPlayers?.length > 10 && (
                    <div className={`flex items-center justify-center py-2 border-t ${dt.borderSubtle}`}>
                      <button
                        onClick={() => setShowAllPlayers(!showAllPlayers)}
                        className={`flex items-center gap-1 text-[10px] font-medium ${dt.text} hover:underline`}
                      >
                        {showAllPlayers ? <><ChevronUp className="w-3 h-3" /> Show Less</> : <><ChevronDown className="w-3 h-3" /> Show All ({data.topPlayers.length})</>}
                      </button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Club Standings — Toornament clean table */}
            {leaderboardSort === 'clubs' && (
              <motion.div variants={item}>
                <Card className={`${dt.casinoCard} overflow-hidden`}>
                  <div className={dt.casinoBar} />
                  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                    <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Shield className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Club Standings</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{data.clubs?.length || 0} Clubs</Badge>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className={`hover:bg-transparent border-b ${dt.border} bg-muted/30`}>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">#</TableHead>
                          <TableHead className="text-[10px] font-semibold">Club</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">W</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">L</TableHead>
                          <TableHead className="w-12 text-center text-[10px] font-semibold">GD</TableHead>
                          <TableHead className="w-14 text-right text-[10px] font-semibold">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedClubs?.map((club, idx) => (
                          <TableRow
                            key={club.id}
                            className={`cursor-pointer transition-colors border-b ${dt.borderSubtle} ${
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
                  {data.clubs?.length > 6 && (
                    <div className={`flex items-center justify-center py-2 border-t ${dt.borderSubtle}`}>
                      <button
                        onClick={() => setShowAllClubs(!showAllClubs)}
                        className={`flex items-center gap-1 text-[10px] font-medium ${dt.text} hover:underline`}
                      >
                        {showAllClubs ? <><ChevronUp className="w-3 h-3" /> Show Less</> : <><ChevronDown className="w-3 h-3" /> Show All ({data.clubs.length})</>}
                      </button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ═══════════════ MATCHES TAB — MPL-Style Bracket ═══════════════ */}
        <TabsContent value="matches" className="mt-4 space-y-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

            {/* Bracket View — with type selector */}
            <motion.div variants={item}>
              <Card className={`${dt.casinoCard} overflow-hidden`}>
                <div className={dt.casinoBar} />
                <div className="relative z-10">
                  {/* Header with bracket type selector */}
                  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                    <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                      <Swords className={`w-3 h-3 ${dt.neonText}`} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Bracket</h3>
                    <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{t?.matches?.length || recentMatches.length} Matches</Badge>
                  </div>
                  {/* Bracket type sub-tabs */}
                  <div className={`flex items-center gap-1 px-4 py-2 border-b ${dt.borderSubtle}`}>
                    {[
                      { value: 'single_elimination', label: 'Single Elim', icon: Swords },
                      { value: 'double_elimination', label: 'Double Elim', icon: Swords },
                      { value: 'group_stage', label: 'Group Stage', icon: Users },
                      { value: 'round_robin', label: 'Round Robin', icon: Calendar },
                    ].map(bt => (
                      <button
                        key={bt.value}
                        onClick={() => setBracketType(bt.value)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                          bracketType === bt.value ? `${dt.bg} ${dt.text} shadow-sm` : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <bt.icon className="w-3 h-3" />
                        {bt.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-4">
                    {t?.matches && t.matches.length > 0 ? (
                      <BracketView
                        matches={t.matches.map(m => ({
                          ...m,
                          round: 'round' in m ? (m as any).round || 1 : 1,
                        }))}
                        bracketType={bracketType as any}
                      />
                    ) : (
                      /* League matches — convert to bracket format */
                      <BracketView
                        matches={recentMatches.map(m => ({
                          id: m.id,
                          score1: m.score1 as number | null,
                          score2: m.score2 as number | null,
                          status: 'completed',
                          team1: { id: m.club1.name, name: m.club1.name },
                          team2: { id: m.club2.name, name: m.club2.name },
                          mvpPlayer: null,
                          round: m.week,
                        }))}
                        bracketType={bracketType as any}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Completed Matches — grouped by week (Toornament match list style) */}
            {Object.keys(matchesByWeek).length > 0 && (
              <motion.div variants={item}>
                <SectionCard title="Match Results" icon={Trophy} badge={`${data.recentMatches?.length || 0} Matches`}>
                  <div className="space-y-5">
                    {Object.entries(matchesByWeek)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([week, matches]) => (
                        <div key={week}>
                          {/* Week header — toornament style */}
                          <div className={`flex items-center gap-3 mb-2.5`}>
                            <div className={`px-2.5 py-1 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                              Week {week}
                            </div>
                            <div className={`flex-1 h-px ${dt.borderSubtle}`} />
                            <span className="text-[9px] text-muted-foreground">{matches.length} matches</span>
                          </div>
                          <div className="space-y-2">
                            {matches.map(m => (
                              <MatchRow
                                key={m.id}
                                club1={m.club1.name}
                                club2={m.club2.name}
                                score1={m.score1}
                                score2={m.score2}
                                status="completed"
                              />
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
                  <div className="space-y-5">
                    {Object.entries(upcomingByWeek)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([week, matches]) => (
                        <div key={week}>
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className={`px-2.5 py-1 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                              Week {week}
                            </div>
                            <div className={`flex-1 h-px ${dt.borderSubtle}`} />
                            <span className="text-[9px] text-muted-foreground">{matches.length} matches</span>
                          </div>
                          <div className="space-y-2">
                            {matches.map(m => (
                              <MatchRow
                                key={m.id}
                                club1={m.club1.name}
                                club2={m.club2.name}
                                score1={0}
                                score2={0}
                                status="upcoming"
                              />
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

        {/* ═══════════════ PARTICIPANTS TAB — Esports Poster Grid ═══════════════ */}
        <TabsContent value="participants" className="mt-4">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={item}>
              <ParticipantGrid
                players={data.topPlayers || []}
                onPlayerClick={(player) => setSelectedPlayer(player)}
              />
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
