import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Save,
  RefreshCw,
  Sliders,
  Shield,
  Bot,
  Bell,
  Globe2,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // System Settings State
  const [appName, setAppName] = useState('');
  const [defaultLang, setDefaultLang] = useState('en');
  const [sessionTimeout, setSessionTimeout] = useState(1440);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiThreshold, setAiThreshold] = useState(0.70);
  const [paginationSize, setPaginationSize] = useState(20);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [notificationBanner, setNotificationBanner] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      setAppName(res.app_name || 'AI Based Public Service Assistant for Government Schemes');
      setDefaultLang(res.default_language || 'en');
      setSessionTimeout(res.session_timeout_minutes || 1440);
      setMaintenanceMode(Boolean(res.maintenance_mode));
      setAiThreshold(Number(res.ai_confidence_threshold) || 0.70);
      setPaginationSize(res.pagination_size || 20);
      setAllowRegistration(res.allow_citizen_registration !== false);
      setNotificationBanner(res.notification_banner || '');
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      showToast('Failed to retrieve system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings({
        app_name: appName,
        default_language: defaultLang,
        session_timeout_minutes: Number(sessionTimeout),
        maintenance_mode: maintenanceMode,
        ai_confidence_threshold: Number(aiThreshold),
        pagination_size: Number(paginationSize),
        allow_citizen_registration: allowRegistration,
        notification_banner: notificationBanner
      });
      showToast('System configuration saved and synced across all nodes.', 'success');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-600/20 border border-govblue-500/30 text-sky-400 text-xs font-semibold">
            <Settings className="w-3.5 h-3.5" />
            Global Portal Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            System Parameters & Configuration
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Tune AI confidence thresholds, configure portal maintenance windows, customize notification banners, and manage security session constraints.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reset to Server
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-govblue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General & Identity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Globe2 className="w-5 h-5 text-govblue-600" />
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                Portal Identity & Localization
              </h3>
              <p className="text-xs text-slate-500">
                Configure primary title branding and default citizen language locale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Application Title</label>
              <input
                type="text"
                value={appName}
                onChange={e => setAppName(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Locale</label>
              <select
                value={defaultLang}
                onChange={e => setDefaultLang(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-900"
              >
                <option value="en">English (en)</option>
                <option value="hi">हिन्दी (hi)</option>
                <option value="kn">ಕನ್ನಡ (kn)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AI & Retrieval Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bot className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                AI NLP & Vector Search Thresholds
              </h3>
              <p className="text-xs text-slate-500">
                Adjust confidence calibration for automated intent routing and fallback triggers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  AI Confidence Threshold (Min Score for Confident Match)
                </label>
                <span className="font-mono font-bold text-sky-600 text-sm">
                  {(aiThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={aiThreshold}
                onChange={e => setAiThreshold(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <p className="text-[11px] text-slate-400">
                Queries scoring below {(aiThreshold * 100).toFixed(0)}% trigger an automated fallback and appear in the AI Error Analysis queue.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Schemes Result Pagination Size
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={paginationSize}
                onChange={e => setPaginationSize(Number(e.target.value))}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Operational State & Banners */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                Operational State & Announcement Banner
              </h3>
              <p className="text-xs text-slate-500">
                Broadcast administrative notices to all logged-in citizens.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Broadcast Announcement Message
              </label>
              <input
                type="text"
                value={notificationBanner}
                onChange={e => setNotificationBanner(e.target.value)}
                placeholder="e.g. Scheduled system upgrade on Sunday 02:00 AM IST."
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-900"
              />
            </div>

            {/* Maintenance Mode & Registration Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Maintenance Mode</span>
                  <span className="text-[11px] text-slate-400">
                    Restricts citizen submissions while performing database migration.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={e => setMaintenanceMode(e.target.checked)}
                  className="w-5 h-5 text-govblue-600 rounded-md border-slate-300 focus:ring-govblue-500"
                />
              </label>

              <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Allow Citizen Registrations</span>
                  <span className="text-[11px] text-slate-400">
                    Permits new citizens to register accounts via the onboarding portal.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={e => setAllowRegistration(e.target.checked)}
                  className="w-5 h-5 text-govblue-600 rounded-md border-slate-300 focus:ring-govblue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Security & Session */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                Security & Session Management
              </h3>
              <p className="text-xs text-slate-500">
                JWT expiration windows and inactivity constraints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                JWT Session Lifespan (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="10080"
                value={sessionTimeout}
                onChange={e => setSessionTimeout(Number(e.target.value))}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: 1440 mins (24 Hours)
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-govblue-600 hover:bg-govblue-700 text-white font-bold text-xs shadow-md shadow-govblue-900/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Synchronizing Nodes...' : 'Save Configuration Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
