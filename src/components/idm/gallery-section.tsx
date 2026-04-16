'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, type Variants } from 'framer-motion';
import {
  Camera, Trophy, Users, Sparkles, Film, Award,
  ChevronLeft, ChevronRight, X, ZoomIn, Calendar,
  MapPin, Heart
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
  aspectClass?: string; // 'aspect-[4/3]' | 'aspect-[3/4]' etc
}

const GALLERY_ITEMS: GalleryItem[] = [
  // ─── Turnamen ───
  {
    id: 'g1', src: '/gallery/tournament-stage.png', alt: 'Tournament Stage',
    title: 'IDM League Arena', description: 'Panggung utama IDM League dengan efek holografik dan pencahayaan neon yang memukau',
    category: 'tournament', date: '2025-01-15', tag: 'LIVE EVENT', tagColor: 'bg-red-500/20 text-red-400',
    featured: true, aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g2', src: '/gallery/dance-battle.png', alt: 'Dance Battle',
    title: 'Dance Battle Face-Off', description: 'Momen duel dance paling intens di atas panggung — siapa yang menang?',
    category: 'tournament', date: '2025-01-22', tag: 'WEEK 3', tagColor: 'bg-[#06b6d4]/20 text-[#22d3ee]',
    aspectClass: 'aspect-[3/4]',
  },
  {
    id: 'g3', src: '/gallery/bracket-display.png', alt: 'Bracket Display',
    title: 'Bracket Elimination', description: 'Papan bracket turnamen ditampilkan di broadcast overlay — setiap match menentukan nasib',
    category: 'tournament', date: '2025-02-05', tag: 'BRACKET', tagColor: 'bg-[#d4a853]/20 text-[#d4a853]',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g4', src: '/gallery/dance-performance.png', alt: 'Dance Performance',
    title: 'Penampilan Lorent', description: 'Penampilan dance dengan laser show dan efek panggung yang memukau',
    category: 'tournament', date: '2025-02-12', tag: 'PERFORMANCE', tagColor: 'bg-purple-500/20 text-purple-400',
    featured: true, aspectClass: 'aspect-[4/3]',
  },
  // ─── Komunitas ───
  {
    id: 'g5', src: '/gallery/community-meetup.png', alt: 'Community Meetup',
    title: 'Community Game Night', description: 'Members komunitas berkumpul untuk game night bersama — fun & competitive',
    category: 'community', date: '2025-01-10', tag: 'KOMUNITAS', tagColor: 'bg-green-500/20 text-green-400',
    featured: true, aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g6', src: '/gallery/streamer-setup.png', alt: 'Streamer Setup',
    title: 'Streamer Corner', description: 'Setup streaming para member — dari bedroom studio hingga professional booth',
    category: 'community', date: '2025-01-18', tag: 'CREATOR', tagColor: 'bg-pink-500/20 text-pink-400',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g7', src: '/gallery/team-huddle.png', alt: 'Team Huddle',
    title: 'Strategy Huddle', description: 'Team diskusi strategi sebelum match dimulai — fokus & determinasi',
    category: 'community', date: '2025-02-01', tag: 'TEAM', tagColor: 'bg-[#06b6d4]/20 text-[#22d3ee]',
    aspectClass: 'aspect-[4/3]',
  },
  // ─── Behind The Scene ───
  {
    id: 'g8', src: '/gallery/behind-scene.png', alt: 'Behind The Scene',
    title: 'Production Control Room', description: 'Tim produksi bekerja di belakang layar — mulai dari OBS hingga overlay graphics',
    category: 'behind', date: '2025-01-20', tag: 'BTS', tagColor: 'bg-amber-500/20 text-amber-400',
    featured: true, aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g9', src: '/gallery/mvp-portrait.png', alt: 'MVP Portrait Session',
    title: 'MVP Photo Session', description: 'Sesi foto eksklusif untuk MVP of the Week — dramatic portrait with neon rim light',
    category: 'behind', date: '2025-02-08', tag: 'EXCLUSIVE', tagColor: 'bg-[#d4a853]/20 text-[#d4a853]',
    aspectClass: 'aspect-[3/4]',
  },
  // ─── Prestasi ───
  {
    id: 'g10', src: '/gallery/champion-celebration.png', alt: 'Champion Celebration',
    title: 'Juara League!', description: 'Momen kemenangan tim juara — confetti, trophy, dan air mata bahagia',
    category: 'achievement', date: '2025-02-15', tag: 'CHAMPION', tagColor: 'bg-yellow-500/20 text-yellow-400',
    featured: true, aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g11', src: '/gallery/award-ceremony.png', alt: 'Award Ceremony',
    title: 'Upacara Penghargaan', description: 'Penghargaan untuk pemain & tim terbaik sepanjang season',
    category: 'achievement', date: '2025-02-20', tag: 'AWARD', tagColor: 'bg-[#d4a853]/20 text-[#d4a853]',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'g12', src: '/gallery/prize-donation.png', alt: 'Prize & Donation',
    title: 'Prize Pool Handover', description: 'Penyerahan prize pool dari donasi komunitas — bersama kita bisa!',
    category: 'achievement', date: '2025-02-22', tag: 'PRIZE', tagColor: 'bg-green-500/20 text-green-400',
    aspectClass: 'aspect-[4/3]',
  },
];

/* ========== Animation Variants ========== */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
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

/* ========== Gallery Card Component ========== */
const GalleryCard = React.memo(function GalleryCard({
  item, onClick
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={scaleIn}
      layout
      className={`group relative rounded-2xl overflow-hidden cursor-pointer card-shine card-border-glow
        ${item.featured ? 'md:col-span-2 md:row-span-2' : ''}`}
      onClick={onClick}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      {/* Image */}
      <div className={`${item.aspectClass || 'aspect-[4/3]'} relative overflow-hidden`}>
        <img
          src={item.src}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Multi-layer Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a06]/40 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Tag Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${item.tagColor} text-[9px] font-bold border-0 px-2.5 py-1 backdrop-blur-md`}>
            {item.tag}
          </Badge>
        </div>

        {/* Zoom Icon */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-white/80" />
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {item.title}
          </h3>
          <p className="text-[11px] text-white/60 mt-1 line-clamp-2 group-hover:text-white/80 transition-colors">
            {item.description}
          </p>
          <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex items-center gap-1 text-[10px] text-[#d4a853]/70">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Gold accent border glow on hover */}
        <div className="absolute inset-0 rounded-2xl border border-[#d4a853]/0 group-hover:border-[#d4a853]/30 transition-colors duration-300 pointer-events-none" />
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
  const contentY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);

  /* ========== Filtered Items ========== */
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter(item => item.category === activeTab);
  }, [activeTab]);

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
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 max-w-7xl mx-auto"
        >
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

          {/* ── Tab Navigation ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
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

          {/* ── Gallery Grid ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-auto"
            >
              {filteredItems.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ── Empty State ── */}
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

          {/* ── Stats Bar ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-12 flex items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { icon: Camera, value: GALLERY_ITEMS.length, label: 'Foto' },
              { icon: Trophy, value: GALLERY_ITEMS.filter(g => g.category === 'tournament').length, label: 'Turnamen' },
              { icon: Users, value: GALLERY_ITEMS.filter(g => g.category === 'community').length, label: 'Komunitas' },
              { icon: Award, value: GALLERY_ITEMS.filter(g => g.category === 'achievement').length, label: 'Prestasi' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-[#d4a853]/60" />
                <span className="text-lg font-black text-gradient-fury">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
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
