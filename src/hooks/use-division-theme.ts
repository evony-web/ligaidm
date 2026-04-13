'use client';

import { useAppStore } from '@/lib/store';
import type { Division } from '@/lib/store';

export interface DivisionTheme {
  division: Division;
  text: string;
  textLight: string;
  bg: string;
  bgSubtle: string;
  border: string;
  borderSubtle: string;
  glow: string;
  gradientText: string;
  iconBg: string;
  color: string;
  colorLight: string;
  tabBg: string;
  navActive: string;
  badgeBg: string;
}

const maleTheme: DivisionTheme = {
  division: 'male',
  text: 'text-idm-male',
  textLight: 'text-idm-male-light',
  bg: 'bg-idm-male/10',
  bgSubtle: 'bg-idm-male/5',
  border: 'border-idm-male/20',
  borderSubtle: 'border-idm-male/10',
  glow: 'glow-male',
  gradientText: 'text-gradient-male',
  iconBg: 'bg-idm-male/10',
  color: '#22d3ee',
  colorLight: '#67e8f9',
  tabBg: 'bg-idm-male/20',
  navActive: 'bg-idm-male/10 text-idm-male',
  badgeBg: 'bg-idm-male/20 text-idm-male border-idm-male/30',
};

const femaleTheme: DivisionTheme = {
  division: 'female',
  text: 'text-idm-female',
  textLight: 'text-idm-female-light',
  bg: 'bg-idm-female/10',
  bgSubtle: 'bg-idm-female/5',
  border: 'border-idm-female/20',
  borderSubtle: 'border-idm-female/10',
  glow: 'glow-female',
  gradientText: 'text-gradient-female',
  iconBg: 'bg-idm-female/10',
  color: '#c084fc',
  colorLight: '#e9d5ff',
  tabBg: 'bg-idm-female/20',
  navActive: 'bg-idm-female/10 text-idm-female',
  badgeBg: 'bg-idm-female/20 text-idm-female border-idm-female/30',
};

export function useDivisionTheme(): DivisionTheme {
  const division = useAppStore((s) => s.division);
  return division === 'male' ? maleTheme : femaleTheme;
}
