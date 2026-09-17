import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, Search, CheckCircle, User } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { t } from '../../i18n';

export const MobileBottomNav: React.FC = () => {
  const { language } = useAccessibility();

  const navItems = [
    { to: '/', label: t('nav_home', language), icon: <Home className="w-5 h-5" /> },
    { to: '/assistant', label: t('nav_assistant', language), icon: <Sparkles className="w-5 h-5" /> },
    { to: '/schemes', label: t('nav_explore', language), icon: <Search className="w-5 h-5" /> },
    { to: '/eligibility', label: t('nav_eligibility', language), icon: <CheckCircle className="w-5 h-5" /> },
    { to: '/profile', label: t('nav_profile', language), icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg transition-colors"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-govblue-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <div className="mb-0.5">{item.icon}</div>
            <span className="truncate max-w-[60px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
