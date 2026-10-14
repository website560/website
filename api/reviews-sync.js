// Daily import of new 5-star Google reviews into the CMS.
// Runs from the Vercel cron (see vercel.json) or from the admin panel's "Check Google now" button.
// Needs GOOGLE_PLACES_KEY. GOOGLE_PLACE_ID is optional (found automatically from the business name if missing).
const { sb, readSession, send, wrap } = require('./_lib');

const KEY = process.env.GOOGLE_PLACES_KEY || '';
const SEARCH = 'Voila Design, 81 Tagore Lane, Singapore 787502';
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const sig = r => norm(r.name) + '|' + norm(r.text).slice(0, 60);

async function google(path, body, fields) {
  const r = await fetch('https://places.googleapis.com/v1/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': fields, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Google: ' + (j.error && j.error.message || r.status));
  return j;
}
async function placeId() {
  if (process.env.GOOGLE_PLACE_ID) return process.env.GOOGLE_PLACE_ID;
  const j = await google('places:searchText', { textQuery: SEARCH }, 'places.id,places.displayName');
  if (!j.places || !j.places[0]) throw new Error('Could not find the business on Google');
  return j.places[0].id;
}

module.exports = wrap(async (req, res) => {
  // allowed: Vercel cron (Authorization: Bearer CRON_SECRET) or a signed-in admin
  const cron = process.env.CRON_SECRET && req.headers.authorization === 'Bearer ' + process.env.CRON_SECRET;
  if (!cron && !readSession(req)) return send(res, 401, { error: 'Please log in.' });
  if (!KEY) return send(res, 400, { error: 'Google reviews are not connected yet (GOOGLE_PLACES_KEY is missing).' });

  const id = await placeId();
  const place = await google('places/' + encodeURIComponent(id), null, 'rating,userRatingCount,reviews');

  const rows = await sb('/rest/v1/sections?select=data&key=eq.reviews');
  const current = rows[0] ? rows[0].data : [];
  const seen = new Set(current.map(sig));
  const fresh = (place.reviews || [])
    .filter(r => r.rating === 5)
    .map(r => ({
      name: (r.authorAttribution && r.authorAttribution.displayName) || 'Google user',
      meta: '',
      when: r.relativePublishTimeDescription || '',
      stars: 5,
      text: (r.originalText && r.originalText.text) || (r.text && r.text.text) || '',
      source: 'google', published: r.publishTime || ''
    }))
    .filter(r => r.text && !seen.has(sig(r)));

  if (fresh.length) {
    await sb('/rest/v1/versions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { key: 'reviews', data: current, note: `Before adding ${fresh.length} Google review(s) · auto` } });
    await sb('/rest/v1/sections?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { key: 'reviews', data: [...fresh, ...current], updated_at: new Date().toISOString() } });
  }
  // keep the rating score and count on the home page up to date
  if (place.rating || place.userRatingCount) {
    const s = await sb('/rest/v1/sections?select=data&key=eq.site');
    const site = s[0] ? s[0].data : {};
    const next = { ...site, rating_score: place.rating ? String(place.rating) : site.rating_score, rating_count: place.userRatingCount ? String(place.userRatingCount) : site.rating_count };
    if (next.rating_score !== site.rating_score || next.rating_count !== site.rating_count)
      await sb('/rest/v1/sections?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { key: 'site', data: next, updated_at: new Date().toISOString() } });
  }
  send(res, 200, { added: fresh.length, names: fresh.map(r => r.name), rating: place.rating, count: place.userRatingCount, checked: (place.reviews || []).length });
});
