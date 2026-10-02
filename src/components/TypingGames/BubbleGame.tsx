import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Sparkles, Timer, Trophy } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface BubbleWord {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

const BUBBLE_WORDS = [
  'swift', 'glass', 'neon', 'cyber', 'fluid', 'speed', 'touch', 'spark',
  'hyper', 'glide', 'orbit', 'pulse', 'prism', 'vivid', 'light', 'focus',
  'drift', 'blade', 'frost', 'stream', 'react', 'clean', 'sonic', 'turbo'
];

const COLORS = [
  'border-cyan-400/50 bg-cyan-500/15 text-cyan-200',
  'border-purple-400/50 bg-purple-500/15 text-purple-200',
  'border-emerald-400/50 bg-emerald-500/15 text-emerald-200',
  'border-sky-400/50 bg-sky-500/15 text-sky-200',
  'border-pink-400/50 bg-pink-500/15 text-pink-200',
];

interface BubbleGameProps {
  highScore: number;
  onGameOver: (score: number) => void;
}

export const BubbleGame: React.FC<BubbleGameProps> = ({ highScore, onGameOver }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [inputVal, setInputVal] = useState<string>('');
  const [bubbles, setBubbles] = useState<BubbleWord[]>([]);
  const [combo, setCombo] = useState<number>(1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef<number>(1);

  // Spawn bubbles
  const spawnInitialBubbles = () => {
    const list: BubbleWord[] = [];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: nextIdRef.current++,
        text: BUBBLE_WORDS[Math.floor(Math.random() * BUBBLE_WORDS.length)],
        x: 10 + (i % 3) * 30 + (Math.random() * 10 - 5),
        y: 15 + Math.floor(i / 3) * 35 + (Math.random() * 10 - 5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    setBubbles(list);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setInputVal('');
    setCombo(1);
    setGameState('playing');
    spawnInitialBubbles();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            setGameState('gameover');
            soundEngine.playSuccess();
            onGameOver(score);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score, onGameOver]);

  // Input check
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.trim().toLowerCase();
    setInputVal(typed);
    soundEngine.playKey(false);

    const hitIndex = bubbles.findIndex((b) => b.text.toLowerCase() === typed);
    if (hitIndex !== -1) {
      // Pop!
      soundEngine.playLaser();
      const popped = bubbles[hitIndex];
      const pts = popped.text.length * 20 * combo;

      setScore((s) => s + pts);
      setCombo((c) => Math.min(5, c + 1));
      setInputVal('');

      // Replace popped bubble with new one
      const replacement: BubbleWord = {
        id: nextIdRef.current++,
        text: BUBBLE_WORDS[Math.floor(Math.random() * BUBBLE_WORDS.length)],
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      setBubbles((prev) => {
        const next = [...prev];
        next[hitIndex] = replacement;
        return next;
      });
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl glass-panel border border-white/[0.1] overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between">
      {/* HUD */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">Score</span>
            <div className="text-2xl font-black text-cyan-300 font-mono tabular-nums">{score}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">Combo</span>
            <div className="text-lg font-bold text-purple-300 font-mono tabular-nums">{combo}x</div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-amber-300">
          <Timer className="w-5 h-5 text-amber-400" />
          <span className="text-2xl font-bold tabular-nums">{timeLeft}s</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Best: <strong className="text-white tabular-nums">{Math.max(score, highScore)}</strong></span>
        </div>
      </div>

      {/* Floating Bubbles Canvas */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex-1 w-full min-h-[360px] bg-gradient-to-br from-[#0b0f19] via-[#0e1627] to-[#070b14] overflow-hidden cursor-text p-6"
      >
        {bubbles.map((b) => {
          const isTargeted = inputVal.length > 0 && b.text.startsWith(inputVal);

          return (
            <div
              key={b.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-full backdrop-blur-xl border shadow-xl font-mono font-bold text-base transition-all duration-300 select-none animate-pulse ${b.color} ${
                isTargeted ? 'ring-4 ring-cyan-400/80 scale-125 z-10' : ''
              }`}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
              }}
            >
              <span>{b.text}</span>
            </div>
          );
        })}

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-20">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Bubble Burst Blitz</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md text-center">
              Type any floating bubble on the screen to pop it before the 45-second timer runs out. Build your combo!
            </p>
            <button
              onClick={startGame}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start 45s Blitz</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md z-20">
            <div className="p-8 rounded-3xl glass-panel border border-cyan-500/40 text-center max-w-sm w-full">
              <Sparkles className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-2xl font-black text-white mt-2">Time Expired!</h3>
              <div className="my-4">
                <span className="text-xs text-slate-400 font-mono">Total Points</span>
                <div className="text-4xl font-extrabold text-cyan-300 font-mono tabular-nums">{score}</div>
              </div>
              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold transition-all cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input row */}
      {gameState === 'playing' && (
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Type any word to pop bubble..."
            className="w-full max-w-md px-5 py-3 rounded-xl bg-black/50 border border-purple-500/40 text-white font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
};
