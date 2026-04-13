'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Flame, Crown, Shield, Target,
  TrendingUp, Award, Zap, Calendar, Star, BarChart3,
  ChevronRight, Activity, Gamepad2, MapPin, Users, CircleDot
} from 'lucide-react';
import { TierBadge } from './tier-badge';
import { Badge } from '@/components/ui/badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useAppStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';

interface PlayerProfileProps {
  player: {
    id: string;
    name: string;
    gamertag: string;
    tier: string;
    points: number;
    totalWins: number;
    totalMvp: number;
    streak: number;
    maxStreak: number;
    matches: number;
    club?: string;
    division?: string;
  };
  onClose: () => void;
  rank?: number;
}

/* ─── Stat Block — Dance Tournament HUD style ─── */
function StatBlock({ icon: Icon, label, value, sub, color, highlight, size = 'normal' }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  highlight?: boolean;
  size?: 'normal' | 'large';
}) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);
  return (
    <div className={`relative rounded-xl p-3 text-center transition-all overflow-hidden ${
      highlight ? `${dt.bgSubtle} border ${dt.border}` : `bg-muted/10 border border-border/10`
    }`}>
      {/* Background decoration for highlighted stat */}
      {highlight && (
        <div className={`absolute inset-0 opacity-5`}>
          <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full ${division === 'male' ? 'bg-idm-male' : 'bg-idm-female'}`} />
        </div>
      )}
      <div className="relative z-10">
        <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
        <p className={`font-black ${size === 'large' ? 'text-xl' : 'text-lg'} ${highlight ? dt.neonGradient : ''}`}>{value}</p>
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
        {sub && <p className="text-[8px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Match History Row — Dance Tournament style ─── */
function MatchHistoryRow({ match }: { match: { week: number; result: string; score: string; mvp: boolean; opponent: string; highScore: string } }) {
  const dt = useDivisionTheme();
  const isWin = match.result === 'WIN';
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all hover:scale-[1.01] ${
      isWin ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'
    }`}>
      {/* Result badge */}
      <div className={`w-10 h-8 rounded-md flex items-center justify-center text-[9px] font-black ${
        isWin ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
      }`}>
        {match.result}
      </div>
      {/* Opponent info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">vs {match.opponent}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Wk {match.week}</span>
          <span className="text-border">•</span>
          <span>Score {match.highScore}</span>
        </div>
      </div>
      {/* Score */}
      <span className="text-sm font-black tabular-nums">{match.score}</span>
      {/* MVP indicator */}
      {match.mvp && <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
    </div>
  );
}

export function PlayerProfile({ player, onClose, rank }: PlayerProfileProps) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);
  const winRate = player.matches > 0 ? Math.round((player.totalWins / player.matches) * 100) : 0;
  const mvpRate = player.matches > 0 ? Math.round((player.totalMvp / player.matches) * 100) : 0;
  const losses = player.matches - player.totalWins;
  const isChampion = rank === 1;
  const isTop3 = rank !== undefined && rank <= 3;

  const tierConfig: Record<string, { label: string; color: string; desc: string }> = {
    S: { label: 'S Tier', color: 'text-red-500', desc: 'Elite Dancer — Top performer with exceptional rhythm' },
    A: { label: 'A Tier', color: 'text-yellow-500', desc: 'Advanced Dancer — Strong performer with proven records' },
    B: { label: 'B Tier', color: 'text-green-500', desc: 'Rising Dancer — Developing performer with potential' },
  };
  const tier = tierConfig[player.tier] || tierConfig.B;

  const rankLabel = rank === 1 ? 'CHAMPION' : rank === 2 ? 'RUNNER-UP' : rank === 3 ? '3RD PLACE' : rank ? `#${rank}` : '';

  // Generate match history for demo
  const recentMatches = [
    { week: 5, result: 'WIN', score: '2-0', mvp: true, opponent: 'Team Phoenix', highScore: '985K' },
    { week: 4, result: 'WIN', score: '2-1', mvp: false, opponent: 'Shadow Groove', highScore: '872K' },
    { week: 3, result: 'LOSS', score: '1-2', mvp: false, opponent: 'Dragon Rhythm', highScore: '756K' },
    { week: 2, result: 'WIN', score: '2-0', mvp: true, opponent: 'Storm Dancers', highScore: '1.1M' },
    { week: 1, result: 'WIN', score: '2-1', mvp: false, opponent: 'Nova Crew', highScore: '923K' },
  ];

  // Performance chart data (demo — would be derived from actual match results in production)
  const performanceData = [65, 72, 68, 80, 85, 78, 90, 88, 92, 95];
  const maxPerf = Math.max(...performanceData);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-background w-full sm:max-w-lg sm:rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ═══ HERO BANNER — Dance Tournament Profile Style ═══ */}
          <div className={`relative h-44 overflow-hidden`}>
            {/* Background gradient — division themed */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              division === 'male'
                ? 'from-idm-male/30 via-idm-male/10 to-transparent'
                : 'from-idm-female/30 via-idm-female/10 to-transparent'
            }`} />
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, ${dt.color}15 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, ${dt.color}10 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, ${dt.color}08 0%, transparent 50%)
                `,
              }} />
            </div>
            {/* Geometric lines — esports style */}
            <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
              <line x1="0" y1="100%" x2="40%" y2="0" stroke={dt.color} strokeWidth="1" />
              <line x1="100%" y1="100%" x2="60%" y2="0" stroke={dt.color} strokeWidth="1" />
              <line x1="50%" y1="100%" x2="50%" y2="0" stroke={dt.color} strokeWidth="0.5" />
            </svg>
            {/* Large background number */}
            <div className="absolute -right-4 -bottom-4 select-none">
              <span className={`text-[120px] font-black leading-none ${division === 'male' ? 'text-idm-male/5' : 'text-idm-female/5'}`}>
                {rank || '#'}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors z-20 border border-border/30"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Rank badge — top-left */}
            {isTop3 && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className={`text-[10px] font-black border-0 backdrop-blur-sm px-2.5 py-1 ${
                  rank === 1 ? 'bg-yellow-500/25 text-yellow-400 shadow-lg shadow-yellow-500/10' :
                  rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  'bg-amber-600/20 text-amber-500'
                }`}>
                  {rank === 1 ? '👑' : ''} {rankLabel}
                </Badge>
              </div>
            )}

            {/* Division badge */}
            <div className="absolute top-3 left-3 z-10" style={{ marginTop: isTop3 ? '28px' : 0 }}>
              <Badge className={`${dt.casinoBadge} text-[9px] backdrop-blur-sm`}>
                {division === 'male' ? '🕺 Male Division' : '💃 Female Division'}
              </Badge>
            </div>

            {/* Avatar — centered, overlapping banner */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              {/* Glow ring */}
              {isChampion && (
                <div className="absolute -inset-2 rounded-full border-2 border-yellow-500/40 animate-pulse" />
              )}
              <div className={`w-20 h-20 rounded-full border-4 border-background flex items-center justify-center text-xl font-black shadow-2xl ${
                player.tier === 'S' ? 'bg-red-500/15 text-red-500' :
                player.tier === 'A' ? 'bg-yellow-500/15 text-yellow-500' :
                'bg-green-500/15 text-green-500'
              }`}>
                {player.gamertag.slice(0, 2).toUpperCase()}
              </div>
              {/* Tier badge on avatar */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
                <TierBadge tier={player.tier} />
              </div>
            </div>
          </div>

          {/* ═══ CONTENT ═══ */}
          <div className="px-4 pt-16 pb-6">
            {/* Name, Tier, Club */}
            <div className="text-center mb-5">
              <h2 className={`text-xl font-black ${dt.gradientText}`}>{player.gamertag}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{player.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-xs font-semibold ${tier.color}`}>{tier.label}</span>
                {player.streak > 1 && (
                  <Badge className="bg-orange-500/10 text-orange-500 text-[10px] border-0">
                    🔥 {player.streak} Streak
                  </Badge>
                )}
              </div>
              {player.club && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Shield className={`w-3.5 h-3.5 ${dt.text}`} />
                  <span className={`text-xs ${dt.text} font-medium`}>{player.club}</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 max-w-xs mx-auto">{tier.desc}</p>
            </div>

            {/* ═══ Main Stats Grid — Dance Tournament HUD Style ═══ */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <StatBlock icon={Trophy} label="Points" value={player.points} color={dt.text} highlight size="large" />
              <StatBlock icon={Target} label="Win Rate" value={`${winRate}%`} sub={`${player.totalWins}W/${losses}L`} color="text-green-500" />
              <StatBlock icon={Crown} label="MVP" value={player.totalMvp} sub={`${mvpRate}% rate`} color="text-yellow-500" />
              <StatBlock icon={Activity} label="Matches" value={player.matches} color="text-blue-400" />
            </div>

            {/* ═══ Performance Graph — Dance Tournament Bar Chart ═══ */}
            <div className={`p-3.5 rounded-xl ${dt.bgSubtle} border ${dt.borderSubtle} mb-4`}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className={`w-4 h-4 ${dt.text}`} />
                <span className="text-xs font-semibold">Performance Trend</span>
                <Badge className={`${dt.casinoBadge} text-[8px] ml-auto`}>LAST 10</Badge>
              </div>
              <div className="flex items-end gap-1 h-14">
                {performanceData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / maxPerf) * 100}%` }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className={`w-full rounded-t-sm ${
                        i === performanceData.length - 1
                          ? `bg-gradient-to-t ${division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'}`
                          : i >= performanceData.length - 3 ? `${dt.bg}` : 'bg-muted-foreground/15'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[8px] text-muted-foreground">10 matches ago</span>
                <span className="text-[8px] text-muted-foreground">Now</span>
              </div>
            </div>

            {/* ═══ Win Rate Progress Bar ═══ */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Win Rate</span>
                <span className={`font-black ${dt.text}`}>{winRate}%</span>
              </div>
              <div className={`h-2.5 rounded-full ${dt.bgSubtle} overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${winRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    winRate >= 60
                      ? `bg-gradient-to-r ${division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'}`
                      : winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* ═══ Streak & Max Streak ═══ */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium">Current Streak</span>
                </div>
                <span className="text-lg font-black text-orange-500">{player.streak}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium">Max Streak</span>
                </div>
                <span className="text-lg font-black text-yellow-500">{player.maxStreak}</span>
              </div>
            </div>

            {/* ═══ Achievements ═══ */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className={`w-4 h-4 ${dt.text}`} />
                <h3 className="text-sm font-semibold">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {player.totalWins >= 1 && (
                  <Badge className="bg-green-500/10 text-green-500 text-[10px] border-0">
                    <Star className="w-3 h-3 mr-1" /> First Win
                  </Badge>
                )}
                {player.totalWins >= 5 && (
                  <Badge className="bg-blue-500/10 text-blue-400 text-[10px] border-0">
                    <Trophy className="w-3 h-3 mr-1" /> 5 Wins
                  </Badge>
                )}
                {player.totalMvp >= 1 && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 text-[10px] border-0">
                    <Crown className="w-3 h-3 mr-1" /> MVP
                  </Badge>
                )}
                {player.maxStreak >= 3 && (
                  <Badge className="bg-orange-500/10 text-orange-500 text-[10px] border-0">
                    <Flame className="w-3 h-3 mr-1" /> On Fire
                  </Badge>
                )}
                {player.tier === 'S' && (
                  <Badge className="bg-red-500/10 text-red-500 text-[10px] border-0">
                    <Star className="w-3 h-3 mr-1" /> Elite
                  </Badge>
                )}
                {rank === 1 && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 text-[10px] border-0">
                    <Crown className="w-3 h-3 mr-1" /> Champion
                  </Badge>
                )}
                {player.matches >= 5 && (
                  <Badge className="bg-amber-600/10 text-amber-600 text-[10px] border-0">
                    <BarChart3 className="w-3 h-3 mr-1" /> Veteran
                  </Badge>
                )}
              </div>
            </div>

            {/* ═══ Recent Matches — Dance Tournament Match History ═══ */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Calendar className={`w-4 h-4 ${dt.text}`} />
                <h3 className="text-sm font-semibold">Match History</h3>
                <Badge className={`${dt.casinoBadge} text-[8px] ml-auto`}>RECENT</Badge>
              </div>
              <div className="space-y-1.5">
                {recentMatches.map((m, i) => (
                  <MatchHistoryRow key={i} match={m} />
                ))}
              </div>
            </div>

            {/* ═══ Points Breakdown ═══ */}
            <div className={`p-3.5 rounded-xl ${dt.bgSubtle} border ${dt.borderSubtle}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingUp className={`w-4 h-4 ${dt.text}`} />
                <span className="text-xs font-semibold">Points Breakdown</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: `Win Bonus (${player.totalWins} wins)`, value: `+${player.totalWins * 3}`, color: dt.text },
                  { label: `MVP Bonus (${player.totalMvp}x)`, value: `+${player.totalMvp * 5}`, color: 'text-yellow-500' },
                  { label: `Participation (${player.matches} matches)`, value: `+${player.matches * 2}`, color: 'text-green-500' },
                  { label: `Streak Bonus (${player.streak}x)`, value: `+${Math.min(player.streak * 5, 30)}`, color: 'text-orange-500' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value} pts</span>
                  </div>
                ))}
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className={dt.neonGradient}>{player.points} pts</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
