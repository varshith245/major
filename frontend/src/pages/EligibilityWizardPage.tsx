import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { t } from '../i18n';
import { UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Tractor,
  GraduationCap,
  Clock,
  Briefcase,
  UserCheck,
  Building,
  Coins,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const EligibilityWizardPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language } = useAccessibility();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetSchemeId = searchParams.get('scheme');

  const [step, setStep] = useState(1);
  const [whyModalText, setWhyModalText] = useState<string | null>(null);

  // Form State initialized from user profile
  const initial = user?.user_profile;
  const [age, setAge] = useState<number>(initial?.age || 34);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender' | 'Other' | 'Any'>(initial?.gender || 'Female');
  const [state, setState] = useState(initial?.state || 'Karnataka');
  const [occupation, setOccupation] = useState(initial?.occupation || 'Farmer');
  const [annualIncome, setAnnualIncome] = useState<number>(initial?.annual_income || 120000);
  const [ownsLand, setOwnsLand] = useState(initial?.owns_land ?? true);
  const [landAcres, setLandAcres] = useState<number>(initial?.landholding_acres || 2.5);
  const [casteCategory, setCasteCategory] = useState<'General' | 'OBC' | 'SC' | 'ST' | 'EWS'>(initial?.caste_category || 'General');
  const [isGovtEmployee, setIsGovtEmployee] = useState(initial?.is_govt_employee ?? false);
  const [isTaxPayer, setIsTaxPayer] = useState(initial?.is_income_tax_payer ?? false);
  const [ownsPuccaHouse, setOwnsPuccaHouse] = useState(initial?.owns_pucca_house ?? false);
  const [isBPL, setIsBPL] = useState(initial?.is_bpl_cardholder ?? true);

  const handleComplete = async () => {
    const profile: UserProfile = {
      age,
      gender,
      state,
      occupation,
      annual_income: annualIncome,
      owns_land: ownsLand,
      landholding_acres: ownsLand ? landAcres : 0,
      caste_category: casteCategory,
      is_govt_employee: isGovtEmployee,
      is_income_tax_payer: isTaxPayer,
      owns_pucca_house: ownsPuccaHouse,
      is_bpl_cardholder: isBPL
    };

    await updateProfile(profile);

    // Save evaluation payload for result page
    sessionStorage.setItem('sevaai_eval_profile', JSON.stringify(profile));
    if (targetSchemeId) {
      navigate(`/eligibility/result?scheme=${targetSchemeId}`);
    } else {
      navigate('/eligibility/result');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('Back', language)}</span>
      </button>

      {/* Main Wizard Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-card flex flex-col justify-between min-h-[560px]">
        <div>
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <span className="text-xs font-bold text-govblue-800 bg-govblue-50 px-2.5 py-1 rounded-full border border-govblue-200">
                {t('wiz_step_of', language).replace('{current}', String(step)).replace('{total}', '5')}
              </span>
              <span className="text-xs text-slate-400 ml-2">
                {step === 1 && t('Basic Citizen Information', language)}
                {step === 2 && t('Occupation & Livelihood', language)}
                {step === 3 && t('Annual Household Income Bracket', language)}
                {step === 4 && t('Location & Social Category', language)}
                {step === 5 && t('Landholding & Disqualification Criteria', language)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i <= step ? 'bg-govblue-800' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-heading mb-1.5">
                  {t('Basic Citizen Information', language)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t('Welfare programs enforce statutory age brackets and gender provisions.', language)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    {t('Your Age:', language)} <span className="text-sm font-black text-govblue-800">{age} {t('card_years', language)}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setWhyModalText(
                        language === 'hi'
                          ? 'सरकारी दिशानिर्देश न्यूनतम या अधिकतम आयु नियम निर्धारित करते हैं (जैसे 18-40 पेंशन के लिए, 60+ वृद्धावस्था पेंशन के लिए)।'
                          : language === 'kn'
                          ? 'ಸರ್ಕಾರಿ ನಿಯಮಗಳು ಕನಿಷ್ಠ ಅಥವಾ ಗರಿಷ್ಠ ವಯೋಮಿತಿ ನಿಯಮಗಳನ್ನು ನಿಗದಿಪಡಿಸುತ್ತವೆ (ಉದಾ: ಪಿಂಚಣಿಗೆ 18–40, ಹಿರಿಯ ನಾಗರಿಕರ ಪಿಂಚಣಿಗೆ 60+).'
                          : 'Government guidelines specify minimum or maximum age rules (e.g. 18–40 for pensions, 18+ for adult welfare, 60+ for senior citizen pensions).'
                      )
                    }
                    className="text-slate-400 hover:text-govblue-800 flex items-center gap-1 text-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t('Why do we ask this?', language)}</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="16"
                  max="90"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full accent-govblue-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('Gender', language)}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Female', 'Male', 'Transgender'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g as any)}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        gender === g
                          ? 'bg-govblue-50 border-govblue-600 text-govblue-900 ring-1 ring-govblue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t(g, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Occupation */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-heading mb-1.5">
                  {t('Occupation & Livelihood', language)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t('Select your primary work sector to filter sector-targeted subsidies.', language)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'Farmer', label: 'Farmer / Cultivator', icon: <Tractor className="w-4 h-4 text-emerald-600" /> },
                  { id: 'Student', label: 'Student / Graduate', icon: <GraduationCap className="w-4 h-4 text-indigo-600" /> },
                  { id: 'Senior Citizen', label: 'Senior Citizen / Retired', icon: <Clock className="w-4 h-4 text-amber-600" /> },
                  { id: 'Homemaker', label: 'Homemaker', icon: <UserCheck className="w-4 h-4 text-purple-600" /> },
                  { id: 'Self-Employed', label: 'Artisan / Street Vendor / Trader', icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
                  { id: 'Worker', label: 'Unorganized / Casual Worker', icon: <Coins className="w-4 h-4 text-teal-600" /> },
                ].map(occ => (
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
                    <span className="text-xs font-bold">{t(occ.label, language)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Income */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-heading mb-1.5">
                  {t('Annual Household Income Bracket', language)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t('Most welfare programs define explicit income ceilings to prioritize low-income families.', language)}
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 80000, label: 'Less than ₹1,00,000 / year', desc: 'BPL / Antyodaya / Priority House' },
                  { value: 180000, label: '₹1,00,000 – ₹2,50,000 / year', desc: 'Lower Income / Small Farmer / EWS' },
                  { value: 400000, label: '₹2,50,000 – ₹5,00,000 / year', desc: 'Middle Income Group' },
                  { value: 800000, label: 'Above ₹5,00,000 / year', desc: 'Taxable Regular Income' },
                ].map(item => (
                  <label
                    key={item.value}
                    onClick={() => setAnnualIncome(item.value)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                      annualIncome === item.value
                        ? 'bg-govblue-50 border-govblue-600 text-govblue-900 ring-1 ring-govblue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{t(item.label, language)}</div>
                      <div className="text-[11px] text-slate-500">{t(item.desc, language)}</div>
                    </div>
                    <input
                      type="radio"
                      name="income"
                      checked={annualIncome === item.value}
                      onChange={() => setAnnualIncome(item.value)}
                      className="text-govblue-800 focus:ring-govblue-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: State & Social Category */}
          {step === 4 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-heading mb-1.5">
                  {t('Location & Social Category', language)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t('State welfare programs and affirmative category schemes check these criteria.', language)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('State of Residence', language)}
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-govblue-600 bg-white"
                  >
                    <option value="Karnataka">Karnataka (Eligible for Karnataka Guarantee Schemes)</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="All-India">All-India / Other State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {t('Social / Caste Category', language)}
                  </label>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {(['General', 'OBC', 'SC', 'ST', 'EWS'] as const).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCasteCategory(c)}
                        className={`py-2.5 rounded-xl border font-bold text-center transition ${
                          casteCategory === c
                            ? 'bg-govblue-50 border-govblue-600 text-govblue-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Landholding & Disqualifications */}
          {step === 5 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-heading mb-1.5">
                  {t('Landholding & Disqualification Criteria', language)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t('Accurate declaration avoids rejection during administrative verification.', language)}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Land check */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-slate-800">
                      {t('Do you own cultivable agricultural land?', language)}
                    </span>
                    <input
                      type="checkbox"
                      checked={ownsLand}
                      onChange={e => setOwnsLand(e.target.checked)}
                      className="rounded border-slate-300 text-govblue-800 focus:ring-govblue-600 w-4 h-4"
                    />
                  </label>
                  {ownsLand && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center gap-2">
                      <span className="text-slate-600">{t('Land Area:', language)}</span>
                      <input
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.5"
                        value={landAcres}
                        onChange={e => setLandAcres(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-300 rounded-md bg-white text-xs"
                      />
                      <span className="text-slate-500 font-semibold">{t('Acres', language)}</span>
                    </div>
                  )}
                </div>

                {/* Exclusions */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800">{t('Are you an Income Tax Payer?', language)}</div>
                      <div className="text-[11px] text-slate-500">{t('Filed ITR in previous assessment year', language)}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isTaxPayer}
                      onChange={e => setIsTaxPayer(e.target.checked)}
                      className="rounded border-slate-300 text-govblue-800 focus:ring-govblue-600 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                    <div>
                      <div className="font-bold text-slate-800">{t('Are you a Government Employee?', language)}</div>
                      <div className="text-[11px] text-slate-500">{t('Regular Central/State Govt employment', language)}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isGovtEmployee}
                      onChange={e => setIsGovtEmployee(e.target.checked)}
                      className="rounded border-slate-300 text-govblue-800 focus:ring-govblue-600 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                    <div>
                      <div className="font-bold text-slate-800">{t('Do you already own a Pucca House?', language)}</div>
                      <div className="text-[11px] text-slate-500">{t('Affects PMAY housing eligibility', language)}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={ownsPuccaHouse}
                      onChange={e => setOwnsPuccaHouse(e.target.checked)}
                      className="rounded border-slate-300 text-govblue-800 focus:ring-govblue-600 w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t('Previous', language)}
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
              {t('Next Step', language)}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {t('Evaluate All 30 Schemes', language)}
            </Button>
          )}
        </div>
      </div>

      {/* Helper Modal for "Why do we ask this?" */}
      <Modal
        isOpen={!!whyModalText}
        onClose={() => setWhyModalText(null)}
        title={t('Why do we ask this?', language)}
      >
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {whyModalText}
        </p>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setWhyModalText(null)}>
            {t('Understood', language)}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
