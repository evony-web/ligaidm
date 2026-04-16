'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReducedMotion } from 'framer-motion';
import { Trophy, Gift, Star, UserPlus, ArrowRightLeft } from 'lucide-react';

/* ========== Feed Item Types ========== */
interface FeedItem {
  id: string;
  type: 'transfer' | 'donation' | 'score' | 'champion' | 'mvp' | 'registration';
  icon: string;
  title: string;
  subtitle: string;
  timestamp: string;
  division?: string;
  accent: string;
}

/* ========== Type Icon Map ========== */
const TYPE_CONFIG: Record<FeedItem['type'], { iconEl: React.ReactNode; pulseClass: string }> = {
  transfer: { iconEl: <ArrowRightLeft className="w-3 h-3" />, pulseClass: 'text-purple-400' },
  donation: { iconEl: <Gift className="w-3 h-3" />, pulseClass: 'text-green-400' },
  score: { iconEl: <Trophy className="w-3 h-3" />, pulseClass: 'text-cyan-400' },
  champion: { iconEl: <Trophy className="w-3 h-3" />, pulseClass: 'text-yellow-400' },
  mvp: { iconEl: <Star className="w-3 h-3" />, pulseClass: 'text-yellow-400' },
  registration: { iconEl: <UserPlus className="w-3 h-3" />, pulseClass: 'text-cyan-300' },
};

/* ========== Single Feed Chip ========== */
function FeedChip({ item }: { item: FeedItem }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.score;
  const timeAgo = formatTimeAgo(item.timestamp);

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full glass border border-border/30 shrink-0 hover:border-[#d4a853]/30 transition-colors group cursor-default max-w-md">
      {/* Icon */}
      <span className="text-sm shrink-0">{item.icon}</span>

      {/* Content */}
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
          {item.title}
        </p>
        {item.subtitle && (
          <>
            <span className="text-muted-foreground/40 shrink-0">·</span>
            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
              {item.subtitle}
            </p>
          </>
        )}
      </div>

      {/* Time */}
      <span className="text-[9px] text-muted-foreground/50 shrink-0 tabular-nums">{timeAgo}</span>

      {/* Division dot */}
      {item.division && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: item.division === 'male' ? '#06b6d4' : '#a855f7' }}
        />
      )}
    </div>
  );
}

/* ========== Time Formatter ========== */
function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Baru';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}j`;
  if (days < 7) return `${days}h`;
  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/* ========== Fallback Demo Items (shown when no data) ========== */
const DEMO_ITEMS: FeedItem[] = [
  { id: 'demo-1', type: 'champion', icon: '🏆', title: 'Team Alpha Juara Week 5!', subtitle: 'Male Division', timestamp: new Date().toISOString(), division: 'male', accent: '#d4a853' },
  { id: 'demo-2', type: 'donation', icon: '💰', title: 'CommunityPartner menyawer Rp500rb', subtitle: 'Donasi Weekly', timestamp: new Date().toISOString(), accent: '#22c55e' },
  { id: 'demo-3', type: 'score', icon: '⚽', title: 'Club A 3–1 Club B', subtitle: 'Week 5 • Club A menang!', timestamp: new Date().toISOString(), division: 'male', accent: '#06b6d4' },
  { id: 'demo-4', type: 'mvp', icon: '⭐', title: 'Dancer_X MVP Week 5!', subtitle: 'Male Division', timestamp: new Date().toISOString(), division: 'male', accent: '#eab308' },
  { id: 'demo-5', type: 'transfer', icon: '🔄', title: 'StarPlayer pindah ke Club C', subtitle: 'Dari Club A → Club C', timestamp: new Date().toISOString(), division: 'female', accent: '#a855f7' },
  { id: 'demo-6', type: 'registration', icon: '🆕', title: 'NewDancer mendaftar sebagai pemain', subtitle: 'Female Division', timestamp: new Date().toISOString(), division: 'female', accent: '#22d3ee' },
  { id: 'demo-7', type: 'donation', icon: '💰', title: 'AnonDonor menyawer Rp1jt', subtitle: 'Donasi Season', timestamp: new Date().toISOString(), accent: '#22c55e' },
  { id: 'demo-8', type: 'champion', icon: '🏆', title: 'Team Omega Juara Week 4!', subtitle: 'Female Division', timestamp: new Date().toISOString(), division: 'female', accent: '#d4a853' },
];

/* ========== Marquee Row (single direction) ========== */
function MarqueeRow({ items, speed = 40, reverse = false }: {
  items: FeedItem[];
  speed?: number;
  reverse?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const duration = Math.max(20, items.length * speed / 10);

  return (
    <div className="flex overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />

      {/* Scrolling track — duplicated for seamless loop */}
      <div
        className="flex gap-3 shrink-0"
        style={{
          animationName: reverse ? 'marquee-scroll-reverse' : 'marquee-scroll',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: prefersReducedMotion ? 'paused' : 'running',
        }}
      >
        {items.map(item => <FeedChip key={item.id} item={item} />)}
        {/* Duplicate for seamless loop */}
        {items.map(item => <FeedChip key={`${item.id}-dup`} item={item} />)}
      </div>
    </div>
  );
}

/* ========== Main MarqueeTicker Component ========== */
export function MarqueeTicker() {
  const { data, isLoading } = useQuery<{ items: FeedItem[] }>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/feed');
      return res.json();
    },
    refetchInterval: 30000, // refresh every 30s
  });

  const items = useMemo(() => {
    if (data?.items && data.items.length > 0) return data.items;
    return DEMO_ITEMS;
  }, [data?.items]);

  return (
    <div className="w-full overflow-hidden relative">
      {/* Single full-width banner row */}
      <MarqueeRow items={items} speed={35} reverse={false} />
    </div>
  );
}
