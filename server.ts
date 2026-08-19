/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Read raw body for ALL requests — needed for multipart/file uploads.
  // express.json() must NOT run before the proxy, or it consumes the stream.
  const getRawBody = (req: express.Request): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

  // Proxy all /api/v1/* requests to srgapp backend server to bypass browser CORS checks
  app.all('/api/v1/*', async (req, res) => {
    const targetUrl = `https://srgapp.dindoripranit.org${req.originalUrl}`;
    
    try {
      console.log(`[Proxy] ${req.method} ${targetUrl} | Content-Type: ${req.headers['content-type'] || 'none'}`);
      
      // Forward the ORIGINAL headers — do NOT hardcode Content-Type
      const headers: Record<string, string> = {
        'Accept': req.headers.accept || 'application/json',
      };

      const originalContentType = req.headers['content-type'];
      if (originalContentType) {
        headers['Content-Type'] = originalContentType;
      }

      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
      if (req.headers.token) {
        headers['token'] = req.headers.token as string;
      }
      if (req.headers['x-access-token']) {
        headers['x-access-token'] = req.headers['x-access-token'] as string;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      // Read the raw body as bytes — preserves binary data for file uploads
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const rawBody = await getRawBody(req);
        if (rawBody.length > 0) {
          fetchOptions.body = rawBody;
          console.log(`[Proxy] Forwarding ${rawBody.length} bytes body`);
        }
      }

      const response = await fetch(targetUrl, fetchOptions);
      
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      console.log(`[Proxy] Response ${response.status} from ${targetUrl}`);
      res.status(response.status);
      
      if (contentType.includes('application/json')) {
        try {
          const jsonData = JSON.parse(text);
          res.json(jsonData);
        } catch (err) {
          res.send(text);
        }
      } else {
        res.send(text);
      }
    } catch (error: any) {
      console.error(`[Proxy Error] ${targetUrl}:`, error.message || error);
      res.status(500).json({
        value: null,
        isSuccess: false,
        isFailure: true,
        error: {
          code: 'ProxyConnectionError',
          message: `Could not connect to remote server: ${error.message || error}`
        }
      });
    }
  });

  // Parse JSON only for non-proxy routes (health check, etc.)
  app.use(express.json());

  // Enable health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Setup static serving/Vite mode based on environment
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev Server] Mounting Vite development middlewares.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Prod Server] Serving production static files from ' + distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Startup Error] Failed to launch server:', err);
  process.exit(1);
});
