/**
 * Client-side store for the most recent application status change.
 *
 * The backend list endpoints (company/user myjobapplications and jobsearch)
 * can keep returning the initial status (e.g. "Submitted") even after an
 * employer changes it, so the updated status never reaches the employer
 * pipeline / candidate applied list. This store records the latest update
 * locally and is read by both lists so the recent status is always shown.
 *
 * It is intentionally shared via localStorage so a status changed by an
 * employer is visible in the candidate's applied list on the same browser,
 * while the normal API call still persists it server-side.
 */

export interface StatusOverride {
  statusId: number;
  statusName: string;
  updatedAt: number;
}

export interface StatusOverrideKeySource {
  applicationId?: number | string;
  id?: number | string;
  jobId?: number | string;
  jobCode?: string;
}

const STORAGE_KEY = 'srg_app_status_overrides';
const EVENT_NAME = 'srg:status-override';

const read = (): Record<string, StatusOverride> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, StatusOverride>) : {};
  } catch {
    return {};
  }
};

const write = (store: Record<string, StatusOverride>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    /* non-browser environment — ignore */
  }
};

const numeric = (v: unknown): string => {
  const digits = String(v ?? '').replace(/\D/g, '');
  return digits && digits.length <= 15 ? digits : '';
};

const keysFor = (source: StatusOverrideKeySource): string[] => {
  const keys: string[] = [];
  if (source.applicationId !== undefined && source.applicationId !== null && source.applicationId !== 0 && source.applicationId !== '0') {
    keys.push(`app:${numeric(source.applicationId) || source.applicationId}`);
  }
  if (source.id !== undefined && source.id !== null && String(source.id).trim() !== '') {
    keys.push(`id:${String(source.id).trim()}`);
  }
  const jobDigits = numeric(source.jobId);
  if (jobDigits) keys.push(`job:${jobDigits}`);
  if (source.jobCode && String(source.jobCode).trim()) keys.push(`code:${String(source.jobCode).trim()}`);
  return keys;
};

/** Record the latest status for an application across every key we can match on. */
export const setApplicationStatusOverride = (source: StatusOverrideKeySource, value: Omit<StatusOverride, 'updatedAt'>): void => {
  const keys = keysFor(source);
  if (!keys.length) return;
  const store = read();
  const entry: StatusOverride = { ...value, updatedAt: Date.now() };
  for (const key of keys) store[key] = entry;
  write(store);
};

/** Resolve the latest recorded status for an application, if any. */
export const getApplicationStatusOverride = (source: StatusOverrideKeySource): StatusOverride | undefined => {
  const store = read();
  for (const key of keysFor(source)) {
    const entry = store[key];
    if (entry && entry.statusName) return entry;
  }
  return undefined;
};

/** Subscribe to status-override changes (fired on any write). Returns an unsubscribe fn. */
export const subscribeApplicationStatusOverrides = (listener: () => void): (() => void) => {
  try {
    window.addEventListener(EVENT_NAME, listener);
    return () => window.removeEventListener(EVENT_NAME, listener);
  } catch {
    return () => { /* no-op */ };
  }
};
