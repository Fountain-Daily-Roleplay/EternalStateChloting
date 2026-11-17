'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const HOST = '127.0.0.1';
const PORT = 8088;
const PAGE = path.resolve(__dirname, '..', 'outputs', 'clothing-ui', 'index.html');

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }
  const pathname = new URL(req.url || '/', `http://${HOST}:${PORT}`).pathname;
  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end('ok');
  }
  if (pathname !== '/' && pathname !== '/index.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }
  fs.readFile(PAGE, (error, html) => {
    if (error) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Wardrobe UI file is unavailable.');
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'"
    });
    if (req.method === 'HEAD') return res.end();
    res.end(html);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[Clothing UI] serving ${PAGE} at http://${HOST}:${PORT}/`);
});
server.on('error', (error) => {
  console.error(`[Clothing UI] server error: ${error.message}`);
  process.exitCode = 1;
});
