import React, { useMemo } from 'react';
import { KEYBOARD_ROWS, KEY_FINGER_MAP, FINGER_COLOR_MAP } from '../utils/keyboardMap';
import { ThemeConfig } from '../types/theme';
import { URDU_KEYBOARD_LAYOUT, URDU_TO_KEY_MAP, isUrduText } from '../utils/urduKeyboardMap';

interface VirtualKeyboardProps {
  targetChar?: string;
  activeKey?: string;
  showHands?: boolean;
  theme?: ThemeConfig;
  layoutMode?: 'auto' | 'en' | 'ur';
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetChar = '',
  activeKey = '',
  showHands = true,
  theme,
  layoutMode = 'auto',
}) => {
  // Check if current target character or selected mode is Urdu
  const isUrdu = useMemo(() => {
    if (layoutMode === 'ur') return true;
    if (layoutMode === 'en') return false;
    return isUrduText(targetChar);
  }, [layoutMode, targetChar]);

  // Determine physical target key on keyboard and shift requirements
  const { physicalKey, requiresShift, urduKeyHint } = useMemo(() => {
    if (!targetChar) return { physicalKey: '', requiresShift: false, urduKeyHint: '' };

    if (targetChar === ' ') {
      return { physicalKey: ' ', requiresShift: false, urduKeyHint: '' };
    }

    if (isUrduText(targetChar)) {
      const urduMap = URDU_TO_KEY_MAP[targetChar];
      if (urduMap) {
        return {
          physicalKey: urduMap.key.toLowerCase(),
          requiresShift: urduMap.shift,
          urduKeyHint: `${urduMap.displayKey.toUpperCase()}${urduMap.shift ? ' (+Shift)' : ''}`
        };
      }
    }

    // Standard English lookup
    const isShift = targetChar.length === 1 && targetChar !== ' ' && targetChar !== targetChar.toLowerCase() && targetChar.toUpperCase() !== targetChar.toLowerCase();
    return {
      physicalKey: targetChar.toLowerCase(),
      requiresShift: isShift,
      urduKeyHint: ''
    };
  }, [targetChar]);

  // Determine finger information for the physical key
  const targetInfo = useMemo(() => {
    if (!physicalKey) return null;
    return KEY_FINGER_MAP[physicalKey] || null;
  }, [physicalKey]);

  return (
    <div className="w-full select-none overflow-hidden">
      {/* Target Key & Finger Guide Header */}
      {showHands && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 mb-2 rounded-xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-mono">
              {isUrdu ? 'اگلا حرف (Next Key)' : 'Next Key'}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 rounded-lg font-bold text-sm sm:text-base border transition-colors shadow-sm ${
                  isUrdu ? 'font-urdu-clean text-lg' : 'font-mono'
                }`}
                style={{
                  backgroundColor: theme ? theme.accentBg : 'rgba(6, 182, 212, 0.2)',
                  borderColor: theme ? theme.accentColor : 'rgba(6, 182, 212, 0.4)',
                  color: '#ffffff'
                }}
              >
                {targetChar === ' ' ? '␣ Space' : targetChar || '—'}
              </span>

              {/* Physical Key Hint (especially helpful for Urdu typists) */}
              {urduKeyHint && (
                <span className="text-[11px] sm:text-xs text-cyan-300 font-mono bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  Key: {urduKeyHint}
                </span>
              )}

              {requiresShift && !urduKeyHint && (
                <span className="text-[10px] sm:text-xs text-amber-300 font-mono bg-amber-500/20 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded-md">
                  + Shift
                </span>
              )}
            </div>
          </div>

          {targetInfo && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
              <span className="text-slate-400 hidden xs:inline">{isUrdu ? 'انگلی:' : 'Finger:'}</span>
              <span className={`px-2 py-0.5 sm:py-1 rounded-md font-medium border text-[10px] sm:text-xs ${FINGER_COLOR_MAP[targetInfo.finger]?.bg} ${FINGER_COLOR_MAP[targetInfo.finger]?.text} ${FINGER_COLOR_MAP[targetInfo.finger]?.border}`}>
                {targetInfo.fingerLabel} ({targetInfo.hand === 'left' ? 'Left' : 'Right'})
              </span>
            </div>
          )}

          {/* Quick finger color legend */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span>Pinky</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Ring</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>Middle</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span>Index</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span>Thumb</span>
          </div>
        </div>
      )}

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1 sm:gap-1.5 p-1.5 sm:p-3 rounded-2xl glass-panel border border-white/[0.08] shadow-2xl overflow-hidden w-full bg-slate-950/60">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-0.5 sm:gap-1.5 w-full">
            {row.map((kDef, keyIdx) => {
              const kLower = kDef.key.toLowerCase();
              const isTarget =
                (targetChar === ' ' && kDef.key === ' ') ||
                (physicalKey && kLower === physicalKey) ||
                (requiresShift && (kDef.key === 'ShiftLeft' || kDef.key === 'ShiftRight'));

              const isCurrentlyActive =
                activeKey.toLowerCase() === kLower ||
                (activeKey === ' ' && kDef.key === ' ') ||
                (activeKey === 'Shift' && (kDef.key === 'ShiftLeft' || kDef.key === 'ShiftRight'));

              // Key finger coloring
              const fingerInfo = KEY_FINGER_MAP[kDef.key];
              const fingerColors = fingerInfo ? FINGER_COLOR_MAP[fingerInfo.finger] : null;

              // Urdu key definition
              const urduInfo = URDU_KEYBOARD_LAYOUT[kLower];

              // Proportional width classes for responsiveness
              let flexClass = 'flex-1 min-w-[18px] sm:min-w-[32px] md:min-w-[38px] max-w-[48px]';
              let displayComponent = (
                <div className="flex flex-col items-center justify-center w-full text-center">
                  {isUrdu && urduInfo ? (
                    <div className="flex flex-col items-center justify-center w-full text-center">
                      {urduInfo.urduShift && (
                        <span className="text-[9px] sm:text-[10px] text-amber-300 font-urdu-clean leading-none opacity-80 text-center w-full flex items-center justify-center">
                          {urduInfo.urduShift}
                        </span>
                      )}
                      <span className={`font-urdu-clean text-xs sm:text-sm md:text-base font-bold leading-tight text-center w-full flex items-center justify-center ${isTarget ? 'text-white' : 'text-slate-100'}`}>
                        {urduInfo.urdu}
                      </span>
                      <span className="text-[7px] sm:text-[9px] font-mono text-slate-400 leading-none text-center w-full flex items-center justify-center">
                        {kDef.key.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <>
                      {kDef.shiftKey && (
                        <span className="hidden sm:block text-[8px] sm:text-[10px] text-slate-400 leading-none text-center w-full">
                          {kDef.shiftKey}
                        </span>
                      )}
                      <span className={`${isTarget ? 'text-white font-bold' : 'text-slate-200'} leading-tight truncate text-center w-full`}>
                        {kDef.display || kDef.key.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>
              );

              if (kDef.type === 'space') {
                flexClass = 'flex-[3.5] min-w-[70px] sm:min-w-[140px] max-w-sm sm:max-w-md';
                displayComponent = <span className="text-[10px] sm:text-xs text-slate-300 font-mono text-center flex items-center justify-center w-full">Spacebar (فاصلہ)</span>;
              } else if (kDef.key === 'Backspace') {
                flexClass = 'flex-[1.5] min-w-[28px] max-w-[65px]';
                displayComponent = (
                  <>
                    <span className="hidden sm:inline">⌫ Back</span>
                    <span className="sm:hidden">⌫</span>
                  </>
                );
              } else if (kDef.key === 'Tab') {
                flexClass = 'flex-[1.3] min-w-[24px] max-w-[55px]';
                displayComponent = (
                  <>
                    <span className="hidden sm:inline">Tab ⇥</span>
                    <span className="sm:hidden">Tab</span>
                  </>
                );
              } else if (kDef.key === 'CapsLock') {
                flexClass = 'flex-[1.4] min-w-[26px] max-w-[60px]';
                displayComponent = (
                  <>
                    <span className="hidden sm:inline">Caps ⇪</span>
                    <span className="sm:hidden">Caps</span>
                  </>
                );
              } else if (kDef.key === 'Enter') {
                flexClass = 'flex-[1.7] min-w-[32px] max-w-[70px]';
                displayComponent = (
                  <>
                    <span className="hidden sm:inline">Enter ↵</span>
                    <span className="sm:hidden">↵</span>
                  </>
                );
              } else if (kDef.key === 'ShiftLeft' || kDef.key === 'ShiftRight') {
                flexClass = 'flex-[1.6] min-w-[30px] max-w-[70px]';
                displayComponent = (
                  <>
                    <span className="hidden sm:inline">Shift ⇧</span>
                    <span className="sm:hidden">⇧</span>
                  </>
                );
              } else if (kDef.type === 'modifier') {
                flexClass = 'flex-[1.1] min-w-[22px] max-w-[50px]';
              }

              return (
                <div
                  key={keyIdx}
                  className={`relative flex flex-col items-center justify-center h-8 sm:h-10 md:h-12 rounded-md sm:rounded-lg font-mono text-[9px] sm:text-xs md:text-sm font-semibold select-none transition-all duration-75 glass-key px-0.5 sm:px-1 ${flexClass} ${
                    isCurrentlyActive ? 'key-active scale-95' : ''
                  } ${isTarget ? 'key-target ring-2 ring-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : ''}`}
                >
                  {displayComponent}

                  {/* Tactile bumps for F and J home row anchors */}
                  {(kDef.key === 'f' || kDef.key === 'j') && (
                    <div className="absolute bottom-0.5 sm:bottom-1 w-2 sm:w-2.5 h-0.5 rounded-full bg-cyan-400/80" />
                  )}

                  {/* Finger color dot indicator on top-right */}
                  {fingerColors && !kDef.type && (
                    <div
                      className={`absolute top-0.5 right-0.5 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full opacity-60 ${
                        fingerColors.border.replace('border-', 'bg-')
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
