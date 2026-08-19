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

const getInitialState = (): AuthState => {
  const savedAuth = localStorage.getItem('srg_auth_state');
  if (savedAuth) {
    try {
      const parsed = JSON.parse(savedAuth);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: !!parsed.user,
        lastLogin: parsed.lastLogin || null,
      };
    } catch (_) {
      // Fallback
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
