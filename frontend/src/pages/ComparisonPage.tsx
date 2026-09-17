import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { comparisonService } from '../services/comparisonService';
import { schemeService } from '../services/schemeService';
import { Scheme, ComparisonResponse } from '../types';
import { useAccessibility } from '../context/AccessibilityContext';
import { t, translateCategory, translateDocument } from '../i18n';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ComparisonSkeleton } from '../components/ui/Skeleton';
import {
  Scale,
  Plus,
  X,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  IndianRupee,
  Printer,
  RefreshCw
} from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAccessibility();
  const [searchParams] = useSearchParams();

  const addSchemeId = searchParams.get('add');
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>(() => {
    return addSchemeId ? ['GOI-AGRI-001', addSchemeId] : ['GOI-AGRI-001', 'GOI-AGRI-002'];
  });

  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const init = async () => {
      const schemes = await schemeService.getAllSchemes();
      setAllSchemes(schemes);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      const res = await comparisonService.compareSchemes(selectedSchemeIds);
      setComparison(res);
      setLoading(false);
    };
    if (selectedSchemeIds.length > 0) {
      fetchComparison();
    }
  }, [selectedSchemeIds]);

  const handleRemoveScheme = (schemeId: string) => {
    if (selectedSchemeIds.length <= 1) return;
    setSelectedSchemeIds(prev => prev.filter(id => id !== schemeId));
  };

  const handleAddScheme = (schemeId: string) => {
    if (selectedSchemeIds.length >= 3 || selectedSchemeIds.includes(schemeId)) return;
    setSelectedSchemeIds(prev => [...prev, schemeId]);
  };

  const handleExportPdf = async () => {
    if (!selectedSchemeIds || selectedSchemeIds.length === 0) return;
    setExportingPdf(true);
    try {
      await comparisonService.downloadComparisonPdf(selectedSchemeIds);
    } catch (err: any) {
      console.error('Failed to export comparison PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading || !comparison) {
    return <ComparisonSkeleton />;
  }

  const { schemes, comparison_fields } = comparison;

  const rows = [
    { label: t('Level / State', language), values: comparison_fields.levels.map(l => t(l, language)) },
    { label: t('Category', language), values: comparison_fields.categories.map(c => translateCategory(c, language)) },
    { label: t('Financial Benefit', language), values: comparison_fields.benefit_amounts },
    { label: t('Key Benefit Detail', language), values: comparison_fields.key_benefits },
    { label: t('Age Requirement', language), values: comparison_fields.age_criteria },
    { label: t('Income Limit', language), values: comparison_fields.income_limits.map(inc => inc === 'No strict ceiling' ? t('No strict ceiling', language) : inc) },
    { label: t('Landholding Rule', language), values: comparison_fields.landholding_rules },
    { 
      label: t('Required Documents', language), 
      values: comparison_fields.required_documents.map(docs => 
        Array.isArray(docs) 
          ? docs.map(d => translateDocument(d, language)).join(', ') 
          : typeof docs === 'string' 
            ? docs.split(',').map(d => translateDocument(d.trim(), language)).join(', ') 
            : docs
      ) 
    },
    { label: t('Estimated Turnaround', language), values: comparison_fields.processing_times }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>{t('Scheme Comparative Analysis', language)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {t('Compare Schemes Side-by-Side', language)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('Compare up to 3 welfare schemes to determine which program offers better financial and healthcare value.', language)}
          </p>
        </div>

        {/* Scheme Selector & Export Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {selectedSchemeIds.length < 3 && (
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddScheme(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none w-full sm:w-auto"
            >
              <option value="">{t('+ Add scheme to compare...', language)}</option>
              {allSchemes
                .filter(s => !selectedSchemeIds.includes(s.scheme_id))
                .map(s => (
                  <option key={s.scheme_id} value={s.scheme_id}>
                    {s.short_name} ({translateCategory(s.category, language)})
                  </option>
                ))}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            leftIcon={exportingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5 text-purple-700" />}
            className="text-purple-800 border-purple-300 hover:bg-purple-50 font-bold"
          >
            {exportingPdf ? 'Exporting...' : 'Export Comparison (PDF)'}
          </Button>
        </div>
      </div>

      {/* DESKTOP COMPARISON TABLE */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">
                {t('Comparison Feature', language)}
              </th>
              {schemes.map(s => (
                <th key={s.scheme_id} className="p-5 text-left w-1/3 border-l border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-extrabold text-slate-900 text-base font-heading">
                      {s.short_name}
                    </span>
                    {selectedSchemeIds.length > 2 && (
                      <button
                        onClick={() => handleRemoveScheme(s.scheme_id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">{s.scheme_name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                <td className="p-4 font-bold text-slate-700">{row.label}</td>
                {row.values.map((val, vIdx) => (
                  <td key={vIdx} className="p-4 text-slate-600 border-l border-slate-100 leading-relaxed">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
            {/* CTA Action Row */}
            <tr className="bg-slate-50/80 border-t border-slate-200">
              <td className="p-5 font-bold text-slate-700">{t('Actions', language)}</td>
              {schemes.map(s => (
                <td key={s.scheme_id} className="p-5 border-l border-slate-200">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/eligibility?scheme=${s.scheme_id}`)}
                    >
                      {t('Check Eligibility', language)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/documents?scheme=${s.scheme_id}`)}
                    >
                      {t('View Checklist', language)}
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* MOBILE STACKED COMPARISON CARDS */}
      <div className="lg:hidden flex flex-col gap-6">
        {schemes.map(s => (
          <div
            key={s.scheme_id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  {s.short_name}
                </h3>
                <span className="text-xs text-slate-500">{s.scheme_name}</span>
              </div>
              <Badge variant={s.level === 'Central' ? 'central' : 'state'}>
                {t(s.level, language)}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700 block mb-0.5">{t('Benefit:', language)}</span>
                <span className="text-govgreen-800 font-bold">{s.key_benefits}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">{t('Age:', language)} </span>
                <span className="text-slate-600">
                  {s.eligibility_criteria.min_age}–{s.eligibility_criteria.max_age} {t('yrs', language, 'yrs')}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-700">{t('Income Limit:', language)} </span>
                <span className="text-slate-600">
                  {s.eligibility_criteria.max_annual_income
                    ? `₹${s.eligibility_criteria.max_annual_income.toLocaleString('en-IN')}`
                    : t('No strict ceiling', language)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/eligibility?scheme=${s.scheme_id}`)}
              >
                {t('Check Eligibility', language)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/documents?scheme=${s.scheme_id}`)}
              >
                {t('Documents', language)}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
