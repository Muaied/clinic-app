import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Moon, Sun } from 'lucide-react';
import { useTheme, themeFamilies } from '../../features/theme/ThemeContext';
import { useLanguage } from '../../features/language/LanguageContext';

export const ThemePicker = () => {
  const { themeName, setTheme, themes } = useTheme();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentTheme = themes[themeName];

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        id="theme-picker-btn"
        onClick={() => setOpen((o) => !o)}
        title={lang === 'ar' ? 'تغيير الثيم' : 'Change Theme'}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
      >
        <Palette
          size={16}
          className="text-slate-400 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_6px_rgba(167,139,250,0.7)] transition-all duration-300"
        />
        {/* Live preview swatch */}
        <div className="flex gap-0.5 items-center">
          {currentTheme?.preview.slice(0, 2).map((c, i) => (
            <div
              key={i}
              className="rounded-full border border-black/10"
              style={{ width: i === 0 ? '12px' : '8px', height: i === 0 ? '12px' : '8px', backgroundColor: c }}
            />
          ))}
        </div>
      </button>

      {open && (
        <div
          className="absolute top-14 z-50 rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            width: '280px',
            backgroundColor: 'var(--surface, #131B2F)',
            borderColor: 'var(--border, #1F2942)',
            right: lang === 'ar' ? 0 : 'auto',
            left: lang === 'ar' ? 'auto' : 0,
            boxShadow: 'var(--card-glow, 0 8px 32px rgba(0,0,0,0.3))',
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'اختر الثيم' : 'Choose Theme'}
            </p>
          </div>

          {/* Theme families */}
          <div className="px-3 pb-4 space-y-2">
            {themeFamilies.map(({ key, nameAr, nameEn }) => {
              const darkKey  = `${key}Dark`;
              const lightKey = `${key}Light`;
              const darkTheme  = themes[darkKey];
              const lightTheme = themes[lightKey];
              const isDarkActive  = themeName === darkKey;
              const isLightActive = themeName === lightKey;
              const isFamilyActive = isDarkActive || isLightActive;

              return (
                <div
                  key={key}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: isFamilyActive
                      ? `1.5px solid color-mix(in srgb, var(--accent1) 50%, transparent)`
                      : `1px solid var(--border)`,
                    backgroundColor: isFamilyActive
                      ? 'color-mix(in srgb, var(--accent1) 6%, transparent)'
                      : 'rgba(128,128,128,0.04)',
                  }}
                >
                  {/* Family name */}
                  <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                    {/* Color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: darkTheme?.vars['--accent1'] }}
                    />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? nameAr : nameEn}
                    </span>
                    {isFamilyActive && (
                      <Check size={11} className="ml-auto" style={{ color: 'var(--accent1)' }} />
                    )}
                  </div>

                  {/* Dark / Light row */}
                  <div className="flex gap-2 px-2 pb-2">
                    {/* Dark variant */}
                    <button
                      id={`theme-${darkKey}`}
                      onClick={() => { setTheme(darkKey); setOpen(false); }}
                      className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150"
                      style={{
                        backgroundColor: isDarkActive
                          ? 'color-mix(in srgb, var(--accent1) 15%, transparent)'
                          : 'transparent',
                        border: isDarkActive
                          ? '1px solid color-mix(in srgb, var(--accent1) 40%, transparent)'
                          : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isDarkActive) e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isDarkActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Preview card */}
                      <div
                        className="relative rounded-lg overflow-hidden shrink-0"
                        style={{
                          width: '36px', height: '24px',
                          backgroundColor: darkTheme?.preview[0],
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(135deg, transparent 45%, ${darkTheme?.preview[1]} 45%)`,
                        }} />
                        <div style={{
                          position: 'absolute', bottom: '3px', right: '3px',
                          width: '5px', height: '5px', borderRadius: '50%',
                          backgroundColor: darkTheme?.preview[2],
                        }} />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1">
                          <Moon size={9} style={{ color: 'var(--text-secondary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {lang === 'ar' ? 'داكن' : 'Dark'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Light variant */}
                    <button
                      id={`theme-${lightKey}`}
                      onClick={() => { setTheme(lightKey); setOpen(false); }}
                      className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150"
                      style={{
                        backgroundColor: isLightActive
                          ? 'color-mix(in srgb, var(--accent1) 15%, transparent)'
                          : 'transparent',
                        border: isLightActive
                          ? '1px solid color-mix(in srgb, var(--accent1) 40%, transparent)'
                          : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLightActive) e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isLightActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Preview card */}
                      <div
                        className="relative rounded-lg overflow-hidden shrink-0"
                        style={{
                          width: '36px', height: '24px',
                          backgroundColor: lightTheme?.preview[0],
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(135deg, transparent 45%, ${lightTheme?.preview[1]} 45%)`,
                        }} />
                        <div style={{
                          position: 'absolute', bottom: '3px', right: '3px',
                          width: '5px', height: '5px', borderRadius: '50%',
                          backgroundColor: lightTheme?.preview[2],
                        }} />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1">
                          <Sun size={9} style={{ color: 'var(--text-secondary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {lang === 'ar' ? 'فاتح' : 'Light'}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
