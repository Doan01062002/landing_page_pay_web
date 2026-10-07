/* LUMEN – Độ đèn ô tô · main script (cửa hàng mẫu) */
(function () {
  'use strict';

  var D = window.LUMEN_DATA;
  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = hasGSAP && !reduce;

  if (anim) { gsap.registerPlugin(ScrollTrigger); }
  else { root.classList.remove('gsap-on'); }

  /* ---------- helpers ---------- */
  function group(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmt(n) { return group(n) + '₫'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function dec1(n) { return n.toFixed(1).replace('.', ','); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var PHONE_RE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return String(v || '').replace(/[\s.\-()]/g, ''); }

  var byId = {}; D.PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  var catById = {}; D.CATS.forEach(function (c) { catById[c.id] = c; });
  var carById = {}; D.CARS.forEach(function (c) { carById[c.id] = c; });

  function starsHTML(r) { return '<span class="stars" style="--r:' + (r / 5 * 100).toFixed(1) + '%" aria-label="' + dec1(r) + ' trên 5 sao"><span class="stars-bg"></span><span class="stars-fg"></span></span>'; }

  function illus(p) {
    return '<svg class="p-illus" viewBox="0 0 400 300" role="img" aria-label="Minh hoạ ' + esc(p.name) + '">' +
      '<rect width="400" height="300" fill="#081129"/>' +
      '<path d="M40 40 H360 L380 260 H20Z" fill="#0d1a3d" stroke="#1f2d5a" stroke-width="2"/>' +
      '<g fill="#2ee6ff" opacity=".55"><path d="M80 90c0 0-8 12-8 18a8 8 0 0 0 16 0c0-6-8-18-8-18z"/><path d="M110 140c0 0-6 9-6 13a6 6 0 0 0 12 0c0-4-6-13-6-13z"/><path d="M70 170c0 0-7 10-7 15a7 7 0 0 0 14 0c0-5-7-15-7-15z"/></g>' +
      '<g stroke="#ffb020" stroke-width="5" stroke-linecap="round"><path d="M318 80v14M318 146v14M278 120h14M344 120h14M290 92l10 10M336 138l10 10M346 92l-10 10M300 138l-10 10"/></g>' +
      '<circle cx="318" cy="120" r="18" fill="#ffb020"/>' +
      '<g fill="none" stroke="#2ee6ff" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M160 100a60 60 0 0 1 80 0"/><path d="M145 82a84 84 0 0 1 110 0" opacity=".5"/></g>' +
      '<rect x="140" y="130" width="120" height="96" rx="22" fill="#111d44" stroke="#2c3d78" stroke-width="3"/>' +
      '<circle cx="200" cy="170" r="30" fill="#0a1330" stroke="#2ee6ff" stroke-width="3"/>' +
      '<circle cx="200" cy="170" r="18" fill="#2ee6ff" opacity=".25"/><circle cx="200" cy="170" r="8" fill="#e9fdff"/>' +
      '<text x="200" y="216" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="14" letter-spacing="3" fill="#2ee6ff">AUTO</text>' +
      '</svg>';
  }
  function pImg(p, w, h, sizes, eager) {
    if (!p.img) return illus(p);
    var w2 = Math.round(w * 0.625), h2 = Math.round(h * 0.625);
    return '<img src="' + D.U(p.img, w, h) + '" srcset="' + D.U(p.img, w2, h2) + ' ' + w2 + 'w, ' + D.U(p.img, w, h) + ' ' + w + 'w" sizes="' + (sizes || '(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 300px') + '" width="' + w + '" height="' + h + '" alt="' + esc(p.name) + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  function cardHTML(p) {
    var off = Math.round((1 - p.price / p.old) * 100);
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="card-media">' + pImg(p, 640, 480) +
      '<span class="badge-sale">-' + off + '%</span>' + (p.tag ? '<span class="badge-tag">' + p.tag + '</span>' : '') +
      '<button class="qv-btn" data-qv="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '"><svg class="ic"><use href="#i-eye"/></svg>Xem nhanh</button></div>' +
      '<div class="card-body"><p class="card-cat">' + catById[p.cat].name + '</p>' +
      '<h3 class="card-title"><button type="button" data-qv="' + p.id + '">' + esc(p.name) + '</button></h3>' +
      '<p class="card-spec">' + p.spec + '</p>' +
      '<div class="rating">' + starsHTML(p.rating) + '<span>' + dec1(p.rating) + ' (' + p.reviews + ')</span></div>' +
      '<div class="price"><b>' + fmt(p.price) + '</b><s>' + fmt(p.old) + '</s></div>' +
      '<button type="button" class="btn btn-primary btn-add" data-add="' + p.id + '"><svg class="ic"><use href="#i-cart"/></svg><span>Thêm vào giỏ</span></button>' +
      '</div></article>';
  }

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------- smooth in-page links ---------- */
  function goTo(hash) {
    var id = hash.replace('#', '');
    if (id === 'top') { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return true; }
    var t = doc.getElementById(id);
    if (!t) return false;
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    return true;
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.length < 2) { e.preventDefault(); return; }
    e.preventDefault();
    closeMenu();
    goTo(h);
  });

  /* ---------- header ---------- */
  var header = $('#header'), scrolledOn = false;
  function onScroll() {
    var s = window.scrollY > 12;
    if (s !== scrolledOn) { scrolledOn = s; header.classList.toggle('scrolled', s); }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mobile menu ---------- */
  var menu = $('#mobileMenu'), menuBtn = $('#menuBtn'), menuOv = $('#menuOverlay');
  function openMenu() {
    menuOv.hidden = false; requestAnimationFrame(function () { menuOv.classList.add('show'); });
    menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); menuBtn.setAttribute('aria-expanded', 'true');
    root.style.overflow = 'hidden';
    if (anim) gsap.fromTo($$('.m-menu-nav a'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .4, stagger: .03, ease: 'power2.out', delay: .1 });
    setTimeout(function () { var b = $('[data-close-menu]', menu); b && b.focus(); }, 50);
  }
  function closeMenu() {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); menuBtn.setAttribute('aria-expanded', 'false');
    menuOv.classList.remove('show'); setTimeout(function () { menuOv.hidden = true; }, 300);
    if (!cartOpen && qvEl.hidden) root.style.overflow = '';
  }
  menuBtn.addEventListener('click', openMenu);
  menuOv.addEventListener('click', closeMenu);
  $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', closeMenu); });

  /* ---------- countdown (to local midnight) ---------- */
  var cds = $$('[data-countdown]');
  function tickCd() {
    var now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
    var d = Math.max(0, Math.floor((end - now) / 1000));
    var h = String(Math.floor(d / 3600)).padStart(2, '0'), m = String(Math.floor(d % 3600 / 60)).padStart(2, '0'), s = String(d % 60).padStart(2, '0');
    cds.forEach(function (c) { $('[data-h]', c).textContent = h; $('[data-m]', c).textContent = m; $('[data-s]', c).textContent = s; });
  }
  tickCd(); setInterval(tickCd, 1000);

  /* ---------- categories ---------- */
  var catsEl = $('#cats');
  catsEl.innerHTML = D.CATS.map(function (c) {
    var n = D.PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
    return '<button type="button" class="cat" data-cat="' + c.id + '"><span class="cat-n">' + n + '</span><span class="cat-ic"><svg class="ic"><use href="#' + c.icon + '"/></svg></span><b>' + c.name + '</b><small>' + c.desc + '</small></button>';
  }).join('');
  catsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    state.types = [b.dataset.cat]; state.q = ''; syncSearch(''); syncChips(); renderGrid(true);
    goTo('#san-pham');
  });
  $('#footCats').innerHTML = D.CATS.slice(0, 6).map(function (c) { return '<li><a href="#san-pham" data-fcat="' + c.id + '">' + c.name + '</a></li>'; }).join('');
  $('#footCats').addEventListener('click', function (e) {
    var a = e.target.closest('[data-fcat]'); if (!a) return;
    state.types = [a.dataset.fcat]; syncChips(); renderGrid(true);
  });

  /* ---------- flash sale ---------- */
  var sale = D.PRODUCTS.slice().sort(function (a, b) { return (1 - b.price / b.old) - (1 - a.price / a.old); }).slice(0, 8);
  $('#saleTrack').innerHTML = sale.map(cardHTML).join('');

  /* ---------- catalogue ---------- */
  var state = { types: [], car: '', price: '', q: '', sort: 'hot' };
  var grid = $('#grid'), emptyEl = $('#empty'), resultLine = $('#resultLine');
  var fType = $('#fType'), fCar = $('#fCar'), fPrice = $('#fPrice');
  fType.innerHTML = D.CATS.map(function (c) { return '<button type="button" class="chip" data-type="' + c.id + '" aria-pressed="false">' + c.name + '</button>'; }).join('');
  fCar.innerHTML = '<button type="button" class="chip" data-car="" aria-pressed="true">Tất cả</button>' + D.CARS.map(function (c) { return '<button type="button" class="chip" data-car="' + c.id + '" aria-pressed="false">' + c.name + '</button>'; }).join('');
  fPrice.innerHTML = '<button type="button" class="chip" data-price="" aria-pressed="true">Tất cả</button>' + D.PRICES.map(function (c) { return '<button type="button" class="chip" data-price="' + c.id + '" aria-pressed="false">' + c.name + '</button>'; }).join('');

  function syncChips() {
    $$('[data-type]', fType).forEach(function (b) { b.setAttribute('aria-pressed', state.types.indexOf(b.dataset.type) > -1 ? 'true' : 'false'); });
    $$('[data-car]', fCar).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.car === state.car ? 'true' : 'false'); });
    $$('[data-price]', fPrice).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.price === state.price ? 'true' : 'false'); });
    var n = state.types.length + (state.car ? 1 : 0) + (state.price ? 1 : 0);
    var fc = $('#fCount'); fc.hidden = !n; fc.textContent = n;
  }
  fType.addEventListener('click', function (e) {
    var b = e.target.closest('[data-type]'); if (!b) return;
    var i = state.types.indexOf(b.dataset.type);
    if (i > -1) state.types.splice(i, 1); else state.types.push(b.dataset.type);
    syncChips(); renderGrid(true);
  });
  fCar.addEventListener('click', function (e) { var b = e.target.closest('[data-car]'); if (!b) return; state.car = b.dataset.car; syncChips(); renderGrid(true); });
  fPrice.addEventListener('click', function (e) { var b = e.target.closest('[data-price]'); if (!b) return; state.price = b.dataset.price; syncChips(); renderGrid(true); });
  $('#sortSel').addEventListener('change', function () { state.sort = this.value; renderGrid(true); });
  function resetFilters() { state.types = []; state.car = ''; state.price = ''; state.q = ''; syncSearch(''); syncChips(); renderGrid(true); }
  $('#fReset').addEventListener('click', resetFilters);
  $$('[data-reset]').forEach(function (b) { b.addEventListener('click', resetFilters); });
  $('#filterToggle').addEventListener('click', function () {
    var f = $('#filters'), o = !f.classList.contains('open');
    f.classList.toggle('open', o); this.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o && anim) gsap.fromTo(f, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' });
  });

  function filtered() {
    var q = norm(state.q.trim());
    var pr = D.PRICES.filter(function (x) { return x.id === state.price; })[0];
    var list = D.PRODUCTS.filter(function (p) {
      if (state.types.length && state.types.indexOf(p.cat) < 0) return false;
      if (state.car && p.cars.indexOf(state.car) < 0) return false;
      if (pr && (p.price < pr.min || p.price >= pr.max)) return false;
      if (q) {
        var hay = norm(p.name + ' ' + catById[p.cat].name + ' ' + p.spec + ' ' + p.cars.map(function (c) { return carById[c].name; }).join(' '));
        var ok = q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
        if (!ok) return false;
      }
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'price-asc') return a.price - b.price;
      if (s === 'price-desc') return b.price - a.price;
      if (s === 'sale') return (b.old - b.price) / b.old - (a.old - a.price) / a.old;
      if (s === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      return b.hot - a.hot || b.reviews - a.reviews;
    });
    return list;
  }
  var gridBatch = [];
  function renderGrid(animate) {
    var list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    emptyEl.hidden = list.length > 0;
    resultLine.innerHTML = 'Hiển thị <b>' + list.length + '</b> / ' + D.PRODUCTS.length + ' sản phẩm' + (state.q.trim() ? ' cho “' + esc(state.q.trim()) + '”' : '');
    gridBatch.forEach(function (t) { t.kill(); }); gridBatch = [];
    var cards = $$('.card', grid);
    if (!anim) return;
    if (animate) {
      gsap.fromTo(cards.slice(0, 12), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power2.out', clearProps: 'transform' });
    } else {
      gsap.set(cards, { opacity: 0, y: 40 });
      gridBatch = ScrollTrigger.batch(cards, {
        start: 'top 92%', once: true,
        onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'transform' }); }
      });
    }
  }
  syncChips();

  /* ---------- search ---------- */
  var sIn = $('#searchInput'), sInM = $('#searchInputM'), sT;
  function syncSearch(v) { sIn.value = v; sInM.value = v; }
  function onSearch(e) {
    var v = e.target.value; state.q = v; (e.target === sIn ? sInM : sIn).value = v;
    clearTimeout(sT); sT = setTimeout(function () { renderGrid(true); }, 140);
  }
  sIn.addEventListener('input', onSearch); sInM.addEventListener('input', onSearch);
  function onSubmit(e) { e.preventDefault(); clearTimeout(sT); renderGrid(true); goTo('#san-pham'); e.target.querySelector('input').blur(); }
  $('#searchForm').addEventListener('submit', onSubmit); $('#searchFormM').addEventListener('submit', onSubmit);
  $('#searchToggle').addEventListener('click', function () {
    var m = $('#mSearch'), o = !m.classList.contains('open'); m.classList.toggle('open', o);
    if (o) sInM.focus();
  });

  /* ---------- cart ---------- */
  var CART_KEY = 'lumen_cart_v1';
  var cart = (store.get(CART_KEY, []) || []).filter(function (i) { return i && byId[i.id] && i.qty > 0; });
  var cartEl = $('#cart'), cartOv = $('#cartOverlay'), cartOpen = false;
  function saveCart() { store.set(CART_KEY, cart); }
  function cartCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (s, i) { return s + i.qty * byId[i.id].price; }, 0); }
  function renderCart() {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = n; b.classList.toggle('zero', n === 0); });
    $('#cartQty').textContent = n ? '(' + n + ' sản phẩm)' : '';
    $('#cartList').innerHTML = cart.map(function (i) {
      var p = byId[i.id];
      return '<li class="ci" data-id="' + p.id + '"><div class="ci-img">' + (p.img ? '<img src="' + D.U(p.img, 160, 160) + '" width="76" height="76" alt="" loading="lazy" decoding="async">' : illus(p)) + '</div>' +
        '<div><p class="ci-name">' + esc(p.name) + '</p><p class="ci-price">' + fmt(p.price) + '</p>' +
        '<div class="ci-row"><div class="qty"><button type="button" data-dec aria-label="Giảm số lượng"><svg class="ic"><use href="#i-minus"/></svg></button><span>' + i.qty + '</span><button type="button" data-inc aria-label="Tăng số lượng"><svg class="ic"><use href="#i-plus"/></svg></button></div>' +
        '<button type="button" class="ci-del" data-del aria-label="Xoá ' + esc(p.name) + '"><svg class="ic"><use href="#i-trash"/></svg></button></div></div></li>';
    }).join('');
    $('#cartEmpty').hidden = n > 0;
    $('#cartSubtotal').textContent = fmt(cartTotal());
    var inCheckout = !$('#checkout').hidden || !$('#orderOk').hidden;
    $('#cartFoot').hidden = n === 0 || inCheckout;
  }
  function addToCart(id, qty, srcEl) {
    qty = qty || 1;
    var it = cart.filter(function (i) { return i.id === id; })[0];
    if (it) it.qty = Math.min(99, it.qty + qty); else cart.push({ id: id, qty: qty });
    saveCart(); renderCart();
    flyToCart(srcEl);
    toast('Đã thêm “' + byId[id].name + '” vào giỏ');
  }
  function bump() {
    if (!anim) return;
    gsap.fromTo('[data-cart-count]', { scale: 1.7 }, { scale: 1, duration: .7, ease: 'elastic.out(1, .4)' });
    gsap.fromTo('[data-cart-target] .ic', { rotate: -14 }, { rotate: 0, duration: .6, ease: 'elastic.out(1, .35)' });
  }
  function cartTarget() {
    var m = $('#cartBtnM');
    return (window.innerWidth <= 900 && m) ? m : $('#cartBtn');
  }
  function flyToCart(srcEl) {
    if (!anim || !srcEl) { bump(); return; }
    var t = cartTarget(); if (!t) { bump(); return; }
    var r = srcEl.getBoundingClientRect(), tr = t.getBoundingClientRect();
    var f = doc.createElement('div'); f.className = 'fly';
    var clone = srcEl.cloneNode(true); clone.removeAttribute('srcset'); clone.removeAttribute('loading');
    f.appendChild(clone); doc.body.appendChild(f);
    var sx = r.left + r.width / 2 - 32, sy = r.top + r.height / 2 - 32, tx = tr.left + tr.width / 2 - 32, ty = tr.top + tr.height / 2 - 32;
    gsap.set(f, { x: sx, y: sy, scale: 1.6, opacity: 0 });
    gsap.timeline({ onComplete: function () { f.remove(); bump(); } })
      .to(f, { opacity: 1, scale: 1, duration: .22, ease: 'power2.out' })
      .to(f, { x: tx, duration: .8, ease: 'power1.inOut' }, .12)
      .to(f, { y: ty, duration: .8, ease: 'back.in(1.6)' }, .12)
      .to(f, { scale: .25, opacity: .2, duration: .22, ease: 'power2.in' }, .72);
  }
  function openCart() {
    cartOpen = true; toastEl.classList.remove('show'); cartOv.hidden = false; requestAnimationFrame(function () { cartOv.classList.add('show'); });
    cartEl.classList.add('open'); cartEl.setAttribute('aria-hidden', 'false'); root.style.overflow = 'hidden';
    setTimeout(function () { var b = $('[data-close-cart]', cartEl); b && b.focus(); }, 60);
    if (anim) gsap.fromTo($$('.ci', cartEl), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .4, stagger: .05, delay: .15, ease: 'power2.out' });
  }
  function closeCart() {
    if (!cartOpen) return;
    cartOpen = false; cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true');
    cartOv.classList.remove('show'); setTimeout(function () { cartOv.hidden = true; }, 300);
    if (qvEl.hidden) root.style.overflow = '';
    if (!$('#orderOk').hidden) setTimeout(showCartView, 450);
  }
  function showCartView() { $('#cartView').hidden = false; $('#checkout').hidden = true; $('#orderOk').hidden = true; renderCart(); }
  $$('[data-cart-target]').forEach(function (b) { b.addEventListener('click', openCart); });
  cartOv.addEventListener('click', closeCart);
  $$('[data-close-cart]').forEach(function (b) {
    b.addEventListener('click', function () { closeCart(); if (b.dataset.goto) setTimeout(function () { goTo(b.dataset.goto); }, 150); });
  });
  $('#cartList').addEventListener('click', function (e) {
    var li = e.target.closest('.ci'); if (!li) return;
    var it = cart.filter(function (i) { return i.id === li.dataset.id; })[0]; if (!it) return;
    if (e.target.closest('[data-inc]')) it.qty = Math.min(99, it.qty + 1);
    else if (e.target.closest('[data-dec]')) it.qty -= 1;
    else if (e.target.closest('[data-del]')) it.qty = 0;
    else return;
    cart = cart.filter(function (i) { return i.qty > 0; });
    saveCart(); renderCart();
  });
  $('#toCheckout').addEventListener('click', function () {
    if (!cart.length) return;
    $('#cartView').hidden = true; $('#checkout').hidden = false; $('#cartFoot').hidden = true;
    var f = $('#checkout'); $('[name=name]', f).focus();
  });
  $('#backToCart').addEventListener('click', showCartView);

  function showErr(form, msgs, bad) {
    $$('.field', form).forEach(function (f) { f.classList.remove('invalid'); });
    bad.forEach(function (n) { var i = $('[name=' + n + ']', form); i && i.closest('.field').classList.add('invalid'); });
    var e = $('[data-err]', form);
    if (msgs.length) { e.innerHTML = msgs.join('<br>'); e.hidden = false; var first = $('[name=' + bad[0] + ']', form); first && first.focus(); }
    else e.hidden = true;
    return msgs.length === 0;
  }
  $('#checkout').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, name = f.name.value.trim(), phone = cleanPhone(f.phone.value), addr = f.address.value.trim();
    var msgs = [], bad = [];
    if (name.length < 2) { msgs.push('Vui lòng nhập họ tên.'); bad.push('name'); }
    if (!PHONE_RE.test(phone)) { msgs.push('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).'); bad.push('phone'); }
    if (addr.length < 5) { msgs.push('Vui lòng nhập địa chỉ nhận hàng / lắp đặt.'); bad.push('address'); }
    if (!showErr(f, msgs, bad)) return;
    var code = 'LM' + String(Math.floor(10000 + Math.random() * 89999));
    var total = cartTotal(), n = cartCount();
    $('#orderOk').innerHTML = '<span class="ok-ic"><svg class="ic"><use href="#i-check"/></svg></span><h4>Đặt hàng thành công!</h4>' +
      '<p>Cảm ơn <b>' + esc(name) + '</b>. Mã đơn <b class="cyan">' + code + '</b> – ' + n + ' sản phẩm, tổng <b class="amber">' + fmt(total) + '</b>. LUMEN sẽ gọi <b>' + esc(phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')) + '</b> để hẹn lịch lắp.</p>' +
      '<p class="small muted">(Đơn hàng demo – không có giao dịch thật)</p><button type="button" class="btn btn-ghost btn-sm" id="okClose">Tiếp tục mua sắm</button>';
    cart = []; saveCart(); f.reset();
    $('#checkout').hidden = true; $('#orderOk').hidden = false; renderCart();
    $('#okClose').addEventListener('click', closeCart);
    if (anim) gsap.fromTo('#orderOk > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .08, ease: 'power2.out' });
  });

  /* ---------- add / quick view delegation ---------- */
  doc.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var card = add.closest('.card');
      var img = card ? $('.card-media img, .card-media svg', card) : null;
      addToCart(add.dataset.add, 1, img);
      add.classList.add('added'); var sp = $('span', add); var old = sp ? sp.textContent : '';
      if (sp) sp.textContent = 'Đã thêm';
      setTimeout(function () { add.classList.remove('added'); if (sp) sp.textContent = old; }, 1400);
      return;
    }
    var qv = e.target.closest('[data-qv]');
    if (qv) openQV(qv.dataset.qv, qv);
  });

  var qvEl = $('#qv'), qvBody = $('#qvBody'), qvLast = null, qvQty = 1;
  function openQV(id, from) {
    var p = byId[id]; if (!p) return;
    qvLast = from || null; qvQty = 1;
    var off = Math.round((1 - p.price / p.old) * 100);
    qvBody.innerHTML = '<div class="qv-media">' + pImg(p, 900, 900, '(max-width: 640px) 100vw, 460px', true) + '<span class="badge-sale">-' + off + '%</span></div>' +
      '<div class="qv-info"><p class="card-cat">' + catById[p.cat].name + '</p><h3 id="qvTitle">' + esc(p.name) + '</h3>' +
      '<div class="rating">' + starsHTML(p.rating) + '<span>' + dec1(p.rating) + ' · ' + p.reviews + ' đánh giá</span></div>' +
      '<div class="price"><b>' + fmt(p.price) + '</b><s>' + fmt(p.old) + '</s></div>' +
      '<ul>' + p.specs.map(function (s) { return '<li><svg class="ic"><use href="#i-check"/></svg>' + s + '</li>'; }).join('') + '</ul>' +
      '<p class="small muted">Phù hợp dòng xe:</p><div class="qv-cars">' + p.cars.map(function (c) { return '<span>' + carById[c].name + '</span>'; }).join('') + '</div>' +
      '<div class="qv-actions"><div class="qty"><button type="button" data-qdec aria-label="Giảm"><svg class="ic"><use href="#i-minus"/></svg></button><span id="qvQty">1</span><button type="button" data-qinc aria-label="Tăng"><svg class="ic"><use href="#i-plus"/></svg></button></div>' +
      '<button type="button" class="btn btn-primary" id="qvAdd"><svg class="ic"><use href="#i-cart"/></svg> Thêm vào giỏ</button></div>' +
      '<a href="#dat-lich" class="btn btn-ghost btn-sm" data-close-qv><svg class="ic"><use href="#i-calendar"/></svg> Đặt lịch lắp sản phẩm này</a>' +
      '<p class="small muted">Giá đã gồm công lắp tại xưởng · Bảo hành điện tử</p></div>';
    qvEl.hidden = false; root.style.overflow = 'hidden';
    if (anim) {
      gsap.fromTo($('.modal-bg', qvEl), { opacity: 0 }, { opacity: 1, duration: .3 });
      gsap.fromTo($('.modal-box', qvEl), { opacity: 0, y: 30, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out' });
    }
    $('.modal-x', qvEl).focus();
    $('[data-qinc]', qvBody).onclick = function () { qvQty = Math.min(99, qvQty + 1); $('#qvQty').textContent = qvQty; };
    $('[data-qdec]', qvBody).onclick = function () { qvQty = Math.max(1, qvQty - 1); $('#qvQty').textContent = qvQty; };
    $('#qvAdd').onclick = function () {
      var img = $('.qv-media img, .qv-media svg', qvBody);
      addToCart(p.id, qvQty, img); closeQV();
    };
  }
  function closeQV() {
    if (qvEl.hidden) return;
    var done = function () { qvEl.hidden = true; if (!cartOpen && !menu.classList.contains('open')) root.style.overflow = ''; if (qvLast && qvLast.focus) qvLast.focus({ preventScroll: true }); };
    if (anim) {
      gsap.to($('.modal-box', qvEl), { opacity: 0, y: 20, scale: .97, duration: .22, ease: 'power2.in' });
      gsap.to($('.modal-bg', qvEl), { opacity: 0, duration: .22, onComplete: done });
    } else done();
  }
  qvEl.addEventListener('click', function (e) { if (e.target.closest('[data-close-qv]')) closeQV(); });

  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!qvEl.hidden) closeQV();
    else if (cartOpen) closeCart();
    else if (menu.classList.contains('open')) closeMenu();
  });

  /* ---------- spec table ---------- */
  var maxLm = 6500, maxLife = 60000, maxWar = 36;
  $('#specRows').innerHTML = D.SPEC.map(function (r) {
    var cls = r.tone === 'amber' ? ' amber' : '';
    var kpos = Math.max(0, Math.min(100, (r.k - 2500) / (7000 - 2500) * 100));
    return '<div class="spec-row' + (r.best ? ' best' : '') + '" role="row">' +
      '<div class="spec-name" role="cell"><b>' + r.name + (r.best ? ' <span class="pill">Khuyên dùng</span>' : '') + '</b><small>' + r.note + '</small></div>' +
      '<div class="spec-cell" role="cell"><span class="lab">Quang thông</span><span class="spec-val"><span data-num="' + r.lm + '">' + group(r.lm) + '</span> lm</span><span class="bar' + cls + '"><i style="--v:' + (r.lm / maxLm).toFixed(3) + '"></i></span></div>' +
      '<div class="spec-cell" role="cell"><span class="lab">Nhiệt độ màu</span><span class="spec-val"><span data-num="' + r.k + '">' + group(r.k) + '</span>K</span><span class="kbar"><i style="--v:' + kpos.toFixed(1) + '%"></i></span></div>' +
      '<div class="spec-cell" role="cell"><span class="lab">Tuổi thọ</span><span class="spec-val"><span data-num="' + r.life + '">' + group(r.life) + '</span> giờ</span><span class="bar' + cls + '"><i style="--v:' + (r.life / maxLife).toFixed(3) + '"></i></span></div>' +
      '<div class="spec-cell" role="cell"><span class="lab">Bảo hành</span><span class="spec-val"><span data-num="' + r.war + '">' + r.war + '</span> tháng</span><span class="bar' + cls + '"><i style="--v:' + (r.war / maxWar).toFixed(3) + '"></i></span></div>' +
      '</div>';
  }).join('');

  /* ---------- ambient ---------- */
  var ambSec = $('#ambient'), ambName = $('#ambName'), swEl = $('#swatches');
  swEl.innerHTML = D.SWATCHES.map(function (s, i) {
    return '<button type="button" class="sw" role="radio" aria-checked="' + (i === 0 ? 'true' : 'false') + '" aria-label="' + s.n + '" title="' + s.n + '" style="--c:' + s.c + '" data-c="' + s.c + '" data-n="' + s.n + '"></button>';
  }).join('');
  function setAmb(c) { ambSec.style.setProperty('--amb', c); }
  var cycleTween = null, cycleObj = { h: 190 }, cycleOn = false, ambVisible = false;
  function stopCycle() {
    if (!cycleOn) return; cycleOn = false; ambSec.classList.remove('cycling');
    if (cycleTween) cycleTween.pause();
    var b = $('#ambCycle'); b.setAttribute('aria-pressed', 'false'); $('use', b).setAttribute('href', '#i-play');
  }
  swEl.addEventListener('click', function (e) {
    var b = e.target.closest('.sw'); if (!b) return;
    stopCycle();
    $$('.sw', swEl).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    setAmb(b.dataset.c); ambName.textContent = b.dataset.n;
    if (anim) gsap.fromTo('.amb-badge', { scale: 1.08 }, { scale: 1, duration: .5, ease: 'back.out(2)' });
  });
  $('#ambCycle').addEventListener('click', function () {
    if (cycleOn) { stopCycle(); return; }
    cycleOn = true; ambSec.classList.add('cycling');
    this.setAttribute('aria-pressed', 'true'); $('use', this).setAttribute('href', '#i-pause');
    $$('.sw', swEl).forEach(function (x) { x.setAttribute('aria-checked', 'false'); });
    ambName.textContent = 'Chuyển màu 64 sắc';
    if (hasGSAP) {
      if (!cycleTween) cycleTween = gsap.to(cycleObj, { h: '+=360', duration: 9, ease: 'none', repeat: -1, onUpdate: function () { setAmb('hsl(' + (cycleObj.h % 360).toFixed(0) + ' 100% 60%)'); } });
      if (ambVisible) cycleTween.play(); else cycleTween.pause();
    }
  });

  /* ---------- gallery ---------- */
  $('#galleryTrack').innerHTML = D.GALLERY.map(function (g, i) {
    return '<figure class="g-item"><img src="' + D.U(g.id, 640, 800) + '" srcset="' + D.U(g.id, 420, 525) + ' 420w, ' + D.U(g.id, 640, 800) + ' 640w" sizes="(max-width: 640px) 74vw, 400px" width="640" height="800" alt="' + esc(g.t + ' – ' + g.d) + '" loading="lazy" decoding="async">' +
      '<span class="g-n">' + String(i + 1).padStart(2, '0') + '</span><figcaption><b>' + g.t + '</b><span>' + g.d + '</span></figcaption></figure>';
  }).join('');

  /* ---------- reviews ---------- */
  $('#reviewTrack').innerHTML = D.REVIEWS.map(function (r) {
    var ini = r.n.split(' ').pop().charAt(0);
    return '<article class="rv"><span class="rv-q" aria-hidden="true">“</span>' + starsHTML(r.r) + '<p>' + r.t + '</p>' +
      '<div class="rv-who"><span class="av">' + ini + '</span><div><b>' + r.n + '</b><small>' + r.car + ' · Khách đã lắp</small></div></div></article>';
  }).join('');

  /* ---------- sliders (native scroll + auto advance) ---------- */
  function initSlider(el) {
    var track = $('.slider-track', el), prev = $('[data-prev]', el), next = $('[data-next]', el);
    var autoMs = +el.dataset.auto || 0, paused = false, visible = false, resumeT;
    function step(dir) {
      var items = track.children; if (!items.length) return;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 18;
      var w = items[0].getBoundingClientRect().width + gap;
      var max = track.scrollWidth - track.clientWidth, x = track.scrollLeft + dir * w;
      if (dir > 0 && track.scrollLeft >= max - 4) x = 0;
      else if (dir < 0 && track.scrollLeft <= 4) x = max;
      track.scrollTo({ left: x, behavior: reduce ? 'auto' : 'smooth' });
    }
    function hold() { paused = true; clearTimeout(resumeT); }
    function release() { clearTimeout(resumeT); resumeT = setTimeout(function () { paused = false; }, 6000); }
    prev && prev.addEventListener('click', function () { step(-1); hold(); release(); });
    next && next.addEventListener('click', function () { step(1); hold(); release(); });
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold(); });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') release(); });
    track.addEventListener('touchstart', hold, { passive: true });
    track.addEventListener('touchend', release, { passive: true });
    el.addEventListener('focusin', hold); el.addEventListener('focusout', release);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: .25 }).observe(el);
    else visible = true;
    if (autoMs && !reduce) setInterval(function () { if (!paused && visible && !doc.hidden) step(1); }, autoMs);
  }
  $$('[data-slider]').forEach(initSlider);

  /* ---------- before / after ---------- */
  var ba = $('#ba'), baH = $('#baHandle'), baA = $('#baAfter'), baI = $('#baInner'), baPos = 50, baRect = null, baDrag = false, baIntro = null, baW = ba.clientWidth, baNow = -1;
  function setBA(p) {
    baPos = Math.max(0, Math.min(100, p));
    baA.style.transform = 'translate3d(' + baPos + '%,0,0)';
    baI.style.transform = 'translate3d(' + (-baPos) + '%,0,0)';
    baH.style.transform = 'translate3d(' + (baPos / 100 * baW).toFixed(1) + 'px,0,0)';
    var r = Math.round(baPos); if (r !== baNow) { baNow = r; baH.setAttribute('aria-valuenow', r); }
  }
  if ('ResizeObserver' in window) new ResizeObserver(function () { baW = ba.clientWidth; setBA(baPos); }).observe(ba);
  else window.addEventListener('resize', function () { baW = ba.clientWidth; setBA(baPos); });
  function killIntro() { if (baIntro) { baIntro.kill(); baIntro = null; } }
  ba.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    killIntro(); baDrag = true; baRect = ba.getBoundingClientRect();
    try { ba.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    ba.classList.add('dragging');
    setBA((e.clientX - baRect.left) / baRect.width * 100);
  });
  ba.addEventListener('pointermove', function (e) { if (baDrag) setBA((e.clientX - baRect.left) / baRect.width * 100); });
  function endDrag() { baDrag = false; ba.classList.remove('dragging'); }
  ba.addEventListener('pointerup', endDrag); ba.addEventListener('pointercancel', endDrag); ba.addEventListener('lostpointercapture', endDrag);
  baH.addEventListener('keydown', function (e) {
    var k = e.key, d = 0;
    if (k === 'ArrowLeft' || k === 'ArrowDown') d = -5; else if (k === 'ArrowRight' || k === 'ArrowUp') d = 5;
    else if (k === 'Home') { setBA(0); e.preventDefault(); return; } else if (k === 'End') { setBA(100); e.preventDefault(); return; }
    if (d) { killIntro(); setBA(baPos + d); e.preventDefault(); }
  });
  setBA(50);

  /* ---------- warranty ---------- */
  var wForm = $('#wForm'), wRes = $('#wResult');
  function wShow(html) {
    wRes.innerHTML = html;
    if (anim) gsap.fromTo(wRes.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' });
    if (anim) { var b = $('.bar i', wRes); if (b) gsap.from(b, { scaleX: 0, duration: 1.1, ease: 'power3.out', delay: .15 }); }
  }
  wForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var ph = cleanPhone($('#wPhone').value);
    if (!PHONE_RE.test(ph)) {
      wShow('<p class="w-msg"><b>Số điện thoại chưa đúng định dạng.</b><br>Nhập 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.</p>'); return;
    }
    var r = D.WARRANTY[ph];
    if (!r) { wShow('<p class="w-msg"><b>Chưa tìm thấy dữ liệu bảo hành</b> cho số ' + ph.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') + '.<br>Vui lòng gọi hotline 0900 000 368 để được hỗ trợ.</p>'); return; }
    wShow('<div class="w-card"><span class="w-status ' + (r.ok ? 'ok' : 'no') + '"><svg class="ic"><use href="#' + (r.ok ? 'i-check' : 'i-close') + '"/></svg>' + (r.ok ? 'Còn hiệu lực' : 'Đã hết hạn') + '</span>' +
      '<h3>' + r.pack + '</h3><dl class="w-dl"><dt>Khách hàng</dt><dd>' + r.name + '</dd><dt>Dòng xe</dt><dd>' + r.car + '</dd><dt>Ngày lắp</dt><dd>' + r.date + '</dd><dt>Hết hạn</dt><dd>' + r.exp + '</dd></dl>' +
      '<div class="w-prog"><span class="small muted">Thời hạn còn lại: ' + r.pct + '%</span><span class="bar' + (r.ok ? '' : ' amber') + '"><i style="--v:' + (r.pct / 100) + '"></i></span></div></div>');
  });
  $$('[data-wdemo]').forEach(function (b) {
    b.addEventListener('click', function () { var v = b.dataset.wdemo; $('#wPhone').value = v.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'); wForm.requestSubmit ? wForm.requestSubmit() : wForm.dispatchEvent(new Event('submit')); });
  });

  /* ---------- booking ---------- */
  var bForm = $('#bookForm');
  (function () {
    var d = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
    var iso = function (x) { return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
    bForm.date.min = iso(d); var t = new Date(d); t.setDate(d.getDate() + 1); bForm.date.value = iso(t);
  })();
  bForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, name = f.name.value.trim(), phone = cleanPhone(f.phone.value), date = f.date.value;
    var msgs = [], bad = [];
    if (name.length < 2) { msgs.push('Vui lòng nhập họ tên.'); bad.push('name'); }
    if (!PHONE_RE.test(phone)) { msgs.push('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).'); bad.push('phone'); }
    if (!date || date < f.date.min) { msgs.push('Vui lòng chọn ngày hẹn từ hôm nay trở đi.'); bad.push('date'); }
    if (!showErr(f, msgs, bad)) return;
    var dd = date.split('-').reverse().join('/');
    var ok = $('[data-ok]', f);
    ok.innerHTML = '<span class="ok-ic"><svg class="ic"><use href="#i-check"/></svg></span><h4>Đặt lịch thành công!</h4>' +
      '<p>Cảm ơn <b>' + esc(name) + '</b>. Lịch <b class="cyan">' + esc(f.service.value) + '</b> cho xe ' + esc(f.car.value) + ' vào <b class="amber">' + dd + ' · ' + esc(f.slot.value) + '</b> đã được ghi nhận. Kỹ thuật viên sẽ gọi xác nhận.</p>' +
      '<p class="small muted">(Biểu mẫu demo – thông tin không được gửi đi)</p><button type="button" class="btn btn-ghost btn-sm" data-again>Đặt lịch khác</button>';
    ok.hidden = false;
    if (anim) gsap.fromTo(ok.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, stagger: .08, ease: 'power2.out' });
    $('[data-again]', ok).addEventListener('click', function () { ok.hidden = true; f.reset(); f.date.value = f.date.min; });
  });
  $$('input', bForm).concat($$('#checkout input')).forEach(function (i) {
    i.addEventListener('input', function () { var fl = i.closest('.field'); fl && fl.classList.remove('invalid'); });
  });

  /* ---------- initial renders ---------- */
  renderCart();

  /* ---------- hero title split ---------- */
  function splitWords(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = doc.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(doc.createTextNode(' '));
          else { var s = doc.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) splitWords(n);
    });
  }
  var heroTitle = $('.hero-title');
  if (anim) splitWords(heroTitle);
  $$('.drl').forEach(function (p) { p.setAttribute('pathLength', '100'); });

  function countUp(el, dur) {
    var target = parseFloat(el.dataset.count), d = +el.dataset.dec || 0, o = { v: 0 };
    var out = function (v) { return d ? v.toFixed(d).replace('.', ',') : group(v); };
    if (!anim) { el.textContent = out(target); return; }
    gsap.to(o, { v: target, duration: dur || 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = out(o.v); } });
  }

  if (!anim) {
    $$('[data-count]').forEach(function (el) { countUp(el); });
    $$('.lens-glow, .fog-glow').forEach(function (g) { g.setAttribute('opacity', '1'); });
    $$('.bloom, .flare, .beam, .ground-pool').forEach(function (g) { g.style.opacity = '1'; });
    renderGrid(false);
    return;
  }

  /* =========================================================
     GSAP animations
     ========================================================= */
  // hero intro – headlights switch on
  var tl = gsap.timeline({ delay: .15, defaults: { ease: 'power3.out' } });
  tl.fromTo('.car', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1 }, 0)
    .fromTo('.hero-title .w', { opacity: 0, y: '0.6em', rotate: 3 }, { opacity: 1, y: 0, rotate: 0, duration: .85, stagger: .07 }, .1)
    .fromTo('.hero [data-hero]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .75, stagger: .1 }, .25)
    .fromTo('.drl', { strokeDasharray: '100 100', strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' }, .7)
    .to('.lens-glow', { keyframes: [{ opacity: .8, duration: .06 }, { opacity: .05, duration: .09 }, { opacity: 1, duration: .05 }, { opacity: .25, duration: .1 }, { opacity: 1, duration: .14 }] }, 1.45)
    .to('.bloom', { opacity: 1, duration: .5, ease: 'power2.out' }, 1.85)
    .fromTo('.flare', { opacity: 0, scaleX: 0 }, { opacity: .95, scaleX: 1, duration: .9, ease: 'expo.out' }, 1.85)
    .to('.beam', { opacity: 1, duration: .8, ease: 'power2.out' }, 1.9)
    .to('.ground-pool', { opacity: 1, duration: 1 }, 1.95)
    .to('.fog-glow', { opacity: 1, duration: .4 }, 2.2)
    .fromTo('[data-hero-chip]', { opacity: 0, y: 16, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .65, stagger: .15, ease: 'back.out(1.7)' }, 2.25)
    .add(function () { $$('[data-count]').forEach(function (el) { countUp(el); }); }, .9);

  // gentle breathing glow (paused off-screen)
  var breathe = gsap.timeline({ repeat: -1, yoyo: true, paused: true, delay: 0 })
    .to('.bloom', { opacity: .72, duration: 2.2, ease: 'sine.inOut' }, 0)
    .to('.flare', { opacity: .6, scaleX: .9, duration: 2.2, ease: 'sine.inOut' }, 0);
  var chipFloat = gsap.to('[data-hero-chip]', { y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .8, paused: true });
  tl.eventCallback('onComplete', function () {
    ScrollTrigger.create({
      trigger: '#hero', start: 'top bottom', end: 'bottom top',
      onToggle: function (s) { if (s.isActive) { breathe.play(); chipFloat.play(); } else { breathe.pause(); chipFloat.pause(); } }
    });
    if (window.scrollY < window.innerHeight) { breathe.play(); chipFloat.play(); }
  });

  // hero parallax on scroll
  gsap.to('.hv-parallax', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.matchMedia().add('(min-width: 1025px)', function () {
    gsap.to('.hero-copy', { y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.skyline', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.glow-orb[data-parallax]').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -(+el.dataset.parallax) }, { yPercent: +el.dataset.parallax, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  $$('.booking-bg[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -(+el.dataset.parallax) }, { yPercent: +el.dataset.parallax, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // marquee (pauses off-screen)
  $$('[data-marquee]').forEach(function (m) {
    var tr = $('.marquee-track', m);
    tr.innerHTML += tr.innerHTML;
    $$('span, i', tr).slice(tr.children.length / 2).forEach(function (x) { x.setAttribute('aria-hidden', 'true'); });
    var tw = gsap.to(tr, { xPercent: -50, duration: 32, ease: 'none', repeat: -1, paused: true });
    tw.totalTime(32 * 200);
    ScrollTrigger.create({ trigger: m, start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? tw.play() : tw.pause(); } });
    // speed boost with scroll velocity
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: function (s) {
        var v = Math.min(4, 1 + Math.abs(s.getVelocity()) / 600);
        gsap.to(tw, { timeScale: s.direction < 0 ? -v : v, duration: .3, overwrite: true });
        gsap.to(tw, { timeScale: s.direction < 0 ? -1 : 1, duration: 1.2, delay: .3, overwrite: false });
      }
    });
  });

  // reveal batches
  gsap.set('[data-reveal]', { opacity: 0, y: 34 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .85, stagger: .12, ease: 'power3.out', overwrite: true }); }
  });
  [['.cat', 0.05], ['#saleTrack > .card', 0.08], ['.g-item', 0.08], ['.rv', 0.08], ['.faq details', 0.06]].forEach(function (cfg) {
    var els = $$(cfg[0]); if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 40 });
    ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .7, stagger: cfg[1], ease: 'power3.out', clearProps: 'transform' }); } });
  });

  // spec table bars + numbers
  $$('.spec-rows .spec-row').forEach(function (row, i) {
    var bars = $$('.bar i', row), marks = $$('.kbar i', row), nums = $$('[data-num]', row);
    gsap.set(row, { opacity: 0, x: -30 });
    ScrollTrigger.create({
      trigger: row, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(row, { opacity: 1, x: 0, duration: .7, ease: 'power3.out', delay: i * .08 });
        gsap.from(bars, { scaleX: 0, duration: 1.4, ease: 'power3.out', delay: .2 + i * .08, stagger: .08 });
        gsap.from(marks, { scale: 0, opacity: 0, duration: .6, ease: 'back.out(2)', delay: .6 + i * .08 });
        nums.forEach(function (n) {
          var t = +n.dataset.num, o = { v: 0 };
          gsap.to(o, { v: t, duration: 1.4, ease: 'power2.out', delay: .2 + i * .08, onUpdate: function () { n.textContent = group(o.v); } });
        });
      }
    });
  });

  // before/after intro sweep
  ScrollTrigger.create({
    trigger: ba, start: 'top 70%', once: true,
    onEnter: function () {
      var o = { p: 50 };
      baIntro = gsap.timeline({ onUpdate: function () { setBA(o.p); } })
        .to(o, { p: 82, duration: 1, ease: 'power2.inOut' })
        .to(o, { p: 18, duration: 1.4, ease: 'power2.inOut' })
        .to(o, { p: 50, duration: 1, ease: 'power2.inOut' });
    }
  });

  // ambient: visibility for colour cycle + intro pulse
  ScrollTrigger.create({
    trigger: '#ambient', start: 'top bottom', end: 'bottom top',
    onToggle: function (s) { ambVisible = s.isActive; if (cycleTween && cycleOn) { s.isActive ? cycleTween.play() : cycleTween.pause(); } }
  });
  gsap.from(['.amb-glow3', '.amb-glow2', '.amb-line', '.amb-fill'], { opacity: 0, duration: 1.1, stagger: .18, ease: 'power2.out', scrollTrigger: { trigger: '.amb-visual', start: 'top 75%', once: true } });

  // process timeline
  gsap.to('.tl-fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 65%', end: 'bottom 55%', scrub: .4 } });
  $$('.tl-step').forEach(function (st) {
    gsap.set($('.tl-card', st), { opacity: 0, x: -24 });
    ScrollTrigger.create({
      trigger: st, start: 'top 72%',
      onEnter: function () { st.classList.add('on'); gsap.to($('.tl-card', st), { opacity: 1, x: 0, duration: .7, ease: 'power3.out' }); },
      onLeaveBack: function () { st.classList.remove('on'); }
    });
  });

  // product grid (first render reveals on scroll)
  renderGrid(false);

  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
