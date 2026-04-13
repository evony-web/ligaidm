'use client';

import { motion } from 'framer-motion';
import { Crown, Swords, Radio, Clock, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useState } from 'react';

/* ─── Match data interface ─── */
interface EsportsMatchCardProps {
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  score1: number | null;
  score2: number | null;
  status: string;
  week?: number;
  mvpPlayer?: { id: string; name: string; gamertag: string } | null;
  onClick?: () => void;
}

/* ─── Status config ─── */
function getStatusConfig(status: string): { label: string; cls: string; pulse?: boolean } {
  switch (status) {
    case 'live':
    case 'main_event':
      return { label: 'LIVE', cls: 'bg-red-500/15 text-red-500 border-red-500/30', pulse: true };
    case 'completed':
    case 'scoring':
      return { label: 'FT', cls: 'bg-green-500/15 text-green-500 border-green-500/30' };
    case 'upcoming':
    case 'registration':
    case 'setup':
      return { label: 'UPCOMING', cls: 'bg-muted text-muted-foreground' };
    default:
      return { label: 'VS', cls: '' };
  }
}

/* ─── Team Avatar Circle ─── */
function TeamAvatar({ name, isWinner, size = 'md' }: {
  name: string;
  isWinner: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dt = useDivisionTheme();
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ${
      isWinner
        ? `bg-gradient-to-br ${dt.division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'} text-white shadow-lg`
        : `${dt.iconBg} ${dt.text}`
    }`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ─── Main EsportsMatchCard Component ─── */
export function EsportsMatchCard({
  team1, team2, score1, score2, status, week, mvpPlayer, onClick
}: EsportsMatchCardProps) {
  const dt = useDivisionTheme();
  const [expanded, setExpanded] = useState(false);
  const hasScore = score1 !== null && score2 !== null;
  const winner1 = hasScore && score1! > score2!;
  const winner2 = hasScore && score2! > score1!;
  const isLive = status === 'live' || status === 'main_event';
  const statusConfig = getStatusConfig(status);

  const handleClick = () => {
    setExpanded(!expanded);
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
        dt.casinoCard
      } ${isLive ? dt.neonPulse : ''} ${dt.casinoGlow} casino-shimmer`}
    >
      {/* Neon accent bar */}
      <div className={dt.casinoBar} />

      {/* Corner accents */}
      <div className={`absolute top-0 left-0 ${dt.cornerAccent}`} />
      <div className={`absolute top-0 right-0 rotate-90 ${dt.cornerAccent}`} />

      <div className="relative z-10 p-4">
        {/* Status badge — top center */}
        <div className="flex items-center justify-between mb-3">
          {week && (
            <Badge className={`${dt.casinoBadge} text-[9px]`}>
              <Clock className="w-2.5 h-2.5 mr-1" />
              Week {week}
            </Badge>
          )}
          <div className="ml-auto">
            <Badge className={`${statusConfig.cls} text-[9px] font-bold border ${statusConfig.pulse ? 'live-dot' : ''}`}>
              {statusConfig.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />}
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* VS-Style Layout */}
        <div className="flex items-center justify-between gap-3">
          {/* Team 1 — Left Side */}
          <div className="flex-1 text-center">
            <TeamAvatar name={team1.name} isWinner={winner1} size="lg" />
            <p className={`text-xs font-bold mt-2 truncate ${winner1 ? dt.neonText : 'text-foreground/80'}`}>
              {team1.name || 'TBD'}
            </p>
          </div>

          {/* Score / VS — Center */}
          <div className="flex flex-col items-center justify-center shrink-0 px-2">
            {hasScore ? (
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black tabular-nums ${winner1 ? dt.neonGradient : 'text-foreground/60'}`}>
                  {score1}
                </span>
                <span className="text-xs text-muted-foreground font-bold">:</span>
                <span className={`text-2xl font-black tabular-nums ${winner2 ? dt.neonGradient : 'text-foreground/60'}`}>
                  {score2}
                </span>
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full ${dt.iconBg} flex items-center justify-center`}>
                <Swords className={`w-5 h-5 ${dt.neonText}`} />
              </div>
            )}
          </div>

          {/* Team 2 — Right Side */}
          <div className="flex-1 text-center">
            <TeamAvatar name={team2.name} isWinner={winner2} size="lg" />
            <p className={`text-xs font-bold mt-2 truncate ${winner2 ? dt.neonText : 'text-foreground/80'}`}>
              {team2.name || 'TBD'}
            </p>
          </div>
        </div>

        {/* MVP Indicator */}
        {mvpPlayer && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center gap-1.5 mt-3 p-2 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} border`}
          >
            <Crown className="w-3.5 h-3.5 text-yellow-500" />
            <span className={`text-[10px] font-semibold ${dt.neonText}`}>MVP: {mvpPlayer.gamertag}</span>
          </motion.div>
        )}

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <div className={`p-3 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} border space-y-2`}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-semibold ${isLive ? 'text-red-500' : 'text-foreground'}`}>
                  {statusConfig.label}
                </span>
              </div>
              {hasScore && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Score</span>
                  <span className={`font-semibold ${dt.neonText}`}>
                    {team1.name} {score1} - {score2} {team2.name}
                  </span>
                </div>
              )}
              {week && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Week</span>
                  <span className="font-semibold">{week}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Expand indicator */}
        <div className="flex items-center justify-center mt-2">
          <span className="text-[8px] text-muted-foreground">
            {expanded ? 'Click to collapse' : 'Click for details'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
