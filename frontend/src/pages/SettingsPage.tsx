import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { t } from '../i18n';
import { Button } from '../components/ui/Button';
import {
  Settings as SettingsIcon,
  Globe,
  Eye,
  Zap,
  Shield,
  Trash2,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    language,
    setLanguage,
    textSize,
    setTextSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion
  } = useAccessibility();
  const { showToast } = useToast();

  const handleClearCache = () => {
    localStorage.removeItem('sevaai_saved_schemes');
    showToast(
      language === 'hi'
        ? 'स्थानीय सहेजे गए सत्र और बुकमार्क साफ़ किए गए।'
        : language === 'kn'
        ? 'ಸ್ಥಳೀಯ ಸಂಗ್ರಹಿಸಿದ ಸೆಷನ್‌ಗಳು ಮತ್ತು ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.'
        : 'Local cached sessions and saved bookmarks cleared.',
      'info'
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-50 border border-govblue-200 text-govblue-800 text-xs font-bold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>{t('System Preferences', language)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          {t('Platform Settings', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('Customize language, accessibility scaling, contrast modes, and privacy settings.', language)}
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Language Preference */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe className="w-4 h-4 text-govblue-800" />
            <span>{t('Language Selection', language)}</span>
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('Choose your preferred interface language. The assistant and navigation will automatically adapt.', language)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English', sub: 'Standard National' },
              { id: 'hi', label: 'हिन्दी (Hindi)', sub: 'देवनागरी लिपि' },
              { id: 'kn', label: 'ಕನ್ನಡ (Kannada)', sub: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ' },
            ].map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setLanguage(l.id as any);
                  showToast(
                    l.id === 'hi'
                      ? 'भाषा हिन्दी में बदल दी गई है'
                      : l.id === 'kn'
                      ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ'
                      : `Language switched to ${l.label}`,
                    'success'
                  );
                }}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  language === l.id
                    ? 'bg-govblue-50 border-govblue-600 text-govblue-900 ring-1 ring-govblue-600'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">{l.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{l.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Accessibility Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Eye className="w-4 h-4 text-govgreen-600" />
            <span>{t('Accessibility & Visual Ergonomics', language)}</span>
          </h2>

          {/* Text Sizing */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              {t('Text Zoom Scaling (Up to 200% reading comfort)', language)}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', label: 'Compact (14px)' },
                { id: 'md', label: 'Standard (16px)' },
                { id: 'lg', label: 'Large (18px)' },
                { id: 'xl', label: 'Senior (20px)' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setTextSize(s.id as any)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                    textSize === s.id
                      ? 'bg-govblue-50 border-govblue-600 text-govblue-900 ring-1 ring-govblue-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">{t('High Contrast Mode', language)}</div>
              <div className="text-[11px] text-slate-500">{t('Enhanced contrast for low-vision and outdoor sunlight viewing', language)}</div>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                highContrast ? 'bg-yellow-400 text-black font-black' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {highContrast ? t('Active', language) : t('Disabled', language)}
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">{t('Reduced Motion Preference', language)}</div>
              <div className="text-[11px] text-slate-500">{t('Eliminates transition animations for vestibular motion sensitivity', language)}</div>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                reducedMotion ? 'bg-govblue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {reducedMotion ? t('Active', language) : t('Disabled', language)}
            </button>
          </div>
        </div>

        {/* 3. Account & Local Data */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>{t('Account Security & Local Cache', language)}</span>
          </h2>

          <div className="text-xs text-slate-600 space-y-2">
            <div>{t('Signed in account:', language)} <strong className="text-slate-900">{user?.email || 'Guest Citizen'}</strong></div>
            <div>{t('Security token:', language)} <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">JWT 256-bit encrypted</span></div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              leftIcon={<Trash2 className="w-4 h-4 text-slate-400" />}
            >
              {t('Clear Local Cache & History', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
