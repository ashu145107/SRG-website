/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';

export interface DropdownOption {
  value: string;
  labelEn: string;
  labelMr: string;
}

export interface GenericMasterItem {
  id: number;
  name: string;
  parentId?: number;
}

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<DropdownOption[], void>({
      queryFn: async () => {
        return {
          data: [
            { value: 'Nashik', labelEn: 'Nashik', labelMr: 'नाशिक' },
            { value: 'Pune', labelEn: 'Pune', labelMr: 'पुणे' },
            { value: 'Mumbai', labelEn: 'Mumbai', labelMr: 'मुंबई' },
            { value: 'Nagpur', labelEn: 'Nagpur', labelMr: 'नागपूर' },
            { value: 'Sambhaji Nagar', labelEn: 'Chhatrapati Sambhaji Nagar', labelMr: 'छत्रपती संभाजीनगर' },
            { value: 'Remote', labelEn: 'Remote (Anywhere)', labelMr: 'घरून काम (रिमोट)' }
          ]
        };
      }
    }),
    getJobCategories: builder.query<DropdownOption[], void>({
      queryFn: async () => {
        return {
          data: [
            { value: 'Information Technology', labelEn: 'Information IT Services', labelMr: 'माहिती तंत्रज्ञान (आयटी)' },
            { value: 'Retail & Commerce', labelEn: 'Retail & Commerce Sales', labelMr: 'किरкоळ विक्री व दालने' },
            { value: 'Customer Service', labelEn: 'Customer Support / BPO', labelMr: 'ग्राहक सेवा (कॉल सेंटर)' },
            { value: 'Education & Training', labelEn: 'Education Teaching', labelMr: 'शिक्षण आणि अध्यापन' },
            { value: 'Agriculture & Food Processing', labelEn: 'Agriculture Food processing', labelMr: 'शेती व अन्न प्रक्रिया' },
            { value: 'Handicrafts & Textiles', labelEn: 'Handicrafts Craft Stitching', labelMr: 'हस्तकला व गृहउद्योग' }
          ]
        };
      }
    }),
    getCountries: builder.query<GenericMasterItem[], void>({
      query: () => '/api/v1/country',
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
    getStates: builder.query<GenericMasterItem[], number>({
      query: (countryId) => `/api/v1/state/${countryId}`,
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
    getDistricts: builder.query<GenericMasterItem[], number>({
      query: (stateId) => `/api/v1/district/${stateId}`,
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
    getTalukas: builder.query<GenericMasterItem[], number>({
      query: (districtId) => `/api/v1/taluka/${districtId}`,
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
    getSevaKendras: builder.query<GenericMasterItem[], number>({
      query: (talukaId) => `/api/v1/sevakendra/${talukaId}`,
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
    getEducationsList: builder.query<GenericMasterItem[], void>({
      query: () => '/api/v1/educations',
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
    getSubEducationsList: builder.query<GenericMasterItem[], number>({
      query: (parentId) => `/api/v1/subeducations/${parentId}`,
      transformResponse: (response: { value: GenericMasterItem[] }) => response?.value || []
    }),
  })
});

export const {
  useGetLocationsQuery,
  useGetJobCategoriesQuery,
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useGetTalukasQuery,
  useGetSevaKendrasQuery,
  useGetEducationsListQuery,
  useGetSubEducationsListQuery
} = masterApi;
