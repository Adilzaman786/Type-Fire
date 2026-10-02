import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserStats } from '../types/typing';
import { ThemeConfig } from '../types/theme';
import {
  X,
  User as UserIcon,
  Flame,
  Award,
  Zap,
  Target,
  Clock,
  BookOpen,
  CloudCheck,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  theme?: ThemeConfig;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  stats,
  theme,
}) => {
  const { user, signOut, syncStats, isSyncing, lastSyncedAt } = useAuth();

  if (!isOpen) return null;

  const handleManualSync = async () => {
    if (user) {
      await syncStats(stats);
    }
  };

  const hours = Math.floor(stats.totalPracticeTimeSeconds / 3600);
  const minutes = Math.floor((stats.totalPracticeTimeSeconds % 3600) / 60);
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${stats.totalPracticeTimeSeconds % 60}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/[0.12] bg-[#0c101d]/95 p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.15)] max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>AZ Typing Fire · Cloud Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Banner */}
        {user ? (
          <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-14 h-14 rounded-2xl border-2 border-amber-400/40 object-cover shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white truncate">
                  {user.displayName || 'Typing Champion'}
                </h3>
                {user.emailVerified && (
                  <span title="Verified Google Account">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold border border-amber-500/30">
                  Level {stats.level} Typist
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {stats.xp} XP
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <UserIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Guest Typist Profile</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Sign in with Google to permanently save your records and achievements to the cloud!
            </p>
          </div>
        )}

        {/* Career Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-5 font-mono text-center">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Record
            </span>
            <div className="text-xl font-black text-cyan-300 mt-0.5 tabular-nums">
              {stats.bestWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" /> Accuracy
            </span>
            <div className="text-xl font-black text-emerald-300 mt-0.5 tabular-nums">
              {stats.avgAccuracy}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Streak
            </span>
            <div className="text-xl font-black text-amber-300 mt-0.5 tabular-nums">
              {stats.dailyStreak} <span className="text-[10px] font-normal text-slate-400">days</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400">Total Words</span>
            <div className="text-lg font-bold text-slate-200 mt-0.5 tabular-nums">
              {stats.totalWordsTyped.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400">Tests Done</span>
            <div className="text-lg font-bold text-slate-200 mt-0.5 tabular-nums">
              {stats.totalTestsCompleted}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Time
            </span>
            <div className="text-sm font-bold text-slate-200 mt-1 tabular-nums">
              {timeFormatted}
            </div>
          </div>
        </div>

        {/* Cloud Sync Status Card */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Firebase Cloud Firestore</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Creator Attribution */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Engineered by</span>
          <span className="font-bold text-amber-300 uppercase">MALIK MUHAMMAD ADIL ZAMAN</span>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
          {user ? (
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
