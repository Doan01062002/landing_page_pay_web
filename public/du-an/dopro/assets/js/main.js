/* ĐỘ PRO GARAGE – main script (static demo, không gửi dữ liệu) */
(function () {
  'use strict';

  var D = window.DOPRO;
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.innerWidth < 761; };
  if (!hasGsap) root.classList.add('no-gsap');
  else gsap.registerPlugin(ScrollTrigger);

  /* ---------------- helpers ---------------- */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(p) { return Math.round((1 - p.price / p.old) * 100); }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  var IMG = D.IMG;
  var catById = {}; D.CATS.forEach(function (c) { catById[c.id] = c; });
  var prodById = {}; D.P.forEach(function (p) { prodById[p.id] = p; });
  var comboById = {}; D.COMBOS.forEach(function (c) { comboById[c.id] = c; });
  var modelName = {}; var modelBrand = {};
  D.BRANDS.forEach(function (b) { b.models.forEach(function (m) { modelName[m[0]] = m[1]; modelBrand[m[0]] = b.name; }); });

  var ICON = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'
  };

  /* ---------------- toast ---------------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2400);
  }

  /* ---------------- smooth in-page links ---------------- */
  function goTo(id) {
    var el = id ? doc.getElementById(id) : null;
    if (!el || id === 'trang-chu') { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    e.preventDefault();
    var gc = a.getAttribute('data-goto-cat');
    if (gc) setCat(gc);
    closeMenu(); closeCart(); closeSugg();
    goTo(id);
  });

  /* ---------------- countdown ---------------- */
  function weekEnd() {
    var d = new Date();
    var add = (7 - d.getDay()) % 7; // to Sunday
    var e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + add, 23, 59, 59);
    if (e - d < 3600e3) e = new Date(e.getTime() + 7 * 864e5);
    return e;
  }
  var cdEnd = weekEnd();
  var cdEls = $$('[data-cd]');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var ms = cdEnd - new Date();
    if (ms <= 0) { cdEnd = weekEnd(); ms = cdEnd - new Date(); }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    cdEls.forEach(function (el) {
      var k = el.getAttribute('data-cd'), v;
      if (k === 'd') v = d; else if (k === 'h') v = h; else if (k === 'm') v = m; else v = sec;
      var t = pad(v); if (el.textContent !== t) el.textContent = t;
    });
  }
  tick(); setInterval(tick, 1000);

  /* ---------------- header / menu / search ---------------- */
  var hdr = $('#hdr'), mnav = $('#mnav'), burger = $('#burger');
  var lastFocus = null;
  function lockScroll(on) { root.style.overflow = on ? 'hidden' : ''; }
  function openMenu() { mnav.classList.add('is-open'); mnav.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); lockScroll(true); lastFocus = doc.activeElement; setTimeout(function () { $('#mnavClose').focus(); }, 50);
    if (hasGsap && !reduce) gsap.fromTo($$('.mnav__links a'), { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: .05, duration: .5, delay: .15, ease: 'power3.out' }); }
  function closeMenu() { if (!mnav.classList.contains('is-open')) return; mnav.classList.remove('is-open'); mnav.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); lockScroll(false); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  burger.addEventListener('click', openMenu);
  $('#mnavClose').addEventListener('click', closeMenu);
  mnav.addEventListener('click', function (e) { if (e.target === mnav) closeMenu(); });

  var searchForm = $('#searchForm'), qInput = $('#q');
  $('#searchToggle').addEventListener('click', function () {
    var open = searchForm.classList.toggle('is-open');
    this.setAttribute('aria-expanded', open);
    if (open) qInput.focus();
  });

  /* ---------------- state & product grid ---------------- */
  var state = { cat: 'all', q: '', sort: 'hot', fit: null, limit: 12 };
  var grid = $('#grid'), tabsEl = $('#tabs'), moreBtn = $('#moreBtn'), emptyEl = $('#empty'), filtersEl = $('#activeFilters');

  function stars(r) { return '<span class="stars" style="--r:' + r + '" role="img" aria-label="' + r + ' trên 5 sao"></span>'; }

  function filtered() {
    var q = norm(state.q.trim());
    var list = D.P.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.fit && p.fit.indexOf(state.fit) < 0) return false;
      if (q) {
        var hay = norm(p.name + ' ' + p.spec + ' ' + catById[p.cat].name);
        var words = q.split(/\s+/);
        for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) < 0) return false;
      }
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'asc') return a.price - b.price;
      if (s === 'desc') return b.price - a.price;
      if (s === 'sale') return pct(b) - pct(a);
      return b.hot - a.hot;
    });
    return list;
  }

  function cardHTML(p, i) {
    var c = catById[p.cat];
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="card__img" data-qv="' + p.id + '">' +
        '<img src="' + IMG(p.img, 600, 450) + '" alt="' + esc(p.name) + '" width="600" height="450" loading="lazy" decoding="async">' +
        '<span class="badge">-' + pct(p) + '%</span>' + (p.hot >= 95 ? '<span class="card__hot">HOT</span>' : '') +
      '</div>' +
      '<button class="qv-btn" data-qv="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '">' + ICON.eye + '</button>' +
      '<div class="card__b">' +
        '<span class="pcat">' + esc(c.name) + '</span>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="card__spec">' + esc(p.spec) + '</p>' +
        '<div class="prate">' + stars(p.rating) + '<small>' + p.rating.toFixed(1) + ' (' + p.reviews + ')</small></div>' +
        '<div class="pprice"><b>' + fmt(p.price) + '</b><s>' + fmt(p.old) + '</s></div>' +
        '<button class="add" data-add="' + p.id + '">' + ICON.cart + '<span>Thêm vào giỏ</span></button>' +
      '</div></article>';
  }

  function renderTabs() {
    var counts = { all: 0 };
    D.P.forEach(function (p) {
      if (state.fit && p.fit.indexOf(state.fit) < 0) return;
      counts.all++; counts[p.cat] = (counts[p.cat] || 0) + 1;
    });
    var html = '<button class="tab' + (state.cat === 'all' ? ' is-on' : '') + '" role="tab" aria-selected="' + (state.cat === 'all') + '" data-cat="all">Tất cả<sup>' + counts.all + '</sup></button>';
    D.CATS.forEach(function (c) {
      var on = state.cat === c.id;
      html += '<button class="tab' + (on ? ' is-on' : '') + '" role="tab" aria-selected="' + on + '" data-cat="' + c.id + '">' + esc(c.short) + '<sup>' + (counts[c.id] || 0) + '</sup></button>';
    });
    tabsEl.innerHTML = html;
    var on = $('.tab.is-on', tabsEl);
    if (on) tabsEl.scrollTo({ left: on.offsetLeft - 20, behavior: 'smooth' });
  }

  function renderFilters() {
    var h = '';
    if (state.fit) h += '<span class="fchip">Xe: <b>' + esc(modelBrand[state.fit] + ' ' + modelName[state.fit]) + '</b><button data-unfilter="fit" aria-label="Bỏ lọc dòng xe">×</button></span>';
    if (state.q.trim()) h += '<span class="fchip">Từ khoá: <b>“' + esc(state.q.trim()) + '”</b><button data-unfilter="q" aria-label="Bỏ từ khoá">×</button></span>';
    if (h) h += '<button class="fchip fchip--clear" data-clear-filters>Xoá tất cả</button>';
    filtersEl.innerHTML = h;
  }

  var firstRender = true;
  function renderGrid(animate) {
    var list = filtered();
    var shown = list.slice(0, state.limit);
    grid.innerHTML = shown.map(cardHTML).join('');
    emptyEl.hidden = list.length > 0;
    moreBtn.parentNode.hidden = list.length <= state.limit;
    moreBtn.querySelector('span').textContent = 'Xem thêm ' + (list.length - state.limit) + ' sản phẩm';
    renderFilters();
    var cards = $$('.card', grid);
    if (!hasGsap || reduce) return;
    if (firstRender) { firstRender = false; batchReveal(cards); }
    else if (animate !== false) gsap.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, stagger: .035, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
  }
  function refresh(animate) { state.limit = isMobile() ? 8 : 12; renderTabs(); renderGrid(animate); }
  function setCat(cat) { state.cat = cat; refresh(); }

  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (b) setCat(b.getAttribute('data-cat')); });
  $('#sort').addEventListener('change', function () { state.sort = this.value; renderGrid(); });
  moreBtn.addEventListener('click', function () {
    var prev = state.limit; state.limit += 12; renderGrid(false);
    var cards = $$('.card', grid).slice(prev);
    if (hasGsap && !reduce) gsap.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out', clearProps: 'transform' });
    if (hasGsap) ScrollTrigger.refresh();
  });
  doc.addEventListener('click', function (e) {
    var u = e.target.closest('[data-unfilter]');
    if (u) { var k = u.getAttribute('data-unfilter'); if (k === 'fit') { state.fit = null; resetFitUI(); } else { state.q = ''; qInput.value = ''; } refresh(); }
    if (e.target.closest('[data-clear-filters]')) { state.fit = null; state.q = ''; qInput.value = ''; state.cat = 'all'; resetFitUI(); refresh(); }
  });

  /* search + suggestions */
  var sugg = doc.createElement('div'); sugg.className = 'sugg'; sugg.hidden = true; sugg.setAttribute('role', 'listbox'); searchForm.appendChild(sugg);
  var sT;
  function closeSugg() { sugg.hidden = true; }
  function renderSugg() {
    var q = qInput.value.trim();
    if (!q) { closeSugg(); return; }
    var nq = norm(q).split(/\s+/);
    var res = D.P.filter(function (p) { var h = norm(p.name + ' ' + p.spec + ' ' + catById[p.cat].name); return nq.every(function (w) { return h.indexOf(w) >= 0; }); }).slice(0, 5);
    sugg.innerHTML = res.length ? res.map(function (p) {
      return '<button type="button" class="sg" data-qv="' + p.id + '"><img src="' + IMG(p.img, 120, 90) + '" alt="" width="60" height="45"><span><b>' + esc(p.name) + '</b><small>' + fmt(p.price) + '</small></span></button>';
    }).join('') + '<button type="submit" class="sg sg--all">Xem tất cả kết quả cho “' + esc(q) + '” →</button>' : '<p class="sg-none">Không tìm thấy “' + esc(q) + '”. Thử “pô”, “mâm”, “carbon”…</p>';
    sugg.hidden = false;
  }
  qInput.addEventListener('input', function () {
    clearTimeout(sT);
    sT = setTimeout(function () { state.q = qInput.value; refresh(false); renderSugg(); }, 160);
  });
  qInput.addEventListener('focus', function () { if (qInput.value.trim()) renderSugg(); });
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault(); state.q = qInput.value; state.cat = 'all'; refresh(); closeSugg(); qInput.blur();
    searchForm.classList.remove('is-open');
    goTo('san-pham');
  });
  doc.addEventListener('click', function (e) { if (!e.target.closest('.search')) closeSugg(); });

  /* ---------------- categories ---------------- */
  $('#cats').innerHTML = D.CATS.map(function (c, i) {
    var n = D.P.filter(function (p) { return p.cat === c.id; }).length;
    return '<a class="cat" href="#san-pham" data-goto-cat="' + c.id + '" data-reveal>' +
      '<img src="' + IMG(c.img, 640, 500) + '" alt="' + esc(c.name) + '" width="640" height="500" loading="lazy" decoding="async">' +
      '<span class="cat__i">' + pad(i + 1) + ' · ' + n + ' SP</span>' +
      '<span class="cat__arrow">' + ICON.arrow + '</span>' +
      '<span class="cat__t"><span class="cat__n">' + esc(c.name) + '</span><span class="cat__d">' + esc(c.desc) + '</span></span></a>';
  }).join('');

  /* ---------------- fitment ---------------- */
  var brandChips = $('#brandChips'), modelChips = $('#modelChips'), fitApply = $('#fitApply');
  var fitSel = { brand: null, model: null };
  brandChips.innerHTML = D.BRANDS.map(function (b) { return '<button class="chip" data-brand="' + b.id + '" aria-pressed="false">' + esc(b.name) + '</button>'; }).join('');
  function updateFitCount() {
    var cnt, label;
    if (fitSel.model) {
      cnt = D.P.filter(function (p) { return p.fit.indexOf(fitSel.model) >= 0; }).length;
      label = 'phụ kiện tương thích với ' + modelBrand[fitSel.model] + ' ' + modelName[fitSel.model];
    } else { cnt = D.P.length; label = fitSel.brand ? 'phụ kiện – chọn dòng xe để lọc chính xác' : 'phụ kiện có sẵn cho mọi dòng xe'; }
    var b = $('#fitCount');
    if (hasGsap && !reduce) { var o = { v: +b.textContent || 0 }; gsap.to(o, { v: cnt, duration: .6, ease: 'power2.out', onUpdate: function () { b.textContent = Math.round(o.v); } }); }
    else b.textContent = cnt;
    $('#fitLabel').textContent = label;
    fitApply.disabled = !fitSel.model;
  }
  function resetFitUI() { fitSel.brand = fitSel.model = null; $$('.chip', brandChips).forEach(function (c) { c.classList.remove('is-on'); c.setAttribute('aria-pressed', 'false'); }); modelChips.innerHTML = '<p class="chips__hint">← Chọn hãng xe trước</p>'; updateFitCount(); }
  brandChips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    fitSel.brand = b.getAttribute('data-brand'); fitSel.model = null;
    $$('.chip', brandChips).forEach(function (c) { var on = c === b; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    var br = D.BRANDS.filter(function (x) { return x.id === fitSel.brand; })[0];
    modelChips.innerHTML = br.models.map(function (m) { return '<button class="chip" data-model="' + m[0] + '" aria-pressed="false">' + esc(m[1]) + '</button>'; }).join('');
    if (hasGsap && !reduce) gsap.fromTo($$('.chip', modelChips), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: .05, duration: .35, ease: 'power2.out' });
    updateFitCount();
  });
  modelChips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    fitSel.model = b.getAttribute('data-model');
    $$('.chip', modelChips).forEach(function (c) { var on = c === b; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    updateFitCount();
  });
  fitApply.addEventListener('click', function () {
    if (!fitSel.model) return;
    state.fit = fitSel.model; state.cat = 'all'; refresh();
    toast('Đang hiển thị phụ kiện cho <b>' + esc(modelBrand[state.fit] + ' ' + modelName[state.fit]) + '</b>');
    goTo('san-pham');
  });
  /* hotspots */
  var partMap = { 'body-kit': 'kit', 'canh-gio': 'wing', po: 'po', mam: 'mam', phuoc: 'phuoc', 'loc-gio': 'loc', tem: 'tem' };
  var carSvg = $('.carsvg');
  function focusPart(cat) {
    carSvg.classList.toggle('has-focus', !!cat);
    $$('.part', carSvg).forEach(function (p) { p.classList.toggle('is-focus', !!cat && p.classList.contains('part--' + partMap[cat])); });
  }
  $$('.hot').forEach(function (h) {
    var cat = h.getAttribute('data-cat');
    h.setAttribute('aria-label', 'Xem nhóm ' + catById[cat].name);
    h.addEventListener('mouseenter', function () { focusPart(cat); });
    h.addEventListener('focus', function () { focusPart(cat); });
    h.addEventListener('mouseleave', function () { focusPart(null); });
    h.addEventListener('blur', function () { focusPart(null); });
    h.addEventListener('click', function () { setCat(cat); goTo('san-pham'); });
  });

  /* ---------------- cart ---------------- */
  var CART_KEY = 'dopro_cart_v1';
  var cart = (store(CART_KEY) || []).filter(function (it) { return it && (prodById[it.id] || comboById[it.id]) && it.qty > 0; });
  var FREE = 3000000;
  var drawer = $('#drawer');
  function itemInfo(id) {
    var p = prodById[id];
    if (p) return { name: p.name, price: p.price, img: IMG(p.img, 160, 130) };
    var c = comboById[id];
    return { name: c.name + ' (' + c.stage + ')', price: c.price, img: IMG(c.img, 160, 130) };
  }
  function cartTotal() { return cart.reduce(function (s, it) { return s + itemInfo(it.id).price * it.qty; }, 0); }
  function cartCount() { return cart.reduce(function (s, it) { return s + it.qty; }, 0); }
  function saveCart() { store(CART_KEY, cart); }
  function renderCart() {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; if (n) el.removeAttribute('data-zero'); else el.setAttribute('data-zero', ''); });
    $('#cartTtl span').removeAttribute('data-zero');
    drawer.classList.toggle('is-empty', !n);
    $('#citems').innerHTML = cart.map(function (it) {
      var info = itemInfo(it.id);
      return '<li class="ci" data-ci="' + it.id + '"><img src="' + info.img + '" alt="" width="76" height="64" loading="lazy">' +
        '<div><p class="ci__n">' + esc(info.name) + '</p><span class="ci__p">' + fmt(info.price) + '</span>' +
        '<div class="qty"><button type="button" data-q="-1" aria-label="Giảm số lượng">−</button><output>' + it.qty + '</output><button type="button" data-q="1" aria-label="Tăng số lượng">+</button></div></div>' +
        '<button class="ci__rm" data-rm aria-label="Xoá ' + esc(info.name) + '">' + ICON.trash + '</button></li>';
    }).join('');
    var t = cartTotal();
    $('#subtotal').textContent = fmt(t);
    var left = FREE - t;
    $('#shipTxt').innerHTML = left > 0 ? 'Mua thêm <b>' + fmt(left) + '</b> để được <b>miễn phí lắp đặt</b> nội thành' : '<b>Bạn được miễn phí lắp đặt</b> nội thành Hà Nội!';
    $('#shipFill').style.transform = 'scaleX(' + Math.min(1, t / FREE) + ')';
  }
  function bounceBadge() {
    if (!hasGsap || reduce) return;
    $$('[data-cart-count]').forEach(function (b) { gsap.fromTo(b, { scale: 1.8 }, { scale: 1, duration: .7, ease: 'elastic.out(1, .35)' }); });
    gsap.fromTo('#cartBtn svg', { rotate: -14 }, { rotate: 0, duration: .6, ease: 'elastic.out(1, .3)' });
  }
  function addToCart(id, qty, srcImg) {
    qty = qty || 1;
    var ex = cart.filter(function (it) { return it.id === id; })[0];
    if (ex) ex.qty = Math.min(99, ex.qty + qty); else cart.push({ id: id, qty: qty });
    saveCart();
    var done = function () { renderCart(); bounceBadge(); };
    if (srcImg && hasGsap && !reduce) flyToCart(srcImg, done); else done();
    toast('✓ Đã thêm <b>' + esc(itemInfo(id).name) + '</b> vào giỏ');
  }
  function flyToCart(img, cb) {
    var r = img.getBoundingClientRect();
    var target = $('#cartBtn').getBoundingClientRect();
    if (!r.width) { cb(); return; }
    var size = Math.min(130, r.width);
    var clone = doc.createElement('img');
    clone.src = img.currentSrc || img.src; clone.alt = ''; clone.className = 'fly';
    clone.style.cssText = 'left:' + (r.left + r.width / 2 - size / 2) + 'px;top:' + (r.top + r.height / 2 - size * .375) + 'px;width:' + size + 'px;height:' + size * .75 + 'px';
    doc.body.appendChild(clone);
    var dx = target.left + target.width / 2 - (r.left + r.width / 2);
    var dy = target.top + target.height / 2 - (r.top + r.height / 2);
    var tl = gsap.timeline({ onComplete: function () { clone.remove(); cb(); } });
    tl.fromTo(clone, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .18, ease: 'power2.out' })
      .to(clone, { x: dx, duration: .7, ease: 'power1.inOut' }, '>-0.02')
      .to(clone, { y: dy, duration: .7, ease: 'back.in(1.4)' }, '<')
      .to(clone, { scale: .12, rotate: 25, opacity: .4, duration: .7, ease: 'power2.in' }, '<');
  }
  function openCart() { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lockScroll(true); lastFocus = doc.activeElement; setTimeout(function () { $('.drawer__hd [data-close-cart]').focus(); }, 60); }
  function closeCart() { if (!drawer.classList.contains('is-open')) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); lockScroll(false); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  $('#cartBtn').addEventListener('click', openCart);
  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-cart]')) { openCart(); return; }
    if (e.target.closest('[data-close-cart]') && !e.target.closest('a[href^="#"]')) { closeCart(); return; }
    var add = e.target.closest('[data-add]');
    if (add) {
      var id = add.getAttribute('data-add');
      var card = add.closest('.card, .cb');
      var img = card ? $('img', card) : null;
      addToCart(id, 1, img);
      add.classList.add('is-added');
      var sp = $('span', add), old = sp ? sp.textContent : '';
      if (sp) sp.textContent = 'Đã thêm ✓';
      setTimeout(function () { add.classList.remove('is-added'); if (sp) sp.textContent = old; }, 1400);
      return;
    }
    var ci = e.target.closest('.ci');
    if (ci) {
      var cid = ci.getAttribute('data-ci');
      var it = cart.filter(function (x) { return x.id === cid; })[0];
      if (!it) return;
      var q = e.target.closest('[data-q]');
      if (q) { it.qty += +q.getAttribute('data-q'); if (it.qty < 1) cart.splice(cart.indexOf(it), 1); else it.qty = Math.min(99, it.qty); }
      else if (e.target.closest('[data-rm]')) cart.splice(cart.indexOf(it), 1);
      else return;
      saveCart(); renderCart();
    }
  });
  renderCart();

  /* ---------------- modals: quick view & checkout ---------------- */
  var openModalEl = null;
  function openModal(m) {
    if (openModalEl) closeModal();
    openModalEl = m; lastFocus = doc.activeElement;
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true);
    setTimeout(function () { var x = $('.modal__x', m); if (x) x.focus(); }, 60);
  }
  function closeModal() {
    if (!openModalEl) return;
    var m = openModalEl; openModalEl = null;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    if (!drawer.classList.contains('is-open')) lockScroll(false);
    if (lastFocus && lastFocus.focus && doc.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  doc.addEventListener('click', function (e) { if (e.target.closest('[data-close-modal]')) closeModal(); });

  var qv = $('#qv'), qvQty = 1, qvId = null;
  function openQV(id) {
    var p = prodById[id]; if (!p) return;
    qvId = id; qvQty = 1; $('#qvQty').textContent = 1;
    var im = $('#qvImg'); im.src = IMG(p.img, 900, 760); im.alt = p.name;
    $('#qvBadge').textContent = '-' + pct(p) + '%';
    $('#qvCat').textContent = catById[p.cat].name;
    $('#qvName').textContent = p.name;
    $('#qvStars').style.setProperty('--r', p.rating);
    $('#qvRev').textContent = p.rating.toFixed(1) + ' · ' + p.reviews + ' đánh giá';
    $('#qvPrice').textContent = fmt(p.price);
    $('#qvOld').textContent = fmt(p.old);
    $('#qvSpec').innerHTML = p.feats.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
    var fits = p.fit.slice(0, 6).map(function (m) { return modelName[m]; }).join(', ');
    $('#qvFit').innerHTML = '<b>Tương thích:</b> ' + esc(fits) + (p.fit.length > 6 ? ' và ' + (p.fit.length - 6) + ' dòng xe khác' : '') + (p.hp ? ' · <b>tăng ~' + p.hp + ' HP</b>' : '');
    closeSugg(); closeCart();
    openModal(qv);
  }
  doc.addEventListener('click', function (e) { var t = e.target.closest('[data-qv]'); if (t) openQV(t.getAttribute('data-qv')); });
  doc.addEventListener('click', function (e) { var b = e.target.closest('[data-qv-qty]'); if (b) { qvQty = Math.max(1, Math.min(99, qvQty + +b.getAttribute('data-qv-qty'))); $('#qvQty').textContent = qvQty; } });
  $('#qvAdd').addEventListener('click', function () { var id = qvId, q = qvQty; closeModal(); addToCart(id, q, null); bounceBadge(); });

  /* checkout */
  var co = $('#co'), coForm = $('#coForm'), coOk = $('#coOk');
  var PHONE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return String(v).replace(/[\s.\-()]/g, ''); }
  function setErr(input, msg) { var f = input.closest('.field'); f.classList.toggle('has-err', !!msg); $('.err', f).textContent = msg || ''; input.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }
  $('#toCheckout').addEventListener('click', function () {
    if (!cart.length) return;
    $('#coSum').innerHTML = cart.map(function (it) { var i = itemInfo(it.id); return '<div><span>' + it.qty + ' × ' + esc(i.name) + '</span><span>' + fmt(i.price * it.qty) + '</span></div>'; }).join('') + '<div class="tot"><span>Tổng tạm tính</span><b>' + fmt(cartTotal()) + '</b></div>';
    coForm.hidden = false; coOk.hidden = true;
    closeCart(); openModal(co);
  });
  coForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#cName'), p = $('#cPhone'), a = $('#cAddr');
    var ok = setErr(n, n.value.trim().length < 2 ? 'Vui lòng nhập họ tên' : '');
    ok = setErr(p, !PHONE.test(cleanPhone(p.value)) ? 'Số điện thoại không hợp lệ (VD: 0912 345 678)' : '') && ok;
    ok = setErr(a, a.value.trim().length < 6 ? 'Vui lòng nhập địa chỉ cụ thể' : '') && ok;
    if (!ok) { var f = $('.has-err input', coForm); if (f) f.focus(); return; }
    var code = 'DP' + String(Date.now()).slice(-6);
    $('#coOkTxt').innerHTML = 'Cảm ơn <b>' + esc(n.value.trim()) + '</b>! Mã đơn <b>' + code + '</b> · ' + cartCount() + ' sản phẩm · ' + fmt(cartTotal()) + '.<br>Kỹ thuật viên sẽ gọi <b>' + esc(cleanPhone(p.value)) + '</b> để xác nhận. (Trang mẫu – không gửi dữ liệu)';
    coForm.hidden = true; coOk.hidden = false;
    cart = []; saveCart(); renderCart(); coForm.reset();
    if (hasGsap && !reduce) gsap.fromTo($('svg', coOk), { scale: .4, rotate: -30, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .7, ease: 'back.out(2)' });
  });
  ['#cName', '#cPhone', '#cAddr', '#bName', '#bPhone', '#bCar', '#bDate'].forEach(function (s) { $(s).addEventListener('input', function () { if (this.closest('.field').classList.contains('has-err')) setErr(this, ''); }); });

  /* ---------------- Esc ---------------- */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (openModalEl) closeModal();
    else if (drawer.classList.contains('is-open')) closeCart();
    else if (mnav.classList.contains('is-open')) closeMenu();
    else closeSugg();
  });

  /* ---------------- combos ---------------- */
  var MAXHP = 260, MAXNM = 380;
  $('#combos').innerHTML = D.COMBOS.map(function (c) {
    var gain = c.hp[1] - c.hp[0];
    function meter(label, a, b, max, unit, inverse) {
      var fa = inverse ? (10 - a) / 6 : a / max, fb = inverse ? (10 - b) / 6 : b / max;
      return '<div class="meter"><div class="meter__t"><span>' + label + '</span><b>' + String(a).replace('.', ',') + ' → ' + String(b).replace('.', ',') + ' ' + unit + '</b></div>' +
        '<div class="meter__bar"><em data-to="' + fb.toFixed(3) + '"></em><i data-to="' + fa.toFixed(3) + '"></i></div></div>';
    }
    return '<article class="cb' + (c.featured ? ' cb--feat' : '') + '" data-reveal>' +
      '<div class="cb__img"><img src="' + IMG(c.img, 720, 405) + '" alt="' + esc(c.name) + '" width="720" height="405" loading="lazy" decoding="async"><div class="cb__stage"><b>' + c.stage + '</b><span>' + c.tag + '</span></div></div>' +
      '<div class="cb__b"><h3>' + esc(c.name) + '</h3>' +
      '<div class="cb__hp"><b data-from="' + c.hp[0] + '" data-to="' + c.hp[1] + '">' + c.hp[1] + '</b><span>HP</span><em>+' + gain + ' HP</em></div>' +
      meter('Công suất', c.hp[0], c.hp[1], MAXHP, 'HP') + meter('Mô-men xoắn', c.nm[0], c.nm[1], MAXNM, 'Nm') + meter('0–100 km/h', c.acc[0], c.acc[1], 0, 's', true) +
      '<ul>' + c.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' +
      '<div class="cb__price"><b>' + fmt(c.price) + '</b><s>' + fmt(c.old) + '</s><small>Tiết kiệm ' + fmt(c.old - c.price) + ' · gồm công lắp & dyno</small></div>' +
      '<button class="btn btn--red btn--block" data-add="' + c.id + '"><span>Chọn combo này</span></button></div></article>';
  }).join('');

  /* ---------------- builds & reviews ---------------- */
  $('#gallery').innerHTML = D.BUILDS.map(function (b, i) {
    return '<article class="build"><img src="' + IMG(b.img, 720, 900) + '" alt="' + esc(b.name + ' – ' + b.car) + '" width="720" height="900" loading="lazy" decoding="async" draggable="false">' +
      '<span class="build__idx">' + pad(i + 1) + ' / ' + pad(D.BUILDS.length) + '</span><span class="build__gain">' + b.gain + '</span>' +
      '<div class="build__t"><span class="build__n">' + esc(b.name) + '</span><span class="build__c">' + esc(b.car) + '</span><div class="build__tags">' + b.mods.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div></div></article>';
  }).join('');
  $('#reviews').innerHTML = D.REVIEWS.map(function (r) {
    var parts = r.n.split(' '), ini = (parts[parts.length - 2] || '').charAt(0) + parts[parts.length - 1].charAt(0);
    return '<article class="rcard">' + stars(r.r) + '<p class="rcard__q">' + esc(r.t) + '</p><div class="rcard__u"><span class="av">' + esc(ini) + '</span><div><b>' + esc(r.n) + '</b><small>' + esc(r.car) + '</small></div><span class="verified">✓ Đã mua</span></div></article>';
  }).join('');

  /* ---------------- FAQ ---------------- */
  $('#faqList').innerHTML = D.FAQ.map(function (f, i) {
    return '<div class="qa' + (i === 0 ? ' is-open' : '') + '" data-reveal><button class="qa__q" aria-expanded="' + (i === 0) + '" aria-controls="qa' + i + '"><span>' + esc(f.q) + '</span><i class="qa__ic" aria-hidden="true"></i></button><div class="qa__a" id="qa' + i + '" role="region"><div><p>' + esc(f.a) + '</p></div></div></div>';
  }).join('');
  $('#faqList').addEventListener('click', function (e) {
    var q = e.target.closest('.qa__q'); if (!q) return;
    var item = q.parentNode, open = !item.classList.contains('is-open');
    $$('.qa', this).forEach(function (x) { x.classList.remove('is-open'); $('.qa__q', x).setAttribute('aria-expanded', 'false'); });
    if (open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
    if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 450);
  });

  /* ---------------- booking ---------------- */
  var bookForm = $('#bookForm'), bDate = $('#bDate');
  (function () { var t = new Date(); t.setDate(t.getDate() + 1); var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }; bDate.min = iso(new Date()); bDate.value = iso(t); })();
  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#bName'), p = $('#bPhone'), c = $('#bCar');
    var ok = setErr(n, n.value.trim().length < 2 ? 'Vui lòng nhập họ tên' : '');
    ok = setErr(p, !PHONE.test(cleanPhone(p.value)) ? 'Số điện thoại không hợp lệ (VD: 0912 345 678)' : '') && ok;
    ok = setErr(c, c.value.trim().length < 2 ? 'Vui lòng nhập dòng xe' : '') && ok;
    ok = setErr(bDate, (!bDate.value || bDate.value < bDate.min) ? 'Chọn ngày từ hôm nay trở đi' : '') && ok;
    if (!ok) { var f = $('.has-err input', bookForm); if (f) f.focus(); return; }
    var slot = ($('input[name="slot"]:checked', bookForm) || {}).value || '';
    var dd = bDate.value.split('-');
    $('#bookOkTxt').innerHTML = 'Hẹn <b>' + esc(n.value.trim()) + '</b> lúc <b>' + slot + ', ' + dd[2] + '/' + dd[1] + '/' + dd[0] + '</b> cho xe <b>' + esc(c.value.trim()) + '</b> – hạng mục ' + esc($('#bSvc').value) + '. Chúng tôi sẽ gọi xác nhận trong 15 phút. (Trang mẫu – không gửi dữ liệu)';
    $('#bookOk').hidden = false;
    if (hasGsap && !reduce) gsap.fromTo('#bookOk svg', { scale: .4, rotate: -30, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .7, ease: 'back.out(2)' });
  });
  $('#bookAgain').addEventListener('click', function () { $('#bookOk').hidden = true; bookForm.reset(); var t = new Date(); t.setDate(t.getDate() + 1); bDate.value = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); });

  /* ---------------- sliders ---------------- */
  function Slider(el, interval) {
    var lastTouch = 0, hover = false, visible = false, down = null, moved = false, raf = 0;
    var prog = el.id === 'gallery' ? $('#galProg') : null;
    function step() { var c = el.children[0]; if (!c) return 300; var gap = parseFloat(getComputedStyle(el).columnGap) || 18; return c.offsetWidth + gap; }
    function atEnd() { return el.scrollLeft + el.clientWidth >= el.scrollWidth - 8; }
    function next() { if (atEnd()) el.scrollTo({ left: 0, behavior: 'smooth' }); else el.scrollBy({ left: step(), behavior: 'smooth' }); }
    function prev() { if (el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' }); else el.scrollBy({ left: -step(), behavior: 'smooth' }); }
    function touch() { lastTouch = Date.now(); }
    setInterval(function () {
      if (!visible || hover || doc.hidden || reduce || Date.now() - lastTouch < 6000) return;
      next();
    }, interval);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: .35 }).observe(el);
    else visible = true;
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; touch(); } });
    el.addEventListener('touchstart', touch, { passive: true });
    el.addEventListener('touchend', touch, { passive: true });
    el.addEventListener('wheel', touch, { passive: true });
    el.addEventListener('focusin', touch);
    el.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); touch(); next(); } if (e.key === 'ArrowLeft') { e.preventDefault(); touch(); prev(); } });
    /* mouse drag */
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = { x: e.clientX, s: el.scrollLeft }; moved = false; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('is-drag'); }
      if (moved) el.scrollLeft = down.s - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = null; touch();
      if (moved) { var s = step(), target = Math.round(el.scrollLeft / s) * s; el.classList.remove('is-drag'); el.scrollTo({ left: target, behavior: 'smooth' }); }
    });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    if (prog) el.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; var max = el.scrollWidth - el.clientWidth; var p = max > 0 ? el.scrollLeft / max : 1; prog.style.transform = 'scaleX(' + (0.12 + p * 0.88) + ')'; });
    }, { passive: true });
    $$('[data-sl-next="' + el.id + '"]').forEach(function (b) { b.addEventListener('click', function () { touch(); next(); }); });
    $$('[data-sl-prev="' + el.id + '"]').forEach(function (b) { b.addEventListener('click', function () { touch(); prev(); }); });
  }
  Slider($('#gallery'), 4200);
  Slider($('#reviews'), 5200);

  /* ---------------- dyno chart ---------------- */
  var svg = $('#dynoSvg'), X0 = 56, X1 = 624, Y0 = 336, Y1 = 22, HPMAX = 260, R0 = 1000, R1 = 7000;
  var xr = function (r) { return X0 + (r - R0) / (R1 - R0) * (X1 - X0); };
  var yh = function (h) { return Y0 - h / HPMAX * (Y0 - Y1); };
  (function grid() {
    var g = '<g class="dgrid">';
    for (var h = 0; h <= 250; h += 50) g += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + yh(h) + '" y2="' + yh(h) + '"/><text x="' + (X0 - 10) + '" y="' + (yh(h) + 5) + '" text-anchor="end">' + h + '</text>';
    for (var r = 1000; r <= 7000; r += 1000) g += '<line x1="' + xr(r) + '" x2="' + xr(r) + '" y1="' + Y1 + '" y2="' + Y0 + '"/><text x="' + xr(r) + '" y="' + (Y0 + 22) + '" text-anchor="middle">' + (r / 1000) + 'k</text>';
    g += '<text class="ax" x="' + X1 + '" y="' + (Y0 + 40) + '" text-anchor="end">VÒNG TUA (RPM)</text><text x="' + (X0 - 10) + '" y="' + (Y1 - 6) + '" text-anchor="end">HP</text></g>';
    $('#dynoGrid').innerHTML = g;
  })();
  function pathFrom(vals) {
    var pts = D.DYNO.rpm.map(function (r, i) { return [xr(r), yh(vals[i])]; });
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }
  var stockP = $('#dynoStock'), tunedP = $('#dynoTuned'), areaP = $('#dynoArea'), peakG = $('#dynoPeak');
  var cur = D.DYNO.stages[1].hp.slice(), stageIdx = 1;
  function drawTuned(vals) {
    var d = pathFrom(vals);
    tunedP.setAttribute('d', d);
    areaP.setAttribute('d', d + 'L' + xr(D.DYNO.rpm[D.DYNO.rpm.length - 1]) + ',' + Y0 + 'L' + xr(D.DYNO.rpm[0]) + ',' + Y0 + 'Z');
    var mi = 0; vals.forEach(function (v, i) { if (v > vals[mi]) mi = i; });
    peakG.setAttribute('transform', 'translate(' + xr(D.DYNO.rpm[mi]) + ',' + yh(vals[mi]) + ')');
  }
  stockP.setAttribute('d', pathFrom(D.DYNO.stock));
  drawTuned(cur);
  function setKpi(i, animate) {
    var s = D.DYNO.stages[i], gain = Math.round((s.peakHp / 178 - 1) * 100);
    var tgt = { hp: s.peakHp, nm: s.nm, g: gain };
    var els = { hp: $('#kHp'), nm: $('#kNm'), g: $('#kGain') };
    if (!hasGsap || !animate || reduce) { els.hp.textContent = tgt.hp; els.nm.textContent = tgt.nm; els.g.textContent = '+' + tgt.g; return; }
    var o = { hp: +els.hp.textContent || 0, nm: +els.nm.textContent || 0, g: parseInt(els.g.textContent, 10) || 0 };
    gsap.to(o, { hp: tgt.hp, nm: tgt.nm, g: tgt.g, duration: .9, ease: 'power2.out', onUpdate: function () { els.hp.textContent = Math.round(o.hp); els.nm.textContent = Math.round(o.nm); els.g.textContent = '+' + Math.round(o.g); } });
  }
  setKpi(1, false);
  $('#dynoSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var i = +b.getAttribute('data-stage'); if (i === stageIdx) return; stageIdx = i;
    $$('button', this).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    var target = D.DYNO.stages[i].hp;
    if (hasGsap && !reduce) { gsap.to(cur, { endArray: target, duration: .9, ease: 'power3.inOut', onUpdate: function () { drawTuned(cur); } }); }
    else { cur = target.slice(); drawTuned(cur); }
    setKpi(i, true);
    var g = $('[data-gauge]'); if (g) g.textContent = D.DYNO.stages[i].peakHp;
  });
  /* hover read-out */
  var tip = $('#dynoTip'), hov = $('#dynoHover'), fig = $('.dyno__chart'), svgRect = null, figRect = null;
  function cacheRects() { svgRect = svg.getBoundingClientRect(); figRect = fig.getBoundingClientRect(); }
  svg.addEventListener('pointerenter', cacheRects);
  svg.addEventListener('pointermove', function (e) {
    if (!svgRect) cacheRects();
    var vx = (e.clientX - svgRect.left) / svgRect.width * 640;
    var r = R0 + (vx - X0) / (X1 - X0) * (R1 - R0);
    var rpm = D.DYNO.rpm, i = Math.round((r - rpm[0]) / 500);
    i = Math.max(0, Math.min(rpm.length - 1, i));
    var x = xr(rpm[i]), y = yh(cur[i]);
    hov.setAttribute('opacity', 1);
    $('#dhLine').setAttribute('x1', x); $('#dhLine').setAttribute('x2', x);
    $('#dhDot').setAttribute('cx', x); $('#dhDot').setAttribute('cy', y);
    tip.hidden = false;
    tip.innerHTML = rpm[i].toLocaleString('vi-VN') + ' rpm · Zin ' + D.DYNO.stock[i] + ' · Độ <b>' + Math.round(cur[i]) + ' HP</b>';
    var px = svgRect.left - figRect.left + x / 640 * svgRect.width, py = svgRect.top - figRect.top + y / 380 * svgRect.height - 12;
    px = Math.max(110, Math.min(figRect.width - 110, px));
    tip.style.transform = 'translate(' + px + 'px,' + py + 'px) translate(-50%,-100%)';
  });
  svg.addEventListener('pointerleave', function () { hov.setAttribute('opacity', 0); tip.hidden = true; svgRect = null; });
  window.addEventListener('resize', function () { svgRect = null; }, { passive: true });

  /* ---------------- initial render ---------------- */
  refresh(false);
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ======================= GSAP ANIMATION ======================= */
  function batchReveal(els) {
    if (!hasGsap || reduce) { if (window.gsap) gsap.set(els, { opacity: 1 }); return; }
    gsap.set(els, { opacity: 0, y: 34 });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out', overwrite: true, clearProps: 'transform' }); }
    });
  }

  function countUp(el, to, opts) {
    opts = opts || {};
    var dec = opts.dec || 0, sep = opts.sep, o = { v: opts.from || 0 };
    return gsap.to(o, { v: to, duration: opts.dur || 1.8, ease: 'power2.out', delay: opts.delay || 0, onUpdate: function () {
      var v = dec ? o.v.toFixed(dec).replace('.', ',') : Math.round(o.v);
      el.textContent = sep ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '+' : v;
    } });
  }

  if (!hasGsap) return;

  if (reduce) {
    gsap.set('[data-reveal], .hero__eye, .hl > span, .hero__sub, .hero__cta, .hero__stats li, .gauge', { opacity: 1 });
    $$('[data-count]').forEach(function (el) { var v = el.getAttribute('data-count'); el.textContent = el.hasAttribute('data-sep') ? v.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '+' : v.replace('.', ','); });
    $$('.meter__bar [data-to]').forEach(function (b) { b.style.transform = 'scaleX(' + b.getAttribute('data-to') + ')'; });
    $('.steps').style.setProperty('--p', 1);
    $('#needle').style.transform = 'rotate(' + (-90 + 228 / 300 * 180) + 'deg)';
    return;
  }

  /* --- hero intro --- */
  var mm = gsap.matchMedia();
  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .fromTo('.hero__media', { scale: 1.14 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
    .fromTo('.hero__eye', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: .6 }, .2)
    .fromTo('.hl > span', { opacity: 0, x: -140, skewX: 18 }, { opacity: 1, x: 0, skewX: 0, duration: .9, stagger: .13, ease: 'expo.out' }, .3)
    .fromTo('.hero__sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7 }, .8)
    .fromTo('.hero__cta', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7 }, .95)
    .fromTo('.hero__stats li', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, stagger: .1 }, 1.1)
    .fromTo('.gauge', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: .9 }, .7)
    .fromTo('#needle', { rotate: -90 }, { rotate: 90, duration: .8, ease: 'power2.in', svgOrigin: '120 130' }, 1.0)
    .to('#needle', { rotate: -90 + 228 / 300 * 180, duration: 1.1, ease: 'elastic.out(1, .45)', svgOrigin: '120 130' }, '>');
  $$('.hero [data-count]').forEach(function (el, i) {
    var v = parseFloat(el.getAttribute('data-count'));
    intro.add(countUp(el, v, { dec: +el.getAttribute('data-dec') || 0, sep: el.hasAttribute('data-sep'), dur: 1.8 }), 1.15 + i * .1);
  });
  intro.add(countUp($('[data-gauge]'), 228, { from: 178, dur: 1.6 }), 1.3);

  /* --- speed streaks (paused off-screen) --- */
  var streakBox = $('#streaks');
  var streakTl = gsap.timeline({ paused: true });
  var N = isMobile() ? 5 : 12;
  for (var i = 0; i < N; i++) {
    var s = doc.createElement('i');
    s.className = 'streak' + (i % 4 === 0 ? ' streak--red' : '');
    s.style.top = isMobile() ? (24 + Math.random() * 300).toFixed(0) + 'px' : (8 + Math.random() * 84).toFixed(1) + '%';
    s.style.width = (18 + Math.random() * 26).toFixed(1) + 'vw';
    streakBox.appendChild(s);
    var dur = .55 + Math.random() * .9;
    streakTl.add(gsap.fromTo(s, { xPercent: 420, opacity: .15 + Math.random() * .55 }, { xPercent: -120, duration: dur, ease: 'none', repeat: -1, repeatDelay: Math.random() * 1.6, delay: Math.random() * 2 }), 0);
  }
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: function (self) { if (self.isActive) streakTl.play(); else streakTl.pause(); } });
  streakTl.play();

  /* --- hero parallax --- */
  gsap.to('.hero__img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__copy', { y: -70, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center 40%', end: 'bottom top', scrub: true } });

  /* --- header solid --- */
  ScrollTrigger.create({ start: 10, end: 'max', onToggle: function (self) { hdr.classList.toggle('is-solid', self.isActive); } });

  /* --- marquee (paused off-screen) --- */
  var mqV = 1;
  var mq = gsap.to('#marquee', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onToggle: function (self) { if (self.isActive) mq.play(); else mq.pause(); },
    onUpdate: function (self) { if (isMobile()) return; var v = Math.round(Math.min(4, 1 + Math.abs(self.getVelocity()) / 900) * 2) / 2; if (v > 1 && v !== mqV) { mqV = v; gsap.to(mq, { timeScale: v, duration: .3, overwrite: true }); } } });
  ScrollTrigger.addEventListener('scrollEnd', function () { mqV = 1; gsap.to(mq, { timeScale: 1, duration: 1.2, overwrite: true }); });

  /* --- reveals --- */
  batchReveal($$('[data-reveal]').filter(function (el) { return !el.closest('.grid'); }));
  gsap.utils.toArray('.sec-head .eyebrow i, .eyebrow i').forEach(function (el) {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  /* --- categories hover tilt is CSS; parallax inside tiles on scroll (desktop) --- */
  mm.add('(min-width: 761px)', function () {
    gsap.fromTo('.fit__car', { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.fit', start: 'top 70%', once: true } });
    gsap.fromTo('.book__bg img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.book', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  /* car wheels spin when fitment section enters */
  gsap.fromTo('.carsvg .part--mam', { rotate: -720 }, { rotate: 0, transformOrigin: '50% 50%', duration: 2, ease: 'power3.out', scrollTrigger: { trigger: '.fit', start: 'top 70%', once: true } });

  /* --- combos: counters + gauges --- */
  $$('.cb').forEach(function (cb) {
    ScrollTrigger.create({ trigger: cb, start: 'top 80%', once: true, onEnter: function () {
      var hp = $('.cb__hp b', cb);
      countUp(hp, +hp.getAttribute('data-to'), { from: +hp.getAttribute('data-from'), dur: 1.6, delay: .2 });
      $$('.meter__bar [data-to]', cb).forEach(function (b, k) {
        gsap.to(b, { scaleX: +b.getAttribute('data-to'), duration: 1.3, delay: .2 + k * .06, ease: 'power3.out' });
      });
    } });
  });
  gsap.to('.bigtxt span', { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '.combo', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* --- dyno draw-in --- */
  (function () {
    var len = tunedP.getTotalLength(), slen = stockP.getTotalLength();
    gsap.set(tunedP, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(stockP, { strokeDasharray: '6 6', opacity: 0 });
    ScrollTrigger.create({ trigger: '#dynoSvg', start: 'top 75%', once: true, onEnter: function () {
      var tl = gsap.timeline();
      tl.to(stockP, { opacity: 1, duration: .6 })
        .to(tunedP, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', onComplete: function () { tunedP.style.strokeDasharray = 'none'; } }, .2)
        .to(areaP, { opacity: 1, duration: .8 }, 1.2)
        .fromTo(peakG, { opacity: 0 }, { opacity: 1, duration: .4 }, 1.8);
      setKpi(stageIdx, false);
      var o = { hp: 0, nm: 0, g: 0 }, s = D.DYNO.stages[stageIdx];
      tl.to(o, { hp: s.peakHp, nm: s.nm, g: Math.round((s.peakHp / 178 - 1) * 100), duration: 1.8, ease: 'power2.out', onUpdate: function () { $('#kHp').textContent = Math.round(o.hp); $('#kNm').textContent = Math.round(o.nm); $('#kGain').textContent = '+' + Math.round(o.g); } }, .2);
      void slen;
    } });
  })();

  /* --- process line --- */
  gsap.fromTo('.steps', { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 55%', scrub: .6 } });
  gsap.utils.toArray('.step').forEach(function (st, k) {
    gsap.fromTo(st, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: k * .12, scrollTrigger: { trigger: '.steps', start: 'top 82%', once: true } });
  });

  /* --- gallery / reviews entrance --- */
  gsap.fromTo('#gallery .build', { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#gallery', start: 'top 85%', once: true } });
  gsap.fromTo('#reviews .rcard', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#reviews', start: 'top 85%', once: true } });

  /* pause CSS infinite animations when off-screen */
  [['.gauge', '.hero'], ['.fit__car', '.fit']].forEach(function (pair) {
    ScrollTrigger.create({ trigger: pair[1], start: 'top bottom', end: 'bottom top', onToggle: function (self) { $(pair[0]).classList.toggle('paused', !self.isActive); } });
  });

  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
