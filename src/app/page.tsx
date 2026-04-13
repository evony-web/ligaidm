'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/idm/app-shell';

export default function Home() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30000, refetchOnWindowFocus: false },
    },
  }));
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    async function checkAndSeed() {
      try {
        const res = await fetch('/api/stats?division=male');
        const data = await res.json();
        if (!data.hasData) {
          await fetch('/api/seed', { method: 'POST' });
        }
        setSeeded(true);
      } catch {
        setSeeded(true);
      }
    }
    checkAndSeed();
  }, []);

  if (!seeded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-gradient-fury text-3xl font-bold mb-4">IDM League</div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading arena...</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
