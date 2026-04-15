'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Shield, Users, Music, Trophy, Gift, Plus, Check,
  Play, Zap, Crown, Settings, UserPlus, X, Save, Loader2, Clock, MapPin, Phone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { TierBadge } from './tier-badge';
import { StatusBadge } from './status-badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDivisionTheme } from '@/hooks/use-division-theme';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

const statusLabelMap: Record<string, string> = {
  setup: 'Persiapan',
  registration: 'Registrasi',
  approval: 'Persetujuan',
  team_generation: 'Buat Tim',
  bracket_generation: 'Buat Bracket',
  main_event: 'Acara Utama',
  scoring: 'Skor',
  completed: 'Selesai',
};

export function AdminPanel() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const qc = useQueryClient();

  const { data: players } = useQuery({
    queryKey: ['admin-players', division],
    queryFn: async () => { const res = await fetch(`/api/players?division=${division}`); return res.json(); },
  });

  const { data: tournaments } = useQuery({
    queryKey: ['admin-tournaments', division],
    queryFn: async () => { const res = await fetch(`/api/tournaments?division=${division}`); return res.json(); },
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => { const res = await fetch(`/api/stats?division=${division}`); return res.json(); },
  });

  const { data: donations } = useQuery({
    queryKey: ['admin-donations', division],
    queryFn: async () => { const res = await fetch(`/api/donations`); return res.json(); },
  });

  const { data: clubs } = useQuery({
    queryKey: ['admin-clubs', division],
    queryFn: async () => {
      const seasonId = stats?.season?.id;
      if (!seasonId) return [];
      const res = await fetch(`/api/clubs?seasonId=${seasonId}`);
      return res.json();
    },
    enabled: !!stats?.season?.id,
  });

  // Selected tournament for detailed management
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const { data: selectedTournament } = useQuery({
    queryKey: ['admin-tournament', selectedTournamentId],
    queryFn: async () => {
      if (!selectedTournamentId) return null;
      const res = await fetch(`/api/tournaments/${selectedTournamentId}`);
      return res.json();
    },
    enabled: !!selectedTournamentId,
  });

  // Mutations
  const createTournament = useMutation({
    mutationFn: async (data: { name: string; weekNumber: number; prizePool: number }) => {
      const res = await fetch('/api/tournaments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, division, seasonId: stats?.season?.id }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); toast.success('Tournament berhasil dibuat!'); },
  });

  const updateTier = useMutation({
    mutationFn: async ({ playerId, tier }: { playerId: string; tier: string }) => {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-players', division] }); toast.success('Tier diperbarui!'); },
  });

  const createPlayer = useMutation({
    mutationFn: async (data: { name: string; gamertag: string; tier: string }) => {
      const res = await fetch('/api/players', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, division }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-players', division] }); toast.success('Player berhasil ditambahkan!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const advanceStatus = useMutation({
    mutationFn: async ({ tournamentId, status }: { tournamentId: string; status: string }) => {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedTournamentId] }); toast.success('Status diperbarui!'); },
  });

  const approvePlayer = useMutation({
    mutationFn: async ({ tournamentId, playerId, tier }: { tournamentId: string; playerId: string; tier: string }) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, tier, approve: true }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournament', selectedTournamentId] }); toast.success('Player disetujui!'); },
  });

  const registerPlayer = useMutation({
    mutationFn: async ({ tournamentId, playerId }: { tournamentId: string; playerId: string }) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournament', selectedTournamentId] }); toast.success('Player terdaftar!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const generateTeams = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/generate-teams`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedTournamentId] }); toast.success('Tim berhasil di-generate!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const generateBracket = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/generate-bracket`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedTournamentId] }); toast.success('Bracket berhasil di-generate!'); },
  });

  const addDonation = useMutation({
    mutationFn: async (data: { donorName: string; amount: number; message: string; tournamentId?: string }) => {
      const res = await fetch('/api/donations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'weekly', seasonId: stats?.season?.id }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-donations', division] }); toast.success('Donasi berhasil ditambahkan!'); },
  });

  // Pending registrations (all divisions)
  const { data: pendingRegistrations } = useQuery({
    queryKey: ['admin-pending-registrations'],
    queryFn: async () => { const res = await fetch('/api/players?registrationStatus=pending'); return res.json(); },
  });

  const approveRegistration = useMutation({
    mutationFn: async ({ playerId, tier }: { playerId: string; tier: string }) => {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationStatus: 'approved', tier }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-registrations'] }); qc.invalidateQueries({ queryKey: ['admin-players', division] }); toast.success('Pendaftaran disetujui!'); },
  });

  const rejectRegistration = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationStatus: 'rejected', isActive: false }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-registrations'] }); qc.invalidateQueries({ queryKey: ['admin-players', division] }); toast.success('Pendaftaran ditolak.'); },
  });

  const createClub = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/clubs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, division, seasonId: stats?.season?.id }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-clubs', division] }); toast.success('Club berhasil dibuat!'); },
  });

  const scoreLeagueMatch = useMutation({
    mutationFn: async ({ matchId, score1, score2 }: { matchId: string; score1: number; score2: number }) => {
      const res = await fetch(`/api/league-matches/${matchId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score1, score2 }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stats', division] }); toast.success('Skor match berhasil!'); },
  });

  const scorePlayoffMatch = useMutation({
    mutationFn: async ({ matchId, score1, score2 }: { matchId: string; score1: number; score2: number }) => {
      const res = await fetch(`/api/playoff-matches/${matchId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score1, score2 }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stats', division] }); toast.success('Skor playoff berhasil!'); },
  });

  const [newTournament, setNewTournament] = useState({ name: '', weekNumber: '', prizePool: '', bpm: '' });
  const [newDonation, setNewDonation] = useState({ donorName: '', amount: '', message: '' });
  const [newClub, setNewClub] = useState('');
  const [newPlayer, setNewPlayer] = useState({ name: '', gamertag: '', tier: 'B' });
  const [searchPlayer, setSearchPlayer] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const filteredPlayers = players?.filter((p: { gamertag: string; name: string }) =>
    p.gamertag.toLowerCase().includes(searchPlayer.toLowerCase()) ||
    p.name.toLowerCase().includes(searchPlayer.toLowerCase())
  ) || [];

  const nextStatusMap: Record<string, string> = {
    setup: 'registration', registration: 'approval', approval: 'team_generation',
    team_generation: 'bracket_generation', bracket_generation: 'main_event',
    main_event: 'scoring', scoring: 'completed',
  };

  // Registered but not approved players in selected tournament
  const pendingApprovals = selectedTournament?.participations?.filter((p: { status: string }) => p.status === 'registered') || [];
  const approvedPlayers = selectedTournament?.participations?.filter((p: { status: string }) => ['approved', 'assigned'].includes(p.status)) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${dt.neonText}`} />
          <h2 className="text-lg font-bold text-gradient-fury">Panel Admin</h2>
          <Badge className="bg-red-500/10 text-red-500 text-[10px] border-0">ADMIN</Badge>
        </div>
        <Button variant="outline" size="sm" className="text-xs"
          onClick={() => setConfirmDialog({
            open: true,
            title: 'Re-seed Database?',
            description: 'Semua data saat ini akan dihapus dan diganti dengan data awal. Tindakan ini tidak dapat dibatalkan.',
            onConfirm: async () => {
              await fetch('/api/seed', { method: 'POST' });
              qc.invalidateQueries();
              toast.success('Database berhasil di-reseed!');
            }
          })}>
          🔄 Re-seed Data
        </Button>
      </div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="w-full grid grid-cols-5 bg-muted/50 h-auto">
          <TabsTrigger value="players" className="text-xs py-2"><Users className="w-3 h-3 mr-1" />Players</TabsTrigger>
          <TabsTrigger value="tournaments" className="text-xs py-2"><Music className="w-3 h-3 mr-1" />Tourney</TabsTrigger>
          <TabsTrigger value="matches" className="text-xs py-2"><Trophy className="w-3 h-3 mr-1" />Match</TabsTrigger>
          <TabsTrigger value="clubs" className="text-xs py-2"><Settings className="w-3 h-3 mr-1" />Club</TabsTrigger>
          <TabsTrigger value="donations" className="text-xs py-2"><Gift className="w-3 h-3 mr-1" />Donasi</TabsTrigger>
        </TabsList>

        {/* ====== PLAYERS TAB ====== */}
        <TabsContent value="players">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {/* Pending Registrations */}
            {pendingRegistrations?.length > 0 && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-yellow-500">
                    <Clock className="w-4 h-4" /> Pendaftaran Menunggu Persetujuan ({pendingRegistrations.length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {pendingRegistrations.map((p: { id: string; name: string; gamertag: string; division: string; city: string; phone: string | null; joki: string | null; createdAt: string }) => (
                      <motion.div key={p.id} variants={item}
                        className="p-3 rounded-xl bg-card border border-yellow-500/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold">{p.name}</p>
                              <Badge className={`text-[9px] border-0 ${p.division === 'male' ? 'bg-idm-male/10 text-idm-male' : 'bg-idm-female/10 text-idm-female'}`}>
                                {p.division === 'male' ? '🕺 Male' : '💃 Female'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city || '-'}</span>
                              {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                              {p.joki && <span className="flex items-center gap-1">🎮 Joki: {p.joki}</span>}
                              <span>Gamertag: <span className="font-medium text-foreground">{p.gamertag}</span></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Select onValueChange={(tier) => setConfirmDialog({
                              open: true,
                              title: 'Setujui Pendaftaran?',
                              description: `Setujui "${p.name}" sebagai tier ${tier} di division ${p.division}.`,
                              onConfirm: () => approveRegistration.mutate({ playerId: p.id, tier })
                            })}>
                              <SelectTrigger className="w-20 h-7 text-[10px]"><SelectValue placeholder="Setujui" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="S">Sebagai S</SelectItem>
                                <SelectItem value="A">Sebagai A</SelectItem>
                                <SelectItem value="B">Sebagai B</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => setConfirmDialog({
                                open: true,
                                title: 'Tolak Pendaftaran?',
                                description: `Tolak pendaftaran "${p.name}". Player akan ditandai sebagai rejected.`,
                                onConfirm: () => rejectRegistration.mutate(p.id)
                              })}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add new player */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <UserPlus className={`w-4 h-4 ${dt.neonText}`} /> Add Player
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input placeholder="Nama" value={newPlayer.name} onChange={(e) => setNewPlayer(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Gamertag" value={newPlayer.gamertag} onChange={(e) => setNewPlayer(p => ({ ...p, gamertag: e.target.value }))} />
                  <Select value={newPlayer.tier} onValueChange={(t) => setNewPlayer(p => ({ ...p, tier: t }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S Tier</SelectItem>
                      <SelectItem value="A">A Tier</SelectItem>
                      <SelectItem value="B">B Tier</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={!newPlayer.name || !newPlayer.gamertag || createPlayer.isPending}
                    onClick={() => { createPlayer.mutate(newPlayer); setNewPlayer({ name: '', gamertag: '', tier: 'B' }); }}>
                    {createPlayer.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <Input placeholder="🔍 Cari players..." value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)} className="glass" />

            {/* Player list */}
            <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredPlayers.map((p: { id: string; gamertag: string; name: string; tier: string; points: number; totalWins: number; streak: number; totalMvp: number; matches: number; isActive: boolean }) => (
                <motion.div key={p.id} variants={item}
                  className={`flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 ${dt.casinoGlow}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${dt.iconBg} flex items-center justify-center text-xs font-bold ${dt.neonText} shrink-0`}>
                      {p.gamertag.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.gamertag}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{p.points} pts</span>
                        <span>•</span>
                        <span>{p.totalWins}W</span>
                        <span>•</span>
                        <span>{p.totalMvp} MVP</span>
                        {p.streak > 1 && <span className="text-orange-400">🔥{p.streak}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={p.tier} onValueChange={(tier) => updateTier.mutate({ playerId: p.id, tier })}>
                      <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ====== TOURNAMENTS TAB ====== */}
        <TabsContent value="tournaments">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* Create tournament */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className={`w-4 h-4 ${dt.neonText}`} /> Create Tournament
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <Input placeholder="Nama" value={newTournament.name} onChange={(e) => setNewTournament(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Week #" type="number" value={newTournament.weekNumber} onChange={(e) => setNewTournament(p => ({ ...p, weekNumber: e.target.value }))} />
                  <Input placeholder="Prize (IDR)" type="number" value={newTournament.prizePool} onChange={(e) => setNewTournament(p => ({ ...p, prizePool: e.target.value }))} />
                  <Input placeholder="BPM (contoh 128)" type="number" value={newTournament.bpm} onChange={(e) => setNewTournament(p => ({ ...p, bpm: e.target.value }))} />
                  <Button size="sm" disabled={!newTournament.name || !newTournament.weekNumber || createTournament.isPending}
                    onClick={() => createTournament.mutate({ name: newTournament.name, weekNumber: parseInt(newTournament.weekNumber), prizePool: parseInt(newTournament.prizePool) || 0, bpm: parseInt(newTournament.bpm) || 128 })}>
                    {createTournament.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Create
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tournament list */}
            <div className="space-y-2">
              {tournaments?.map((t: { id: string; name: string; weekNumber: number; status: string; prizePool: number; _count?: { teams: number; participations: number } }) => (
                <motion.div key={t.id} variants={item}>
                  <Card className={`${dt.casinoCard} ${dt.casinoGlow} casino-shimmer cursor-pointer ${selectedTournamentId === t.id ? `ring-1 ${dt.border}` : ''}`}
                    onClick={() => setSelectedTournamentId(selectedTournamentId === t.id ? null : t.id)}>
                    <div className={dt.casinoBar} />
                    <CardContent className="p-3 relative z-10">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={t.status} />
                            <span className="text-[10px] text-muted-foreground">Week {t.weekNumber}</span>
                            <span className="text-[10px] text-muted-foreground">{formatCurrency(t.prizePool)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          {nextStatusMap[t.status] && t.status !== 'completed' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-7" disabled={advanceStatus.isPending}
                              onClick={() => setConfirmDialog({
                                open: true,
                                title: `Ubah Status ke ${statusLabelMap[nextStatusMap[t.status]]}?`,
                                description: `Tournament "${t.name}" akan diubah ke status "${statusLabelMap[nextStatusMap[t.status]]}".`,
                                onConfirm: () => advanceStatus.mutate({ tournamentId: t.id, status: nextStatusMap[t.status] })
                              })}>
                              {advanceStatus.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />} {statusLabelMap[nextStatusMap[t.status]] || nextStatusMap[t.status].replace(/_/g, ' ')}
                            </Button>
                          )}
                          {t.status === 'approval' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-7" disabled={generateTeams.isPending} onClick={() => generateTeams.mutate(t.id)}>
                              {generateTeams.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Users className="w-3 h-3 mr-1" />} Buat Tim
                            </Button>
                          )}
                          {t.status === 'team_generation' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-7" disabled={generateBracket.isPending} onClick={() => generateBracket.mutate(t.id)}>
                              {generateBracket.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Music className="w-3 h-3 mr-1" />} Buat Bracket
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Selected Tournament Detail */}
            {selectedTournament && (
              <Card className={`${dt.casinoCard} ${dt.cornerAccent}`}>
                <div className={dt.casinoBar} />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">{selectedTournament.name} — Manajemen</h3>
                    <StatusBadge status={selectedTournament.status} />
                  </div>

                  {/* Pending Approvals */}
                  {pendingApprovals.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-yellow-500 mb-2">⏳ Menunggu Persetujuan ({pendingApprovals.length})</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                        {pendingApprovals.map((p: { id: string; playerId: string; player: { id: string; gamertag: string; tier: string; points: number } }) => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                            <div className="flex items-center gap-2">
                              <TierBadge tier={p.player.tier} />
                              <span className="text-xs font-medium">{p.player.gamertag}</span>
                              <span className="text-[10px] text-muted-foreground">{p.player.points}pts</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Select onValueChange={(tier) => approvePlayer.mutate({ tournamentId: selectedTournament.id, playerId: p.playerId, tier })}>
                                <SelectTrigger className="w-20 h-6 text-[10px]"><SelectValue placeholder="Setujui" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="S">Sebagai S</SelectItem>
                                  <SelectItem value="A">Sebagai A</SelectItem>
                                  <SelectItem value="B">Sebagai B</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Register Players */}
                  {(selectedTournament.status === 'registration' || selectedTournament.status === 'setup') && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-blue-500 mb-2">📋 Daftar Players</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {players?.filter((p: { id: string }) => !selectedTournament.participations?.some((pp: { playerId: string }) => pp.playerId === p.id)).slice(0, 6).map((p: { id: string; gamertag: string; tier: string }) => (
                          <div key={p.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <TierBadge tier={p.tier} />
                              <span className="text-xs">{p.gamertag}</span>
                            </div>
                            <Button size="sm" variant="ghost" className={`h-6 text-[10px] ${dt.neonText}`}
                              onClick={() => registerPlayer.mutate({ tournamentId: selectedTournament.id, playerId: p.id })}>
                              <UserPlus className="w-3 h-3 mr-1" /> Daftar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teams & Match info */}
                  {selectedTournament.teams?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-500 mb-2">✅ Tim ({selectedTournament.teams.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedTournament.teams.map((t: { id: string; name: string; power: number; isWinner: boolean; teamPlayers: { player: { gamertag: string; tier: string; points: number } }[] }) => (
                          <div key={t.id} className={`p-2 rounded-lg text-xs ${t.isWinner ? 'bg-yellow-500/5 border border-yellow-500/10' : 'bg-muted/50'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{t.name} {t.isWinner && '👑'}</span>
                              <span className={dt.neonText}>⚡ {t.power}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {t.teamPlayers.map((tp: { player: { gamertag: string; tier: string } }) => (
                                <span key={tp.player.gamertag} className="flex items-center gap-1 casino-pill px-1.5 py-0.5 rounded">
                                  <TierBadge tier={tp.player.tier} /> {tp.player.gamertag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* ====== MATCHES TAB ====== */}
        <TabsContent value="matches">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* League Match Scoring */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${dt.neonText}`} /> Skor League Match
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {stats?.leagueMatches?.filter((m: { status: string }) => m.status === 'upcoming').map((m: { id: string; week: number; club1: { name: string }; club2: { name: string }; format: string }) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/30">
                      <div>
                        <p className="text-xs font-semibold">Week {m.week}: {m.club1.name} vs {m.club2.name}</p>
                        <Badge className={`${dt.casinoBadge} mt-0.5`}>{m.format}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 2-0 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 2, score2: 0 })
                          })}>
                          2-0 {m.club1.name.slice(0, 3)}
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 2-1 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 2, score2: 1 })
                          })}>
                          2-1
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 0-2 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 0, score2: 2 })
                          })}>
                          0-2 {m.club2.name.slice(0, 3)}
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 1-2 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 1, score2: 2 })
                          })}>
                          1-2
                        </Button>
                      </div>
                    </div>
                  ))}
                  {stats?.leagueMatches?.filter((m: { status: string }) => m.status === 'upcoming').length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Tidak ada league match mendatang</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Playoff Match Scoring */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" /> Skor Playoff Match
                </h3>
                <div className="space-y-2">
                  {stats?.playoffMatches?.map((m: { id: string; round: string; club1: { name: string }; club2: { name: string }; status: string; format: string; score1: number | null; score2: number | null }) => (
                    <div key={m.id} className={`p-3 rounded-lg border ${m.status === 'upcoming' ? 'bg-muted/50 border-border/30' : `${dt.bg} ${dt.border}`}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <Badge className="text-[9px] border-0 bg-yellow-500/10 text-yellow-500">
                            {m.round.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          <p className="text-xs font-semibold mt-1">{m.club1.name} vs {m.club2.name}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{m.format}</span>
                      </div>
                      {m.status === 'upcoming' ? (
                        <div className="flex gap-1 mt-2">
                          {[`3-0 ${m.club1.name.slice(0,3)}`, `3-1`, `3-2`, `0-3 ${m.club2.name.slice(0,3)}`, `1-3`, `2-3`].map((label, i) => {
                            const scores = [[3,0],[3,1],[3,2],[0,3],[1,3],[2,3]][i];
                            return (
                              <Button key={i} size="sm" variant="outline" className="h-6 text-[9px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  title: 'Konfirmasi Skor Playoff',
                                  description: `Set skor ${m.round.replace(/_/g, ' ')}: ${m.club1.name} ${scores[0]}-${scores[1]} ${m.club2.name}`,
                                  onConfirm: () => scorePlayoffMatch.mutate({ matchId: m.id, score1: scores[0], score2: scores[1] })
                                })}>
                                {label}
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={`text-sm font-bold ${dt.neonText} mt-1 casino-score`}>{m.score1} - {m.score2}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ====== CLUBS TAB ====== */}
        <TabsContent value="clubs">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className={`w-4 h-4 ${dt.neonText}`} /> Create Club
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Nama Club" value={newClub} onChange={(e) => setNewClub(e.target.value)} />
                  <Button size="sm" onClick={() => { createClub.mutate(newClub); setNewClub(''); }} disabled={!newClub || createClub.isPending}>{createClub.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Create</Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {clubs?.map((c: { id: string; name: string; wins: number; losses: number; points: number; gameDiff: number; _count?: { members: number } }) => (
                <motion.div key={c.id} variants={item}>
                  <Card className={`${dt.casinoCard} ${dt.casinoGlow} casino-shimmer`}>
                    <div className={dt.casinoBar} />
                    <CardContent className="p-3 flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{c.wins}W - {c.losses}L</span>
                          <span>•</span>
                          <span>{c.points} pts</span>
                          <span>•</span>
                          <span>GD: {c.gameDiff > 0 ? '+' : ''}{c.gameDiff}</span>
                        </div>
                      </div>
                      <Badge className={dt.casinoBadge}>{c._count?.members || 0} anggota</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ====== DONATIONS TAB ====== */}
        <TabsContent value="donations">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className={`w-4 h-4 ${dt.neonText}`} /> Add Donasi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input placeholder="Nama Donatur" value={newDonation.donorName} onChange={(e) => setNewDonation(p => ({ ...p, donorName: e.target.value }))} />
                  <Input placeholder="Jumlah (IDR)" type="number" value={newDonation.amount} onChange={(e) => setNewDonation(p => ({ ...p, amount: e.target.value }))} />
                  <Input placeholder="Pesan" value={newDonation.message} onChange={(e) => setNewDonation(p => ({ ...p, message: e.target.value }))} />
                  <Button size="sm" disabled={!newDonation.donorName || !newDonation.amount || addDonation.isPending}
                    onClick={() => { addDonation.mutate({ donorName: newDonation.donorName, amount: parseInt(newDonation.amount) || 0, message: newDonation.message }); setNewDonation({ donorName: '', amount: '', message: '' }); }}>
                    {addDonation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
              {donations?.slice(0, 20).map((d: { id: string; donorName: string; amount: number; message: string | null; type: string; createdAt: string }) => (
                <motion.div key={d.id} variants={item} className={`flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50 ${dt.casinoGlow}`}>
                  <div className="flex items-center gap-2">
                    <Gift className={`w-3.5 h-3.5 ${dt.neonText}`} />
                    <div>
                      <p className="text-xs font-medium">{d.donorName}</p>
                      {d.message && <p className="text-[10px] text-muted-foreground">{d.message}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${dt.neonText}`}>{formatCurrency(d.amount)}</p>
                    <Badge className="text-[9px] border-0 bg-muted text-muted-foreground">{d.type}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
