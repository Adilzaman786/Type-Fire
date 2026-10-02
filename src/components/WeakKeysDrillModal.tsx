import React, { useState, useMemo } from 'react';
import { X, Target, Sparkles, RefreshCw, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { UserStats } from '../types/typing';
import { isUrduText, URDU_TO_KEY_MAP } from '../utils/urduKeyboardMap';

interface WeakKeysDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onStartDrill: (drillText: string, weakKeys: string[], isUrdu: boolean) => void;
}

export const WeakKeysDrillModal: React.FC<WeakKeysDrillModalProps> = ({
  isOpen,
  onClose,
  stats,
  onStartDrill,
}) => {
  const [selectedLang, setSelectedLang] = useState<'ur' | 'en'>('ur');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Compute weakest keys for both English and Urdu from problemKeys telemetry
  const { urduWeak, englishWeak } = useMemo(() => {
    const urduList: { key: string; errors: number }[] = [];
    const englishList: { key: string; errors: number }[] = [];

    Object.entries(stats.problemKeys || {}).forEach(([key, data]) => {
      if (!key || key === ' ') return;
      const errors = data.errors || 0;
      if (errors > 0) {
        if (isUrduText(key)) {
          urduList.push({ key, errors });
        } else {
          englishList.push({ key: key.toLowerCase(), errors });
        }
      }
    });

    urduList.sort((a, b) => b.errors - a.errors);
    englishList.sort((a, b) => b.errors - a.errors);

    // Fallback defaults if user hasn't made mistakes yet
    const fallbackUrdu = [
      { key: 'ص', errors: 4 },
      { key: 'ض', errors: 3 },
      { key: 'ع', errors: 3 },
      { key: 'غ', errors: 2 },
      { key: 'ط', errors: 2 },
      { key: 'ظ', errors: 2 },
      { key: 'خ', errors: 1 },
      { key: 'ث', errors: 1 },
    ];

    const fallbackEnglish = [
      { key: 'z', errors: 5 },
      { key: 'x', errors: 4 },
      { key: 'q', errors: 3 },
      { key: 'p', errors: 3 },
      { key: 'b', errors: 2 },
      { key: 'c', errors: 2 },
    ];

    return {
      urduWeak: urduList.length > 0 ? urduList.slice(0, 10) : fallbackUrdu,
      englishWeak: englishList.length > 0 ? englishList.slice(0, 10) : fallbackEnglish,
    };
  }, [stats.problemKeys]);

  const currentList = selectedLang === 'ur' ? urduWeak : englishWeak;

  // Initialize selected keys
  React.useEffect(() => {
    if (currentList.length > 0) {
      setSelectedKeys(currentList.slice(0, 4).map((k) => k.key));
    }
  }, [selectedLang]);

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Generate customized drill paragraph targeting selected keys
  const generatedDrill = useMemo(() => {
    if (selectedKeys.length === 0) return '';

    if (selectedLang === 'ur') {
      // Urdu smart word builder combining weak keys with common vowels (ا، و، ی، ے) and home keys
      const tokens: string[] = [];
      selectedKeys.forEach((k) => {
        tokens.push(`${k}${k}${k}`);
        tokens.push(`${k}ا`);
        tokens.push(`${k}و`);
        tokens.push(`${k}ی`);
        tokens.push(`ب${k}`);
        tokens.push(`س${k}`);
        tokens.push(`${k}ار`);
        tokens.push(`${k}ام`);
        tokens.push(`ن${k}`);
        tokens.push(`${k}ود`);
      });
      // Shuffle slightly
      return (
        tokens.join(' ') +
        ' ' +
        tokens.slice().reverse().join(' ')
      );
    } else {
      // English smart drill
      const tokens: string[] = [];
      selectedKeys.forEach((k) => {
        tokens.push(`${k}${k}${k}`);
        tokens.push(`${k}a${k}e`);
        tokens.push(`${k}o${k}u`);
        tokens.push(`${k}in`);
        tokens.push(`${k}ar`);
        tokens.push(`un${k}`);
        tokens.push(`re${k}`);
        tokens.push(`${k}ing`);
      });
      return (
        `Targeted precision drill for keys [ ${selectedKeys.join(', ').toUpperCase()} ]: ` +
        tokens.join(' ') +
        ` focus on fluid cadence and correct tactile finger memory without glancing.`
      );
    }
  }, [selectedKeys, selectedLang]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    if (!generatedDrill) return;
    onStartDrill(generatedDrill, selectedKeys, selectedLang === 'ur');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl glass-panel border border-cyan-500/40 bg-gradient-to-b from-[#141d33] via-[#0d1424] to-[#070a12] p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Weak Keys Smart Drill (کمزور حروف کی مشق)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  AI Adaptive
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatically identifies your most problematic keys and crafts targeted muscle-memory drills
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-xl bg-white/[0.06] border border-white/10">
            <button
              onClick={() => setSelectedLang('ur')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-urdu-clean flex items-center gap-1.5 ${
                selectedLang === 'ur'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>اردو کمزور حروف</span>
            </button>
            <button
              onClick={() => setSelectedLang('en')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedLang === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>English Weak Keys</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Click keys to toggle focus
          </span>
        </div>

        {/* Identified Weak Keys Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>{selectedLang === 'ur' ? 'تشخیص شدہ کمزور حروف (Mistake Telemetry):' : 'Identified Problem Keys:'}</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {selectedKeys.length} selected for drill
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {currentList.map((item) => {
              const isSelected = selectedKeys.includes(item.key);
              const keyInfo = selectedLang === 'ur' ? URDU_TO_KEY_MAP[item.key] : null;

              return (
                <button
                  key={item.key}
                  onClick={() => toggleKey(item.key)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)] scale-105'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <span className={`text-xl font-bold leading-none ${selectedLang === 'ur' ? 'font-urdu-clean' : 'font-mono'}`}>
                    {item.key}
                  </span>
                  <span className="text-[9px] font-mono text-rose-400 mt-1">
                    {item.errors} err
                  </span>
                  {keyInfo && (
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">
                      ({keyInfo.displayKey})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generated Drill Preview */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generated Targeted Drill Preview:</span>
            </span>
            <span>{generatedDrill.length} characters</span>
          </div>

          <p
            dir={selectedLang === 'ur' ? 'rtl' : 'ltr'}
            className={`text-sm sm:text-base text-slate-200 leading-relaxed max-h-28 overflow-y-auto ${
              selectedLang === 'ur' ? 'font-urdu-clean text-lg text-right' : 'font-mono'
            }`}
          >
            {generatedDrill || 'Select at least one key above to build drill.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunch}
            disabled={selectedKeys.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Smart Drill (مشق شروع کریں)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
