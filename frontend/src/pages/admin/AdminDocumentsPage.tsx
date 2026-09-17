import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Download
} from 'lucide-react';

interface DocumentRecord {
  scheme_id: string;
  scheme_name: string;
  document_name: string;
  is_mandatory: boolean;
  verification_method: string;
}

export const AdminDocumentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mandatory' | 'optional'>('all');

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDocuments();
      setDocuments(res.documents || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      showToast('Failed to load document checklist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter logic
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchSearch =
        !search ||
        d.document_name.toLowerCase().includes(search.toLowerCase()) ||
        d.scheme_name.toLowerCase().includes(search.toLowerCase());
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'mandatory' && d.is_mandatory) ||
        (typeFilter === 'optional' && !d.is_mandatory);
      return matchSearch && matchType;
    });
  }, [documents, search, typeFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = documents.length;
    const mandatory = documents.filter(d => d.is_mandatory).length;
    const optional = total - mandatory;
    const distinctDocNames = new Set(documents.map(d => d.document_name)).size;
    return { total, mandatory, optional, distinctDocNames };
  }, [documents]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-600/20 border border-govblue-500/30 text-sky-400 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Statutory Document Verification Protocol
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Required Documents & Verification Registry
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Audit required citizen proofs across all central and state welfare initiatives, configure automated OCR masking rules, and review biometric authentication mandates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Registry
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-govblue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requirements</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mandatory Proofs</p>
            <h3 className="text-2xl font-black text-rose-700">{stats.mandatory}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Optional / Supporting</p>
            <h3 className="text-2xl font-black text-amber-700">{stats.optional}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distinct Certificates</p>
            <h3 className="text-2xl font-black text-emerald-700">{stats.distinctDocNames}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by document name or scheme..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-govblue-500 text-slate-800 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500">Requirement:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setTypeFilter('mandatory')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                typeFilter === 'mandatory' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mandatory ({stats.mandatory})
            </button>
            <button
              onClick={() => setTypeFilter('optional')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                typeFilter === 'optional' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Optional ({stats.optional})
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Document / Proof</th>
                <th className="py-3 px-4">Associated Scheme</th>
                <th className="py-3 px-4">Mandatory Status</th>
                <th className="py-3 px-4">Verification Pipeline</th>
                <th className="py-3 px-4">Supported Formats</th>
                <th className="py-3 px-4 text-right">Data Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDocs.map((doc, idx) => (
                <tr key={`${doc.scheme_id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-govblue-600 shrink-0" />
                    <span>{doc.document_name}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {doc.scheme_name}
                  </td>

                  <td className="py-3 px-4">
                    {doc.is_mandatory ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] uppercase">
                        Mandatory
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] uppercase">
                        Optional
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      {doc.verification_method}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    PDF, JPEG, PNG (≤ 5MB)
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      OCR Masking Active
                    </span>
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
