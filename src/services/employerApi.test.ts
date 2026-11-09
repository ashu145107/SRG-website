/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeRequirements } from './employerApi';

jest.mock('./baseApi', () => ({
  baseApi: {
    injectEndpoints: () => ({}),
  },
  getApiBaseUrl: () => '',
}));

describe('normalizeRequirements', () => {
  it('preserves workplace from the myrequirements API as the canonical workPlace field', () => {
    const result = normalizeRequirements({
      value: [
        { id: 1, workPlace: 'Office' },
        { id: 2, WorkPlace: 'Field' },
        { id: 3, workplace: 'Remote' },
      ],
    });

    expect(result.map((job) => job.workPlace)).toEqual(['Office', 'Field', 'Remote']);
  });
});
