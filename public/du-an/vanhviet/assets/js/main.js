/* VÀNH VIỆT – Mâm & Lốp · tương tác & chuyển động */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var G = window.gsap || null;
  var ST = window.ScrollTrigger || null;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = !!(G && ST && !reduced);
  if (G && ST) G.registerPlugin(ST);

  var VV = window.VV, Art = window.VVArt;
  var P = VV.PRODUCTS;
  var byId = {};
  P.forEach(function (p) { byId[p.id] = p; });

  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmt(n) { return num(n) + '₫'; }
  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stars(r) { var f = Math.round(r); return '★★★★★'.slice(0, f) + '☆☆☆☆☆'.slice(0, 5 - f); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };

  /* quay nhóm SVG bằng CSS transform (transform-box: fill-box) */
  function spin(els, from, dur) {
    if (!anim || !els.length) return;
    var o = { r: from };
    var set = function () { for (var i = 0; i < els.length; i++) els[i].style.transform = 'rotate(' + o.r.toFixed(2) + 'deg)'; };
    set();
    G.to(o, { r: 0, duration: dur, ease: 'power3.out', onUpdate: set, onComplete: function () { els.forEach(function (e) { e.style.transform = ''; }); } });
  }

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- smooth scroll cho liên kết nội trang ---------- */
  function goTo(id) {
    var t = document.getElementById(id);
    if (!t) return;
    t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    e.preventDefault();
    if (a.dataset.cat !== undefined) setCat(a.dataset.cat);
    if (a.dataset.service) setService(a.dataset.service);
    closeMenu(); closeCart();
    goTo(id);
  });

  /* ---------- header ---------- */
  var hdr = $('#hdr'), ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; });
  }, { passive: true });

  /* ---------- countdown flash sale ---------- */
  var cdEls = $$('[data-cd]');
  function tickCd() {
    var now = new Date(), end = new Date(now); end.setHours(23, 59, 59, 999);
    var s = Math.max(0, Math.floor((end - now) / 1000));
    var t = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map(function (x) { return String(x).padStart(2, '0'); }).join(':');
    cdEls.forEach(function (el) { el.textContent = t; });
  }
  tickCd(); setInterval(tickCd, 1000);

  /* ---------- menu di động ---------- */
  var mnav = $('#mnav'), burger = $('#burger');
  function openMenu() { mnav.classList.add('is-open'); mnav.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('lock'); setTimeout(function () { var b = $('[data-close-menu]'); b && b.focus(); }, 50); }
  function closeMenu() { if (!mnav.classList.contains('is-open')) return; mnav.classList.remove('is-open'); mnav.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); unlock(); }
  burger.addEventListener('click', openMenu);
  $('[data-close-menu]').addEventListener('click', closeMenu);
  mnav.addEventListener('click', function (e) { if (e.target === mnav) closeMenu(); });
  function unlock() {
    if (!mnav.classList.contains('is-open') && !drawer.classList.contains('is-open') && !qv.classList.contains('is-open')) document.documentElement.classList.remove('lock');
  }

  /* ---------- tìm kiếm ---------- */
  var q = $('#q'), qm = $('#qm'), searchM = $('#searchM'), sTg = $('#searchToggle'), qT;
  function onSearch(v, from) {
    if (from !== q) q.value = v;
    if (from !== qm) qm.value = v;
    clearTimeout(qT);
    qT = setTimeout(function () { state.q = norm(v.trim()); renderProducts(); }, 160);
  }
  q.addEventListener('input', function () { onSearch(q.value, q); });
  qm.addEventListener('input', function () { onSearch(qm.value, qm); });
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); goTo('san-pham'); });
  searchM.addEventListener('submit', function (e) { e.preventDefault(); qm.blur(); goTo('san-pham'); });
  sTg.addEventListener('click', function () {
    var open = searchM.hidden;
    searchM.hidden = !open;
    sTg.setAttribute('aria-expanded', String(open));
    if (open) qm.focus();
  });

  /* =========================================================
     SẢN PHẨM + BỘ LỌC
     ========================================================= */
  var state = { cat: '', d: [], design: [], finish: [], price: '', q: '', sort: 'hot' };
  var grid = $('#pgrid'), firstRender = true, batchTriggers = [], refreshT;
  var CAT_NAME = { mam: 'Mâm đúc', lop: 'Lốp xe', pk: 'Phụ kiện' };
  var EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var CART_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 001.5 1.2h8.6a1.5 1.5 0 001.5-1.1L21 8H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v4M10 11h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function artFor(p) {
    if (p.cat === 'mam') return Art.wheelSVG(p.design, p.finish);
    if (p.cat === 'lop') return Art.tyreSVG(p);
    return Art.accSVG(p.art);
  }
  function catLabel(p) {
    if (p.cat === 'mam') return 'Mâm đúc · ' + VV.DESIGNS[p.design].name;
    if (p.cat === 'lop') return 'Lốp xe · ' + p.line;
    return 'Phụ kiện';
  }
  function offPct(p) { return p.old ? Math.round((1 - p.price / p.old) * 100) : 0; }

  function filtered() {
    var terms = state.q ? state.q.split(/\s+/).filter(Boolean) : [];
    var list = P.filter(function (p) {
      if (state.cat && p.cat !== state.cat) return false;
      if (state.d.length && state.d.indexOf(String(p.d)) < 0) return false;
      if (state.design.length && !(p.cat === 'mam' && state.design.indexOf(p.design) >= 0)) return false;
      if (state.finish.length && !(p.cat === 'mam' && state.finish.indexOf(p.finish) >= 0)) return false;
      if (state.price) {
        var r = state.price.split('-').map(Number);
        if (p.price < r[0] || p.price >= r[1]) return false;
      }
      if (terms.length) {
        var hay = norm([p.name, p.spec, p.size, CAT_NAME[p.cat], p.d ? p.d + ' inch ' + p.d + '"' : '', p.design ? VV.DESIGNS[p.design].name : '', p.finish ? VV.FINISHES[p.finish].name : ''].join(' '));
        for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) < 0) return false;
      }
      return true;
    });
    var s = state.sort;
    if (s === 'asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (s === 'desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (s === 'sale') list.sort(function (a, b) { return offPct(b) - offPct(a); });
    else if (s === 'rate') list.sort(function (a, b) { return b.rating - a.rating || b.rv - a.rv; });
    else list.sort(function (a, b) { return (b.flash ? 1 : 0) - (a.flash ? 1 : 0); });
    return list;
  }

  function cardHTML(p) {
    var off = offPct(p);
    return '<article class="pcard" data-id="' + p.id + '">' +
      '<div class="pc-media" data-qv="' + p.id + '">' +
      '<div class="pc-badges">' + (off ? '<span class="bdg bdg-sale">-' + off + '%</span>' : '') + (p.flash ? '<span class="bdg bdg-flash">Flash sale</span>' : '') + '</div>' +
      (p.d && p.cat === 'mam' ? '<span class="pc-dia">' + p.d + '″</span>' : '') +
      artFor(p) +
      '<button class="pc-qv" data-qv="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '">' + EYE + '</button></div>' +
      '<div class="pc-body"><p class="pc-cat mono">' + catLabel(p) + '</p>' +
      '<h3 class="pc-name"><button data-qv="' + p.id + '">' + esc(p.name) + '</button></h3>' +
      '<p class="pc-spec">' + esc(p.spec) + '</p>' +
      '<p class="pc-rate"><span class="stars" aria-hidden="true">' + stars(p.rating) + '</span><span>' + p.rating.toFixed(1).replace('.', ',') + ' (' + p.rv + ')</span></p>' +
      '<p class="pc-price"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s>' : '') + (p.cat === 'mam' ? '<small>/ chiếc</small>' : '') + '</p>' +
      '<button class="add" data-add="' + p.id + '">' + CART_I + '<span>Thêm vào giỏ</span></button></div></article>';
  }

  function renderProducts() {
    var list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    var nF = state.d.length + state.design.length + state.finish.length + (state.price ? 1 : 0);
    $('#fCount').textContent = nF ? String(nF) : '';
    $('#resultInfo').textContent = list.length + ' sản phẩm' + (state.q ? ' · từ khoá “' + (q.value || qm.value) + '”' : '') + (nF ? ' · ' + nF + ' bộ lọc' : '');
    var cards = $$('.pcard', grid);
    /* chiều cao lưới thay đổi → tính lại vị trí các ScrollTrigger phía dưới */
    if (anim && !firstRender) { clearTimeout(refreshT); refreshT = setTimeout(function () { ST.refresh(); }, 120); }
    batchTriggers.forEach(function (t) { t.kill(); });
    batchTriggers = [];
    if (!anim || !cards.length) { firstRender = false; return; }
    if (firstRender) {
      firstRender = false;
      G.set(cards, { opacity: 0, y: 34 });
      batchTriggers = ST.batch(cards, {
        start: 'top 92%', once: true,
        onEnter: function (b) { G.to(b, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out', overwrite: true }); }
      });
    } else {
      G.fromTo(cards, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .45, stagger: .035, ease: 'power2.out', overwrite: true });
    }
  }

  function syncFilterUI() {
    $$('.f-chips, .f-sw').forEach(function (g) {
      var key = g.dataset.f;
      $$('button', g).forEach(function (b) { b.setAttribute('aria-pressed', String(state[key].indexOf(b.dataset.v) >= 0)); });
    });
    $$('.f-radio input').forEach(function (r) { r.checked = r.value === state.price; });
    $$('.tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.cat === state.cat)); });
  }
  function setCat(c) { state.cat = c || ''; syncFilterUI(); renderProducts(); }

  $$('.f-chips, .f-sw').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var arr = state[g.dataset.f], i = arr.indexOf(b.dataset.v);
      if (i >= 0) arr.splice(i, 1); else arr.push(b.dataset.v);
      if ((g.dataset.f === 'design' || g.dataset.f === 'finish') && arr.length && state.cat && state.cat !== 'mam') state.cat = 'mam';
      syncFilterUI(); renderProducts();
    });
  });
  $$('.f-radio input').forEach(function (r) { r.addEventListener('change', function () { state.price = r.value; renderProducts(); }); });
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { setCat(b.dataset.cat); }); });
  $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; renderProducts(); });
  function resetFilters() {
    state.d = []; state.design = []; state.finish = []; state.price = ''; state.cat = ''; state.q = '';
    q.value = ''; qm.value = '';
    syncFilterUI(); renderProducts();
  }
  $('#fReset').addEventListener('click', resetFilters);
  $('#emptyReset').addEventListener('click', resetFilters);
  var fToggle = $('#fToggle'), filtersEl = $('#filters');
  fToggle.addEventListener('click', function () {
    var open = !filtersEl.classList.contains('is-open');
    filtersEl.classList.toggle('is-open', open);
    fToggle.setAttribute('aria-expanded', String(open));
    if (open && anim) G.from(filtersEl, { y: -12, opacity: 0, duration: .35, ease: 'power2.out' });
    if (anim) { clearTimeout(refreshT); refreshT = setTimeout(function () { ST.refresh(); }, 120); }
  });

  /* =========================================================
     GIỎ HÀNG
     ========================================================= */
  var KEY = 'vanhviet_cart_v1';
  var cart = store.get(KEY, []);
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter(function (i) { return i && typeof i.key === 'string' && typeof i.price === 'number' && i.qty > 0; });
  var drawer = $('#drawer'), overlay = $('#overlay'), lastFocus = null;

  function itemFromProduct(p) {
    return {
      key: p.id, name: p.name, spec: p.cat === 'lop' ? p.size : p.spec, price: p.price,
      art: p.cat === 'mam' ? { k: 'w', design: p.design, finish: p.finish } : p.cat === 'lop' ? { k: 't', pid: p.id } : { k: 'a', art: p.art }
    };
  }
  function artFromDesc(a) {
    if (!a) return '';
    if (a.k === 'w') return Art.wheelSVG(a.design, a.finish);
    if (a.k === 't' && byId[a.pid]) return Art.tyreSVG(byId[a.pid]);
    if (a.k === 'a') return Art.accSVG(a.art);
    return '';
  }
  function saveCart() { store.set(KEY, cart); }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function subtotal() { return cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0); }

  function renderCart() {
    var n = count();
    $$('[data-count-badge]').forEach(function (b) { b.textContent = n > 99 ? '99+' : String(n); b.style.visibility = n ? 'visible' : 'hidden'; });
    $('#drCount').textContent = '(' + n + ')';
    $('#drList').innerHTML = cart.map(function (i) {
      return '<li class="ci" data-key="' + esc(i.key) + '"><div class="ci-img">' + artFromDesc(i.art) + '</div>' +
        '<div><p class="ci-name">' + esc(i.name) + '</p><p class="ci-spec">' + esc(i.spec || '') + '</p><p class="ci-price">' + fmt(i.price * i.qty) + '</p>' +
        '<div class="qty"><button data-q="-1" aria-label="Giảm số lượng">−</button><span>' + i.qty + '</span><button data-q="1" aria-label="Tăng số lượng">+</button></div></div>' +
        '<button class="ci-rm" data-rm aria-label="Xoá ' + esc(i.name) + '"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>';
    }).join('');
    $('#drEmpty').hidden = cart.length > 0;
    $('#drFoot').hidden = cart.length === 0;
    $('#drList').hidden = cart.length === 0;
    $('#drSubtotal').textContent = fmt(subtotal());
    $('#coTotal').textContent = fmt(subtotal());
  }

  function addItem(item, qty, flyHTML, flyRect) {
    var ex = cart.filter(function (i) { return i.key === item.key; })[0];
    if (ex) ex.qty = Math.min(99, ex.qty + qty);
    else { item.qty = qty; cart.push(item); }
    saveCart();
    renderCart();
    fly(flyHTML, flyRect);
    toast('Đã thêm <b>' + qty + ' ×</b> ' + esc(item.name.length > 46 ? item.name.slice(0, 44) + '…' : item.name));
  }

  $('#drList').addEventListener('click', function (e) {
    var li = e.target.closest('.ci'); if (!li) return;
    var it = cart.filter(function (i) { return i.key === li.dataset.key; })[0]; if (!it) return;
    var qb = e.target.closest('[data-q]');
    if (qb) {
      it.qty += Number(qb.dataset.q);
      if (it.qty < 1) cart.splice(cart.indexOf(it), 1);
      else if (it.qty > 99) it.qty = 99;
    } else if (e.target.closest('[data-rm]')) {
      cart.splice(cart.indexOf(it), 1);
    } else return;
    saveCart(); renderCart();
  });

  function showView(v) {
    ['drCart', 'drCheckout', 'drOk'].forEach(function (id) { $('#' + id).hidden = id !== v; });
  }
  function openCart() {
    lastFocus = document.activeElement;
    showView('drCart');
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-on'); });
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lock');
    setTimeout(function () { $('[data-close-cart]', drawer).focus(); }, 60);
  }
  function closeCart() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-on');
    setTimeout(function () { if (!drawer.classList.contains('is-open')) overlay.hidden = true; }, 300);
    unlock();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $('#cartBtn').addEventListener('click', openCart);
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', openCart); });
  $$('[data-close-cart]').forEach(function (b) { b.addEventListener('click', function (e) { if (b.tagName !== 'A') { e.preventDefault(); closeCart(); } }); });
  overlay.addEventListener('click', function () { closeCart(); closeQV(); });
  $('#toCheckout').addEventListener('click', function () { showView('drCheckout'); setTimeout(function () { $('#coForm').elements.name.focus(); }, 50); });
  $('#backToCart').addEventListener('click', function () { showView('drCart'); });

  /* bay vào giỏ */
  function cartTarget() {
    var mb = $('.mbar [data-open-cart]');
    if (mb && mb.offsetParent !== null && window.innerWidth <= 760) return mb;
    return $('#cartBtn');
  }
  function bump() {
    if (!anim) return;
    G.fromTo('[data-count-badge]', { scale: 1.7 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.35)', overwrite: true });
    G.fromTo(cartTarget(), { rotation: -14 }, { rotation: 0, duration: .8, ease: 'elastic.out(1,.3)', overwrite: true });
  }
  function fly(html, r1) {
    if (!anim || !html || !r1 || !r1.width) { bump(); return; }
    var t = cartTarget().getBoundingClientRect();
    var size = Math.min(r1.width, r1.height, 170);
    var el = document.createElement('div');
    el.className = 'fly';
    el.style.cssText = 'left:' + (r1.left + r1.width / 2 - size / 2) + 'px;top:' + (r1.top + r1.height / 2 - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
    el.innerHTML = html;
    document.body.appendChild(el);
    var dx = t.left + t.width / 2 - (r1.left + r1.width / 2), dy = t.top + t.height / 2 - (r1.top + r1.height / 2);
    G.timeline({ onComplete: function () { el.remove(); bump(); } })
      .to(el, { x: dx, duration: .9, ease: 'power1.inOut' }, 0)
      .to(el, { y: dy, duration: .9, ease: 'back.in(1.4)' }, 0)
      .to(el, { scale: .16, rotation: 420, duration: .9, ease: 'power2.in' }, 0)
      .to(el, { opacity: 0, duration: .15 }, .78);
  }

  /* nút thêm vào giỏ (lưới & xem nhanh) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    var p = byId[b.dataset.add]; if (!p) return;
    var qty = 1, src;
    if (b.hasAttribute('data-qv-add')) { qty = qvQty; src = $('#qvMedia > svg'); }
    else { var card = b.closest('.pcard'); src = card && $('.pc-media > svg', card); }
    addItem(itemFromProduct(p), qty, src ? src.outerHTML : '', src ? src.getBoundingClientRect() : null);
    b.classList.add('is-done');
    var lab = $('span', b) || b;
    var old = lab.textContent;
    lab.textContent = 'Đã thêm ✓';
    setTimeout(function () { b.classList.remove('is-done'); lab.textContent = old; }, 1400);
    if (b.hasAttribute('data-qv-add')) setTimeout(closeQV, 350);
  });

  /* ---------- form helpers ---------- */
  var PHONE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return v.replace(/[\s.\-()]/g, ''); }
  function validate(form, rules) {
    var ok = true;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      var msg = rules[name](el.value.trim());
      var fld = el.closest('.fld');
      fld.classList.toggle('bad', !!msg);
      var er = $('.err', fld); if (er) er.textContent = msg || '';
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  var R_NAME = function (v) { return v.length < 2 ? 'Vui lòng nhập họ tên.' : ''; };
  var R_PHONE = function (v) { return !v ? 'Vui lòng nhập số điện thoại.' : PHONE.test(cleanPhone(v)) ? '' : 'Số điện thoại chưa đúng (10 số, bắt đầu 03, 05, 07, 08, 09).'; };

  $('#coForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    if (!cart.length) { showView('drCart'); return; }
    if (!validate(f, { name: R_NAME, phone: R_PHONE, address: function (v) { return v.length < 6 ? 'Vui lòng nhập địa chỉ cụ thể.' : ''; } })) return;
    var code = 'VV' + String(Math.floor(100000 + Math.random() * 900000));
    $('#okMsg').innerHTML = 'Cảm ơn <b>' + esc(f.elements.name.value.trim()) + '</b>! Đơn <b>' + code + '</b> trị giá <b>' + fmt(subtotal()) + '</b> đã được ghi nhận (minh hoạ). Chúng tôi sẽ gọi ' + esc(cleanPhone(f.elements.phone.value)) + ' để hẹn lịch lắp.';
    cart = []; saveCart(); renderCart(); f.reset();
    showView('drOk');
    if (anim) G.from('#drOk > *', { y: 20, opacity: 0, stagger: .08, duration: .5, ease: 'power3.out' });
  });

  /* =========================================================
     XEM NHANH
     ========================================================= */
  var qv = $('#qv'), qvQty = 1, qvP = null, qvLast = null;
  function openQV(id) {
    var p = byId[id]; if (!p) return;
    qvP = p; qvLast = document.activeElement;
    qvQty = p.cat === 'pk' ? 1 : 4;
    $('#qvMedia').innerHTML = artFor(p);
    var off = offPct(p);
    var rows = p.cat === 'mam'
      ? [['Đường kính', p.d + ' inch'], ['Kiểu nan', VV.DESIGNS[p.design].name], ['Màu hoàn thiện', VV.FINISHES[p.finish].name], ['Thông số', p.spec], ['PCD', p.pcd], ['Bảo hành', 'Kết cấu 5 năm · sơn 2 năm']]
      : p.cat === 'lop'
        ? [['Cỡ lốp', p.size], ['Dòng lốp', p.line], ['Đặc tính', p.spec], ['Bảo hành', '5 năm hoặc 60.000 km']]
        : [['Thông số', p.spec], ['Bảo hành', '12 tháng']];
    $('#qvBody').innerHTML = '<p class="mono pc-cat">' + catLabel(p) + '</p><h3 id="qvTitle">' + esc(p.name) + '</h3>' +
      '<p class="pc-rate"><span class="stars" aria-hidden="true">' + stars(p.rating) + '</span><span>' + p.rating.toFixed(1).replace('.', ',') + ' · ' + p.rv + ' đánh giá</span></p>' +
      '<p class="pc-price"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s> <span class="bdg bdg-sale">-' + off + '%</span>' : '') + (p.cat === 'mam' ? '<small>/ chiếc</small>' : '') + '</p>' +
      '<p class="desc">' + esc(p.desc) + '</p>' +
      '<dl class="qv-spec">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      '<div class="qv-buy"><div class="qty"><button type="button" data-qd="-1" aria-label="Giảm">−</button><span id="qvQty">' + qvQty + '</span><button type="button" data-qd="1" aria-label="Tăng">+</button></div>' +
      '<button class="add" data-add="' + p.id + '" data-qv-add>' + CART_I + '<span>Thêm vào giỏ</span></button></div>' +
      (p.cat !== 'pk' ? '<p class="fnote" style="text-align:left">Mặc định 4 chiếc – đủ một bộ cho xe.</p>' : '');
    qv.classList.add('is-open');
    qv.setAttribute('aria-hidden', 'false');
    overlay.hidden = true;
    document.documentElement.classList.add('lock');
    setTimeout(function () { $('[data-close-qv]').focus(); }, 60);
    if (anim) {
      var rr = $('#qvMedia .rim-rot');
      if (rr) spin([rr], -160, 1.2);
      G.from('#qvBody > *', { y: 16, opacity: 0, stagger: .04, duration: .45, ease: 'power2.out', delay: .1 });
    }
  }
  function closeQV() {
    if (!qv.classList.contains('is-open')) return;
    qv.classList.remove('is-open');
    qv.setAttribute('aria-hidden', 'true');
    unlock();
    if (qvLast && qvLast.focus) qvLast.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-qv]');
    if (t && !e.target.closest('[data-add]')) { openQV(t.dataset.qv); return; }
  });
  $('[data-close-qv]').addEventListener('click', closeQV);
  qv.addEventListener('click', function (e) {
    if (e.target === qv) closeQV();
    var d = e.target.closest('[data-qd]');
    if (d) { qvQty = Math.max(1, Math.min(99, qvQty + Number(d.dataset.qd))); $('#qvQty').textContent = qvQty; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeQV(); closeCart(); closeMenu(); }
  });

  /* =========================================================
     CẤU HÌNH MÂM
     ========================================================= */
  var cfg = { make: 'Honda', mi: 1, d: 18, design: 'turbine', finish: 'titan', total: 0 };
  var TYPE_NAME = { sedan: 'Sedan', hatch: 'Hatchback', suv: 'SUV · MPV', pickup: 'Bán tải' };
  function car() { return VV.CARS[cfg.make][cfg.mi]; }
  function tyreSize() { return VV.TYRE_FOR[car().type][cfg.d] || VV.TYRE_FOR.sedan[cfg.d]; }
  function ratioOf(size) {
    var m = /(\d+)\/(\d+)R(\d+)/.exec(size); if (!m) return .66;
    var rim = m[3] * 25.4; return rim / (rim + 2 * m[1] * m[2] / 100);
  }
  function wheelPrice() { return Math.round(VV.WHEEL_BASE[cfg.d] * VV.DESIGNS[cfg.design].k / 10000) * 10000 + VV.FINISHES[cfg.finish].add; }
  function tyrePrice() { return Math.round(VV.TYRE_BASE[cfg.d] * (car().type === 'pickup' ? 1.15 : 1) / 10000) * 10000; }

  function chip(label, checked, attrs, disabled) {
    return '<button type="button" class="chip" role="radio" aria-checked="' + checked + '" ' + attrs + (disabled ? ' disabled' : '') + '>' + label + '</button>';
  }
  function renderMakes() {
    $('#cfgMake').innerHTML = Object.keys(VV.CARS).map(function (m) { return chip(m, m === cfg.make, 'data-make="' + m + '"'); }).join('');
  }
  function renderModels() {
    $('#cfgModel').innerHTML = VV.CARS[cfg.make].map(function (c, i) { return chip(c.m, i === cfg.mi, 'data-mi="' + i + '"'); }).join('');
  }
  function renderDia() {
    var ok = car().d;
    $('#cfgDia').innerHTML = [15, 16, 17, 18, 19, 20].map(function (d) { return chip(d + '″', d === cfg.d, 'data-d="' + d + '" aria-label="' + d + ' inch' + (ok.indexOf(d) < 0 ? ' – không tương thích' : '') + '"', ok.indexOf(d) < 0); }).join('');
  }
  function renderDesigns() {
    $('#cfgDesign').innerHTML = Object.keys(VV.DESIGNS).map(function (k) {
      return '<button type="button" class="dsg" role="radio" aria-checked="' + (k === cfg.design) + '" data-design="' + k + '">' + Art.wheelSVG(k, cfg.finish) + '<span>' + VV.DESIGNS[k].name + '</span></button>';
    }).join('');
  }
  function renderFinishes() {
    $('#cfgFinish').innerHTML = Object.keys(VV.FINISHES).map(function (k) {
      var f = VV.FINISHES[k];
      return '<button type="button" class="swb" role="radio" aria-checked="' + (k === cfg.finish) + '" data-fin="' + k + '" aria-label="' + f.name + '" title="' + f.name + '" style="background:' + f.sw + '"></button>';
    }).join('');
    $('#cfgFinName').textContent = VV.FINISHES[cfg.finish].name;
  }

  var totalObj = { v: 0 };
  function setMoney(el, v) { el.textContent = fmt(v); }
  function updateCfg(how) {
    var c = car(), ts = tyreSize();
    var wp = wheelPrice(), tp = tyrePrice(), total = 4 * (wp + tp);
    var stage = $('#cfgCar');
    stage.innerHTML = Art.carSVG(c.type, cfg.design, cfg.finish, ratioOf(ts), c.lugs);
    $('#cfgCarName').textContent = cfg.make + ' ' + c.m;
    $('#cfgCarType').textContent = TYPE_NAME[c.type] + ' · ' + cfg.d + '″';
    $('#roPcd').textContent = c.pcd;
    $('#roCb').textContent = c.cb + ' mm';
    $('#roEt').textContent = c.et;
    $('#roTyre').textContent = ts;
    var code = 'VV-' + cfg.d + VV.DESIGNS[cfg.design].code;
    $('#pbWheelL').textContent = '4 × Mâm ' + code + ' ' + VV.FINISHES[cfg.finish].name.toLowerCase();
    $('#pbTyreL').textContent = '4 × Lốp ' + ts;
    setMoney($('#pbWheel'), 4 * wp);
    setMoney($('#pbTyre'), 4 * tp);
    setMoney($('#pbMonthly'), total / 12);
    cfg.total = total;
    if (anim) {
      G.to(totalObj, { v: total, duration: .8, ease: 'power2.out', overwrite: true, onUpdate: function () { setMoney($('#pbTotal'), totalObj.v); } });
      var spins = $$('.wspin', stage);
      if (how === 'car') {
        G.from($('.car-svg', stage), { x: -60, opacity: 0, duration: .8, ease: 'power3.out' });
        spin(spins, -540, 1.1);
      } else if (how) {
        spin(spins, -240, 1);
        G.fromTo($('.car-body', stage), { y: 0 }, { y: -4, duration: .18, yoyo: true, repeat: 1, ease: 'power1.out' });
      }
    } else {
      totalObj.v = total; setMoney($('#pbTotal'), total);
    }
  }
  function pickDia() {
    var ok = car().d;
    if (ok.indexOf(cfg.d) < 0) cfg.d = ok[Math.min(1, ok.length - 1)];
  }
  $('#cfgMake').addEventListener('click', function (e) {
    var b = e.target.closest('[data-make]'); if (!b || b.dataset.make === cfg.make) return;
    cfg.make = b.dataset.make; cfg.mi = 0; pickDia();
    renderMakes(); renderModels(); renderDia(); updateCfg('car');
  });
  $('#cfgModel').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mi]'); if (!b) return;
    cfg.mi = Number(b.dataset.mi); pickDia();
    renderModels(); renderDia(); updateCfg('car');
  });
  $('#cfgDia').addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]'); if (!b || b.disabled) return;
    cfg.d = Number(b.dataset.d); renderDia(); updateCfg('wheel');
  });
  $('#cfgDesign').addEventListener('click', function (e) {
    var b = e.target.closest('[data-design]'); if (!b) return;
    cfg.design = b.dataset.design; renderDesigns(); updateCfg('wheel');
  });
  $('#cfgFinish').addEventListener('click', function (e) {
    var b = e.target.closest('[data-fin]'); if (!b) return;
    cfg.finish = b.dataset.fin; renderFinishes(); renderDesigns(); updateCfg('wheel');
  });
  $('#cfgAdd').addEventListener('click', function () {
    var c = car(), ts = tyreSize();
    var item = {
      key: ['cfg', cfg.make, c.m, cfg.d, cfg.design, cfg.finish].join('-'),
      name: 'Bộ 4 mâm ' + cfg.d + '″ ' + VV.DESIGNS[cfg.design].name.toLowerCase() + ' ' + VV.FINISHES[cfg.finish].name.toLowerCase() + ' + 4 lốp ' + ts,
      spec: 'Cho ' + cfg.make + ' ' + c.m + ' · PCD ' + c.pcd + ' · ET ' + c.et,
      price: cfg.total,
      art: { k: 'w', design: cfg.design, finish: cfg.finish }
    };
    var w = $$('#cfgCar .wspin')[1];
    addItem(item, 1, Art.wheelSVG(cfg.design, cfg.finish), w ? w.getBoundingClientRect() : null);
  });
  $('#cfgInst').addEventListener('click', function () { setInstPrice(cfg.total); });

  /* =========================================================
     GIẢI MÃ LỐP
     ========================================================= */
  var dec = { w: 205, ar: 55, d: 16, li: 91, sp: 'V', on: 'w' };
  var userTouched = 0;
  function opt(list, sel) { return list.map(function (v) { return '<option value="' + v + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + v + '</option>'; }).join(''); }
  function rng(a, b, s) { var r = []; for (var i = a; i <= b; i += s) r.push(i); return r; }
  $('#cW').innerHTML = opt(rng(155, 295, 10), dec.w);
  $('#cAr').innerHTML = opt(rng(30, 75, 5), dec.ar);
  $('#cD').innerHTML = opt(rng(13, 22, 1), dec.d);
  $('#cLi').innerHTML = opt(Object.keys(VV.LOAD), dec.li);
  $('#cSp').innerHTML = opt(['T', 'H', 'V', 'W', 'Y'], dec.sp);

  function decText(k, h) {
    var d1 = function (n) { return num(n); };
    switch (k) {
      case 'w': return ['Chiều rộng mặt lốp', dec.w + ' mm', 'Bề rộng lốp đo giữa hai mép hông khi bơm đúng áp suất. Lốp rộng bám đường tốt hơn nhưng ồn và tốn nhiên liệu hơn chút.'];
      case 'ar': return ['Tỷ lệ thành lốp', dec.ar + '% ≈ ' + d1(h) + ' mm', 'Chiều cao thành lốp bằng ' + dec.ar + '% chiều rộng. Số càng nhỏ thành lốp càng mỏng: lái chắc, đẹp mâm nhưng kém êm hơn.'];
      case 'r': return ['Cấu trúc bố tỏa tròn', 'R = Radial', 'Các lớp bố chạy hướng tâm từ mép này sang mép kia – chuẩn trên hầu hết xe du lịch hiện nay, mát lốp và bền hơn.'];
      case 'd': return ['Đường kính mâm', dec.d + ' inch = ' + d1(dec.d * 25.4) + ' mm', 'Lốp này chỉ lắp vừa mâm ' + dec.d + ' inch. Đây là con số phải khớp tuyệt đối giữa lốp và mâm.'];
      case 'li': return ['Chỉ số tải trọng', dec.li + ' = ' + d1(VV.LOAD[dec.li]) + ' kg / lốp', 'Tải tối đa mỗi lốp chịu được. Không lắp lốp có chỉ số tải thấp hơn khuyến cáo của nhà sản xuất xe.'];
      default: return ['Chỉ số tốc độ', dec.sp + ' = ' + VV.SPEED[dec.sp] + ' km/h', 'Tốc độ tối đa khi chở đủ tải. Ký hiệu thường gặp: T 190 · H 210 · V 240 · W 270 · Y 300 km/h.'];
    }
  }
  var decRes = null;
  function renderDec(full) {
    if (full) {
      decRes = Art.decoderSVG(dec.w, dec.ar, dec.d, dec.li, dec.sp);
      $('#decSvg').innerHTML = decRes.svg;
      var segs = $$('#decCode .seg');
      segs[0].textContent = dec.w; segs[1].textContent = dec.ar; segs[3].textContent = dec.d; segs[4].textContent = dec.li; segs[5].textContent = dec.sp;
      $('#oH').textContent = num(decRes.h) + ' mm';
      $('#oD').textContent = num(decRes.D) + ' mm';
      $('#oRev').textContent = num(1e6 / (Math.PI * decRes.D));
    }
    var svg = $('#decSvg .dg'); if (svg) svg.setAttribute('data-on', dec.on);
    $$('#decCode .seg').forEach(function (s) { s.setAttribute('aria-selected', String(s.dataset.k === dec.on)); });
    var t = decText(dec.on, decRes.h);
    var info = $('#decInfo');
    info.innerHTML = '<p class="mono di-k">' + t[0] + '</p><p class="di-v">' + t[1] + '</p><p class="di-t">' + t[2] + '</p>';
    if (anim && !full) G.from(info.children, { y: 10, opacity: 0, stagger: .05, duration: .35, ease: 'power2.out' });
  }
  $('#decCode').addEventListener('click', function (e) {
    var b = e.target.closest('.seg'); if (!b) return;
    dec.on = b.dataset.k; userTouched = Date.now(); renderDec(false);
  });
  $('#decCalc').addEventListener('change', function () {
    dec.w = +$('#cW').value; dec.ar = +$('#cAr').value; dec.d = +$('#cD').value; dec.li = +$('#cLi').value; dec.sp = $('#cSp').value;
    userTouched = Date.now(); renderDec(true);
  });
  $('#decCalc').addEventListener('submit', function (e) { e.preventDefault(); });
  var KEYS = ['w', 'ar', 'r', 'd', 'li', 'sp'], decTimer = null;
  function decCycle(on) {
    clearInterval(decTimer);
    if (!on || reduced) return;
    decTimer = setInterval(function () {
      if (Date.now() - userTouched < 9000 || document.hidden) return;
      dec.on = KEYS[(KEYS.indexOf(dec.on) + 1) % KEYS.length];
      renderDec(false);
    }, 3400);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { decCycle(en[0].isIntersecting); }, { threshold: .35 }).observe($('#giai-ma-lop'));
  }

  /* =========================================================
     DỊCH VỤ
     ========================================================= */
  $('#svcList').innerHTML = VV.SERVICES.map(function (s) {
    return '<li class="pl"><div><h3>' + s.n + '</h3><p>' + s.d + '</p><div class="pl-meta"><span class="pl-time">⏱ ' + s.t + '</span>' + (s.note ? '<span class="pl-note">✓ ' + s.note + '</span>' : '') + '</div></div>' +
      '<div class="pl-right"><span class="pl-price">' + s.p + '</span><a class="pl-book" href="#dat-lich" data-service="' + esc(s.n) + '">Đặt lịch</a></div></li>';
  }).join('');
  var bSel = $('#bService');
  bSel.innerHTML = ['Mua & lắp mâm / lốp'].concat(VV.SERVICES.map(function (s) { return s.n; }), ['Tư vấn trả góp 0%']).map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
  function setService(n) {
    var o = $$('option', bSel).filter(function (x) { return x.value === n; })[0];
    if (o) bSel.value = n;
  }

  /* =========================================================
     SLIDERS (gallery + đánh giá)
     ========================================================= */
  $('#gal').innerHTML = VV.GALLERY.map(function (g, i) {
    return '<figure class="gcard"><img src="' + VV.U(g.id, 640, 800) + '" alt="' + esc(g.t + ' – ' + g.s) + '" width="640" height="800" loading="lazy" decoding="async">' +
      '<figcaption><div><b>' + g.t + '</b><span>' + g.s + '</span></div><i>#' + String(i + 1).padStart(2, '0') + '</i></figcaption></figure>';
  }).join('');
  $('#rev').innerHTML = VV.REVIEWS.map(function (r) {
    return '<article class="rcard"><q>' + esc(r.t) + '</q><div class="rc-who"><span class="rc-av" aria-hidden="true">' + r.n.split(' ').pop().charAt(0) + '</span><div><b>' + r.n + '</b><span>' + r.car + '</span></div><span class="stars" aria-label="' + r.s + ' sao">' + stars(r.s) + '</span></div></article>';
  }).join('');

  function slider(el) {
    var name = el.dataset.slider, hover = false, idleUntil = 0, visible = false, timer = null;
    function step() { var c = el.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : 300; }
    function go(dir) {
      var max = el.scrollWidth - el.clientWidth - 4;
      if (dir > 0 && el.scrollLeft >= max) el.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: max, behavior: 'smooth' });
      else el.scrollBy({ left: step() * dir, behavior: 'smooth' });
    }
    function pause() { idleUntil = Date.now() + 6000; }
    ['pointerdown', 'touchstart', 'wheel', 'focusin', 'keydown'].forEach(function (ev) { el.addEventListener(ev, pause, { passive: true }); });
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    el.addEventListener('pointerleave', function () { hover = false; pause(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    $$('[data-sl-prev="' + name + '"]').forEach(function (b) { b.addEventListener('click', function () { pause(); go(-1); }); });
    $$('[data-sl-next="' + name + '"]').forEach(function (b) { b.addEventListener('click', function () { pause(); go(1); }); });
    /* kéo bằng chuột trên desktop */
    var drag = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, s: el.scrollLeft, moved: false };
      el.style.scrollSnapType = 'none';
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      el.scrollLeft = drag.s - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      var moved = drag.moved; drag = null;
      el.style.scrollSnapType = '';
      if (moved) { el.addEventListener('click', function k(ev) { ev.preventDefault(); ev.stopPropagation(); el.removeEventListener('click', k, true); }, true); }
    });
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
    function run(on) {
      clearInterval(timer);
      if (!on || reduced) return;
      timer = setInterval(function () { if (visible && !hover && !drag && Date.now() > idleUntil && !document.hidden) go(1); }, 4200);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(visible); }, { threshold: .3 }).observe(el);
    }
  }
  $$('[data-slider]').forEach(slider);

  /* bản đồ: dừng hiệu ứng khi khuất */
  if ('IntersectionObserver' in window) {
    var map = $('.map');
    new IntersectionObserver(function (en) { map.classList.toggle('paused', !en[0].isIntersecting); }).observe(map);
  }

  /* =========================================================
     TRẢ GÓP
     ========================================================= */
  var inst = { price: 20000000, down: 0, term: 6 }, monthObj = { v: 0 };
  var iPrice = $('#iPrice');
  function setInstPrice(v) {
    v = Math.max(3000000, Math.min(150000000, Math.round(v / 500000) * 500000));
    inst.price = v; iPrice.value = v; renderInst();
  }
  function renderInst() {
    var down = inst.price * inst.down / 100, loan = inst.price - down, m = loan / inst.term;
    $('#iPriceOut').textContent = fmt(inst.price);
    iPrice.style.setProperty('--p', ((inst.price - 3000000) / (147000000) * 100).toFixed(1) + '%');
    $('#iDownV').textContent = fmt(down);
    $('#iLoan').textContent = fmt(loan);
    if (anim) G.to(monthObj, { v: m, duration: .6, ease: 'power2.out', overwrite: true, onUpdate: function () { $('#iMonthly').textContent = fmt(Math.round(monthObj.v / 1000) * 1000); } });
    else $('#iMonthly').textContent = fmt(Math.round(m / 1000) * 1000);
  }
  iPrice.addEventListener('input', function () { inst.price = +iPrice.value; renderInst(); });
  function segCtl(id, key) {
    $('#' + id).addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      inst[key] = +b.dataset.v;
      $$('#' + id + ' button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      renderInst();
    });
  }
  segCtl('iDown', 'down'); segCtl('iTerm', 'term');
  $('#iFromCfg').addEventListener('click', function () { setInstPrice(cfg.total); toast('Đã lấy giá cấu hình: <b>' + fmt(cfg.total) + '</b>'); });
  $('#iFromCart').addEventListener('click', function () {
    var s = subtotal();
    if (!s) { toast('Giỏ hàng đang trống'); return; }
    setInstPrice(s); toast('Đã lấy tổng giỏ hàng: <b>' + fmt(s) + '</b>');
  });

  /* =========================================================
     ĐẶT LỊCH
     ========================================================= */
  var bf = $('#bookForm');
  (function () {
    var d = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
    var iso = function (x) { return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
    bf.elements.date.min = iso(d);
    var t = new Date(d); t.setDate(d.getDate() + 1);
    bf.elements.date.value = iso(t);
  })();
  bf.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = validate(bf, {
      name: R_NAME, phone: R_PHONE,
      date: function (v) { return !v ? 'Vui lòng chọn ngày.' : v < bf.elements.date.min ? 'Ngày đã qua, vui lòng chọn lại.' : ''; }
    });
    if (!ok) return;
    var f = bf.elements, box = $('#bookOk');
    var dp = f.date.value.split('-');
    box.innerHTML = '✓ Đã ghi nhận lịch <b>' + esc(f.service.value) + '</b> lúc <b>' + esc(f.time.value) + '</b>, ngày <b>' + dp[2] + '/' + dp[1] + '/' + dp[0] + '</b> cho ' + esc(f.name.value.trim()) + '. Chúng tôi sẽ gọi ' + esc(cleanPhone(f.phone.value)) + ' để xác nhận (minh hoạ – không gửi dữ liệu).';
    box.hidden = false;
    if (anim) G.from(box, { y: 12, opacity: 0, duration: .5, ease: 'power3.out' });
  });

  /* =========================================================
     KHỞI TẠO
     ========================================================= */
  $('#heroSpin').innerHTML = Art.heroWheelSVG();
  var catSvg = $('[data-acc="lug"]'); if (catSvg) catSvg.innerHTML = Art.accSVG('lug');
  renderMakes(); renderModels(); renderDia(); renderDesigns(); renderFinishes(); updateCfg(null);
  syncFilterUI(); renderProducts(); renderCart();
  renderDec(true); renderInst();

  /* =========================================================
     CHUYỂN ĐỘNG (GSAP + ScrollTrigger)
     ========================================================= */
  function counter(el, delay) {
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), o = { v: 0 };
    var out = function (v) { return dec ? v.toFixed(dec).replace('.', ',') : num(v); };
    G.to(o, { v: to, duration: 1.8, delay: delay || 0, ease: 'power2.out', onUpdate: function () { el.textContent = out(o.v); }, onComplete: function () { el.textContent = out(to); } });
  }

  if (anim) {
    /* hero intro */
    var tl = G.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('[data-hero]', { y: 40, opacity: 0, duration: .9, stagger: .09 }, .15)
      .fromTo('.hero-title em', { '--u': 0 }, { '--u': 1, duration: .7, ease: 'power2.inOut' }, .9)
      .from('.hero-num-wrap', { opacity: 0, scale: .86, duration: 1.6 }, 0)
      .from('#heroWheel', { x: function () { return Math.min(window.innerWidth * .6, 760); }, rotation: 560, duration: 1.7, ease: 'power3.out' }, .05)
      .to('#heroWheel', { keyframes: [{ rotation: 9, duration: .2, ease: 'power1.out' }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1,.32)' }] }, '>-0.02')
      .from('.hw-shadow', { scaleX: .15, opacity: 0, x: 200, duration: 1.7 }, .05)
      .from('.hw-dim-line', { scaleY: 0, duration: .8, ease: 'power2.inOut' }, 1.3)
      .from('.hw-dim-lab', { opacity: 0, duration: .5 }, 1.7)
      .from('.co i', { scale: 0, duration: .45, stagger: .12, ease: 'back.out(3)' }, 1.5)
      .from('.co-line', { scaleX: 0, duration: .5, stagger: .12, ease: 'power2.out' }, 1.6)
      .from('.co-lab', { opacity: 0, duration: .45, stagger: .12 }, 1.75);
    $$('.hero-stats [data-count]').forEach(function (el, i) { counter(el, .7 + i * .1); });

    /* hero cuộn: mâm quay theo thanh cuộn, số nền trôi */
    G.to('#heroSpin', { rotation: 220, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
    G.to('.hero-num-wrap', { y: 120, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.hero-copy', { y: -50, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* marquee: chạy vô hạn, tạm dừng khi khuất */
    var mq = G.to('.marq-track', { xPercent: -50, duration: 32, ease: 'none', repeat: -1, paused: true });
    ST.create({ trigger: '.marq', start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? mq.play() : mq.pause(); } });

    /* reveal chung */
    $$('[data-reveal]').forEach(function (el) {
      var sib = el.parentElement ? $$(':scope > [data-reveal]', el.parentElement) : [el];
      var i = Math.max(0, sib.indexOf(el));
      G.from(el, { y: 44, opacity: 0, duration: .9, delay: Math.min(i, 5) * .08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    /* danh sách dịch vụ */
    G.from('.pl', { x: -24, opacity: 0, duration: .6, stagger: .07, ease: 'power2.out', scrollTrigger: { trigger: '.plist', start: 'top 85%', once: true } });
    G.fromTo('.svc-ph1 img', { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.svc', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* giải mã lốp */
    G.from('#decCode > *', { y: 50, opacity: 0, duration: .7, stagger: .06, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#decCode', start: 'top 85%', once: true } });
    G.from('#decSvg', { scale: .9, rotation: -8, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '#decSvg', start: 'top 85%', once: true } });

    /* gallery & reviews trượt vào */
    G.from('.gcard', { x: 80, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#gal', start: 'top 88%', once: true } });
    G.from('.rcard', { y: 40, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#rev', start: 'top 88%', once: true } });

    /* bộ đếm khác */
    $$('[data-count]').filter(function (el) { return !el.closest('.hero'); }).forEach(function (el) {
      ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { counter(el, 0); } });
    });

    /* chữ lớn footer */
    G.from('.ftr-big', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'top 40%', scrub: true } });

    /* sân khấu cấu hình – xe lăn vào khi xuất hiện */
    ST.create({ trigger: '.stage', start: 'top 80%', once: true, onEnter: function () { updateCfg('car'); } });

    var refresh = function () { ST.refresh(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
  } else {
    totalObj.v = cfg.total;
  }

  window.VVApp = { cart: function () { return cart; }, cfg: cfg, state: state, renderProducts: renderProducts };
})();
