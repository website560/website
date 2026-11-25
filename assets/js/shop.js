/* Voilà shop: product list, product page, cart drawer and checkout.
   Products come from the CMS (Supabase "products" section); these are the built-in fallback. */
window.VOILA_PRODUCTS = window.VOILA_PRODUCTS || [
  {
    slug: 'brushed-bronze-bar-handle', name: 'Brushed Bronze Bar Handle', price: 10, finish: 'Brushed bronze',
    short: 'A slim bar handle with softly rounded ends.',
    description: 'A slim bar handle in a warm brushed bronze finish, with softly rounded ends.\n\nMade for wardrobes and tall cabinet doors, it sits beautifully against warm neutrals and timber.',
    specs: 'Finish: Brushed bronze\nStyle: Bar handle with rounded ends\nUse: Wardrobes, tall cabinets, drawers',
    images: [{ src: 'assets/shop/bronze-bar-handle.jpg' }], active: true
  },
  {
    slug: 'fluted-antique-brass-handle', name: 'Fluted Antique Brass Handle', price: 10, finish: 'Antique brass',
    short: 'A T-bar handle with a finely fluted grip.',
    description: 'A T-bar handle with a finely fluted grip in an antique brass finish.\n\nThe ribbed texture adds a tailored detail to kitchen cabinets, drawers and wardrobes.',
    specs: 'Finish: Antique brass\nStyle: T-bar handle, fluted grip\nIncludes: Mounting screws\nUse: Kitchen cabinets, drawers, wardrobes',
    images: [{ src: 'assets/shop/knurled-brass-handle.jpg' }], active: true
  },
  {
    slug: 'walnut-brushed-brass-handle', name: 'Walnut & Brushed Brass Handle', price: 10, finish: 'Walnut, brushed brass',
    short: 'Solid walnut held in brushed brass posts.',
    description: 'A walnut bar held in brushed brass posts, bringing the warmth of timber to cabinetry and drawers.\n\nA natural partner for Japandi and wabi-sabi interiors.',
    specs: 'Finish: Walnut with brushed brass\nStyle: Bar handle on round posts\nUse: Kitchen cabinets, drawers, sideboards',
    images: [{ src: 'assets/shop/walnut-brass-handle.jpg' }], active: true
  }
];

window.VOILA_SHOP = (() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => 'S$' + Number(n || 0).toFixed(2);
  const products = () => (window.VOILA_PRODUCTS || []).filter(p => p.active !== false);
  const bySlug = s => products().find(p => p.slug === s);
  const img = (p, i = 0) => (p.images && p.images[i] && (p.images[i].src || p.images[i])) || '';
  const paras = s => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');
  const specRows = s => String(s || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const i = l.indexOf(':'); return i > 0 ? `<div><dt>${esc(l.slice(0, i))}</dt><dd>${esc(l.slice(i + 1).trim())}</dd></div>` : `<div><dd>${esc(l)}</dd></div>`; }).join('');
  const WA = '6580330071';

  /* ---------------- cart (kept in the browser) ---------------- */
  const KEY = 'voila_cart';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const write = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} paint(); };
  const cart = () => read().filter(l => bySlug(l.slug));
  const add = (slug, qty = 1) => { const c = read(); const l = c.find(x => x.slug === slug); if (l) l.qty = Math.min(20, l.qty + qty); else c.push({ slug, qty: Math.min(20, qty) }); write(c); };
  const setQty = (slug, qty) => { let c = read(); if (qty <= 0) c = c.filter(x => x.slug !== slug); else c.forEach(x => { if (x.slug === slug) x.qty = Math.min(20, qty); }); write(c); };
  const count = () => cart().reduce((n, l) => n + l.qty, 0);
  const total = () => cart().reduce((n, l) => n + l.qty * Number(bySlug(l.slug).price || 0), 0);

  /* ---------------- drawer ---------------- */
  function ensureDrawer() {
    if ($('#cart')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="cart" id="cart" aria-hidden="true">
        <div class="cart-bg" data-cart-close></div>
        <aside class="cart-panel" role="dialog" aria-label="Your cart">
          <div class="cart-head"><h2>Your cart</h2><button class="cart-x" data-cart-close aria-label="Close cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
          <div class="cart-lines"></div>
          <div class="cart-foot">
            <div class="cart-total"><span>Subtotal</span><b class="cart-sum"></b></div>
            <p class="cart-note">Delivery and payment are completed securely on the next step.</p>
            <button class="btn cart-checkout">Checkout <svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>
            <p class="cart-msg" aria-live="polite"></p>
          </div>
        </aside>
      </div>`);
    document.addEventListener('click', e => {
      if (e.target.closest('[data-cart-open]')) { e.preventDefault(); open(); }
      if (e.target.closest('[data-cart-close]')) close();
      const q = e.target.closest('[data-q]'); if (q) { const l = cart().find(x => x.slug === q.dataset.slug); if (l) setQty(l.slug, l.qty + (+q.dataset.q)); }
      const rm = e.target.closest('[data-rm]'); if (rm) setQty(rm.dataset.rm, 0);
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    $('.cart-checkout').addEventListener('click', checkout);
  }
  function open() { ensureDrawer(); paint(); const d = $('#cart'); d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); window.__lenis && window.__lenis.stop(); document.documentElement.style.overflow = 'hidden'; }
  function close() { const d = $('#cart'); if (!d || !d.classList.contains('open')) return; d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); window.__lenis && window.__lenis.start(); document.documentElement.style.overflow = ''; }
  function paint() {
    $$('.cart-count').forEach(b => { const n = count(); b.textContent = n; b.hidden = !n; });
    const box = $('.cart-lines'); if (!box) return;
    const lines = cart();
    box.innerHTML = lines.length ? lines.map(l => { const p = bySlug(l.slug); return `
      <div class="cart-line">
        <a href="/product?p=${esc(p.slug)}" class="cart-img"><img src="${esc(img(p))}" alt=""></a>
        <div class="cart-info"><a href="/product?p=${esc(p.slug)}"><b>${esc(p.name)}</b></a><span>${esc(p.finish || '')}</span>
          <div class="qty sm"><button data-q="-1" data-slug="${esc(p.slug)}" aria-label="Less">−</button><span>${l.qty}</span><button data-q="1" data-slug="${esc(p.slug)}" aria-label="More">+</button></div></div>
        <div class="cart-right"><b>${money(l.qty * p.price)}</b><button class="cart-rm" data-rm="${esc(p.slug)}">Remove</button></div>
      </div>`; }).join('') : `<div class="cart-empty"><p>Your cart is empty.</p><a href="/shop" class="link-u">Browse the shop</a></div>`;
    $('.cart-sum').textContent = money(total());
    $('.cart-checkout').disabled = !lines.length;
    $('.cart-foot').style.display = lines.length ? '' : 'none';
  }
  async function checkout() {
    const btn = $('.cart-checkout'), msg = $('.cart-msg'); const lines = cart(); if (!lines.length) return;
    btn.disabled = true; btn.firstChild.textContent = 'Opening secure checkout… '; msg.innerHTML = '';
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: lines }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.url) { location.href = j.url; return; }
      throw new Error(j.error || 'Checkout is unavailable right now.');
    } catch (e) {
      const text = 'Hi Voilà! I would like to order:\n' + lines.map(l => `- ${bySlug(l.slug).name} x ${l.qty}`).join('\n') + `\nTotal: ${money(total())}`;
      msg.innerHTML = `${esc(e.message)} You can also <a href="https://wa.me/${WA}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">order on WhatsApp</a>.`;
      btn.disabled = false; btn.firstChild.textContent = 'Checkout ';
    }
  }

  /* ---------------- pages ---------------- */
  const card = p => `
    <article class="pcard-shop anim">
      <a href="/product?p=${esc(p.slug)}" class="ps-media"><img src="${esc(img(p))}" alt="${esc(p.name)}" loading="lazy"></a>
      <div class="ps-meta"><div><a href="/product?p=${esc(p.slug)}"><h3>${esc(p.name)}</h3></a><span>${esc(p.finish || '')}</span></div><b>${money(p.price)}</b></div>
      <button class="ps-add" data-add="${esc(p.slug)}">Add to cart</button>
    </article>`;
  function flash(btn, txt = 'Added') { const o = btn.innerHTML; btn.innerHTML = txt + ' ✓'; btn.classList.add('ok'); setTimeout(() => { btn.innerHTML = o; btn.classList.remove('ok'); }, 1400); }
  document.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b) { add(b.dataset.add, 1); flash(b); paint(); } });

  function initShop() {
    const grid = $('.shop-grid'); if (!grid) return;
    const list = products();
    grid.innerHTML = list.length ? list.map(card).join('') : '<p class="search-empty">New pieces are coming soon.</p>';
    $('.shop-count') && ($('.shop-count').textContent = `${list.length} piece${list.length === 1 ? '' : 's'}`);
  }
  function initProduct() {
    const box = $('.pdp'); if (!box) return;
    const slug = new URLSearchParams(location.search).get('p');
    const p = bySlug(slug) || products()[0];
    if (!p) { box.innerHTML = '<p>Product not found. <a class="link-u" href="/shop">Back to the shop</a></p>'; return; }
    document.title = `${p.name} | Voilà Shop`;
    const imgs = (p.images || []).map((_, i) => img(p, i)).filter(Boolean);
    box.innerHTML = `
      <div class="pdp-gallery">
        <div class="pdp-main"><img src="${esc(imgs[0] || '')}" alt="${esc(p.name)}"></div>
        ${imgs.length > 1 ? `<div class="pdp-thumbs">${imgs.map((s, i) => `<button class="${i ? '' : 'on'}" data-img="${esc(s)}"><img src="${esc(s)}" alt=""></button>`).join('')}</div>` : ''}
      </div>
      <div class="pdp-info">
        <a href="/shop" class="pdp-back">← Shop</a>
        <h1 class="h-2">${esc(p.name)}</h1>
        <p class="pdp-price">${money(p.price)}</p>
        ${p.finish ? `<p class="pdp-finish">Finish: <b>${esc(p.finish)}</b></p>` : ''}
        <div class="pdp-desc">${paras(p.description || p.short)}</div>
        <div class="pdp-buy">
          <div class="qty"><button data-pq="-1" aria-label="Less">−</button><span class="pdp-qty">1</span><button data-pq="1" aria-label="More">+</button></div>
          <button class="btn pdp-add">Add to cart <svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>
        </div>
        <button class="pdp-view" data-cart-open>View cart</button>
        ${p.specs ? `<details class="pdp-acc" open><summary>Details</summary><dl class="pdp-specs">${specRows(p.specs)}</dl></details>` : ''}
        <details class="pdp-acc"><summary>Questions</summary><p>Not sure about sizes or finishes for your cabinets? <a class="link-u" href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp us</a> and we’ll help.</p></details>
      </div>`;
    let q = 1; const qEl = $('.pdp-qty');
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-pq]'); if (b) { q = Math.max(1, Math.min(20, q + (+b.dataset.pq))); qEl.textContent = q; }
      const t = e.target.closest('[data-img]'); if (t) { $('.pdp-main img').src = t.dataset.img; $$('.pdp-thumbs button').forEach(x => x.classList.toggle('on', x === t)); }
    });
    $('.pdp-add').addEventListener('click', e => { add(p.slug, q); flash(e.currentTarget, 'Added to cart'); open(); });
    const rel = products().filter(x => x.slug !== p.slug).slice(0, 4);
    const relBox = $('.related');
    if (relBox) { if (rel.length) $('.related-grid').innerHTML = rel.map(card).join(''); else relBox.remove(); }
  }
  async function initOrder() {
    const box = $('.order-box'); if (!box) return;
    const id = new URLSearchParams(location.search).get('session_id');
    if (!id) return;
    try {
      const r = await fetch('/api/checkout?session_id=' + encodeURIComponent(id)); const j = await r.json();
      if (r.ok && j.paid) { write([]); $('.order-detail').innerHTML = `Order total <b>${money(j.amount)}</b>${j.email ? `. A receipt has been sent to <b>${esc(j.email)}</b>` : ''}.`; }
    } catch (e) {}
  }

  function init(page) {
    ensureDrawer(); paint();
    if (page === 'shop') initShop();
    if (page === 'product') initProduct();
    if (page === 'order') initOrder();
    window.__watchAnim && window.__watchAnim();
  }
  return { init, add, open, paint };
})();
