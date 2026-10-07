/* Tín Việt Auto – dùng chung: header, footer, yêu thích, so sánh, toast, modal */
(function () {
  'use strict';
  var TV = window.TV = window.TV || {};
  var D = window.TVDATA;

  TV.info = {
    name: 'Tín Việt Auto',
    hotline: '0900 000 868',
    tel: '0900000868',
    zalo: 'https://zalo.me/0900000868',
    email: 'lienhe@tinvietauto.vn',
    address: 'Số 1 Đường Minh Hoạ, Cầu Giấy, Hà Nội (minh hoạ)',
    hours: '8:00 – 20:00, cả Chủ nhật',
    slogan: 'Xe rõ lịch sử, giá rõ từng đồng'
  };

  /* ---------- helpers ---------- */
  TV.$ = function (s, r) { return (r || document).querySelector(s); };
  TV.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  TV.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  TV.num = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  TV.km = function (n) { return TV.num(n) + ' km'; };
  TV.vnd = function (n) { return TV.num(n) + ' đ'; };
  TV.price = function (v) {
    if (v >= 1e9) {
      var ty = Math.floor(v / 1e9), tr = Math.round((v - ty * 1e9) / 1e6);
      return ty + ' tỷ' + (tr ? ' ' + tr + ' triệu' : '');
    }
    return Math.round(v / 1e6) + ' triệu';
  };
  TV.priceShort = function (v) {
    if (v >= 1e9) return (v / 1e9).toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',') + ' tỷ';
    return Math.round(v / 1e6) + ' tr';
  };
  TV.slug = function (s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  TV.norm = function (s) { return TV.slug(s).replace(/-/g, ' '); };
  TV.param = function (k) { return new URLSearchParams(location.search).get(k); };
  TV.icon = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  TV.carById = function (id) { for (var i = 0; i < D.cars.length; i++) if (D.cars[i].id === id) return D.cars[i]; return null; };
  TV.phoneOk = function (v) { return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(String(v).replace(/[\s.\-]/g, '')); };
  TV.emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v).trim()); };

  /* ---------- storage (try/catch: chế độ ẩn danh có thể chặn) ---------- */
  var mem = {};
  TV.load = function (k) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : []; } catch (e) { return mem[k] || []; }
  };
  TV.save = function (k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ }
  };
  function clean(list) { return list.filter(function (id, i) { return TV.carById(id) && list.indexOf(id) === i; }); }
  TV.favs = function () { return clean(TV.load('tv_favs')); };
  TV.cmps = function () { return clean(TV.load('tv_compare')).slice(0, 3); };
  TV.isFav = function (id) { return TV.favs().indexOf(id) > -1; };
  TV.isCmp = function (id) { return TV.cmps().indexOf(id) > -1; };
  TV.toggleFav = function (id) {
    var f = TV.favs(), i = f.indexOf(id), on = i < 0;
    if (on) f.unshift(id); else f.splice(i, 1);
    TV.save('tv_favs', f);
    TV.toast(on ? 'Đã lưu vào danh sách yêu thích' : 'Đã bỏ khỏi danh sách yêu thích');
    TV.sync();
    return on;
  };
  TV.toggleCmp = function (id) {
    var c = TV.cmps(), i = c.indexOf(id);
    if (i > -1) { c.splice(i, 1); TV.save('tv_compare', c); TV.toast('Đã bỏ xe khỏi so sánh'); TV.sync(); return false; }
    if (c.length >= 3) { TV.toast('Chỉ so sánh tối đa 3 xe. Bỏ bớt 1 xe để thêm xe mới.', 'warn'); return false; }
    c.push(id); TV.save('tv_compare', c); TV.toast('Đã thêm vào so sánh (' + c.length + '/3)'); TV.sync();
    return true;
  };
  TV.sync = function () {
    var f = TV.favs(), c = TV.cmps();
    TV.$$('[data-fav-count]').forEach(function (b) { b.textContent = f.length; b.setAttribute('data-n', f.length); });
    TV.$$('[data-cmp-count]').forEach(function (b) { b.textContent = c.length; b.setAttribute('data-n', c.length); });
    TV.$$('[data-fav]').forEach(function (b) {
      var on = f.indexOf(b.getAttribute('data-fav')) > -1;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      var l = b.getAttribute('data-label');
      if (l) b.querySelector('span').textContent = on ? 'Đã lưu' : 'Lưu xe';
    });
    TV.$$('[data-cmp]').forEach(function (b) {
      var on = c.indexOf(b.getAttribute('data-cmp')) > -1;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      var l = b.getAttribute('data-label');
      if (l) b.querySelector('span').textContent = on ? 'Đang so sánh' : 'So sánh';
    });
    renderTray();
    document.dispatchEvent(new CustomEvent('tv:change'));
  };

  /* ---------- toast ---------- */
  TV.toast = function (msg, type) {
    var w = TV.$('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); }
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.innerHTML = TV.icon(type === 'warn' ? 'info' : 'check') + '<span>' + TV.esc(msg) + '</span>';
    w.appendChild(t);
    while (w.children.length > 3) w.removeChild(w.firstChild);
    setTimeout(function () { t.remove(); }, 2600);
  };

  /* ---------- share ---------- */
  TV.share = function (car) {
    var url = new URL('xe.html?id=' + encodeURIComponent(car.id), location.href).href;
    var data = { title: car.name + ' – ' + TV.price(car.price), url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var done = function () { TV.toast('Đã sao chép liên kết xe'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); });
    else fallbackCopy(url);
    function fallbackCopy(u) {
      var ta = document.createElement('textarea'); ta.value = u; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { TV.toast('Liên kết: ' + u); }
      ta.remove();
    }
  };

  /* ---------- modal (Esc, click nền, khoá cuộn) ---------- */
  var openModal = null, lastFocus = null;
  TV.openModal = function (el, onClose) {
    if (openModal) TV.closeModal();
    lastFocus = document.activeElement;
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    openModal = { el: el, onClose: onClose };
    var f = el.querySelector('.modal-close'); if (f) f.focus();
  };
  TV.closeModal = function () {
    if (!openModal) return;
    var m = openModal; openModal = null;
    m.el.classList.remove('open'); m.el.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (m.onClose) m.onClose();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  TV.modalOpen = function () { return !!openModal; };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openModal) { TV.closeModal(); return; }
      var d = TV.$('.drawer.open'); if (d) TV.closeDrawer();
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) TV.closeModal();
  });
  /* giữ focus trong modal khi bấm Tab */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !openModal) return;
    var f = TV.$$('button,a[href],video[controls]', openModal.el).filter(function (x) { return !x.hidden && x.offsetParent !== null; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- car card ---------- */
  TV.tagHtml = function (car) {
    var map = { 'Lướt': 'tag-luot', 'Mới về': 'tag-moi', 'Giá tốt': 'tag-gia' };
    return car.tags.map(function (t) { return '<span class="tag ' + map[t] + '">' + t + '</span>'; }).join('');
  };
  TV.card = function (car, opts) {
    opts = opts || {};
    var url = 'xe.html?id=' + encodeURIComponent(car.id);
    var fav = TV.isFav(car.id), cmp = TV.isCmp(car.id);
    return '<article class="card"' + (opts.reveal ? ' data-reveal' : '') + '>' +
      '<div class="card-media">' +
        '<a href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + car.img + '" alt="' + TV.esc(car.name) + ', màu ' + TV.esc(car.color.toLowerCase()) + '" loading="lazy" width="1200" height="900"></a>' +
        '<div class="tags">' + TV.tagHtml(car) + '</div>' +
        '<button class="fav-btn' + (fav ? ' on' : '') + '" type="button" data-fav="' + car.id + '" aria-pressed="' + fav + '" aria-label="Lưu ' + TV.esc(car.name) + ' vào yêu thích">' + TV.icon('heart') + '</button>' +
        '<div class="spec-ov"><dl>' +
          '<dt>Phiên bản</dt><dd>' + TV.esc(car.version) + '</dd>' +
          '<dt>Động cơ</dt><dd>' + TV.esc(car.engine) + '</dd>' +
          '<dt>Dẫn động</dt><dd>' + TV.esc(car.drive) + '</dd>' +
          '<dt>Màu ngoại thất</dt><dd>' + TV.esc(car.color) + '</dd>' +
          '<dt>Số chỗ</dt><dd>' + car.seats + ' chỗ</dd>' +
          '<dt>Xuất xứ</dt><dd>' + TV.esc(car.origin) + '</dd>' +
          '<dt>Biển số</dt><dd>' + TV.esc(car.plate) + ', ' + car.owners + ' chủ</dd>' +
        '</dl><a class="ov-link" href="' + url + '">Xem chi tiết & ảnh thật ' + TV.icon('arrow-right') + '</a></div>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title"><a href="' + url + '">' + TV.esc(car.name) + '</a></h3>' +
        '<div class="meta">' +
          '<span>' + TV.icon('calendar') + car.year + '</span>' +
          '<span>' + TV.icon('gauge') + TV.km(car.odo) + '</span>' +
          '<span>' + TV.icon('fuel') + car.fuel + '</span>' +
          '<span>' + TV.icon('gear') + (car.trans === 'Số tự động' ? 'Tự động' : 'Số sàn') + '</span>' +
        '</div>' +
        '<div class="price-row"><span class="price">' + TV.price(car.price) + '</span><span class="price-sub">Trả trước từ ' + TV.price(Math.ceil(car.price * 0.3 / 1e6) * 1e6) + '</span></div>' +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="icon-btn cmp' + (cmp ? ' on' : '') + '" type="button" data-cmp="' + car.id + '" aria-pressed="' + cmp + '" title="So sánh" aria-label="Thêm ' + TV.esc(car.name) + ' vào so sánh">' + TV.icon('compare') + '</button>' +
        '<button class="icon-btn" type="button" data-share="' + car.id + '" title="Chia sẻ" aria-label="Chia sẻ ' + TV.esc(car.name) + '">' + TV.icon('share') + '</button>' +
        '<a class="btn btn-red btn-call" href="tel:' + TV.info.tel + '">' + TV.icon('phone') + 'Gọi tư vấn</a>' +
        '<a class="btn btn-zalo" href="' + TV.info.zalo + '" target="_blank" rel="noopener" aria-label="Nhắn Zalo về ' + TV.esc(car.name) + '">Zalo</a>' +
      '</div>' +
    '</article>';
  };

  /* uỷ quyền click cho mọi nút trong card */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (b) { e.preventDefault(); TV.toggleFav(b.getAttribute('data-fav')); return; }
    b = e.target.closest('[data-cmp]');
    if (b) { e.preventDefault(); TV.toggleCmp(b.getAttribute('data-cmp')); return; }
    b = e.target.closest('[data-share]');
    if (b) { e.preventDefault(); var c = TV.carById(b.getAttribute('data-share')); if (c) TV.share(c); }
  });

  /* ---------- compare tray ---------- */
  function renderTray() {
    var tray = TV.$('.cmp-tray');
    if (!tray || document.body.getAttribute('data-view') === 'compare') return;
    var c = TV.cmps();
    tray.classList.toggle('show', c.length > 0);
    tray.querySelector('.thumbs').innerHTML = c.map(function (id) { var car = TV.carById(id); return '<img src="' + car.img + '" alt="' + TV.esc(car.name) + '">'; }).join('');
    tray.querySelector('.t-txt').innerHTML = 'Đang chọn <b>' + c.length + '/3</b> xe';
  }

  /* ---------- logo ---------- */
  TV.logoSvg = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="9" fill="#bf1722"/>' +
    '<path d="M9 11.5h22" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M20 11.5v6" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M11.5 20.5l8.5 9.5 8.5-9.5" fill="none" stroke="#f2b41c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function logo() {
    return '<a class="logo" href="index.html" aria-label="Tín Việt Auto – trang chủ">' + TV.logoSvg +
      '<span class="logo-txt"><b>TÍN VIỆT <span>AUTO</span></b><small>Xe lướt · Đã kiểm định</small></span></a>';
  }

  /* ---------- icon sprite ---------- */
  var P = {
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
    compare: '<path d="M4 8h13M14 4.5L17.5 8 14 11.5M20 16H7M10 12.5L6.5 16 10 19.5"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1.2"/>',
    fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10"/><path d="M14 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
    gear: '<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v8M12 8v8M18 8v4H6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    'chev-l': '<path d="M15 5l-7 7 7 7"/>',
    'chev-r': '<path d="M9 5l7 7-7 7"/>',
    'chev-d': '<path d="M5 9l7 7 7-7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    'check-c': '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.2 9.6"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.5-6.5M14.5 6.5L9.5 3 3 9.5l3.5 5L14.5 6.5"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M4 4l16 16"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    car: '<path d="M5 17h14v-4.5l-2-5H7l-2 5zM3 13h18"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" fill="currentColor" stroke="none"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    seat: '<path d="M7 3h5l1 9h5l1 6H8z"/><path d="M8 18v3M17 18v3"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
    youtube: '<rect x="2.5" y="6" width="19" height="12" rx="3.5"/><path d="M10 9.5v5l4.5-2.5z"/>'
  };
  function sprite() {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">';
    for (var k in P) s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + P[k] + '</symbol>';
    return s + '</svg>';
  }

  /* ---------- header ---------- */
  function countBy(field) {
    var m = {}; D.cars.forEach(function (c) { m[c[field]] = (m[c[field]] || 0) + 1; }); return m;
  }
  function header(active) {
    var bc = countBy('brand'), bd = countBy('body');
    var brandChips = D.brands.map(function (b) {
      return '<a class="chip" href="index.html?hang=' + TV.slug(b) + '#danh-sach">' + b + ' <em>' + (bc[b] || 0) + '</em></a>';
    }).join('');
    var bodies = D.bodies.map(function (b) { return '<a href="index.html?kieu=' + TV.slug(b) + '#danh-sach">' + b + '<em>' + (bd[b] || 0) + ' xe</em></a>'; }).join('');
    var prices = D.priceRanges.map(function (p) { return '<a href="index.html?gia=' + p.key + '#danh-sach">' + p.label + '</a>'; }).join('');
    var nav = function (href, label, key) { return '<a href="' + href + '"' + (active === key ? ' class="active" aria-current="page"' : '') + '>' + label + '</a>'; };
    return '<div class="topbar"><div class="container topbar-in">' +
        '<span>' + TV.icon('clock') + 'Mở cửa ' + TV.info.hours + '</span>' +
        '<span>' + TV.icon('pin') + TV.info.address + '</span>' +
        '<span class="topbar-right"><a href="index.html#dinh-gia">Định giá xe miễn phí</a><a href="mailto:' + TV.info.email + '">' + TV.info.email + '</a></span>' +
      '</div></div>' +
      '<header class="site-header" id="top"><div class="container mainbar-in">' +
        '<button class="burger" type="button" aria-label="Mở menu" aria-expanded="false" aria-controls="drawer">' + TV.icon('menu') + '</button>' +
        logo() +
        '<nav class="nav" aria-label="Menu chính">' +
          '<div class="nav-item"><a href="index.html#danh-sach"' + (active === 'home' ? ' class="active"' : '') + '>Mua xe ' + TV.icon('chev-d') + '</a>' +
            '<div class="mega"><div><h4>Theo hãng xe</h4><div class="chips">' + brandChips + '</div>' +
              '<p class="note" style="margin:14px 0 0">' + D.cars.length + ' xe đang bán · cập nhật hằng ngày</p></div>' +
              '<div><h4>Kiểu dáng</h4><div class="mega-list">' + bodies + '</div></div>' +
              '<div><h4>Khoảng giá</h4><div class="mega-list">' + prices + '</div></div></div></div>' +
          nav('index.html#dinh-gia', 'Ký gửi – Định giá', 'consign') +
          nav('index.html#tra-gop', 'Trả góp', 'loan') +
          nav('tin-tuc.html', 'Tin tức', 'news') +
          nav('lien-he.html', 'Liên hệ', 'contact') +
        '</nav>' +
        '<form class="hsearch in-bar" action="index.html" role="search"><label class="sr-only" for="hq">Tìm xe</label><input id="hq" name="q" type="search" placeholder="Tìm xe: Vios, CR-V…" autocomplete="off"><button type="submit" aria-label="Tìm kiếm">' + TV.icon('search') + '</button></form>' +
        '<div class="h-actions">' +
          '<a class="hicon cmp-link" href="so-sanh.html" title="So sánh xe" aria-label="So sánh xe">' + TV.icon('compare') + '<span class="badge" data-cmp-count data-n="0">0</span></a>' +
          '<a class="hicon" href="yeu-thich.html" title="Xe yêu thích" aria-label="Xe yêu thích">' + TV.icon('heart') + '<span class="badge" data-fav-count data-n="0">0</span></a>' +
          '<a class="btn btn-red hotline" href="tel:' + TV.info.tel + '" aria-label="Gọi hotline ' + TV.info.hotline + '">' + TV.icon('phone') + '<span><small>Hotline</small>' + TV.info.hotline + '</span></a>' +
        '</div>' +
      '</div></header>' +
      '<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer-bg" data-drawer-close></div>' +
        '<div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">' +
          '<div class="drawer-head">' + logo() + '<button class="icon-btn" type="button" data-drawer-close aria-label="Đóng menu">' + TV.icon('close') + '</button></div>' +
          '<div class="drawer-body">' +
            '<form class="hsearch" action="index.html" role="search"><label class="sr-only" for="dq">Tìm xe</label><input id="dq" name="q" type="search" placeholder="Tìm tên xe, dòng xe…"><button type="submit" aria-label="Tìm kiếm">' + TV.icon('search') + '</button></form>' +
            '<nav class="drawer-nav" aria-label="Menu di động">' +
              '<a href="index.html#danh-sach">Xe đang bán <em class="note">' + D.cars.length + ' xe</em></a>' +
              '<a href="index.html#dinh-gia">Ký gửi – Định giá</a><a href="index.html#tra-gop">Tính trả góp</a>' +
              '<a href="so-sanh.html">So sánh xe <span class="note"><span data-cmp-count data-n="0">0</span>/3</span></a>' +
              '<a href="yeu-thich.html">Xe yêu thích <span class="note" data-fav-count data-n="0">0</span></a>' +
              '<a href="tin-tuc.html">Tin tức – Kinh nghiệm</a><a href="lien-he.html">Liên hệ</a></nav>' +
            '<div><h4>Hãng xe</h4><div class="chips">' + brandChips + '</div></div>' +
            '<a class="btn btn-red btn-block" href="tel:' + TV.info.tel + '">' + TV.icon('phone') + 'Gọi ' + TV.info.hotline + '</a>' +
            '<p class="note">' + TV.info.address + '<br>Mở cửa ' + TV.info.hours + '</p>' +
          '</div></div></div>';
  }

  /* ---------- footer ---------- */
  function credits() {
    var seen = {}, items = [];
    (D.credits || []).forEach(function (c) {
      var k = c.page; if (seen[k]) return; seen[k] = 1;
      items.push('<li>' + TV.esc(c.label) + ': <a href="' + c.page + '" target="_blank" rel="noopener">' + TV.esc(c.author) + '</a>, ' + TV.esc(c.license) + (c.source ? ' (' + c.source + ')' : '') + '</li>');
    });
    return items.join('');
  }
  function footer() {
    var brandLinks = D.brands.slice(0, 7).map(function (b) { return '<li><a href="index.html?hang=' + TV.slug(b) + '#danh-sach">Xe ' + b + ' cũ</a></li>'; }).join('');
    return '<footer class="footer"><div class="container">' +
      '<div class="f-grid">' +
        '<div>' + logo() + '<p class="f-about">Showroom xe lướt và ô tô đã qua sử dụng. Mỗi xe đều có phiếu kiểm định, ảnh chụp thật tại bãi và giá niêm yết công khai.</p>' +
          '<ul class="f-contact">' +
            '<li>' + TV.icon('pin') + '<span>' + TV.info.address + '</span></li>' +
            '<li>' + TV.icon('phone') + '<a href="tel:' + TV.info.tel + '">' + TV.info.hotline + ' (minh hoạ)</a></li>' +
            '<li>' + TV.icon('mail') + '<a href="mailto:' + TV.info.email + '">' + TV.info.email + ' (minh hoạ)</a></li>' +
            '<li>' + TV.icon('clock') + '<span>' + TV.info.hours + '</span></li>' +
          '</ul></div>' +
        '<div><h4>Mua xe theo hãng</h4><ul class="f-links">' + brandLinks + '</ul></div>' +
        '<div><h4>Dịch vụ & hỗ trợ</h4><ul class="f-links">' +
          '<li><a href="index.html#dinh-gia">Định giá & ký gửi xe</a></li><li><a href="index.html#tra-gop">Tính trả góp</a></li>' +
          '<li><a href="index.html#quy-trinh">Quy trình mua xe</a></li><li><a href="so-sanh.html">So sánh xe</a></li>' +
          '<li><a href="yeu-thich.html">Xe đã lưu</a></li><li><a href="tin-tuc.html">Kinh nghiệm mua xe</a></li><li><a href="lien-he.html">Liên hệ – chỉ đường</a></li></ul></div>' +
        '<div><h4>Bản đồ showroom</h4>' + TV.mapPh() + '</div>' +
      '</div>' +
      '<div class="f-bottom"><span>© 2026 Tín Việt Auto. Thương hiệu, địa chỉ, số điện thoại và các cam kết trên trang là nội dung minh hoạ cho mẫu giao diện.</span>' +
        '<details><summary>Nguồn ảnh & giấy phép (Wikimedia Commons, Pexels)</summary><p style="margin:10px 0 0">Ảnh xe lấy từ Wikimedia Commons theo giấy phép ghi bên cạnh; đã cắt khung 4:3, đổi kích thước, nén WebP (một ảnh được làm mờ biển số). Video từ Pexels (giấy phép Pexels).</p><ul class="credits">' + credits() + '</ul></details>' +
      '</div></div></footer>' +
      '<div class="cmp-tray" role="region" aria-label="Xe đang so sánh"><div class="thumbs"></div><span class="t-txt"></span>' +
        '<a class="btn btn-yellow btn-sm" href="so-sanh.html">So sánh ngay</a>' +
        '<button class="icon-btn" type="button" data-cmp-clear aria-label="Bỏ chọn tất cả">' + TV.icon('close') + '</button></div>' +
      '<nav class="mbar" aria-label="Liên hệ nhanh"><div class="mbar-in">' +
        '<a class="call" href="tel:' + TV.info.tel + '">' + TV.icon('phone') + 'Gọi ngay</a>' +
        '<a href="' + TV.info.zalo + '" target="_blank" rel="noopener">' + TV.icon('chat') + 'Zalo</a>' +
        '<a href="index.html#dinh-gia">' + TV.icon('tag') + 'Định giá</a>' +
        '<a href="yeu-thich.html">' + TV.icon('heart') + 'Đã lưu<span class="badge" data-fav-count data-n="0">0</span></a>' +
      '</div></nav>';
  }
  TV.mapPh = function (lg) {
    return '<div class="map-ph' + (lg ? ' lg' : '') + '" role="img" aria-label="Bản đồ minh hoạ vị trí showroom tại Cầu Giấy, Hà Nội">' +
      '<span class="pin">' + TV.icon('pin') + '</span>' +
      '<div class="map-lbl"><span><b>Tín Việt Auto</b><br>Cầu Giấy, Hà Nội · bản đồ minh hoạ</span><a class="btn btn-ink btn-sm" href="lien-he.html">Chỉ đường</a></div></div>';
  };

  /* ---------- drawer ---------- */
  TV.openDrawer = function () {
    var d = TV.$('#drawer'); d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
    TV.$('.burger').setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    var b = d.querySelector('[data-drawer-close].icon-btn'); if (b) b.focus();
  };
  TV.closeDrawer = function () {
    var d = TV.$('#drawer'); if (!d) return;
    d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
    TV.$('.burger').setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  };

  /* ---------- reveal ---------- */
  TV.reveal = function (root) {
    var els = TV.$$('[data-reveal]:not(.in)', root);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (!TV._io) TV._io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); TV._io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    els.forEach(function (e) { TV._io.observe(e); });
  };

  /* ---------- form helpers ---------- */
  TV.setErr = function (fld, msg) {
    var wrap = fld.closest('.fld'); if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!msg);
    var e = wrap.querySelector('.err'); if (e) e.textContent = msg || '';
    var inp = wrap.querySelector('input,select,textarea'); if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  TV.refCode = function (prefix) {
    var d = new Date(), p = function (n) { return ('0' + n).slice(-2); };
    return prefix + '-' + p(d.getDate()) + p(d.getMonth() + 1) + '-' + Math.floor(1000 + Math.random() * 9000);
  };

  /* ---------- tin tức & accordion ---------- */
  TV.date = function (s) { var p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  TV.newsById = function (id) { var n = D.news || []; for (var i = 0; i < n.length; i++) if (n[i].id === id) return n[i]; return null; };
  TV.newsCard = function (n) {
    var url = 'bai-viet.html?id=' + encodeURIComponent(n.id);
    return '<article class="ncard" data-reveal><a class="n-media" href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + n.img + '" alt="' + TV.esc(n.imgAlt) + '" loading="lazy" width="1200" height="900"></a>' +
      '<div class="n-body"><span class="n-cat">' + n.cat + '</span><h3><a href="' + url + '">' + TV.esc(n.title) + '</a></h3><p>' + TV.esc(n.excerpt) + '</p>' +
      '<div class="n-meta"><span>' + TV.date(n.date) + '</span><span>' + n.read + ' phút đọc</span></div></div></article>';
  };
  TV.accordion = function (root, items) {
    root.innerHTML = items.map(function (it, i) {
      return '<div class="acc-item"><h3 style="margin:0;font-size:inherit"><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc-p' + i + '" id="acc-b' + i + '">' + TV.esc(it[0]) + TV.icon('chev-d') + '</button></h3>' +
        '<div class="acc-panel" id="acc-p' + i + '" role="region" aria-labelledby="acc-b' + i + '" hidden><div>' + TV.esc(it[1]) + '</div></div></div>';
    }).join('');
    TV.$$('.acc-btn', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = document.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', !open);
        if (!open) {
          p.hidden = false; p.style.height = '0px';
          requestAnimationFrame(function () { p.style.height = p.scrollHeight + 'px'; });
          p.addEventListener('transitionend', function te() { p.style.height = 'auto'; p.removeEventListener('transitionend', te); });
        } else {
          p.style.height = p.scrollHeight + 'px';
          requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.height = '0px'; }); });
          p.addEventListener('transitionend', function te() { p.hidden = true; p.removeEventListener('transitionend', te); });
        }
      });
    });
  };

  /* ---------- init ---------- */
  TV.init = function (page, active) {
    document.body.setAttribute('data-view', page);
    document.body.insertAdjacentHTML('afterbegin', sprite() + '<a class="skip" href="#main">Bỏ qua menu</a>');
    var h = TV.$('#site-header'); if (h) h.outerHTML = header(active || page);
    var f = TV.$('#site-footer'); if (f) f.outerHTML = footer();
    var q = TV.param('q'); if (q) TV.$$('input[name=q]').forEach(function (i) { i.value = q; });
    TV.$('.burger').addEventListener('click', TV.openDrawer);
    TV.$$('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', TV.closeDrawer); });
    TV.$$('.drawer a').forEach(function (a) { a.addEventListener('click', TV.closeDrawer); });
    var clr = TV.$('[data-cmp-clear]');
    if (clr) clr.addEventListener('click', function () { TV.save('tv_compare', []); TV.sync(); TV.toast('Đã bỏ chọn so sánh'); });
    var hdr = TV.$('.site-header');
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    window.addEventListener('storage', function (e) { if (e.key === 'tv_favs' || e.key === 'tv_compare') TV.sync(); });
    TV.sync();
    TV.reveal();
  };
})();
