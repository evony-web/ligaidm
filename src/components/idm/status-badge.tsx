'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config: Record<string, { label: string; cls: string; pulse?: boolean }> = {
    setup: { label: 'Setup', cls: 'bg-muted text-muted-foreground' },
    registration: { label: '🟢 Registration Open', cls: 'bg-green-500/10 text-green-500' },
    approval: { label: '⏳ Approval', cls: 'bg-yellow-500/10 text-yellow-500' },
    team_generation: { label: '✅ Teams Ready', cls: 'bg-blue-500/10 text-blue-500' },
    bracket_generation: { label: '✅ Bracket Ready', cls: 'bg-blue-500/10 text-blue-500' },
    main_event: { label: '🔴 LIVE NOW', cls: 'bg-red-500/10 text-red-500', pulse: true },
    scoring: { label: '📊 Scoring', cls: 'bg-yellow-500/10 text-yellow-500' },
    completed: { label: '🏆 Completed', cls: 'bg-muted text-muted-foreground' },
    upcoming: { label: '📅 Upcoming', cls: 'bg-blue-500/10 text-blue-500' },
    live: { label: '🔴 LIVE', cls: 'bg-red-500/10 text-red-500', pulse: true },
    active: { label: '🟢 Active', cls: 'bg-green-500/10 text-green-500' },
    registered: { label: 'Registered', cls: 'bg-blue-500/10 text-blue-500' },
    approved: { label: 'Approved', cls: 'bg-green-500/10 text-green-500' },
    assigned: { label: 'Assigned', cls: 'bg-green-500/10 text-green-500' },
    rejected: { label: 'Rejected', cls: 'bg-red-500/10 text-red-500' },
  };

  const c = config[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <Badge className={`${c.cls} ${textSize} font-semibold border-0 ${c.pulse ? 'live-dot' : ''}`}>
      {c.label}
    </Badge>
  );
}
