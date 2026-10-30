/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { baseApi } from '../services/baseApi';
import authReducer from '../store/authSlice';

export interface TestAuthState {
  user: Record<string, any> | null;
  token: string | null;
  isAuthenticated: boolean;
  lastLogin: string | null;
}

export const defaultAuthState: TestAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  lastLogin: null,
};

export const makeAuthUser = (overrides: Record<string, any> = {}) => ({
  id: '1',
  fullName: 'Test User',
  email: 'test@srg.in',
  role: 'CANDIDATE',
  ...overrides,
});

export const authenticatedAuthState = (userOverrides: Record<string, any> = {}): TestAuthState => ({
  user: makeAuthUser(userOverrides),
  token: 'test-token',
  isAuthenticated: true,
  lastLogin: new Date().toISOString(),
});

export function makeStore(preloadedState?: Partial<{ auth: TestAuthState }>) {
  const reducer = {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  };
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(baseApi.middleware),
    preloadedState: preloadedState as any,
  } as any);
}

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
  preloadedState?: Partial<{ auth: TestAuthState }>;
};

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', preloadedState, ...options }: RenderWithProvidersOptions = {}
) {
  const store = makeStore(preloadedState);
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from '@testing-library/react';
export { render };
