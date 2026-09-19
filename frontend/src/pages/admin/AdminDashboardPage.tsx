import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminDashboardData, AdminSystemHealth } from '../../services/adminService';
import { SimpleBarChart, TrendAreaChart, DonutChart } from '../../components/admin/AdminCharts';
import {
  Users,
  Building2,
  FileCheck,
  Bot,
  Activity,
  ArrowUpRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, healthRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getSystemHealth()
      ]);
      setData(dashRes);
      setHealth(healthRes);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-govblue-700 border-t-transparent rounded-full" />
        <p className="text-xs font-bold">Loading Enterprise Control Center...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-bold text-rose-600">Failed to load administrative telemetry.</p>
        <button onClick={loadData} className="mt-3 btn-primary text-xs px-4 py-2">
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Registered Users', value: data.kpi.total_users, sub: `${data.kpi.active_users} active accounts`, icon: Users, color: 'text-sky-600 bg-sky-50' },
    { title: 'Total Welfare Schemes', value: data.kpi.total_schemes, sub: `${data.kpi.active_schemes} published active`, icon: Building2, color: 'text-govblue-600 bg-govblue-50' },
    { title: 'Eligibility Assessments', value: data.kpi.total_eligibility_checks, sub: 'Evaluated in engine', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'AI & NLP Queries', value: data.kpi.total_ai_queries, sub: 'Multilingual assistance', icon: Bot, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-govblue-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Live Operations Control
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Real-time telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
            E-Governance Welfare Administration Portal
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Centralized monitoring of citizen welfare schemes, NLP question understanding, eligibility evaluation, and compliance verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/admin/schemes"
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scheme</span>
          </Link>
          <Link
            to="/admin/eligibility-rules"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition border border-slate-700"
          >
            <FileCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Rules</span>
          </Link>
          <button
            onClick={loadData}
            title="Refresh metrics"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate max-w-[170px]">
                  {kpi.title}
                </span>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {kpi.value.toLocaleString()}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Query Activity Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">AI Query Volume Over Time</h3>
              <p className="text-xs text-slate-500">Conversational intent processing & scheme inquiries</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
              7-Day Trend
            </span>
          </div>
          <TrendAreaChart data={data.charts.query_activity_trend} />
        </div>

        {/* Eligibility Results Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">Citizen Eligibility Outcomes</h3>
              <p className="text-xs text-slate-500">Real-time matching distribution across profiles</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Rule Engine
            </span>
          </div>
          <DonutChart
            data={data.charts.eligibility_distribution.map((d, i) => ({
              label: d.label,
              count: d.count,
              color: i === 0 ? '#10b981' : i === 1 ? '#0284c7' : i === 2 ? '#ef4444' : '#94a3b8'
            }))}
          />
        </div>
      </div>

      {/* Charts Section: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Viewed / Inquired Schemes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">Top Inquired Welfare Schemes</h3>
              <p className="text-xs text-slate-500">Schemes with highest citizen interest and assessment runs</p>
            </div>
            <Link to="/admin/schemes" className="text-xs font-bold text-govblue-700 hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <SimpleBarChart
            data={data.charts.top_schemes.map((s, idx) => ({
              label: `${s.scheme_name} (${s.category})`,
              value: s.views,
              color: idx === 0 ? 'bg-govblue-800' : idx === 1 ? 'bg-sky-600' : 'bg-slate-700'
            }))}
          />
        </div>

        {/* Trilingual Language Usage */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-govblue-600" />
              <span>Language Preference</span>
            </h3>
            <p className="text-xs text-slate-500">Citizen query linguistic breakdown</p>
          </div>
          <div className="space-y-4 pt-2">
            {data.charts.language_distribution.map((l, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{l.language}</span>
                  <span className="font-mono text-slate-600 font-bold">{l.count} queries</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, l.count * 4))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & System Health Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrated Real-Time Citizen & Administrative Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-heading">Recent Citizen & Administrative Activity</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-slate-500">Chronological telemetry of citizen applications, vault uploads, logins, and audit events</p>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-bold text-govblue-700 hover:underline flex items-center gap-1">
              <span>Audit Trail</span>
              <span>→</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
            {data.recent_activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity recorded yet.
              </div>
            ) : (
              data.recent_activity.map((act) => {
                const isCitizen = act.actor.toLowerCase().includes('varshith') || 
                                  act.action.toLowerCase().includes('citizen') ||
                                  act.action.toLowerCase().includes('application') ||
                                  act.action.toLowerCase().includes('document') ||
                                  act.action.toLowerCase().includes('eligibility') ||
                                  act.action.toLowerCase().includes('query');

                return (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/60 rounded-xl px-2 -mx-2 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCitizen 
                          ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {isCitizen ? <Users className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{act.action}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            isCitizen 
                              ? 'bg-sky-100 text-sky-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isCitizen ? 'CITIZEN' : 'ADMIN'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Actor: <strong className="text-slate-700 font-semibold">{act.actor}</strong> • <span className="text-slate-600">{act.resource}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        act.status.toLowerCase().includes('eligible') || act.status.toLowerCase().includes('success') || act.status.toLowerCase().includes('verified')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : act.status.toLowerCase().includes('submitted') || act.status.toLowerCase().includes('review')
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {act.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-300" />
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* System Health Monitor */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Service Health</span>
              </h3>
              <p className="text-xs text-slate-500">Real-time status</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              All Green
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {health?.services.slice(0, 6).map((srv, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-800 truncate">{srv.name}</p>
                  <span className="text-[10px] text-slate-400">{srv.type}</span>
                </div>
                <div className="text-right shrink-0 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-slate-500">{srv.latency_ms}ms</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
