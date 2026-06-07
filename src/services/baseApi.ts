/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'srgApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
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
