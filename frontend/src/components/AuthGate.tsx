import React, { useState } from 'react';
import { Building2, ShieldCheck, Lock, Mail, User, Phone, Key, CheckCircle2, AlertCircle, Loader2, Send, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verifyOtpApi } from '../api';

interface AuthGateProps {
  language: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({ language }) => {
  const { login, sendOtp, loginWithOtp, registerWithOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // Multi-step Registration
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // OTP State
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (purpose: 'login' | 'register' = 'login') => {
    const targetEmail = purpose === 'register' ? email : otpIdentifier;
    if (!targetEmail || !targetEmail.includes('@') || !targetEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setOtpSending(true);

    try {
      await sendOtp(targetEmail.trim(), purpose);
      setOtpSent(true);
      setCooldown(30);
      setSuccessMsg(`6-digit verification code sent to ${targetEmail.trim()}. Check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!otpCode || otpCode.length !== 6) { setError('Please enter the 6-digit OTP code.'); return; }

    setLoading(true);
    try {
      const res = await verifyOtpApi(email.trim(), otpCode.trim(), 'register');
      if (res.verified) {
        setRegisterStep(2);
        setSuccessMsg('Email verified! Set your password to complete registration.');
      } else {
        setError(res.message || 'Invalid OTP verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await registerWithOtp(email.trim(), password, fullName.trim(), otpCode.trim(), phone.trim(), role);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'login') {
        await login(email.trim(), password);
      } else {
        await loginWithOtp(otpIdentifier.trim(), otpCode.trim());
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-900 text-slate-900 min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-crimson-600 text-white shadow-lg mb-2">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-heading">
            eGov<span className="text-crimson-600">Seva</span> Portal
          </h2>
          <p className="text-xs text-slate-500">Citizen Public Welfare Assistant</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`py-2 rounded-xl transition ${activeTab === 'login' ? 'bg-white text-crimson-700 shadow-2xs' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`py-2 rounded-xl transition ${activeTab === 'register' ? 'bg-white text-crimson-700 shadow-2xs' : ''}`}
          >
            Register
          </button>
          <button
            onClick={() => { setActiveTab('otp'); setError(null); }}
            className={`py-2 rounded-xl transition ${activeTab === 'otp' ? 'bg-white text-crimson-700 shadow-2xs' : ''}`}
          >
            Instant OTP
          </button>
        </div>

        {/* PASSWORD LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In with Password'}
            </button>
          </form>
        )}

        {/* REGISTER 2-STEP */}
        {activeTab === 'register' && (
          <div className="space-y-4 text-xs">
            {registerStep === 1 ? (
              <form onSubmit={handleVerifyOtpAndProceed} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Varshith D"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendOtp('register')}
                      disabled={otpSending || cooldown > 0 || !email}
                      className="px-3 py-2 bg-crimson-700 text-white rounded-xl font-bold flex-shrink-0"
                    >
                      {otpSending ? 'Sending...' : cooldown > 0 ? `${cooldown}s` : 'Send OTP'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">6-Digit Email OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-center text-sm outline-none focus:border-crimson-600"
                  />
                </div>

                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                {successMsg && <p className="text-xs text-emerald-600 font-bold">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Next Step →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold">
                  ✓ Verified Email: {email}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Set Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="user">Citizen</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* OTP LOGIN */}
        {activeTab === 'otp' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={otpIdentifier}
                  onChange={(e) => setOtpIdentifier(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp('login')}
                  disabled={otpSending || cooldown > 0 || !otpIdentifier}
                  className="px-3 py-2 bg-crimson-700 text-white rounded-xl font-bold flex-shrink-0"
                >
                  {otpSending ? 'Sending...' : cooldown > 0 ? `${cooldown}s` : 'Send OTP'}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-center text-sm outline-none focus:border-crimson-600"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
            {successMsg && <p className="text-xs text-emerald-600 font-bold">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
