'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';

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

/* ========== Single Feed Pill ========== */
function FeedPill({ item }: { item: FeedItem }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/30 bg-background/40 shrink-0">
      <span className="text-xs shrink-0">{item.icon}</span>
      <p className="text-[11px] sm:text-xs font-semibold text-foreground truncate max-w-[160px] sm:max-w-[220px]">
        {item.title}
      </p>
      {item.subtitle && (
        <>
          <span className="text-muted-foreground/30 shrink-0">·</span>
          <p className="text-[10px] text-muted-foreground truncate max-w-[100px] sm:max-w-[140px] hidden md:block">
            {item.subtitle}
          </p>
        </>
      )}
      <span className="text-[9px] text-muted-foreground/50 shrink-0 tabular-nums">
        {formatTimeAgo(item.timestamp)}
      </span>
      {item.division && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: item.division === 'male' ? '#06b6d4' : '#a855f7' }}
        />
      )}
    </div>
  );
}

/* ========== Main MarqueeTicker — 3-item Carousel ========== */
const VISIBLE_COUNT = 3;
const INTERVAL_MS = 7000;

export function MarqueeTicker() {
  const prefersReducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);

  const { data } = useQuery<{ items: FeedItem[] }>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/feed');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const items = useMemo(() => {
    if (data?.items && data.items.length > 0) return data.items;
    return DEMO_ITEMS;
  }, [data?.items]);

  const total = items.length;

  // Auto-advance every 7 seconds, shift by 1
  const goNext = useCallback(() => {
    setOffset(prev => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    if (total <= VISIBLE_COUNT) return;
    const timer = setInterval(goNext, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goNext, total]);

  if (total === 0) return null;

  // Build a window of VISIBLE_COUNT items starting from offset (wrapping)
  const visibleItems: FeedItem[] = [];
  for (let i = 0; i < VISIBLE_COUNT; i++) {
    visibleItems.push(items[(offset + i) % total]);
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="relative flex items-center justify-center min-h-[36px] gap-3 sm:gap-4">
        <motion.div
          key={offset}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-3 sm:gap-4"
        >
          {visibleItems.map((item, i) => (
            <FeedPill key={`${item.id}-${offset + i}`} item={item} />
          ))}
        </motion.div>

        {/* Dot indicators */}
        {total > VISIBLE_COUNT && (
          <div className="absolute right-4 sm:right-8 flex items-center gap-1">
            {items.slice(0, Math.min(total, 8)).map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === offset % Math.min(total, 8)
                    ? 'w-4 h-1 bg-[#d4a853]'
                    : 'w-1 h-1 bg-muted-foreground/25'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
