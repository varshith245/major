import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { t } from '../../i18n';
import { Eye, Zap, Globe } from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const {
    language,
    setLanguage,
    textSize,
    increaseTextSize,
    decreaseTextSize,
    setTextSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion
  } = useAccessibility();

  return (
    <aside
      aria-label="Accessibility controls"
      className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Skip to Content */}
        <div className="flex items-center gap-4">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:bg-govblue-600 focus:text-white focus:px-3 focus:py-1 focus:rounded-md focus:outline-none"
          >
            {t('a11y_skip_to_content', language)}
          </a>
        </div>

        {/* Accessibility Tools Controls */}
        <div className="flex items-center gap-4">
          {/* Text Size Controls */}
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={decreaseTextSize}
              aria-label="Decrease text size"
              title="Decrease text size"
              className={`px-2 py-0.5 rounded text-[11px] font-bold hover:bg-slate-700 transition-colors ${
                textSize === 'sm' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('md')}
              aria-label="Reset text size to standard"
              title="Standard text size"
              className={`px-2 py-0.5 rounded text-[11px] font-bold hover:bg-slate-700 transition-colors ${
                textSize === 'md' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              A
            </button>
            <button
              onClick={increaseTextSize}
              aria-label="Increase text size"
              title="Increase text size"
              className={`px-2 py-0.5 rounded text-[11px] font-bold hover:bg-slate-700 transition-colors ${
                textSize === 'lg' || textSize === 'xl' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            aria-label={highContrast ? t('a11y_standard_contrast', language) : t('a11y_high_contrast', language)}
            title="Toggle high contrast"
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              highContrast ? 'bg-yellow-400 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{highContrast ? 'Standard' : 'Contrast'}</span>
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={toggleReducedMotion}
            aria-label="Toggle reduced motion preference"
            title="Toggle reduced motion"
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              reducedMotion ? 'bg-govblue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Motion</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-md px-2 py-0.5 border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              aria-label="Select preferred language"
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
              <option value="kn" className="bg-slate-900 text-white">ಕನ್ನಡ</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};
