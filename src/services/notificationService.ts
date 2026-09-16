/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Notification service for the translated ring bell.
 * GET  /api/v1/notification            -> list notifications (JWT token attached by axiosInstance)
 * POST /api/v1/notification/read/{id}  -> mark single notification as read (with fallbacks)
 *
 * Parsing is intentionally tolerant: it handles camelCase / PascalCase field
 * names, numeric + boolean read flags, and { value: [...] }, { data: [...] },
 * and nested wrapper objects so any backend response renders.
 */

import axiosInstance from './axiosInstance';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
  type?: string;
}

/** Case-insensitive property lookup: { NotificationId } === 'notificationId'. */
const getProp = (item: any, names: string[]): any => {
  if (!item || typeof item !== 'object') return undefined;
  for (const n of names) {
    const v = item[n];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  const lowerMap: Record<string, any> = {};
  for (const k of Object.keys(item)) lowerMap[k.toLowerCase()] = item[k];
  for (const n of names) {
    const v = lowerMap[n.toLowerCase()];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

/** Tolerant read/unread flag parsing across backend conventions. */
const readFlag = (item: any): boolean => {
  const raw = getProp(item, ['isRead', 'readStatus', 'read', 'isReadStatus', 'alreadyRead', 'status']);
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw === 1;
  const str = String(raw ?? '').toLowerCase();
  if (['read', 'seen', 'viewed', 'true', '1', 'yes', 'done', 'complete', 'delivered'].includes(str)) return true;
  if (['unread', 'new', 'pending', 'false', '0', 'no', 'sent'].includes(str)) return false;
  return false;
};

const toNotification = (item: any, idx: number): AppNotification => {
  if (!item || typeof item !== 'object') item = {};

  const foundId = getProp(item, [
    'id',
    'notificationId',
    'notificationID',
    'notification_id',
    'notificationUid',
    'notificationKey',
    'nid',
    'uid',
    'key',
  ]);
  // Never drop an item for display — fall back to an index-based id.
  const id = foundId !== undefined && foundId !== null ? String(foundId) : `notif-${idx}`;

  const createdAtRaw = getProp(item, [
    'createdDate',
    'createdOn',
    'createdOnDate',
    'notificationDate',
    'dateSent',
    'createdAt',
    'date',
    'addedDate',
    'loggedDate',
  ]);
  let createdAt = '';
  if (createdAtRaw) {
    const d = new Date(createdAtRaw);
    createdAt = isNaN(d.getTime()) ? String(createdAtRaw) : d.toISOString();
  }

  return {
    id,
    title: String(
      getProp(item, ['title', 'subject', 'notificationTitle', 'heading', 'titleEn', 'titleMr', 'notification'])
      || 'Notification'
    ),
    message: String(
      getProp(item, ['message', 'content', 'body', 'bodyText', 'description', 'text', 'messageEn', 'messageMr', 'details'])
      || ''
    ),
    isRead: readFlag(item),
    createdAt,
    linkUrl: getProp(item, ['linkUrl', 'url', 'navigateTo', 'redirectUrl', 'actionUrl']) as string | undefined,
    type: getProp(item, ['type', 'notificationType', 'category']) as string | undefined,
  };
};

const WRAPPER_KEYS = [
  'value',
  'data',
  'items',
  'results',
  'result',
  'notifications',
  'notificationList',
  'notificationlist',
  'model',
  'payload',
  'list',
  'records',
  'rows',
  'table',
];

/** Tolerant list extraction — exact keys, then case-insensitive, then nested. */
const extractList = (data: any, depth = 0): any[] => {
  if (Array.isArray(data)) {
    // Even a partially "cleanable" array is returned as-is.
    return data.filter((x) => x !== null && x !== undefined);
  }
  if (!data || typeof data !== 'object' || depth > 2) return [];

  // 1) Exact wrapper keys
  for (const k of WRAPPER_KEYS) {
    const v = data[k];
    if (Array.isArray(v)) return v;
  }

  // 2) Case-insensitive wrapper keys
  const lowerMap: Record<string, any> = {};
  for (const k of Object.keys(data)) lowerMap[k.toLowerCase()] = data[k];
  for (const k of WRAPPER_KEYS) {
    const v = lowerMap[k.toLowerCase()];
    if (Array.isArray(v)) return v;
  }

  // 3) Nested wrapper object ({ value: { items: [...] } })
  for (const k of WRAPPER_KEYS) {
    const v = lowerMap[k.toLowerCase()];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const nested = extractList(v, depth + 1);
      if (nested.length > 0) return nested;
    }
  }

  // 4) Last resort: first array found anywhere on this object
  for (const v of Object.values(data)) {
    if (Array.isArray(v)) return v;
  }

  return [];
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const res = await axiosInstance.get('/api/v1/notification');
  const list = extractList(res.data);
  return list.map((item, idx) => toNotification(item, idx));
};

/** Try several plausible mark-as-read endpoints; ignore failures silently. */
export const markNotificationRead = async (id: string): Promise<void> => {
  const candidates: Array<{ method: string; url: string }> = [
    { method: 'POST', url: `/api/v1/notification/read/${id}` },
    { method: 'POST', url: `/api/v1/notification/${id}/read` },
    { method: 'POST', url: `/api/v1/notification/markasread/${id}` },
    { method: 'POST', url: `/api/v1/notification/markread/${id}` },
    { method: 'PUT', url: `/api/v1/notification/read/${id}` },
  ];
  for (const c of candidates) {
    try {
      await axiosInstance.request({ method: c.method, url: c.url });
      return;
    } catch (_) {
      // fall through to next pattern
    }
  }
};

export const markAllNotificationsRead = async (notifications: AppNotification[]): Promise<void> => {
  const unread = notifications.filter((n) => !n.isRead);
  await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => {})));
};