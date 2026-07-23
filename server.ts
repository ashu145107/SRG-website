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

  // Middleware to parse incoming JSON bodies
  app.use(express.json());

  // Proxy all /api/v1/* requests to srgapp backend server to bypass browser CORS checks
  app.all('/api/v1/*', async (req, res) => {
    const targetUrl = `https://srgapp.dindoripranit.org${req.originalUrl}`;
    
    try {
      console.log(`[Proxy] Routing ${req.method} request to ${targetUrl}`);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

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

      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        const hasContent = Array.isArray(req.body) ? req.body.length > 0 : Object.keys(req.body).length > 0;
        if (hasContent) {
          fetchOptions.body = JSON.stringify(req.body);
        }
      }

      const response = await fetch(targetUrl, fetchOptions);
      
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
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
      console.error(`[Proxy Error] Error forwarding to ${targetUrl}:`, error);
      res.status(500).json({
        value: null,
        isSuccess: false,
        isFailure: true,
        error: {
          code: 'ProxyConnectionError',
          message: `दूरस्थ सर्व्हरशी संपर्क साधता आला नाही / Could not connect to remote server: ${error.message || error}`
        }
      });
    }
  });

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
