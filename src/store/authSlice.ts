/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, HandlerPermissions } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  lastLogin: string | null;
}

export const getTokenExpiration = (token: string | null): number | null => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null, now = Date.now()): boolean => {
  const expiresAt = getTokenExpiration(token);
  return expiresAt !== null && expiresAt <= now;
};

const getInitialState = (): AuthState => {
  const savedAuth = localStorage.getItem('srg_auth_state');
  if (savedAuth) {
    try {
      const parsed = JSON.parse(savedAuth);
      if (!parsed.user || !parsed.token || isTokenExpired(parsed.token)) {
        localStorage.removeItem('srg_auth_state');
        return {
          user: null,
          token: null,
          isAuthenticated: false,
          lastLogin: null,
        };
      }

      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: true,
        lastLogin: parsed.lastLogin || null,
      };
    } catch {
      localStorage.removeItem('srg_auth_state');
    }
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    lastLogin: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.lastLogin = new Date().toISOString();
      localStorage.setItem('srg_auth_state', JSON.stringify({ user: state.user, token: state.token, lastLogin: state.lastLogin }));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.lastLogin = null;
      localStorage.removeItem('srg_auth_state');
      localStorage.removeItem('srg_auth');
    },
    updateHandlerPermissions: (state, action: PayloadAction<HandlerPermissions>) => {
      if (state.user && state.user.role === 'HANDLER') {
        state.user.handlerPermissions = action.payload;
        localStorage.setItem('srg_auth_state', JSON.stringify({ user: state.user, token: state.token, lastLogin: state.lastLogin }));
      }
    },
    updateProfileRefs: (
      state,
      action: PayloadAction<{ companyId?: string; candidateId?: string; shgId?: string }>
    ) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('srg_auth_state', JSON.stringify({ user: state.user, token: state.token, lastLogin: state.lastLogin }));
      }
    }
  }
});

export const { setCredentials, logout, updateHandlerPermissions, updateProfileRefs } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };
