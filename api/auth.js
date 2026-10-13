// POST /api/auth  { action: 'login' | 'logout' | 'change-password', ... }
// GET  /api/auth?me=1  -> who is signed in
const { sb, hashPassword, verifyPassword, makeSession, readSession, cookieHeader, requireUser, readBody, send, wrap } = require('./_lib');

const failures = new Map(); // tiny brute-force brake per server instance
const delay = ms => new Promise(r => setTimeout(r, ms));

module.exports = wrap(async (req, res) => {
  if (req.method === 'GET') {
    const s = readSession(req);
    return s ? send(res, 200, { email: s.email }) : send(res, 401, { error: 'Please log in.' });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const body = await readBody(req);

  if (body.action === 'login') {
    const email = String(body.email || '').trim().toLowerCase(), pw = String(body.password || '');
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'local';
    const f = failures.get(ip) || 0; if (f >= 5) await delay(Math.min(8000, f * 1000));
    const rows = email ? await sb(`/rest/v1/admins?select=email,password_hash&email=eq.${encodeURIComponent(email)}`) : [];
    const ok = rows[0] && verifyPassword(pw, rows[0].password_hash);
    if (!ok) { failures.set(ip, f + 1); await delay(600); return send(res, 401, { error: 'Wrong email or password.' }); }
    failures.delete(ip);
    res.setHeader('Set-Cookie', cookieHeader(makeSession(email), 14 * 86400));
    return send(res, 200, { email });
  }
  if (body.action === 'logout') {
    res.setHeader('Set-Cookie', cookieHeader('', 0));
    return send(res, 200, { ok: true });
  }
  if (body.action === 'change-password') {
    const user = requireUser(req, res); if (!user) return;
    const rows = await sb(`/rest/v1/admins?select=email,password_hash&email=eq.${encodeURIComponent(user.email)}`);
    if (!rows[0] || !verifyPassword(String(body.current || ''), rows[0].password_hash)) return send(res, 400, { error: 'The current password is wrong.' });
    const next = String(body.next || ''); if (next.length < 10) return send(res, 400, { error: 'Use at least 10 characters.' });
    await sb(`/rest/v1/admins?email=eq.${encodeURIComponent(user.email)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: { password_hash: hashPassword(next), updated_at: new Date().toISOString() } });
    return send(res, 200, { ok: true });
  }
  send(res, 400, { error: 'Unknown action' });
});
