import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Shield, Zap, Trophy, Volume2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

const WORD_BANK = [
  'flow', 'code', 'fast', 'type', 'keys', 'speed', 'swift', 'focus',
  'rapid', 'pulse', 'react', 'drive', 'logic', 'space', 'light',
  'cyber', 'neon', 'laser', 'matrix', 'stream', 'vector', 'orbit',
  'signal', 'energy', 'future', 'hyper', 'charge', 'shadow', 'engine'
];

interface FallingWord {
  id: number;
  text: string;
  x: number; // percentage from left 5% to 85%
  y: number; // percentage from top 0% to 100%
  speed: number;
}

interface MeteorGameProps {
  highScore: number;
  onGameOver: (score: number) => void;
}

export const MeteorGame: React.FC<MeteorGameProps> = ({ highScore, onGameOver }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [shields, setShields] = useState<number>(3);
  const [combo, setCombo] = useState<number>(1);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [meteors, setMeteors] = useState<FallingWord[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);

  // Start game
  const startGame = () => {
    setScore(0);
    setShields(3);
    setCombo(1);
    setCurrentInput('');
    setMeteors([]);
    setGameState('playing');
    lastSpawnRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Spawn a new meteor
  const spawnMeteor = useCallback(() => {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const xPos = 10 + Math.random() * 75; // 10% to 85%
    const baseSpeed = 0.12 + Math.min(score * 0.0008, 0.25);

    const newMeteor: FallingWord = {
      id: nextIdRef.current++,
      text: randomWord,
      x: xPos,
      y: 0,
      speed: baseSpeed,
    };

    setMeteors((prev) => [...prev, newMeteor]);
  }, [score]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let active = true;

    const gameLoop = () => {
      if (!active) return;

      const now = Date.now();
      const spawnInterval = Math.max(1200, 2600 - score * 8);

      if (now - lastSpawnRef.current > spawnInterval) {
        spawnMeteor();
        lastSpawnRef.current = now;
      }

      setMeteors((prev) => {
        const remaining: FallingWord[] = [];
        let lostShield = false;

        for (const m of prev) {
          const nextY = m.y + m.speed;
          if (nextY >= 92) {
            // Reached bottom
            lostShield = true;
          } else {
            remaining.push({ ...m, y: nextY });
          }
        }

        if (lostShield) {
          soundEngine.playExplosion();
          setShields((s) => {
            const nextS = s - 1;
            if (nextS <= 0) {
              setTimeout(() => {
                setGameState('gameover');
                onGameOver(score);
              }, 0);
            }
            return Math.max(0, nextS);
          });
          setCombo(1);
        }

        return remaining;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, score, spawnMeteor, onGameOver]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setCurrentInput(val);

    soundEngine.playKey(false);

    // Check if input matches any falling meteor
    const matchIndex = meteors.findIndex((m) => m.text.toLowerCase() === val);
    if (matchIndex !== -1) {
      // Hit!
      soundEngine.playLaser();
      const hitMeteor = meteors[matchIndex];
      const points = hitMeteor.text.length * 15 * combo;

      setScore((s) => s + points);
      setCombo((c) => Math.min(c + 1, 5));
      setCurrentInput('');

      // Remove hit meteor
      setMeteors((prev) => prev.filter((_, idx) => idx !== matchIndex));
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl glass-panel border border-white/[0.1] overflow-hidden shadow-2xl min-h-[540px] flex flex-col justify-between">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-6 border-b border-white/[0.08] bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase">Score</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono tabular-nums">{score}</div>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase">Combo</span>
            <div className="text-base sm:text-lg font-bold text-amber-300 font-mono tabular-nums">{combo}x</div>
          </div>
        </div>

        {/* Shield Integrity */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase mr-0.5 sm:mr-1">Shields:</span>
          {[1, 2, 3].map((idx) => (
            <Shield
              key={idx}
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                idx <= shields
                  ? 'text-cyan-400 fill-cyan-400/40 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'text-slate-600'
              }`}
            />
          ))}
        </div>

        {/* High Score */}
        <div className="hidden xs:flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>Best: <strong className="text-white tabular-nums">{Math.max(score, highScore)}</strong></span>
        </div>
      </div>

      {/* Play Area / Sky Arena */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-[#060913] via-[#091224] to-[#040813] cursor-text min-h-[360px]"
      >
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Energy Defense Line at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4]" />

        {/* Falling Meteors */}
        {meteors.map((m) => {
          const isTargeted = currentInput.length > 0 && m.text.startsWith(currentInput);
          const matchedPrefix = isTargeted ? m.text.slice(0, currentInput.length) : '';
          const remainder = isTargeted ? m.text.slice(currentInput.length) : m.text;

          return (
            <div
              key={m.id}
              className={`absolute -translate-x-1/2 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all duration-75 font-mono text-sm font-bold shadow-lg ${
                isTargeted
                  ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110 z-10'
                  : 'bg-slate-900/80 border-white/10 text-slate-200'
              }`}
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
              }}
            >
              {isTargeted ? (
                <>
                  <span className="text-cyan-300 font-extrabold underline decoration-cyan-400">{matchedPrefix}</span>
                  <span className="text-slate-200">{remainder}</span>
                </>
              ) : (
                <span>{m.text}</span>
              )}
            </div>
          );
        })}

        {/* Title Screen Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-20">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Meteor Storm</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md text-center">
              Words are plummeting from orbit! Type each falling word before it impacts your city shield.
            </p>
            <button
              onClick={startGame}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Launch Defense</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md z-20">
            <div className="p-8 rounded-3xl glass-panel border border-rose-500/40 text-center max-w-sm w-full">
              <span className="text-xs uppercase tracking-wider font-mono text-rose-400">Shields Depleted</span>
              <h3 className="text-2xl font-black text-white mt-1">Game Over</h3>
              <div className="my-4">
                <span className="text-xs text-slate-400 font-mono">Final Score</span>
                <div className="text-4xl font-extrabold text-cyan-300 font-mono tabular-nums">{score}</div>
              </div>
              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold transition-all cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Action Bar */}
      {gameState === 'playing' && (
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              placeholder="Type falling words..."
              className="w-full px-5 py-3 rounded-xl bg-black/50 border border-cyan-500/40 text-white font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
};
