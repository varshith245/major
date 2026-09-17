import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  X,
  Languages,
  Zap,
  Bot
} from 'lucide-react';

interface QueryItem {
  id: string;
  session_id: string;
  query: string;
  detected_language: string;
  intent: string;
  confidence: number;
  assistant_response?: string;
  latency_ms?: number;
  status: string;
  created_at: string;
}

export const AdminQueriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'errors'>('all');
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [failedQueries, setFailedQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');

  // Selected query for inspection modal
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queriesRes, errorsRes] = await Promise.all([
        adminService.getQueries({
          intent: intentFilter !== 'all' ? intentFilter : undefined,
          language: langFilter !== 'all' ? langFilter : undefined,
          search: search.trim() || undefined,
          limit: 100
        }),
        adminService.getFailedQueries()
      ]);
      setQueries(queriesRes.queries || []);
      setFailedQueries(errorsRes.flagged_queries || []);
    } catch (err: any) {
      console.error('Failed to load queries:', err);
      showToast('Failed to fetch AI query logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [intentFilter, langFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            Natural Language Interaction Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Citizen AI Queries & Chat Telemetry
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Real-time feed of citizen interactions across English, Hindi, and Kannada. Inspect intent classification, response latency, and low-confidence edge cases.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-govblue-600 text-white shadow-md shadow-govblue-900/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          All Citizen Inquiries ({queries.length})
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'errors'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          AI Error Analysis & Low Confidence ({failedQueries.length})
        </button>
      </div>

      {/* TAB 1: ALL QUERIES */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user query text..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-govblue-500 text-slate-800 transition"
              />
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={intentFilter}
                onChange={e => setIntentFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">All Intents</option>
                <option value="scheme_search">Scheme Search</option>
                <option value="eligibility_check">Eligibility Check</option>
                <option value="document_query">Document Query</option>
                <option value="comparison">Scheme Comparison</option>
                <option value="greeting">Greeting</option>
              </select>

              <select
                value={langFilter}
                onChange={e => setLangFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">All Languages</option>
                <option value="en">English (en)</option>
                <option value="hi">Hindi (hi)</option>
                <option value="kn">Kannada (kn)</option>
              </select>
            </div>
          </div>

          {/* Queries Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Citizen Query</th>
                    <th className="py-3 px-4">Intent</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {queries.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-xs truncate">
                        <span className="font-bold text-slate-900 block truncate">{q.query}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[11px]">
                          {q.intent}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="uppercase text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {q.detected_language}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            q.confidence >= 0.8
                              ? 'text-emerald-600'
                              : q.confidence >= 0.65
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {(q.confidence * 100).toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {q.latency_ms || 18} ms
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedQuery(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-govblue-600 hover:bg-slate-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI ERROR ANALYSIS */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-950">AI Knowledge Gap Radar</h4>
              <p className="mt-0.5 text-amber-800">
                These queries received confidence scores below the recommended threshold (&lt; 70%) or triggered fallback responses. Reviewing them helps identify new welfare schemes or vernacular phrases to register into the system.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Flagged Query</th>
                    <th className="py-3 px-4">Predicted Intent</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {failedQueries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">No Low-Confidence Queries</p>
                        <p className="text-xs text-slate-400">All recent citizen interactions met the accuracy threshold.</p>
                      </td>
                    </tr>
                  ) : (
                    failedQueries.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 max-w-sm truncate">
                          {q.query}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{q.intent}</td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">
                          {(q.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-slate-500">{q.language}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(q.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[11px] font-bold text-govblue-600 hover:underline cursor-pointer">
                            Add Training Data
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-400" />
                <h3 className="font-heading font-black text-sm">Interaction Transcript Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Citizen Prompt
                </span>
                <div className="p-3.5 rounded-2xl bg-govblue-50/80 border border-govblue-100 text-govblue-950 text-xs font-medium">
                  {selectedQuery.query}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  AI Response
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-line">
                  {selectedQuery.assistant_response || 'No raw transcript recorded.'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-bold">Intent</span>
                  <span className="font-mono font-bold text-slate-800">{selectedQuery.intent}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-bold">Confidence</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {(selectedQuery.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-bold">Latency</span>
                  <span className="font-mono font-bold text-amber-600">{selectedQuery.latency_ms || 18} ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
