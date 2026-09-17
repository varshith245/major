import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { ApplicationRecord } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getPrimaryApplicationUrl } from '../../utils/urlUtils';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  FileText,
  Filter,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  Layers,
  Calendar,
  User,
  Check
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const { showToast } = useToast();

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected application for review modal
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [decisionActionType, setDecisionActionType] = useState<'STATUS_UPDATE' | 'DOCUMENT_REQUEST' | 'BENEFIT_SANCTION'>('STATUS_UPDATE');
  const [decisionStatus, setDecisionStatus] = useState<string>('Under Review');
  const [decisionStage, setDecisionStage] = useState<string>('Document Verification in Progress');
  const [decisionOrder, setDecisionOrder] = useState<number>(2);
  const [officialNotes, setOfficialNotes] = useState<string>('');
  const [missingDocsInput, setMissingDocsInput] = useState<string>('');
  const [sanctionAmountInput, setSanctionAmountInput] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // Deletion target
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const records = await adminService.getApplications();
      setApplications(records || []);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      showToast(err.message || 'Failed to retrieve application queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const openReviewModal = (app: ApplicationRecord) => {
    setSelectedApp(app);
    setDecisionActionType('STATUS_UPDATE');
    setDecisionStatus(app.status || 'Under Review');
    setDecisionStage(app.current_stage || 'Document Verification in Progress');
    setDecisionOrder(app.stage_order || 2);
    setOfficialNotes(app.notes || '');
    setMissingDocsInput('');
    setSanctionAmountInput('');
  };

  const handleSelectActionType = (action: 'STATUS_UPDATE' | 'DOCUMENT_REQUEST' | 'BENEFIT_SANCTION') => {
    setDecisionActionType(action);
    if (action === 'DOCUMENT_REQUEST') {
      setDecisionStatus('Under Review');
      setDecisionStage('Documents Requested');
      setDecisionOrder(2);
      if (!officialNotes) {
        setOfficialNotes('Additional documents requested for verification.');
      }
    } else if (action === 'BENEFIT_SANCTION') {
      setDecisionStatus('Approved');
      setDecisionStage('Benefit Sanctioned');
      setDecisionOrder(4);
      if (!officialNotes) {
        setOfficialNotes('Benefit entitlement sanctioned and approved for disbursement.');
      }
    } else {
      handleStatusPresetChange(decisionStatus);
    }
  };

  const handleStatusPresetChange = (newStatus: string) => {
    setDecisionStatus(newStatus);
    if (newStatus === 'Under Review') {
      setDecisionStage('Document Verification in Progress');
      setDecisionOrder(2);
    } else if (newStatus === 'Approved') {
      setDecisionStage('Sanctioned & Direct Benefit Disbursed');
      setDecisionOrder(3);
    } else if (newStatus === 'Rejected') {
      setDecisionStage('Application Rejected by Nodal Authority');
      setDecisionOrder(2);
    } else if (newStatus === 'Submitted') {
      setDecisionStage('Application Submitted');
      setDecisionOrder(1);
    }
  };

  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const missingDocsArray =
        decisionActionType === 'DOCUMENT_REQUEST' && missingDocsInput.trim()
          ? missingDocsInput.split(',').map(s => s.trim()).filter(Boolean)
          : undefined;

      const sanctionAmountNumber =
        decisionActionType === 'BENEFIT_SANCTION' && sanctionAmountInput.trim()
          ? parseFloat(sanctionAmountInput)
          : undefined;

      const updated = await adminService.updateApplicationStatus(selectedApp.id, {
        status: decisionStatus,
        current_stage: decisionStage,
        stage_order: decisionOrder,
        notes: officialNotes.trim() || undefined,
        action_type: decisionActionType,
        missing_documents: missingDocsArray,
        sanction_amount: sanctionAmountNumber
      });

      setApplications(prev => prev.map(a => (a.id === selectedApp.id ? updated : a)));
      showToast(
        `Application #${selectedApp.reference_no} updated. Multi-channel alerts dispatched (In-App, SMS & Email simulated).`,
        'success'
      );
      setSelectedApp(null);
    } catch (err: any) {
      console.error('Decision update failed:', err);
      showToast(err.message || 'Failed to record official nodal decision.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await adminService.deleteApplication(deleteTarget.id);
      setApplications(prev => prev.filter(a => a.id !== deleteTarget.id));
      showToast(`Application #${deleteTarget.reference_no} removed from registry.`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast(err.message || 'Failed to remove application record.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Extract categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set).sort();
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.reference_no.toLowerCase().includes(q) ||
        a.scheme_name.toLowerCase().includes(q) ||
        (a.user_id && a.user_id.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [applications, search, statusFilter, categoryFilter]);

  // Status metrics
  const metrics = useMemo(() => {
    return {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'Submitted').length,
      underReview: applications.filter(a => a.status === 'Under Review').length,
      approved: applications.filter(a => a.status === 'Approved').length,
      rejected: applications.filter(a => a.status === 'Rejected').length
    };
  }, [applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge variant="green" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}>
            Approved
          </Badge>
        );
      case 'Under Review':
        return (
          <Badge variant="central" icon={<Clock className="w-3.5 h-3.5 text-govblue-600" />}>
            Under Review
          </Badge>
        );
      case 'Submitted':
        return (
          <Badge variant="saffron" icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}>
            Submitted
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="rose" icon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}>
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Nodal Oversight & Verification Authority
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Citizen Scheme Applications Review
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage citizen welfare filings, conduct document reviews, assign official decisions (*Under Review*, *Approved*, *Rejected*), and sync milestones into the citizen lifecycle journey.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplications}
            disabled={loading}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-slate-900/60"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition shadow-subtle ${
            statusFilter === 'all' ? 'border-govblue-600 ring-2 ring-govblue-600/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Queue</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-heading">{metrics.total}</div>
        </div>
        <div
          onClick={() => setStatusFilter('Submitted')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition shadow-subtle ${
            statusFilter === 'Submitted' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Submitted</div>
          <div className="text-2xl font-black text-amber-900 mt-1 font-heading">{metrics.submitted}</div>
        </div>
        <div
          onClick={() => setStatusFilter('Under Review')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition shadow-subtle ${
            statusFilter === 'Under Review' ? 'border-sky-500 ring-2 ring-sky-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Under Review</div>
          <div className="text-2xl font-black text-sky-900 mt-1 font-heading">{metrics.underReview}</div>
        </div>
        <div
          onClick={() => setStatusFilter('Approved')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition shadow-subtle ${
            statusFilter === 'Approved' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved</div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-heading">{metrics.approved}</div>
        </div>
        <div
          onClick={() => setStatusFilter('Rejected')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition shadow-subtle ${
            statusFilter === 'Rejected' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Rejected</div>
          <div className="text-2xl font-black text-rose-900 mt-1 font-heading">{metrics.rejected}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by reference #, scheme name, or applicant user ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-govblue-600 focus:bg-white text-slate-800 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-govblue-600 cursor-pointer"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="Submitted">Submitted ({metrics.submitted})</option>
            <option value="Under Review">Under Review ({metrics.underReview})</option>
            <option value="Approved">Approved ({metrics.approved})</option>
            <option value="Rejected">Rejected ({metrics.rejected})</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-govblue-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-slate-500 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-govblue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Retrieving application records...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <FileText className="w-12 h-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No applications match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {applications.length === 0
                ? 'No citizen applications have been tracked in the system yet.'
                : 'Try adjusting your search query or status filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Applicant ID</th>
                  <th className="py-3.5 px-4">Scheme & Category</th>
                  <th className="py-3.5 px-4">Status & Stage</th>
                  <th className="py-3.5 px-4">Filing Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {app.reference_no}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[120px]" title={app.user_id}>
                          {app.user_id ? app.user_id.slice(0, 12) + '...' : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate" title={app.scheme_name}>
                        {app.scheme_name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{app.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div>{getStatusBadge(app.status)}</div>
                        {app.current_stage && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={app.current_stage}>
                            {app.current_stage}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {app.submission_date}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openReviewModal(app)}
                          className="text-xs px-2.5 py-1"
                        >
                          Review & Decide
                        </Button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(app)}
                          title="Remove application record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nodal Review & Decision Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-govblue-50 text-govblue-800 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Nodal Decision
                </div>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  Review Application #{selectedApp.reference_no}
                </h2>
                <p className="text-xs text-slate-500">{selectedApp.scheme_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-700 transition rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Overview Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Applicant ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedApp.user_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submission Date:</span>
                  <span className="font-bold text-slate-800">{selectedApp.submission_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category:</span>
                  <span className="font-bold text-slate-800">{selectedApp.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Status:</span>
                  <span className="font-bold">{getStatusBadge(selectedApp.status)}</span>
                </div>
              </div>
              {selectedApp.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block">Applicant/Submission Note:</span>
                  <p className="text-slate-700 italic mt-0.5">{selectedApp.notes}</p>
                </div>
              )}
            </div>

            {/* Decision Form */}
            <form onSubmit={handleSaveDecision} className="space-y-4 text-xs">
              {/* Action Mode Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Action & Notification Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectActionType('STATUS_UPDATE')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      decisionActionType === 'STATUS_UPDATE'
                        ? 'bg-govblue-800 text-white border-govblue-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Status Update</span>
                    <span className="text-[10px] font-normal opacity-80">General lifecycle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectActionType('DOCUMENT_REQUEST')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      decisionActionType === 'DOCUMENT_REQUEST'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Request Documents</span>
                    <span className="text-[10px] font-normal opacity-80">Vault upload alert</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectActionType('BENEFIT_SANCTION')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      decisionActionType === 'BENEFIT_SANCTION'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Benefit Sanction</span>
                    <span className="text-[10px] font-normal opacity-80">DBT disbursement</span>
                  </button>
                </div>
              </div>

              {/* Conditional inputs for Document Request or Benefit Sanction */}
              {decisionActionType === 'DOCUMENT_REQUEST' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <label className="block font-bold text-amber-900">
                    Missing Documents (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={missingDocsInput}
                    onChange={e => setMissingDocsInput(e.target.value)}
                    placeholder="e.g. Land Deed / 7-12 Extract, Income Certificate 2026, Bank Passbook"
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                    required
                  />
                  <p className="text-[10px] text-amber-800">
                    The citizen receives an immediate in-app and simulated SMS/Email alert directing them to upload these files in their Document Vault.
                  </p>
                </div>
              )}

              {decisionActionType === 'BENEFIT_SANCTION' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <label className="block font-bold text-emerald-900">
                    Sanction Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={sanctionAmountInput}
                    onChange={e => setSanctionAmountInput(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <p className="text-[10px] text-emerald-800">
                    The citizen receives a formal benefit sanction alert confirming their approved entitlement.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Official Status Decision</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Submitted', 'Under Review', 'Approved', 'Rejected'].map(status => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => handleStatusPresetChange(status)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        decisionStatus === status
                          ? status === 'Approved'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : status === 'Rejected'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : status === 'Under Review'
                            ? 'bg-govblue-800 text-white border-govblue-800 shadow-sm'
                            : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {decisionStatus === status && <Check className="w-3.5 h-3.5" />}
                      <span>{status}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Lifecycle Workflow Milestone Stage
                </label>
                <input
                  type="text"
                  value={decisionStage}
                  onChange={e => setDecisionStage(e.target.value)}
                  placeholder="e.g. Document Verification in Progress / Sanctioned & Disbursed"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-govblue-600 focus:bg-white"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This stage updates the citizen's journey tracker on their dashboard in real time.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Stage Order (Milestone 1 to 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={decisionOrder}
                  onChange={e => setDecisionOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-govblue-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Official Nodal Remarks & Audit Note
                </label>
                <textarea
                  rows={3}
                  value={officialNotes}
                  onChange={e => setOfficialNotes(e.target.value)}
                  placeholder="Enter official remarks, verification officer notes, or reason for sanction/rejection..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-govblue-600 focus:bg-white leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Remarks will be saved to the citizen tracker and recorded in the immutable administrative audit log.
                </p>
              </div>

              {/* Multi-Channel Simulator Indicator */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-govblue-700" />
                  <span className="font-semibold text-slate-800">Multi-Channel Alert Dispatcher:</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[10px]">
                  <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">In-App</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">SMS Sim</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Email Sim</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updating}
                  leftIcon={updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                >
                  {updating ? 'Recording Decision...' : 'Confirm & Commit Decision'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Delete Application Record?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove application record <strong>#{deleteTarget.reference_no}</strong> for <strong>{deleteTarget.scheme_name}</strong>? This will remove the tracking record and journey entry. This action is recorded in the administrative audit log.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteApplication}
                disabled={deleting}
                leftIcon={deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {deleting ? 'Deleting...' : 'Delete Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
