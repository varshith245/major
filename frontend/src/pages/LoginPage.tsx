import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { getLoginVideo } from '../config/backgroundVideos';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useAccessibility();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isJustRegistered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email') || '';
  const loginVideo = getLoginVideo();

  // Password state
  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle auto-prefill from registration or already authenticated redirect
  useEffect(() => {
    if (isJustRegistered && registeredEmail) {
      setEmail(registeredEmail);
    }
    const current = authService.getCurrentUser();
    if (current) {
      if (current.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isJustRegistered, registeredEmail, navigate]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const loggedInUser = await login(email.trim(), password);
      showToast('Signed in successfully.', 'success');
      if (loggedInUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast('Please contact your nodal administrative officer to reset credentials.', 'info');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background Motion Video (video2.mp4 - Muted, Soundless, Looped, Bright & Clear) */}
      <video
        src={loginVideo.src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 brightness-125 contrast-105"
      />
      {/* Light Translucent Overlay for Enhanced Video Brightness */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

      {/* Floating Frosted Glass Authentication Card */}
      <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 flex flex-col justify-center text-slate-900">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-govblue-800 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6 text-sky-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Welcome to SEVA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access citizen welfare schemes and live applications
          </p>
        </div>

        {/* Step 3 Banner for Newly Registered Citizens */}
        {isJustRegistered && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-black text-emerald-900 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Step 3 of 3: {t('btn_sign_in')}</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Account created successfully for <strong>{registeredEmail}</strong>! Please sign in below to enter your citizen dashboard.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Password Login Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('reg_lbl_email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="citizen@egovseva.gov.in"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition bg-white/80"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {t('reg_lbl_password')}
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-govblue-800 font-semibold hover:underline"
              >
                {t('login_forgot_pass')}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition bg-white/80"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-govblue-800 focus:ring-govblue-600"
              />
              <span>{t('login_remember_me')}</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('btn_sign_in')}
          </Button>
        </form>

        {/* Link to Register */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {t('login_no_account')}{' '}
          <Link to="/register" className="text-govblue-800 font-bold hover:underline">
            {t('login_register_now')}
          </Link>
        </div>
      </div>
    </div>
  );
};
