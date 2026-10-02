import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Flame, Shield, Trophy, Activity, Footprints } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface Obstacle {
  id: number;
  word: string;
  x: number; // percentage from left (starts at 100%, moves left toward 15%)
  type: 'spike' | 'laser' | 'wall';
}

const ACTION_WORDS = [
  'jump', 'slide', 'dash', 'vault', 'leap', 'flip', 'dodge', 'duck',
  'strike', 'roll', 'bound', 'climb', 'dive', 'shift', 'phase', 'sprint'
];

interface CyberRunnerGameProps {
  highScore: number;
  onGameOver: (score: number) => void;
}

export const CyberRunnerGame: React.FC<CyberRunnerGameProps> = ({ highScore, onGameOver }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [distance, setDistance] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [actionAnim, setActionAnim] = useState<string>('run');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextId = useRef<number>(1);
  const lastSpawn = useRef<number>(0);

  const startGame = () => {
    setDistance(0);
    setLives(3);
    setObstacles([]);
    setInputVal('');
    setActionAnim('run');
    setGameState('playing');
    lastSpawn.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Run loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      setDistance((d) => d + 2);

      // Spawn obstacle
      if (now - lastSpawn.current > 2400) {
        const obsTypes: Obstacle['type'][] = ['spike', 'laser', 'wall'];
        const newObs: Obstacle = {
          id: nextId.current++,
          word: ACTION_WORDS[Math.floor(Math.random() * ACTION_WORDS.length)],
          x: 100,
          type: obsTypes[Math.floor(Math.random() * obsTypes.length)],
        };
        setObstacles((prev) => [...prev, newObs]);
        lastSpawn.current = now;
      }

      // Move obstacles left
      setObstacles((prev) => {
        let hit = false;
        const remaining: Obstacle[] = [];

        for (const o of prev) {
          const nextX = o.x - 2.2;
          if (nextX <= 18 && nextX >= 10) {
            // Player collision point!
            hit = true;
          } else if (nextX > 5) {
            remaining.push({ ...o, x: nextX });
          }
        }

        if (hit) {
          soundEngine.playExplosion();
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setTimeout(() => {
                setGameState('gameover');
                onGameOver(distance);
              }, 0);
              return 0;
            }
            return nextL;
          });
        }

        return remaining;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [gameState, distance, onGameOver]);

  // Input check
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setInputVal(val);
    soundEngine.playKey(false);

    const hitIndex = obstacles.findIndex((o) => o.word.toLowerCase() === val && o.x > 18);
    if (hitIndex !== -1) {
      soundEngine.playSuccess();
      setActionAnim('leap');
      setTimeout(() => setActionAnim('run'), 400);

      setDistance((d) => d + 50);
      setInputVal('');
      setObstacles((prev) => prev.filter((_, idx) => idx !== hitIndex));
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl glass-panel border border-white/[0.1] overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between">
      {/* HUD */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-black/40 backdrop-blur-md font-mono">
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Distance</span>
          <div className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">{distance}m</div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase mr-1">Stamina:</span>
          {[1, 2, 3].map((i) => (
            <Shield
              key={i}
              className={`w-5 h-5 ${i <= lives ? 'text-amber-400 fill-amber-400/40' : 'text-slate-600'}`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-400 hidden xs:block">
          Record: <strong className="text-white tabular-nums">{Math.max(distance, highScore)}m</strong>
        </div>
      </div>

      {/* Rooftop runner scenery */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex-1 w-full min-h-[350px] bg-gradient-to-b from-[#090b14] via-[#101426] to-[#060810] overflow-hidden cursor-text"
      >
        {/* Neon Rooftop Skyline silhouette */}
        <div className="absolute bottom-16 left-0 right-0 h-32 opacity-20 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Rooftop Ground surface */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-slate-900 border-t-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]" />

        {/* Runner Character */}
        <div className={`absolute bottom-16 left-12 sm:left-16 transition-all duration-200 ${actionAnim === 'leap' ? '-translate-y-16 scale-110' : ''}`}>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_12px_#38bdf8]">
              {actionAnim === 'leap' ? '🤸' : '🏃'}
            </span>
            <div className="w-8 h-1.5 bg-cyan-400/40 blur-xs rounded-full mt-1" />
          </div>
        </div>

        {/* Approaching obstacles */}
        {obstacles.map((obs) => {
          const isTargeted = inputVal.length > 0 && obs.word.startsWith(inputVal);
          return (
            <div
              key={obs.id}
              className="absolute bottom-16 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${obs.x}%` }}
            >
              {/* Word balloon */}
              <div
                className={`mb-2 px-3 py-1 rounded-xl border font-mono text-xs font-bold transition-all shadow-lg ${
                  isTargeted
                    ? 'bg-amber-500/30 border-amber-400 text-white scale-110 shadow-[0_0_15px_#f59e0b]'
                    : 'bg-slate-900/90 border-white/20 text-slate-200'
                }`}
              >
                {obs.word}
              </div>

              {/* Obstacle Icon */}
              <span className="text-2xl filter drop-shadow-[0_0_8px_#ef4444]">
                {obs.type === 'spike' ? '⚠️' : obs.type === 'laser' ? '⚡' : '🚧'}
              </span>
            </div>
          );
        })}

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-20">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Cyber Ninja Rooftop Runner</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md text-center">
              Sprint across glowing neon rooftops! Type the maneuver words to leap over barriers, lasers, and spikes.
            </p>
            <button
              onClick={startGame}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Rooftop Sprint</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md z-20">
            <div className="p-8 rounded-3xl glass-panel border border-rose-500/40 text-center max-w-sm w-full">
              <span className="text-xs uppercase font-mono text-rose-400">Run Terminated</span>
              <h3 className="text-2xl font-black text-white mt-1">Stumbled</h3>
              <div className="my-4">
                <span className="text-xs text-slate-400 font-mono">Distance Reached</span>
                <div className="text-4xl font-extrabold text-amber-300 font-mono tabular-nums">{distance}m</div>
              </div>
              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sprint Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {gameState === 'playing' && (
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Type action word (e.g. jump, slide)..."
            className="w-full max-w-md px-5 py-3 rounded-xl bg-black/50 border border-amber-500/40 text-white font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
};
