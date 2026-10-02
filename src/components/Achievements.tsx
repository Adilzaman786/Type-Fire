import React, { useState, useMemo } from 'react';
import { UserStats, Achievement } from '../types/typing';
import { ACHIEVEMENTS, getAchievementProgress } from '../data/achievements';
import {
  Zap,
  TrendingUp,
  Flame,
  Gauge,
  Trophy,
  Sparkles,
  Calendar,
  Award,
  ShieldCheck,
  Target,
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
  Gamepad2,
  GraduationCap,
  Crown,
  Lock,
  Unlock,
  Medal,
  Check
} from 'lucide-react';

interface AchievementsProps {
  stats: UserStats;
}

// Icon mapper helper
const renderIcon = (name: string, isUnlocked: boolean, tier: Achievement['tier']) => {
  const props = { className: 'w-6 h-6' };
  switch (name) {
    case 'Zap': return <Zap {...props} />;
    case 'TrendingUp': return <TrendingUp {...props} />;
    case 'Flame': return <Flame {...props} />;
    case 'Gauge': return <Gauge {...props} />;
    case 'Trophy': return <Trophy {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'Calendar': return <Calendar {...props} />;
    case 'Award': return <Award {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'Target': return <Target {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'Layers': return <Layers {...props} />;
    case 'CheckCircle2': return <CheckCircle2 {...props} />;
    case 'Gamepad2': return <Gamepad2 {...props} />;
    case 'GraduationCap': return <GraduationCap {...props} />;
    case 'Crown': return <Crown {...props} />;
    default: return <Medal {...props} />;
  }
};

const TIER_STYLES: Record<Achievement['tier'], {
  badgeBg: string;
  glowBorder: string;
  textColor: string;
  tagBg: string;
  iconGlow: string;
}> = {
  bronze: {
    badgeBg: 'from-amber-900/30 via-amber-800/10 to-transparent',
    glowBorder: 'border-amber-600/40 hover:border-amber-500/70',
    textColor: 'text-amber-200',
    tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    iconGlow: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  },
  silver: {
    badgeBg: 'from-slate-600/30 via-slate-700/10 to-transparent',
    glowBorder: 'border-slate-400/40 hover:border-slate-300/70',
    textColor: 'text-slate-100',
    tagBg: 'bg-slate-400/20 text-slate-200 border-slate-400/30',
    iconGlow: 'text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.5)]',
  },
  gold: {
    badgeBg: 'from-yellow-600/30 via-amber-500/10 to-transparent',
    glowBorder: 'border-yellow-400/50 hover:border-yellow-300/80',
    textColor: 'text-yellow-100',
    tagBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    iconGlow: 'text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]',
  },
  diamond: {
    badgeBg: 'from-cyan-600/30 via-indigo-600/15 to-transparent',
    glowBorder: 'border-cyan-400/60 hover:border-cyan-300/90',
    textColor: 'text-cyan-100',
    tagBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    iconGlow: 'text-cyan-300 drop-shadow-[0_0_14px_rgba(6,182,212,0.8)]',
  },
};

export const Achievements: React.FC<AchievementsProps> = ({ stats }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wpm' | 'streak' | 'mastery'>('all');

  // Filtered achievements
  const filteredList = useMemo(() => {
    if (selectedCategory === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  // Overall statistics count
  const achievementProgresses = useMemo(() => {
    return ACHIEVEMENTS.map((ach) => ({
      achievement: ach,
      ...getAchievementProgress(ach, stats),
    }));
  }, [stats]);

  const unlockedCount = achievementProgresses.filter((a) => a.isUnlocked).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08] shadow-2xl space-y-6">
      {/* Top Header: Unboxed stats & title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Virtual Milestone Badges</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{unlockedCount} of {totalCount} Unlocked</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Typing Speed & Streak Achievements
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Unlock prestige medals by breaking WPM velocity records, maintaining daily streaks, and completing training drills.
          </p>
        </div>

        {/* Unlocked Progress Tracker Bar */}
        <div className="w-full md:w-64 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-400">Total Unlocked</span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {unlockedCount} / {totalCount} ({completionPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs (Functional segmented controls) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-white/[0.1] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Badges ({totalCount})
        </button>
        <button
          onClick={() => setSelectedCategory('wpm')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'wpm'
              ? 'bg-white/[0.1] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          WPM Velocity (6)
        </button>
        <button
          onClick={() => setSelectedCategory('streak')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'streak'
              ? 'bg-white/[0.1] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Daily Streaks (4)
        </button>
        <button
          onClick={() => setSelectedCategory('mastery')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'mastery'
              ? 'bg-white/[0.1] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Curriculum & Mastery (8)
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((achievement) => {
          const { current, isUnlocked, percentage } = getAchievementProgress(achievement, stats);
          const style = TIER_STYLES[achievement.tier];

          return (
            <div
              key={achievement.id}
              className={`relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                isUnlocked
                  ? `glass-panel bg-gradient-to-br ${style.badgeBg} ${style.glowBorder} shadow-lg shadow-black/40`
                  : 'bg-white/[0.02] border-white/[0.06] opacity-70 hover:opacity-85'
              }`}
            >
              {/* Subtle tier ambient light */}
              {isUnlocked && (
                <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />
              )}

              <div className="space-y-3 relative z-10">
                {/* Header row: Icon & Status */}
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-xl border backdrop-blur-md transition-transform group-hover:scale-105 ${
                      isUnlocked
                        ? `bg-slate-900/80 ${style.glowBorder} ${style.iconGlow}`
                        : 'bg-slate-900/60 border-white/[0.08] text-slate-500'
                    }`}
                  >
                    {renderIcon(achievement.icon, isUnlocked, achievement.tier)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border capitalize ${
                      isUnlocked ? style.tagBg : 'bg-slate-800 text-slate-400 border-white/5'
                    }`}>
                      {achievement.tier}
                    </span>

                    {isUnlocked ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" /> Unlocked
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Locked
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className={`text-base font-bold transition-colors ${
                    isUnlocked ? 'text-white' : 'text-slate-300'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] relative z-10 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Target:</span>
                  <span className={isUnlocked ? 'text-cyan-300 font-semibold' : 'text-slate-300'}>
                    {current} / {achievement.targetValue} {achievement.unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
