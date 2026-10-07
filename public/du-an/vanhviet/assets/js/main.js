/* VÀNH VIỆT – mâm & lốp · tương tác cửa hàng (vanilla JS + GSAP tuỳ chọn) */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var G = window.gsap || null;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = !!(G && !reduced);

  var VV = window.VV, Art = window.VVArt;
  var P = VV.PRODUCTS, byId = {};
  P.forEach(function (p) {
    byId[p.id] = p;
    if (p.cat === 'lop') p.seg = /SUV|A\/T|Đường trường/.test(p.kind) ? 'suv' : 'car';
  });
  var IMG = VV.IMG, PIMG = VV.P_IMG;
  var isMobile = function () { return window.innerWidth <= 760; };

  /* ---------- tiện ích ---------- */
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmt(n) { return num(n) + '₫'; }
  function norm(s) {
    return String(s || '').replace(/×/g, 'x').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
  }
  function compact(s) { return norm(s).replace(/[^a-z0-9]/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stars(r) { var f = Math.round(r); return '★★★★★'.slice(0, f) + '☆☆☆☆☆'.slice(0, 5 - f); }
  function kfmt(n) { return n >= 1000 ? String(Math.round(n / 100) / 10).replace('.', ',') + 'k' : String(n); }
  function dec1(n) { return n.toFixed(1).replace('.', ','); }
  function offPct(p) { return p.old ? Math.round((1 - p.price / p.old) * 100) : 0; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };

  var I = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.3 10.6a1.6 1.6 0 001.6 1.3h8.4a1.6 1.6 0 001.5-1.1L21 8H6.1" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19.6" r="1.5" fill="currentColor"/><circle cx="17.3" cy="19.6" r="1.5" fill="currentColor"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    svc: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5" stroke="currentColor" stroke-width="2"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M7 14h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 10h8M8 14h8M8 18h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- cuộn tới mục ---------- */
  function goTo(id) {
    var t = document.getElementById(id);
    if (!t) return;
    t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    e.preventDefault();
    if (a.dataset.filter) applyPreset(a.dataset.filter);
    if (a.dataset.service) setService(a.dataset.service);
    closeMenu(); closeCart(); closeQV(); closeCatDrop(); closeFilters();
    if (!id || id === 'top') { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
    goTo(id);
  });

  /* ---------- header ---------- */
  var hdr = $('#hdr'), ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { hdr.classList.toggle('is-scrolled', window.scrollY > 40); ticking = false; });
  }, { passive: true });

  /* =========================================================
     DANH MỤC (cột trái, dropdown header, menu mobile)
     ========================================================= */
  var CATS = [
    { t: 'Mâm 15 – 16 inch', img: 'mam-15-5-chau-long-sau', f: 'mam1516' },
    { t: 'Mâm 17 – 18 inch', img: 'mam-17-14-chau-vang-dong', f: 'mam1718' },
    { t: 'Mâm 19 – 20 inch', img: 'mam-20-5-chau-canh-quat', f: 'mam1920' },
    { t: 'Mâm zin tháo xe', img: 'mam-zin-17-10-chau-bac', f: 'zin' },
    { t: 'Lốp xe du lịch', img: 'lop-gai-zigzag-bam-duong', f: 'lop' },
    { t: 'Phụ kiện bánh xe', img: 'bom-chan-dong-ho', f: 'pk' },
    { t: 'Dịch vụ tại xưởng', ic: 'svc', go: 'dich-vu' },
    { t: 'Trả góp 0%', ic: 'card', go: 'tra-gop' }
  ];
  var catHTML = CATS.map(function (c) {
    var pic = c.img ? '<img src="' + PIMG(c.img) + '" alt="" width="28" height="28" loading="lazy" decoding="async">' : '<span class="ci-ic">' + I[c.ic] + '</span>';
    return '<li><a href="#' + (c.go || 'san-pham') + '"' + (c.f ? ' data-filter="' + c.f + '"' : '') + '>' + pic + '<span>' + c.t + '</span>' + I.chev + '</a></li>';
  }).join('');
  $$('[data-cat-list]').forEach(function (ul) { ul.innerHTML = catHTML; });

  var catBtn = $('#catBtn'), catDrop = $('#catDrop');
  function closeCatDrop() { if (catDrop.hidden) return; catDrop.hidden = true; catBtn.setAttribute('aria-expanded', 'false'); }
  catBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = catDrop.hidden;
    catDrop.hidden = !open;
    catBtn.setAttribute('aria-expanded', String(open));
    if (open && anim) G.fromTo(catDrop, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: .22, ease: 'power2.out' });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.hdr-cat')) closeCatDrop(); });

  /* menu mobile */
  var mnav = $('#mnav'), burger = $('#burger');
  function openMenu() { mnav.classList.add('is-open'); mnav.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('lock'); setTimeout(function () { $('[data-close-menu]').focus(); }, 60); }
  function closeMenu() { if (!mnav.classList.contains('is-open')) return; mnav.classList.remove('is-open'); mnav.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); unlock(); }
  burger.addEventListener('click', openMenu);
  $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', openMenu); });
  $('[data-close-menu]').addEventListener('click', closeMenu);
  mnav.addEventListener('click', function (e) { if (e.target === mnav) closeMenu(); });
  function unlock() {
    if (!mnav.classList.contains('is-open') && !drawer.classList.contains('is-open') && !qv.classList.contains('is-open') && !filtersEl.classList.contains('is-open')) document.documentElement.classList.remove('lock');
  }

  /* =========================================================
     BANNER CHÍNH
     ========================================================= */
  var track = $('#hsTrack'), slides = $$('.slide', track), hsTabs = $$('.hs-tabs button'), cur = 0, hsHover = false, hsIdle = 0, hsVisible = true;
  var dots = document.createElement('div');
  dots.className = 'hs-dots'; dots.setAttribute('aria-hidden', 'true');
  dots.innerHTML = slides.map(function () { return '<i></i>'; }).join('');
  track.parentNode.appendChild(dots);
  function hsMark(i) {
    cur = i;
    hsTabs.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
    $$('i', dots).forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }
  function hsGo(i, user) {
    i = (i + slides.length) % slides.length;
    track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    hsMark(i);
    if (user) hsIdle = Date.now() + 8000;
  }
  hsTabs.forEach(function (b) {
    b.addEventListener('click', function () { hsGo(+b.dataset.go, true); });
    b.addEventListener('mouseenter', function () { hsGo(+b.dataset.go, true); });
  });
  $$('[data-hs]').forEach(function (b) { b.addEventListener('click', function () { hsGo(cur + Number(b.dataset.hs), true); }); });
  var hsT;
  track.addEventListener('scroll', function () {
    clearTimeout(hsT);
    hsT = setTimeout(function () { hsMark(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))); }, 90);
  }, { passive: true });
  ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { hsIdle = Date.now() + 8000; }, { passive: true }); });
  $('.hero').addEventListener('mouseenter', function () { hsHover = true; });
  $('.hero').addEventListener('mouseleave', function () { hsHover = false; });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); hsGo(cur + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); hsGo(cur - 1, true); }
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { hsVisible = en[0].isIntersecting; }).observe(track);
  if (!reduced) setInterval(function () { if (!hsHover && hsVisible && !document.hidden && Date.now() > hsIdle) hsGo(cur + 1); }, 5500);
  window.addEventListener('resize', function () { track.scrollLeft = cur * track.clientWidth; });
  hsMark(0);

  /* =========================================================
     FLASH SALE – khung giờ + đếm ngược
     ========================================================= */
  var SLOTS = [9, 14, 20];
  function slotInfo(now) {
    var h = now.getHours(), idx = -1;
    for (var i = 0; i < SLOTS.length; i++) if (h >= SLOTS[i]) idx = i;
    var end = new Date(now);
    if (idx === -1) { end.setHours(9, 0, 0, 0); } else if (idx < SLOTS.length - 1) { end.setHours(SLOTS[idx + 1], 0, 0, 0); } else { end.setHours(23, 59, 59, 999); }
    return { idx: idx === -1 ? 2 : idx, end: end };
  }
  function renderSlots() {
    var s = slotInfo(new Date());
    $('#fsSlots').innerHTML = SLOTS.map(function (h, i) {
      var lab = i === s.idx ? 'Đang diễn ra' : i < s.idx ? 'Đã kết thúc' : 'Sắp diễn ra';
      return '<span class="' + (i === s.idx ? 'is-now' : '') + '"><b>' + String(h).padStart(2, '0') + ':00</b>' + lab + '</span>';
    }).join('');
  }
  var cdH = $('[data-cd="h"]'), cdM = $('[data-cd="m"]'), cdS = $('[data-cd="s"]'), lastSlot = -2;
  function tickCd() {
    var now = new Date(), s = slotInfo(now);
    if (s.idx !== lastSlot) { lastSlot = s.idx; renderSlots(); }
    var t = Math.max(0, Math.floor((s.end - now) / 1000));
    cdH.textContent = String(Math.floor(t / 3600)).padStart(2, '0');
    cdM.textContent = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
    cdS.textContent = String(t % 60).padStart(2, '0');
  }
  tickCd(); setInterval(tickCd, 1000);

  /* =========================================================
     THẺ SẢN PHẨM
     ========================================================= */
  function chipsOf(p) {
    if (p.set) return [p.d + ' inch', p.size, 'Bộ 4 bánh'];
    if (p.cat === 'mam') return [p.d + ' inch', p.pcd.length > 1 ? p.pcd.length + ' chuẩn PCD' : p.pcd[0], 'ET' + p.et, p.j];
    if (p.cat === 'lop') return [p.size, p.li + p.sp, p.kind];
    return p.spec;
  }
  function cardHTML(p, flash) {
    var off = offPct(p);
    var badges = (off ? '<span class="pc-off">-' + off + '%</span>' : '') + (!flash && p.cat !== 'pk' ? '<span class="pc-tg">Trả góp 0%</span>' : '');
    var extra = p.set ? '<p class="pc-set">Giá trọn bộ <b>4 mâm + 4 lốp</b></p>' : p.cat === 'mam' ? '<p class="pc-set">' + (flash ? 'Bộ 4 mâm' : 'Giá trọn bộ 4 mâm') + ': <b>' + fmt(p.price * 4) + '</b></p>'
      : p.cat === 'lop' ? '<p class="pc-gift">Tặng lắp + cân bằng (bộ 4)</p>'
        : '<p class="pc-gift">Giao nhanh 2 giờ nội thành</p>';
    var foot = flash
      ? '<div class="pc-bar" style="--w:' + Math.round(p.flash.s / p.flash.t * 100) + '%"><i></i><span>' + (p.flash.t - p.flash.s <= 10 ? 'Sắp cháy hàng' : 'Đã bán ' + p.flash.s + '/' + p.flash.t) + '</span></div>'
      : '<p class="pc-meta"><span class="st">' + dec1(p.rating) + '</span><span>(' + p.rv + ')</span><i></i><span>Đã bán ' + kfmt(p.sold) + '</span></p>';
    return '<article class="pc" data-id="' + p.id + '">' +
      '<a class="pc-img" href="#san-pham" data-qv="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '"><img src="' + PIMG(p.img) + '" alt="' + esc(p.name) + '" width="400" height="400" loading="lazy" decoding="async">' + badges + '</a>' +
      '<h3 class="pc-n"><a href="#san-pham" data-qv="' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<div class="pc-chips">' + chipsOf(p).map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<div class="pc-buy"><p class="pc-pr"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s>' : '<small>' + (p.cat === 'pk' ? 'Giá đã gồm VAT' : p.set ? 'Giá / bộ' : 'Giá / chiếc') + '</small>') + '</p>' +
      '<button type="button" class="pc-add" data-add="' + p.id + '" aria-label="Thêm ' + esc(p.name) + ' vào giỏ">' + I.cart + '</button></div>' +
      extra + foot + '</article>';
  }

  /* flash sale */
  $('#fsRow').innerHTML = P.filter(function (p) { return p.flash; }).sort(function (a, b) { return offPct(b) - offPct(a); }).map(function (p) { return cardHTML(p, true); }).join('');

  /* danh mục nổi bật */
  var TILES = [
    { t: 'Mâm 15″', p: 'mam-15-6-chau-xam', f: 'mam15' },
    { t: 'Mâm 16″', p: 'mam-16-6-chau-mat-phay', f: 'mam16' },
    { t: 'Mâm 17″', p: 'mam-17-14-chau-bac', f: 'mam17' },
    { t: 'Mâm 19 – 20″', p: 'mam-19-nan-xoay-phay', f: 'mam1920' },
    { t: 'Mâm zin tháo xe', p: 'mam-zin-16-den-phay', f: 'zin' },
    { t: 'Bộ mâm + lốp', p: 'combo-mam-18-den-lop', f: 'set' },
    { t: 'Lốp xe', p: 'lop-gai-khoi-da-dung', f: 'lop' },
    { t: 'Bơm, đo lốp', p: 'bom-chan-dong-ho', f: 'pk' },
    { t: 'Cân bằng động', img: '1599082267768-4815b2ea6bd2', go: 'dich-vu' },
    { t: 'Sơn, tiện mâm', img: '1782235869459-eda397b8d565', go: 'dich-vu' }
  ];
  $('#ctiles').innerHTML = TILES.map(function (c) {
    return '<a class="ct" href="#' + (c.go || 'san-pham') + '"' + (c.f ? ' data-filter="' + c.f + '"' : '') + '><img src="' + (c.p ? PIMG(c.p) : IMG(c.img, 140, 140)) + '" alt="" width="64" height="64" loading="lazy" decoding="async"><span>' + c.t + '</span></a>';
  }).join('');

  /* thương hiệu */
  $('#brRow').innerHTML = VV.BRANDS.map(function (b) {
    var n = P.filter(function (p) { return p.brand === b.n; }).length;
    return '<a class="br" href="#san-pham" data-brand="' + esc(b.n) + '"><b>' + esc(b.n) + '</b><small>' + b.k + ' · ' + n + ' SP</small></a>';
  }).join('');
  $('#fBrand').innerHTML = VV.BRANDS.map(function (b) { return '<label><input type="checkbox" value="' + esc(b.n) + '"><span>' + esc(b.n) + '</span></label>'; }).join('');

  /* =========================================================
     DANH SÁCH SẢN PHẨM + BỘ LỌC
     ========================================================= */
  function blank() { return { cat: '', seg: '', d: [], pcd: [], finish: [], brand: [], price: '', q: '', size: '', onSale: false, setOnly: false, sort: 'hot', limit: 12, note: '' }; }
  var state = blank();
  var CAT_NAME = { mam: 'Mâm đúc', lop: 'Lốp xe', pk: 'Phụ kiện' };
  var PRICE_NAME = { '0-1000000': 'Dưới 1 triệu', '1000000-2000000': '1 – 2 triệu', '2000000-3000000': '2 – 3 triệu', '3000000-99000000': 'Trên 3 triệu' };
  var PRESETS = {
    mam: { cat: 'mam' }, lop: { cat: 'lop' }, pk: { cat: 'pk' },
    'lop-car': { cat: 'lop', seg: 'car' }, 'lop-suv': { cat: 'lop', seg: 'suv' },
    mam1516: { cat: 'mam', d: ['15', '16'] }, mam1718: { cat: 'mam', d: ['17', '18'] }, mam1920: { cat: 'mam', d: ['19', '20'] },
    mam15: { cat: 'mam', d: ['15'] }, mam16: { cat: 'mam', d: ['16'] }, mam17: { cat: 'mam', d: ['17'] }, mam18: { cat: 'mam', d: ['18'] },
    zin: { cat: 'mam', brand: ['Mâm zin'] }, set: { cat: 'mam', setOnly: true },
    big: { cat: 'mam', d: ['18', '19', '20'], onSale: true, sort: 'sale' },
    sale: { onSale: true, sort: 'sale' },
    combo17: { d: ['17'], note: 'Combo gợi ý: chọn <b>4 mâm 17″</b> + <b>4 lốp 215/60R17</b> – lắp đặt, cân bằng, van mới miễn phí.' }
  };

  function hay(p) {
    if (!p._h) {
      p._h = norm([p.name, p.brand, p.size || '', CAT_NAME[p.cat], p.d ? p.d + ' inch ' + p.d + 'in mam ' + p.d : '', (p.pcd || []).join(' '),
        p.style || '', p.brand === 'Mâm zin' ? 'mam zin thao xe oem' : '', p.finish ? VV.FINISHES[p.finish].name : '', p.kind || '', p.seg === 'suv' ? 'suv ban tai' : '', (p.spec || []).join(' '), p.et ? 'et' + p.et : ''].join(' '));
      p._c = p._h.replace(/[^a-z0-9]/g, '');
    }
    return p;
  }
  function termsOf(s) { return norm(s).split(/\s+/).filter(Boolean); }
  function matches(p, terms) {
    hay(p);
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], c = t.replace(/[^a-z0-9]/g, '');
      if (p._h.indexOf(t) < 0 && !(c.length >= 3 && p._c.indexOf(c) >= 0)) return false;
    }
    return true;
  }
  function hotScore(p) { return p.sold * (p.flash ? 1.5 : 1); }

  function filtered() {
    var terms = state.q ? termsOf(state.q) : [];
    var list = P.filter(function (p) {
      if (state.cat && p.cat !== state.cat) return false;
      if (state.seg && p.seg !== state.seg) return false;
      if (state.d.length && state.d.indexOf(String(p.d)) < 0) return false;
      if (state.pcd.length && !(p.pcd && p.pcd.some(function (x) { return state.pcd.indexOf(x) >= 0; }))) return false;
      if (state.finish.length && state.finish.indexOf(p.finish) < 0) return false;
      if (state.brand.length && state.brand.indexOf(p.brand) < 0) return false;
      if (state.size && p.size !== state.size) return false;
      if (state.onSale && !p.old) return false;
      if (state.setOnly && !p.set) return false;
      if (state.price) { var r = state.price.split('-').map(Number); if (p.price < r[0] || p.price >= r[1]) return false; }
      if (terms.length && !matches(p, terms)) return false;
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'asc') return a.price - b.price;
      if (s === 'desc') return b.price - a.price;
      if (s === 'sale') return offPct(b) - offPct(a) || b.sold - a.sold;
      if (s === 'sold') return b.sold - a.sold;
      return hotScore(b) - hotScore(a);
    });
    return list;
  }

  var grid = $('#pgrid'), moreBtn = $('#moreBtn'), activeF = $('#activeF'), notice = $('#notice');
  function nFilters() { return state.d.length + state.pcd.length + state.finish.length + state.brand.length + (state.price ? 1 : 0) + (state.seg ? 1 : 0) + (state.onSale ? 1 : 0) + (state.setOnly ? 1 : 0) + (state.size ? 1 : 0); }
  function tag(label, rm) { return '<button type="button" class="af-tag" data-rm="' + esc(rm) + '">' + label + I.x + '</button>'; }

  function renderProducts(animate) {
    var list = filtered(), shown = list.slice(0, state.limit);
    grid.innerHTML = shown.map(function (p) { return cardHTML(p, false); }).join('');
    $('#empty').hidden = list.length > 0;
    var rest = list.length - shown.length;
    moreBtn.hidden = rest <= 0;
    moreBtn.textContent = 'Xem thêm ' + Math.min(rest, 8) + ' sản phẩm (còn ' + rest + ')';

    var tags = [];
    if (state.q) tags.push(tag('Từ khoá: “' + esc(state.q) + '”', 'q:'));
    if (state.size) tags.push(tag('Cỡ ' + esc(state.size), 'size:'));
    if (state.seg) tags.push(tag(state.seg === 'suv' ? 'Lốp SUV – bán tải' : 'Lốp xe du lịch', 'seg:'));
    if (state.onSale) tags.push(tag('Đang giảm giá', 'onSale:'));
    if (state.setOnly) tags.push(tag('Bộ mâm + lốp', 'setOnly:'));
    state.d.forEach(function (v) { tags.push(tag(v + '″', 'd:' + v)); });
    state.pcd.forEach(function (v) { tags.push(tag('PCD ' + v, 'pcd:' + v)); });
    state.finish.forEach(function (v) { tags.push(tag(VV.FINISHES[v].name, 'finish:' + v)); });
    state.brand.forEach(function (v) { tags.push(tag(esc(v), 'brand:' + v)); });
    if (state.price) tags.push(tag(PRICE_NAME[state.price], 'price:'));
    activeF.innerHTML = '<span class="af-n">Tìm thấy <b>' + list.length + '</b> sản phẩm' + (state.cat ? ' trong ' + CAT_NAME[state.cat].toLowerCase() : '') + '</span>' + tags.join('') +
      (tags.length ? '<button type="button" class="af-clr" data-clear>Xoá tất cả</button>' : '');
    notice.hidden = !state.note;
    notice.innerHTML = state.note ? state.note + ' <button type="button" data-clear>Bỏ lọc</button>' : '';
    var nF = nFilters();
    $('#fCount').textContent = nF ? String(nF) : '';
    if (animate && anim) G.fromTo($$('.pc', grid), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, stagger: .025, ease: 'power2.out', overwrite: true, clearProps: 'transform' });
  }

  function syncFilterUI() {
    $$('.f-chips').forEach(function (g) { var k = g.dataset.f; $$('button', g).forEach(function (b) { b.setAttribute('aria-pressed', String(state[k].indexOf(b.dataset.v) >= 0)); }); });
    $$('.f-checks').forEach(function (g) { var k = g.dataset.f; $$('input', g).forEach(function (i) { i.checked = state[k].indexOf(i.value) >= 0; }); });
    $$('.f-radio input').forEach(function (r) { r.checked = r.value === state.price; });
    $$('.cat-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.cat === state.cat)); });
    $$('.sorts button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.sort === state.sort)); });
  }
  function changed() { state.limit = 12; state.note = ''; syncFilterUI(); renderProducts(true); }
  function resetState(keepSort) { var s = state.sort; state = blank(); if (keepSort) state.sort = s; q.value = ''; }
  function applyPreset(key) {
    var pr = PRESETS[key]; if (!pr) return;
    resetState();
    Object.keys(pr).forEach(function (k) { state[k] = Array.isArray(pr[k]) ? pr[k].slice() : pr[k]; });
    syncFilterUI(); renderProducts(true);
  }

  $$('.f-chips').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var arr = state[g.dataset.f], i = arr.indexOf(b.dataset.v);
      if (i >= 0) arr.splice(i, 1); else arr.push(b.dataset.v);
      changed();
    });
  });
  $$('.f-checks').forEach(function (g) {
    g.addEventListener('change', function (e) {
      var k = g.dataset.f, v = e.target.value, arr = state[k], i = arr.indexOf(v);
      if (e.target.checked && i < 0) arr.push(v); else if (!e.target.checked && i >= 0) arr.splice(i, 1);
      if ((k === 'pcd' || k === 'finish') && arr.length && state.cat !== 'mam') state.cat = 'mam';
      changed();
    });
  });
  $$('.f-radio input').forEach(function (r) { r.addEventListener('change', function () { state.price = r.value; changed(); }); });
  $$('.cat-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      state.cat = b.dataset.cat; state.seg = '';
      if (state.cat !== 'mam') { state.pcd = []; state.finish = []; }
      changed();
    });
  });
  $$('.sorts button').forEach(function (b) { b.addEventListener('click', function () { state.sort = b.dataset.sort; changed(); }); });
  moreBtn.addEventListener('click', function () {
    var before = $$('.pc', grid).length;
    state.limit += 8; renderProducts(false);
    if (anim) G.fromTo($$('.pc', grid).slice(before), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, stagger: .03, ease: 'power2.out', clearProps: 'transform' });
  });
  function clearAll() { resetState(true); syncFilterUI(); renderProducts(true); }
  $('#fReset').addEventListener('click', clearAll);
  $('#emptyReset').addEventListener('click', clearAll);
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-clear]')) { clearAll(); return; }
    var rm = e.target.closest('[data-rm]');
    if (rm) {
      var parts = rm.dataset.rm.split(':'), k = parts[0], v = parts.slice(1).join(':');
      if (Array.isArray(state[k])) state[k] = state[k].filter(function (x) { return x !== v; });
      else if (k === 'onSale' || k === 'setOnly') state[k] = false;
      else { state[k] = ''; if (k === 'q') q.value = ''; }
      changed();
      return;
    }
    var br = e.target.closest('[data-brand]');
    if (br) { e.preventDefault(); resetState(); state.brand = [br.dataset.brand]; syncFilterUI(); renderProducts(true); goTo('san-pham'); }
  });

  /* bộ lọc dạng bottom sheet trên mobile */
  var filtersEl = $('#filters'), fOpen = $('#fOpen'), overlay = $('#overlay');
  function openFilters() {
    filtersEl.classList.add('is-open'); fOpen.setAttribute('aria-expanded', 'true');
    overlay.hidden = false; requestAnimationFrame(function () { overlay.classList.add('is-on'); });
    document.documentElement.classList.add('lock');
  }
  function closeFilters() {
    if (!filtersEl.classList.contains('is-open')) return;
    filtersEl.classList.remove('is-open'); fOpen.setAttribute('aria-expanded', 'false');
    if (!drawer.classList.contains('is-open')) { overlay.classList.remove('is-on'); setTimeout(function () { if (!overlay.classList.contains('is-on')) overlay.hidden = true; }, 260); }
    unlock();
  }
  fOpen.addEventListener('click', openFilters);
  $$('[data-close-filter]').forEach(function (b) { b.addEventListener('click', function () { closeFilters(); if (b.id === 'fApply') goTo('san-pham'); }); });

  /* =========================================================
     TÌM KIẾM + GỢI Ý
     ========================================================= */
  var q = $('#q'), sugg = $('#sugg'), sgAct = -1;
  var POPULAR = ['205/55R16', '215/60R17', 'mâm 17 inch', '5×114,3', 'mâm zin', 'mâm đen', '6×139,7', 'bơm lốp'];
  function highlight(text, terms) {
    var map = [], n = '';
    for (var i = 0; i < text.length; i++) { var c = norm(text[i]); for (var j = 0; j < c.length; j++) { n += c[j]; map.push(i); } }
    var mark = new Array(text.length);
    terms.forEach(function (t) {
      if (t.length < 2) return;
      var from = 0, k;
      while ((k = n.indexOf(t, from)) >= 0) { for (var z = k; z < k + t.length; z++) mark[map[z]] = 1; from = k + t.length; }
    });
    var out = '', open = false;
    for (var m = 0; m < text.length; m++) {
      if (mark[m] && !open) { out += '<mark>'; open = true; }
      if (!mark[m] && open) { out += '</mark>'; open = false; }
      out += esc(text[m]);
    }
    return out + (open ? '</mark>' : '');
  }
  function sgItem(p, terms) {
    return '<button type="button" class="sg-item" role="option" data-qv="' + p.id + '"><img src="' + PIMG(p.img) + '" alt="" width="44" height="44" loading="lazy"><span>' + (terms ? highlight(p.name, terms) : esc(p.name)) + '</span><b>' + fmt(p.price) + '</b></button>';
  }
  function renderSugg() {
    var v = q.value.trim(), html;
    sgAct = -1;
    if (!v) {
      html = '<p class="sg-h">Tìm kiếm phổ biến</p><div class="sg-tags">' + POPULAR.map(function (t) { return '<button type="button" data-sq="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
        '<p class="sg-h">Bán chạy tuần này</p>' + P.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 4).map(function (p) { return sgItem(p); }).join('');
    } else {
      var terms = termsOf(v), list = P.filter(function (p) { return matches(p, terms); });
      html = list.length
        ? '<p class="sg-h">Sản phẩm gợi ý</p>' + list.slice(0, 6).map(function (p) { return sgItem(p, terms); }).join('') + '<button type="button" class="sg-all" data-sall>Xem tất cả ' + list.length + ' kết quả cho “' + esc(v) + '”</button>'
        : '<p class="sg-none">Không có sản phẩm khớp “' + esc(v) + '”. Thử nhập cỡ lốp (VD: 205/55R16) hoặc đường kính mâm (VD: mâm 17).</p>';
    }
    sugg.innerHTML = html;
  }
  function openSugg() { renderSugg(); sugg.hidden = false; q.setAttribute('aria-expanded', 'true'); }
  function closeSugg() { if (sugg.hidden) return; sugg.hidden = true; q.setAttribute('aria-expanded', 'false'); }
  function doSearch(v) {
    v = (v == null ? q.value : v).trim();
    q.value = v;
    closeSugg();
    resetState(true); q.value = v;
    state.q = v;
    syncFilterUI(); renderProducts(true);
    if (isMobile()) q.blur();
    goTo('san-pham');
  }
  var sgT;
  q.addEventListener('focus', openSugg);
  q.addEventListener('input', function () { clearTimeout(sgT); sgT = setTimeout(function () { if (sugg.hidden) openSugg(); else renderSugg(); }, 120); });
  q.addEventListener('keydown', function (e) {
    var items = $$('.sg-item', sugg);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (sugg.hidden) openSugg();
      e.preventDefault();
      if (!items.length) return;
      sgAct = (sgAct + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (it, i) { it.classList.toggle('is-act', i === sgAct); });
      items[sgAct].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && sgAct >= 0 && items[sgAct]) {
      e.preventDefault(); closeSugg(); openQV(items[sgAct].dataset.qv);
    } else if (e.key === 'Escape') { closeSugg(); }
  });
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); doSearch(); });
  sugg.addEventListener('mousedown', function (e) { e.preventDefault(); });
  sugg.addEventListener('click', function (e) {
    var t = e.target.closest('[data-sq]');
    if (t) { doSearch(t.dataset.sq); return; }
    if (e.target.closest('[data-sall]')) { doSearch(); return; }
    if (e.target.closest('.sg-item')) closeSugg();
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) closeSugg(); });

  /* =========================================================
     TÌM LỐP / MÂM THEO XE, THEO CỠ
     ========================================================= */
  var fd = { mode: 'car', make: 'Honda', mi: 1 };
  var fdForm = $('#fdForm'), fdMake = $('#fdMake'), fdModel = $('#fdModel'), fdDia = $('#fdDia');
  function opt(list, sel, lab) { return list.map(function (v) { return '<option value="' + v + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + (lab ? lab(v) : v) + '</option>'; }).join(''); }
  function rng(a, b, s) { var r = []; for (var i = a; i <= b; i += s) r.push(i); return r; }
  function fdCar() { return VV.CARS[fd.make][fd.mi]; }
  function tyreFor(c, d) { return (VV.TYRE_FOR[c.type] || {})[d] || VV.TYRE_FOR.sedan[d]; }
  function fdFill(keepDia) {
    fdMake.innerHTML = opt(Object.keys(VV.CARS), fd.make);
    fdModel.innerHTML = VV.CARS[fd.make].map(function (c, i) { return '<option value="' + i + '"' + (i === fd.mi ? ' selected' : '') + '>' + c.m + '</option>'; }).join('');
    var ds = fdCar().d, cd = keepDia && ds.indexOf(+fdDia.value) >= 0 ? +fdDia.value : ds[Math.min(1, ds.length - 1)];
    fdDia.innerHTML = opt(ds, cd, function (v) { return v + ' inch'; });
    fdHint();
  }
  $('#fdW').innerHTML = opt(rng(155, 295, 10), 205, function (v) { return v + ' mm'; });
  $('#fdAr').innerHTML = opt(rng(30, 75, 5), 55, function (v) { return v + '%'; });
  $('#fdD').innerHTML = opt(rng(15, 20, 1), 16, function (v) { return 'R' + v; });
  function sizeFromSel() { return $('#fdW').value + '/' + $('#fdAr').value + 'R' + $('#fdD').value; }
  function fdHint() {
    var h = $('#fdHint'), c = fdCar(), d = +fdDia.value;
    if (fd.mode === 'size') {
      var w = +$('#fdW').value, ar = +$('#fdAr').value, dd = +$('#fdD').value, D = dd * 25.4 + 2 * w * ar / 100;
      h.innerHTML = 'Cỡ <b>' + sizeFromSel() + '</b> · đường kính tổng ≈ <b>' + num(D) + ' mm</b> · chiều cao thành lốp ≈ <b>' + num(w * ar / 100) + ' mm</b>';
    } else if (fd.mode === 'rim') {
      h.innerHTML = 'Thông số mâm cho ' + fd.make + ' ' + c.m + ': PCD <b>' + c.pcd + '</b> · lỗ tâm <b>' + c.cb + ' mm</b> · ET khuyên dùng <b>' + c.et + '</b>';
    } else {
      h.innerHTML = 'Cỡ lốp zin đề xuất cho ' + fd.make + ' ' + c.m + ' mâm ' + d + '″: <b>' + tyreFor(c, d) + '</b> · PCD <b>' + c.pcd + '</b>';
    }
  }
  fdMake.addEventListener('change', function () { fd.make = fdMake.value; fd.mi = 0; fdFill(false); });
  fdModel.addEventListener('change', function () { fd.mi = +fdModel.value; fdFill(true); });
  fdDia.addEventListener('change', fdHint);
  ['fdW', 'fdAr', 'fdD'].forEach(function (id) { $('#' + id).addEventListener('change', fdHint); });
  $$('.fd-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      fd.mode = b.dataset.fd;
      fdForm.dataset.mode = fd.mode;
      $$('.fd-tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      $$('[data-show]', fdForm).forEach(function (l) { l.hidden = l.dataset.show.split(' ').indexOf(fd.mode) < 0; });
      $('#fdGoTxt').textContent = fd.mode === 'rim' ? 'Tìm mâm' : 'Tìm lốp';
      fdHint();
    });
  });
  function showTyreSize(size, who) {
    var d = +(/R(\d+)/.exec(size) || [0, 0])[1];
    resetState(); state.cat = 'lop';
    var exact = P.filter(function (p) { return p.size === size; });
    if (exact.length) {
      state.size = size;
      state.note = 'Lốp đúng cỡ <b>' + size + '</b>' + (who ? ' cho <b>' + who + '</b>' : '') + ' – giá đã gồm công lắp khi thay bộ 4.';
    } else {
      state.d = [String(d)];
      state.note = 'Cỡ <b>' + size + '</b>' + (who ? ' (' + who + ')' : '') + ' hiện đặt hàng trong 1–2 ngày. Đang hiển thị lốp <b>' + d + ' inch</b> có sẵn – gọi <a href="tel:0900000468"><b>0900 000 468</b></a> để giữ hàng.';
    }
    syncFilterUI(); renderProducts(true); goTo('san-pham');
  }
  function showRimsFor(make, c) {
    resetState(); state.cat = 'mam';
    state.pcd = [c.pcd]; state.d = c.d.map(String);
    var who = make + ' ' + c.m;
    if (!filtered().length) state.d = [];
    if (filtered().length) {
      state.note = 'Mâm vừa <b>' + who + '</b>: PCD <b>' + c.pcd + '</b>, lỗ tâm ' + c.cb + ' mm, ET <b>' + c.et + '</b>. Kỹ thuật viên kiểm tra lại trước khi lắp.';
    } else {
      state.pcd = []; state.d = c.d.map(String);
      state.note = 'Chưa có mẫu sẵn kho chuẩn <b>' + c.pcd + '</b> cho ' + who + '. Bên dưới là mâm cùng cỡ – cửa hàng nhận đặt khoan PCD theo xe, gọi <b>0900 000 468</b>.';
    }
    syncFilterUI(); renderProducts(true); goTo('san-pham');
  }
  fdForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = fdCar();
    if (fd.mode === 'size') showTyreSize(sizeFromSel());
    else if (fd.mode === 'rim') showRimsFor(fd.make, c);
    else showTyreSize(tyreFor(c, +fdDia.value), fd.make + ' ' + c.m);
  });
  fdFill(false);

  /* =========================================================
     GIỎ HÀNG
     ========================================================= */
  var KEY = 'vanhviet_cart_v3';
  var cart = store.get(KEY, []);
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter(function (i) { return i && typeof i.key === 'string' && typeof i.price === 'number' && i.qty > 0 && typeof i.name === 'string'; });
  var drawer = $('#drawer'), lastFocus = null;

  function itemFromProduct(p) {
    var spec = p.cat === 'mam' ? p.d + ' inch · ' + p.pcd.join(' / ') + ' · ET' + p.et : p.cat === 'lop' ? p.size + ' ' + p.li + p.sp : p.spec.join(' · ');
    if (p.set) spec = p.d + ' inch · lốp ' + p.size + ' · giá cả bộ';
    return { key: p.id, cat: p.set ? 'cfg' : p.cat, name: p.name, spec: spec, price: p.price, img: p.img };
  }
  function thumb(i) {
    if (i.img) return '<img src="' + PIMG(i.img) + '" alt="" width="72" height="72" loading="lazy">';
    if (i.art && i.art.k === 'w') return Art.wheelSVG(i.art.design, i.art.finish);
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
      return '<li class="ci" data-key="' + esc(i.key) + '"><div class="ci-img">' + thumb(i) + '</div>' +
        '<div><p class="ci-name">' + esc(i.name) + '</p><p class="ci-spec">' + esc(i.spec || '') + '</p>' +
        '<div class="ci-row"><div class="qty"><button type="button" data-q="-1" aria-label="Giảm số lượng">−</button><span>' + i.qty + '</span><button type="button" data-q="1" aria-label="Tăng số lượng">+</button></div><b class="ci-price">' + fmt(i.price * i.qty) + '</b></div></div>' +
        '<button type="button" class="ci-rm" data-rm-item aria-label="Xoá ' + esc(i.name) + '">' + I.trash + '</button></li>';
    }).join('');
    var empty = cart.length === 0;
    $('#drEmpty').hidden = !empty;
    $('#drFoot').hidden = empty;
    $('#drList').hidden = empty;
    var wheels = 0, tyres = 0, combo = false;
    cart.forEach(function (i) { if (i.cat === 'mam') wheels += i.qty; if (i.cat === 'lop') tyres += i.qty; if (i.cat === 'cfg') combo = true; });
    var free = '';
    if (combo || wheels >= 4 || tyres >= 4) free = 'Đơn hàng được miễn phí lắp đặt + cân bằng động.';
    else if (wheels || tyres) free = 'Mua thêm ' + (4 - Math.max(wheels, tyres)) + ' chiếc để được miễn phí lắp đặt + cân bằng.';
    $('#drFree').textContent = free;
    $('#drSubtotal').textContent = fmt(subtotal());
    $('#coTotal').textContent = fmt(subtotal());
  }

  function addItem(item, qty, srcImg) {
    var ex = cart.filter(function (i) { return i.key === item.key; })[0];
    if (ex) ex.qty = Math.min(99, ex.qty + qty);
    else { item.qty = qty; cart.push(item); }
    saveCart(); renderCart();
    fly(srcImg);
    toast('Đã thêm <b>' + qty + ' ×</b> ' + esc(item.name.length > 48 ? item.name.slice(0, 46) + '…' : item.name) + ' vào giỏ');
  }
  $('#drList').addEventListener('click', function (e) {
    var li = e.target.closest('.ci'); if (!li) return;
    var it = cart.filter(function (i) { return i.key === li.dataset.key; })[0]; if (!it) return;
    var qb = e.target.closest('[data-q]');
    if (qb) { it.qty += Number(qb.dataset.q); if (it.qty < 1) cart.splice(cart.indexOf(it), 1); else if (it.qty > 99) it.qty = 99; }
    else if (e.target.closest('[data-rm-item]')) cart.splice(cart.indexOf(it), 1);
    else return;
    saveCart(); renderCart();
  });

  function showView(v) { ['drCart', 'drCheckout', 'drOk'].forEach(function (id) { $('#' + id).hidden = id !== v; }); }
  function openCart(view) {
    lastFocus = document.activeElement;
    showView(view || 'drCart');
    closeFilters();
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-on'); });
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lock');
    setTimeout(function () { var f = view === 'drCheckout' ? $('#coForm').elements.name : $('[data-close-cart]', drawer); f && f.focus(); }, 80);
  }
  function closeCart() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-on');
    setTimeout(function () { if (!overlay.classList.contains('is-on')) overlay.hidden = true; }, 300);
    unlock();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $('#cartBtn').addEventListener('click', function () { openCart(); });
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { openCart(); }); });
  $$('[data-close-cart]').forEach(function (b) { b.addEventListener('click', function (e) { if (b.tagName !== 'A') { e.preventDefault(); closeCart(); } }); });
  overlay.addEventListener('click', function () { closeCart(); closeFilters(); });
  $('#toCheckout').addEventListener('click', function () { showView('drCheckout'); setTimeout(function () { $('#coForm').elements.name.focus(); }, 50); });
  $('#backToCart').addEventListener('click', function () { showView('drCart'); });

  /* hiệu ứng bay vào giỏ (nhẹ) */
  function cartTarget() {
    var hb = $('#cartBtn'), r = hb.getBoundingClientRect();
    if (isMobile() && (r.bottom < 0 || r.top > window.innerHeight)) return $('.bnav [data-open-cart]');
    return hb;
  }
  function bump() {
    if (!anim) return;
    G.fromTo('[data-count-badge]', { scale: 1.5 }, { scale: 1, duration: .45, ease: 'back.out(3)', overwrite: true });
  }
  function fly(src) {
    if (!anim || !src) { bump(); return; }
    var r1 = src.getBoundingClientRect();
    if (!r1.width || r1.bottom < 0 || r1.top > window.innerHeight) { bump(); return; }
    var t = cartTarget().getBoundingClientRect(), size = Math.min(r1.width, r1.height, 120);
    var el = document.createElement('div');
    el.className = 'fly';
    el.style.cssText = 'left:' + (r1.left + r1.width / 2 - size / 2) + 'px;top:' + (r1.top + r1.height / 2 - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
    el.innerHTML = src.tagName === 'IMG' ? '<img src="' + src.currentSrc + '" alt="">' : src.outerHTML;
    document.body.appendChild(el);
    var dx = t.left + t.width / 2 - (r1.left + r1.width / 2), dy = t.top + t.height / 2 - (r1.top + r1.height / 2);
    G.to(el, { x: dx, y: dy, scale: .18, opacity: .4, duration: .7, ease: 'power2.inOut', onComplete: function () { el.remove(); bump(); } });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    var p = byId[b.dataset.add]; if (!p) return;
    var qty = 1, src;
    if (b.hasAttribute('data-qv-add')) { qty = qvQty; src = $('#qvMedia img'); }
    else { var card = b.closest('.pc'); src = card && $('.pc-img img', card); }
    addItem(itemFromProduct(p), qty, src);
    b.classList.add('is-done');
    setTimeout(function () { b.classList.remove('is-done'); }, 1200);
    if (b.hasAttribute('data-qv-add')) setTimeout(closeQV, 250);
  });

  /* ---------- form ---------- */
  var PHONE = /^0(3|5|7|8|9)\d{8}$/;
  function cleanPhone(v) { return v.replace(/[\s.\-()]/g, ''); }
  function validate(form, rules) {
    var ok = true;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name], msg = rules[name](el.value.trim()), fld = el.closest('.fld');
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
    var pay = (f.querySelector('input[name="pay"]:checked') || {}).value || '';
    $('#okMsg').innerHTML = 'Cảm ơn <b>' + esc(f.elements.name.value.trim()) + '</b>! Đơn <b>' + code + '</b> trị giá <b>' + fmt(subtotal()) + '</b> (' + esc(pay.toLowerCase()) + ') đã được ghi nhận. Nhân viên sẽ gọi <b>' + esc(cleanPhone(f.elements.phone.value)) + '</b> để hẹn lịch giao / lắp.<br><small>Đơn hàng minh hoạ – không gửi dữ liệu.</small>';
    cart = []; saveCart(); renderCart(); f.reset();
    showView('drOk');
    if (anim) G.from('#drOk > *', { y: 14, opacity: 0, stagger: .07, duration: .4, ease: 'power2.out' });
  });

  /* =========================================================
     XEM NHANH SẢN PHẨM
     ========================================================= */
  var qv = $('#qv'), qvQty = 1, qvLast = null, qvP = null;
  function qvSpecs(p) {
    if (p.cat === 'mam') return [['Đường kính', p.d + ' inch'], ['Bề rộng', p.j], ['Offset (ET)', 'ET' + p.et], ['PCD', p.pcd.join(' / ')], ['Lỗ tâm (CB)', p.cb + ' mm (kèm vòng định tâm)'], ['Kiểu nan', p.style], ['Màu', VV.FINISHES[p.finish].name]].concat(p.set ? [['Lốp kèm theo', p.size + ' (còn ~95% gai)']] : []).concat([['Bảo hành', p.brand === 'Mâm zin' ? 'Kết cấu 12 tháng (hàng tháo xe)' : 'Kết cấu 5 năm · sơn 2 năm']]);
    if (p.cat === 'lop') return [['Cỡ lốp', p.size], ['Chỉ số tải', p.li + ' – ' + num(VV.LOAD[p.li] || 0) + ' kg/lốp'], ['Chỉ số tốc độ', p.sp + ' – ' + VV.SPEED[p.sp] + ' km/h'], ['Dòng lốp', p.kind], ['Năm sản xuất', String(p.year)], ['Bảo hành', '5 năm hoặc 60.000 km']];
    return [['Thông số', p.spec.join(' · ')], ['Bảo hành', '12 tháng']];
  }
  var PROMO = {
    mam: ['Tặng cân bằng động + van mới khi mua bộ 4 mâm', 'Miễn phí lắp đặt tại cửa hàng hoặc tận nơi nội thành', 'Trả góp 0% qua thẻ tín dụng, kỳ hạn 3 – 12 tháng'],
    lop: ['Miễn phí công lắp + cân bằng khi thay 4 lốp', 'Thu lốp cũ trợ giá 100.000₫/lốp', 'Bảo hành 5 năm hoặc 60.000 km'],
    pk: ['Giảm 10% khi mua kèm mâm hoặc lốp', 'Giao nhanh 2 giờ nội thành']
  };
  function openQV(id) {
    var p = byId[id]; if (!p) return;
    qvP = p; qvLast = document.activeElement;
    qvQty = p.cat === 'pk' || p.set ? 1 : 4;
    closeSugg();
    $('#qvMedia').innerHTML = '<img src="' + PIMG(p.img) + '" alt="' + esc(p.name) + '" width="720" height="720">';
    var off = offPct(p);
    var unit = p.set ? 'Giá trọn bộ 4 mâm + 4 lốp, đã gồm lắp đặt' : p.cat === 'mam' ? 'Giá 1 chiếc · trọn bộ 4 mâm <b>' + fmt(p.price * 4) + '</b>' : p.cat === 'lop' ? 'Giá 1 lốp · bộ 4 lốp <b>' + fmt(p.price * 4) + '</b>' : 'Giá đã gồm VAT';
    $('#qvBody').innerHTML = '<p class="qv-brand">Thương hiệu: <b>' + esc(p.brand) + '</b> · Mã: ' + p.id.toUpperCase() + '</p>' +
      '<h3 id="qvTitle">' + esc(p.name) + '</h3>' +
      '<p class="qv-rate"><span class="st" aria-hidden="true">' + stars(p.rating) + '</span><span>' + dec1(p.rating) + ' · ' + p.rv + ' đánh giá · Đã bán ' + kfmt(p.sold) + '</span></p>' +
      '<div class="qv-price"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s><em>-' + off + '%</em>' : '') + '<p>' + unit + '</p></div>' +
      '<div class="qv-promo"><p>Khuyến mãi</p><ul>' + PROMO[p.cat].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' +
      '<dl class="qv-spec">' + qvSpecs(p).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      '<p class="qv-desc">' + esc(p.desc) + '</p>' +
      '<p class="qv-stock">Còn hàng tại 3 cửa hàng · giao, lắp trong 24 giờ</p>' +
      '<div class="qv-buy"><div class="qty"><button type="button" data-qd="-1" aria-label="Giảm">−</button><span id="qvQty">' + qvQty + '</span><button type="button" data-qd="1" aria-label="Tăng">+</button></div>' +
      '<button type="button" class="btn btn-line" data-add="' + p.id + '" data-qv-add>Thêm vào giỏ</button>' +
      '<button type="button" class="btn btn-red" data-buy="' + p.id + '">Mua ngay</button></div>' +
      (p.cat !== 'pk' && !p.set ? '<a class="link qv-inst" href="#tra-gop" data-inst>Tính trả góp 0% cho <span id="qvInstN">' + qvQty + '</span> chiếc</a>' : '');
    qv.classList.add('is-open');
    qv.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lock');
    setTimeout(function () { $('[data-close-qv]').focus(); }, 60);
    if (anim) G.from('#qvBody > *', { y: 10, opacity: 0, stagger: .03, duration: .35, ease: 'power2.out', delay: .05 });
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
    if (t && !e.target.closest('[data-add]')) { e.preventDefault(); e.stopPropagation(); openQV(t.dataset.qv); }
  }, true);
  $('[data-close-qv]').addEventListener('click', closeQV);
  qv.addEventListener('click', function (e) {
    if (e.target === qv) { closeQV(); return; }
    var d = e.target.closest('[data-qd]');
    if (d) { qvQty = Math.max(1, Math.min(99, qvQty + Number(d.dataset.qd))); $('#qvQty').textContent = qvQty; var n = $('#qvInstN'); if (n) n.textContent = qvQty; return; }
    var buy = e.target.closest('[data-buy]');
    if (buy) {
      var p = byId[buy.dataset.buy], ex = cart.filter(function (i) { return i.key === p.id; })[0];
      if (ex) ex.qty = Math.min(99, ex.qty + qvQty); else { var it = itemFromProduct(p); it.qty = qvQty; cart.push(it); }
      saveCart(); renderCart(); closeQV(); openCart('drCheckout');
      return;
    }
    if (e.target.closest('[data-inst]') && qvP) setInstPrice(qvP.price * qvQty);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeQV(); closeCart(); closeMenu(); closeCatDrop(); closeFilters(); closeSugg(); }
  });

  /* =========================================================
     CẤU HÌNH MÂM THEO XE
     ========================================================= */
  var cfg = { make: 'Honda', mi: 1, d: 18, design: 'turbine', finish: 'titan', total: 0 };
  var TYPE_NAME = { sedan: 'Sedan', hatch: 'Hatchback', suv: 'SUV · MPV', pickup: 'Bán tải' };
  /* ảnh thật đại diện cho từng kiểu nan */
  var DESIGN_IMG = { five: 'mam-20-5-chau-canh-quat', double: 'mam-zin-16-den-phay', mesh: 'mam-17-14-chau-bac', turbine: 'mam-19-nan-xoay-phay', yspoke: 'mam-zin-17-5-chau-xoay', aero: 'mam-19-da-chau-phay' };
  function car() { return VV.CARS[cfg.make][cfg.mi]; }
  function tyreSize() { return tyreFor(car(), cfg.d); }
  function ratioOf(size) { var m = /(\d+)\/(\d+)R(\d+)/.exec(size); if (!m) return .66; var rim = m[3] * 25.4; return rim / (rim + 2 * m[1] * m[2] / 100); }
  function wheelPrice() { return Math.round(VV.WHEEL_BASE[cfg.d] * VV.DESIGNS[cfg.design].k / 10000) * 10000 + VV.FINISHES[cfg.finish].add; }
  function tyrePrice() { return Math.round(VV.TYRE_BASE[cfg.d] * (car().type === 'pickup' ? 1.15 : 1) / 10000) * 10000; }
  function chip(label, checked, attrs, disabled) { return '<button type="button" class="chip" role="radio" aria-checked="' + checked + '" ' + attrs + (disabled ? ' disabled' : '') + '>' + label + '</button>'; }
  function renderMakes() { $('#cfgMake').innerHTML = Object.keys(VV.CARS).map(function (m) { return chip(m, m === cfg.make, 'data-make="' + m + '"'); }).join(''); }
  function renderModels() { $('#cfgModel').innerHTML = VV.CARS[cfg.make].map(function (c, i) { return chip(c.m, i === cfg.mi, 'data-mi="' + i + '"'); }).join(''); }
  function renderDia() {
    var ok = car().d;
    $('#cfgDia').innerHTML = [15, 16, 17, 18, 19, 20].map(function (d) { return chip(d + '″', d === cfg.d, 'data-d="' + d + '" aria-label="' + d + ' inch' + (ok.indexOf(d) < 0 ? ' – không tương thích' : '') + '"', ok.indexOf(d) < 0); }).join('');
  }
  function renderDesigns() {
    $('#cfgDesign').innerHTML = Object.keys(VV.DESIGNS).map(function (k) {
      return '<button type="button" class="dsg" role="radio" aria-checked="' + (k === cfg.design) + '" data-design="' + k + '"><img src="' + PIMG(DESIGN_IMG[k]) + '" alt="" width="48" height="48" loading="lazy"><span>' + VV.DESIGNS[k].name + '</span></button>';
    }).join('');
  }
  function renderFinishes() {
    $('#cfgFinish').innerHTML = Object.keys(VV.FINISHES).map(function (k) {
      var f = VV.FINISHES[k];
      return '<button type="button" class="swb" role="radio" aria-checked="' + (k === cfg.finish) + '" data-fin="' + k + '" aria-label="' + f.name + '" title="' + f.name + '" style="background:' + f.sw + '"></button>';
    }).join('');
    $('#cfgFinName').textContent = VV.FINISHES[cfg.finish].name;
  }
  function spin(els, from, dur) {
    if (!anim || !els.length) return;
    var o = { r: from };
    var set = function () { for (var i = 0; i < els.length; i++) els[i].style.transform = 'rotate(' + o.r.toFixed(2) + 'deg)'; };
    set();
    G.to(o, { r: 0, duration: dur, ease: 'power3.out', onUpdate: set, onComplete: function () { els.forEach(function (e) { e.style.transform = ''; }); } });
  }
  var totalObj = { v: 0 };
  function updateCfg(how) {
    var c = car(), ts = tyreSize(), wp = wheelPrice(), tp = tyrePrice(), total = 4 * (wp + tp);
    var stage = $('#cfgCar');
    stage.innerHTML = Art.carSVG(c.type, cfg.design, cfg.finish, ratioOf(ts), c.lugs);
    $('#cfgCarName').textContent = cfg.make + ' ' + c.m;
    $('#cfgCarType').textContent = TYPE_NAME[c.type] + ' · mâm ' + cfg.d + '″';
    $('#roPcd').textContent = c.pcd;
    $('#roCb').textContent = c.cb + ' mm';
    $('#roEt').textContent = c.et;
    $('#roTyre').textContent = ts;
    $('#pbWheelL').textContent = '4 × Mâm VV-' + cfg.d + VV.DESIGNS[cfg.design].code + ' ' + VV.FINISHES[cfg.finish].name.toLowerCase();
    $('#pbTyreL').textContent = '4 × Lốp ' + ts;
    $('#pbWheel').textContent = fmt(4 * wp);
    $('#pbTyre').textContent = fmt(4 * tp);
    $('#pbMonthly').textContent = fmt(Math.round(total / 12 / 1000) * 1000);
    cfg.total = total;
    if (anim && how) {
      G.to(totalObj, { v: total, duration: .6, ease: 'power2.out', overwrite: true, onUpdate: function () { $('#pbTotal').textContent = fmt(Math.round(totalObj.v / 1000) * 1000); }, onComplete: function () { $('#pbTotal').textContent = fmt(total); } });
      var spins = $$('.wspin', stage);
      if (how === 'car') { G.from($('.car-svg', stage), { x: -40, opacity: 0, duration: .6, ease: 'power2.out' }); spin(spins, -360, 1); }
      else spin(spins, -200, .9);
    } else { totalObj.v = total; $('#pbTotal').textContent = fmt(total); }
  }
  function pickDia() { var ok = car().d; if (ok.indexOf(cfg.d) < 0) cfg.d = ok[Math.min(1, ok.length - 1)]; }
  $('#cfgMake').addEventListener('click', function (e) {
    var b = e.target.closest('[data-make]'); if (!b || b.dataset.make === cfg.make) return;
    cfg.make = b.dataset.make; cfg.mi = 0; pickDia(); renderMakes(); renderModels(); renderDia(); updateCfg('car');
  });
  $('#cfgModel').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mi]'); if (!b) return;
    cfg.mi = Number(b.dataset.mi); pickDia(); renderModels(); renderDia(); updateCfg('car');
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
      key: ['cfg', cfg.make, c.m, cfg.d, cfg.design, cfg.finish].join('-'), cat: 'cfg',
      name: 'Bộ 4 mâm ' + cfg.d + '″ ' + VV.DESIGNS[cfg.design].name.toLowerCase() + ' ' + VV.FINISHES[cfg.finish].name.toLowerCase() + ' + 4 lốp ' + ts,
      spec: 'Cho ' + cfg.make + ' ' + c.m + ' · PCD ' + c.pcd + ' · ET ' + c.et,
      price: cfg.total, img: DESIGN_IMG[cfg.design]
    };
    addItem(item, 1, $('#cfgDesign [aria-checked="true"] img'));
  });
  $('#cfgInst').addEventListener('click', function () { setInstPrice(cfg.total); });

  /* =========================================================
     GIẢI MÃ CỠ LỐP
     ========================================================= */
  var dec = { w: 205, ar: 55, d: 16, li: 91, sp: 'V', on: 'w' }, userTouched = 0;
  $('#cW').innerHTML = opt(rng(155, 295, 10), dec.w);
  $('#cAr').innerHTML = opt(rng(30, 75, 5), dec.ar);
  $('#cD').innerHTML = opt(rng(13, 22, 1), dec.d);
  $('#cLi').innerHTML = opt(Object.keys(VV.LOAD), dec.li);
  $('#cSp').innerHTML = opt(['T', 'H', 'V', 'W', 'Y'], dec.sp);
  function decText(k, h) {
    switch (k) {
      case 'w': return ['Chiều rộng mặt lốp', dec.w + ' mm', 'Bề rộng lốp đo giữa hai mép hông khi bơm đúng áp suất. Lốp rộng bám đường tốt hơn nhưng ồn và tốn nhiên liệu hơn một chút.'];
      case 'ar': return ['Tỷ lệ thành lốp', dec.ar + '% ≈ ' + num(h) + ' mm', 'Chiều cao thành lốp bằng ' + dec.ar + '% chiều rộng. Số càng nhỏ thành lốp càng mỏng: lái chắc, đẹp mâm nhưng kém êm hơn.'];
      case 'r': return ['Cấu trúc bố tỏa tròn', 'R = Radial', 'Các lớp bố chạy hướng tâm từ mép này sang mép kia – chuẩn trên hầu hết xe du lịch hiện nay, mát lốp và bền hơn.'];
      case 'd': return ['Đường kính mâm', dec.d + ' inch = ' + num(dec.d * 25.4) + ' mm', 'Lốp này chỉ lắp vừa mâm ' + dec.d + ' inch. Đây là con số phải khớp tuyệt đối giữa lốp và mâm.'];
      case 'li': return ['Chỉ số tải trọng', dec.li + ' = ' + num(VV.LOAD[dec.li]) + ' kg / lốp', 'Tải tối đa mỗi lốp chịu được. Không lắp lốp có chỉ số tải thấp hơn khuyến cáo của nhà sản xuất xe.'];
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
      $('#decTitle').textContent = 'Cách đọc thông số lốp “' + dec.w + '/' + dec.ar + 'R' + dec.d + ' ' + dec.li + dec.sp + '”';
    }
    var svg = $('#decSvg .dg'); if (svg) svg.setAttribute('data-on', dec.on);
    $$('#decCode .seg').forEach(function (s) { s.setAttribute('aria-selected', String(s.dataset.k === dec.on)); });
    var t = decText(dec.on, decRes.h), info = $('#decInfo');
    info.innerHTML = '<p class="di-k">' + t[0] + '</p><p class="di-v">' + t[1] + '</p><p class="di-t">' + t[2] + '</p>';
    if (anim && !full) G.from(info.children, { y: 6, opacity: 0, stagger: .04, duration: .3, ease: 'power2.out' });
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
  $('#decFind').addEventListener('click', function () { showTyreSize(dec.w + '/' + dec.ar + 'R' + dec.d); });
  var KEYS = ['w', 'ar', 'r', 'd', 'li', 'sp'], decTimer = null;
  function decCycle(on) {
    clearInterval(decTimer);
    if (!on || reduced) return;
    decTimer = setInterval(function () {
      if (Date.now() - userTouched < 9000 || document.hidden) return;
      dec.on = KEYS[(KEYS.indexOf(dec.on) + 1) % KEYS.length];
      renderDec(false);
    }, 3600);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { decCycle(en[0].isIntersecting); }, { threshold: .35 }).observe($('#giai-ma-lop'));

  /* =========================================================
     DỊCH VỤ, ĐÁNH GIÁ, KINH NGHIỆM, CỬA HÀNG
     ========================================================= */
  $('#svcBody').innerHTML = VV.SERVICES.map(function (s) {
    return '<tr><td class="n"><b>' + s.n + '</b><span>' + s.d + '</span>' + (s.note ? '<em>' + s.note + '</em>' : '') + '</td><td class="t">' + s.t + '</td><td class="p">' + s.p + '</td>' +
      '<td class="b"><a href="#dat-lich" data-service="' + esc(s.n) + '">Đặt lịch</a></td></tr>';
  }).join('');
  var bSel = $('#bService');
  bSel.innerHTML = ['Mua & lắp mâm / lốp'].concat(VV.SERVICES.map(function (s) { return s.n; }), ['Tư vấn trả góp 0%']).map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
  function setService(n) { if ($$('option', bSel).some(function (x) { return x.value === n; })) bSel.value = n; }
  $('#bBranch').innerHTML = VV.BRANCHES.map(function (b) { return '<option>' + esc(b.n) + '</option>'; }).join('');

  $('#revList').innerHTML = VV.REVIEWS.map(function (r) {
    var w = r.n.split(' ');
    return '<article class="rc"><div class="rc-h"><span class="rc-av" aria-hidden="true">' + w[w.length - 1].charAt(0) + '</span><div><b>' + esc(r.n) + '</b><small>' + esc(r.car) + '</small></div><span class="rc-ago">' + r.ago + '</span></div>' +
      '<p class="rc-st" aria-label="' + r.s + ' sao">' + stars(r.s) + '<span>Đã mua tại Vành Việt</span></p><p>' + esc(r.t) + '</p><p class="rc-buy">Sản phẩm: ' + esc(r.buy) + '</p></article>';
  }).join('');

  $('#tipList').innerHTML = VV.TIPS.map(function (t) {
    return '<a class="tip" href="#' + t.go + '"><img src="' + IMG(t.img, 480, 300) + '" alt="" width="480" height="300" loading="lazy" decoding="async"><p class="tip-m"><b>' + t.tag + '</b><span>' + t.date + '</span></p><h3>' + t.t + '</h3></a>';
  }).join('');

  $('#brList').innerHTML = VV.BRANCHES.map(function (b) {
    return '<li><b>' + esc(b.n) + '</b><span class="ba">' + esc(b.a) + ' <i>(minh hoạ)</i></span><span class="bm">Mở cửa ' + b.h + ' · <a href="tel:' + b.p.replace(/\s/g, '') + '">' + b.p + '</a></span><span class="bt">' + b.note + '</span></li>';
  }).join('');

  /* =========================================================
     TRẢ GÓP
     ========================================================= */
  var inst = { price: 20000000, down: 0, term: 6 }, monthObj = { v: 0 }, iPrice = $('#iPrice');
  function setInstPrice(v) {
    v = Math.max(3000000, Math.min(150000000, Math.round(v / 500000) * 500000));
    inst.price = v; iPrice.value = v; renderInst();
  }
  function renderInst() {
    var down = inst.price * inst.down / 100, loan = inst.price - down, m = loan / inst.term;
    $('#iPriceOut').textContent = fmt(inst.price);
    iPrice.style.setProperty('--p', ((inst.price - 3000000) / 147000000 * 100).toFixed(1) + '%');
    $('#iDownV').textContent = fmt(down);
    $('#iLoan').textContent = fmt(loan);
    if (anim) G.to(monthObj, { v: m, duration: .5, ease: 'power2.out', overwrite: true, onUpdate: function () { $('#iMonthly').textContent = fmt(Math.round(monthObj.v / 1000) * 1000); } });
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
  var EX = [
    { t: '4 mâm 17″ VV-1714', s: '14 chấu mảnh bạc', items: [['m1714', 4]] },
    { t: '4 lốp Nordak AllGrip 205/55R16', s: 'Sedan hạng C', items: [['t1655', 4]] },
    { t: '4 mâm 17″ VV-1714 + 4 lốp 215/60R17', s: 'Trọn bộ 4 bánh', items: [['m1714', 4], ['t1760', 4]] },
    { t: 'Bộ mâm zin 18″ + lốp Bridgestone Alenza', s: 'Hàng tháo xe, giá cả bộ', items: [['cb1855', 1]] }
  ];
  $('#instEx').innerHTML = EX.map(function (x) {
    var tot = x.items.reduce(function (s, it) { return s + byId[it[0]].price * it[1]; }, 0);
    var m = function (n) { return fmt(Math.ceil(tot / n / 1000) * 1000); };
    return '<tr><td>' + x.t + '<small>' + x.s + '</small></td><td>' + fmt(tot) + '</td><td><b>' + m(6) + '</b></td><td><b>' + m(12) + '</b></td></tr>';
  }).join('');
  $('#iFromCfg').addEventListener('click', function () { setInstPrice(cfg.total); toast('Đã lấy giá bộ cấu hình: <b>' + fmt(cfg.total) + '</b>'); });
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
    var f = bf.elements, box = $('#bookOk'), dp = f.date.value.split('-');
    box.innerHTML = 'Đã ghi nhận lịch <b>' + esc(f.service.value) + '</b> tại <b>' + esc(f.branch.value) + '</b>, khung <b>' + esc(f.time.value) + '</b> ngày <b>' + dp[2] + '/' + dp[1] + '/' + dp[0] + '</b> cho ' + esc(f.name.value.trim()) + '. Nhân viên sẽ gọi ' + esc(cleanPhone(f.phone.value)) + ' để xác nhận (minh hoạ – không gửi dữ liệu).';
    box.hidden = false;
    if (anim) G.from(box, { y: 8, opacity: 0, duration: .4, ease: 'power2.out' });
  });

  /* =========================================================
     KHỞI TẠO
     ========================================================= */
  renderMakes(); renderModels(); renderDia(); renderDesigns(); renderFinishes(); updateCfg(null);
  syncFilterUI(); renderProducts(false); renderCart();
  renderDec(true); renderInst();

  /* xe lăn vào khi khối cấu hình xuất hiện lần đầu */
  if (anim && 'IntersectionObserver' in window) {
    var cfgSeen = false;
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting && !cfgSeen) { cfgSeen = true; updateCfg('car'); io.disconnect(); } }, { threshold: .4 });
    io.observe($('.stage'));
  }

  var cr = $('#credits');
  if (cr) cr.innerHTML = 'Ảnh sản phẩm (đã tách nền): ' + VV.CREDITS.map(function (c) { return '<a href="' + c.u + '" target="_blank" rel="noopener">' + esc(c.a) + '</a> (' + c.s + ', ' + c.l + ')'; }).join(', ') + '. Ảnh banner, bài viết: Unsplash.';

  window.VVApp = { cart: function () { return cart; }, cfg: cfg, state: function () { return state; }, renderProducts: renderProducts, applyPreset: applyPreset };
})();
