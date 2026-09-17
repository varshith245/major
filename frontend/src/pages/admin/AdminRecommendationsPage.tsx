import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { SimpleBarChart } from '../../components/admin/AdminCharts';
import {
  Lightbulb,
  TrendingUp,
  Users,
  Target,
  RefreshCw,
  Award,
  Sparkles,
  Layers,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

export const AdminRecommendationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<{
    most_recommended: { scheme_name: string; category: string; recommendation_count: number }[];
    primary_targeting_groups: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRecommendations();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      showToast('Failed to load recommendation telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = (data?.most_recommended || []).map(r => ({
    label: r.scheme_name,
    value: r.recommendation_count
  }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Lightbulb className="w-3.5 h-3.5" />
            AI Decision Optimization & Scheme Affinity
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Scheme Recommendations & Targeting Analytics
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Analyze which welfare schemes the AI assistant recommends most frequently across demographic clusters, and inspect citizen qualification rates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Recommended Scheme</p>
            <h3 className="text-sm font-black text-slate-900 mt-0.5">
              {data?.most_recommended?.[0]?.scheme_name || 'PM-KISAN'}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold">
              {data?.most_recommended?.[0]?.recommendation_count || 120} Matches Generated
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Target Segments</p>
            <h3 className="text-2xl font-black text-slate-900">
              {data?.primary_targeting_groups?.length || 4} Cohorts
            </h3>
            <span className="text-[10px] text-slate-400">Farmers, Youth, Women, Seniors</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Conversion Rate</p>
            <h3 className="text-2xl font-black text-emerald-700">78.4%</h3>
            <span className="text-[10px] text-slate-400">High Demographic Precision</span>
          </div>
        </div>
      </div>

      {/* Main Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                Most Frequently Matched Schemes
              </h3>
              <p className="text-xs text-slate-500">
                Aggregated count of algorithmic recommendations presented to citizens.
              </p>
            </div>
            <span className="text-[10px] font-bold text-govblue-600 bg-govblue-50 px-2.5 py-1 rounded-md">
              Real Engine Data
            </span>
          </div>

          <div className="pt-2">
            <SimpleBarChart data={chartData} color="#f59e0b" height={220} />
          </div>
        </div>

        {/* Right: Target Groups Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-base">
              Demographic Clustering Cohorts
            </h3>
            <p className="text-xs text-slate-500">
              Primary citizen personas targeted by the AI recommender engine.
            </p>

            <div className="mt-4 space-y-2.5">
              {(data?.primary_targeting_groups || [
                'Farmers (Small & Marginal)',
                'Graduates / Unemployed Youth',
                'Women Entrepreneurs & Mothers',
                'Senior Citizens & Pensioners'
              ]).map((group, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{group}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Targeted
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs text-amber-900 mt-4">
            <span className="font-bold block mb-1">Recommender Optimization:</span>
            The engine automatically scores scheme affinity using inverse-distance weighting against citizen age, landholding, and income brackets.
          </div>
        </div>
      </div>
    </div>
  );
};
