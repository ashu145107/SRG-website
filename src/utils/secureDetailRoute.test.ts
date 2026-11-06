/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { webcrypto } from 'crypto';
import { decryptDetailRoute, encryptDetailRoute } from './secureDetailRoute';

Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });

describe('secure detail routes', () => {
  const sessionToken = 'authenticated-session-token';

  it('encrypts requirement and applicant identifiers for URLs', async () => {
    const requirement = {
      view: 'jobRequirement' as const,
      id: '2581',
      jobCode: 'RG18100',
    };
    const encryptedRequirement = await encryptDetailRoute(requirement, sessionToken);
    const encryptedCandidate = await encryptDetailRoute({
      view: 'candidate',
      id: '54879',
      from: 'jobRequirement',
      fromId: '2581',
      fromCode: 'RG18100',
    }, sessionToken);
    const encryptedCompany = await encryptDetailRoute({
      view: 'company',
      id: '9921',
    }, sessionToken);

    expect(encryptedRequirement).not.toContain('2581');
    expect(encryptedRequirement).not.toContain('RG18100');
    expect(encryptedCandidate).not.toContain('54879');
    expect(encryptedCompany).not.toContain('9921');
    await expect(decryptDetailRoute(encryptedRequirement, sessionToken)).resolves.toEqual(requirement);
    await expect(decryptDetailRoute(encryptedCandidate, sessionToken)).resolves.toEqual({
      view: 'candidate',
      id: '54879',
      from: 'jobRequirement',
      fromId: '2581',
      fromCode: 'RG18100',
    });
    await expect(decryptDetailRoute(encryptedCompany, sessionToken)).resolves.toEqual({
      view: 'company',
      id: '9921',
    });
  });

  it('rejects tampered URLs and links encrypted for a different session', async () => {
    const encrypted = await encryptDetailRoute({
      view: 'candidate',
      id: '54879',
    }, sessionToken);

    await expect(decryptDetailRoute(`${encrypted}x`, sessionToken)).rejects.toThrow();
    await expect(decryptDetailRoute(encrypted, 'different-session-token')).rejects.toThrow();
  });
});
