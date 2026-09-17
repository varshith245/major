import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Wheat, 
  HeartPulse, 
  GraduationCap, 
  Users2, 
  Home, 
  Phone,
  Building2,
  Check,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { Scheme } from '../types';
import { fetchSchemes, compareSchemesApi } from '../api';

interface SchemeComparisonProps {
  language: string;
  onNavigateToChecklist: (schemeId: string) => void;
}

export const SchemeComparison: React.FC<SchemeComparisonProps> = ({
  language,
  onNavigateToChecklist
}) => {
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['GOI-AGRI-001', 'KA-AGRI-002', 'GOI-HLTH-001']);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  useEffect(() => {
    fetchSchemes()
      .then((data) => {
        setAllSchemes(data);
        const initial = data.slice(0, 3).map(s => s.id);
        setSelectedIds(initial);
        runComparison(initial);
      })
      .catch(console.error);
  }, []);

  const runComparison = async (ids: string[]) => {
    if (ids.length < 1) return;
    setLoading(true);
    try {
      const res = await compareSchemesApi(ids, undefined, language);
      setComparisonData(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchemeSelection = (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        alert('Please keep at least 1 scheme selected.');
        return;
      }
      next = selectedIds.filter(i => i !== id);
    } else {
      if (selectedIds.length >= 6) {
        alert('You can compare up to 6 schemes simultaneously for optimal view.');
        return;
      }
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    runComparison(next);
  };

  const applyCategoryPreset = (category: string) => {
    setActiveCategoryFilter(category);
    let matched = allSchemes;
    if (category !== 'All') {
      matched = allSchemes.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }
    const ids = matched.slice(0, 5).map(s => s.id);
    if (ids.length > 0) {
      setSelectedIds(ids);
      runComparison(ids);
    }
  };

  const selectAllCategory = () => {
    const ids = allSchemes.map(s => s.id);
    setSelectedIds(ids);
    runComparison(ids);
  };

  const comparedSchemes: Scheme[] = comparisonData?.schemes || allSchemes.filter(s => selectedIds.includes(s.id));
  const fields = comparisonData?.comparison_fields || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-crimson-950 text-white p-6 sm:p-9 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-500/20 text-crimson-300 text-xs font-bold border border-crimson-500/30">
            <Scale className="w-3.5 h-3.5 text-crimson-400" />
            <span>Comprehensive Scheme Comparison Matrix</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight">
            Compare Government Schemes & Benefits
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Side-by-side evaluation across financial assistance, eligibility conditions, required documents, application process, and department turnaround times.
          </p>
        </div>
      </div>

      {/* 2. Preset Sector Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          Quick Comparison Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyCategoryPreset('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === 'All'
                ? 'bg-crimson-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Top Welfare Initiatives (All)</span>
          </button>

          <button
            onClick={() => applyCategoryPreset('Agriculture')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === 'Agriculture'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-emerald-600" />
            <span>Agriculture (PM-KISAN, Krishi Sinchayee, Crop Insurance)</span>
          </button>

          <button
            onClick={() => applyCategoryPreset('Healthcare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === 'Healthcare'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>Healthcare (Ayushman Bharat, Arogya Karnataka)</span>
          </button>

          <button
            onClick={() => applyCategoryPreset('Education')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === 'Education'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Youth & Education (Yuva Nidhi, Scholarships)</span>
          </button>

          <button
            onClick={() => applyCategoryPreset('Women')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === 'Women'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Women Welfare (Gruha Lakshmi, Sukanya)</span>
          </button>

          <button
            onClick={selectAllCategory}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Compare All 30 Schemes</span>
          </button>
        </div>
      </div>

      {/* 3. Scheme Selection Chips Tray */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Selected for Comparison ({selectedIds.length} schemes active):
          </span>
          <span className="text-[11px] text-slate-400">Click any scheme chip to add/remove</span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          {allSchemes.map((scheme) => {
            const isSelected = selectedIds.includes(scheme.id);
            return (
              <button
                key={scheme.id}
                onClick={() => toggleSchemeSelection(scheme.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-crimson-50 border-crimson-300 text-crimson-900 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  isSelected ? 'bg-crimson-600 text-white' : 'border border-slate-300'
                }`}>
                  {isSelected ? '✓' : '+'}
                </span>
                <span className="truncate max-w-[180px]">{scheme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Complete Comparison Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-600 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Evaluating comparison across all feature dimensions...</p>
        </div>
      ) : comparedSchemes.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Header Row: Scheme Names */}
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-4 font-black uppercase text-[11px] w-56 min-w-[200px] sticky left-0 bg-slate-900 z-10">
                    Feature & Dimension
                  </th>
                  {comparedSchemes.map((s) => (
                    <th key={s.id} className="p-4 font-bold text-sm min-w-[240px] max-w-[280px]">
                      <div className="space-y-1">
                        <span className={`badge text-[9px] font-extrabold ${
                          s.level === 'Central' ? 'badge-blue' : 'badge-crimson'
                        }`}>
                          {s.level === 'Central' ? 'Central Scheme' : 'Karnataka State'}
                        </span>
                        <h3 className="font-extrabold text-white text-sm line-clamp-2 leading-snug">
                          {s.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {s.scheme_code}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                
                {/* 1. Category / Sector */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Welfare Sector
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 font-bold text-slate-800">
                      {s.category}
                    </td>
                  ))}
                </tr>

                {/* 2. Ministry / Department */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Ministry / Department
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 text-slate-600 font-medium">
                      {s.department}
                    </td>
                  ))}
                </tr>

                {/* 3. Financial Assistance / Payout */}
                <tr className="hover:bg-slate-50/60 transition bg-emerald-50/30">
                  <td className="p-4 font-extrabold text-emerald-950 bg-emerald-50/80 sticky left-0 z-10">
                    Financial Payout / Subsidy
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 font-black text-emerald-700 text-sm">
                      {s.benefits}
                    </td>
                  ))}
                </tr>

                {/* 4. Description & Key Entitlements */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Key Entitled Benefits
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 text-slate-600 leading-relaxed text-xs">
                      {s.description}
                    </td>
                  ))}
                </tr>

                {/* 5. Age Limits */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Age Criteria
                  </td>
                  {comparedSchemes.map((s, idx) => (
                    <td key={s.id} className="p-4 text-slate-700 font-semibold">
                      {fields.age_criteria?.[idx] || 'Applicable to adults (18+)'}
                    </td>
                  ))}
                </tr>

                {/* 6. Income Ceiling */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Annual Income Limit
                  </td>
                  {comparedSchemes.map((s, idx) => (
                    <td key={s.id} className="p-4 text-slate-700 font-semibold">
                      {fields.income_limits?.[idx] || 'Income verified per guidelines'}
                    </td>
                  ))}
                </tr>

                {/* 7. Landholding Requirement */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Landholding Rules
                  </td>
                  {comparedSchemes.map((s, idx) => (
                    <td key={s.id} className="p-4 text-slate-700 font-semibold">
                      {fields.landholding_rules?.[idx] || (s.category === 'Agriculture' ? 'Cultivable land RTC required' : 'Not required')}
                    </td>
                  ))}
                </tr>

                {/* 8. Mandatory Documents */}
                <tr className="hover:bg-slate-50/60 transition bg-amber-50/20">
                  <td className="p-4 font-extrabold text-amber-950 bg-amber-50/80 sticky left-0 z-10">
                    Required Documents
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 space-y-1">
                      {s.required_documents.map((doc, dIdx) => (
                        <span key={dIdx} className="block text-[11px] font-semibold text-slate-800">
                          • {doc}
                        </span>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* 9. Processing Turnaround */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Processing Turnaround
                  </td>
                  {comparedSchemes.map((s, idx) => (
                    <td key={s.id} className="p-4 text-slate-700 font-medium">
                      {fields.processing_times?.[idx] || '15 - 30 Working Days'}
                    </td>
                  ))}
                </tr>

                {/* 10. Citizen Helpline */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-extrabold text-slate-900 bg-slate-50/80 sticky left-0 z-10">
                    Helpline Contact
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 text-slate-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-crimson-600" />
                        <span>{s.helpline}</span>
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 11. Actions & Application */}
                <tr className="bg-slate-50/90">
                  <td className="p-4 font-extrabold text-slate-900 sticky left-0 z-10 bg-slate-100">
                    Direct Actions
                  </td>
                  {comparedSchemes.map((s) => (
                    <td key={s.id} className="p-4 space-y-2">
                      <button
                        onClick={() => onNavigateToChecklist(s.id)}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-crimson-600" />
                        <span>Document Checklist</span>
                      </button>

                      <a
                        href={s.portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs text-center"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      ) : null}

    </div>
  );
};
