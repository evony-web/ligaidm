'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, type Variants } from 'framer-motion';
import {
  Camera, Trophy, Users, Sparkles, Film, Award,
  ChevronLeft, ChevronRight, X, ZoomIn, Calendar,
  Heart, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/* ========== Gallery Data ========== */
interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  category: 'tournament' | 'community' | 'behind' | 'achievement';
  date: string;
  tag: string;
  tagColor: string;
  featured?: boolean;
}

const GALLERY_ITEMS: GalleryItem[] = [
  // ─── Turnamen ───
  {
    id: 'g1', src: '/gallery/tournament-stage.png', alt: 'Tournament Stage',
    title: 'IDM League Arena', description: 'Panggung utama IDM League dengan efek holografik dan pencahayaan neon yang memukau',
    category: 'tournament', date: '2025-01-15', tag: 'LIVE EVENT', tagColor: 'bg-red-500/20 text-red-400',
    featured: true,
  },
  {
    id: 'g2', src: '/gallery/dance-battle.png', alt: 'Dance Battle',
    title: 'Dance Battle Face-Off', description: 'Momen duel dance paling intens di atas panggung',
    category: 'tournament', date: '2025-01-22', tag: 'WEEK 3', tagColor: 'bg-[#06b6d4]/20 text-[#22d3ee]',
  },
  {
    id: 'g3', src: '/gallery/bracket-display.png', alt: 'Bracket Display',
    title: 'Bracket Elimination', description: 'Papan bracket turnamen — setiap match menentukan nasib',
    category: 'tournament', date: '2025-02-05', tag: 'BRACKET', tagColor: 'bg-[#d4a853]/20 text-[#d4a853]',
  },
  {
    id: 'g4', src: '/gallery/dance-performance.png', alt: 'Dance Performance',
    title: 'Penampilan Lorent', description: 'Penampilan dance dengan laser show dan efek panggung yang memukau',
    category: 'tournament', date: '2025-02-12', tag: 'PERFORMANCE', tagColor: 'bg-purple-500/20 text-purple-400',
  },
  // ─── Komunitas ───
  {
    id: 'g5', src: '/gallery/community-meetup.png', alt: 'Community Meetup',
    title: 'Community Game Night', description: 'Members komunitas berkumpul untuk game night bersama',
    category: 'community', date: '2025-01-10', tag: 'KOMUNITAS', tagColor: 'bg-green-500/20 text-green-400',
    featured: true,
  },
  {
    id: 'g6', src: '/gallery/streamer-setup.png', alt: 'Streamer Setup',
    title: 'Streamer Corner', description: 'Setup streaming para member — dari bedroom studio hingga professional booth',
    category: 'community', date: '2025-01-18', tag: 'CREATOR', tagColor: 'bg-pink-500/20 text-pink-400',
  },
  {
    id: 'g7', src: '/gallery/team-huddle.png', alt: 'Team Huddle',
    title: 'Strategy Huddle', description: 'Team diskusi strategi sebelum match dimulai',
    category: 'community', date: '2025-02-01', tag: 'TEAM', tagColor: 'bg-[#06b6d4]/20 text-[#22d3ee]',
  },
  // ─── Behind The Scene ───
  {
    id: 'g8', src: '/gallery/behind-scene.png', alt: 'Behind The Scene',
    title: 'Production Control Room', description: 'Tim produksi bekerja di belakang layar — OBS hingga overlay graphics',
    category: 'behind', date: '2025-01-20', tag: 'BTS', tagColor: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'g9', src: '/gallery/mvp-portrait.png', alt: 'MVP Portrait Session',
    title: 'MVP Photo Session', description: 'Sesi foto eksklusif untuk MVP of the Week — dramatic portrait with neon rim light',
    category: 'behind', date: '2025-02-08', tag: 'EXCLUSIVE', tagColor: 'bg-[#d4a853]/20 text-[#d4a853]',
  },
  // ─── Prestasi ───
  {
    id: 'g10', src: '/gallery/champion-celebration.png', alt: 'Champion Celebration',
    title: 'Juara League!', description: 'Momen kemenangan tim juara — confetti, trophy, dan air mata bahagia',
    category: 'achievement', date: '2025-02-15', tag: 'CHAMPION', tagColor: 'bg-yellow-500/20 text-yellow-400',
    featured: true,
  },
  {
    id: 'g11', src: '/gallery/award-ceremony.png', alt: 'Award Ceremony',
    title: 'Upacara Penghargaan', description: 'Penghargaan untuk pemain & tim terbaik sepanjang season',
    category: 'achievement', date: '2025-02-20', tag: 'AWARD', tagColor: 'bg-[#d4a853]/20 text-[#d4a853]',
  },
  {
    id: 'g12', src: '/gallery/prize-donation.png', alt: 'Prize & Donation',
    title: 'Prize Pool Handover', description: 'Penyerahan prize pool dari donasi komunitas — bersama kita bisa!',
    category: 'achievement', date: '2025-02-22', tag: 'PRIZE', tagColor: 'bg-green-500/20 text-green-400',
  },
];

/* ========== Animation Variants ========== */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemReveal: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

/* ========== Tab Configuration ========== */
const TABS = [
  { id: 'all' as const, label: 'Semua', icon: Camera },
  { id: 'tournament' as const, label: 'Turnamen', icon: Trophy },
  { id: 'community' as const, label: 'Komunitas', icon: Users },
  { id: 'behind' as const, label: 'Behind The Scene', icon: Film },
  { id: 'achievement' as const, label: 'Prestasi', icon: Award },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ========== Elegant Gallery Card ========== */
const GalleryCard = React.memo(function GalleryCard({
  item, onClick, className = '', index
}: {
  item: GalleryItem;
  onClick: () => void;
  className?: string;
  index: number;
}) {
  return (
    <motion.div
      variants={itemReveal}
      layout
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* Image Container — uniform aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.src}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Elegant Gradient Overlay — multi-layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/30 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-400" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a06]/20 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-400" />

        {/* Gold accent line on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tag Badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${item.tagColor} text-[9px] font-bold border-0 px-2.5 py-1 backdrop-blur-md shadow-lg`}>
            {item.tag}
          </Badge>
        </div>

        {/* Zoom Icon — top right, reveal on hover */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <ZoomIn className="w-3.5 h-3.5 text-white/80" />
          </div>
        </div>

        {/* Bottom Content — elegant reveal */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10">
          <h3 className="text-sm font-bold text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {item.title}
          </h3>
          <p className="text-[11px] text-white/50 mt-1 line-clamp-1 group-hover:text-white/70 transition-colors duration-300">
            {item.description}
          </p>
          <div className="flex items-center gap-3 mt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1 text-[10px] text-[#d4a853]/70">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Elegant border on hover */}
        <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-[#d4a853]/20 transition-colors duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
});

/* ========== Featured Card — Hero Style ========== */
const FeaturedCard = React.memo(function FeaturedCard({
  item, onClick, className = ''
}: {
  item: GalleryItem;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemReveal}
      layout
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* Featured Image — taller aspect ratio */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
        <img
          src={item.src}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Multi-layer elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-400" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a06]/50 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 80%, rgba(212,168,83,0.08) 0%, transparent 50%)' }} />

        {/* Gold accent line — always visible for featured */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent" />

        {/* Tag Badge — top left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Badge className={`${item.tagColor} text-[10px] font-bold border-0 px-3 py-1.5 backdrop-blur-md shadow-lg`}>
            {item.tag}
          </Badge>
          <Badge className="bg-[#d4a853]/15 text-[#d4a853] text-[10px] font-bold border border-[#d4a853]/20 px-3 py-1.5 backdrop-blur-md">
            <Sparkles className="w-3 h-3 mr-1" />Featured
          </Badge>
        </div>

        {/* Zoom Icon — top right */}
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-white/80" />
          </div>
        </div>

        {/* Bottom Content — Featured Layout */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10">
          <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {item.title}
          </h3>
          <p className="text-sm text-white/60 mt-2 line-clamp-2 group-hover:text-white/80 transition-colors duration-300 max-w-lg">
            {item.description}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-[#d4a853]/70">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Elegant border on hover */}
        <div className="absolute inset-0 rounded-2xl border border-[#d4a853]/10 group-hover:border-[#d4a853]/25 transition-colors duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
});

/* ========== Lightbox Component ========== */
function Lightbox({ item, onClose, onPrev, onNext }: {
  item: GalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prev Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Image + Info */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-5xl w-full max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden">
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-contain"
            />
          </div>
          {/* Info Bar */}
          <div className="mt-3 flex items-center gap-3">
            <Badge className={`${item.tagColor} text-[10px] font-bold border-0`}>
              {item.tag}
            </Badge>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
              <p className="text-[11px] text-white/50">{item.description}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-[#d4a853]/70 shrink-0">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ========== Main Gallery Section Component ========== */
export function GallerySection() {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* ========== Parallax ========== */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  /* ========== Filtered Items ========== */
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter(item => item.category === activeTab);
  }, [activeTab]);

  // Split into featured and regular
  const featuredItems = useMemo(() => filteredItems.filter(item => item.featured), [filteredItems]);
  const regularItems = useMemo(() => filteredItems.filter(item => !item.featured), [filteredItems]);

  /* ========== Lightbox Navigation ========== */
  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex(prev => prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null);
  }, [filteredItems.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex(prev => prev !== null ? (prev + 1) % filteredItems.length : null);
  }, [filteredItems.length]);

  /* ========== Keyboard Navigation ========== */
  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  return (
    <>
      <section id="gallery" ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
        {/* Parallax Background */}
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <img src="/bg-section.jpg" alt="" className="w-full h-[120%] object-cover opacity-[0.06] dark:opacity-[0.10]" aria-hidden="true" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.03) 0%, transparent 40%)'
          }} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 60%)' }} />
          <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* ── Section Header ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#d4a853]" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a853]/20 bg-[#d4a853]/5">
                <Camera className="w-4 h-4 text-[#d4a853]" />
                <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em]">Galeri</span>
              </div>
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#d4a853]" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-champion">
              Momen Komunitas
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
              Kumpulan momen terbaik dari kegiatan komunitas IDM League — dari panggung turnamen hingga cerita di balik layar
            </p>
          </motion.div>

          {/* ── Tab Navigation — Elegant pill style ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const count = tab.id === 'all'
                  ? GALLERY_ITEMS.length
                  : GALLERY_ITEMS.filter(g => g.category === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/30 shadow-[0_0_20px_rgba(212,168,83,0.1)]'
                        : 'bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    <span className={`text-[10px] font-bold tabular-nums ${isActive ? 'text-[#d4a853]/60' : 'text-muted-foreground/40'}`}>{count}</span>
                    {isActive && (
                      <motion.div
                        layoutId="gallery-tab-indicator"
                        className="absolute inset-0 rounded-xl border border-[#d4a853]/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Gallery Grid — Elegant Bento Layout ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={staggerContainer}
            >
              {/* Featured Items — Hero Row */}
              {featuredItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {featuredItems.map((item) => {
                    const globalIndex = filteredItems.indexOf(item);
                    return (
                      <FeaturedCard
                        key={item.id}
                        item={item}
                        onClick={() => openLightbox(globalIndex)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Regular Items — Clean Uniform Grid */}
              {regularItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {regularItems.map((item) => {
                    const globalIndex = filteredItems.indexOf(item);
                    return (
                      <GalleryCard
                        key={item.id}
                        item={item}
                        index={globalIndex}
                        onClick={() => openLightbox(globalIndex)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {filteredItems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <Camera className="w-12 h-12 text-[#d4a853]/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada foto untuk kategori ini</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Stats Bar — Elegant minimal ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-14"
          >
            <div className="flex items-center justify-center gap-0 py-4 px-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.04] max-w-lg mx-auto">
              {[
                { icon: Camera, value: GALLERY_ITEMS.length, label: 'Foto' },
                { icon: Trophy, value: GALLERY_ITEMS.filter(g => g.category === 'tournament').length, label: 'Turnamen' },
                { icon: Users, value: GALLERY_ITEMS.filter(g => g.category === 'community').length, label: 'Komunitas' },
                { icon: Award, value: GALLERY_ITEMS.filter(g => g.category === 'achievement').length, label: 'Prestasi' },
              ].map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-px h-8 bg-white/[0.06] mx-4 sm:mx-6" />}
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-4 h-4 text-[#d4a853]/50" />
                    <span className="text-lg font-black text-gradient-fury">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">{stat.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <Lightbox
          item={filteredItems[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </>
  );
}
