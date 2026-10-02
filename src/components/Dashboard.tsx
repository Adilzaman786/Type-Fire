import React from 'react';
import { UserStats } from '../types/typing';
import { Achievements } from './Achievements';
import { LESSONS } from '../data/lessons';
import { KeyboardHeatmap } from './KeyboardHeatmap';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Zap,
  Target,
  Flame,
  Clock,
  BookOpen,
  Gamepad2,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Medal,
  CheckCircle2,
  Lock,
  Timer,
  CloudCheck,
  RefreshCw,
  LogIn,
  User as UserIcon
} from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  onStartWeakKeysDrill: (weakKeys: string[]) => void;
  onSelectTab: (tab: 'lessons' | 'test' | 'practice' | 'games') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onStartWeakKeysDrill,
  onSelectTab,
}) => {
  const { user, signIn, syncStats, isSyncing, lastSyncedAt } = useAuth();
  // Compute Rank Title based on WPM and Level
  const getRankTitle = (bestWpm: number, level: number) => {
    if (bestWpm >= 100) return 'Keystroke Grandmaster';
    if (bestWpm >= 80) return 'Cyber Speed Demon';
    if (bestWpm >= 65) return 'Velocity Virtuoso';
    if (bestWpm >= 45) return 'Rapid Touch Typist';
    if (bestWpm >= 30) return 'Fluent Typist';
    if (bestWpm >= 20) return 'Home Row Apprentice';
    return 'Novice Keyboardist';
  };

  const rankTitle = getRankTitle(stats.bestWpm, stats.level);

  // Next level progress math
  const currentLevelXpFloor = (stats.level - 1) ** 2 * 80;
  const nextLevelXpCeil = stats.level ** 2 * 80;
  const xpInCurrentLevel = Math.max(0, stats.xp - currentLevelXpFloor);
  const xpNeededForNext = Math.max(1, nextLevelXpCeil - currentLevelXpFloor);
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  // Identify top weak/problem keys
  const problemKeysList = Object.entries(stats.problemKeys)
    .filter(([_, data]) => data.errors > 0)
    .sort((a, b) => b[1].errors - a[1].errors)
    .slice(0, 8);

  // Lesson stats
  const totalLessonsDone = Object.values(stats.lessonProgress).filter((l) => l.completed).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Hero Banner: Typist Profile & Level Progression */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-300">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/40" />
              <span>AZ Typing Fire · Intelligence Console</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">{stats.dailyStreak} Day Active Streak</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-300 flex items-center gap-1 font-semibold">
                <Medal className="w-3.5 h-3.5 text-cyan-400" />
                {totalLessonsDone}/16 Lesson Badges
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{rankTitle}</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono">
                Level {stats.level}
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-xl">
              Consistent deliberate practice rewires neuromuscular pathways. Your keystroke cadence, official speed tests, and earned badges are tracked below.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectTab('test')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer hover:opacity-95"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Take Official Speed Test</span>
              </button>
              <button
                onClick={() => onSelectTab('lessons')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Continue Lessons</span>
              </button>
            </div>
          </div>

          {/* Level Progress Circle / Bar */}
          <div className="w-full md:w-72 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-400">Level {stats.level} Progress</span>
              <span className="text-amber-300 font-semibold">{levelProgressPercent}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-400 to-cyan-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-500"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2">
              <span>{stats.xp} Total XP</span>
              <span>Next: {nextLevelXpCeil} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Account & Sync Status Banner */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08] bg-white/[0.02]">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-11 h-11 rounded-xl object-cover border border-amber-400/40 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {user.displayName || 'Typist Account'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Active
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {user.email} · Synced with Firebase Firestore
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <button
                onClick={() => syncStats(stats)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Save Your Typist Profile & Records to Cloud</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Firebase
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in with Google to permanently backup your WPM milestones, accuracy, daily streaks, and custom achievements.
                </p>
              </div>
            </div>

            <button
              onClick={signIn}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Core Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best WPM */}
        <div className="p-5 rounded-2xl glass-panel-interactive border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Peak Speed</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums">
            {stats.bestWpm} <span className="text-sm font-normal text-slate-400">WPM</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Average: <span className="text-slate-200 font-mono font-medium">{stats.avgWpm} WPM</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-2xl glass-panel-interactive border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Avg Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono tabular-nums">
            {stats.avgAccuracy || 100}%
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Calculated across all tests
          </div>
        </div>

        {/* Total Words */}
        <div className="p-5 rounded-2xl glass-panel-interactive border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Words Typed</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono tabular-nums">
            {stats.totalWordsTyped.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            <span className="text-slate-200 font-mono font-medium">{stats.totalTestsCompleted}</span> total tests finished
          </div>
        </div>

        {/* Time Practiced */}
        <div className="p-5 rounded-2xl glass-panel-interactive border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Practice Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-indigo-300 font-mono tabular-nums">
            {Math.round(stats.totalPracticeTimeSeconds / 60)} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Daily Streak: <span className="text-amber-400 font-mono font-medium">{stats.dailyStreak} days</span>
          </div>
        </div>
      </div>

      {/* Lesson Badges Collection Showcase (New Requirement) */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
              <Medal className="w-4 h-4 text-amber-400" />
              <span>Lesson Virtual Badges Showcase</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Curriculum Milestone Badges ({totalLessonsDone}/16)</h3>
          </div>
          <button
            onClick={() => onSelectTab('lessons')}
            className="text-xs text-amber-300 hover:underline cursor-pointer"
          >
            Go to Lessons →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {LESSONS.map((lesson) => {
            const isCompleted = stats.lessonProgress[lesson.id]?.completed;
            return (
              <div
                key={lesson.id}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-900/60 border-amber-400/50 shadow-md shadow-amber-500/10'
                    : 'bg-white/[0.02] border-white/[0.05] opacity-50'
                }`}
                title={`${lesson.badgeName}: ${lesson.badgeDescription}`}
              >
                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center my-1">
                  {isCompleted ? (
                    <Medal className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="text-[11px] font-bold text-white leading-tight line-clamp-1 mt-1">
                  {lesson.badgeName}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  Lvl {lesson.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual Milestones & Badges Showcase */}
      <Achievements stats={stats} />

      {/* Interactive Keyboard Mistake Heatmap Visualization */}
      <KeyboardHeatmap
        problemKeys={stats.problemKeys}
        onStartWeakKeysDrill={onStartWeakKeysDrill}
      />

      {/* Two-Column Module: 6 Games High Scores & Lesson Master Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6 Games Highscores */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>Arcade High Scores (6 Games)</span>
            </h4>
            <button
              onClick={() => onSelectTab('games')}
              className="text-xs text-cyan-300 hover:underline cursor-pointer"
            >
              Play Games →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
              <div>
                <span className="font-medium text-xs text-white">Meteor Storm</span>
                <span className="block text-[10px] text-slate-400">Laser defense</span>
              </div>
              <span className="font-mono font-bold text-cyan-300 text-sm tabular-nums">
                {stats.gameScores?.meteor || 0} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
              <div>
                <span className="font-medium text-xs text-white">Nitro Racer</span>
                <span className="block text-[10px] text-slate-400">4-car circuit</span>
              </div>
              <span className="font-mono font-bold text-indigo-300 text-sm tabular-nums">
                {stats.gameScores?.racer || 0} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
              <div>
                <span className="font-medium text-xs text-white">Bubble Burst</span>
                <span className="block text-[10px] text-slate-400">45s blitz</span>
              </div>
              <span className="font-mono font-bold text-purple-300 text-sm tabular-nums">
                {stats.gameScores?.bubbles || 0} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
              <div>
                <span className="font-medium text-xs text-white">Galaxian Fleet</span>
                <span className="block text-[10px] text-slate-400">Space Invaders</span>
              </div>
              <span className="font-mono font-bold text-rose-300 text-sm tabular-nums">
                {stats.gameScores?.invaders || 0} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
              <div>
                <span className="font-medium text-xs text-white">Firewall Sentry</span>
                <span className="block text-[10px] text-slate-400">Tower defense</span>
              </div>
              <span className="font-mono font-bold text-amber-300 text-sm tabular-nums">
                {stats.gameScores?.defense || 0} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
              <div>
                <span className="font-medium text-xs text-white">Cyber Runner</span>
                <span className="block text-[10px] text-slate-400">Rooftop parkour</span>
              </div>
              <span className="font-mono font-bold text-emerald-300 text-sm tabular-nums">
                {stats.gameScores?.runner || 0}m
              </span>
            </div>
          </div>
        </div>

        {/* Lessons Curriculum Status */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Curriculum Progress</span>
            </h4>
            <button
              onClick={() => onSelectTab('lessons')}
              className="text-xs text-emerald-300 hover:underline cursor-pointer"
            >
              View Lessons →
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Lessons Completed</span>
              <span className="font-mono text-emerald-300 font-bold">{totalLessonsDone} / 16</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 shadow-[0_0_10px_#10b981]"
                style={{ width: `${(totalLessonsDone / 16) * 100}%` }}
              />
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 space-y-1">
              <p>• 16 Unique Virtual Badges ready to unlock</p>
              <p>• Official 1, 2, 3 & 5-minute timed certification tests</p>
              <p>• 6 Arcade games to enhance muscle memory & cadence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Test History Log */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08]">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Session History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your last {stats.history.length} completed typing tests</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{stats.history.length} Records</span>
        </div>

        {stats.history.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-white/[0.06]">
                  <th className="pb-3 font-medium">Test Name</th>
                  <th className="pb-3 font-medium">Mode</th>
                  <th className="pb-3 font-medium text-right">Net WPM</th>
                  <th className="pb-3 font-medium text-right">Accuracy</th>
                  <th className="pb-3 font-medium text-right">Errors</th>
                  <th className="pb-3 font-medium text-right">Time</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.history.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-sans font-medium text-white max-w-xs truncate">{record.title}</td>
                    <td className="py-3 text-slate-400 capitalize">{record.mode}</td>
                    <td className="py-3 text-right font-bold text-cyan-300 tabular-nums">{record.netWpm} WPM</td>
                    <td className="py-3 text-right font-semibold text-emerald-300 tabular-nums">{record.accuracy}%</td>
                    <td className="py-3 text-right text-rose-300 tabular-nums">{record.errors}</td>
                    <td className="py-3 text-right text-slate-300 tabular-nums">{record.timeSeconds}s</td>
                    <td className="py-3 text-right text-slate-500 tabular-nums">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            No session history yet. Complete a lesson or practice paragraph to start logging your speeds!
          </div>
        )}
      </div>
    </div>
  );
};
