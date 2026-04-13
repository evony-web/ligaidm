'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Flame, Crown, Shield, Swords, Target,
  TrendingUp, Award, Zap, Calendar, Star, BarChart3,
  ChevronRight, Activity, Gamepad2, MapPin, Users
} from 'lucide-react';
import { TierBadge } from './tier-badge';
import { Badge } from '@/components/ui/badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
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

function StatBlock({ icon: Icon, label, value, sub, color, highlight }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  highlight?: boolean;
}) {
  const dt = useDivisionTheme();
  return (
    <div className={`p-3 rounded-xl border text-center transition-all ${
      highlight ? `${dt.bgSubtle} ${dt.border}` : `bg-muted/20 border-border/20`
    }`}>
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
      <p className={`text-lg font-black ${highlight ? dt.neonGradient : ''}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {sub && <p className="text-[9px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

export function PlayerProfile({ player, onClose, rank }: PlayerProfileProps) {
  const dt = useDivisionTheme();
  const winRate = player.matches > 0 ? Math.round((player.totalWins / player.matches) * 100) : 0;
  const mvpRate = player.matches > 0 ? Math.round((player.totalMvp / player.matches) * 100) : 0;
  const losses = player.matches - player.totalWins;

  const tierConfig: Record<string, { label: string; color: string; desc: string }> = {
    S: { label: 'S Tier', color: 'text-red-500', desc: 'Elite Player — Top competitor with exceptional skills' },
    A: { label: 'A Tier', color: 'text-yellow-500', desc: 'Advanced Player — Strong competitor with proven records' },
    B: { label: 'B Tier', color: 'text-green-500', desc: 'Rising Player — Developing competitor with potential' },
  };
  const tier = tierConfig[player.tier] || tierConfig.B;

  const rankLabel = rank === 1 ? '🥇 #1 Champion' : rank === 2 ? '🥈 #2 Runner-up' : rank === 3 ? '🥉 #3 3rd Place' : rank ? `#${rank}` : '';

  // Generate match history for demo
  const recentMatches = [
    { week: 5, result: 'WIN', score: '2-0', mvp: true, opponent: 'Team Phoenix', kda: '8/2/5' },
    { week: 4, result: 'WIN', score: '2-1', mvp: false, opponent: 'Shadow Wolves', kda: '5/4/7' },
    { week: 3, result: 'LOSS', score: '1-2', mvp: false, opponent: 'Dragon Elite', kda: '3/6/4' },
    { week: 2, result: 'WIN', score: '2-0', mvp: true, opponent: 'Storm Raiders', kda: '9/1/6' },
    { week: 1, result: 'WIN', score: '2-1', mvp: false, opponent: 'Nova Squad', kda: '6/3/8' },
  ];

  // Performance chart data (simulated)
  const performanceData = [65, 72, 68, 80, 85, 78, 90, 88, 92, 95];
  const maxPerf = Math.max(...performanceData);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
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
          {/* Hero Banner — MPL/Esports Style */}
          <div className={`relative h-36 bg-gradient-to-br ${
            dt.division === 'male' ? 'from-idm-male/20 via-transparent to-idm-male-light/10' : 'from-idm-female/20 via-transparent to-idm-female-light/10'
          } overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, ${dt.color}33 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${dt.color}22 0%, transparent 50%)`,
              }} />
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Rank Badge */}
            {rank && rank <= 3 && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className={`text-xs font-bold border-0 backdrop-blur-sm ${
                  rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                  rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                  'bg-amber-600/20 text-amber-600'
                }`}>
                  {rankLabel}
                </Badge>
              </div>
            )}

            {/* Division Badge */}
            <div className="absolute top-3 left-3 z-10 mt-8">
              <Badge className={`${dt.casinoBadge} text-[9px] backdrop-blur-sm`}>
                {dt.division === 'male' ? '⚔️ Male Division' : '🗡️ Female Division'}
              </Badge>
            </div>

            {/* Avatar — centered, overlapping banner */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className={`w-20 h-20 rounded-full border-4 border-background flex items-center justify-center text-xl font-bold ${
                player.tier === 'S' ? `bg-red-500/10 text-red-500 ${dt.glow}` :
                player.tier === 'A' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {player.gamertag.slice(0, 2).toUpperCase()}
              </div>
              {/* Tier badge on avatar */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
                <TierBadge tier={player.tier} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pt-14 pb-6">
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

            {/* Main Stats Grid — MPL Style */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <StatBlock icon={Trophy} label="Points" value={player.points} color={dt.text} highlight />
              <StatBlock icon={Target} label="Win Rate" value={`${winRate}%`} sub={`${player.totalWins}W/${losses}L`} color="text-green-500" />
              <StatBlock icon={Crown} label="MVP" value={player.totalMvp} sub={`${mvpRate}% rate`} color="text-yellow-500" />
              <StatBlock icon={Activity} label="Matches" value={player.matches} color="text-blue-400" />
            </div>

            {/* Performance Graph — Simple Bar Chart */}
            <div className={`p-3 rounded-xl ${dt.bgSubtle} border ${dt.borderSubtle} mb-4`}>
              <div className="flex items-center gap-2 mb-2.5">
                <BarChart3 className={`w-4 h-4 ${dt.text}`} />
                <span className="text-xs font-semibold">Performance Trend</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {performanceData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t ${i === performanceData.length - 1 ? `bg-gradient-to-t ${dt.division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'}` : 'bg-muted-foreground/20'}`}
                      style={{ height: `${(val / maxPerf) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-muted-foreground">10 matches ago</span>
                <span className="text-[8px] text-muted-foreground">Now</span>
              </div>
            </div>

            {/* Win Rate Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Win Rate</span>
                <span className={`font-bold ${dt.text}`}>{winRate}%</span>
              </div>
              <div className={`h-2.5 rounded-full ${dt.bgSubtle} overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${winRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${winRate >= 60 ? 'bg-green-500' : winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
              </div>
            </div>

            {/* Streak & Max Streak */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium">Current Streak</span>
                </div>
                <span className="text-sm font-bold text-orange-500">{player.streak}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium">Max Streak</span>
                </div>
                <span className="text-sm font-bold text-yellow-500">{player.maxStreak}</span>
              </div>
            </div>

            {/* Achievements */}
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
                    <Swords className="w-3 h-3 mr-1" /> Elite
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

            {/* Recent Matches — MPL Match History Style */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`w-4 h-4 ${dt.text}`} />
                <h3 className="text-sm font-semibold">Match History</h3>
              </div>
              <div className="space-y-1.5">
                {recentMatches.map((m, i) => (
                  <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                    m.result === 'WIN' ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-9 h-6 rounded flex items-center justify-center text-[9px] font-bold ${
                        m.result === 'WIN' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {m.result}
                      </span>
                      <div>
                        <p className="font-semibold">vs {m.opponent}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>Week {m.week}</span>
                          <span>•</span>
                          <span>KDA: {m.kda}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{m.score}</span>
                      {m.mvp && <Crown className="w-3 h-3 text-yellow-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Points Breakdown */}
            <div className={`p-3 rounded-xl ${dt.bgSubtle} border ${dt.borderSubtle}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-4 h-4 ${dt.text}`} />
                <span className="text-xs font-semibold">Points Breakdown</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Bonus ({player.totalWins} wins)</span>
                  <span className={`font-bold ${dt.text}`}>+{player.totalWins * 3} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MVP Bonus ({player.totalMvp}x)</span>
                  <span className="font-bold text-yellow-500">+{player.totalMvp * 5} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participation ({player.matches} matches)</span>
                  <span className="font-bold text-green-500">+{player.matches * 2} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak Bonus ({player.streak}x)</span>
                  <span className="font-bold text-orange-500">+{Math.min(player.streak * 5, 30)} pts</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className={dt.text}>{player.points} pts</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
