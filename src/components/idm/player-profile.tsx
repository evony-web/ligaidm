'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Flame, Crown, Shield, Swords, Target,
  TrendingUp, Award, Zap, Calendar, Star, BarChart3
} from 'lucide-react';
import { TierBadge } from './tier-badge';
import { Badge } from '@/components/ui/badge';
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

function StatCard({ icon: Icon, label, value, sub, color }: {
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

export function PlayerProfile({ player, onClose, rank }: PlayerProfileProps) {
  const winRate = player.matches > 0 ? Math.round((player.totalWins / player.matches) * 100) : 0;
  const mvpRate = player.matches > 0 ? Math.round((player.totalMvp / player.matches) * 100) : 0;

  const tierConfig: Record<string, { label: string; color: string; desc: string }> = {
    S: { label: 'S Tier', color: 'text-red-500', desc: 'Elite Player — Top competitor with exceptional skills' },
    A: { label: 'A Tier', color: 'text-yellow-500', desc: 'Advanced Player — Strong competitor with proven records' },
    B: { label: 'B Tier', color: 'text-green-500', desc: 'Rising Player — Developing competitor with potential' },
  };
  const tier = tierConfig[player.tier] || tierConfig.B;

  const rankLabel = rank === 1 ? '🥇 #1 Champion' : rank === 2 ? '🥈 #2 Runner-up' : rank === 3 ? '🥉 #3 3rd Place' : rank ? `#${rank}` : '';

  // Generate fake match history for demo
  const recentMatches = [
    { week: 5, result: 'WIN', score: '2-0', mvp: true, opponent: 'Team Phoenix' },
    { week: 4, result: 'WIN', score: '2-1', mvp: false, opponent: 'Shadow Wolves' },
    { week: 3, result: 'LOSS', score: '1-2', mvp: false, opponent: 'Dragon Elite' },
    { week: 2, result: 'WIN', score: '2-0', mvp: true, opponent: 'Storm Raiders' },
    { week: 1, result: 'WIN', score: '2-1', mvp: false, opponent: 'Nova Squad' },
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
          <div className="relative h-32 bg-gradient-to-br from-primary/20 via-idm-purple/10 to-primary/5 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <img src="/arena-bg.png" alt="" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Rank Badge */}
            {rank && rank <= 3 && (
              <div className="absolute top-3 left-3">
                <Badge className={`text-xs font-bold border-0 ${
                  rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                  rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                  'bg-amber-600/20 text-amber-600'
                }`}>
                  {rankLabel}
                </Badge>
              </div>
            )}

            {/* Avatar */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className={`w-20 h-20 rounded-full border-4 border-background flex items-center justify-center text-xl font-bold ${
                player.tier === 'S' ? 'bg-red-500/10 text-red-500 glow-gold' :
                player.tier === 'A' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {player.gamertag.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pt-12 pb-6">
            {/* Name & Tier */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gradient-fury">{player.gamertag}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{player.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <TierBadge tier={player.tier} />
                <span className={`text-xs font-semibold ${tier.color}`}>{tier.label}</span>
                {player.streak > 1 && (
                  <Badge className="bg-orange-500/10 text-orange-500 text-[10px] border-0">
                    🔥 {player.streak} Streak
                  </Badge>
                )}
              </div>
              {player.club && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{player.club}</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 max-w-xs mx-auto">{tier.desc}</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatCard icon={Trophy} label="Points" value={player.points} color="text-primary" />
              <StatCard icon={Target} label="Win Rate" value={`${winRate}%`} sub={`${player.totalWins}W/${player.matches - player.totalWins}L`} color="text-green-500" />
              <StatCard icon={Crown} label="MVP" value={player.totalMvp} sub={`${mvpRate}% rate`} color="text-yellow-500" />
            </div>

            {/* Detailed Stats */}
            <div className="space-y-3 mb-4">
              {/* Win Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-bold text-primary">{winRate}%</span>
                </div>
                <Progress value={winRate} className="h-2" />
              </div>

              {/* Streak */}
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
                <Award className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {player.totalWins >= 1 && (
                  <Badge className="bg-green-500/10 text-green-500 text-[10px] border-0">
                    <Star className="w-3 h-3 mr-1" /> First Win
                  </Badge>
                )}
                {player.totalWins >= 5 && (
                  <Badge className="bg-blue-500/10 text-blue-500 text-[10px] border-0">
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
                    <Flame className="w-3 h-3 mr-1" /> On Fire (3+ Streak)
                  </Badge>
                )}
                {player.tier === 'S' && (
                  <Badge className="bg-red-500/10 text-red-500 text-[10px] border-0">
                    <Swords className="w-3 h-3 mr-1" /> Elite Tier
                  </Badge>
                )}
                {rank === 1 && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 text-[10px] border-0">
                    <Crown className="w-3 h-3 mr-1" /> Champion
                  </Badge>
                )}
                {player.matches >= 5 && (
                  <Badge className="bg-purple-500/10 text-purple-500 text-[10px] border-0">
                    <BarChart3 className="w-3 h-3 mr-1" /> Veteran (5+ Matches)
                  </Badge>
                )}
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
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
                        <p className="text-[10px] text-muted-foreground">Week {m.week}</p>
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
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Points Breakdown</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Bonus (5 wins)</span>
                  <span className="font-bold text-primary">+10 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MVP Bonus (2x)</span>
                  <span className="font-bold text-yellow-500">+varies</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participation (5 matches)</span>
                  <span className="font-bold text-green-500">+50 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak Bonus ({player.streak}x)</span>
                  <span className="font-bold text-orange-500">+{Math.min(player.streak * 5, 30)} pts</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{player.points} pts</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
