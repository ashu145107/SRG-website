/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { getApiBaseUrl } from './baseApi';

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: attach token dynamically from Redux store or localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    let token = state.auth?.token;

    if (!token) {
      try {
        const stored = localStorage.getItem('srg_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.token;
        }
      } catch (e) {
        // ignore
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['token'] = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: centralized global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const response = error.response;
    if (response && response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
