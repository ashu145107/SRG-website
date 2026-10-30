/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * react-router's development build references the WHATWG TextEncoder /
 * TextDecoder globals. jsdom (Jest's test environment) does not expose them,
 * so import this module before anything that pulls in react-router.
 */

import { TextEncoder, TextDecoder } from 'util';

const g = globalThis as Record<string, unknown>;

if (typeof g.TextEncoder === 'undefined') {
  g.TextEncoder = TextEncoder;
}
if (typeof g.TextDecoder === 'undefined') {
  g.TextDecoder = TextDecoder;
}

export {};
