// Shared helpers for the admin API (Vercel Node functions). No npm dependencies.
const crypto = require('crypto');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const COOKIE = 'voila_admin';
const SESSION_DAYS = 14;

function env() {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SESSION_SECRET'].filter(k => !process.env[k]);
  if (missing.length) throw new Error('Server not configured: missing ' + missing.join(', '));
}

// --- Supabase REST (service role) ---
async function sb(path, opt = {}) {
  env();
  const r = await fetch(SUPABASE_URL + path, {
    ...opt,
    headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json', ...(opt.headers || {}) },
    body: opt.body && typeof opt.body !== 'string' && !Buffer.isBuffer(opt.body) ? JSON.stringify(opt.body) : opt.body
  });
  const text = await r.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
  if (!r.ok) { const err = new Error((json && (json.message || json.error)) || ('Supabase error ' + r.status)); err.status = r.status; throw err; }
  return json;
}

// --- passwords: scrypt$N$salt$hash ---
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$16384$${salt}$${hash}`;
}
function verifyPassword(pw, stored) {
  try {
    const [algo, n, salt, hash] = String(stored).split('$');
    if (algo !== 'scrypt') return false;
    const calc = crypto.scryptSync(pw, salt, 64, { N: +n, r: 8, p: 1 });
    const want = Buffer.from(hash, 'hex');
    return calc.length === want.length && crypto.timingSafeEqual(calc, want);
  } catch (e) { return false; }
}

// --- sessions: signed cookie ---
const sign = s => crypto.createHmac('sha256', SESSION_SECRET).update(s).digest('base64url');
function makeSession(email) {
  const exp = Date.now() + SESSION_DAYS * 86400e3;
  const body = Buffer.from(JSON.stringify({ email, exp })).toString('base64url');
  return body + '.' + sign(body);
}
function readSession(req) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return null;
  const [body, sig] = m[1].split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const s = JSON.parse(Buffer.from(body, 'base64url').toString()); return s.exp > Date.now() ? s : null; } catch (e) { return null; }
}
function cookieHeader(value, maxAge) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
function requireUser(req, res) {
  const s = readSession(req);
  if (!s) { res.status(401).json({ error: 'Please log in.' }); return null; }
  return s;
}

// --- request helpers ---
async function readBody(req) {
  if (req.body !== undefined && req.body !== null && !Buffer.isBuffer(req.body)) return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks); if (!raw.length) return {};
  return JSON.parse(raw.toString('utf8'));
}
async function readRaw(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}
function send(res, status, obj) { res.status(status).setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); }
function wrap(fn) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try { await fn(req, res); }
    catch (e) { console.error(e); send(res, e.status === 401 ? 401 : 500, { error: e.message || 'Server error' }); }
  };
}

module.exports = { sb, hashPassword, verifyPassword, makeSession, readSession, cookieHeader, requireUser, readBody, readRaw, send, wrap, SUPABASE_URL };
