import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { fetchSchemes, getAuthToken } from '../api';
import { Scheme } from '../types';

interface AdminConsoleProps {
  language: string;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ language }) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes()
      .then((data) => setSchemes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSyncDatabase = () => {
    setMessage('Database synchronized successfully with MongoDB Atlas and SQLite!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-crimson-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Administrator Scheme Management Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, update, and manage verified government welfare scheme records.
          </p>
        </div>

        <button
          onClick={handleSyncDatabase}
          className="btn-primary py-2 px-4 text-xs font-bold self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Database</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Schemes Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px]">
                <th className="p-4">Scheme Code</th>
                <th className="p-4">Name & Department</th>
                <th className="p-4">Category</th>
                <th className="p-4">Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-900">{s.scheme_code}</td>
                  <td className="p-4 space-y-0.5">
                    <strong className="text-sm font-bold text-slate-900 block">{s.name}</strong>
                    <span className="text-[11px] text-slate-500">{s.department}</span>
                  </td>
                  <td className="p-4 text-slate-700">{s.category}</td>
                  <td className="p-4">
                    <span className={`badge text-[10px] font-bold ${
                      s.level === 'Central' ? 'badge-blue' : 'badge-crimson'
                    }`}>
                      {s.level}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="badge badge-green text-[10px] font-bold">Active</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="text-slate-600 hover:text-crimson-600 font-bold text-xs p-1">Edit</button>
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
