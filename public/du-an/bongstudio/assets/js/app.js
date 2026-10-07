/* BÓNG STUDIO – tương tác & chuyển động (cửa hàng mẫu, không gửi dữ liệu) */
(function () {
  'use strict';
  var B = window.BONG;
  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = {}; B.P.forEach(function (p) { byId[p.id] = p; });
  var catName = {}; B.CATS.forEach(function (c) { catName[c.id] = c.name; });

  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }
  function fmtNum(n, dec) {
    if (dec) return n.toFixed(dec).replace('.', ',');
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function pct(p) { return p.old ? Math.round((1 - p.price / p.old) * 100) : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  if (HAS_GSAP && !REDUCED) root.classList.add('gsap-ok'); else root.classList.remove('gsap-ok');
  if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Icons & packshots ---------- */
  function hydrateIcons(scope) { $$('[data-i]', scope).forEach(function (el) { if (!el.firstChild) el.innerHTML = B.icon(el.getAttribute('data-i')); }); }
  hydrateIcons();
  $$('[data-pk]').forEach(function (el) { el.innerHTML = B.packshot(byId[+el.getAttribute('data-pk')]); });

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2200);
  }

  /* ---------- Countdown (đến 23:59:59 hôm nay) ---------- */
  var cdText = $$('[data-countdown]'), cdBoxes = $$('[data-countdown-boxes] span');
  function tick() {
    var now = new Date(), end = new Date(now); end.setHours(23, 59, 59, 999);
    var s = Math.max(0, Math.floor((end - now) / 1000));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    var p = [h, m, ss].map(function (v) { return (v < 10 ? '0' : '') + v; });
    cdText.forEach(function (el) { el.textContent = p.join(':'); });
    cdBoxes.forEach(function (el, i) { if (el.textContent !== p[i]) el.textContent = p[i]; });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Overlay helpers (khoá cuộn, Esc, trả focus) ---------- */
  var openStack = [];
  function lockScroll(on) {
    if (on) {
      var sw = window.innerWidth - root.clientWidth;
      if (sw > 0) body.style.paddingRight = sw + 'px';
      body.classList.add('is-locked');
    } else { body.classList.remove('is-locked'); body.style.paddingRight = ''; }
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
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openStack.length) {
      var top = openStack[openStack.length - 1];
      if (top === qv) closeQV(); else if (top === drawer) closeCart(); else closeMenu();
    }
  });

  /* ---------- Smooth anchors (an toàn khi có <base href>) ---------- */
  function scrollToId(id, after) {
    var t = id === 'top' ? null : doc.getElementById(id);
    if (id === 'top') window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    else if (t) t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    if (after) setTimeout(after, 700);
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    e.preventDefault();
    if (a.hasAttribute('data-cat-link')) setCat(a.getAttribute('data-cat-link'));
    if (a.hasAttribute('data-book')) setBooking(a.getAttribute('data-book'));
    var wasOpen = openStack.length > 0;
    if (mnav.classList.contains('is-open')) closeMenu(true);
    if (drawer.classList.contains('is-open')) closeCart(true);
    var go = function () {
      scrollToId(id, a.hasAttribute('data-focus-form') ? function () { var n = $('[data-booking] input[name="name"]'); if (n) n.focus({ preventScroll: true }); } : null);
    };
    if (wasOpen) setTimeout(go, 60); else go();
  });

  /* ---------- Mobile menu ---------- */
  var mnav = $('[data-mnav]'), burger = $('[data-open-menu]');
  function openMenu() { openLayer(mnav, burger, '[data-close-menu]'); burger.setAttribute('aria-expanded', 'true'); }
  function closeMenu(noFocus) { closeLayer(mnav, noFocus); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', openMenu);
  $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', function () { closeMenu(); }); });
  mnav.addEventListener('click', function (e) { if (e.target === mnav) closeMenu(); });

  /* =========================================================
     SHOP
     ========================================================= */
  var state = { cat: 'all', q: '', price: 'all', sort: 'hot', onsale: false };
  var grid = $('[data-grid]'), emptyEl = $('[data-empty]'), resultEl = $('[data-result]');
  var chipsWrap = $('[data-cat-chips]');

  function countIn(cat) { return cat === 'all' ? B.P.length : B.P.filter(function (p) { return p.cat === cat; }).length; }
  chipsWrap.innerHTML = B.CATS.map(function (c) {
    return '<button type="button" class="chip-btn' + (c.id === 'all' ? ' is-on' : '') + '" role="tab" aria-selected="' + (c.id === 'all') + '" data-cat="' + c.id + '">' + c.name + ' <small>' + countIn(c.id) + '</small></button>';
  }).join('');
  chipsWrap.addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (b) setCat(b.getAttribute('data-cat')); });

  $('[data-cats]').innerHTML = B.CATS.filter(function (c) { return c.id !== 'all'; }).map(function (c) {
    return '<a href="#cua-hang" class="cat" data-cat-link="' + c.id + '" data-reveal-cat><span class="cat__pk">' + B.packshot(byId[c.rep]) + '</span><span><b>' + c.name + '</b><small>' + c.desc + '</small></span></a>';
  }).join('');

  function setCat(id) {
    state.cat = id;
    $$('[data-cat]', chipsWrap).forEach(function (b) { var on = b.getAttribute('data-cat') === id; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    renderGrid(true);
  }

  function stars(r) { return '<span class="stars__v" aria-label="' + fmtNum(r, 1) + ' trên 5 sao"><i style="width:' + (r / 5 * 100) + '%"></i></span>'; }
  function cardHTML(p) {
    var d = pct(p);
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="card__media" data-qv-open="' + p.id + '">' +
      (d ? '<span class="badge">−' + d + '%</span>' : '') +
      (p.hot >= 9 ? '<span class="badge badge--hot">Bán chạy</span>' : '') +
      '<div class="card__pk">' + B.packshot(p) + '</div>' +
      '<button type="button" class="qv-btn" data-qv-open="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '">' + B.icon('eye') + '<em>Xem nhanh</em></button>' +
      '</div>' +
      '<div class="card__body">' +
      '<span class="card__cat">' + catName[p.cat] + '</span>' +
      '<h3 class="card__name"><button type="button" data-qv-open="' + p.id + '">' + esc(p.name) + '</button></h3>' +
      '<p class="card__spec">' + esc(p.spec) + '</p>' +
      '<div class="stars">' + stars(p.rate) + '<span>' + fmtNum(p.rate, 1) + ' (' + p.rv + ')</span></div>' +
      '<div class="card__foot"><div class="prices"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s>' : '<span class="nos" aria-hidden="true">&nbsp;</span>') + '</div>' +
      '<button type="button" class="add" data-add="' + p.id + '">' + B.icon('bag') + 'Thêm vào giỏ</button></div>' +
      '</div></article>';
  }
  function filtered() {
    var q = norm(state.q.trim());
    var range = state.price === 'all' ? null : state.price.split('-').map(Number);
    var list = B.P.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.onsale && !p.old) return false;
      if (range && (p.price < range[0] || p.price >= range[1])) return false;
      if (q && norm(p.name + ' ' + p.spec + ' ' + catName[p.cat]).indexOf(q) === -1) return false;
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'asc') return a.price - b.price;
      if (s === 'desc') return b.price - a.price;
      if (s === 'sale') return pct(b) - pct(a);
      if (s === 'rate') return b.rate - a.rate || b.rv - a.rv;
      return b.hot - a.hot || b.sold - a.sold;
    });
    return list;
  }
  var firstRender = true;
  function renderGrid(animate) {
    var list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    emptyEl.hidden = list.length > 0;
    var parts = [];
    if (state.cat !== 'all') parts.push(catName[state.cat]);
    if (state.q.trim()) parts.push('“' + esc(state.q.trim()) + '”');
    resultEl.innerHTML = 'Hiển thị <b>' + list.length + '</b> sản phẩm' + (parts.length ? ' · ' + parts.join(' · ') : '');
    if (HAS_GSAP && !REDUCED && animate && !firstRender) {
      gsap.fromTo($$('.card', grid), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', stagger: .035, overwrite: true, clearProps: 'transform' });
      ScrollTrigger.refresh();
    }
    firstRender = false;
  }
  renderGrid(false);

  var shopSearch = $('[data-shop-search]'), headSearches = $$('[data-search]');
  function setQuery(v, src) {
    state.q = v;
    if (src !== shopSearch) shopSearch.value = v;
    headSearches.forEach(function (i) { if (i !== src) i.value = v; });
    renderGrid(true);
  }
  shopSearch.addEventListener('input', function () { setQuery(shopSearch.value, shopSearch); });
  headSearches.forEach(function (inp) { inp.addEventListener('input', function () { setQuery(inp.value, inp); }); });
  $$('[data-search-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (mnav.classList.contains('is-open')) closeMenu(true);
      setTimeout(function () { scrollToId('cua-hang'); }, 40);
    });
  });
  $('[data-goto-search]').addEventListener('click', function () { scrollToId('cua-hang', function () { shopSearch.focus({ preventScroll: true }); }); });
  $('[data-price]').addEventListener('change', function (e) { state.price = e.target.value; renderGrid(true); });
  $('[data-sort]').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(true); });
  $('[data-onsale]').addEventListener('change', function (e) { state.onsale = e.target.checked; renderGrid(true); });
  $('[data-reset]').addEventListener('click', function () {
    state = { cat: 'all', q: '', price: 'all', sort: state.sort, onsale: false };
    $('[data-price]').value = 'all'; $('[data-onsale]').checked = false; setQuery('', null); setCat('all');
  });

  /* =========================================================
     CART
     ========================================================= */
  var CART_KEY = 'bongstudio.cart.v1';
  var cart = (store.get(CART_KEY, []) || []).filter(function (it) { return it && byId[it.id] && it.qty > 0; });
  var drawer = $('[data-drawer]');
  function cartCount() { return cart.reduce(function (s, it) { return s + it.qty; }, 0); }
  function cartSub() { return cart.reduce(function (s, it) { return s + byId[it.id].price * it.qty; }, 0); }
  function saveCart() { store.set(CART_KEY, cart); }
  function addToCart(id, qty, srcEl) {
    var it = cart.filter(function (x) { return x.id === id; })[0];
    if (it) it.qty += qty; else cart.push({ id: id, qty: qty });
    saveCart(); renderCart();
    if (srcEl) flyToCart(srcEl, id); else bumpBadge();
  }
  function setQty(id, qty) {
    cart = cart.map(function (x) { if (x.id === id) x.qty = qty; return x; }).filter(function (x) { return x.qty > 0; });
    saveCart(); renderCart();
  }
  function giftMsg(total) {
    var left = B.GIFT_AT - total;
    return left > 0 ? 'Mua thêm <b>' + fmt(left) + '</b> để nhận khăn microfiber' : 'Đã đủ điều kiện nhận <b>khăn microfiber miễn phí</b>';
  }
  function setBar(el, ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    if (HAS_GSAP && !REDUCED) gsap.to(el, { scaleX: ratio, duration: .7, ease: 'power3.out', overwrite: true });
    else el.style.transform = 'scaleX(' + ratio + ')';
  }
  function renderCart() {
    var n = cartCount(), sub = cartSub();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = n; b.classList.toggle('is-zero', n === 0); });
    var list = $('[data-citems]');
    var html = cart.map(function (it) {
      var p = byId[it.id];
      return '<li class="citem"><div class="citem__pk">' + B.packshot(p) + '</div><div><p class="citem__name">' + esc(p.name) + '</p><p class="citem__price">' + fmt(p.price * it.qty) + '</p></div>' +
        '<div class="citem__side"><button type="button" class="citem__rm" data-rm="' + p.id + '" aria-label="Xoá ' + esc(p.name) + '">' + B.icon('trash') + '</button>' +
        '<div class="qty"><button type="button" data-dec="' + p.id + '" aria-label="Giảm số lượng">' + B.icon('minus') + '</button><span aria-live="polite">' + it.qty + '</span><button type="button" data-inc="' + p.id + '" aria-label="Tăng số lượng">' + B.icon('plus') + '</button></div></div></li>';
    }).join('');
    if (sub >= B.GIFT_AT) html += '<li class="citem is-gift"><div class="citem__pk">' + B.packshot(byId[12]) + '</div><div><p class="citem__name">Khăn microfiber lau khô 60×90 (quà tặng)</p><p class="citem__price">0₫</p></div><div></div></li>';
    list.innerHTML = html;
    $('[data-cempty]').hidden = cart.length > 0;
    $('[data-cfoot]').hidden = cart.length === 0;
    $('[data-cart-gift]').hidden = cart.length === 0;
    $('[data-subtotal]').textContent = fmt(sub);
    var ship = sub >= 500000 || sub === 0 ? 0 : 30000;
    $('[data-ship]').textContent = ship ? fmt(ship) : 'Miễn phí';
    $('[data-co-total]').textContent = fmt(sub + ship);
    $('[data-cart-gift-msg]').innerHTML = giftMsg(sub);
    $('[data-cart-gift]').classList.toggle('is-full', sub >= B.GIFT_AT);
    setBar($('[data-cart-gift-bar]'), sub / B.GIFT_AT);
  }
  $('[data-citems]').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id;
    if ((id = b.getAttribute('data-inc'))) { id = +id; setQty(id, cart.filter(function (x) { return x.id === id; })[0].qty + 1); }
    else if ((id = b.getAttribute('data-dec'))) { id = +id; setQty(id, cart.filter(function (x) { return x.id === id; })[0].qty - 1); }
    else if ((id = b.getAttribute('data-rm'))) { setQty(+id, 0); toast('Đã xoá khỏi giỏ hàng'); }
  });
  function showView(name) {
    $$('.drawer__view', drawer).forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    $('[data-drawer-title]').textContent = name === 'checkout' ? 'Thông tin giao hàng' : name === 'done' ? 'Hoàn tất' : 'Giỏ hàng';
  }
  function openCart(opener) { showView('cart'); renderCart(); openLayer(drawer, opener, '[data-close-cart]'); }
  function closeCart(noFocus) { closeLayer(drawer, noFocus); }
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { openCart(b); }); });
  drawer.addEventListener('click', function (e) { var c = e.target.closest('[data-close-cart]'); if (c && c.tagName !== 'A') closeCart(); });
  $('[data-checkout]').addEventListener('click', function () { showView('checkout'); var f = $('[data-co] input'); if (f) f.focus(); });
  $('[data-back]').addEventListener('click', function () { showView('cart'); });

  /* Validation dùng chung */
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
    var ok = validate(f, { name: RULES.name, phone: RULES.phone, address: function (v) { return v.length < 6 ? 'Vui lòng nhập địa chỉ nhận hàng.' : ''; } });
    if (!ok) return;
    var code = 'BS' + String(Math.floor(100000 + Math.random() * 900000));
    var total = $('[data-co-total]').textContent;
    $('[data-done-msg]').innerHTML = 'Cảm ơn <b>' + esc(f.elements.name.value.trim()) + '</b>! Mã đơn <b>' + code + '</b> · tổng ' + total + ' (thanh toán khi nhận hàng). Chúng tôi sẽ gọi xác nhận trong ít phút. <br><small>(Đơn hàng minh hoạ – không có giao dịch thật.)</small>';
    cart = []; saveCart(); renderCart(); f.reset();
    showView('done');
  });

  /* Fly-to-cart */
  function cartTarget() {
    var m = $('.mbar');
    var useBar = m && window.getComputedStyle(m).display !== 'none';
    return useBar ? $('.mbar [data-open-cart]') : $('.hdr [data-open-cart]');
  }
  function bumpBadge() {
    if (!HAS_GSAP || REDUCED) return;
    $$('[data-cart-count]').forEach(function (b) { gsap.fromTo(b, { scale: 1 }, { scale: 1.45, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true }); });
    var t = cartTarget(); if (t) gsap.fromTo(t, { rotation: 0 }, { keyframes: [{ rotation: -12, duration: .08 }, { rotation: 10, duration: .1 }, { rotation: 0, duration: .14 }], overwrite: true });
  }
  function flyToCart(src, id) {
    if (!HAS_GSAP || REDUCED) { bumpBadge(); return; }
    var target = cartTarget(); if (!target) { bumpBadge(); return; }
    var card = src.closest('.card, .qv, .hero-card, .tip');
    var from = card ? ($('.card__pk, .qv__media svg, .hero-card__pk', card) || src) : src;
    var a = from.getBoundingClientRect(), t = target.getBoundingClientRect();
    var el = doc.createElement('div'); el.className = 'flyer'; el.innerHTML = B.packshot(byId[id]);
    body.appendChild(el);
    var sx = a.left + a.width / 2 - 42, sy = a.top + a.height / 2 - 48;
    var tx = t.left + t.width / 2 - 42, ty = t.top + t.height / 2 - 48;
    gsap.set(el, { x: sx, y: sy, scale: Math.min(1.4, a.width / 84) || 1, opacity: 1 });
    var tl = gsap.timeline({ onComplete: function () { el.remove(); bumpBadge(); } });
    tl.to(el, { x: tx, duration: .8, ease: 'power1.inOut' }, 0)
      .to(el, { y: ty, duration: .8, ease: 'back.in(1.6)' }, 0)
      .to(el, { scale: .22, rotation: 18, duration: .8, ease: 'power2.in' }, 0)
      .to(el, { opacity: 0, duration: .15 }, .68);
  }

  /* Add buttons (delegated) */
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (b) {
      var id = +b.getAttribute('data-add');
      addToCart(id, 1, b);
      toast('Đã thêm “' + byId[id].name + '” vào giỏ');
      if (b.classList.contains('add')) {
        b.classList.add('is-done'); b.innerHTML = B.icon('check') + 'Đã thêm';
        setTimeout(function () { b.classList.remove('is-done'); b.innerHTML = B.icon('bag') + 'Thêm vào giỏ'; }, 1400);
      }
      return;
    }
    var q = e.target.closest('[data-qv-open]');
    if (q) openQV(+q.getAttribute('data-qv-open'), q);
  });

  /* =========================================================
     QUICK VIEW
     ========================================================= */
  var qv = $('[data-qv]'), qvBody = $('[data-qv-body]'), qvQty = 1, qvId = 0;
  function openQV(id, opener) {
    var p = byId[id]; if (!p) return;
    qvId = id; qvQty = 1;
    var d = pct(p);
    qvBody.innerHTML =
      '<div class="qv__media">' + (d ? '<span class="badge">−' + d + '%</span>' : '') + B.packshot(p) + '</div>' +
      '<div class="qv__body">' +
      '<span class="card__cat">' + catName[p.cat] + '</span>' +
      '<h3 id="qv-title">' + esc(p.name) + '</h3>' +
      '<div class="stars">' + stars(p.rate) + '<span>' + fmtNum(p.rate, 1) + ' · ' + p.rv + ' đánh giá · đã bán ' + fmtNum(p.sold) + '</span></div>' +
      '<div class="prices"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s>' : '') + '</div>' +
      '<p class="qv__desc">' + esc(p.desc) + '</p>' +
      '<ul class="qv__spec">' + p.spec.split(' · ').map(function (s) { return '<li>' + B.icon('check') + '<span>' + esc(s.charAt(0).toUpperCase() + s.slice(1)) + '</span></li>'; }).join('') +
      '<li>' + B.icon('check') + '<span>Còn hàng · giao nhanh 2 giờ nội ô Cần Thơ</span></li></ul>' +
      '<div class="qv__buy"><div class="qty"><button type="button" data-qv-dec aria-label="Giảm">' + B.icon('minus') + '</button><span data-qv-qty>1</span><button type="button" data-qv-inc aria-label="Tăng">' + B.icon('plus') + '</button></div>' +
      '<button type="button" class="btn btn--green" data-qv-add>' + B.icon('bag') + 'Thêm vào giỏ</button></div>' +
      '</div>';
    openLayer(qv, opener, '.modal__x');
  }
  function closeQV() { closeLayer(qv); }
  $$('[data-close-qv]').forEach(function (b) { b.addEventListener('click', closeQV); });
  qvBody.addEventListener('click', function (e) {
    if (e.target.closest('[data-qv-inc]')) qvQty = Math.min(20, qvQty + 1);
    else if (e.target.closest('[data-qv-dec]')) qvQty = Math.max(1, qvQty - 1);
    else if (e.target.closest('[data-qv-add]')) {
      var btn = e.target.closest('[data-qv-add]');
      addToCart(qvId, qvQty, btn);
      toast('Đã thêm ' + qvQty + ' × “' + byId[qvId].name + '”');
      setTimeout(closeQV, 350);
      return;
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
      '<div class="ci__top"><span class="ci__pk">' + B.packshot(p) + '</span><span class="ci__name">' + esc(p.name) + '</span></div>' +
      '<div class="ci__row"><span class="ci__price">' + fmt(p.price) + '</span>' +
      '<div class="qty"><button type="button" data-cdec aria-label="Giảm">' + B.icon('minus') + '</button><span data-cq>1</span><button type="button" data-cinc aria-label="Tăng">' + B.icon('plus') + '</button></div></div></div>';
  }).join('');
  var comboNums = { sub: 0, disc: 0, total: 0 };
  function animNum(key, el, val, prefix) {
    var from = comboNums[key]; comboNums[key] = val;
    if (!HAS_GSAP || REDUCED) { el.textContent = (prefix || '') + fmt(val); return; }
    var o = { v: from };
    gsap.to(o, { v: val, duration: .6, ease: 'power2.out', overwrite: true, onUpdate: function () { el.textContent = (prefix || '') + fmt(o.v); } });
  }
  function renderCombo() {
    var sub = 0, items = 0, lines = [];
    $$('.ci', comboList).forEach(function (el) {
      var id = +el.getAttribute('data-ci'), q = combo[id] || 0;
      el.classList.toggle('is-on', q > 0); el.setAttribute('aria-checked', q > 0);
      $('[data-cq]', el).textContent = q || 1;
      if (q) { sub += byId[id].price * q; items += q; lines.push('<li><span>' + q + ' × ' + esc(byId[id].name) + '</span><b>' + fmt(byId[id].price * q) + '</b></li>'); }
    });
    var disc = items >= 3 ? Math.round(sub * 0.1 / 1000) * 1000 : 0, total = sub - disc;
    $('[data-combo-items]').innerHTML = lines.length ? lines.join('') : '<li class="none">Chưa chọn sản phẩm nào – chạm vào thẻ bên cạnh để thêm.</li>';
    animNum('sub', $('[data-combo-sub]'), sub);
    animNum('disc', $('[data-combo-disc]'), disc, '−');
    animNum('total', $('[data-combo-total]'), total);
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
    var n = 0;
    Object.keys(combo).forEach(function (id) { if (combo[id] > 0) { var it = cart.filter(function (x) { return x.id === +id; })[0]; if (it) it.qty += combo[id]; else cart.push({ id: +id, qty: combo[id] }); n += combo[id]; } });
    if (!n) return;
    saveCart(); renderCart();
    var firstId = +Object.keys(combo).filter(function (k) { return combo[k] > 0; })[0];
    flyToCart(e.currentTarget, firstId);
    toast('Đã thêm combo ' + n + ' sản phẩm vào giỏ');
  });

  /* =========================================================
     PACKAGES (đổi cỡ xe → giá đếm số)
     ========================================================= */
  var size = 'sedan', pkgWrap = $('[data-pkgs]');
  pkgWrap.innerHTML = B.PKGS.map(function (k, i) {
    return '<article class="pkg' + (k.hot ? ' is-hot' : '') + '" data-reveal-pkg>' +
      (k.hot ? '<span class="pkg__ribbon">Phổ biến nhất</span>' : '') +
      '<span class="pkg__tag">' + k.tag + '</span>' +
      '<h3>Gói ' + k.name + '<small>“' + k.alias + '”</small></h3>' +
      '<div class="pkg__price"><b data-pkg-price="' + k.id + '">' + fmt(k.price.sedan) + '</b><span data-pkg-per>/ xe sedan</span></div>' +
      '<ul class="pkg__feats">' + B.FEATS.map(function (f) {
        var v = f[i + 1];
        var val = v === true ? '<span class="yes" aria-label="Có">' + B.icon('check') + '</span>' : v === false ? '<span class="no" aria-label="Không">—</span>' : '<span>' + v + '</span>';
        return '<li><span>' + f[0] + '</span>' + val + '</li>';
      }).join('') + '</ul>' +
      '<a href="#dat-lich" class="btn ' + (k.hot ? 'btn--green' : 'btn--ghost') + ' btn--block" data-book="' + k.id + '">Đặt lịch gói này</a>' +
      '</article>';
  }).join('');
  var pkgVals = {}; B.PKGS.forEach(function (k) { pkgVals[k.id] = k.price.sedan; });
  var sizer = $('[data-sizer]'), sizeBtns = $$('[data-size]', sizer), thumb = $('.sizer__thumb', sizer);
  function setSize(s) {
    if (s === size) return; size = s;
    var idx = 0;
    sizeBtns.forEach(function (b, i) { var on = b.getAttribute('data-size') === s; b.setAttribute('aria-checked', on); if (on) idx = i; });
    thumb.style.transform = 'translateX(' + (idx * 100) + '%)';
    $$('[data-car]').forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-car') === s); });
    $('[data-size-note]').textContent = B.SIZES[s].note;
    $$('[data-pkg-per]').forEach(function (el) { el.textContent = '/ xe ' + B.SIZES[s].label.toLowerCase(); });
    B.PKGS.forEach(function (k) {
      var el = $('[data-pkg-price="' + k.id + '"]'), to = k.price[s], o = { v: pkgVals[k.id] };
      pkgVals[k.id] = to;
      if (!HAS_GSAP || REDUCED) { el.textContent = fmt(to); return; }
      gsap.to(o, { v: to, duration: 1, ease: 'power3.out', overwrite: true, onUpdate: function () { el.textContent = fmt(Math.round(o.v / 1000) * 1000); } });
      gsap.fromTo(el, { y: -6, opacity: .4 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out' });
    });
    var bs = $('[data-bk-size]'); if (bs) { bs.value = s; updateEst(); }
  }
  sizeBtns.forEach(function (b) { b.addEventListener('click', function () { setSize(b.getAttribute('data-size')); }); });
  sizer.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var i = sizeBtns.findIndex(function (b) { return b.getAttribute('aria-checked') === 'true'; });
    i = (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3; sizeBtns[i].focus(); setSize(sizeBtns[i].getAttribute('data-size'));
  });

  /* =========================================================
     BOOKING
     ========================================================= */
  var bk = $('[data-booking]'), bkSvc = $('[data-bk-service]'), bkSize = $('[data-bk-size]'), bkEst = $('[data-bk-est]');
  var estVal = 0;
  function priceFor(svc, sz) {
    var k = B.PKGS.filter(function (x) { return x.id === svc; })[0];
    return k ? k.price[sz] : (B.SERVICES[svc] ? B.SERVICES[svc][sz] : 0);
  }
  function updateEst() {
    var v = priceFor(bkSvc.value, bkSize.value), o = { v: estVal }; estVal = v;
    if (!HAS_GSAP || REDUCED) { bkEst.textContent = fmt(v); return; }
    gsap.to(o, { v: v, duration: .7, ease: 'power2.out', overwrite: true, onUpdate: function () { bkEst.textContent = fmt(Math.round(o.v / 1000) * 1000); } });
  }
  function setBooking(svc) { if (bkSvc.querySelector('option[value="' + svc + '"]')) bkSvc.value = svc; bkSize.value = size; updateEst(); }
  bkSvc.addEventListener('change', updateEst); bkSize.addEventListener('change', updateEst);
  (function () {
    var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (x) { return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
    var inp = $('[data-bk-date]'); inp.min = iso(d); d.setDate(d.getDate() + 1); inp.value = iso(d);
  })();
  updateEst();
  bk.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = validate(bk, { name: RULES.name, phone: RULES.phone, date: function (v) { return !v ? 'Vui lòng chọn ngày hẹn.' : (v < bk.elements.date.min ? 'Ngày hẹn không hợp lệ.' : ''); } });
    if (!ok) return;
    var dt = bk.elements.date.value.split('-');
    var slot = (bk.querySelector('input[name="slot"]:checked') || {}).value;
    var place = (bk.querySelector('input[name="place"]:checked') || {}).value === 'home' ? 'thi công tận nơi' : 'tại studio';
    $('[data-bk-ok-msg]').innerHTML = 'Cảm ơn <b>' + esc(bk.elements.name.value.trim()) + '</b>! Lịch <b>' + esc(bkSvc.options[bkSvc.selectedIndex].text) + '</b> (' + esc(bkSize.options[bkSize.selectedIndex].text) + ') lúc <b>' + slot + ', ' + dt[2] + '/' + dt[1] + '/' + dt[0] + '</b>, ' + place + '. Dự kiến ' + fmt(estVal) + '. Tư vấn viên sẽ gọi xác nhận trong 15 phút.<br><small>(Biểu mẫu minh hoạ – thông tin không được gửi đi.)</small>';
    $('.bk-form__body', bk).hidden = true; $('[data-bk-ok]', bk).hidden = false;
    if (HAS_GSAP && !REDUCED) gsap.from($('[data-bk-ok]', bk).children, { y: 16, opacity: 0, stagger: .08, duration: .5, ease: 'power3.out' });
  });
  $('[data-bk-again]').addEventListener('click', function () {
    $('.bk-form__body', bk).hidden = false; $('[data-bk-ok]', bk).hidden = true; bk.elements.name.focus();
  });

  /* =========================================================
     TIPS & REVIEWS
     ========================================================= */
  $('[data-tips]').innerHTML = B.TIPS.map(function (t, i) {
    var p = byId[t.pid];
    return '<article class="tip" data-reveal-tip><div class="tip__img"><img src="https://images.unsplash.com/' + t.img + '?auto=format&fit=crop&w=600&h=450&q=68" width="600" height="450" alt="' + esc(t.alt) + '" loading="lazy" decoding="async"><span class="tip__n">0' + (i + 1) + '</span></div>' +
      '<div class="tip__body"><span class="tip__tag">' + t.tag + '</span><h3>' + t.title + '</h3><ol>' + t.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
      '<button type="button" class="tip__prod" data-qv-open="' + p.id + '">' + B.packshot(p) + '<span><small>Sản phẩm gợi ý</small>' + esc(p.name) + '</span></button></div></article>';
  }).join('');

  var track = $('[data-rv-track]'), dotsWrap = $('[data-rv-dots]');
  track.innerHTML = B.REVIEWS.map(function (r) {
    var initials = r.n.split(' ').slice(-1)[0].charAt(0);
    return '<article class="rv"><div class="stars">' + stars(r.s) + '</div><p class="rv__q">' + r.q + '</p><span class="rv__tag">' + r.t + '</span>' +
      '<div class="rv__who"><span class="rv__av">' + initials + '</span><div><b>' + r.n + '</b><small>' + r.car + ' · ' + r.p + ', Cần Thơ</small></div></div></article>';
  }).join('');
  dotsWrap.innerHTML = B.REVIEWS.map(function () { return '<i></i>'; }).join('');
  var dots = $$('i', dotsWrap), cards = $$('.rv', track);
  var step = 400, lastAct = 0, hovering = false, rvVisible = false;
  function measure() { if (cards.length > 1) step = cards[1].offsetLeft - cards[0].offsetLeft; }
  function curIdx() { return Math.round(track.scrollLeft / (step || 1)); }
  var dotRaf = 0;
  function updDots() { dotRaf = 0; var i = Math.min(dots.length - 1, curIdx()); dots.forEach(function (d, j) { d.classList.toggle('is-on', j === i); }); }
  track.addEventListener('scroll', function () { if (!dotRaf) dotRaf = requestAnimationFrame(updDots); }, { passive: true });
  function go(dir) {
    var max = track.scrollWidth - track.clientWidth - 2;
    if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  function act() { lastAct = Date.now(); }
  $('[data-rv-prev]').addEventListener('click', function () { act(); go(-1); });
  $('[data-rv-next]').addEventListener('click', function () { act(); go(1); });
  ['pointerdown', 'touchstart', 'wheel', 'keydown', 'focusin'].forEach(function (ev) { track.addEventListener(ev, act, { passive: true }); });
  track.addEventListener('mouseenter', function () { hovering = true; });
  track.addEventListener('mouseleave', function () { hovering = false; act(); });
  window.addEventListener('resize', measure);
  measure(); updDots();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { rvVisible = en[0].isIntersecting; }, { threshold: .3 }).observe(track);
  setInterval(function () {
    if (REDUCED || !rvVisible || hovering || doc.hidden || Date.now() - lastAct < 6000) return;
    go(1);
  }, 4200);

  /* =========================================================
     BEFORE / AFTER
     ========================================================= */
  var cmp = $('[data-compare]'), handle = $('[data-handle]'), cmpRect = null, cmpPos = 50;
  function setPos(v) { cmpPos = Math.max(0, Math.min(100, v)); cmp.style.setProperty('--pos', cmpPos + '%'); handle.setAttribute('aria-valuenow', Math.round(cmpPos)); }
  cmp.addEventListener('pointerdown', function (e) {
    cmpRect = cmp.getBoundingClientRect(); cmp.classList.add('is-drag');
    if (cmp.setPointerCapture) cmp.setPointerCapture(e.pointerId);
    setPos((e.clientX - cmpRect.left) / cmpRect.width * 100);
    if (HAS_GSAP) gsap.killTweensOf(cmpProxy);
  });
  cmp.addEventListener('pointermove', function (e) { if (cmpRect) setPos((e.clientX - cmpRect.left) / cmpRect.width * 100); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { cmp.addEventListener(ev, function () { cmpRect = null; cmp.classList.remove('is-drag'); }); });
  handle.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setPos(cmpPos - 5); e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setPos(cmpPos + 5); e.preventDefault(); }
    if (e.key === 'Home') { setPos(0); e.preventDefault(); }
    if (e.key === 'End') { setPos(100); e.preventDefault(); }
  });
  var cmpProxy = { v: 50 };

  /* =========================================================
     BEADS (giọt nước)
     ========================================================= */
  function seeded(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
  function makeBeads(wrap, n, seed, minS, maxS, area) {
    var rnd = seeded(seed), html = '';
    for (var i = 0; i < n; i++) {
      var s = Math.round(minS + Math.pow(rnd(), 1.8) * (maxS - minS));
      var x = area[0] + rnd() * (area[2] - area[0]), y = area[1] + rnd() * (area[3] - area[1]);
      var sp = (0.4 + rnd() * 1.2).toFixed(2);
      html += '<span class="bead' + (rnd() > .5 ? ' is-oval' : '') + '" data-sp="' + sp + '" style="width:' + s + 'px;height:' + Math.round(s * (0.9 + rnd() * .14)) + 'px;left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%"></span>';
    }
    wrap.innerHTML = html;
    return $$('.bead', wrap);
  }
  var heroBeads = makeBeads($('[data-beads]'), 26, 7, 6, 34, [4, 14, 94, 72]);
  var glossBeads = makeBeads($('[data-gbeads]'), 22, 21, 6, 26, [6, 8, 92, 70]);
  var suds = (function () {
    var w = $('[data-suds]'), rnd = seeded(3), h = '';
    for (var i = 0; i < 22; i++) { var s = 16 + Math.round(rnd() * 46); h += '<span class="sud" style="width:' + s + 'px;height:' + s + 'px;left:' + (rnd() * 88).toFixed(1) + '%;top:' + (rnd() * 56).toFixed(1) + '%"></span>'; }
    w.innerHTML = h; return $$('.sud', w);
  })();

  /* =========================================================
     COUNTERS
     ========================================================= */
  function runCount(el, delay) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0), suf = el.getAttribute('data-suffix') || '';
    if (!HAS_GSAP || REDUCED) { el.textContent = fmtNum(to, dec) + suf; return; }
    var o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, delay: delay || 0, ease: 'power2.out', onUpdate: function () { el.textContent = fmtNum(o.v, dec) + suf; } });
  }

  /* =========================================================
     Pause CSS loops when off-screen
     ========================================================= */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { x.target.classList.toggle('is-off', !x.isIntersecting); }); });
    $$('.marquee, .hero').forEach(function (el) { io.observe(el); });
  }

  renderCart(); renderCombo();

  /* =========================================================
     GSAP MOTION
     ========================================================= */
  if (!HAS_GSAP || REDUCED) {
    $$('[data-count]').forEach(function (el) { runCount(el); });
    $$('.gloss__l0, .gloss__l1, .gloss__l2').forEach(function (l) { l.style.opacity = 0; });
    $$('.step').forEach(function (s) { s.classList.add('is-active'); });
    $('[data-gu]').textContent = '95'; $('[data-state]').textContent = 'Bóng gương';
    var bar = $('[data-story-bar]'); if (bar) bar.style.transform = 'scaleX(1)';
    return;
  }

  gsap.defaults({ ease: 'power3.out' });

  /* Intro */
  var intro = gsap.timeline({ delay: .1 });
  var words = $$('.hero__title .w');
  gsap.set(words, { yPercent: 70, opacity: 0, rotate: 3 });
  intro
    .to('.eyebrow', { opacity: 1, y: 0, duration: .7, startAt: { y: 16 } }, 0)
    .to(words, { yPercent: 0, rotate: 0, opacity: 1, duration: 1, stagger: .07, ease: 'expo.out' }, .1)
    .to('.hero__lead', { opacity: 1, y: 0, duration: .8, startAt: { y: 20 } }, .55)
    .to('.hero__cta', { opacity: 1, y: 0, duration: .8, startAt: { y: 20 } }, .65)
    .to('.hero__stats', { opacity: 1, y: 0, duration: .8, startAt: { y: 20 }, onStart: function () { $$('.hero__stats [data-count]').forEach(function (el, i) { runCount(el, i * .1); }); } }, .75)
    .to('[data-intro-visual]', { opacity: 1, duration: .01 }, .05)
    .from('.panel', { scale: .92, y: 40, opacity: 0, duration: 1.4, ease: 'expo.out', clearProps: 'transform' }, .05)
    .from('.panel__img img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, .05)
    .from(heroBeads, { scale: 0, opacity: 0, duration: .7, ease: 'back.out(2.2)', stagger: { each: .035, from: 'random' } }, .6)
    .from('.chip--tl', { y: 24, opacity: 0, duration: .8 }, .9)
    .from('.hero-card', { y: 30, opacity: 0, duration: .8 }, 1.0)
    .from('.seal', { scale: .4, rotate: -120, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' }, .8);

  /* Floating chips – paused off-screen */
  var floats = gsap.timeline({ repeat: -1, yoyo: true, paused: true, delay: 2 })
    .to('.chip--tl', { y: -8, duration: 2.6, ease: 'sine.inOut' }, 0)
    .to('.hero-card', { y: -6, duration: 3, ease: 'sine.inOut' }, .4);
  setTimeout(function () { floats.play(); }, 2000);
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? floats.play() : floats.pause(); } });

  /* Hero scroll: beads roll down the panel + parallax */
  var heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });
  heroTl.to('.panel__img', { yPercent: 7, ease: 'none' }, 0)
    .to('.hero__ripple', { yPercent: 18, ease: 'none' }, 0);
  heroBeads.forEach(function (b) {
    var sp = parseFloat(b.getAttribute('data-sp'));
    heroTl.to(b, { y: 120 * sp + 30, x: (sp - 1) * 18, ease: 'none' }, 0);
  });

  /* Gloss story (pinned, 3 steps) */
  var stepsEls = $$('.step'), guEl = $('[data-gu]'), stateEl = $('[data-state]');
  var lastStep = -1, lastState = '', gu = { v: 18 }, lastGu = 18;
  var STATES = ['Xỉn màu', 'Sạch bụi sắt', 'Hết vết xoáy', 'Bóng gương'];
  function storyUpdate(p) {
    var s = p < .34 ? 0 : p < .64 ? 1 : 2;
    if (s !== lastStep) { lastStep = s; stepsEls.forEach(function (el, i) { el.classList.toggle('is-active', i === s); }); }
    var st = p < .12 ? STATES[0] : p < .4 ? STATES[1] : p < .72 ? STATES[2] : STATES[3];
    if (st !== lastState) { lastState = st; stateEl.textContent = st; }
  }
  var mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, function (ctx) {
    var desk = ctx.conditions.desk;
    gsap.set(suds, { opacity: 0, scale: .5 });
    gsap.set(glossBeads, { scale: 0, opacity: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.story', pin: '.story__pin', start: 'top top', end: desk ? '+=240%' : '+=200%', scrub: .5, anticipatePin: 1,
        onUpdate: function (self) { storyUpdate(self.progress); }
      }
    });
    tl.to('[data-story-bar]', { scaleX: 1, duration: 10 }, 0)
      .to(suds, { opacity: .92, scale: 1, duration: .8, stagger: .04, ease: 'power2.out' }, 0)
      .to(suds, { y: function (i) { return 140 + (i % 4) * 40; }, opacity: 0, duration: 2, stagger: .05, ease: 'power1.in' }, 1.1)
      .to('.gloss__l0', { opacity: 0, duration: 2.2 }, .9)
      .to(gu, { v: 46, duration: 2.4, onUpdate: writeGu }, .8)
      .fromTo('[data-sheen]', { xPercent: -160 }, { xPercent: 420, duration: 1.8, ease: 'power1.inOut' }, 3.6)
      .to('.gloss__l1', { opacity: 0, duration: 2.2 }, 3.7)
      .to(gu, { v: 78, duration: 2.4, onUpdate: writeGu }, 3.6)
      .to('.gloss__l2', { opacity: 0, duration: 2 }, 6.6)
      .to(glossBeads, { scale: 1, opacity: 1, duration: .7, stagger: { each: .06, from: 'random' }, ease: 'back.out(2)' }, 7.0)
      .fromTo('[data-sheen]', { xPercent: -160 }, { xPercent: 420, duration: 1.8, ease: 'power1.inOut', immediateRender: false }, 7.6)
      .to(gu, { v: 95, duration: 2.4, onUpdate: writeGu }, 6.6)
      .to({}, { duration: .6 }, 9.4);
    return function () { gu.v = 18; writeGu(); lastStep = -1; lastState = ''; };
  });
  function writeGu() { var v = Math.round(gu.v); if (v !== lastGu) { lastGu = v; guEl.textContent = v; } }

  /* Generic reveals */
  function revealBatch(sel, opts) {
    var els = $$(sel); if (!els.length) return;
    gsap.set(els, { opacity: 0, y: opts && opts.y != null ? opts.y : 34 });
    ScrollTrigger.batch(els, {
      start: 'top 88%', once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out', overwrite: true, clearProps: 'transform' }); }
    });
  }
  revealBatch('[data-reveal]');
  revealBatch('[data-reveal-cat]', { y: 40 });
  revealBatch('.card', { y: 40 });
  revealBatch('.ci', { y: 24 });
  revealBatch('[data-reveal-pkg]', { y: 50 });
  revealBatch('[data-reveal-tip]', { y: 46 });
  revealBatch('.rv', { y: 30 });

  /* Counters elsewhere */
  $$('[data-count]').forEach(function (el) {
    if (el.closest('.hero__stats')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { runCount(el); } });
  });

  /* Header state + active nav */
  var hdr = $('#hdr');
  ScrollTrigger.create({ start: 60, end: 'max', onToggle: function (s) { hdr.classList.toggle('is-stuck', s.isActive); } });
  $$('.nav a').forEach(function (a) {
    var sec = doc.getElementById(a.getAttribute('href').slice(1)); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: function (s) { a.classList.toggle('is-active', s.isActive); } });
  });

  /* Services image parallax */
  $$('.svc__img img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: .5 } });
  });

  /* Before/after hint sweep */
  ScrollTrigger.create({
    trigger: cmp, start: 'top 70%', once: true,
    onEnter: function () {
      cmpProxy.v = cmpPos;
      gsap.timeline({ onUpdate: function () { setPos(cmpProxy.v); } })
        .to(cmpProxy, { v: 24, duration: .9, ease: 'power2.inOut' })
        .to(cmpProxy, { v: 76, duration: 1.1, ease: 'power2.inOut' })
        .to(cmpProxy, { v: 50, duration: .8, ease: 'power2.inOut' });
    }
  });

  /* Packages head: gentle scale-in of the car strip */
  gsap.from('.carstrip__imgs', { scale: .9, opacity: 0, duration: 1, scrollTrigger: { trigger: '.carstrip', start: 'top 85%', once: true } });

  /* Booking decorative ripple parallax */
  gsap.fromTo('.bk-form', { y: 40 }, { y: -10, ease: 'none', scrollTrigger: { trigger: '.booking', start: 'top bottom', end: 'bottom top', scrub: .6 } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
