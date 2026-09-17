import React from 'react';

export const SchemeCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
      <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
    </div>
    <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
    <div className="h-16 w-full bg-slate-100 rounded-lg"></div>
    <div className="flex gap-2 pt-2">
      <div className="h-9 flex-1 bg-slate-200 rounded-lg"></div>
      <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 animate-pulse">
    <div className="h-10 w-64 bg-slate-200 rounded"></div>
    <div className="h-14 w-full max-w-2xl bg-slate-200 rounded-xl"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
      ))}
    </div>
  </div>
);

export const ComparisonSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 animate-pulse">
    <div className="h-8 w-48 bg-slate-200 rounded"></div>
    <div className="h-96 w-full bg-slate-200 rounded-2xl"></div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-300"></div>
      <div className="h-20 w-3/4 bg-slate-200 rounded-2xl"></div>
    </div>
    <div className="flex items-start gap-3 justify-end">
      <div className="h-12 w-1/2 bg-govblue-200 rounded-2xl"></div>
    </div>
  </div>
);
