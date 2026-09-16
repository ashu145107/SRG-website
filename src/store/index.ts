/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { configureStore, Middleware } from '@reduxjs/toolkit';
import { baseApi } from '../services/baseApi';
import authReducer, { logout } from './authSlice';

/**
 * Clears every cached API response (profiles, profile pictures, stats, etc.)
 * when the user logs out, so no previous user's data leaks into the next session.
 */
const resetApiCacheOnLogout: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (logout.match(action)) {
    storeApi.dispatch(baseApi.util.resetApiState());
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(baseApi.middleware)
      .concat(resetApiCacheOnLogout),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;