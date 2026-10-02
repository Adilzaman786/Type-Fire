import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Shield, Zap, Flame, Trophy, Cpu } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface Creep {
  id: number;
  word: string;
  lane: number; // 0, 1, 2
  progress: number; // 0 to 100%
  speed: number;
}

const GLITCH_WORDS = [
  'worm', 'trojan', 'packet', 'ddos', 'breach', 'bug', 'patch', 'hack',
  'leak', 'buffer', 'exploit', 'malware', 'payload', 'ransom', 'rootkit', 'spy'
];

interface TowerDefenseGameProps {
  highScore: number;
  onGameOver: (score: number) => void;
}

export const TowerDefenseGame: React.FC<TowerDefenseGameProps> = ({ highScore, onGameOver }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [coreHealth, setCoreHealth] = useState<number>(100);
  const [creeps, setCreeps] = useState<Creep[]>([]);
  const [inputVal, setInputVal] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextId = useRef<number>(1);
  const lastSpawn = useRef<number>(0);

  const startGame = () => {
    setScore(0);
    setCoreHealth(100);
    setCreeps([]);
    setInputVal('');
    setGameState('playing');
    lastSpawn.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSpawn.current > 2000) {
        // Spawn creep
        const newCreep: Creep = {
          id: nextId.current++,
          word: GLITCH_WORDS[Math.floor(Math.random() * GLITCH_WORDS.length)],
          lane: Math.floor(Math.random() * 3),
          progress: 0,
          speed: 1.2 + Math.min(score * 0.003, 2.5),
        };
        setCreeps((prev) => [...prev, newCreep]);
        lastSpawn.current = now;
      }

      setCreeps((prev) => {
        let damage = 0;
        const remaining: Creep[] = [];

        for (const c of prev) {
          const nextProg = c.progress + c.speed;
          if (nextProg >= 95) {
            damage += 15;
            soundEngine.playExplosion();
          } else {
            remaining.push({ ...c, progress: nextProg });
          }
        }

        if (damage > 0) {
          setCoreHealth((hp) => {
            const nextHp = hp - damage;
            if (nextHp <= 0) {
              setTimeout(() => {
                setGameState('gameover');
                onGameOver(score);
              }, 0);
              return 0;
            }
            return nextHp;
          });
        }

        return remaining;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, score, onGameOver]);

  // Typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setInputVal(val);
    soundEngine.playKey(false);

    const hitIndex = creeps.findIndex((c) => c.word.toLowerCase() === val);
    if (hitIndex !== -1) {
      soundEngine.playLaser();
      setScore((s) => s + 45);
      setInputVal('');
      setCreeps((prev) => prev.filter((_, idx) => idx !== hitIndex));
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

        {/* Server Core Health Bar */}
        <div className="w-48 sm:w-64">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Firewall Core</span>
            <span className={coreHealth > 35 ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold'}>{coreHealth}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${coreHealth > 35 ? 'bg-emerald-400' : 'bg-rose-500'}`}
              style={{ width: `${coreHealth}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden xs:block">
          Best: <strong className="text-white tabular-nums">{Math.max(score, highScore)}</strong>
        </div>
      </div>

      {/* 3 Cyber Pipeline Lanes */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex-1 w-full min-h-[350px] bg-gradient-to-r from-[#03060f] via-[#071022] to-[#040916] overflow-hidden cursor-text flex flex-col justify-around p-4"
      >
        {[0, 1, 2].map((laneIdx) => (
          <div key={laneIdx} className="relative h-20 rounded-2xl bg-slate-900/50 border border-cyan-500/20 flex items-center px-4 overflow-hidden">
            <div className="absolute left-2 text-[10px] font-mono text-slate-500 uppercase">Pipeline {laneIdx + 1}</div>
            
            {/* Server Core receiver on right */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-cyan-500/10 border-l border-cyan-400/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>

            {/* Creeps in this lane */}
            {creeps.filter((c) => c.lane === laneIdx).map((c) => {
              const isTargeted = inputVal.length > 0 && c.word.startsWith(inputVal);
              return (
                <div
                  key={c.id}
                  className={`absolute -translate-y-1/2 px-3 py-1 rounded-xl border font-mono text-xs font-bold transition-all shadow-lg ${
                    isTargeted
                      ? 'bg-rose-500/30 border-rose-400 text-white scale-110 shadow-[0_0_15px_#f43f5e]'
                      : 'bg-slate-950/80 border-amber-500/40 text-amber-200'
                  }`}
                  style={{ left: `${c.progress}%`, top: '50%' }}
                >
                  ⚡ {c.word}
                </div>
              );
            })}
          </div>
        ))}

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-20">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Firewall Cyber Sentry</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md text-center">
              Malicious bug payloads are streaming down your server pipelines! Type their words to zap them with tesla coils before they infect the core.
            </p>
            <button
              onClick={startGame}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Arm Defense Turrets</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md z-20">
            <div className="p-8 rounded-3xl glass-panel border border-rose-500/40 text-center max-w-sm w-full">
              <span className="text-xs uppercase font-mono text-rose-400">Core Corrupted</span>
              <h3 className="text-2xl font-black text-white mt-1">Firewall Down</h3>
              <div className="my-4">
                <span className="text-xs text-slate-400 font-mono">Score</span>
                <div className="text-4xl font-extrabold text-amber-300 font-mono tabular-nums">{score}</div>
              </div>
              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reboot Firewall</span>
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
            placeholder="Type payload to shock glitch..."
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
