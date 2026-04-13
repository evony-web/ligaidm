'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Trophy, Swords, Users, Shield, Crown, Flame,
  Gamepad2, ChevronRight, Star, Zap, Gift, TrendingUp,
  ArrowRight, Sparkles, Target, ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { useState, useRef, useMemo } from 'react';

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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

/* ========== Section Header Component ========== */
function SectionHeader({ icon: Icon, label, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div variants={fadeUp} className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#d4a853]" />
        <Icon className="w-5 h-5 text-[#d4a853]" />
        <span className="text-xs font-semibold text-[#d4a853] uppercase tracking-[0.2em]">{label}</span>
        <Icon className="w-5 h-5 text-[#d4a853]" />
        <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#d4a853]" />
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-champion">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{subtitle}</p>}
    </motion.div>
  );
}

export function LandingPage() {
  const { setCurrentView, setDivision } = useAppStore();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] & { division?: string } | null>(null);
  const [selectedClub, setSelectedClub] = useState<(StatsData['clubs'][0] & { division?: string }) | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

  /* ========== Generate Floating Particles ========== */
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      opacity: 0.3 + Math.random() * 0.5,
      alt: i % 2 === 0,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">

      {/* ========== HERO SECTION — Premium Parallax ========== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background - Desktop */}
        <motion.div className="absolute inset-0 hidden sm:block" style={{ y: heroY }}>
          <img src="/bg-default.jpg" alt="" className="w-full h-[120%] object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </motion.div>
        {/* Parallax Background - Mobile */}
        <motion.div className="absolute inset-0 sm:hidden" style={{ y: heroY }}>
          <img src="/bg-mobiledefault.jpg" alt="" className="w-full h-[120%] object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/70" />
        </motion.div>

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
        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" style={{ opacity: heroOpacity }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Logo */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="w-24 h-24 mx-auto mb-5 rounded-2xl overflow-hidden glow-champion card-champion">
                <img src="/logo.webp" alt="IDM League" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={fadeUp}>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-gradient-fury mb-2">
                IDM League
              </h1>
              <p className="text-lg sm:text-xl text-[#e8d5a3] font-light tracking-wide">
                Idol Meta Fan Made Edition
              </p>
            </motion.div>

            {/* Badges */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <Badge className="bg-[#d4a853]/10 text-[#d4a853] text-xs border border-[#d4a853]/20 px-3 py-1.5 glow-pulse">
                Season 1
              </Badge>
              <Badge className="bg-[#d4a853]/10 text-[#e8d5a3] text-xs border border-[#d4a853]/20 px-3 py-1.5">
                Premium Esports
              </Badge>
              <Badge className="bg-[#d4a853]/10 text-[#d4a853] text-xs border border-[#d4a853]/20 px-3 py-1.5">
                MPL-Style
              </Badge>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-10 mt-6 leading-relaxed">
              Platform esports premium dengan sistem tournament mingguan, liga profesional MPL-style,
              matchmaking cerdas, dan komunitas yang kompetitif.
            </motion.p>

            {/* Division Entry Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4a853] to-[#c9a84c] hover:from-[#c9a84c] hover:to-[#b8963d] text-[#0a0a14] px-8 py-6 text-base font-bold rounded-xl gold-glow transition-all hover:scale-105"
                onClick={() => enterApp('male')}
              >
                <Swords className="w-5 h-5 mr-2" />
                Male Division
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#d4a853]/30 text-[#e8d5a3] hover:bg-[#d4a853]/10 px-8 py-6 text-base font-bold rounded-xl transition-all hover:scale-105"
                onClick={() => enterApp('female')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Female Division
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeUp} className="mt-12 grid grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto">
              {[
                { value: `${maleData?.totalPlayers || 18}+`, label: 'Players' },
                { value: '12', label: 'Clubs' },
                { value: formatCurrency(maleData?.totalPrizePool || 0), label: 'Prize Pool' },
                { value: '8', label: 'Weeks/Season' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 rounded-xl glass border-0 card-glow-hover interactive-scale">
                  <p className="text-base sm:text-lg font-bold text-gradient-fury">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator - Premium Bounce */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="bounce-slow flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#d4a853]/60 uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5 text-[#d4a853]/60" />
          </div>
        </motion.div>
      </section>

      {/* ========== SCROLLING CHAMPION MARQUEE ========== */}
      <section className="py-4 overflow-hidden border-y border-[#d4a853]/10 bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 gap-6 pr-6">
              {maleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`m-${setIdx}-${p.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d4a853]/10 bg-[#0d0d1a]/30 dark:bg-[#0d0d1a]/60 interactive-scale">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-[#d4a853] font-bold">{p.points}pts</span>
                  <Swords className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
              {femaleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`f-${setIdx}-${p.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d4a853]/10 bg-[#0d0d1a]/30 dark:bg-[#0d0d1a]/60 interactive-scale">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-[#d4a853] font-bold">{p.points}pts</span>
                  <Shield className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ========== CHAMPIONS BANNER — 3D Perspective Cards ========== */}
      <section className="relative py-20 overflow-hidden">
        {/* Section Background Pattern */}
        <div className="absolute inset-0">
          <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover opacity-[0.04] dark:opacity-[0.08]" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <SectionHeader icon={Crown} label="Hall of Champions" title="Season Champions" subtitle="Top performers across both divisions" />

            {/* Two Division Champions Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* MALE CHAMPIONS */}
              <motion.div variants={fadeUp} className="perspective-container">
                <Card className="perspective-card card-premium glow-gold overflow-hidden group">
                  <CardContent className="p-0">
                    {/* Division Header with Image Area */}
                    <div className="relative img-zoom h-28">
                      <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/60 to-[#0d0d1a]/30 dark:from-background dark:via-background/60 dark:to-background/30" />
                      <div className="absolute inset-0 flex items-center justify-between px-5">
                        <div className="flex items-center gap-2">
                          <Swords className="w-4 h-4 text-[#d4a853]" />
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
                        {/* 2nd Place */}
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

                        {/* 1st Place */}
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

                        {/* 3rd Place */}
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
              <motion.div variants={fadeUp} className="perspective-container">
                <Card className="perspective-card card-premium glow-amber overflow-hidden group">
                  <CardContent className="p-0">
                    {/* Division Header with Image Area */}
                    <div className="relative img-zoom h-28">
                      <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/60 to-[#0d0d1a]/30 dark:from-background dark:via-background/60 dark:to-background/30" />
                      <div className="absolute inset-0 flex items-center justify-between px-5">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#e8d5a3]" />
                          <h3 className="text-sm font-bold text-[#e8d5a3]">FEMALE DIVISION</h3>
                        </div>
                        <Badge className="bg-[#d4a853]/20 text-[#e8d5a3] text-[10px] border border-[#d4a853]/30">Active</Badge>
                      </div>
                    </div>

                    {/* Top Club */}
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

                    {/* Top 3 Players Podium */}
                    <div className="p-5">
                      <p className="text-[10px] font-semibold text-[#e8d5a3]/50 mb-4 uppercase tracking-wider">Top Players</p>
                      <div className="flex items-end justify-center gap-4">
                        {/* 2nd Place */}
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

                        {/* 1st Place */}
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

                        {/* 3rd Place */}
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

      {/* ========== FEATURES SECTION — Premium Cards with Image Areas ========== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <SectionHeader icon={Sparkles} label="Platform Features" title="Built for Champions" subtitle="Every feature designed to elevate competitive gaming" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Swords, title: 'Weekly Tournament', desc: '1 tournament per week per division. Solo registration, auto-balanced teams, 1 main event match.', color: 'text-[#d4a853]', bg: 'bg-[#d4a853]/10', badge: 'Weekly' },
                { icon: Trophy, title: 'IDM League', desc: 'MPL-style round robin with BO3 format. Club-based competition with playoffs and grand final.', color: 'text-[#e8d5a3]', bg: 'bg-[#e8d5a3]/10', badge: 'Pro' },
                { icon: Zap, title: 'Smart Matchmaking', desc: 'Snake draft system with S+A+B tier balancing. Auto-swap if power imbalance detected.', color: 'text-amber-500', bg: 'bg-amber-500/10', badge: 'AI' },
                { icon: TrendingUp, title: 'Seasonal Ranking', desc: 'Win +2pts, MVP based on prize, participation +10, streak bonuses up to +30.', color: 'text-green-500', bg: 'bg-green-500/10', badge: 'Live' },
                { icon: Gift, title: 'Donation & Sawer', desc: 'Live prize pool tracker, top contributors, real-time donation notifications.', color: 'text-pink-500', bg: 'bg-pink-500/10', badge: 'New' },
                { icon: Shield, title: 'Full Admin Panel', desc: 'Approve players, assign tiers, generate teams, input scores, distribute points.', color: 'text-idm-amber', bg: 'bg-idm-amber/10', badge: 'Admin' },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp} className="group">
                  <Card className="bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-xl overflow-hidden h-full transition-all duration-300 hover:border-[#d4a853]/30 hover:shadow-[0_0_30px_rgba(212,168,83,0.15)] card-lift">
                    <CardContent className="p-0">
                      {/* Image area with gradient overlay */}
                      <div className="relative img-zoom h-32">
                        <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/90 via-[#0d0d1a]/50 to-[#0d0d1a]/20 dark:from-[#0d0d1a] dark:via-[#0d0d1a]/60 dark:to-[#0d0d1a]/30" />
                        {/* Badge on top-right */}
                        <Badge className="absolute top-3 right-3 bg-[#d4a853]/20 text-[#d4a853] text-[10px] border border-[#d4a853]/30">{f.badge}</Badge>
                        {/* Icon overlay on image */}
                        <div className={`absolute bottom-3 left-4 w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center`}>
                          <f.icon className={`w-5 h-5 ${f.color}`} />
                        </div>
                      </div>
                      {/* Text content */}
                      <div className="p-5">
                        <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS — Timeline Style ========== */}
      <section className="relative py-20 px-4 bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/30 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.06]" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a]/5 via-transparent to-[#0d0d1a]/5 dark:from-[#0d0d1a]/30 dark:via-transparent dark:to-[#0d0d1a]/30" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <SectionHeader icon={Target} label="Tournament Flow" title="How It Works" />

            {/* Timeline */}
            <div className="relative">
              {/* Vertical Gold Line */}
              <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-px bg-gradient-to-b from-[#d4a853] via-[#d4a853]/50 to-[#d4a853]/10" />

              <div className="space-y-8">
                {[
                  { step: '01', title: 'Register', desc: 'Solo registration for weekly tournament', icon: Users, color: 'bg-[#d4a853]/10 text-[#d4a853]' },
                  { step: '02', title: 'Get Approved', desc: 'Admin assigns your tier (S / A / B)', icon: Star, color: 'bg-[#e8d5a3]/10 text-[#e8d5a3]' },
                  { step: '03', title: 'Team Up', desc: 'Auto-balanced teams with S+A+B composition', icon: Gamepad2, color: 'bg-green-500/10 text-green-500' },
                  { step: '04', title: 'Compete', desc: '1 main event match per week', icon: Swords, color: 'bg-red-500/10 text-red-500' },
                  { step: '05', title: 'Win & Rank', desc: 'Earn points, climb leaderboard, become MVP', icon: Crown, color: 'bg-[#d4a853]/10 text-[#d4a853]' },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className="relative flex items-start gap-5 sm:gap-6">
                    {/* Numbered Circle on Timeline */}
                    <div className="relative z-10 shrink-0">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#0d0d1a] dark:bg-[#0a0a14] border-2 border-[#d4a853]/40 flex items-center justify-center glow-champion">
                        <span className="text-sm sm:text-base font-black text-[#d4a853]">{s.step}</span>
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-[#d4a853]/30 hover:shadow-[0_0_20px_rgba(212,168,83,0.1)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">{s.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== TOP LEADERBOARD PREVIEW — Premium Glass Cards ========== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <SectionHeader icon={Flame} label="Rankings" title="Leaderboard" subtitle="Current season standings" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Male Leaderboard */}
              <motion.div variants={fadeUp}>
                <Card className="bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-xl overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-0">
                    {/* Gold Header Bar */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#d4a853]/10 to-transparent border-b border-[#d4a853]/10">
                      <Swords className="w-4 h-4 text-[#d4a853]" />
                      <span className="text-xs font-bold text-[#d4a853] uppercase tracking-wider">Male Division</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {maleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 cursor-pointer interactive-scale hover:bg-[#d4a853]/5 hover:shadow-[0_0_15px_rgba(212,168,83,0.08)]"
                          onClick={() => setSelectedPlayer({ ...p, division: 'male' })}
                        >
                          {/* Rank Indicator */}
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Female Leaderboard */}
              <motion.div variants={fadeUp}>
                <Card className="bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/60 border border-[#d4a853]/10 rounded-xl overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-0">
                    {/* Gold Header Bar */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#e8d5a3]/10 to-transparent border-b border-[#e8d5a3]/10">
                      <Shield className="w-4 h-4 text-[#e8d5a3]" />
                      <span className="text-xs font-bold text-[#e8d5a3] uppercase tracking-wider">Female Division</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {femaleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 cursor-pointer interactive-scale hover:bg-[#d4a853]/5 hover:shadow-[0_0_15px_rgba(212,168,83,0.08)]"
                          onClick={() => setSelectedPlayer({ ...p, division: 'female' })}
                        >
                          {/* Rank Indicator */}
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
                            <span className="text-sm font-bold text-[#d4a853]">{p.points}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION — Dramatic ========== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/bg-section.jpg" alt="" className="w-full h-full object-cover opacity-[0.04] dark:opacity-[0.08]" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a853]/5 via-transparent to-[#e8d5a3]/5" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <Sparkles className="w-10 h-10 text-[#d4a853] mx-auto mb-5" />
            <h2 className="text-4xl lg:text-5xl font-black text-gradient-champion mb-4">
              Ready to Compete?
            </h2>
            <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Join the arena. Register for weekly tournaments, climb the leaderboard, and become the next IDM League champion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4a853] to-[#c9a84c] hover:from-[#c9a84c] hover:to-[#b8963d] text-[#0a0a14] px-8 py-6 text-base font-bold rounded-xl gold-glow transition-all hover:scale-105"
                onClick={() => enterApp('male')}
              >
                Enter Male Division
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#d4a853]/30 text-[#e8d5a3] hover:bg-[#d4a853]/10 px-8 py-6 text-base font-bold rounded-xl transition-all hover:scale-105"
                onClick={() => enterApp('female')}
              >
                Enter Female Division
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-10 px-4 border-t border-[#d4a853]/10 text-center bg-[#0d0d1a]/5 dark:bg-[#0d0d1a]/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo1.webp" alt="IDM" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg text-gradient-fury font-bold">IDM League</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Idol Meta Fan Made Edition — Premium Esports Platform</p>
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
