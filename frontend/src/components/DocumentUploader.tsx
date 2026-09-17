import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Loader2,
  FileText,
  ShieldCheck,
  ExternalLink,
  Trash2,
  RefreshCw,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentVerificationResult } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { t } from '../i18n';

interface DocumentUploaderProps {
  language?: string;
  initialDocType?: string;
  schemeId?: string;
  schemeName?: string;
  onDone?: () => void;
  onDocumentSaved?: (doc: any) => void;
}

const DOCUMENT_OPTIONS = [
  { value: 'Aadhaar Card', label: 'Aadhaar Card (UIDAI)', desc: 'Proof of identity & biometric e-KYC' },
  { value: 'Ration Card', label: 'Ration Card (BPL / APL / Antyodaya)', desc: 'Family welfare & food security proof' },
  { value: 'Land Record (RTC / Pahani)', label: 'Land Record (RTC / Pahani / Bhoomi)', desc: 'Agricultural landholding ownership' },
  { value: 'Income Certificate', label: 'Income Certificate (Tehsildar / Revenue)', desc: 'Annual household income verification' },
  { value: 'Caste Certificate', label: 'Caste & Category Certificate', desc: 'SC / ST / OBC / EWS quota verification' },
  { value: 'Bank Passbook', label: 'Bank Passbook (NPCI DBT Linked)', desc: 'Direct Benefit Transfer savings account' },
  { value: 'Degree Marksheet', label: 'Degree / Diploma Passing Marksheet', desc: 'Educational qualification verification' },
  { value: 'Disability Certificate', label: 'Disability / Medical Certificate', desc: 'UDID / Medical board certificate' }
];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  language = 'en',
  initialDocType = 'Aadhaar Card',
  schemeId,
  schemeName,
  onDone,
  onDocumentSaved
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>(initialDocType);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [savingToVault, setSavingToVault] = useState<boolean>(false);
  const [vaultSaved, setVaultSaved] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialDocType) {
      setDocType(initialDocType);
    }
  }, [initialDocType]);

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (selectedFile: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setResult(null);
    setVaultSaved(false);

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setVaultSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveToVault = async () => {
    if (!file) return;
    if (!user) {
      showToast('Please sign in to save documents to your Citizen Vault.', 'info');
      return;
    }
    setSavingToVault(true);
    try {
      const res = await documentService.uploadDocument(file, docType, schemeId);
      if (res.success) {
        setVaultSaved(true);
        showToast('Document securely uploaded to your Citizen Digital Locker & Vault!', 'success');
        if (onDocumentSaved) onDocumentSaved(res);
      } else {
        showToast(res.message || 'Failed to upload document to vault.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading document to vault.', 'error');
    } finally {
      setSavingToVault(false);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);

    // Step-by-step progress simulation for responsive UX
    setAnalysisStep('1/4 Checking file format and byte signature...');
    await new Promise(r => setTimeout(r, 400));

    setAnalysisStep('2/4 Evaluating visual resolution & typography...');
    await new Promise(r => setTimeout(r, 400));

    setAnalysisStep('3/4 Detecting official issuing markers & security tags...');
    await new Promise(r => setTimeout(r, 300));

    try {
      const res = await documentService.verifyDocument(file, docType, schemeId);
      setResult(res);
    } catch (err: any) {
      console.error('Verification failed:', err);
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-govblue-900 to-govblue-800 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-sky-200 border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>AI Automated Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            AI Document Readiness & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
            Upload your government certificates (Aadhaar, RTC, Ration Card, Income/Caste) to verify formatting, visual clarity, and portal compliance before official submission.
          </p>
          {schemeName && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-sky-100 bg-govblue-950/50 px-3 py-1.5 rounded-xl border border-sky-400/20">
              <span className="text-slate-400">Target Scheme:</span>
              <strong className="text-white">{schemeName}</strong>
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-col items-end gap-1.5 text-right shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted & Privacy First</span>
          </div>
          <p className="text-[11px] text-slate-300 max-w-[200px]">
            Numbers are automatically masked to comply with government privacy norms.
          </p>
        </div>
      </div>

      {/* Main Upload Box & Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle flex flex-col gap-6">
        {/* Step 1: Category Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Select Document Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DOCUMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDocType(opt.value)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  docType === opt.value
                    ? 'border-govblue-600 bg-govblue-50/70 ring-2 ring-govblue-600/20 text-govblue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{opt.desc}</div>
                </div>
                {docType === opt.value && (
                  <div className="mt-2 text-[10px] font-bold text-govblue-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-govblue-600" />
                    <span>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Upload Area */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Upload Document File (PDF, JPG, PNG, WEBP)
          </label>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition flex flex-col items-center justify-center gap-4 ${
              dragActive
                ? 'border-govblue-600 bg-govblue-50/50 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-govblue-500 bg-slate-50/50'
            }`}
          >
            {file ? (
              <div className="w-full flex flex-col items-center gap-4">
                {previewUrl ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="max-h-48 max-w-full rounded-2xl object-contain border border-slate-200 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={clearFile}
                        className="bg-white text-rose-600 p-2 rounded-xl shadow-md font-bold text-xs flex items-center gap-1 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md w-full">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'PDF Document'}
                      </p>
                    </div>
                    <button
                      onClick={clearFile}
                      aria-label="Clear file"
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>File attached: {file.name}</span>
                  </span>
                  <button
                    onClick={clearFile}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-govblue-50 text-govblue-800 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Drag and drop your file here, or browse from computer
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts official government PDF, JPG, PNG or WEBP up to 10 MB.
                  </p>
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-govblue-800 hover:bg-govblue-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition">
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Certificate File</span>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Step 3: Trigger Verification */}
        <div>
          <button
            onClick={handleVerify}
            disabled={!file || analyzing}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-govblue-800 hover:bg-govblue-900 text-white shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{analysisStep || 'Analyzing Document Quality & Compliance...'}</span>
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                <span>Run AI Document Verification for {docType}</span>
              </>
            )}
          </button>
        </div>

        {/* Step 4: Verification Result Dashboard */}
        {result && (
          <div className="mt-4 flex flex-col gap-6 animate-fade-in">
            {/* Top Score Banner */}
            <div
              className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                result.verified
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    result.verified
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {result.verified ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        result.verified
                          ? 'bg-emerald-200/60 text-emerald-900'
                          : 'bg-amber-200/60 text-amber-900'
                      }`}
                    >
                      {result.verified ? 'Verified & Portal Ready' : 'Needs Citizen Review'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Format: {result.mime_type}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mt-1 text-slate-900">
                    {result.message}
                  </h3>
                </div>
              </div>

              {/* Score Meter */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto bg-white/80 px-4 py-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Readiness Score</div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {result.readiness_score}%
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xs font-black text-emerald-700 bg-emerald-50">
                  {result.legibility_status}
                </div>
              </div>
            </div>

            {/* Granular Automated Checks List */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Automated Compliance Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.checks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs"
                  >
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{chk.name}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{chk.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Metadata */}
            {Object.keys(result.extracted_info).length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Extracted Document Metadata
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(result.extracted_info).map(([k, v]) => (
                    <div key={k} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">{k}</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations / Citizen Instructions */}
            {result.recommendations.length > 0 && (
              <div className="bg-sky-50/70 rounded-2xl p-5 border border-sky-200 text-xs text-sky-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-govblue-900">
                  <Info className="w-4 h-4 text-govblue-700" />
                  <span>Submission Guidance & Citizen Instructions</span>
                </div>
                <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-slate-700 leading-relaxed">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verify Another</span>
                </button>

                {vaultSaved ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Saved in Citizen Vault</span>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveToVault}
                    disabled={savingToVault || !file}
                    leftIcon={savingToVault ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-govblue-600" />}
                  >
                    <span>{savingToVault ? 'Saving to Vault...' : 'Save to My Document Vault'}</span>
                  </Button>
                )}
              </div>

              {onDone && (
                <Button variant="primary" size="sm" onClick={onDone} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  <span>Return to Checklist</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
