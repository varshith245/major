import React from 'react';
import { Phone, Globe, Eye, ShieldCheck, User as UserIcon, LogOut, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

interface TopBarProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentLanguage,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
}) => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();

  return (
    <div className={`w-full text-xs border-b transition-colors ${
      highContrast 
        ? 'bg-black text-yellow-300 border-yellow-400 font-bold' 
        : 'bg-slate-900 text-slate-300 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: National Portal Identifiers */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-crimson-500" />
            <span className="hidden sm:inline">{t('topbar_gov_portals', currentLanguage)}</span>
            <span className="sm:hidden">Govt of India</span>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Phone className="w-3 h-3 text-saffron-500" />
            {t('topbar_helpline', currentLanguage)} <strong className="text-white">1800-11-0001</strong> / <strong>1902</strong>
          </span>
        </div>

        {/* Right Side: Auth, Accessibility & Language Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1">
              <span className={`badge text-[9px] font-extrabold px-1.5 py-0.5 ${
                isAdmin ? 'badge-crimson' : 'badge-green'
              }`}>
                {isAdmin ? t('auth_role_admin', currentLanguage) : t('auth_role_citizen', currentLanguage)}
              </span>
              <span className="text-white font-semibold text-xs hidden sm:inline line-clamp-1 max-w-[130px]">
                {user.full_name.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                title="Logout of eGovSeva"
                className="flex items-center gap-1 text-slate-300 hover:text-white bg-crimson-800/60 hover:bg-crimson-700 border border-crimson-600/40 rounded px-2 py-0.5 transition ml-1 text-[11px] font-bold cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-crimson-300" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-slate-800 border border-slate-700 text-slate-300 font-medium">
              <Key className="w-3 h-3 text-crimson-400" />
              <span>{t('auth_gate_secure_badge', currentLanguage)}</span>
            </div>
          )}

          {/* High Contrast Accessibility Toggle */}
          <button
            onClick={onToggleHighContrast}
            title="Toggle High Contrast Mode"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Eye className="w-3 h-3 text-crimson-400" />
            <span className="hidden lg:inline">
              {highContrast ? t('topbar_standard_mode', currentLanguage) : t('topbar_high_contrast', currentLanguage)}
            </span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-0.5">
            <Globe className="w-3 h-3 text-saffron-400" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="kn" className="bg-slate-900 text-white">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
