import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { getRegisterVideo } from '../config/backgroundVideos';
import {
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Clock
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { sendOtp, verifyOtp, registerWithOtp } = useAuth();
  const { t, language, setLanguage } = useAccessibility();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const registerVideo = getRegisterVideo();

  // Step state: 1 = Register with OTP, 2 = Set Password
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState('Karnataka');
  const [preferredLang, setPreferredLang] = useState('en');

  // Step 1 OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Step 2 Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Error & Status messages
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) || /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = getPasswordStrength(password);

  // STEP 1 HANDLERS: SEND OTP & VERIFY OTP
  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    if (!fullName.trim()) {
      setError('Please enter your full name first.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address to receive your verification OTP.');
      return;
    }

    setError('');
    setStatusMsg('');
    setOtpSending(true);

    try {
      const res = await sendOtp(cleanEmail, 'register');
      setOtpSent(true);
      setCooldown(30);
      setStatusMsg(res.message || `A 6-digit verification code was sent to ${cleanEmail}. Check your inbox or spam.`);
      showToast('6-digit OTP dispatched to your email!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP. Please check email configuration.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setStatusMsg('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      setOtpVerifying(true);
      const res = await verifyOtp(email.trim(), otpCode.trim(), 'register');
      if (res.verified) {
        setIsEmailVerified(true);
        setVerificationToken(res.verification_token || null);
        showToast('OTP verified successfully! Now set your account password.', 'success');
        setCurrentStep(2);
      } else {
        setError(res.message || 'Invalid OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // STEP 2 HANDLER: SET PASSWORD & COMPLETE REGISTRATION
  const handleSetPasswordAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmittingPassword(true);
      await registerWithOtp({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        otp_code: otpCode.trim(),
        verification_token: verificationToken || undefined,
        phone_number: phoneNumber.trim() || undefined,
        role: 'user',
        state,
        preferred_language: preferredLang
      });

      setLanguage(preferredLang as any);
      showToast('Registration complete & password set! Redirecting to Sign In...', 'success');
      navigate(`/login?registered=true&email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration and set password. Please try again.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background Motion Video (video3.mp4 - Muted, Soundless, Looped, Bright & Clear) */}
      <video
        src={registerVideo.src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 brightness-125 contrast-105"
      />
      {/* Light Translucent Overlay for Enhanced Video Brightness */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

      {/* Floating Frosted Glass Registration Card */}
      <div className="relative z-10 max-w-lg w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 flex flex-col justify-center text-slate-900">
        {/* Brand Shield Icon */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-govblue-800 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6 text-sky-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            {currentStep === 1 ? 'Step 1: Register with OTP' : 'Step 2: Set Account Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentStep === 1
              ? 'Fill in your details and verify your email via 6-digit OTP.'
              : 'Create a secure password to protect your citizen account.'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Status / Success Banner */}
        {statusMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* STEP 1: REGISTER WITH OTP FORM */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('reg_lbl_fullname')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  disabled={isEmailVerified}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Varshith D"
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition disabled:bg-slate-50 bg-white/80"
                />
              </div>
            </div>

            {/* Email Address - Clean Single Full-Width Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('reg_lbl_email')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  disabled={isEmailVerified}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition disabled:bg-slate-50 bg-white/80"
                />
              </div>
            </div>

            {/* Mobile Number & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('reg_lbl_phone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="9845012345"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition bg-white/80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('reg_lbl_state')}
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none bg-white/80 transition cursor-pointer"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="All-India">Other State</option>
                </select>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('reg_lbl_lang')}
              </label>
              <select
                value={preferredLang}
                onChange={e => {
                  setPreferredLang(e.target.value);
                  setLanguage(e.target.value as any);
                }}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none bg-white/80 transition cursor-pointer"
              >
                <option value="en">English (Official Portal Language)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            {/* OTP Verification Box */}
            {otpSent && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('reg_lbl_otp')}
                  </label>
                  <span className="text-[11px] text-slate-500">Valid for 5 minutes</span>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-lg tracking-widest text-center font-mono py-2 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition bg-white"
                  />
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={otpVerifying}
                  disabled={otpCode.length !== 6}
                  onClick={() => handleVerifyOtp()}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t('btn_verify_otp')}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    disabled={cooldown > 0 || otpSending}
                    onClick={handleSendOtp}
                    className="text-xs text-govblue-800 font-semibold hover:underline disabled:text-slate-400"
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : t('btn_resend_otp')}
                  </button>
                </div>
              </div>
            )}

            {/* Single Primary Action Button at Bottom */}
            {!otpSent && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={otpSending}
                onClick={handleSendOtp}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send 6-Digit OTP
              </Button>
            )}

            {/* Already registered Link */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-govblue-800 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: SET PASSWORD FORM */}
        {currentStep === 2 && (
          <form onSubmit={handleSetPasswordAndComplete} className="space-y-4">
            {/* Verified Citizen Summary Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">{fullName}</div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <span>{email}</span>
                    <span className="font-bold">• Email OTP Verified ✓</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Edit
              </button>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('reg_lbl_password')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('reg_pass_hint')}
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className={`h-1 flex-1 rounded-full ${passStrength >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${passStrength >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${passStrength >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${passStrength >= 4 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                  <span className="text-[10px] text-slate-500 font-semibold ml-1">
                    {passStrength <= 1 ? 'Weak' : passStrength <= 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('reg_lbl_confirm_password')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t('reg_lbl_confirm_password')}
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 outline-none transition bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password && (
                <p className={`text-[11px] font-semibold mt-1 ${password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {t('btn_back')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submittingPassword}
                className="flex-1"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Complete Registration & Sign In →
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
