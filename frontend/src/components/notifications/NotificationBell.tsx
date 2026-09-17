import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  CheckCheck,
  Check,
  Smartphone,
  Mail,
  Trash2,
  Inbox
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';

interface NotificationBellProps {
  className?: string;
  isAuthPage?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  isAuthPage = false
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll unread badge count
  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignored if unauthenticated or network error
    }
  };

  const fetchNotifications = async (unreadOnly = filterUnreadOnly) => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(unreadOnly, 30);
      setNotifications(data);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filterUnreadOnly]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUnreadCount();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNavigate = (url?: string) => {
    if (!url) return;
    setIsOpen(false);
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'DOCUMENT_REQUEST':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Documents Required',
          bg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'BENEFIT_SANCTION':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Benefit Sanctioned',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'STATUS_UPDATE':
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-sky-600" />,
          label: 'Status Update',
          bg: 'bg-sky-50 text-sky-800 border-sky-200'
        };
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Application Alerts and Notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-full transition-colors flex items-center justify-center ${
          isAuthPage
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full ring-2 ring-white animate-pulse"
            title={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in text-slate-800">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-govblue-100 text-govblue-800 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">Citizen Alerts & Dispatcher</h4>
                <p className="text-[10px] text-slate-500">Official nodal decisions & tracker notices</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-govblue-700 hover:text-govblue-900 hover:bg-govblue-50 px-2 py-1 rounded transition flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterUnreadOnly(false)}
                className={`px-2 py-0.5 rounded-full font-medium transition ${
                  !filterUnreadOnly
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterUnreadOnly(true)}
                className={`px-2 py-0.5 rounded-full font-medium transition ${
                  filterUnreadOnly
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <span className="text-[10px] text-slate-400">Multi-Channel Active</span>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-govblue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Retrieving latest notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filterUnreadOnly ? 'You are all caught up! No unread alerts.' : 'Official nodal alerts will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map(notif => {
                const badge = getTypeBadge(notif.type);
                return (
                  <div
                    key={notif.id || Math.random().toString()}
                    onClick={() => handleNavigate(notif.action_url)}
                    className={`p-3.5 transition-colors cursor-pointer group hover:bg-slate-50 relative ${
                      !notif.is_read ? 'bg-sky-50/30' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Left indicator / unread dot */}
                      <div className="mt-0.5 shrink-0 flex flex-col items-center gap-1">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition">
                          {badge.icon}
                        </div>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" title="Unread" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimestamp(notif.created_at)}
                          </span>
                        </div>

                        <h5 className={`text-xs font-bold leading-tight ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title || 'Official Application Notice'}
                        </h5>

                        <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-3">
                          {notif.message}
                        </p>

                        {/* Metadata & Scheme Tag */}
                        {notif.scheme_name && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span className="truncate">{notif.scheme_name}</span>
                            {notif.reference_no && (
                              <span className="text-slate-400 font-mono">#{notif.reference_no}</span>
                            )}
                          </div>
                        )}

                        {/* Multi-Channel Simulator Indicator */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5 text-slate-500" title="Simulated SMS dispatched">
                              <Smartphone className="w-2.5 h-2.5 text-sky-600" /> SMS Sim
                            </span>
                            <span className="flex items-center gap-0.5 text-slate-500" title="Simulated Email dispatched">
                              <Mail className="w-2.5 h-2.5 text-govblue-600" /> Email Sim
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notif.is_read && (
                              <button
                                onClick={e => handleMarkAsRead(e, notif.id)}
                                className="p-1 text-slate-400 hover:text-govblue-700 hover:bg-slate-200 rounded transition"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={e => handleDelete(e, notif.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {notif.action_url && (
                              <span className="text-govblue-700 hover:underline flex items-center gap-0.5 font-semibold">
                                Open <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard?tab=applications');
              }}
              className="text-xs font-bold text-govblue-800 hover:text-govblue-900 transition flex items-center justify-center gap-1 mx-auto"
            >
              <span>View All Applications & History</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
