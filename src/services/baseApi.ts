/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'https://srgapp.dindoripranit.org';
  }

  // Allow custom override via Vite environment variable if set by user's build setup
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  const hostname = window.location.hostname;

  // If running in development (localhost) or within Google AI Studio preview sandbox (run.app, googleusercontent.com),
  // we proxy the requests locally through Vite / Express server to prevent browser CORS issues.
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('run.app') ||
    hostname.includes('googleusercontent') ||
    hostname.includes('aistudio')
  ) {
    return '';
  }

  // Direct connection to the production API server when deployed to production/UAT URL
  return 'https://srgapp.dindoripranit.org';
};

export const getClientIp = async (): Promise<string> => {
  const ipEndpoints = [
    'https://api.ipify.org',
    'https://ipv4.icanhazip.com',
    'https://ipapi.co/ip'
  ];
  for (const url of ipEndpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const ip = (await res.text()).trim();
        if (ip && ip.length >= 7 && ip.length <= 45) {
          return ip;
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch IP from ${url}, trying next...`);
    }
  }
  return '127.0.0.1';
};

export const baseApi = createApi({
  reducerPath: 'srgApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [
    'User',
    'Job',
    'Company',
    'Candidate',
    'SHG',
    'Application',
    'Initiative',
    'Training'
  ],
  endpoints: () => ({}),
});

