/* Bóng Studio – tương tác cửa hàng mẫu (không gửi dữ liệu đi đâu) */
(function () {
  'use strict';
  var B = window.BONG;
  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var HAS_GSAP = typeof window.gsap !== 'undefined';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 768px)');
  var byId = {}; B.P.forEach(function (p) { byId[p.id] = p; });
  var catName = {}; B.CATS.forEach(function (c) { catName[c.id] = c.name; });
  var flashById = {}; B.FLASH.forEach(function (f) { flashById[f.id] = f; });
  var svcById = {}; B.SERVICES.forEach(function (s) { svcById[s.id] = s; });
  var PROMO = { ceramic: 0.8 };   /* banner: phủ ceramic giảm 20% tháng 10 */

  /* ---------- Utils ---------- */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function dec1(n) { return n.toFixed(1).replace('.', ','); }
  function soldFmt(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',').replace(',0', '') + 'k' : String(n); }
  function pct(p) { return p.old ? Math.round((1 - p.price / p.old) * 100) : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  function stars(r, cls) { return '<span class="stars' + (cls ? ' ' + cls : '') + '" role="img" aria-label="' + dec1(r) + ' trên 5 sao"><i style="width:' + (r / 5 * 100) + '%"></i></span>'; }
  function imgTag(id, w, h, alt, extra) { return '<img src="' + B.img(id, w, h) + '" width="' + w + '" height="' + h + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async"' + (extra || '') + '>'; }
  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };
  function hydrateIcons(scope) { $$('[data-i]', scope).forEach(function (el) { if (!el.firstChild) el.innerHTML = B.icon(el.getAttribute('data-i')); }); }
  function tween(from, to, dur, cb, done) {
    if (REDUCED) { cb(to); if (done) done(); return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cb(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }

  hydrateIcons();

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2400);
  }

  /* ---------- Overlay helpers ---------- */
  var openStack = [];
  function lockScroll(on) {
    if (on) { var sw = window.innerWidth - root.clientWidth; if (sw > 0) body.style.paddingRight = sw + 'px'; body.classList.add('is-locked'); }
    else { body.classList.remove('is-locked'); body.style.paddingRight = ''; }
  }
  function openLayer(el, opener, focusSel) {
    if (openStack.indexOf(el) === -1) openStack.push(el);
    el._opener = opener || doc.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    setTimeout(function () { var f = $(focusSel || 'button, a, input', el); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeLayer(el, noFocus) {
    var i = openStack.indexOf(el); if (i > -1) openStack.splice(i, 1);
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    if (!openStack.length) lockScroll(false);
    if (!noFocus && el._opener && el._opener.focus) el._opener.focus({ preventScroll: true });
  }
  function closeAllLayers() {
    if (mnav.classList.contains('is-open')) closeMenu(true);
    if (drawer.classList.contains('is-open')) closeCart(true);
    if (qv.classList.contains('is-open')) closeQV(true);
    if (filtersEl.classList.contains('is-open')) closeFilters(true);
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!suggestEl.hidden) { hideSuggest(); return; }
    if (catPanel && !catPanel.hidden) { setCatMenu(false); return; }
    if (!openStack.length) return;
    var top = openStack[openStack.length - 1];
    if (top === qv) closeQV(); else if (top === drawer) closeCart(); else if (top === filtersEl) closeFilters(); else closeMenu();
  });

  function scrollToId(id, after) {
    var t = id === 'top' ? null : doc.getElementById(id);
    if (id === 'top') window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    else if (t) t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    if (after) setTimeout(after, 650);
  }

  /* =========================================================
     HEADER: sticky shadow, back-to-top
     ========================================================= */
  var hdr = $('#hdr'), totop = $('[data-totop]'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    hdr.classList.toggle('is-stuck', y > 40);
    totop.classList.toggle('is-show', y > 900);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  totop.addEventListener('click', function () { scrollToId('top'); });
  onScroll();

  /* =========================================================
     CATEGORY MENU (desktop) + MOBILE MENU
     ========================================================= */
  function countIn(cat) { return cat === 'all' ? B.P.length : B.P.filter(function (p) { return p.cat === cat; }).length; }
  var catPanel = $('[data-catmenu-panel]'), catBtn = $('[data-catmenu-btn]'), catWrap = $('[data-catmenu]');
  catPanel.innerHTML = B.CATS.filter(function (c) { return c.id !== 'all'; }).map(function (c) {
    return '<a href="#cua-hang" data-cat-link="' + c.id + '">' + imgTag(c.img, 60, 60, '') + '<span>' + c.name + '</span><small>' + countIn(c.id) + '</small></a>';
  }).join('') + '<hr>' + B.SERVICES.map(function (s) {
    return '<a href="#dat-lich" data-book="' + s.id + '">' + imgTag(s.img, 60, 60, '') + '<span>' + s.name + '</span></a>';
  }).join('');
  var catHoverT;
  function setCatMenu(on) { catPanel.hidden = !on; catBtn.setAttribute('aria-expanded', on); }
  catBtn.addEventListener('click', function () { setCatMenu(catPanel.hidden); });
  catWrap.addEventListener('mouseenter', function () { clearTimeout(catHoverT); setCatMenu(true); });
  catWrap.addEventListener('mouseleave', function () { catHoverT = setTimeout(function () { setCatMenu(false); }, 150); });
  doc.addEventListener('click', function (e) { if (!catPanel.hidden && !catWrap.contains(e.target)) setCatMenu(false); });

  var mnav = $('[data-mnav]'), menuBtn = $('[data-open-menu]');
  $('[data-mnav-cats]').innerHTML = B.CATS.filter(function (c) { return c.id !== 'all'; }).map(function (c) {
    return '<a href="#cua-hang" data-cat-link="' + c.id + '">' + imgTag(c.img, 160, 160, '') + c.name + '</a>';
  }).join('');
  function openMenu() { openLayer(mnav, menuBtn, '[data-close-menu]'); menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu(noFocus) { closeLayer(mnav, noFocus); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', openMenu);
  $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', function () { closeMenu(); }); });
  mnav.addEventListener('click', function (e) { if (e.target === mnav) closeMenu(); });

  /* =========================================================
     BANNER SLIDER
     ========================================================= */
  (function () {
    var sl = $('[data-slider]'), track = $('[data-slider-track]'), slides = $$('.slide', track), dotsW = $('[data-slider-dots]');
    var idx = 0, timer = 0, hover = false, n = slides.length;
    dotsW.innerHTML = slides.map(function (_, i) { return '<button type="button" aria-label="Xem banner ' + (i + 1) + '"' + (i === 0 ? ' class="is-on" aria-current="true"' : '') + '></button>'; }).join('');
    var dots = $$('button', dotsW);
    function go(i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (d, j) { d.classList.toggle('is-on', j === idx); if (j === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j !== idx); $$('a, button', s).forEach(function (a) { a.tabIndex = j === idx ? 0 : -1; }); });
    }
    function restart() { clearInterval(timer); if (!REDUCED) timer = setInterval(function () { if (!hover && !doc.hidden) go(idx + 1); }, 5500); }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); restart(); }); });
    $('[data-slide-prev]').addEventListener('click', function () { go(idx - 1); restart(); });
    $('[data-slide-next]').addEventListener('click', function () { go(idx + 1); restart(); });
    sl.addEventListener('mouseenter', function () { hover = true; });
    sl.addEventListener('mouseleave', function () { hover = false; });
    sl.addEventListener('focusin', function () { hover = true; });
    sl.addEventListener('focusout', function () { hover = false; });
    var sx = null, sy = 0;
    sl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    sl.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    window.addEventListener('load', function () { $$('img[loading="lazy"]', track).forEach(function (im) { im.loading = 'eager'; }); });
    go(0); restart();
  })();

  /* =========================================================
     CATEGORY TILES
     ========================================================= */
  $('[data-ctiles]').innerHTML = B.CATS.filter(function (c) { return c.id !== 'all'; }).map(function (c) {
    return '<a href="#cua-hang" class="ctile" data-cat-link="' + c.id + '"><span class="ctile__img">' + imgTag(c.img, 240, 240, c.name) + '</span>' + c.name + '</a>';
  }).join('') + B.SERVICES.slice(0, 3).map(function (s) {
    return '<a href="#dich-vu" class="ctile"><span class="ctile__img">' + imgTag(s.img, 240, 240, s.alt) + '<span class="ctile__tag">Dịch vụ</span></span>' + s.short + '</a>';
  }).join('');

  /* =========================================================
     PRODUCT CARDS
     ========================================================= */
  function cardHTML(p, flash) {
    var price = flash ? flash.price : p.price, old = flash ? (p.old || p.price) : p.old;
    var d = old ? Math.round((1 - price / old) * 100) : 0;
    var meta = '<div class="pcard__meta">' + stars(p.rate) + '<span>' + dec1(p.rate) + '</span><i class="dot"></i><span>Đã bán ' + soldFmt(p.sold) + '</span></div>';
    var bar = '';
    if (flash) {
      var r = flash.sold / flash.stock, left = flash.stock - flash.sold;
      bar = '<div class="fbar' + (r < .5 ? ' is-low' : '') + '" aria-label="Đã bán ' + flash.sold + ' trên ' + flash.stock + ' suất"><i style="width:' + Math.max(12, r * 100) + '%"></i><span>' + (r >= .7 ? B.icon('fire') + 'Chỉ còn ' + left : 'Đã bán ' + flash.sold) + '</span></div>';
    }
    return '<article class="pcard' + (flash ? ' pcard--flash' : '') + '" data-id="' + p.id + '">' +
      (d ? '<span class="pcard__off">-' + d + '%</span>' : '') +
      '<a href="#cua-hang" class="pcard__media" data-qv-open="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '">' + B.packshot(p) + '</a>' +
      '<div class="pcard__body">' +
      '<span class="pcard__br">' + p.br + '</span>' +
      '<h3 class="pcard__name"><button type="button" data-qv-open="' + p.id + '">' + esc(p.name) + '</button></h3>' +
      '<div class="pcard__price"><b>' + fmt(price) + '</b>' + (old ? '<s>' + fmt(old) + '</s>' : '') + '</div>' +
      (flash ? bar : meta + (p.gift ? '<span class="pcard__gift">' + B.icon('gift') + p.gift + '</span>' : '')) +
      '</div>' +
      '<button type="button" class="pcard__add" data-add="' + p.id + '"' + (flash ? ' data-flash' : '') + ' aria-label="Thêm ' + esc(p.name) + ' vào giỏ">' + B.icon('cart') + '</button>' +
      '</article>';
  }

  /* Flash deal row */
  $('[data-flash]').innerHTML = B.FLASH.map(function (f) { return cardHTML(byId[f.id], f); }).join('');
  $$('[data-row-prev], [data-row-next]').forEach(function (b) {
    b.addEventListener('click', function () {
      var row = $('[data-row="' + (b.getAttribute('data-row-prev') || b.getAttribute('data-row-next')) + '"]');
      var dir = b.hasAttribute('data-row-next') ? 1 : -1;
      var max = row.scrollWidth - row.clientWidth - 2;
      if (dir > 0 && row.scrollLeft >= max) row.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && row.scrollLeft <= 2) row.scrollTo({ left: max, behavior: 'smooth' });
      else row.scrollBy({ left: dir * row.clientWidth * .84, behavior: 'smooth' });
    });
  });

  /* Countdown: khung flash kết thúc 12:00, 18:00, 24:00 */
  var cdH = $('[data-cd-h]'), cdM = $('[data-cd-m]'), cdS = $('[data-cd-s]');
  function tick() {
    var now = new Date(), end = new Date(now);
    var h = now.getHours(), endH = h < 12 ? 12 : h < 18 ? 18 : 24;
    end.setHours(endH, 0, 0, 0);
    var s = Math.max(0, Math.floor((end - now) / 1000));
    var p = [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(function (v) { return (v < 10 ? '0' : '') + v; });
    if (cdH.textContent !== p[0]) cdH.textContent = p[0];
    if (cdM.textContent !== p[1]) cdM.textContent = p[1];
    cdS.textContent = p[2];
  }
  tick(); setInterval(tick, 1000);

  /* =========================================================
     SHOP LISTING
     ========================================================= */
  var state = { cat: 'all', q: '', price: 'all', rate: 0, onsale: false, gift: false, sort: 'hot', shown: 0 };
  var grid = $('[data-grid]'), emptyEl = $('[data-empty]'), resultEl = $('[data-result]'), moreWrap = $('[data-more-wrap]'), moreBtn = $('[data-more]');
  var fcats = $('[data-fcats]'), mchips = $('[data-mchips]');
  function pageSize() { return mqMobile.matches ? 8 : 10; }

  fcats.innerHTML = B.CATS.map(function (c) { return '<li><button type="button" data-cat="' + c.id + '"' + (c.id === 'all' ? ' class="is-on"' : '') + '><span>' + c.name + '</span><small>' + countIn(c.id) + '</small></button></li>'; }).join('');
  mchips.innerHTML = B.CATS.map(function (c) { return '<button type="button" data-cat="' + c.id + '"' + (c.id === 'all' ? ' class="is-on"' : '') + '>' + (c.id === 'all' ? 'Tất cả' : c.name) + '</button>'; }).join('');
  [fcats, mchips].forEach(function (w) { w.addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (b) setCat(b.getAttribute('data-cat')); }); });

  function setCat(id) {
    state.cat = id;
    $$('[data-cat]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-cat') === id); });
    var chip = $('[data-mchips] [data-cat="' + id + '"]');
    if (chip && chip.scrollIntoView && mqMobile.matches) mchips.scrollTo({ left: chip.offsetLeft - 12, behavior: 'smooth' });
    renderGrid(true);
  }
  function matchQ(p, q) {
    if (!q) return true;
    var hay = norm(p.name + ' ' + p.spec + ' ' + catName[p.cat] + ' ' + p.br);
    return norm(q).split(/\s+/).filter(Boolean).every(function (t) { return hay.indexOf(t) > -1; });
  }
  function filtered() {
    var range = state.price === 'all' ? null : state.price.split('-').map(Number);
    var list = B.P.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.onsale && !p.old) return false;
      if (state.gift && !p.gift) return false;
      if (state.rate && p.rate < state.rate) return false;
      if (range && (p.price < range[0] || p.price >= range[1])) return false;
      return matchQ(p, state.q.trim());
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'asc') return a.price - b.price;
      if (s === 'desc') return b.price - a.price;
      if (s === 'sale') return pct(b) - pct(a) || b.sold - a.sold;
      if (s === 'sold') return b.sold - a.sold;
      return b.hot - a.hot || b.sold - a.sold;
    });
    return list;
  }
  function activeFilterCount() { return (state.price !== 'all') + (state.rate ? 1 : 0) + state.onsale + state.gift + (state.cat !== 'all'); }
  function renderGrid(animate, keepShown) {
    var list = filtered();
    if (!keepShown) state.shown = pageSize();
    var vis = list.slice(0, state.shown);
    grid.innerHTML = vis.map(function (p) { return cardHTML(p); }).join('');
    emptyEl.hidden = list.length > 0;
    var rest = list.length - vis.length;
    moreWrap.hidden = rest <= 0;
    moreBtn.textContent = 'Xem thêm ' + rest + ' sản phẩm';
    var q = state.q.trim();
    var txt = q ? 'Tìm thấy <b>' + list.length + '</b> sản phẩm cho “' + esc(q) + '”<button type="button" data-clear-q>Xoá tìm kiếm</button>'
      : '<b>' + list.length + '</b> sản phẩm' + (state.cat !== 'all' ? ' trong ' + catName[state.cat] : '');
    resultEl.innerHTML = txt;
    var n = activeFilterCount(), nb = $('[data-filter-n]'); nb.hidden = !n; nb.textContent = n;
    if (animate && HAS_GSAP && !REDUCED) gsap.fromTo($$('.pcard', grid), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, stagger: .025, ease: 'power2.out', clearProps: 'transform,opacity' });
  }
  moreBtn.addEventListener('click', function () {
    var before = state.shown; state.shown += pageSize(); renderGrid(false, true);
    if (HAS_GSAP && !REDUCED) gsap.fromTo($$('.pcard', grid).slice(before), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, stagger: .03, clearProps: 'transform,opacity' });
  });
  resultEl.addEventListener('click', function (e) { if (e.target.closest('[data-clear-q]')) setQuery(''); });
  $$('[data-sort]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.sort = b.getAttribute('data-sort');
      $$('[data-sort]').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
      renderGrid(true);
    });
  });
  $$('[data-price]').forEach(function (r) { r.addEventListener('change', function () { state.price = r.value; renderGrid(true); }); });
  $$('[data-rate]').forEach(function (r) { r.addEventListener('change', function () { state.rate = +r.value; renderGrid(true); }); });
  $('[data-onsale]').addEventListener('change', function (e) { state.onsale = e.target.checked; renderGrid(true); });
  $('[data-hasgift]').addEventListener('change', function (e) { state.gift = e.target.checked; renderGrid(true); });
  function resetAll() {
    state.price = 'all'; state.rate = 0; state.onsale = false; state.gift = false;
    $('[data-price][value="all"]').checked = true; $('[data-rate][value="0"]').checked = true;
    $('[data-onsale]').checked = false; $('[data-hasgift]').checked = false;
    state.q = ''; searchInput.value = '';
    setCat('all');
  }
  $$('[data-reset]').forEach(function (b) { b.addEventListener('click', resetAll); });
  mqMobile.addEventListener && mqMobile.addEventListener('change', function () { renderGrid(false); });

  /* Bộ lọc dạng sheet trên mobile/tablet */
  var filtersEl = $('[data-filters]'), fsBg = $('.fsheet-bg');
  function openFilters(opener) { openLayer(filtersEl, opener, '[data-close-filters]'); fsBg.classList.add('is-open'); }
  function closeFilters(noFocus) { closeLayer(filtersEl, noFocus); fsBg.classList.remove('is-open'); }
  $('[data-open-filters]').addEventListener('click', function (e) { openFilters(e.currentTarget); });
  $$('[data-close-filters]').forEach(function (b) { b.addEventListener('click', function () { if (filtersEl.classList.contains('is-open')) closeFilters(); }); });

  /* =========================================================
     HEADER SEARCH + SUGGESTIONS
     ========================================================= */
  var searchInput = $('[data-search]'), suggestEl = $('[data-suggest]'), hsearch = $('[data-hsearch]'), sgActive = -1;
  var HOT = ['ceramic', 'khăn microfiber', 'rửa xe', 'sáp carnauba', 'dưỡng da ghế', 'lau kính', 'xô rửa xe'];
  function hl(name, q) {
    var t = norm(q).split(/\s+/).filter(Boolean); if (!t.length) return esc(name);
    var n = norm(name), out = '', i = 0;
    var marks = new Array(name.length).fill(false);
    t.forEach(function (tok) { var k = n.indexOf(tok); while (k > -1) { for (var j = k; j < k + tok.length; j++) marks[j] = true; k = n.indexOf(tok, k + tok.length); } });
    for (i = 0; i < name.length; i++) {
      if (marks[i] && (i === 0 || !marks[i - 1])) out += '<mark>';
      out += esc(name[i]);
      if (marks[i] && (i === name.length - 1 || !marks[i + 1])) out += '</mark>';
    }
    return out;
  }
  function showSuggest() {
    var q = searchInput.value.trim(), html = '';
    if (!q) {
      html = '<p class="suggest__h">Từ khoá phổ biến</p><div class="suggest__kw">' + HOT.map(function (k) { return '<button type="button" data-kw="' + k + '">' + k + '</button>'; }).join('') + '</div>';
      var top = B.P.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 3);
      html += '<p class="suggest__h">Bán chạy</p>' + top.map(function (p) { return sgItem(p, ''); }).join('');
    } else {
      var prods = B.P.filter(function (p) { return matchQ(p, q); }).sort(function (a, b) { return b.sold - a.sold; });
      var svcs = B.SERVICES.filter(function (s) { return norm(s.name + ' ' + s.desc).indexOf(norm(q)) > -1; });
      if (svcs.length) html += '<p class="suggest__h">Dịch vụ</p>' + svcs.slice(0, 2).map(function (s) {
        var from = Math.round(s.price.sedan * (PROMO[s.id] || 1));
        return '<button type="button" class="sg" data-sg-book="' + s.id + '"><span class="sg__pk"><img src="' + B.img(s.img, 88, 88) + '" alt="" width="44" height="44"></span><span class="sg__name">' + hl(s.name, q) + '<small>Đặt lịch · ' + s.time + '</small></span><span class="sg__price">từ ' + fmt(from) + '</span></button>';
      }).join('');
      if (prods.length) html += '<p class="suggest__h">Sản phẩm</p>' + prods.slice(0, 5).map(function (p) { return sgItem(p, q); }).join('');
      if (!prods.length && !svcs.length) html += '<p class="suggest__none">Không có kết quả cho “' + esc(q) + '”. Thử “ceramic”, “khăn” hoặc “kính”.</p>';
      else html += '<button type="button" class="suggest__all" data-sg-all>Xem tất cả ' + prods.length + ' sản phẩm cho “' + esc(q) + '”</button>';
    }
    suggestEl.innerHTML = html; suggestEl.hidden = false; sgActive = -1;
    searchInput.setAttribute('aria-expanded', 'true');
  }
  function sgItem(p, q) {
    return '<button type="button" class="sg" data-sg-p="' + p.id + '"><span class="sg__pk">' + B.packshot(p) + '</span><span class="sg__name">' + hl(p.name, q) + '<small>' + p.br + ' · Đã bán ' + soldFmt(p.sold) + '</small></span><span class="sg__price">' + fmt(p.price) + '</span></button>';
  }
  function hideSuggest() { suggestEl.hidden = true; searchInput.setAttribute('aria-expanded', 'false'); }
  function setQuery(v) {
    state.q = v; searchInput.value = v;
    if (v) { state.cat = 'all'; $$('[data-cat]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-cat') === 'all'); }); }
    renderGrid(true);
  }
  function runSearch(v) {
    hideSuggest(); searchInput.blur();
    setQuery(v.trim());
    closeAllLayers();
    setTimeout(function () { scrollToId('cua-hang'); }, 30);
  }
  searchInput.addEventListener('focus', showSuggest);
  searchInput.addEventListener('input', function () { showSuggest(); if (!searchInput.value.trim() && state.q) setQuery(''); });
  searchInput.addEventListener('keydown', function (e) {
    var items = $$('.sg, .suggest__all', suggestEl);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (suggestEl.hidden) showSuggest();
      e.preventDefault(); if (!items.length) return;
      sgActive = (sgActive + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (it, i) { it.classList.toggle('is-act', i === sgActive); });
      items[sgActive].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && sgActive > -1 && items[sgActive]) { e.preventDefault(); items[sgActive].click(); }
  });
  $('[data-search-form]').addEventListener('submit', function (e) { e.preventDefault(); runSearch(searchInput.value); });
  suggestEl.addEventListener('mousedown', function (e) { e.preventDefault(); });
  suggestEl.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-sg-p]'))) { hideSuggest(); openQV(+b.getAttribute('data-sg-p'), searchInput); }
    else if ((b = e.target.closest('[data-sg-book]'))) { hideSuggest(); setBooking(b.getAttribute('data-sg-book')); scrollToId('dat-lich'); }
    else if (e.target.closest('[data-sg-all]')) runSearch(searchInput.value);
    else if ((b = e.target.closest('[data-kw]'))) runSearch(b.getAttribute('data-kw'));
  });
  doc.addEventListener('click', function (e) { if (!suggestEl.hidden && !hsearch.contains(e.target)) hideSuggest(); });
  $$('.hsearch__hot [data-kw]').forEach(function (b) { b.addEventListener('click', function () { runSearch(b.getAttribute('data-kw')); }); });

  /* =========================================================
     CART (localStorage)
     ========================================================= */
  var CART_KEY = 'bongstudio.cart.v2';
  var cart = (store.get(CART_KEY, []) || []).filter(function (it) { return it && byId[it.id] && it.qty > 0 && (!it.f || flashById[it.id]); });
  var drawer = $('[data-drawer]');
  function key(it) { return it.id + (it.f ? 'f' : it.c ? 'c' : ''); }
  function unit(it) { return it.f ? flashById[it.id].price : byId[it.id].price; }
  function totals() {
    var sub = 0, cbSub = 0, cbN = 0, n = 0;
    cart.forEach(function (it) { sub += unit(it) * it.qty; n += it.qty; if (it.c) { cbSub += unit(it) * it.qty; cbN += it.qty; } });
    var disc = cbN >= 3 ? Math.round(cbSub * .1 / 1000) * 1000 : 0;
    var after = sub - disc, ship = after >= B.SHIP_FREE_AT || after === 0 ? 0 : 30000;
    return { n: n, sub: sub, disc: disc, ship: ship, total: after + ship, after: after };
  }
  function saveCart() { store.set(CART_KEY, cart); }
  function addToCart(id, qty, opts) {
    opts = opts || {};
    var probe = { id: id, f: !!opts.flash, c: !!opts.combo }, k = key(probe);
    var it = cart.filter(function (x) { return key(x) === k; })[0];
    if (!it) { it = probe; it.qty = 0; cart.push(it); }
    it.qty += qty;
    if (it.f && it.qty > 2) { it.qty = 2; toast('Giá Flash deal tối đa 2 sản phẩm mỗi khách'); }
    saveCart(); renderCart();
    return it;
  }
  function giftMsg(total) {
    var left = B.GIFT_AT - total;
    return left > 0 ? 'Mua thêm <b>' + fmt(left) + '</b> để được tặng bộ 5 khăn microfiber' : 'Bạn được tặng <b>bộ 5 khăn microfiber</b> cho đơn này';
  }
  function setBar(el, r) { el.style.transform = 'scaleX(' + Math.max(0, Math.min(1, r)) + ')'; }
  function renderCart() {
    var t = totals();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = t.n > 99 ? '99+' : t.n; b.classList.toggle('is-zero', t.n === 0); });
    var html = cart.map(function (it) {
      var p = byId[it.id], k = key(it);
      return '<li class="citem"><div class="citem__pk">' + B.packshot(p) + '</div><div><p class="citem__name">' + esc(p.name) + (it.f ? ' <small style="color:var(--sale);font-weight:600">· Flash deal</small>' : it.c ? ' <small style="color:var(--brand-ink);font-weight:600">· Combo</small>' : '') + '</p><p class="citem__price">' + fmt(unit(it) * it.qty) + '</p></div>' +
        '<div class="citem__side"><button type="button" class="citem__rm" data-rm="' + k + '" aria-label="Xoá ' + esc(p.name) + '">' + B.icon('trash') + '</button>' +
        '<div class="qty"><button type="button" data-dec="' + k + '" aria-label="Giảm số lượng">' + B.icon('minus') + '</button><span aria-live="polite">' + it.qty + '</span><button type="button" data-inc="' + k + '" aria-label="Tăng số lượng">' + B.icon('plus') + '</button></div></div></li>';
    }).join('');
    if (cart.length && t.after >= B.GIFT_AT) html += '<li class="citem is-gift"><div class="citem__pk">' + B.packshot(byId[13]) + '</div><div><p class="citem__name">Bộ 5 khăn microfiber đa năng 40×40cm</p><p class="citem__price">0₫</p></div><div></div></li>';
    $('[data-citems]').innerHTML = html;
    $('[data-cempty]').hidden = cart.length > 0;
    $('[data-cfoot]').hidden = cart.length === 0;
    $('[data-cart-gift]').hidden = cart.length === 0;
    var foot = $('[data-cfoot]');
    foot.innerHTML = '<div class="row"><span>Tạm tính (' + t.n + ' sản phẩm)</span><span>' + fmt(t.sub) + '</span></div>' +
      (t.disc ? '<div class="row" style="color:var(--brand-ink)"><span>Giảm combo 10%</span><span>−' + fmt(t.disc) + '</span></div>' : '') +
      '<div class="row row--muted"><span>Phí giao hàng</span><span>' + (t.ship ? fmt(t.ship) + ' (miễn phí từ 500.000₫)' : 'Miễn phí') + '</span></div>' +
      '<div class="row"><span><b style="color:var(--ink);font-size:14px">Tổng cộng</b></span><b>' + fmt(t.total) + '</b></div>' +
      '<button class="btn btn--primary btn--block" type="button" data-checkout>Tiến hành đặt hàng</button>';
    $('[data-co-total]').textContent = fmt(t.total);
    $('[data-cart-gift-msg]').innerHTML = giftMsg(t.after);
    $('[data-cart-gift]').classList.toggle('is-full', t.after >= B.GIFT_AT);
    setBar($('[data-cart-gift-bar]'), t.after / B.GIFT_AT);
  }
  function findK(k) { return cart.filter(function (x) { return key(x) === k; })[0]; }
  $('[data-citems]').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k, it;
    if ((k = b.getAttribute('data-inc')) && (it = findK(k))) { it.qty += 1; if (it.f && it.qty > 2) { it.qty = 2; toast('Giá Flash deal tối đa 2 sản phẩm mỗi khách'); } }
    else if ((k = b.getAttribute('data-dec')) && (it = findK(k))) it.qty -= 1;
    else if ((k = b.getAttribute('data-rm')) && (it = findK(k))) { it.qty = 0; toast('Đã xoá khỏi giỏ hàng'); }
    else return;
    cart = cart.filter(function (x) { return x.qty > 0; });
    saveCart(); renderCart();
  });
  function showView(name) {
    $$('.drawer__view', drawer).forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    $('[data-drawer-title]').textContent = name === 'checkout' ? 'Thông tin giao hàng' : name === 'done' ? 'Hoàn tất đơn hàng' : 'Giỏ hàng của bạn';
  }
  function openCart(opener) { showView('cart'); renderCart(); openLayer(drawer, opener, '[data-close-cart]'); }
  function closeCart(noFocus) { closeLayer(drawer, noFocus); }
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { openCart(b); }); });
  drawer.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close-cart]'); if (c && c.tagName !== 'A') { closeCart(); return; }
    if (e.target.closest('[data-checkout]')) { showView('checkout'); var f = $('[data-co] input'); if (f) f.focus(); }
  });
  $('[data-back]').addEventListener('click', function () { showView('cart'); });

  /* Validation */
  var PHONE_RE = /^0(3|5|7|8|9)\d{8}$/;
  function fieldErr(input, msg) {
    var f = input.closest('.fld'); if (!f) return;
    var e = $('.err', f);
    if (msg) { f.classList.add('is-err'); if (!e) { e = doc.createElement('span'); e.className = 'err'; f.appendChild(e); } e.textContent = msg; input.setAttribute('aria-invalid', 'true'); }
    else { f.classList.remove('is-err'); if (e) e.remove(); input.removeAttribute('aria-invalid'); }
  }
  function validate(form, rules) {
    var ok = true, first = null;
    Object.keys(rules).forEach(function (name) {
      var inp = form.elements[name]; if (!inp) return;
      var msg = rules[name](inp.value.trim());
      fieldErr(inp, msg);
      if (msg && ok) { ok = false; first = inp; }
    });
    if (first) first.focus();
    return ok;
  }
  var RULES = {
    name: function (v) { return v.length < 2 ? 'Vui lòng nhập họ tên.' : ''; },
    phone: function (v) { v = v.replace(/[\s.\-]/g, ''); return !v ? 'Vui lòng nhập số điện thoại.' : PHONE_RE.test(v) ? '' : 'Số điện thoại chưa đúng (10 số, bắt đầu 03/05/07/08/09).'; }
  };
  [$('[data-co]'), $('[data-booking]')].forEach(function (form) {
    form.addEventListener('input', function (e) { if (e.target.closest('.fld.is-err')) fieldErr(e.target, ''); });
  });
  $('[data-co]').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.currentTarget;
    if (!validate(f, { name: RULES.name, phone: RULES.phone, address: function (v) { return v.length < 6 ? 'Vui lòng nhập địa chỉ nhận hàng.' : ''; } })) return;
    var code = 'BS' + String(Math.floor(100000 + Math.random() * 900000));
    var pay = f.elements.pay.value === 'bank' ? 'chuyển khoản (nhân viên sẽ gửi thông tin tài khoản)' : 'thanh toán khi nhận hàng';
    $('[data-done-msg]').innerHTML = 'Cảm ơn <b>' + esc(f.elements.name.value.trim()) + '</b>! Mã đơn <b>' + code + '</b> · tổng <b>' + $('[data-co-total]').textContent + '</b>, ' + pay + '. Shop sẽ gọi xác nhận trong ít phút.<br><small>(Đơn hàng minh hoạ – không có giao dịch thật.)</small>';
    cart = []; saveCart(); renderCart(); f.reset();
    showView('done');
  });

  /* Fly-to-cart */
  function cartTarget() {
    var bn = $('.bnav');
    return bn && window.getComputedStyle(bn).display !== 'none' ? $('.bnav [data-open-cart]') : $('.hdr [data-open-cart]');
  }
  function bump() {
    if (!HAS_GSAP || REDUCED) return;
    $$('[data-cart-count]').forEach(function (b) { gsap.fromTo(b, { scale: 1 }, { scale: 1.35, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true }); });
  }
  function flyToCart(src, id) {
    var target = cartTarget();
    if (!HAS_GSAP || REDUCED || !target) { bump(); return; }
    var card = src.closest('.pcard, .qv, .ci, .csum');
    var from = card ? ($('.pcard__media .pk-img, .qv__media .pk-img, .ci__pk .pk-img', card) || src) : src;
    var a = from.getBoundingClientRect(), t = target.getBoundingClientRect();
    var el = doc.createElement('div'); el.className = 'flyer'; el.innerHTML = B.packshot(byId[id]);
    body.appendChild(el);
    gsap.set(el, { x: a.left + a.width / 2 - 32, y: a.top + a.height / 2 - 38, scale: Math.min(1.6, Math.max(.6, a.width / 64)), opacity: 1 });
    var tl = gsap.timeline({ onComplete: function () { el.remove(); bump(); } });
    tl.to(el, { x: t.left + t.width / 2 - 32, duration: .7, ease: 'power1.inOut' }, 0)
      .to(el, { y: t.top + t.height / 2 - 38, duration: .7, ease: 'back.in(1.4)' }, 0)
      .to(el, { scale: .2, duration: .7, ease: 'power2.in' }, 0)
      .to(el, { opacity: 0, duration: .12 }, .6);
  }

  /* =========================================================
     QUICK VIEW (+ ảnh đánh giá)
     ========================================================= */
  var qv = $('[data-qv]'), qvBody = $('[data-qv-body]'), qvQty = 1, qvId = 0;
  function openQV(id, opener) {
    var p = byId[id]; if (!p) return;
    qvId = id; qvQty = 1;
    var d = pct(p);
    qvBody.innerHTML =
      '<div class="qv__media">' + (d ? '<span class="pcard__off">-' + d + '%</span>' : '') + B.packshot(p) + '</div>' +
      '<div class="qv__body">' +
      '<span class="pcard__br">' + p.br + ' · ' + catName[p.cat] + '</span>' +
      '<h3 id="qv-title">' + esc(p.name) + '</h3>' +
      '<div class="qv__meta">' + stars(p.rate) + '<span>' + dec1(p.rate) + '</span><span>·</span><span>' + num(p.rv) + ' đánh giá</span><span>·</span><span>Đã bán ' + soldFmt(p.sold) + '</span></div>' +
      '<div class="qv__price"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s><em>-' + d + '%</em>' : '') + '</div>' +
      (p.gift ? '<span class="pcard__gift">' + B.icon('gift') + p.gift + ' (số lượng có hạn)</span>' : '') +
      '<p class="qv__desc">' + esc(p.desc) + '</p>' +
      '<ul class="qv__spec">' + p.spec.split(' · ').map(function (s) { return '<li>' + B.icon('check') + '<span>' + esc(s.charAt(0).toUpperCase() + s.slice(1)) + '</span></li>'; }).join('') +
      '<li>' + B.icon('check') + '<span>Còn hàng tại 3 chi nhánh · giao nhanh 2 giờ nội ô Cần Thơ</span></li></ul>' +
      '<div class="qv__buy"><div class="qty"><button type="button" data-qv-dec aria-label="Giảm">' + B.icon('minus') + '</button><span data-qv-qty>1</span><button type="button" data-qv-inc aria-label="Tăng">' + B.icon('plus') + '</button></div>' +
      '<button type="button" class="btn btn--line" data-qv-add>' + B.icon('cart') + 'Thêm vào giỏ</button>' +
      '<button type="button" class="btn btn--primary" data-qv-buy>Mua ngay</button></div>' +
      '</div>';
    qvBody.className = 'qv';
    openLayer(qv, opener, '.modal__x');
  }
  function openPhoto(id, alt, opener) {
    qvBody.className = '';
    qvBody.innerHTML = '<img src="' + B.img(id, 1200, 800, 75) + '" width="1200" height="800" alt="' + esc(alt) + '" style="width:100%;height:auto;border-radius:10px">';
    openLayer(qv, opener, '.modal__x');
  }
  function closeQV(noFocus) { closeLayer(qv, noFocus); }
  $$('[data-close-qv]').forEach(function (b) { b.addEventListener('click', function () { closeQV(); }); });
  qvBody.addEventListener('click', function (e) {
    if (e.target.closest('[data-qv-inc]')) qvQty = Math.min(20, qvQty + 1);
    else if (e.target.closest('[data-qv-dec]')) qvQty = Math.max(1, qvQty - 1);
    else if (e.target.closest('[data-qv-add]')) {
      addToCart(qvId, qvQty); flyToCart(e.target.closest('[data-qv-add]'), qvId);
      toast('Đã thêm ' + qvQty + ' × “' + byId[qvId].name + '” vào giỏ');
      setTimeout(function () { closeQV(true); }, 380); return;
    } else if (e.target.closest('[data-qv-buy]')) {
      addToCart(qvId, qvQty); closeQV(true); openCart(); return;
    } else return;
    $('[data-qv-qty]', qvBody).textContent = qvQty;
  });

  /* =========================================================
     COMBO BUILDER
     ========================================================= */
  var combo = {}; Object.keys(B.COMBO_PRESET).forEach(function (k) { combo[k] = B.COMBO_PRESET[k]; });
  var comboList = $('[data-combo-list]');
  comboList.innerHTML = B.COMBO_IDS.map(function (id) {
    var p = byId[id];
    return '<div class="ci" data-ci="' + id + '" role="checkbox" tabindex="0" aria-checked="false" aria-label="' + esc(p.name) + ', ' + fmt(p.price) + '">' +
      '<span class="ci__check">' + B.icon('check') + '</span>' +
      '<span class="ci__pk">' + B.packshot(p) + '</span>' +
      '<span><span class="ci__name">' + esc(p.name) + '</span><span class="ci__price">' + fmt(p.price) + '</span></span>' +
      '<div class="qty"><button type="button" data-cdec aria-label="Giảm">' + B.icon('minus') + '</button><span data-cq>1</span><button type="button" data-cinc aria-label="Tăng">' + B.icon('plus') + '</button></div></div>';
  }).join('');
  var comboTotalShown = 0;
  function renderCombo() {
    var sub = 0, items = 0, lines = [];
    $$('.ci', comboList).forEach(function (el) {
      var id = +el.getAttribute('data-ci'), q = combo[id] || 0;
      el.classList.toggle('is-on', q > 0); el.setAttribute('aria-checked', q > 0);
      $('[data-cq]', el).textContent = q || 1;
      if (q) { sub += byId[id].price * q; items += q; lines.push('<li><span>' + q + ' × ' + esc(byId[id].name) + '</span><b>' + fmt(byId[id].price * q) + '</b></li>'); }
    });
    var disc = items >= 3 ? Math.round(sub * .1 / 1000) * 1000 : 0, total = sub - disc;
    $('[data-combo-items]').innerHTML = lines.length ? lines.join('') : '<li class="none">Chưa chọn sản phẩm – bấm vào sản phẩm bên cạnh để thêm.</li>';
    $('[data-combo-count]').textContent = items + ' sản phẩm';
    $('[data-combo-sub]').textContent = fmt(sub);
    $('[data-combo-disc]').textContent = '−' + fmt(disc);
    var totEl = $('[data-combo-total]'), from = comboTotalShown; comboTotalShown = total;
    tween(from, total, 450, function (v) { totEl.textContent = fmt(Math.round(v / 1000) * 1000); });
    $('[data-combo-disc-note]').textContent = items >= 3 ? '(−10%)' : '(chọn thêm ' + (3 - items) + ' món)';
    $('[data-gift-msg]').innerHTML = giftMsg(total);
    $('[data-gift]').classList.toggle('is-full', total >= B.GIFT_AT);
    setBar($('[data-gift-bar]'), total / B.GIFT_AT);
    $('[data-combo-add]').disabled = items === 0;
  }
  comboList.addEventListener('click', function (e) {
    var el = e.target.closest('.ci'); if (!el) return;
    var id = +el.getAttribute('data-ci');
    if (e.target.closest('[data-cinc]')) combo[id] = Math.min(9, (combo[id] || 0) + 1);
    else if (e.target.closest('[data-cdec]')) combo[id] = Math.max(0, (combo[id] || 0) - 1);
    else combo[id] = combo[id] ? 0 : 1;
    renderCombo();
  });
  comboList.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.classList.contains('ci')) {
      e.preventDefault(); var id = +e.target.getAttribute('data-ci'); combo[id] = combo[id] ? 0 : 1; renderCombo();
    }
  });
  $('[data-combo-add]').addEventListener('click', function (e) {
    var n = 0, first = 0;
    Object.keys(combo).forEach(function (id) { if (combo[id] > 0) { addToCart(+id, combo[id], { combo: true }); n += combo[id]; if (!first) first = +id; } });
    if (!n) return;
    flyToCart(e.currentTarget, first);
    toast('Đã thêm combo ' + n + ' sản phẩm vào giỏ' + (n >= 3 ? ' (đã giảm 10%)' : ''));
  });

  /* =========================================================
     SERVICES + PACKAGE TABLES
     ========================================================= */
  var size = 'sedan';
  function svcPrice(id, sz) { var s = svcById[id]; return s ? Math.round(s.price[sz] * (PROMO[id] || 1)) : 0; }
  $('[data-svcs]').innerHTML = B.SERVICES.map(function (s) {
    var from = svcPrice(s.id, 'sedan');
    return '<article class="svc"><div class="svc__img">' + imgTag(s.img, 640, 400, s.alt) + '</div><div class="svc__body">' +
      '<h3>' + s.name + '</h3><p>' + s.desc + '</p>' +
      '<div class="svc__meta"><span>' + B.icon('clock') + s.time + '</span><span>' + B.icon('shield') + s.warranty + '</span></div>' +
      '<p class="svc__price">Giá từ<b>' + fmt(from) + '</b>' + (PROMO[s.id] ? ' <s>' + fmt(s.price.sedan) + '</s>' : '') + '</p>' +
      '<div class="svc__btns"><a href="#dat-lich" class="btn btn--primary btn--sm" data-book="' + s.id + '">Đặt lịch</a><a href="#bang-gia" class="btn btn--line btn--sm">Giá theo cỡ xe</a></div>' +
      '</div></article>';
  }).join('');

  var sizesW = $('[data-sizes]');
  sizesW.innerHTML = Object.keys(B.SIZES).map(function (k) {
    var s = B.SIZES[k];
    return '<button type="button" role="tab" class="size" data-size="' + k + '" aria-selected="' + (k === size) + '">' + imgTag(s.img, 160, 104, s.long) + '<span><b>' + s.long + '</b><small>' + s.note + '</small></span></button>';
  }).join('');
  var ptable = $('[data-ptable]'), stable = $('[data-stable]');
  function renderPtable() {
    var head = '<thead><tr><th scope="col">Giá cho xe <b style="color:var(--ink)">' + B.SIZES[size].long + '</b></th>' + B.PKGS.map(function (k) {
      var old = k.old && k.old[size];
      return '<th scope="col" class="' + (k.hot ? 'is-hot' : '') + '">' + (k.hot ? '<span class="pk__badge">' + k.note + '</span>' : '<span class="pk__badge" style="color:var(--muted);font-weight:500">' + k.note + '</span>') +
        '<span class="pk__name">Gói ' + k.name + '</span><span class="pk__alias">' + k.alias + '</span>' +
        '<b class="pk__price">' + fmt(k.price[size]) + '</b><span class="pk__old">' + (old ? '<s>' + fmt(old) + '</s><em>-' + Math.round((1 - k.price[size] / old) * 100) + '%</em>' : '&nbsp;') + '</span>' +
        '<a href="#dat-lich" class="btn btn--sm ' + (k.hot ? 'btn--primary' : 'btn--line') + '" data-book="' + k.id + '">Đặt lịch</a></th>';
    }).join('') + '</tr></thead>';
    var rows = '<tbody>' + B.FEATS.map(function (f) {
      return '<tr><td>' + f[0] + '</td>' + B.PKGS.map(function (k, i) {
        var v = f[i + 1];
        var val = v === true ? '<span class="yes" aria-label="Có">' + B.icon('check') + '</span>' : v === false ? '<span class="no" aria-label="Không">—</span>' : v;
        return '<td class="' + (k.hot ? 'is-hot' : '') + '">' + val + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';
    ptable.innerHTML = head + rows;
    var keys = Object.keys(B.SIZES);
    stable.innerHTML = '<thead><tr><th scope="col">Dịch vụ</th>' + keys.map(function (k) { return '<th scope="col" class="' + (k === size ? 'is-sel' : '') + '">' + B.SIZES[k].label + '</th>'; }).join('') + '<th scope="col">Thời gian</th><th scope="col">Bảo hành</th><th scope="col"><span class="sr">Đặt lịch</span></th></tr></thead><tbody>' +
      B.SERVICES.map(function (s) {
        return '<tr><td><b>' + s.name + '</b>' + (PROMO[s.id] ? '<br><small style="color:var(--sale)">Giảm 20% đến 31/10</small>' : '') + '</td>' + keys.map(function (k) {
          return '<td class="' + (k === size ? 'is-sel' : '') + '"><b>' + fmt(svcPrice(s.id, k)) + '</b>' + (PROMO[s.id] ? '<br><small><s>' + fmt(s.price[k]) + '</s></small>' : '') + '</td>';
        }).join('') + '<td>' + s.time + '</td><td><small>' + s.warranty + '</small></td><td><a href="#dat-lich" class="btn btn--line btn--sm" data-book="' + s.id + '">Đặt lịch</a></td></tr>';
      }).join('') + '</tbody>';
    $('[data-svc-size-note]').textContent = '– đang xem giá ' + B.SIZES[size].long;
  }
  function setSize(s, fromBooking) {
    size = s;
    $$('[data-size]', sizesW).forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-size') === s); });
    renderPtable();
    if (HAS_GSAP && !REDUCED) gsap.fromTo($$('.pk__price, .stable td.is-sel b'), { opacity: .2, y: -4 }, { opacity: 1, y: 0, duration: .35, stagger: .03, clearProps: 'all' });
    if (!fromBooking) { bkSize.value = s; updateBooking(); }
  }
  sizesW.addEventListener('click', function (e) { var b = e.target.closest('[data-size]'); if (b) setSize(b.getAttribute('data-size')); });
  renderPtable();

  /* =========================================================
     BOOKING
     ========================================================= */
  var bk = $('[data-booking]'), bkSvc = $('[data-bk-service]'), bkSize = $('[data-bk-size]'), bkHome = $('[data-bk-home]');
  var bkBranches = $('[data-bk-branches]'), daysW = $('[data-bk-days]'), slotsW = $('[data-bk-slots]');
  var SLOTS = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];
  var WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  var bkState = { day: 0, slot: '', branch: B.BRANCHES[0].id };
  bkBranches.innerHTML = B.BRANCHES.map(function (b, i) {
    return '<label class="bpick"><input type="radio" name="branch" value="' + b.id + '"' + (i === 0 ? ' checked' : '') + '><b>' + b.name.replace('Bóng Studio ', '') + '</b><small>' + b.addr.split(',').slice(0, 2).join(',') + '</small></label>';
  }).join('');
  var days = [];
  (function () {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 8; i++) { var x = new Date(d); x.setDate(d.getDate() + i); days.push(x); }
    daysW.innerHTML = days.map(function (x, i) {
      var lbl = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : WD[x.getDay()];
      return '<button type="button" class="day" role="radio" aria-checked="false" data-day="' + i + '"><small>' + lbl + '</small><b>' + pad(x.getDate()) + '/' + pad(x.getMonth() + 1) + '</b></button>';
    }).join('');
  })();
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function slotState(dayIdx, slot) {
    var d = days[dayIdx], hm = slot.split(':').map(Number);
    var t = new Date(d); t.setHours(hm[0], hm[1], 0, 0);
    if (t - Date.now() < 90 * 60000) return 'past';
    if (bkState.branch === 'binhthuy' && !bkHome.checked && d.getDay() === 0 && hm[0] >= 13) return 'off';
    var h = 0, s = d.getDate() + slot + (bkHome.checked ? 'home' : bkState.branch);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    return h % 4 === 0 ? 'full' : 'ok';
  }
  function renderSlots() {
    var firstOk = '';
    slotsW.innerHTML = SLOTS.map(function (s) {
      var st = slotState(bkState.day, s), dis = st !== 'ok';
      if (!dis && !firstOk) firstOk = s;
      var sub = st === 'full' ? 'Hết chỗ' : st === 'off' ? 'Nghỉ' : st === 'past' ? 'Đã qua' : 'Còn chỗ';
      return '<button type="button" class="slot" role="radio" data-slot="' + s + '" aria-checked="false"' + (dis ? ' disabled' : '') + '>' + s + '<small>' + sub + '</small></button>';
    }).join('');
    if (!bkState.slot || slotState(bkState.day, bkState.slot) !== 'ok') bkState.slot = firstOk;
    $$('.slot', slotsW).forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-slot') === bkState.slot); });
  }
  function selectDay(i) {
    bkState.day = i;
    $$('.day', daysW).forEach(function (b) { b.setAttribute('aria-checked', +b.getAttribute('data-day') === i); });
    renderSlots(); updateBooking();
  }
  daysW.addEventListener('click', function (e) { var b = e.target.closest('[data-day]'); if (b) selectDay(+b.getAttribute('data-day')); });
  slotsW.addEventListener('click', function (e) {
    var b = e.target.closest('[data-slot]'); if (!b || b.disabled) return;
    bkState.slot = b.getAttribute('data-slot'); $('[data-slot-err]').hidden = true;
    $$('.slot', slotsW).forEach(function (x) { x.setAttribute('aria-checked', x === b); });
    updateBooking();
  });
  bkBranches.addEventListener('change', function (e) { bkState.branch = e.target.value; renderSlots(); updateBooking(); });
  bkHome.addEventListener('change', function () {
    if (bkHome.checked && ['ceramic', 'noithat'].indexOf(bkSvc.value) === -1) {
      bkHome.checked = false; toast('Thi công tận nơi chỉ áp dụng phủ ceramic và vệ sinh nội thất'); return;
    }
    renderSlots(); updateBooking();
  });
  function priceFor(svc, sz) {
    var k = B.PKGS.filter(function (x) { return x.id === svc; })[0];
    if (k) return { now: k.price[sz], old: k.old ? k.old[sz] : 0 };
    var s = svcById[svc]; return s ? { now: svcPrice(svc, sz), old: PROMO[svc] ? s.price[sz] : 0 } : { now: 0, old: 0 };
  }
  var estShown = 0;
  function updateBooking() {
    if (bkHome.checked && ['ceramic', 'noithat'].indexOf(bkSvc.value) === -1) { bkHome.checked = false; renderSlots(); }
    var pr = priceFor(bkSvc.value, bkSize.value), estEl = $('[data-bk-est]'), from = estShown; estShown = pr.now;
    tween(from, pr.now, 500, function (v) { estEl.textContent = fmt(Math.round(v / 1000) * 1000); });
    var oldEl = $('[data-bk-old]'); oldEl.hidden = !pr.old; if (pr.old) oldEl.textContent = fmt(pr.old);
    var svcTxt = bkSvc.options[bkSvc.selectedIndex].text;
    $('[data-sum-svc]').innerHTML = esc(svcTxt) + (bkSvc.value === 'phim' ? '<br><small style="color:var(--gold-ink);font-weight:500">+ Tặng vệ sinh nội thất</small>' : '');
    $('[data-sum-size]').textContent = bkSize.options[bkSize.selectedIndex].text;
    var br = B.BRANCHES.filter(function (b) { return b.id === bkState.branch; })[0];
    $('[data-sum-branch]').textContent = bkHome.checked ? 'Tận nơi – nội ô Cần Thơ' : br.name.replace('Bóng Studio ', 'Chi nhánh ');
    $$('.bpick', bkBranches).forEach(function (l) { l.classList.toggle('is-off', bkHome.checked); });
    var d = days[bkState.day];
    $('[data-sum-time]').textContent = bkState.slot ? bkState.slot + ', ' + WD[d.getDay()].replace('CN', 'Chủ nhật') + ' ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) : 'Chưa chọn giờ';
  }
  function setBooking(svc, branch) {
    if (bkSvc.querySelector('option[value="' + svc + '"]')) bkSvc.value = svc;
    bkSize.value = size;
    if (branch) { var r = $('input[value="' + branch + '"]', bkBranches); if (r) { r.checked = true; bkState.branch = branch; bkHome.checked = false; renderSlots(); } }
    updateBooking();
  }
  bkSvc.addEventListener('change', updateBooking);
  bkSize.addEventListener('change', function () { setSize(bkSize.value, true); updateBooking(); });
  selectDay(1);
  bk.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = validate(bk, { name: RULES.name, phone: RULES.phone });
    if (!bkState.slot) { $('[data-slot-err]').hidden = false; if (ok) slotsW.scrollIntoView({ block: 'center', behavior: 'smooth' }); ok = false; }
    if (!ok) return;
    var code = 'LH' + String(Math.floor(1000 + Math.random() * 9000));
    $('[data-bk-ok-msg]').innerHTML = 'Cảm ơn <b>' + esc(bk.elements.name.value.trim()) + '</b>! Mã lịch hẹn <b>' + code + '</b>: ' + esc(bkSvc.options[bkSvc.selectedIndex].text) + ' (' + esc(bkSize.options[bkSize.selectedIndex].text) + ') lúc <b>' + $('[data-sum-time]').textContent + '</b> · ' + esc($('[data-sum-branch]').textContent) + '. Chi phí dự kiến <b>' + fmt(estShown) + '</b>. Tư vấn viên sẽ gọi xác nhận trong 15 phút.<br><small>(Biểu mẫu minh hoạ – thông tin không được gửi đi.)</small>';
    $('[data-bk-main]').hidden = true; $('[data-bk-sum]').hidden = true; $('[data-bk-ok]').hidden = false;
    $('#dat-lich').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    if (HAS_GSAP && !REDUCED) gsap.from($('[data-bk-ok]').children, { y: 12, opacity: 0, stagger: .07, duration: .45, ease: 'power2.out' });
  });
  $('[data-bk-again]').addEventListener('click', function () {
    $('[data-bk-main]').hidden = false; $('[data-bk-sum]').hidden = false; $('[data-bk-ok]').hidden = true; bk.elements.name.focus();
  });

  /* =========================================================
     BRANCHES
     ========================================================= */
  $('[data-branches]').innerHTML = B.BRANCHES.map(function (b) {
    return '<article class="branch"><div class="branch__img">' + imgTag(b.img, 640, 360, b.alt) + (b.tag ? '<span class="branch__tag">' + b.tag + '</span>' : '') + '</div>' +
      '<div class="branch__body"><h3>' + b.name + '</h3><ul>' +
      '<li>' + B.icon('pin') + '<span>' + b.addr + ' <small style="color:var(--muted)">(minh hoạ)</small></span></li>' +
      '<li>' + B.icon('clock') + '<span>' + b.hours + '</span></li>' +
      '<li>' + B.icon('van') + '<span>' + b.bays + '</span></li></ul>' +
      '<div class="branch__btns"><a href="#dat-lich" class="btn btn--primary btn--sm" data-branch="' + b.id + '">Đặt lịch tại đây</a><a href="tel:0900000515" class="btn btn--line btn--sm">' + B.icon('phone') + 'Gọi</a></div></div></article>';
  }).join('');

  /* =========================================================
     REVIEWS
     ========================================================= */
  var R = B.RATING, photoCount = 412;
  $('[data-rvsum]').innerHTML = '<div class="rvsum__avg"><b>' + dec1(R.avg) + '</b><span>/5</span></div>' + stars(R.avg, 'stars--lg') +
    '<p class="rvsum__n">' + num(R.total) + ' đánh giá sản phẩm &amp; dịch vụ</p>' +
    '<ul class="rvdist">' + R.dist.map(function (c, i) { return '<li><span>' + (5 - i) + ' ★</span><span class="bar"><i style="width:' + (c / R.total * 100).toFixed(1) + '%"></i></span><em>' + num(c) + '</em></li>'; }).join('') + '</ul>' +
    '<p class="rvsum__photo">' + B.icon('camera') + num(photoCount) + ' đánh giá kèm hình ảnh</p>';
  var RVF = [
    { id: 'all', name: 'Tất cả (' + num(R.total) + ')' },
    { id: 'photo', name: 'Có hình ảnh (' + photoCount + ')' },
    { id: '5', name: '5 sao (' + num(R.dist[0]) + ')' },
    { id: '4', name: '4 sao (' + R.dist[1] + ')' },
    { id: 'dv', name: 'Dịch vụ' },
    { id: 'sp', name: 'Sản phẩm' }
  ];
  var rvState = { f: 'all', n: 4 }, rvList = $('[data-rvlist]'), rvMore = $('[data-rv-more]');
  $('[data-rvfilter]').innerHTML = RVF.map(function (f, i) { return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-rvf="' + f.id + '"' + (i === 0 ? ' class="is-on"' : '') + '>' + f.name + '</button>'; }).join('');
  function rvFiltered() {
    return B.REVIEWS.filter(function (r) {
      var f = rvState.f;
      return f === 'all' || (f === 'photo' && r.ph.length) || (f === '5' && r.s === 5) || (f === '4' && r.s === 4) || f === r.k;
    });
  }
  function renderReviews() {
    var list = rvFiltered(), vis = list.slice(0, rvState.n);
    rvList.innerHTML = vis.map(function (r) {
      var idx = B.REVIEWS.indexOf(r);
      return '<article class="rv"><span class="rv__av" aria-hidden="true">' + r.n.split(' ').slice(-1)[0].charAt(0) + '</span><div>' +
        '<div class="rv__head"><b>' + r.n + '</b>' + stars(r.s) + '<span class="rv__buy">' + B.icon('check') + (r.k === 'dv' ? 'Đã sử dụng dịch vụ' : 'Đã mua hàng') + '</span></div>' +
        '<p class="rv__sub">' + r.d + ' · ' + r.p + ', Cần Thơ · Phân loại: ' + r.v + '</p>' +
        '<p class="rv__q">' + r.q + '</p>' +
        (r.ph.length ? '<div class="rv__ph">' + r.ph.map(function (id) { return '<button type="button" data-photo="' + id + '" aria-label="Xem ảnh của ' + r.n + '">' + imgTag(id, 160, 160, 'Ảnh khách hàng ' + r.n + ' gửi kèm đánh giá') + '</button>'; }).join('') + '</div>' : '') +
        (r.rep ? '<div class="rv__rep"><b>Phản hồi từ Bóng Studio</b>' + r.rep + '</div>' : '') +
        '<div class="rv__foot"><button type="button" class="rv__help" data-help="' + idx + '">' + B.icon('thumb') + 'Hữu ích (<span>' + r.h + '</span>)</button></div>' +
        '</div></article>';
    }).join('') || '<p class="empty">Chưa có đánh giá phù hợp.</p>';
    rvMore.parentNode.hidden = list.length <= rvState.n;
  }
  $('[data-rvfilter]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rvf]'); if (!b) return;
    rvState.f = b.getAttribute('data-rvf'); rvState.n = 4;
    $$('[data-rvf]').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    renderReviews();
  });
  rvMore.addEventListener('click', function () { rvState.n += 4; renderReviews(); });
  rvList.addEventListener('click', function (e) {
    var b = e.target.closest('[data-help]');
    if (b) { var r = B.REVIEWS[+b.getAttribute('data-help')]; if (!b.classList.contains('is-on')) { r.h += 1; b.classList.add('is-on'); $('span', b).textContent = r.h; } return; }
    var ph = e.target.closest('[data-photo]');
    if (ph) openPhoto(ph.getAttribute('data-photo'), $('img', ph).alt, ph);
  });
  renderReviews();

  /* =========================================================
     BLOG
     ========================================================= */
  (function () {
    var t = B.TIPS, big = t[0], p = byId[big.pid];
    $('[data-blog]').innerHTML = '<article class="post"><a href="#meo-hay" class="post__img">' + imgTag(big.img, 800, 450, big.alt) + '</a>' +
      '<p class="post__meta">' + big.date + ' · ' + big.read + '</p><h3><a href="#meo-hay">' + big.title + '</a></h3><p class="post__ex">' + big.ex + '</p>' +
      '<button type="button" class="post__prod" data-qv-open="' + p.id + '">' + B.packshot(p) + '<span><small>Sản phẩm trong bài</small>' + esc(p.name) + '</span></button></article>' +
      '<div class="minis">' + t.slice(1).map(function (x) {
        return '<article class="mini"><a href="#meo-hay" class="mini__img">' + imgTag(x.img, 256, 192, x.alt) + '</a><div><h3><a href="#meo-hay">' + x.title + '</a></h3><p>' + x.date + ' · ' + x.read + '</p></div></article>';
      }).join('') + '</div>';
  })();

  /* =========================================================
     BEFORE / AFTER
     ========================================================= */
  var cmp = $('[data-compare]'), handle = $('[data-handle]'), cmpRect = null, cmpPos = 50, cmpTouched = false;
  function setPos(v) { cmpPos = Math.max(0, Math.min(100, v)); cmp.style.setProperty('--pos', cmpPos + '%'); handle.setAttribute('aria-valuenow', Math.round(cmpPos)); }
  cmp.addEventListener('pointerdown', function (e) {
    cmpTouched = true; cmpRect = cmp.getBoundingClientRect(); cmp.classList.add('is-drag');
    if (cmp.setPointerCapture) cmp.setPointerCapture(e.pointerId);
    setPos((e.clientX - cmpRect.left) / cmpRect.width * 100);
  });
  cmp.addEventListener('pointermove', function (e) { if (cmpRect) setPos((e.clientX - cmpRect.left) / cmpRect.width * 100); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { cmp.addEventListener(ev, function () { cmpRect = null; cmp.classList.remove('is-drag'); }); });
  handle.addEventListener('keydown', function (e) {
    var m = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
    if (m[e.key]) { setPos(cmpPos + m[e.key]); e.preventDefault(); }
    if (e.key === 'Home') { setPos(0); e.preventDefault(); }
    if (e.key === 'End') { setPos(100); e.preventDefault(); }
    cmpTouched = true;
  });
  if ('IntersectionObserver' in window && !REDUCED) {
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      setTimeout(function () {
        if (cmpTouched) return;
        tween(50, 28, 700, setPos, function () { if (!cmpTouched) tween(28, 70, 900, setPos, function () { if (!cmpTouched) tween(70, 50, 600, setPos); }); });
      }, 300);
    }, { threshold: .6 });
    cio.observe(cmp);
  }

  /* =========================================================
     NEWSLETTER (minh hoạ)
     ========================================================= */
  $('[data-news]').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('input', e.currentTarget), v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast('Vui lòng nhập email hợp lệ'); inp.focus(); return; }
    inp.value = ''; toast('Đã ghi nhận đăng ký (minh hoạ – không gửi email thật)');
  });

  /* =========================================================
     GLOBAL CLICK DELEGATION
     ========================================================= */
  doc.addEventListener('click', function (e) {
    var t = e.target;
    var add = t.closest('[data-add]');
    if (add) {
      var id = +add.getAttribute('data-add'), fl = add.hasAttribute('data-flash');
      addToCart(id, 1, { flash: fl });
      flyToCart(add, id);
      toast('Đã thêm “' + byId[id].name + '” vào giỏ');
      add.classList.add('is-done'); add.innerHTML = B.icon('check');
      setTimeout(function () { add.classList.remove('is-done'); add.innerHTML = B.icon('cart'); }, 1300);
      return;
    }
    var q = t.closest('[data-qv-open]');
    if (q) { e.preventDefault(); openQV(+q.getAttribute('data-qv-open'), q); return; }
    var a = t.closest('a[href^="#"]');
    if (!a) return;
    var id2 = a.getAttribute('href').slice(1);
    e.preventDefault();
    if (a.hasAttribute('data-cat-link')) { state.q = ''; searchInput.value = ''; setCat(a.getAttribute('data-cat-link')); }
    if (a.hasAttribute('data-book')) setBooking(a.getAttribute('data-book'));
    if (a.hasAttribute('data-branch')) setBooking(bkSvc.value, a.getAttribute('data-branch'));
    if (catWrap.contains(a)) setCatMenu(false);
    var wasOpen = openStack.length > 0;
    closeAllLayers();
    var go = function () { scrollToId(id2); };
    if (wasOpen) setTimeout(go, 80); else go();
  });

  /* Nguồn ảnh sản phẩm (ghi công tác giả theo giấy phép) */
  var CREDIT = {
    'https://commons.wikimedia.org/wiki/File:1_liter_trigger_spray_bottle.jpg': 'Plasticbottlesupplier, Wikimedia Commons, CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:1_liter_amber_trigger_spray_bottle.jpg': 'Plasticbottlesupplier, Wikimedia Commons, CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Microfibre_cloth.jpg': 'Polyesterchen, Wikimedia Commons, phạm vi công cộng'
  };
  $('[data-credits]').innerHTML = B.P.map(function (p) {
    var who = CREDIT[p.src] || (p.src.indexOf('pexels') > -1 ? 'Pexels (giấy phép Pexels)' : 'Unsplash (giấy phép Unsplash)');
    return '<li>' + esc(p.name) + ': <a href="' + p.src + '" target="_blank" rel="noopener nofollow">' + who + '</a></li>';
  }).join('');

  renderGrid(false);
  renderCart();
  renderCombo();
  hydrateIcons();

  /* =========================================================
     REVEAL (nhẹ nhàng, chỉ phần dưới màn hình đầu)
     ========================================================= */
  if ('IntersectionObserver' in window && !REDUCED) {
    var vh = window.innerHeight;
    var rio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); rio.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.sec .box, .shop__main').forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add('will-reveal'); rio.observe(el); }
    });
  }
})();
