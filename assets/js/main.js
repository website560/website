/* VOILÀ: site interactions */
(() => {
  const D = window.VOILA || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const isTouch = matchMedia('(hover:none),(pointer:coarse)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 860;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------------- icons ---------------- */
  const I = {
    arr: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a.7.7 0 0 0 1.06.6l12.2-7.5a.7.7 0 0 0 0-1.2L8.06 3.9A.7.7 0 0 0 7 4.5z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
    g: '<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
    check: '<svg class="vf" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#1A73E8"/><path d="M7 12.4l3.2 3.1L17 8.8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8.2c-.1-1.6-.4-3-1.6-4.2-1.2-1.2-2.6-1.5-4.2-1.6-1.7-.1-6.7-.1-8.3 0-1.6.1-3 .4-4.2 1.6S2.1 6.6 2 8.2c-.1 1.7-.1 6.7 0 8.3.1 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.5 4.2 1.6 1.7.1 6.7.1 8.3 0 1.6-.1 3-.4 4.2-1.6 1.2-1.2 1.5-2.6 1.6-4.2.1-1.7.1-6.6 0-8.3zM19.8 18.4a3.4 3.4 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.9.4s-4.6.1-5.9-.4a3.4 3.4 0 0 1-1.9-1.9c-.5-1.3-.4-4.4-.4-5.9s-.1-4.6.4-5.9a3.4 3.4 0 0 1 1.9-1.9c1.3-.5 4.4-.4 5.9-.4s4.6-.1 5.9.4a3.4 3.4 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.9s.1 4.6-.4 5.9z"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3C16.7 2.2 15.6 2 14.4 2 11.8 2 10 3.6 10 6.5v2H7.3v3.6H10V22h4v-9.9h2.8l.4-3.6z"/></svg>',
    yt: '<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-4.8.5-4.8s0-3.2-.5-4.8zM9.7 15V9l5.8 3z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.5.2-.7.2-1.3.2-1.5-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM12 0a12 12 0 0 0-10.3 18L0 24l6.2-1.6A12 12 0 1 0 12 0z"/></svg>'
  };
  const stars = n => `<span class="stars" aria-label="${n} out of 5 stars">${I.star.repeat(n)}</span>`;
  const LOGO = (cls = '') => `<svg class="logo-svg ${cls}" viewBox="0 0 712 236" aria-label="Voilà" role="img">
    <path pathLength="1" d="M18 70 L100 226 L182 70"/>
    <path pathLength="1" d="M262 70 a78 78 0 1 1 -0.01 0"/>
    <path pathLength="1" d="M376 70 V226"/>
    <path pathLength="1" d="M424 70 V226 H516"/>
    <path pathLength="1" d="M532 226 L613 70 L694 226"/>
    <path pathLength="1" class="acc" d="M580 12 L604 48"/></svg>`;

  const NAV = [['index.html','Home'],['about.html','About'],['portfolio.html','Portfolio'],['contact.html','Contact']];
  const here = (location.pathname.split('/').pop() || 'index.html');
  const activeHref = here.startsWith('project') ? 'portfolio.html' : here;

  /* ---------------- chrome: nav, menu, footer ---------------- */
  document.body.insertAdjacentHTML('afterbegin', `
    
    <header class="nav ${page === 'home' ? 'is-light is-hidden' : 'is-light'}" id="nav">
      <div class="wrap">
        <a href="index.html" class="nav-logo" aria-label="Voilà home">${LOGO()}</a>
        <ul class="nav-links">${NAV.map(([h, t]) => `<li><a href="${h}" class="${h === activeHref ? 'active' : ''}">${t}</a></li>`).join('')}</ul>
        <a href="contact.html#book" class="btn nav-cta">Free consultation ${I.arr}</a>
        <button class="burger" aria-label="Menu"><span></span><span></span></button>
      </div>
    </header>
    <a class="wa-float" href="https://wa.me/6580330071" target="_blank" rel="noopener" aria-label="Chat with Voilà on WhatsApp">${I.wa}</a>
    <nav class="menu" aria-label="Mobile">
      <ul>${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    </nav>`);

  const footerSlot = $('#footer');
  if (footerSlot) footerSlot.outerHTML = `
    <footer class="footer">
      <div class="wrap">
        <div class="footer-top">
          <div>
            <p class="f-lead">We’d love to meet you.<br><em>Coffee is on us.</em></p>
            <a href="contact.html#book" class="btn">Book a free consultation ${I.arr}</a>
            <div class="socials">
              <a href="https://www.instagram.com/voilainteriordesign/" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>
              <a href="https://www.facebook.com/VOILASG" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a>
              <a href="https://youtube.com/@voilainteriordesign" target="_blank" rel="noopener" aria-label="YouTube">${I.yt}</a>
              <a href="https://wa.me/6580330071" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>
            </div>
          </div>
          <div class="f-explore"><h4>Explore</h4><ul>${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>
        </div>
        <div class="footer-mark">${LOGO()}</div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} VOILÀ DESIGN PTE LTD</span><span>Award-Winning Interior Design Studio</span></div>
      </div>
    </footer>`;

  const nav = $('#nav');
  $('.burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  const hasGSAP = !!window.gsap;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true }); window.__lenis = lenis;
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const lockScroll = on => { lenis && (on ? lenis.stop() : lenis.start()); document.documentElement.style.overflow = on ? 'hidden' : ''; };

  // in-page anchors
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -130, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* nav state for inner pages */
  if (page !== 'home') {
    const onS = () => nav.classList.toggle('is-scrolled', scrollY > 40);
    addEventListener('scroll', onS, { passive: true }); onS();
  }


  /* ---------------- builders ---------------- */
  const thumb = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const thumbFallback = `onerror="this.onerror=null;this.src=this.src.replace('maxresdefault','hqdefault')"`;
  const filmCard = (f, i) => `
    <button class="film" data-film="${f.id}" data-cursor="Play" aria-label="Play ${esc(f.style)}, ${esc(f.place)}">
      <div class="film-media"><img src="${f.thumb || thumb(f.id)}" ${thumbFallback} alt="${esc(f.style)} interior design, ${esc(f.place)}" loading="lazy" draggable="false">
        <span class="film-play">${I.play}</span><span class="film-dur">${esc(f.dur)}</span></div>
      <div class="film-meta"><span class="k">${esc(f.style)}</span><h3>${esc(f.place)}</h3></div>
    </button>`;
  const projectCard = (p, i, cls = 'work') => `
    <a class="${cls}" href="project.html?p=${p.slug}" data-cursor="View">
      <div class="work-media"><img src="${p.images[0].src}" alt="${esc(p.style)}, ${esc(p.place)}" loading="lazy" data-inner></div>
      <div class="work-meta"><div><h3>${esc(p.style)}</h3><p>${esc(p.place)}</p></div></div>
    </a>`;
  const findFilm = id => (D.films || []).find(f => f.id === id);
  const findProjectByFilm = id => (D.projects || []).find(p => p.film === id);

  /* ---------------- video modal ---------------- */
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="vmodal" role="dialog" aria-modal="true" aria-label="Video">
      <div class="modal-bg" data-close></div>
      <div class="modal-box">
        <div class="modal-head">
          <div><span class="k"></span><h3></h3><p></p></div>
          <div class="modal-actions"><a class="btn light vm-proj" href="#" style="display:none">View project ${I.arr}</a><button class="x" data-close aria-label="Close">${I.x}</button></div>
        </div>
        <div class="modal-video"><img alt=""><span class="loading"></span></div>
      </div>
    </div>
    <div class="modal" id="lightbox" role="dialog" aria-modal="true" aria-label="Gallery">
      <div class="modal-bg" data-close></div>
      <div class="modal-box lb-box">
        <div class="lb-stage"><img alt=""><button class="arrow lb-nav prev" aria-label="Previous">${I.left}</button><button class="arrow lb-nav next" aria-label="Next">${I.right}</button></div>
        <div class="lb-foot"><div class="t"></div><div style="display:flex;gap:14px;align-items:center"><span class="lb-count"></span><button class="btn lb-film" style="display:none">Watch the film ${I.play.replace('<svg','<svg class="arr" fill="currentColor"')}</button><button class="x" data-close aria-label="Close">${I.x}</button></div></div>
      </div>
    </div>`);
  const vm = $('#vmodal'), vmVideo = $('.modal-video', vm);
  let vmTimer;
  function openVideo(id) {
    const f = findFilm(id) || { id, style: 'Home Tour', place: '', title: '' };
    const proj = findProjectByFilm(id);
    $('.k', vm).textContent = f.style;
    $('h3', vm).innerHTML = `<span class="split-line"><span>${esc(f.place)}</span></span>`;
    $('p', vm).textContent = `Interior design by Voilà · Home tour film${f.dur ? ' · ' + f.dur : ''}`;
    const pl = $('.vm-proj', vm);
    if (proj && page !== 'project') { pl.style.display = ''; pl.href = `project.html?p=${proj.slug}`; } else pl.style.display = 'none';
    $('img', vmVideo).src = f.thumb || thumb(id);
    $('img', vmVideo).onerror = function () { this.onerror = null; this.src = this.src.replace('maxresdefault', 'hqdefault'); };
    vmVideo.classList.remove('playing');
    $('iframe', vmVideo)?.remove();
    vm.classList.add('open'); lockScroll(true);
    if (hasGSAP) {
      gsap.fromTo($('h3 .split-line>span', vm), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', delay: .25 });
      gsap.fromTo([$('.k', vm), $('p', vm)], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, stagger: .1, delay: .35, ease: 'expo.out' });
    }
    clearTimeout(vmTimer);
    vmTimer = setTimeout(() => {
      const fr = document.createElement('iframe');
      fr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      fr.allowFullscreen = true;
      fr.title = f.title || 'Voilà home tour';
      fr.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`;
      fr.onload = () => setTimeout(() => vmVideo.classList.add('playing'), 250);
      vmVideo.appendChild(fr);
    }, 1100);
  }
  function closeModal(m) {
    m.classList.remove('open'); lockScroll(false);
    if (m === vm) { clearTimeout(vmTimer); setTimeout(() => $('iframe', vmVideo)?.remove(), 500); }
  }
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(m); }));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal.open').forEach(closeModal);
    if (lb.classList.contains('open')) { if (e.key === 'ArrowRight') lbGo(1); if (e.key === 'ArrowLeft') lbGo(-1); }
  });
  let dragMoved = false;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-film]');
    if (!b) return;
    if (dragMoved) { e.preventDefault(); return; }
    e.preventDefault(); openVideo(b.dataset.film);
  });

  /* ---------------- lightbox ---------------- */
  const lb = $('#lightbox'); let lbList = [], lbI = 0;
  const lbImg = $('.lb-stage img', lb);
  function lbRender() {
    const it = lbList[lbI];
    lbImg.classList.add('swap');
    const n = new Image(); n.src = it.src;
    n.onload = () => { lbImg.src = it.src; lbImg.alt = `${it.style}, ${it.place}`; requestAnimationFrame(() => lbImg.classList.remove('swap')); };
    $('.t', lb).innerHTML = `${esc(it.style)}<small>${esc(it.place)}</small>`;
    $('.lb-count', lb).textContent = `${String(lbI + 1).padStart(2, '0')} / ${String(lbList.length).padStart(2, '0')}`;
    const fb = $('.lb-film', lb); fb.style.display = it.film ? '' : 'none'; fb.dataset.id = it.film || '';
  }
  function openLightbox(list, i) { lbList = list; lbI = i; lb.classList.add('open'); lockScroll(true); lbRender(); }
  const lbGo = d => { lbI = (lbI + d + lbList.length) % lbList.length; lbRender(); };
  $('.lb-nav.prev', lb).onclick = () => lbGo(-1);
  $('.lb-nav.next', lb).onclick = () => lbGo(1);
  $('.lb-film', lb).onclick = e => { const id = e.currentTarget.dataset.id; closeModal(lb); setTimeout(() => openVideo(id), 350); };
  let tx = 0;
  lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) lbGo(d < 0 ? 1 : -1); });

  /* ---------------- drag slider ---------------- */
  function Slider(root) {
    const track = $('.slider-track', root), bar = $('.slider-bar-wrap i', root);
    let x = 0, target = 0, max = 0, down = false, sx = 0, st = 0, vel = 0, last = 0;
    const measure = () => { max = Math.max(0, track.scrollWidth - track.parentElement.clientWidth); target = Math.min(target, max); };
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 400) + parseFloat(getComputedStyle(track).gap || 24);
    const tick = () => {
      if (!down) { target += vel; vel *= .92; if (Math.abs(vel) < .1) vel = 0; }
      target = Math.max(0, Math.min(max, target));
      x += (target - x) * .12;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      if (bar) { const vis = track.parentElement.clientWidth / track.scrollWidth; bar.style.width = (vis * 100) + '%'; bar.style.transform = `translateX(${max ? (x / max) * ((1 / vis) - 1) * 100 : 0}%)`; }
      requestAnimationFrame(tick);
    };
    track.addEventListener('pointerdown', e => { down = true; dragMoved = false; sx = e.clientX; st = target; last = e.clientX; vel = 0; track.classList.add('is-drag'); });
    addEventListener('pointermove', e => {
      if (!down) return;
      const d = e.clientX - sx; if (Math.abs(d) > 6) dragMoved = true;
      target = st - d; vel = -(e.clientX - last) * .9; last = e.clientX;
    });
    addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-drag'); setTimeout(() => dragMoved = false, 50); });
    track.addEventListener('dragstart', e => e.preventDefault());
    $('.prev', root)?.addEventListener('click', () => { vel = 0; target -= step(); });
    $('.next', root)?.addEventListener('click', () => { vel = 0; target += step(); });
    root.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); target += e.deltaX; } }, { passive: false });
    addEventListener('resize', measure); measure(); setTimeout(measure, 800); tick();
  }

  /* ---------------- scroll animation that replays every time an item enters ---------------- */
  const animIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
  function watchAnim(scope = document) { $$('.anim:not([data-w])', scope).forEach(el => { el.dataset.w = 1; animIO ? animIO.observe(el) : el.classList.add('in'); }); }

  /* ---------------- portfolio hero: curved wall of photo columns floating up forever ---------------- */
  function CurvedWall(wall = $('.wall'), opt = {}) {
    if (!wall) return;
    const from = opt.from || 0, per = opt.per || 8, curve = opt.curve !== false;
    // a spread of photos from every project, interleaved so neighbours differ
    const byProj = D.projects.map(p => { const l = p.images.filter(im => !opt.landscape || im.w > im.h).map(im => im.thumb || im.src); return l.slice(from, from + per).concat(l.slice(0, Math.max(0, from + per - l.length))); });
    const pics = [];
    for (let i = 0; i < per; i++) byProj.forEach(list => list[i] && pics.push(list[i]));
    let cols = [], raf;
    function build() {
      const C = innerWidth < 640 ? (opt.phone || 3) : innerWidth < 1100 ? (opt.tablet || 5) : (opt.cols || 7);
      wall.innerHTML = '';
      cols = Array.from({ length: C }, (_, c) => {
        const list = pics.filter((_, i) => i % C === c);
        const col = document.createElement('div'); col.className = 'wall-col';
        const html = list.map(src => `<div class="wall-tile"><img src="${src}" alt="" loading="lazy" decoding="async"></div>`).join('');
        col.innerHTML = `<div class="wall-track">${html}${html}</div>`;
        const n = C > 1 ? (c - (C - 1) / 2) / ((C - 1) / 2) : 0;
        if (curve) col.style.transform = `rotateY(${-n * (C < 5 ? 10 : 16)}deg) translateZ(${Math.abs(n) * (C < 5 ? 10 : 40)}px)`;
        wall.appendChild(col);
        return { track: col.firstElementChild, y: opt.curve === false ? -c * 170 : -Math.random() * 400, speed: (opt.speed || .35) + (c % 3) * .09, half: 0 };
      });
      requestAnimationFrame(() => cols.forEach(s => s.half = s.track.scrollHeight / 2));
    }
    const tick = () => {
      cols.forEach(s => {
        s.y -= s.speed;
        if (s.half && s.y <= -s.half) s.y += s.half;
        s.track.style.transform = `translate3d(0,${s.y}px,0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    let w = innerWidth;
    addEventListener('resize', () => { if (Math.abs(innerWidth - w) > 80) { w = innerWidth; build(); } });
    addEventListener('load', () => cols.forEach(s => s.half = s.track.scrollHeight / 2));
    build(); tick();
  }

  /* ---------------- infinite drag loop (never pauses on hover) ---------------- */
  function InfiniteLoop(root, track, speed = .55) {
    let x = 0, set = 0, down = false, sx = 0, sxv = 0, moved = false, v = 0, lastX = 0;
    const measure = () => { set = track.scrollWidth / 3; };
    const wrap = () => { if (x <= -set * 2) x += set; if (x > -set) x -= set; };
    x = -set;
    const tick = () => {
      if (!down) { x -= speed + v; v *= .94; }
      if (set) wrap();
      track.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(tick);
    };
    root.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sxv = x; lastX = e.clientX; v = 0; });
    addEventListener('pointermove', e => { if (!down) return; const d = e.clientX - sx; if (Math.abs(d) > 6) moved = true; x = sxv + d; v = -(e.clientX - lastX) * .6; lastX = e.clientX; });
    addEventListener('pointerup', () => { down = false; });
    root.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
    const init = () => { measure(); x = -set; };
    addEventListener('resize', measure); init(); addEventListener('load', init); tick();
  }

  /* ---------------- reviews (two-way vertical marquee) ---------------- */
  const PAL = ['#FF6219', '#7A5C45', '#3F5B4F', '#8C6D5A', '#2F3E4E', '#B5834F', '#5E4B6B', '#A0522D'];
  const reviewCard = (r, i) => `
    <article class="rv">
      <div class="rv-top"><span class="rv-av" style="background:${PAL[i % PAL.length]}">${esc((r.name || '?').trim()[0].toUpperCase())}</span>
        <div><div class="rv-name">${esc(r.name)} ${I.check}</div><div class="rv-meta">${esc(r.meta || 'Google review')}</div></div>
        <span class="rv-g">${I.g}</span></div>
      <div class="rv-row">${stars(r.stars)}<span class="rv-when">${esc(r.when)}</span></div>
      <p>${esc(r.text)}</p>
      <div class="rv-foot">${I.shield} Verified Google review</div>
    </article>`;
  function buildReviews(el) {
    const R = D.reviews || []; const cols = [[], []];
    R.forEach((r, i) => cols[i % 2].push(reviewCard(r, i)));
    el.innerHTML = cols.map((c, i) => `<div class="mv-col ${i % 2 ? 'down' : ''}" style="--dur:${c.length * 6 + i * 8}s">${c.join('')}${c.join('')}</div>`).join('');
    // on single-column mobile, show all reviews in the visible column
    if (matchMedia('(max-width:640px)').matches) { const all = R.map(reviewCard); el.firstElementChild.innerHTML = all.join('') + all.join(''); el.firstElementChild.style.setProperty('--dur', R.length * 6 + 's'); }
  }

  /* ---------------- generic reveals ---------------- */
  function reveals(scope = document) {
    if (!hasGSAP || reduce) { $$('[data-reveal],[data-img-reveal]', scope).forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; el.style.clipPath = 'none'; }); return; }
    ScrollTrigger.batch($$('[data-reveal]', scope), {
      start: 'top 88%', once: true,
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .09 })
    });
    $$('[data-lines]', scope).forEach(el => {
      gsap.fromTo($$('.split-line>span', el), { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .09, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    });
    $$('[data-img-reveal]', scope).forEach(el => {
      const img = $('img', el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' });
      if (img) tl.from(img, { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0);
    });
    $$('[data-parallax]', scope).forEach(el => {
      const amt = parseFloat(el.dataset.parallax) || 12;
      gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ==========================================================================
     HOME
     ========================================================================== */
  function initHome() {
    // ---- scroll-scrubbed hero ----
    const hero = $('.hero'), canvas = $('canvas', hero), ctx = canvas.getContext('2d');
    const N = 121; const set = () => (innerWidth / innerHeight < .8 ? 'm' : 'd');
    let cur = set(), imgs = [], loaded = 0, frame = 0, drawn = -1;
    const src = (s, i) => `assets/hero/${s}/${String(i + 1).padStart(3, '0')}.jpg`;
    const loaderEl = $('.hero-loader');
    function load(s) {
      imgs = new Array(N); loaded = 0;
      const order = [0, N - 1]; for (let step = 16; step >= 1; step = step / 2 | 0) { for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i); if (step === 1) break; }
      order.forEach(i => { const im = new Image(); im.decoding = 'async'; im.onload = () => { loaded++; if (loaderEl) loaderEl.textContent = loaded < N ? `Loading ${Math.round(loaded / N * 100)}%` : ''; if (i === 0 || Math.round(frame) === i) draw(true); }; im.src = src(s, i); imgs[i] = im; });
    }
    function nearest(i) { for (let d = 0; d < N; d++) { const a = imgs[i - d], b = imgs[i + d]; if (a && a.complete && a.naturalWidth) return a; if (b && b.complete && b.naturalWidth) return b; } }
    function size() { const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; draw(true); }
    function draw(force) {
      const i = Math.round(frame); if (i === drawn && !force) return;
      const im = nearest(i); if (!im) return; drawn = i;
      const cw = canvas.width, ch = canvas.height, r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * r, h = im.naturalHeight * r;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    load(cur); size();
    addEventListener('resize', () => { const s = set(); if (s !== cur) { cur = s; load(s); } size(); });

    const endEl = $('.hero-end');
    const loopV = $('.hero-loop');
    // preload the loop so it is ready (paused on frame 0) before the transition ends
    if (loopV) {
      const srcEl = $('source', loopV);
      srcEl.src = innerWidth / innerHeight < .8 ? srcEl.dataset.m : srcEl.dataset.d;
      loopV.preload = 'auto'; loopV.load();
    }
    // swap to the loop only once its first frame is painted: no crossfade, no ghosting
    const startLoop = () => {
      if (!loopV) return;
      loopV.currentTime = 0;
      const reveal = () => loopV.classList.add('on');
      if ('requestVideoFrameCallback' in loopV) loopV.requestVideoFrameCallback(reveal);
      else loopV.addEventListener('playing', reveal, { once: true });
      loopV.play().catch(reveal);
    };
    const showEnd = on => { endEl.classList.toggle('is-on', on); nav.classList.toggle('is-hidden', !on); };

    if (!hasGSAP) { frame = N - 1; draw(true); showEnd(true); startLoop(); return; }

    // intro: logo and slogan fade in softly
    const intro = gsap.timeline({ delay: .3 });
    intro.fromTo('.hero-intro .logo-svg', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2, ease: 'power3.out' })
      .fromTo('.hero-tag', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.6, ease: 'power3.out' }, '-=1.3');

    // one scroll plays the whole film through to the end scene
    const st = { f: 0 };
    const play = gsap.timeline({ paused: true })
      .to(st, { f: N - 1, duration: 2.2, ease: 'power1.inOut', onUpdate: () => { frame = st.f; draw(); } }, 0)
      .to('.hero-intro', { opacity: 0, y: -60, duration: .6, ease: 'power2.in' }, .05)
      .to('.hero-shade.a', { opacity: .35, duration: 1 }, .2)
      .to('.hero-shade.b', { opacity: 1, duration: .8 }, 1.5)
      .fromTo('.hero-end h1 .split-line>span', { yPercent: 110 }, { yPercent: 0, stagger: .1, duration: 1.1, ease: 'expo.out' }, 1.75)
      .fromTo('.hero-end [data-he]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: .1, duration: .9, ease: 'expo.out' }, 1.95);
    $('.hero-end h1').style.opacity = 1;

    // one-way: the film plays once, then the page stays on the curtain loop for the rest of the visit
    let mode = 'intro';
    const lock = () => { lenis && lenis.stop(); document.documentElement.style.overflow = 'hidden'; };
    const unlock = () => { lenis && lenis.start(); document.documentElement.style.overflow = ''; };
    const finish = () => { mode = 'end'; unlock(); startLoop(); try { sessionStorage.setItem('voilaIntroSeen', '1'); } catch (e) {} };
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    scrollTo(0, 0);

    let seen = false; try { seen = sessionStorage.getItem('voilaIntroSeen') === '1'; } catch (e) {}
    if (seen) {
      // already watched this visit: open straight on the end scene
      intro.progress(1); play.progress(1); frame = N - 1; draw(true); showEnd(true); finish();
    } else lock();

    function forward() {
      if (mode !== 'intro') return;
      mode = 'busy'; intro.progress(1);
      setTimeout(() => showEnd(true), 1700);
      play.eventCallback('onComplete', finish).play();
    }
    addEventListener('wheel', e => { if (e.deltaY > 3) forward(); }, { passive: true });
    let ty = null;
    addEventListener('touchstart', e => ty = e.touches[0].clientY, { passive: true });
    addEventListener('touchmove', e => {
      if (ty === null) return;
      const d = ty - e.touches[0].clientY;
      if (mode !== 'end' && e.cancelable) e.preventDefault();
      if (d > 30) { forward(); ty = null; }
    }, { passive: false });
    addEventListener('keydown', e => { if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) forward(); });

    // after hero, nav gets a solid background
    ScrollTrigger.create({ start: () => hero.offsetHeight - 80, onEnter: () => nav.classList.add('is-scrolled'), onLeaveBack: () => nav.classList.remove('is-scrolled') });

    // ---- statement word scrub ----
    const big = $('.statement .big');
    if (big) {
      const words = big.textContent.trim().split(/\s+/);
      big.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
      gsap.to($$('.w', big), { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: big, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    }
    // counters
    $$('[data-count]').forEach(el => {
      const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => el.firstChild.nodeValue = o.v.toFixed(dec) });
    });

    // ---- selected works: infinite slider ----
    const track = $('.loop-track');
    const cards = D.projects.map((p, i) => projectCard(p, i).replace('class="work"', `class="work${i % 3 === 1 ? ' wide' : ''}${i % 2 ? ' low' : ''}"`)).join('');
    track.innerHTML = cards + cards + cards;
    InfiniteLoop($('.loop'), track);

    // ---- films slider ----
    const ftrack = $('.films-loop .loop-track'), fcards = D.films.map(filmCard).join('');
    ftrack.innerHTML = fcards + fcards + fcards;
    InfiniteLoop($('.films-loop'), ftrack, -1.4);

    // ---- process ----
    const pimgs = $$('.process-media img');
    $$('.step').forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 60%', end: 'bottom 60%',
      onToggle: st => { if (st.isActive) { $$('.step').forEach(x => x.classList.toggle('on', x === s)); pimgs.forEach((im, j) => im.classList.toggle('on', j === i)); } }
    }));

    // ---- reviews ----
    buildReviews($('.marquee-v'));

    // ---- cta parallax ----
    const bg = $('.cta-band .bg');
    if (bg) gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ==========================================================================
     PORTFOLIO
     ========================================================================== */
  function initPortfolio() {
    $('.pgrid').innerHTML = D.projects.map((p, i) => projectCard(p, i, 'pcard')).join('');
    $$('.pcard').forEach((c, i) => { c.classList.add('anim'); c.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
    $$('.fgrid .film').forEach((c, i) => { c.classList.add('anim'); c.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
    CurvedWall($('.rise-wall'), { from: 0, per: 6, curve: false, landscape: true, cols: 6, tablet: 5, phone: 3, speed: .4 });

    // cinema slider
    const stage = $('.cinema-stage'); const F = D.films; let ci = 0, timer;
    stage.innerHTML = F.map((f, i) => `
      <div class="cine" data-i="${i}" data-cursor="Play">
        <img src="${f.thumb || thumb(f.id)}" ${thumbFallback} alt="${esc(f.style)}, ${esc(f.place)}" loading="${i < 3 ? 'eager' : 'lazy'}" draggable="false">
        <div class="cine-cap"><div><span class="k">${esc(f.style)} · ${esc(f.dur)}</span><h3>${esc(f.place)}</h3></div><span class="film-play">${I.play}</span></div>
      </div>`).join('');
    const cines = $$('.cine', stage);
    function layout() {
      const w = cines[0].getBoundingClientRect().width, gap = mobile() ? 16 : 40;
      cines.forEach((c, i) => {
        let d = i - ci; const n = F.length;
        if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        const vis = Math.abs(d) <= 2;
        c.style.transform = `translateX(calc(-50% + ${d * (w + gap)}px)) scale(${d === 0 ? 1 : .86})`;
        c.style.opacity = vis ? 1 : 0; c.style.zIndex = 10 - Math.abs(d); c.style.pointerEvents = vis ? '' : 'none';
        c.classList.toggle('is-active', d === 0);
      });
      $('.cinema-count').innerHTML = `<span>${String(ci + 1).padStart(2, '0')}</span> / ${F.length}`;
    }
    const go = d => { ci = (ci + d + F.length) % F.length; layout(); auto(); };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(1), 5500); };
    stage.addEventListener('click', e => {
      const c = e.target.closest('.cine'); if (!c) return;
      const i = +c.dataset.i; if (i === ci) openVideo(F[i].id); else { ci = i; layout(); auto(); }
    });
    $('.cinema .prev').onclick = () => go(-1); $('.cinema .next').onclick = () => go(1);
    let sx = null;
    stage.addEventListener('pointerdown', e => sx = e.clientX);
    stage.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) go(e.clientX < sx ? 1 : -1); sx = null; });
    addEventListener('resize', layout); layout(); auto();
    stage.addEventListener('mouseenter', () => clearInterval(timer)); stage.addEventListener('mouseleave', auto);

    // film grid
    $('.fgrid').innerHTML = F.map(filmCard).join('');

    // gallery
    const G = D.gallery; const styles = {};
    G.forEach(g => styles[g.style] = (styles[g.style] || 0) + 1);
    const chips = $('.chips');
    chips.innerHTML = `<button class="chip on" data-s="*">All<small>${G.length}</small></button>` +
      Object.entries(styles).sort((a, b) => b[1] - a[1]).map(([s, n]) => `<button class="chip" data-s="${esc(s)}">${esc(s)}<small>${n}</small></button>`).join('');
    const mas = $('.ugrid'), more = $('.load-more'); let filter = '*', shown = 0, list = G;
    const PAGE = 24;
    function render(reset) {
      if (reset) { mas.innerHTML = ''; shown = 0; list = filter === '*' ? G : G.filter(g => g.style === filter); }
      const slice = list.slice(shown, shown + PAGE);
      mas.insertAdjacentHTML('beforeend', slice.map((g, k) => `<button class="m-item anim" data-gi="${shown + k}" style="--d:${(k % 4) * 80}ms"><img src="${g.thumb || g.src}" width="${g.w}" height="${g.h}" alt="${esc(g.style)}, ${esc(g.place)}" loading="lazy"><span class="cap"><b>${esc(g.style)}</b>${esc(g.place)}</span></button>`).join(''));
      watchAnim(mas);
      shown += slice.length; more.style.display = shown < list.length ? '' : 'none';
      hasGSAP && ScrollTrigger.refresh();
    }
    chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; $$('.chip', chips).forEach(x => x.classList.toggle('on', x === c)); filter = c.dataset.s; render(true); });
    more.addEventListener('click', () => render(false));
    mas.addEventListener('click', e => { const m = e.target.closest('.m-item'); if (m) openLightbox(list, +m.dataset.gi); });
    render(true);

    // tabs scroll-spy
    const tabs = $$('.tabs a');
    tabs.forEach(t => { const sec = $(t.getAttribute('href')); hasGSAP && ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => s.isActive && tabs.forEach(x => x.classList.toggle('on', x === t)) }); });
    $('#t-films sup') && ($('#t-films sup').textContent = F.length);
    $('#t-gallery sup') && ($('#t-gallery sup').textContent = G.length);
    $('#t-projects sup') && ($('#t-projects sup').textContent = D.projects.length);
    if (location.hash) setTimeout(() => { const t = $(location.hash); t && (lenis ? lenis.scrollTo(t, { offset: -130, immediate: true }) : t.scrollIntoView()); }, 400);
  }

  /* ==========================================================================
     PROJECT DETAIL
     ========================================================================== */
  function initProject() {
    const slug = new URLSearchParams(location.search).get('p');
    const idx = Math.max(0, D.projects.findIndex(p => p.slug === slug));
    const p = D.projects[idx], nx = D.projects[(idx + 1) % D.projects.length];
    document.title = `${p.style} | ${p.place} | Voilà`;
    $('.page-hero .bg img').src = p.images[0].src;
    $('.page-hero .bg img').alt = `${p.style}, ${p.place}`;
    $('[data-p="style"]').innerHTML = `<span class="split-line"><span>${esc(p.style)}</span></span>`;
    $('[data-p="place"]').textContent = p.place;
    $('.proj-meta').innerHTML = `<div><span>Style</span><b>${esc(p.style)}</b></div><div><span>Location</span><b>${esc(p.place)}</b></div><div><span>Property</span><b>${esc(p.type)}</b></div><div><span>Photographs</span><b>${p.images.length}</b></div>`;
    const filmBox = $('.proj-film');
    if (p.film) { const f = findFilm(p.film); filmBox.innerHTML = filmCard(f).replace('class="film"', 'class="film" style="width:100%"'); }
    else filmBox.closest('section').remove();
    const pattern = ['pf-full', 'pf-l', 'pf-r', 'pf-half', 'pf-half', 'pf-c'];
    const imgs = p.images.slice(1);
    const list = p.images.map(im => ({ ...im, style: p.style, place: p.place, film: p.film }));
    $('.proj-flow').innerHTML = imgs.map((im, i) => {
      let cls = pattern[i % pattern.length];
      const portrait = im.h > im.w;
      if (portrait && (cls === 'pf-full' || cls === 'pf-c' || cls === 'pf-l')) cls = 'pf-half';
      return `<figure class="${cls}" data-img-reveal data-li="${i + 1}" data-cursor="View"><img src="${im.src}" alt="${esc(p.style)}, ${esc(p.place)}" loading="lazy"></figure>`;
    }).join('');
    $('.proj-flow').addEventListener('click', e => { const f = e.target.closest('figure'); if (f) openLightbox(list, +f.dataset.li); });
    const np = $('.next-proj'); np.href = `project.html?p=${nx.slug}`;
    $('img', np).src = nx.images[0].src; $('h2', np).textContent = nx.style; $('.np-place', np).textContent = nx.place;
  }

  /* ==========================================================================
     ABOUT
     ========================================================================== */
  /* ---------------- instagram strip (live feed if configured, snapshot fallback) ---------------- */
  async function initInstagram() {
    const root = $('.ig-loop'); if (!root) return;
    const track = $('.loop-track', root);
    let posts = (window.VOILA_IG || []).map(p => ({ href: p.href, img: p.img, reel: p.reel }));
    const feed = window.VOILA_IG_FEED;
    if (feed) {
      try {
        const res = await fetch(feed, { cache: 'no-store' });
        const j = await res.json();
        const list = Array.isArray(j) ? j : (j.posts || j.data || []);
        const live = list.map(p => ({
          href: p.permalink,
          img: p.sizes?.medium?.mediaUrl || p.thumbnailUrl || p.thumbnail_url || p.mediaUrl || p.media_url,
          reel: /VIDEO|REEL/i.test(p.mediaType || p.media_type || '')
        })).filter(p => p.href && p.img).slice(0, 18);
        if (live.length) posts = live;
      } catch (e) { /* keep snapshot */ }
    }
    if (!posts.length) { root.closest('section').remove(); return; }
    const card = p => `<a class="ig-card" href="${esc(p.href)}" target="_blank" rel="noopener" aria-label="Open post on Instagram">
        <img src="${esc(p.img)}" alt="Voilà on Instagram" loading="lazy" draggable="false">
        ${p.reel ? '<span class="ig-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.6-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5z"/></svg></span>' : ''}
        <span class="ig-over">${I.ig}<em>View post</em></span>
      </a>`;
    const html = posts.map(card).join('');
    track.innerHTML = html + html + html;
    InfiniteLoop(root, track, .6);
  }

  function initAbout() {
    initInstagram();
    // add short Google reviews to the testimonial loop, word for word
    const qslider = $('.quote-slider');
    if (qslider) {
      const extra = (D.reviews || []).filter(r => r.text.length >= 60 && r.text.length <= 240);
      qslider.querySelector('.q-dots').insertAdjacentHTML('beforebegin', extra.map(r => `<blockquote class="quote"><p>“${esc(r.text)}”</p><cite>${esc(r.name)} · Google review</cite></blockquote>`).join(''));
    }
    const qs = $$('.quote'), dots = $('.q-dots'); let qi = 0, qt;
    if (qs.length) {
      dots.innerHTML = qs.map((_, i) => `<button aria-label="Testimonial ${i + 1}" class="${i ? '' : 'on'}"></button>`).join('');
      const show = i => { qi = i; qs.forEach((q, j) => q.classList.toggle('on', j === i)); $$('button', dots).forEach((d, j) => d.classList.toggle('on', j === i)); clearInterval(qt); qt = setInterval(() => show((qi + 1) % qs.length), 6500); };
      dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show([...dots.children].indexOf(b)); });
      show(0);
    }
    const mv = $('.marquee-v'); if (mv) buildReviews(mv);
    const pimgs = $$('.process-media img');
    hasGSAP && $$('.step').forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 60%', end: 'bottom 60%', onToggle: st => { if (st.isActive) { $$('.step').forEach(x => x.classList.toggle('on', x === s)); pimgs.forEach((im, j) => im.classList.toggle('on', j === i)); } } }));
  }

  /* ==========================================================================
     CONTACT
     ========================================================================== */
  function initContact() {
    const f = $('#book-form'); if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = n => (f.elements[n]?.value || '').trim();
      const msg = `Hi Voilà! I'd like to book a free design consultation.\n\nName: ${v('name')}\nPhone: ${v('phone')}\nEmail: ${v('email')}\nProperty: ${v('type')}\nKey collection / timeline: ${v('when')}\n\n${v('message')}`;
      window.open(`https://wa.me/6580330071?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  /* ---------------- boot ---------------- */
  const boot = () => {
    const pageInit = { home: initHome, portfolio: initPortfolio, project: initProject, about: initAbout, contact: initContact }[page];
    try { pageInit && pageInit(); } catch (err) { console.error(err); }
    reveals(); watchAnim();
    // page-hero entrance
    if (hasGSAP && $('.rise-hero')) {
      gsap.fromTo('.rise-hero .split-line>span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .1, delay: .2 });
      gsap.fromTo('.rise-hero [data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .5 });
      gsap.fromTo('.rise-stage', { opacity: 0, y: 120 }, { opacity: 1, y: 0, duration: 2, ease: 'expo.out', delay: .2 });
    }
    if (hasGSAP && $('.pf-hero')) {
      gsap.fromTo('.pf-hero .split-line>span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .1, delay: .2 });
      gsap.fromTo('.pf-hero [data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .5 });
      gsap.fromTo('.wall', { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.8, ease: 'expo.out', delay: .4 });
    }
    if (hasGSAP && $('.page-hero')) {
      gsap.fromTo('.page-hero .bg img', { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out', delay: .3 });
      gsap.fromTo('.page-hero .split-line>span', { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .1, delay: .5 });
      gsap.fromTo('.page-hero [data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .8 });
      gsap.to('.page-hero .bg img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    if (hasGSAP) { addEventListener('load', () => ScrollTrigger.refresh()); }
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
})();
