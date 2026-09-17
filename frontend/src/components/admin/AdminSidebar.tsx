import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  FileText,
  ClipboardCheck,
  Bot,
  Lightbulb,
  MessageSquare,
  Globe2,
  BarChart3,
  ShieldAlert,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Administrator session closed successfully.', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Citizen Applications', path: '/admin/applications', icon: ClipboardCheck },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Government Schemes', path: '/admin/schemes', icon: Building2 },
    { label: 'Eligibility Rules', path: '/admin/eligibility-rules', icon: FileCheck },
    { label: 'Document Requirements', path: '/admin/documents', icon: FileText },
    { label: 'AI & NLP Center', path: '/admin/ai', icon: Bot, highlight: true },
    { label: 'Recommendations', path: '/admin/recommendations', icon: Lightbulb },
    { label: 'Queries & Chats', path: '/admin/queries', icon: MessageSquare },
    { label: 'Languages', path: '/admin/languages', icon: Globe2 },
    { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Security & Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
    { label: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-68'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 overflow-hidden text-white font-bold"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-govblue-700 to-sky-500 flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                  SEVA <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-400 border border-sky-400/30 px-1.5 py-0.5 rounded-md">Admin</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">Government AI Control</span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-govblue-600 text-white shadow-md shadow-govblue-900/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footer / Logout */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-2">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-govblue-900 text-sky-300 font-black text-xs flex items-center justify-center shrink-0 border border-sky-500/30">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@egovseva.gov.in'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
