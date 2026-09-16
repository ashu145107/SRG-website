/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, BellRing, CheckCheck, Inbox, RefreshCw, Loader2 } from 'lucide-react';
import { Loader } from './ui/FeedbackComponents';
import { RootState } from '../store';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  AppNotification,
} from '../services/notificationService';

interface NotificationBellProps {
  /** 'light' for cream/light navbars, 'dark' for violet/colored navbars */
  variant?: 'light' | 'dark';
}

const formatWhen = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const NotificationBell: React.FC<NotificationBellProps> = ({ variant = 'light' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isDark = variant === 'dark';

  // Phones anchor the panel to the viewport (fixed + centered) because the
  // bell's absolutely-positioned ancestor can overflow the screen on mobile.
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Measure the bell's real position so the fixed panel drops right below it.
  useEffect(() => {
    if (open && isMobile && wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setPanelTop(Math.min(r.bottom + 8, window.innerHeight - 12));
    }
  }, [open, isMobile]);

  const { data: notifications = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    retry: 2,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) refetch();
      return next;
    });
  };

  const handleItemClick = async (n: AppNotification) => {
    // Mark as read instantly (optimistic), sync to server in the background
    if (n.linkUrl) setOpen(false);
    if (!n.isRead) {
      setUpdatingIds((prev) => new Set(prev).add(n.id));
      queryClient.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
      await markNotificationRead(n.id).catch(() => {});
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(n.id);
        return next;
      });
    }
    if (n.linkUrl) {
      if (/^https?:\/\//i.test(n.linkUrl)) {
        window.location.href = n.linkUrl;
      } else {
        navigate(n.linkUrl);
      }
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    setUpdatingIds((prev) => new Set([...prev, ...ids]));
    queryClient.setQueryData<AppNotification[]>(['notifications'], (prev) =>
      prev?.map((x) => (x.isRead ? x : { ...x, isRead: true }))
    );
    await markAllNotificationsRead(notifications).catch(() => {});
    setUpdatingIds(new Set());
  };

  if (!isAuthenticated) return null;

  const bellClass = isDark
    ? 'text-white hover:bg-white/10'
    : 'text-theme-darkViolet hover:bg-theme-lightViolet/40';
  const ringClass = isDark ? 'ring-theme-darkViolet' : 'ring-white';

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={toggle}
        className={`relative p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${bellClass}`}
        title="Notifications"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span
            className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ${ringClass} shadow-sm`}
          />
        )}
      </button>

      {open && (
        <div
          className={`srg-notification-panel bg-white rounded-2xl shadow-2xl border border-theme-lightViolet/70 animate-fade-in text-left font-sans ${
            isMobile ? 'srg-notification-panel--fixed' : ''
          }`}
          style={isMobile ? { top: panelTop } : undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-theme-lightViolet/60 bg-theme-cream/50">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-theme-lavender shrink-0" />
              <span className="text-xs font-extrabold text-theme-darkViolet whitespace-nowrap">
                {t('notifications.title')}
              </span>
              {unreadCount > 0 && (
                <span className="text-[9px] font-bold bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-none shrink-0">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              className="text-[10px] font-bold text-theme-lavender hover:underline cursor-pointer disabled:opacity-40 inline-flex items-center gap-1 whitespace-nowrap"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('notifications.markAllRead')}
            </button>
          </div>

          {/* Body */}
          <div className="srg-notification-list divide-y divide-slate-50" role="list">
            {isLoading ? (
              <div className="py-4">
                <Loader />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUpdating = updatingIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer flex gap-3 ${
                      n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-theme-lightViolet/40 hover:bg-theme-lightViolet/60'
                    }`}
                    title={n.linkUrl ? 'Open' : n.message || undefined}
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        n.isRead ? 'bg-transparent' : isUpdating ? 'bg-amber-400 animate-pulse' : 'bg-theme-lavender'
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-xs leading-snug break-words ${
                          n.isRead ? 'text-slate-500 font-semibold' : 'text-theme-darkViolet font-extrabold'
                        }`}
                      >
                        {n.title}
                      </span>
                      {n.message && (
                        <span className="block text-[11px] text-slate-600 mt-1 break-words line-clamp-2">
                          {n.message}
                        </span>
                      )}
                      {n.createdAt && (
                        <span className="block text-[9px] text-slate-400 font-bold mt-1.5">
                          {formatWhen(n.createdAt)}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-theme-lightViolet/60 bg-theme-cream/50">
            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1.5">
              {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
              {isFetching
                ? 'Refreshing...'
                : `${notifications.length} ${notifications.length === 1 ? 'notification' : 'notifications'}`}
            </span>
            <button
              onClick={() => refetch()}
              className="text-[10px] font-bold text-theme-lavender hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;