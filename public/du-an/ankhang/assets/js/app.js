/* AN KHANG AUTO – tương tác cửa hàng mẫu */
(function () {
  'use strict';
  var AK = window.AK;
  if (!AK) return;
  var ic = AK.ic, art = AK.art;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate = hasGsap && hasST && !reduce;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byId = {};
  AK.PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  var catName = {};
  AK.CATEGORIES.forEach(function (c) { catName[c.key] = c.name; });
  var carName = {};
  AK.CARS.forEach(function (c) { carName[c.key] = c.name; });

  function vnd(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }
  function pct(p) { return Math.round((p.old - p.price) / p.old * 100); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
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
    for (var i = 0; i < 5; i++) s += i < full ? ic('star') : ic('star').replace('currentColor', '#d8dee8');
    return '<span class="stars" aria-label="' + String(r).replace('.', ',') + ' trên 5 sao">' + s + '</span>';
  }
  function media(p, w, eager) {
    if (p.img) {
      return '<img src="' + AK.U(p.img, w, w) + '" alt="' + esc(p.name) + '" width="' + w + '" height="' + w + '"' + (eager ? '' : ' loading="lazy" decoding="async"') + '>';
    }
    return art(p.art[0], p.art[1]);
  }
  function fitText(p) {
    if (p.fits[0] === 'all') return 'Vừa mọi dòng xe';
    return 'Vừa: ' + p.fits.slice(0, 3).map(function (k) { return carName[k]; }).join(', ') + (p.fits.length > 3 ? ' +' + (p.fits.length - 3) : '');
  }

  /* ---------- icons & arts ---------- */
  function hydrateIcons(root) {
    $$('i[data-ic]', root).forEach(function (el) { if (!el.firstChild) el.innerHTML = ic(el.getAttribute('data-ic')); });
  }
  hydrateIcons();
  $$('[data-art]').forEach(function (el) {
    var k = el.getAttribute('data-art');
    el.innerHTML = k === 'mat' ? art('mat', { base: '#1b2130', base2: '#5a2a18', stitch: '#ff6a13' }) : art(k);
  });
  $$('.stars--lg').forEach(function (el) { el.innerHTML = stars(5).replace('class="stars"', 'class="stars stars--lg"'); });
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
  var state = { cat: null, car: null, q: '', tab: 'hot', limit: 8 };

  /* ---------- categories ---------- */
  var catsRow = $('[data-cats]');
  catsRow.innerHTML = AK.CATEGORIES.map(function (c) {
    return '<a class="cat" href="#san-pham" data-filter-cat="' + c.key + '"><span class="cat__ic">' + AK.catIcon(c.key) + '</span><span>' + c.name + '</span></a>';
  }).join('');
  $('[data-catmenu]').innerHTML = AK.CATEGORIES.map(function (c) {
    return '<a href="#san-pham" data-filter-cat="' + c.key + '">' + AK.catIcon(c.key) + c.name + '</a>';
  }).join('');
  $('[data-mmenu-cats]').innerHTML = AK.CATEGORIES.map(function (c) {
    return '<button type="button" data-filter-cat="' + c.key + '" data-goto="#san-pham">' + AK.catIcon(c.key) + '<span>' + c.name + '</span></button>';
  }).join('');
  $('[data-footer-cats]').innerHTML = AK.CATEGORIES.slice(0, 6).map(function (c) {
    return '<li><a href="#san-pham" data-filter-cat="' + c.key + '">' + c.name + '</a></li>';
  }).join('');
  var pills = $('[data-cat-pills]');
  pills.innerHTML = '<button type="button" class="pill is-active" data-pill="">Tất cả</button>' + AK.CATEGORIES.map(function (c) {
    return '<button type="button" class="pill" data-pill="' + c.key + '">' + c.name + '</button>';
  }).join('');

  // dropdown "Danh mục"
  var catBtn = $('[data-catmenu-btn]'), catMenu = $('[data-catmenu]');
  function setCatMenu(open) {
    catMenu.hidden = !open;
    catBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && animate) gsap.fromTo(catMenu.children, { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.025, duration: 0.3, ease: 'power2.out' });
  }
  catBtn.addEventListener('click', function (e) { e.stopPropagation(); setCatMenu(catMenu.hidden); });
  document.addEventListener('click', function (e) { if (!catMenu.hidden && !catMenu.contains(e.target)) setCatMenu(false); });

  /* ---------- car chips ---------- */
  var chips = $('[data-car-chips]');
  chips.innerHTML = '<button type="button" role="radio" aria-checked="true" class="carchip is-active" data-car=""><b>Tất cả xe</b><small>Xem mọi phụ kiện</small>' + ic('car') + '</button>' +
    AK.CARS.map(function (c) {
      return '<button type="button" role="radio" aria-checked="false" class="carchip" data-car="' + c.key + '"><b>' + c.name + '</b><small>' + c.type + '</small>' + ic('car') + '</button>';
    }).join('');
  var carSel = $('[data-car-select]');
  carSel.innerHTML = AK.CARS.map(function (c) { return '<option>' + c.name + '</option>'; }).join('') + '<option>Dòng xe khác</option>';

  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-car]'); if (!b) return;
    state.car = b.getAttribute('data-car') || null;
    state.limit = 8;
    syncChips();
    renderGrid(true);
    if (animate) gsap.fromTo(b, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    if (state.car) {
      toast('Đang lọc phụ kiện vừa xe <b>' + carName[state.car] + '</b>');
      setTimeout(function () { scrollToEl($('#san-pham')); }, 350);
    }
  });
  function syncChips() {
    $$('.carchip', chips).forEach(function (b) {
      var on = (b.getAttribute('data-car') || null) === state.car;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    $$('.pill', pills).forEach(function (b) { b.classList.toggle('is-active', (b.getAttribute('data-pill') || null) === state.cat); });
    $$('.cat', catsRow).forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-filter-cat') === state.cat); });
  }

  /* ---------- product grid ---------- */
  var grid = $('[data-grid]'), note = $('[data-result-note]'), emptyEl = $('[data-empty]'), moreBtn = $('[data-more]');
  var gridRevealed = !animate;
  var wish = store('ankhang_wish_v1') || [];

  function filtered() {
    var q = norm(state.q).trim();
    var list = AK.PRODUCTS.filter(function (p) {
      if (state.cat && p.cat !== state.cat) return false;
      if (state.car && p.fits[0] !== 'all' && p.fits.indexOf(state.car) < 0) return false;
      if (q) {
        var hay = norm(p.name + ' ' + p.spec + ' ' + catName[p.cat]);
        return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
      }
      return true;
    });
    if (state.tab === 'hot') list.sort(function (a, b) { return b.sold - a.sold; });
    else if (state.tab === 'new') list.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || (b.id > a.id ? 1 : -1); });
    else list.sort(function (a, b) { return pct(b) - pct(a); });
    return list;
  }
  function cardHTML(p) {
    var d = pct(p);
    var w = wish.indexOf(p.id) > -1;
    return '<article class="card" data-card data-id="' + p.id + '">' +
      '<div class="card__media tone-' + p.tone + '" data-quick-open>' + media(p, 480) +
      '<div class="badges"><span class="bdg">-' + d + '%</span>' + (p.isNew ? '<span class="bdg bdg--new">Mới</span>' : '') + (p.hot ? '<span class="bdg bdg--hot">' + ic('fire') + 'Bán chạy</span>' : '') + '</div></div>' +
      '<div class="card__acts"><button class="card__act" type="button" data-quick-open aria-label="Xem nhanh ' + esc(p.name) + '">' + ic('eye') + '</button>' +
      '<button class="card__act' + (w ? ' is-on' : '') + '" type="button" data-wish aria-pressed="' + w + '" aria-label="Yêu thích">' + ic('heart') + '</button></div>' +
      '<div class="card__body"><span class="card__fit">' + ic('car') + fitText(p) + '</span>' +
      '<h3 class="card__name" data-quick-open>' + esc(p.name) + '</h3>' +
      '<p class="card__spec">' + esc(p.spec) + '</p>' +
      '<div class="card__meta">' + stars(p.rating) + '<span>(' + p.reviews + ')</span><span class="sold-txt">· Đã bán ' + kfmt(p.sold) + '</span></div>' +
      '<div class="card__price"><b>' + vnd(p.price) + '</b><s>' + vnd(p.old) + '</s></div>' +
      '<button class="card__add" type="button" data-add="' + p.id + '">' + ic('cart') + '<span>Thêm vào giỏ</span></button></div></article>';
  }
  function renderGrid(animateIn) {
    var list = filtered();
    var shown = list.slice(0, state.limit);
    grid.innerHTML = shown.map(cardHTML).join('');
    emptyEl.hidden = list.length > 0;
    moreBtn.parentNode.hidden = list.length <= state.limit;
    var bits = [];
    if (state.car) bits.push('xe <b>' + carName[state.car] + '</b>');
    if (state.cat) bits.push('<b>' + catName[state.cat] + '</b>');
    if (state.q) bits.push('từ khoá “<b>' + esc(state.q) + '</b>”');
    note.innerHTML = bits.length
      ? 'Tìm thấy <b>' + list.length + '</b> sản phẩm cho ' + bits.join(' · ') + ' — <button type="button" class="pill pill--clear" data-clear-filters>' + ic('close') + 'Xoá lọc</button>'
      : 'Hiển thị <b>' + shown.length + '</b> / ' + list.length + ' sản phẩm phụ kiện chính hãng';
    if (animate) {
      var cards = $$('.card', grid);
      if (!gridRevealed) gsap.set(cards, { opacity: 0, y: 30 });
      else if (animateIn) gsap.fromTo(cards, { opacity: 0, y: 22, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out', clearProps: 'transform' });
    }
  }
  moreBtn.addEventListener('click', function () {
    var before = $$('.card', grid).length;
    state.limit += 8;
    renderGrid(false);
    var fresh = $$('.card', grid).slice(before);
    if (animate) gsap.fromTo(fresh, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', clearProps: 'transform' });
  });

  // tabs
  var tabs = $('[data-tabs]'), ink = $('.tabs__ink', tabs);
  function moveInk() {
    var a = $('.is-active', tabs);
    if (!a) return;
    ink.style.width = a.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]'); if (!b) return;
    $$('[data-tab]', tabs).forEach(function (t) { t.classList.toggle('is-active', t === b); t.setAttribute('aria-selected', t === b); });
    state.tab = b.getAttribute('data-tab');
    state.limit = 8;
    moveInk();
    renderGrid(true);
  });
  window.addEventListener('resize', moveInk);

  pills.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pill]'); if (!b) return;
    state.cat = b.getAttribute('data-pill') || null;
    state.limit = 8;
    syncChips(); renderGrid(true);
  });
  function clearFilters() {
    state.cat = null; state.car = null; state.q = ''; state.limit = 8;
    searchInput.value = '';
    syncChips(); renderGrid(true);
  }

  // card interactions (delegated, also used by flash + quick view)
  document.addEventListener('click', function (e) {
    var t = e.target;
    var add = t.closest('[data-add]');
    if (add) { e.preventDefault(); addToCart(add.getAttribute('data-add'), 1, add); return; }
    var q = t.closest('[data-quick-open]');
    if (q) { var c = q.closest('[data-id]'); if (c) { openQuick(c.getAttribute('data-id'), q); return; } }
    var w = t.closest('[data-wish]');
    if (w) {
      var id = w.closest('[data-id]').getAttribute('data-id');
      var i = wish.indexOf(id);
      if (i > -1) wish.splice(i, 1); else wish.push(id);
      store('ankhang_wish_v1', wish);
      w.classList.toggle('is-on', i < 0);
      w.setAttribute('aria-pressed', i < 0);
      if (animate) gsap.fromTo(w, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      toast(i < 0 ? 'Đã thêm vào danh sách yêu thích' : 'Đã bỏ khỏi danh sách yêu thích');
      return;
    }
    if (t.closest('[data-clear-filters]')) { clearFilters(); return; }
    var fc = t.closest('[data-filter-cat]');
    if (fc) {
      state.cat = fc.getAttribute('data-filter-cat');
      state.limit = 8;
      setCatMenu(false);
      syncChips(); renderGrid(true);
      if (fc.hasAttribute('data-goto')) { closeAll(); scrollToEl($(fc.getAttribute('data-goto'))); }
    }
  });

  /* ---------- smooth anchor scroll (an toàn với <base href>) ---------- */
  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var href = a.getAttribute('href');
    e.preventDefault();
    if (a.closest('.drawer') || a.closest('.modal')) closeAll();
    if (href === '#top' || href === '#') { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    var target = document.getElementById(href.slice(1));
    if (target) setTimeout(function () { scrollToEl(target); }, a.closest('.drawer') ? 260 : 0);
  });

  /* ---------- flash sale ---------- */
  var flashTrack = $('[data-slider="flash"]');
  flashTrack.innerHTML = AK.FLASH.map(function (f) {
    var p = byId[f.id], r = f.sold / f.total, d = Math.round((p.old - f.price) / p.old * 100);
    return '<article class="fcard" data-id="' + p.id + '" data-card>' +
      '<div class="fcard__img tone-' + p.tone + '" data-quick-open>' + media(p, 360) + '<div class="badges"><span class="bdg">-' + d + '%</span></div></div>' +
      '<h3 class="fcard__name" data-quick-open>' + esc(p.name) + '</h3>' +
      '<div class="fcard__price"><b>' + vnd(f.price) + '</b><s>' + vnd(p.old) + '</s></div>' +
      '<div class="bar"><em style="--w:' + r.toFixed(3) + '"></em><span>' + (r >= 0.8 ? ic('fire') : '') + 'Đã bán ' + f.sold + '/' + f.total + '</span></div>' +
      '<button class="fcard__add" type="button" data-add="' + p.id + '" data-flash-price="' + f.price + '">' + ic('cart') + 'Thêm vào giỏ</button></article>';
  }).join('');
  var flashPrice = {};
  AK.FLASH.forEach(function (f) { flashPrice[f.id] = f.price; });

  // countdown – kết thúc cuối khung 3 giờ hiện tại
  var cdH = $('[data-h]'), cdM = $('[data-m]'), cdS = $('[data-s]');
  var slotEls = $$('.flash__slots span');
  function slotEnd() {
    var d = new Date(), h = d.getHours();
    var end = new Date(d); end.setHours(h - (h % 3) + 3, 0, 0, 0);
    var start = new Date(end); start.setHours(end.getHours() - 3);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    if (slotEls.length === 3) {
      slotEls[0].textContent = pad(start.getHours()) + ':00';
      slotEls[2].textContent = 'Tiếp theo ' + pad(end.getHours() % 24) + ':00';
    }
    return end.getTime();
  }
  var endAt = slotEnd(), flashVisible = true, prev = {};
  function tick() {
    var ms = endAt - Date.now();
    if (ms <= 0) { endAt = slotEnd(); ms = endAt - Date.now(); }
    var s = Math.floor(ms / 1000);
    var vals = { h: Math.floor(s / 3600), m: Math.floor(s / 60) % 60, s: s % 60 };
    [['h', cdH], ['m', cdM], ['s', cdS]].forEach(function (pair) {
      var v = (vals[pair[0]] < 10 ? '0' : '') + vals[pair[0]];
      if (prev[pair[0]] !== v) {
        pair[1].textContent = v;
        if (animate && flashVisible && prev[pair[0]] !== undefined) gsap.fromTo(pair[1], { yPercent: -35, opacity: 0.3 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
        prev[pair[0]] = v;
      }
    });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- horizontal sliders (swipe + auto-advance khi rảnh) ---------- */
  function makeSlider(name, interval) {
    var track = $('[data-slider="' + name + '"]');
    if (!track) return;
    var paused = false, hover = false, inView = false, resumeT, timer;
    function step() {
      var first = track.children[0]; if (!first) return 0;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }
    function go(dir) {
      var max = track.scrollWidth - track.clientWidth - 4;
      if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
    }
    function hold() { paused = true; clearTimeout(resumeT); resumeT = setTimeout(function () { if (!hover) paused = false; }, 6000); }
    track.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; paused = true; } });
    track.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; hold(); } });
    track.addEventListener('touchstart', hold, { passive: true });
    track.addEventListener('pointerdown', hold);
    track.addEventListener('wheel', hold, { passive: true });
    track.addEventListener('focusin', hold);
    $$('[data-prev="' + name + '"]').forEach(function (b) { b.addEventListener('click', function () { hold(); go(-1); }); });
    $$('[data-next="' + name + '"]').forEach(function (b) { b.addEventListener('click', function () { hold(); go(1); }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0.3 }).observe(track);
    } else inView = true;
    timer = setInterval(function () {
      if (!paused && inView && !document.hidden && track.scrollWidth > track.clientWidth + 8) go(1);
    }, interval);
  }
  makeSlider('flash', 4200);

  /* ---------- reviews ---------- */
  var REVIEWS = [
    { img: '1617469767053-d3b523a0b982', name: 'Chị Ngọc Anh', car: 'SUV gia đình 5 chỗ', p: 'p02', r: 5, text: 'Thảm 6D vừa khít từng góc, bé nhà mình làm đổ sữa lau cái là sạch. Kỹ thuật lắp tận nhà, rất lịch sự.' },
    { img: '1619682817481-e994891cd1f5', name: 'Anh Đức Thịnh', car: 'Sedan hạng C', p: 'p04', r: 5, text: 'Camera 4K quay đêm rõ biển số, đi dây âm gọn gàng, không thấy sợi dây nào. Xem lại trên điện thoại rất tiện.' },
    { img: '1549317661-bd32c8ce0db2', name: 'Chị Mai Phương', car: 'Xe đô thị cỡ nhỏ', p: 'p16', r: 5, text: 'Rèm nam châm gắn 3 giây là xong, trưa nắng bé ngủ ngon ở ghế sau. Màu đen sang, nhìn ra ngoài vẫn rõ.' },
    { img: '1600661653561-629509216228', name: 'Anh Trí Dũng', car: 'SUV điện', p: 'p07', r: 5, text: 'Màn hình áp suất lốp tự sạc mặt trời, không phải đi dây. Có lần báo lốp non kịp thời trên cao tốc, đáng tiền.' },
    { img: '1533473359331-0135ef1b58bf', name: 'Anh Văn Hải', car: 'SUV 7 chỗ', p: 'p08', r: 5, text: 'Bọc ghế da may đo đẹp hơn mong đợi, đường chỉ đều, ngồi mát. Đội thợ làm trong một buổi sáng là xong.' },
    { img: '1541899481282-d53bffe3c35d', name: 'Chị Thanh Trúc', car: 'Hatchback', p: 'p10', r: 4, text: 'Nước hoa gỗ thông thơm dịu, không gắt, cả nhà không ai bị say xe nữa. Sẽ mua thêm mùi sả chanh.' },
    { img: '1621007947382-bb3c3994e3fb', name: 'Anh Hoàng Long', car: 'Sedan hạng D', p: 'p18', r: 5, text: 'Tẩu sạc 65W sạc được cả laptop trên đường đi công tác. Vỏ nhôm chắc, đèn viền dịu không chói mắt.' },
    { img: '1606611013016-969c19ba27bb', name: 'Gia đình anh Phúc', car: 'SUV 7 chỗ', p: 'p20', r: 5, text: 'Mua combo gối cổ + máy hút bụi được tặng nước hoa. Chuyến về quê 600 km mà cả nhà vẫn khoẻ re.' }
  ];
  var avColors = ['#13233f', '#ff6a13', '#12a565', '#3a5582', '#c2410c', '#0e7490', '#7c3aed', '#be123c'];
  $('[data-slider="reviews"]').innerHTML = REVIEWS.map(function (r, i) {
    return '<article class="rcard" data-card>' +
      '<div class="rcard__img"><img src="' + AK.U(r.img, 640, 400) + '" alt="Ảnh xe của ' + esc(r.name) + '" width="640" height="400" loading="lazy" decoding="async"><span>' + ic('user') + 'Ảnh khách gửi</span></div>' +
      '<div class="rcard__body">' + stars(r.r) + '<q>' + esc(r.text) + '</q>' +
      '<span class="rcard__bought">' + ic('check') + 'Đã mua: ' + esc(byId[r.p].name) + '</span>' +
      '<div class="rcard__who"><span class="avatar" style="background:' + avColors[i % avColors.length] + '">' + r.name.split(' ').pop().charAt(0) + '</span><div><b>' + esc(r.name) + '</b><small>' + esc(r.car) + '</small></div></div></div></article>';
  }).join('');
  makeSlider('reviews', 5000);

  /* ---------- combo mua 2 tặng 1 ---------- */
  var pool = $('[data-combo-pool]'), picks = [];
  pool.innerHTML = AK.COMBO_POOL.map(function (id) {
    var p = byId[id];
    return '<button type="button" class="pick" data-pick="' + id + '" aria-pressed="false"><span class="pick__img tone-' + p.tone + '">' + media(p, 240) + '</span><b>' + esc(p.name) + '</b><small>' + vnd(p.price) + '</small><span class="pick__tick">' + ic('check') + '</span></button>';
  }).join('');
  var slotEls2 = [$('[data-slot="0"]'), $('[data-slot="1"]')], giftSlot = $('[data-slot-gift]');
  var comboTotal = $('[data-combo-total]'), comboSave = $('[data-combo-save]'), comboAdd = $('[data-combo-add]');
  function renderCombo() {
    $$('.pick', pool).forEach(function (b) {
      var on = picks.indexOf(b.getAttribute('data-pick')) > -1;
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
    });
    slotEls2.forEach(function (s, i) {
      var id = picks[i], p = byId[id];
      s.classList.toggle('is-filled', !!p);
      s.innerHTML = p ? '<span class="slot__thumb tone-' + p.tone + '">' + media(p, 120) + '</span><span class="slot__ph">' + esc(p.name) + '</span>'
        : '<span class="slot__n">' + (i + 1) + '</span><span class="slot__ph">' + (i ? 'Chọn món thứ hai' : 'Chọn món thứ nhất') + '</span>';
    });
    var g = byId[AK.COMBO_GIFT], full = picks.length === 2;
    giftSlot.classList.toggle('is-filled', full);
    giftSlot.innerHTML = full ? '<span class="slot__thumb tone-' + g.tone + '">' + media(g, 120) + '</span><span class="slot__ph">Tặng: ' + esc(g.name) + '</span>'
      : '<span class="slot__n">' + ic('gift') + '</span><span class="slot__ph">Quà tặng 189K</span>';
    var sum = picks.reduce(function (a, id) { return a + byId[id].price; }, 0);
    comboTotal.textContent = vnd(sum);
    comboSave.classList.toggle('is-ok', full);
    comboSave.textContent = full ? '+ quà ' + vnd(g.price) + ' miễn phí' : (picks.length ? 'Chọn thêm 1 món để nhận quà' : 'Chọn 2 món bất kỳ');
    comboAdd.disabled = !full;
    if (full && animate) {
      gsap.fromTo(giftSlot, { scale: 0.85 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      var lid = $('.combo__gift .gift-lid');
      if (lid) gsap.fromTo(lid, { y: 0, rotation: 0 }, { y: -26, rotation: -10, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  }
  pool.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]'); if (!b) return;
    var id = b.getAttribute('data-pick'), i = picks.indexOf(id);
    if (i > -1) picks.splice(i, 1);
    else { if (picks.length === 2) picks.shift(); picks.push(id); }
    renderCombo();
    if (animate) gsap.fromTo(b, { scale: 0.95 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' });
  });
  comboAdd.addEventListener('click', function () {
    if (picks.length !== 2) return;
    var src = $('.pick.is-on .pick__img');
    picks.forEach(function (id) { addItem(id, 1); });
    addItem('gift:' + AK.COMBO_GIFT, 1);
    saveCart(); renderCart();
    flyTo(src, byId[picks[0]]);
    toast('Đã thêm combo + quà tặng nước hoa vào giỏ');
    picks = []; renderCombo();
  });
  renderCombo();

  /* ---------- cart ---------- */
  var CART_KEY = 'ankhang_cart_v1';
  var cart = store(CART_KEY);
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter(function (it) { return it && byId[String(it.id).replace('gift:', '')] && it.qty > 0; });
  var cartPanel = $('.cart'), list = $('[data-cart-list]');
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
  function totals() {
    var sub = 0, old = 0, count = 0;
    cart.forEach(function (it) {
      var p = byId[it.id.replace('gift:', '')];
      sub += unitPrice(it) * it.qty; old += p.old * it.qty; count += it.qty;
    });
    return { sub: sub, save: old - sub, count: count };
  }
  function renderCart() {
    clampGift();
    var t = totals();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = t.count; });
    $('[data-cart-count-text]').textContent = '(' + t.count + ')';
    $('[data-cart-total]').textContent = vnd(t.sub);
    $('[data-subtotal]').textContent = vnd(t.sub);
    $('[data-saving]').textContent = '-' + vnd(t.save);
    cartPanel.classList.toggle('is-empty', cart.length === 0);
    var FREE = 499000, left = Math.max(0, FREE - t.sub);
    $('[data-ship-text]').innerHTML = left > 0 ? 'Mua thêm <b>' + vnd(left) + '</b> để được <b>miễn phí vận chuyển</b>' : '🎉 Đơn hàng của bạn được <b>miễn phí vận chuyển</b>';
    $('[data-ship-bar]').style.setProperty('--p', Math.min(1, t.sub / FREE).toFixed(3));
    list.innerHTML = cart.map(function (it) {
      var gift = it.id.indexOf('gift:') === 0, p = byId[it.id.replace('gift:', '')];
      return '<li class="citem" data-key="' + it.key + '"><div class="citem__img tone-' + p.tone + '">' + media(p, 160) + '</div><div>' +
        (gift ? '<span class="citem__gift">' + ic('gift') + 'Quà tặng combo</span>' : it.flash ? '<span class="citem__gift" style="color:var(--orange)">' + ic('bolt') + 'Giá Flash Sale</span>' : '') +
        '<div class="citem__name">' + esc(p.name) + '</div>' +
        '<div class="citem__row"><span class="citem__price">' + (gift ? '0₫' : vnd(unitPrice(it))) + '</span>' +
        (gift ? '<span class="qty"><span>×' + it.qty + '</span></span>' :
          '<span class="qty"><button type="button" data-q="-1" aria-label="Giảm số lượng">' + ic('minus') + '</button><span>' + it.qty + '</span><button type="button" data-q="1" aria-label="Tăng số lượng">' + ic('plus') + '</button></span>') +
        '<button class="citem__del" type="button" data-del aria-label="Xoá ' + esc(p.name) + '">' + ic('trash') + '</button></div></div></li>';
    }).join('');
  }
  list.addEventListener('click', function (e) {
    var li = e.target.closest('[data-key]'); if (!li) return;
    var key = li.getAttribute('data-key');
    var it = cart.filter(function (x) { return x.key === key; })[0]; if (!it) return;
    var q = e.target.closest('[data-q]');
    if (q) { it.qty = Math.max(1, Math.min(99, it.qty + Number(q.getAttribute('data-q')))); }
    else if (e.target.closest('[data-del]')) {
      if (animate) {
        gsap.to(li, { x: 40, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: function () { cart.splice(cart.indexOf(it), 1); saveCart(); renderCart(); } });
        return;
      }
      cart.splice(cart.indexOf(it), 1);
    } else return;
    saveCart(); renderCart();
  });

  function cartTarget() {
    var els = [$('[data-cart-target]'), $('[data-cart-target-m]')];
    for (var i = 0; i < els.length; i++) { var r = els[i] && els[i].getBoundingClientRect(); if (r && r.width > 0) return els[i]; }
    return null;
  }
  function flyTo(srcEl, p) {
    var tgt = cartTarget();
    if (!animate || !srcEl || !tgt) { bounceBadge(); return; }
    var a = srcEl.getBoundingClientRect(), b = tgt.getBoundingClientRect();
    if (!a.width) { bounceBadge(); return; }
    var fly = document.createElement('div');
    fly.className = 'fly tone-' + p.tone;
    fly.innerHTML = media(p, 160, true);
    document.body.appendChild(fly);
    var sx = a.left + a.width / 2 - 32, sy = a.top + a.height / 2 - 32;
    var ex = b.left + b.width / 2 - 32, ey = b.top + b.height / 2 - 32;
    gsap.set(fly, { x: sx, y: sy, scale: 0.4, opacity: 0 });
    var tl = gsap.timeline({ onComplete: function () { fly.remove(); bounceBadge(); } });
    tl.to(fly, { scale: 1.15, opacity: 1, duration: 0.22, ease: 'back.out(2)' })
      .to(fly, { x: ex, duration: 0.75, ease: 'power1.inOut' }, '>')
      .to(fly, { y: ey, duration: 0.75, ease: 'back.in(1.4)' }, '<')
      .to(fly, { scale: 0.3, rotation: 200, duration: 0.75, ease: 'power2.in' }, '<')
      .to(fly, { opacity: 0, duration: 0.12 }, '>-0.1');
  }
  function bounceBadge() {
    if (!animate) return;
    $$('[data-cart-count]').forEach(function (bd) { gsap.fromTo(bd, { scale: 1.8 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1.2, 0.35)' }); });
    var t = cartTarget();
    if (t) gsap.fromTo(t, { rotation: -14 }, { rotation: 0, duration: 0.7, ease: 'elastic.out(1.4, 0.3)' });
  }
  function addToCart(id, qty, btn) {
    var p = byId[id]; if (!p) return;
    var flash = btn && btn.hasAttribute('data-flash-price');
    addItem(id, qty || 1, flash);
    saveCart(); renderCart();
    var card = btn && btn.closest('[data-card]');
    var src = card ? $('.card__media img, .card__media svg, .fcard__img img, .fcard__img svg', card) : (btn && btn.closest('.qv') ? $('.qv__media img, .qv__media svg') : null);
    flyTo(src, p);
    if (btn && btn.classList.contains('card__add')) {
      btn.classList.add('is-added');
      btn.innerHTML = ic('check') + '<span>Đã thêm</span>';
      setTimeout(function () { btn.classList.remove('is-added'); btn.innerHTML = ic('cart') + '<span>Thêm vào giỏ</span>'; }, 1600);
    }
    toast('Đã thêm <b>' + esc(p.name) + '</b> vào giỏ');
  }

  /* ---------- drawers & modals ---------- */
  var openStack = [], lastFocus = [];
  function openLayer(el) {
    if (!el || el.classList.contains('is-open')) return;
    lastFocus.push(document.activeElement);
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    openStack.push(el);
    var sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add('lock');
    if (sw > 0) document.body.style.paddingRight = sw + 'px';
    setTimeout(function () {
      var f = $('[data-close].icon-btn, button, a, input', $('.drawer__panel, .modal__panel', el));
      if (f) f.focus({ preventScroll: true });
    }, 60);
  }
  function closeLayer(el) {
    if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    openStack.splice(openStack.indexOf(el), 1);
    if (!openStack.length) { document.body.classList.remove('lock'); document.body.style.paddingRight = ''; }
    var lf = lastFocus.pop();
    if (lf && lf.focus) try { lf.focus({ preventScroll: true }); } catch (e) {}
    if (el === coModal) setTimeout(resetCheckout, 400);
  }
  function closeAll() { openStack.slice().reverse().forEach(closeLayer); }
  $$('.drawer, .modal').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) {
        var a = e.target.closest('a[href^="#"]');
        closeLayer(el);
        if (a) { e.preventDefault(); var t = document.getElementById(a.getAttribute('href').slice(1)); setTimeout(function () { scrollToEl(t); }, 260); }
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openStack.length) closeLayer(openStack[openStack.length - 1]);
      else { setCatMenu(false); hideSuggest(); }
    }
    if (e.key === 'Tab' && openStack.length) {
      var layer = openStack[openStack.length - 1];
      var f = $$('button:not([disabled]), a[href], input, select, textarea', layer).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  var cartDrawer = $('[data-cart]'), menuDrawer = $('[data-menu]'), quick = $('[data-quick]'), coModal = $('[data-checkout-modal]');
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { openLayer(cartDrawer); if (animate) gsap.fromTo($$('.citem', list), { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, delay: 0.15, ease: 'power2.out' }); }); });
  $('[data-open-menu]').addEventListener('click', function () {
    openLayer(menuDrawer);
    if (animate) gsap.fromTo($$('.mmenu a, .mmenu__cats button', menuDrawer), { opacity: 0, x: -24 }, { opacity: 1, x: 0, stagger: 0.03, duration: 0.4, delay: 0.12, ease: 'power2.out' });
  });

  /* ---------- quick view ---------- */
  var qvMedia = $('[data-qv-media]'), qvBody = $('[data-qv-body]'), qvQty = 1;
  function openQuick(id) {
    var p = byId[id]; if (!p) return;
    qvQty = 1;
    qvMedia.className = 'qv__media tone-' + p.tone;
    qvMedia.innerHTML = media(p, 480, true) + '<div class="badges"><span class="bdg">-' + pct(p) + '%</span>' + (p.isNew ? '<span class="bdg bdg--new">Mới</span>' : '') + '</div>';
    qvBody.innerHTML = '<span class="qv__cat">' + catName[p.cat] + '</span><h3 id="qv-title">' + esc(p.name) + '</h3>' +
      '<div class="card__meta">' + stars(p.rating) + '<span>' + String(p.rating).replace('.', ',') + ' · ' + p.reviews + ' đánh giá · Đã bán ' + kfmt(p.sold) + '</span></div>' +
      '<div class="qv__price"><b>' + vnd(p.price) + '</b><s>' + vnd(p.old) + '</s><span class="bdg">Tiết kiệm ' + vnd(p.old - p.price) + '</span></div>' +
      '<p class="qv__desc">' + esc(p.desc) + '</p>' +
      '<ul class="qv__list">' + p.bullets.map(function (b) { return '<li>' + ic('check') + '<span>' + esc(b) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="qv__fit"><b>Tương thích:</b> ' + (p.fits[0] === 'all' ? 'mọi dòng xe (lắp đặt phổ thông)' : p.fits.map(function (k) { return carName[k]; }).join(', ')) + '</p>' +
      '<div class="qv__buy" data-id="' + p.id + '"><span class="qty"><button type="button" data-qvq="-1" aria-label="Giảm">' + ic('minus') + '</button><span data-qv-n>1</span><button type="button" data-qvq="1" aria-label="Tăng">' + ic('plus') + '</button></span>' +
      '<button class="btn btn--primary" type="button" data-qv-add>' + ic('cart') + 'Thêm vào giỏ</button></div>';
    openLayer(quick);
    if (animate) gsap.fromTo($$('.qv__body > *', quick), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.4, delay: 0.1, ease: 'power2.out' });
  }
  qvBody.addEventListener('click', function (e) {
    var q = e.target.closest('[data-qvq]');
    if (q) { qvQty = Math.max(1, Math.min(99, qvQty + Number(q.getAttribute('data-qvq')))); $('[data-qv-n]', qvBody).textContent = qvQty; return; }
    var add = e.target.closest('[data-qv-add]');
    if (add) {
      var id = add.closest('[data-id]').getAttribute('data-id');
      var src = $('.qv__media img, .qv__media svg');
      var p = byId[id];
      addItem(id, qvQty); saveCart(); renderCart();
      flyTo(src, p);
      toast('Đã thêm ' + qvQty + ' × <b>' + esc(p.name) + '</b> vào giỏ');
      setTimeout(function () { closeLayer(quick); }, 250);
    }
  });

  /* ---------- validation helpers ---------- */
  var PHONE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return String(v || '').replace(/[\s.\-()]/g, '').replace(/^\+84/, '0'); }
  function setErr(input, msg) {
    var f = input.closest('.field');
    f.classList.toggle('is-error', !!msg);
    var e = $('.field-err', f);
    if (e) e.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function shake(el) { if (animate) gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' }); }

  /* ---------- checkout ---------- */
  var coForm = $('[data-co-form]'), coOk = $('[data-co-ok]');
  $('[data-checkout]').addEventListener('click', function () {
    if (!cart.length) return;
    var t = totals();
    $('[data-co-summary]').innerHTML = '<span>' + t.count + ' sản phẩm · ' + (t.sub >= 499000 ? 'Miễn phí giao hàng' : 'Phí giao hàng 30.000₫') + '</span><b>' + vnd(t.sub + (t.sub >= 499000 ? 0 : 30000)) + '</b>';
    closeLayer(cartDrawer);
    setTimeout(function () { openLayer(coModal); }, 200);
  });
  function resetCheckout() { coForm.hidden = false; coOk.hidden = true; coForm.reset(); $$('.field', coForm).forEach(function (f) { f.classList.remove('is-error'); }); $$('.field-err', coForm).forEach(function (e) { e.textContent = ''; }); }
  coForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = coForm.elements.name, phone = coForm.elements.phone, addr = coForm.elements.address, ok = true;
    if (name.value.trim().length < 2) { setErr(name, 'Vui lòng nhập họ tên'); ok = false; } else setErr(name);
    if (!PHONE.test(cleanPhone(phone.value))) { setErr(phone, 'Số điện thoại chưa đúng (VD: 0912 345 678)'); ok = false; } else setErr(phone);
    if (addr.value.trim().length < 6) { setErr(addr, 'Vui lòng nhập địa chỉ nhận hàng'); ok = false; } else setErr(addr);
    if (!ok) { shake(coForm); var bad = $('.is-error input', coForm); if (bad) bad.focus(); return; }
    var t = totals();
    $('[data-co-ok-text]').innerHTML = 'Cảm ơn <b>' + esc(name.value.trim()) + '</b>! Đơn hàng ' + vnd(t.sub) + ' đã được ghi nhận. Tư vấn viên sẽ gọi tới số <b>' + esc(cleanPhone(phone.value)) + '</b> để xác nhận. <br><small>(Cửa hàng mẫu – không có đơn hàng thật được gửi đi.)</small>';
    coForm.hidden = true; coOk.hidden = false;
    cart = []; saveCart(); renderCart();
    if (animate) {
      gsap.fromTo('.co__check', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' });
      gsap.fromTo($$('.co__ok > *:not(.co__check)'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08, delay: 0.2, duration: 0.4 });
    }
    $('.co__ok .btn').focus();
  });
  $$('input', coForm).forEach(function (i) { i.addEventListener('input', function () { if (i.closest('.field').classList.contains('is-error')) setErr(i); }); });

  /* ---------- booking ---------- */
  var booking = $('[data-booking]');
  var dateIn = $('#b-date');
  (function () { var d = new Date(); d.setDate(d.getDate() + 1); var iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); dateIn.min = iso; dateIn.value = iso; })();
  booking.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = booking.elements.name, phone = booking.elements.phone, ok = true;
    if (name.value.trim().length < 2) { setErr(name, 'Vui lòng nhập họ tên'); ok = false; } else setErr(name);
    if (!PHONE.test(cleanPhone(phone.value))) { setErr(phone, 'Số điện thoại chưa đúng (VD: 0912 345 678)'); ok = false; } else setErr(phone);
    var okBox = $('[data-booking-ok]');
    if (!ok) { okBox.hidden = true; shake(booking); return; }
    okBox.hidden = false;
    $('p', okBox).textContent = 'Lịch ' + booking.elements.service.value.toLowerCase() + ' cho xe ' + booking.elements.car.value + ' ngày ' + booking.elements.date.value.split('-').reverse().join('/') + ' đã được ghi nhận. Đây là cửa hàng mẫu nên yêu cầu không được gửi đi thật.';
    if (animate) gsap.fromTo(okBox, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  });
  $$('input', booking).forEach(function (i) { i.addEventListener('input', function () { if (i.closest('.field') && i.closest('.field').classList.contains('is-error')) setErr(i); }); });

  /* ---------- newsletter / voucher ---------- */
  var nForm = $('[data-news-form]'), ticket = $('[data-ticket]'), code = $('[data-voucher-code]').textContent;
  var copyBtn = $('[data-copy-code]');
  function openTicket(silent) {
    ticket.classList.add('is-open');
    $('.ticket__back').setAttribute('aria-hidden', 'false');
    $('.ticket__front').setAttribute('aria-hidden', 'true');
    copyBtn.tabIndex = 0;
    if (!silent && animate) gsap.fromTo(ticket, { scale: 0.92 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
  }
  if (store('ankhang_voucher_v1')) openTicket(true);
  nForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = nForm.querySelector('input'), err = $('[data-news-err]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) { err.textContent = 'Email chưa hợp lệ, bạn kiểm tra lại giúp nhé.'; shake(nForm); return; }
    err.textContent = '';
    store('ankhang_voucher_v1', 1);
    openTicket();
    toast('Mã <b>' + code + '</b> đã sẵn sàng – bấm để sao chép');
  });
  copyBtn.addEventListener('click', function () {
    var done = function () {
      $('span', copyBtn).textContent = 'Đã sao chép!';
      copyBtn.firstElementChild.outerHTML = ic('check');
      toast('Đã sao chép mã <b>' + code + '</b>');
      setTimeout(function () { $('span', copyBtn).textContent = 'Sao chép mã'; }, 2200);
    };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = code; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove(); done();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(done, fallback);
    else fallback();
  });

  /* ---------- search ---------- */
  var sForm = $('[data-search-form]'), searchInput = $('[data-search-input]'), sug = $('[data-suggest]'), sugT, hl = -1;
  function hideSuggest() { sug.hidden = true; hl = -1; }
  function showSuggest() {
    var q = norm(searchInput.value).trim();
    if (!q) { hideSuggest(); if (state.q) { state.q = ''; renderGrid(true); } return; }
    var res = AK.PRODUCTS.filter(function (p) {
      var hay = norm(p.name + ' ' + p.spec + ' ' + catName[p.cat]);
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
    }).slice(0, 6);
    sug.innerHTML = res.length ? res.map(function (p) {
      return '<a href="#san-pham" role="option" data-sug="' + p.id + '"><span class="thumb tone-' + p.tone + '">' + media(p, 100) + '</span><span><b>' + esc(p.name) + '</b><small>' + vnd(p.price) + '</small></span></a>';
    }).join('') : '<p>Không có gợi ý cho “' + esc(searchInput.value) + '”. Nhấn Enter để tìm trong toàn bộ cửa hàng.</p>';
    sug.hidden = false; hl = -1;
  }
  searchInput.addEventListener('input', function () { clearTimeout(sugT); sugT = setTimeout(showSuggest, 120); });
  searchInput.addEventListener('focus', function () { if (searchInput.value.trim()) showSuggest(); });
  searchInput.addEventListener('keydown', function (e) {
    var items = $$('a', sug);
    if (!items.length || sug.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.classList.toggle('is-hl', i === hl); });
    } else if (e.key === 'Enter' && hl > -1) { e.preventDefault(); items[hl].click(); }
  });
  sug.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sug]'); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    hideSuggest(); searchInput.blur();
    openQuick(a.getAttribute('data-sug'));
  });
  document.addEventListener('click', function (e) { if (!sForm.contains(e.target)) hideSuggest(); });
  sForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hideSuggest();
    state.q = searchInput.value.trim();
    state.cat = null; state.limit = 8;
    syncChips(); renderGrid(true);
    searchInput.blur();
    scrollToEl($('#san-pham'));
  });

  /* ---------- hero carousel ---------- */
  (function hero() {
    var root = $('[data-carousel]'); if (!root) return;
    var slides = $$('.slide', root), dots = $$('[data-carousel-dots] button', root);
    var cur = 0, DUR = 6, prog = null, inView = true, hoverP = false, touchT, fallbackT;
    function setDots(i) {
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', k === i); var s = d.firstElementChild; s.style.setProperty('--p', k < i ? 1 : 0); });
    }
    function show(i, dir) {
      if (i === cur && prog) return;
      var from = slides[cur], to = slides[i];
      dir = dir || (i > cur ? 1 : -1);
      if (animate) {
        if (from !== to) {
          gsap.to(from, { autoAlpha: 0, duration: 0.6, ease: 'power2.out', onComplete: function () { from.classList.remove('is-active'); } });
          gsap.to($('.slide__body', from), { x: -40 * dir, duration: 0.5, ease: 'power2.in' });
        }
        to.classList.add('is-active');
        gsap.set(to, { zIndex: 3 }); gsap.set(from, { zIndex: 2 });
        gsap.fromTo(to, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' });
        gsap.fromTo($('.slide__img', to), { scale: 1.14, xPercent: 6 * dir }, { scale: 1, xPercent: 0, duration: 1.4, ease: 'power3.out' });
        gsap.set($('.slide__body', to), { x: 0 });
        gsap.fromTo($('.slide__body', to).children, { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, delay: 0.15, ease: 'power3.out' });
        gsap.fromTo($('.sticker', to), { scale: 0, rotation: -40 }, { scale: 1, rotation: -10, duration: 0.8, delay: 0.45, ease: 'back.out(2.2)' });
      } else {
        from.classList.remove('is-active'); to.classList.add('is-active');
      }
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k !== i); });
      cur = i; setDots(i); runProgress();
    }
    function runProgress() {
      if (!animate) { clearTimeout(fallbackT); fallbackT = setTimeout(function () { show((cur + 1) % slides.length, 1); }, DUR * 1000); return; }
      if (prog) prog.kill();
      var bar = dots[cur].firstElementChild;
      prog = gsap.fromTo(bar, { '--p': 0 }, { '--p': 1, duration: DUR, ease: 'none', onComplete: function () { show((cur + 1) % slides.length, 1); } });
      syncPlay();
    }
    function syncPlay() { if (!prog) return; if (inView && !hoverP && !document.hidden && !touchT) prog.play(); else prog.pause(); }
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hoverP = true; syncPlay(); } });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hoverP = false; syncPlay(); } });
    document.addEventListener('visibilitychange', syncPlay);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; syncPlay(); }, { threshold: 0.25 }).observe(root);
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });
    $('[data-carousel-prev]', root).addEventListener('click', function () { show((cur - 1 + slides.length) % slides.length, -1); });
    $('[data-carousel-next]', root).addEventListener('click', function () { show((cur + 1) % slides.length, 1); });
    // swipe
    var sx = 0, sy = 0, down = false, swiped = false;
    root.addEventListener('pointerdown', function (e) { down = true; swiped = false; sx = e.clientX; sy = e.clientY; if (e.pointerType !== 'mouse') { clearTimeout(touchT); touchT = 1; syncPlay(); } });
    root.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped = true; show(dx < 0 ? (cur + 1) % slides.length : (cur - 1 + slides.length) % slides.length, dx < 0 ? 1 : -1); }
      if (e.pointerType !== 'mouse') { clearTimeout(touchT); touchT = setTimeout(function () { touchT = null; syncPlay(); }, 6000); }
    });
    root.addEventListener('pointercancel', function () { down = false; });
    root.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; } }, true);
    root.addEventListener('dragstart', function (e) { e.preventDefault(); });
    setDots(0);
    slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k !== 0); });
    runProgress();
  })();

  /* ---------- header shadow ---------- */
  var header = $('.header'), ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; });
  }, { passive: true });

  /* ---------- initial render ---------- */
  renderGrid(false);
  renderCart();
  moveInk();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);

  /* =========================================================
     GSAP – chuyển động (chỉ transform/opacity)
     ========================================================= */
  // marquee (nhân đôi nội dung, tạm dừng khi khuất màn hình)
  function marquee(wrap, speed) {
    var track = wrap.firstElementChild;
    var clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true');
    wrap.appendChild(clone);
    if (!animate) return;
    var tw = gsap.to([track, clone], { xPercent: -100, duration: speed, ease: 'none', repeat: -1, paused: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { en[0].isIntersecting ? tw.play() : tw.pause(); }).observe(wrap);
    else tw.play();
    return tw;
  }
  $$('[data-marquee]').forEach(function (w) { marquee(w, w.classList.contains('topbar__marquee') ? 38 : 40); });

  if (!animate || !hasST) {
    // không có GSAP: đặt thanh tiến độ & số đếm ở giá trị cuối
    $$('[data-count]').forEach(function (el) { el.textContent = fmtCount(+el.getAttribute('data-count'), +(el.getAttribute('data-decimals') || 0)); });
    return;
  }
  function fmtCount(v, dec) { return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function whileVisible(tween, el) {
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? tween.play() : tween.pause(); } });
  }

  // Intro
  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.from('.header__main > *', { y: -24, opacity: 0, duration: 0.6, stagger: 0.06 })
    .from('.nav__inner > *', { y: -12, opacity: 0, duration: 0.45, stagger: 0.035 }, '-=0.35')
    .from('.carousel', { scale: 0.96, opacity: 0, duration: 0.8, clearProps: 'transform' }, '-=0.4')
    .from('.slide.is-active .slide__body > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.09 }, '-=0.5')
    .from('.slide.is-active .slide__img', { scale: 1.15, duration: 1.6, ease: 'power2.out' }, '<-0.4')
    .from('.slide.is-active .sticker', { scale: 0, rotation: -60, duration: 0.8, ease: 'back.out(2)' }, '-=1')
    .from('.hero__side .tile', { x: 40, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=1.1')
    .from('.tile__art', { scale: 0.6, rotation: -12, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.8)' }, '-=0.6')
    .from('.trust li', { y: 20, opacity: 0, duration: 0.5, stagger: 0.07 }, '-=0.6');

  // Tiêu đề
  $$('[data-reveal]').forEach(function (el) {
    gsap.from(el, { y: 34, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('.eyebrow').forEach(function (el) {
    gsap.from(el, { x: -20, opacity: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // Reveal theo lô
  function batch(sel, vars) {
    var els = $$(sel); if (!els.length) return;
    gsap.set(els, { opacity: 0, y: vars && vars.y != null ? vars.y : 36 });
    ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true, clearProps: 'transform' }); }
    });
  }
  batch('.cats__row .cat', { y: 24 });
  batch('.fcard', { y: 40 });
  batch('.carchip', { y: 24 });
  batch('.pick', { y: 20 });
  batch('.stats__item');
  batch('.rcard');
  batch('.post', { y: 50 });
  batch('.score');
  batch('.contact__info, .booking', { y: 40 });
  batch('.footer__grid > *', { y: 24 });

  // lưới sản phẩm – lộ ra lần đầu khi cuộn tới
  ScrollTrigger.create({
    trigger: grid, start: 'top 88%', once: true,
    onEnter: function () { gridRevealed = true; gsap.to($$('.card', grid), { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' }); }
  });

  // Flash sale: thanh "Đã bán" + tia chớp
  ScrollTrigger.create({
    trigger: '.flash__box', start: 'top 80%', once: true,
    onEnter: function () {
      $$('.bar em').forEach(function (em, i) { gsap.fromTo(em, { scaleX: 0 }, { scaleX: parseFloat(em.style.getPropertyValue('--w')), duration: 1.3, delay: 0.25 + i * 0.07, ease: 'power3.out' }); });
    }
  });
  ScrollTrigger.create({ trigger: '.flash', start: 'top bottom', end: 'bottom top', onToggle: function (s) { flashVisible = s.isActive; } });
  var bolt = gsap.to('.flash__bolt', { scale: 1.14, rotation: 8, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
  whileVisible(bolt, '.flash');
  gsap.from('.flash__title', { x: -60, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.flash', start: 'top 85%', once: true } });
  gsap.from('.cd b', { rotationX: -90, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(2)', scrollTrigger: { trigger: '.flash', start: 'top 85%', once: true } });

  // Parallax nhẹ (scrub)
  gsap.to('.slide__img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.carousel', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('[data-parallax-car]', { x: -80 }, { x: 160, ease: 'none', scrollTrigger: { trigger: '.models', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.models__marquee', { yPercent: -10 }, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.models', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.combo__gift', { y: 40, rotation: -6 }, { y: -20, rotation: 4, ease: 'none', scrollTrigger: { trigger: '.combo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.ticket', { y: 30, rotation: 4 }, { y: -20, rotation: -3, ease: 'none', scrollTrigger: { trigger: '.news', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Hộp quà nhún nhảy + lấp lánh
  var lidLoop = gsap.timeline({ repeat: -1, repeatDelay: 1.4, paused: true });
  lidLoop.to('.combo__gift .gift-lid', { y: -18, rotation: -7, duration: 0.28, ease: 'power2.out' })
    .to('.combo__gift .gift-lid', { y: 0, rotation: 0, duration: 0.7, ease: 'bounce.out' })
    .fromTo('.combo__gift .gift-spark', { scale: 0.4, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1.2, opacity: 1, duration: 0.4, stagger: 0.12, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
  whileVisible(lidLoop, '.combo');
  gsap.from('.combo__title em', { scale: 0.4, rotation: -12, opacity: 0, duration: 0.9, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.combo', start: 'top 80%', once: true } });

  // Ghim bản đồ
  var pin = gsap.to('.map__pin', { y: -10, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
  whileVisible(pin, '.map');

  // Con số đếm
  $$('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'), dec = +(el.getAttribute('data-decimals') || 0), o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: function () { gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = fmtCount(o.v, dec); } }); }
    });
  });
  // thanh điểm đánh giá
  ScrollTrigger.create({
    trigger: '.score', start: 'top 85%', once: true,
    onEnter: function () { $$('.score__bars em').forEach(function (em, i) { gsap.fromTo(em, { scaleX: 0 }, { scaleX: parseFloat(em.style.getPropertyValue('--w')) || 0, duration: 1.1, delay: 0.1 * i, ease: 'power3.out' }); }); }
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
