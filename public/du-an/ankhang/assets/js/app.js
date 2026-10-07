/* AN KHANG AUTO – tương tác cửa hàng mẫu (vanilla JS, không cần build) */
(function () {
  'use strict';
  var AK = window.AK;
  if (!AK) return;
  var ic = AK.ic;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byId = {}, catName = {}, catByKey = {}, carName = {};
  AK.PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  AK.CATEGORIES.forEach(function (c) { catName[c.key] = c.name; catByKey[c.key] = c; });
  AK.CARS.forEach(function (c) { carName[c.key] = c.name; });

  function vnd(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }
  function pct(p, price) { return Math.round((p.old - (price || p.price)) / p.old * 100); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function kfmt(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'k' : String(n); }
  function store(key, val) {
    try {
      if (val === undefined) { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function stars(r) {
    var s = '', full = Math.round(r);
    for (var i = 0; i < 5; i++) s += '<i class="' + (i < full ? 'on' : '') + '">' + ic('star') + '</i>';
    return '<span class="stars" aria-label="' + String(r).replace('.', ',') + ' trên 5 sao">' + s + '</span>';
  }
  function pimg(p, w, extra) {
    return '<img src="' + AK.img(p) + '" alt="' + esc(p.name) + '" width="' + w + '" height="' + w + '"' + (extra === 'eager' ? '' : ' loading="lazy" decoding="async"') + '>';
  }
  var TAGS = { ship: 'Freeship', lap: 'Lắp tận nơi', m2: 'Mua 2 tặng 1', tg: 'Trả góp 0%' };
  function fits(p, car) { return !car || p.fits[0] === 'all' || p.fits.indexOf(car) > -1; }
  function matchQ(p, q) {
    if (!q) return true;
    var c = catByKey[p.cat];
    var hay = norm(p.name + ' ' + p.spec + ' ' + c.name + ' ' + c.sub.join(' '));
    return norm(q).split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  /* ---------- icons ---------- */
  function hydrate(root) { $$('i[data-ic]', root).forEach(function (el) { if (!el.firstChild) el.innerHTML = ic(el.getAttribute('data-ic')); }); }
  hydrate();
  $$('[data-stars]').forEach(function (el) { el.outerHTML = stars(+el.getAttribute('data-stars')); });
  var yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    toastEl.innerHTML = ic('check') + '<span>' + msg + '</span>';
    toastEl.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
  }

  /* ---------- state ---------- */
  var CAR_KEY = 'ankhang_car_v1';
  var state = { cat: null, car: store(CAR_KEY) || null, q: '', tab: 'for', limit: 10 };
  if (state.car && !carName[state.car]) state.car = null;

  /* ---------- scrolling (an toàn với <base href>) ---------- */
  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var href = a.getAttribute('href');
    e.preventDefault();
    var inLayer = a.closest('.drawer, .modal');
    if (inLayer) closeAll();
    var go = function () {
      if (href === '#top' || href === '#') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      else scrollToEl(document.getElementById(href.slice(1)));
    };
    setTimeout(go, inLayer ? 240 : 0);
  });

  /* ---------- categories everywhere ---------- */
  function catImg(c) { return AK.img(c.img); }
  $('[data-catmenu]').innerHTML = AK.CATEGORIES.map(function (c) {
    return '<li><a href="#goi-y" data-filter-cat="' + c.key + '" data-cat-hover="' + c.key + '"><img src="' + catImg(c, 56) + '" alt="" width="28" height="28">' + c.name + ic('right', 'ic--chev') + '</a></li>';
  }).join('');
  $('[data-cats]').innerHTML = AK.CATEGORIES.map(function (c) {
    return '<a class="cat" href="#goi-y" data-filter-cat="' + c.key + '"><span class="cat__img"><img src="' + catImg(c, 120) + '" alt="" width="120" height="120" loading="lazy" decoding="async"></span><b>' + c.name + '</b></a>';
  }).join('') + '<a class="cat cat--all" href="#goi-y" data-filter-cat=""><span class="cat__img">' + ic('grid') + '</span><b>Tất cả sản phẩm</b></a>';
  $('[data-mcats]').innerHTML = AK.CATEGORIES.map(function (c) {
    return '<a href="#goi-y" data-filter-cat="' + c.key + '" data-close><img src="' + catImg(c, 80) + '" alt="" width="40" height="40" loading="lazy">' + c.name + '</a>';
  }).join('');
  $('[data-footer-cats]').innerHTML = AK.CATEGORIES.slice(0, 7).map(function (c) {
    return '<li><a href="#goi-y" data-filter-cat="' + c.key + '">' + c.name + '</a></li>';
  }).join('');
  var pills = $('[data-pills]');
  pills.innerHTML = '<button type="button" class="pill is-active" data-pill="">Tất cả</button>' + AK.CATEGORIES.map(function (c) {
    return '<button type="button" class="pill" data-pill="' + c.key + '">' + c.name + '</button>';
  }).join('');

  // flyout của menu danh mục (desktop)
  var fly = $('[data-catfly]'), catAside = $('.catmenu'), flyT;
  if (canHover) {
    catAside.addEventListener('mouseover', function (e) {
      var a = e.target.closest('[data-cat-hover]'); if (!a) return;
      clearTimeout(flyT);
      var c = catByKey[a.getAttribute('data-cat-hover')];
      var top = AK.PRODUCTS.filter(function (p) { return p.cat === c.key; }).sort(function (x, y) { return y.sold - x.sold; }).slice(0, 3);
      fly.innerHTML = '<div class="fly__head"><b>' + c.name + '</b><a href="#goi-y" data-filter-cat="' + c.key + '">Xem tất cả ›</a></div>' +
        '<div class="fly__subs">' + c.sub.map(function (s) { return '<button type="button" data-search-term="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' +
        '<p class="fly__lbl">Bán chạy trong danh mục</p><div class="fly__items">' + top.map(function (p) {
          return '<a href="#goi-y" data-qv="' + p.id + '">' + pimg(p, 96) + '<span><em>' + esc(p.name) + '</em><b>' + vnd(p.price) + '</b></span></a>';
        }).join('') + '</div>';
      $$('[data-cat-hover]', catAside).forEach(function (x) { x.classList.toggle('is-hover', x === a); });
      fly.hidden = false;
    });
    catAside.addEventListener('mouseleave', function () {
      flyT = setTimeout(function () { fly.hidden = true; $$('[data-cat-hover]', catAside).forEach(function (x) { x.classList.remove('is-hover'); }); }, 120);
    });
  }

  /* ---------- xe của bạn ---------- */
  var myCar = $('[data-mycar]'), carSel = $('[data-car-select]'), chips = $('[data-car-chips]');
  myCar.innerHTML = '<option value="">Tất cả dòng xe</option>' + AK.CARS.map(function (c) { return '<option value="' + c.key + '">' + c.name + ' · ' + c.type + '</option>'; }).join('');
  carSel.innerHTML = AK.CARS.map(function (c) { return '<option value="' + c.name + '">' + c.name + '</option>'; }).join('') + '<option>Dòng xe khác</option>';
  chips.innerHTML = '<button type="button" role="radio" class="carchip" data-car=""><span class="carchip__ic">' + ic('car') + '</span><b>Tất cả xe</b><small>Mọi sản phẩm</small></button>' +
    AK.CARS.map(function (c) {
      var n = AK.PRODUCTS.filter(function (p) { return fits(p, c.key); }).length;
      return '<button type="button" role="radio" class="carchip" data-car="' + c.key + '"><span class="carchip__ic">' + ic('car') + '</span><b>' + c.name + '</b><small>' + c.type + ' · ' + n + ' món</small></button>';
    }).join('');
  function setCar(key, announce) {
    state.car = key || null;
    store(CAR_KEY, state.car);
    state.limit = 10;
    syncFilters(); renderGrid(true);
    if (announce) toast(state.car ? 'Đang hiện phụ kiện vừa xe <b>' + carName[state.car] + '</b>' : 'Đang hiện phụ kiện cho mọi dòng xe');
  }
  myCar.addEventListener('change', function () { setCar(myCar.value, true); });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-car]'); if (!b) return;
    setCar(b.getAttribute('data-car'), true);
    setTimeout(function () { scrollToEl($('#goi-y')); }, 250);
  });

  function syncFilters() {
    myCar.value = state.car || '';
    if (state.car) carSel.value = carName[state.car];
    $$('.carchip', chips).forEach(function (b) {
      var on = (b.getAttribute('data-car') || null) === state.car;
      b.classList.toggle('is-active', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    $$('.pill', pills).forEach(function (b) { b.classList.toggle('is-active', (b.getAttribute('data-pill') || null) === state.cat); });
    $$('.cat').forEach(function (b) { b.classList.toggle('is-active', (b.getAttribute('data-filter-cat') || null) === state.cat); });
  }

  /* ---------- lưới gợi ý hôm nay ---------- */
  var grid = $('[data-grid]'), note = $('[data-note]'), emptyEl = $('[data-empty]'), moreBtn = $('[data-more]');
  var searchInput = $('[data-search-input]');

  function filtered() {
    var list = AK.PRODUCTS.filter(function (p) {
      return (!state.cat || p.cat === state.cat) && fits(p, state.car) && matchQ(p, state.q);
    });
    var t = state.tab;
    list.sort(function (a, b) {
      if (t === 'hot') return b.sold - a.sold;
      if (t === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.added - a.added;
      if (t === 'deal') return pct(b) - pct(a);
      if (t === 'low') return a.price - b.price;
      return a.added - b.added;
    });
    return list;
  }
  function cardHTML(p, i) {
    var d = pct(p);
    var label = p.hot ? '<span class="card__lbl">Bán chạy</span>' : p.isNew ? '<span class="card__lbl card__lbl--new">Hàng mới</span>' : '';
    var fit = state.car && p.fits[0] !== 'all' ? '<span class="card__fit">' + ic('check') + 'Có bộ lắp cho ' + carName[state.car] + '</span>'
      : p.fits[0] !== 'all' ? '<span class="card__fit card__fit--muted">' + ic('car') + 'Bộ lắp riêng ' + p.fits.length + ' dòng xe</span>' : '';
    return '<article class="card" data-id="' + p.id + '" style="--i:' + (i % 10) + '">' +
      '<a class="card__img" href="#goi-y" data-qv="' + p.id + '">' + pimg(p, 240) + label + '</a>' +
      '<div class="card__body">' +
      '<h3 class="card__name"><a href="#goi-y" data-qv="' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<div class="card__tags">' + p.tags.slice(0, 2).map(function (t) { return '<span class="tag tag--' + t + '">' + TAGS[t] + '</span>'; }).join('') + '</div>' +
      '<div class="card__price"><b>' + vnd(p.price) + '</b><span class="off">-' + d + '%</span></div>' +
      '<s class="card__old">' + vnd(p.old) + '</s>' +
      '<div class="card__meta">' + ic('star') + '<span>' + String(p.rating).replace('.', ',') + '</span><span class="sep"></span><span>Đã bán ' + kfmt(p.sold) + '</span></div>' +
      fit +
      '</div>' +
      '<button class="card__add" type="button" data-add="' + p.id + '" aria-label="Thêm ' + esc(p.name) + ' vào giỏ">' + ic('cartplus') + '</button>' +
      '</article>';
  }
  function renderGrid(fresh) {
    var list = filtered(), shown = list.slice(0, state.limit);
    grid.innerHTML = shown.map(cardHTML).join('');
    grid.classList.toggle('is-fresh', !!fresh && !reduce);
    emptyEl.hidden = list.length > 0;
    moreBtn.parentNode.hidden = list.length <= state.limit;
    moreBtn.textContent = 'Xem thêm ' + Math.min(10, list.length - state.limit) + ' sản phẩm';
    var bits = [];
    if (state.q) bits.push('“<b>' + esc(state.q) + '</b>”');
    if (state.cat) bits.push('<b>' + catName[state.cat] + '</b>');
    if (state.car) bits.push('vừa xe <b>' + carName[state.car] + '</b>');
    note.innerHTML = bits.length
      ? '<span><b>' + list.length + '</b> kết quả cho ' + bits.join(' · ') + '</span><button type="button" class="linkbtn" data-clear>' + ic('close') + 'Xoá bộ lọc</button>'
      : '';
    note.hidden = !bits.length;
  }
  moreBtn.addEventListener('click', function () {
    var before = $$('.card', grid).length;
    state.limit += 10;
    renderGrid(false);
    $$('.card', grid).slice(before).forEach(function (c, i) { c.classList.add('card--in'); c.style.setProperty('--i', i); });
  });
  var tabs = $('[data-tabs]');
  function setTab(t) {
    state.tab = t; state.limit = 10;
    $$('[data-tab]', tabs).forEach(function (b) { var on = b.getAttribute('data-tab') === t; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    renderGrid(true);
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) setTab(b.getAttribute('data-tab')); });
  pills.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pill]'); if (!b) return;
    state.cat = b.getAttribute('data-pill') || null; state.limit = 10;
    syncFilters(); renderGrid(true);
  });
  function clearFilters() {
    state.cat = null; state.q = ''; state.limit = 10;
    searchInput.value = '';
    if (state.car) { state.car = null; store(CAR_KEY, null); }
    syncFilters(); renderGrid(true);
  }

  /* ---------- click chung ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var add = t.closest('[data-add]');
    if (add) { e.preventDefault(); addToCart(add.getAttribute('data-add'), 1, add); return; }
    var qv = t.closest('[data-qv]');
    if (qv) { e.preventDefault(); e.stopPropagation(); openQuick(qv.getAttribute('data-qv')); return; }
    if (t.closest('[data-clear]')) { clearFilters(); return; }
    var st = t.closest('[data-search-term]');
    if (st) { runSearch(st.getAttribute('data-search-term')); return; }
    var tj = t.closest('[data-tab-jump]');
    if (tj) { state.cat = null; syncFilters(); setTab(tj.getAttribute('data-tab-jump')); }
    var fc = t.closest('[data-filter-cat]');
    if (fc) {
      state.cat = fc.getAttribute('data-filter-cat') || null; state.q = ''; searchInput.value = ''; state.limit = 10;
      if (fly) fly.hidden = true;
      syncFilters(); renderGrid(true);
    }
  });

  /* ---------- tìm kiếm ---------- */
  var sForm = $('[data-search-form]'), sug = $('[data-suggest]'), hl = -1;
  var RECENT_KEY = 'ankhang_recent_v1';
  $('[data-hotkeys]').innerHTML = AK.HOT_KEYWORDS.slice(0, 6).map(function (k) { return '<button type="button" data-search-term="' + esc(k) + '">' + esc(k) + '</button>'; }).join('');
  function hideSuggest() { sug.hidden = true; hl = -1; sForm.classList.remove('is-open'); }
  function mark(name, q) {
    var safe = esc(name);
    if (!q) return safe;
    var words = norm(q).split(/\s+/).filter(Boolean);
    // tô đậm từ khớp theo vị trí trên chuỗi đã bỏ dấu (độ dài giữ nguyên với tiếng Việt dựng sẵn)
    var plain = name.normalize('NFC'), base = norm(plain), marks = new Array(plain.length).fill(false);
    if (base.length !== plain.length) return safe;
    words.forEach(function (w) { var i = base.indexOf(w); while (i > -1) { for (var k = i; k < i + w.length; k++) marks[k] = true; i = base.indexOf(w, i + w.length); } });
    var out = '', open = false;
    for (var i = 0; i < plain.length; i++) {
      if (marks[i] && !open) { out += '<b>'; open = true; }
      if (!marks[i] && open) { out += '</b>'; open = false; }
      out += esc(plain[i]);
    }
    return out + (open ? '</b>' : '');
  }
  function showSuggest() {
    var raw = searchInput.value.trim();
    if (!raw) {
      var recent = store(RECENT_KEY) || [];
      sug.innerHTML = (recent.length ? '<p class="sug__lbl">Tìm kiếm gần đây</p><div class="sug__recent">' + recent.map(function (k) { return '<button type="button" data-search-term="' + esc(k) + '">' + ic('clock') + esc(k) + '</button>'; }).join('') + '</div>' : '') +
        '<p class="sug__lbl">Tìm kiếm phổ biến</p><div class="sug__chips">' + AK.HOT_KEYWORDS.map(function (k) { return '<button type="button" data-search-term="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div>';
    } else {
      var res = AK.PRODUCTS.filter(function (p) { return matchQ(p, raw); }).sort(function (a, b) { return b.sold - a.sold; }).slice(0, 6);
      var cats = AK.CATEGORIES.filter(function (c) { return norm(c.name + ' ' + c.sub.join(' ')).indexOf(norm(raw)) > -1; }).slice(0, 2);
      sug.innerHTML = '<button type="button" class="sug__go" data-search-term="' + esc(raw) + '">' + ic('search') + 'Tìm “<b>' + esc(raw) + '</b>” trong cửa hàng</button>' +
        cats.map(function (c) { return '<a class="sug__cat" href="#goi-y" data-filter-cat="' + c.key + '">' + ic('grid') + 'Danh mục <b>' + c.name + '</b></a>'; }).join('') +
        (res.length ? res.map(function (p) {
          return '<a class="sug__item" href="#goi-y" data-sug="' + p.id + '">' + pimg(p, 80) + '<span><em>' + mark(p.name, raw) + '</em><b>' + vnd(p.price) + '</b></span></a>';
        }).join('') : '<p class="sug__none">Chưa có sản phẩm khớp “' + esc(raw) + '”. Thử “bơm”, “camera”, “pin”…</p>');
    }
    sug.hidden = false; hl = -1; sForm.classList.add('is-open');
  }
  function runSearch(term) {
    term = String(term || '').trim();
    hideSuggest();
    searchInput.value = term;
    state.q = term; state.cat = null; state.limit = 10;
    if (term) {
      var recent = (store(RECENT_KEY) || []).filter(function (k) { return norm(k) !== norm(term); });
      recent.unshift(term); store(RECENT_KEY, recent.slice(0, 5));
    }
    syncFilters(); renderGrid(true);
    searchInput.blur();
    closeAll();
    scrollToEl($('#goi-y'));
  }
  var sugT;
  searchInput.addEventListener('input', function () { clearTimeout(sugT); sugT = setTimeout(showSuggest, 100); });
  searchInput.addEventListener('focus', showSuggest);
  searchInput.addEventListener('keydown', function (e) {
    var items = $$('a, button', sug);
    if (sug.hidden || !items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.classList.toggle('is-hl', i === hl); });
    } else if (e.key === 'Enter' && hl > -1) { e.preventDefault(); items[hl].click(); }
  });
  sug.addEventListener('mousedown', function (e) { e.preventDefault(); });
  sug.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sug]'); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    hideSuggest(); searchInput.blur();
    openQuick(a.getAttribute('data-sug'));
  });
  document.addEventListener('click', function (e) { if (!sForm.contains(e.target)) hideSuggest(); });
  sForm.addEventListener('submit', function (e) { e.preventDefault(); runSearch(searchInput.value); });

  /* ---------- banner chính ---------- */
  (function hero() {
    var root = $('[data-slider-hero]'), track = $('[data-hero-track]'); if (!root) return;
    var slides = $$('.banner', track), n = slides.length, cur = 0, timer = null, hover = false, busy = false;
    var clone = slides[0].cloneNode(true); clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('tabindex', '-1');
    var cImg = $('img', clone); cImg.removeAttribute('fetchpriority'); cImg.setAttribute('loading', 'lazy');
    track.appendChild(clone);
    var dotsWrap = $('[data-hero-dots]');
    dotsWrap.innerHTML = slides.map(function (s, i) { return '<button type="button" aria-label="Banner ' + (i + 1) + '"></button>'; }).join('');
    var dots = $$('button', dotsWrap);
    function paint(i, animate) {
      track.style.transition = animate && !reduce ? '' : 'none';
      track.style.transform = 'translate3d(' + (-i * 100) + '%,0,0)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i % n); d.setAttribute('aria-current', k === i % n); });
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k !== i % n); s.tabIndex = k === i % n ? 0 : -1; });
    }
    function go(i) {
      if (busy) return;
      if (i < 0) { paint(n, false); void track.offsetWidth; i = n - 1; }
      cur = i; paint(cur, true);
      if (cur === n) {
        busy = true;
        setTimeout(function () { cur = 0; paint(0, false); busy = false; }, reduce ? 0 : 560);
      }
      restart();
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { if (!hover && !document.hidden) go(cur + 1); }, 5000); }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    $('[data-hero-prev]').addEventListener('click', function () { go(cur - 1); });
    $('[data-hero-next]').addEventListener('click', function () { go(cur + 1); });
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; });
    var sx = 0, sy = 0, down = false, moved = false;
    root.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sy = e.clientY; });
    root.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { moved = true; go(dx < 0 ? cur + 1 : cur - 1); }
    });
    root.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    root.addEventListener('dragstart', function (e) { e.preventDefault(); });
    paint(0, false); restart();
  })();

  /* ---------- voucher ---------- */
  var VC_KEY = 'ankhang_vc_v1';
  var savedVc = store(VC_KEY) || [];
  var vcByCode = {}; AK.VOUCHERS.forEach(function (v) { vcByCode[v.code] = v; });
  savedVc = savedVc.filter(function (c) { return vcByCode[c]; });
  var vcWrap = $('[data-vouchers]');
  function renderVouchers() {
    vcWrap.innerHTML = AK.VOUCHERS.map(function (v) {
      var on = savedVc.indexOf(v.code) > -1;
      return '<div class="vc' + (v.kind === 'ship' ? ' vc--ship' : '') + '">' +
        '<div class="vc__l">' + ic(v.kind === 'ship' ? 'truck' : 'ticket') + '<span>' + (v.kind === 'ship' ? 'FREESHIP' : 'AN KHANG') + '</span></div>' +
        '<div class="vc__r"><b>' + v.title + '</b><span>' + v.cond + '</span><small>' + v.code + ' · HSD ' + v.exp + '</small></div>' +
        '<button type="button" class="vc__btn' + (on ? ' is-saved' : '') + '" data-vc="' + v.code + '">' + (on ? 'Đã lưu' : 'Lưu') + '</button></div>';
    }).join('');
  }
  function saveVoucher(code, silent) {
    if (savedVc.indexOf(code) > -1) return false;
    savedVc.push(code); store(VC_KEY, savedVc);
    renderVouchers(); renderCart();
    if (!silent) toast('Đã lưu mã <b>' + code + '</b> – tự áp dụng khi đủ điều kiện');
    return true;
  }
  vcWrap.addEventListener('click', function (e) {
    var b = e.target.closest('[data-vc]'); if (!b) return;
    var code = b.getAttribute('data-vc');
    if (!saveVoucher(code)) { toast('Mã <b>' + code + '</b> đã có trong ví voucher'); }
  });
  renderVouchers();

  /* ---------- flash sale ---------- */
  var flashPrice = {};
  AK.FLASH.forEach(function (f) { flashPrice[f.id] = f.price; });
  $('[data-flash]').innerHTML = AK.FLASH.map(function (f) {
    var p = byId[f.id], r = f.sold / f.total, d = pct(p, f.price);
    var txt = r >= 0.8 ? 'Sắp cháy hàng' : 'Đã bán ' + f.sold;
    return '<article class="fcard" data-id="' + p.id + '">' +
      '<a class="fcard__img" href="#flash-sale" data-qv="' + p.id + '">' + pimg(p, 200) + '<span class="fcard__off">-' + d + '%</span></a>' +
      '<p class="fcard__name">' + esc(p.name) + '</p>' +
      '<div class="fcard__price"><b>' + vnd(f.price) + '</b><s>' + vnd(p.old) + '</s></div>' +
      '<div class="fbar' + (r >= 0.8 ? ' fbar--hot' : '') + '"><em style="--w:' + r.toFixed(3) + '"></em><span>' + (r >= 0.8 ? ic('fire') : '') + txt + '</span></div>' +
      '<button class="fcard__buy" type="button" data-add="' + p.id + '" data-flash>Mua ngay</button></article>';
  }).join('');
  var cdH = $('[data-h]'), cdM = $('[data-m]'), cdS = $('[data-s]'), slotsEl = $('[data-slots]');
  var pad = function (x) { return (x < 10 ? '0' : '') + x; };
  function slotEnd() {
    var d = new Date(), h = d.getHours();
    var start = h - (h % 3), end = new Date(d); end.setHours(start + 3, 0, 0, 0);
    var html = '<button type="button" class="is-on" aria-current="true"><b>' + pad(start) + ':00</b><span>Đang diễn ra</span></button>';
    for (var k = 1; k <= 2; k++) { var hh = start + k * 3; html += '<button type="button" data-slot-h="' + (hh % 24) + '"><b>' + pad(hh % 24) + ':00</b><span>' + (hh >= 24 ? 'Ngày mai' : 'Sắp diễn ra') + '</span></button>'; }
    slotsEl.innerHTML = html;
    return end.getTime();
  }
  slotsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-slot-h]'); if (!b) return;
    toast('Khung ' + pad(+b.getAttribute('data-slot-h')) + ':00 mở bán sau – nhớ quay lại nhé');
  });
  var endAt = slotEnd(), prevS = {};
  function tick() {
    var ms = endAt - Date.now();
    if (ms <= 0) { endAt = slotEnd(); ms = endAt - Date.now(); }
    var s = Math.floor(ms / 1000);
    var v = { h: pad(Math.floor(s / 3600)), m: pad(Math.floor(s / 60) % 60), s: pad(s % 60) };
    [['h', cdH], ['m', cdM], ['s', cdS]].forEach(function (x) {
      if (prevS[x[0]] !== v[x[0]]) {
        x[1].textContent = v[x[0]];
        if (prevS[x[0]] !== undefined && !reduce) { x[1].classList.remove('tick'); void x[1].offsetWidth; x[1].classList.add('tick'); }
        prevS[x[0]] = v[x[0]];
      }
    });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- hàng cuộn ngang có mũi tên ---------- */
  $$('[data-hs-prev], [data-hs-next]').forEach(function (b) {
    var row = b.parentNode.querySelector('.hrow');
    var dir = b.hasAttribute('data-hs-next') ? 1 : -1;
    b.addEventListener('click', function () { row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' }); });
    var sync = function () {
      var max = row.scrollWidth - row.clientWidth - 2;
      b.hidden = dir < 0 ? row.scrollLeft <= 2 : row.scrollLeft >= max;
    };
    row.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    setTimeout(sync, 50);
  });

  /* ---------- combo mua 2 tặng 1 ---------- */
  var pool = $('[data-combo-pool]'), picks = [];
  pool.innerHTML = AK.COMBO_POOL.map(function (id) {
    var p = byId[id];
    return '<button type="button" class="pick" data-pick="' + id + '" aria-pressed="false">' + pimg(p, 120) + '<span class="pick__name">' + esc(p.name) + '</span><b>' + vnd(p.price) + '</b><span class="pick__tick">' + ic('check') + '</span></button>';
  }).join('');
  var slotEls = [$('[data-slot="0"]'), $('[data-slot="1"]')], giftSlot = $('[data-slot-gift]');
  var comboTotal = $('[data-combo-total]'), comboSave = $('[data-combo-save]'), comboAdd = $('[data-combo-add]');
  function renderCombo() {
    $$('.pick', pool).forEach(function (b) {
      var on = picks.indexOf(b.getAttribute('data-pick')) > -1;
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
    });
    slotEls.forEach(function (s, i) {
      var p = byId[picks[i]];
      s.classList.toggle('is-filled', !!p);
      s.innerHTML = p ? pimg(p, 64) : '<span>Món ' + (i + 1) + '</span>';
      s.title = p ? p.name : '';
    });
    var g = byId[AK.COMBO_GIFT], full = picks.length === 2;
    giftSlot.classList.toggle('is-filled', full);
    giftSlot.innerHTML = full ? pimg(g, 64) + '<em>Quà</em>' : ic('gift');
    var sum = picks.reduce(function (a, id) { return a + byId[id].price; }, 0);
    comboTotal.textContent = vnd(sum);
    comboSave.className = full ? 'ok' : '';
    comboSave.textContent = full ? '+ quà ' + vnd(g.price) + ' miễn phí' : picks.length ? 'Chọn thêm 1 món' : 'Chọn 2 món bất kỳ';
    comboAdd.disabled = !full;
  }
  pool.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]'); if (!b) return;
    var id = b.getAttribute('data-pick'), i = picks.indexOf(id);
    if (i > -1) picks.splice(i, 1); else { if (picks.length === 2) picks.shift(); picks.push(id); }
    renderCombo();
  });
  comboAdd.addEventListener('click', function () {
    if (picks.length !== 2) return;
    var src = $('.pick.is-on img', pool);
    picks.forEach(function (id) { addItem(id, 1); });
    addItem('gift:' + AK.COMBO_GIFT, 1);
    saveCart(); renderCart();
    flyTo(src);
    toast('Đã thêm combo và quà tặng tinh dầu vào giỏ');
    picks = []; renderCombo();
  });
  renderCombo();

  /* ---------- giỏ hàng ---------- */
  var CART_KEY = 'ankhang_cart_v2';
  var cart = store(CART_KEY);
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter(function (it) { return it && byId[String(it.id).replace('gift:', '')] && it.qty > 0; });
  var vcPick = null; // mã người dùng chọn tay ('' = không dùng)
  var cartPanel = $('.cart'), list = $('[data-cart-list]'), vcSel = $('[data-cart-voucher]');
  function unitPrice(it) {
    if (it.id.indexOf('gift:') === 0) return 0;
    return it.flash ? flashPrice[it.id] || byId[it.id].price : byId[it.id].price;
  }
  function addItem(id, qty, flash) {
    var key = flash ? id + '#f' : id;
    var found = cart.filter(function (it) { return it.key === key; })[0];
    if (found) found.qty = Math.min(99, found.qty + qty);
    else cart.push({ key: key, id: id, qty: qty, flash: !!flash });
  }
  function saveCart() { store(CART_KEY, cart); }
  function clampGift() {
    var paid = cart.reduce(function (a, it) { return a + (AK.COMBO_POOL.indexOf(it.id) > -1 ? it.qty : 0); }, 0);
    var allowed = Math.floor(paid / 2);
    cart.forEach(function (it) { if (it.id.indexOf('gift:') === 0) it.qty = Math.min(it.qty, allowed); });
    cart = cart.filter(function (it) { return it.qty > 0; });
  }
  function vcValue(v, sub, catSub, fee) {
    var base = v.cat ? catSub[v.cat] || 0 : sub;
    if (!sub || base < v.min || (v.cat && !base)) return -1;
    if (v.ship) return Math.min(v.ship, fee);
    if (v.pct) return Math.min(v.max, Math.round(base * v.pct / 100));
    return Math.min(v.off, sub);
  }
  function totals() {
    var sub = 0, old = 0, count = 0, catSub = {};
    cart.forEach(function (it) {
      var p = byId[it.id.replace('gift:', '')], u = unitPrice(it);
      sub += u * it.qty; old += p.old * it.qty; count += it.qty;
      if (u) catSub[p.cat] = (catSub[p.cat] || 0) + u * it.qty;
    });
    var fee = sub === 0 || sub >= 499000 ? 0 : 30000;
    var opts = savedVc.map(function (c) { var v = vcByCode[c]; return { v: v, val: vcValue(v, sub, catSub, fee) }; });
    var best = opts.filter(function (o) { return o.val > 0; }).sort(function (a, b) { return b.val - a.val; })[0];
    var chosen = null;
    if (vcPick === '') chosen = null;
    else if (vcPick) chosen = opts.filter(function (o) { return o.v.code === vcPick && o.val > 0; })[0] || best;
    else chosen = best;
    var disc = chosen ? chosen.val : 0;
    return { sub: sub, old: old, count: count, fee: fee, opts: opts, chosen: chosen, disc: disc, grand: Math.max(0, sub + fee - disc) };
  }
  function renderCart() {
    clampGift();
    var t = totals();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = t.count > 99 ? '99+' : t.count; b.classList.toggle('is-zero', !t.count); });
    $('[data-cart-count-text]').textContent = '(' + t.count + ')';
    $('[data-subtotal]').textContent = vnd(t.sub);
    $('[data-discount]').textContent = t.disc ? '-' + vnd(t.disc) : '0₫';
    $('[data-shipfee]').textContent = t.fee ? vnd(t.fee) : 'Miễn phí';
    $('[data-grand]').textContent = vnd(t.grand);
    var saving = t.old - t.sub + t.disc;
    $('[data-saving]').innerHTML = saving > 0 ? 'Bạn tiết kiệm được <b>' + vnd(saving) + '</b> so với giá gốc' : '';
    cartPanel.classList.toggle('is-empty', cart.length === 0);
    var FREE = 499000, left = Math.max(0, FREE - t.sub);
    $('[data-ship-text]').innerHTML = left > 0 ? 'Mua thêm <b>' + vnd(left) + '</b> để được <b>miễn phí vận chuyển</b>' : ic('truck') + 'Đơn hàng được <b>miễn phí vận chuyển</b>';
    $('[data-ship-bar]').style.setProperty('--p', Math.min(1, t.sub / FREE).toFixed(3));
    vcSel.innerHTML = '<option value="">' + (savedVc.length ? 'Không dùng mã' : 'Chưa lưu mã nào') + '</option>' + t.opts.map(function (o) {
      return '<option value="' + o.v.code + '"' + (o.val > 0 ? '' : ' disabled') + '>' + o.v.code + ' – ' + o.v.title + (o.val > 0 ? ' (-' + vnd(o.val) + ')' : ' · chưa đủ điều kiện') + '</option>';
    }).join('');
    vcSel.value = t.chosen ? t.chosen.v.code : '';
    list.innerHTML = cart.map(function (it) {
      var gift = it.id.indexOf('gift:') === 0, p = byId[it.id.replace('gift:', '')];
      return '<li class="citem" data-key="' + it.key + '"><div class="citem__img">' + pimg(p, 72) + '</div><div class="citem__main">' +
        '<div class="citem__name">' + esc(p.name) + '</div>' +
        (gift ? '<span class="citem__tag">Quà tặng combo</span>' : it.flash ? '<span class="citem__tag citem__tag--flash">' + ic('bolt') + 'Giá Flash Sale</span>' : '') +
        '<div class="citem__row"><span class="citem__price">' + (gift ? '0₫' : vnd(unitPrice(it))) + (gift ? '' : ' <s>' + vnd(p.old) + '</s>') + '</span>' +
        (gift ? '<span class="qty qty--ro">×' + it.qty + '</span>' :
          '<span class="qty"><button type="button" data-q="-1" aria-label="Giảm số lượng">' + ic('minus') + '</button><span>' + it.qty + '</span><button type="button" data-q="1" aria-label="Tăng số lượng">' + ic('plus') + '</button></span>') +
        '</div></div><button class="citem__del" type="button" data-del aria-label="Xoá ' + esc(p.name) + '">' + ic('trash') + '</button></li>';
    }).join('');
  }
  vcSel.addEventListener('change', function () { vcPick = vcSel.value; renderCart(); });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('[data-key]'); if (!li) return;
    var it = cart.filter(function (x) { return x.key === li.getAttribute('data-key'); })[0]; if (!it) return;
    var q = e.target.closest('[data-q]');
    if (q) it.qty = Math.max(1, Math.min(99, it.qty + Number(q.getAttribute('data-q'))));
    else if (e.target.closest('[data-del]')) cart.splice(cart.indexOf(it), 1);
    else return;
    saveCart(); renderCart();
  });
  function cartTarget() {
    var els = [$('[data-cart-target]'), $('[data-cart-target-m]')];
    for (var i = 0; i < els.length; i++) { var r = els[i] && els[i].getBoundingClientRect(); if (r && r.width > 0 && r.top >= 0 && r.top < window.innerHeight) return els[i]; }
    return null;
  }
  function bump() {
    $$('[data-cart-count]').forEach(function (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  }
  function flyTo(src) {
    var tgt = cartTarget();
    if (reduce || !src || !tgt || !src.animate) { bump(); return; }
    var a = src.getBoundingClientRect(), b = tgt.getBoundingClientRect();
    if (!a.width) { bump(); return; }
    var f = src.cloneNode(); f.className = 'flyimg'; f.removeAttribute('srcset'); f.removeAttribute('loading');
    var s = Math.min(a.width, 120);
    f.style.cssText = 'left:' + (a.left + a.width / 2 - s / 2) + 'px;top:' + (a.top + a.height / 2 - s / 2) + 'px;width:' + s + 'px;height:' + s + 'px';
    document.body.appendChild(f);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var anim = f.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 60) + 'px) scale(.6)', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.15)', opacity: 0.4 }
    ], { duration: 650, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = function () { f.remove(); bump(); };
  }
  function addToCart(id, qty, btn) {
    var p = byId[id]; if (!p) return;
    var flash = btn && btn.hasAttribute('data-flash');
    addItem(id, qty || 1, flash);
    saveCart(); renderCart();
    var card = btn && btn.closest('[data-id]');
    flyTo(card ? $('img', card) : null);
    if (btn && btn.classList.contains('card__add')) { btn.classList.add('is-added'); setTimeout(function () { btn.classList.remove('is-added'); }, 1200); }
    toast('Đã thêm <b>' + esc(p.name) + '</b> vào giỏ');
  }

  /* ---------- drawer & modal ---------- */
  var openStack = [], lastFocus = [];
  function openLayer(el) {
    if (!el || el.classList.contains('is-open')) return;
    lastFocus.push(document.activeElement);
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    openStack.push(el);
    var sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add('lock');
    if (sw > 0) document.body.style.paddingRight = sw + 'px';
    setTimeout(function () { var f = $('.icon-btn', el); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeLayer(el) {
    if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    openStack.splice(openStack.indexOf(el), 1);
    if (!openStack.length) { document.body.classList.remove('lock'); document.body.style.paddingRight = ''; }
    var lf = lastFocus.pop();
    if (lf && lf.focus) try { lf.focus({ preventScroll: true }); } catch (e) {}
    if (el === coModal) setTimeout(resetCheckout, 350);
  }
  function closeAll() { openStack.slice().reverse().forEach(closeLayer); }
  $$('.drawer, .modal').forEach(function (el) {
    el.addEventListener('click', function (e) { if (e.target.closest('[data-close]') && !e.target.closest('a[href^="#"]')) closeLayer(el); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openStack.length) closeLayer(openStack[openStack.length - 1]);
      else { hideSuggest(); accClose(); }
    }
    if (e.key === 'Tab' && openStack.length) {
      var layer = openStack[openStack.length - 1];
      var f = $$('button:not([disabled]), a[href], input, select, textarea', layer).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  var cartDrawer = $('[data-cart]'), menuDrawer = $('[data-menu]'), quick = $('[data-quick]'), coModal = $('[data-checkout-modal]'), lightbox = $('[data-lightbox]');
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { openLayer(cartDrawer); }); });
  $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { openLayer(menuDrawer); }); });

  /* ---------- xem nhanh sản phẩm ---------- */
  var qvMedia = $('[data-qv-media]'), qvBody = $('[data-qv-body]'), qvQty = 1;
  function openQuick(id) {
    var p = byId[id]; if (!p) return;
    qvQty = 1;
    var fp = flashPrice[id];
    qvMedia.innerHTML = '<img src="' + AK.img(p) + '" alt="' + esc(p.name) + '" width="520" height="520">';
    var fitTxt = p.fits[0] === 'all' ? 'Dùng chung cho mọi dòng xe' : 'Có bộ lắp riêng cho ' + p.fits.map(function (k) { return carName[k]; }).join(', ');
    var fitWarn = state.car && !fits(p, state.car) ? '<p class="qv__warn">Chưa có bộ lắp riêng cho xe ' + carName[state.car] + ' – gọi 0900 000 268 để được tư vấn.</p>' : '';
    qvBody.innerHTML = '<p class="qv__crumb">' + catName[p.cat] + '</p><h3 id="qv-title">' + esc(p.name) + '</h3>' +
      '<div class="qv__meta"><span class="qv__rate">' + String(p.rating).replace('.', ',') + stars(p.rating) + '</span><span>' + p.reviews + ' đánh giá</span><span>Đã bán ' + kfmt(p.sold) + '</span></div>' +
      '<div class="qv__price"><b>' + vnd(p.price) + '</b><s>' + vnd(p.old) + '</s><span class="off">-' + pct(p) + '%</span>' +
      (fp ? '<p class="qv__flash">' + ic('bolt') + 'Đang Flash Sale: <b>' + vnd(fp) + '</b> – thêm từ khung Flash Sale</p>' : '') + '</div>' +
      '<dl class="qv__info"><dt>Vận chuyển</dt><dd>' + ic('truck') + (p.price >= 499000 ? 'Miễn phí vận chuyển' : 'Phí 30.000₫, miễn phí đơn từ 499.000₫') + '</dd>' +
      '<dt>Lắp đặt</dt><dd>' + ic('wrench') + (p.tags.indexOf('lap') > -1 ? 'Lắp tận nơi miễn phí nội thành' : 'Tự lắp dễ dàng, có hướng dẫn') + '</dd>' +
      '<dt>Dòng xe</dt><dd>' + ic('car') + fitTxt + '</dd>' +
      '<dt>Bảo hành</dt><dd>' + ic('shield') + 'Đổi mới trong 7 ngày nếu lỗi</dd></dl>' + fitWarn +
      '<p class="qv__desc">' + esc(p.desc) + '</p>' +
      '<ul class="qv__list">' + p.bullets.map(function (b) { return '<li>' + ic('check') + esc(b) + '</li>'; }).join('') + '</ul>' +
      '<div class="qv__buy" data-id="' + p.id + '"><span class="qty"><button type="button" data-qvq="-1" aria-label="Giảm">' + ic('minus') + '</button><span data-qv-n>1</span><button type="button" data-qvq="1" aria-label="Tăng">' + ic('plus') + '</button></span>' +
      '<button class="btn btn--outline" type="button" data-qv-add>' + ic('cartplus') + 'Thêm vào giỏ</button><button class="btn btn--primary" type="button" data-qv-buy>Mua ngay</button></div>';
    openLayer(quick);
    $('.qv', quick).scrollTop = 0;
  }
  qvBody.addEventListener('click', function (e) {
    var q = e.target.closest('[data-qvq]');
    if (q) { qvQty = Math.max(1, Math.min(99, qvQty + Number(q.getAttribute('data-qvq')))); $('[data-qv-n]', qvBody).textContent = qvQty; return; }
    var add = e.target.closest('[data-qv-add], [data-qv-buy]');
    if (!add) return;
    var id = add.closest('[data-id]').getAttribute('data-id'), p = byId[id];
    addItem(id, qvQty); saveCart(); renderCart();
    if (add.hasAttribute('data-qv-buy')) {
      closeLayer(quick);
      setTimeout(function () { openLayer(cartDrawer); }, 200);
    } else {
      flyTo($('img', qvMedia));
      toast('Đã thêm ' + qvQty + ' × <b>' + esc(p.name) + '</b> vào giỏ');
      setTimeout(function () { closeLayer(quick); }, 300);
    }
  });

  /* ---------- kiểm tra form ---------- */
  var PHONE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return String(v || '').replace(/[\s.\-()]/g, '').replace(/^\+84/, '0'); }
  function setErr(input, msg) {
    var f = input.closest('.field');
    f.classList.toggle('is-error', !!msg);
    var e = $('.field-err', f); if (e) e.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function liveClear(form) { $$('input', form).forEach(function (i) { i.addEventListener('input', function () { var f = i.closest('.field'); if (f && f.classList.contains('is-error')) setErr(i); }); }); }

  /* ---------- đặt hàng ---------- */
  var coForm = $('[data-co-form]'), coOk = $('[data-co-ok]');
  $('[data-checkout]').addEventListener('click', function () {
    if (!cart.length) return;
    var t = totals();
    $('[data-co-summary]').innerHTML = '<div><span>' + t.count + ' sản phẩm</span><b>' + vnd(t.sub) + '</b></div>' +
      (t.disc ? '<div><span>Mã ' + t.chosen.v.code + '</span><b class="minus">-' + vnd(t.disc) + '</b></div>' : '') +
      '<div><span>Phí vận chuyển</span><b>' + (t.fee ? vnd(t.fee) : 'Miễn phí') + '</b></div>' +
      '<div class="tot"><span>Tổng thanh toán</span><b>' + vnd(t.grand) + '</b></div>';
    closeLayer(cartDrawer);
    setTimeout(function () { openLayer(coModal); }, 220);
  });
  function resetCheckout() { coForm.hidden = false; coOk.hidden = true; coForm.reset(); $$('.field', coForm).forEach(function (f) { f.classList.remove('is-error'); }); $$('.field-err', coForm).forEach(function (e) { e.textContent = ''; }); }
  coForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var el = coForm.elements, ok = true;
    if (el.name.value.trim().length < 2) { setErr(el.name, 'Vui lòng nhập họ tên'); ok = false; } else setErr(el.name);
    if (!PHONE.test(cleanPhone(el.phone.value))) { setErr(el.phone, 'Số điện thoại chưa đúng (VD: 0912 345 678)'); ok = false; } else setErr(el.phone);
    if (el.address.value.trim().length < 6) { setErr(el.address, 'Vui lòng nhập địa chỉ nhận hàng'); ok = false; } else setErr(el.address);
    if (!ok) { var bad = $('.is-error input', coForm); if (bad) bad.focus(); return; }
    var t = totals();
    var code = 'AK' + String(Date.now()).slice(-6);
    $('[data-co-ok-text]').innerHTML = 'Cảm ơn <b>' + esc(el.name.value.trim()) + '</b>! Mã đơn <b>' + code + '</b> – tổng <b>' + vnd(t.grand) + '</b> (' + (el.pay.value === 'bank' ? 'chuyển khoản QR' : 'thanh toán khi nhận hàng') + ').' +
      (el.install.checked ? ' Kỹ thuật viên sẽ lắp đặt khi giao.' : '') + ' Tư vấn viên sẽ gọi số <b>' + esc(cleanPhone(el.phone.value)) + '</b> để xác nhận.<br><small>Cửa hàng mẫu – không có đơn hàng thật được gửi đi.</small>';
    store('ankhang_last_order_v1', { code: code, total: t.grand, count: t.count, at: Date.now() });
    coForm.hidden = true; coOk.hidden = false;
    if (t.chosen && t.chosen.v.code) { savedVc = savedVc.filter(function (c) { return c !== t.chosen.v.code; }); store(VC_KEY, savedVc); renderVouchers(); }
    cart = []; vcPick = null; saveCart(); renderCart();
    $('.co__ok .btn').focus();
  });
  liveClear(coForm);

  /* ---------- đặt lịch lắp đặt ---------- */
  var booking = $('[data-booking]'), dateIn = $('#b-date');
  (function () { var d = new Date(); d.setDate(d.getDate() + 1); var iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); dateIn.min = iso; dateIn.value = iso; })();
  booking.addEventListener('submit', function (e) {
    e.preventDefault();
    var el = booking.elements, ok = true;
    if (el.name.value.trim().length < 2) { setErr(el.name, 'Vui lòng nhập họ tên'); ok = false; } else setErr(el.name);
    if (!PHONE.test(cleanPhone(el.phone.value))) { setErr(el.phone, 'Số điện thoại chưa đúng (VD: 0912 345 678)'); ok = false; } else setErr(el.phone);
    var okBox = $('[data-booking-ok]');
    if (!ok) { okBox.hidden = true; return; }
    okBox.hidden = false;
    $('p', okBox).textContent = el.service.value + ' cho xe ' + el.car.value + ', ngày ' + el.date.value.split('-').reverse().join('/') + ' (' + el.slot.value + '). Kỹ thuật viên sẽ gọi xác nhận. Đây là cửa hàng mẫu nên yêu cầu không được gửi đi thật.';
  });
  liveClear(booking);

  /* ---------- đăng ký nhận tin ---------- */
  var nForm = $('[data-news-form]');
  nForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('input', nForm), err = $('[data-news-err]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) { err.textContent = 'Email chưa hợp lệ, bạn kiểm tra lại giúp nhé.'; return; }
    err.textContent = ''; input.value = '';
    saveVoucher('ANKHANG50', true);
    toast('Đăng ký thành công – đã lưu mã <b>ANKHANG50</b> vào ví voucher');
  });

  /* ---------- đánh giá ---------- */
  var RV = [
    { n: 'Ngọc Anh', at: 'TP.HCM', r: 5, d: '03/10', p: 'p01', v: 'Kèm bộ đi dây âm · Vios 2022', lap: 1, imgs: [], t: 'Kỹ thuật lắp tận nhà, đi dây âm gọn không thấy sợi nào. Hình ban ngày rõ, ban đêm đọc được biển số xe trước ở khoảng cách gần.', h: 24, reply: 'An Khang cảm ơn chị Ngọc Anh. Camera được bảo hành 12 tháng, chị cần hỗ trợ cài đặt cứ nhắn shop nhé!' },
    { n: 'Đức Thịnh', at: 'Hà Nội', r: 5, d: '01/10', p: 'p03', v: 'Màu đen', lap: 0, imgs: [], t: 'Bơm nhỏ mà khoẻ, cài 2,3 bar là tự ngắt. Bơm luôn cả xe máy của vợ, pin còn dư. Để cốp rất gọn.', h: 18 },
    { n: 'Văn Hải', at: 'Bình Dương', r: 5, d: '29/09', p: 'p10', v: 'Màu xám', lap: 0, imgs: [], t: 'Hút sạch cát dưới thảm và khe ghế, cốc bụi trong nên biết lúc nào cần đổ. Pin đủ dọn hết xe 7 chỗ.', h: 15 },
    { n: 'Trí Dũng', at: 'Đồng Nai', r: 4, d: '27/09', p: 'p06', v: 'Kèm giá bắt · Xpander', lap: 1, imgs: [], t: 'Giá bắt dưới ghế phụ chắc chắn, đi đường xấu không rung. Trừ 1 sao vì phải hẹn lại một lần do kỹ thuật kẹt xe.', h: 9, reply: 'Shop xin lỗi anh Dũng vì lịch hẹn bị dời. An Khang đã gửi mã FREESHIP cho đơn sau của anh ạ.' },
    { n: 'Mai Phương', at: 'Đà Nẵng', r: 5, d: '25/09', p: 'p16', v: 'Màu hồng', lap: 0, imgs: [], t: 'Gối mềm, đỡ cổ tốt, chồng mình ngủ ngon cả chặng Đà Nẵng – Huế. Vỏ tháo ra giặt được nên rất thích.', h: 31 },
    { n: 'Thanh Trúc', at: 'Cần Thơ', r: 4, d: '22/09', p: 'p09', v: 'Bộ 3 mùi', lap: 0, imgs: [], t: 'Mùi sả chanh dễ chịu, cả nhà không ai say xe. Lọ hơi nhỏ, mình nhỏ vào sáp thơm dùng được khoảng 3 tuần.', h: 6, reply: 'Cảm ơn chị Trúc! Chị nhỏ 3–4 giọt mỗi lần là đủ thơm, dùng sẽ được lâu hơn ạ.' },
    { n: 'Hoàng Long', at: 'Hải Phòng', r: 5, d: '20/09', p: 'p08', v: 'Màu đỏ', lap: 0, imgs: [], t: 'Mua cho cả 2 xe trong nhà. Đế gắn cạnh ghế lái chắc, với tay là tới. Mong không bao giờ phải dùng.', h: 12 },
    { n: 'Anh Phúc', at: 'Long An', r: 5, d: '18/09', p: 'p13', v: 'Combo tẩu sạc + búa thoát hiểm', lap: 0, imgs: [], t: 'Mua combo được tặng thêm bộ tinh dầu. Tẩu sạc nhỏ, cắm sát ổ, sạc nhanh hai điện thoại cùng lúc.', h: 20 }
  ];
  var rlist = $('[data-rlist]'), rmore = $('[data-rmore]'), rAll = false, rf = 'all', helped = store('ankhang_helpful_v1') || [];
  function renderReviews() {
    var rows = RV.map(function (r, i) { r.i = i; return r; }).filter(function (r) {
      return rf === 'all' || (rf === 'reply' ? !!r.reply : rf === 'lap' ? r.lap : r.r === +rf);
    });
    rmore.parentNode.hidden = rAll || rows.length <= 4;
    if (!rAll) rows = rows.slice(0, 4);
    rlist.innerHTML = rows.map(function (r) {
      var p = byId[r.p], on = helped.indexOf(r.i) > -1;
      return '<article class="rv"><div class="rv__ava" aria-hidden="true">' + r.n.charAt(0) + '</div><div class="rv__main">' +
        '<div class="rv__top"><b>' + esc(r.n) + '</b><span class="rv__at">' + r.at + '</span></div>' +
        '<div class="rv__line">' + stars(r.r) + '<span>' + r.d + '/2026</span><span class="rv__var">Phân loại: ' + esc(r.v) + '</span></div>' +
        '<p>' + esc(r.t) + '</p>' +
        (r.imgs.length ? '<div class="rv__imgs">' + r.imgs.map(function (id) { return '<button type="button" data-lb="' + id + '" aria-label="Xem ảnh khách gửi"><img src="' + AK.P(id, 160, 160) + '" alt="Ảnh khách gửi" width="80" height="80" loading="lazy" decoding="async"></button>'; }).join('') + '</div>' : '') +
        '<a class="rv__prod" href="#danh-gia" data-qv="' + p.id + '">' + pimg(p, 40) + '<span>' + esc(p.name) + '</span></a>' +
        '<div class="rv__foot">' + (r.lap ? '<span class="rv__lap">' + ic('wrench') + 'Đã lắp tận nơi</span>' : '<span class="rv__lap rv__lap--buy">' + ic('check') + 'Đã mua hàng</span>') +
        '<button type="button" class="rv__help' + (on ? ' is-on' : '') + '" data-help="' + r.i + '">' + ic('thumb') + 'Hữu ích (' + (r.h + (on ? 1 : 0)) + ')</button></div>' +
        (r.reply ? '<div class="rv__reply"><b>Phản hồi của An Khang Auto</b><p>' + esc(r.reply) + '</p></div>' : '') +
        '</div></article>';
    }).join('') || '<p class="rv__none">Chưa có đánh giá phù hợp bộ lọc.</p>';
  }
  $('[data-rfilter]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rf]'); if (!b) return;
    rf = b.getAttribute('data-rf');
    $$('[data-rf]').forEach(function (x) { x.classList.toggle('is-active', x === b); });
    rmore.addEventListener('click', function () { rAll = true; renderReviews(); });
  renderReviews();
  });
  rlist.addEventListener('click', function (e) {
    var h = e.target.closest('[data-help]');
    if (h) { var i = +h.getAttribute('data-help'), k = helped.indexOf(i); if (k > -1) helped.splice(k, 1); else helped.push(i); store('ankhang_helpful_v1', helped); renderReviews(); return; }
    var lb = e.target.closest('[data-lb]');
    if (lb) { var im = $('[data-lb-img]'); im.src = AK.P(lb.getAttribute('data-lb'), 900, 900); im.alt = 'Ảnh khách hàng gửi'; openLayer(lightbox); }
  });
  rmore.addEventListener('click', function () { rAll = true; renderReviews(); });
  renderReviews();

  /* ---------- nguồn ảnh sản phẩm ---------- */
  var credEl = $('[data-credits]');
  if (credEl) credEl.innerHTML = AK.CREDITS.map(function (c) {
    return '<li><b>' + esc(byId[c.id].name) + '</b>: ảnh của ' + esc(c.by) + ', ' + esc(c.lic) + ' (<a href="' + c.url + '" target="_blank" rel="noopener">' + esc(c.src) + '</a>). Đã làm trắng nền, căn khung vuông.</li>';
  }).join('');

  /* ---------- tài khoản ---------- */
  var accBtn = $('[data-acc-btn]'), accPop = $('[data-acc-pop]');
  function accClose() { accPop.hidden = true; accBtn.setAttribute('aria-expanded', 'false'); }
  accBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!accPop.hidden) { accClose(); return; }
    $('[data-acc-vouchers]').textContent = savedVc.length;
    $('[data-acc-car]').textContent = state.car ? carName[state.car] : 'Chưa chọn';
    var lo = store('ankhang_last_order_v1');
    $('[data-acc-last]').innerHTML = lo ? 'Đơn gần nhất: <b>' + esc(lo.code) + '</b> · ' + vnd(lo.total) : 'Chưa có đơn hàng nào.';
    accPop.hidden = false; accBtn.setAttribute('aria-expanded', 'true');
  });
  document.addEventListener('click', function (e) { if (!accPop.hidden && !accPop.contains(e.target)) accClose(); });

  /* ---------- header & nút lên đầu ---------- */
  var header = $('.header'), totop = $('[data-totop]'), ticking = false;
  function setHH() { document.documentElement.style.setProperty('--hh', header.offsetHeight + 'px'); }
  setHH(); window.addEventListener('resize', setHH);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHH);
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      totop.classList.toggle('is-show', y > 900);
      ticking = false;
    });
  }, { passive: true });

  /* ---------- hiện dần khi cuộn ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.block, .feed').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add('reveal'); io.observe(el); }
    });
  }

  /* ---------- khởi tạo ---------- */
  syncFilters();
  renderGrid(false);
  renderCart();
})();
