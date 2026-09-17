import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { t } from '../i18n';
import { Scheme, UserProfile } from '../types';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { Button } from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import {
  Search,
  Sparkles,
  Bot,
  CheckCircle,
  Scale,
  FileCheck,
  Bookmark,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Calendar,
  Layers
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedSchemes, setRecommendedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Default citizen profile if not set
  const defaultProfile: UserProfile = {
    age: 34,
    gender: 'Female',
    state: 'Karnataka',
    occupation: 'Farmer',
    annual_income: 120000,
    owns_land: true,
    landholding_acres: 2.5,
    caste_category: 'General',
    is_govt_employee: false,
    is_income_tax_payer: false,
    owns_pucca_house: false,
    is_bpl_cardholder: true
  };

  const profile: UserProfile = {
    ...defaultProfile,
    ...(user?.user_profile || {})
  };

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const recs = await schemeService.getRecommendations(profile);
        if (isMounted) setRecommendedSchemes(recs.slice(0, 6));
      } catch {
        if (isMounted) {
          const recs = schemeService.calculateRecommendations(profile);
          setRecommendedSchemes(recs.slice(0, 6));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash_greeting_morning', language);
    if (hour < 17) return t('dash_greeting_afternoon', language);
    return t('dash_greeting_evening', language);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      {/* 1. Dashboard Personalized Welcome Header */}
      <div className="bg-gradient-to-r from-govblue-900 via-slate-900 to-govblue-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-bold mb-4">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('dash_profile_active', language)} ({profile.state})</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight mb-2">
            {getGreeting()}, {user?.full_name || 'Citizen'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            {t('dash_subheading', language)}
          </p>

          {/* Primary AI Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mb-4">
            <div className="flex items-center bg-white rounded-2xl shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-sky-400">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('dash_search_placeholder', language)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-2"
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0">
                {t('Search', language)}
              </Button>
            </div>
          </form>

          {/* Action Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/assistant')}
              leftIcon={<Bot className="w-3.5 h-3.5 text-sky-400" />}
              className="text-white border-slate-700 bg-slate-800/60 hover:bg-slate-800"
            >
              {t('AI Assistant', language)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/schemes')}
              leftIcon={<Layers className="w-3.5 h-3.5 text-sky-400" />}
              className="text-white border-slate-700 bg-slate-800/60 hover:bg-slate-800"
            >
              {t('Find Schemes', language)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/eligibility')}
              leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-white border-slate-700 bg-slate-800/60 hover:bg-slate-800"
            >
              {t('Check Eligibility', language)}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Grid Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-govblue-800" />
          <span>{t('Quick Public Service Actions', language)}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/schemes')}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-govblue-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-govblue-800 transition-colors">
              {t('Find Schemes', language)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('Browse 30+ Central & State welfare programs', language)}
            </p>
          </div>

          <div
            onClick={() => navigate('/eligibility')}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-govgreen-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-govgreen-50 text-govgreen-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-govgreen-800 transition-colors">
              {t('Check Eligibility', language)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('5-step guided wizard with confidence score', language)}
            </p>
          </div>

          <div
            onClick={() => navigate('/compare')}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition-colors">
              {t('Compare Schemes', language)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('Side-by-side comparison for up to 3 schemes', language)}
            </p>
          </div>

          <div
            onClick={() => navigate('/documents')}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              {t('Document Checklist', language)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('Check required certificates & apply steps', language)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recommended for You Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              {t('dash_recommended_title', language)}
            </h2>
            <p className="text-xs text-slate-500">
              {t('Personalized based on:', language)} {profile.occupation} • {profile.state} • {profile.age} {t('card_years', language)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recommendations')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="text-govblue-800"
          >
            {t('View All Recommendations', language)}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedSchemes.map(scheme => (
            <div key={scheme.scheme_id} className="flex flex-col">
              {/* Recommendation Rationale Callout */}
              <div className="bg-govgreen-50 border border-govgreen-200 border-b-0 rounded-t-2xl px-4 py-2 text-xs text-govgreen-900 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-govgreen-700" />
                  {scheme.match_score}% {t('Match', language)}
                </span>
                <span className="text-[11px] text-govgreen-700 truncate max-w-[180px]">
                  {scheme.match_reasons?.[0] ? t(scheme.match_reasons[0], language) : t('Matches your profile', language)}
                </span>
              </div>

              {/* Scheme Card */}
              <div className="rounded-t-none">
                <SchemeCard
                  scheme={scheme}
                  onViewDetails={s => navigate(`/schemes/${s.scheme_id}`)}
                  onCheckEligibility={s => navigate(`/eligibility?scheme=${s.scheme_id}`)}
                  onCompare={s => navigate(`/compare?add=${s.scheme_id}`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
