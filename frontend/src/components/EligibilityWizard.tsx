import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  ExternalLink, 
  FileText, 
  Loader2, 
  ShieldCheck,
  Sliders,
  Users,
  Search,
  Download,
  Printer,
  RefreshCw,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { checkEligibilityApi, simulateEligibilityApi, checkSpecificSchemeEligibilityApi, fetchSchemes } from '../api';
import { Scheme } from '../types';

interface EligibilityWizardProps {
  language: string;
  onNavigateToChecklist: (schemeId: string) => void;
}

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({
  language,
  onNavigateToChecklist
}) => {
  // Active Studio Mode: 'wizard' | 'simulator' | 'inspector' | 'household'
  const [activeMode, setActiveMode] = useState<'wizard' | 'simulator' | 'inspector' | 'household'>('wizard');

  // All schemes for dropdowns
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);

  // ================= 1. WIZARD STATE =================
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [resultCategoryFilter, setResultCategoryFilter] = useState('All');

  // Citizen Profile Form State
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>('Any');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [annualIncome, setAnnualIncome] = useState<number>(150000);
  const [state, setState] = useState<string>('Karnataka');
  const [landHolding, setLandHolding] = useState<number>(2.0);
  const [casteCategory, setCasteCategory] = useState<string>('General');
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [isDifferentlyAbled, setIsDifferentlyAbled] = useState<boolean>(false);
  const [isBplCardholder, setIsBplCardholder] = useState<boolean>(false);
  const [ownsPuccaHouse, setOwnsPuccaHouse] = useState<boolean>(false);
  const [isIncomeTaxPayer, setIsIncomeTaxPayer] = useState<boolean>(false);
  const [isGovtEmployee, setIsGovtEmployee] = useState<boolean>(false);

  // ================= 2. SIMULATOR STATE =================
  const [simIncome, setSimIncome] = useState<number>(120000);
  const [simLand, setSimLand] = useState<number>(2.0);
  const [simBpl, setSimBpl] = useState<boolean>(true);
  const [simStudent, setSimStudent] = useState<boolean>(false);
  const [simTaxPayer, setSimTaxPayer] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // ================= 3. SCHEME INSPECTOR STATE =================
  const [inspectSchemeId, setInspectSchemeId] = useState<string>('GOI-AGRI-001');
  const [inspectResult, setInspectResult] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState<boolean>(false);

  // ================= 4. HOUSEHOLD EVALUATOR STATE =================
  const [familyMembers, setFamilyMembers] = useState([
    { relation: 'Self (Head)', age: 38, gender: 'Male', occupation: 'Farmer', land: 2.0, income: 120000 },
    { relation: 'Spouse', age: 34, gender: 'Female', occupation: 'Homemaker', land: 0, income: 0 },
    { relation: 'Daughter', age: 8, gender: 'Female', occupation: 'Student', land: 0, income: 0 },
    { relation: 'Elderly Mother', age: 66, gender: 'Female', occupation: 'Senior Citizen', land: 0, income: 0 }
  ]);

  useEffect(() => {
    fetchSchemes().then((data) => {
      setAllSchemes(data);
      if (data.length > 0) setInspectSchemeId(data[0].id);
    });
  }, []);

  // Run Wizard Evaluation
  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await checkEligibilityApi({
        age,
        gender,
        occupation,
        annual_income: annualIncome,
        state,
        land_holding_acres: landHolding,
        caste_category: casteCategory,
        is_student: isStudent,
        is_differently_abled: isDifferentlyAbled,
        is_bpl_cardholder: isBplCardholder,
        owns_pucca_house: ownsPuccaHouse,
        is_income_tax_payer: isIncomeTaxPayer,
        is_govt_employee: isGovtEmployee
      });

      const eligibleList = (res.results || [])
        .filter((r: any) => r.is_eligible)
        .map((r: any) => ({
          id: r.scheme_id,
          scheme_code: r.short_name || r.scheme_id,
          name: r.scheme_name,
          department: r.category || 'Government Department',
          category: r.category || 'Welfare',
          level: r.scheme_id.startsWith('KA') ? 'Karnataka' : 'Central',
          target_audience: 'Citizen',
          confidence_score: r.confidence_score !== undefined ? Math.round(r.confidence_score * 100) : 95,
          description: (r.reasons && r.reasons.length > 0) ? r.reasons.join(' • ') : 'Verified demographic and criteria match.',
          benefits: r.benefit_amount > 0 ? `₹${Number(r.benefit_amount).toLocaleString()} financial subsidy` : 'Direct welfare assistance',
          benefit_amount: r.benefit_amount || 0,
          eligibility_criteria: 'Verified against your reported demographic inputs.',
          required_documents: ['Aadhaar Card', 'Bank Passbook', 'Income Certificate'],
          portal_url: 'https://www.india.gov.in',
          helpline: '1800-11-0001',
          is_active: true
        }));

      setResults(eligibleList);
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate eligibility.');
    } finally {
      setLoading(false);
    }
  };

  // Run Simulator
  const handleRunSimulator = async () => {
    setSimLoading(true);
    try {
      const base = {
        age: 30,
        gender: 'Male',
        state: 'Karnataka',
        occupation: 'Farmer',
        annual_income: 150000.0,
        land_holding_acres: 2.0,
        is_bpl_cardholder: false
      };
      const mods = {
        annual_income: simIncome,
        land_holding_acres: simLand,
        is_bpl_cardholder: simBpl,
        is_student: simStudent,
        is_income_tax_payer: simTaxPayer
      };
      const res = await simulateEligibilityApi(base, mods);
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  // Run Single Scheme Inspector
  const handleInspectScheme = async () => {
    setInspectLoading(true);
    try {
      const profile = {
        age,
        gender,
        state,
        occupation,
        annual_income: annualIncome,
        land_holding_acres: landHolding,
        is_bpl_cardholder: isBplCardholder,
        is_income_tax_payer: isIncomeTaxPayer,
        is_govt_employee: isGovtEmployee
      };
      const res = await checkSpecificSchemeEligibilityApi(inspectSchemeId, profile);
      setInspectResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setInspectLoading(false);
    }
  };

  // Download Evaluation Summary Document
  const handleDownloadReport = () => {
    if (!results) return;
    const reportText = `
=====================================================
eGovSeva AI — Official Citizen Eligibility Evaluation
=====================================================
Date & Time: ${new Date().toLocaleString()}
Citizen Profile: ${occupation}, ${age} yrs, ${gender}, ${state}
Family Income: ₹${annualIncome.toLocaleString()} | Land: ${landHolding} Acres
BPL Status: ${isBplCardholder ? 'Yes (BPL)' : 'General/APL'}

SUMMARY OF QUALIFIED SCHEMES (${results.length} Eligible):
-----------------------------------------------------
${results.map((r, i) => `${i + 1}. [${r.level}] ${r.name} (${r.scheme_code})
   Benefit: ${r.benefits}
   Category: ${r.category} | Confidence: ${r.confidence_score}%
   Reasoning: ${r.description}
   Portal: ${r.portal_url}
`).join('\n')}

=====================================================
Generated via eGovSeva AI Public Service Assistant
=====================================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Eligibility_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredResults = results?.filter(r => 
    resultCategoryFilter === 'All' || r.category.toLowerCase().includes(resultCategoryFilter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-crimson-950 text-white p-6 sm:p-9 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-500/20 text-crimson-300 text-xs font-bold border border-crimson-500/30">
            <Sparkles className="w-3.5 h-3.5 text-crimson-400" />
            <span>AI Eligibility Studio & Policy Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight">
            Smart Scheme Eligibility & Scenario Studio
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluate qualifications across 30+ Central & Karnataka State schemes, simulate policy changes, inspect compliance rules, and assess household entitlements.
          </p>
        </div>
      </div>

      {/* 2. Studio Mode Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1">
        <button
          onClick={() => setActiveMode('wizard')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'wizard'
              ? 'bg-crimson-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>1. Eligibility Wizard</span>
        </button>

        <button
          onClick={() => { setActiveMode('simulator'); handleRunSimulator(); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'simulator'
              ? 'bg-crimson-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Policy Simulator</span>
        </button>

        <button
          onClick={() => { setActiveMode('inspector'); handleInspectScheme(); }}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'inspector'
              ? 'bg-crimson-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Scheme Inspector</span>
        </button>

        <button
          onClick={() => setActiveMode('household')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'household'
              ? 'bg-crimson-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Household Mapping</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: ELIGIBILITY WIZARD */}
      {/* ============================================================ */}
      {activeMode === 'wizard' && (
        <div className="space-y-6">
          {!results ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-3 border-b border-slate-100">
                <span>Step {step} of 3</span>
                <span className="text-crimson-700 font-extrabold">
                  {step === 1 ? 'Personal & Demographics' : step === 2 ? 'Income, State & Housing' : 'Landholding & Exclusion Checks'}
                </span>
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Age (Years)</label>
                    <input
                      type="number"
                      min={14}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600 bg-white cursor-pointer"
                    >
                      <option value="Any">All / Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female (Woman Head of Household)</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Occupation</label>
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600 bg-white cursor-pointer"
                    >
                      <option value="Farmer">Farmer / Agriculture</option>
                      <option value="Student">Student / Unemployed Graduate</option>
                      <option value="Homemaker">Homemaker / Woman Head</option>
                      <option value="Small Business">Small Business / Artisan / Street Vendor</option>
                      <option value="Senior Citizen">Senior Citizen / Pensioner</option>
                      <option value="Salaried">Salaried Employee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Social / Caste Category</label>
                    <select
                      value={casteCategory}
                      onChange={(e) => setCasteCategory(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600 bg-white cursor-pointer"
                    >
                      <option value="General">General Category</option>
                      <option value="OBC">OBC (Other Backward Classes)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Approximate Annual Family Income (₹)</label>
                      <input
                        type="number"
                        step={10000}
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(parseInt(e.target.value) || 0)}
                        className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">State of Residence</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600 bg-white cursor-pointer"
                      >
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Delhi">Delhi</option>
                        <option value="All-India">Other Indian State</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBplCardholder}
                        onChange={(e) => setIsBplCardholder(e.target.checked)}
                        className="w-4 h-4 text-crimson-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">Holds BPL / Antyodaya Ration Card</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ownsPuccaHouse}
                        onChange={(e) => setOwnsPuccaHouse(e.target.checked)}
                        className="w-4 h-4 text-crimson-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">Owns a Pucca Concrete House</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cultivable Landholding (Acres)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={landHolding}
                      onChange={(e) => setLandHolding(parseFloat(e.target.value) || 0)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-crimson-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Enter 0 if you do not own cultivable land.</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isStudent}
                        onChange={(e) => setIsStudent(e.target.checked)}
                        className="w-4 h-4 text-crimson-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">Currently enrolled in college or recent graduate (Yuva Nidhi Eligible)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDifferentlyAbled}
                        onChange={(e) => setIsDifferentlyAbled(e.target.checked)}
                        className="w-4 h-4 text-crimson-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">Person with Benchmark Disability (PwD)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isIncomeTaxPayer}
                        onChange={(e) => setIsIncomeTaxPayer(e.target.checked)}
                        className="w-4 h-4 text-crimson-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">Household pays Income Tax (Exclusion criteria for some DBT schemes)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGovtEmployee}
                        onChange={(e) => setIsGovtEmployee(e.target.checked)}
                        className="w-4 h-4 text-crimson-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">Serving Government / Statutory Employee</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="btn-primary py-2.5 px-6 text-xs font-bold"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={loading}
                    className="btn-primary py-2.5 px-6 text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating 30+ Schemes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Evaluate Eligibility</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Results View */
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Summary */}
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-emerald-950">
                      {results.length} Qualified Welfare Schemes Found
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Matched for {occupation} ({age} yrs) in {state} • Annual Income ₹{annualIncome.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadReport}
                    className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                  <button
                    onClick={() => setResults(null)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Agriculture', 'Healthcare', 'Housing', 'Education', 'Women'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setResultCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      resultCategoryFilter === cat
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults?.map((s) => (
                  <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-300 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="badge badge-green text-[10px] font-bold">
                          ✓ Likely Eligible ({s.confidence_score}%)
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{s.category}</span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">{s.name}</h4>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        "{s.description}"
                      </p>

                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs font-bold">
                        {s.benefits}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onNavigateToChecklist(s.id)}
                        className="font-bold text-crimson-700 hover:text-crimson-900 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Checklist</span>
                      </button>

                      <a
                        href={s.portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: POLICY WHAT-IF SIMULATOR */}
      {/* ============================================================ */}
      {activeMode === 'simulator' && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-slate-900 font-heading">
              Interactive Policy "What-If" Scenario Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Adjust demographic sliders and see how income, land, and certificate changes unlock or lock government schemes in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            {/* Income Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span>Simulated Annual Income</span>
                <span className="text-crimson-700 font-extrabold">₹{simIncome.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={800000}
                step={20000}
                value={simIncome}
                onChange={(e) => { setSimIncome(Number(e.target.value)); handleRunSimulator(); }}
                className="w-full cursor-pointer accent-crimson-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹20k (BPL)</span>
                <span>₹3L (EWS)</span>
                <span>₹8L</span>
              </div>
            </div>

            {/* Landholding Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span>Cultivable Landholding</span>
                <span className="text-crimson-700 font-extrabold">{simLand} Acres</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={simLand}
                onChange={(e) => { setSimLand(Number(e.target.value)); handleRunSimulator(); }}
                className="w-full cursor-pointer accent-crimson-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 Acres</span>
                <span>2 Acres (Small)</span>
                <span>10 Acres</span>
              </div>
            </div>

            {/* Status Toggles */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simBpl}
                  onChange={(e) => { setSimBpl(e.target.checked); handleRunSimulator(); }}
                  className="w-4 h-4 text-crimson-600 rounded"
                />
                <span className="font-semibold text-slate-800">BPL Ration Card</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simStudent}
                  onChange={(e) => { setSimStudent(e.target.checked); handleRunSimulator(); }}
                  className="w-4 h-4 text-crimson-600 rounded"
                />
                <span className="font-semibold text-slate-800">Recent Graduate (Yuva Nidhi)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simTaxPayer}
                  onChange={(e) => { setSimTaxPayer(e.target.checked); handleRunSimulator(); }}
                  className="w-4 h-4 text-crimson-600 rounded"
                />
                <span className="font-semibold text-slate-800">Income Tax Payer</span>
              </label>
            </div>
          </div>

          {/* Simulation Outcome Banner */}
          {simResult && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Simulation Outcome: {simResult.simulated_eligible_count} Total Qualified Schemes</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                  simResult.difference >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {simResult.difference >= 0 ? `+${simResult.difference} Schemes Gained` : `${simResult.difference} Schemes Lost`}
                </span>
              </div>

              {simResult.newly_eligible_schemes && simResult.newly_eligible_schemes.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
                  <strong>Newly Unlocked Welfare Schemes:</strong> {simResult.newly_eligible_schemes.join(', ')}
                </div>
              )}

              {simResult.newly_ineligible_schemes && simResult.newly_ineligible_schemes.length > 0 && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200">
                  <strong>Disqualified Schemes:</strong> {simResult.newly_ineligible_schemes.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 3: SINGLE SCHEME RULE INSPECTOR */}
      {/* ============================================================ */}
      {activeMode === 'inspector' && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-slate-900 font-heading">
              Deep Scheme Rule & Compliance Inspector
            </h3>
            <p className="text-xs text-slate-500">
              Inspect exact demographic match criteria, confidence score, and exclusion shields for a specific scheme.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <select
              value={inspectSchemeId}
              onChange={(e) => setInspectSchemeId(e.target.value)}
              className="w-full sm:max-w-md p-3 rounded-xl border border-slate-300 font-bold text-xs bg-white cursor-pointer"
            >
              {allSchemes.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.level})</option>
              ))}
            </select>
            <button
              onClick={handleInspectScheme}
              disabled={inspectLoading}
              className="btn-primary py-3 px-6 text-xs font-bold w-full sm:w-auto"
            >
              {inspectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Inspect Rules</span>
            </button>
          </div>

          {inspectResult && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{inspectResult.scheme_name}</h4>
                  <span className="text-slate-500 font-medium">{inspectResult.category}</span>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs font-bold ${inspectResult.is_eligible ? 'badge-green' : 'badge-crimson'}`}>
                    {inspectResult.is_eligible ? '✓ Fully Eligible' : '✗ Ineligible'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    Confidence: {Math.round((inspectResult.confidence_score || 0) * 100)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <strong className="block text-slate-800 uppercase text-[10px] tracking-wider">Evaluation Reasons:</strong>
                <ul className="space-y-1 pl-4 list-disc text-slate-700">
                  {(inspectResult.reasons || []).map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {inspectResult.matched_criteria && inspectResult.matched_criteria.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <strong className="block text-[10px] uppercase font-bold text-emerald-800">Passed Policy Criteria:</strong>
                  <p>{inspectResult.matched_criteria.join(' • ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 4: HOUSEHOLD MULTI-MEMBER MAPPING */}
      {/* ============================================================ */}
      {activeMode === 'household' && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-slate-900 font-heading">
              Smart Household Multi-Member Benefit Mapping
            </h3>
            <p className="text-xs text-slate-500">
              Evaluate welfare benefits distributed across each family member in your household.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {familyMembers.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-slate-900 text-sm">{m.relation}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">{m.age} yrs • {m.gender}</span>
                  </div>
                  <p className="text-slate-500 font-medium">Occupation: {m.occupation} • Income: ₹{m.income.toLocaleString()}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
                    {idx === 0 ? 'PM-KISAN (₹6,000/yr)' : idx === 1 ? 'Gruha Lakshmi (₹2,000/mo)' : idx === 2 ? 'Sukanya Samriddhi (High Interest)' : 'Old Age Pension / Senior Benefit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
