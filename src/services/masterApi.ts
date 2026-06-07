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
            { value: 'Retail & Commerce', labelEn: 'Retail & Commerce Sales', labelMr: 'किरकोळ विक्री व दालने' },
            { value: 'Customer Service', labelEn: 'Customer Support / BPO', labelMr: 'ग्राहक सेवा (कॉल सेंटर)' },
            { value: 'Education & Training', labelEn: 'Education Teaching', labelMr: 'शिक्षण आणि अध्यापन' },
            { value: 'Agriculture & Food Processing', labelEn: 'Agriculture Food processing', labelMr: 'शेती व अन्न प्रक्रिया' },
            { value: 'Handicrafts & Textiles', labelEn: 'Handicrafts Craft Stitching', labelMr: 'हस्तकला व गृहउद्योग' }
          ]
        };
      }
    })
  })
});

export const { useGetLocationsQuery, useGetJobCategoriesQuery } = masterApi;
