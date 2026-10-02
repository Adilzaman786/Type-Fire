import React, { useState, useMemo } from 'react';
import { KEYBOARD_ROWS, KEY_FINGER_MAP, FINGER_COLOR_MAP } from '../utils/keyboardMap';
import { ThemeConfig } from '../types/theme';
import { URDU_KEYBOARD_LAYOUT, URDU_TO_KEY_MAP } from '../utils/urduKeyboardMap';
import {
  Flame,
  AlertTriangle,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  Info,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface KeyboardHeatmapProps {
  problemKeys: Record<string, { total: number; errors: number }>;
  onStartWeakKeysDrill?: (weakKeys: string[]) => void;
  theme?: ThemeConfig;
}

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({
  problemKeys = {},
  onStartWeakKeysDrill,
  theme,
}) => {
  const [heatmapLang, setHeatmapLang] = useState<'en' | 'ur'>('en');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Calculate mistake statistics
  const { keyErrorMap, maxErrors, totalMistakes, sortedProblemKeys, cleanKeysCount } = useMemo(() => {
    const errorMap: Record<string, number> = {};
    let total = 0;

    Object.entries(problemKeys).forEach(([k, data]) => {
      const char = k.toLowerCase();
      const count = data.errors || 0;
      errorMap[char] = (errorMap[char] || 0) + count;
      total += count;
    });

    const counts = Object.values(errorMap);
    const max = counts.length > 0 ? Math.max(...counts, 1) : 1;

    const sorted = Object.entries(errorMap)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    // Count how many alphabet keys have 0 errors
    const allAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const clean = allAlphabet.filter((c) => !errorMap[c] || errorMap[c] === 0).length;

    return {
      keyErrorMap: errorMap,
      maxErrors: max,
      totalMistakes: total,
      sortedProblemKeys: sorted,
      cleanKeysCount: clean,
    };
  }, [problemKeys]);

  // Top problem key
  const worstKey = sortedProblemKeys.length > 0 ? sortedProblemKeys[0] : null;

  // Selected key diagnostic details
  const selectedKeyInfo = useMemo(() => {
    if (!selectedKey) return null;
    const char = selectedKey.toLowerCase();
    const urduInfo = URDU_KEYBOARD_LAYOUT[char];
    const urduChar = urduInfo?.urdu || '';

    // Check errors for both English key and mapped Urdu character
    const errors = (keyErrorMap[char] || 0) + (urduChar ? (keyErrorMap[urduChar] || 0) : 0);
    const fingerInfo = KEY_FINGER_MAP[char] || KEY_FINGER_MAP[selectedKey] || null;
    const totalAttempts = (problemKeys[char]?.total || errors || 10);
    const accuracy = Math.max(0, Math.min(100, Math.round(((totalAttempts - errors) / totalAttempts) * 100)));

    return {
      char: selectedKey,
      urduChar,
      errors,
      accuracy,
      fingerInfo,
    };
  }, [selectedKey, keyErrorMap, problemKeys]);

  // Color generator for heatmap intensity
  const getKeyHeatStyle = (keyChar: string) => {
    const char = keyChar.toLowerCase();
    const urduChar = URDU_KEYBOARD_LAYOUT[char]?.urdu || '';
    const count = (keyErrorMap[char] || 0) + (urduChar ? (keyErrorMap[urduChar] || 0) : 0);

    if (count === 0) {
      return {
        bg: 'bg-white/[0.03] hover:bg-white/[0.08]',
        border: 'border-white/[0.08]',
        text: 'text-slate-300',
        badge: null,
        glow: '',
      };
    }

    const ratio = count / maxErrors;

    if (ratio >= 0.7 || count >= 8) {
      // Critical / Severe Heat
      return {
        bg: 'bg-rose-500/35 hover:bg-rose-500/45',
        border: 'border-rose-500/70',
        text: 'text-rose-100 font-bold',
        badge: 'bg-rose-600 text-white',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/80',
      };
    }

    if (ratio >= 0.4 || count >= 4) {
      // Moderate Heat
      return {
        bg: 'bg-amber-500/30 hover:bg-amber-500/40',
        border: 'border-amber-500/60',
        text: 'text-amber-100 font-bold',
        badge: 'bg-amber-500 text-black',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.35)]',
      };
    }

    // Mild Heat
    return {
      bg: 'bg-yellow-500/20 hover:bg-yellow-500/30',
      border: 'border-yellow-500/40',
      text: 'text-yellow-200',
      badge: 'bg-yellow-500/80 text-black',
      glow: '',
    };
  };

  return (
    <div className="space-y-6">
      {/* Heatmap Top Bar with Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Neuromuscular Diagnostic Heatmap</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            {heatmapLang === 'ur' ? 'اردو و انگلش کی بورڈ ایرر ہیٹ میپ' : 'Interactive Mistake Heatmap'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {heatmapLang === 'ur'
              ? 'کیز کا رنگ ان حروف کو ظاہر کرتا ہے جن میں آپ سے زیادہ غلطیاں ہوئیں۔ کمزور حروف کی براہ راست مشق کریں۔'
              : 'Color-coded visual keyboard highlights keys with high error frequency. Click any key for precision diagnostics.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Layout Toggle (English vs Urdu) */}
          <div className="inline-flex p-1 rounded-xl bg-white/[0.06] border border-white/[0.1]">
            <button
              onClick={() => setHeatmapLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                heatmapLang === 'en'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English QWERTY
            </button>
            <button
              onClick={() => setHeatmapLang('ur')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-urdu-clean ${
                heatmapLang === 'ur'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              اردو فونیٹک
            </button>
          </div>

          {/* Targeted Drill Action */}
          {onStartWeakKeysDrill && sortedProblemKeys.length > 0 && (
            <button
              onClick={() => onStartWeakKeysDrill(sortedProblemKeys.slice(0, 5).map(([k]) => k))}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Drill Top 5 Weak Keys</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <span className="text-[10px] uppercase text-slate-400">Total Keystroke Errors</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 tabular-nums">
            {totalMistakes}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <span className="text-[10px] uppercase text-slate-400">Most Problematic Key</span>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 uppercase">
            {worstKey ? `'${worstKey[0]}' (${worstKey[1]}x)` : 'None 🎉'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <span className="text-[10px] uppercase text-slate-400">Flawless Keys</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5 tabular-nums">
            {cleanKeysCount} / 26
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <span className="text-[10px] uppercase text-slate-400">Accuracy Status</span>
          <div className="text-sm sm:text-base font-bold text-cyan-300 mt-1">
            {totalMistakes < 10 ? 'High Precision' : totalMistakes < 30 ? 'Targeted Training' : 'Cadence Drill'}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-xs">
        <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
          Heat Intensity Scale:
        </span>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white/[0.04] border border-white/20 inline-block" />
            <span className="text-slate-400">0 Errors (Clean)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-yellow-500/25 border border-yellow-500/50 inline-block" />
            <span className="text-yellow-300">1-3 Errors (Mild)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500/35 border border-amber-500/60 inline-block" />
            <span className="text-amber-300">4-7 Errors (Moderate)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500/40 border border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)] inline-block" />
            <span className="text-rose-300 font-semibold">8+ Errors (Critical)</span>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard Heatmap Grid */}
      <div className="relative p-2 sm:p-4 rounded-2xl glass-panel border border-white/[0.08] shadow-inner bg-slate-950/60 overflow-hidden">
        <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
              {row.map((kDef, keyIdx) => {
                const kLower = kDef.key.toLowerCase();
                const urduInfo = URDU_KEYBOARD_LAYOUT[kLower];
                const urduChar = urduInfo?.urdu || '';
                const heat = getKeyHeatStyle(kDef.key);
                const isSelected = selectedKey === kDef.key;
                const errorCount = (keyErrorMap[kLower] || 0) + (urduChar ? (keyErrorMap[urduChar] || 0) : 0);

                let flexClass = 'flex-1 min-w-[20px] sm:min-w-[34px] max-w-[48px]';
                let labelComponent = (
                  <span className="leading-tight font-semibold truncate w-full text-center">
                    {kDef.display || kDef.key.toUpperCase()}
                  </span>
                );

                if (heatmapLang === 'ur' && urduInfo) {
                  labelComponent = (
                    <div className="flex flex-col items-center justify-center leading-none w-full text-center">
                      <span className="font-urdu-clean text-xs sm:text-sm font-bold text-slate-100 text-center w-full flex items-center justify-center">
                        {urduInfo.urdu}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-mono text-slate-400 text-center w-full flex items-center justify-center">
                        {kDef.key.toUpperCase()}
                      </span>
                    </div>
                  );
                }

                if (kDef.type === 'space') {
                  flexClass = 'flex-[4] min-w-[80px] max-w-sm sm:max-w-md';
                  labelComponent = <span className="text-[10px] text-slate-300 font-mono">Spacebar</span>;
                } else if (kDef.key === 'Backspace') {
                  flexClass = 'flex-[1.6] min-w-[32px] max-w-[70px]';
                  labelComponent = <span>⌫</span>;
                } else if (kDef.key === 'Tab') {
                  flexClass = 'flex-[1.3] min-w-[28px] max-w-[60px]';
                  labelComponent = <span>Tab</span>;
                } else if (kDef.key === 'CapsLock') {
                  flexClass = 'flex-[1.5] min-w-[30px] max-w-[65px]';
                  labelComponent = <span>Caps</span>;
                } else if (kDef.key === 'Enter') {
                  flexClass = 'flex-[1.8] min-w-[36px] max-w-[75px]';
                  labelComponent = <span>↵</span>;
                } else if (kDef.key === 'ShiftLeft' || kDef.key === 'ShiftRight') {
                  flexClass = 'flex-[1.7] min-w-[34px] max-w-[75px]';
                  labelComponent = <span>⇧</span>;
                } else if (kDef.type === 'modifier') {
                  flexClass = 'flex-[1.2] min-w-[26px] max-w-[55px]';
                }

                return (
                  <button
                    key={keyIdx}
                    onClick={() => setSelectedKey(kDef.key)}
                    className={`relative flex flex-col items-center justify-center h-8 sm:h-10 md:h-11 rounded-lg font-mono text-[10px] sm:text-xs md:text-sm border transition-all duration-150 cursor-pointer select-none ${flexClass} ${heat.bg} ${heat.border} ${heat.text} ${heat.glow} ${
                      isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10' : 'active:scale-95'
                    }`}
                    title={`${kDef.key}: ${errorCount} mistake(s)`}
                  >
                    {errorCount > 0 && (
                      <span className={`absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[8px] font-bold font-mono shadow-sm ${heat.badge}`}>
                        {errorCount}
                      </span>
                    )}

                    {labelComponent}

                    {(kDef.key === 'f' || kDef.key === 'j') && (
                      <span className="absolute bottom-0.5 sm:bottom-1 w-2 sm:w-2.5 h-0.5 rounded-full bg-cyan-400/80" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Key Diagnostic Inspector */}
      {selectedKeyInfo && (
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border-2 border-cyan-400/60 flex flex-col items-center justify-center text-white shadow-lg">
              {selectedKeyInfo.urduChar ? (
                <>
                  <span className="font-urdu-clean text-lg font-bold text-amber-300">
                    {selectedKeyInfo.urduChar}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedKeyInfo.char.toUpperCase()}
                  </span>
                </>
              ) : (
                <span className="font-mono text-xl font-black">
                  {selectedKeyInfo.char === ' ' ? '␣' : selectedKeyInfo.char.toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  {selectedKeyInfo.urduChar ? `Urdu / Eng Key: '${selectedKeyInfo.urduChar}' (${selectedKeyInfo.char.toUpperCase()})` : `Key Diagnostic: '${selectedKeyInfo.char}'`}
                </span>
                {selectedKeyInfo.errors === 0 ? (
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Clean Precision
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> {selectedKeyInfo.errors} Mistake(s)
                  </span>
                )}
              </div>

              {selectedKeyInfo.fingerInfo ? (
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span>Assigned Finger:</span>
                  <span className={`px-2 py-0.5 rounded font-medium border text-[11px] ${FINGER_COLOR_MAP[selectedKeyInfo.fingerInfo.finger]?.bg} ${FINGER_COLOR_MAP[selectedKeyInfo.fingerInfo.finger]?.text} ${FINGER_COLOR_MAP[selectedKeyInfo.fingerInfo.finger]?.border}`}>
                    {selectedKeyInfo.fingerInfo.fingerLabel} ({selectedKeyInfo.fingerInfo.hand === 'left' ? 'Left Hand' : 'Right Hand'})
                  </span>
                </p>
              ) : (
                <p className="text-xs text-slate-400">Standard keyboard modifier key.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:self-center">
            {onStartWeakKeysDrill && (
              <button
                onClick={() => onStartWeakKeysDrill([selectedKeyInfo.char, selectedKeyInfo.urduChar].filter(Boolean))}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-semibold font-mono transition-colors cursor-pointer whitespace-nowrap"
              >
                Drill Key '{selectedKeyInfo.char}'
              </button>
            )}
            <button
              onClick={() => setSelectedKey(null)}
              className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
