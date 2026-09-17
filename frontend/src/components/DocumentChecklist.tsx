import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  Download, 
  HelpCircle,
  Building2 
} from 'lucide-react';
import { fetchSchemes, fetchDocumentChecklistApi } from '../api';
import { Scheme, DocumentChecklistResult } from '../types';

interface DocumentChecklistProps {
  language: string;
  initialSchemeId?: string;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  language,
  initialSchemeId = 'GOI-AGRI-001'
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(initialSchemeId);
  const [checklist, setChecklist] = useState<DocumentChecklistResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSchemes().then((data) => {
      setSchemes(data);
      if (initialSchemeId) setSelectedSchemeId(initialSchemeId);
    });
  }, [initialSchemeId]);

  useEffect(() => {
    if (selectedSchemeId) {
      setLoading(true);
      fetchDocumentChecklistApi(selectedSchemeId, language)
        .then((data) => setChecklist(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedSchemeId, language]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Required Document Checklists
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official mandatory documents, issuing authorities, and application procedures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Checklist</span>
          </button>
        </div>
      </div>

      {/* Scheme Dropdown Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 mb-1">Select Scheme</label>
        <select
          value={selectedSchemeId}
          onChange={(e) => setSelectedSchemeId(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white cursor-pointer"
        >
          {schemes.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.level})</option>
          ))}
        </select>
      </div>

      {/* Checklist Content */}
      {loading ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 animate-pulse space-y-4">
          <div className="w-1/3 h-6 bg-slate-200 rounded" />
          <div className="w-full h-12 bg-slate-200 rounded" />
          <div className="w-full h-12 bg-slate-200 rounded" />
        </div>
      ) : checklist ? (
        <div className="space-y-6">
          
          {/* Mandatory Documents */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Mandatory Documents</span>
            </h3>

            <div className="space-y-3">
              {checklist.mandatory_documents.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{doc.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Mandatory</span>
                  </div>
                  <p className="text-slate-600">{doc.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Issued By: <strong className="text-slate-700">{doc.issuing_authority}</strong> • Validity: {doc.validity_period}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Steps */}
          {checklist.application_steps && checklist.application_steps.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Official Application Steps
              </h3>
              <div className="space-y-2 text-xs">
                {checklist.application_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <span className="w-5 h-5 rounded-full bg-crimson-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
