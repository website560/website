// First-time load of the current website content into Supabase. Safe to re-run: only fills sections that are empty.
// Usage: node cms/seed.js   (reads .env.local)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const w = { window: {} }; w.window = w;
for (const f of ['assets/js/data.js', 'assets/js/instagram.js', 'admin/defaults.js']) vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), w);
const D = w.VOILA, DEF = w.VOILA_DEFAULTS, yt = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const seed = {
  projects: D.projects.map(p => ({ slug: p.slug, style: p.style, place: p.place, type: p.type, film: p.film || '', images: p.images.map(im => ({ src: im.src, thumb: im.thumb || im.src, w: im.w, h: im.h })) })),
  films: D.films.map(f => ({ id: f.id, style: f.style, place: f.place, dur: f.dur, thumb: f.thumb && !f.thumb.includes('ytimg') ? f.thumb : yt(f.id) })),
  gallery: D.gallery.filter(g => !g.project).map(g => ({ src: g.src, thumb: g.thumb || g.src, w: g.w, h: g.h, style: g.style, place: g.place, film: g.film || '' })),
  reviews: D.reviews, instagram: w.VOILA_IG.map(p => ({ href: p.href, img: p.img, date: p.date, reel: !!p.reel })),
  team: DEF.team, history: DEF.history, press: DEF.press, site: DEF.site
};
const U = process.env.SUPABASE_URL.replace(/\/$/, ''), K = process.env.SUPABASE_SERVICE_KEY;
const sb = (p, o = {}) => fetch(U + p, { ...o, headers: { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json', ...(o.headers || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }).then(async r => { const t = await r.text(); if (!r.ok) throw new Error(t); return t ? JSON.parse(t) : null; });
(async () => {
  const have = new Set((await sb('/rest/v1/sections?select=key')).map(r => r.key));
  for (const [key, data] of Object.entries(seed)) {
    if (have.has(key)) { console.log('skip', key, '(already has content)'); continue; }
    await sb('/rest/v1/sections', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { key, data } });
    console.log('seeded', key, Array.isArray(data) ? data.length + ' items' : Object.keys(data).length + ' fields');
  }
})().catch(e => { console.error(e); process.exit(1); });
