/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from './axiosInstance';
import jobService from './jobService';

jest.mock('./axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../store', () => ({
  store: {
    getState: () => ({ auth: { token: 'test-token', user: { role: 'CANDIDATE' } } }),
  },
}));

const mockedGet = axiosInstance.get as jest.Mock;

describe('jobService.searchJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the API requirement ID and does not invent an ID when one is missing', async () => {
    mockedGet.mockResolvedValue({
      data: {
        data: [
          { requirementId: 1482, profileHeader: 'Software developer edit post' },
          { profileHeader: 'Job without an ID' },
        ],
      },
    });

    const result = await jobService.searchJobs();

    expect(result.jobs[0].id).toBe(1482);
    expect(result.jobs[0].jobRequirementId).toBe(1482);
    expect(result.jobs[1].id).toBeUndefined();
  });
});
