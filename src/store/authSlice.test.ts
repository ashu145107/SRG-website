import { getTokenExpiration, isTokenExpired } from './authSlice';

const tokenWithExpiration = (expiration: number) =>
  `header.${btoa(JSON.stringify({ exp: expiration }))}.signature`;

describe('auth token expiration', () => {
  it('returns the expiration time from a JWT', () => {
    expect(getTokenExpiration(tokenWithExpiration(2000))).toBe(2_000_000);
  });

  it('marks an expired JWT as expired', () => {
    expect(isTokenExpired(tokenWithExpiration(100), 100_000)).toBe(true);
  });

  it('keeps an unexpired or opaque token valid for server-side validation', () => {
    expect(isTokenExpired(tokenWithExpiration(200), 100_000)).toBe(false);
    expect(isTokenExpired('opaque-access-token', 100_000)).toBe(false);
  });
});
