/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types';

export type LoginTab = 'candidate' | 'employer' | 'admin' | 'handler' | 'shg';

export const ROLE_TAB_MAP: Record<LoginTab, UserRole[]> = {
  candidate: [UserRole.CANDIDATE, UserRole.SHG],
  employer: [UserRole.COMPANY],
  admin: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  handler: [UserRole.HANDLER],
  shg: [UserRole.SHG],
};

export const TAB_LABELS: Record<LoginTab, { mr: string; en: string }> = {
  candidate: { mr: 'नोकरी शोधक', en: 'Job Seeker' },
  employer: { mr: 'उद्योजक', en: 'Employer' },
  admin: { mr: 'प्रशासक', en: 'Admin' },
  handler: { mr: 'मदतनीस', en: 'Handler' },
  shg: { mr: 'बचत गट', en: 'SHG' },
};

export const ROLE_LABELS: Record<UserRole, { mr: string; en: string }> = {
  [UserRole.CANDIDATE]: { mr: 'नोकरी शोधक', en: 'Job Seeker' },
  [UserRole.COMPANY]: { mr: 'उद्योजक', en: 'Employer' },
  [UserRole.ADMIN]: { mr: 'प्रशासक', en: 'Admin' },
  [UserRole.SUPER_ADMIN]: { mr: 'मुख्य प्रशासक', en: 'Super Admin' },
  [UserRole.HANDLER]: { mr: 'मदतनीस', en: 'Handler' },
  [UserRole.SHG]: { mr: 'बचत गट', en: 'SHG' },
};

export function isRoleAllowedForTab(userRole: UserRole, tab: LoginTab): boolean {
  return ROLE_TAB_MAP[tab]?.includes(userRole) ?? false;
}

export function getCorrectTabForRole(userRole: UserRole): LoginTab {
  for (const [tab, roles] of Object.entries(ROLE_TAB_MAP)) {
    if (roles.includes(userRole)) {
      return tab as LoginTab;
    }
  }
  return 'candidate';
}

export function getMismatchMessage(userRole: UserRole, currentTab: LoginTab): string {
  const roleLabel = ROLE_LABELS[userRole] || { mr: userRole, en: userRole };
  const correctTab = getCorrectTabForRole(userRole);
  const correctLabel = TAB_LABELS[correctTab];

  return `ही ${roleLabel.mr} (${roleLabel.en}) लॉगिन आहे. कृपया ${correctLabel.mr} (${correctLabel.en}) टॅब वापरा. / This is a ${roleLabel.en} account. Please use the ${correctLabel.en} tab to log in.`;
}
