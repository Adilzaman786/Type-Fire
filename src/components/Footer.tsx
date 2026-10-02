import React, { useState } from 'react';
import { TabMode } from '../types/typing';
import { ThemeConfig } from '../types/theme';
import {
  Flame,
  Mail,
  Sparkles,
  Keyboard,
  Gamepad2,
  BookOpen,
  LayoutDashboard,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ArrowUp,
  Cpu,
  Heart,
  Award
} from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: TabMode) => void;
  activeTheme: ThemeConfig;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, activeTheme }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const creatorEmail = 'malikmuhammadadilzaman@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(creatorEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (tab: TabMode) => {
    onSelectTab(tab);
    scrollToTop();
  };

  return (
    <footer className="relative z-10 mt-16 border-t border-white/[0.08] bg-[#060911]/90 backdrop-blur-xl mb-20 md:mb-0 overflow-hidden">
      {/* Background ambient decorative glows */}
      <div
        className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: activeTheme.accentColor }}
      />
      <div className="absolute bottom-0 right-1/4 translate-y-1/3 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Accent Gradient Line */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${activeTheme.accentColor} 25%, #f59e0b 50%, ${activeTheme.accentColor} 75%, transparent 100%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* ============================================================== */}
        {/* 🌟 HERO CREATOR SHOWCASE SECTION (PROMINENT NAME HIGHLIGHT)  */}
        {/* ============================================================== */}
        <div className="relative p-6 sm:p-8 lg:p-10 rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-amber-500/[0.03] backdrop-blur-md shadow-2xl mb-12 overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10">
            {/* Left: Avatar Monogram + Massive Name Display */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              {/* Creator Icon Badge */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-xl border border-white/20 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.accentColor} 0%, #d97706 50%, #dc2626 100%)`
                  }}
                >
                  <span className="tracking-tight">AZ</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Flame className="w-5 h-5 text-amber-300 absolute bottom-1.5 right-1.5 fill-amber-300 animate-pulse" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  Creator
                </div>
              </div>

              {/* Huge Name & Engineering Role */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest font-mono text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Designed & Engineered By
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-xs font-mono text-slate-400">Software Architect</span>
                </div>

                {/* BARA NAAM IN FULL CAPITAL LETTERS - ELEGANT SINGLE LINE FIT */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-md sm:whitespace-nowrap">
                  <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent uppercase">
                    MALIK MUHAMMAD ADIL ZAMAN
                  </span>
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Creator & Lead Developer of <strong className="text-white">AZ Typing Fire</strong>. Engineered with modern high-frequency keystroke measurement, structured 24-stage pedagogy, competitive typing arcade games, and real-time Firebase cloud persistence.
                </p>
              </div>
            </div>

            {/* Right: Creator Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <a
                href={`mailto:${creatorEmail}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Adil Zaman</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs sm:text-sm font-semibold text-slate-200 transition-all cursor-pointer"
                title="Copy developer email"
              >
                {copiedEmail ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 📚 4-COLUMN COMPREHENSIVE INFORMATION GRID                     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-white/[0.08]">
          {/* Column 1: Brand & System Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: activeTheme.accentColor }}
              >
                <Flame className="w-5 h-5 fill-white text-white animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  AZ Typing Fire
                </span>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Pro Keystroke Suite
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              An elite typing master platform designed to transform regular typists into 100+ WPM precision speedsters through gamification, muscle memory drills, and visual ergonomics.
            </p>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Cloud Sync: <strong>Connected</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Engine: <strong>Low-Latency Web Audio & Telemetry</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Security: <strong>Zero-Trust Firestore Rules</strong></span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Modules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Training Modules
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('lessons')}
                  className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-2 w-full text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  <span>24-Stage Curriculum & Hand Guides</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('test')}
                  className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-2 w-full text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  <span>WPM & Accuracy Benchmark Test</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('leaderboard')}
                  className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-2 w-full text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  <span>🏆 Global Leaderboard & Streaks</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('practice')}
                  className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-2 w-full text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  <span>Custom Paragraphs & Weak Keys Drill</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('games')}
                  className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-2 w-full text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  <span>6 Retro Arcade Typing Games</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-2 w-full text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  <span>Interactive Heatmap & Cloud Profile</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Stack & Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'React 19',
                'TypeScript',
                'Tailwind CSS v4',
                'Firebase Auth',
                'Cloud Firestore',
                'Canvas Confetti',
                'Web Audio API',
                'Custom Sound Synthesizer',
                'Heatmap Telemetry',
                'Responsive Glassmorphism'
              ].map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-400 leading-normal">
              Engineered with zero external lag, sub-millisecond input capture, and offline-first fallback storage.
            </p>
          </div>

          {/* Column 4: Keyboard Shortcuts & Ergonomics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-4 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-emerald-400" />
              Speedster Shortcuts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400">Restart Current Test</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-amber-300 font-mono text-[11px] border border-white/[0.15]">
                  Tab + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400">Sound Toggle</span>
                <span className="text-slate-300 font-mono text-[11px]">Navbar Controls</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400">Home Row Rest</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] text-slate-200 font-mono text-[11px]">
                  F &amp; J bumps
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400">Cloud Sync Interval</span>
                <span className="text-emerald-400 font-mono text-[11px]">Real-Time Auto</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ⚖️ BOTTOM ATTRIBUTION & COPYRIGHT BAR                         */}
        {/* ============================================================== */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Creator Attribution */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              © {new Date().getFullYear()} AZ Typing Fire.
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span>
              Proudly created &amp; developed by{' '}
              <strong className="text-amber-300 font-bold tracking-wide uppercase">
                MALIK MUHAMMAD ADIL ZAMAN
              </strong>
            </span>
          </div>

          {/* Social / Email / Back to Top */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <a
              href={`mailto:${creatorEmail}`}
              className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{creatorEmail}</span>
            </a>

            <span className="text-slate-700">|</span>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] transition-all cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
