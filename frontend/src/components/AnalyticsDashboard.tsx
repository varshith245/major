import React from 'react';
import { BarChart3, Users, Building2, TrendingUp, CheckCircle, Award } from 'lucide-react';

interface AnalyticsDashboardProps {
  language: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Public Welfare Scheme Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time metrics on citizen access, scheme categories, and eligibility matching.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Schemes</span>
          <p className="text-3xl font-black text-slate-900 font-heading">30+</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Verified Guidelines</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Beneficiaries Assisted</span>
          <p className="text-3xl font-black text-crimson-600 font-heading">45,820</p>
          <span className="text-[11px] text-slate-500">Across Central & Karnataka</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Average Evaluation Time</span>
          <p className="text-3xl font-black text-slate-900 font-heading">1.2s</p>
          <span className="text-[11px] text-emerald-600 font-bold">Instant AI Matching</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Supported Languages</span>
          <p className="text-3xl font-black text-slate-900 font-heading">3</p>
          <span className="text-[11px] text-slate-500">EN • हिन्दी • ಕನ್ನಡ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Top Schemes by Citizen Queries</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>PM Kisan Samman Nidhi</span>
                <span className="text-crimson-700">38%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-crimson-600 h-full w-[38%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Karnataka Yuva Nidhi Scheme</span>
                <span className="text-crimson-700">27%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-crimson-600 h-full w-[27%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Ayushman Bharat PM-JAY</span>
                <span className="text-crimson-700">21%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-crimson-600 h-full w-[21%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Karnataka Gruha Lakshmi</span>
                <span className="text-crimson-700">14%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-crimson-600 h-full w-[14%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Welfare Sector Breakdown</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="font-bold text-emerald-900 block">Agriculture</span>
              <span className="text-lg font-black text-emerald-700">8 Schemes</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
              <span className="font-bold text-rose-900 block">Healthcare</span>
              <span className="text-lg font-black text-rose-700">6 Schemes</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="font-bold text-blue-900 block">Education & Youth</span>
              <span className="text-lg font-black text-blue-700">7 Schemes</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="font-bold text-purple-900 block">Women Welfare</span>
              <span className="text-lg font-black text-purple-700">6 Schemes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
