/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { getApiBaseUrl } from './baseApi';

// Create a professional Axios instance
export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000, // 20 seconds request timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: inject JWT authorization token from Redux Store or localStorage dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    let token = state.auth?.token;

    if (!token) {
      try {
        const savedAuth = localStorage.getItem('srg_auth_state');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          token = parsed?.token || parsed?.user?.token;
        }
      } catch (e) {}
    }

    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      config.headers.Authorization = `Bearer ${cleanToken}`;
      config.headers['token'] = cleanToken;
    }

    // If sending FormData (file uploads), remove Content-Type so axios
    // auto-generates the correct multipart/form-data header with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
    
    if (response) {
      const status = response.status;
      const errorData = response.data;
      
      // Handle network errors, specific backend responses
      switch (status) {
        case 401:
          // Unauthorized: auto-logout the user and clear state
          console.error('Session expired or unauthorized (401). Logging out...');
          store.dispatch(logout());
          // Optional: redirect to login if required, but the state change will handle this in ProtectedRoute
          break;
        case 403:
          console.error('Forbidden (403): You do not have permission to perform this action.');
          break;
        case 404:
          console.error('Not Found (404): The requested resource does not exist.', response.config.url);
          break;
        case 500:
          console.error('Internal Server Error (500): Something went wrong on the server.');
          break;
        default:
          console.error(`API Error (${status}):`, errorData);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request Timeout: Server took too long to respond.');
    } else {
      console.error('Network Error: Please check your internet connection.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
