'use client';

import { motion } from 'framer-motion';
import { Crown, Flame } from 'lucide-react';
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
  const isTop3 = rank !== undefined && rank <= 3;
  const dt = useDivisionTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-2xl cursor-pointer transition-all overflow-hidden ${
        dt.casinoCard
      } ${isChampion ? dt.neonPulse : ''} ${dt.casinoGlow} casino-shimmer`}
    >
      {/* Neon accent bar */}
      <div className={dt.casinoBar} />

      {/* Corner accents */}
      <div className={`absolute top-0 left-0 ${dt.cornerAccent}`} />
      <div className={`absolute top-0 right-0 rotate-90 ${dt.cornerAccent}`} />

      <div className="relative z-10 p-3 pt-2">
        {/* Rank badge */}
        {isTop3 && (
          <div className={`absolute -top-0 -right-0 w-7 h-7 rounded-bl-xl flex items-center justify-center text-[10px] font-bold shadow-md ${
            rank === 1 ? 'bg-yellow-500 text-white neon-pulse-male' :
            rank === 2 ? 'bg-gray-400 text-white' :
            'bg-amber-600 text-white'
          }`}>
            {rank}
          </div>
        )}

        {/* MVP indicator */}
        {isMvp && (
          <div className="absolute -top-1 -left-1 z-20">
            <Crown className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)] animate-float" />
          </div>
        )}

        {/* Avatar with neon ring */}
        <div className="relative w-14 h-14 mx-auto mb-2">
          <div className={`absolute inset-0 rounded-full ${
            isChampion ? 'bg-yellow-500/20' : dt.iconBg
          } ${isChampion ? dt.neonPulse : ''}`} />
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold relative z-10 ${
            isChampion ? 'bg-yellow-500/10 text-yellow-500' :
            tier === 'S' ? 'bg-red-500/10 text-red-500' :
            `${dt.iconBg} ${dt.text}`
          }`}>
            {gamertag.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className={`text-sm font-semibold truncate ${
            isChampion ? dt.neonGradient :
            isTop3 ? dt.neonText :
            'text-foreground'
          }`}>{gamertag}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <TierBadge tier={tier} />
          </div>
          {club && (
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{club}</p>
          )}
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-1 mt-2 pt-2 border-t ${dt.borderSubtle}`}>
          <div className="text-center">
            <p className={`text-xs font-bold ${dt.neonText}`}>{points}</p>
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
      </div>
    </motion.div>
  );
}
