'use client';

import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Trophy, Users, Shield, Swords,
  Sun, Moon, Menu, X, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dashboard } from './dashboard';
import { TournamentView } from './tournament-view';
import { LeagueView } from './league-view';
import { AdminPanel } from './admin-panel';
import { DonationPopup } from './donation-popup';
import { useEffect, useState } from 'react';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: Gamepad2 },
  { id: 'tournament' as const, label: 'Tournament', icon: Swords },
  { id: 'league' as const, label: 'League', icon: Trophy },
  { id: 'admin' as const, label: 'Admin', icon: Shield },
];

function DivisionToggle() {
  const { division, setDivision } = useAppStore();
  return (
    <div className="flex items-center bg-muted rounded-full p-1 gap-1">
      <button
        onClick={() => setDivision('male')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          division === 'male'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        ⚔️ Male
      </button>
      <button
        onClick={() => setDivision('female')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          division === 'female'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        🗡️ Female
      </button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-16 h-8 rounded-full bg-muted transition-all duration-300 hover:scale-105"
      title={isDark ? 'Switch to Light Fury' : 'Switch to Night Fury'}
    >
      <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-xs ${
        isDark
          ? 'left-9 bg-teal-500 text-white'
          : 'left-1 bg-violet-500 text-white'
      }`}>
        {isDark ? '🌙' : '🐉'}
      </div>
    </button>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { currentView, setCurrentView, division, setDivision } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-gradient-fury text-sm font-bold leading-tight">IDM League</h1>
            <p className="text-[10px] text-muted-foreground">Fan Made Edition</p>
          </div>
        </div>
      </div>

      {/* Division Toggle */}
      <div className="px-4 pb-3">
        <DivisionToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); onNav?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-primary/10 text-primary glow-pulse'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {division === 'male' ? '🐉 Light Fury' : '🐉 Night Fury'}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const { currentView, donationPopup, hideDonationPopup } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'tournament': return <TournamentView />;
      case 'league': return <LeagueView />;
      case 'admin': return <AdminPanel />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 glass-strong px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-gradient-fury text-sm font-bold">IDM League</span>
        </div>
        <div className="flex items-center gap-2">
          <DivisionToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border glass-strong sticky top-0 h-screen">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-4 lg:p-6 pb-24 lg:pb-6"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border">
        <div className="flex justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => useAppStore.getState().setCurrentView(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_var(--idm-glow)]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Donation Popup */}
      <DonationPopup
        show={donationPopup.show}
        message={donationPopup.message}
        onClose={hideDonationPopup}
      />

      {/* Footer */}
      <footer className="mt-auto py-3 text-center text-xs text-muted-foreground border-t border-border hidden lg:block">
        <span className="text-gradient-fury font-semibold">IDM League</span> — Fan Made Edition © 2025
      </footer>
    </div>
  );
}
