/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { CompanyProfile } from '../types';

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query<CompanyProfile[], void>({
      queryFn: async () => {
        return { data: MockDb.getCompanies() };
      },
      providesTags: ['Company']
    }),
    getCompanyById: builder.query<CompanyProfile, string>({
      queryFn: async (id) => {
        const companies = MockDb.getCompanies();
        const found = companies.find(c => c.id === id);
        if (!found) return { error: { status: 404, data: 'Company not found' } };
        return { data: found };
      },
      providesTags: (result, error, id) => [{ type: 'Company', id }]
    }),
    updateCompany: builder.mutation<CompanyProfile, Partial<CompanyProfile> & { id: string }>({
      queryFn: async (updated) => {
        const companies = MockDb.getCompanies();
        const index = companies.findIndex(c => c.id === updated.id);
        if (index === -1) {
          // If not found, let's append it
          const newComp: CompanyProfile = {
            id: updated.id,
            companyName: updated.companyName || 'New Venture',
            contactPerson: updated.contactPerson || 'Unknown',
            email: updated.email || '',
            phone: updated.phone || '',
            industry: updated.industry || 'Unspecified',
            address: updated.address || 'Maharashtra, India',
            isApproved: updated.isApproved ?? false
          };
          companies.push(newComp);
          MockDb.setCompanies(companies);
          return { data: newComp };
        }
        companies[index] = { ...companies[index], ...updated } as CompanyProfile;
        MockDb.setCompanies(companies);
        return { data: companies[index] };
      },
      invalidatesTags: (result, error, arg) => ['Company', { type: 'Company', id: arg.id }]
    })
  })
});

export const { useGetCompaniesQuery, useGetCompanyByIdQuery, useUpdateCompanyMutation } = companyApi;
