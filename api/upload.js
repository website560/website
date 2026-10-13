// POST /api/upload  (raw image body; headers: x-file-name, content-type) -> { url }
const { sb, requireUser, readRaw, send, wrap, SUPABASE_URL } = require('./_lib');
const crypto = require('crypto');

module.exports = wrap(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!requireUser(req, res)) return;
  const type = String(req.headers['content-type'] || '').split(';')[0].trim();
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' }[type];
  if (!ext) return send(res, 400, { error: 'Only JPG, PNG, WEBP or SVG images are allowed.' });
  const buf = await readRaw(req);
  if (!buf.length) return send(res, 400, { error: 'Empty upload' });
  if (buf.length > 12 * 1024 * 1024) return send(res, 400, { error: 'That file is too large (max 12 MB).' });
  const base = String(req.headers['x-file-name'] || 'photo').toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo';
  const d = new Date(), path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  await sb(`/storage/v1/object/media/${path}`, { method: 'POST', headers: { 'Content-Type': type, 'x-upsert': 'false', 'Cache-Control': 'max-age=31536000' }, body: buf });
  send(res, 200, { url: `${SUPABASE_URL}/storage/v1/object/public/media/${path}` });
});
module.exports.config = { api: { bodyParser: false } };
