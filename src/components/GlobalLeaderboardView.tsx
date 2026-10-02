import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Sparkles,
  Zap,
  Globe,
  Clock,
  ArrowUp,
  ShieldCheck,
  Search
} from 'lucide-react';
import { LeaderboardEntry, UserStats } from '../types/typing';
import { ThemeConfig } from '../types/theme';

interface GlobalLeaderboardViewProps {
  stats: UserStats;
  theme?: ThemeConfig;
}

const DEFAULT_LEADERBOARD_EN: LeaderboardEntry[] = [
  { id: 'lb-1', name: 'Malik Muhammad Adil Zaman', wpm: 124, accuracy: 99, language: 'en', level: 25, badge: 'Grandmaster Apex', streak: 42, timestamp: Date.now() - 3600000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-2', name: 'Taimoor Speedster', wpm: 112, accuracy: 98, language: 'en', level: 22, badge: 'Viper Turbo', streak: 35, timestamp: Date.now() - 7200000, location: 'United Kingdom 🇬🇧' },
  { id: 'lb-3', name: 'Hamza SwiftKeys', wpm: 105, accuracy: 98, language: 'en', level: 19, badge: 'Velocity Pro', streak: 28, timestamp: Date.now() - 14400000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-4', name: 'Sarah Keyblazer', wpm: 98, accuracy: 97, language: 'en', level: 17, badge: 'Precision Ace', streak: 21, timestamp: Date.now() - 28800000, location: 'Canada 🇨🇦' },
  { id: 'lb-5', name: 'Zainab TypeFire', wpm: 92, accuracy: 99, language: 'en', level: 16, badge: 'Flame Stalker', streak: 19, timestamp: Date.now() - 36000000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-6', name: 'Bilal Mechanist', wpm: 88, accuracy: 96, language: 'en', level: 15, badge: 'Cherry Clicker', streak: 14, timestamp: Date.now() - 43200000, location: 'UAE 🇦🇪' },
  { id: 'lb-7', name: 'Ayesha Cadence', wpm: 84, accuracy: 98, language: 'en', level: 13, badge: 'Cadence Knight', streak: 11, timestamp: Date.now() - 50400000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-8', name: 'Danyal Drift', wpm: 79, accuracy: 95, language: 'en', level: 12, badge: 'Drift Racer', streak: 9, timestamp: Date.now() - 57600000, location: 'Australia 🇦🇺' },
];

const DEFAULT_LEADERBOARD_UR: LeaderboardEntry[] = [
  { id: 'lb-ur-1', name: 'ملک محمد عادل زمان', wpm: 78, accuracy: 98, language: 'ur', level: 25, badge: 'سلطانِ قلم (Sultan)', streak: 42, timestamp: Date.now() - 3600000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-ur-2', name: 'اسد اللہ خطاط', wpm: 71, accuracy: 97, language: 'ur', level: 20, badge: 'نستعلیق ماسٹر', streak: 30, timestamp: Date.now() - 7200000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-ur-3', name: 'فاطمہ زہرا', wpm: 65, accuracy: 99, language: 'ur', level: 18, badge: 'کلیدِ رفتار', streak: 24, timestamp: Date.now() - 14400000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-ur-4', name: 'عثمان غنی', wpm: 60, accuracy: 96, language: 'ur', level: 15, badge: 'طوفان ٹائپسٹ', streak: 17, timestamp: Date.now() - 28800000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-ur-5', name: 'مریم نور', wpm: 56, accuracy: 98, language: 'ur', level: 14, badge: 'شمعِ ادب', streak: 12, timestamp: Date.now() - 36000000, location: 'Pakistan 🇵🇰' },
  { id: 'lb-ur-6', name: 'طارق محمود', wpm: 52, accuracy: 95, language: 'ur', level: 12, badge: 'ماہر فونیٹک', streak: 9, timestamp: Date.now() - 43200000, location: 'Pakistan 🇵🇰' },
];

export const GlobalLeaderboardView: React.FC<GlobalLeaderboardViewProps> = ({
  stats,
  theme,
}) => {
  const [langTab, setLangTab] = useState<'en' | 'ur'>('en');
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge current user's real stats into leaderboard
  const list = useMemo(() => {
    const base = langTab === 'en' ? DEFAULT_LEADERBOARD_EN : DEFAULT_LEADERBOARD_UR;
    const userBest = stats.bestWpm || 0;

    // Create current user entry
    const userEntry: LeaderboardEntry = {
      id: 'current-user',
      name: `You (${stats.level >= 10 ? 'Elite Typist' : 'Typist'})`,
      wpm: userBest,
      accuracy: stats.avgAccuracy || 95,
      language: langTab,
      level: stats.level,
      badge: stats.level >= 10 ? 'AZ Flame Champion' : 'Rising Fire Typist',
      streak: stats.dailyStreak || 1,
      timestamp: Date.now(),
      isCurrentUser: true,
      location: 'You 📍',
    };

    const combined = [...base, userEntry].sort((a, b) => b.wpm - a.wpm);

    if (!searchQuery.trim()) return combined;
    return combined.filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.badge.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [langTab, stats, searchQuery]);

  const top3 = list.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header with Streak Flame Showcase */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 overflow-hidden bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-[#070a12] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 fill-amber-500 text-amber-400" />
              <span>AZ Typing Fire · Global Hall of Fame</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Global Leaderboard (عالمی درجہ بندی)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              See how your speed stacks up against the fastest English and Urdu touch typists worldwide.
            </p>
          </div>

          {/* Active Daily Streak Animation Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/60 border border-amber-500/30 shadow-xl self-start md:self-auto">
            {/* Animated Flame with particles */}
            <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 shadow-lg shadow-amber-500/30">
              <Flame className="w-8 h-8 text-white fill-white animate-bounce" />
              <div className="absolute inset-0 rounded-2xl bg-amber-400 opacity-30 animate-ping pointer-events-none" />
            </div>

            <div>
              <div className="text-[11px] font-mono text-amber-300 uppercase font-bold tracking-wider">
                Daily Fire Streak
              </div>
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <span>{stats.dailyStreak || 1} Days</span>
                <span className="text-xs text-amber-400">🔥</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Practice daily to keep flame alive!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Top 3 Champions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {top3.map((champ, idx) => {
          const rankColors = [
            { border: 'border-amber-400/80', bg: 'from-amber-500/20 via-slate-900 to-[#070a12]', medal: '🥇 1st Place', text: 'text-amber-300' },
            { border: 'border-slate-300/60', bg: 'from-slate-500/20 via-slate-900 to-[#070a12]', medal: '🥈 2nd Place', text: 'text-slate-200' },
            { border: 'border-amber-700/60', bg: 'from-amber-800/20 via-slate-900 to-[#070a12]', medal: '🥉 3rd Place', text: 'text-amber-500' },
          ][idx] || { border: 'border-white/10', bg: 'bg-slate-900', medal: `${idx + 1}th`, text: 'text-white' };

          return (
            <div
              key={champ.id}
              className={`p-6 rounded-3xl glass-panel border-2 ${rankColors.border} bg-gradient-to-b ${rankColors.bg} text-center space-y-3 shadow-xl relative overflow-hidden`}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-white/[0.08] text-xs font-mono font-bold text-white border border-white/10">
                {rankColors.medal}
              </div>

              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {champ.name[0].toUpperCase()}
              </div>

              <div>
                <h3 className="text-base font-bold text-white truncate max-w-xs mx-auto">
                  {champ.name}
                </h3>
                <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                  {champ.badge}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/10 font-mono">
                <div>
                  <div className="text-2xl font-black text-cyan-300">{champ.wpm}</div>
                  <div className="text-[10px] text-slate-400 uppercase">WPM</div>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <div className="text-2xl font-black text-emerald-300">{champ.accuracy}%</div>
                  <div className="text-[10px] text-slate-400 uppercase">Accuracy</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        {/* Language Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-white/[0.06] border border-white/10 shadow-inner">
          <button
            onClick={() => setLangTab('en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              langTab === 'en'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English Rankings
          </button>
          <button
            onClick={() => setLangTab('ur')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-urdu-clean ${
              langTab === 'ur'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            اردو ٹاپ ٹائپسٹس
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search typist or badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/[0.04] text-slate-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Typist</th>
                <th className="py-3.5 px-4 text-center">Speed</th>
                <th className="py-3.5 px-4 text-center">Accuracy</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
                <th className="py-3.5 px-4 text-right">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {list.map((entry, idx) => {
                const isUser = entry.isCurrentUser;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-cyan-500/15 font-bold border-l-4 border-l-cyan-400 text-white'
                        : 'hover:bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-bold">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center font-bold text-xs">
                          {entry.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{entry.name}</span>
                            {isUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-mono font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {entry.badge} · Lv.{entry.level}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-cyan-300 text-sm">
                      {entry.wpm} WPM
                    </td>

                    <td className="py-3.5 px-4 text-center text-emerald-300 font-bold">
                      {entry.accuracy}%
                    </td>

                    <td className="py-3.5 px-4 text-center text-amber-300 font-bold">
                      🔥 {entry.streak}d
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 font-sans">
                      {entry.location || 'Global'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
