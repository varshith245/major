import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { t, translateCategory } from '../i18n';
import { eligibilityService } from '../services/eligibilityService';
import { EligibilityEvaluationResponse, EligibilityResult, UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ApplyModal } from '../components/schemes/ApplyModal';
import { getPrimaryApplicationUrl } from '../utils/urlUtils';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Filter,
  RefreshCw,
  ExternalLink,
  IndianRupee,
  Info,
  Sparkles
} from 'lucide-react';

export const EligibilityResultPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetSchemeId = searchParams.get('scheme');

  const [evaluation, setEvaluation] = useState<EligibilityEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'eligible' | 'ineligible'>('eligible');
  const [selectedApplyScheme, setSelectedApplyScheme] = useState<EligibilityResult | null>(null);

  useEffect(() => {
    const runEvaluation = async () => {
      setLoading(true);
      const stored = sessionStorage.getItem('sevaai_eval_profile');
      const profile: UserProfile = stored ? JSON.parse(stored) : (user?.user_profile || {
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
        owns_pucca_house: false
      });

      const res = await eligibilityService.evaluateProfile(profile);
      setEvaluation(res);
      setLoading(false);
    };

    runEvaluation();
  }, [user]);

  if (loading || !evaluation) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-govblue-800 border-t-transparent rounded-full mx-auto mb-3"></div>
        {t('Evaluating 30 Central & State government schemes against your profile...', language)}
      </div>
    );
  }

  const results = evaluation.results;
  const filteredResults = results.filter(r => {
    if (filterTab === 'eligible') return r.is_eligible;
    if (filterTab === 'ineligible') return !r.is_eligible;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* 1. Assessment Summary Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-50 border border-govblue-200 text-govblue-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('Multi-Factor Assessment Complete', language)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {t('Eligibility Assessment', language)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('Evaluated across 7 statutory guidelines: age brackets, residency, income limits, land records, and exclusions.', language)}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/eligibility')}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {t('Modify Profile', language)}
          </Button>
        </div>

        {/* Aggregate Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              {evaluation.eligible_count}
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 uppercase">{t('Likely Eligible', language)}</div>
              <div className="text-[11px] text-emerald-700">{t('Welfare Schemes Qualified', language)}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center font-black text-sm">
              {evaluation.total_evaluated - evaluation.eligible_count}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase">{t('Non-Matching', language)}</div>
              <div className="text-[11px] text-slate-500">{t('Criteria Not Satisfied', language)}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-govblue-50 border border-govblue-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-govblue-800 text-white flex items-center justify-center font-black text-sm">
              {evaluation.total_evaluated}
            </div>
            <div>
              <div className="text-xs font-bold text-govblue-900 uppercase">{t('Total Analyzed', language)}</div>
              <div className="text-[11px] text-govblue-700">{t('Central & State Schemes', language)}</div>
            </div>
          </div>
        </div>

        {/* Mandatory Trust & Legal Disclaimer */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>{t('Legal Disclaimer:', language, 'AI-Assisted Assessment Notice:')}</strong> {t('legal_disclaimer', language)}
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterTab('eligible')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'eligible'
              ? 'bg-govgreen-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('Likely Eligible', language)} ({evaluation.eligible_count})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'all'
              ? 'bg-govblue-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('All Evaluated', language)} ({evaluation.total_evaluated})
        </button>
        <button
          onClick={() => setFilterTab('ineligible')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'ineligible'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('Not Matching', language)} ({evaluation.total_evaluated - evaluation.eligible_count})
        </button>
      </div>

      {/* 3. Evaluated Scheme Cards List */}
      <div className="space-y-4">
        {filteredResults.map(item => (
          <div
            key={item.scheme_id}
            className={`bg-white rounded-2xl border p-6 shadow-subtle flex flex-col gap-4 transition ${
              item.is_eligible ? 'border-emerald-200 hover:border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200 opacity-90'
            }`}
          >
            {/* Header Status & Confidence */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    item.eligibility_status === 'Likely Eligible'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : item.eligibility_status === 'Conditionally Eligible'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {item.is_eligible ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-700" />
                  )}
                  <span>{t(item.eligibility_status, language)}</span>
                </span>

                <span className="text-xs font-bold text-slate-500">
                  {t('Confidence:', language)} {Math.round(item.confidence_score * 100)}%
                </span>
              </div>

              {item.benefit_amount > 0 && (
                <span className="text-xs font-black text-govblue-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-govgreen-600" />
                  <span>{t('Benefit:', language)} ₹{item.benefit_amount.toLocaleString('en-IN')}</span>
                </span>
              )}
            </div>

            {/* Scheme Title */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-0.5">
                {item.scheme_name} ({item.short_name})
              </h3>
              <span className="text-xs text-slate-500">{translateCategory(item.category, language)}</span>
            </div>

            {/* Matched Criteria Bullet List */}
            {item.reasons.length > 0 && (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-semibold text-slate-800">{t('Criteria Satisfied:', language)}</div>
                {item.reasons.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t(r, language)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Potential Issues / Missing Criteria */}
            {item.missing_criteria.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('Requirement Verification Needed:', language)}</span>
                </div>
                {item.missing_criteria.map((m, idx) => (
                  <div key={idx}>• {t(m, language)}</div>
                ))}
              </div>
            )}

            {/* Action Buttons with Prominent Apply Now */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/schemes/${item.scheme_id}`)}
                >
                  {t('Guidelines', language)}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/documents?scheme=${item.scheme_id}`)}
                  leftIcon={<FileText className="w-3.5 h-3.5" />}
                >
                  {t('Checklist', language)}
                </Button>
              </div>

              {/* Primary Apply Now Button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedApplyScheme(item)}
                  className="bg-govgreen-700 hover:bg-govgreen-800 text-white font-bold shadow-sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  {t('Apply Now', language)}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Gateway Modal */}
      <ApplyModal
        isOpen={!!selectedApplyScheme}
        onClose={() => setSelectedApplyScheme(null)}
        scheme={selectedApplyScheme}
      />
    </div>
  );
};

