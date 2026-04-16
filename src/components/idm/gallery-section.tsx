'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Camera, Trophy, Users, Film, Award,
  ChevronLeft, ChevronRight, X, ZoomIn
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
  featured?: boolean;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1', src: '/gallery/tournament-stage.png', alt: 'Tournament Stage',
    title: 'IDM League Arena', description: 'Panggung utama IDM League dengan efek holografik dan pencahayaan neon yang memukau',
    category: 'tournament', date: '2025-01-15', tag: 'LIVE EVENT',
    featured: true,
  },
  {
    id: 'g2', src: '/gallery/dance-battle.png', alt: 'Dance Battle',
    title: 'Dance Battle Face-Off', description: 'Momen duel dance paling intens di atas panggung',
    category: 'tournament', date: '2025-01-22', tag: 'WEEK 3',
  },
  {
    id: 'g3', src: '/gallery/bracket-display.png', alt: 'Bracket Display',
    title: 'Bracket Elimination', description: 'Papan bracket turnamen — setiap match menentukan nasib',
    category: 'tournament', date: '2025-02-05', tag: 'BRACKET',
  },
  {
    id: 'g4', src: '/gallery/dance-performance.png', alt: 'Dance Performance',
    title: 'Penampilan Lorent', description: 'Penampilan dance dengan laser show dan efek panggung yang memukau',
    category: 'tournament', date: '2025-02-12', tag: 'PERFORMANCE',
  },
  {
    id: 'g5', src: '/gallery/community-meetup.png', alt: 'Community Meetup',
    title: 'Community Game Night', description: 'Members komunitas berkumpul untuk game night bersama',
    category: 'community', date: '2025-01-10', tag: 'KOMUNITAS',
    featured: true,
  },
  {
    id: 'g6', src: '/gallery/streamer-setup.png', alt: 'Streamer Setup',
    title: 'Streamer Corner', description: 'Setup streaming para member — dari bedroom studio hingga professional booth',
    category: 'community', date: '2025-01-18', tag: 'CREATOR',
  },
  {
    id: 'g7', src: '/gallery/team-huddle.png', alt: 'Team Huddle',
    title: 'Strategy Huddle', description: 'Team diskusi strategi sebelum match dimulai',
    category: 'community', date: '2025-02-01', tag: 'TEAM',
  },
  {
    id: 'g8', src: '/gallery/behind-scene.png', alt: 'Behind The Scene',
    title: 'Production Control Room', description: 'Tim produksi bekerja di belakang layar — OBS hingga overlay graphics',
    category: 'behind', date: '2025-01-20', tag: 'BTS',
  },
  {
    id: 'g9', src: '/gallery/mvp-portrait.png', alt: 'MVP Portrait Session',
    title: 'MVP Photo Session', description: 'Sesi foto eksklusif untuk MVP of the Week — dramatic portrait with neon rim light',
    category: 'behind', date: '2025-02-08', tag: 'EXCLUSIVE',
  },
  {
    id: 'g10', src: '/gallery/champion-celebration.png', alt: 'Champion Celebration',
    title: 'Juara League!', description: 'Momen kemenangan tim juara — confetti, trophy, dan air mata bahagia',
    category: 'achievement', date: '2025-02-15', tag: 'CHAMPION',
    featured: true,
  },
  {
    id: 'g11', src: '/gallery/award-ceremony.png', alt: 'Award Ceremony',
    title: 'Upacara Penghargaan', description: 'Penghargaan untuk pemain & tim terbaik sepanjang season',
    category: 'achievement', date: '2025-02-20', tag: 'AWARD',
  },
  {
    id: 'g12', src: '/gallery/prize-donation.png', alt: 'Prize & Donation',
    title: 'Prize Pool Handover', description: 'Penyerahan prize pool dari donasi komunitas — bersama kita bisa!',
    category: 'achievement', date: '2025-02-22', tag: 'PRIZE',
  },
];

/* ========== Category Definitions ========== */
const CATEGORIES = [
  { id: 'all' as const, label: 'Semua', icon: Camera },
  { id: 'tournament' as const, label: 'Turnamen', icon: Trophy },
  { id: 'community' as const, label: 'Komunitas', icon: Users },
  { id: 'behind' as const, label: 'Behind The Scene', icon: Film },
  { id: 'achievement' as const, label: 'Prestasi', icon: Award },
];

type CategoryId = (typeof CATEGORIES)[number]['id'];

/* ========== Lightbox ========== */
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
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-5xl w-full max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden">
            <img src={item.src} alt={item.alt} className="w-full h-full object-contain" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-[11px] text-white/50 mt-0.5">{item.description}</p>
            </div>
            <span className="text-[10px] text-white/40 shrink-0 font-mono tabular-nums">{item.date}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ========== Main Component ========== */
export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  const filteredItems = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(g => g.category === activeCategory);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex(prev => prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null);
  }, [filteredItems.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex(prev => prev !== null ? (prev + 1) % filteredItems.length : null);
  }, [filteredItems.length]);

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
      <section id="gallery" ref={sectionRef} className="relative py-20 sm:py-28 overflow-hidden">
        {/* Subtle background */}
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.03) 0%, transparent 50%)'
          }} />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a853]/20 bg-[#d4a853]/5 mb-5">
              <Camera className="w-3.5 h-3.5 text-[#d4a853]" />
              <span className="text-[11px] font-semibold text-[#d4a853] uppercase tracking-[0.2em]">Galeri</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Momen Komunitas
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Kumpulan momen terbaik dari kegiatan komunitas IDM League
            </p>
          </motion.div>

          {/* ── Category Filter ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-10 flex-wrap"
          >
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all'
                ? GALLERY_ITEMS.length
                : GALLERY_ITEMS.filter(g => g.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] tabular-nums ${isActive ? 'text-background/50' : 'text-muted-foreground/40'}`}>{count}</span>
                </button>
              );
            })}
          </motion.div>

          {/* ── Gallery Grid ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredItems.map((item, index) => {
                const isFeatured = item.featured;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`group cursor-pointer ${isFeatured ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                    onClick={() => openLightbox(index)}
                  >
                    <div className={`relative overflow-hidden rounded-xl ${isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Featured gold line */}
                      {isFeatured && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent opacity-60" />
                      )}

                      {/* Zoom icon */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                          <ZoomIn className="w-3.5 h-3.5 text-white/80" />
                        </div>
                      </div>

                      {/* Bottom info on hover */}
                      <div className="absolute bottom-0 inset-x-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 className={`font-semibold text-white drop-shadow-sm ${isFeatured ? 'text-base' : 'text-sm'}`}>
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-white/60 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Camera className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada foto untuk kategori ini</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
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
