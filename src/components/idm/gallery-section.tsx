'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from 'framer-motion';
import {
  Camera, Trophy, Users, Sparkles, Film, Award,
  ChevronLeft, ChevronRight, X, ZoomIn, Calendar,
  ChevronRight as ArrowRight
} from 'lucide-react';

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

/* ========== Collection Card — MonoGlass Inspired ========== */
function CollectionCard({ item, onClick, index }: {
  item: GalleryItem;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      variants={cardReveal}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image Container — 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.src}
            alt={item.alt}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] w-full h-full"
            loading="lazy"
          />

          {/* Gradient overlay — subtle on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Number badge — top left, glass-subtle style */}
          <div className="absolute top-3 left-3 backdrop-blur-[12px] bg-white/20 dark:bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
            <span className="font-mono text-[10px] text-foreground/60 dark:text-white/60 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Zoom icon — top right on hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <div className="w-8 h-8 rounded-lg backdrop-blur-[12px] bg-white/20 dark:bg-white/10 border border-white/15 flex items-center justify-center">
              <ZoomIn className="w-3.5 h-3.5 text-white/80" />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 sm:p-6">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {item.title}
            </h3>
            <span className="font-sans text-xs text-muted-foreground/60">{item.tag}</span>
          </div>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground/50 tabular-nums flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="font-sans text-xs text-muted-foreground/50 group-hover:text-foreground/70 transition-colors flex items-center gap-1">
              Lihat
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-[12px] bg-white/15 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prev Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 z-10 w-10 h-10 rounded-full backdrop-blur-[12px] bg-white/15 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 z-10 w-10 h-10 rounded-full backdrop-blur-[12px] bg-white/15 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
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
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-[11px] text-white/50 mt-0.5">{item.description}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-white/40 shrink-0 tabular-nums font-mono">
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* ========== Parallax ========== */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  /* ========== Group items by category into "collections" ========== */
  const collections = useMemo(() => [
    {
      id: 'tournament',
      title: 'Arena Turnamen',
      subtitle: 'Panggung & Pertarungan',
      description: 'Momen-momen terbaik dari pertandingan IDM League — dari panggung utama hingga duel dance paling intens.',
      icon: Trophy,
      items: GALLERY_ITEMS.filter(g => g.category === 'tournament'),
    },
    {
      id: 'community',
      title: 'Komunitas',
      subtitle: 'Bersama & Berkolaborasi',
      description: 'Members komunitas berkumpul, berdiskusi, dan berkreasi bersama di luar arena pertandingan.',
      icon: Users,
      items: GALLERY_ITEMS.filter(g => g.category === 'community'),
    },
    {
      id: 'behind',
      title: 'Behind The Scene',
      subtitle: 'Di Balik Layar',
      description: 'Tim produksi, persiapan, dan momen eksklusif yang jarang terlihat di balik keseruan turnamen.',
      icon: Film,
      items: GALLERY_ITEMS.filter(g => g.category === 'behind'),
    },
    {
      id: 'achievement',
      title: 'Prestasi',
      subtitle: 'Kemenangan & Penghargaan',
      description: 'Perayaan kemenangan, penyerahan hadiah, dan momen kebanggaan sepanjang season.',
      icon: Award,
      items: GALLERY_ITEMS.filter(g => g.category === 'achievement'),
    },
  ], []);

  /* ========== Lightbox Navigation ========== */
  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex(prev => prev !== null ? (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : null);
  }, []);
  const nextImage = useCallback(() => {
    setLightboxIndex(prev => prev !== null ? (prev + 1) % GALLERY_ITEMS.length : null);
  }, []);

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
      <section id="gallery" ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
        {/* Parallax Background */}
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.03) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.02) 0%, transparent 40%)'
          }} />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Section Header — MonoGlass Collections Style ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="mb-12 sm:mb-16"
          >
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                  Koleksi Galeri
                </h2>
                <p className="font-sans text-sm text-muted-foreground mt-2">
                  Empat kategori, satu komunitas.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 font-sans text-sm text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>{GALLERY_ITEMS.length} foto</span>
              </div>
            </div>
            <div className="w-full h-px bg-border/40 mt-6" />
          </motion.div>

          {/* ── Collections Grid — 3 columns on desktop ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {collections.map((collection, collectionIndex) => {
              const displayItems = collection.items.slice(0, 3);
              const Icon = collection.icon;
              return (
                <motion.div
                  key={collection.id}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  className="group cursor-pointer"
                >
                  <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Cover Image — first item as cover */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={displayItems[0]?.src}
                        alt={collection.title}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] w-full h-full"
                        loading="lazy"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Collection number badge */}
                      <div className="absolute top-3 left-3 backdrop-blur-[12px] bg-white/20 dark:bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
                        <span className="font-mono text-[10px] text-foreground/60 dark:text-white/60 tabular-nums">
                          {String(collectionIndex + 1).padStart(2, '0')}
                        </span>
                      </div>
                      {/* Category icon — top right */}
                      <div className="absolute top-3 right-3 backdrop-blur-[12px] bg-white/20 dark:bg-white/10 border border-white/15 rounded-full p-1.5">
                        <Icon className="w-3.5 h-3.5 text-white/70" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          {collection.title}
                        </h3>
                        <span className="font-sans text-xs text-muted-foreground/60">{collection.subtitle}</span>
                      </div>
                      <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {collection.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground/50 tabular-nums">
                          {collection.items.length} works
                        </span>
                        <span className="font-sans text-xs text-muted-foreground/50 group-hover:text-foreground/70 transition-colors flex items-center gap-1">
                          Explore
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* ── Featured Champion Card — spans full width on last row ── */}
            <motion.div
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              className="md:col-span-2 lg:col-span-3"
            >
              <div className="glass rounded-2xl overflow-hidden">
                {/* Featured Header */}
                <div className="p-5 sm:p-6 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 max-w-12 bg-gradient-to-r from-transparent to-[#d4a853]/40" />
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a853]/20 bg-[#d4a853]/5">
                      <Sparkles className="w-4 h-4 text-[#d4a853]" />
                      <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.2em]">Featured</span>
                    </div>
                    <div className="h-px flex-1 max-w-12 bg-gradient-to-l from-transparent to-[#d4a853]/40" />
                  </div>
                </div>

                {/* Featured Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/20">
                  {GALLERY_ITEMS.filter(g => g.featured).map((item) => {
                    const globalIndex = GALLERY_ITEMS.indexOf(item);
                    return (
                      <div
                        key={item.id}
                        className="group/item cursor-pointer hover:bg-accent/30 transition-colors duration-300"
                        onClick={() => openLightbox(globalIndex)}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="object-cover transition-transform duration-700 ease-out group-hover/item:scale-[1.05] w-full h-full"
                            loading="lazy"
                          />
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                          {/* Gold top accent line — always visible for featured */}
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent" />
                          {/* Zoom icon */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover/item:opacity-100 transition-all duration-300 translate-y-1 group-hover/item:translate-y-0">
                            <div className="w-8 h-8 rounded-lg backdrop-blur-[12px] bg-white/20 dark:bg-white/10 border border-white/15 flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5 text-white/80" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 sm:p-6">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="font-serif text-lg font-semibold text-foreground">{item.title}</h3>
                            <span className="font-sans text-xs text-muted-foreground/60">{item.tag}</span>
                          </div>
                          <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-mono text-xs text-muted-foreground/50 tabular-nums flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="font-sans text-xs text-[#d4a853]/60 group-hover/item:text-[#d4a853] transition-colors flex items-center gap-1">
                              Lihat
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover/item:translate-x-0.5">
                                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── All Photos Strip — Horizontal scrollable row ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Semua Foto</h3>
                <p className="font-sans text-sm text-muted-foreground mt-1">Klik untuk memperbesar</p>
              </div>
              <div className="w-full max-w-32 h-px bg-border/40 ml-6 hidden sm:block" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {GALLERY_ITEMS.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={cardReveal}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110 w-full h-full"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Number */}
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="font-mono text-[9px] text-white/70 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Stats Bar — Minimal elegant ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-14"
          >
            <div className="flex items-center justify-center gap-0 py-4 px-6 rounded-2xl bg-accent/20 backdrop-blur-sm border border-border/20 max-w-lg mx-auto">
              {[
                { icon: Camera, value: GALLERY_ITEMS.length, label: 'Foto' },
                { icon: Trophy, value: GALLERY_ITEMS.filter(g => g.category === 'tournament').length, label: 'Turnamen' },
                { icon: Users, value: GALLERY_ITEMS.filter(g => g.category === 'community').length, label: 'Komunitas' },
                { icon: Award, value: GALLERY_ITEMS.filter(g => g.category === 'achievement').length, label: 'Prestasi' },
              ].map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-px h-8 bg-border/30 mx-4 sm:mx-6" />}
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-4 h-4 text-[#d4a853]/50" />
                    <span className="text-lg font-bold text-foreground tabular-nums">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline font-sans">{stat.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && GALLERY_ITEMS[lightboxIndex] && (
        <Lightbox
          item={GALLERY_ITEMS[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </>
  );
}
