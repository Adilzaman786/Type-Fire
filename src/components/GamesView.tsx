import React, { useState } from 'react';
import { UserStats } from '../types/typing';
import { MeteorGame } from './TypingGames/MeteorGame';
import { RacerGame } from './TypingGames/RacerGame';
import { BubbleGame } from './TypingGames/BubbleGame';
import { InvadersGame } from './TypingGames/InvadersGame';
import { TowerDefenseGame } from './TypingGames/TowerDefenseGame';
import { CyberRunnerGame } from './TypingGames/CyberRunnerGame';
import {
  ArrowLeft,
  Gamepad2,
  Shield,
  Flame,
  Sparkles,
  Trophy,
  Rocket,
  Cpu,
  Footprints,
  Zap
} from 'lucide-react';

interface GamesViewProps {
  stats: UserStats;
  onUpdateGameScore: (game: 'meteor' | 'racer' | 'bubbles' | 'invaders' | 'defense' | 'runner', score: number) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  stats,
  onUpdateGameScore,
}) => {
  const [activeGame, setActiveGame] = useState<'meteor' | 'racer' | 'bubbles' | 'invaders' | 'defense' | 'runner' | null>(null);

  if (activeGame === 'meteor') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arcade</span>
        </button>
        <MeteorGame
          highScore={stats.gameScores?.meteor || 0}
          onGameOver={(score) => onUpdateGameScore('meteor', score)}
        />
      </div>
    );
  }

  if (activeGame === 'racer') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arcade</span>
        </button>
        <RacerGame
          highScore={stats.gameScores?.racer || 0}
          onGameOver={(score) => onUpdateGameScore('racer', score)}
        />
      </div>
    );
  }

  if (activeGame === 'bubbles') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arcade</span>
        </button>
        <BubbleGame
          highScore={stats.gameScores?.bubbles || 0}
          onGameOver={(score) => onUpdateGameScore('bubbles', score)}
        />
      </div>
    );
  }

  if (activeGame === 'invaders') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arcade</span>
        </button>
        <InvadersGame
          highScore={stats.gameScores?.invaders || 0}
          onGameOver={(score) => onUpdateGameScore('invaders', score)}
        />
      </div>
    );
  }

  if (activeGame === 'defense') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arcade</span>
        </button>
        <TowerDefenseGame
          highScore={stats.gameScores?.defense || 0}
          onGameOver={(score) => onUpdateGameScore('defense', score)}
        />
      </div>
    );
  }

  if (activeGame === 'runner') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arcade</span>
        </button>
        <CyberRunnerGame
          highScore={stats.gameScores?.runner || 0}
          onGameOver={(score) => onUpdateGameScore('runner', score)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          <span>AZ Typing Fire Arcade · 6 Interactive Games</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
          <span>Typing Speed Arcade</span>
          <Gamepad2 className="w-7 h-7 text-cyan-400" />
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Gamify your muscle memory. Choose from 6 different interactive gaming genres to build lightning-fast finger cadence with zero fatigue.
        </p>
      </div>

      {/* 6 Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game 1: Meteor Storm */}
        <div className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-white">{stats.gameScores?.meteor || 0}</strong></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                1. Meteor Storm
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Word asteroids rain down towards your city shield. Type the words rapidly to trigger orbital laser cannons and explode them in mid-air.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• 3 City Energy Shields</div>
              <div>• Word combos up to 5x multiplier</div>
              <div>• Builds rapid word reflex speed</div>
            </div>
          </div>

          <button
            onClick={() => setActiveGame('meteor')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            Play Meteor Storm
          </button>
        </div>

        {/* Game 2: Nitro Racer */}
        <div className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">
                <Flame className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-white">{stats.gameScores?.racer || 0}</strong></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                2. Nitro Racer
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Compete on a high-speed cyber track against 3 AI opponents (Rookie, Tuner, and Turbo bots). Accurate typing sparks your nitro thruster.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• 4-Car synchronous circuit</div>
              <div>• Nitro trail unlocks at 70+ WPM</div>
              <div>• Trains cadence & error-free sprints</div>
            </div>
          </div>

          <button
            onClick={() => setActiveGame('racer')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            Enter Grand Prix
          </button>
        </div>

        {/* Game 3: Bubble Burst Blitz */}
        <div className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-400/20 text-purple-300">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-white">{stats.gameScores?.bubbles || 0}</strong></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                3. Bubble Burst Blitz
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                45-second high-energy blitz! Translucent glass bubbles float across the cyber grid. Type any visible word to burst it with sound synthesis.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• 45s countdown frenzy</div>
              <div>• Multi-target opportunistic typing</div>
              <div>• Quick visual scanning exercise</div>
            </div>
          </div>

          <button
            onClick={() => setActiveGame('bubbles')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            Start 45s Blitz
          </button>
        </div>

        {/* Game 4: Galaxian Fleet Typer */}
        <div className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-300">
                <Rocket className="w-6 h-6 text-rose-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-white">{stats.gameScores?.invaders || 0}</strong></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                4. Galaxian Fleet Typer
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Classic arcade alien fleet descending in formation waves. Type each alien's identification word to launch photon torpedoes and clear the grid.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• Grid wave formation movement</div>
              <div>• Escalating wave speeds</div>
              <div>• Precision letter targeting</div>
            </div>
          </div>

          <button
            onClick={() => setActiveGame('invaders')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            Launch Starfighter
          </button>
        </div>

        {/* Game 5: Firewall Cyber Sentry */}
        <div className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-300">
                <Cpu className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-white">{stats.gameScores?.defense || 0}</strong></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                5. Firewall Sentry
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Trojan worms crawl along 3 digital pipelines towards your firewall core. Type their payload words to zap them with tesla coils.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• 3 Synchronous pipeline lanes</div>
              <div>• Core HP management</div>
              <div>• Multitasking lane prioritization</div>
            </div>
          </div>

          <button
            onClick={() => setActiveGame('defense')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            Defend Server Core
          </button>
        </div>

        {/* Game 6: Cyber Ninja Runner */}
        <div className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                <Footprints className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-white">{stats.gameScores?.runner || 0}m</strong></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                6. Cyber Rooftop Runner
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Endless rooftop runner! Obstacles approach at high speed. Type acrobatic action words (jump, slide, vault) to execute parkour moves.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• Side-scrolling runner physics</div>
              <div>• Action verb rapid response</div>
              <div>• Distance high-score leaderboard</div>
            </div>
          </div>

          <button
            onClick={() => setActiveGame('runner')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Start Rooftop Run
          </button>
        </div>
      </div>
    </div>
  );
};
