import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { t, translateDocument } from '../i18n';
import { documentService } from '../services/documentService';
import { DocumentChecklistResponse, UserDocument } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ApplyModal } from '../components/schemes/ApplyModal';
import { DocumentUploader } from '../components/DocumentUploader';
import { parseApplicationUrls } from '../utils/urlUtils';
import {
  FileCheck,
  CheckSquare,
  Square,
  Printer,
  Download,
  ExternalLink,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Lock,
  Trash2,
  Eye,
  Plus,
  Search,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  HardDrive
} from 'lucide-react';

interface DocumentChecklistPageProps {
  initialTab?: 'checklist' | 'verifier' | 'vault';
}

const mapDocToCategory = (doc: string): string => {
  const d = doc.toLowerCase();
  if (d.includes('aadhaar')) return 'Aadhaar Card';
  if (d.includes('ration')) return 'Ration Card';
  if (d.includes('land') || d.includes('rtc') || d.includes('pahani') || d.includes('khasra')) return 'Land Record (RTC / Pahani)';
  if (d.includes('income')) return 'Income Certificate';
  if (d.includes('caste')) return 'Caste Certificate';
  if (d.includes('bank') || d.includes('passbook')) return 'Bank Passbook';
  if (d.includes('degree') || d.includes('marksheet') || d.includes('diploma')) return 'Degree Marksheet';
  if (d.includes('disability') || d.includes('medical')) return 'Disability Certificate';
  return 'Aadhaar Card';
};

export const DocumentChecklistPage: React.FC<DocumentChecklistPageProps> = ({ initialTab = 'checklist' }) => {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const schemeId = searchParams.get('scheme') || 'GOI-AGRI-001';
  const tabParam = searchParams.get('tab') as 'checklist' | 'verifier' | 'vault' | null;

  const [activeTab, setActiveTab] = useState<'checklist' | 'verifier' | 'vault'>(
    tabParam || initialTab
  );
  const [verifierDocType, setVerifierDocType] = useState<string>('Aadhaar Card');

  const [checklist, setChecklist] = useState<DocumentChecklistResponse | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Vault state
  const [vaultDocuments, setVaultDocuments] = useState<UserDocument[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('All');
  const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [loadingBlob, setLoadingBlob] = useState(false);
  const [openingFullViewer, setOpeningFullViewer] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<UserDocument | null>(null);

  useEffect(() => {
    if (!previewDoc) {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
      return;
    }

    let isMounted = true;
    setLoadingBlob(true);
    documentService.fetchDocumentBlob(previewDoc.file_id)
      .then(blob => {
        if (!isMounted) return;
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
      })
      .catch(err => {
        console.error('Failed to load preview blob:', err);
        showToast('Failed to load document preview.', 'error');
      })
      .finally(() => {
        if (isMounted) setLoadingBlob(false);
      });

    return () => {
      isMounted = false;
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewDoc]);

  const handleOpenFullViewer = async (doc: UserDocument) => {
    setOpeningFullViewer(true);
    try {
      const url = await documentService.getShortLivedPreviewUrl(doc.file_id);
      window.open(url, '_blank');
    } catch {
      showToast('Failed to generate full-screen viewer ticket.', 'error');
    } finally {
      setOpeningFullViewer(false);
    }
  };

  useEffect(() => {
    if (tabParam && ['checklist', 'verifier', 'vault'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const changeTab = (newTab: 'checklist' | 'verifier' | 'vault') => {
    setActiveTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchChecklist = async () => {
      setLoading(true);
      const res = await documentService.generateChecklist(schemeId, user?.user_profile);
      setChecklist(res);
      setLoading(false);
    };

    fetchChecklist();
  }, [schemeId, user]);

  const loadVaultDocuments = async () => {
    if (!user) {
      setVaultDocuments([]);
      return;
    }
    setLoadingVault(true);
    try {
      const docs = await documentService.getUserDocuments();
      setVaultDocuments(docs);
    } catch {
      // Backend error or guest
      setVaultDocuments([]);
    } finally {
      setLoadingVault(false);
    }
  };

  useEffect(() => {
    loadVaultDocuments();
  }, [user]);

  const toggleDoc = (docName: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const handleDownloadChecklist = () => {
    const textContent = `SEVA OFFICIAL DOCUMENT CHECKLIST
Scheme: ${checklist?.scheme_name}
Target Processing: ~${checklist?.estimated_processing_days} Working Days
Official Portal: ${checklist?.official_portal}
Helpline: ${checklist?.helpline}

MANDATORY DOCUMENTS REQUIRED:
${checklist?.mandatory_documents.map((d, i) => `[ ] ${i + 1}. ${d}`).join('\n')}

OPTIONAL / CATEGORY SPECIFIC:
${checklist?.optional_documents.map((d, i) => `[ ] ${i + 1}. ${d}`).join('\n')}

STEP-BY-STEP PROCESS:
${checklist?.step_by_step_process.join('\n')}

Notice: Ensure bank account is NPCI Aadhaar DBT seeded before submission.
Generated by SEVA (Public Service Assistant).`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Seva_${checklist?.scheme_id || 'Scheme'}_Checklist.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Document checklist downloaded to your device.', 'success');
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    setDeletingDocId(docToDelete.file_id);
    try {
      const res = await documentService.deleteDocument(docToDelete.file_id);
      if (res.success) {
        setVaultDocuments(prev => prev.filter(d => d.file_id !== docToDelete.file_id));
        showToast('Document removed from your vault.', 'success');
        setDocToDelete(null);
      } else {
        showToast(res.message || 'Failed to delete document.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error deleting document.', 'error');
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleDirectDownload = async (doc: UserDocument) => {
    try {
      showToast(`Downloading ${doc.filename}...`, 'info');
      await documentService.downloadDocumentBlob(doc.file_id, doc.filename);
    } catch {
      showToast('Download failed. Please check permissions.', 'error');
    }
  };

  // Find vault documents matching a specific required checklist item
  const getMatchingVaultDoc = (checklistDocName: string): UserDocument | undefined => {
    const targetCategory = mapDocToCategory(checklistDocName).toLowerCase();
    return vaultDocuments.find(d => 
      d.document_type.toLowerCase() === targetCategory ||
      checklistDocName.toLowerCase().includes(d.document_type.toLowerCase())
    );
  };

  const filteredVaultDocs = vaultDocuments.filter(doc => {
    const matchesSearch = 
      doc.filename.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(vaultSearch.toLowerCase());
    const matchesCategory = 
      vaultCategoryFilter === 'All' || doc.document_type === vaultCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoriesInVault = Array.from(new Set(vaultDocuments.map(d => d.document_type)));

  if (loading || !checklist) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading personalized document checklist & vault...
      </div>
    );
  }

  const allDocs = [...checklist.mandatory_documents, ...checklist.optional_documents];
  const readyCount = allDocs.filter(d => checkedDocs[d] || getMatchingVaultDoc(d)).length;
  const progressPercent = Math.round((readyCount / Math.max(1, allDocs.length)) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('Back', language)}</span>
      </button>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => changeTab('checklist')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'checklist'
              ? 'bg-govblue-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{t('Scheme Document Checklist', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => changeTab('vault')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'vault'
              ? 'bg-govblue-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Digital Document Locker & Vault</span>
          {vaultDocuments.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              {vaultDocuments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => changeTab('verifier')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'verifier'
              ? 'bg-govblue-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t('AI Document Verifier', language)}</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
            AI Tool
          </span>
        </button>
      </div>

      {/* TAB 1: AI DOCUMENT VERIFIER */}
      {activeTab === 'verifier' && (
        <DocumentUploader
          language={language}
          initialDocType={verifierDocType}
          schemeId={checklist.scheme_id}
          schemeName={checklist.scheme_name}
          onDone={() => changeTab('checklist')}
          onDocumentSaved={() => {
            loadVaultDocuments();
          }}
        />
      )}

      {/* TAB 2: DIGITAL DOCUMENT LOCKER & VAULT */}
      {activeTab === 'vault' && (
        <div className="flex flex-col gap-6">
          {/* Vault Top Hero Banner */}
          <div className="bg-gradient-to-r from-govblue-950 via-govblue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-govblue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted Citizen Storage (MongoDB Atlas GridFS)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                Citizen Digital Document Locker & Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Store your verified identity cards and government certificates once. Securely reuse them across all state and central scheme applications without ever exposing them to other citizens.
              </p>
              {user && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                    <span className="text-slate-400">Authenticated Citizen: </span>
                    <strong className="text-white font-mono">{user.full_name || user.email}</strong>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                    <span className="text-slate-400">Citizen ID: </span>
                    <strong className="text-sky-300 font-mono">{user.user_id || 'USR-AUTH'}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-end gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => changeTab('verifier')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                <span>Upload to Vault</span>
              </Button>
              <button
                onClick={loadVaultDocuments}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingVault ? 'animate-spin' : ''}`} />
                <span>Refresh Vault</span>
              </button>
            </div>
          </div>

          {!user ? (
            /* Unauthenticated Prompt */
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center flex flex-col items-center gap-4 shadow-subtle">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sign in to Access Your Citizen Document Vault</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
                  Your document vault is user-scoped and encrypted. Only you can view, download, or delete your certificates.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                  <span>Sign In</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                  <span>Create Citizen Account</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Authenticated Vault View */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle flex flex-col gap-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={vaultSearch}
                    onChange={e => setVaultSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-govblue-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-slate-500">Filter:</span>
                  <select
                    value={vaultCategoryFilter}
                    onChange={e => setVaultCategoryFilter(e.target.value)}
                    className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-govblue-600"
                  >
                    <option value="All">All Categories ({vaultDocuments.length})</option>
                    {categoriesInVault.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Items List */}
              {loadingVault ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-govblue-600" />
                  <span>Loading your encrypted vault documents...</span>
                </div>
              ) : filteredVaultDocs.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {vaultDocuments.length === 0 ? 'Your Document Vault is Empty' : 'No matching documents found'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {vaultDocuments.length === 0
                      ? 'Upload your Aadhaar Card, Ration Card, Income or Caste certificates to reuse them in one click.'
                      : 'Try adjusting your search or category filter.'}
                  </p>
                  {vaultDocuments.length === 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => changeTab('verifier')}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      <span>Upload Your First Document</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVaultDocs.map(doc => {
                    const sizeKb = (doc.file_size_bytes / 1024).toFixed(1);
                    const isPdf = doc.content_type === 'application/pdf' || doc.filename.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={doc.file_id}
                        className="p-5 rounded-2xl border border-slate-200 hover:border-govblue-300 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between gap-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-govblue-100 text-govblue-900 mb-1">
                                {doc.document_type}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 break-all">{doc.filename}</h4>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                <span>{sizeKb} KB</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>{doc.verification_status}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-govblue-800 bg-white hover:bg-govblue-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDirectDownload(doc)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            aria-label={`Delete ${doc.filename}`}
                            onClick={() => setDocToDelete(doc)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEME DOCUMENT CHECKLIST */}
      {activeTab === 'checklist' && (
        <>
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-govblue-800 bg-govblue-50 px-2.5 py-1 rounded-full border border-govblue-200 mb-2 inline-block">
                  {t('Preparation Center', language)}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                  {t("Documents You'll Need", language)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t('Document Checklist', language)}: <strong>{checklist.scheme_name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadChecklist}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  {t('Download', language)}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  {t('Print', language)}
                </Button>
              </div>
            </div>

            {/* Progress Tracker Bar */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700">{t('Checklist Readiness', language)}</span>
                <span className="text-govblue-800">
                  {readyCount} {t('of', language)} {allDocs.length} {t('Documents Ready', language)} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-govgreen-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Documents Checkboxes */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Mandatory Documents */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>{t('Mandatory Certificates (Required)', language)}</span>
                  <span className="text-xs font-semibold text-slate-400">
                    {checklist.mandatory_documents.length} {t('Items', language)}
                  </span>
                </h2>

                <div className="space-y-3">
                  {checklist.mandatory_documents.map(doc => {
                    const matchingVaultDoc = getMatchingVaultDoc(doc);
                    const isChecked = checkedDocs[doc] || Boolean(matchingVaultDoc);

                    return (
                      <div
                        key={doc}
                        onClick={() => toggleDoc(doc)}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          aria-label={`Toggle ${doc}`}
                          className="mt-0.5 text-govblue-800 shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`font-bold ${isChecked ? 'text-slate-900' : ''}`}>
                              {translateDocument(doc, language)}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                              {matchingVaultDoc ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(matchingVaultDoc)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-300 transition"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Stored in Vault: {matchingVaultDoc.filename}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerifierDocType(mapDocToCategory(doc));
                                    changeTab('verifier');
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-govblue-800 bg-govblue-50 hover:bg-govblue-100 px-2 py-0.5 rounded-lg border border-govblue-200 transition"
                                >
                                  <Sparkles className="w-3 h-3 text-govblue-600" />
                                  <span>Verify & Upload</span>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {matchingVaultDoc
                              ? 'Fulfilled from your secure Citizen Document Vault.'
                              : t('Accepted format: Original physical copy + self-attested photocopy', language)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional / Category Specific Documents */}
              {checklist.optional_documents.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>{t('Category-Specific / Optional', language)}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {checklist.optional_documents.length} {t('Items', language)}
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {checklist.optional_documents.map(doc => {
                      const matchingVaultDoc = getMatchingVaultDoc(doc);
                      const isChecked = checkedDocs[doc] || Boolean(matchingVaultDoc);

                      return (
                        <div
                          key={doc}
                          onClick={() => toggleDoc(doc)}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                              : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <button
                            type="button"
                            aria-label={`Toggle ${doc}`}
                            className="mt-0.5 text-govblue-800 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <div className="flex-1 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`font-bold ${isChecked ? 'text-slate-900' : ''}`}>
                                {translateDocument(doc, language)}
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                {matchingVaultDoc ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDoc(matchingVaultDoc)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-300 transition"
                                  >
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Stored in Vault</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVerifierDocType(mapDocToCategory(doc));
                                      changeTab('verifier');
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-govblue-800 bg-govblue-50 hover:bg-govblue-100 px-2 py-0.5 rounded-lg border border-govblue-200 transition"
                                  >
                                    <Sparkles className="w-3 h-3 text-govblue-600" />
                                    <span>Verify & Upload</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {t('Required only if claiming specific quota or eligibility concession', language)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step-by-Step Procedure */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  {t('Step-by-Step Process', language)}
                </h3>
                <ol className="space-y-3">
                  {checklist.step_by_step_process.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                      <span className="w-6 h-6 rounded-full bg-govblue-50 text-govblue-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Apply Modal Button Banner */}
              <div className="bg-gradient-to-r from-govblue-900 to-govblue-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold">Have your documents ready?</h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Proceed to the official application gateway or register your application in the Tracker.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="shrink-0"
                >
                  <span>Apply for Scheme</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Portal Link & Nodal Details */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  {t('Official Application Portal', language)}
                </h3>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {t('Once documents are gathered, apply directly on the government portal or visit nearest CSC / Seva Sindhu center.', language)}
                </p>

                <div className="space-y-2 mb-4">
                  {parseApplicationUrls(checklist.official_portal).map((chan, idx) => (
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
                    {t('View Full Application Guidance', language)}
                  </Button>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{checklist.helpline}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
                <ShieldCheck className="w-5 h-5 text-govgreen-600" />
                <strong className="block text-slate-900">{t('Aadhaar DBT Direct Deposit Requirement', language)}</strong>
                <p>
                  {t('Please verify that your active bank account is linked with Aadhaar NPCI mapper. Welfare disbursements are transferred via Direct Benefit Transfer (DBT).', language)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          maxWidth="3xl"
          title={`Document Preview: ${previewDoc.document_type}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>{previewDoc.filename} ({(previewDoc.file_size_bytes / 1024).toFixed(1)} KB)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectDownload(previewDoc)}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  <span>Download</span>
                </Button>
              </div>
            </div>

            <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[320px] max-h-[500px] flex items-center justify-center p-4">
              {loadingBlob ? (
                <div className="text-center p-8 flex flex-col items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-govblue-600 mb-1" />
                  <span>Loading secure document preview...</span>
                </div>
              ) : previewDoc.content_type.startsWith('image/') && previewBlobUrl ? (
                <img
                  src={previewBlobUrl}
                  alt={previewDoc.filename}
                  className="max-h-[460px] max-w-full object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="text-center p-8 flex flex-col items-center gap-3">
                  <FileText className="w-16 h-16 text-govblue-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{previewDoc.filename}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {previewDoc.content_type}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenFullViewer(previewDoc)}
                    disabled={openingFullViewer}
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    <span>{openingFullViewer ? 'Opening Viewer...' : 'Open in Full Viewer (Secure 60s Token)'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <Modal
          isOpen={Boolean(docToDelete)}
          onClose={() => setDocToDelete(null)}
          maxWidth="md"
          title="Delete Stored Document?"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-950 leading-relaxed">
                Are you sure you want to permanently delete <strong>{docToDelete.filename}</strong> from your Digital Document Vault? This cannot be undone.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocToDelete(null)}
                disabled={Boolean(deletingDocId)}
              >
                <span>Cancel</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteDocument}
                disabled={Boolean(deletingDocId)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                <span>{deletingDocId ? 'Deleting...' : 'Delete Permanently'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Application Gateway Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        scheme={{
          scheme_id: checklist.scheme_id,
          scheme_name: checklist.scheme_name,
          short_name: checklist.scheme_name,
          category: 'Government Welfare Scheme',
          application_link: checklist.official_portal,
          grievance_contact: checklist.helpline,
          required_documents: checklist.mandatory_documents,
          processing_time_days: checklist.estimated_processing_days
        }}
      />
    </div>
  );
};
