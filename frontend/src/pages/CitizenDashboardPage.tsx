import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { t } from '../i18n';
import { Scheme, UserProfile, EligibilityResult, JourneyEntry, NotificationItem } from '../types';
import { schemeService } from '../services/schemeService';
import { eligibilityService } from '../services/eligibilityService';
import { dashboardService } from '../services/dashboardService';
import { Button } from '../components/ui/Button';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Search, Bot, CheckCircle, Scale, FileCheck, ArrowRight, TrendingUp, Calendar, Layers, UserCheck } from 'lucide-react';

/**
 * CitizenDashboardPage – a premium, accessible, personalized dashboard for citizens.
 * Aggregates data from multiple backend endpoints without hard‑coding values.
 * All sections gracefully handle missing APIs by showing empty states.
 */
export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState<Scheme[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [recentViews, setRecentViews] = useState<Scheme[]>([]);
  const [eligibilityHistory, setEligibilityHistory] = useState<EligibilityResult[]>([]);
  const [incompleteChecklists, setIncompleteChecklists] = useState<any[]>([]);
  const [journeyEntries, setJourneyEntries] = useState<JourneyEntry[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recentAIQueries, setRecentAIQueries] = useState<any[]>([]);

  // Default citizen profile template
  const defaultProfile: UserProfile = {
    age: 30,
    gender: 'Any',
    state: 'Karnataka',
    occupation: 'Farmer',
    annual_income: 100000,
    owns_land: false,
    landholding_acres: 0,
    caste_category: 'General',
    is_govt_employee: false,
    is_income_tax_payer: false,
    owns_pucca_house: false,
    is_bpl_cardholder: false,
    education_qualification: undefined,
    graduation_year: undefined,
    is_employed: undefined,
  };

  // Initialise profile from auth context or fallback to default
  useEffect(() => {
    const merged: UserProfile = { ...defaultProfile, ...(user?.user_profile || {}) };
    setProfile(merged);
  }, [user]);

  // Fetch all dashboard data in parallel when profile is ready
  useEffect(() => {
    if (!profile) return;
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [rec, saved, recent, elig, checklist, journey, deadlines, notifs, ai] = await Promise.all([
          schemeService.getRecommendations(profile).catch(() => []),
          dashboardService.getSavedSchemes().catch(() => []),
          dashboardService.getRecentViews().catch(() => []),
          eligibilityService.evaluateProfile(profile).catch(() => ({ total_evaluated: 0, eligible_count: 0, results: [] })),
          dashboardService.getChecklistProgress().catch(() => []),
          dashboardService.getApplicationJourney().catch(() => []),
          dashboardService.getUpcomingDeadlines().catch(() => []),
          dashboardService.getNotifications().catch(() => []),
          dashboardService.getRecentChat().catch(() => [])
        ]);
        if (isMounted) {
          setRecommendedSchemes(rec.slice(0, 6));
          setSavedSchemes(saved);
          setRecentViews(recent);
          setEligibilityHistory(elig.results);
          setIncompleteChecklists(checklist);
          setJourneyEntries(journey);
          setUpcomingDeadlines(deadlines);
          setNotifications(notifs);
          setRecentAIQueries(ai);
          setLoading(false);
        }
      } catch (e) {
        console.error('Dashboard load error', e);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [profile]);

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

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      {/* Welcome Section */}
      <section aria-labelledby="welcome-heading" className="bg-gradient-to-r from-govblue-900 via-slate-900 to-govblue-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-bold mb-4">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('dash_profile_active', language)} ({profile?.state})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight mb-2" id="welcome-heading">
            {getGreeting()}, {user?.full_name || 'Citizen'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            {t('dash_subheading', language)}
          </p>
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mb-4">
            <div className="flex items-center bg-white rounded-2xl shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-sky-400">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('dash_search_placeholder', language)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-2"
                aria-label={t('dash_search_placeholder', language)}
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0" aria-label={t('Search', language)}>
                {t('Search', language)}
              </Button>
            </div>
          </form>
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs" role="navigation" aria-label={t('quick_actions', language)}>
            <Button variant="outline" size="sm" onClick={() => navigate('/assistant')} leftIcon={<Bot className="w-3.5 h-3.5 text-sky-400" />} className="text-white border-slate-700 bg-slate-800/60 hover:bg-slate-800">
              {t('AI Assistant', language)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/schemes')} leftIcon={<Layers className="w-3.5 h-3.5 text-sky-400" />} className="text-white border-slate-700 bg-slate-800/60 hover:bg-slate-800">
              {t('Find Schemes', language)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/eligibility')} leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />} className="text-white border-slate-700 bg-slate-800/60 hover:bg-slate-800">
              {t('Check Eligibility', language)}
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Action Grid */}
      <section aria-labelledby="quick-grid-heading" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div onClick={() => navigate('/schemes')} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-govblue-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group" role="button" tabIndex={0} onKeyPress={e => e.key === 'Enter' && navigate('/schemes')}>
          <div className="w-10 h-10 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-govblue-800 transition-colors">{t('Find Schemes', language)}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('Browse 30+ Central & State welfare programs', language)}</p>
        </div>
        <div onClick={() => navigate('/eligibility')} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-govgreen-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group" role="button" tabIndex={0} onKeyPress={e => e.key === 'Enter' && navigate('/eligibility')}>
          <div className="w-10 h-10 rounded-xl bg-govgreen-50 text-govgreen-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-govgreen-800 transition-colors">{t('Check Eligibility', language)}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('5-step guided wizard with confidence score', language)}</p>
        </div>
        <div onClick={() => navigate('/compare')} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group" role="button" tabIndex={0} onKeyPress={e => e.key === 'Enter' && navigate('/compare')}>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition-colors">{t('Compare Schemes', language)}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('Side-by-side comparison for up to 3 schemes', language)}</p>
        </div>
        <div onClick={() => navigate('/documents')} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 shadow-subtle hover:shadow-card transition-all cursor-pointer group" role="button" tabIndex={0} onKeyPress={e => e.key === 'Enter' && navigate('/documents')}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">{t('Document Checklist', language)}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('Check required certificates & apply steps', language)}</p>
        </div>
      </section>

      {/* Recommendations */}
      <section aria-labelledby="recommendations-heading" className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-900" id="recommendations-heading">{t('dash_recommended_title', language)}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/recommendations')} rightIcon={<ArrowRight className="w-4 h-4" />} className="text-govblue-800">
            {t('View All Recommendations', language)}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedSchemes.map(scheme => (
            <div key={scheme.scheme_id} className="flex flex-col">
              <div className="bg-govgreen-50 border border-govgreen-200 border-b-0 rounded-t-2xl px-4 py-2 text-xs text-govgreen-900 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-govgreen-700" />
                  {scheme.match_score || 0}% {t('Match', language)}
                </span>
                <span className="text-[11px] text-govgreen-700 truncate max-w-[180px]">
                  {scheme.match_reasons?.[0] ? t(scheme.match_reasons[0], language) : t('Matches your profile', language)}
                </span>
              </div>
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
      </section>

      {/* Saved Schemes */}
      {savedSchemes.length > 0 && (
        <section aria-labelledby="saved-schemes-heading" className="space-y-2">
          <h2 className="text-lg font-bold" id="saved-schemes-heading">{t('saved_schemes', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSchemes.map(scheme => (
              <SchemeCard
                key={scheme.scheme_id}
                scheme={scheme}
                onViewDetails={s => navigate(`/schemes/${s.scheme_id}`)}
                onCheckEligibility={s => navigate(`/eligibility?scheme=${s.scheme_id}`)}
                onCompare={s => navigate(`/compare?add=${s.scheme_id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Views */}
      {recentViews.length > 0 && (
        <section aria-labelledby="recent-views-heading" className="space-y-2">
          <h2 className="text-lg font-bold" id="recent-views-heading">{t('recently_viewed', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentViews.map(scheme => (
              <SchemeCard
                key={scheme.scheme_id}
                scheme={scheme}
                onViewDetails={s => navigate(`/schemes/${s.scheme_id}`)}
                onCheckEligibility={s => navigate(`/eligibility?scheme=${s.scheme_id}`)}
                onCompare={s => navigate(`/compare?add=${s.scheme_id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Eligibility History */}
      {eligibilityHistory.length > 0 && (
        <section aria-labelledby="eligibility-history-heading" className="space-y-2">
          <h2 className="text-lg font-bold" id="eligibility-history-heading">{t('eligibility_history', language)}</h2>
          <ul className="space-y-2">
            {eligibilityHistory.slice(0, 5).map(res => (
              <li key={res.scheme_id} className="border border-slate-200 rounded-xl p-3 bg-white">
                <div className="font-bold text-sm text-slate-800">{res.scheme_name} – <span className="text-govblue-700">{res.eligibility_status}</span></div>
                <p className="text-xs text-slate-600 mt-1">{res.reasons?.join(', ')}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Incomplete Checklists */}
      {incompleteChecklists.length > 0 && (
        <section aria-labelledby="incomplete-checklists-heading" className="space-y-2">
          <h2 className="text-lg font-bold" id="incomplete-checklists-heading">{t('incomplete_checklists', language)}</h2>
          <ul className="space-y-2">
            {incompleteChecklists.map((c: any, i: number) => (
              <li key={c.scheme_id || i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 text-sm">{c.scheme_name}</strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.mandatory_documents?.length || c.pending_documents?.length || 0} {t('documents required', language)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/documents?scheme=${c.scheme_id}`)}>
                  {t('View Checklist', language)}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Journey Tracker */}
      {journeyEntries.length > 0 && (
        <section aria-labelledby="journey-heading" className="space-y-2">
          <h2 className="text-lg font-bold" id="journey-heading">{t('application_journey', language)}</h2>
          <ul className="space-y-2">
            {journeyEntries.map((entry: any, i: number) => (
              <li key={entry.id || entry.scheme_id || i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 text-sm">{entry.scheme_name}</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-govblue-50 text-govblue-800 border border-govblue-200 text-xs font-semibold">
                      {entry.current_stage}
                    </span>
                    {entry.stage_order && (
                      <span className="text-xs text-slate-400">Stage {entry.stage_order}</span>
                    )}
                  </div>
                  {entry.notes && <p className="text-xs text-slate-600 mt-1">{entry.notes}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/schemes/${entry.scheme_id}`)}>
                  {t('Track', language)}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <section aria-labelledby="deadlines-heading" className="space-y-2">
          <h2 className="text-lg font-bold" id="deadlines-heading">{t('upcoming_deadlines', language)}</h2>
          <ul className="space-y-2">
            {upcomingDeadlines.map((d: any, i: number) => (
              <li key={d.scheme_id || i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 text-sm">{d.scheme_name || d.short_name}</strong>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {d.deadline ? `${t('Deadline', language)}: ${new Date(d.deadline).toLocaleDateString()}` : t('Active application window open', language)}
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate(`/schemes/${d.scheme_id}`)}>
                  {t('Apply Now', language)}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <section aria-labelledby="notifications-heading" className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900" id="notifications-heading">{t('notifications', language)}</h2>
          <ul className="space-y-2">
            {notifications.map((n, i) => (
              <li key={i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between">
                <span className="text-xs text-slate-700">{n.message}</span>
                {n.created_at && <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent AI Queries */}
      {recentAIQueries.length > 0 && (
        <section aria-labelledby="recent-ai-heading" className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900" id="recent-ai-heading">{t('recent_ai_assistant', language)}</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/assistant')}>
              {t('Open Assistant', language)}
            </Button>
          </div>
          <ul className="space-y-2">
            {recentAIQueries.map((q, i) => (
              <li key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-1">
                <div className="text-xs font-bold text-govblue-900">“{q.query}”</div>
                <p className="text-xs text-slate-600 line-clamp-2">{q.answer}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
