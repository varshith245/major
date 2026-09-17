import React from 'react';
import { X, ExternalLink, CheckCircle2, FileText, Phone, Building2, ArrowRight } from 'lucide-react';
import { Scheme } from '../types';

interface SchemeDetailModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  onNavigateToChecklist: (schemeId: string) => void;
  language: string;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  onClose,
  onNavigateToChecklist,
  language
}) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`badge text-[10px] font-bold ${
              scheme.level === 'Central' ? 'badge-blue' : 'badge-crimson'
            }`}>
              {scheme.level === 'Central' ? 'Central Scheme' : 'Karnataka State'}
            </span>
            <span className="text-xs text-slate-300 font-semibold">{scheme.category}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading leading-snug">{scheme.name}</h2>
            <p className="text-slate-500 font-medium text-xs mt-0.5">{scheme.department}</p>
          </div>

          <p className="text-slate-700 leading-relaxed">{scheme.description}</p>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-950 space-y-1">
            <strong className="block text-emerald-800 font-bold uppercase text-[10px]">Benefits:</strong>
            <p>{scheme.benefits}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-950 space-y-1">
            <strong className="block text-blue-800 font-bold uppercase text-[10px]">Eligibility Criteria:</strong>
            <p>{scheme.eligibility_criteria}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-950 space-y-1">
            <strong className="block text-amber-800 font-bold uppercase text-[10px]">Required Documents:</strong>
            <ul className="list-disc pl-4 space-y-0.5">
              {scheme.required_documents.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={() => {
              onNavigateToChecklist(scheme.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Document Checklist</span>
          </button>

          <a
            href={scheme.portal_url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary py-2 px-5 text-xs font-bold"
          >
            <span>Apply on Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
