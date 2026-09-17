import React, { useState, useEffect } from 'react';
import { adminService, AdminDashboardData } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { SimpleBarChart, TrendAreaChart, DonutChart } from '../../components/admin/AdminCharts';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Users,
  Building2,
  FileCheck,
  RefreshCw,
  Sparkles,
  PieChart
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      showToast('Failed to load analytics telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportReport = () => {
    if (!data) return;
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', data.kpi.total_users],
      ['Active Citizens', data.kpi.active_users],
      ['Total Schemes', data.kpi.total_schemes],
      ['Active Schemes', data.kpi.active_schemes],
      ['Total Eligibility Checks', data.kpi.total_eligibility_checks],
      ['Total AI Queries', data.kpi.total_ai_queries],
      ['Generated At', new Date().toISOString()]
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `egovseva_analytics_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics summary downloaded successfully as CSV.', 'success');
  };

  // Format chart data
  const trendData = data?.charts.query_activity_trend || [];

  const categoryChartData = (data?.charts.category_distribution || []).map(c => ({
    label: c.category,
    value: c.count
  }));

  const donutData = (data?.charts.eligibility_distribution || []).map((e, idx) => ({
    label: e.label,
    count: e.count,
    color: idx === 0 ? '#10b981' : idx === 1 ? '#f59e0b' : idx === 2 ? '#ef4444' : '#64748b'
  }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-600/20 border border-govblue-500/30 text-sky-400 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Telemetry & Big Data Insights
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            System Analytics & Welfare Impact
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            In-depth usage patterns, time-series evaluation trends, scheme popularity distributions, and citizen engagement metrics.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(['7d', '30d', '90d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  timeframe === tf
                    ? 'bg-govblue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-govblue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Queries Processed</p>
            <h3 className="text-2xl font-black text-slate-900">{data?.kpi.total_ai_queries || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility Evaluations</p>
            <h3 className="text-2xl font-black text-emerald-700">{data?.kpi.total_eligibility_checks || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Citizens</p>
            <h3 className="text-2xl font-black text-purple-700">{data?.kpi.active_users || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Welfare Schemes</p>
            <h3 className="text-2xl font-black text-amber-700">{data?.kpi.active_schemes || 0}</h3>
          </div>
        </div>
      </div>

      {/* Row 1: Queries Trend & Eligibility Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Queries Trend */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                Citizen Inquiry Ingestion Trend
              </h3>
              <p className="text-xs text-slate-500">
                Daily volume of natural language queries evaluated across Central and State portals.
              </p>
            </div>
            <span className="text-[10px] font-bold text-govblue-600 bg-govblue-50 px-2.5 py-1 rounded-md">
              Real Activity
            </span>
          </div>

          <div className="pt-2">
            <TrendAreaChart data={trendData} color="#0284c7" height={240} />
          </div>
        </div>

        {/* Eligibility Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-base">
              Eligibility Verification Outcomes
            </h3>
            <p className="text-xs text-slate-500">
              Proportion of citizens matching qualification criteria.
            </p>

            <div className="pt-4 flex justify-center">
              <DonutChart data={donutData} size={190} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
            Engine automatically tags citizens with near-eligibility as &quot;Likely Eligible&quot; if only one non-statutory criteria is borderline.
          </div>
        </div>
      </div>

      {/* Row 2: Category Distribution */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-base">
              Welfare Schemes by Socio-Economic Sector
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of active welfare programs registered across government ministries.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <SimpleBarChart data={categoryChartData} color="#0ea5e9" height={220} />
        </div>
      </div>
    </div>
  );
};
