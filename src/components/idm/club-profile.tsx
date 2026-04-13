'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Shield, Crown, Music, Target,
  TrendingUp, Award, Zap, Users, Star, BarChart3,
  Flame, ChevronRight, MapPin
} from 'lucide-react';
import { TierBadge } from './tier-badge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDivisionTheme } from '@/hooks/use-division-theme';

interface ClubProfileProps {
  club: {
    id: string;
    name: string;
    division?: string;
    wins: number;
    losses: number;
    points: number;
    gameDiff: number;
    members?: { id: string; name: string; gamertag: string; tier: string; points: number }[];
    rank?: number;
  };
  onClose: () => void;
  rank?: number;
  onPlayerClick?: (player: { id: string; name: string; gamertag: string; tier: string; points: number }) => void;
}

function StatBlock({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {sub && <p className="text-[9px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ClubProfile({ club, onClose, rank, onPlayerClick }: ClubProfileProps) {
  const dt = useDivisionTheme();
  const totalMatches = club.wins + club.losses;
  const winRate = totalMatches > 0 ? Math.round((club.wins / totalMatches) * 100) : 0;
  const isUndefeated = club.losses === 0 && club.wins > 0;

  const rankLabel = rank === 1 ? '🏆 League Champion' : rank === 2 ? '🥈 Runner-up' : rank === 3 ? '🥉 3rd Place' : rank ? `#${rank}` : '';

  // Demo members if none provided
  const members = club.members || [
    { id: 'demo-1', name: 'Player One', gamertag: 'AceStep', tier: 'S', points: 150 },
    { id: 'demo-2', name: 'Player Two', gamertag: 'ShadowFlow', tier: 'A', points: 120 },
    { id: 'demo-3', name: 'Player Three', gamertag: 'NovaGroove', tier: 'B', points: 80 },
  ];

  // Demo match history
  const recentMatches = [
    { week: 5, result: 'WIN' as const, score: '2-0', opponent: 'Phoenix Rise' },
    { week: 4, result: 'WIN' as const, score: '2-1', opponent: 'Storm Dancers' },
    { week: 3, result: 'LOSS' as const, score: '1-2', opponent: 'Dragon Rhythm' },
    { week: 2, result: 'WIN' as const, score: '2-0', opponent: 'Iron Beat' },
    { week: 1, result: 'WIN' as const, score: '2-1', opponent: 'Nova Crew' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-background w-full sm:max-w-md sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="relative h-40 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${dt.bg} via-transparent to-transparent opacity-50`} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Decorative shield pattern */}
            <div className="absolute top-4 right-4 opacity-10">
              <Shield className={`w-24 h-24 ${dt.text}`} />
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Rank Badge */}
            {rank && rank <= 3 && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className={`text-xs font-bold border-0 ${
                  rank === 1 ? `bg-yellow-500/20 text-yellow-500 ${dt.glowChampion}` :
                  rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                  'bg-amber-600/20 text-amber-600'
                }`}>
                  {rankLabel}
                </Badge>
              </div>
            )}

            {/* Club Avatar */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
              <div className={`w-20 h-20 rounded-2xl border-4 border-background flex items-center justify-center text-xl font-bold ${
                rank === 1 ? `bg-yellow-500/10 text-yellow-500 ${dt.glowChampion} ${dt.cardChampion}` :
                rank === 2 ? `bg-gray-400/10 text-gray-400 ${dt.glow}` :
                `${dt.iconBg} ${dt.text} ${dt.glow}`
              }`}>
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pt-14 pb-6">
            {/* Name & Division */}
            <div className="text-center mb-4">
              <h2 className={`text-xl font-bold ${dt.gradientText}`}>{club.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                {club.division && (
                  <Badge className={`text-[10px] border-0 ${dt.badgeBg}`}>
                    {club.division === 'male' ? '🕺 Male Division' : '💃 Female Division'}
                  </Badge>
                )}
                {isUndefeated && (
                  <Badge className="bg-green-500/10 text-green-500 text-[10px] border-0">
                    🔥 Undefeated
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 max-w-xs mx-auto">
                {rank === 1
                  ? 'League Champion — Top performing crew with exceptional performance'
                  : rank === 2
                  ? 'Runner-up — Strong contender pushing for the title'
                  : 'Competitive club in the IDM League season'
                }
              </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatBlock icon={Trophy} label="Points" value={club.points} color={dt.text} />
              <StatBlock icon={Target} label="Win Rate" value={`${winRate}%`} sub={`${club.wins}W/${club.losses}L`} color="text-green-500" />
              <StatBlock icon={Music} label="Game Diff" value={club.gameDiff > 0 ? `+${club.gameDiff}` : club.gameDiff} color="text-yellow-500" />
            </div>

            {/* Detailed Stats */}
            <div className="space-y-3 mb-4">
              {/* Win Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className={`font-bold ${dt.text}`}>{winRate}%</span>
                </div>
                <Progress value={winRate} className="h-2" />
              </div>

              {/* Record */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-500/5 border border-green-500/10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium">Wins</span>
                </div>
                <span className="text-sm font-bold text-green-500">{club.wins}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium">Losses</span>
                </div>
                <span className="text-sm font-bold text-red-500">{club.losses}</span>
              </div>

              <div className={`flex items-center justify-between p-2.5 rounded-xl ${dt.bgSubtle} border ${dt.borderSubtle}`}>
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${dt.text}`} />
                  <span className="text-xs font-medium">Total Matches</span>
                </div>
                <span className={`text-sm font-bold ${dt.text}`}>{totalMatches}</span>
              </div>
            </div>

            {/* Roster */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-4 h-4 ${dt.text}`} />
                <h3 className="text-sm font-semibold">Roster</h3>
                <Badge className={`${dt.badgeBg} text-[10px] ml-auto`}>{members.length} Players</Badge>
              </div>
              <div className="space-y-1.5">
                {members.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer interactive-scale"
                    onClick={() => onPlayerClick?.(p)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      p.tier === 'S' ? 'bg-red-500/10 text-red-500' :
                      p.tier === 'A' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {p.gamertag.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{p.gamertag}</span>
                        <TierBadge tier={p.tier} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{p.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${dt.text}`}>{p.points}</p>
                      <p className="text-[9px] text-muted-foreground">pts</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className={`w-4 h-4 ${dt.text}`} />
                <h3 className="text-sm font-semibold">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {club.wins >= 1 && (
                  <Badge className="bg-green-500/10 text-green-500 text-[10px] border-0">
                    <Star className="w-3 h-3 mr-1" /> First Win
                  </Badge>
                )}
                {club.wins >= 3 && (
                  <Badge className="bg-blue-500/10 text-blue-500 text-[10px] border-0">
                    <Trophy className="w-3 h-3 mr-1" /> 3+ Wins
                  </Badge>
                )}
                {isUndefeated && club.wins >= 2 && (
                  <Badge className="bg-orange-500/10 text-orange-500 text-[10px] border-0">
                    <Flame className="w-3 h-3 mr-1" /> Undefeated
                  </Badge>
                )}
                {rank === 1 && (
                  <Badge className={`bg-yellow-500/10 text-yellow-500 text-[10px] border-0 ${dt.glowChampion}`}>
                    <Crown className="w-3 h-3 mr-1" /> League Champion
                  </Badge>
                )}
                {rank && rank <= 4 && rank > 1 && (
                  <Badge className={`${dt.badgeBg} text-[10px] border-0`}>
                    <Shield className="w-3 h-3 mr-1" /> Top 4
                  </Badge>
                )}
                {club.gameDiff >= 5 && (
                  <Badge className="bg-amber-500/10 text-amber-500 text-[10px] border-0">
                    <Music className="w-3 h-3 mr-1" /> Powerhouse (+{club.gameDiff} GD)
                  </Badge>
                )}
                {totalMatches >= 5 && (
                  <Badge className="bg-amber-600/10 text-amber-600 text-[10px] border-0">
                    <BarChart3 className="w-3 h-3 mr-1" /> Veteran Club
                  </Badge>
                )}
                {winRate >= 70 && club.wins > 0 && (
                  <Badge className={`${dt.badgeBg} text-[10px] border-0`}>
                    <TrendingUp className="w-3 h-3 mr-1" /> 70%+ Win Rate
                  </Badge>
                )}
              </div>
            </div>

            {/* Recent Matches */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Music className={`w-4 h-4 ${dt.text}`} />
                <h3 className="text-sm font-semibold">Recent Matches</h3>
              </div>
              <div className="space-y-1.5">
                {recentMatches.map((m, i) => (
                  <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                    m.result === 'WIN' ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                        m.result === 'WIN' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {m.result}
                      </span>
                      <div>
                        <p className="font-medium">vs {m.opponent}</p>
                        <p className="text-[10px] text-muted-foreground">Week {m.week} • BO3</p>
                      </div>
                    </div>
                    <span className="font-bold">{m.score}</span>
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
                  <span className="text-muted-foreground">Win Bonus ({club.wins} wins × 2pts)</span>
                  <span className={`font-bold ${dt.text}`}>+{club.wins * 2} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Game Difference ({club.gameDiff > 0 ? '+' : ''}{club.gameDiff})</span>
                  <span className={`font-bold ${club.gameDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>{club.gameDiff > 0 ? '+' : ''}{club.gameDiff} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participation ({totalMatches} matches)</span>
                  <span className="font-bold text-green-500">+{totalMatches * 5} pts</span>
                </div>
                {isUndefeated && club.wins > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Undefeated Bonus</span>
                    <span className="font-bold text-orange-500">+20 pts</span>
                  </div>
                )}
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className={dt.text}>{club.points} pts</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
