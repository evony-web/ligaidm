'use client';

import { motion } from 'framer-motion';
import { Crown, Flame, Trophy } from 'lucide-react';
import { TierBadge } from './tier-badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';

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
  const isChampion = rank === 1;
  const dt = useDivisionTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-3 rounded-xl cursor-pointer transition-all ${
        isChampion ? 'card-champion' :
        rank === 2 ? 'card-premium' :
        rank === 3 ? 'card-premium' :
        'card-glow-hover bg-muted/20 border border-border/30'
      }`}
    >
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${
          rank === 1 ? 'bg-yellow-500 text-white glow-champion' :
          rank === 2 ? 'bg-gray-400 text-white' :
          'bg-amber-600 text-white'
        }`}>
          {rank}
        </div>
      )}

      {/* MVP indicator */}
      {isMvp && (
        <div className="absolute -top-1 -left-1">
          <Crown className="w-4 h-4 text-yellow-500 animate-float" />
        </div>
      )}

      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${
        isChampion ? 'bg-yellow-500/10 text-yellow-500 glow-champion' :
        tier === 'S' ? 'bg-red-500/10 text-red-500' :
        tier === 'A' ? `${dt.iconBg} ${dt.text}` :
        `${dt.iconBg} ${dt.text}`
      }`}>
        {gamertag.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="text-center">
        <p className={`text-sm font-semibold truncate ${isChampion ? 'text-gradient-gold' : ''}`}>{gamertag}</p>
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
          <p className={`text-xs font-bold ${isChampion ? 'text-gradient-gold' : dt.text}`}>{points}</p>
          <p className="text-[9px] text-muted-foreground">PTS</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-green-500">{totalWins}</p>
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
