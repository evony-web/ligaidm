'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { Crown } from 'lucide-react';

/* ─── Match interface ─── */
interface Match {
  id: string;
  score1: number | null;
  score2: number | null;
  status: string;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  mvpPlayer: { id: string; name: string; gamertag: string } | null;
  round?: number;
}

interface BracketViewProps {
  matches: Match[];
  bracketType: 'single_elimination' | 'double_elimination' | 'group_stage' | 'round_robin';
}

/* ─── Round labels ─── */
function getRoundLabel(roundIdx: number, totalRounds: number): string {
  if (totalRounds <= 2) {
    return roundIdx === 0 ? 'Semi Final' : 'Final';
  }
  const fromEnd = totalRounds - 1 - roundIdx;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semi Final';
  if (fromEnd === 2) return 'Quarter Final';
  return `Round ${roundIdx + 1}`;
}

/* ─── Single bracket match card ─── */
function BracketMatchCard({ match, roundIdx }: { match: Match; roundIdx: number }) {
  const dt = useDivisionTheme();
  const hasScore = match.score1 !== null && match.score2 !== null;
  const winner1 = hasScore && match.score1! > match.score2!;
  const winner2 = hasScore && match.score2! > match.score1!;
  const isLive = match.status === 'live' || match.status === 'main_event';
  const isCompleted = match.status === 'completed' || match.status === 'scoring';

  return (
    <div
      className={`bracket-match-card rounded-lg overflow-hidden border ${
        isLive ? `border-red-500/40 ${dt.neonPulse}` :
        isCompleted ? dt.border :
        dt.borderSubtle
      } transition-all hover:shadow-md`}
      style={{ background: 'var(--card-bg, rgba(20,17,10,0.6))' }}
    >
      {/* Team 1 */}
      <div className={`flex items-center px-2.5 py-1.5 border-b ${dt.borderSubtle} ${winner1 ? dt.bgSubtle : ''}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold mr-1.5 shrink-0 ${
          winner1 ? `bg-gradient-to-br ${dt.division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'} text-white` :
          `${dt.iconBg} ${dt.text}`
        }`}>
          {match.team1.name.slice(0, 2).toUpperCase()}
        </div>
        <span className={`text-[11px] font-semibold truncate flex-1 ${winner1 ? dt.neonText : 'text-foreground/80'}`}>
          {match.team1.name || 'TBD'}
        </span>
        <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner1 ? dt.neonText : 'text-muted-foreground'}`}>
          {hasScore ? match.score1 : '-'}
        </span>
      </div>
      {/* Team 2 */}
      <div className={`flex items-center px-2.5 py-1.5 ${winner2 ? dt.bgSubtle : ''}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold mr-1.5 shrink-0 ${
          winner2 ? `bg-gradient-to-br ${dt.division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'} text-white` :
          `${dt.iconBg} ${dt.text}`
        }`}>
          {match.team2.name.slice(0, 2).toUpperCase()}
        </div>
        <span className={`text-[11px] font-semibold truncate flex-1 ${winner2 ? dt.neonText : 'text-foreground/80'}`}>
          {match.team2.name || 'TBD'}
        </span>
        <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner2 ? dt.neonText : 'text-muted-foreground'}`}>
          {hasScore ? match.score2 : '-'}
        </span>
      </div>
      {/* MVP indicator */}
      {match.mvpPlayer && (
        <div className={`flex items-center gap-1 px-2.5 py-1 border-t ${dt.borderSubtle}`}>
          <Crown className="w-2.5 h-2.5 text-yellow-500" />
          <span className="text-[9px] text-yellow-500 font-medium truncate">MVP: {match.mvpPlayer.gamertag}</span>
        </div>
      )}
    </div>
  );
}

/* ─── SVG Connector Line Component ─── */
interface ConnectorPath {
  key: string;
  d: string;
  color: string;
}

function BracketConnectors({ paths }: { paths: ConnectorPath[] }) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          stroke={p.color}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/* ─── Main BracketView Component ─── */
export function BracketView({ matches, bracketType }: BracketViewProps) {
  const dt = useDivisionTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [connectors, setConnectors] = useState<ConnectorPath[]>([]);

  /* Group matches by round — auto-split if all in one round */
  const roundsData = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    const grouped = matches.reduce<Record<number, Match[]>>((acc, m) => {
      const round = m.round ?? 1;
      if (!acc[round]) acc[round] = [];
      acc[round].push(m);
      return acc;
    }, {});

    // If all matches are in a single round, auto-split into bracket rounds
    // (e.g., 4 matches → QF(4) → SF(2) → Final(1), 2 matches → SF(2) → Final(1))
    if (Object.keys(grouped).length === 1 && bracketType !== 'group_stage' && bracketType !== 'round_robin') {
      const allMatches = Object.values(grouped)[0];
      const totalMatches = allMatches.length;

      // Calculate bracket rounds from total matches
      // Total matches in single elim = n-1 where n = number of teams
      // Round 1 = totalMatches/2 (or closest power of 2), each subsequent round = half
      const rounds: { round: number; label: string; matches: Match[] }[] = [];
      let remaining = [...allMatches];
      let roundNum = 1;
      let matchesInRound = Math.pow(2, Math.floor(Math.log2(totalMatches)));

      // If total matches don't fit a power of 2, first round has the remainder
      if (matchesInRound < totalMatches) {
        matchesInRound = totalMatches - matchesInRound / 2;
      }

      while (remaining.length > 0) {
        const roundMatches = remaining.splice(0, Math.max(1, matchesInRound));
        rounds.push({
          round: roundNum,
          label: getRoundLabel(roundNum - 1, Math.ceil(Math.log2(totalMatches + 1))),
          matches: roundMatches.map((m, i) => ({ ...m, round: roundNum })),
        });
        matchesInRound = Math.max(1, Math.floor(matchesInRound / 2));
        roundNum++;
      }

      return rounds;
    }

    const sortedRounds = Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, roundMatches], idx) => ({
        round: idx + 1,
        label: getRoundLabel(idx, Object.keys(grouped).length),
        matches: roundMatches,
      }));

    return sortedRounds;
  }, [matches, bracketType]);

  /* Calculate SVG connector paths after layout */
  const calculateConnectors = useCallback(() => {
    if (!containerRef.current || roundsData.length < 2) {
      setConnectors([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnectors: ConnectorPath[] = [];
    const strokeColor = dt.color; // Hex color from theme

    for (let r = 0; r < roundsData.length - 1; r++) {
      const currentRound = roundsData[r];
      const nextRound = roundsData[r + 1];

      for (let ni = 0; ni < nextRound.matches.length; ni++) {
        const nextMatch = nextRound.matches[ni];
        const nextCardEl = cardRefs.current.get(`round-${r + 1}-match-${nextMatch.id}`);
        if (!nextCardEl) continue;

        const nextRect = nextCardEl.getBoundingClientRect();
        const nextY = nextRect.top + nextRect.height / 2 - containerRect.top;
        const nextX = nextRect.left - containerRect.left;

        // Find the two feeder matches from the current round
        // In a standard bracket: match ni in next round is fed by matches (ni*2) and (ni*2+1) in current round
        const feederIdx1 = ni * 2;
        const feederIdx2 = ni * 2 + 1;
        const feederMatch1 = currentRound.matches[feederIdx1];
        const feederMatch2 = currentRound.matches[feederIdx2];

        if (!feederMatch1 && !feederMatch2) continue;

        const feederEl1 = feederMatch1 ? cardRefs.current.get(`round-${r}-match-${feederMatch1.id}`) : null;
        const feederEl2 = feederMatch2 ? cardRefs.current.get(`round-${r}-match-${feederMatch2.id}`) : null;

        if (!feederEl1 && !feederEl2) continue;

        // Calculate midpoints
        const getY = (el: HTMLDivElement | null) => {
          if (!el) return nextY; // fallback to next match Y
          const rect = el.getBoundingClientRect();
          return rect.top + rect.height / 2 - containerRect.top;
        };

        const getX = (el: HTMLDivElement | null) => {
          if (!el) return nextX;
          const rect = el.getBoundingClientRect();
          return rect.right - containerRect.left;
        };

        const y1 = getY(feederEl1);
        const y2 = getY(feederEl2);
        const x1 = getX(feederEl1);
        const x2 = getX(feederEl2);

        // Midpoint X for the vertical connector
        const midX = nextX - (nextX - Math.max(x1, x2)) / 2;

        // Draw the connector path:
        // From right of feeder1 → horizontal to midX → vertical to feeder2 Y → horizontal to left of next match
        // We draw two separate L-shaped paths that meet at the vertical line

        // Path for feeder 1: right edge → midX → down to next match Y → to left edge of next match
        if (feederEl1) {
          const d1 = `M ${x1} ${y1} H ${midX} V ${nextY} H ${nextX}`;
          newConnectors.push({
            key: `conn-${r}-${ni}-1`,
            d: d1,
            color: strokeColor,
          });
        }

        // Path for feeder 2: right edge → midX → vertical line (just the vertical part from y2 to nextY)
        if (feederEl2 && feederEl1) {
          // The vertical part from y2 is already covered by the first path,
          // but we need the horizontal from feeder2 to midX
          const d2 = `M ${x2} ${y2} H ${midX}`;
          newConnectors.push({
            key: `conn-${r}-${ni}-2`,
            d: d2,
            color: strokeColor,
          });
        } else if (feederEl2 && !feederEl1) {
          const d2 = `M ${x2} ${y2} H ${midX} V ${nextY} H ${nextX}`;
          newConnectors.push({
            key: `conn-${r}-${ni}-2`,
            d: d2,
            color: strokeColor,
          });
        }
      }
    }

    setConnectors(newConnectors);
  }, [roundsData, dt.color]);

  useEffect(() => {
    // Calculate connectors after mount and on resize
    // Use multiple attempts to ensure DOM is ready
    const attempts = [50, 200, 500, 1000];
    const timers = attempts.map(delay => setTimeout(calculateConnectors, delay));
    const handleResize = () => calculateConnectors();
    window.addEventListener('resize', handleResize);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateConnectors]);

  /* Set card ref helper */
  const setCardRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(key, el);
    } else {
      cardRefs.current.delete(key);
    }
  }, []);

  /* ─── Render: Group Stage / Round Robin Table ─── */
  if (bracketType === 'group_stage' || bracketType === 'round_robin') {
    return (
      <div className="space-y-4">
        {roundsData.map((round) => (
          <div key={round.round}>
            <div className={`flex items-center gap-2 mb-2`}>
              <div className={`px-2.5 py-1 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                {round.label}
              </div>
              <div className={`flex-1 h-px ${dt.borderSubtle}`} />
              <span className="text-[9px] text-muted-foreground">{round.matches.length} matches</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {round.matches.map((m) => {
                const hasScore = m.score1 !== null && m.score2 !== null;
                const winner1 = hasScore && m.score1! > m.score2!;
                const winner2 = hasScore && m.score2! > m.score1!;
                const isLive = m.status === 'live' || m.status === 'main_event';
                return (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.01 }}
                    className={`rounded-lg overflow-hidden border ${isLive ? `border-red-500/30 ${dt.neonPulse}` : dt.borderSubtle} transition-all hover:${dt.border}`}
                    style={{ background: 'var(--card-bg, rgba(20,17,10,0.6))' }}
                  >
                    <div className={`flex items-center px-2.5 py-1.5 border-b ${dt.borderSubtle} ${winner1 ? dt.bgSubtle : ''}`}>
                      <span className={`text-[11px] font-semibold truncate flex-1 ${winner1 ? dt.neonText : 'text-foreground/80'}`}>
                        {m.team1.name || 'TBD'}
                      </span>
                      <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner1 ? dt.neonText : 'text-muted-foreground'}`}>
                        {hasScore ? m.score1 : '-'}
                      </span>
                    </div>
                    <div className={`flex items-center px-2.5 py-1.5 ${winner2 ? dt.bgSubtle : ''}`}>
                      <span className={`text-[11px] font-semibold truncate flex-1 ${winner2 ? dt.neonText : 'text-foreground/80'}`}>
                        {m.team2.name || 'TBD'}
                      </span>
                      <span className={`text-xs font-bold tabular-nums w-5 text-right ${winner2 ? dt.neonText : 'text-muted-foreground'}`}>
                        {hasScore ? m.score2 : '-'}
                      </span>
                    </div>
                    {m.mvpPlayer && (
                      <div className={`flex items-center gap-1 px-2.5 py-0.5 border-t ${dt.borderSubtle}`}>
                        <Crown className="w-2.5 h-2.5 text-yellow-500" />
                        <span className="text-[8px] text-yellow-500 truncate">MVP: {m.mvpPlayer.gamertag}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ─── Render: Single/Double Elimination Bracket with SVG Connectors ─── */
  return (
    <div className="relative" ref={containerRef}>
      {/* SVG connector overlay */}
      {connectors.length > 0 && <BracketConnectors paths={connectors} />}

      {/* Bracket columns */}
      <div className="overflow-x-auto custom-scrollbar pb-2 -mx-1">
        <div className="flex gap-8 min-w-max px-1">
          {roundsData.map((round, roundIdx) => {
            // Calculate the gap multiplier for proper bracket spacing
            // Round 0 has normal gap, each subsequent round doubles the gap
            const gapMultiplier = Math.pow(2, roundIdx);
            const gapSize = `${gapMultiplier * 20 + 12}px`;

            return (
              <div key={round.round} className="flex flex-col" style={{ minWidth: '190px' }}>
                {/* Round label */}
                <div className={`text-center mb-3 px-3 py-1.5 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                  {round.label}
                  {roundIdx === roundsData.length - 1 && (
                    <span className="ml-1.5">🏆</span>
                  )}
                </div>
                {/* Match cards with spacing that doubles per round */}
                <div className="flex-1 flex flex-col justify-around" style={{ gap: gapSize }}>
                  {round.matches.map((m, matchIdx) => (
                    <div
                      key={m.id}
                      ref={(el) => setCardRef(`round-${roundIdx}-match-${m.id}`, el)}
                    >
                      <BracketMatchCard match={m} roundIdx={roundIdx} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
