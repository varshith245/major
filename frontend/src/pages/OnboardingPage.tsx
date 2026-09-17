import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { UserProfile } from '../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Tractor,
  GraduationCap,
  Clock,
  Briefcase,
  Home,
  HeartPulse,
  Coins,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  UserCheck
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender' | 'Other' | 'Any'>('Female');
  const [occupation, setOccupation] = useState('Farmer');
  const [primaryInterest, setPrimaryInterest] = useState('Agriculture & Rural');
  const [state, setState] = useState('Karnataka');
  const [incomeRange, setIncomeRange] = useState<number>(120000);
  const [ownsLand, setOwnsLand] = useState(true);
  const [saving, setSaving] = useState(false);

  const occupations = [
    { id: 'Farmer', label: 'Farmer / Cultivator', icon: <Tractor className="w-5 h-5 text-emerald-600" /> },
    { id: 'Student', label: 'Student / Graduate', icon: <GraduationCap className="w-5 h-5 text-indigo-600" /> },
    { id: 'Senior Citizen', label: 'Senior Citizen (60+)', icon: <Clock className="w-5 h-5 text-amber-600" /> },
    { id: 'Homemaker', label: 'Homemaker', icon: <UserCheck className="w-5 h-5 text-purple-600" /> },
    { id: 'Business Owner', label: 'Micro Business / Vendor', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
    { id: 'Working Professional', label: 'Employed Worker', icon: <Coins className="w-5 h-5 text-teal-600" /> },
  ];

  const interests = [
    { id: 'Agriculture & Rural', label: 'Agriculture & Income Aid', icon: <Tractor className="w-5 h-5 text-emerald-600" /> },
    { id: 'Healthcare & Insurance', label: 'Healthcare & Hospitalization', icon: <HeartPulse className="w-5 h-5 text-rose-600" /> },
    { id: 'Housing & Urban Development', label: 'Housing Subsidies', icon: <Home className="w-5 h-5 text-sky-600" /> },
    { id: 'Education & Youth', label: 'Scholarships & Allowances', icon: <GraduationCap className="w-5 h-5 text-indigo-600" /> },
    { id: 'Women & Child Welfare', label: 'Women & Maternity Welfare', icon: <UserCheck className="w-5 h-5 text-purple-600" /> },
    { id: 'Business & Loans', label: 'Enterprise Credit & Mudra', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
  ];

  const handleFinish = async () => {
    try {
      setSaving(true);
      const newProfile: UserProfile = {
        age,
        gender,
        state,
        occupation,
        annual_income: incomeRange,
        owns_land: ownsLand,
        landholding_acres: ownsLand ? 2.5 : 0,
        caste_category: 'General',
        is_govt_employee: false,
        is_income_tax_payer: false,
        owns_pucca_house: false,
        is_bpl_cardholder: true
      };

      await updateProfile(newProfile);
      showToast('Profile personalized! Showing recommended schemes.', 'success');
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 flex flex-col justify-between min-h-[520px]">
        {/* Progress & Skip */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-govblue-800 bg-govblue-50 px-2.5 py-1 rounded-full border border-govblue-200">
                Step {step} of 5
              </span>
              <span className="text-xs font-medium text-slate-500">
                Quick Personalization
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              Skip for now
            </button>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 font-heading mb-2">
                Tell us a little about yourself
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Age and gender help us filter age-specific schemes like youth allowances, senior pensions, and maternity aid.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Your Age: <strong className="text-govblue-800 text-sm">{age} years</strong>
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="90"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full accent-govblue-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>14 yrs (Student)</span>
                    <span>35 yrs (Working)</span>
                    <span>60+ yrs (Senior)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Gender Identity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Female', 'Male', 'Transgender'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g as any)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                          gender === g
                            ? 'bg-govblue-50 border-govblue-600 text-govblue-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Occupation */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 font-heading mb-2">
                What best describes you?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Schemes are heavily customized based on occupation, farming status, or study level.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {occupations.map(occ => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setOccupation(occ.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                      occupation === occ.id
                        ? 'bg-govblue-50 border-govblue-600 text-govblue-900 ring-1 ring-govblue-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
                      {occ.icon}
                    </div>
                    <span className="text-xs font-bold">{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: What are you looking for? */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 font-heading mb-2">
                What are you looking for most?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Select your primary area of welfare or public service assistance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interests.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPrimaryInterest(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                      primaryInterest === item.id
                        ? 'bg-govgreen-50 border-govgreen-600 text-govgreen-900 ring-1 ring-govgreen-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Location & Income */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 font-heading mb-2">
                Where are you located?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                State residency determines eligibility for state-specific welfare programs (e.g. Karnataka Guarantee Schemes).
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State of Residence
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 bg-white"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="All-India">All-India / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual Household Income Bracket
                  </label>
                  <select
                    value={incomeRange}
                    onChange={e => setIncomeRange(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 focus:ring-1 focus:ring-govblue-600 bg-white"
                  >
                    <option value={80000}>Under ₹1,00,000 / year (BPL / EWS)</option>
                    <option value={150000}>₹1,00,000 – ₹2,50,000 / year</option>
                    <option value={350000}>₹2,50,000 – ₹5,00,000 / year</option>
                    <option value={600000}>Above ₹5,00,000 / year</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownsLand}
                      onChange={e => setOwnsLand(e.target.checked)}
                      className="rounded border-slate-300 text-govblue-800 focus:ring-govblue-600"
                    />
                    <span>I or my family own cultivable agricultural land</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Profile Ready! */}
          {step === 5 && (
            <div className="animate-fade-in text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-heading mb-2">
                Your Citizen Profile is Ready!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
                Based on your background as a <strong>{occupation}</strong> ({age} yrs) in <strong>{state}</strong>, SEVA has mapped 12+ relevant welfare programs tailored for you.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1 mb-6">
                <div>• Occupation: <strong>{occupation}</strong></div>
                <div>• State: <strong>{state}</strong></div>
                <div>• Age: <strong>{age} years</strong></div>
                <div>• Est. Annual Income: <strong>₹{incomeRange.toLocaleString('en-IN')}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(step + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              isLoading={saving}
              onClick={handleFinish}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Show My Recommendations
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
