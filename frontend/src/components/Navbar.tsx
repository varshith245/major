import React from 'react';
import { 
  Building2, 
  Bot, 
  Compass, 
  CheckCircle, 
  Scale, 
  FileText, 
  UploadCloud, 
  BarChart3, 
  ShieldCheck,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, language }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'assistant', label: t('nav_tab_assistant', language), icon: <Bot className="w-4 h-4" /> },
    { id: 'explorer', label: t('nav_tab_explorer', language), icon: <Compass className="w-4 h-4" /> },
    { id: 'eligibility', label: t('nav_tab_eligibility', language), icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'compare', label: t('nav_tab_compare', language), icon: <Scale className="w-4 h-4" /> },
    { id: 'checklist', label: t('nav_tab_checklist', language), icon: <FileText className="w-4 h-4" /> },
    { id: 'uploader', label: t('nav_tab_uploader', language), icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'analytics', label: t('nav_tab_analytics', language), icon: <BarChart3 className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: t('nav_tab_admin', language),
      icon: <ShieldCheck className="w-4 h-4 text-saffron-400" />
    });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & National Brand */}
          <div 
            onClick={() => onTabChange('assistant')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight font-heading">
                  {t('nav_title', language).replace('Seva', '')}
                  <span className="text-crimson-600">Seva</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-none mt-0.5">
                {t('nav_subtitle', language)}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-crimson-50 text-crimson-700 border border-crimson-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-crimson-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'bg-crimson-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
