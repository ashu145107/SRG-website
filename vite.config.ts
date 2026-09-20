import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dns from 'node:dns';
import https from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';

const DEFAULT_TARGET = 'https://srgapp.dindoripranit.org';

// Allow pointing the dev proxy to an alternative backend (local/UAT server)
// when srgapp.dindoripranit.org is slow or unreachable.
const BACKEND_TARGET = (process.env.VITE_PROXY_TARGET || DEFAULT_TARGET).replace(/\/+$/, '');
const BACKEND_HOST = new URL(BACKEND_TARGET).hostname;

// ============================================================
// Resilient dev proxy for a flaky backend.
//  1. DNS is resolved once (with retries) and pinned, so transient
//     getaddrinfo ENOTFOUND failures no longer break requests.
//  2. A keep-alive HTTPS agent reuses warm TCP/TLS connections, so
//     cold-connect ETIMEDOUTs to 5.175.139.162:443 are avoided.
//  3. Transient network errors on GET/HEAD are retried with backoff.
// ============================================================

let cachedIp: string | null = null;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function resolveBackendIp(retries = 4): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { address } = await dns.promises.lookup(BACKEND_HOST, { family: 4 });
      cachedIp = address;
      return address;
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[proxy] DNS lookup for ${BACKEND_HOST} failed; falling back to hostname. ${(err as Error).message}`);
        return null;
      }
      await sleep(500 * (attempt + 1));
    }
  }
  return null;
}

void resolveBackendIp();

const backendAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000,
  maxSockets: 30,
  maxFreeSockets: 10,
  lookup: (hostname, options, callback) => {
    if (hostname === BACKEND_HOST && cachedIp) {
      // Node 20+ Happy Eyeballs path calls lookup with { all: true } and
      // expects an array of { address, family } entries, otherwise it fails
      // with ERR_INVALID_IP_ADDRESS.
      if (options.all) {
        callback(null, [{ address: cachedIp, family: 4 }]);
      } else {
        const family = options.family === 6 ? 6 : 4;
        callback(null, cachedIp, family);
      }
      return;
    }
    dns.lookup(hostname, options, (err, address, family) => {
      if (!err && typeof address === 'string') cachedIp = address;
      callback(err, address, typeof family === 'number' ? family : 4);
    });
  },
});

const TRANSIENT_CODES = ['ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'ECONNABORTED'];

function handleProxyError(
  proxy: any,
  err: NodeJS.ErrnoException,
  req: IncomingMessage,
  res: ServerResponse
) {
  const code = err.code;
  const isTransient = !!code && TRANSIENT_CODES.includes(code);
  const attempts = Number((req as { __srgProxyRetries?: number }).__srgProxyRetries || 0);

  // GET/HEAD can be safely replayed; retry transient network failures with backoff.
  if (isTransient && (req.method === 'GET' || req.method === 'HEAD') && attempts < 3) {
    (req as { __srgProxyRetries?: number }).__srgProxyRetries = attempts + 1;
    const delay = 250 * 2 ** attempts;
    console.warn(
      `[proxy] Upstream ${BACKEND_TARGET} failed (${code}); retrying in ${delay}ms (attempt ${attempts + 1}/3)`
    );
    setTimeout(() => proxy.web(req, res, {}), delay);
    return;
  }

  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
  }
  res.end(
    JSON.stringify({
      value: null,
      isSuccess: false,
      isFailure: true,
      error: { code: 'UpstreamUnavailable', message: `Backend unavailable: ${code || err.message}` },
    })
  );
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/v1': {
          target: BACKEND_TARGET,
          changeOrigin: true,
          secure: false,
          agent: backendAgent,
          configure: (proxy) => {
            proxy.on('error', (err: any, req: IncomingMessage, res: ServerResponse) => {
              handleProxyError(proxy, err, req, res);
            });
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});