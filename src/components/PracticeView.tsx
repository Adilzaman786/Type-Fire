import React, { useState, useMemo } from 'react';
import { PracticeParagraph, UserStats, TestRecord } from '../types/typing';
import { ThemeConfig } from '../types/theme';
import { PRACTICE_PARAGRAPHS, getDailyChallengeParagraph } from '../data/paragraphs';
import { URDU_PRACTICE_PARAGRAPHS } from '../data/urduParagraphs';
import { TypingArena } from './TypingArena';
import { Sparkles, Dices, Calendar, Flame, Clock, Filter, ArrowLeft, PenTool, CheckCircle, Globe } from 'lucide-react';

interface PracticeViewProps {
  stats: UserStats;
  onCompleteTest: (test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => void;
  customInitialText?: string | null;
  theme?: ThemeConfig;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  stats,
  onCompleteTest,
  customInitialText = null,
  theme,
}) => {
  const [practiceLang, setPracticeLang] = useState<'en' | 'ur'>('en');
  const dailyEnglishParagraph = useMemo(() => getDailyChallengeParagraph(), []);
  const dailyUrduParagraph = useMemo(() => URDU_PRACTICE_PARAGRAPHS[0], []);

  const currentDaily = practiceLang === 'ur' ? dailyUrduParagraph : dailyEnglishParagraph;

  const [activeParagraph, setActiveParagraph] = useState<PracticeParagraph | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(60); // 60s default
  const [customText, setCustomText] = useState<string>(customInitialText || '');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Ghost Pacer configuration (challenging personal best speed in real-time)
  const userBestWpm = stats.bestWpm > 0 ? stats.bestWpm : 45;
  const [ghostPacerEnabled, setGhostPacerEnabled] = useState<boolean>(true);
  const [ghostSpeed, setGhostSpeed] = useState<number>(userBestWpm);

  // Sync ghost speed when user completes tests and bestWpm updates
  React.useEffect(() => {
    if (stats.bestWpm > 0) {
      setGhostSpeed(stats.bestWpm);
    }
  }, [stats.bestWpm]);

  // If a custom initial text is supplied (e.g. weak keys drill)
  React.useEffect(() => {
    if (customInitialText) {
      setActiveParagraph({
        id: 'custom_drill_' + Date.now(),
        title: 'Targeted Diagnostic Drill',
        category: 'daily',
        difficulty: 'medium',
        text: customInitialText,
      });
    }
  }, [customInitialText]);

  const activePool = practiceLang === 'ur' ? URDU_PRACTICE_PARAGRAPHS : PRACTICE_PARAGRAPHS;

  // Filtered paragraphs
  const filteredList = useMemo(() => {
    if (selectedCategory === 'all') return activePool;
    return activePool.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, activePool]);

  // Pick random paragraph
  const handlePickRandom = () => {
    const list = filteredList.length > 0 ? filteredList : activePool;
    const rand = list[Math.floor(Math.random() * list.length)];
    setActiveParagraph(rand);
  };

  // Launch Custom text test
  const handleLaunchCustomText = () => {
    if (!customText.trim()) return;
    setActiveParagraph({
      id: 'custom_' + Date.now(),
      title: practiceLang === 'ur' ? 'کسٹم تحریر کی مشق (Custom Practice)' : 'Custom User Text Practice',
      category: 'daily',
      difficulty: 'medium',
      text: customText.trim(),
    });
    setShowCustomModal(false);
  };

  // If arena is active
  if (activeParagraph) {
    const isUrdu = practiceLang === 'ur' || /[\u0600-\u06FF]/.test(activeParagraph.text);
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveParagraph(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'تمام پیراگراف پر واپس جائیں' : 'Back to Practice Library'}</span>
          </button>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="capitalize">{activeParagraph.category}</span>
            <span>·</span>
            <span className="capitalize">{activeParagraph.difficulty}</span>
          </div>
        </div>

        <TypingArena
          title={activeParagraph.title}
          categoryLabel={isUrdu ? 'اردو مشق پیراگراف' : `Practice · ${activeParagraph.category}`}
          sourceText={activeParagraph.text}
          timedMode={selectedDuration}
          onComplete={onCompleteTest}
          theme={theme}
          ghostWpm={ghostPacerEnabled ? ghostSpeed : null}
          enableGhostPacer={ghostPacerEnabled}
          onToggleGhostPacer={() => setGhostPacerEnabled((prev) => !prev)}
          onChangeGhostSpeed={(speed) => setGhostSpeed(speed)}
          userBestWpm={userBestWpm}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header with Language Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Flame className="w-3.5 h-3.5" />
            <span>AZ Typing Fire · Practice Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {practiceLang === 'ur' ? 'اردو و انگلش پیراگراف و کسٹم مشق' : 'Open Practice & Paragraph Challenges'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {practiceLang === 'ur'
              ? 'انگریزی کے ساتھ ساتھ متنوع اردو پیراگراف کی مشق کریں، یا اپنی مرضی کا کوئی بھی مضمون پیسٹ کر کے اسپیڈ بڑھائیں۔'
              : 'Choose curated paragraphs spanning literature, science, tech, or paste your own custom drill.'}
          </p>
        </div>

        {/* Language Switcher Tab */}
        <div className="inline-flex p-1 rounded-2xl bg-white/[0.06] border border-white/[0.1] shadow-inner self-start md:self-auto">
          <button
            onClick={() => {
              setPracticeLang('en');
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              practiceLang === 'en'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>English Texts</span>
          </button>
          <button
            onClick={() => {
              setPracticeLang('ur');
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-urdu-clean flex items-center gap-1.5 ${
              practiceLang === 'ur'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>اردو پیراگراف</span>
          </button>
        </div>
      </div>

      {/* Featured Daily Challenge Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 overflow-hidden bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-slate-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Calendar className="w-4 h-4" />
              <span>{practiceLang === 'ur' ? 'آج کا خصوصی چیلنج' : "Today's Selected Challenge"}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 capitalize">{currentDaily.category}</span>
            </div>

            <h2 className={`text-xl sm:text-2xl font-black text-white tracking-tight ${practiceLang === 'ur' ? 'font-urdu-clean text-2xl' : ''}`}>
              {currentDaily.title}
            </h2>

            <p className={`text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed line-clamp-2 ${practiceLang === 'ur' ? 'font-urdu-clean text-sm' : 'font-mono'}`}>
              "{currentDaily.text}"
            </p>

            {currentDaily.authorOrSource && (
              <div className="text-xs text-slate-400">
                {practiceLang === 'ur' ? 'ماخذ:' : 'Source:'} <span className="text-slate-200">{currentDaily.authorOrSource}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setActiveParagraph(currentDaily)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>{practiceLang === 'ur' ? 'چیلنج شروع کریں' : 'Start Daily Challenge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control bar: Categories, Timer mode, Random dice, Custom text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white/[0.1] text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {practiceLang === 'ur' ? 'تمام تحاریر (All)' : 'All Texts'}
          </button>
          {practiceLang === 'ur' ? (
            <>
              <button
                onClick={() => setSelectedCategory('philosophy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer font-urdu-clean ${
                  selectedCategory === 'philosophy' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                اخلاقیات و حکمت
              </button>
              <button
                onClick={() => setSelectedCategory('literature')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer font-urdu-clean ${
                  selectedCategory === 'literature' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ادب و شاعری
              </button>
              <button
                onClick={() => setSelectedCategory('technology')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer font-urdu-clean ${
                  selectedCategory === 'technology' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                سائنس و کمپیوٹر
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedCategory('technology')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'technology' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Technology &amp; AI
              </button>
              <button
                onClick={() => setSelectedCategory('roman-urdu')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'roman-urdu' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roman Urdu
              </button>
              <button
                onClick={() => setSelectedCategory('science')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'science' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Science &amp; Cosmos
              </button>
              <button
                onClick={() => setSelectedCategory('philosophy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'philosophy' ? 'bg-white/[0.1] text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Philosophy
              </button>
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ghost Pacer Record Challenge Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-xs font-mono">
            <button
              onClick={() => setGhostPacerEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                ghostPacerEnabled
                  ? 'bg-purple-500/25 text-purple-200 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Toggle Ghost Pacer (Challenging Personal Best of ${userBestWpm} WPM)`}
            >
              <span>👻</span>
              <span>Ghost: {ghostPacerEnabled ? `${ghostSpeed} WPM` : 'OFF'}</span>
            </button>
            {ghostPacerEnabled && (
              <div className="flex items-center gap-0.5 border-l border-purple-500/20 pl-1">
                <button
                  onClick={() => setGhostSpeed((s) => Math.max(15, s - 5))}
                  className="px-1 text-slate-400 hover:text-white cursor-pointer text-[11px]"
                  title="Slow down ghost (-5 WPM)"
                >
                  -
                </button>
                <button
                  onClick={() => setGhostSpeed((s) => s + 5)}
                  className="px-1 text-slate-400 hover:text-white cursor-pointer text-[11px]"
                  title="Speed up ghost (+5 WPM)"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Time Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono">
            {[null, 30, 60, 120].map((s) => (
              <button
                key={s ?? 'full'}
                onClick={() => setSelectedDuration(s)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  selectedDuration === s ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s ? `${s}s` : 'Full'}
              </button>
            ))}
          </div>

          {/* Roll Random */}
          <button
            onClick={handlePickRandom}
            title="Choose random paragraph"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-medium text-cyan-300 transition-colors cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>

          {/* Custom Text input trigger */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Paragraphs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((paragraph) => {
          const isUrdu = practiceLang === 'ur' || /[\u0600-\u06FF]/.test(paragraph.text);
          return (
            <div
              key={paragraph.id}
              className="p-5 rounded-2xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize font-mono">{paragraph.category}</span>
                  <span className="capitalize text-slate-500 font-mono">{paragraph.difficulty}</span>
                </div>

                <h3 className={`text-base font-bold text-white group-hover:text-cyan-300 transition-colors ${isUrdu ? 'font-urdu-clean text-lg' : ''}`}>
                  {paragraph.title}
                </h3>

                <p className={`text-xs text-slate-300 leading-relaxed line-clamp-3 ${isUrdu ? 'font-urdu-clean text-sm' : 'font-mono'}`}>
                  "{paragraph.text}"
                </p>

                {paragraph.authorOrSource && (
                  <div className="text-[11px] text-slate-400">
                    {paragraph.authorOrSource}
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveParagraph(paragraph)}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-200 border border-white/[0.08] hover:border-cyan-400/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>{isUrdu ? 'اس پیراگراف کی مشق کریں' : 'Practice This Paragraph'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Text Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {practiceLang === 'ur' ? 'اپنی کسٹم تحریر ٹائپ یا پیسٹ کریں' : 'Practice Custom Text'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {practiceLang === 'ur'
                ? 'کوئی بھی اردو یا انگریزی پیراگراف، مضمون یا نوٹس پیسٹ کریں اور ٹائپنگ کی مشق شروع کریں۔'
                : 'Paste any paragraph, essay, study notes, or interview answer to practice typing it.'}
            </p>

            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={practiceLang === 'ur' ? 'یہاں اپنی مرضی کی اردو یا انگلش تحریر پیسٹ کریں...' : 'Paste or write your custom text here...'}
              rows={5}
              dir="auto"
              className="w-full mt-4 p-3 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none font-urdu-clean"
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchCustomText}
                disabled={!customText.trim()}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black cursor-pointer shadow-md font-bold"
              >
                {practiceLang === 'ur' ? 'مشق شروع کریں' : 'Start Typing Text'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
