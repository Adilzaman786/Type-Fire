import { Achievement, UserStats } from '../types/typing';

export const ACHIEVEMENTS: Achievement[] = [
  // WPM Milestones
  {
    id: 'wpm_25',
    title: 'Cadence Novice',
    description: 'Reach a typing speed of 25 WPM in any test.',
    category: 'wpm',
    tier: 'bronze',
    icon: 'Zap',
    targetValue: 25,
    unit: 'WPM',
  },
  {
    id: 'wpm_40',
    title: 'Fluid Typist',
    description: 'Surpass average typing speed by reaching 40 WPM.',
    category: 'wpm',
    tier: 'silver',
    icon: 'TrendingUp',
    targetValue: 40,
    unit: 'WPM',
  },
  {
    id: 'wpm_60',
    title: 'Swift Velocity',
    description: 'Hit professional typist cadence at 60 WPM.',
    category: 'wpm',
    tier: 'gold',
    icon: 'Flame',
    targetValue: 60,
    unit: 'WPM',
  },
  {
    id: 'wpm_80',
    title: 'Cyber Sprinter',
    description: 'Blaze across the digital highway with 80 WPM.',
    category: 'wpm',
    tier: 'gold',
    icon: 'Gauge',
    targetValue: 80,
    unit: 'WPM',
  },
  {
    id: 'wpm_100',
    title: 'Mechanical Demon',
    description: 'Enter the elite tier by breaking 100 WPM.',
    category: 'wpm',
    tier: 'diamond',
    icon: 'Trophy',
    targetValue: 100,
    unit: 'WPM',
  },
  {
    id: 'wpm_120',
    title: 'Sonic Maestro',
    description: 'Transcendent finger cadence at 120 WPM.',
    category: 'wpm',
    tier: 'diamond',
    icon: 'Sparkles',
    targetValue: 120,
    unit: 'WPM',
  },

  // Streak Milestones
  {
    id: 'streak_3',
    title: 'Ignition Flame',
    description: 'Complete daily practice for 3 consecutive days.',
    category: 'streak',
    tier: 'bronze',
    icon: 'Flame',
    targetValue: 3,
    unit: 'Days',
  },
  {
    id: 'streak_7',
    title: 'Weekly Devotion',
    description: 'Maintain an active practice habit for 7 days in a row.',
    category: 'streak',
    tier: 'silver',
    icon: 'Calendar',
    targetValue: 7,
    unit: 'Days',
  },
  {
    id: 'streak_14',
    title: 'Unbroken Flow',
    description: 'Sustain a 14-day consecutive typing streak.',
    category: 'streak',
    tier: 'gold',
    icon: 'Award',
    targetValue: 14,
    unit: 'Days',
  },
  {
    id: 'streak_30',
    title: 'Iron Discipline',
    description: 'Achieve a legendary 30-day continuous practice streak.',
    category: 'streak',
    tier: 'diamond',
    icon: 'ShieldCheck',
    targetValue: 30,
    unit: 'Days',
  },

  // Mastery Milestones
  {
    id: 'accuracy_98',
    title: 'Laser Precision',
    description: 'Finish any typing test with 98% accuracy or higher.',
    category: 'mastery',
    tier: 'silver',
    icon: 'Target',
    targetValue: 98,
    unit: '%',
  },
  {
    id: 'tests_10',
    title: 'Persistent Scholar',
    description: 'Complete 10 total typing sessions.',
    category: 'mastery',
    tier: 'bronze',
    icon: 'BookOpen',
    targetValue: 10,
    unit: 'Tests',
  },
  {
    id: 'tests_25',
    title: 'Keystroke Veteran',
    description: 'Complete 25 total typing sessions across all modes.',
    category: 'mastery',
    tier: 'silver',
    icon: 'Clock',
    targetValue: 25,
    unit: 'Tests',
  },
  {
    id: 'words_1000',
    title: 'Word Crafter',
    description: 'Type a total of 1,000 words across tests.',
    category: 'mastery',
    tier: 'bronze',
    icon: 'Layers',
    targetValue: 1000,
    unit: 'Words',
  },
  {
    id: 'words_5000',
    title: 'Lexicon Titan',
    description: 'Type 5,000 cumulative words in your typing journey.',
    category: 'mastery',
    tier: 'gold',
    icon: 'CheckCircle2',
    targetValue: 5000,
    unit: 'Words',
  },
  {
    id: 'arcade_champion',
    title: 'Arcade Ace',
    description: 'Score 300+ points in any typing arcade game.',
    category: 'mastery',
    tier: 'silver',
    icon: 'Gamepad2',
    targetValue: 300,
    unit: 'Points',
  },
  {
    id: 'lessons_8',
    title: 'Halfway Master',
    description: 'Pass 8 curriculum lessons with passing grades.',
    category: 'mastery',
    tier: 'silver',
    icon: 'GraduationCap',
    targetValue: 8,
    unit: 'Lessons',
  },
  {
    id: 'lessons_all',
    title: 'Grandmaster Graduate',
    description: 'Complete all 16 touch typing curriculum lessons.',
    category: 'mastery',
    tier: 'diamond',
    icon: 'Crown',
    targetValue: 16,
    unit: 'Lessons',
  }
];

export function getAchievementProgress(
  achievement: Achievement,
  stats: UserStats
): { current: number; isUnlocked: boolean; percentage: number } {
  let current = 0;

  switch (achievement.id) {
    case 'wpm_25':
    case 'wpm_40':
    case 'wpm_60':
    case 'wpm_80':
    case 'wpm_100':
    case 'wpm_120':
      current = stats.bestWpm || 0;
      break;

    case 'streak_3':
    case 'streak_7':
    case 'streak_14':
    case 'streak_30':
      current = stats.dailyStreak || 1;
      break;

    case 'accuracy_98':
      // Look at history for highest accuracy
      current = stats.history.length > 0 ? Math.max(...stats.history.map((h) => h.accuracy)) : stats.avgAccuracy;
      break;

    case 'tests_10':
    case 'tests_25':
      current = stats.totalTestsCompleted || 0;
      break;

    case 'words_1000':
    case 'words_5000':
      current = stats.totalWordsTyped || 0;
      break;

    case 'arcade_champion':
      current = Math.max(
        stats.gameScores?.meteor || 0,
        stats.gameScores?.racer || 0,
        stats.gameScores?.bubbles || 0
      );
      break;

    case 'lessons_8':
    case 'lessons_all':
      current = Object.values(stats.lessonProgress || {}).filter((l) => l.completed).length;
      break;

    default:
      current = 0;
  }

  const isUnlocked = current >= achievement.targetValue || (stats.unlockedAchievements || []).includes(achievement.id);
  const percentage = Math.min(100, Math.round((current / achievement.targetValue) * 100));

  return { current, isUnlocked, percentage };
}

export function evaluateAchievements(stats: UserStats): { newlyUnlocked: Achievement[]; allUnlockedIds: string[] } {
  const currentUnlocked = new Set(stats.unlockedAchievements || []);
  const newlyUnlocked: Achievement[] = [];

  for (const ach of ACHIEVEMENTS) {
    const { isUnlocked } = getAchievementProgress(ach, stats);
    if (isUnlocked && !currentUnlocked.has(ach.id)) {
      currentUnlocked.add(ach.id);
      newlyUnlocked.push(ach);
    }
  }

  return {
    newlyUnlocked,
    allUnlockedIds: Array.from(currentUnlocked),
  };
}
