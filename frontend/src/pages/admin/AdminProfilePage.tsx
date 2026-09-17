import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Shield,
  Key,
  Lock,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Globe2,
  LogOut
} from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Administrator session closed successfully.', 'info');
  };

  const privileges = [
    { title: 'Full Scheme CRUD', desc: 'Create, update, toggle status, and archive central/state schemes.' },
    { title: 'Deterministic Rules Engine', desc: 'Execute live simulation tests and modify qualification boundary models.' },
    { title: 'AI & Vector Index Rebuilding', desc: 'Manage sentence embeddings and rebuild cosine vector space.' },
    { title: 'Citizen IAM & Access Moderation', desc: 'Suspend, activate, or permanently delete user accounts.' },
    { title: 'Tamper-Evident Compliance Logs', desc: 'Audit immutable administrative activity records and payloads.' },
    { title: 'Global System Parameters', desc: 'Configure AI thresholds, maintenance windows, and banners.' }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrative Identity & Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Administrator Security Profile
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Review authorized cryptographic credentials, assigned root capabilities, and active portal session metadata.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-govblue-700 to-sky-500 flex items-center justify-center text-white font-black text-3xl shadow-xl shrink-0">
            {user?.full_name?.charAt(0) || 'A'}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-heading font-black text-white">{user?.full_name || 'System Administrator'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-mono font-bold text-[10px] uppercase">
                {user?.role || 'admin'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user?.email || 'admin@egovseva.gov.in'}</p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Root Administrative Authority
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                Multi-Factor Verified
              </span>
            </div>
          </div>
        </div>

        {/* Identity Details */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Cryptographic User ID</span>
            <span className="font-mono text-slate-800 font-bold truncate block">{user?.user_id || 'USR-ADMIN-01'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Primary Contact</span>
            <span className="font-mono text-slate-800 font-bold block">{user?.phone_number || '+91 (Government Leased)'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Account State</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Active &amp; Authenticated
            </span>
          </div>
        </div>

        {/* Root Privileges */}
        <div className="p-6 space-y-4">
          <h3 className="font-heading font-black text-slate-900 text-base">
            Authorized Administrative Capabilities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privileges.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 hover:border-govblue-200 transition"
              >
                <div className="flex items-center gap-2 text-govblue-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{p.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pl-6">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
