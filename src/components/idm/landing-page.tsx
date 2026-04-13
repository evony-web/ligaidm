'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Trophy, Swords, Users, Shield, Crown, Flame,
  Gamepad2, ChevronRight, Star, Zap, Gift, TrendingUp,
  ArrowRight, Sparkles, Heart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { PlayerProfile } from './player-profile';
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

      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="/arena-bg.png" alt="Arena" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-idm-purple/5" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Logo & Title */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden glow-pulse">
                <img src="/idm-logo.png" alt="IDM League" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gradient-fury mb-2">
                IDM League
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-light">
                Idol Meta Fan Made Edition
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary text-xs border border-primary/20 px-3 py-1">
                  🐉 Season 1
                </Badge>
                <Badge className="bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20 px-3 py-1">
                  🏆 Premium Esports
                </Badge>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
              Platform esports premium dengan sistem tournament mingguan, liga profesional MPL-style,
              matchmaking cerdas, dan komunitas yang kompetitif.
            </motion.p>

            {/* Division Entry */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold rounded-xl glow-teal transition-all hover:scale-105"
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
            <motion.div variants={fadeUp} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{maleData?.totalPlayers || 18}+</p>
                <p className="text-[10px] text-muted-foreground">Players</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-[10px] text-muted-foreground">Clubs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatCurrency(maleData?.totalPrizePool || 0)}</p>
                <p className="text-[10px] text-muted-foreground">Prize Pool</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">8</p>
                <p className="text-[10px] text-muted-foreground">Weeks/Season</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ========== SCROLLING CHAMPION MARQUEE ========== */}
      <section className="py-4 overflow-hidden bg-muted/20 border-y border-border/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 gap-6 pr-6">
              {maleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`m-${setIdx}-${p.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/30">
                  <TierBadge tier={p.tier} />
                  <span className="text-xs font-semibold whitespace-nowrap">{p.gamertag}</span>
                  <span className="text-[10px] text-primary font-bold">{p.points}pts</span>
                  <Swords className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
              {femaleData?.topPlayers?.slice(0, 6).map((p) => (
                <div key={`f-${setIdx}-${p.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/30">
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
      <section className="relative py-16 overflow-hidden">
        {/* Full-width background */}
        <div className="absolute inset-0">
          <img src="/champion-banner.png" alt="Champions" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {/* Section Header */}
            <motion.div variants={fadeUp} className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-500 uppercase tracking-widest">Hall of Champions</span>
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gradient-fury">Season Champions</h2>
              <p className="text-sm text-muted-foreground mt-2">Top performers across both divisions</p>
            </motion.div>

            {/* Two Division Champions Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* MALE CHAMPIONS */}
              <motion.div variants={fadeUp}>
                <Card className="glass glow-teal border-0 overflow-hidden">
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
                      <div className="p-4 border-b border-border/30 bg-yellow-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-yellow-500 font-semibold">🏆 LEAGUE CHAMPION</p>
                            <p className="text-lg font-bold">{maleTopClub.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{maleTopClub.wins}W-{maleTopClub.losses}L</span>
                              <span>•</span>
                              <span className="text-primary font-bold">{maleTopClub.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top 3 Players Podium */}
                    <div className="p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Top Players</p>
                      <div className="flex items-end justify-center gap-3">
                        {/* 2nd Place */}
                        {maleTop3[1] && (
                          <div className="text-center flex-1">
                            <div className="w-14 h-14 mx-auto rounded-full bg-gray-400/10 border-2 border-gray-400/30 flex items-center justify-center text-sm font-bold text-gray-400 mb-2">
                              {maleTop3[1].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{maleTop3[1].gamertag}</p>
                            <TierBadge tier={maleTop3[1].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{maleTop3[1].points} pts</p>
                            <div className="mt-1 h-16 bg-gray-400/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-lg font-black text-gray-400">2</span>
                            </div>
                          </div>
                        )}

                        {/* 1st Place */}
                        {maleTop3[0] && (
                          <div className="text-center flex-1">
                            <div className="relative">
                              <Crown className="w-5 h-5 text-yellow-500 mx-auto mb-1 animate-float" />
                              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center text-sm font-bold text-yellow-500 glow-gold">
                                {maleTop3[0].gamertag.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <p className="text-sm font-bold truncate mt-2 text-gradient-fury">{maleTop3[0].gamertag}</p>
                            <TierBadge tier={maleTop3[0].tier} />
                            <p className="text-xs text-primary font-bold mt-0.5">{maleTop3[0].points} pts</p>
                            <div className="mt-1 h-24 bg-yellow-500/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-2xl font-black text-yellow-500">1</span>
                            </div>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {maleTop3[2] && (
                          <div className="text-center flex-1">
                            <div className="w-14 h-14 mx-auto rounded-full bg-amber-600/10 border-2 border-amber-600/30 flex items-center justify-center text-sm font-bold text-amber-600 mb-2">
                              {maleTop3[2].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{maleTop3[2].gamertag}</p>
                            <TierBadge tier={maleTop3[2].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{maleTop3[2].points} pts</p>
                            <div className="mt-1 h-12 bg-amber-600/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-lg font-black text-amber-600">3</span>
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
                <Card className="glass glow-purple border-0 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Division Header */}
                    <div className="bg-gradient-to-r from-idm-purple/10 to-idm-purple/5 p-4 border-b border-idm-purple/10">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-idm-purple" />
                        <h3 className="text-sm font-bold text-idm-purple">🗡️ FEMALE DIVISION</h3>
                      </div>
                    </div>

                    {/* Top Club */}
                    {femaleTopClub && (
                      <div className="p-4 border-b border-border/30 bg-yellow-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-yellow-500 font-semibold">🏆 LEAGUE CHAMPION</p>
                            <p className="text-lg font-bold">{femaleTopClub.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{femaleTopClub.wins}W-{femaleTopClub.losses}L</span>
                              <span>•</span>
                              <span className="text-primary font-bold">{femaleTopClub.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top 3 Players Podium */}
                    <div className="p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Top Players</p>
                      <div className="flex items-end justify-center gap-3">
                        {/* 2nd Place */}
                        {femaleTop3[1] && (
                          <div className="text-center flex-1">
                            <div className="w-14 h-14 mx-auto rounded-full bg-gray-400/10 border-2 border-gray-400/30 flex items-center justify-center text-sm font-bold text-gray-400 mb-2">
                              {femaleTop3[1].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{femaleTop3[1].gamertag}</p>
                            <TierBadge tier={femaleTop3[1].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{femaleTop3[1].points} pts</p>
                            <div className="mt-1 h-16 bg-gray-400/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-lg font-black text-gray-400">2</span>
                            </div>
                          </div>
                        )}

                        {/* 1st Place */}
                        {femaleTop3[0] && (
                          <div className="text-center flex-1">
                            <div className="relative">
                              <Crown className="w-5 h-5 text-yellow-500 mx-auto mb-1 animate-float" />
                              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center text-sm font-bold text-yellow-500 glow-gold">
                                {femaleTop3[0].gamertag.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <p className="text-sm font-bold truncate mt-2 text-gradient-fury">{femaleTop3[0].gamertag}</p>
                            <TierBadge tier={femaleTop3[0].tier} />
                            <p className="text-xs text-primary font-bold mt-0.5">{femaleTop3[0].points} pts</p>
                            <div className="mt-1 h-24 bg-yellow-500/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-2xl font-black text-yellow-500">1</span>
                            </div>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {femaleTop3[2] && (
                          <div className="text-center flex-1">
                            <div className="w-14 h-14 mx-auto rounded-full bg-amber-600/10 border-2 border-amber-600/30 flex items-center justify-center text-sm font-bold text-amber-600 mb-2">
                              {femaleTop3[2].gamertag.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-semibold truncate">{femaleTop3[2].gamertag}</p>
                            <TierBadge tier={femaleTop3[2].tier} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{femaleTop3[2].points} pts</p>
                            <div className="mt-1 h-12 bg-amber-600/10 rounded-t-lg flex items-center justify-center">
                              <span className="text-lg font-black text-amber-600">3</span>
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

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Platform Features</span>
              <h2 className="text-3xl font-black text-gradient-fury mt-1">Built for Champions</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Swords, title: 'Weekly Tournament', desc: '1 tournament per week per division. Solo registration, auto-balanced teams, 1 main event match.', color: 'text-primary' },
                { icon: Trophy, title: 'IDM League', desc: 'MPL-style round robin with BO3 format. Club-based competition with playoffs and grand final.', color: 'text-yellow-500' },
                { icon: Zap, title: 'Smart Matchmaking', desc: 'Snake draft system with S+A+B tier balancing. Auto-swap if power imbalance detected.', color: 'text-teal-500' },
                { icon: TrendingUp, title: 'Seasonal Ranking', desc: 'Win +2pts, MVP based on prize, participation +10, streak bonuses up to +30.', color: 'text-green-500' },
                { icon: Gift, title: 'Donation & Sawer', desc: 'Live prize pool tracker, top contributors, real-time donation notifications.', color: 'text-pink-500' },
                { icon: Shield, title: 'Full Admin Panel', desc: 'Approve players, assign tiers, generate teams, input scores, distribute points.', color: 'text-idm-purple' },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="glass card-hover border-0 h-full">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3`}>
                        <f.icon className={`w-5 h-5 ${f.color}`} />
                      </div>
                      <h3 className="text-sm font-bold mb-1">{f.title}</h3>
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
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Tournament Flow</span>
              <h2 className="text-3xl font-black text-gradient-fury mt-1">How It Works</h2>
            </motion.div>

            <div className="space-y-3">
              {[
                { step: '01', title: 'Register', desc: 'Solo registration for weekly tournament', icon: Users },
                { step: '02', title: 'Get Approved', desc: 'Admin assigns your tier (S / A / B)', icon: Star },
                { step: '03', title: 'Team Up', desc: 'Auto-balanced teams with S+A+B composition', icon: Gamepad2 },
                { step: '04', title: 'Compete', desc: '1 main event match per week', icon: Swords },
                { step: '05', title: 'Win & Rank', desc: 'Earn points, climb leaderboard, become MVP', icon: Crown },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="flex items-center gap-4 p-4 rounded-xl glass card-hover border-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary">STEP {s.step}</span>
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
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Flame className="w-6 h-6 text-primary mx-auto mb-2" />
              <h2 className="text-3xl font-black text-gradient-fury">Leaderboard</h2>
              <p className="text-sm text-muted-foreground mt-1">Current season rankings</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Male Leaderboard */}
              <motion.div variants={fadeUp}>
                <Card className="glass border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Swords className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary">MALE DIVISION</span>
                    </div>
                    <div className="space-y-1.5">
                      {maleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedPlayer({ ...p, division: 'male' })}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>{idx + 1}</span>
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
                <Card className="glass border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-idm-purple" />
                      <span className="text-xs font-bold text-idm-purple">FEMALE DIVISION</span>
                    </div>
                    <div className="space-y-1.5">
                      {femaleData?.topPlayers?.slice(0, 5).map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedPlayer({ ...p, division: 'female' })}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>{idx + 1}</span>
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
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-idm-purple/5" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-black text-gradient-fury mb-3">
              Ready to Compete?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Join the arena. Register for weekly tournaments, climb the leaderboard, and become the next IDM League champion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold rounded-xl glow-teal transition-all hover:scale-105"
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
      <footer className="py-8 px-4 border-t border-border text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/idm-logo.png" alt="IDM" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-gradient-fury font-bold">IDM League</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Idol Meta Fan Made Edition — Premium Esports Platform</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>🎮 Weekly Tournaments</span>
            <span>🏆 MPL-Style League</span>
            <span>🧠 Smart Matchmaking</span>
            <span>💰 Donation System</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-4">© 2025 IDM League. All rights reserved.</p>
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
    </div>
  );
}
