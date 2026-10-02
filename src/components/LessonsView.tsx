import React, { useState } from 'react';
import { Lesson, UserStats, TestRecord } from '../types/typing';
import { ThemeConfig } from '../types/theme';
import { LESSONS, CATEGORY_LABELS } from '../data/lessons';
import { URDU_LESSONS, URDU_CATEGORY_LABELS } from '../data/urduLessons';
import { TypingArena } from './TypingArena';
import {
  BookOpen,
  Star,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  Sparkles,
  Award,
  Medal,
  CheckCircle2,
  X,
  Trophy,
  Flame,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface LessonsViewProps {
  stats: UserStats;
  onCompleteLesson: (lessonId: string, test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => void;
  theme?: ThemeConfig;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  stats,
  onCompleteLesson,
  theme,
}) => {
  const [curriculumLang, setCurriculumLang] = useState<'en' | 'ur'>('en');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [unlockedLessonBadge, setUnlockedLessonBadge] = useState<{
    lesson: Lesson;
    stars: number;
    wpm: number;
    accuracy: number;
  } | null>(null);

  const activeLessonList = curriculumLang === 'ur' ? URDU_LESSONS : LESSONS;
  const activeCategoryMap: Record<string, { label: string; count: number; desc: string }> =
    curriculumLang === 'ur' ? URDU_CATEGORY_LABELS : CATEGORY_LABELS;
  const categoryKeys = Object.keys(activeCategoryMap);

  const filteredLessons = activeCategory === 'all'
    ? activeLessonList
    : activeLessonList.filter((l) => l.category === activeCategory);

  // Handle lesson completion
  const handleLessonCompleted = (lesson: Lesson, test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => {
    onCompleteLesson(lesson.id, test, keyErrors);

    const passed = test.netWpm >= lesson.targetWpm && test.accuracy >= lesson.targetAcc;
    let stars = 1;
    if (test.netWpm >= lesson.targetWpm * 1.25 && test.accuracy >= 96) stars = 2;
    if (test.netWpm >= lesson.targetWpm * 1.5 && test.accuracy >= 98) stars = 3;

    if (passed) {
      soundEngine.playSuccess();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#06b6d4', '#10b981', '#a855f7'],
      });

      setUnlockedLessonBadge({
        lesson,
        stars,
        wpm: test.netWpm,
        accuracy: test.accuracy,
      });
    }
  };

  const totalBadgesEarned = Object.values(stats.lessonProgress || {}).filter((l) => l.completed).length;

  // If a lesson is actively running
  if (selectedLesson) {
    const currentList = selectedLesson.id.startsWith('urdu-') ? URDU_LESSONS : LESSONS;
    const currentIndex = currentList.findIndex((l) => l.id === selectedLesson.id);
    const nextLesson = currentIndex !== -1 && currentIndex + 1 < currentList.length ? currentList[currentIndex + 1] : null;
    const isUrduLesson = selectedLesson.id.startsWith('urdu-');

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isUrduLesson ? 'تمام اسباق پر واپس جائیں (Back to Lessons)' : 'Back to All Lessons'}</span>
          </button>

          <div className="text-right">
            <span className="text-xs text-amber-300 font-mono font-bold">
              {isUrduLesson ? `سبق نمبر ${selectedLesson.level} · تمغہ: ${selectedLesson.badgeName}` : `Lesson ${selectedLesson.level} of 16 · Badge: ${selectedLesson.badgeName}`}
            </span>
          </div>
        </div>

        {/* Lesson Instructions Banner with Target Badge Preview */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-amber-500/20 bg-slate-900/60 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-1.5 sm:gap-2 ${isUrduLesson ? 'font-urdu-clean text-lg' : ''}`}>
                <span>{selectedLesson.title}</span>
                <span className="text-xs text-slate-400 font-normal">· {selectedLesson.subtitle}</span>
              </h3>
              <p className={`text-xs text-slate-300 leading-relaxed ${isUrduLesson ? 'font-urdu-clean text-sm' : ''}`}>
                {selectedLesson.instructions}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-400 pt-1">
                <span>{isUrduLesson ? 'اہم حروف:' : 'Focus Keys:'}</span>
                <div className="flex flex-wrap gap-1">
                  {selectedLesson.focusKeys.map((key) => (
                    <kbd
                      key={key}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs inline-flex items-center justify-center text-center font-urdu-clean min-w-[28px] h-7 shadow-sm"
                    >
                      {key === ' ' ? '␣ Space' : key}
                    </kbd>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.08]">
            <div className="text-left sm:text-right font-mono text-xs">
              <span className="text-slate-400 block">{isUrduLesson ? 'ہدف رفتار:' : 'Target:'}</span>
              <span className="text-emerald-400 font-bold">{selectedLesson.targetWpm} WPM</span>
              <span className="text-slate-500"> · </span>
              <span className="text-cyan-400 font-bold">{selectedLesson.targetAcc}% Acc</span>
            </div>
          </div>
        </div>

        {/* Interactive Typing Arena */}
        <TypingArena
          title={selectedLesson.title}
          categoryLabel={isUrduLesson ? `اردو سبق · لیول ${selectedLesson.level}` : `Lesson ${selectedLesson.level} · ${selectedLesson.category}`}
          sourceText={selectedLesson.text}
          timedMode={null}
          onComplete={(test, keyErrors) => handleLessonCompleted(selectedLesson, test, keyErrors)}
          targetWpm={selectedLesson.targetWpm}
          targetAcc={selectedLesson.targetAcc}
          nextLessonTitle={nextLesson?.title}
          onNextLesson={nextLesson ? () => setSelectedLesson(nextLesson) : undefined}
          theme={theme}
        />

        {/* Badge Unlock Celebration Modal */}
        {unlockedLessonBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl glass-panel border border-amber-500/40 bg-gradient-to-b from-[#141d33] to-[#0c101d] p-6 text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
              <button
                onClick={() => setUnlockedLessonBadge(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                  {isUrduLesson ? 'نیا اعزازی تمغہ حاصل ہوا!' : 'Lesson Badge Unlocked!'}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {unlockedLessonBadge.lesson.badgeName}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {unlockedLessonBadge.lesson.badgeDescription}
                </p>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-6 h-6 ${
                      starIdx <= unlockedLessonBadge.stars
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_#f59e0b]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Certified Metrics */}
              <div className="flex justify-around p-3 rounded-2xl bg-black/50 border border-white/[0.08] font-mono text-sm">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Speed</span>
                  <span className="font-bold text-amber-300">{unlockedLessonBadge.wpm} WPM</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Accuracy</span>
                  <span className="font-bold text-emerald-300">{unlockedLessonBadge.accuracy}%</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Reward</span>
                  <span className="font-bold text-cyan-300">+75 XP</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setUnlockedLessonBadge(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white text-xs font-semibold hover:bg-white/[0.1] cursor-pointer"
                >
                  {isUrduLesson ? 'اسی سبق پر رہیں' : 'Stay on Lesson'}
                </button>
                {nextLesson && (
                  <button
                    onClick={() => {
                      setUnlockedLessonBadge(null);
                      setSelectedLesson(nextLesson);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{isUrduLesson ? 'اگلا سبق' : 'Next Lesson'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header with Language Selector & Badges Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>AZ Typing Fire · Curriculum Badges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {curriculumLang === 'ur' ? 'اردو و انگلش ٹچ ٹائپنگ نصاب' : 'Touch Typing Curriculum & Lesson Badges'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {curriculumLang === 'ur'
              ? 'انگریزی کے ساتھ ساتھ مکمل ۱۶ اردو اسباق شامل ہیں۔ ہر سبق کا ہدف مکمل کر کے شاندار ورچوئل بیجز حاصل کریں۔'
              : 'Pass each lesson\'s target WPM and accuracy benchmark to unlock its unique prestigious virtual badge.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language Toggle Tab (English vs Urdu) */}
          <div className="inline-flex p-1 rounded-2xl bg-white/[0.06] border border-white/[0.1] shadow-inner">
            <button
              onClick={() => {
                setCurriculumLang('en');
                setActiveCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                curriculumLang === 'en'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>English</span>
              <span className="text-[10px] opacity-75 font-mono">(16)</span>
            </button>
            <button
              onClick={() => {
                setCurriculumLang('ur');
                setActiveCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-urdu-clean flex items-center gap-1.5 ${
                curriculumLang === 'ur'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>اردو اسباق</span>
              <span className="text-[10px] opacity-75 font-mono">(16)</span>
            </button>
          </div>

          {/* Badges Progress Tracker */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <Medal className="w-6 h-6 text-amber-400 shrink-0 drop-shadow-[0_0_8px_#f59e0b]" />
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">Earned Badges</span>
              <div className="text-sm font-bold text-white font-mono">
                <span className="text-amber-300">{totalBadgesEarned}</span> / 32 Badges
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/[0.08] scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-white/[0.1] text-amber-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {curriculumLang === 'ur' ? 'تمام اسباق (16)' : 'All Lessons (16)'}
        </button>
        {categoryKeys.map((catKey) => {
          if (catKey === 'all') return null;
          const catInfo = activeCategoryMap[catKey];
          if (!catInfo) return null;
          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === catKey
                  ? 'bg-white/[0.1] text-amber-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {catInfo.label}
            </button>
          );
        })}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.map((lesson) => {
          const progress = stats.lessonProgress[lesson.id];
          const isCompleted = progress?.completed || false;
          const stars = progress?.stars || 0;
          const bestWpm = progress?.bestWpm || 0;
          const isUrdu = lesson.id.startsWith('urdu-');

          return (
            <div
              key={lesson.id}
              className={`p-5 rounded-2xl glass-panel-interactive border transition-all flex flex-col justify-between group ${
                isCompleted
                  ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-transparent'
                  : 'border-white/[0.08]'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top unboxed metadata */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-amber-400 font-bold">Level {lesson.level}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{lesson.category}</span>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Target: {lesson.targetWpm} WPM</span>
                  )}
                </div>

                {/* Lesson Title & Subtitle */}
                <div>
                  <h3 className={`text-base font-bold text-white group-hover:text-amber-300 transition-colors ${isUrdu ? 'font-urdu-clean text-lg' : ''}`}>
                    {lesson.title}
                  </h3>
                  <p className={`text-xs text-slate-400 mt-0.5 line-clamp-1 ${isUrdu ? 'font-urdu-clean text-xs text-slate-300' : ''}`}>
                    {lesson.subtitle}
                  </p>
                </div>

                {/* Badge Preview */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <Award className={`w-4 h-4 shrink-0 ${isCompleted ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs text-slate-300 truncate font-medium">
                    {lesson.badgeName}
                  </span>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                {isCompleted ? (
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Best: {bestWpm} WPM</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-500">
                    Accuracy: {lesson.targetAcc}%+
                  </div>
                )}

                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200'
                      : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-md shadow-amber-500/20'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isCompleted ? (isUrdu ? 'دوبارہ مشق' : 'Replay') : (isUrdu ? 'سبق شروع کریں' : 'Start')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
