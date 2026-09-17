import React, { useState, useEffect, useMemo } from 'react';
import { adminService, AdminUser } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Wallet,
  Building,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected user for details drawer
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  // User to delete
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 200
      });
      setUsers(res.users || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      showToast(err.message || 'Failed to retrieve user registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.user_id === currentUser?.user_id) {
      showToast('You cannot deactivate your own administrative account.', 'warning');
      return;
    }
    const newStatus = !user.is_active;
    setActionInProgress(user.user_id);
    try {
      await adminService.updateUserStatus(user.user_id, newStatus);
      showToast(
        `User ${user.full_name} (${user.email}) has been ${newStatus ? 'activated' : 'deactivated'}.`,
        'success'
      );
      setUsers(prev =>
        prev.map(u => (u.user_id === user.user_id ? { ...u, is_active: newStatus } : u))
      );
      if (selectedUser?.user_id === user.user_id) {
        setSelectedUser({ ...selectedUser, is_active: newStatus });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update account status.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.user_id === currentUser?.user_id) {
      showToast('You cannot delete your own administrative account.', 'error');
      setDeleteTarget(null);
      return;
    }
    setActionInProgress(deleteTarget.user_id);
    try {
      await adminService.deleteUser(deleteTarget.user_id);
      showToast(`User account ${deleteTarget.email} safely purged.`, 'info');
      setUsers(prev => prev.filter(u => u.user_id !== deleteTarget.user_id));
      if (selectedUser?.user_id === deleteTarget.user_id) {
        setSelectedUser(null);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user account.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const citizens = users.filter(u => u.role === 'user').length;
    return { total, active, admins, citizens };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govblue-600/20 border border-govblue-500/30 text-sky-400 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            Identity & Access Management (IAM)
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
            User Directory & Access Control
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Audit registered citizens, verify biometric/demographic profiles, manage administrative permissions, and enforce security policies.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-govblue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Citizens</p>
            <h3 className="text-2xl font-black text-emerald-700">{stats.active}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Admins</p>
            <h3 className="text-2xl font-black text-purple-700">{stats.admins}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inactive / Suspended</p>
            <h3 className="text-2xl font-black text-amber-700">{stats.total - stats.active}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by citizen name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-govblue-500 text-slate-800 transition placeholder:text-slate-400"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 font-medium text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="user">Citizen (User)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-govblue-500 font-medium text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Citizen / User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">State / Profile</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-govblue-600" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No registered users matched your criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search parameters.</p>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isCurrentAdmin = u.user_id === currentUser?.user_id;
                  const profile = u.user_profile;

                  return (
                    <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-govblue-50 text-govblue-700 border border-govblue-100'
                          }`}>
                            {u.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="truncate max-w-[200px]">
                            <p className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              {u.full_name}
                              {isCurrentAdmin && (
                                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded-md">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-slate-600">
                        {u.phone_number ? (
                          <span className="font-mono text-[11px]">{u.phone_number}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px]">
                            <Shield className="w-3 h-3 text-purple-600" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            <UserIcon className="w-3 h-3 text-slate-500" />
                            Citizen
                          </span>
                        )}
                      </td>

                      {/* State / Profile Status */}
                      <td className="py-3 px-4">
                        {profile ? (
                          <div className="truncate max-w-[150px]">
                            <span className="font-semibold text-slate-800">{profile.state || 'India'}</span>
                            <p className="text-[10px] text-slate-400">{profile.occupation || 'Citizen'}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            Pending Onboarding
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            title="Inspect Profile & Demographics"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-govblue-600 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={actionInProgress === u.user_id || isCurrentAdmin}
                            title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg transition ${
                              u.is_active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            } disabled:opacity-40`}
                          >
                            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isCurrentAdmin}
                            title="Delete User Account"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-govblue-700 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {selectedUser.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-white">{selectedUser.full_name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedUser.role === 'admin'
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30'
                        : 'bg-sky-900/60 text-sky-300 border border-sky-500/30'
                    }`}>
                      {selectedUser.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'CITIZEN'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedUser.is_active
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-500/30'
                    }`}>
                      {selectedUser.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Account Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1 font-semibold">User ID</span>
                  <span className="font-mono text-slate-700 font-bold truncate block">{selectedUser.user_id}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1 font-semibold">Phone Number</span>
                  <span className="font-mono text-slate-700 font-bold">{selectedUser.phone_number || 'N/A'}</span>
                </div>
              </div>

              {/* Citizen Demographic Profile */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-govblue-600" />
                  Demographic Assessment Profile
                </h4>

                {selectedUser.user_profile ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Age / Gender</span>
                        <span className="font-bold text-slate-800">{selectedUser.user_profile.age || 'N/A'} yrs • {selectedUser.user_profile.gender || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Location</span>
                        <span className="font-bold text-slate-800">{selectedUser.user_profile.district ? `${selectedUser.user_profile.district}, ` : ''}{selectedUser.user_profile.state || 'India'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Occupation</span>
                        <span className="font-bold text-slate-800">{selectedUser.user_profile.occupation || 'Unspecified'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                      <Wallet className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Annual Income</span>
                        <span className="font-bold text-slate-800">
                          {selectedUser.user_profile.annual_income != null ? `₹${Number(selectedUser.user_profile.annual_income).toLocaleString('en-IN')}` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 col-span-2">
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Caste Category & Landholding</span>
                        <span className="font-bold text-slate-800">
                          Category: {selectedUser.user_profile.caste_category || 'General'} • Landholding: {selectedUser.user_profile.owns_land ? `${selectedUser.user_profile.landholding_acres || 'Yes'} acres` : 'No land'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No onboarding questionnaire completed yet by this user.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(selectedUser)}
                  disabled={selectedUser.user_id === currentUser?.user_id}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    selectedUser.is_active
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {selectedUser.is_active ? 'Suspend Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-heading font-black text-slate-900">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete user <strong className="text-slate-800">{deleteTarget.full_name}</strong> ({deleteTarget.email})? This will purge all associated assessments, documents, and chat records. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionInProgress === deleteTarget.user_id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:opacity-50"
              >
                {actionInProgress === deleteTarget.user_id ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
