/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SecureDetailRoute {
  view: 'jobRequirement' | 'candidate' | 'company';
  id: string;
  jobCode?: string;
  from?: 'jobRequirement';
  fromId?: string;
  fromCode?: string;
}

const encodeBase64Url = (bytes: Uint8Array): string =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const decodeBase64Url = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const getEncryptionKey = async (sessionToken: string): Promise<CryptoKey> => {
  if (!sessionToken || !globalThis.crypto?.subtle) {
    throw new Error('Secure detail links require a supported browser and an active session.');
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sessionToken));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
};

export const encryptDetailRoute = async (
  route: SecureDetailRoute,
  sessionToken: string
): Promise<string> => {
  const key = await getEncryptionKey(sessionToken);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(route))
  );
  return `${encodeBase64Url(iv)}.${encodeBase64Url(new Uint8Array(ciphertext))}`;
};

export const decryptDetailRoute = async (
  encryptedRoute: string,
  sessionToken: string
): Promise<SecureDetailRoute> => {
  const [encodedIv, encodedCiphertext, extra] = encryptedRoute.split('.');
  if (!encodedIv || !encodedCiphertext || extra !== undefined) {
    throw new Error('This detail link is invalid or has expired.');
  }

  const key = await getEncryptionKey(sessionToken);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64Url(encodedIv) },
    key,
    decodeBase64Url(encodedCiphertext)
  );
  const route: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  if (
    typeof route !== 'object'
    || route === null
    || !('view' in route)
    || !('id' in route)
    || !(['jobRequirement', 'candidate', 'company'] as unknown[]).includes(route.view)
    || typeof route.id !== 'string'
    || !route.id
    || ('jobCode' in route && typeof route.jobCode !== 'string')
    || ('from' in route && route.from !== 'jobRequirement')
    || ('fromId' in route && typeof route.fromId !== 'string')
    || ('fromCode' in route && typeof route.fromCode !== 'string')
  ) {
    throw new Error('This detail link is invalid or has expired.');
  }
  return route as SecureDetailRoute;
};

export const buildEncryptedRouteUrl = async (
  path: '/dashboard' | '/candidate',
  route: SecureDetailRoute,
  sessionToken: string
): Promise<string> => {
  const encrypted = await encryptDetailRoute(route, sessionToken);
  return `${window.location.origin}${window.location.pathname}#${path}?data=${encodeURIComponent(encrypted)}`;
};

export const navigateToEncryptedRoute = async (
  path: '/dashboard' | '/candidate',
  route: SecureDetailRoute,
  sessionToken: string,
  navigate: (url: string) => void
): Promise<void> => {
  const encrypted = await encryptDetailRoute(route, sessionToken);
  navigate(`${path}?data=${encodeURIComponent(encrypted)}`);
};

export const openEncryptedRouteInNewTab = async (
  path: '/dashboard' | '/candidate',
  route: SecureDetailRoute,
  sessionToken: string
): Promise<void> => {
  const tab = window.open('about:blank', '_blank');
  if (!tab) {
    throw new Error('The detail page could not be opened. Please allow pop-ups and try again.');
  }
  try {
    tab.location.href = await buildEncryptedRouteUrl(path, route, sessionToken);
  } catch (error) {
    tab.close();
    throw error;
  }
};
