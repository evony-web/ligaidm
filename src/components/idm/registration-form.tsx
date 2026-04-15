'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, X, Loader2, MapPin, Phone, Users, Music, CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useQuery } from '@tanstack/react-query';
import { container, item } from '@/lib/animations';

export function RegistrationForm() {
  const dt = useDivisionTheme();
  const [division, setDivision] = useState<'male' | 'female'>('male');
  const [formData, setFormData] = useState({
    name: '',
    joki: '',
    phone: '',
    city: '',
    clubId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    gamertag?: string;
  } | null>(null);

  // Fetch clubs for dropdown
  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

  const { data: clubs } = useQuery({
    queryKey: ['register-clubs', division, stats?.season?.id],
    queryFn: async () => {
      const seasonId = stats?.season?.id;
      if (!seasonId) return [];
      const res = await fetch(`/api/clubs?seasonId=${seasonId}`);
      return res.json();
    },
    enabled: !!stats?.season?.id,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.city.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          joki: formData.joki || null,
          phone: formData.phone || null,
          city: formData.city,
          clubId: formData.clubId || null,
          division,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitResult({
          success: true,
          message: data.message,
          gamertag: data.player?.gamertag,
        });
        setFormData({ name: '', joki: '', phone: '', city: '', clubId: '' });
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Gagal mendaftar',
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'Terjadi kesalahan jaringan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const divisionColor = division === 'male' ? 'cyan' : 'purple';
  const divisionEmoji = division === 'male' ? '🕺' : '💃';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div variants={item} className="text-center mb-2">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${division === 'male' ? 'bg-idm-male/10' : 'bg-idm-female/10'} mb-3`}>
          <UserPlus className={`w-7 h-7 ${division === 'male' ? 'text-idm-male' : 'text-idm-female'}`} />
        </div>
        <h2 className="text-xl font-bold text-gradient-fury">Daftar Peserta</h2>
        <p className="text-xs text-muted-foreground mt-1">Isi form berikut untuk mendaftar sebagai peserta IDM League</p>
      </motion.div>

      {/* Success State */}
      <AnimatePresence>
        {submitResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className={`${
              submitResult.success
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-red-500/30 bg-red-500/5'
            } ${dt.casinoCard}`}>
              <CardContent className="p-5 text-center relative z-10">
                {submitResult.success ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3"
                    >
                      <CheckCircle2 className="w-7 h-7 text-green-500" />
                    </motion.div>
                    <h3 className="text-base font-bold text-green-500 mb-1">Pendaftaran Berhasil!</h3>
                    {submitResult.gamertag && (
                      <p className="text-sm font-medium mb-2">
                        Gamertag kamu: <span className={`${division === 'male' ? 'text-idm-male' : 'text-idm-female'} font-bold`}>{submitResult.gamertag}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{submitResult.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setSubmitResult(null)}
                    >
                      Daftar Lagi
                    </Button>
                  </>
                ) : (
                  <>
                    <X className="w-7 h-7 text-red-500 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-red-500 mb-1">Gagal Mendaftar</h3>
                    <p className="text-xs text-muted-foreground">{submitResult.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setSubmitResult(null)}
                    >
                      Coba Lagi
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Form */}
      {!submitResult && (
        <motion.div variants={item}>
          <Card className={`${dt.casinoCard}`}>
            <div className={dt.casinoBar} />
            <CardContent className="p-5 relative z-10 space-y-4">
              {/* Division Selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Division</label>
                <div className="flex items-center bg-muted rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => { setDivision('male'); setFormData(p => ({ ...p, clubId: '' })); }}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      division === 'male'
                        ? 'bg-idm-male text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🕺 Male
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDivision('female'); setFormData(p => ({ ...p, clubId: '' })); }}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      division === 'female'
                        ? 'bg-idm-female text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    💃 Female
                  </button>
                </div>
              </div>

              {/* Nama/Nick - Wajib */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Nama / Nick <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Masukkan nama atau nickname kamu"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="pl-9 glass"
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Joki - Optional */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Joki <span className="text-muted-foreground/50 text-[10px]">(opsional)</span>
                </label>
                <Input
                  placeholder="Nama joki jika dimainkan orang lain"
                  value={formData.joki}
                  onChange={(e) => setFormData(p => ({ ...p, joki: e.target.value }))}
                  className="glass"
                  maxLength={30}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Diisi jika player dijokikan oleh player lain</p>
              </div>

              {/* No WhatsApp - Optional */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  No. WhatsApp <span className="text-muted-foreground/50 text-[10px]">(opsional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="pl-9 glass"
                    type="tel"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Kota - Wajib */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Kota <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Contoh: Makassar, Jakarta, Bandung"
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="pl-9 glass"
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Club - Optional */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Club <span className="text-muted-foreground/50 text-[10px]">(opsional)</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select
                    value={formData.clubId}
                    onValueChange={(val) => setFormData(p => ({ ...p, clubId: val === '_none' ? '' : val }))}
                  >
                    <SelectTrigger className="pl-9 glass">
                      <SelectValue placeholder="Pilih Club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Tanpa Club</SelectItem>
                      {clubs?.map((c: { id: string; name: string }) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className={`w-full font-semibold ${
                  division === 'male'
                    ? 'bg-idm-male hover:bg-idm-male/90 text-white'
                    : 'bg-idm-female hover:bg-idm-female/90 text-white'
                }`}
                size="lg"
                disabled={!formData.name.trim() || !formData.city.trim() || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Mendaftar...' : `Daftar ${divisionEmoji} ${division === 'male' ? 'Male' : 'Female'}`}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Pendaftaran akan diverifikasi oleh admin sebelum disetujui
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
