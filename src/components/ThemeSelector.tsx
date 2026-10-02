import React, { useState, useRef, useEffect } from 'react';
import { ThemeId, THEMES } from '../types/theme';
import { Palette, Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeTheme = THEMES[currentTheme] || THEMES['sunset-ember'];

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const themesList = Object.values(THEMES);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button - Optimized for touch & mobile */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 text-xs font-mono text-slate-200 transition-all cursor-pointer select-none shadow-sm"
        title="Change Liquid Glass Theme Palette"
        aria-label="Change Color Theme"
      >
        <span
          className="w-3 h-3 rounded-full border border-white/30 shadow-[0_0_8px_currentColor] transition-colors shrink-0"
          style={{ backgroundColor: activeTheme.dotColor, color: activeTheme.dotColor }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-300" />
        <span className="hidden xl:inline text-xs font-medium">{activeTheme.name}</span>
      </button>

      {/* Dropdown Menu - 100% Solid Opaque Background (Zero Transparency) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-700 bg-[#0b1120] shadow-[0_12px_40px_rgba(0,0,0,0.95)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between bg-[#070b14] rounded-t-xl mb-1">
            <span className="text-[11px] font-mono uppercase text-slate-200 font-bold tracking-wider">
              Color Themes
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: activeTheme.dotColor, color: activeTheme.dotColor }}
            />
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5 custom-scrollbar">
            {themesList.map((t) => {
              const isSelected = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e293b] text-white shadow-md border border-amber-500/60'
                      : 'text-slate-300 hover:bg-[#151e2e] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-[0_0_10px_currentColor]"
                      style={{ backgroundColor: t.dotColor, color: t.dotColor }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                        {t.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
