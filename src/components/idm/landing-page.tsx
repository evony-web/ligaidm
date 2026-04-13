'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Trophy, Swords, Users, Shield, Crown, Flame,
  Gamepad2, ChevronRight, Star, Zap, Gift, TrendingUp,
  ArrowRight, Sparkles, Heart, BarChart3, Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { useState } from 'react';

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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export function LandingPage() {
  const { setCurrentView, setDivision } = useAppStore();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] & { division?: string } | null>(null);
  const [selectedClub, setSelectedClub] = useState<(StatsData['clubs'][0] & { division?: string }) | null>(null);

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

  return (
    <div className="min-h-screen bg-background overflow-hidden">

      {/* ========== HERO SECTION - Premium ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Logo & Title */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="w-24 h-24 mx-auto mb-5 rounded-2xl overflow-hidden glow-champion card-champion">
                <img src="/logo.webp" alt="IDM League" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-gradient-fury mb-2">
                IDM League
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-light tracking-wide">
                Idol Meta Fan Made Edition
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge className="bg-primary/10 text-primary text-xs border border-primary/20 px-3 py-1.5 glow-pulse">
                  🐉 Season 1
                </Badge>
                <Badge className="bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20 px-3 py-1.5">
                  🏆 Premium Esports
                </Badge>
                <Badge className="bg-idm-amber/10 text-idm-amber text-xs border border-idm-amber/20 px-3 py-1.5">
                  ⚡ MPL-Style
                </Badge>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Platform esports premium dengan sistem tournament mingguan, liga profesional MPL-style,
              matchmaking cerdas, dan komunitas yang kompetitif.
            </motion.p>

            {/* Division Entry */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold rounded-xl glow-gold transition-all hover:scale-105 card-premium"
                onClick={() => enterApp('male')}
              >
                <Swords className="w-5 h-5 mr-2" />
                Male Division
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 px-8 py-6 text-base font-bold rounded-xl transition-all hover:scale-105"
                onClick={() => enterApp('female')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Female Division
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeUp} className="mt-12 grid grid-cols-4 gap-4 max-w-lg mx-auto">
              {[
                { value: `${maleData?.totalPlayers || 18}+`, label: 'Players' },
                { value: '12', label: 'Clubs' },
                { value: formatCurrency(maleData?.totalPrizePool || 0), label: 'Prize Pool' },
                { value: '8', label: 'Weeks/Season' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 rounded-xl glass border-0 card-glow-hover interactive-scale">
                  <p className="text-lg font-bold text-gradient-fury">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-7 h-12 rounded-full border-2 border-primary/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ========== SCROLLING CHAMPION MARQUEE ========== */}
      <section className="py-4 overflow-hidden bg-muted/20 border-y border-border/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 gap-6 pr-6">
              {maleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`m-${setIdx}-${p.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-0 card-glow-hover interactive-scale">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-primary font-bold">{p.points}pts</span>
                  <Swords className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
              {femaleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`f-${setIdx}-${p.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-0 card-glow-hover interactive-scale">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-primary font-bold">{p.points}pts</span>
                  <Shield className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ========== CHAMPIONS BANNER (FULL WIDTH) ========== */}
      <section className="relative py-20 overflow-hidden">

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {/* Section Header */}
            <motion.div variants={fadeUp} className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500" />
                <Crown className="w-6 h-6 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-500 uppercase tracking-[0.2em]">Hall of Champions</span>
                <Crown className="w-6 h-6 text-yellow-500" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-gradient-champion">Season Champions</h2>
              <p className="text-sm text-muted-foreground mt-3">Top performers across both divisions</p>
            </motion.div>

            {/* Two Division Champions Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* MALE CHAMPIONS */}
              <motion.div variants={fadeUp}>
                <Card className="card-premium glow-gold overflow-hidden">
                  <CardContent className="p-0">
                    {/* Division Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-primary/10">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-primary">⚔️ MALE DIVISION</h3>
                      </div>
                    </div>

                    {/* Top Club */}
                    {maleTopClub && (
                      <div className="p-5 border-b border-border/30 card-gold cursor-pointer interactive-scale" onClick={() => setSelectedClub({ ...maleTopClub, division: 'male' })}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center glow-champion">
                            <Trophy className="w-7 h-7 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-yellow-500 font-semibold uppercase tracking-wider">🏆 League Champion</p>
                            <p className="text-xl font-bold text-gradient-gold">{maleTopClub.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="text-green-500 font-semibold">{maleTopClub.wins}W</span>
                              <span>-</span>
                              <span className="text-red-500 font-semibold">{maleTopClub.losses}L</span>
                              <span>•</span>
                              <span className="text-primary font-bold">{maleTopClub.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top 3 Players Podium */}
                    <div className="p-5">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Top Players</p>
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
                              <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-float" />
                              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center text-lg font-bold text-yellow-500 glow-champion">
                                {maleTop3[0].gamertag.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <p className="text-sm font-bold truncate mt-2 text-gradient-champion">{maleTop3[0].gamertag}</p>
                            <TierBadge tier={maleTop3[0].tier} />
                            <p className="text-xs text-primary font-bold mt-0.5">{maleTop3[0].points} pts</p>
                            <div className="mt-2 h-24 bg-yellow-500/10 rounded-t-lg flex items-center justify-center border border-yellow-500/10">
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
              <motion.div variants={fadeUp}>
                <Card className="card-premium glow-amber overflow-hidden">
                  <CardContent className="p-0">
                    {/* Division Header */}
                    <div className="bg-gradient-to-r from-idm-amber/10 to-idm-amber/5 p-4 border-b border-idm-amber/10">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-idm-amber" />
                        <h3 className="text-sm font-bold text-idm-amber">🗡️ FEMALE DIVISION</h3>
                      </div>
                    </div>

                    {/* Top Club */}
                    {femaleTopClub && (
                      <div className="p-5 border-b border-border/30 card-gold cursor-pointer interactive-scale" onClick={() => setSelectedClub({ ...femaleTopClub, division: 'female' })}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center glow-champion">
                            <Trophy className="w-7 h-7 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-yellow-500 font-semibold uppercase tracking-wider">🏆 League Champion</p>
                            <p className="text-xl font-bold text-gradient-gold">{femaleTopClub.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="text-green-500 font-semibold">{femaleTopClub.wins}W</span>
                              <span>-</span>
                              <span className="text-red-500 font-semibold">{femaleTopClub.losses}L</span>
                              <span>•</span>
                              <span className="text-primary font-bold">{femaleTopClub.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top 3 Players Podium */}
                    <div className="p-5">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Top Players</p>
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
                              <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-float" />
                              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center text-lg font-bold text-yellow-500 glow-champion">
                                {femaleTop3[0].gamertag.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <p className="text-sm font-bold truncate mt-2 text-gradient-champion">{femaleTop3[0].gamertag}</p>
                            <TierBadge tier={femaleTop3[0].tier} />
                            <p className="text-xs text-primary font-bold mt-0.5">{femaleTop3[0].points} pts</p>
                            <div className="mt-2 h-24 bg-yellow-500/10 rounded-t-lg flex items-center justify-center border border-yellow-500/10">
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

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">Platform Features</span>
              <h2 className="text-4xl font-black text-gradient-fury mt-2">Built for Champions</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Every feature designed to elevate competitive gaming</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Swords, title: 'Weekly Tournament', desc: '1 tournament per week per division. Solo registration, auto-balanced teams, 1 main event match.', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Trophy, title: 'IDM League', desc: 'MPL-style round robin with BO3 format. Club-based competition with playoffs and grand final.', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                { icon: Zap, title: 'Smart Matchmaking', desc: 'Snake draft system with S+A+B tier balancing. Auto-swap if power imbalance detected.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { icon: TrendingUp, title: 'Seasonal Ranking', desc: 'Win +2pts, MVP based on prize, participation +10, streak bonuses up to +30.', color: 'text-green-500', bg: 'bg-green-500/10' },
                { icon: Gift, title: 'Donation & Sawer', desc: 'Live prize pool tracker, top contributors, real-time donation notifications.', color: 'text-pink-500', bg: 'bg-pink-500/10' },
                { icon: Shield, title: 'Full Admin Panel', desc: 'Approve players, assign tiers, generate teams, input scores, distribute points.', color: 'text-idm-amber', bg: 'bg-idm-amber/10' },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="card-premium card-lift h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                        <f.icon className={`w-6 h-6 ${f.color}`} />
                      </div>
                      <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">Tournament Flow</span>
              <h2 className="text-4xl font-black text-gradient-fury mt-2">How It Works</h2>
            </motion.div>

            <div className="space-y-3">
              {[
                { step: '01', title: 'Register', desc: 'Solo registration for weekly tournament', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
                { step: '02', title: 'Get Approved', desc: 'Admin assigns your tier (S / A / B)', icon: Star, color: 'bg-yellow-500/10 text-yellow-500' },
                { step: '03', title: 'Team Up', desc: 'Auto-balanced teams with S+A+B composition', icon: Gamepad2, color: 'bg-green-500/10 text-green-500' },
                { step: '04', title: 'Compete', desc: '1 main event match per week', icon: Swords, color: 'bg-red-500/10 text-red-500' },
                { step: '05', title: 'Win & Rank', desc: 'Earn points, climb leaderboard, become MVP', icon: Crown, color: 'bg-yellow-500/10 text-yellow-500' },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="flex items-center gap-4 p-4 rounded-xl card-premium card-lift">
                    <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step {s.step}</span>
                        <h3 className="text-sm font-bold">{s.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    {i < 4 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== TOP LEADERBOARD PREVIEW ========== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <Flame className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-4xl font-black text-gradient-fury">Leaderboard</h2>
              <p className="text-sm text-muted-foreground mt-2">Current season rankings</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Male Leaderboard */}
              <motion.div variants={fadeUp}>
                <Card className="card-premium overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10">
                      <Swords className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Male Division</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {maleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...p, division: 'male' })}>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0 ? 'bg-yellow-500/20 text-yellow-500 glow-champion' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>{idx + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                            {p.gamertag.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p.gamertag}</span>
                              <TierBadge tier={p.tier} />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-primary">{p.points}</span>
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
                <Card className="card-premium overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-idm-amber/10 to-transparent border-b border-idm-amber/10">
                      <Shield className="w-4 h-4 text-idm-amber" />
                      <span className="text-xs font-bold text-idm-amber uppercase tracking-wider">Female Division</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {femaleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer interactive-scale" onClick={() => setSelectedPlayer({ ...p, division: 'female' })}>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0 ? 'bg-yellow-500/20 text-yellow-500 glow-champion' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>{idx + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-idm-amber/10 flex items-center justify-center text-[10px] font-bold text-idm-amber shrink-0">
                            {p.gamertag.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p.gamertag}</span>
                              <TierBadge tier={p.tier} />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-primary">{p.points}</span>
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

      {/* ========== CTA SECTION ========== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-idm-amber/5" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-5" />
            <h2 className="text-4xl lg:text-5xl font-black text-gradient-fury mb-4">
              Ready to Compete?
            </h2>
            <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Join the arena. Register for weekly tournaments, climb the leaderboard, and become the next IDM League champion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold rounded-xl glow-gold transition-all hover:scale-105"
                onClick={() => enterApp('male')}
              >
                Enter Male Division
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 px-8 py-6 text-base font-bold rounded-xl transition-all hover:scale-105"
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
      <footer className="py-10 px-4 border-t border-border text-center bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo1.webp" alt="IDM" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg text-gradient-fury font-bold">IDM League</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Idol Meta Fan Made Edition — Premium Esports Platform</p>
          <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
            <span>🎮 Weekly Tournaments</span>
            <span>🏆 MPL-Style League</span>
            <span>🧠 Smart Matchmaking</span>
            <span>💰 Donation System</span>
          </div>
          <div className="section-divider max-w-xs mx-auto" />
          <p className="text-[10px] text-muted-foreground/50">© 2025 IDM League. All rights reserved.</p>
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
