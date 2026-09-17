import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n';
import { getIntroVideo } from '../../config/backgroundVideos';
import {
  Shield,
  LogIn,
  LogOut,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

interface IntroBackgroundMotionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroBackgroundMotion: React.FC<IntroBackgroundMotionProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useAccessibility();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const introVideo = getIntroVideo();

  const handlePrimaryCta = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/register');
    } else if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // Prevent background scroll and support keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'Enter' || e.key === ' ') {
        handlePrimaryCta();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Auto-attempt playback of the silent background motion
    const vid = videoRef.current;
    if (vid) {
      vid.defaultMuted = true;
      vid.muted = true;
      const tryPlay = () => {
        vid.play().catch(() => { });
      };
      if (vid.readyState >= 2) {
        tryPlay();
      } else {
        vid.addEventListener('canplay', tryPlay, { once: true });
      }
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isAuthenticated, isAdmin]);

  if (!isOpen) return null;

  const handleOpenLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate('/login');
  };

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onClose();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Click anywhere to continue"
      onClick={handlePrimaryCta}
      className="fixed inset-0 z-50 overflow-hidden select-none cursor-pointer group bg-slate-950 flex flex-col justify-between"
    >
      {/* Background Motion Video (Muted, Looping, Soundless, Vivid & Bright) */}
      <video
        ref={videoRef}
        src={introVideo.src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 brightness-125 contrast-105 group-hover:scale-105 transition-all duration-1000 ease-out"
      />

      {/* Gentle & Light Translucent Gradient Overlay for Maximum Video Brightness & Visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-black/10 to-slate-950/35 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/15 pointer-events-none" />

      {/* Top Bar: Brand & Session Controls */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-govblue-700 to-sky-500 text-white flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight font-heading">
                SEVA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              {t('brand_portal_sub', language)}
            </p>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">
                  {user?.full_name || (isAdmin ? 'Portal Administrator' : 'Citizen')}
                </span>
                <span className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                  {isAdmin ? 'System Administrator' : 'Citizen Profile'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrimaryCta();
                }}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-govblue-700 hover:bg-govblue-600 border border-sky-400/40 backdrop-blur-md transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-300" />
                <span>{isAdmin ? 'Admin Console' : 'Dashboard'}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenLogin}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition flex items-center gap-2 shadow-sm cursor-pointer"
              title="Already have an account? Sign In"
            >
              <LogIn className="w-4 h-4 text-sky-300" />
              <span>{t('nav_login', language)}</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Hero: Headline, Description & Trust Markers */}
      <main className="relative z-10 px-4 sm:px-8 py-8 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-heading tracking-tight leading-tight mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
          <span>{t('hero_title_line1', language)} </span>
          <span className="text-sky-300 drop-shadow-[0_2px_10px_rgba(56,189,248,0.5)]">{t('hero_title_line2', language)}</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-white max-w-2xl mx-auto mb-8 font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
          {t('hero_description', language)}
        </p>

        {/* Highlighted Trust Markers */}
        <div className="hidden sm:flex items-center justify-center gap-6 text-xs text-slate-300 mb-8">
          <div className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('hero_trust_schemes', language)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('hero_trust_trilingual', language)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('hero_trust_zero_jargon', language)}</span>
          </div>
        </div>

        {/* Role-Aware Primary CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrimaryCta();
          }}
          className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base shadow-[0_10px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_45px_rgba(56,189,248,0.35)] hover:scale-105 active:scale-98 transition-all duration-300 border border-white/40 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
          <span className="font-extrabold tracking-tight">
            {!isAuthenticated
              ? t('Register & Get Started', language)
              : isAdmin
                ? 'Open Admin Dashboard'
                : 'Enter Citizen Dashboard'}
          </span>
          <ArrowRight className="w-5 h-5 text-govblue-800 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </main>

      {/* Subtle Footer Prompt */}
      <footer className="relative z-10 p-4 text-center text-xs text-slate-400/80 pointer-events-none">
        <p>© {new Date().getFullYear()} SEVA • Government Scheme Discovery & Eligibility Assistant</p>
      </footer>
    </div>
  );
};
