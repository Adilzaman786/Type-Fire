export type ThemeId = 'midnight-ocean' | 'sunset-ember' | 'forest-mist' | 'cyber-neon' | 'obsidian-steel';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  dotColor: string;
  blobColors: {
    blob1: string;
    blob2: string;
    blob3: string;
  };
  accentColor: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  accentGradient: string;
  accentGlow: string;
  targetKeyClass: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'midnight-ocean': {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    tagline: 'Deep abyssal navy and glowing cyan waters',
    dotColor: '#06b6d4',
    blobColors: {
      blob1: 'rgba(6, 182, 212, 0.12)', // cyan
      blob2: 'rgba(79, 70, 229, 0.10)', // indigo
      blob3: 'rgba(14, 165, 233, 0.08)', // sky
    },
    accentColor: '#06b6d4',
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-400/40',
    accentBg: 'bg-cyan-500/15',
    accentGradient: 'from-cyan-500 to-indigo-600',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    targetKeyClass: 'theme-ocean-target',
  },
  'sunset-ember': {
    id: 'sunset-ember',
    name: 'Sunset Ember',
    tagline: 'Warm golden flames and fiery coral twilight',
    dotColor: '#f59e0b',
    blobColors: {
      blob1: 'rgba(245, 158, 11, 0.12)', // amber
      blob2: 'rgba(239, 68, 68, 0.09)', // red
      blob3: 'rgba(217, 119, 6, 0.08)', // orange
    },
    accentColor: '#f59e0b',
    accentText: 'text-amber-300',
    accentBorder: 'border-amber-400/40',
    accentBg: 'bg-amber-500/15',
    accentGradient: 'from-amber-500 to-rose-600',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    targetKeyClass: 'theme-ember-target',
  },
  'forest-mist': {
    id: 'forest-mist',
    name: 'Forest Mist',
    tagline: 'Jade bioluminescence and cool emerald moss',
    dotColor: '#10b981',
    blobColors: {
      blob1: 'rgba(16, 185, 129, 0.12)', // emerald
      blob2: 'rgba(20, 184, 166, 0.10)', // teal
      blob3: 'rgba(5, 150, 105, 0.08)', // green
    },
    accentColor: '#10b981',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-400/40',
    accentBg: 'bg-emerald-500/15',
    accentGradient: 'from-emerald-500 to-teal-600',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    targetKeyClass: 'theme-forest-target',
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    tagline: 'Hyper-vibrant violet and electric magenta',
    dotColor: '#c084fc',
    blobColors: {
      blob1: 'rgba(168, 85, 247, 0.13)', // purple
      blob2: 'rgba(236, 72, 153, 0.10)', // pink
      blob3: 'rgba(139, 92, 246, 0.08)', // violet
    },
    accentColor: '#c084fc',
    accentText: 'text-purple-300',
    accentBorder: 'border-purple-400/40',
    accentBg: 'bg-purple-500/15',
    accentGradient: 'from-purple-500 to-pink-600',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    targetKeyClass: 'theme-neon-target',
  },
  'obsidian-steel': {
    id: 'obsidian-steel',
    name: 'Obsidian Steel',
    tagline: 'Minimalist titanium graphite and crystalline silver',
    dotColor: '#cbd5e1',
    blobColors: {
      blob1: 'rgba(203, 213, 225, 0.10)', // slate
      blob2: 'rgba(148, 163, 184, 0.08)', // steel
      blob3: 'rgba(100, 116, 139, 0.07)', // dark slate
    },
    accentColor: '#cbd5e1',
    accentText: 'text-slate-100',
    accentBorder: 'border-slate-300/40',
    accentBg: 'bg-slate-400/15',
    accentGradient: 'from-slate-300 to-slate-500',
    accentGlow: 'rgba(203, 213, 225, 0.3)',
    targetKeyClass: 'theme-steel-target',
  },
};
