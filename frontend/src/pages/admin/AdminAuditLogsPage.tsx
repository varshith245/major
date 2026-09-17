import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  X,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuditLogItem {
  id: number;
  timestamp: string;
  admin_email: string;
  admin_name: string;
  action: string;
  resource: string;
  resource_id: string;
  details: any;
  ip_address: string;
  status: string;
}

export const AdminAuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        resource: resourceFilter !== 'all' ? resourceFilter : undefined,
        search: search.trim() || undefined,
        limit: 150
      });
      setLogs(res.logs || []);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      showToast('Failed to load security audit trail.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, resourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Immutable Security & Governance Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            Administrative Audit & Compliance Logs
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Append-only record of all administrative operations, scheme alterations, user status toggles, and system security events.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Audit Logs
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor or resource ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-govblue-500 text-slate-800 transition"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Actions</option>
            <option value="SCHEME_CREATED">Scheme Created</option>
            <option value="SCHEME_UPDATED">Scheme Updated</option>
            <option value="SCHEME_STATUS_TOGGLED">Scheme Status Changed</option>
            <option value="USER_STATUS_TOGGLED">User Status Changed</option>
            <option value="USER_DELETED">User Deleted</option>
            <option value="SETTINGS_UPDATED">Settings Updated</option>
          </select>

          <select
            value={resourceFilter}
            onChange={e => setResourceFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Resources</option>
            <option value="scheme">Scheme</option>
            <option value="user">User</option>
            <option value="system_settings">System Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Administrator / Actor</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No security audit logs recorded yet for this criteria.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const isDelete = log.action.includes('DELETED') || log.action.includes('ARCHIVED');
                  const isCreate = log.action.includes('CREATED');
                  const isUpdate = log.action.includes('UPDATED') || log.action.includes('TOGGLED');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            isCreate
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDelete
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isUpdate
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{log.admin_name || 'Administrator'}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{log.admin_email}</span>
                      </td>

                      {/* Resource */}
                      <td className="py-3 px-4 font-semibold text-slate-700 uppercase text-[11px]">
                        {log.resource}
                      </td>

                      {/* Resource ID */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] truncate max-w-[120px]">
                        {log.resource_id || 'Global'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {log.status || 'Success'}
                        </span>
                      </td>

                      {/* Action / Inspect */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-govblue-600 hover:bg-slate-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h3 className="font-heading font-black text-sm">Audit Record #{selectedLog.id} Payload</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Action</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.action}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Target Resource</span>
                  <span className="font-bold text-slate-800">{selectedLog.resource} / {selectedLog.resource_id}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Metadata & Parameters (JSON)
                </span>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
