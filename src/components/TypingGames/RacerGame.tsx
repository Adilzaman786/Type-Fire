import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, Flame, Trophy, Gauge, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';

interface RacerGameProps {
  highScore: number;
  onGameOver: (score: number) => void;
}

const RACE_TEXTS = [
  'Speed is the essence of agility and focus. Feel the mechanical keys glide under your fingertips as the engine surges forward across the neon cyber grid.',
  'Accelerate past the competition with precision keystrokes. No hesitation, no backtracks, pure rhythm driving your vehicle across the digital highway.',
  'Lightning fast reflexes separate champions from the crowd. Stay calibrated, keep the momentum high, and burn rubber down the glowing circuit.'
];

export const RacerGame: React.FC<RacerGameProps> = ({ highScore, onGameOver }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [textIndex, setTextIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [botProgress, setBotProgress] = useState<{ bot1: number; bot2: number; bot3: number }>({
    bot1: 0,
    bot2: 0,
    bot3: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentWpm, setCurrentWpm] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const targetText = RACE_TEXTS[textIndex];
  const targetChars = useMemo(() => targetText.split(''), [targetText]);

  // Start Race
  const startRace = () => {
    setTextIndex((prev) => (prev + 1) % RACE_TEXTS.length);
    setUserInput('');
    setPlayerProgress(0);
    setBotProgress({ bot1: 0, bot2: 0, bot3: 0 });
    setGameState('playing');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Bot movement & Player Speed loop
  useEffect(() => {
    if (gameState !== 'playing' || !startTime) return;

    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.01);

      // Bot speeds:
      // Bot 1 (Rookie): 38 WPM
      // Bot 2 (Intermediate): 58 WPM
      // Bot 3 (Speed Demon): 82 WPM
      const totalWords = targetText.split(' ').length;

      const bot1DoneWords = elapsedMinutes * 38;
      const bot2DoneWords = elapsedMinutes * 58;
      const bot3DoneWords = elapsedMinutes * 82;

      setBotProgress({
        bot1: Math.min(100, (bot1DoneWords / totalWords) * 100),
        bot2: Math.min(100, (bot2DoneWords / totalWords) * 100),
        bot3: Math.min(100, (bot3DoneWords / totalWords) * 100),
      });

      // Calculate Player current WPM
      const wordsTyped = userInput.length / 5;
      const wpm = Math.round(wordsTyped / elapsedMinutes);
      setCurrentWpm(wpm);
    }, 150);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime, targetText, userInput.length]);

  // Handle typing input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;

    if (e.key === 'Backspace') {
      soundEngine.playKey(false);
      setUserInput((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const nextIndex = userInput.length;
      const expectedChar = targetChars[nextIndex];

      if (e.key === expectedChar) {
        soundEngine.playKey(e.key === ' ');
        const nextInput = userInput + e.key;
        setUserInput(nextInput);

        const progressPercent = (nextInput.length / targetChars.length) * 100;
        setPlayerProgress(progressPercent);

        if (nextInput.length >= targetChars.length) {
          // Finished Race!
          setGameState('finished');
          soundEngine.playSuccess();
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
          setTimeout(() => {
            onGameOver(currentWpm * 10);
          }, 0);
        }
      } else {
        soundEngine.playError();
      }
    }
  };

  // Determine current position
  const rank = useMemo(() => {
    let position = 1;
    if (botProgress.bot3 > playerProgress) position++;
    if (botProgress.bot2 > playerProgress) position++;
    if (botProgress.bot1 > playerProgress) position++;
    return position;
  }, [playerProgress, botProgress]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl glass-panel border border-white/[0.1] overflow-hidden shadow-2xl p-6 flex flex-col gap-6">
      {/* Header telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400">Cyber Track Arena</span>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Nitro Racer</span>
            {currentWpm >= 70 && (
              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> NITRO ACTIVE
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-6 font-mono">
          <div className="text-center">
            <span className="block text-xs text-slate-400 uppercase">Live Speed</span>
            <span className="text-2xl font-black text-cyan-300 tabular-nums">
              {currentWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
            </span>
          </div>

          <div className="text-center">
            <span className="block text-xs text-slate-400 uppercase">Track Place</span>
            <span className={`text-2xl font-black tabular-nums ${rank === 1 ? 'text-amber-300' : 'text-slate-200'}`}>
              #{rank}
            </span>
          </div>
        </div>
      </div>

      {/* Racetrack Visualizer */}
      <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
        {/* Lane 1: Player */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-cyan-300">
            <span className="font-semibold">🏎️ Player (You)</span>
            <span>{Math.round(playerProgress)}%</span>
          </div>
          <div className="relative h-7 rounded-lg bg-slate-900/80 border border-cyan-500/30 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-lg transition-all duration-100 flex items-center justify-end pr-1 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              style={{ width: `${Math.max(5, playerProgress)}%` }}
            >
              <div className="w-2.5 h-4 rounded-sm bg-white shadow-sm" />
            </div>
            <Flag className="absolute right-2 top-1.5 w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Lane 2: Rookie Bot (38 WPM) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>🚗 Nova Bot (38 WPM)</span>
            <span>{Math.round(botProgress.bot1)}%</span>
          </div>
          <div className="relative h-5 rounded-lg bg-slate-900/60 border border-white/5 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-slate-600 rounded-lg transition-all duration-150"
              style={{ width: `${botProgress.bot1}%` }}
            />
          </div>
        </div>

        {/* Lane 3: Apex Bot (58 WPM) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-indigo-300">
            <span>🏎️ Apex Bot (58 WPM)</span>
            <span>{Math.round(botProgress.bot2)}%</span>
          </div>
          <div className="relative h-5 rounded-lg bg-slate-900/60 border border-white/5 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-lg transition-all duration-150"
              style={{ width: `${botProgress.bot2}%` }}
            />
          </div>
        </div>

        {/* Lane 4: Phantom Bot (82 WPM) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-purple-300">
            <span>🚀 Phantom Bot (82 WPM)</span>
            <span>{Math.round(botProgress.bot3)}%</span>
          </div>
          <div className="relative h-5 rounded-lg bg-slate-900/60 border border-white/5 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-purple-500 rounded-lg transition-all duration-150"
              style={{ width: `${botProgress.bot3}%` }}
            />
          </div>
        </div>
      </div>

      {/* Typing sentence prompt */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative p-6 rounded-2xl glass-panel border border-white/[0.08] cursor-text min-h-[140px]"
      >
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
        />

        <div className="font-mono text-base sm:text-lg leading-relaxed select-none">
          {targetChars.map((char, index) => {
            const isTyped = index < userInput.length;
            const isCurrent = index === userInput.length;
            const isCorrect = isTyped && userInput[index] === char;

            let charClass = 'text-slate-500';
            if (isCurrent) {
              charClass = 'text-white bg-cyan-500/30 ring-1 ring-cyan-400 rounded-sm font-bold';
            } else if (isCorrect) {
              charClass = 'text-cyan-300 font-semibold';
            }

            return (
              <span key={index} className={charClass}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
            <button
              onClick={startRace}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start 4-Car Race</span>
            </button>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl z-20">
            <div className="text-center p-6 max-w-sm">
              <Trophy className={`w-12 h-12 mx-auto ${rank === 1 ? 'text-amber-400' : 'text-slate-400'}`} />
              <h4 className="text-2xl font-black text-white mt-2">
                {rank === 1 ? '🏆 Grand Champion!' : `Finished in Position #${rank}`}
              </h4>
              <p className="text-sm font-mono text-cyan-300 mt-1">Average Speed: {currentWpm} WPM</p>
              <button
                onClick={startRace}
                className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all cursor-pointer"
              >
                Race Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
