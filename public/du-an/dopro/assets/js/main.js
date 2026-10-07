/* Độ Pro Garage – main script (cửa hàng mẫu, không gửi dữ liệu) */
(function () {
  'use strict';

  var D = window.DOPRO;
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.innerWidth < 768; };
  root.classList.add('js');

  /* ---------------- icons (inline SVG, không dùng <use> để an toàn với <base href>) ---------------- */
  var P_ = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>'; };
  var ICON = {
    menu: P_('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    search: P_('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    phone: P_('<path d="M6.6 3.5h3l1.6 4.3-2.1 1.4a10.5 10.5 0 0 0 5.7 5.7l1.4-2.1 4.3 1.6v3a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1z"/>'),
    calendar: P_('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    cart: P_('<path d="M3 4h2.3l2.2 10.6a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.5-1.2L21 8H6.1"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17.5" cy="19.5" r="1.4"/>'),
    user: P_('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3"/>'),
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="fill"><path d="M13.5 2 5 13.5h6L10 22l9-12h-6.2z"/></svg>',
    truck: P_('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    left: P_('<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>'),
    right: P_('<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>'),
    up: P_('<path d="m5.5 14.5 6.5-6.5 6.5 6.5"/>'),
    shield: P_('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.3-4.6"/>'),
    badge: P_('<circle cx="12" cy="9.5" r="5.5"/><path d="m8.8 14 -1.6 7 4.8-2.4 4.8 2.4-1.6-7"/>'),
    wrench: P_('<path d="M14.5 4.2a4.6 4.6 0 0 0-5.7 5.9L3.6 15.3a1.9 1.9 0 0 0 2.7 2.7l5.2-5.2a4.6 4.6 0 0 0 5.9-5.7l-2.7 2.7-2.3-.6-.6-2.3z"/>'),
    'return': P_('<path d="M4.5 9.5h11a4.5 4.5 0 0 1 0 9H9"/><path d="m8 5.5-3.5 4 3.5 4"/>'),
    card: P_('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M6.5 15h4"/>'),
    car: P_('<path d="M3.5 15.5v-3l2-5a2 2 0 0 1 1.9-1.3h9.2a2 2 0 0 1 1.9 1.3l2 5v3z"/><path d="M3.5 12.5h17"/><circle cx="7.5" cy="15.5" r="2"/><circle cx="16.5" cy="15.5" r="2"/>'),
    check: P_('<circle cx="12" cy="12" r="9"/><path d="m7.8 12.3 2.8 2.8 5.6-5.8"/>'),
    tick: P_('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    close: P_('<path d="M6 6l12 12M18 6 6 18"/>'),
    chat: P_('<path d="M4 5.5h16v10.5H9.5L5 19.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
    home: P_('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
    grid: P_('<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>'),
    gift: P_('<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1-3-5-4-5-1.5S11 8 12 8zm0 0c1-3 5-4 5-1.5S13 8 12 8z"/>'),
    pin: P_('<path d="M12 21s6.5-5.8 6.5-11.2a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>'),
    clock: P_('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    trash: P_('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>'),
    star: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="fill"><path d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3L2.9 9.4l6.3-.8z"/></svg>'
  };
  function fillIcons(scope) { $$('[data-ic]', scope).forEach(function (el) { if (!el.firstChild) el.innerHTML = ICON[el.getAttribute('data-ic')] || ''; el.classList.add('ic'); }); }
  fillIcons();

  /* ---------------- helpers ---------------- */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(p) { return Math.round((1 - p.price / p.old) * 100); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function soldTxt(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'k' : String(n); }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  var IMG = D.IMG, PIMG = D.PIMG;
  var catById = {}; D.CATS.forEach(function (c) { catById[c.id] = c; });
  var prodById = {}; D.P.forEach(function (p) { prodById[p.id] = p; });
  var comboById = {}; D.COMBOS.forEach(function (c) { comboById[c.id] = c; });
  var modelName = {}, modelBrand = {};
  D.BRANDS.forEach(function (b) { b.models.forEach(function (m) { modelName[m[0]] = m[1]; modelBrand[m[0]] = b.name; }); });
  function hay(p) { return norm(p.name + ' ' + p.spec + ' ' + catById[p.cat].name); }
  function match(p, q) { var h = hay(p); return norm(q).trim().split(/\s+/).every(function (w) { return h.indexOf(w) >= 0; }); }

  /* ---------------- toast ---------------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
  }
  doc.addEventListener('click', function (e) {
    var d = e.target.closest('[data-demo]');
    if (!d) return;
    e.preventDefault(); e.stopPropagation();
    toast(d.getAttribute('data-demo') || 'Liên kết minh hoạ – trang mẫu.');
  }, true);

  /* ---------------- in-page links ---------------- */
  var hdr = $('#hdr');
  function goTo(id) {
    var el = id ? doc.getElementById(id) : null;
    if (!el || id === 'trang-chu') { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    var off = hdr.getBoundingClientRect().height + 10;
    var y = el.getBoundingClientRect().top + window.pageYOffset - off;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-qv')) return;
    var id = a.getAttribute('href').slice(1);
    e.preventDefault();
    var gc = a.getAttribute('data-goto-cat');
    if (gc) { state.q = ''; qInput.value = ''; setCat(gc); }
    closeMenu(); closeCart(); closeSugg(); hideMega();
    if (openModalEl) closeModal();
    goTo(id);
  });

  /* ---------------- top bar ticker ---------------- */
  (function () {
    var items = $$('#ticker span'), i = 0;
    if (items.length < 2 || reduce) return;
    setInterval(function () {
      if (doc.hidden) return;
      items[i].classList.remove('is-on'); i = (i + 1) % items.length; items[i].classList.add('is-on');
    }, 4000);
  })();

  /* ---------------- flash sale countdown & slots ---------------- */
  var SLOT_START = [0, 9, 12, 15, 20];
  function slotInfo(now) {
    var h = now.getHours(), cur = 0;
    SLOT_START.forEach(function (s, i) { if (h >= s) cur = i; });
    var endH = SLOT_START[cur + 1] || 24;
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, 0, 0);
    return { cur: cur, end: end };
  }
  var slot = slotInfo(new Date());
  var cdEls = $$('[data-cd]');
  function tick() {
    var now = new Date();
    var ms = slot.end - now;
    if (ms <= 0) { slot = slotInfo(now); renderSlots(); ms = slot.end - now; }
    var s = Math.max(0, Math.floor(ms / 1000));
    var v = { h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    cdEls.forEach(function (el) { var t = pad(v[el.getAttribute('data-cd')]); if (el.textContent !== t) el.textContent = t; });
  }
  var slotView = 0; // 0 = khung đang diễn ra
  function slotLabel(i) { return pad(SLOT_START[i % SLOT_START.length]) + ':00'; }
  function renderSlots() {
    var html = '';
    for (var k = 0; k < 3; k++) {
      var i = slot.cur + k;
      html += '<button role="tab" aria-selected="' + (k === slotView) + '" data-slot="' + k + '"><b>' + slotLabel(i) + '</b><small>' + (k === 0 ? 'Đang diễn ra' : (i >= SLOT_START.length ? 'Ngày mai' : 'Sắp diễn ra')) + '</small></button>';
    }
    $('#flashSlots').innerHTML = html;
  }
  renderSlots();
  tick(); setInterval(tick, 1000);
  $('#flashSlots').addEventListener('click', function (e) {
    var b = e.target.closest('[data-slot]'); if (!b) return;
    slotView = +b.getAttribute('data-slot'); renderSlots(); renderFlash();
  });

  /* ---------------- product card ---------------- */
  function starsHTML(r) { return '<span class="stars" style="--r:' + r + '" role="img" aria-label="' + r + ' trên 5 sao"></span>'; }
  function tagHTML(p) {
    var t = [];
    if (p.tags.indexOf('i') >= 0) t.push('<span class="tg tg--i">Trả góp 0%</span>');
    if (p.tags.indexOf('l') >= 0) t.push('<span class="tg">Lắp tại xưởng</span>');
    return t.slice(0, 2).join('');
  }
  function cardHTML(p, opt) {
    opt = opt || {};
    var off = pct(p), html = '<article class="pc' + (opt.flash ? ' pc--flash' : '') + '" data-id="' + p.id + '">' +
      '<div class="pc__img"><a href="#san-pham" data-qv="' + p.id + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + PIMG(p.img) + '" alt="' + esc(p.name) + '" width="800" height="800" loading="lazy" decoding="async"></a>' +
        '<span class="pc__off">-' + off + '%</span>' +
        (p.tags.indexOf('g') >= 0 && !opt.flash ? '<span class="pc__gift">' + ICON.gift + 'Quà tặng</span>' : '');
    if (opt.locked) html += '<span class="pc__add pc__add--lock">Mở bán lúc ' + opt.locked + '</span>';
    else html += '<button class="pc__add" type="button" data-add="' + p.id + '" aria-label="Thêm ' + esc(p.name) + ' vào giỏ">' + ICON.cart + '<span>Thêm vào giỏ</span></button>';
    html += '</div><div class="pc__b">' +
      (opt.flash ? '' : '<div class="pc__tags">' + tagHTML(p) + '</div>') +
      '<h3 class="pc__n"><a href="#san-pham" data-qv="' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<div class="pc__price"><b>' + (opt.locked ? fmt(p.price).replace(/^\d+/, function (m) { return m.replace(/\d/g, '?'); }) : fmt(p.price)) + '</b></div>' +
      '<div class="pc__old"><s>' + fmt(p.old) + '</s><span>-' + off + '%</span></div>';
    if (opt.flash) {
      var tot = opt.flash[0], sold = opt.flash[1], r = sold / tot;
      html += '<div class="fbar' + (opt.locked ? ' fbar--lock' : '') + '"><i style="transform:scaleX(' + (opt.locked ? 0 : r).toFixed(3) + ')"></i><span>' + (opt.locked ? 'Số lượng có hạn: ' + tot : (r >= .8 ? 'Sắp cháy hàng · còn ' + (tot - sold) : 'Đã bán ' + sold + '/' + tot)) + '</span></div>';
    } else {
      if (p.gift) html += '<p class="pc__gl">' + esc(p.gift) + '</p>';
      html += '<div class="pc__meta"><span class="pc__rt">' + ICON.star + p.rating.toFixed(1) + '</span><span>Đã bán ' + soldTxt(p.sold) + '</span></div>';
    }
    return html + '</div></article>';
  }

  /* ---------------- flash sale row ---------------- */
  function renderFlash() {
    var list = D.FLASH.slice();
    if (slotView > 0) list = list.slice(slotView * 3).concat(list.slice(0, slotView * 3));
    var lockLabel = slotView > 0 ? $$('#flashSlots b')[slotView].textContent : null;
    $('#flashRow').innerHTML = list.map(function (f) { return cardHTML(prodById[f[0]], { flash: [f[1], f[2]], locked: lockLabel }); }).join('');
    $('#flashRow').scrollLeft = 0;
  }
  renderFlash();

  /* ---------------- state & product grid ---------------- */
  var state = { cat: 'all', q: '', sort: 'hot', fit: null, limit: 10 };
  var grid = $('#grid'), ptabs = $('#ptabs'), moreBtn = $('#moreBtn'), emptyEl = $('#empty'), filtersEl = $('#activeFilters');

  function filtered() {
    var list = D.P.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.fit && p.fit.indexOf(state.fit) < 0) return false;
      if (state.q.trim() && !match(p, state.q)) return false;
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'asc') return a.price - b.price;
      if (s === 'desc') return b.price - a.price;
      if (s === 'sale') return pct(b) - pct(a);
      if (s === 'sold') return b.sold - a.sold;
      return b.hot - a.hot;
    });
    return list;
  }
  function renderTabs() {
    var counts = { all: 0 };
    D.P.forEach(function (p) {
      if (state.fit && p.fit.indexOf(state.fit) < 0) return;
      if (state.q.trim() && !match(p, state.q)) return;
      counts.all++; counts[p.cat] = (counts[p.cat] || 0) + 1;
    });
    var html = '<button class="ptab' + (state.cat === 'all' ? ' is-on' : '') + '" role="tab" aria-selected="' + (state.cat === 'all') + '" data-cat="all">Tất cả <small>' + counts.all + '</small></button>';
    D.CATS.forEach(function (c) {
      var on = state.cat === c.id;
      html += '<button class="ptab' + (on ? ' is-on' : '') + '" role="tab" aria-selected="' + on + '" data-cat="' + c.id + '">' + esc(c.short) + ' <small>' + (counts[c.id] || 0) + '</small></button>';
    });
    ptabs.innerHTML = html;
    var on = $('.ptab.is-on', ptabs);
    if (on && ptabs.scrollWidth > ptabs.clientWidth) ptabs.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
  }
  function renderFilters() {
    var h = '';
    if (state.fit) h += '<span class="fchip">Xe: <b>' + esc(modelBrand[state.fit] + ' ' + modelName[state.fit]) + '</b><button type="button" data-unfilter="fit" aria-label="Bỏ lọc dòng xe">' + ICON.close + '</button></span>';
    if (state.q.trim()) h += '<span class="fchip">Từ khoá: <b>“' + esc(state.q.trim()) + '”</b><button type="button" data-unfilter="q" aria-label="Bỏ từ khoá">' + ICON.close + '</button></span>';
    if (h) h += '<button type="button" class="fclear" data-clear-filters>Xoá tất cả</button>';
    else h = '<span class="toolbar__count">' + filtered().length + ' sản phẩm</span>';
    filtersEl.innerHTML = h;
  }
  function renderGrid(animate) {
    var list = filtered();
    grid.innerHTML = list.slice(0, state.limit).map(function (p) { return cardHTML(p); }).join('');
    emptyEl.hidden = list.length > 0;
    moreBtn.parentNode.hidden = list.length <= state.limit;
    moreBtn.textContent = 'Xem thêm ' + (list.length - state.limit) + ' sản phẩm';
    renderFilters();
    if (animate && !reduce) $$('.pc', grid).forEach(function (c, i) { c.style.animationDelay = Math.min(i, 10) * 30 + 'ms'; c.classList.add('pop'); });
  }
  function refresh(animate) { state.limit = isMobile() ? 8 : 10; renderTabs(); renderGrid(animate); }
  function setCat(cat) { state.cat = cat; refresh(true); }

  ptabs.addEventListener('click', function (e) { var b = e.target.closest('.ptab'); if (b) setCat(b.getAttribute('data-cat')); });
  $('.sortby').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sort]'); if (!b) return;
    state.sort = b.getAttribute('data-sort');
    $$('[data-sort]', this).forEach(function (x) { x.classList.toggle('is-on', x === b); });
    renderGrid(true);
  });
  moreBtn.addEventListener('click', function () {
    var prev = state.limit; state.limit += 10; renderGrid(false);
    if (!reduce) $$('.pc', grid).slice(prev).forEach(function (c, i) { c.style.animationDelay = i * 30 + 'ms'; c.classList.add('pop'); });
  });
  doc.addEventListener('click', function (e) {
    var u = e.target.closest('[data-unfilter]');
    if (u) { if (u.getAttribute('data-unfilter') === 'fit') { state.fit = null; resetFinder(); } else { state.q = ''; qInput.value = ''; } refresh(true); return; }
    if (e.target.closest('[data-clear-filters]')) { state.fit = null; state.q = ''; qInput.value = ''; state.cat = 'all'; resetFinder(); refresh(true); }
  });

  /* ---------------- search + suggestions ---------------- */
  var searchForm = $('#searchForm'), qInput = $('#q'), sugg = $('#sugg');
  $('#hotkeys').innerHTML = D.HOT_KEYS.slice(0, 6).map(function (k) { return '<button type="button" data-key="' + esc(k) + '">' + esc(k) + '</button>'; }).join('');
  function closeSugg() { sugg.hidden = true; qInput.setAttribute('aria-expanded', 'false'); }
  function renderSugg() {
    var q = qInput.value.trim(), html;
    if (!q) {
      html = '<p class="sg-h">Xu hướng tìm kiếm</p><div class="sg-keys">' + D.HOT_KEYS.map(function (k) { return '<button type="button" data-key="' + esc(k) + '">' + ICON.search + esc(k) + '</button>'; }).join('') + '</div>' +
        '<p class="sg-h">Danh mục nổi bật</p><div class="sg-cats">' + D.CATS.slice(0, 6).map(function (c) { return '<a href="#san-pham" data-goto-cat="' + c.id + '"><img src="' + PIMG(c.img) + '" alt="" width="40" height="40" loading="lazy">' + esc(c.short) + '</a>'; }).join('') + '</div>';
    } else {
      var res = D.P.filter(function (p) { return match(p, q); });
      var cats = D.CATS.filter(function (c) { return norm(c.name).indexOf(norm(q)) >= 0; });
      html = cats.length ? '<p class="sg-h">Danh mục</p>' + cats.map(function (c) { return '<a class="sg-cat" href="#san-pham" data-goto-cat="' + c.id + '">' + ICON.grid + esc(c.name) + '</a>'; }).join('') : '';
      html += res.length ? '<p class="sg-h">Sản phẩm gợi ý</p>' + res.slice(0, 5).map(function (p) {
        return '<button type="button" class="sg" data-qv="' + p.id + '"><img src="' + PIMG(p.img) + '" alt="" width="48" height="48"><span><b>' + esc(p.name) + '</b><small><em>' + fmt(p.price) + '</em><s>' + fmt(p.old) + '</s></small></span></button>';
      }).join('') + '<button type="submit" class="sg-all">Xem tất cả ' + res.length + ' kết quả cho “' + esc(q) + '”</button>'
        : '<p class="sg-none">Không tìm thấy “' + esc(q) + '”. Thử “pô”, “mâm”, “carbon”…</p>';
    }
    sugg.innerHTML = html;
    sugg.hidden = false; qInput.setAttribute('aria-expanded', 'true');
  }
  var sT;
  qInput.addEventListener('input', function () { clearTimeout(sT); sT = setTimeout(renderSugg, 120); });
  qInput.addEventListener('focus', renderSugg);
  function runSearch(q) {
    qInput.value = q; state.q = q; state.cat = 'all'; refresh(true); closeSugg(); qInput.blur();
    goTo('san-pham');
  }
  searchForm.addEventListener('submit', function (e) { e.preventDefault(); runSearch(qInput.value.trim()); });
  doc.addEventListener('click', function (e) {
    var k = e.target.closest('[data-key]');
    if (k) { runSearch(k.getAttribute('data-key')); return; }
    if (!e.target.closest('.search')) closeSugg();
  });

  /* ---------------- category sidebar + mega menu ---------------- */
  function countCat(id) { return D.P.filter(function (p) { return p.cat === id; }).length; }
  $('#catList').innerHTML = D.CATS.map(function (c) {
    return '<li data-cat="' + c.id + '"><a href="#san-pham" data-goto-cat="' + c.id + '"><img src="' + PIMG(c.img) + '" alt="" width="28" height="28" decoding="async">' + esc(c.name) + ICON.right + '</a></li>';
  }).join('') + '<li class="catmenu__lbl" aria-hidden="true">Dịch vụ tại xưởng</li>' + D.SERVICES.map(function (sv) {
    return '<li class="catmenu__svc"><a href="#dich-vu" data-svc="' + sv.id + '"><img src="' + IMG(sv.img, 64, 64) + '" alt="" width="28" height="28" decoding="async">' + esc(sv.name) + ICON.right + '</a></li>';
  }).join('');
  var mega = $('#mega'), megaT, catmenu = $('#catmenu');
  function megaHTML(c) {
    var best = D.P.filter(function (p) { return p.cat === c.id; }).sort(function (a, b) { return b.sold - a.sold; }).slice(0, 3);
    return '<div class="mega__cols">' + c.groups.map(function (g) {
      return '<div class="mega__col"><b>' + esc(g[0]) + '</b>' + g[1].map(function (l) { return '<a href="#san-pham" data-mega="' + c.id + '|' + esc(l) + '">' + esc(l) + '</a>'; }).join('') + '</div>';
    }).join('') + '<div class="mega__col"><b>Theo xe phổ biến</b>' + D.MODEL_TABS.slice(0, 6).map(function (m) { return '<a href="#san-pham" data-mega-fit="' + c.id + '|' + m + '">' + esc(modelBrand[m] + ' ' + modelName[m]) + '</a>'; }).join('') + '</div></div>' +
      '<div class="mega__best"><b>Bán chạy nhất</b>' + best.map(function (p) {
        return '<button type="button" class="mega__p" data-qv="' + p.id + '"><img src="' + PIMG(p.img) + '" alt="" width="60" height="60"><span><em>' + esc(p.name) + '</em><strong>' + fmt(p.price) + '</strong></span></button>';
      }).join('') + '<a class="mega__all" href="#san-pham" data-goto-cat="' + c.id + '">Xem tất cả ' + countCat(c.id) + ' sản phẩm ' + esc(c.short.toLowerCase()) + '</a></div>';
  }
  function showMega(li) {
    clearTimeout(megaT);
    if (window.innerWidth < 1024) return;
    var c = catById[li.getAttribute('data-cat')];
    if (mega.getAttribute('data-for') !== c.id) { mega.innerHTML = megaHTML(c); mega.setAttribute('data-for', c.id); }
    $$('#catList li').forEach(function (x) { x.classList.toggle('is-on', x === li); });
    mega.hidden = false;
  }
  function hideMega() { mega.hidden = true; $$('#catList li').forEach(function (x) { x.classList.remove('is-on'); }); }
  $$('#catList li[data-cat]').forEach(function (li) {
    li.addEventListener('mouseenter', function () { clearTimeout(megaT); megaT = setTimeout(function () { showMega(li); }, mega.hidden ? 120 : 0); });
    $('a', li).addEventListener('focus', function () { showMega(li); });
  });
  catmenu.addEventListener('mouseleave', function () { clearTimeout(megaT); megaT = setTimeout(hideMega, 160); });
  mega.addEventListener('mouseenter', function () { clearTimeout(megaT); });
  catmenu.addEventListener('focusout', function (e) { if (!catmenu.contains(e.relatedTarget)) hideMega(); });
  doc.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mega]'), mf = e.target.closest('[data-mega-fit]');
    if (m) {
      var parts = m.getAttribute('data-mega').split('|'), cat = parts[0], kw = parts[1];
      var words = norm(kw).replace(/[()]/g, ' ').split(/\s+/).filter(function (w) { return w.length >= 2 && !/^(co|cho|va|theo|inch|bo)$/.test(w); });
      var inCat = D.P.filter(function (p) { return p.cat === cat; });
      var best = null, bestN = Infinity;
      words.forEach(function (w) {
        var nHit = inCat.filter(function (p) { return norm(p.name + ' ' + p.spec).indexOf(w) >= 0; }).length;
        if (nHit > 0 && nHit < bestN) { best = w; bestN = nHit; }
      });
      state.cat = cat; state.q = ''; qInput.value = '';
      if (best && bestN < inCat.length) { state.q = best; qInput.value = best; }
      refresh(true); hideMega();
    }
    if (mf) {
      var pp = mf.getAttribute('data-mega-fit').split('|');
      state.cat = pp[0]; state.fit = pp[1]; syncFinder(); refresh(true); hideMega();
    }
  });

  /* ---------------- category tiles ---------------- */
  $('#ctiles').innerHTML = D.CATS.map(function (c) {
    return '<a class="ctile" href="#san-pham" data-goto-cat="' + c.id + '"><span class="ctile__img"><img src="' + PIMG(c.img) + '" alt="" width="200" height="200" loading="lazy" decoding="async"></span><span class="ctile__t"><b>' + esc(c.name) + '</b><small>' + countCat(c.id) + ' sản phẩm · ' + esc(c.groups.map(function (g) { return g[1].join(', '); }).join(', ')) + '</small></span></a>';
  }).join('');

  /* ---------------- fitment finder ---------------- */
  var fBrand = $('#fBrand'), fModel = $('#fModel'), fApply = $('#fApply'), fRes = $('#fRes');
  var nModels = 0; D.BRANDS.forEach(function (b) { nModels += b.models.length; });
  var defaultRes = '<b>' + D.P.length + '</b> phụ kiện đang bán · hỗ trợ ' + nModels + ' dòng xe phổ biến';
  fBrand.innerHTML += D.BRANDS.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + '</option>'; }).join('');
  function fillModels(bid) {
    var br = D.BRANDS.filter(function (x) { return x.id === bid; })[0];
    fModel.innerHTML = '<option value="">Chọn dòng xe</option>' + (br ? br.models.map(function (m) { return '<option value="' + m[0] + '">' + esc(m[1]) + '</option>'; }).join('') : '');
    fModel.disabled = !br;
  }
  function updateFinder() {
    var m = fModel.value;
    fApply.disabled = !m;
    if (m) {
      var n = D.P.filter(function (p) { return p.fit.indexOf(m) >= 0; }).length;
      fRes.innerHTML = '<b>' + n + '</b> phụ kiện lắp vừa ' + esc(modelBrand[m] + ' ' + modelName[m]);
    } else fRes.innerHTML = defaultRes;
  }
  function resetFinder() { fBrand.value = ''; fillModels(''); updateFinder(); }
  function syncFinder() {
    if (!state.fit) { resetFinder(); return; }
    var b = D.BRANDS.filter(function (x) { return x.models.some(function (m) { return m[0] === state.fit; }); })[0];
    fBrand.value = b.id; fillModels(b.id); fModel.value = state.fit; updateFinder();
  }
  fBrand.addEventListener('change', function () { fillModels(this.value); updateFinder(); });
  fModel.addEventListener('change', updateFinder);
  fApply.addEventListener('click', function () {
    if (!fModel.value) return;
    state.fit = fModel.value; state.cat = 'all'; refresh(true);
    toast('Đang hiện phụ kiện cho <b>' + esc(modelBrand[state.fit] + ' ' + modelName[state.fit]) + '</b>');
    goTo('san-pham');
  });
  fRes.innerHTML = defaultRes;

  /* ---------------- by car model tabs ---------------- */
  var carModel = D.MODEL_TABS[0];
  function renderCarTabs() {
    $('#carTabs').innerHTML = D.MODEL_TABS.map(function (m) {
      return '<button class="ptab' + (m === carModel ? ' is-on' : '') + '" role="tab" aria-selected="' + (m === carModel) + '" data-car="' + m + '">' + esc(modelName[m]) + '</button>';
    }).join('');
  }
  function renderCarRow() {
    var list = D.P.filter(function (p) { return p.fit.indexOf(carModel) >= 0; }).sort(function (a, b) { return b.hot - a.hot; });
    $('#carRow').innerHTML = list.slice(0, 9).map(function (p) { return cardHTML(p); }).join('') +
      '<a class="pc pc--all" href="#san-pham" data-fit-all="' + carModel + '"><span>' + ICON.car + '</span><b>Xem tất cả ' + list.length + ' phụ kiện</b><small>cho ' + esc(modelBrand[carModel] + ' ' + modelName[carModel]) + '</small></a>';
    $('#carRow').scrollLeft = 0;
  }
  renderCarTabs(); renderCarRow();
  $('#carTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-car]'); if (!b) return;
    carModel = b.getAttribute('data-car'); renderCarTabs(); renderCarRow();
  });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-fit-all]'); if (!a) return;
    state.fit = a.getAttribute('data-fit-all'); state.cat = 'all'; syncFinder(); refresh(true);
  }, true);

  /* ---------------- car makes row ---------------- */
  $('#brands').innerHTML = D.BRANDS.map(function (b) {
    var ms = b.models.map(function (m) { return m[0]; });
    var n = D.P.filter(function (p) { return p.fit.some(function (m) { return ms.indexOf(m) >= 0; }); }).length;
    return '<button type="button" class="brand" data-make="' + b.id + '"><b>' + esc(b.name) + '</b><small>' + b.models.length + ' dòng xe · ' + n + ' phụ kiện</small></button>';
  }).join('');
  $('#brands').addEventListener('click', function (e) {
    var b = e.target.closest('[data-make]'); if (!b) return;
    fBrand.value = b.getAttribute('data-make'); fillModels(fBrand.value); updateFinder();
    goTo('chon-xe'); setTimeout(function () { fModel.focus({ preventScroll: true }); }, 500);
  });

  /* ---------------- services ---------------- */
  $('#svcRow').innerHTML = D.SERVICES.map(function (sv) {
    return '<article class="svc" id="svc-' + sv.id + '"><span class="svc__img"><img src="' + IMG(sv.img, 480, 360) + '" alt="' + esc(sv.name) + ' – ảnh công trình minh hoạ" width="480" height="360" loading="lazy" decoding="async"></span>' +
      '<div class="svc__b"><h3>' + esc(sv.name) + '</h3><p>' + esc(sv.desc) + '</p><div class="svc__m"><span>Từ <b>' + fmt(sv.from) + '</b></span><span>' + ICON.clock + esc(sv.time) + '</span></div>' +
      '<a class="btn btn--line btn--sm" href="#dat-lich" data-book-svc="' + esc(sv.svc) + '">Đặt lịch thi công</a></div></article>';
  }).join('');
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-svc]'); if (!a) return;
    setTimeout(function () { var el = doc.getElementById('svc-' + a.getAttribute('data-svc')); if (el) { el.classList.remove('flash-hl'); void el.offsetWidth; el.classList.add('flash-hl'); var row = $('#svcRow'); row.scrollTo({ left: el.offsetLeft - row.offsetLeft - 8, behavior: 'smooth' }); } }, 350);
  });

  /* ---------------- cart ---------------- */
  var CART_KEY = 'dopro_cart_v2';
  var cart = (store(CART_KEY) || []).filter(function (it) { return it && (prodById[it.id] || comboById[it.id]) && it.qty > 0; });
  var FREE = 3000000;
  var drawer = $('#drawer');
  var lastFocus = null;
  function lockScroll(on) { root.classList.toggle('is-locked', on); }
  function itemInfo(id) {
    var p = prodById[id];
    if (p) return { name: p.name, price: p.price, old: p.old, img: PIMG(p.img) };
    var c = comboById[id];
    return { name: c.name, price: c.price, old: c.old, img: IMG(c.img, 120, 120) };
  }
  function cartTotal() { return cart.reduce(function (s, it) { return s + itemInfo(it.id).price * it.qty; }, 0); }
  function cartCount() { return cart.reduce(function (s, it) { return s + it.qty; }, 0); }
  function saveCart() { store(CART_KEY, cart); }
  function renderCart() {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.toggleAttribute('data-zero', !n); });
    drawer.classList.toggle('is-empty', !n);
    $('#citems').innerHTML = cart.map(function (it) {
      var info = itemInfo(it.id);
      return '<li class="ci" data-ci="' + it.id + '"><img src="' + info.img + '" alt="" width="64" height="64" loading="lazy">' +
        '<div class="ci__b"><p class="ci__n">' + esc(info.name) + '</p><p class="ci__p"><b>' + fmt(info.price) + '</b><s>' + fmt(info.old) + '</s></p>' +
        '<div class="qty qty--sm"><button type="button" data-q="-1" aria-label="Giảm số lượng">−</button><output>' + it.qty + '</output><button type="button" data-q="1" aria-label="Tăng số lượng">+</button></div></div>' +
        '<button class="ci__rm" type="button" data-rm aria-label="Xoá ' + esc(info.name) + '">' + ICON.trash + '</button></li>';
    }).join('');
    var t = cartTotal();
    $('#subtotal').textContent = fmt(t);
    var left = FREE - t;
    $('#shipTxt').innerHTML = left > 0 ? 'Mua thêm <b>' + fmt(left) + '</b> để được miễn phí lắp đặt nội thành' : '<b>Đơn hàng được miễn phí lắp đặt nội thành</b>';
    $('#shipFill').style.transform = 'scaleX(' + Math.min(1, t / FREE).toFixed(3) + ')';
  }
  function cartTarget() {
    var cands = [$('#cartBtn .hact__ic'), $('.bnav [data-open-cart] .bnav__ic')];
    for (var i = 0; i < cands.length; i++) { var r = cands[i] && cands[i].getBoundingClientRect(); if (r && r.width && r.bottom > 0 && r.top < window.innerHeight) return cands[i]; }
    return null;
  }
  function bump() { $$('[data-cart-count]').forEach(function (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); }
  function flyToCart(img, cb) {
    var tgt = cartTarget();
    if (!img || !tgt || reduce || !img.animate) { cb(); return; }
    var r = img.getBoundingClientRect(), t = tgt.getBoundingClientRect();
    if (!r.width) { cb(); return; }
    var size = Math.min(110, r.width);
    var clone = img.cloneNode(); clone.removeAttribute('srcset'); clone.src = img.currentSrc || img.src; clone.className = 'fly'; clone.alt = '';
    clone.style.cssText = 'left:' + (r.left + r.width / 2 - size / 2) + 'px;top:' + (r.top + r.height / 2 - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
    doc.body.appendChild(clone);
    var dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
    var anim = clone.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 60) + 'px) scale(.6)', opacity: .95, offset: .5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.12)', opacity: .3 }
    ], { duration: 650, easing: 'cubic-bezier(.45,0,.3,1)' });
    anim.onfinish = function () { clone.remove(); cb(); };
  }
  function addToCart(id, qty, srcImg) {
    qty = qty || 1;
    var ex = cart.filter(function (it) { return it.id === id; })[0];
    if (ex) ex.qty = Math.min(99, ex.qty + qty); else cart.push({ id: id, qty: qty });
    saveCart();
    flyToCart(srcImg, function () { renderCart(); bump(); });
    toast(ICON.check + '<span>Đã thêm <b>' + esc(itemInfo(id).name) + '</b> vào giỏ hàng</span><button type="button" data-open-cart>Xem giỏ</button>');
  }
  function openCart() { closeMenu(); drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lockScroll(true); lastFocus = doc.activeElement; setTimeout(function () { $('.drawer__hd .xbtn').focus(); }, 60); }
  function closeCart() { if (!drawer.classList.contains('is-open')) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); if (!openModalEl) lockScroll(false); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  $('#cartBtn').addEventListener('click', openCart);
  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); toastEl.classList.remove('is-show'); openCart(); return; }
    if (e.target.closest('[data-close-cart]') && !e.target.closest('a[href^="#"]')) { closeCart(); return; }
    var add = e.target.closest('[data-add]');
    if (add) {
      var id = add.getAttribute('data-add');
      var card = add.closest('.pc, .cbox');
      addToCart(id, 1, card ? $('img', card) : null);
      add.classList.add('is-added');
      setTimeout(function () { add.classList.remove('is-added'); }, 1200);
      return;
    }
    var ci = e.target.closest('.ci');
    if (ci) {
      var it = cart.filter(function (x) { return x.id === ci.getAttribute('data-ci'); })[0];
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
    if (openModalEl) closeModal(true);
    openModalEl = m; lastFocus = doc.activeElement;
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true);
    setTimeout(function () { var x = $('.modal__x', m); if (x) x.focus(); }, 60);
  }
  function closeModal(keepLock) {
    if (!openModalEl) return;
    var m = openModalEl; openModalEl = null;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    if (keepLock !== true && !drawer.classList.contains('is-open')) lockScroll(false);
    if (lastFocus && lastFocus.focus && doc.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  doc.addEventListener('click', function (e) { if (e.target.closest('[data-close-modal]')) closeModal(); });

  var qv = $('#qv'), qvQty = 1, qvId = null;
  function openQV(id) {
    var p = prodById[id]; if (!p) return;
    qvId = id; qvQty = 1; $('#qvQty').textContent = 1;
    var im = $('#qvImg'); im.src = PIMG(p.img); im.alt = p.name;
    $('#qvCredit').innerHTML = 'Ảnh: <a href="' + esc(p.src[2]) + '" target="_blank" rel="noopener">' + esc(p.src[0]) + '</a> · ' + esc(p.src[1]) + ' · Wikimedia Commons (đã tách nền)';
    $('#qvOff').textContent = '-' + pct(p) + '%';
    $('#qvCat').innerHTML = 'Trang chủ <span>›</span> ' + esc(catById[p.cat].name);
    $('#qvName').textContent = p.name;
    $('#qvMeta').innerHTML = starsHTML(p.rating) + '<b>' + p.rating.toFixed(1) + '</b><span>' + p.reviews + ' đánh giá</span><span>Đã bán ' + soldTxt(p.sold) + '</span><span>Mã SP: <b>DP-' + p.id.slice(1) + '</b></span>';
    $('#qvPrice').textContent = fmt(p.price);
    $('#qvOld').textContent = fmt(p.old);
    $('#qvPct').textContent = '-' + pct(p) + '%';
    var promo = ['Miễn phí lắp đặt nội thành cho đơn từ 3.000.000₫'];
    if (p.gift) promo.unshift(p.gift);
    if (p.tags.indexOf('i') >= 0) promo.push('Trả góp 0% kỳ hạn 3–12 tháng qua thẻ tín dụng');
    $('#qvPromo').innerHTML = '<b>' + ICON.gift + 'Khuyến mãi</b><ol>' + promo.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>';
    $('#qvSpec').innerHTML = p.feats.map(function (f) { return '<li>' + ICON.tick + esc(f) + '</li>'; }).join('');
    var fits = p.fit.slice(0, 6).map(function (m) { return modelName[m]; }).join(', ');
    $('#qvFit').innerHTML = '<b>Lắp vừa:</b> ' + esc(fits) + (p.fit.length > 6 ? ' và ' + (p.fit.length - 6) + ' dòng xe khác' : '') + (p.hp ? ' · <b class="up">tăng ~' + p.hp + ' HP</b>' : '');
    closeSugg(); closeCart(); hideMega();
    openModal(qv);
  }
  doc.addEventListener('click', function (e) { var t = e.target.closest('[data-qv]'); if (t) { e.preventDefault(); openQV(t.getAttribute('data-qv')); } });
  doc.addEventListener('click', function (e) { var b = e.target.closest('[data-qv-qty]'); if (b) { qvQty = Math.max(1, Math.min(99, qvQty + +b.getAttribute('data-qv-qty'))); $('#qvQty').textContent = qvQty; } });
  $('#qvAdd').addEventListener('click', function () { var id = qvId, q = qvQty; closeModal(); addToCart(id, q, null); });
  $('#qvBuy').addEventListener('click', function () { var id = qvId, q = qvQty; closeModal(true); addToCart(id, q, null); openCheckout(); });

  /* checkout */
  var co = $('#co'), coForm = $('#coForm'), coOk = $('#coOk');
  var PHONE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return String(v).replace(/[\s.\-()]/g, ''); }
  function setErr(input, msg) { var f = input.closest('.field'); f.classList.toggle('has-err', !!msg); $('.err', f).textContent = msg || ''; input.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }
  function openCheckout() {
    if (!cart.length) return;
    $('#coSum').innerHTML = cart.map(function (it) { var i = itemInfo(it.id); return '<div><span>' + it.qty + ' × ' + esc(i.name) + '</span><span>' + fmt(i.price * it.qty) + '</span></div>'; }).join('') + '<div class="tot"><span>Tổng tạm tính</span><b>' + fmt(cartTotal()) + '</b></div>';
    coForm.hidden = false; coOk.hidden = true;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    openModal(co);
  }
  $('#toCheckout').addEventListener('click', openCheckout);
  coForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#cName'), p = $('#cPhone'), a = $('#cAddr');
    var ok = setErr(n, n.value.trim().length < 2 ? 'Vui lòng nhập họ tên' : '');
    ok = setErr(p, !PHONE.test(cleanPhone(p.value)) ? 'Số điện thoại chưa đúng (VD: 0912 345 678)' : '') && ok;
    ok = setErr(a, a.value.trim().length < 4 ? 'Vui lòng nhập địa chỉ hoặc tên xưởng' : '') && ok;
    if (!ok) { var f = $('.has-err input', coForm); if (f) f.focus(); return; }
    var code = 'DP' + String(Date.now()).slice(-6);
    var pay = ($('input[name="pay"]:checked', coForm) || {}).value, ship = ($('input[name="ship"]:checked', coForm) || {}).value;
    $('#coOkTxt').innerHTML = 'Cảm ơn <b>' + esc(n.value.trim()) + '</b>. Mã đơn <b>' + code + '</b> · ' + cartCount() + ' sản phẩm · <b>' + fmt(cartTotal()) + '</b><br>' + (ship === 'nha' ? 'Giao &amp; lắp tận nơi' : 'Lắp tại xưởng') + ' · Thanh toán: ' + esc(pay) + '.<br>Nhân viên sẽ gọi <b>' + esc(cleanPhone(p.value)) + '</b> để xác nhận.<br><small>(Trang mẫu – không gửi dữ liệu, không thu tiền)</small>';
    coForm.hidden = true; coOk.hidden = false;
    cart = []; saveCart(); renderCart(); coForm.reset();
  });
  ['#cName', '#cPhone', '#cAddr', '#bName', '#bPhone', '#bCar', '#bDate'].forEach(function (s) { $(s).addEventListener('input', function () { if (this.closest('.field').classList.contains('has-err')) setErr(this, ''); }); });

  /* ---------------- mobile menu ---------------- */
  var mnav = $('#mnav'), burger = $('#burger');
  $('#mnavCats').innerHTML = D.CATS.map(function (c) { return '<li><a href="#san-pham" data-goto-cat="' + c.id + '"><img src="' + PIMG(c.img) + '" alt="" width="36" height="36" loading="lazy"><span>' + esc(c.name) + '<small>' + countCat(c.id) + ' sản phẩm</small></span>' + ICON.right + '</a></li>'; }).join('');
  function openMenu() { mnav.classList.add('is-open'); mnav.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); lockScroll(true); lastFocus = doc.activeElement; setTimeout(function () { $('.mnav .xbtn').focus(); }, 60); }
  function closeMenu() { if (!mnav.classList.contains('is-open')) return; mnav.classList.remove('is-open'); mnav.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); lockScroll(false); }
  burger.addEventListener('click', openMenu);
  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-menu]')) openMenu();
    else if (e.target.closest('[data-close-menu]')) closeMenu();
  });

  /* ---------------- Esc ---------------- */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (openModalEl) closeModal();
    else if (drawer.classList.contains('is-open')) closeCart();
    else if (mnav.classList.contains('is-open')) closeMenu();
    else { closeSugg(); hideMega(); }
  });

  /* ---------------- banner slider ---------------- */
  (function () {
    var track = $('#bTrack'), slides = $$('.slide', track), tabs = $$('#bTabs button'), view = $('.bslider__view');
    var i = 0, timer = null, hover = false;
    function go(n, user) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translate3d(' + (-i * 100) + '%,0,0)';
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      slides.forEach(function (s, k) {
        s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); s.tabIndex = k === i ? 0 : -1;
        if (Math.abs(k - i) <= 1) { var im = $('img', s); if (im.loading === 'lazy') im.loading = 'eager'; }
      });
      if (user) restart();
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!hover && !doc.hidden) go(i + 1); }, 5000); }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { go(k, true); }); t.addEventListener('mouseenter', function () { if (!isMobile()) go(k, true); }); });
    $('#bPrev').addEventListener('click', function () { go(i - 1, true); });
    $('#bNext').addEventListener('click', function () { go(i + 1, true); });
    var bs = $('#bslider');
    bs.addEventListener('mouseenter', function () { hover = true; });
    bs.addEventListener('mouseleave', function () { hover = false; });
    /* swipe */
    var sx = null, sy = 0, dx = 0, w = 1;
    view.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; w = view.offsetWidth; track.style.transition = 'none'; }, { passive: true });
    view.addEventListener('touchmove', function (e) {
      if (sx === null) return;
      dx = e.touches[0].clientX - sx;
      if (Math.abs(e.touches[0].clientY - sy) > Math.abs(dx)) return;
      track.style.transform = 'translate3d(calc(' + (-i * 100) + '% + ' + dx + 'px),0,0)';
    }, { passive: true });
    view.addEventListener('touchend', function () {
      track.style.transition = '';
      if (Math.abs(dx) > w * .18) go(i + (dx < 0 ? 1 : -1), true); else go(i);
      sx = null;
    });
    go(0); restart();
  })();

  /* ---------------- horizontal rows: arrows ---------------- */
  function rowStep(el) { var c = el.firstElementChild; if (!c) return 240; var gap = parseFloat(getComputedStyle(el).columnGap) || 10; return (c.offsetWidth + gap) * Math.max(1, Math.floor(el.clientWidth / (c.offsetWidth + gap)) - 1); }
  function rowArrows(el) {
    var wrap = doc.createElement('div'); wrap.className = 'hrow-wrap';
    el.parentNode.insertBefore(wrap, el); wrap.appendChild(el);
    var prev = doc.createElement('button'), next = doc.createElement('button');
    prev.className = 'rarr rarr--prev'; next.className = 'rarr rarr--next';
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Cuộn sang trái'); next.setAttribute('aria-label', 'Cuộn sang phải');
    prev.innerHTML = ICON.left; next.innerHTML = ICON.right;
    wrap.appendChild(prev); wrap.appendChild(next);
    function upd() { prev.hidden = el.scrollLeft < 8; next.hidden = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8; }
    prev.addEventListener('click', function () { el.scrollBy({ left: -rowStep(el), behavior: 'smooth' }); });
    next.addEventListener('click', function () { el.scrollBy({ left: rowStep(el), behavior: 'smooth' }); });
    el.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
    new MutationObserver(function () { setTimeout(upd, 30); }).observe(el, { childList: true });
    setTimeout(upd, 50);
  }
  ['#flashRow', '#carRow'].forEach(function (s) { rowArrows($(s)); });
  $$('[data-row-next]').forEach(function (b) { b.addEventListener('click', function () { var el = doc.getElementById(b.getAttribute('data-row-next')); el.scrollBy({ left: rowStep(el), behavior: 'smooth' }); }); });
  $$('[data-row-prev]').forEach(function (b) { b.addEventListener('click', function () { var el = doc.getElementById(b.getAttribute('data-row-prev')); el.scrollBy({ left: -rowStep(el), behavior: 'smooth' }); }); });

  /* ---------------- combos + dyno ---------------- */
  var stageIdx = 1;
  $('#stageTabs').innerHTML = D.COMBOS.map(function (c, i) {
    return '<button role="tab" aria-selected="' + (i === stageIdx) + '" data-stage="' + i + '"><b>' + c.stage + ' <span>· ' + esc(c.tag) + '</span></b><small><em>+' + (c.hp[1] - c.hp[0]) + ' HP</em><i> · </i><em>' + fmt(c.price) + '</em></small></button>';
  }).join('');
  function renderCombo(i) {
    var c = D.COMBOS[i];
    $('#cbox').innerHTML =
      '<div class="cbox__top"><img src="' + IMG(c.img, 240, 240) + '" alt="' + esc(c.name) + '" width="120" height="120" loading="lazy" decoding="async">' +
      '<div><span class="tg tg--red">' + esc(c.tag) + '</span><h3>' + esc(c.name) + '</h3><p>Thi công ' + esc(c.time) + ' · đo dyno trước &amp; sau · bảo hành 24 tháng</p></div></div>' +
      '<table class="cbox__tbl"><thead><tr><th>Thông số</th><th>Xe zin</th><th>Sau khi độ</th></tr></thead><tbody>' +
      '<tr><td>Công suất</td><td>' + c.hp[0] + ' HP</td><td><b>' + c.hp[1] + ' HP</b> <em>+' + (c.hp[1] - c.hp[0]) + '</em></td></tr>' +
      '<tr><td>Mô-men xoắn</td><td>' + c.nm[0] + ' Nm</td><td><b>' + c.nm[1] + ' Nm</b> <em>+' + (c.nm[1] - c.nm[0]) + '</em></td></tr>' +
      '<tr><td>0–100 km/h</td><td>' + String(c.acc[0]).replace('.', ',') + ' s</td><td><b>' + String(c.acc[1]).replace('.', ',') + ' s</b> <em>−' + String((c.acc[0] - c.acc[1]).toFixed(1)).replace('.', ',') + '</em></td></tr>' +
      '</tbody></table>' +
      '<p class="cbox__lbl">Gói gồm:</p><ul class="cbox__items">' + c.items.map(function (x) { return '<li>' + ICON.tick + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<div class="cbox__price"><b>' + fmt(c.price) + '</b><s>' + fmt(c.old) + '</s><span>Tiết kiệm ' + fmt(c.old - c.price) + '</span></div>' +
      '<div class="cbox__btns"><button class="btn btn--red" type="button" data-add="' + c.id + '">Chọn combo này</button><a class="btn btn--line" href="#dat-lich" data-book-svc="Combo ' + c.stage + '">Đặt lịch lắp</a></div>';
  }
  renderCombo(stageIdx);
  doc.addEventListener('click', function (e) { var a = e.target.closest('[data-book-svc]'); if (a) $('#bSvc').value = a.getAttribute('data-book-svc'); }, true);

  var svg = $('#dynoSvg'), X0 = 46, X1 = 628, Y0 = 316, Y1 = 16, HPMAX = 260, R0 = 1000, R1 = 7000;
  var xr = function (r) { return X0 + (r - R0) / (R1 - R0) * (X1 - X0); };
  var yh = function (h) { return Y0 - h / HPMAX * (Y0 - Y1); };
  (function () {
    var g = '';
    for (var h = 0; h <= 250; h += 50) g += '<line class="gl" x1="' + X0 + '" x2="' + X1 + '" y1="' + yh(h) + '" y2="' + yh(h) + '"/><text x="' + (X0 - 8) + '" y="' + (yh(h) + 4) + '" text-anchor="end">' + h + '</text>';
    for (var r = 1000; r <= 7000; r += 1000) g += '<text x="' + xr(r) + '" y="' + (Y0 + 20) + '" text-anchor="middle">' + (r / 1000) + 'k</text>';
    g += '<text x="' + X1 + '" y="' + (Y0 + 38) + '" text-anchor="end" class="ax">Vòng tua (rpm)</text><text x="' + (X0 - 8) + '" y="' + (Y1 - 4) + '" text-anchor="end" class="ax">HP</text>';
    $('#dynoGrid').innerHTML = g;
  })();
  function pathFrom(vals) {
    var pts = D.DYNO.rpm.map(function (r, i) { return [xr(r), yh(vals[i])]; });
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }
  var tunedP = $('#dynoTuned'), areaP = $('#dynoArea'), peakG = $('#dynoPeak');
  var cur = D.DYNO.stages[stageIdx].hp.slice();
  function drawTuned(vals) {
    var d = pathFrom(vals);
    tunedP.setAttribute('d', d);
    areaP.setAttribute('d', d + 'L' + xr(7000) + ',' + Y0 + 'L' + xr(1500) + ',' + Y0 + 'Z');
    var mi = 0; vals.forEach(function (v, i) { if (v > vals[mi]) mi = i; });
    peakG.setAttribute('transform', 'translate(' + xr(D.DYNO.rpm[mi]) + ',' + yh(vals[mi]) + ')');
  }
  $('#dynoStock').setAttribute('d', pathFrom(D.DYNO.stock));
  drawTuned(cur);
  function tween(dur, fn) {
    if (reduce || !dur) { fn(1); return; }
    var t0 = performance.now();
    (function f(now) { var t = Math.min(1, (now - t0) / dur); fn(t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); if (t < 1) requestAnimationFrame(f); })(t0);
  }
  function setKpi(i, animate) {
    var s = D.DYNO.stages[i], c = D.COMBOS[i];
    var to = { hp: s.peakHp, nm: s.nm, g: Math.round((s.peakHp / 178 - 1) * 100), a: c.acc[1] };
    var els = { hp: $('#kHp'), nm: $('#kNm'), g: $('#kGain'), a: $('#kAcc') };
    var from = { hp: +els.hp.textContent, nm: +els.nm.textContent, g: parseInt(els.g.textContent, 10), a: parseFloat(els.a.textContent.replace(',', '.')) };
    tween(animate ? 700 : 0, function (k) {
      els.hp.textContent = Math.round(from.hp + (to.hp - from.hp) * k);
      els.nm.textContent = Math.round(from.nm + (to.nm - from.nm) * k);
      els.g.textContent = '+' + Math.round(from.g + (to.g - from.g) * k);
      els.a.textContent = (from.a + (to.a - from.a) * k).toFixed(1).replace('.', ',');
    });
  }
  setKpi(stageIdx, false);
  $('#stageTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-stage]'); if (!b) return;
    var i = +b.getAttribute('data-stage'); if (i === stageIdx) return; stageIdx = i;
    $$('[data-stage]', this).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    var from = cur.slice(), target = D.DYNO.stages[i].hp;
    tween(800, function (k) { for (var j = 0; j < cur.length; j++) cur[j] = from[j] + (target[j] - from[j]) * k; drawTuned(cur); });
    setKpi(i, true);
    renderCombo(i);
  });
  /* hover read-out */
  var tip = $('#dynoTip'), hov = $('#dynoHover'), fig = $('#dyno');
  function dynoAt(clientX) {
    var sr = svg.getBoundingClientRect(), fr = fig.getBoundingClientRect();
    var vx = (clientX - sr.left) / sr.width * 640;
    var rpm = D.DYNO.rpm, i = Math.round((R0 + (vx - X0) / (X1 - X0) * (R1 - R0) - rpm[0]) / 500);
    i = Math.max(0, Math.min(rpm.length - 1, i));
    var x = xr(rpm[i]), y = yh(cur[i]);
    hov.setAttribute('opacity', 1);
    $('#dhLine').setAttribute('x1', x); $('#dhLine').setAttribute('x2', x);
    $('#dhDot').setAttribute('cx', x); $('#dhDot').setAttribute('cy', y);
    tip.hidden = false;
    tip.innerHTML = '<b>' + rpm[i].toLocaleString('vi-VN') + ' rpm</b>Zin ' + D.DYNO.stock[i] + ' HP · Độ <em>' + Math.round(cur[i]) + ' HP</em>';
    var px = sr.left - fr.left + x / 640 * sr.width, py = sr.top - fr.top + y / 360 * sr.height - 10;
    px = Math.max(90, Math.min(fr.width - 90, px));
    tip.style.transform = 'translate(' + px + 'px,' + py + 'px) translate(-50%,-100%)';
  }
  svg.addEventListener('pointermove', function (e) { dynoAt(e.clientX); });
  svg.addEventListener('pointerleave', function () { hov.setAttribute('opacity', 0); tip.hidden = true; });

  /* ---------------- builds ---------------- */
  $('#builds').innerHTML = D.BUILDS.map(function (b) {
    return '<figure class="build"><span class="build__img"><img src="' + IMG(b.img, 400, 300) + '" alt="' + esc(b.name) + '" width="400" height="300" loading="lazy" decoding="async"><em>' + esc(b.gain) + '</em></span><figcaption><b>' + esc(b.name) + '</b><small>' + esc(b.car) + '</small></figcaption></figure>';
  }).join('');

  /* ---------------- reviews ---------------- */
  (function () {
    var total = D.RATING_DIST.reduce(function (s, r) { return s + r[1]; }, 0);
    var avg = D.RATING_DIST.reduce(function (s, r) { return s + r[0] * r[1]; }, 0) / total;
    $('#revSum').innerHTML = '<div class="rev__avg"><b>' + avg.toFixed(1).replace('.', ',') + '</b><span>/5</span></div>' + starsHTML(avg.toFixed(1)) + '<p>' + total.toLocaleString('vi-VN') + ' lượt đánh giá</p>' +
      '<ul class="rev__dist">' + D.RATING_DIST.map(function (r) { var w = r[1] / total; return '<li><span>' + r[0] + ICON.star + '</span><i><em style="transform:scaleX(' + w.toFixed(3) + ')"></em></i><small>' + r[1].toLocaleString('vi-VN') + '</small></li>'; }).join('') + '</ul>' +
      '<button type="button" class="btn btn--line btn--block" data-demo="Trang mẫu – chức năng gửi đánh giá chưa mở.">Viết đánh giá</button>';
    $('#revList').innerHTML = D.REVIEWS.map(function (r) {
      return '<article class="rv-it"><div class="rv-it__u"><span class="av">' + esc(r.n.charAt(0)) + '</span><div><b>' + esc(r.n) + '</b><small class="ok-buy">' + ICON.check + 'Đã mua tại xưởng</small></div><time>' + r.d + '</time></div>' +
        '<div class="rv-it__r">' + starsHTML(r.r) + '<small>' + esc(r.car) + '</small></div><p>' + esc(r.t) + '</p>' +
        (r.ph ? '<div class="rv-it__ph">' + r.ph.map(function (id) { return '<img src="' + IMG(id, 128, 128) + '" alt="Ảnh khách gửi" width="64" height="64" loading="lazy" decoding="async">'; }).join('') + '</div>' : '') + '</article>';
    }).join('');
  })();

  /* ---------------- news ---------------- */
  $('#news').innerHTML = D.NEWS.map(function (n, i) {
    var w = i ? 240 : 720, h = i ? 160 : 405;
    return '<a class="nw' + (i ? '' : ' nw--big') + '" href="#tin-tuc" data-demo="Bài viết minh hoạ – nội dung đang cập nhật."><span class="nw__img"><img src="' + IMG(n.img, w, h) + '" alt="" width="' + w + '" height="' + h + '" loading="lazy" decoding="async"></span><span class="nw__b"><span class="tg">' + esc(n.tag) + '</span><b>' + esc(n.t) + '</b>' + (n.ex ? '<span class="nw__ex">' + esc(n.ex) + '</span>' : '') + '<time>' + ICON.clock + n.d + '</time></span></a>';
  }).join('');
  $('[data-news-all]').setAttribute('data-demo', 'Chuyên mục minh hoạ – đang cập nhật.');

  /* ---------------- showrooms ---------------- */
  $('#slist').innerHTML = D.SHOWROOMS.map(function (s, i) {
    return '<li class="st"><img src="' + IMG(s.img, 240, 180) + '" alt="' + esc(s.n) + '" width="120" height="90" loading="lazy" decoding="async"><div class="st__b"><b>' + esc(s.n) + '</b>' +
      '<p>' + ICON.pin + '<span>' + esc(s.a) + ' <em>(minh hoạ)</em></span></p><p>' + ICON.clock + '<span>' + esc(s.h) + '</span></p><p>' + ICON.phone + '<a href="tel:' + s.p.replace(/\s/g, '') + '">' + esc(s.p) + '</a></p><p class="st__f">' + esc(s.f) + '</p>' +
      '<div class="st__btns"><button type="button" class="lnk" data-demo="Địa chỉ minh hoạ – chưa có bản đồ.">Chỉ đường</button><button type="button" class="lnk lnk--red" data-store="' + i + '">Đặt lịch tại đây</button></div></div></li>';
  }).join('');
  $('#bStore').innerHTML = D.SHOWROOMS.map(function (s, i) { return '<option value="' + i + '">' + esc(s.n) + '</option>'; }).join('');
  doc.addEventListener('click', function (e) { var b = e.target.closest('[data-store]'); if (b) { $('#bStore').value = b.getAttribute('data-store'); goTo('dat-lich'); setTimeout(function () { $('#bName').focus({ preventScroll: true }); }, 500); } });

  /* ---------------- photo credits ---------------- */
  $('#credits').innerHTML = D.P.map(function (p) { return '<li>' + esc(p.name.split(' (')[0]) + ': <a href="' + esc(p.src[2]) + '" target="_blank" rel="noopener">' + esc(p.src[0]) + '</a>, ' + esc(p.src[1]) + '</li>'; }).join('');

  /* ---------------- FAQ ---------------- */
  $('#faqList').innerHTML = D.FAQ.map(function (f, i) {
    return '<div class="qa' + (i === 0 ? ' is-open' : '') + '"><button class="qa__q" type="button" aria-expanded="' + (i === 0) + '" aria-controls="qa' + i + '"><span>' + esc(f.q) + '</span><i aria-hidden="true"></i></button><div class="qa__a" id="qa' + i + '" role="region"><div><p>' + esc(f.a) + '</p></div></div></div>';
  }).join('');
  $('#faqList').addEventListener('click', function (e) {
    var q = e.target.closest('.qa__q'); if (!q) return;
    var item = q.parentNode, open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open); q.setAttribute('aria-expanded', open);
  });

  /* ---------------- booking ---------------- */
  var bookForm = $('#bookForm'), bDate = $('#bDate');
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function resetDate() { var t = new Date(); t.setDate(t.getDate() + 1); bDate.min = iso(new Date()); bDate.value = iso(t); }
  resetDate();
  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#bName'), p = $('#bPhone'), c = $('#bCar');
    var ok = setErr(n, n.value.trim().length < 2 ? 'Vui lòng nhập họ tên' : '');
    ok = setErr(p, !PHONE.test(cleanPhone(p.value)) ? 'Số điện thoại chưa đúng (VD: 0912 345 678)' : '') && ok;
    ok = setErr(c, c.value.trim().length < 2 ? 'Vui lòng nhập dòng xe' : '') && ok;
    ok = setErr(bDate, (!bDate.value || bDate.value < bDate.min) ? 'Chọn ngày từ hôm nay trở đi' : '') && ok;
    if (!ok) { var f = $('.has-err input', bookForm); if (f) f.focus(); return; }
    var slotV = ($('input[name="slot"]:checked', bookForm) || {}).value || '';
    var dd = bDate.value.split('-');
    $('#bookOkTxt').innerHTML = 'Hẹn <b>' + esc(n.value.trim()) + '</b> lúc <b>' + slotV + ', ' + dd[2] + '/' + dd[1] + '/' + dd[0] + '</b> tại <b>' + esc(D.SHOWROOMS[+$('#bStore').value].n) + '</b> cho xe <b>' + esc(c.value.trim()) + '</b> – hạng mục ' + esc($('#bSvc').value) + '.<br><small>(Trang mẫu – không gửi dữ liệu)</small>';
    $('#bookOk').hidden = false;
  });
  $('#bookAgain').addEventListener('click', function () { $('#bookOk').hidden = true; bookForm.reset(); resetDate(); });

  /* newsletter */
  $('#nlForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#nlMail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast('Vui lòng nhập email hợp lệ.'); $('#nlMail').focus(); return; }
    this.reset(); toast(ICON.check + '<span>Đã đăng ký nhận ưu đãi (trang mẫu – không gửi dữ liệu).</span>');
  });

  /* ---------------- header shadow, back-to-top, bottom nav state ---------------- */
  var toTop = $('#toTop'), ticking = false;
  var bnavItems = $$('.bnav > a, .bnav > button');
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight;
    hdr.classList.toggle('is-stuck', y > 40);
    toTop.classList.toggle('is-show', y > 900);
    var fs = doc.getElementById('flash-sale').getBoundingClientRect(), bk = doc.getElementById('he-thong').getBoundingClientRect();
    var act = (bk.top < vh * .5 && bk.bottom > 0) ? 3 : (fs.top < vh * .5 && fs.bottom > vh * .2) ? 2 : (y < 300 ? 0 : -1);
    bnavItems.forEach(function (a, k) { a.classList.toggle('is-on', k === act); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener('click', function () { goTo('trang-chu'); });
  onScroll();

  /* ---------------- initial render ---------------- */
  refresh(false);
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- reveal on scroll (chỉ phần dưới màn hình đầu) ---------------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('main > .box, main > .finder').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('rv'); io.observe(el); }
    });
  }
})();
