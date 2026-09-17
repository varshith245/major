import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { t } from '../../i18n';
import { Button } from '../ui/Button';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  UserPlus,
  LogIn
} from 'lucide-react';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({ isOpen, onClose }) => {
  const { language } = useAccessibility();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Manage body scroll & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Auto-attempt playback when modal opens
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay with audio was blocked by browser policy; user can tap play
        setIsPlaying(false);
      });
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (dontShowAgain) {
      localStorage.setItem('sevaai_intro_seen', 'true');
    }
    // Always mark as seen in this session so it won't pop up repeatedly
    sessionStorage.setItem('sevaai_intro_session_dismissed', 'true');
    onClose();
  };

  const handleProceedToRegister = () => {
    handleClose();
    localStorage.setItem('sevaai_intro_seen', 'true');
    navigate('/register');
  };

  const handleProceedToLogin = () => {
    handleClose();
    localStorage.setItem('sevaai_intro_seen', 'true');
    navigate('/login');
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Project Introduction Video"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-govblue-600 text-white flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-heading">
                  {t('Project Introduction', language)}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SEVA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t('Watch this brief overview of how SEVA helps citizens discover, verify, and apply for government schemes.', language)}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close introduction video"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative bg-black flex items-center justify-center aspect-video w-full overflow-hidden group">
          <video
            ref={videoRef}
            src="/video/video1.mp4"
            controls
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Bottom Actions and Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Don't show again toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-govblue-600 focus:ring-0 cursor-pointer"
            />
            <span>{t("Don't show this intro automatically again", language)}</span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {t('Skip / Explore Platform', language)}
            </button>

            <button
              onClick={handleProceedToLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('nav_login', language)}</span>
            </button>

            <button
              onClick={handleProceedToRegister}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-govblue-600 to-sky-600 hover:from-govblue-500 hover:to-sky-500 shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('Proceed to Register', language)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
