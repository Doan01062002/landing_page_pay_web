/* Trang chủ: slider, bộ lọc xe, form định giá, video, tin tức, hỏi đáp */
(function () {
  'use strict';
  var TV = window.TV, D = window.TVDATA;
  TV.init('home', 'home');
  var $ = TV.$, $$ = TV.$$;

  /* ================= SLIDER ================= */
  (function slider() {
    var root = $('#hero-slider'), track = $('#slides'), dotsWrap = $('.sl-dots', root);
    var slides = D.slides.map(function (s, i) {
      var car = TV.carById(s.car);
      var H = i === 0 ? 'h1' : 'h2';
      return '<div class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + D.slides.length + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
        '<div class="slide-media"><img src="' + car.img + '" alt="' + TV.esc(car.name) + '" ' + (i ? 'loading="lazy"' : 'fetchpriority="high"') + ' width="1200" height="900"></div>' +
        '<div class="slide-body"><span class="slide-kicker">' + s.kicker + '</span><' + H + '>' + s.title + '</' + H + '><p>' + s.text + '</p>' +
          (s.showPrice ? '<div class="slide-price">' + TV.esc(car.name) + ' <b>' + TV.price(car.price) + '</b></div>' : '') +
          '<div class="slide-cta">' + s.cta.map(function (c, k) { return '<a class="btn ' + (k ? 'btn-white' : 'btn-red') + '" href="' + c[1] + '"' + (i ? ' tabindex="-1"' : '') + '>' + c[0] + '</a>'; }).join('') + '</div>' +
          (s.meta ? '<div class="slide-meta">' + s.meta.map(function (m) { return '<span><b>' + m[0] + '</b>' + m[1] + '</span>'; }).join('') + '</div>' : '') +
        '</div></div>';
    });
    track.innerHTML = slides.join('');
    dotsWrap.innerHTML = D.slides.map(function (s, i) { return '<button type="button" role="tab" aria-label="Slide ' + (i + 1) + '" aria-current="' + (i === 0) + '"></button>'; }).join('');
    var n = D.slides.length, cur = 0, timer = null, paused = false;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(i) {
      cur = (i + n) % n;
      track.style.transform = 'translateX(' + (-cur * 100) + '%)';
      $$('.slide', track).forEach(function (s, k) {
        s.setAttribute('aria-hidden', k !== cur);
        $$('a', s).forEach(function (a) { if (k === cur) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); });
      });
      $$('button', dotsWrap).forEach(function (d, k) { d.setAttribute('aria-current', k === cur); });
      root.setAttribute('data-index', cur);
    }
    function start() { stop(); if (!reduce && !paused) timer = setInterval(function () { go(cur + 1); }, 5500); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    $('.sl-prev', root).addEventListener('click', function () { go(cur - 1); start(); });
    $('.sl-next', root).addEventListener('click', function () { go(cur + 1); start(); });
    $$('button', dotsWrap).forEach(function (d, k) { d.addEventListener('click', function () { go(k); start(); }); });
    root.addEventListener('mouseenter', function () { paused = true; stop(); });
    root.addEventListener('mouseleave', function () { paused = false; start(); });
    root.addEventListener('focusin', function () { paused = true; stop(); });
    root.addEventListener('focusout', function () { paused = false; start(); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(cur - 1); } else if (e.key === 'ArrowRight') { go(cur + 1); }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    /* vuốt (pointer events: chuột + cảm ứng) */
    var x0 = null, y0 = 0, dx = 0, w = 1, dragging = false;
    root.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button')) return;
      x0 = e.clientX; y0 = e.clientY; dx = 0; w = root.offsetWidth; dragging = false; stop();
    });
    root.addEventListener('pointermove', function (e) {
      if (x0 === null) return;
      dx = e.clientX - x0;
      if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) { dragging = true; track.style.transition = 'none'; }
      if (dragging) track.style.transform = 'translateX(' + (-cur * w + dx) / w * 100 + '%)';
    });
    function end() {
      if (x0 === null) return;
      track.style.transition = '';
      if (dragging && Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); else go(cur);
      x0 = null; dragging = false; if (!paused) start();
    }
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    root.addEventListener('pointerleave', end);
    TV.slider = { go: go, get index() { return cur; } };
    go(0); start();
  })();

  $('#stat-count').textContent = D.cars.length;

  /* ================= LỌC XE ================= */
  var OPT = {
    hang: D.brands.map(function (b) { return { key: TV.slug(b), label: b, test: function (c) { return c.brand === b; } }; }),
    kieu: D.bodies.map(function (b) { return { key: TV.slug(b), label: b, test: function (c) { return c.body === b; } }; }),
    gia: D.priceRanges.map(function (p) { return { key: p.key, label: p.label, test: function (c) { return c.price >= p.min && c.price < p.max; } }; }),
    nam: D.yearRanges.map(function (p) { return { key: p.key, label: p.label, test: function (c) { return c.year >= p.min && c.year <= p.max; } }; }),
    hop: [{ key: 'tu-dong', label: 'Số tự động', test: function (c) { return c.trans === 'Số tự động'; } },
          { key: 'so-san', label: 'Số sàn', test: function (c) { return c.trans === 'Số sàn'; } }],
    nl: D.fuels.map(function (f) { return { key: TV.slug(f), label: f === 'Dầu' ? 'Dầu (diesel)' : f, test: function (c) { return c.fuel === f; } }; })
  };
  var PLACE = { hang: 'Tất cả hãng', kieu: 'Tất cả kiểu dáng', gia: 'Mọi mức giá', nam: 'Mọi năm', hop: 'Tất cả', nl: 'Tất cả' };
  var KEYS = ['hang', 'kieu', 'gia', 'nam', 'hop', 'nl'];
  var SORTS = ['moi', 'gia-tang', 'gia-giam', 'nam-moi', 'odo'];
  var PER = 8;
  var F = { q: '', sort: 'moi', page: 1 };
  KEYS.forEach(function (k) { F[k] = ''; });

  function optOf(k, key) { for (var i = 0; i < OPT[k].length; i++) if (OPT[k][i].key === key) return OPT[k][i]; return null; }
  var SYN = { 'Dầu': 'may dau diesel', 'Xăng': 'may xang', 'Hybrid': 'hybrid lai dien' };
  function hay(c) { return c._hay || (c._hay = TV.norm([c.name, c.brand, c.model, c.version, c.body, c.fuel, SYN[c.fuel], c.trans, c.color, c.year, c.engine, c.drive, c.seats + ' cho', c.origin].join(' '))); }
  /* Nếu cả cụm từ khớp nguyên văn ở ít nhất một xe (VD: “số sàn”), lọc theo cụm; nếu không, mọi từ phải khớp đầu một từ */
  var phraseCache = {};
  function phraseMode(qn) {
    if (!(qn in phraseCache)) phraseCache[qn] = qn.indexOf(' ') > -1 && D.cars.some(function (c) { return (' ' + hay(c)).indexOf(' ' + qn) > -1; });
    return phraseCache[qn];
  }
  function match(c, skip) {
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i]; if (k === skip || !F[k]) continue;
      var o = optOf(k, F[k]); if (o && !o.test(c)) return false;
    }
    if (F.q && skip !== 'q') {
      var h = ' ' + hay(c), qn = TV.norm(F.q).trim();
      if (phraseMode(qn)) return h.indexOf(' ' + qn) > -1;
      var toks = qn.split(' ').filter(Boolean);
      for (var t = 0; t < toks.length; t++) if (h.indexOf(' ' + toks[t]) < 0) return false;
    }
    return true;
  }
  function readUrl() {
    var p = new URLSearchParams(location.search);
    F.q = (p.get('q') || '').slice(0, 60);
    KEYS.forEach(function (k) { var v = p.get(k) || ''; F[k] = optOf(k, v) ? v : ''; });
    F.sort = SORTS.indexOf(p.get('sort')) > -1 ? p.get('sort') : 'moi';
    F.page = Math.max(1, parseInt(p.get('page'), 10) || 1);
  }
  function writeUrl() {
    var p = new URLSearchParams();
    if (F.q) p.set('q', F.q);
    KEYS.forEach(function (k) { if (F[k]) p.set(k, F[k]); });
    if (F.sort !== 'moi') p.set('sort', F.sort);
    if (F.page > 1) p.set('page', F.page);
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }
  function fillSelects() {
    KEYS.forEach(function (k) {
      var sel = $('#f-' + k);
      sel.innerHTML = '<option value="">' + PLACE[k] + '</option>' + OPT[k].map(function (o) {
        var cnt = D.cars.filter(function (c) { return o.test(c) && match(c, k); }).length;
        return '<option value="' + o.key + '"' + (F[k] === o.key ? ' selected' : '') + '>' + o.label + ' (' + cnt + ')</option>';
      }).join('');
    });
    $('#brand-chips').innerHTML = '<span class="lbl">Hãng:</span><button type="button" class="chip' + (F.hang ? '' : ' on') + '" data-brand="">Tất cả <em>' + D.cars.filter(function (c) { return match(c, 'hang'); }).length + '</em></button>' +
      OPT.hang.map(function (o) {
        var cnt = D.cars.filter(function (c) { return o.test(c) && match(c, 'hang'); }).length;
        return '<button type="button" class="chip' + (F.hang === o.key ? ' on' : '') + '" data-brand="' + o.key + '" aria-pressed="' + (F.hang === o.key) + '">' + o.label + ' <em>' + cnt + '</em></button>';
      }).join('');
    $('#f-q').value = F.q;
    $('#f-sort').value = F.sort;
  }
  function sorted(list) {
    var s = list.slice();
    var by = {
      'moi': function (a, b) { return b.posted.localeCompare(a.posted) || b.year - a.year; },
      'gia-tang': function (a, b) { return a.price - b.price; },
      'gia-giam': function (a, b) { return b.price - a.price; },
      'nam-moi': function (a, b) { return b.year - a.year || a.odo - b.odo; },
      'odo': function (a, b) { return a.odo - b.odo; }
    }[F.sort];
    return s.sort(by);
  }
  function render(scroll) {
    var list = sorted(D.cars.filter(function (c) { return match(c); }));
    var pages = Math.max(1, Math.ceil(list.length / PER));
    if (F.page > pages) F.page = pages;
    var from = (F.page - 1) * PER, items = list.slice(from, from + PER);
    fillSelects();
    $('#result-count').innerHTML = list.length ? 'Tìm thấy <b>' + list.length + '</b> xe phù hợp' : 'Không tìm thấy xe phù hợp';
    var af = [];
    if (F.q) af.push(['q', '“' + TV.esc(F.q) + '”']);
    KEYS.forEach(function (k) { if (F[k]) af.push([k, optOf(k, F[k]).label]); });
    $('#active-filters').innerHTML = af.map(function (a) {
      return '<span class="af">' + a[1] + '<button type="button" data-rm="' + a[0] + '" aria-label="Bỏ lọc ' + a[1].replace(/"/g, '') + '">' + TV.icon('close') + '</button></span>';
    }).join('') + (af.length ? '<button type="button" class="af-clear" data-rm="all">Xoá tất cả</button>' : '');
    var grid = $('#car-grid');
    if (!items.length) {
      grid.innerHTML = '<div class="empty">' + TV.icon('search') + '<h3>Chưa có xe khớp bộ lọc</h3>' +
        '<p>Thử bỏ bớt điều kiện, hoặc để lại yêu cầu – chúng tôi báo ngay khi có xe phù hợp về bãi.</p>' +
        '<div class="chips" style="justify-content:center"><button class="btn btn-ink" type="button" data-rm="all">Xoá bộ lọc</button>' +
        '<a class="btn btn-line" href="lien-he.html?chu-de=tim-xe">Nhờ tìm xe giúp</a></div></div>';
    } else {
      grid.innerHTML = items.map(function (c) { return TV.card(c); }).join('');
    }
    /* phân trang */
    var pg = $('#pager');
    if (pages <= 1) { pg.innerHTML = ''; }
    else {
      var h = '<button type="button" data-page="' + (F.page - 1) + '"' + (F.page === 1 ? ' disabled' : '') + ' aria-label="Trang trước">' + TV.icon('chev-l') + '</button>';
      for (var i = 1; i <= pages; i++) h += '<button type="button" data-page="' + i + '"' + (i === F.page ? ' aria-current="page"' : '') + ' aria-label="Trang ' + i + '">' + i + '</button>';
      h += '<button type="button" data-page="' + (F.page + 1) + '"' + (F.page === pages ? ' disabled' : '') + ' aria-label="Trang sau">' + TV.icon('chev-r') + '</button>';
      pg.innerHTML = h;
    }
    $('#pager-info').textContent = list.length ? 'Hiển thị ' + (from + 1) + '–' + (from + items.length) + ' trên ' + list.length + ' xe' : '';
    writeUrl();
    if (scroll) $('#danh-sach').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  TV.filterState = F;

  readUrl();
  render(false);
  var hasFilter = F.q || KEYS.some(function (k) { return F[k]; }) || F.page > 1;
  if (hasFilter && !location.hash) setTimeout(function () { $('#danh-sach').scrollIntoView(); }, 50);

  KEYS.forEach(function (k) {
    $('#f-' + k).addEventListener('change', function () { F[k] = this.value; F.page = 1; render(false); });
  });
  $('#f-sort').addEventListener('change', function () { F.sort = this.value; F.page = 1; render(false); });
  var deb;
  $('#f-q').addEventListener('input', function () {
    var v = this.value; clearTimeout(deb);
    deb = setTimeout(function () { F.q = v.trim().slice(0, 60); F.page = 1; render(false); }, 250);
  });
  $('#filter').addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(deb); F.q = $('#f-q').value.trim().slice(0, 60); F.page = 1; render(true); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#brand-chips [data-brand]');
    if (b) { F.hang = b.getAttribute('data-brand'); F.page = 1; render(false); return; }
    b = e.target.closest('#danh-sach [data-rm]');
    if (b) {
      var k = b.getAttribute('data-rm');
      if (k === 'all') { F.q = ''; KEYS.forEach(function (x) { F[x] = ''; }); } else F[k] = '';
      F.page = 1; render(false); return;
    }
    b = e.target.closest('#pager [data-page]');
    if (b && !b.disabled) { F.page = parseInt(b.getAttribute('data-page'), 10); render(true); }
  });
  /* tìm kiếm ở header khi đang ở trang chủ: lọc tại chỗ, không tải lại */
  $$('form.hsearch').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      F.q = f.querySelector('input').value.trim().slice(0, 60);
      KEYS.forEach(function (x) { F[x] = ''; }); F.page = 1;
      TV.closeDrawer(); render(true);
    });
  });
  /* link mega menu cùng trang (index.html?hang=…#danh-sach) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="index.html?"]');
    if (!a) return;
    e.preventDefault();
    var p = new URLSearchParams(a.getAttribute('href').split('?')[1].split('#')[0]);
    F.q = ''; KEYS.forEach(function (x) { F[x] = optOf(x, p.get(x) || '') ? p.get(x) : ''; }); F.page = 1;
    TV.closeDrawer(); render(true);
  });

  /* ================= ĐỊNH GIÁ / KÝ GỬI ================= */
  var years = []; for (var y = 2026; y >= 2008; y--) years.push(y);
  var brandsAll = Object.keys(D.models);
  $('#qv-brand').innerHTML = '<option value="">Hãng xe</option>' + brandsAll.map(function (b) { return '<option>' + b + '</option>'; }).join('');
  $('#qv-year').innerHTML = '<option value="">Năm SX</option>' + years.map(function (y) { return '<option>' + y + '</option>'; }).join('');
  $('#c-brand').innerHTML = '<option value="">Chọn hãng</option>' + brandsAll.map(function (b) { return '<option>' + b + '</option>'; }).join('');
  $('#c-year').innerHTML = '<option value="">Chọn năm</option>' + years.map(function (y) { return '<option>' + y + '</option>'; }).join('');
  var form = $('#consign-form'), tried = false;
  function fillModels() {
    var b = $('#c-brand').value, m = $('#c-model');
    if (!b) { m.innerHTML = '<option value="">Chọn hãng trước</option>'; m.disabled = true; return; }
    m.disabled = false;
    m.innerHTML = '<option value="">Chọn dòng xe</option>' + D.models[b].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '<option>Dòng khác</option>';
  }
  $('#c-brand').addEventListener('change', function () { fillModels(); if (tried) validate(); });
  function validate() {
    var ok = true, f = form.elements;
    var set = function (el, msg) { TV.setErr(el, msg); if (msg) ok = false; };
    set(f.brand, f.brand.value ? '' : 'Vui lòng chọn hãng xe');
    set(f.model, f.model.value ? '' : (f.brand.value ? 'Vui lòng chọn dòng xe' : 'Chọn hãng xe trước'));
    set(f.year, f.year.value ? '' : 'Vui lòng chọn năm sản xuất');
    var odo = f.odo.value.replace(/[.\s,]/g, '');
    set(f.odo, !odo ? 'Nhập số km đã đi' : (!/^\d+$/.test(odo) || +odo > 999999 ? 'Số km chỉ gồm chữ số, tối đa 999.999' : ''));
    var nm = f.name.value.trim();
    set(f.name, nm.length < 2 ? 'Nhập họ tên (ít nhất 2 ký tự)' : (/\d/.test(nm) ? 'Họ tên không chứa chữ số' : ''));
    set(f.phone, !f.phone.value.trim() ? 'Nhập số điện thoại để chúng tôi gọi lại' : (TV.phoneOk(f.phone.value) ? '' : 'Số điện thoại chưa đúng (10 số, bắt đầu 03, 05, 07, 08, 09)'));
    return ok;
  }
  form.addEventListener('input', function () { if (tried) validate(); });
  form.addEventListener('change', function () { if (tried) validate(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); tried = true;
    if (!validate()) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
    var f = form.elements;
    var rows = [['Mã yêu cầu', TV.refCode('DG')], ['Nhu cầu', form.querySelector('[name=need]:checked').value], ['Xe', f.brand.value + ' ' + f.model.value + ' ' + f.year.value],
      ['Odo', TV.km(+f.odo.value.replace(/[.\s,]/g, ''))], ['Liên hệ', f.name.value.trim() + ' · ' + f.phone.value.trim()]];
    $('#consign-sum').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + TV.esc(r[1]) + '</dd>'; }).join('');
    form.classList.add('done'); $('#consign-ok').classList.add('show'); $('#consign-ok').focus();
  });
  $('#consign-again').addEventListener('click', function () {
    form.reset(); fillModels(); tried = false;
    $$('.fld', form).forEach(function (x) { x.classList.remove('is-invalid'); });
    form.classList.remove('done'); $('#consign-ok').classList.remove('show'); $('#c-brand').focus();
  });
  $('#quick-valuation').addEventListener('submit', function (e) {
    e.preventDefault();
    var b = $('#qv-brand').value, y = $('#qv-year').value;
    if (b) { $('#c-brand').value = b; fillModels(); }
    if (y) $('#c-year').value = y;
    $('#dinh-gia').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { (b ? $('#c-model') : $('#c-brand')).focus({ preventScroll: true }); }, 500);
  });

  /* ================= TRẢ GÓP ================= */
  TV.mountCalc($('#calc'), { carId: D.calcDefault });

  /* ================= GIỚI THIỆU ================= */
  [['#intro-img-1', D.intro[0]], ['#intro-img-2', D.intro[1]]].forEach(function (p) {
    var el = $(p[0]); el.src = p[1].src; el.alt = p[1].alt;
  });

  /* ================= VIDEO ================= */
  function vcard(v, cls) {
    if (cls === 'row') {
      return '<button class="vcard row" type="button" data-video="' + v.id + '"><span class="thumb"><img src="' + v.poster + '" alt="" loading="lazy"><span class="play">' + TV.icon('play') + '</span></span>' +
        '<span class="txt"><b>' + v.title + '</b><span>' + v.duration + ' · ' + v.tag + '</span></span></button>';
    }
    return '<button class="vcard ' + cls + '" type="button" data-video="' + v.id + '"><img src="' + v.poster + '" alt="" loading="lazy">' +
      (cls === 'short' ? '<span class="v-badge">Shorts</span>' : '') +
      '<span class="play">' + TV.icon('play') + '</span><span class="v-cap"><b>' + v.title + '</b><span>' + v.duration + ' · ' + v.tag + '</span></span></button>';
  }
  var main = D.videos.filter(function (v) { return !v.vertical; }), shorts = D.videos.filter(function (v) { return v.vertical; });
  $('#video-grid').innerHTML = vcard(main[0], 'big') + '<div class="video-side">' + main.slice(1).map(function (v) { return vcard(v, 'row'); }).join('') + '</div>';
  $('#shorts').innerHTML = shorts.map(function (v) { return vcard(v, 'short'); }).join('');
  var vm = $('#video-modal'), ve = $('#video-el');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-video]'); if (!b) return;
    var v = D.videos.filter(function (x) { return x.id === b.getAttribute('data-video'); })[0];
    $('.modal-box', vm).classList.toggle('vertical', !!v.vertical);
    ve.poster = v.poster; ve.src = v.src;
    $('#video-title').textContent = v.title;
    $('#video-credit').innerHTML = 'Video: <a href="' + v.page + '" target="_blank" rel="noopener" style="text-decoration:underline">' + TV.esc(v.author) + ' / Pexels</a>';
    TV.openModal(vm, function () { ve.pause(); ve.removeAttribute('src'); ve.load(); });
    var p = ve.play(); if (p && p.catch) p.catch(function () {});
  });

  /* ================= TIN TỨC, ĐÁNH GIÁ, FAQ ================= */
  $('#news-grid').innerHTML = D.news.slice(0, 3).map(TV.newsCard).join('');
  var star5 = function (n) { var s = ''; for (var i = 0; i < 5; i++) s += TV.icon('star', i < n ? '' : 'off'); return s; };
  $('.rating-sum .stars').innerHTML = star5(5);
  $('#tgrid').innerHTML = D.reviews.map(function (r) {
    return '<figure class="tcard" data-reveal style="margin:0"><div class="stars" aria-label="' + r.stars + ' trên 5 sao">' + star5(r.stars) + '</div>' +
      '<blockquote>' + TV.esc(r.text) + '</blockquote>' +
      '<figcaption class="tperson"><span class="avatar" aria-hidden="true">' + r.name.split(' ').slice(-2).map(function (w) { return w[0]; }).join('') + '</span>' +
      '<span><b>' + TV.esc(r.name) + '</b><span>' + TV.esc(r.meta) + '</span></span></figcaption></figure>';
  }).join('');
  TV.accordion($('#faq'), D.faq);
  TV.reveal();
})();
