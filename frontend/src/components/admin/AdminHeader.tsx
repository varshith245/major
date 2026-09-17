import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobile: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Format section title from path
  const currentPath = location.pathname.replace('/admin', '') || '/dashboard';
  const sectionTitle = currentPath.substring(1).replace('-', ' ').replace('/', ' › ').toUpperCase() || 'DASHBOARD';

  const mockNotifications = [
    { id: 1, title: 'AI Assistant Active', desc: 'Inference latency optimal at 15ms', time: 'Just now', type: 'success' },
    { id: 2, title: 'Database Synced', desc: 'SQLite schemes and MongoDB Atlas ready', time: '10m ago', type: 'info' },
    { id: 3, title: 'Audit Check Passed', desc: 'RBAC verification 100% compliant', time: '1h ago', type: 'success' }
  ];

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/admin/dashboard" className="hover:text-govblue-700 transition font-bold text-slate-700">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold tracking-wide">{sectionTitle}</span>
        </div>
      </div>

      {/* Right: Actions, Health, Citizen Portal link, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* System Health Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Operational</span>
        </div>

        {/* View Citizen Side */}
        <Link
          to="/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          title="Open Citizen Portal in new tab"
        >
          <span>Citizen Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-sky-500 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900 font-heading">System Notifications</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">3 New</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-govblue-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
              <div className="p-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1 inline-block px-2 py-0.5 text-[9px] font-black uppercase rounded bg-govblue-50 text-govblue-800 border border-govblue-200">
                  Role: {user?.role || 'admin'}
                </span>
              </div>
              <Link
                to="/admin/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Admin Profile</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium transition"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
