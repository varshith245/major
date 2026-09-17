import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  Globe2,
  Languages,
  CheckCircle2,
  RefreshCw,
  Volume2,
  Search,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';

interface LanguageRecord {
  code: string;
  name: string;
  dictionary_phrases: number;
  status: string;
}

export const AdminLanguagesPage: React.FC = () => {
  const { showToast } = useToast();
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Sample phrases preview
  const samplePhrases = [
    { key: 'app.title', en: 'AI Public Service Assistant', hi: 'एआई जन सेवा सहायक', kn: 'ಎಐ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಸಹಾಯಕ' },
    { key: 'nav.schemes', en: 'Explore Schemes', hi: 'योजनाएं खोजें', kn: 'ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' },
    { key: 'nav.eligibility', en: 'Check Eligibility', hi: 'पात्रता जांचें', kn: 'ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ' },
    { key: 'nav.documents', en: 'Document Checklist', hi: 'दस्तावेज़ सूची', kn: 'ದಾಖಲೆ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' },
    { key: 'status.eligible', en: 'Eligible for Benefits', hi: 'लाभ के लिए पात्र', kn: 'ಸೌಲಭ್ಯಗಳಿಗೆ ಅರ್ಹರು' },
    { key: 'status.ineligible', en: 'Not Currently Eligible', hi: 'वर्तमान में पात्र नहीं', kn: 'ಪ್ರಸ್ತುತ ಅರ್ಹರಲ್ಲ' },
    { key: 'assistant.greeting', en: 'Namaste! How may I assist you today?', hi: 'नमस्ते! मैं आपकी क्या सहायता कर सकता हूँ?', kn: 'ನಮಸ್ಕಾರ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getLanguages();
      setLanguages(res.supported_languages || []);
    } catch (err: any) {
      console.error('Failed to load languages:', err);
      showToast('Failed to load language intelligence stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPhrases = samplePhrases.filter(
    p =>
      !search ||
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.en.toLowerCase().includes(search.toLowerCase()) ||
      p.hi.toLowerCase().includes(search.toLowerCase()) ||
      p.kn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            Trilingual Language Engine & Localization
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Multilingual Intelligence & Localization Engine
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Audit localized UI dictionaries, inspect speech-to-text models across English, Hindi, and Kannada, and review automated cross-lingual intent mapping.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(languages.length > 0 ? languages : [
          { code: 'en', name: 'English (India)', dictionary_phrases: 240, status: 'Active (Default)' },
          { code: 'hi', name: 'हिन्दी (Hindi)', dictionary_phrases: 240, status: 'Active' },
          { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', dictionary_phrases: 240, status: 'Active' }
        ]).map(lang => (
          <div
            key={lang.code}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-govblue-50 border border-govblue-100 flex items-center justify-center text-govblue-700 font-black text-sm uppercase">
                {lang.code}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {lang.status}
              </span>
            </div>

            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">{lang.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang.dictionary_phrases} Canonical Phrases Localized
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-slate-500">
                <Volume2 className="w-3.5 h-3.5 text-govblue-600" />
                Web Speech TTS
              </span>
              <span className="text-emerald-700 font-bold">Supported</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dictionary Phrase Inspector */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-slate-900 text-sm">
                Canonical Localization Dictionary (Trilingual Matrix)
              </h3>
              <p className="text-xs text-slate-400">
                Verified key-value translation mappings synchronized with the citizen frontend.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phrases..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Dictionary Token Key</th>
                <th className="py-3 px-4">English (en)</th>
                <th className="py-3 px-4">हिन्दी (hi)</th>
                <th className="py-3 px-4">ಕನ್ನಡ (kn)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPhrases.map(phrase => (
                <tr key={phrase.key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-govblue-700">
                    {phrase.key}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">{phrase.en}</td>
                  <td className="py-3 px-4 text-slate-700">{phrase.hi}</td>
                  <td className="py-3 px-4 text-slate-700">{phrase.kn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
