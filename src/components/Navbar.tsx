import React, { useState } from 'react';
import { TabMode, SwitchSound } from '../types/typing';
import { ThemeId, THEMES } from '../types/theme';
import {
  Volume2,
  VolumeX,
  Flame,
  Award,
  BookOpen,
  Keyboard,
  Gamepad2,
  LayoutDashboard,
  Timer,
  Trophy,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { ThemeSelector } from './ThemeSelector';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './UserProfileModal';
import { UserStats } from '../types/typing';

interface NavbarProps {
  currentTab: TabMode;
  onSelectTab: (tab: TabMode) => void;
  soundMode: SwitchSound;
  onChangeSound: (mode: SwitchSound) => void;
  level: number;
  streak: number;
  xp: number;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  stats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  soundMode,
  onChangeSound,
  level,
  streak,
  xp,
  currentTheme,
  onSelectTheme,
  stats,
}) => {
  const { user, signIn, isSyncing } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const soundModesList: { mode: SwitchSound; label: string }[] = [
    { mode: 'cherry-blue', label: 'Cherry Blue' },
    { mode: 'cherry-brown', label: 'Brown Thock' },
    { mode: 'typewriter', label: 'Typewriter 🔔' },
    { mode: 'subtle', label: 'Subtle Soft' },
    { mode: 'off', label: 'Mute' },
  ];
  const activeTheme = THEMES[currentTheme] || THEMES['sunset-ember'];

  const cycleSound = () => {
    const currentIdx = soundModesList.findIndex((s) => s.mode === soundMode);
    const nextIdx = (currentIdx + 1) % soundModesList.length;
    const nextSound = soundModesList[nextIdx].mode;
    onChangeSound(nextSound);
    soundEngine.setSoundMode(nextSound);
    if (nextSound !== 'off') {
      soundEngine.playKey(nextSound === 'typewriter');
    }
  };

  const navItems = [
    { id: 'practice' as TabMode, label: 'Practice', icon: Keyboard },
    { id: 'test' as TabMode, label: 'Typing Test', icon: Timer, highlight: true },
    { id: 'lessons' as TabMode, label: 'Lessons', icon: BookOpen },
    { id: 'leaderboard' as TabMode, label: 'Leaderboard', icon: Trophy },
    { id: 'games' as TabMode, label: 'Games', icon: Gamepad2 },
    { id: 'dashboard' as TabMode, label: 'Dashboard', icon: LayoutDashboard },
  ];

  const currentSoundLabel = soundModesList.find((s) => s.mode === soundMode)?.label || 'Sound';

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070a12]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Zone 1: Wordmark Logo */}
          <button
            onClick={() => onSelectTab('practice')}
            className="text-left group cursor-pointer shrink-0 flex items-center gap-1.5 focus:outline-none"
          >
            <div className="relative">
              <Flame className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-400 fill-amber-400/40 group-hover:scale-110 transition-transform" />
              {isSyncing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <span
              className="text-sm sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight bg-clip-text text-transparent group-hover:opacity-95 transition-opacity"
              style={{
                backgroundImage: `linear-gradient(to right, #f59e0b, #ef4444, #38bdf8)`
              }}
            >
              AZ Typing Fire
            </span>
          </button>

          {/* Zone 2: Desktop Navigation Links inside Liquid Glass Capsule */}
          <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.12] backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-2 xl:px-2.5 py-1 text-[11.5px] xl:text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? item.highlight
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                        : `bg-white/[0.14] ${activeTheme.accentText} border border-white/[0.15] shadow-sm font-bold`
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap select-none">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Functional Controls (Theme, Sound, Level, & Cloud Auth) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Liquid Glass Theme Selector */}
            <ThemeSelector
              currentTheme={currentTheme}
              onSelectTheme={onSelectTheme}
            />

            {/* Sound Toggle Button */}
            <button
              onClick={cycleSound}
              title={`Switch Mechanical Sound: currently ${currentSoundLabel}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              {soundMode === 'off' ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="whitespace-nowrap text-[11px] sm:text-xs font-medium font-sans">{currentSoundLabel}</span>
            </button>

            {/* Streak Flame Badge with Animation */}
            <div
              onClick={() => onSelectTab('leaderboard')}
              title={`Daily Fire Streak: ${streak} Days! Practice daily to keep the fire burning.`}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono cursor-pointer hover:bg-amber-500/25 transition-all group shrink-0"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform animate-pulse shrink-0" />
              <span>{streak}d</span>
            </div>

            {/* Level Badge (shown on wider displays) */}
            <div className="hidden 2xl:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold font-mono shrink-0">
              <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Lv.{level}</span>
            </div>

            {/* Firebase Auth / Profile Button */}
            {user ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all cursor-pointer shrink-0"
                title="View Cloud Profile & Stats"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-6 h-6 rounded-lg object-cover border border-amber-400/50 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[65px] xl:max-w-[85px] truncate">
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              </button>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
                title="Sign in with Google to save profile and stats to Firebase"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline whitespace-nowrap">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock Navigation Bar (< lg screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070a12]/90 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-around max-w-xl mx-auto p-1 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] shadow-inner gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? item.highlight
                      ? 'bg-amber-500/25 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.14] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? (item.highlight ? 'text-amber-400 animate-pulse' : 'text-cyan-300') : 'text-slate-400'}`} />
                <span className="text-[10px] sm:text-xs mt-0.5 leading-none whitespace-nowrap block text-center font-medium select-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        stats={stats}
        theme={activeTheme}
      />
    </>
  );
};
