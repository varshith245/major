import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Wheat, 
  HeartPulse, 
  Home, 
  GraduationCap, 
  Users2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { t } from '../i18n';

interface HeroSectionProps {
  onSearchSubmit: (query: string) => void;
  onCategoryClick: (category: string) => void;
  onTabChange: (tab: string) => void;
  language: string;
  totalSchemes: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchSubmit,
  onCategoryClick,
  onTabChange,
  language,
  totalSchemes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const categories = [
    { name: 'Agriculture', label: t('cat_agriculture', language), icon: <Wheat className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Healthcare', label: t('cat_healthcare', language), icon: <HeartPulse className="w-5 h-5" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Housing', label: t('cat_housing', language), icon: <Home className="w-5 h-5" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Education', label: t('cat_education', language), icon: <GraduationCap className="w-5 h-5" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Women Welfare', label: t('cat_women', language), icon: <Users2 className="w-5 h-5" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported on this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      onSearchSubmit(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-crimson-50/60 via-white to-slate-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight font-heading">
          {t('hero_title_prefix', language)}{' '}
          <span className="text-crimson-600 block sm:inline">
            {t('hero_title_highlight', language)}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {t('hero_description', language)}
        </p>

        {/* High-Contrast Search & Voice Bar */}
        <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto relative flex items-center">
          <div className="relative w-full flex items-center bg-white rounded-2xl shadow-lg border-2 border-slate-200 focus-within:border-crimson-600 focus-within:ring-4 focus-within:ring-crimson-100 transition-all p-1.5">
            <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hero_search_placeholder', language)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400 font-medium"
            />
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search (Speak in English, Kannada or Hindi)"
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isListening 
                  ? 'bg-crimson-600 text-white animate-pulse' 
                  : 'bg-slate-100 hover:bg-crimson-50 text-slate-600 hover:text-crimson-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary ml-1.5 py-2.5 px-4 sm:px-5 text-xs font-bold flex-shrink-0"
            >
              <span>{t('hero_btn_search', language)}</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>
        </form>

        {/* Direct Action Hub */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onTabChange('eligibility')}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('hero_btn_check_eligibility', language)}</span>
          </button>
          <button
            onClick={() => onTabChange('compare')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <span>{t('nav_tab_compare', language)}</span>
          </button>
        </div>

        {/* Welfare Sector Category Cards */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(cat.name)}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between hover:scale-105 shadow-2xs cursor-pointer ${cat.color}`}
            >
              <div className="mb-2">{cat.icon}</div>
              <span className="font-bold text-xs tracking-tight">{cat.label}</span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
