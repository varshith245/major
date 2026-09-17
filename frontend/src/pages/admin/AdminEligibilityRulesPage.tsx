import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  FileCheck,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Search,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  IndianRupee,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RuleItem {
  scheme_id: string;
  scheme_name: string;
  short_name: string;
  category: string;
  min_age: number;
  max_age: number;
  gender: string;
  max_annual_income: number | null;
  landholding_required: boolean;
  landholding_max_acres: number | null;
  allowed_occupations: string[];
  allowed_castes: string[];
  exclusions?: string[];
}

export const AdminEligibilityRulesPage: React.FC = () => {
  const { showToast } = useToast();
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Interactive Tester State
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [testAge, setTestAge] = useState<number>(32);
  const [testGender, setTestGender] = useState<string>('Female');
  const [testState, setTestState] = useState<string>('Karnataka');
  const [testOccupation, setTestOccupation] = useState<string>('Farmer');
  const [testIncome, setTestIncome] = useState<number>(180000);
  const [testOwnsLand, setTestOwnsLand] = useState<boolean>(true);
  const [testLandAcres, setTestLandAcres] = useState<number>(2.5);
  const [testCaste, setTestCaste] = useState<string>('OBC');

  // Tester Results
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    scheme_id: string;
    scheme_name: string;
    status: string;
    confidence_score: number;
    matched_criteria: string[];
    unmatched_criteria: string[];
    reason: string;
  } | null>(null);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await adminService.getEligibilityRules();
      setRules(res.rules || []);
      if (res.rules?.length && !selectedSchemeId) {
        setSelectedSchemeId(res.rules[0].scheme_id);
      }
    } catch (err: any) {
      console.error('Failed to load rules:', err);
      showToast('Failed to load eligibility rules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleRunTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTesting(true);
    try {
      const res = await adminService.testEligibilityRule({
        scheme_id: selectedSchemeId || undefined,
        age: Number(testAge),
        gender: testGender,
        state: testState,
        occupation: testOccupation,
        annual_income: Number(testIncome),
        owns_land: testOwnsLand,
        landholding_acres: Number(testLandAcres),
        caste_category: testCaste
      });
      setTestResult(res);
      showToast(`Evaluation completed: ${res.status}`, 'success');
    } catch (err: any) {
      console.error('Rule test error:', err);
      showToast(err.message || 'Evaluation engine failed.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSelectRuleForTest = (r: RuleItem) => {
    setSelectedSchemeId(r.scheme_id);
    if (r.allowed_occupations?.length && !r.allowed_occupations.includes('All')) {
      setTestOccupation(r.allowed_occupations[0]);
    }
    if (r.gender !== 'Any') {
      setTestGender(r.gender);
    }
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const categories = Array.from(new Set(rules.map(r => r.category)));

  const filteredRules = rules.filter(r => {
    const matchSearch =
      !search ||
      r.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      r.short_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <FileCheck className="w-3.5 h-3.5" />
            Deterministic AI Rule Evaluation
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Eligibility Rules Engine & Tester
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Audit complex socio-economic eligibility criteria across welfare schemes. Simulate citizen profiles to verify rule boundary conditions and AI classification confidence.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadRules}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rules
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Interactive Evaluation Tester */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Simulator
            </span>
            <h2 className="text-xl font-heading font-black text-white">Citizen Profile Rule Simulator</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Run arbitrary demographic vectors against real government scheme boundary criteria in real-time.
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Target Government Scheme
            </label>
            <select
              value={selectedSchemeId}
              onChange={e => setSelectedSchemeId(e.target.value)}
              className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              {rules.map(r => (
                <option key={r.scheme_id} value={r.scheme_id}>
                  {r.short_name} ({r.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Inputs */}
          <form onSubmit={handleRunTest} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Age */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="110"
                  value={testAge}
                  onChange={e => setTestAge(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={testGender}
                  onChange={e => setTestGender(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Transgender</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">State</label>
                <select
                  value={testState}
                  onChange={e => setTestState(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="All-India">All India</option>
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Occupation</label>
                <input
                  type="text"
                  value={testOccupation}
                  onChange={e => setTestOccupation(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500"
                />
              </div>

              {/* Annual Income */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  step="5000"
                  value={testIncome}
                  onChange={e => setTestIncome(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500"
                />
              </div>

              {/* Caste */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Caste Category</label>
                <select
                  value={testCaste}
                  onChange={e => setTestCaste(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            {/* Landholding */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={testOwnsLand}
                  onChange={e => setTestOwnsLand(e.target.checked)}
                  className="w-4 h-4 text-govblue-600 rounded-sm border-slate-300 focus:ring-govblue-500"
                />
                <span className="text-xs font-bold text-slate-800">Owns Agricultural Land</span>
              </label>

              {testOwnsLand && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Land Size:</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={testLandAcres}
                    onChange={e => setTestLandAcres(Number(e.target.value))}
                    className="w-20 text-xs font-semibold p-1.5 rounded-lg border border-slate-200 bg-white text-center"
                  />
                  <span className="text-[11px] text-slate-500">Acres</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={testing}
              className="w-full py-3 rounded-2xl bg-govblue-600 hover:bg-govblue-700 text-white font-bold text-xs shadow-md shadow-govblue-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-4 h-4 ${testing ? 'animate-spin' : 'fill-current'}`} />
              {testing ? 'Executing Deterministic Logic...' : 'Run Live Rule Evaluation'}
            </button>
          </form>

          {/* Test Results Output */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
            {testResult ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Scheme Evaluated
                    </span>
                    <h3 className="font-heading font-black text-slate-900 text-sm">
                      {testResult.scheme_name}
                    </h3>
                  </div>

                  {/* Status Pill */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      testResult.status === 'Eligible'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : testResult.status === 'Likely Eligible'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {testResult.status === 'Eligible' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : testResult.status === 'Likely Eligible' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {testResult.status}
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Engine Confidence Score</span>
                    <span>{Math.round(testResult.confidence_score * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        testResult.confidence_score >= 0.85 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${testResult.confidence_score * 100}%` }}
                    />
                  </div>
                </div>

                {/* Matched Criteria */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1.5">
                    ✓ Matched Criteria ({testResult.matched_criteria.length})
                  </span>
                  <div className="space-y-1">
                    {testResult.matched_criteria.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-900 flex items-start gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unmatched Criteria */}
                {testResult.unmatched_criteria.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
                      ✕ Unmet Requirements ({testResult.unmatched_criteria.length})
                    </span>
                    <div className="space-y-1">
                      {testResult.unmatched_criteria.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] p-2 rounded-lg bg-rose-50/80 border border-rose-100 text-rose-900 flex items-start gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning summary */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Decision Rationale:</span>
                  {testResult.reason}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Sliders className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">Awaiting Simulation</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Fill in the citizen parameters and click &quot;Run Live Rule Evaluation&quot; to test the deterministic rules engine.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Registry Catalog */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-heading font-black text-slate-900">
              Government Scheme Rules Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredRules.length} registered welfare rules and qualification boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter rules by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-800"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Age Limits</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Income Cap</th>
                <th className="py-3 px-4">Landholding</th>
                <th className="py-3 px-4">Occupations</th>
                <th className="py-3 px-4 text-right">Quick Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRules.map(r => (
                <tr key={r.scheme_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{r.short_name}</div>
                    <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[180px]">
                      {r.scheme_id}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {r.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {r.min_age} - {r.max_age} yrs
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        r.gender === 'Female'
                          ? 'text-pink-600'
                          : r.gender === 'Male'
                          ? 'text-blue-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {r.gender}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {r.max_annual_income != null ? (
                      <span className="font-semibold text-slate-800">
                        ₹{Number(r.max_annual_income).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-slate-400">No limit</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {r.landholding_required ? (
                      <span className="text-amber-700 font-bold text-[11px]">
                        Max {r.landholding_max_acres || 2} acres
                      </span>
                    ) : (
                      <span className="text-slate-400">Not required</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="truncate max-w-[140px]" title={r.allowed_occupations?.join(', ')}>
                      {r.allowed_occupations?.join(', ') || 'All'}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSelectRuleForTest(r)}
                      className="px-2.5 py-1 rounded-lg bg-govblue-50 text-govblue-700 hover:bg-govblue-600 hover:text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                    >
                      Test
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
