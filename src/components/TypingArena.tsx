import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Volume2, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BarChart2, Ghost, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { VirtualKeyboard } from './VirtualKeyboard';
import { soundEngine } from '../utils/audio';
import { SpeedDataPoint, TestRecord } from '../types/typing';
import { ThemeConfig } from '../types/theme';
import { isUrduText, mapKeyToUrdu, URDU_TO_KEY_MAP } from '../utils/urduKeyboardMap';

interface TypingArenaProps {
  title: string;
  categoryLabel?: string;
  sourceText: string;
  timedMode?: number | null; // e.g. 15, 30, 60 seconds, or null for full paragraph
  onComplete: (test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => void;
  targetWpm?: number;
  targetAcc?: number;
  nextLessonTitle?: string;
  onNextLesson?: () => void;
  theme?: ThemeConfig;
  ghostWpm?: number | null;
  enableGhostPacer?: boolean;
  onToggleGhostPacer?: () => void;
  onChangeGhostSpeed?: (speed: number) => void;
  userBestWpm?: number;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  title,
  categoryLabel,
  sourceText,
  timedMode = null,
  onComplete,
  targetWpm,
  targetAcc,
  nextLessonTitle,
  onNextLesson,
  theme,
  ghostWpm = null,
  enableGhostPacer = true,
  onToggleGhostPacer,
  onChangeGhostSpeed,
  userBestWpm,
}) => {

  // Input state
  const [userInput, setUserInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeKey, setActiveKey] = useState<string>('');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [phoneticEnabled, setPhoneticEnabled] = useState<boolean>(true);

  // Detect whether source text is in Urdu script
  const isUrdu = useMemo(() => isUrduText(sourceText), [sourceText]);

  // Error tracking per key
  const [keyErrors, setKeyErrors] = useState<Record<string, number>>({});
  const [speedHistory, setSpeedHistory] = useState<SpeedDataPoint[]>([]);

  // Telemetry refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCharSpanRef = useRef<HTMLSpanElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Synchronous state refs to prevent stale closures and unsafe setState inside updaters
  const isFinishedRef = useRef<boolean>(false);
  const isStartedRef = useRef<boolean>(false);
  const elapsedSecondsRef = useRef<number>(0);
  const userInputRef = useRef<string>('');
  const keyErrorsRef = useRef<Record<string, number>>({});

  // Target text characters
  const targetChars = useMemo(() => sourceText.split(''), [sourceText]);
  const currentIndex = userInput.length;
  const currentTargetChar = targetChars[currentIndex] || '';

  // Parse words with character offsets for cohesive whole-word typography (no split letters in Urdu)
  const parsedWords = useMemo(() => {
    const list: {
      word: string;
      startIndex: number;
      endIndex: number;
      hasSpace: boolean;
    }[] = [];

    let idx = 0;
    const tokens = sourceText.split(' ');
    tokens.forEach((w, i) => {
      const start = idx;
      const end = start + w.length;
      const isLast = i === tokens.length - 1;
      list.push({
        word: w,
        startIndex: start,
        endIndex: end,
        hasSpace: !isLast,
      });
      idx = end + (isLast ? 0 : 1);
    });
    return list;
  }, [sourceText]);

  // Current active word
  const currentWord = useMemo(() => {
    return parsedWords.find(
      (w) => currentIndex >= w.startIndex && currentIndex <= w.endIndex
    ) || parsedWords[0];
  }, [parsedWords, currentIndex]);

  // Keep refs synchronized
  isFinishedRef.current = isFinished;
  isStartedRef.current = isStarted;
  elapsedSecondsRef.current = elapsedSeconds;
  userInputRef.current = userInput;
  keyErrorsRef.current = keyErrors;

  // Focus input automatically
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [sourceText]);

  // Reset state when text changes
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isFinishedRef.current = false;
    isStartedRef.current = false;
    elapsedSecondsRef.current = 0;
    userInputRef.current = '';
    keyErrorsRef.current = {};

    setUserInput('');
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setKeyErrors({});
    setSpeedHistory([]);
    setGhostCharIndex(0);
    setGhostProgress(0);
    focusInput();
  }, []);

  // Ghost Pacer Real-Time Telemetry (Tracking against personal best pace)
  const [ghostCharIndex, setGhostCharIndex] = useState<number>(0);
  const [ghostProgress, setGhostProgress] = useState<number>(0);

  useEffect(() => {
    if (!isStarted || isFinished || !ghostWpm || !enableGhostPacer || !startTime) {
      if (!isStarted) {
        setGhostCharIndex(0);
        setGhostProgress(0);
      }
      return;
    }

    let animationFrameId: number;
    const updateGhost = () => {
      const now = Date.now();
      const elapsedSec = (now - startTime) / 1000;
      // 1 standard word = 5 characters
      const charsPerSec = (ghostWpm * 5) / 60;
      const targetGhostChars = Math.min(targetChars.length, elapsedSec * charsPerSec);
      const progress = (targetGhostChars / targetChars.length) * 100;

      setGhostCharIndex(Math.floor(targetGhostChars));
      setGhostProgress(Math.min(100, progress));

      if (targetGhostChars < targetChars.length && !isFinishedRef.current) {
        animationFrameId = requestAnimationFrame(updateGhost);
      }
    };

    animationFrameId = requestAnimationFrame(updateGhost);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isStarted, isFinished, ghostWpm, enableGhostPacer, startTime, targetChars.length]);

  useEffect(() => {
    handleReset();
  }, [sourceText, timedMode, handleReset]);

  // Calculate live statistics
  const stats = useMemo(() => {
    const timeInMinutes = Math.max(elapsedSeconds / 60, 0.01);
    const totalTyped = userInput.length;

    let correctCount = 0;
    let errorCount = 0;

    for (let i = 0; i < totalTyped; i++) {
      if (userInput[i] === targetChars[i]) {
        correctCount++;
      } else {
        errorCount++;
      }
    }

    const grossWpm = Math.round((totalTyped / 5) / timeInMinutes);
    const netWpm = Math.max(0, Math.round(((totalTyped / 5) - errorCount) / timeInMinutes));
    const accuracy = totalTyped > 0 ? Math.max(0, Math.round((correctCount / totalTyped) * 100)) : 100;
    const cpm = Math.round(totalTyped / timeInMinutes);

    return {
      grossWpm,
      netWpm: isStarted ? netWpm : 0,
      accuracy,
      correctCount,
      errorCount,
      cpm,
      totalTyped,
    };
  }, [userInput, targetChars, elapsedSeconds, isStarted]);

  const statsRef = useRef(stats);
  statsRef.current = stats;

  // Finish test cleanly
  const handleFinish = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    soundEngine.playSuccess();

    const currentStats = statsRef.current;
    if (currentStats.accuracy >= 94) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#6366f1', '#a855f7', '#10b981'],
      });
    }

    const totalSeconds = Math.max(1, elapsedSecondsRef.current);
    const timeInMinutes = totalSeconds / 60;
    const netWpm = Math.max(0, Math.round(((currentStats.totalTyped / 5) - currentStats.errorCount) / timeInMinutes));

    const testPayload = {
      mode: (categoryLabel === 'Lesson' ? 'lesson' : 'practice') as 'lesson' | 'practice',
      title,
      wpm: netWpm,
      netWpm,
      accuracy: currentStats.accuracy,
      timeSeconds: totalSeconds,
      characterCount: currentStats.totalTyped,
      errors: currentStats.errorCount,
    };
    const errorsPayload = { ...keyErrorsRef.current };

    // Defer parent callback to avoid setState-in-render violations
    setTimeout(() => {
      onComplete(testPayload, errorsPayload);
    }, 0);
  }, [categoryLabel, title, onComplete]);

  // Main timer: steady cadence that does NOT reset on every keystroke
  useEffect(() => {
    if (!isStarted || isFinished) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        elapsedSecondsRef.current = next;
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isStarted, isFinished]);

  // Track telemetry history points on each elapsed second
  useEffect(() => {
    if (!isStarted || isFinished || elapsedSeconds === 0) return;
    const currentMins = elapsedSeconds / 60;
    const currentWpm = Math.round((userInputRef.current.length / 5) / currentMins);
    setSpeedHistory((hist) => [
      ...hist,
      { second: elapsedSeconds, wpm: currentWpm, errors: statsRef.current.errorCount },
    ]);
  }, [elapsedSeconds, isStarted, isFinished]);

  // Check timed mode expiration cleanly in an effect
  useEffect(() => {
    if (timedMode && isStarted && !isFinished && elapsedSeconds >= timedMode) {
      handleFinish();
    }
  }, [timedMode, elapsedSeconds, isStarted, isFinished, handleFinish]);

  // Scroll active character into view
  useEffect(() => {
    if (activeCharSpanRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const el = activeCharSpanRef.current;
      const offsetTop = el.offsetTop - container.offsetTop;
      if (offsetTop > 80) {
        container.scrollTo({
          top: offsetTop - 60,
          behavior: 'smooth',
        });
      }
    }
  }, [currentIndex]);

  // Keydown handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Tab from leaving arena
    if (e.key === 'Tab') {
      e.preventDefault();
      handleReset();
      return;
    }

    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 120);

    // If test is already finished, ignore
    if (isFinished) return;

    // Start timer on first keystroke
    if (!isStarted && e.key.length === 1) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      soundEngine.playKey(false);
      setUserInput((prev) => prev.slice(0, -1));
      return;
    }

    // Single character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      let typedChar = e.key;

      // If text is in Urdu script and phonetic mapping is enabled, map English key to Urdu letter
      if (isUrdu && phoneticEnabled && typedChar !== ' ') {
        typedChar = mapKeyToUrdu(e.key, e.shiftKey);
      }

      const expectedChar = targetChars[currentIndex];
      const isSpace = typedChar === ' ';

      if (typedChar === expectedChar) {
        soundEngine.playKey(isSpace);
      } else {
        soundEngine.playError();
        // Record problem key
        setKeyErrors((prev) => ({
          ...prev,
          [expectedChar || typedChar]: (prev[expectedChar || typedChar] || 0) + 1,
        }));
      }

      const nextInput = userInput + typedChar;
      setUserInput(nextInput);

      // Check if finished entire text
      if (nextInput.length >= targetChars.length) {
        setTimeout(handleFinish, 50);
      }
    }
  };

  // Telemetry math for Ghost Pacer & User progress
  const userCharsTyped = userInput.length;
  const ghostCharsTyped = ghostCharIndex;
  const charDelta = userCharsTyped - ghostCharsTyped;
  const wordDelta = Math.round(charDelta / 5);
  const userProgressPercent = targetChars.length > 0 ? Math.min(100, (userCharsTyped / targetChars.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
      {/* Top HUD: Responsive Clean Telemetry & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/[0.08]">
        {/* Left: Title & metadata */}
        <div className="flex items-center justify-between md:block">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 font-mono">
              {categoryLabel && <span>{categoryLabel}</span>}
              {categoryLabel && <span aria-hidden="true">·</span>}
              <span>{timedMode ? `${timedMode}s Timed` : 'Full Text'}</span>
              <span aria-hidden="true">·</span>
              <span>{targetChars.length} chars</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 truncate max-w-xs sm:max-w-md">{title}</h2>
          </div>

          {/* Quick actions for mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setShowKeyboard((prev) => !prev)}
              className={`p-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showKeyboard
                  ? 'bg-white/[0.08] border-cyan-400/30 text-cyan-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
              }`}
              title="Toggle Keyboard"
            >
              {showKeyboard ? '⌨️ ON' : '⌨️ OFF'}
            </button>
            <button
              onClick={handleReset}
              title="Reset Test"
              className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Live Telemetry Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 font-mono text-center bg-black/30 md:bg-transparent p-2 md:p-0 rounded-xl border border-white/[0.04] md:border-0">
          <div>
            <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">WPM</span>
            <span className="text-xl sm:text-3xl font-extrabold text-cyan-300 tabular-nums">
              {stats.netWpm}
            </span>
          </div>

          <div className="border-x border-white/10 px-2 sm:px-4">
            <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">Accuracy</span>
            <span className={`text-xl sm:text-3xl font-extrabold tabular-nums ${
              stats.accuracy >= 95 ? 'text-emerald-300' : stats.accuracy >= 85 ? 'text-amber-300' : 'text-rose-300'
            }`}>
              {stats.accuracy}%
            </span>
          </div>

          <div>
            <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">
              {timedMode ? 'Left' : 'Time'}
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-200 tabular-nums">
              {timedMode ? `${Math.max(0, timedMode - elapsedSeconds)}s` : `${elapsedSeconds}s`}
            </span>
          </div>
        </div>

        {/* Right: Quick actions for desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isUrdu && (
            <button
              onClick={() => setPhoneticEnabled((prev) => !prev)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                phoneticEnabled
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
              }`}
              title="Phonetic Urdu Engine: Type on standard English keyboard to produce Urdu characters"
            >
              <span>فونیٹک انجن:</span>
              <strong className="font-bold">{phoneticEnabled ? 'آن (ON)' : 'آف (OFF)'}</strong>
            </button>
          )}
          <button
            onClick={() => setShowKeyboard((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showKeyboard
                ? 'bg-white/[0.08] border-cyan-400/30 text-cyan-300'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            {showKeyboard ? 'Keyboard ON' : 'Keyboard OFF'}
          </button>
          <button
            onClick={handleReset}
            title="Reset (Tab)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Ghost Pacer Dual Track Indicator (Challenging Personal Best) */}
      {enableGhostPacer && ghostWpm && ghostWpm > 0 && (
        <div className="p-3 sm:p-3.5 rounded-2xl glass-panel border border-purple-500/25 bg-gradient-to-r from-purple-950/25 via-slate-900/60 to-purple-950/25 shadow-lg space-y-2 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold shadow-sm">
                <span className="text-sm">👻</span>
                <span>Ghost Pacer</span>
                <span className="text-purple-200">({ghostWpm} WPM)</span>
              </span>
              <span className="text-slate-400 hidden sm:inline text-[11px]">
                {userBestWpm && userBestWpm === ghostWpm ? 'Targeting Personal Record' : 'Challenge Pace'}
              </span>
            </div>

            {/* Live Delta Status */}
            {isStarted && (
              <div className="flex items-center gap-2">
                {wordDelta > 0 ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs animate-pulse">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{wordDelta} {wordDelta === 1 ? 'word' : 'words'} ahead of PB!</span>
                  </span>
                ) : wordDelta < 0 ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold text-xs">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{Math.abs(wordDelta)} {Math.abs(wordDelta) === 1 ? 'word' : 'words'} behind PB</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Neck and neck with Record!</span>
                  </span>
                )}
              </div>
            )}

            {/* Quick Speed Adjust & Hide Toggle */}
            <div className="flex items-center gap-1.5 ml-auto">
              {onChangeGhostSpeed && (
                <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-1 py-0.5">
                  <button
                    onClick={() => onChangeGhostSpeed(Math.max(15, ghostWpm - 5))}
                    className="px-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                    title="Decrease Ghost speed (-5 WPM)"
                  >
                    -
                  </button>
                  <span className="text-[11px] text-purple-300 font-bold px-1">{ghostWpm} WPM</span>
                  <button
                    onClick={() => onChangeGhostSpeed(ghostWpm + 5)}
                    className="px-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                    title="Increase Ghost speed (+5 WPM)"
                  >
                    +
                  </button>
                </div>
              )}
              {onToggleGhostPacer && (
                <button
                  onClick={onToggleGhostPacer}
                  className="text-[11px] px-2 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Toggle Ghost Pacer"
                >
                  Hide
                </button>
              )}
            </div>
          </div>

          {/* Interactive Dual-Track Visualizer */}
          <div className="relative w-full h-3.5 bg-slate-950/80 border border-white/[0.08] rounded-full overflow-visible my-1 px-0.5">
            {/* User progress fill */}
            <div
              className="absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r from-cyan-500/60 to-emerald-400/80 transition-all duration-100"
              style={{
                [isUrdu ? 'right' : 'left']: 0,
                width: `${userProgressPercent}%`,
              }}
            />

            {/* Subtle, semi-transparent moving Ghost indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none z-10"
              style={{
                [isUrdu ? 'right' : 'left']: `${Math.min(99, ghostProgress)}%`,
                transform: `translate(${isUrdu ? '50%' : '-50%'}, -50%)`,
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Subtle soft ethereal ghost aura */}
                <span className="absolute w-5 h-5 rounded-full bg-purple-500/25 blur-[3px] pointer-events-none" />
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.4)] backdrop-blur-md text-[10px] text-purple-200 whitespace-nowrap opacity-85">
                  <span className="text-[11px]">👻</span>
                  <span className="font-bold text-[9px] hidden sm:inline">PB</span>
                </div>
              </div>
            </div>

            {/* User cursor indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 pointer-events-none z-20"
              style={{
                [isUrdu ? 'right' : 'left']: `${Math.min(99, userProgressPercent)}%`,
                transform: `translate(${isUrdu ? '50%' : '-50%'}, -50%)`,
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_#22d3ee] animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Typing Canvas (Liquid Glass Card) */}
      <div
        onClick={focusInput}
        className="relative rounded-2xl glass-panel p-4 sm:p-7 cursor-text border border-white/[0.1] shadow-2xl transition-all hover:border-cyan-500/30 min-h-[190px] sm:min-h-[220px]"
      >
        {/* Invisible capturing input */}
        <input
          ref={inputRef}
          type="text"
          value=""
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 cursor-default pointer-events-none"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />

        {/* Active Word & Key Guidance Strip for Urdu */}
        {isUrdu && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 mb-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-xs font-urdu-clean text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">موجودہ لفظ (Active Word):</span>
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 text-lg font-bold inline-flex items-center justify-center text-center min-w-[60px]">
                {currentWord ? currentWord.word : '—'}
              </span>
            </div>

            {/* Letter by Letter Breakdown in Strip */}
            {currentWord && (
              <div className="flex items-center justify-center gap-1.5" dir="rtl">
                <span className="text-slate-400 text-xs">حروف (ایک ایک حرف):</span>
                <div className="flex items-center justify-center gap-1">
                  {currentWord.word.split('').map((char, cIdx) => {
                    const absIdx = currentWord.startIndex + cIdx;
                    const isTyped = absIdx < userInput.length;
                    const isCharCurrent = absIdx === currentIndex;
                    const isCharCorrect = isTyped && userInput[absIdx] === char;
                    const isCharError = isTyped && userInput[absIdx] !== char;
                    return (
                      <span
                        key={cIdx}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all inline-flex items-center justify-center text-center min-w-[24px] ${
                          isCharCurrent
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 scale-110 font-black shadow-sm'
                            : isCharCorrect
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                            : isCharError
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                            : 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}
                  {currentIndex === currentWord.endIndex && (
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-bold animate-pulse inline-flex items-center justify-center text-center">
                      ␣ Space
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-slate-400">اگلا کی (Key):</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.08] text-white font-mono font-bold text-xs inline-flex items-center justify-center text-center gap-1.5 border border-white/10">
                {currentTargetChar === ' ' ? (
                  '␣ Space (فاصلہ)'
                ) : (
                  <>
                    <span className="font-urdu-clean text-sm text-amber-300 flex items-center justify-center text-center">{currentTargetChar}</span>
                    {URDU_TO_KEY_MAP[currentTargetChar] && (
                      <span className="text-[11px] text-cyan-300 font-mono flex items-center justify-center text-center">
                        ({URDU_TO_KEY_MAP[currentTargetChar].shift ? 'Shift + ' : ''}{URDU_TO_KEY_MAP[currentTargetChar].displayKey})
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Text Display with word-by-word cohesive typography (intact Nastaliq words) */}
        <div
          ref={textContainerRef}
          dir={isUrdu ? 'rtl' : 'ltr'}
          className={`${
            isUrdu
              ? 'font-urdu text-xl sm:text-2xl md:text-3xl leading-[2.8] text-center justify-center'
              : 'font-mono text-base sm:text-xl md:text-2xl leading-relaxed tracking-wide text-left'
          } select-none max-h-56 sm:max-h-64 overflow-y-auto px-2 sm:px-4 flex flex-wrap items-center justify-center content-start gap-y-3 gap-x-1`}
        >
          {parsedWords.map((w, wIdx) => {
            const isCompletedWord = currentIndex > w.endIndex || (currentIndex === w.endIndex && currentIndex === targetChars.length);
            const isCurrentWord = !isCompletedWord && currentIndex >= w.startIndex && currentIndex <= w.endIndex;

            if (isCompletedWord) {
              const userTyped = userInput.slice(w.startIndex, w.endIndex);
              const isCorrect = userTyped === w.word;
              return (
                <span
                  key={wIdx}
                  className={`inline-flex items-center justify-center text-center mx-1.5 transition-colors ${
                    isCorrect
                      ? 'text-emerald-400 font-medium'
                      : 'text-rose-400 underline decoration-rose-500 font-medium bg-rose-500/10 rounded px-1.5'
                  }`}
                >
                  {w.word}
                </span>
              );
            }

            if (isCurrentWord) {
              return (
                <span
                  key={wIdx}
                  ref={activeCharSpanRef}
                  className={`relative ${
                    isUrdu
                      ? 'inline-flex flex-col items-center justify-center text-center mx-2 px-3.5 py-2 rounded-2xl bg-cyan-950/70 border-2 border-cyan-400/90 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/30 align-middle my-1 transition-all'
                      : 'inline-block mx-1.5 px-2.5 py-0.5 rounded-xl bg-cyan-500/20 border-2 border-cyan-400/80 text-white font-bold shadow-[0_0_16px_rgba(6,182,212,0.45)] ring-1 ring-cyan-300/40 text-center'
                  }`}
                >
                  {!isUrdu ? (
                    <>
                      {w.word.split('').map((c, cIdx) => {
                        const absIdx = w.startIndex + cIdx;
                        const isTyped = absIdx < userInput.length;
                        const isCharCurrent = absIdx === currentIndex;
                        const isCharCorrect = isTyped && userInput[absIdx] === c;
                        const isCharError = isTyped && userInput[absIdx] !== c;
                        const isGhostHere = Boolean(enableGhostPacer && ghostWpm && isStarted && absIdx === ghostCharIndex);
                        return (
                          <span
                            key={cIdx}
                            className={`relative inline ${
                              isCharCurrent
                                ? 'text-white underline decoration-cyan-400 decoration-2 font-bold'
                                : isCharCorrect
                                ? 'text-emerald-300'
                                : isCharError
                                ? 'text-rose-400 underline decoration-rose-500 font-bold'
                                : 'text-slate-200'
                            }`}
                          >
                            {isGhostHere && (
                              <span
                                className="absolute -top-3.5 left-0 -translate-x-1/2 text-[9px] pointer-events-none animate-bounce z-20 opacity-80"
                                title={`Ghost PB: ${ghostWpm} WPM`}
                              >
                                👻
                              </span>
                            )}
                            {c}
                          </span>
                        );
                      })}
                      {currentIndex === w.endIndex && (
                        <span className="text-[10px] ml-1.5 px-1 rounded bg-amber-400 text-black font-mono font-bold animate-pulse">
                          ␣ Space
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Pura Lafz (Whole Word Intact - likha hua lafz hi ho) */}
                      <span className="font-urdu-clean text-2xl sm:text-3xl text-cyan-200 tracking-normal drop-shadow leading-normal w-full text-center flex items-center justify-center">
                        {w.word}
                      </span>

                      {/* Aik Aik Hurf (Letter by Letter - jo type karna hai wo aik aik hurf aye) */}
                      <span
                        dir="rtl"
                        className="inline-flex items-center justify-center gap-1.5 mt-2 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-xs shadow-inner"
                      >
                        {w.word.split('').map((char, cIdx) => {
                          const absIdx = w.startIndex + cIdx;
                          const isTyped = absIdx < userInput.length;
                          const isCharCurrent = absIdx === currentIndex;
                          const isCharCorrect = isTyped && userInput[absIdx] === char;
                          const isCharError = isTyped && userInput[absIdx] !== char;
                          const keyInfo = URDU_TO_KEY_MAP[char];

                          return (
                            <span
                              key={cIdx}
                              className={`inline-flex flex-col items-center justify-center text-center min-w-[30px] h-10 px-1.5 rounded-lg transition-all font-urdu-clean ${
                                isCharCurrent
                                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.85)] scale-110 z-10 animate-pulse'
                                  : isCharCorrect
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 font-bold'
                                  : isCharError
                                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50 font-bold'
                                  : 'bg-white/[0.06] text-slate-300 border border-white/[0.08]'
                              }`}
                            >
                              <span className="text-base leading-none text-center flex items-center justify-center w-full">{char}</span>
                              <span
                                className={`text-[9px] font-mono leading-none mt-1 text-center w-full flex items-center justify-center ${
                                  isCharCurrent ? 'text-slate-950 font-extrabold' : 'text-slate-400'
                                }`}
                              >
                                {keyInfo ? (keyInfo.shift ? `⇧${keyInfo.displayKey}` : keyInfo.displayKey) : ''}
                              </span>
                            </span>
                          );
                        })}

                        {/* Space Indicator when all letters of word are typed */}
                        {currentIndex === w.endIndex && (
                          <span className="inline-flex items-center justify-center text-center px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono text-[11px] font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.85)] animate-pulse">
                            ␣ Space
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </span>
              );
            }

            // Future Word
            const isGhostOnThisWord = Boolean(
              enableGhostPacer && ghostWpm && isStarted && ghostCharIndex >= w.startIndex && ghostCharIndex <= w.endIndex
            );
            return (
              <span
                key={wIdx}
                className={`relative inline-flex items-center justify-center text-center mx-1.5 transition-all ${
                  isGhostOnThisWord
                    ? 'text-purple-300 font-semibold bg-purple-500/15 border border-purple-400/40 rounded-lg px-2 py-0.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'text-slate-400/70 hover:text-slate-300'
                }`}
              >
                {isGhostOnThisWord && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded-full bg-purple-900/90 text-purple-200 border border-purple-400/60 font-mono shadow-sm pointer-events-none opacity-90 whitespace-nowrap flex items-center gap-1 z-10 animate-bounce">
                    <span>👻</span>
                    <span>{isUrdu ? 'ریکارڈ' : 'PB'}</span>
                  </span>
                )}
                {w.word}
              </span>
            );
          })}
        </div>

        {/* Starting Prompt Banner */}
        {!isStarted && !isFinished && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl pointer-events-none">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-sm font-medium shadow-xl">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{isUrdu ? 'ٹائپنگ شروع کرنے کے لیے کوئی بھی کی دبائیں...' : 'Start typing to begin test...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Virtual Mechanical Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          targetChar={currentTargetChar}
          activeKey={activeKey}
          showHands={true}
          theme={theme}
          layoutMode={isUrdu ? 'ur' : 'en'}
        />
      )}

      {/* Completion Modal / Summary Card */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Test Completed</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{title}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">Net Speed</span>
                <div className="text-3xl font-extrabold text-cyan-300 font-mono tabular-nums">
                  {stats.netWpm} <span className="text-sm font-normal text-slate-300">WPM</span>
                </div>
              </div>
            </div>

            {/* Target Check (for Lessons) */}
            {targetWpm && targetAcc && (
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Target Goal:</span>
                  <span className="font-mono text-slate-200">{targetWpm} WPM · {targetAcc}% Acc</span>
                </div>
                <div>
                  {stats.netWpm >= targetWpm && stats.accuracy >= targetAcc ? (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Goal Passed!
                    </span>
                  ) : (
                    <span className="text-amber-300 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Goal not met yet, try again!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Performance Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[11px] text-slate-400 font-mono uppercase">Accuracy</span>
                <span className="block text-xl font-bold text-emerald-300 font-mono tabular-nums mt-0.5">
                  {stats.accuracy}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[11px] text-slate-400 font-mono uppercase">Gross WPM</span>
                <span className="block text-xl font-bold text-slate-200 font-mono tabular-nums mt-0.5">
                  {stats.grossWpm}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[11px] text-slate-400 font-mono uppercase">Errors</span>
                <span className="block text-xl font-bold text-rose-300 font-mono tabular-nums mt-0.5">
                  {stats.errorCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[11px] text-slate-400 font-mono uppercase">Time</span>
                <span className="block text-xl font-bold text-slate-200 font-mono tabular-nums mt-0.5">
                  {elapsedSeconds}s
                </span>
              </div>
            </div>

            {/* Ghost Pacer Challenge Outcome */}
            {enableGhostPacer && ghostWpm && ghostWpm > 0 && (
              <div className="mb-6 p-3.5 sm:p-4 rounded-2xl border border-purple-500/30 bg-purple-950/25 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0">
                    👻
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      {stats.netWpm > ghostWpm ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Personal Best Smashed! (+{stats.netWpm - ghostWpm} WPM)</span>
                        </>
                      ) : stats.netWpm === ghostWpm ? (
                        <span>Tied with Personal Best Record!</span>
                      ) : (
                        <span>Ghost PB was {ghostWpm - stats.netWpm} WPM faster</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Your Speed: <strong>{stats.netWpm} WPM</strong> · Ghost Target: <strong>{ghostWpm} WPM</strong>
                    </div>
                  </div>
                </div>

                {stats.netWpm > ghostWpm && (
                  <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[10px] uppercase font-mono shadow-md shrink-0">
                    New Record!
                  </span>
                )}
              </div>
            )}

            {/* Speed History Mini Line Chart */}
            {speedHistory.length > 2 && (
              <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-white/[0.06]">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-cyan-400" /> Speed Progression
                  </span>
                  <span>Peak: {Math.max(...speedHistory.map((s) => s.wpm))} WPM</span>
                </div>
                <div className="h-16 flex items-end gap-1 pt-2">
                  {speedHistory.map((pt, idx) => {
                    const maxWpm = Math.max(60, ...speedHistory.map((s) => s.wpm));
                    const heightPercent = Math.max(10, Math.min(100, (pt.wpm / maxWpm) * 100));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-300 rounded-t-sm transition-all group relative"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black text-[10px] text-cyan-300 whitespace-nowrap z-10">
                          {pt.wpm} wpm
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Problem Keys Notice */}
            {Object.keys(keyErrors).length > 0 && (
              <div className="mb-6 flex items-center gap-2 text-xs text-amber-300/90 font-mono">
                <span>Mistakes occurred on:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(keyErrors).map((k) => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {k === ' ' ? 'Space' : k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors cursor-pointer"
              >
                Try Again
              </button>

              {onNextLesson && (
                <button
                  onClick={() => {
                    handleReset();
                    onNextLesson();
                  }}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <span>Next: {nextLessonTitle || 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
