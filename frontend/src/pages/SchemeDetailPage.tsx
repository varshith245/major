import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scheme } from '../types';
import { schemeService } from '../services/schemeService';
import { useSavedSchemes } from '../context/SavedSchemesContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { t, translateCategory, translateDocument } from '../i18n';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ApplyModal } from '../components/schemes/ApplyModal';
import { parseApplicationUrls, getPrimaryApplicationUrl } from '../utils/urlUtils';
import {
  ArrowLeft,
  Bookmark,
  Scale,
  CheckCircle2,
  ExternalLink,
  Phone,
  FileText,
  Clock,
  IndianRupee,
  ShieldCheck,
  Building,
  Info,
  Sparkles
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useAccessibility();
  const { isSaved, toggleSave } = useSavedSchemes();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchScheme = async () => {
      if (!id) return;
      setLoading(true);
      const data = await schemeService.getSchemeById(id);
      setScheme(data);
      setLoading(false);
    };
    fetchScheme();
  }, [id]);

  if (loading || !scheme) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading official scheme details...
      </div>
    );
  }

  const saved = isSaved(scheme.scheme_id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('Back to schemes', language)}</span>
      </button>

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={scheme.level === 'Central' ? 'central' : 'state'}>
              {scheme.level === 'Central' ? t('Central Scheme', language) : `${scheme.state} ${t('State Scheme', language)}`}
            </Badge>
            <Badge variant="slate">{translateCategory(scheme.category, language)}</Badge>
            <span className="text-xs font-mono text-slate-400">ID: {scheme.scheme_id}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={saved ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => toggleSave(scheme)}
              leftIcon={<Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-govblue-800' : ''}`} />}
            >
              {saved ? t('Saved', language) : t('Save', language)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/compare?add=${scheme.scheme_id}`)}
              leftIcon={<Scale className="w-3.5 h-3.5" />}
            >
              {t('Compare', language)}
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mb-2">
            {scheme.scheme_name} ({scheme.short_name})
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Building className="w-4 h-4 text-slate-400" />
            <span>{scheme.ministry}</span>
          </div>
        </div>

        {/* Highlight Benefit Banner */}
        <div className="bg-govgreen-50/70 rounded-2xl p-5 border border-govgreen-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-govgreen-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-govgreen-950 uppercase tracking-wider">
                {t('Financial / Service Benefit', language)}
              </div>
              <div className="text-sm font-bold text-govgreen-900">
                {scheme.key_benefits}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/eligibility?scheme=${scheme.scheme_id}`)}
            >
              {t('Check Eligibility', language)}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-govgreen-700 hover:bg-govgreen-800 text-white font-bold shadow-sm"
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              {t('Apply Now', language)}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scheme Details Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Overview */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-govblue-800" />
              <span>{t('Program Overview', language)}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {scheme.description}
            </p>
          </section>

          {/* Eligibility Criteria */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-govgreen-600" />
              <span>{t('Who Can Apply (Eligibility Criteria)', language)}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">{t('Age Requirement', language)}</span>
                <span className="text-slate-600">
                  {scheme.eligibility_criteria.min_age} to {scheme.eligibility_criteria.max_age} {t('card_years', language)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">{t('Gender Target', language)}</span>
                <span className="text-slate-600">{t(scheme.eligibility_criteria.gender, language)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">{t('Income Limit', language)}</span>
                <span className="text-slate-600">
                  {scheme.eligibility_criteria.max_annual_income
                    ? `Up to ₹${scheme.eligibility_criteria.max_annual_income.toLocaleString('en-IN')} / year`
                    : t('No strict ceiling specified', language, 'No strict ceiling specified')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">{t('Landholding Rule', language)}</span>
                <span className="text-slate-600">
                  {scheme.eligibility_criteria.landholding_required
                    ? t('Mandatory agricultural land ownership', language, 'Mandatory agricultural land ownership')
                    : t('Land ownership not required', language, 'Land ownership not required')}
                </span>
              </div>
            </div>

            {scheme.eligibility_criteria.exclusions && scheme.eligibility_criteria.exclusions.length > 0 && (
              <div className="mt-4 p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-900">
                <strong className="block mb-1">{t('Disqualifications / Exclusions:', language)}</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {scheme.eligibility_criteria.exclusions.map((ex, idx) => (
                    <li key={idx}>{t(ex, language)}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Required Documents */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t('Required Documents', language)}</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/documents?scheme=${scheme.scheme_id}`)}
                className="text-govblue-800"
              >
                {t('Generate Checklist →', language)}
              </Button>
            </div>

            <div className="space-y-2">
              {scheme.required_documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-govblue-600"></span>
                  <span>{translateDocument(doc, language)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Nodal Helpline, Application Link & Timeline */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {t('Official Application Channel', language)}
            </h3>

            <div className="space-y-4 text-xs mb-6">
              <div>
                <span className="text-slate-400 block mb-1">{t('Estimated Processing', language)}</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  ~{scheme.processing_time_days} {t('Working Days', language)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('Nodal Contact / Helpline', language)}</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {scheme.grievance_contact || '1800-11-0001 (Toll Free)'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {parseApplicationUrls(scheme.application_link).map((chan, idx) => (
                <a
                  key={idx}
                  href={chan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs shadow-sm transition ${
                    chan.isPrimary
                      ? 'bg-govblue-800 hover:bg-govblue-900 text-white'
                      : 'bg-white hover:bg-slate-100 text-govblue-900 border border-slate-300'
                  }`}
                >
                  <span>{chan.name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => setIsApplyModalOpen(true)}
              >
                {t('Official Application Gateway', language)}
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              {t('Direct official Government of India link', language)}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-govgreen-600 mb-2" />
            <strong className="block text-slate-900 mb-1">{t('Citizen Notice:', language)}</strong>
            {t('legal_disclaimer', language)}
          </div>
        </div>
      </div>

      {/* Application Gateway Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        scheme={scheme}
      />
    </div>
  );
};
