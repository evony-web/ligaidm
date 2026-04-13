'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Trophy, Swords, Users, Shield, Crown, Flame,
  Gamepad2, ChevronRight, Star, Zap, Gift, TrendingUp,
  ArrowRight, Sparkles, Target, ChevronDown, Play,
  Medal, Clock, Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { useState, useRef, useMemo, type ReactNode } from 'react';

interface StatsData {
  hasData: boolean;
  division: string;
  season: { id: string; name: string; number: number; status: string };
  topPlayers: { id: string; name: string; gamertag: string; tier: string; points: number; totalWins: number; streak: number; maxStreak: number; totalMvp: number; matches: number; club?: string }[];
  totalPlayers: number;
  totalPrizePool: number;
  seasonDonationTotal: number;
  clubs: { id: string; name: string; wins: number; losses: number; points: number; gameDiff: number }[];
  recentMatches: { id: string; score1: number; score2: number; club1: { name: string }; club2: { name: string }; week: number }[];
  seasonProgress: { totalWeeks: number; completedWeeks: number; percentage: number };
  topDonors: { donorName: string; totalAmount: number; donationCount: number }[];
  tournaments: { id: string; name: string; weekNumber: number; status: string; prizePool: number }[];
}

/* ========== Animation Variants ========== */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
};

const fadeDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const staggerFast = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

/* ========== Scroll-triggered Section Wrapper ========== */
function AnimatedSection({ children, className = '', variant = 'fadeUp' }: {
  children: ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const variants = { fadeUp, fadeLeft, fadeRight, scaleIn };
  const selected = variants[variant] || fadeUp;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={selected}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ========== Section Header Component ========== */
function SectionHeader({ icon: Icon, label, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div variants={fadeUp} className="text-center mb-14">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#d4a853]" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a853]/20 bg-[#d4a853]/5">
          <Icon className="w-4 h-4 text-[#d4a853]" />
          <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em]">{label}</span>
        </div>
        <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#d4a853]" />
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-champion">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}

/* ========== Parallax Stats Counter ========== */
function StatCard({ icon: Icon, value, label, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative p-5 rounded-2xl glass border-0 card-shine card-border-glow text-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,168,83,0.15)]">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[#d4a853]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-[#d4a853]" />
        </div>
        <p className="text-xl sm:text-2xl font-black text-gradient-fury">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

export function LandingPage() {
  const { setCurrentView, setDivision } = useAppStore();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] & { division?: string } | null>(null);
  const [selectedClub, setSelectedClub] = useState<(StatsData['clubs'][0] & { division?: string }) | null>(null);

  /* ========== Parallax Refs ========== */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const contentY = useTransform(heroScroll, [0, 1], ['0%', '20%']);

  /* ========== Data Queries ========== */
  const { data: maleData } = useQuery<StatsData>({
    queryKey: ['stats', 'male'],
    queryFn: async () => { const res = await fetch('/api/stats?division=male'); return res.json(); },
  });

  const { data: femaleData } = useQuery<StatsData>({
    queryKey: ['stats', 'female'],
    queryFn: async () => { const res = await fetch('/api/stats?division=female'); return res.json(); },
  });

  const enterApp = (division: 'male' | 'female') => {
    setDivision(division);
    setCurrentView('dashboard');
  };

  const maleTop3 = maleData?.topPlayers?.slice(0, 3) || [];
  const femaleTop3 = femaleData?.topPlayers?.slice(0, 3) || [];
  const maleTopClub = maleData?.clubs?.[0];
  const femaleTopClub = femaleData?.clubs?.[0];

  /* ========== Floating Particles ========== */
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 1.5 + Math.random() * 3,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 15,
      opacity: 0.2 + Math.random() * 0.5,
      alt: i % 3 === 0,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden landing-scroll">

      {/* ========== HERO SECTION — Cinematic Parallax ========== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Multi-layer Parallax Background */}
        <motion.div className="absolute inset-0 hidden sm:block" style={{ y: heroY, scale: heroScale }}>
          <img src="/bg-default.jpg" alt="" className="w-full h-[130%] object-cover" aria-hidden="true" />
        </motion.div>
        <motion.div className="absolute inset-0 sm:hidden" style={{ y: heroY, scale: heroScale }}>
          <img src="/bg-mobiledefault.jpg" alt="" className="w-full h-[130%] object-cover" aria-hidden="true" />
        </motion.div>

        {/* Gradient Overlays — Multiple layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(212,168,83,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Ambient Orbit Light */}
        <div className="ambient-light" style={{ top: '30%', left: '20%' }} />
        <div className="ambient-light" style={{ top: '60%', right: '10%', animationDelay: '-10s', animationDuration: '25s' }} />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {particles.map((p) => (
            <div
              key={p.id}
              className={p.alt ? 'particle-alt' : 'particle'}
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" style={{ opacity: heroOpacity, y: contentY }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Logo with Ring Pulse */}
            <motion.div variants={scaleIn} className="mb-8">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 rounded-2xl glow-champion" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden card-champion">
                  <img src="/logo.webp" alt="IDM League" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>

            {/* Title with staggered letter animation */}
            <motion.div variants={fadeUp}>
              <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-gradient-fury mb-3 leading-[0.9]">
                IDM League
              </h1>
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.15em' }}
                transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-[#e8d5a3] font-light tracking-[0.15em] uppercase"
              >
                Idol Meta Fan Made Edition
              </motion.p>
            </motion.div>

            {/* Animated Badges */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-2.5 mt-6 flex-wrap">
              {[
                { text: 'Season 1', glow: true },
                { text: 'Premium Esports', glow: false },
                { text: 'MPL-Style', glow: false },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1 + i * 0.15, type: 'spring', stiffness: 200 }}
                >
                  <Badge className={`bg-[#d4a853]/10 text-[#d4a853] text-xs border border-[#d4a853]/20 px-4 py-2 ${badge.glow ? 'glow-pulse' : ''}`}>
                    {badge.text}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-10 mt-8 leading-relaxed">
              Platform esports premium dengan sistem tournament mingguan, liga profesional MPL-style,
              matchmaking cerdas, dan komunitas yang kompetitif.
            </motion.p>

            {/* Division Entry Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#d4a853] to-[#c9a84c] hover:from-[#c9a84c] hover:to-[#b8963d] text-[#0a0a14] px-10 py-7 text-base font-bold rounded-2xl gold-glow transition-all"
                  onClick={() => enterApp('male')}
                >
                  <Swords className="w-5 h-5 mr-2" />
                  Male Division
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#d4a853]/30 text-[#e8d5a3] hover:bg-[#d4a853]/10 px-10 py-7 text-base font-bold rounded-2xl transition-all"
                  onClick={() => enterApp('female')}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Female Division
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Quick Stats — Animated Counters */}
            <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <StatCard icon={Users} value={`${maleData?.totalPlayers || 18}+`} label="Players" delay={0} />
              <StatCard icon={Trophy} value="12" label="Clubs" delay={0.1} />
              <StatCard icon={Wallet} value={formatCurrency(maleData?.totalPrizePool || 0)} label="Prize Pool" delay={0.2} />
              <StatCard icon={Clock} value="8" label="Weeks/Season" delay={0.3} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-[#d4a853]/50 uppercase tracking-[0.3em] font-semibold">Explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-[#d4a853]/20 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-[#d4a853]/60"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== WAVE DIVIDER ========== */}
      <div className="wave-divider" />

      {/* ========== SCROLLING CHAMPION MARQUEE ========== */}
      <section className="py-5 overflow-hidden border-y border-[#d4a853]/10 bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 gap-4 pr-4">
              {maleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`m-${setIdx}-${p.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4a853]/10 bg-[#0d0d1a]/30 dark:bg-[#0d0d1a]/60 interactive-scale">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-[#d4a853] font-bold">{p.points}pts</span>
                </div>
              ))}
              {femaleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`f-${setIdx}-${p.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4a853]/10 bg-[#0d0d1a]/30 dark:bg-[#0d0d1a]/60 interactive-scale">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-[#d4a853] font-bold">{p.points}pts</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ========== CHAMPIONS BANNER — Cinematic Cards ========== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.06]" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        {/* Ambient lights */}
        <div className="ambient-light" style={{ top: '20%', left: '10%', animationDuration: '18s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <SectionHeader icon={Crown} label="Hall of Champions" title="Season Champions" subtitle="Top performers across both divisions" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* MALE CHAMPIONS */}
              <motion.div variants={fadeLeft} className="perspective-container">
                <Card className="perspective-card card-premium glow-gold overflow-hidden group card-shine">
                  <CardContent className="p-0">
                    {/* Division Header */}
                    <div className="relative img-zoom h-32">
                      <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/60 to-[#0d0d1a]/30 dark:from-background dark:via-background/60 dark:to-background/30" />
                      <div className="absolute inset-0 flex items-center justify-between px-5">
                        <div className="flex items-center gap-2">
                          <Swords className="w-5 h-5 text-[#d4a853]" />
                          <h3 className="text-sm font-bold text-[#d4a853]">MALE DIVISION</h3>
                        </div>
                        <Badge className="bg-[#d4a853]/20 text-[#d4a853] text-[10px] border border-[#d4a853]/30">Active</Badge>
                      </div>
                    </div>

                    {/* Top Club */}
                    {maleTopClub && (
                      <div className="p-5 border-b border-[#d4a853]/10 cursor-pointer interactive-scale" onClick={() => setSelectedClub({ ...maleTopClub, division: 'male' })}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#d4a853]/10 flex items-center justify-center glow-champion">
                            <Trophy className="w-7 h-7 text-[#d4a853]" />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#d4a853] font-semibold uppercase tracking-wider">League Champion</p>
                            <p className="text-xl font-bold text-gradient-gold">{maleTopClub.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="text-green-500 font-semibold">{maleTopClub.wins}W</span>
                              <span>-</span>
                              <span className="text-red-500 font-semibold">{maleTopClub.losses}L</span>
                              <span className="text-[#d4a853]/40">|</span>
                              <span className="text-[#d4a853] font-bold">{maleTopClub.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top 3 Players Podium */}
                    <div className="p-5">
                      <p className="text-[10px] font-semibold text-[#e8d5a3]/50 mb-4 uppercase tracking-wider">Top Players</p>
                      <div className="flex items-end justify-center gap-4">
                        {maleTop3[1] && (
                          <div className="text-center flex-1 cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...maleTop3[1], division: 'male' })}>
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-400/10 border-2 border-gray-400/30 flex items-center justify-center text-sm font-bold text-gray-400 mb-2">
                              {maleTop3[1].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{maleTop3[1].gamertag}</p>
                            <TierBadge tier={maleTop3[1].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{maleTop3[1].points} pts</p>
                            <div className="mt-2 h-16 bg-gray-400/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-xl font-black text-gray-400">2</span>
                            </div>
                          </div>
                        )}
                        {maleTop3[0] && (
                          <div className="text-center flex-1 cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...maleTop3[0], division: 'male' })}>
                            <div className="relative">
                              <Crown className="w-6 h-6 text-[#d4a853] mx-auto mb-1 animate-float" />
                              <div className="w-20 h-20 mx-auto rounded-full bg-[#d4a853]/10 border-2 border-[#d4a853]/30 flex items-center justify-center text-lg font-bold text-[#d4a853] glow-champion">
                                {maleTop3[0].gamertag.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <p className="text-sm font-bold truncate mt-2 text-gradient-champion">{maleTop3[0].gamertag}</p>
                            <TierBadge tier={maleTop3[0].tier} />
                            <p className="text-xs text-[#d4a853] font-bold mt-0.5">{maleTop3[0].points} pts</p>
                            <div className="mt-2 h-24 bg-[#d4a853]/10 rounded-t-lg flex items-center justify-center border border-[#d4a853]/10">
                              <span className="text-3xl font-black text-gradient-gold">1</span>
                            </div>
                          </div>
                        )}
                        {maleTop3[2] && (
                          <div className="text-center flex-1 cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...maleTop3[2], division: 'male' })}>
                            <div className="w-14 h-14 mx-auto rounded-full bg-amber-600/10 border-2 border-amber-600/30 flex items-center justify-center text-sm font-bold text-amber-600 mb-2">
                              {maleTop3[2].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{maleTop3[2].gamertag}</p>
                            <TierBadge tier={maleTop3[2].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{maleTop3[2].points} pts</p>
                            <div className="mt-2 h-12 bg-amber-600/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-xl font-black text-amber-600">3</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* FEMALE CHAMPIONS */}
              <motion.div variants={fadeRight} className="perspective-container">
                <Card className="perspective-card card-premium glow-amber overflow-hidden group card-shine">
                  <CardContent className="p-0">
                    <div className="relative img-zoom h-32">
                      <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/60 to-[#0d0d1a]/30 dark:from-background dark:via-background/60 dark:to-background/30" />
                      <div className="absolute inset-0 flex items-center justify-between px-5">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#e8d5a3]" />
                          <h3 className="text-sm font-bold text-[#e8d5a3]">FEMALE DIVISION</h3>
                        </div>
                        <Badge className="bg-[#d4a853]/20 text-[#e8d5a3] text-[10px] border border-[#d4a853]/30">Active</Badge>
                      </div>
                    </div>
                    {femaleTopClub && (
                      <div className="p-5 border-b border-[#d4a853]/10 cursor-pointer interactive-scale" onClick={() => setSelectedClub({ ...femaleTopClub, division: 'female' })}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#d4a853]/10 flex items-center justify-center glow-champion">
                            <Trophy className="w-7 h-7 text-[#d4a853]" />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#d4a853] font-semibold uppercase tracking-wider">League Champion</p>
                            <p className="text-xl font-bold text-gradient-gold">{femaleTopClub.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="text-green-500 font-semibold">{femaleTopClub.wins}W</span>
                              <span>-</span>
                              <span className="text-red-500 font-semibold">{femaleTopClub.losses}L</span>
                              <span className="text-[#d4a853]/40">|</span>
                              <span className="text-[#d4a853] font-bold">{femaleTopClub.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-[10px] font-semibold text-[#e8d5a3]/50 mb-4 uppercase tracking-wider">Top Players</p>
                      <div className="flex items-end justify-center gap-4">
                        {femaleTop3[1] && (
                          <div className="text-center flex-1 cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...femaleTop3[1], division: 'female' })}>
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-400/10 border-2 border-gray-400/30 flex items-center justify-center text-sm font-bold text-gray-400 mb-2">
                              {femaleTop3[1].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{femaleTop3[1].gamertag}</p>
                            <TierBadge tier={femaleTop3[1].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{femaleTop3[1].points} pts</p>
                            <div className="mt-2 h-16 bg-gray-400/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-xl font-black text-gray-400">2</span>
                            </div>
                          </div>
                        )}
                        {femaleTop3[0] && (
                          <div className="text-center flex-1 cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...femaleTop3[0], division: 'female' })}>
                            <div className="relative">
                              <Crown className="w-6 h-6 text-[#d4a853] mx-auto mb-1 animate-float" />
                              <div className="w-20 h-20 mx-auto rounded-full bg-[#d4a853]/10 border-2 border-[#d4a853]/30 flex items-center justify-center text-lg font-bold text-[#d4a853] glow-champion">
                                {femaleTop3[0].gamertag.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <p className="text-sm font-bold truncate mt-2 text-gradient-champion">{femaleTop3[0].gamertag}</p>
                            <TierBadge tier={femaleTop3[0].tier} />
                            <p className="text-xs text-[#d4a853] font-bold mt-0.5">{femaleTop3[0].points} pts</p>
                            <div className="mt-2 h-24 bg-[#d4a853]/10 rounded-t-lg flex items-center justify-center border border-[#d4a853]/10">
                              <span className="text-3xl font-black text-gradient-gold">1</span>
                            </div>
                          </div>
                        )}
                        {femaleTop3[2] && (
                          <div className="text-center flex-1 cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...femaleTop3[2], division: 'female' })}>
                            <div className="w-14 h-14 mx-auto rounded-full bg-amber-600/10 border-2 border-amber-600/30 flex items-center justify-center text-sm font-bold text-amber-600 mb-2">
                              {femaleTop3[2].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{femaleTop3[2].gamertag}</p>
                            <TierBadge tier={femaleTop3[2].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{femaleTop3[2].points} pts</p>
                            <div className="mt-2 h-12 bg-amber-600/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-xl font-black text-amber-600">3</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SECTION DIVIDER ========== */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* ========== FEATURES SECTION — Creative Card Shapes ========== */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-mesh-fury opacity-50" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <SectionHeader icon={Sparkles} label="Platform Features" title="Built for Champions" subtitle="Every feature designed to elevate competitive gaming" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Swords, title: 'Weekly Tournament', desc: '1 tournament per week per division. Solo registration, auto-balanced teams, 1 main event match.', color: 'from-[#d4a853] to-[#b8860b]', badge: 'Weekly', shape: 'card-tilt' },
                { icon: Trophy, title: 'IDM League', desc: 'MPL-style round robin with BO3 format. Club-based competition with playoffs and grand final.', color: 'from-[#e8d5a3] to-[#d4a853]', badge: 'Pro', shape: 'card-tilt' },
                { icon: Zap, title: 'Smart Matchmaking', desc: 'Snake draft system with S+A+B tier balancing. Auto-swap if power imbalance detected.', color: 'from-amber-500 to-amber-600', badge: 'AI', shape: 'card-tilt' },
                { icon: TrendingUp, title: 'Seasonal Ranking', desc: 'Win +2pts, MVP based on prize, participation +10, streak bonuses up to +30.', color: 'from-green-500 to-green-600', badge: 'Live', shape: 'card-tilt' },
                { icon: Gift, title: 'Donation & Sawer', desc: 'Live prize pool tracker, top contributors, real-time donation notifications.', color: 'from-pink-500 to-pink-600', badge: 'New', shape: 'card-tilt' },
                { icon: Shield, title: 'Full Admin Panel', desc: 'Approve players, assign tiers, generate teams, input scores, distribute points.', color: 'from-[#d97706] to-[#b45309]', badge: 'Admin', shape: 'card-tilt' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group"
                >
                  <div className={`${f.shape} card-shine card-border-glow relative bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-2xl overflow-hidden h-full transition-all duration-500 hover:border-[#d4a853]/30 hover:shadow-[0_0_40px_rgba(212,168,83,0.12)]`}>
                    {/* Gradient Top Bar */}
                    <div className={`h-1 bg-gradient-to-r ${f.color}`} />

                    {/* Image area with gradient overlay */}
                    <div className="relative img-zoom h-36">
                      <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/95 via-[#0d0d1a]/60 to-[#0d0d1a]/20 dark:from-[#0d0d1a] dark:via-[#0d0d1a]/60 dark:to-[#0d0d1a]/30" />
                      <Badge className="absolute top-3 right-3 bg-[#d4a853]/20 text-[#d4a853] text-[10px] border border-[#d4a853]/30 backdrop-blur-sm">{f.badge}</Badge>
                      <div className={`absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                        <f.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold mb-2 group-hover:text-[#d4a853] transition-colors">{f.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS — Animated Timeline ========== */}
      <section className="relative py-24 px-4 bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/30 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.06]" aria-hidden="true" />
        </div>

        {/* Ambient light */}
        <div className="ambient-light" style={{ top: '40%', right: '5%', animationDuration: '22s' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <SectionHeader icon={Target} label="Tournament Flow" title="How It Works" />

            <div className="relative">
              {/* Animated Vertical Line */}
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute left-5 sm:left-7 top-0 w-0.5 bg-gradient-to-b from-[#d4a853] via-[#d4a853]/50 to-[#d4a853]/10"
              />

              <div className="space-y-8">
                {[
                  { step: '01', title: 'Register', desc: 'Solo registration for weekly tournament', icon: Users, color: 'bg-[#d4a853]/10 text-[#d4a853]', ring: 'border-[#d4a853]/40' },
                  { step: '02', title: 'Get Approved', desc: 'Admin assigns your tier (S / A / B)', icon: Star, color: 'bg-[#e8d5a3]/10 text-[#e8d5a3]', ring: 'border-[#e8d5a3]/40' },
                  { step: '03', title: 'Team Up', desc: 'Auto-balanced teams with S+A+B composition', icon: Gamepad2, color: 'bg-green-500/10 text-green-500', ring: 'border-green-500/40' },
                  { step: '04', title: 'Compete', desc: '1 main event match per week', icon: Swords, color: 'bg-red-500/10 text-red-500', ring: 'border-red-500/40' },
                  { step: '05', title: 'Win & Rank', desc: 'Earn points, climb leaderboard, become MVP', icon: Crown, color: 'bg-[#d4a853]/10 text-[#d4a853]', ring: 'border-[#d4a853]/40' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="relative flex items-start gap-5 sm:gap-6"
                  >
                    {/* Animated Circle */}
                    <div className="relative z-10 shrink-0">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#0d0d1a] dark:bg-[#0a0a14] border-2 ${s.ring} flex items-center justify-center glow-champion`}
                      >
                        <span className="text-sm sm:text-base font-black text-[#d4a853]">{s.step}</span>
                      </motion.div>
                    </div>

                    {/* Card with clip-corner shape */}
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex-1 bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-[#d4a853]/30 hover:shadow-[0_0_25px_rgba(212,168,83,0.1)] card-shine"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">{s.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SECTION DIVIDER ========== */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* ========== TOP LEADERBOARD — Glass Cards ========== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-fury opacity-30" />
        <div className="ambient-light" style={{ top: '30%', left: '5%', animationDuration: '25s' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <SectionHeader icon={Flame} label="Rankings" title="Leaderboard" subtitle="Current season standings" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Male Leaderboard */}
              <motion.div variants={fadeLeft}>
                <Card className="bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-2xl overflow-hidden backdrop-blur-sm card-shine">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#d4a853]/10 to-transparent border-b border-[#d4a853]/10">
                      <Swords className="w-4 h-4 text-[#d4a853]" />
                      <span className="text-xs font-bold text-[#d4a853] uppercase tracking-wider">Male Division</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {maleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 cursor-pointer interactive-scale hover:bg-[#d4a853]/5 hover:shadow-[0_0_15px_rgba(212,168,83,0.08)]"
                          onClick={() => setSelectedPlayer({ ...p, division: 'male' })}
                        >
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0 ? 'bg-[#d4a853]/20 text-[#d4a853] glow-champion' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {idx === 0 ? '👑' : idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-[#d4a853]/10 flex items-center justify-center text-[10px] font-bold text-[#d4a853] shrink-0">
                            {p.gamertag.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p.gamertag}</span>
                              <TierBadge tier={p.tier} />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#d4a853]">{p.points}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">pts</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Female Leaderboard */}
              <motion.div variants={fadeRight}>
                <Card className="bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-2xl overflow-hidden backdrop-blur-sm card-shine">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#e8d5a3]/10 to-transparent border-b border-[#e8d5a3]/10">
                      <Shield className="w-4 h-4 text-[#e8d5a3]" />
                      <span className="text-xs font-bold text-[#e8d5a3] uppercase tracking-wider">Female Division</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {femaleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 cursor-pointer interactive-scale hover:bg-[#d4a853]/5 hover:shadow-[0_0_15px_rgba(212,168,83,0.08)]"
                          onClick={() => setSelectedPlayer({ ...p, division: 'female' })}
                        >
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0 ? 'bg-[#d4a853]/20 text-[#d4a853] glow-champion' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {idx === 0 ? '👑' : idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-[#e8d5a3]/10 flex items-center justify-center text-[10px] font-bold text-[#e8d5a3] shrink-0">
                            {p.gamertag.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p.gamertag}</span>
                              <TierBadge tier={p.tier} />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#e8d5a3]">{p.points}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">pts</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION — Dramatic Reveal ========== */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover opacity-[0.04] dark:opacity-[0.08]" aria-hidden="true" />
        </div>

        {/* Dramatic radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[#d4a853]/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a853]/5 via-transparent to-[#e8d5a3]/5" />

        {/* Ambient lights */}
        <div className="ambient-light" style={{ top: '10%', left: '15%', animationDuration: '16s' }} />
        <div className="ambient-light" style={{ bottom: '10%', right: '15%', animationDuration: '20s', animationDelay: '-8s' }} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <motion.div variants={scaleIn}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-12 h-12 text-[#d4a853]" />
            </motion.div>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-gradient-champion mb-5">
            Ready to Compete?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
            Join the arena. Register for weekly tournaments, climb the leaderboard, and become the next IDM League champion.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4a853] to-[#c9a84c] hover:from-[#c9a84c] hover:to-[#b8963d] text-[#0a0a14] px-10 py-7 text-base font-bold rounded-2xl gold-glow transition-all"
                onClick={() => enterApp('male')}
              >
                Enter Male Division
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#d4a853]/30 text-[#e8d5a3] hover:bg-[#d4a853]/10 px-10 py-7 text-base font-bold rounded-2xl transition-all"
                onClick={() => enterApp('female')}
              >
                Enter Female Division
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 px-4 border-t border-[#d4a853]/10 text-center bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/logo1.webp" alt="IDM" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-lg text-gradient-fury font-bold">IDM League</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Idol Meta Fan Made Edition — Premium Esports Platform</p>
            <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground flex-wrap">
              <span>Weekly Tournaments</span>
              <span className="text-[#d4a853]/30">|</span>
              <span>MPL-Style League</span>
              <span className="text-[#d4a853]/30">|</span>
              <span>Smart Matchmaking</span>
              <span className="text-[#d4a853]/30">|</span>
              <span>Donation System</span>
            </div>
            <div className="section-divider max-w-xs mx-auto" />
            <p className="text-[10px] text-muted-foreground/50">&copy; 2025 IDM League. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          rank={((selectedPlayer.division === 'male' ? maleData : femaleData)?.topPlayers?.findIndex(p => p.id === selectedPlayer.id) ?? -1) + 1}
        />
      )}

      {/* Club Profile Modal */}
      {selectedClub && (
        <ClubProfile
          club={{
            ...selectedClub,
            rank: (selectedClub.division === 'male' ? maleData : femaleData)?.clubs?.findIndex(c => c.id === selectedClub.id) + 1,
          }}
          onClose={() => setSelectedClub(null)}
          rank={(selectedClub.division === 'male' ? maleData : femaleData)?.clubs?.findIndex(c => c.id === selectedClub.id) + 1}
        />
      )}
    </div>
  );
}
