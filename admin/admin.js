/* Voilà Admin: a small single-page app.
   Talks to /api/* (Vercel functions). If the API is unreachable (local preview), it runs in demo mode on the built-in data. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');
  const DEMO = new URLSearchParams(location.search).has('demo');
  const ytId = u => { const m = String(u || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || String(u || '').match(/^([\w-]{11})$/); return m ? m[1] : ''; };
  const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const SITE_ROOT = location.pathname.replace(/admin\/?.*$/, '');
  const src = p => (!p ? '' : /^(https?:|blob:|data:)/.test(p) ? p : SITE_ROOT + p);

  /* ---------------- icons ---------------- */
  const I = {
    grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    film: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.4l-5.7 3.1 1.2-6.4L2.8 9.7l6.4-.8z"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-5-6.3"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    badge: '<svg viewBox="0 0 24 24"><path d="M4 7h16v10H4zM8 7V5h8v2"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
    text: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16"/></svg>',
    cog: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    logo: '<svg viewBox="0 0 712 236" aria-label="Voilà"><path d="M18 70 L100 226 L182 70"/><path d="M262 70 a78 78 0 1 1 -0.01 0"/><path d="M376 70 V226"/><path d="M424 70 V226 H516"/><path d="M532 226 L613 70 L694 226"/><path d="M580 12 L604 48"/></svg>'
  };

  /* ---------------- API (with demo fallback) ---------------- */
  let demo = DEMO;
  const demoStore = {};
  const demoVersions = {};
  const api = {
    async call(path, opt = {}) {
      const r = await fetch('/api/' + path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(opt.headers || {}) }, ...opt, body: opt.body && typeof opt.body !== 'string' && !(opt.body instanceof FormData) ? JSON.stringify(opt.body) : opt.body });
      if (r.status === 401 && !opt.quiet) { state.user = null; render(); throw new Error('Please log in again.'); }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Something went wrong');
      return j;
    },
    async me() { if (demo) return { email: 'marketings@voila.sg', demo: true }; try { return await this.call('auth?me=1', { quiet: true }); } catch (e) { if (e.message.includes('log in')) return null; demo = true; return null; } },
    login(email, password) { if (demo) return Promise.resolve({ email }); return this.call('auth', { method: 'POST', quiet: true, body: { action: 'login', email, password } }); },
    logout() { if (demo) return Promise.resolve(); return this.call('auth', { method: 'POST', body: { action: 'logout' } }); },
    changePassword(current, next) { if (demo) return Promise.resolve({ ok: true }); return this.call('auth', { method: 'POST', body: { action: 'change-password', current, next } }); },
    async get(key) {
      if (demo) { if (!(key in demoStore)) demoStore[key] = JSON.parse(JSON.stringify(seed(key))); return demoStore[key]; }
      const j = await this.call('content?key=' + key); return j.data == null ? seed(key) : j.data;
    },
    async save(key, data, note) {
      if (demo) { (demoVersions[key] ||= []).unshift({ id: Date.now(), note, created_at: new Date().toISOString(), data: JSON.parse(JSON.stringify(demoStore[key] || seed(key))) }); demoStore[key] = data; return { ok: true }; }
      return this.call('content', { method: 'PUT', body: { key, data, note } });
    },
    async upload(file) {
      const blob = await shrink(file);
      if (demo) return { url: URL.createObjectURL(blob), w: blob.w, h: blob.h };
      const r = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': blob.type || 'image/jpeg', 'x-file-name': encodeURIComponent(file.name || 'photo') }, body: blob });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Upload failed'); return { ...j, w: blob.w, h: blob.h };
    },
    versions(key) { if (demo) return Promise.resolve(demoVersions[key] || []); return this.call('content?versions=' + key); },
    restore(key, id) { if (demo) { const v = (demoVersions[key] || []).find(v => v.id === id); if (v) demoStore[key] = v.data; return Promise.resolve({ ok: true }); } return this.call('content', { method: 'POST', body: { action: 'restore', key, id } }); }
  };
  // shrink photos in the browser before upload: max 1800px, decent JPEG. Logos (png/svg) are kept as-is.
  async function shrink(file) {
    if (/svg|png/.test(file.type)) { const b = file.slice(0, file.size, file.type); b.w = 0; b.h = 0; return b; }
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    const max = 1800, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', .84)); blob.w = c.width; blob.h = c.height; return blob;
  }

  /* ---------------- data: built-in content as the starting point ---------------- */
  const D = window.VOILA || {}, DEF = window.VOILA_DEFAULTS || {};
  function seed(key) {
    switch (key) {
      case 'projects': return (D.projects || []).map(p => ({ slug: p.slug, style: p.style, place: p.place, type: p.type, film: p.film || '', images: (p.images || []).map(im => ({ src: im.src, thumb: im.thumb || im.src, w: im.w, h: im.h })) }));
      case 'films': return (D.films || []).map(f => ({ id: f.id, style: f.style, place: f.place, dur: f.dur, thumb: f.thumb || ytThumb(f.id) }));
      case 'gallery': return (D.gallery || []).filter(g => !g.project).map(g => ({ src: g.src, thumb: g.thumb || g.src, w: g.w, h: g.h, style: g.style, place: g.place, film: g.film || '' }));
      case 'reviews': return (D.reviews || []).map(r => ({ ...r }));
      case 'instagram': return (window.VOILA_IG || []).map(p => ({ href: p.href, img: p.img, date: p.date, reel: !!p.reel }));
      case 'team': case 'history': case 'press': case 'site': return JSON.parse(JSON.stringify(DEF[key] || (key === 'site' ? {} : [])));
    }
    return [];
  }

  /* ---------------- section schemas ---------------- */
  const TYPES = ['HDB', 'Condominium', 'Executive Condominium', 'Landed', 'Office / Retail'];
  const SECTIONS = {
    projects: { label: 'Projects', one: 'project', icon: I.home, blurb: 'The homes shown in the portfolio. The first photo is the cover. Drag the handle to reorder.',
      fields: [{ k: 'style', l: 'Style', t: 'text', ph: 'e.g. Modern Japandi', req: 1 }, { k: 'place', l: 'Location', t: 'text', ph: 'e.g. 175B Sengkang East Drive', req: 1 }, { k: 'type', l: 'Property type', t: 'select', opts: TYPES }, { k: 'film', l: 'Home tour video (YouTube link)', t: 'youtube' }, { k: 'images', l: 'Photos', t: 'images', hint: 'Drag photos to reorder. The first one is the cover. Big photos are shrunk automatically.' }],
      title: i => i.style, sub: i => i.place, thumb: i => i.images?.[0]?.thumb, make: i => ({ ...i, slug: i.slug || slug(i.style + '-' + i.place) }) },
    films: { label: 'Home tour films', one: 'film', icon: I.film, blurb: 'YouTube videos shown in the film sliders. Paste a link; the thumbnail is fetched automatically.',
      fields: [{ k: 'id', l: 'YouTube link', t: 'youtube', req: 1 }, { k: 'style', l: 'Style', t: 'text', ph: 'e.g. Wabi-Sabi', req: 1 }, { k: 'place', l: 'Location', t: 'text', req: 1 }, { k: 'dur', l: 'Length', t: 'text', ph: 'e.g. 1:45' }],
      title: i => i.style, sub: i => i.place, thumb: i => i.thumb || ytThumb(i.id), make: i => ({ ...i, thumb: i.thumb && !i.thumb.includes('ytimg') ? i.thumb : ytThumb(i.id) }) },
    gallery: { label: 'Extra gallery photos', one: 'photo', icon: I.image, blurb: 'Project photos appear in the gallery automatically. Add loose photos here (for example stills from older homes).',
      fields: [{ k: 'src', l: 'Photo', t: 'image', req: 1 }, { k: 'style', l: 'Style', t: 'text', req: 1 }, { k: 'place', l: 'Location', t: 'text', req: 1 }, { k: 'film', l: 'Home tour video (YouTube link)', t: 'youtube' }],
      title: i => i.style, sub: i => i.place, thumb: i => i.thumb || i.src, make: i => ({ ...i, thumb: i.thumb || i.src }) },
    reviews: { label: 'Google reviews', one: 'review', icon: I.star, blurb: 'Shown in the reviews wall and the testimonial loop. Copy them word for word from Google.',
      fields: [{ k: 'name', l: 'Name', t: 'text', req: 1 }, { k: 'meta', l: 'Under the name', t: 'text', ph: 'e.g. Local Guide · 12 reviews' }, { k: 'when', l: 'When', t: 'text', ph: 'e.g. 3 months ago' }, { k: 'stars', l: 'Stars', t: 'stars' }, { k: 'text', l: 'Review', t: 'textarea', req: 1 }],
      title: i => i.name, sub: i => i.text, noimg: 1, make: i => ({ stars: 5, ...i }) },
    team: { label: 'Team', one: 'team member', icon: I.users, blurb: 'The people in “The Family Behind Voilà”. Photos should be portrait (taller than wide); they are cropped to fit.',
      fields: [{ k: 'name', l: 'Name', t: 'text', req: 1 }, { k: 'role', l: 'Role', t: 'text', req: 1 }, { k: 'photo', l: 'Photo', t: 'image', tall: 1 }, { k: 'bio', l: 'Write-up', t: 'textarea', hint: 'Leave an empty line between paragraphs.' }],
      title: i => i.name, sub: i => i.role, thumb: i => i.photo, tall: 1 },
    history: { label: 'Our history', one: 'milestone', icon: I.clock, blurb: 'The timeline on the About page, in order from oldest to newest.',
      fields: [{ k: 'year', l: 'Year or label', t: 'text', ph: 'e.g. 2012 or Growth', req: 1 }, { k: 'title', l: 'Title', t: 'text', req: 1 }, { k: 'image', l: 'Photo', t: 'image' }, { k: 'text', l: 'Text', t: 'textarea', hint: 'Leave an empty line between paragraphs.' }],
      title: i => i.year + ' · ' + i.title, sub: i => i.text, thumb: i => i.image },
    press: { label: 'As seen on', one: 'logo', icon: I.badge, blurb: 'Logos in the “As seen on” strip. PNG with a transparent background, or SVG, works best.',
      fields: [{ k: 'image', l: 'Logo', t: 'image', logo: 1, req: 1 }, { k: 'alt', l: 'Name', t: 'text', req: 1 }],
      title: i => i.alt, sub: () => '', thumb: i => i.image, logo: 1 },
    instagram: { label: 'Instagram', one: 'post', icon: I.ig, blurb: 'Posts in the Instagram strip, newest first. Or set a live feed link in Site text and this list becomes the backup.',
      fields: [{ k: 'href', l: 'Post link', t: 'text', ph: 'https://www.instagram.com/p/…', req: 1 }, { k: 'img', l: 'Image', t: 'image', req: 1 }, { k: 'date', l: 'Date', t: 'text', ph: 'YYYY-MM-DD' }, { k: 'reel', l: 'This is a reel (video)', t: 'check' }],
      title: i => i.date || 'Post', sub: i => i.href, thumb: i => i.img }
  };
  const SITE_GROUPS = [
    { h: 'Home page', f: [['home_headline_1', 'Headline line 1'], ['home_headline_2', 'Headline line 2 (orange)'], ['home_headline_3', 'Headline line 3'], ['home_sub', 'Text under the headline', 'textarea'], ['intro_tagline', 'Tagline under the logo in the intro'], ['home_cta_1', 'Closing band line 1'], ['home_cta_2', 'Closing band line 2 (orange)']] },
    { h: 'About page', f: [['about_headline_1', 'Hero line 1'], ['about_headline_2', 'Hero line 2 (orange)'], ['about_sub_1', 'Hero text 1', 'textarea'], ['about_sub_2', 'Hero text 2', 'textarea'], ['team_headline_1', 'Team heading line 1'], ['team_headline_2', 'Team heading line 2'], ['team_sub', 'Team sub-line', 'textarea']] },
    { h: 'Google rating', f: [['rating_score', 'Score (e.g. 4.7)'], ['rating_count', 'Number of reviews'], ['google_reviews_url', 'Link to the Google reviews']] },
    { h: 'Instagram', f: [['instagram_handle', 'Handle (without @)'], ['instagram_feed_url', 'Live feed link (optional, e.g. from behold.so)']] },
    { h: 'Contact details', f: [['whatsapp', 'WhatsApp number'], ['email', 'Email'], ['address_1', 'Address line 1'], ['address_2', 'Address line 2'], ['address_3', 'Address line 3'], ['address_note', 'Address note'], ['hours_1', 'Hours line 1'], ['hours_2', 'Hours line 2'], ['hours_3', 'Hours line 3'], ['footer_tagline', 'Footer tagline']] }
  ];
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------------- state + render ---------------- */
  const state = { user: undefined, view: 'dashboard', data: {}, saveState: '' };
  const NAV = [['dashboard', 'Overview', I.grid], null, 'Portfolio', ['projects'], ['films'], ['gallery'], 'About', ['reviews'], ['team'], ['history'], ['press'], ['instagram'], 'Site', ['site', 'Site text', I.text], ['settings', 'Settings', I.cog]];

  function render() {
    if (state.user === undefined) { app.innerHTML = '<div class="login"><p>Loading…</p></div>'; return; }
    if (!state.user) return renderLogin();
    const nav = NAV.map(n => n === null ? '' : typeof n === 'string' ? `<div class="grp">${n}</div>` : (() => { const [id, label, icon] = n; const s = SECTIONS[id]; return `<button data-nav="${id}" class="${state.view === id ? 'on' : ''}">${icon || s.icon}${label || s.label}</button>`; })()).join('');
    app.innerHTML = `<div class="shell">
      <aside class="side">
        <div class="logo">${I.logo}<small>Admin</small></div>
        <nav class="nav">${nav}</nav>
        <div class="side-foot"><div>Signed in as<b>${esc(state.user.email)}</b></div><a href="${SITE_ROOT}" target="_blank" rel="noopener">Open the website ↗</a><button data-logout style="text-align:left;color:rgba(251,248,243,.6)">Log out</button></div>
      </aside>
      <main class="main" id="main"></main></div>
      <div class="toast" id="toast"></div>`;
    $('[data-logout]').onclick = async () => { await api.logout(); state.user = null; render(); };
    app.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { state.view = b.dataset.nav; render(); });
    const v = state.view;
    if (v === 'dashboard') renderDashboard(); else if (v === 'site') renderSite(); else if (v === 'settings') renderSettings(); else renderList(v);
  }

  function renderLogin() {
    app.innerHTML = `<div class="login"><form class="login-card" id="login">
      <div class="logo">${I.logo}<small>Admin</small></div>
      <div><h1>Sign in</h1><p>Manage the Voilà website.</p></div>
      <div class="field"><label>Email</label><input name="email" type="email" autocomplete="username" required value="${demo ? 'marketings@voila.sg' : ''}"></div>
      <div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required value="${demo ? 'demo' : ''}"></div>
      <div id="login-msg"></div>
      <button class="btn" type="submit">Sign in</button>
      ${demo ? '<p class="msg" style="background:#fff8e1;color:#7a5a00">Demo mode: nothing you do here is saved.</p>' : ''}
    </form></div>`;
    $('#login').onsubmit = async e => {
      e.preventDefault(); const f = e.target; f.querySelector('button').disabled = true;
      try { state.user = await api.login(f.email.value.trim(), f.password.value); state.view = 'dashboard'; render(); }
      catch (err) { $('#login-msg').innerHTML = `<div class="msg bad">${esc(err.message)}</div>`; f.querySelector('button').disabled = false; }
    };
  }

  const topbar = (title, blurb, actions = '') => `<div class="topbar"><div><h1>${esc(title)}</h1>${blurb ? `<p>${esc(blurb)}</p>` : ''}</div><div class="actions"><span class="live ${demo ? 'demo' : ''}"><i></i>${demo ? 'Demo mode' : 'Changes go live when saved'}</span>${actions}</div></div>`;

  async function renderDashboard() {
    const main = $('#main'); main.innerHTML = topbar('Overview', 'What’s on the website right now.');
    const keys = ['projects', 'films', 'gallery', 'reviews', 'team', 'history', 'press', 'instagram'];
    const counts = await Promise.all(keys.map(k => api.get(k).then(d => d.length)));
    main.insertAdjacentHTML('beforeend', `<div class="cards">${keys.map((k, i) => `<button class="card" data-go="${k}"><b>${counts[i]}</b><span>${SECTIONS[k].label}</span><span class="go">Manage →</span></button>`).join('')}</div>
      <div class="tips"><h3>How it works</h3><ul>
        <li><b>Add</b> with the “Add” button at the top of each section. <b>Edit</b> by clicking a row. <b>Delete</b> with the bin on the row.</li>
        <li><b>Reorder</b> by dragging the dotted handle on the left of a row. The order here is the order on the website.</li>
        <li><b>Photos</b> can be dragged straight into the upload box. Big phone photos are shrunk automatically.</li>
        <li><b>Mistakes</b> can be undone: every section has a “Previous versions” button to restore an earlier state.</li>
        <li>Changes appear on the website as soon as you save. Refresh the site to see them.</li></ul></div>`);
    main.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { state.view = b.dataset.go; render(); });
  }

  /* ---------------- generic list editor ---------------- */
  async function renderList(key) {
    const S = SECTIONS[key], main = $('#main');
    main.innerHTML = topbar(S.label, S.blurb, `<button class="btn ghost sm" data-versions>Previous versions</button><button class="btn" data-add>+ Add ${S.one}</button>`);
    let items = await api.get(key); state.data[key] = items;
    main.insertAdjacentHTML('beforeend', `<div class="toolbar"><div class="search"><input placeholder="Search ${S.label.toLowerCase()}…" id="q"></div><span class="count" id="count"></span></div><div class="list" id="list"></div>`);
    const list = $('#list'), q = $('#q');
    const draw = () => {
      const f = q.value.trim().toLowerCase();
      const rows = items.map((it, i) => ({ it, i })).filter(({ it }) => !f || (S.title(it) + ' ' + S.sub(it)).toLowerCase().includes(f));
      $('#count').textContent = `${items.length} ${items.length === 1 ? S.one : S.label.toLowerCase()}`;
      list.innerHTML = rows.length ? rows.map(({ it, i }) => `<div class="row ${S.noimg ? 'noimg' : ''}" draggable="true" data-i="${i}">
          <span class="grip" title="Drag to reorder">${I.grip}</span>
          ${S.noimg ? '' : `<img class="thumb ${S.tall ? 'tall' : ''} ${S.logo ? 'logo' : ''}" src="${esc(src(S.thumb(it)))}" alt="" loading="lazy">`}
          <div class="row-main"><b>${esc(S.title(it))}</b><span>${esc(S.sub(it))}</span></div>
          <div class="row-actions"><button data-edit="${i}">Edit</button><button class="del" data-del="${i}">Delete</button></div></div>`).join('')
        : `<div class="empty">Nothing here yet. Use “Add ${S.one}” to create the first one.</div>`;
    };
    draw(); q.oninput = draw;
    const persist = async note => { setSaving(); try { await api.save(key, items, note); setSaved(); } catch (e) { toast(e.message, true); setSaveState(''); } };
    list.addEventListener('click', e => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (del) { const i = +del.dataset.del; confirmBox(`Delete this ${S.one}?`, `“${S.title(items[i])}” will be removed from the website.`, async () => { items.splice(i, 1); draw(); await persist('Deleted ' + S.title(items[i] || {}) ); }); return; }
      const row = e.target.closest('.row'); if (!row || e.target.closest('.grip')) return;
      const i = ed ? +ed.dataset.edit : +row.dataset.i;
      openForm(key, items[i], async val => { items[i] = val; draw(); await persist('Edited ' + S.title(val)); });
    });
    $('[data-add]').onclick = () => openForm(key, null, async val => { items.unshift(val); draw(); await persist('Added ' + S.title(val)); });
    $('[data-versions]').onclick = () => openVersions(key, async () => { items = await api.get(key); draw(); });
    // drag to reorder
    let from = null;
    list.addEventListener('dragstart', e => { const r = e.target.closest('.row'); if (!r) return; from = +r.dataset.i; r.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    list.addEventListener('dragover', e => { e.preventDefault(); const r = e.target.closest('.row'); list.querySelectorAll('.row.over').forEach(x => x.classList.remove('over')); r && r.classList.add('over'); });
    list.addEventListener('dragleave', e => { const r = e.target.closest('.row'); r && r.classList.remove('over'); });
    list.addEventListener('drop', async e => { e.preventDefault(); const r = e.target.closest('.row'); if (!r || from === null) return; const to = +r.dataset.i; if (to !== from) { const [m] = items.splice(from, 1); items.splice(to, 0, m); draw(); await persist('Reordered'); } from = null; });
    list.addEventListener('dragend', () => { list.querySelectorAll('.dragging,.over').forEach(x => x.classList.remove('dragging', 'over')); from = null; });
  }

  /* ---------------- form drawer ---------------- */
  function openForm(key, item, onSave) {
    const S = SECTIONS[key]; const val = item ? JSON.parse(JSON.stringify(item)) : (S.make ? S.make({}) : {});
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="drawer-bg"></div><div class="drawer" role="dialog"><div class="drawer-head"><h2>${item ? 'Edit' : 'Add'} ${S.one}</h2><button class="x" data-close aria-label="Close">${I.x}</button></div>
      <form class="drawer-body" id="f">${S.fields.map(f => fieldHtml(f, val)).join('')}</form>
      <div class="drawer-foot"><span></span><div class="right"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-save>Save</button></div></div></div>`;
    document.body.appendChild(wrap);
    const form = $('#f', wrap);
    S.fields.forEach(f => wireField(f, val, form));
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-close]').forEach(b => b.onclick = close); $('.drawer-bg', wrap).onclick = close;
    $('[data-save]', wrap).onclick = async () => {
      for (const f of S.fields) {
        if (f.t === 'text' || f.t === 'textarea' || f.t === 'select') val[f.k] = form.elements[f.k].value.trim();
        if (f.t === 'check') val[f.k] = form.elements[f.k].checked;
        if (f.t === 'youtube') { const id = ytId(form.elements[f.k].value); if (form.elements[f.k].value.trim() && !id) return toast('That doesn’t look like a YouTube link.', true); val[f.k] = id; }
        if (f.req && !(f.t === 'images' ? (val[f.k] || []).length : val[f.k])) return toast(`${f.l} is required.`, true);
      }
      let out = S.make ? S.make(val) : val;
      if (key === 'projects') out.images = (out.images || []).map(im => ({ src: im.src, thumb: im.thumb || im.src, w: im.w || 0, h: im.h || 0 }));
      close(); await onSave(out);
    };
  }
  function fieldHtml(f, val) {
    const v = val[f.k] ?? '';
    const hint = f.hint ? `<span class="hint">${esc(f.hint)}</span>` : '';
    if (f.t === 'text') return `<div class="field"><label>${esc(f.l)}</label><input name="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}">${hint}</div>`;
    if (f.t === 'textarea') return `<div class="field"><label>${esc(f.l)}</label><textarea name="${f.k}">${esc(v)}</textarea>${hint}</div>`;
    if (f.t === 'select') return `<div class="field"><label>${esc(f.l)}</label><select name="${f.k}">${f.opts.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    if (f.t === 'check') return `<div class="field"><label style="display:flex;gap:10px;align-items:center;text-transform:none;letter-spacing:0;font-size:14px;color:var(--ink)"><input type="checkbox" name="${f.k}" ${v ? 'checked' : ''} style="width:auto"> ${esc(f.l)}</label></div>`;
    if (f.t === 'youtube') return `<div class="field"><label>${esc(f.l)}</label><input name="${f.k}" value="${esc(v ? 'https://youtu.be/' + v : '')}" placeholder="https://www.youtube.com/watch?v=…"><div class="yt" data-yt="${f.k}">${v ? `<img src="${ytThumb(v)}" alt=""><span class="hint">Video found</span>` : '<span class="hint">Paste the link of the home tour on YouTube.</span>'}</div></div>`;
    if (f.t === 'stars') return `<div class="field"><label>${esc(f.l)}</label><div class="stars" data-stars="${f.k}">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-n="${n}" class="${n <= (v || 5) ? 'on' : ''}">★</button>`).join('')}</div></div>`;
    if (f.t === 'image') return `<div class="field"><label>${esc(f.l)}</label><div class="img-one" data-img="${f.k}"><img class="${f.tall ? 'tall' : ''} ${f.logo ? 'logo' : ''}" src="${esc(src(v))}" alt="" ${v ? '' : 'style="opacity:.35"'}><div class="ops"><label class="btn ghost sm">Choose photo<input type="file" accept="image/*" hidden></label>${v ? '<button type="button" class="btn danger sm" data-clear>Remove</button>' : ''}</div></div>${hint}</div>`;
    if (f.t === 'images') return `<div class="field"><label>${esc(f.l)}</label><label class="drop" data-drop="${f.k}"><b>Drop photos here</b> or click to choose<br><span class="hint">JPG or PNG, as many as you like</span><input type="file" accept="image/*" multiple></label><div class="imgs" data-imgs="${f.k}"></div>${hint}</div>`;
    return '';
  }
  function wireField(f, val, form) {
    if (f.t === 'youtube') { const inp = form.elements[f.k], box = $(`[data-yt="${f.k}"]`, form); inp.oninput = () => { const id = ytId(inp.value); box.innerHTML = id ? `<img src="${ytThumb(id)}" alt=""><span class="hint">Video found</span>` : '<span class="hint">Paste the link of the home tour on YouTube.</span>'; }; }
    if (f.t === 'stars') { const box = $(`[data-stars="${f.k}"]`, form); val[f.k] = val[f.k] || 5; box.onclick = e => { const b = e.target.closest('button'); if (!b) return; val[f.k] = +b.dataset.n; box.querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.n <= val[f.k])); }; }
    if (f.t === 'image') {
      const box = $(`[data-img="${f.k}"]`, form), img = $('img', box), file = $('input[type=file]', box);
      file.onchange = async () => { if (!file.files[0]) return; img.style.opacity = .4; try { const r = await api.upload(file.files[0]); val[f.k] = r.url; if (f.k === 'src') { val.thumb = r.url; val.w = r.w; val.h = r.h; } img.src = r.url; img.style.opacity = 1; } catch (e) { toast(e.message, true); img.style.opacity = 1; } };
      const clr = $('[data-clear]', box); if (clr) clr.onclick = () => { val[f.k] = ''; img.src = ''; img.style.opacity = .35; clr.remove(); };
    }
    if (f.t === 'images') {
      const drop = $(`[data-drop="${f.k}"]`, form), grid = $(`[data-imgs="${f.k}"]`, form), file = $('input', drop);
      val[f.k] = val[f.k] || [];
      const draw = () => { grid.innerHTML = val[f.k].map((im, i) => `<div class="im ${i === 0 ? 'cover' : ''}" draggable="true" data-i="${i}"><img src="${esc(src(im.thumb || im.src))}" alt="">${i === 0 ? '<span class="tag">COVER</span>' : '<button type="button" class="mk" data-cover="' + i + '">Make cover</button>'}<button type="button" class="rm" data-rm="${i}">${I.x}</button>${im.uploading ? '<span class="up">Uploading…</span>' : ''}</div>`).join(''); };
      draw();
      const add = async files => {
        for (const fl of files) {
          const ph = { src: '', thumb: URL.createObjectURL(fl), uploading: true }; val[f.k].push(ph); draw();
          try { const r = await api.upload(fl); Object.assign(ph, { src: r.url, thumb: r.url, w: r.w, h: r.h, uploading: false }); }
          catch (e) { toast(e.message, true); val[f.k] = val[f.k].filter(x => x !== ph); }
          draw();
        }
      };
      file.onchange = () => add([...file.files]);
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); }; drop.ondragleave = () => drop.classList.remove('over');
      drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); add([...e.dataTransfer.files].filter(x => x.type.startsWith('image/'))); };
      grid.onclick = e => { const rm = e.target.closest('[data-rm]'), cv = e.target.closest('[data-cover]'); if (rm) { val[f.k].splice(+rm.dataset.rm, 1); draw(); } if (cv) { const [m] = val[f.k].splice(+cv.dataset.cover, 1); val[f.k].unshift(m); draw(); } };
      let from = null;
      grid.addEventListener('dragstart', e => { const t = e.target.closest('.im'); if (t) from = +t.dataset.i; });
      grid.addEventListener('dragover', e => { e.preventDefault(); grid.querySelectorAll('.over').forEach(x => x.classList.remove('over')); const t = e.target.closest('.im'); t && t.classList.add('over'); });
      grid.addEventListener('drop', e => { e.preventDefault(); const t = e.target.closest('.im'); if (!t || from === null) return; const to = +t.dataset.i; const [m] = val[f.k].splice(from, 1); val[f.k].splice(to, 0, m); from = null; draw(); });
    }
  }

  /* ---------------- site text ---------------- */
  async function renderSite() {
    const main = $('#main'); main.innerHTML = topbar('Site text', 'Headlines, contact details and other wording around the site.', `<button class="btn ghost sm" data-versions>Previous versions</button>`);
    const data = { ...seed('site'), ...(await api.get('site')) };
    main.insertAdjacentHTML('beforeend', `<form id="site">${SITE_GROUPS.map(g => `<div class="group"><h3>${g.h}</h3>${g.f.map(([k, l, t]) => `<div class="field"><label>${esc(l)}</label>${t === 'textarea' ? `<textarea name="${k}">${esc(data[k] || '')}</textarea>` : `<input name="${k}" value="${esc(data[k] || '')}">`}</div>`).join('')}</div>`).join('')}
      <div class="sticky-save"><button class="btn" type="submit">Save site text</button></div></form>`);
    $('#site').onsubmit = async e => { e.preventDefault(); const f = e.target; const out = { ...data }; SITE_GROUPS.forEach(g => g.f.forEach(([k]) => out[k] = f.elements[k].value.trim())); setSaving(); try { await api.save('site', out, 'Edited site text'); setSaved(); toast('Site text saved'); } catch (err) { toast(err.message, true); } };
    $('[data-versions]').onclick = () => openVersions('site', renderSite);
  }

  /* ---------------- settings ---------------- */
  function renderSettings() {
    const main = $('#main'); main.innerHTML = topbar('Settings', 'Your login.');
    main.insertAdjacentHTML('beforeend', `<form class="group" id="pw" style="max-width:520px"><h3>Change password</h3><p class="sub">Signed in as ${esc(state.user.email)}</p>
      <div class="field"><label>Current password</label><input name="current" type="password" autocomplete="current-password" required></div>
      <div class="field"><label>New password</label><input name="next" type="password" autocomplete="new-password" minlength="10" required><span class="hint">At least 10 characters.</span></div>
      <div class="field"><label>New password again</label><input name="again" type="password" autocomplete="new-password" required></div>
      <div id="pw-msg"></div><div><button class="btn" type="submit">Update password</button></div></form>`);
    $('#pw').onsubmit = async e => { e.preventDefault(); const f = e.target; if (f.next.value !== f.again.value) return $('#pw-msg').innerHTML = '<div class="msg bad">The new passwords don’t match.</div>'; try { await api.changePassword(f.current.value, f.next.value); $('#pw-msg').innerHTML = '<div class="msg ok">Password updated. Use the new one next time you sign in.</div>'; f.reset(); } catch (err) { $('#pw-msg').innerHTML = `<div class="msg bad">${esc(err.message)}</div>`; } };
  }

  /* ---------------- versions ---------------- */
  async function openVersions(key, after) {
    const vs = await api.versions(key);
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="drawer-bg"></div><div class="drawer"><div class="drawer-head"><h2>Previous versions</h2><button class="x" data-close>${I.x}</button></div><div class="drawer-body"><p class="para-hint">Each save is kept. Restoring puts that version back on the website (the current state is kept as a version too).</p><div class="versions">${vs.length ? vs.map(v => `<div class="ver"><div><b>${esc(v.note || 'Saved')}</b><br><span>${new Date(v.created_at).toLocaleString()}</span></div><button class="btn ghost sm" data-restore="${v.id}">Restore</button></div>`).join('') : '<div class="empty">No previous versions yet.</div>'}</div></div></div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove(); wrap.querySelectorAll('[data-close]').forEach(b => b.onclick = close); $('.drawer-bg', wrap).onclick = close;
    wrap.querySelectorAll('[data-restore]').forEach(b => b.onclick = () => confirmBox('Restore this version?', 'The website will show this version straight away.', async () => { await api.restore(key, isNaN(+b.dataset.restore) ? b.dataset.restore : +b.dataset.restore); close(); toast('Version restored'); after(); }));
  }

  /* ---------------- helpers ---------------- */
  function confirmBox(title, text, ok) {
    const w = document.createElement('div'); w.className = 'confirm';
    w.innerHTML = `<div><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="btns"><button class="btn ghost" data-no>Cancel</button><button class="btn" data-yes>Yes</button></div></div>`;
    document.body.appendChild(w); $('[data-no]', w).onclick = () => w.remove(); $('[data-yes]', w).onclick = async () => { w.remove(); await ok(); };
  }
  let toastT; function toast(msg, bad) { const t = $('#toast'); if (!t) return alert(msg); t.textContent = msg; t.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }
  function setSaveState(s) { state.saveState = s; const live = $('.live'); if (!live) return; live.innerHTML = `<i></i>${s === 'saving' ? 'Saving…' : s === 'saved' ? 'Saved · live on the website' : demo ? 'Demo mode' : 'Changes go live when saved'}`; live.classList.toggle('demo', demo && s !== 'saved'); }
  const setSaving = () => setSaveState('saving'), setSaved = () => { setSaveState('saved'); setTimeout(() => state.saveState === 'saved' && setSaveState(''), 4000); };

  /* ---------------- boot ---------------- */
  (async () => { render(); state.user = await api.me(); render(); })();
})();
