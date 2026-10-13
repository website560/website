// GET  /api/content?key=projects        -> { data }
// GET  /api/content?versions=projects   -> [ { id, note, created_at } ]
// PUT  /api/content { key, data, note } -> saves (keeps the previous state as a version)
// POST /api/content { action:'restore', key, id }
const { sb, requireUser, readBody, send, wrap } = require('./_lib');

const KEYS = ['projects', 'films', 'gallery', 'reviews', 'team', 'history', 'press', 'instagram', 'site'];
const okKey = k => KEYS.includes(k);

async function current(key) {
  const rows = await sb(`/rest/v1/sections?select=data&key=eq.${key}`);
  return rows[0] ? rows[0].data : null;
}
async function put(key, data, note) {
  const prev = await current(key);
  if (prev !== null) await sb('/rest/v1/versions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { key, data: prev, note } });
  await sb('/rest/v1/sections?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { key, data, updated_at: new Date().toISOString() } });
  // keep the history tidy: newest 40 per section
  const old = await sb(`/rest/v1/versions?select=id&key=eq.${key}&order=created_at.desc&offset=40`);
  if (old.length) await sb(`/rest/v1/versions?id=in.(${old.map(v => v.id).join(',')})`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
}

module.exports = wrap(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET') {
    const key = url.searchParams.get('key'), vkey = url.searchParams.get('versions');
    if (vkey) { if (!okKey(vkey) || !requireUser(req, res)) return; return send(res, 200, await sb(`/rest/v1/versions?select=id,note,created_at&key=eq.${vkey}&order=created_at.desc&limit=40`)); }
    if (!okKey(key)) return send(res, 400, { error: 'Unknown section' });
    return send(res, 200, { data: await current(key) });
  }
  const user = requireUser(req, res); if (!user) return;
  const body = await readBody(req);
  if (req.method === 'PUT') {
    if (!okKey(body.key)) return send(res, 400, { error: 'Unknown section' });
    if (body.key === 'site' ? typeof body.data !== 'object' : !Array.isArray(body.data)) return send(res, 400, { error: 'Bad data' });
    await put(body.key, body.data, (body.note || 'Saved') + ' · ' + user.email);
    return send(res, 200, { ok: true });
  }
  if (req.method === 'POST' && body.action === 'restore') {
    if (!okKey(body.key)) return send(res, 400, { error: 'Unknown section' });
    const rows = await sb(`/rest/v1/versions?select=data&id=eq.${encodeURIComponent(body.id)}&key=eq.${body.key}`);
    if (!rows[0]) return send(res, 404, { error: 'Version not found' });
    await put(body.key, rows[0].data, 'Before restore · ' + user.email);
    return send(res, 200, { ok: true });
  }
  send(res, 405, { error: 'Method not allowed' });
});
