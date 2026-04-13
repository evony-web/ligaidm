'use client';

import { motion } from 'framer-motion';
import { Shield, Flame, Search, List, Grid3X3, Trophy, Zap, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TierBadge } from './tier-badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useAppStore } from '@/lib/store';
import { useState, useMemo } from 'react';

/* ─── Player interface ─── */
interface Player {
  id: string;
  name: string;
  gamertag: string;
  tier: string;
  points: number;
  totalWins: number;
  streak: number;
  maxStreak: number;
  totalMvp: number;
  matches: number;
  club?: string;
  division?: string;
}

interface ParticipantGridProps {
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

/* ─── Esports Poster-style Participant Card ─── */
function ParticipantCard({ player, rank, onClick }: {
  player: Player;
  rank: number;
  onClick: () => void;
}) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);
  const isTop3 = rank <= 3;
  const isChampion = rank === 1;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-xl cursor-pointer overflow-hidden transition-all ${
        dt.casinoCard
      } ${isChampion ? dt.neonPulse : ''} ${isTop3 ? dt.casinoGlow : ''} casino-shimmer`}
    >
      {/* Neon accent bar */}
      <div className={dt.casinoBar} />

      {/* Corner accents for top players */}
      {isTop3 && (
        <>
          <div className={`absolute top-0 left-0 ${dt.cornerAccent}`} />
          <div className={`absolute top-0 right-0 rotate-90 ${dt.cornerAccent}`} />
        </>
      )}

      {/* Rank badge — top-right corner */}
      <div className={`absolute top-1.5 right-1.5 z-20 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shadow-lg ${
        rank === 1 ? 'bg-yellow-500 text-white' :
        rank === 2 ? 'bg-gray-400 text-white' :
        rank === 3 ? 'bg-amber-600 text-white' :
        `${dt.bgSubtle} ${dt.text}`
      }`}>
        {rank <= 3 ? (
          rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
        ) : (
          rank
        )}
      </div>

      <div className="relative z-10 p-3 pt-2">
        {/* Large Avatar Circle with Division Gradient */}
        <div className="relative w-16 h-16 mx-auto mb-2.5">
          {/* Glow ring for top players */}
          {isTop3 && (
            <div className={`absolute inset-0 rounded-full ${
              isChampion ? 'bg-yellow-500/20 animate-pulse' : dt.iconBg
            }`} />
          )}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-black relative z-10 shadow-lg ${
            isChampion ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white' :
            isTop3 ? `bg-gradient-to-br ${division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'} text-white` :
            player.tier === 'S' ? 'bg-red-500/10 text-red-500' :
            player.tier === 'A' ? 'bg-yellow-500/10 text-yellow-500' :
            `${dt.iconBg} ${dt.text}`
          }`}>
            {player.gamertag.slice(0, 2).toUpperCase()}
          </div>
          {/* Tier badge on avatar */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
            <TierBadge tier={player.tier} />
          </div>
        </div>

        {/* Player Gamertag — bold and large */}
        <div className="text-center">
          <p className={`text-sm font-black truncate ${
            isChampion ? dt.neonGradient :
            isTop3 ? dt.neonText :
            'text-foreground'
          }`}>
            {player.gamertag}
          </p>

          {/* Club name with Shield icon */}
          {player.club && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Shield className={`w-3 h-3 ${dt.text}`} />
              <span className={`text-[10px] ${dt.text} font-medium truncate`}>{player.club}</span>
            </div>
          )}
        </div>

        {/* Quick Stats Row: Points | Wins | Streak */}
        <div className={`grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t ${dt.borderSubtle}`}>
          <div className="text-center">
            <p className={`text-xs font-bold ${rank <= 3 ? dt.neonText : ''}`}>{player.points}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">PTS</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-green-500">{player.totalWins}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">WINS</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              {player.streak > 1 && <Flame className="w-2.5 h-2.5 text-orange-400" />}
              <span className="text-xs font-bold">{player.streak > 1 ? player.streak : player.totalMvp}</span>
            </div>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">
              {player.streak > 1 ? 'STREAK' : 'MVP'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Enhanced List Row ─── */
function ParticipantListRow({ player, rank, onClick }: {
  player: Player;
  rank: number;
  onClick: () => void;
}) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);
  const isTop3 = rank <= 3;

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border border-transparent hover:${dt.border} hover:${dt.bgSubtle}`}
      onClick={onClick}
    >
      {/* Rank */}
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
        rank === 2 ? 'bg-gray-400/20 text-gray-400' :
        rank === 3 ? 'bg-amber-600/20 text-amber-600' :
        `${dt.bgSubtle} text-muted-foreground`
      }`}>
        {rank}
      </span>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full ${isTop3
        ? 'bg-gradient-to-br ' + (division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light')
        : dt.iconBg
      } flex items-center justify-center text-[11px] font-bold ${isTop3 ? 'text-white' : dt.text} shrink-0 shadow-sm`}>
        {player.gamertag.slice(0, 2).toUpperCase()}
      </div>
      {/* Name & Club */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${isTop3 ? dt.neonText : ''}`}>{player.gamertag}</p>
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

/* ─── Main ParticipantGrid Component ─── */
export function ParticipantGrid({ players, onPlayerClick }: ParticipantGridProps) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /* Filtered players */
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (!searchQuery) return players;
    return players.filter(p =>
      p.gamertag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [players, searchQuery]);

  return (
    <Card className={`${dt.casinoCard} overflow-hidden`}>
      <div className={dt.casinoBar} />
      {/* Header with search + view toggle */}
      <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
        <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
          <Trophy className={`w-3 h-3 ${dt.neonText}`} />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider">Participants</h3>
        <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{filteredPlayers.length} Players</Badge>
      </div>

      {/* Search bar + View toggle */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${dt.borderSubtle}`}>
        <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle}`}>
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search player or club..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        {/* View toggle */}
        <div className={`flex items-center rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} p-0.5`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? `${dt.bg} shadow-sm` : 'text-muted-foreground hover:text-foreground'}`}
            title="Grid view"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? `${dt.bg} shadow-sm` : 'text-muted-foreground hover:text-foreground'}`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid View — Esports Poster Style */}
      {viewMode === 'grid' && (
        <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPlayers.map((p, idx) => (
              <ParticipantCard
                key={p.id}
                player={p}
                rank={idx + 1}
                onClick={() => onPlayerClick(p)}
              />
            ))}
          </div>
          {filteredPlayers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No players found</p>
            </div>
          )}
        </div>
      )}

      {/* List View — Enhanced rows */}
      {viewMode === 'list' && (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-transparent">
            {filteredPlayers.map((p, idx) => (
              <ParticipantListRow
                key={p.id}
                player={p}
                rank={idx + 1}
                onClick={() => onPlayerClick(p)}
              />
            ))}
          </div>
          {filteredPlayers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No players found</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
