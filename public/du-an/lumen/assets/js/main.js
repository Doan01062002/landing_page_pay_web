/* Lumen – Đèn ô tô · main script (cửa hàng mẫu, không backend) */
(function () {
  'use strict';

  var D = window.LUMEN_DATA;
  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 900px)');

  /* ---------- helpers ---------- */
  function group(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmt(n) { return group(n) + '₫'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function dec1(n) { return n.toFixed(1).replace('.', ','); }
  function off(p) { return Math.round((1 - p.price / p.old) * 100); }
  function soldTxt(n) { return n >= 1000 ? dec1(n / 1000).replace(',0', '') + 'k' : String(n); }
  function pad(n) { return String(n).padStart(2, '0'); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var PHONE_RE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return String(v || '').replace(/[\s.\-()]/g, ''); }
  function prettyPhone(p) { return p.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'); }

  var byId = {}; D.PRODUCTS.concat(D.VARIANTS || []).forEach(function (p) { byId[p.id] = p; });
  var catById = {}; D.CATS.forEach(function (c) { catById[c.id] = c; });
  var typeById = {}; D.TYPES.forEach(function (t) { typeById[t.id] = t; });

  function img(id, w, h) { return D.U(id, w, h); }
  function pImg(p, size, sizes, eager) {
    var s = size || 480;
    return '<img src="' + p.img + '" width="800" height="800" alt="' + esc(p.name) + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  function starIc() { return '<svg class="ic" aria-hidden="true"><use href="#i-star"/></svg>'; }

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.innerHTML = '<svg class="ic" style="color:var(--green)"><use href="#i-check"/></svg><span>' + esc(msg) + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- layers (dropdown, drawers, backdrop) ---------- */
  var backdrop = $('#backdrop'), layer = null, catBtn = $('#catBtn'), catDrop = $('#catDrop');
  function showBackdrop(over) {
    backdrop.hidden = false; backdrop.classList.toggle('over', !!over);
    requestAnimationFrame(function () { backdrop.classList.add('show'); });
  }
  function hideBackdrop() { backdrop.classList.remove('show'); setTimeout(function () { if (!layer) backdrop.hidden = true; }, 260); }
  function openLayer(name) {
    closeLayer(true);
    layer = name;
    if (name === 'drop') { catDrop.hidden = false; catBtn.setAttribute('aria-expanded', 'true'); showBackdrop(false); return; }
    var el = name === 'cart' ? $('#cart') : $('#drawerMenu');
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
    showBackdrop(true); root.style.overflow = 'hidden';
    if (name === 'menu') $('#menuBtnM').setAttribute('aria-expanded', 'true');
    setTimeout(function () { var b = $('[data-close-drawer]', el); b && b.focus({ preventScroll: true }); }, 80);
  }
  function closeLayer(silent) {
    if (!layer) return;
    var was = layer; layer = null;
    if (was === 'drop') { catDrop.hidden = true; catBtn.setAttribute('aria-expanded', 'false'); $$('.mm-list > li.open', catDrop).forEach(function (l) { l.classList.remove('open'); }); }
    else {
      var el = was === 'cart' ? $('#cart') : $('#drawerMenu');
      el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
      if (was === 'menu') $('#menuBtnM').setAttribute('aria-expanded', 'false');
      if (qvEl.hidden) root.style.overflow = '';
      if (was === 'cart' && !$('#orderOk').hidden) setTimeout(showCartView, 400);
    }
    if (!silent) hideBackdrop(); else { backdrop.classList.remove('show'); backdrop.hidden = true; }
  }
  backdrop.addEventListener('click', function () { closeLayer(); });
  $$('[data-close-drawer]').forEach(function (b) {
    b.addEventListener('click', function () { closeLayer(); if (b.dataset.goto) setTimeout(function () { goTo(b.dataset.goto); }, 120); });
  });
  catBtn.addEventListener('click', function () { if (layer === 'drop') closeLayer(); else openLayer('drop'); });
  $('#menuBtnM').addEventListener('click', function () { openLayer('menu'); });
  $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { openLayer('menu'); }); });

  /* ---------- in-page links ---------- */
  function goTo(hash) {
    var id = hash.replace('#', '');
    if (id === 'top') { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    var t = doc.getElementById(id); if (!t) return;
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href');
    e.preventDefault();
    if (a.dataset.gotoCat !== undefined || a.dataset.cat !== undefined) {
      if (a.classList.contains('slide') && banner.dragged) return;
      applyCat(a.dataset.gotoCat || a.dataset.cat || '', a.dataset.q || '');
    }
    if (a.dataset.sortLink) setSort(a.dataset.sortLink);
    if (a.dataset.branch) { var s = $('#bookForm [name=branch]'); if (s) s.value = a.dataset.branch; }
    if (layer) closeLayer();
    if (h.length > 1) goTo(h);
  });

  /* ---------- header ---------- */
  var header = $('#header'), hState = '';
  function onScroll() {
    var y = window.scrollY;
    var s = (y > 8 ? 's' : '') + (y > 160 ? 'c' : '');
    if (s !== hState) { hState = s; header.classList.toggle('scrolled', y > 8); header.classList.toggle('compact', y > 160); }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- top bar messages ---------- */
  (function () {
    var spans = $$('#topMsg span'), i = 0;
    if (spans.length < 2 || reduce) return;
    setInterval(function () {
      if (doc.hidden) return;
      spans[i].classList.remove('is-on'); i = (i + 1) % spans.length; spans[i].classList.add('is-on');
    }, 4200);
  })();

  /* ---------- mega menu ---------- */
  function catProducts(cid) { return D.PRODUCTS.filter(function (p) { return p.cat === cid; }); }
  function mmHTML() {
    return '<ul class="mm-list">' + D.CATS.map(function (c) {
      var feat = catProducts(c.id).sort(function (a, b) { return b.hot - a.hot; }).slice(0, 2);
      return '<li><a href="#san-pham" data-cat="' + c.id + '"><svg class="ic"><use href="#' + c.icon + '"/></svg>' + c.full + '<svg class="ic ic-sm"><use href="#i-right"/></svg></a>' +
        '<div class="mm-fly">' + c.groups.map(function (g) {
          return '<div class="mm-col"><h4>' + g[0] + '</h4>' + g[1].map(function (t) { return '<a href="#san-pham" data-cat="' + c.id + '" data-q="' + esc(t) + '">' + t + '</a>'; }).join('') + '</div>';
        }).join('') +
        '<div class="mm-col"><h4>Theo giá</h4>' + D.PRICES.map(function (pr) { return '<a href="#san-pham" data-cat="' + c.id + '" data-q="">' + pr.name + '</a>'; }).join('') + '</div>' +
        '<div class="mm-feat mm-col"><h4>Bán chạy</h4>' + feat.map(function (p) {
          return '<a class="mm-p" href="#san-pham" data-cat="' + c.id + '"><img src="' + p.img + '" width="56" height="56" alt="" loading="lazy" decoding="async"><span>' + esc(p.name) + '<b>' + fmt(p.price) + '</b></span></a>';
        }).join('') + '</div></div></li>';
    }).join('') + D.SERVICES.map(function (s) {
      return '<li class="mm-svc"><a href="' + s.href + '"><svg class="ic"><use href="#' + s.icon + '"/></svg>' + s.name + '<svg class="ic ic-sm"><use href="#i-right"/></svg></a></li>';
    }).join('') + '</ul>';
  }
  $$('[data-megamenu]').forEach(function (m) {
    m.innerHTML = mmHTML();
    // keyboard / touch: open flyout on focus
    m.addEventListener('focusin', function (e) { var li = e.target.closest('.mm-list > li'); $$('.mm-list > li', m).forEach(function (x) { x.classList.toggle('open', x === li); }); });
    m.addEventListener('mouseleave', function () { $$('.mm-list > li.open', m).forEach(function (x) { x.classList.remove('open'); }); });
  });
  // price links inside mega menu: map by text
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('.mm-col a'); if (!a) return;
    var pr = D.PRICES.filter(function (x) { return x.name === a.textContent; })[0];
    if (pr) { state.price = pr.id; syncFilters(); renderGrid(); }
  }, true);

  /* mobile drawer categories */
  $('#mCats').innerHTML = D.CATS.map(function (c) {
    return '<li><button type="button" aria-expanded="false"><svg class="ic"><use href="#' + c.icon + '"/></svg>' + c.full + '<svg class="ic ic-sm"><use href="#i-down"/></svg></button>' +
      '<div class="m-sub"><div><a class="all" href="#san-pham" data-cat="' + c.id + '">Xem tất cả ' + c.name + '</a></div>' + c.groups.map(function (g) {
        return '<p>' + g[0] + '</p><div>' + g[1].map(function (t) { return '<a href="#san-pham" data-cat="' + c.id + '" data-q="' + esc(t) + '">' + t + '</a>'; }).join('') + '</div>';
      }).join('') + '</div></li>';
  }).join('');
  $('#mCats').addEventListener('click', function (e) {
    var b = e.target.closest('li > button'); if (!b) return;
    var li = b.parentNode, o = !li.classList.contains('open');
    $$('#mCats > li.open').forEach(function (x) { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
    li.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  /* ---------- banner slider ---------- */
  var banner = (function () {
    var el = $('#banner'), track = $('#bannerTrack'), slides = $$('.slide', track), tabs = $$('.banner-tabs button', el), dotsEl = $('#bannerDots');
    var n = slides.length, i = 0, timer = null, hover = false, visible = true, api = { dragged: false };
    dotsEl.innerHTML = slides.map(function () { return '<i></i>'; }).join('');
    var dots = $$('i', dotsEl);
    function go(k) {
      i = (k + n) % n;
      track.style.transform = 'translate3d(' + (-100 * i) + '%,0,0)';
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); s.tabIndex = j === i ? 0 : -1; });
      // warm next image
      var nx = slides[(i + 1) % n].querySelector('img'); if (nx && nx.loading === 'lazy') nx.loading = 'eager';
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!hover && visible && !doc.hidden) go(i + 1); }, 5000); }
    tabs.forEach(function (t, j) { t.addEventListener('click', function () { go(j); restart(); }); t.addEventListener('mouseenter', function () { go(j); }); });
    $('[data-bprev]', el).addEventListener('click', function () { go(i - 1); restart(); });
    $('[data-bnext]', el).addEventListener('click', function () { go(i + 1); restart(); });
    el.addEventListener('mouseenter', function () { hover = true; });
    el.addEventListener('mouseleave', function () { hover = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(el);
    // swipe / drag
    var view = $('.banner-view', el), sx = 0, sy = 0, dx = 0, down = false, w = 1, lock = '';
    view.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true; sx = e.clientX; sy = e.clientY; dx = 0; lock = ''; w = view.clientWidth; api.dragged = false;
    });
    view.addEventListener('pointermove', function (e) {
      if (!down) return;
      var mx = e.clientX - sx, my = e.clientY - sy;
      if (!lock) { if (Math.abs(mx) > 8 || Math.abs(my) > 8) lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'; else return; }
      if (lock !== 'x') return;
      dx = mx; api.dragged = true; hover = true;
      track.classList.add('dragging');
      track.style.transform = 'translate3d(calc(' + (-100 * i) + '% + ' + dx + 'px),0,0)';
    });
    function up() {
      if (!down) return; down = false; track.classList.remove('dragging');
      if (lock === 'x' && Math.abs(dx) > w * 0.12) go(i + (dx < 0 ? 1 : -1)); else go(i);
      hover = false; restart();
      setTimeout(function () { api.dragged = false; }, 50);
    }
    view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up); view.addEventListener('pointerleave', up);
    go(0); restart();
    return api;
  })();

  /* ---------- flash sale countdown (khung giờ trong ngày) ---------- */
  var SLOTS = [[0, 12], [12, 19], [19, 24]];
  var cds = $$('[data-countdown]'), lastS = '';
  function curSlot(d) { var h = d.getHours(); for (var k = 0; k < SLOTS.length; k++) if (h >= SLOTS[k][0] && h < SLOTS[k][1]) return k; return 0; }
  (function slotLabels() {
    var now = new Date(), k = curSlot(now), s = SLOTS[k], nx = SLOTS[(k + 1) % SLOTS.length];
    var btns = $$('.flash-slots button');
    $('b', btns[0]).textContent = pad(s[0]) + ':00 – ' + pad(s[1] - 1) + ':59';
    $('b', btns[1]).textContent = (k === SLOTS.length - 1 ? 'Ngày mai ' : '') + pad(nx[0]) + ':00';
  })();
  function tickCd() {
    var now = new Date(), end = new Date(now), s = SLOTS[curSlot(now)];
    end.setHours(s[1], 0, 0, 0);
    var d = Math.max(0, Math.floor((end - now) / 1000));
    var hh = pad(Math.floor(d / 3600)), mm = pad(Math.floor(d % 3600 / 60)), ss = pad(d % 60);
    cds.forEach(function (c) {
      $('[data-h]', c).textContent = hh; $('[data-m]', c).textContent = mm;
      var sb = $('[data-s]', c); sb.textContent = ss;
      if (!reduce && ss !== lastS) { sb.classList.remove('tick'); void sb.offsetWidth; sb.classList.add('tick'); }
    });
    lastS = ss;
  }
  tickCd(); setInterval(tickCd, 1000);

  /* ---------- product card ---------- */
  function cardHTML(p, flash) {
    var o = off(p);
    var stock = '';
    if (flash && p.flash) {
      var left = p.flash.left, pct = Math.max(12, Math.round((1 - left / p.flash.total) * 100));
      stock = '<div class="pc-stock" style="--w:' + pct + '%"><i></i><span>' + (left <= 4 ? 'Sắp hết – còn ' + left + ' suất' : 'Còn ' + left + '/' + p.flash.total + ' suất') + '</span></div>';
    }
    return '<article class="pc" data-id="' + p.id + '">' +
      '<button type="button" class="pc-media" data-qv="' + p.id + '" aria-label="Xem chi tiết ' + esc(p.name) + '">' + pImg(p, 480, flash ? '(max-width: 900px) 42vw, 220px' : null) +
      '<span class="pc-off">-' + o + '%</span>' + (p.inst ? '<span class="pc-inst">Trả góp 0%</span>' : '') + '</button>' +
      '<h3><button type="button" class="pc-name" data-qv="' + p.id + '">' + esc(p.name) + '</button></h3>' +
      '<div class="pc-price"><b>' + fmt(p.price) + '</b><s>' + fmt(p.old) + '</s></div>' +
      (flash ? stock : '<p class="pc-gift"><svg class="ic" aria-hidden="true"><use href="#i-gift"/></svg><span>' + esc(p.gift) + '</span></p>') +
      '<div class="pc-foot"><p class="pc-meta"><span class="rt">' + starIc() + dec1(p.rating) + ' <em>(' + p.reviews + ')</em></span><span class="sold">Đã lắp ' + soldTxt(p.sold) + ' xe</span></p>' +
      '<button type="button" class="pc-add" data-add="' + p.id + '" aria-label="Thêm ' + esc(p.name) + ' vào giỏ"><svg class="ic"><use href="#i-cart"/></svg></button></div>' +
      '</article>';
  }

  /* ---------- flash sale row ---------- */
  var flashList = D.PRODUCTS.filter(function (p) { return p.flash; }).sort(function (a, b) { return off(b) - off(a); });
  $('#flashTrack').innerHTML = flashList.map(function (p) { return cardHTML(p, true); }).join('');

  /* ---------- horizontal rows ---------- */
  function initRow(el) {
    var tr = $('.hrow-track', el), prev = $('[data-prev]', el), next = $('[data-next]', el);
    function upd() {
      var max = tr.scrollWidth - tr.clientWidth - 4;
      if (prev) prev.disabled = tr.scrollLeft <= 4;
      if (next) next.disabled = tr.scrollLeft >= max;
    }
    function step(dir) { tr.scrollBy({ left: dir * tr.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' }); }
    prev && prev.addEventListener('click', function () { step(-1); });
    next && next.addEventListener('click', function () { step(1); });
    tr.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd); upd();
  }

  /* ---------- listing state ---------- */
  var state = { cat: '', type: '', price: '', q: '', sort: 'hot', fit: null, limit: 15 };
  var grid = $('#grid'), emptyEl = $('#empty'), resultLine = $('#resultLine'), moreBtn = $('#moreBtn');

  function matchQ(p, q) {
    var hay = norm(p.name + ' ' + catById[p.cat].name + ' ' + catById[p.cat].full + ' ' + p.brand + ' ' + p.specs.join(' ') + ' ' + p.cars.map(function (c) { return typeById[c].name; }).join(' '));
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }
  function filtered(st) {
    st = st || state;
    var q = norm(st.q.trim());
    var pr = D.PRICES.filter(function (x) { return x.id === st.price; })[0];
    var list = D.PRODUCTS.filter(function (p) {
      if (st.cat && p.cat !== st.cat) return false;
      if (st.type && p.cars.indexOf(st.type) < 0) return false;
      if (st.fit && p.cars.indexOf(st.fit.type) < 0) return false;
      if (pr && (p.price < pr.min || p.price >= pr.max)) return false;
      if (q && !matchQ(p, q)) return false;
      return true;
    });
    var s = st.sort;
    list.sort(function (a, b) {
      if (s === 'price-asc') return a.price - b.price;
      if (s === 'price-desc') return b.price - a.price;
      if (s === 'sale') return off(b) - off(a);
      if (s === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      return b.hot - a.hot || b.sold - a.sold;
    });
    return list;
  }

  /* category tabs + selects */
  var catTabs = $('#catTabs');
  catTabs.innerHTML = '<button type="button" data-tab="" aria-pressed="true">Tất cả</button>' + D.CATS.map(function (c) {
    return '<button type="button" data-tab="' + c.id + '" aria-pressed="false"><svg class="ic"><use href="#' + c.icon + '"/></svg>' + c.name + '</button>';
  }).join('');
  catTabs.addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; state.cat = b.dataset.tab; state.limit = 15; syncFilters(); renderGrid(); });
  var fType = $('#fType'), fPrice = $('#fPrice');
  fType.innerHTML = '<option value="">Loại xe: Tất cả</option>' + D.TYPES.map(function (t) { return '<option value="' + t.id + '">' + t.name + '</option>'; }).join('');
  fPrice.innerHTML = '<option value="">Giá: Tất cả</option>' + D.PRICES.map(function (t) { return '<option value="' + t.id + '">' + t.name + '</option>'; }).join('');
  fType.addEventListener('change', function () { state.type = this.value; state.limit = 15; syncFilters(); renderGrid(); });
  fPrice.addEventListener('change', function () { state.price = this.value; state.limit = 15; syncFilters(); renderGrid(); });
  $$('.sort button').forEach(function (b) { b.addEventListener('click', function () { setSort(b.dataset.sort); }); });
  function setSort(s) { state.sort = s; $$('.sort button').forEach(function (x) { x.classList.toggle('on', x.dataset.sort === s); }); renderGrid(); }

  function syncFilters() {
    $$('[data-tab]', catTabs).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tab === state.cat ? 'true' : 'false'); });
    fType.value = state.type; fPrice.value = state.price;
    var chips = [];
    if (state.q.trim()) chips.push(['q', 'Từ khoá: “' + esc(state.q.trim()) + '”']);
    if (state.fit) chips.push(['fit', 'Xe: ' + esc(state.fit.label)]);
    var n = chips.length + (state.cat ? 1 : 0) + (state.type ? 1 : 0) + (state.price ? 1 : 0);
    $('#activeFilters').innerHTML = chips.map(function (c) { return '<button type="button" data-unset="' + c[0] + '">' + c[1] + '<svg class="ic"><use href="#i-close"/></svg></button>'; }).join('') +
      (n ? '<button type="button" class="clear" data-unset="all">Xoá bộ lọc</button>' : '');
  }
  $('#activeFilters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-unset]'); if (!b) return;
    var k = b.dataset.unset;
    if (k === 'all') return resetFilters();
    if (k === 'q') { state.q = ''; sIn.value = ''; }
    if (k === 'fit') { state.fit = null; $$('#fitPopular button').forEach(function (x) { x.classList.remove('on'); }); fitDefault(); }
    state.limit = 15; syncFilters(); renderGrid();
  });
  function resetFilters() { if (state.fit) fitDefault(); state.cat = ''; state.type = ''; state.price = ''; state.q = ''; state.fit = null; state.limit = 15; sIn.value = ''; syncFilters(); renderGrid(); }
  $$('[data-reset]').forEach(function (b) { b.addEventListener('click', resetFilters); });
  moreBtn.addEventListener('click', function () { state.limit += 15; renderGrid(true); });

  function renderGrid(keep) {
    var list = filtered();
    var shown = list.slice(0, state.limit);
    var oldTile = $('.svc-tile', grid); if (oldTile) oldTile.remove();
    var prevN = keep ? grid.children.length : 0;
    if (keep) grid.insertAdjacentHTML('beforeend', list.slice(prevN, state.limit).map(function (p) { return cardHTML(p); }).join(''));
    else grid.innerHTML = shown.map(function (p) { return cardHTML(p); }).join('');
    if (list.length && shown.length === list.length) { grid.insertAdjacentHTML('beforeend', SVC_TILE); fitTile(); }
    $$('.pc', grid).forEach(function (c, k) { c.style.animationDelay = (k >= prevN ? Math.min(k - prevN, 10) * 30 : 0) + 'ms'; });
    emptyEl.hidden = list.length > 0;
    var rest = list.length - shown.length;
    moreBtn.hidden = rest <= 0;
    moreBtn.textContent = 'Xem thêm ' + rest + ' sản phẩm';
    resultLine.innerHTML = 'Tìm thấy <b>' + list.length + '</b> sản phẩm' + (state.cat ? ' trong ' + catById[state.cat].full : '');
  }
  var SVC_TILE = '<aside class="svc-tile"><img src="' + img('1631856507219-d1f3465b4884', 640, 480) + '" width="640" height="480" alt="Cụm đèn pha bi-LED đã lắp trên xe" loading="lazy" decoding="async">' +
    '<div><p class="svc-k">Dịch vụ lắp theo xe</p><h3>Nâng cấp Bi-LED, Bi-Laser, ambient 64 màu</h3><p>Báo giá trọn gói sau khi kiểm tra chóa đèn, giắc zin và nguồn điện. Lắp trong ngày tại 3 chi nhánh.</p>' +
    '<div class="svc-act"><a class="btn btn-primary btn-sm" href="#dat-lich">Đặt lịch tư vấn</a><a class="btn btn-outline btn-sm" href="#so-sanh">Xem trước / sau</a></div></div></aside>';
  function fitTile() {
    var t = $('.svc-tile', grid); if (!t) return;
    var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    var n = $$('.pc', grid).length, rem = cols - (n % cols), span = rem === cols ? cols : rem;
    t.style.gridColumn = 'span ' + span;
    t.classList.toggle('narrow', span < 2 || (span < 3 && cols > 2));
  }
  window.addEventListener('resize', fitTile);
  function applyCat(cid, q) {
    state.cat = cid || ''; state.limit = 15; state.q = '';
    if (q) { var test = filtered({ cat: state.cat, type: '', price: '', q: q, sort: 'hot', fit: null }); if (test.length) state.q = q; }
    sIn.value = state.q;
    syncFilters(); renderGrid();
  }

  /* ---------- categories tiles ---------- */
  $('#cats').innerHTML = D.CATS.map(function (c) {
    var ps = catProducts(c.id).sort(function (a, b) { return b.hot - a.hot; });
    return '<a class="cat" href="#san-pham" data-cat="' + c.id + '"><img src="' + ps[0].img + '" width="76" height="76" alt="" loading="lazy" decoding="async"><b>' + c.name + '</b><small>' + ps.length + ' sản phẩm</small></a>';
  }).join('');
  $('#credits').innerHTML = 'Ảnh sản phẩm: Wikimedia Commons – ' + D.CREDITS.map(function (c) { return '<a href="' + c[3] + '" target="_blank" rel="noopener">' + c[0] + '</a> (' + esc(c[1]) + ', ' + c[2] + ')'; }).join('; ') + '. Ảnh đã được cắt và đặt trên nền trắng. Ảnh banner, công trình: Unsplash.';
  $('#footCats').innerHTML = D.CATS.slice(0, 7).map(function (c) { return '<li><a href="#san-pham" data-cat="' + c.id + '">' + c.full + '</a></li>'; }).join('');

  /* ---------- search + suggestions ---------- */
  var sIn = $('#searchInput'), sgEl = $('#suggest'), sgIdx = -1, sgItems = [];
  function setPh() { sIn.placeholder = mqMobile.matches ? 'Tìm bóng LED, xenon, LED dây…' : 'Bạn cần tìm gì? VD: bóng LED H4, xenon D2S, LED dây…'; }
  setPh(); if (mqMobile.addEventListener) mqMobile.addEventListener('change', setPh);
  var KEYS = ['bóng LED H4', 'xenon D2S', 'T10', 'LED dây', 'phục hồi đèn pha', 'cảm biến mưa'];
  function hl(name, q) {
    if (!q) return esc(name);
    var words = norm(q).split(/\s+/).filter(Boolean), n = norm(name), out = '', i = 0;
    var marks = new Array(name.length).fill(false);
    words.forEach(function (w) { var k = n.indexOf(w); while (k > -1) { for (var j = k; j < k + w.length; j++) marks[j] = true; k = n.indexOf(w, k + w.length); } });
    for (i = 0; i < name.length; i++) { var m = marks[i]; if (m && (i === 0 || !marks[i - 1])) out += '<mark>'; out += esc(name[i]); if (m && (i === name.length - 1 || !marks[i + 1])) out += '</mark>'; }
    return out;
  }
  function renderSuggest() {
    var q = sIn.value.trim(), html = '';
    if (!q) {
      sgItems = D.PRODUCTS.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 4);
      html = '<p class="sg-h">Xu hướng tìm kiếm</p><div class="sg-keys">' + KEYS.map(function (k) { return '<button type="button" data-key="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div><p class="sg-h">Bán chạy nhất</p>';
    } else {
      sgItems = D.PRODUCTS.filter(function (p) { return matchQ(p, norm(q)); }).sort(function (a, b) { return b.hot - a.hot; });
      html = '<p class="sg-h">Sản phẩm gợi ý</p>';
    }
    var total = sgItems.length; sgItems = sgItems.slice(0, 5); sgIdx = -1;
    html += sgItems.length ? sgItems.map(function (p, k) {
      return '<button type="button" class="sg-item" data-sg="' + k + '"><img src="' + p.img + '" width="46" height="46" alt=""><span>' + hl(p.name, q) + '<b>' + fmt(p.price) + ' <s class="muted" style="font-weight:400">' + fmt(p.old) + '</s></b></span></button>';
    }).join('') : '<p class="sg-none">Không tìm thấy sản phẩm cho “' + esc(q) + '”. Thử “bi-LED”, “ambient”…</p>';
    if (q && total) html += '<button type="button" class="sg-all" data-sgall>Xem tất cả ' + total + ' kết quả cho “' + esc(q) + '”</button>';
    sgEl.innerHTML = html; sgEl.hidden = false;
    sIn.setAttribute('aria-expanded', 'true');
  }
  function hideSuggest() { sgEl.hidden = true; sIn.setAttribute('aria-expanded', 'false'); }
  function doSearch(q) {
    state.q = q; state.cat = ''; state.limit = 15; sIn.value = q;
    syncFilters(); renderGrid(); hideSuggest(); sIn.blur(); goTo('#san-pham');
  }
  var sT;
  sIn.addEventListener('focus', renderSuggest);
  sIn.addEventListener('input', function () {
    renderSuggest();
    clearTimeout(sT); sT = setTimeout(function () { state.q = sIn.value; state.limit = 15; syncFilters(); renderGrid(); }, 180);
  });
  sIn.addEventListener('keydown', function (e) {
    if (sgEl.hidden || !sgItems.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); sgIdx = (sgIdx + (e.key === 'ArrowDown' ? 1 : -1) + sgItems.length) % sgItems.length;
      $$('.sg-item', sgEl).forEach(function (b, k) { b.classList.toggle('act', k === sgIdx); });
    } else if (e.key === 'Enter' && sgIdx > -1) { e.preventDefault(); hideSuggest(); openQV(sgItems[sgIdx].id); }
    else if (e.key === 'Escape') hideSuggest();
  });
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); doSearch(sIn.value.trim()); });
  sgEl.addEventListener('mousedown', function (e) { e.preventDefault(); });
  sgEl.addEventListener('click', function (e) {
    var k = e.target.closest('[data-key]'); if (k) return doSearch(k.dataset.key);
    var it = e.target.closest('[data-sg]'); if (it) { hideSuggest(); sIn.blur(); return openQV(sgItems[+it.dataset.sg].id); }
    if (e.target.closest('[data-sgall]')) doSearch(sIn.value.trim());
  });
  sIn.addEventListener('blur', function () { setTimeout(hideSuggest, 120); });

  /* ---------- chọn đèn theo xe ---------- */
  var fitBrand = $('#fitBrand'), fitModel = $('#fitModel'), fitYear = $('#fitYear'), fitRes = $('#fitResult');
  fitBrand.innerHTML = '<option value="">Chọn hãng xe</option>' + D.CARS.map(function (b, k) { return '<option value="' + k + '">' + b.brand + '</option>'; }).join('');
  function fillModels() {
    var b = D.CARS[fitBrand.value];
    fitModel.innerHTML = '<option value="">Chọn dòng xe</option>' + (b ? b.models.map(function (m, k) { return '<option value="' + k + '">' + m.m + '</option>'; }).join('') : '');
    fitModel.disabled = !b; fillYears();
  }
  function fillYears() {
    var b = D.CARS[fitBrand.value], m = b && b.models[fitModel.value];
    fitYear.innerHTML = '<option value="">Chọn đời xe</option>' + (m ? m.y.map(function (y, k) { return '<option value="' + k + '">' + y + '</option>'; }).join('') : '');
    fitYear.disabled = !m;
    if (m) fitYear.value = String(m.y.length - 1);
  }
  function fitItem(p) {
    return '<button type="button" class="fit-item" data-qv="' + p.id + '"><img src="' + p.img + '" width="52" height="52" alt="" loading="lazy" decoding="async"><span><em>' + esc(p.name) + '</em><b>' + fmt(p.price) + '</b></span></button>';
  }
  function fitDefault() {
    var list = D.PRODUCTS.filter(function (p) { return p.cars.length === 4; }).sort(function (a, b) { return b.sold - a.sold; }).slice(0, 4);
    fitRes.innerHTML = '<div class="fit-car"><b>Lắp được cho mọi dòng xe</b><small class="muted">Chọn xe để lọc chính xác hơn</small></div>' +
      '<div class="fit-list">' + list.map(fitItem).join('') + '</div>' +
      '<p class="fit-note"><svg class="ic"><use href="#i-tool"/></svg>Kỹ thuật viên kiểm tra giắc, chóa đèn và nguồn điện miễn phí trước khi lắp.</p>';
  }
  fitDefault();
  fitBrand.addEventListener('change', fillModels);
  fitModel.addEventListener('change', fillYears);
  $('#fitPopular').innerHTML = D.POPULAR_CARS.map(function (pc) { return '<button type="button" data-pb="' + pc[0] + '" data-pm="' + pc[1] + '">' + pc[0] + ' ' + pc[1] + '</button>'; }).join('');
  $('#fitPopular').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pb]'); if (!b) return;
    var bi = -1, mi = -1;
    D.CARS.forEach(function (c, k) { if (c.brand === b.dataset.pb) { bi = k; c.models.forEach(function (m, j) { if (m.m === b.dataset.pm) mi = j; }); } });
    fitBrand.value = String(bi); fillModels(); fitModel.value = String(mi); fillYears();
    $$('#fitPopular button').forEach(function (x) { x.classList.toggle('on', x === b); });
    runFit();
  });
  function runFit() {
    var b = D.CARS[fitBrand.value], m = b && b.models[fitModel.value];
    if (!m) { toast('Vui lòng chọn hãng và dòng xe'); (b ? fitModel : fitBrand).focus(); return; }
    var y = m.y[fitYear.value] || m.y[m.y.length - 1];
    state.fit = { type: m.t, label: b.brand + ' ' + m.m + ' ' + y };
    var list = filtered({ cat: '', type: '', price: '', q: '', sort: 'hot', fit: state.fit });
    fitRes.innerHTML = '<div class="fit-car"><b>' + esc(state.fit.label) + '</b><span><svg class="ic"><use href="#i-check"/></svg>' + list.length + ' sản phẩm lắp vừa · ' + typeById[m.t].name + '</span></div>' +
      '<div class="fit-list">' + list.slice(0, 4).map(fitItem).join('') + '</div>' +
      '<a class="btn btn-primary btn-block" href="#san-pham" data-fit-all>Xem tất cả ' + list.length + ' sản phẩm cho xe này</a>';
    state.cat = ''; state.limit = 15; syncFilters(); renderGrid();
  }
  $('#fitForm').addEventListener('submit', function (e) { e.preventDefault(); $$('#fitPopular button').forEach(function (x) { x.classList.remove('on'); }); runFit(); });

  /* ---------- cart ---------- */
  var CART_KEY = 'lumen_cart_v2';
  var cart = (store.get(CART_KEY, []) || []).filter(function (i) { return i && byId[i.id] && i.qty > 0; });
  function saveCart() { store.set(CART_KEY, cart); }
  function cartCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (s, i) { return s + i.qty * byId[i.id].price; }, 0); }
  function renderCart() {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = n > 99 ? '99+' : n; b.classList.toggle('zero', n === 0); });
    $$('[data-cart-sum]').forEach(function (b) { b.textContent = n + ' sản phẩm'; });
    $('#cartQty').textContent = n ? '(' + n + ')' : '';
    $('#cartList').innerHTML = cart.map(function (i) {
      var p = byId[i.id];
      return '<li class="ci" data-id="' + p.id + '"><img src="' + p.img + '" width="72" height="72" alt="" loading="lazy" decoding="async">' +
        '<div><p class="ci-name">' + esc(p.name) + '</p><p class="ci-price">' + fmt(p.price) + ' <s class="muted small" style="font-weight:400">' + fmt(p.old) + '</s></p>' +
        '<div class="ci-row"><div class="qty"><button type="button" data-dec aria-label="Giảm số lượng"><svg class="ic"><use href="#i-minus"/></svg></button><span>' + i.qty + '</span><button type="button" data-inc aria-label="Tăng số lượng"><svg class="ic"><use href="#i-plus"/></svg></button></div>' +
        '<button type="button" class="ci-del" data-del aria-label="Xoá ' + esc(p.name) + '"><svg class="ic"><use href="#i-trash"/></svg></button></div></div></li>';
    }).join('');
    $('#cartEmpty').hidden = n > 0;
    $('#cartSubtotal').textContent = fmt(cartTotal());
    var inCheckout = !$('#checkout').hidden || !$('#orderOk').hidden;
    $('#cartFoot').hidden = n === 0 || inCheckout;
  }
  function bump() { $$('[data-cart-count]').forEach(function (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); }
  function addToCart(id, qty, silent) {
    qty = qty || 1;
    var it = cart.filter(function (i) { return i.id === id; })[0];
    if (it) it.qty = Math.min(99, it.qty + qty); else cart.push({ id: id, qty: qty });
    saveCart(); renderCart(); bump();
    if (!silent) toast('Đã thêm “' + byId[id].name + '” vào giỏ hàng');
  }
  function openCart() { showCartView(); openLayer('cart'); }
  function showCartView() { $('#cartView').hidden = false; $('#checkout').hidden = true; $('#orderOk').hidden = true; renderCart(); }
  $$('[data-cart-target]').forEach(function (b) { b.addEventListener('click', openCart); });
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
    $('#checkout [name=name]').focus();
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
    if (addr.length < 5) { msgs.push('Vui lòng nhập địa chỉ hoặc chi nhánh nhận lắp.'); bad.push('address'); }
    if (!showErr(f, msgs, bad)) return;
    var code = 'LM' + String(Math.floor(100000 + Math.random() * 899999));
    var total = cartTotal(), n = cartCount();
    $('#orderOk').innerHTML = '<span class="ok-ic"><svg class="ic"><use href="#i-check"/></svg></span><h4>Đặt hàng thành công</h4>' +
      '<p>Cảm ơn <b>' + esc(name) + '</b>. Mã đơn <b>' + code + '</b> · ' + n + ' sản phẩm · tổng <b style="color:var(--red)">' + fmt(total) + '</b>.<br>Lumen sẽ gọi số <b>' + esc(prettyPhone(phone)) + '</b> để hẹn lịch lắp.</p>' +
      '<p class="small muted">Đơn hàng demo – không có giao dịch thật.</p><button type="button" class="btn btn-outline btn-sm" id="okClose">Tiếp tục mua sắm</button>';
    cart = []; saveCart(); f.reset();
    $('#checkout').hidden = true; $('#orderOk').hidden = false; renderCart();
    $('#okClose').addEventListener('click', function () { closeLayer(); });
  });

  /* ---------- add / quick view delegation ---------- */
  doc.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      addToCart(add.dataset.add, 1);
      add.classList.add('added');
      var u = $('use', add); if (u && add.classList.contains('pc-add')) u.setAttribute('href', '#i-check');
      setTimeout(function () { add.classList.remove('added'); if (u && add.classList.contains('pc-add')) u.setAttribute('href', '#i-cart'); }, 1300);
      return;
    }
    var qv = e.target.closest('[data-qv]');
    if (qv) openQV(qv.dataset.qv, qv);
    var fa = e.target.closest('[data-fit-all]');
    if (fa) { /* handled by anchor handler; filter already applied */ }
  });

  var qvEl = $('#qv'), qvBody = $('#qvBody'), qvLast = null, qvQty = 1;
  function openQV(id, from) {
    var p = byId[id]; if (!p) return;
    qvLast = from || null; qvQty = 1; var qvSel = p.id;
    var monthly = Math.round(p.price / 12 / 1000) * 1000;
    qvBody.innerHTML = '<div class="qv-media">' + pImg(p, 720, '(max-width: 900px) 100vw, 430px', true) + '<span class="pc-off">-' + off(p) + '%</span></div>' +
      '<div class="qv-info"><p class="qv-brand">Thương hiệu: <b>' + esc(p.brand) + '</b> · ' + catById[p.cat].full + '</p><h3 id="qvTitle">' + esc(p.name) + '</h3>' +
      '<div class="qv-rt"><span class="stars sm" style="--r:' + (p.rating / 5 * 100).toFixed(0) + '%"></span><span>' + dec1(p.rating) + ' · ' + p.reviews + ' đánh giá</span><span>· Đã lắp ' + group(p.sold) + ' xe</span></div>' +
      '<div class="qv-price"><b>' + fmt(p.price) + '</b><s>' + fmt(p.old) + '</s><em>-' + off(p) + '%</em><span class="small muted" style="width:100%">Giá đã gồm công lắp tại chi nhánh và VAT</span></div>' +
      '<div class="qv-promo"><h4><svg class="ic"><use href="#i-gift"/></svg>Khuyến mãi</h4><ol><li>' + esc(p.gift) + '</li><li>Giảm thêm 5% công lắp khi đặt lịch online</li>' + (p.inst ? '<li>Trả góp 0% – chỉ từ ' + fmt(monthly) + '/tháng (12 tháng)</li>' : '<li>Thanh toán chuyển khoản, quét mã QR</li>') + '</ol></div>' +
      '<ul class="qv-specs">' + p.specs.map(function (s) { return '<li><svg class="ic"><use href="#i-check"/></svg>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<p class="qv-cars">Phù hợp: ' + p.cars.map(function (c) { return '<span>' + typeById[c].name + '</span>'; }).join('') + '</p>' +
      (p.opts ? '<div class="qv-opts" role="radiogroup" aria-label="Tuỳ chọn">' + p.opts.map(function (o, k) {
        var v = byId[o.id];
        return '<button type="button" role="radio" aria-checked="' + (k === 0) + '" data-opt="' + o.id + '"><b>' + o.label + '</b><span>' + fmt(v.price) + (o.add ? ' (+' + fmt(o.add) + ')' : '') + '</span></button>';
      }).join('') + '</div>' : '') +
      '<div class="qv-buy"><div class="qty"><button type="button" data-qdec aria-label="Giảm"><svg class="ic"><use href="#i-minus"/></svg></button><span id="qvQty">1</span><button type="button" data-qinc aria-label="Tăng"><svg class="ic"><use href="#i-plus"/></svg></button></div>' +
      '<button type="button" class="btn btn-outline" id="qvAdd"><svg class="ic"><use href="#i-cart"/></svg>Thêm vào giỏ</button>' +
      '<button type="button" class="btn btn-buy" id="qvBuy">MUA NGAY<small>Lắp trong ngày tại chi nhánh hoặc tận nơi</small></button></div>' +
      '<p class="qv-note">Cần tư vấn? Gọi <a class="link" href="tel:0900000368">0900 000 368</a> (8:00 – 21:00)</p></div>';
    qvEl.hidden = false; root.style.overflow = 'hidden';
    $('.modal-x', qvEl).focus({ preventScroll: true });
    $('[data-qinc]', qvBody).onclick = function () { qvQty = Math.min(99, qvQty + 1); $('#qvQty').textContent = qvQty; };
    $('[data-qdec]', qvBody).onclick = function () { qvQty = Math.max(1, qvQty - 1); $('#qvQty').textContent = qvQty; };
    $$('[data-opt]', qvBody).forEach(function (b) {
      b.onclick = function () {
        qvSel = b.dataset.opt; var v = byId[qvSel];
        $$('[data-opt]', qvBody).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
        $('.qv-price b', qvBody).textContent = fmt(v.price); $('.qv-price s', qvBody).textContent = fmt(v.old); $('.qv-price em', qvBody).textContent = '-' + off(v) + '%';
      };
    });
    $('#qvAdd').onclick = function () { addToCart(qvSel, qvQty); closeQV(); };
    $('#qvBuy').onclick = function () { addToCart(qvSel, qvQty, true); closeQV(); openCart(); };
  }
  function closeQV() {
    if (qvEl.hidden) return;
    qvEl.hidden = true;
    if (!layer || layer === 'drop') root.style.overflow = '';
    if (qvLast && qvLast.focus && doc.contains(qvLast)) qvLast.focus({ preventScroll: true });
  }
  qvEl.addEventListener('click', function (e) { if (e.target.closest('[data-close-qv]')) closeQV(); });

  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!qvEl.hidden) closeQV(); else if (layer) closeLayer();
  });

  /* ---------- compare (before / after) ---------- */
  var maxLm = 6500, maxRange = 600;
  $('#specBody').innerHTML = D.SPEC.map(function (r) {
    return '<tr' + (r.best ? ' class="best"' : '') + '><td><b>' + r.name + (r.best ? '<span class="tag">Khuyên dùng</span>' : '') + '</b><small>' + r.note + '</small></td>' +
      '<td>' + group(r.lm) + ' lm<span class="mbar"><i style="--v:' + (r.lm / maxLm * 100).toFixed(0) + '%"></i></span></td>' +
      '<td>≈ ' + group(r.range) + ' m<span class="mbar"><i style="--v:' + Math.max(6, Math.sqrt(r.range / maxRange) * 100).toFixed(0) + '%"></i></span></td>' +
      '<td>' + r.war + ' tháng</td></tr>';
  }).join('');
  var ba = $('#ba'), baH = $('#baHandle'), baPos = 50, baDrag = false, baRect = null, baIntro = 0;
  function setBA(p) {
    baPos = Math.max(0, Math.min(100, p));
    ba.style.setProperty('--p', baPos + '%');
    baH.setAttribute('aria-valuenow', Math.round(baPos));
  }
  ba.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cancelAnimationFrame(baIntro); baDrag = true; baRect = ba.getBoundingClientRect();
    try { ba.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    ba.classList.add('dragging'); setBA((e.clientX - baRect.left) / baRect.width * 100);
  });
  ba.addEventListener('pointermove', function (e) { if (baDrag) setBA((e.clientX - baRect.left) / baRect.width * 100); });
  function endDrag() { baDrag = false; ba.classList.remove('dragging'); }
  ba.addEventListener('pointerup', endDrag); ba.addEventListener('pointercancel', endDrag); ba.addEventListener('lostpointercapture', endDrag);
  baH.addEventListener('keydown', function (e) {
    var k = e.key, d = 0;
    if (k === 'ArrowLeft' || k === 'ArrowDown') d = -5; else if (k === 'ArrowRight' || k === 'ArrowUp') d = 5;
    else if (k === 'Home') { setBA(0); e.preventDefault(); return; } else if (k === 'End') { setBA(100); e.preventDefault(); return; }
    if (d) { cancelAnimationFrame(baIntro); setBA(baPos + d); e.preventDefault(); }
  });
  setBA(50);
  function baSweep() {
    if (reduce) return;
    var keys = [[0, 50], [900, 78], [2100, 24], [3000, 50]], t0 = performance.now();
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    (function f(now) {
      var t = now - t0;
      for (var k = 1; k < keys.length; k++) {
        if (t <= keys[k][0]) { var a = keys[k - 1], b = keys[k], u = ease((t - a[0]) / (b[0] - a[0])); setBA(a[1] + (b[1] - a[1]) * u); baIntro = requestAnimationFrame(f); return; }
      }
      setBA(50);
    })(t0);
  }
  var scenesEl = $('#baScenes');
  scenesEl.innerHTML = D.SCENES.map(function (s, k) {
    return '<button type="button" role="tab" aria-selected="' + (k === 0) + '" data-scene="' + k + '"><img src="' + img(s.id, 120, 80) + '" width="56" height="36" alt="" loading="lazy" decoding="async">' + s.n + '</button>';
  }).join('');
  scenesEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-scene]'); if (!b) return;
    var s = D.SCENES[+b.dataset.scene], src = img(s.id, 1100, 620);
    $$('button', scenesEl).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    $('#baImgA').src = src; $('#baImgB').src = src; $('#baImgA').alt = 'Cảnh ' + s.n + ' với đèn Bi-LED (mô phỏng)';
    cancelAnimationFrame(baIntro); baSweep();
  });

  /* ---------- ambient configurator ---------- */
  var ambImg = $('#ambImg'), ambPhoto = $('#ambPhoto'), ambName = $('#ambName'), swEl = $('#swatches'), bright = $('#ambBright');
  var amb = { view: 0, sw: 2, hue: null, cycling: false, raf: 0, visible: false };
  function hexHue(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (!d) return 0;
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }
  function ambApply() {
    var v = D.AMB_VIEWS[amb.view], br = (+bright.value / 100), f;
    var sw = D.SWATCHES[amb.sw];
    if (!amb.cycling && sw && sw.white) {
      f = sw.c === '#ffffff' ? 'saturate(0) brightness(' + (br * 1.08).toFixed(2) + ')' : 'saturate(0) sepia(.45) brightness(' + (br * 1.05).toFixed(2) + ')';
    } else {
      var target = amb.cycling ? amb.hue : hexHue(sw.c);
      f = 'hue-rotate(' + Math.round((target - v.hue + 360) % 360) + 'deg) saturate(1.15) brightness(' + br.toFixed(2) + ')';
    }
    ambImg.style.filter = f;
  }
  $('#ambViews').innerHTML = D.AMB_VIEWS.map(function (v, k) { return '<button type="button" role="tab" aria-selected="' + (k === 0) + '" data-view="' + k + '">' + v.n + '</button>'; }).join('');
  $('#ambViews').addEventListener('click', function (e) {
    var b = e.target.closest('[data-view]'); if (!b) return;
    amb.view = +b.dataset.view;
    $$('#ambViews button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    ambImg.src = img(D.AMB_VIEWS[amb.view].id, 1000, 620);
    ambApply();
  });
  swEl.innerHTML = D.SWATCHES.map(function (s, k) {
    return '<button type="button" class="sw" role="radio" aria-checked="' + (k === amb.sw) + '" aria-label="' + s.n + '" title="' + s.n + '" style="--c:' + s.c + '" data-sw="' + k + '"></button>';
  }).join('');
  ambName.textContent = D.SWATCHES[amb.sw].n;
  function stopCycle() {
    if (!amb.cycling) return; amb.cycling = false; cancelAnimationFrame(amb.raf); ambPhoto.classList.remove('cycling');
    var b = $('#ambCycle'); b.setAttribute('aria-pressed', 'false'); $('use', b).setAttribute('href', '#i-play');
  }
  swEl.addEventListener('click', function (e) {
    var b = e.target.closest('.sw'); if (!b) return;
    stopCycle(); amb.sw = +b.dataset.sw;
    $$('.sw', swEl).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    ambName.textContent = D.SWATCHES[amb.sw].n; ambApply();
  });
  bright.addEventListener('input', ambApply);
  $('#ambCycle').addEventListener('click', function () {
    if (amb.cycling) { stopCycle(); ambApply(); return; }
    amb.cycling = true; amb.hue = hexHue(D.SWATCHES[amb.sw].white ? '#22c7e8' : D.SWATCHES[amb.sw].c);
    ambPhoto.classList.add('cycling');
    this.setAttribute('aria-pressed', 'true'); $('use', this).setAttribute('href', '#i-pause');
    $$('.sw', swEl).forEach(function (x) { x.setAttribute('aria-checked', 'false'); });
    ambName.textContent = 'Đổi màu liên tục';
    var last = performance.now();
    (function f(now) {
      if (!amb.cycling) return;
      if (amb.visible) { amb.hue = (amb.hue + (now - last) * 0.04) % 360; ambApply(); }
      last = now; amb.raf = requestAnimationFrame(f);
    })(last);
  });
  ambApply();

  /* ---------- gallery ---------- */
  $('#galTrack').innerHTML = D.GALLERY.map(function (g) {
    return '<figure class="g-item"><div class="g-img"><img src="' + img(g.id, 480, 360) + '" srcset="' + img(g.id, 360, 270) + ' 360w, ' + img(g.id, 480, 360) + ' 480w, ' + img(g.id, 640, 480) + ' 640w" sizes="(max-width: 900px) 70vw, 290px" width="480" height="360" alt="' + esc(g.car + ' – ' + g.d) + '" loading="lazy" decoding="async"></div>' +
      '<figcaption><b>' + g.car + '</b><span>' + g.d + '</span><small><svg class="ic"><use href="#i-pin"/></svg>' + g.at + ' · ' + g.date + '</small></figcaption></figure>';
  }).join('');
  $$('[data-hrow]').forEach(initRow);

  /* ---------- reviews ---------- */
  var totalRv = D.RATING_DIST.reduce(function (s, x) { return s + x[1]; }, 0);
  $('#rvTotal').textContent = group(totalRv) + ' đánh giá đã xác thực';
  $('#rvBars').innerHTML = D.RATING_DIST.map(function (x) {
    return '<li><span>' + x[0] + starIc() + '</span><span class="bar"><i style="--v:' + (x[1] / totalRv * 100).toFixed(1) + '%"></i></span><span>' + group(x[1]) + '</span></li>';
  }).join('');
  var rvShown = mqMobile.matches ? 2 : 4;
  function renderReviews() {
    $('#rvList').innerHTML = D.REVIEWS.slice(0, rvShown).map(function (r) {
      var p = byId[r.p], parts = r.n.split(' '), ini = parts[parts.length - 1].charAt(0);
      var prod = p ? '<button type="button" class="rv-prod" data-qv="' + p.id + '"><img src="' + p.img + '" width="34" height="34" alt="" loading="lazy" decoding="async"><span>' + esc(p.name) + '</span></button>'
        : '<a class="rv-prod" href="#dat-lich"><span class="rv-svc"><svg class="ic"><use href="#i-tool"/></svg></span><span>Dịch vụ: ' + esc(r.svc) + '</span></a>';
      return '<article class="rv"><div class="rv-who"><span class="av">' + ini + '</span><div><b>' + r.n + '</b><small><svg class="ic"><use href="#i-check"/></svg>Đã lắp tại Lumen</small></div></div>' +
        '<div class="rv-line"><span class="stars sm" style="--r:' + (r.r / 5 * 100) + '%" aria-label="' + r.r + ' sao"></span><span>' + r.d + '</span><span>· ' + r.car + ' · ' + r.city + '</span></div>' +
        '<p>' + esc(r.t) + '</p>' +
        prod + '</article>';
    }).join('') ;
    var more = $('#rvMore');
    more.innerHTML = rvShown < D.REVIEWS.length ? '<button type="button" class="btn btn-outline btn-sm">Xem thêm ' + (D.REVIEWS.length - rvShown) + ' đánh giá</button>' : '';
  }
  renderReviews();
  doc.addEventListener('click', function (e) { if (e.target.closest('#rvMore button')) { rvShown = D.REVIEWS.length; renderReviews(); } });

  /* ---------- warranty ---------- */
  var wForm = $('#wForm'), wRes = $('#wResult');
  wRes.innerHTML = '<ol class="w-steps"><li><b>1</b>Nhập số điện thoại dùng khi lắp đặt</li><li><b>2</b>Xem gói đèn, ngày lắp và hạn bảo hành</li><li><b>3</b>Mang xe tới bất kỳ chi nhánh nào để được bảo hành</li></ol>';
  wForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var ph = cleanPhone($('#wPhone').value);
    if (!PHONE_RE.test(ph)) { wRes.innerHTML = '<p class="w-msg"><b>Số điện thoại chưa đúng định dạng.</b><br>Nhập 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.</p>'; return; }
    var r = D.WARRANTY[ph];
    if (!r) { wRes.innerHTML = '<p class="w-msg"><b>Chưa tìm thấy dữ liệu bảo hành</b> cho số ' + prettyPhone(ph) + '.<br>Vui lòng gọi 0900 000 370 để được hỗ trợ.</p>'; return; }
    wRes.innerHTML = '<div class="w-card"><span class="w-status ' + (r.ok ? 'ok' : 'no') + '"><svg class="ic"><use href="#' + (r.ok ? 'i-check' : 'i-close') + '"/></svg>' + (r.ok ? 'Còn hiệu lực' : 'Đã hết hạn') + '</span>' +
      '<h3>' + esc(r.pack) + '</h3><dl class="w-dl"><dt>Khách hàng</dt><dd>' + r.name + '</dd><dt>Xe</dt><dd>' + r.car + '</dd><dt>Nơi lắp</dt><dd>' + r.at + '</dd><dt>Ngày lắp</dt><dd>' + r.date + '</dd><dt>Hết hạn</dt><dd>' + r.exp + '</dd></dl>' +
      '<div class="w-prog"><span class="small muted">Thời hạn còn lại: ' + r.pct + '%</span><span class="bar"><i style="--v:' + r.pct + '%"></i></span></div></div>';
  });
  $$('[data-wdemo]').forEach(function (b) {
    b.addEventListener('click', function () { $('#wPhone').value = prettyPhone(b.dataset.wdemo); wForm.requestSubmit ? wForm.requestSubmit() : wForm.dispatchEvent(new Event('submit', { cancelable: true })); });
  });

  /* ---------- booking ---------- */
  var bForm = $('#bookForm');
  (function () {
    var d = new Date(), iso = function (x) { return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
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
    var dd = date.split('-').reverse().join('/'), ok = $('[data-ok]', f);
    ok.innerHTML = '<span class="ok-ic"><svg class="ic"><use href="#i-check"/></svg></span><h4>Đặt lịch thành công</h4>' +
      '<p>Cảm ơn <b>' + esc(name) + '</b>. Lịch <b>' + esc(f.service.value) + '</b> tại <b>' + esc(f.branch.value) + '</b> vào <b>' + dd + ', ' + esc(f.slot.value) + '</b> đã được ghi nhận. Kỹ thuật viên sẽ gọi số ' + esc(prettyPhone(phone)) + ' để xác nhận.</p>' +
      '<p class="small muted">Biểu mẫu demo – thông tin không được gửi đi.</p><button type="button" class="btn btn-outline btn-sm" data-again>Đặt lịch khác</button>';
    ok.hidden = false;
    ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    $('[data-again]', ok).addEventListener('click', function () { ok.hidden = true; f.reset(); f.date.value = f.date.min; });
  });
  $$('input', bForm).concat($$('#checkout input')).forEach(function (i) {
    i.addEventListener('input', function () { var fl = i.closest('.field'); fl && fl.classList.remove('invalid'); });
  });

  /* ---------- news + branches ---------- */
  $('#news').innerHTML = D.NEWS.map(function (n) {
    return '<a class="nw" href="#tin-tuc"><div class="nw-img"><img src="' + img(n.img, 480, 270) + '" width="480" height="270" alt="" loading="lazy" decoding="async"></div><div class="nw-txt"><small>' + n.tag + '</small><h3>' + esc(n.t) + '</h3><time>' + n.d + '</time></div></a>';
  }).join('');
  $('#branches').innerHTML = D.BRANCHES.map(function (b) {
    return '<div class="br"><h3>' + b.n + '</h3><p><svg class="ic"><use href="#i-pin"/></svg><span>' + b.a + ' <span class="muted">(minh hoạ)</span></span></p>' +
      '<p><svg class="ic"><use href="#i-phone"/></svg><span>' + b.p + '</span></p><p><svg class="ic"><use href="#i-clock"/></svg><span>' + b.h + ' · cả Chủ nhật</span></p>' +
      '<p class="avail"><svg class="ic"><use href="#i-tool"/></svg><span>' + b.bay + ' khoang lắp · nhận xe trong ngày</span></p>' +
      '<div class="br-act"><a class="btn btn-outline btn-sm" href="tel:' + b.p.replace(/\s/g, '') + '">Gọi chi nhánh</a><a class="btn btn-primary btn-sm" href="#dat-lich" data-branch="' + b.n + '">Đặt lịch tại đây</a></div></div>';
  }).join('');

  /* ---------- newsletter ---------- */
  $('#nlForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#nlEmail').value.trim(), m = $('#nlMsg');
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    m.classList.toggle('err', !ok);
    m.textContent = ok ? 'Đã đăng ký nhận tin (demo – không gửi email thật).' : 'Email chưa đúng định dạng.';
    if (ok) this.reset();
  });

  /* ---------- bottom nav active state ---------- */
  (function () {
    var links = $$('.bnav a[href^="#"]'), secs = links.map(function (a) { return a.getAttribute('href') === '#top' ? null : $(a.getAttribute('href')); });
    function upd() {
      var y = window.scrollY + window.innerHeight * 0.35, act = 0;
      secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) act = k; });
      links.forEach(function (a, k) { a.classList.toggle('on', k === act); });
    }
    var t; window.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(upd, 80); }, { passive: true });
  })();

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('main > .block, main > .mid-banners, main > .two-col, main > section.container:not(.hero):not(.policy)');
  if ('IntersectionObserver' in window && !reduce) {
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) return; // already in first view: no hiding
      el.setAttribute('data-reveal', ''); io.observe(el);
    });
  }
  // spec bars + compare sweep + ambient visibility
  if ('IntersectionObserver' in window) {
    var once = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        if (x.target === ba) baSweep();
        else x.target.classList.add('in');
        once.unobserve(x.target);
      });
    }, { threshold: .45 });
    once.observe($('.spec-table')); once.observe(ba);
    new IntersectionObserver(function (en) { amb.visible = en[0].isIntersecting; }).observe($('#ambient'));
  } else { $('.spec-table').classList.add('in'); amb.visible = true; }

  /* ---------- initial render ---------- */
  syncFilters(); renderGrid(); renderCart();
})();
