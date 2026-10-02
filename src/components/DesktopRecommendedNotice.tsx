import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Laptop,
  Keyboard,
  ArrowRight,
  Flame,
  Sparkles,
  X,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  MoveUpRight
} from 'lucide-react';

export const DesktopRecommendedNotice: React.FC = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      // Check if screen is mobile/tablet size (< 900px)
      setIsSmallScreen(window.innerWidth < 900);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (!isSmallScreen) return null;

  return (
    <>
      {/* Floating minimized trigger button if dismissed */}
      {isDismissed && (
        <button
          onClick={() => setIsDismissed(false)}
          className="fixed top-20 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-mono shadow-lg backdrop-blur-md animate-pulse cursor-pointer transition-all"
        >
          <Monitor className="w-3.5 h-3.5 text-amber-400" />
          <span>Desktop Notice</span>
        </button>
      )}

      {/* Full Animated Notice Overlay on Small Devices */}
      {!isDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border-2 border-amber-500/50 bg-gradient-to-b from-[#0f172a]/95 via-[#0b0f19]/95 to-[#070a12]/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center space-y-5 overflow-hidden">
            {/* Top decorative ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close / Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close notice"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Animated Device Graphic (Laptop + Monitor Pulsing) */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/30 via-rose-500/20 to-cyan-500/30 animate-pulse blur-md" />
              <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-amber-400/50 flex flex-col items-center justify-center shadow-xl">
                <Monitor className="w-9 h-9 text-amber-400 animate-bounce" />
                <div className="w-12 h-1 bg-amber-400/60 rounded-full mt-1.5" />
              </div>

              {/* Small floating mobile badge with indicator */}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-slate-950 border border-rose-500/50 text-rose-400 shadow-md">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Desktop &amp; Big Screen Only</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Switch to Desktop for the Best Experience!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                This platform is strictly engineered for <span className="text-amber-300 font-semibold">physical keyboards</span> and <span className="text-cyan-300 font-semibold">large displays</span>.
              </p>
            </div>

            {/* Detailed Explanation in English */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              <p>
                <strong className="text-amber-300">AZ Typing Fire</strong> is a professional touch-typing suite built to test and accelerate your true keyboard typing speed. To utilize our <strong className="text-white">10-finger placement guides</strong>, <strong className="text-white">interactive virtual keyboard</strong>, and <strong className="text-white">real-time speed heatmaps</strong>, please open this website on your desktop or laptop computer.
              </p>
            </div>

            {/* Key Advantages Checklist */}
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] sm:text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Keyboard className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Physical Keyboard</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Laptop className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Wide Desktop Viewport</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10-Finger Hand Guide</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Real-Time Heatmap</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsDismissed(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Got It, I Will Switch to Desktop</span>
                <MoveUpRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer"
              >
                Continue previewing on mobile anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
