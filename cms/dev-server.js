// Local test server: serves the website and runs the /api functions like Vercel does.
// Usage: node cms/dev-server.js   (reads .env.local)   -> http://localhost:5173
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
for (const line of fs.existsSync(path.join(ROOT, '.env.local')) ? fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n') : []) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', json: 'application/json', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', webp: 'image/webp', mp4: 'video/mp4', ico: 'image/x-icon' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  // Vercel-style response helpers
  res.status = c => { res.statusCode = c; return res; }; res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
  const api = url.pathname.match(/^\/api\/([a-z-]+)$/);
  if (api) {
    const file = path.join(ROOT, 'api', api[1] + '.js');
    if (!fs.existsSync(file)) { res.status(404).json({ error: 'No such API' }); return; }
    delete require.cache[require.resolve(file)]; const fn = require(file);
    if (!(fn.config && fn.config.api && fn.config.api.bodyParser === false) && /POST|PUT|PATCH/.test(req.method)) {
      const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks).toString('utf8');
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = raw; }
    }
    return fn(req, res);
  }
  let p = decodeURIComponent(url.pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', MIME[path.extname(file).slice(1)] || 'application/octet-stream'); res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(file).pipe(res);
}).listen(5173, () => console.log('Voilà dev server with API: http://localhost:5173'));
