import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { t } from '../../i18n';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import {
  Menu,
  Shield,
  User as UserIcon,
  LogOut,
  Bookmark,
  Scale,
  FileCheck,
  Search,
  Sparkles,
  LayoutDashboard,
  CheckCircle,
  Settings,
  Bell
} from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;

  const isActive = (path: string) => location.pathname === path;

  const publicNavLinks = [
    { label: t('nav_home', language), path: '/' },
    { label: t('nav_explore', language), path: '/schemes' },
    { label: t('nav_how_it_works', language), path: '/#how-it-works' },
    { label: t('nav_features', language), path: '/#features' }
  ];

  const authNavLinks = [
    {
      label: user?.role === 'admin' ? 'Admin Dashboard' : t('nav_dashboard', language),
      path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    { label: t('nav_assistant', language), path: '/assistant', icon: <Sparkles className="w-4 h-4" /> },
    { label: t('nav_explore', language), path: '/schemes', icon: <Search className="w-4 h-4" /> },
    { label: t('nav_eligibility', language), path: '/eligibility', icon: <CheckCircle className="w-4 h-4" /> },
    { label: t('nav_documents', language), path: '/documents', icon: <FileCheck className="w-4 h-4" /> },
    { label: t('nav_compare', language), path: '/compare', icon: <Scale className="w-4 h-4" /> }
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${isAuthPage
          ? 'bg-slate-950/40 backdrop-blur-md border-b border-white/10'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Subtle Tag */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-govblue-800 text-white flex items-center justify-center shadow-md group-hover:bg-govblue-900 transition-colors">
            <Shield className="w-5 h-5 text-sky-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xl font-black tracking-tight font-heading ${isAuthPage ? 'text-white' : 'text-slate-900'
                  }`}
              >
                SEVA
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${isAuthPage
                    ? 'bg-white/10 text-sky-200 border-white/20'
                    : 'bg-govgreen-50 text-govgreen-700 border-govgreen-200'
                  }`}
              >
                Civic AI
              </span>
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:inline-block ${isAuthPage ? 'text-slate-300' : 'text-slate-500'
                }`}
            >
              {t('brand_badge', language)}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {(!isAuthenticated ? publicNavLinks : authNavLinks).map(link => {
            const active = isActive(link.path);
            let linkClass = '';
            if (isAuthPage) {
              linkClass = active
                ? 'bg-white/20 text-white font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/10';
            } else {
              linkClass = active
                ? 'bg-govblue-50 text-govblue-800 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
            }

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${linkClass}`}
              >
                {(link as any).icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Profile Menu */}
        <div className="hidden sm:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              {/* Contextual buttons: on login page, only Register; on register page, only Sign In; otherwise both */}
              {!isLoginPage && (
                <Button
                  variant={isAuthPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  {t('nav_login', language)}
                </Button>
              )}
              {!isRegisterPage && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  {t('nav_register', language)}
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationBell isAuthPage={isAuthPage} />
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                aria-label="User profile menu"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-govblue-800 text-white flex items-center justify-center font-bold text-xs">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'C'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.full_name || 'Citizen'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Nodal Officer' : 'Citizen'}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{user?.full_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    {t('nav_profile', language)}
                  </Link>
                  <Link
                    to="/saved"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    {t('nav_saved', language)}
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    {t('nav_settings', language)}
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-govblue-800 bg-govblue-50/70 hover:bg-govblue-100/80 transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-govblue-700" />
                        <span>Manage Users</span>
                      </Link>
                    </>
                  )}
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('nav_logout', language)}
                  </button>
                </div>
              )}
            </div>
            </div>
          )}
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && (
            <NotificationBell isAuthPage={isAuthPage} />
          )}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation"
            className={`p-2 rounded-lg transition-colors ${isAuthPage
                ? 'text-white hover:bg-white/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="SEVA Menu"
      >
        <div className="flex flex-col gap-4 py-2">
          {(!isAuthenticated ? publicNavLinks : authNavLinks).map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold ${isActive(link.path)
                  ? 'bg-govblue-50 text-govblue-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              {(link as any).icon}
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="border-t border-slate-200 pt-4 mt-2">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                {!isLoginPage && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    {t('nav_login', language)}
                  </Button>
                )}
                {!isRegisterPage && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                  >
                    {t('nav_register', language)}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard?tab=applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Bell className="w-4 h-4 text-slate-500" />
                  <span>Alerts & Notifications</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  {t('nav_profile', language)}
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  {t('nav_saved', language)}
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  {t('nav_settings', language)}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-bold text-govblue-800 bg-govblue-50 hover:bg-govblue-100 transition"
                  >
                    <Shield className="w-4 h-4 text-govblue-700" />
                    <span>Manage Users (Admin)</span>
                  </Link>
                )}
                <Button
                  variant="danger"
                  className="w-full mt-2"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                >
                  {t('nav_logout', language)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};
