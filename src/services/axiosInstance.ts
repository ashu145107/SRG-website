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

// Request Interceptor: attach the current session token from Redux.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token;

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
