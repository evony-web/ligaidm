'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Shield, Users, Swords, Trophy, Gift, Plus, Check,
  Play, Zap, Crown, Settings, ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TierBadge } from './tier-badge';
import { useState } from 'react';
import { toast } from 'sonner';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export function AdminPanel() {
  const { division } = useAppStore();
  const qc = useQueryClient();

  const { data: players } = useQuery({
    queryKey: ['admin-players', division],
    queryFn: async () => {
      const res = await fetch(`/api/players?division=${division}`);
      return res.json();
    },
  });

  const { data: tournaments } = useQuery({
    queryKey: ['admin-tournaments', division],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments?division=${division}`);
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

  const { data: donations } = useQuery({
    queryKey: ['admin-donations', division],
    queryFn: async () => {
      const res = await fetch(`/api/donations`);
      return res.json();
    },
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

  // Mutations
  const createTournament = useMutation({
    mutationFn: async (data: { name: string; weekNumber: number; prizePool: number }) => {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, division, seasonId: stats?.season?.id }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); toast.success('Tournament created!'); },
    onError: () => { toast.error('Failed to create tournament'); },
  });

  const updateTier = useMutation({
    mutationFn: async ({ playerId, tier }: { playerId: string; tier: string }) => {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-players', division] }); toast.success('Tier updated!'); },
  });

  const advanceStatus = useMutation({
    mutationFn: async ({ tournamentId, status }: { tournamentId: string; status: string }) => {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); toast.success('Status updated!'); },
  });

  const generateTeams = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/generate-teams`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); toast.success('Teams generated!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const generateBracket = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/generate-bracket`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', division] }); toast.success('Bracket generated!'); },
  });

  const addDonation = useMutation({
    mutationFn: async (data: { donorName: string; amount: number; message: string }) => {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'weekly', seasonId: stats?.season?.id }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-donations', division] }); toast.success('Donation added!'); },
  });

  const createClub = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, division, seasonId: stats?.season?.id }),
      });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-clubs', division] }); toast.success('Club created!'); },
  });

  const [newTournament, setNewTournament] = useState({ name: '', weekNumber: '', prizePool: '' });
  const [newDonation, setNewDonation] = useState({ donorName: '', amount: '', message: '' });
  const [newClub, setNewClub] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');

  const filteredPlayers = players?.filter((p: { gamertag: string; name: string }) =>
    p.gamertag.toLowerCase().includes(searchPlayer.toLowerCase()) ||
    p.name.toLowerCase().includes(searchPlayer.toLowerCase())
  ) || [];

  const nextStatusMap: Record<string, string> = {
    setup: 'registration',
    registration: 'approval',
    approval: 'team_generation',
    team_generation: 'bracket_generation',
    bracket_generation: 'main_event',
    main_event: 'scoring',
    scoring: 'completed',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-gradient-fury">Admin Panel</h2>
        <Badge className="bg-red-500/10 text-red-500 text-[10px] border-0">ADMIN</Badge>
      </div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="w-full grid grid-cols-5 bg-muted/50 h-auto">
          <TabsTrigger value="players" className="text-xs py-2"><Users className="w-3 h-3 mr-1" />Players</TabsTrigger>
          <TabsTrigger value="tournaments" className="text-xs py-2"><Swords className="w-3 h-3 mr-1" />Tournaments</TabsTrigger>
          <TabsTrigger value="matches" className="text-xs py-2"><Trophy className="w-3 h-3 mr-1" />Matches</TabsTrigger>
          <TabsTrigger value="clubs" className="text-xs py-2"><Settings className="w-3 h-3 mr-1" />Clubs</TabsTrigger>
          <TabsTrigger value="donations" className="text-xs py-2"><Gift className="w-3 h-3 mr-1" />Donations</TabsTrigger>
        </TabsList>

        {/* PLAYERS TAB */}
        <TabsContent value="players">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <Input
              placeholder="Search players..."
              value={searchPlayer}
              onChange={(e) => setSearchPlayer(e.target.value)}
              className="glass"
            />
            <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredPlayers.map((p: { id: string; gamertag: string; name: string; tier: string; points: number; totalWins: number; streak: number; isActive: boolean }) => (
                <motion.div key={p.id} variants={item}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 card-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {p.gamertag.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.gamertag}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{p.points} pts</span>
                        <span>•</span>
                        <span>{p.totalWins}W</span>
                        {p.streak > 1 && <span className="text-orange-400">🔥{p.streak}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={p.tier}
                      onValueChange={(tier) => updateTier.mutate({ playerId: p.id, tier })}
                    >
                      <SelectTrigger className="w-16 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">S Tier</SelectItem>
                        <SelectItem value="A">A Tier</SelectItem>
                        <SelectItem value="B">B Tier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* TOURNAMENTS TAB */}
        <TabsContent value="tournaments">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* Create new tournament */}
            <Card className="glass border-0">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Create Tournament
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Tournament name" value={newTournament.name}
                    onChange={(e) => setNewTournament(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Week number" type="number" value={newTournament.weekNumber}
                    onChange={(e) => setNewTournament(p => ({ ...p, weekNumber: e.target.value }))} />
                  <Input placeholder="Prize pool (IDR)" type="number" value={newTournament.prizePool}
                    onChange={(e) => setNewTournament(p => ({ ...p, prizePool: e.target.value }))} />
                </div>
                <Button size="sm" className="mt-2"
                  onClick={() => createTournament.mutate({
                    name: newTournament.name,
                    weekNumber: parseInt(newTournament.weekNumber),
                    prizePool: parseInt(newTournament.prizePool) || 0,
                  })}
                  disabled={!newTournament.name || !newTournament.weekNumber}
                >
                  Create
                </Button>
              </CardContent>
            </Card>

            {/* Tournament list */}
            <div className="space-y-2">
              {tournaments?.map((t: { id: string; name: string; weekNumber: number; status: string; prizePool: number; _count?: { teams: number; participations: number } }) => (
                <motion.div key={t.id} variants={item}>
                  <Card className="glass border-0 card-hover">
                    <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="text-[10px] border-0 bg-primary/10 text-primary">{t.status}</Badge>
                          <span className="text-[10px] text-muted-foreground">Week {t.weekNumber}</span>
                          <span className="text-[10px] text-muted-foreground">{formatCurrency(t.prizePool)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {nextStatusMap[t.status] && t.status !== 'completed' && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7"
                            onClick={() => advanceStatus.mutate({ tournamentId: t.id, status: nextStatusMap[t.status] })}>
                            <Play className="w-3 h-3 mr-1" /> {nextStatusMap[t.status].replace('_', ' ')}
                          </Button>
                        )}
                        {t.status === 'approval' && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7"
                            onClick={() => generateTeams.mutate(t.id)}>
                            <Users className="w-3 h-3 mr-1" /> Gen Teams
                          </Button>
                        )}
                        {t.status === 'team_generation' && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7"
                            onClick={() => generateBracket.mutate(t.id)}>
                            <Swords className="w-3 h-3 mr-1" /> Gen Bracket
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* MATCHES TAB */}
        <TabsContent value="matches">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <Card className="glass border-0">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Match Management</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Select a tournament from the Tournament tab to manage matches. Use the tournament detail view to input scores and assign MVP.
                </p>
                <div className="space-y-2">
                  {tournaments?.filter((t: { status: string }) => ['main_event', 'scoring'].includes(t.status)).map((t: { id: string; name: string; weekNumber: number; status: string }) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{t.name} - Week {t.weekNumber}</p>
                        <Badge className="mt-1 text-[10px] border-0 bg-red-500/10 text-red-500">🔴 {t.status === 'main_event' ? 'LIVE' : 'SCORING'}</Badge>
                      </div>
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </div>
                  ))}
                  {tournaments?.filter((t: { status: string }) => ['main_event', 'scoring'].includes(t.status)).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No active matches</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* CLUBS TAB */}
        <TabsContent value="clubs">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <Card className="glass border-0">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Create Club
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Club name" value={newClub} onChange={(e) => setNewClub(e.target.value)} />
                  <Button size="sm" onClick={() => { createClub.mutate(newClub); setNewClub(''); }} disabled={!newClub}>Create</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {clubs?.map((c: { id: string; name: string; wins: number; losses: number; points: number; gameDiff: number; _count?: { members: number } }) => (
                <motion.div key={c.id} variants={item}>
                  <Card className="glass border-0 card-hover">
                    <CardContent className="p-3 flex items-center justify-between">
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
                      <Badge className="bg-primary/10 text-primary text-[10px] border-0">{c._count?.members || 0} members</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* DONATIONS TAB */}
        <TabsContent value="donations">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <Card className="glass border-0">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Add Donation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Donor name" value={newDonation.donorName}
                    onChange={(e) => setNewDonation(p => ({ ...p, donorName: e.target.value }))} />
                  <Input placeholder="Amount (IDR)" type="number" value={newDonation.amount}
                    onChange={(e) => setNewDonation(p => ({ ...p, amount: e.target.value }))} />
                  <Input placeholder="Message" value={newDonation.message}
                    onChange={(e) => setNewDonation(p => ({ ...p, message: e.target.value }))} />
                </div>
                <Button size="sm" className="mt-2"
                  onClick={() => {
                    addDonation.mutate({
                      donorName: newDonation.donorName,
                      amount: parseInt(newDonation.amount) || 0,
                      message: newDonation.message,
                    });
                    setNewDonation({ donorName: '', amount: '', message: '' });
                  }}
                  disabled={!newDonation.donorName || !newDonation.amount}
                >
                  Add Donation
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
              {donations?.slice(0, 20).map((d: { id: string; donorName: string; amount: number; message: string | null; type: string; createdAt: string }) => (
                <motion.div key={d.id} variants={item}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-xs font-medium">{d.donorName}</p>
                      {d.message && <p className="text-[10px] text-muted-foreground">{d.message}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">{formatCurrency(d.amount)}</p>
                    <Badge className="text-[9px] border-0 bg-muted text-muted-foreground">{d.type}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
