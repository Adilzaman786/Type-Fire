import { UserStats, TestRecord, Achievement } from '../types/typing';
import { evaluateAchievements } from '../data/achievements';

const STORAGE_KEY = 'swifttype_user_profile_v1';

const DEFAULT_STATS: UserStats = {
  xp: 150,
  level: 1,
  totalWordsTyped: 42,
  totalTestsCompleted: 0,
  totalPracticeTimeSeconds: 0,
  bestWpm: 0,
  avgWpm: 0,
  avgAccuracy: 100,
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  history: [],
  problemKeys: {},
  lessonProgress: {
    'lesson-1': { completed: false, stars: 0, bestWpm: 0, bestAcc: 0 }
  },
  gameScores: {
    meteor: 0,
    racer: 0,
    bubbles: 0,
    invaders: 0,
    defense: 0,
    runner: 0,
  },
  unlockedAchievements: []
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Evaluate initial achievements
      const { allUnlockedIds } = evaluateAchievements(DEFAULT_STATS);
      return { ...DEFAULT_STATS, unlockedAchievements: allUnlockedIds };
    }
    const parsed = JSON.parse(raw);
    const combined: UserStats = {
      ...DEFAULT_STATS,
      ...parsed,
      problemKeys: parsed.problemKeys || {},
      lessonProgress: parsed.lessonProgress || {},
      gameScores: parsed.gameScores || DEFAULT_STATS.gameScores,
      history: parsed.history || [],
      unlockedAchievements: parsed.unlockedAchievements || []
    };
    // Sync any newly met achievements
    const { allUnlockedIds } = evaluateAchievements(combined);
    combined.unlockedAchievements = allUnlockedIds;
    return combined;
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats', err);
  }
}

export function recordTestCompletion(
  current: UserStats,
  test: Omit<TestRecord, 'id' | 'timestamp'>,
  keyErrors: Record<string, number>
): { updatedStats: UserStats; earnedXp: number; newLevel: boolean; newlyUnlockedAchievements: Achievement[] } {
  const today = new Date().toISOString().slice(0, 10);
  
  // Calculate Streak
  let streak = current.dailyStreak || 1;
  if (current.lastActiveDate !== today) {
    const lastDate = new Date(current.lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  // Calculate XP
  const baseEarned = Math.round(
    test.wpm * 1.5 + (test.accuracy >= 95 ? 50 : 20) + test.characterCount * 0.25
  );
  const earnedXp = Math.max(15, baseEarned);
  const totalXp = current.xp + earnedXp;

  // Level computation: Level 1 = 0-250 XP, Level 2 = 250-600, etc.
  const oldLevel = current.level;
  const newLevelValue = Math.floor(Math.sqrt(totalXp / 80)) + 1;
  const leveledUp = newLevelValue > oldLevel;

  // Problem keys update
  const updatedProblemKeys = { ...current.problemKeys };
  Object.entries(keyErrors).forEach(([key, errCount]) => {
    const char = key.toLowerCase();
    const existing = updatedProblemKeys[char] || { total: 0, errors: 0 };
    updatedProblemKeys[char] = {
      total: existing.total + errCount + 5,
      errors: existing.errors + errCount
    };
  });

  // Aggregate stats
  const totalTests = current.totalTestsCompleted + 1;
  const wordsTypedThisTest = Math.round(test.characterCount / 5);
  const totalWords = current.totalWordsTyped + wordsTypedThisTest;
  const totalTime = current.totalPracticeTimeSeconds + test.timeSeconds;
  const bestWpm = Math.max(current.bestWpm, test.wpm);

  // Rolling averages
  const avgWpm = Math.round(((current.avgWpm * current.totalTestsCompleted) + test.wpm) / totalTests);
  const avgAccuracy = Math.round(((current.avgAccuracy * current.totalTestsCompleted) + test.accuracy) / totalTests);

  const newRecord: TestRecord = {
    ...test,
    id: 'test_' + Date.now(),
    timestamp: Date.now()
  };

  const draftStats: UserStats = {
    ...current,
    xp: totalXp,
    level: newLevelValue,
    totalWordsTyped: totalWords,
    totalTestsCompleted: totalTests,
    totalPracticeTimeSeconds: totalTime,
    bestWpm,
    avgWpm,
    avgAccuracy,
    dailyStreak: streak,
    lastActiveDate: today,
    problemKeys: updatedProblemKeys,
    history: [newRecord, ...current.history].slice(0, 50)
  };

  // Evaluate achievements
  const { newlyUnlocked, allUnlockedIds } = evaluateAchievements(draftStats);
  draftStats.unlockedAchievements = allUnlockedIds;

  saveUserStats(draftStats);
  return { updatedStats: draftStats, earnedXp, newLevel: leveledUp, newlyUnlockedAchievements: newlyUnlocked };
}

export function updateLessonProgress(
  current: UserStats,
  lessonId: string,
  wpm: number,
  acc: number,
  targetWpm: number,
  targetAcc: number
): { updatedStats: UserStats; newlyUnlockedAchievements: Achievement[] } {
  const passed = wpm >= targetWpm && acc >= targetAcc;
  let stars = 0;
  if (passed) stars = 1;
  if (wpm >= targetWpm * 1.25 && acc >= 96) stars = 2;
  if (wpm >= targetWpm * 1.5 && acc >= 98) stars = 3;

  const existing = current.lessonProgress[lessonId] || { completed: false, stars: 0, bestWpm: 0, bestAcc: 0 };

  const updatedProgress = {
    ...current.lessonProgress,
    [lessonId]: {
      completed: existing.completed || passed,
      stars: Math.max(existing.stars, stars),
      bestWpm: Math.max(existing.bestWpm, wpm),
      bestAcc: Math.max(existing.bestAcc, acc)
    }
  };

  const draft: UserStats = {
    ...current,
    lessonProgress: updatedProgress
  };

  const { newlyUnlocked, allUnlockedIds } = evaluateAchievements(draft);
  draft.unlockedAchievements = allUnlockedIds;

  saveUserStats(draft);
  return { updatedStats: draft, newlyUnlockedAchievements: newlyUnlocked };
}

export function updateGameScore(
  current: UserStats,
  game: 'meteor' | 'racer' | 'bubbles' | 'invaders' | 'defense' | 'runner',
  score: number
): { updatedStats: UserStats; newlyUnlockedAchievements: Achievement[] } {
  const updatedScores = {
    ...current.gameScores,
    [game]: Math.max(current.gameScores[game] || 0, score)
  };
  const earnedXp = Math.round(score * 0.1);
  const draft: UserStats = {
    ...current,
    xp: current.xp + earnedXp,
    level: Math.floor(Math.sqrt((current.xp + earnedXp) / 80)) + 1,
    gameScores: updatedScores
  };

  const { newlyUnlocked, allUnlockedIds } = evaluateAchievements(draft);
  draft.unlockedAchievements = allUnlockedIds;

  saveUserStats(draft);
  return { updatedStats: draft, newlyUnlockedAchievements: newlyUnlocked };
}

