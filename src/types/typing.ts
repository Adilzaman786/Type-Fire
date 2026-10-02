export type TabMode = 'lessons' | 'test' | 'practice' | 'leaderboard' | 'games' | 'dashboard';

export type SwitchSound = 'cherry-blue' | 'cherry-brown' | 'typewriter' | 'subtle' | 'mechanical' | 'clicky' | 'off';

export interface LeaderboardEntry {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  language: 'en' | 'ur';
  level: number;
  badge: string;
  streak: number;
  timestamp: number;
  isCurrentUser?: boolean;
  avatar?: string;
  location?: string;
}

export interface KeyFingerInfo {
  key: string;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';
  hand: 'left' | 'right';
  fingerLabel: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  category: 'home-row' | 'top-row' | 'bottom-row' | 'capitals' | 'numbers' | 'punctuation' | 'developer' | 'roman-urdu';
  level: number;
  targetWpm: number;
  targetAcc: number;
  text: string;
  instructions: string;
  focusKeys: string[];
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
}

export interface UserStats {
  xp: number;
  level: number;
  totalWordsTyped: number;
  totalTestsCompleted: number;
  totalPracticeTimeSeconds: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  dailyStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: TestRecord[];
  problemKeys: Record<string, { total: number; errors: number }>;
  lessonProgress: Record<string, { completed: boolean; stars: number; bestWpm: number; bestAcc: number; unlockedBadge?: boolean; badgeName?: string }>;
  gameScores: {
    meteor: number;
    racer: number;
    bubbles: number;
    invaders: number;
    defense: number;
    runner: number;
  };
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'wpm' | 'streak' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: string;
  targetValue: number;
  unit: string;
}


export interface TestRecord {
  id: string;
  timestamp: number;
  mode: 'lesson' | 'practice' | 'daily' | 'custom';
  title: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  timeSeconds: number;
  characterCount: number;
  errors: number;
}

export interface PracticeParagraph {
  id: string;
  title: string;
  category: 'daily' | 'technology' | 'science' | 'literature' | 'philosophy' | 'code' | 'roman-urdu' | 'common-words';
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  authorOrSource?: string;
}

export interface SpeedDataPoint {
  second: number;
  wpm: number;
  errors: number;
}
