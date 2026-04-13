'use client';

import { motion } from 'framer-motion';
import { Crown, Flame, Trophy } from 'lucide-react';
import { TierBadge } from './tier-badge';

interface PlayerCardProps {
  gamertag: string;
  tier: string;
  points: number;
  totalWins: number;
  totalMvp: number;
  streak: number;
  rank?: number;
  isMvp?: boolean;
  club?: string;
  onClick?: () => void;
}

export function PlayerCard({
  gamertag, tier, points, totalWins, totalMvp, streak, rank, isMvp, club, onClick
}: PlayerCardProps) {
  const rankColors: Record<number, string> = {
    1: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    2: 'from-gray-400/20 to-gray-400/5 border-gray-400/30',
    3: 'from-amber-600/20 to-amber-600/5 border-amber-600/30',
  };

  const rankBg = rank && rank <= 3 ? rankColors[rank] : 'from-muted/50 to-transparent border-border/30';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-3 rounded-xl bg-gradient-to-br ${rankBg} border cursor-pointer transition-shadow hover:shadow-lg ${isMvp ? 'glow-gold' : ''}`}
    >
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-md">
          {rank}
        </div>
      )}

      {/* MVP indicator */}
      {isMvp && (
        <div className="absolute -top-1 -left-1">
          <Crown className="w-4 h-4 text-yellow-500" />
        </div>
      )}

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-2">
        {gamertag.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm font-semibold truncate">{gamertag}</p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <TierBadge tier={tier} />
        </div>
        {club && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">{club}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-border/30">
        <div className="text-center">
          <p className="text-xs font-bold text-primary">{points}</p>
          <p className="text-[9px] text-muted-foreground">PTS</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold">{totalWins}</p>
          <p className="text-[9px] text-muted-foreground">WINS</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5">
            {streak > 1 && <Flame className="w-3 h-3 text-orange-400" />}
            <span className="text-xs font-bold">{streak > 1 ? streak : totalMvp}</span>
          </div>
          <p className="text-[9px] text-muted-foreground">{streak > 1 ? 'STREAK' : 'MVP'}</p>
        </div>
      </div>
    </motion.div>
  );
}
