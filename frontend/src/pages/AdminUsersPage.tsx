import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { authService } from '../services/authService';
import { User, AdminStatsResponse } from '../types';
import { Button } from '../components/ui/Button';
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { language } = useAccessibility();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        authService.getAdminUsers(150),
        authService.getAdminStats().catch(() => null)
      ]);
      setUsers(usersRes.users || []);
      if (statsRes) setStats(statsRes);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
      showToast(err.message || 'Failed to fetch registered users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (targetUser: User, newRole: 'admin' | 'user') => {
    const targetId = targetUser.user_id || targetUser.id;
    if (!targetId) return;

    if (targetId === (currentUser?.user_id || currentUser?.id) && newRole !== 'admin') {
      showToast('You cannot demote your own administrator account.', 'info');
      return;
    }

    setActionInProgress(targetId);
    try {
      const res = await authService.updateUserRole(targetId, newRole);
      showToast(res.message || `User role updated to ${newRole}`, 'success');
      setUsers(prev =>
        prev.map(u => ((u.user_id || u.id) === targetId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update user role', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleStatusToggle = async (targetUser: User) => {
    const targetId = targetUser.user_id || targetUser.id;
    if (!targetId) return;

    const newStatus = targetUser.is_active === false ? true : false;
    if (targetId === (currentUser?.user_id || currentUser?.id) && !newStatus) {
      showToast('You cannot deactivate your own administrator account.', 'info');
      return;
    }

    setActionInProgress(targetId);
    try {
      const res = await authService.updateUserStatus(targetId, newStatus);
      showToast(res.message || `Account ${newStatus ? 'activated' : 'deactivated'}`, 'success');
      setUsers(prev =>
        prev.map(u => ((u.user_id || u.id) === targetId ? { ...u, is_active: newStatus } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update account status', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const targetId = deleteConfirmUser.user_id || deleteConfirmUser.id;
    if (!targetId) return;

    setActionInProgress(targetId);
    try {
      const res = await authService.deleteUser(targetId);
      showToast(res.message || 'User account deleted permanently', 'success');
      setUsers(prev => prev.filter(u => (u.user_id || u.id) !== targetId));
      setDeleteConfirmUser(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user account', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        !searchQuery ||
        (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone_number || u.phone || '').includes(searchQuery);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      const isActive = u.is_active !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Derived counts
  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const citizenCount = users.filter(u => u.role === 'user').length;
  const activeCount = users.filter(u => u.is_active !== false).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-govblue-950 via-govblue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-sky-200 border border-white/20 mb-3">
            <Shield className="w-3.5 h-3.5 text-sky-300" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            Citizen & Administrator User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Manage registered beneficiaries and administrative nodal officers. Grant role privileges, view verification statuses, and monitor system access.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs font-bold"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          <span>Refresh Users</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Registered</div>
            <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Citizens (Users)</div>
            <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{citizenCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-govblue-800" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Administrators</div>
            <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{adminCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Accounts</div>
            <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{activeCount}</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="px-2 text-[10px] uppercase font-bold text-slate-400">Role:</span>
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  roleFilter === 'all' ? 'bg-govblue-800 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  roleFilter === 'admin' ? 'bg-govblue-800 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Admins ({adminCount})
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  roleFilter === 'user' ? 'bg-govblue-800 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Citizens ({citizenCount})
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              aria-label="Filter users by account status"
              className="p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Citizen / User</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6">Profile & State</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-govblue-800" />
                    <span>Loading registered users list...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>No users match the selected filters.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const targetId = u.user_id || u.id || '';
                  const isSelf = targetId === (currentUser?.user_id || currentUser?.id);
                  const isActive = u.is_active !== false;
                  const isUserBusy = actionInProgress === targetId;

                  return (
                    <tr key={targetId || u.email} className="hover:bg-slate-50/80 transition">
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              u.role === 'admin'
                                ? 'bg-govblue-900 text-sky-200'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.full_name || 'Unnamed User'}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-govblue-50 text-govblue-800 px-2 py-0.5 rounded-full font-bold border border-govblue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{u.email}</span>
                              </span>
                              {u.phone_number && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{u.phone_number}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 bg-govblue-50 text-govblue-900 border border-govblue-200 px-3 py-1 rounded-full font-bold text-[11px]">
                            <Shield className="w-3.5 h-3.5 text-govblue-700" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full font-semibold text-[11px]">
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                            <span>Citizen / User</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      {/* Profile / State */}
                      <td className="py-4 px-6">
                        <div className="text-slate-700 font-medium">
                          {u.user_profile?.state || 'All-India'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {u.user_profile?.occupation || 'General Citizen'}
                          {u.user_profile?.caste_category ? ` • ${u.user_profile.caste_category}` : ''}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Role Toggle */}
                          <button
                            type="button"
                            disabled={isSelf || isUserBusy}
                            onClick={() => handleRoleChange(u, u.role === 'admin' ? 'user' : 'admin')}
                            title={isSelf ? 'Cannot demote yourself' : u.role === 'admin' ? 'Demote to Citizen' : 'Promote to Admin'}
                            className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed border-slate-200 hover:bg-slate-100 text-slate-700 bg-white"
                          >
                            {u.role === 'admin' ? 'Demote to Citizen' : 'Make Admin'}
                          </button>

                          {/* Status Toggle */}
                          <button
                            type="button"
                            disabled={isSelf || isUserBusy}
                            onClick={() => handleStatusToggle(u)}
                            title={isSelf ? 'Cannot deactivate yourself' : isActive ? 'Deactivate account' : 'Reactivate account'}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                              isActive
                                ? 'border-amber-200 text-amber-800 hover:bg-amber-50 bg-white'
                                : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50 bg-white'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isSelf || isUserBusy}
                            onClick={() => setDeleteConfirmUser(u)}
                            title={isSelf ? 'Cannot delete yourself' : 'Delete user account'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently remove the account for{' '}
                <strong>{deleteConfirmUser.full_name}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Yes, Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
