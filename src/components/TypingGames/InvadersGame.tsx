import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Shield, Rocket, Flame } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface Alien {
  id: number;
  word: string;
  x: number; // percentage
  y: number; // percentage
  alive: boolean;
}

const INVADER_WORDS = [
  'void', 'star', 'nova', 'flux', 'warp', 'core', 'beam', 'dark',
  'gate', 'puls', 'sol', 'grid', 'zone', 'ship', 'code', 'iron',
  'base', 'fire', 'bolt', 'mech', 'scan', 'zero', 'atom', 'byte'
];

interface InvadersGameProps {
  highScore: number;
  onGameOver: (score: number) => void;
}

export const InvadersGame: React.FC<InvadersGameProps> = ({ highScore, onGameOver }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [inputVal, setInputVal] = useState<string>('');
  const [aliens, setAliens] = useState<Alien[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const loopRef = useRef<number | null>(null);

  // Spawn alien fleet
  const spawnFleet = (waveNum: number) => {
    const list: Alien[] = [];
    let id = 1;
    const rows = 3;
    const cols = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          id: id++,
          word: INVADER_WORDS[Math.floor(Math.random() * INVADER_WORDS.length)],
          x: 15 + c * 20,
          y: 10 + r * 15,
          alive: true,
        });
      }
    }
    setAliens(list);
  };

  const startGame = () => {
    setScore(0);
    setWave(1);
    setLives(3);
    setInputVal('');
    setGameState('playing');
    spawnFleet(1);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Descent loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setAliens((prev) => {
        let reachedBottom = false;
        const next = prev.map((a) => {
          if (!a.alive) return a;
          const nextY = a.y + 0.6 + wave * 0.15;
          if (nextY >= 80) {
            reachedBottom = true;
          }
          return { ...a, y: nextY };
        });

        if (reachedBottom) {
          soundEngine.playExplosion();
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setTimeout(() => {
                setGameState('gameover');
                onGameOver(score);
              }, 0);
            }
            return Math.max(0, nextL);
          });
          // Push fleet back up slightly
          return next.map((a) => ({ ...a, y: Math.max(10, a.y - 20) }));
        }

        // Check if wave cleared
        const remaining = next.filter((a) => a.alive);
        if (remaining.length === 0) {
          soundEngine.playSuccess();
          setWave((w) => {
            const nextW = w + 1;
            setTimeout(() => spawnFleet(nextW), 0);
            return nextW;
          });
          setScore((s) => s + 200);
        }

        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameState, wave, score, onGameOver]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setInputVal(val);
    soundEngine.playKey(false);

    const hitIdx = aliens.findIndex((a) => a.alive && a.word.toLowerCase() === val);
    if (hitIdx !== -1) {
      soundEngine.playLaser();
      setScore((s) => s + 50 * wave);
      setInputVal('');

      setAliens((prev) => {
        const next = [...prev];
        next[hitIdx] = { ...next[hitIdx], alive: false };
        return next;
      });
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl glass-panel border border-white/[0.1] overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between">
      {/* Top HUD */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-black/40 backdrop-blur-md font-mono">
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Score</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 tabular-nums">{score}</div>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-slate-400 uppercase">Alien Wave</span>
          <div className="text-lg sm:text-xl font-bold text-amber-300">Wave {wave}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase mr-1">Hull:</span>
          {[1, 2, 3].map((i) => (
            <Shield
              key={i}
              className={`w-5 h-5 ${i <= lives ? 'text-emerald-400 fill-emerald-400/40' : 'text-slate-600'}`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-400 hidden xs:block">
          Best: <strong className="text-white tabular-nums">{Math.max(score, highScore)}</strong>
        </div>
      </div>

      {/* Star Space Battlefield */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex-1 w-full min-h-[350px] bg-gradient-to-b from-[#050811] via-[#091124] to-[#03060e] overflow-hidden cursor-text p-6"
      >
        {/* Fleet Grid */}
        {aliens.map((alien) => {
          if (!alien.alive) return null;
          const isTargeted = inputVal.length > 0 && alien.word.startsWith(inputVal);

          return (
            <div
              key={alien.id}
              className={`absolute -translate-x-1/2 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold transition-all duration-150 ${
                isTargeted
                  ? 'bg-rose-500/30 border-rose-400 text-white scale-110 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'bg-indigo-950/70 border-indigo-500/30 text-indigo-200'
              }`}
              style={{ left: `${alien.x}%`, top: `${alien.y}%` }}
            >
              👾 {alien.word}
            </div>
          );
        })}

        {/* Player Battlecruiser Ship at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <Rocket className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_12px_#06b6d4]" />
        </div>

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-20">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Galaxian Fleet Typer</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md text-center">
              An alien fleet is descending upon Earth! Type their code words to fire photon torpedoes and clear each wave.
            </p>
            <button
              onClick={startGame}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/30 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Engage Alien Fleet</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md z-20">
            <div className="p-8 rounded-3xl glass-panel border border-rose-500/40 text-center max-w-sm w-full">
              <span className="text-xs uppercase font-mono text-rose-400">Defense Breached</span>
              <h3 className="text-2xl font-black text-white mt-1">Battle Lost</h3>
              <div className="my-4">
                <span className="text-xs text-slate-400 font-mono">Total Points</span>
                <div className="text-4xl font-extrabold text-cyan-300 font-mono tabular-nums">{score}</div>
              </div>
              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-engage Fleet</span>
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
            placeholder="Type alien code to fire torpedoes..."
            className="w-full max-w-md px-5 py-3 rounded-xl bg-black/50 border border-cyan-500/40 text-white font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-400"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
};
