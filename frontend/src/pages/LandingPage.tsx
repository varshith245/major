import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { t, translateCategory } from '../i18n';
import { CATEGORIES_DATA, POPULAR_SEARCHES, CITIZEN_STORIES } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { IntroBackgroundMotion } from '../components/common/IntroBackgroundMotion';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Scale,
  Globe,
  Tractor,
  HeartPulse,
  Home,
  GraduationCap,
  UserCheck,
  Clock,
  Briefcase,
  Mic,
  MessageSquare,
  Bot,
  User as UserIcon,
  Layers,
  ChevronRight,
  Sparkle,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { language } = useAccessibility();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [introMotionOpen, setIntroMotionOpen] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    Tractor: <Tractor className="w-6 h-6 text-emerald-600" />,
    HeartPulse: <HeartPulse className="w-6 h-6 text-rose-600" />,
    Home: <Home className="w-6 h-6 text-sky-600" />,
    GraduationCap: <GraduationCap className="w-6 h-6 text-indigo-600" />,
    UserCheck: <UserCheck className="w-6 h-6 text-purple-600" />,
    Clock: <Clock className="w-6 h-6 text-amber-600" />,
    Briefcase: <Briefcase className="w-6 h-6 text-blue-600" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-teal-600" />
  };

  return (
    <div className="flex flex-col gap-20 sm:gap-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 bg-gradient-to-b from-slate-50 via-sky-50/30 to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Civic Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-govblue-50 border border-govblue-200 text-govblue-800 text-xs font-bold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-govblue-600" />
                <span>National Welfare AI Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-govblue-400"></span>
                <span className="text-slate-500 font-medium">UX4G Standard</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-heading leading-[1.12] mb-6">
                {t('hero_title_line1', language)}
                <br />
                <span className="text-govblue-800">{t('hero_title_line2', language)}</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8">
                {t('hero_description', language)}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/eligibility')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  {t('hero_cta_find', language)}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/assistant')}
                  leftIcon={<Bot className="w-4 h-4 text-govblue-700" />}
                  className="w-full sm:w-auto"
                >
                  {t('hero_cta_ask', language)}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIntroMotionOpen(true)}
                  leftIcon={<Sparkles className="w-4 h-4 text-govblue-700" />}
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 border-slate-300 shadow-xs"
                >
                  {t('Project Intro Motion', language)}
                </Button>
              </div>

              {/* Key Trust Highlights */}
              <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-govgreen-600" />
                  <span>{t('hero_trust_schemes', language)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-govgreen-600" />
                  <span>{t('hero_trust_trilingual', language)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-govgreen-600" />
                  <span>{t('hero_trust_zero_jargon', language)}</span>
                </div>
              </div>
            </div>

            {/* Right: Civic-Tech Ecosystem Visual with Demonstration Floating Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Central Ecosystem Canvas with Looping Background Motion */}
                <div
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-tr from-govblue-900 via-slate-900 to-govblue-950 rounded-3xl p-6 shadow-2xl border border-slate-700/80 text-white relative overflow-hidden group cursor-pointer hover:border-sky-400 transition-all duration-300"
                  title="Click to Open Registration Form"
                >
                  {/* Looping Silent Background Motion Video */}
                  <video
                    src="/video/video1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-65 brightness-115 contrast-105 group-hover:opacity-85 pointer-events-none transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent pointer-events-none" />

                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 relative z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIntroMotionOpen(true);
                      }}
                      className="flex items-center gap-2 hover:opacity-85 transition cursor-pointer text-left"
                      title="Open Fullscreen Intro Motion"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 hover:text-sky-300">
                        <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                        <span>SEVA Civic Motion</span>
                      </span>
                    </button>
                    <span className="text-[11px] font-bold text-sky-300 group-hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition">
                      <span>{t('Click to Register', language)}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Connected Civic Flow */}
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-govblue-600 text-white flex items-center justify-center font-bold text-xs">
                          01
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Citizen Needs Input</div>
                          <div className="text-[10px] text-slate-400">Occupation, Location, Income</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-sky-400 font-medium">Verified</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-govgreen-600 text-white flex items-center justify-center font-bold text-xs">
                          02
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">AI Eligibility & Matching</div>
                          <div className="text-[10px] text-slate-400">Hybrid Rule & Confidence Score</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold">92% Match</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-saffron-600 text-white flex items-center justify-center font-bold text-xs">
                          03
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Document Checklist & Direct Link</div>
                          <div className="text-[10px] text-slate-400">Step-by-step Official Portal Path</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-amber-300 font-medium">Ready</span>
                    </div>
                  </div>

                  {/* Interactive footer prompt */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                    <span className="text-slate-300 font-medium">{t('hero_demo_badge', language)}</span>
                    <span className="font-bold text-sky-300 flex items-center gap-1 group-hover:underline">
                      {t('Click here to open Register Form →', language)}
                    </span>
                  </div>
                </div>

                {/* Floating Scheme Demo Card 1: PM Kisan */}
                <div className="absolute -top-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 max-w-[220px] transition-transform hover:-translate-y-1 hidden sm:block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Likely Eligible
                    </span>
                    <span className="text-[11px] font-black text-slate-900">₹6,000 / yr</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">PM-KISAN</div>
                  <div className="text-[10px] text-slate-500">Income Support for Farmers</div>
                </div>

                {/* Floating Scheme Demo Card 2: Ayushman Bharat */}
                <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 max-w-[230px] transition-transform hover:-translate-y-1 hidden sm:block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-govblue-800 bg-govblue-50 px-2 py-0.5 rounded-full border border-govblue-200">
                      Health Shield
                    </span>
                    <span className="text-[11px] font-black text-slate-900">₹5 Lakh cover</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">Ayushman Bharat</div>
                  <div className="text-[10px] text-slate-500">Cashless Hospitalization</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / VALUE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 sm:p-8">
          <p className="text-xs font-bold text-center text-slate-400 uppercase tracking-widest mb-6">
            {t('trust_title', language)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center border border-govblue-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{t('trust_pillar_1', language)}</span>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-govgreen-50 text-govgreen-800 flex items-center justify-center border border-govgreen-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{t('trust_pillar_2', language)}</span>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{t('trust_pillar_3', language)}</span>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-100">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{t('trust_pillar_4', language)}</span>
            </div>

            <div className="flex flex-col items-center gap-2.5 col-span-2 sm:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center border border-sky-100">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{t('trust_pillar_5', language)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRIMARY CENTRAL SEARCH EXPERIENCE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-2">
            {t('search_heading', language)}
          </h2>
          <p className="text-sm text-slate-500">
            Search across Central Government and State portals with AI semantic matching.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <div className="flex items-center bg-white rounded-2xl border-2 border-slate-300 focus-within:border-govblue-600 shadow-card p-2 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', language)}
              className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-2"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/assistant')}
                aria-label="Voice input"
                title="Voice input"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              <Button type="submit" variant="primary" size="md">
                {t('search_btn_search', language)}
              </Button>
            </div>
          </div>
        </form>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">{t('search_popular_label', language)}</span>
          {POPULAR_SEARCHES.map(query => (
            <button
              key={query}
              onClick={() => {
                setSearchQuery(query);
                navigate(`/schemes?search=${encodeURIComponent(query)}`);
              }}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-govblue-50 text-slate-700 hover:text-govblue-800 border border-slate-200 transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      </section>

      {/* 4. CATEGORY EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-1">
              {t('categories_title', language)}
            </h2>
            <p className="text-sm text-slate-500">
              {t('categories_subtitle', language)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/schemes')}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {t('nav_explore', language)} (30)
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES_DATA.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/schemes?category=${encodeURIComponent(cat.id)}`)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-govblue-300 p-6 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all duration-200 cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {categoryIcons[cat.iconName] || <Layers className="w-6 h-6 text-slate-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-govblue-800 transition-colors mb-1.5">
                  {translateCategory(cat.title, language)}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <span>{cat.schemeCount} {t('Schemes', language, 'Schemes')}</span>
                <span className="text-govblue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {t('nav_explore', language)} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (6-STEP CIVIC TIMELINE) */}
      <section id="how-it-works" className="bg-slate-100/60 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-2">
              {t('how_title', language)}
            </h2>
            <p className="text-sm text-slate-600">
              {t('how_subtitle', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
            {[
              { num: '01', title: t('step1_title', language), desc: t('step1_desc', language) },
              { num: '02', title: t('step2_title', language), desc: t('step2_desc', language) },
              { num: '03', title: t('step3_title', language), desc: t('step3_desc', language) },
              { num: '04', title: t('step4_title', language), desc: t('step4_desc', language) },
              { num: '05', title: t('step5_title', language), desc: t('step5_desc', language) },
              { num: '06', title: t('step6_title', language), desc: t('step6_desc', language) }
            ].map(step => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-govblue-800 text-white font-extrabold text-sm flex items-center justify-center mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AI ASSISTANT PREVIEW ("Ask. Understand. Act.") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-govblue-900 via-slate-900 to-govblue-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Header */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <span className="text-xs uppercase font-bold tracking-widest text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800/80 mb-3">
                {t('ai_preview_tag', language)}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight mb-4">
                {t('ai_preview_title', language)}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {t('ai_preview_subtitle', language)}
              </p>

              <Button
                variant="accent"
                size="md"
                onClick={() => navigate('/assistant')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('ai_start_btn', language, 'Start with SEVA')}
              </Button>
            </div>

            {/* Right Chat Mockup */}
            <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col gap-4">
              {/* User message */}
              <div className="flex items-start justify-end gap-3">
                <div className="bg-govblue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs sm:text-sm font-medium shadow-sm max-w-xs">
                  "Am I eligible for PM-KISAN? I have 2 acres of land in Karnataka."
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0">
                  <UserIcon className="w-4 h-4 text-slate-300" />
                </div>
              </div>

              {/* Bot response */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-govblue-600 flex items-center justify-center text-xs shrink-0 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none p-4 text-xs leading-relaxed border border-slate-700 flex flex-col gap-3 w-full">
                  <div>
                    <span className="font-bold text-emerald-400">✓ Likely Eligible (Confidence: 94%)</span>
                    <p className="mt-1 text-slate-300">
                      Based on your profile as a landholding cultivator with 2.0 acres in Karnataka:
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700 text-[11px] space-y-1.5">
                    <div>• <strong>Benefit:</strong> ₹6,000 annually in 3 direct bank installments</div>
                    <div>• <strong>Required Documents:</strong> Aadhaar Card, Land Record (Pahani/RTC), Bank Passbook seeded with NPCI DBT</div>
                    <div>• <strong>Excluded If:</strong> Institutional landholder or income tax payer</div>
                  </div>

                  {/* Action Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => navigate('/eligibility')}
                      className="px-2.5 py-1 rounded-lg bg-govblue-800 hover:bg-govblue-700 text-white text-[11px] font-semibold transition-colors"
                    >
                      Check Full Eligibility
                    </button>
                    <button
                      onClick={() => navigate('/documents')}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors"
                    >
                      View Required Documents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ASYMMETRIC FEATURE SHOWCASE */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-2">
            {t('features_main_heading', language)}
          </h2>
          <p className="text-sm text-slate-500">
            {t('features_main_sub', language)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Large Span */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-govblue-50 text-govblue-800 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t('feat_hybrid_title', language)}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {t('feat_hybrid_desc', language)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700">Multi-Factor Analysis:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Rule-Based + ML Scoring
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate('/eligibility')}>
                {t('btn_check_eligibility', language)}
              </Button>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('feat_checklist_title', language)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t('feat_checklist_desc', language)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents')} className="self-start text-govblue-800">
              {t('nav_documents', language)} →
            </Button>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('feat_compare_title', language)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t('feat_compare_desc', language)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/compare')} className="self-start text-govblue-800">
              {t('nav_compare', language)} →
            </Button>
          </div>

          {/* Feature 4: Medium Span */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Native Trilingual Intelligence (EN, HI, KN)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Native Devanagari and Kannada script detection and synthesis. Rural citizens and elderly users can interact comfortably in Kannada or Hindi without English language barriers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="bg-slate-100 px-3 py-1 rounded-lg">English</span>
              <span className="bg-slate-100 px-3 py-1 rounded-lg">ಕನ್ನಡ (Kannada)</span>
              <span className="bg-slate-100 px-3 py-1 rounded-lg">हिन्दी (Hindi)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CITIZEN STORIES / USE CASES */}
      <section className="bg-slate-100/70 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-2">
              {t('stories_title', language)}
            </h2>
            <p className="text-sm text-slate-600">
              {t('stories_subtitle', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CITIZEN_STORIES.map(story => (
              <div
                key={story.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-govblue-800 uppercase tracking-wider mb-1">
                    {story.location}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {story.role}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    "{story.scenario}"
                  </p>

                  <div className="space-y-1 mb-4">
                    <div className="text-[11px] font-bold text-slate-700">Matched Schemes:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {story.schemesMatched.map(s => (
                        <span key={s} className="text-[10px] font-bold bg-govblue-50 text-govblue-800 px-2 py-0.5 rounded border border-govblue-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] font-medium text-emerald-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                  <strong>Impact:</strong> {story.benefitSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-8 text-center">
        <div className="bg-govblue-800 text-white rounded-3xl p-10 sm:p-14 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight mb-4">
              {t('Not sure where to start?', language, 'Not sure where to start?')}
            </h2>
            <p className="text-base text-sky-100 leading-relaxed mb-8">
              {t('hero_description', language)}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/eligibility')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('hero_cta_find', language)}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/assistant')}
                className="text-white border-white hover:bg-white/10"
              >
                {t('hero_cta_ask', language)}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Introduction Soundless Background Motion Screen */}
      <IntroBackgroundMotion
        isOpen={introMotionOpen}
        onClose={() => setIntroMotionOpen(false)}
      />
    </div>
  );
};
