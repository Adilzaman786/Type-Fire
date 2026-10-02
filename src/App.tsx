import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TabMode, SwitchSound, UserStats, TestRecord, Achievement } from './types/typing';
import { ThemeId, THEMES } from './types/theme';
import { loadUserStats, recordTestCompletion, updateLessonProgress, updateGameScore } from './utils/storage';
import { soundEngine } from './utils/audio';
import { Navbar } from './components/Navbar';
import { LessonsView } from './components/LessonsView';
import { TypingTestView } from './components/TypingTestView';
import { PracticeView } from './components/PracticeView';
import { GlobalLeaderboardView } from './components/GlobalLeaderboardView';
import { WeakKeysDrillModal } from './components/WeakKeysDrillModal';
import { GamesView } from './components/GamesView';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import { DesktopRecommendedNotice } from './components/DesktopRecommendedNotice';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Trophy, X, ArrowRight, Flame, CloudCheck, Sparkles } from 'lucide-react';

const THEME_STORAGE_KEY = 'swifttype_theme_v1';

function AppContent() {
  const { user, syncStats, lastSyncedAt, isSyncing } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabMode>('practice');
  const [soundMode, setSoundMode] = useState<SwitchSound>('mechanical');
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [customDrillText, setCustomDrillText] = useState<string | null>(null);
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);
  const [isWeakKeysModalOpen, setIsWeakKeysModalOpen] = useState<boolean>(false);

  // Theme state persisted in localStorage
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    }
    return 'sunset-ember'; // Default warm flame theme for AZ Typing Fire!
  });

  const activeTheme = THEMES[currentTheme] || THEMES['sunset-ember'];

  const handleSelectTheme = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  };

  // Load sound preference and stats on initial mount
  useEffect(() => {
    const loaded = loadUserStats();
    setStats(loaded);
    soundEngine.setSoundMode(soundMode);
  }, []);

  // Helper to celebrate and notify new achievements
  const notifyAchievements = (achievements: Achievement[]) => {
    if (achievements.length > 0) {
      const first = achievements[0];
      setUnlockedToast(first);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.2 },
        colors: [activeTheme.dotColor, '#f59e0b', '#6366f1', '#10b981'],
      });
      soundEngine.playSuccess();
      setTimeout(() => setUnlockedToast(null), 6000);
    }
  };

  // Handle standard test completion (practice, benchmark, or custom)
  const handleTestComplete = useCallback(
    (test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => {
      setStats((prev) => {
        const { updatedStats, newlyUnlockedAchievements } = recordTestCompletion(prev, test, keyErrors);
        if (newlyUnlockedAchievements.length > 0) {
          setTimeout(() => notifyAchievements(newlyUnlockedAchievements), 0);
        }
        if (user) {
          syncStats(updatedStats);
        }
        return updatedStats;
      });
    },
    [activeTheme.dotColor, user, syncStats]
  );

  // Handle lesson completion
  const handleLessonComplete = useCallback(
    (lessonId: string, test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => {
      setStats((prev) => {
        const { updatedStats, newlyUnlockedAchievements: achFromTest } = recordTestCompletion(prev, test, keyErrors);
        const { updatedStats: withLesson, newlyUnlockedAchievements: achFromLesson } = updateLessonProgress(
          updatedStats,
          lessonId,
          test.netWpm,
          test.accuracy,
          20,
          90
        );
        const allUnlocked = [...achFromTest, ...achFromLesson];
        if (allUnlocked.length > 0) {
          setTimeout(() => notifyAchievements(allUnlocked), 0);
        }
        if (user) {
          syncStats(withLesson);
        }
        return withLesson;
      });
    },
    [activeTheme.dotColor, user, syncStats]
  );

  // Handle game score update (all 6 games)
  const handleGameScoreUpdate = useCallback(
    (game: 'meteor' | 'racer' | 'bubbles' | 'invaders' | 'defense' | 'runner', score: number) => {
      setStats((prev) => {
        const { updatedStats, newlyUnlockedAchievements } = updateGameScore(prev, game, score);
        if (newlyUnlockedAchievements.length > 0) {
          setTimeout(() => notifyAchievements(newlyUnlockedAchievements), 0);
        }
        if (user) {
          syncStats(updatedStats);
        }
        return updatedStats;
      });
    },
    [activeTheme.dotColor, user, syncStats]
  );

  // Update stats from race or drills
  const handleUpdateStats = useCallback(
    (newStats: Partial<UserStats>) => {
      setStats((prev) => {
        const updated = { ...prev, ...newStats };
        if (user) {
          syncStats(updated);
        }
        return updated;
      });
    },
    [user, syncStats]
  );

  // Trigger weak keys drill from dashboard or smart generator
  const handleStartWeakKeysDrill = (weakKeys: string[]) => {
    setIsWeakKeysModalOpen(true);
  };

  const handleLaunchSmartDrill = (drillText: string, weakKeys: string[], isUrdu: boolean) => {
    setCustomDrillText(drillText);
    setCurrentTab('practice');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Liquid Glass Ambient Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 left-1/4 w-[650px] h-[650px] rounded-full blur-[130px] transition-all duration-700 ease-in-out"
          style={{ backgroundColor: activeTheme.blobColors.blob1 }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full blur-[150px] transition-all duration-700 ease-in-out"
          style={{ backgroundColor: activeTheme.blobColors.blob2 }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ease-in-out"
          style={{ backgroundColor: activeTheme.blobColors.blob3 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Floating Achievement Unlock Banner */}
      {unlockedToast && (
        <div className="fixed top-20 right-3 sm:right-8 z-50 animate-bounce duration-1000 max-w-sm w-[90vw] sm:w-auto">
          <div className="p-4 rounded-2xl glass-panel border border-amber-500/50 bg-slate-900/95 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                Achievement Unlocked!
              </div>
              <div className="text-sm font-bold text-white">
                {unlockedToast.title}
              </div>
              <p className="text-xs text-slate-300">
                {unlockedToast.description}
              </p>
              <button
                onClick={() => {
                  setCurrentTab('dashboard');
                  setUnlockedToast(null);
                }}
                className="pt-1.5 flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
              >
                <span>View in Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => setUnlockedToast(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Animated Desktop Recommended Notice for Mobile Screens */}
      <DesktopRecommendedNotice />

      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCustomDrillText(null);
          setCurrentTab(tab);
        }}
        soundMode={soundMode}
        onChangeSound={setSoundMode}
        level={stats.level}
        streak={stats.dailyStreak}
        xp={stats.xp}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        stats={stats}
      />

      {/* Cloud Sync Status Indicator for Authenticated Users */}
      {user && (
        <div className="relative z-20 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-2">
          <div className="flex items-center justify-between py-1 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Signed in as <strong>{user.displayName || user.email}</strong> · Cloud Sync Active</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              {isSyncing ? (
                <span className="text-amber-300 animate-pulse">Syncing data...</span>
              ) : (
                <span>Saved to Firestore ✅</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport - with bottom padding pb-24 for mobile navigation dock */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-6 pb-24 md:pb-8 relative z-10">
        {currentTab === 'lessons' && (
          <LessonsView
            stats={stats}
            onCompleteLesson={handleLessonComplete}
            theme={activeTheme}
          />
        )}

        {currentTab === 'test' && (
          <TypingTestView
            stats={stats}
            onCompleteTest={handleTestComplete}
            theme={activeTheme}
          />
        )}

        {currentTab === 'practice' && (
          <PracticeView
            stats={stats}
            onCompleteTest={handleTestComplete}
            customInitialText={customDrillText}
            theme={activeTheme}
          />
        )}

        {currentTab === 'leaderboard' && (
          <GlobalLeaderboardView
            stats={stats}
            theme={activeTheme}
          />
        )}

        {currentTab === 'games' && (
          <GamesView
            stats={stats}
            onUpdateGameScore={handleGameScoreUpdate}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            onStartWeakKeysDrill={handleStartWeakKeysDrill}
            onSelectTab={setCurrentTab}
          />
        )}
      </main>

      {/* Weak Keys Smart Drill Modal */}
      {isWeakKeysModalOpen && (
        <WeakKeysDrillModal
          isOpen={isWeakKeysModalOpen}
          onClose={() => setIsWeakKeysModalOpen(false)}
          stats={stats}
          onStartDrill={handleLaunchSmartDrill}
        />
      )}

      {/* Full Detailed Footer with Malik Muhammad ADIL ZAMAN Creator Showcase */}
      <Footer onSelectTab={setCurrentTab} activeTheme={activeTheme} />
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);

  const handleCloudProfileLoaded = (cloudStats: UserStats) => {
    setStats(cloudStats);
  };

  return (
    <AuthProvider onProfileLoaded={handleCloudProfileLoaded} currentStats={stats}>
      <AppContent />
    </AuthProvider>
  );
}
