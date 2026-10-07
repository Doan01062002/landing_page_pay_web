/* Hưng Thịnh Auto – logic từng trang */
(function () {
  'use strict';
  var H = window.HT, D = H.D, U = H.U, ic = H.ic, esc = H.esc, fmt = H.fmt, $ = H.$, $$ = H.$$, Store = H.Store;
  var page = document.body.getAttribute('data-page');

  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += ic('star', i > n ? 'off' : ''); return '<div class="stars" aria-label="' + n + ' trên 5 sao">' + s + '</div>'; }
  function initials(name) { var p = name.replace(/^(Anh|Chị)\s+/, '').split(' '); return (p[0].charAt(0) + (p[1] ? p[1].charAt(0) : '')).toUpperCase(); }
  function crumb(items) {
    return '<nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Trang chủ</a>' + items.map(function (it) {
      return ic('right') + (it[1] ? '<a href="' + it[1] + '">' + esc(it[0]) + '</a>' : '<span aria-current="page">' + esc(it[0]) + '</span>');
    }).join('') + '</nav>';
  }
  function srTile(s) { var r = H.byId(D.REGIONS, s.region); var n = D.CARS.filter(function (c) { return c.showroom === s.id; }).length; return '<div class="sr-tile" aria-hidden="true">' + ic('pin') + '<b>' + (r ? r.name : '') + '</b><span>' + s.name.replace('Hưng Thịnh Auto ', '') + '</span><em>' + n + ' xe đang trưng bày</em></div>'; }
  function priceMatch(c, pid) { var p = H.byId(D.PRICES, pid); return p ? c.price >= p.min && c.price < p.max : true; }
  function faqItem(f, open) { return '<details class="acc"' + (open ? ' open' : '') + '><summary>' + esc(f.q) + ic('plus') + '</summary><div class="acc__b"><p>' + esc(f.a) + '</p></div></details>'; }
  function swipe(el, prev, next) {
    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) (dx < 0 ? next : prev)(); x0 = null; });
  }

  /* ======================= HOME ======================= */
  function home() {
    // Hero slider
    var hero = $('#hero');
    if (hero) {
      hero.innerHTML = D.HERO.map(function (s, i) {
        var Hd = i === 0 ? 'h1' : 'h2';
        return '<div class="hero__slide' + (i === 0 ? ' is-on' : '') + '" aria-hidden="' + (i !== 0) + '"><div class="hero__bg"></div>' +
          '<div class="hero__media"><img src="' + U(s.img, 1100, 760) + '" alt="" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + '></div><div class="hero__band"></div>' +
          '<div class="container hero__in"><div class="hero__txt"><span class="hero__kicker">' + ic('shield') + s.kicker + '</span>' +
          '<' + Hd + ' class="hero__h">' + s.title + '</' + Hd + '><p class="hero__p">' + s.text + '</p>' +
          '<div class="hero__cta"><a class="btn btn--navy" href="' + s.cta[0] + '">' + s.cta[1] + ic('arrow') + '</a><a class="btn btn--line" href="' + s.cta2[0] + '">' + s.cta2[1] + '</a></div>' +
          '<div class="hero__stats"><div><b>' + D.CARS.length + '+</b><span>mẫu xe sẵn sàng</span></div><div><b>180</b><span>hạng mục kiểm tra</span></div><div><b>' + D.SHOWROOMS.length + '</b><span>showroom (minh hoạ)</span></div></div>' +
          '</div></div></div>';
      }).join('') +
        '<div class="hero__dots" role="tablist">' + D.HERO.map(function (s, i) { return '<button type="button" role="tab" aria-label="Slide ' + (i + 1) + '"' + (i === 0 ? ' class="is-on" aria-selected="true"' : '') + '></button>'; }).join('') + '</div>' +
        '<div class="hero__ctrl"><button type="button" aria-label="Slide trước" data-h="-1">' + ic('left') + '</button><button type="button" aria-label="Slide sau" data-h="1">' + ic('right') + '</button></div>';
      var slides = $$('.hero__slide', hero), dots = $$('.hero__dots button', hero), cur = 0, timer;
      var go = function (n) {
        cur = (n + slides.length) % slides.length;
        slides.forEach(function (s, i) { s.classList.toggle('is-on', i === cur); s.setAttribute('aria-hidden', i !== cur); });
        dots.forEach(function (d, i) { d.classList.toggle('is-on', i === cur); d.setAttribute('aria-selected', i === cur); });
      };
      var play = function () { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6500); };
      $$('[data-h]', hero).forEach(function (b) { b.addEventListener('click', function () { go(cur + +b.getAttribute('data-h')); play(); }); });
      dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); play(); }); });
      hero.addEventListener('mouseenter', function () { clearInterval(timer); });
      hero.addEventListener('mouseleave', play);
      swipe(hero, function () { go(cur - 1); play(); }, function () { go(cur + 1); play(); });
      play();
    }

    // Brand strip
    var br = $('#brands');
    if (br) br.innerHTML = D.BRANDS.map(function (b) {
      var n = D.CARS.filter(function (c) { return c.brand === b.id; }).length;
      return '<a class="brand" href="mua-xe.html?hang=' + b.id + '"><b>' + b.name.replace('Mercedes-Benz', 'Mercedes') + '</b><span>' + n + ' xe</span></a>';
    }).join('');

    quickSearch();

    // Featured
    var feat = $('#feat'), ftabs = $('#featTabs');
    if (feat) {
      var tabs = [['all', 'Tất cả'], ['suv', 'SUV'], ['crossover', 'Crossover'], ['sedan', 'Sedan'], ['ban-tai', 'Bán tải'], ['dien', 'Xe điện'], ['cu', 'Đã qua sử dụng']];
      ftabs.innerHTML = tabs.map(function (t, i) { return '<button class="tab' + (i ? '' : ' is-on') + '" type="button" role="tab" data-ft="' + t[0] + '">' + t[1] + '</button>'; }).join('');
      var renderF = function (k) {
        var list = D.CARS.filter(function (c) {
          if (k === 'all') return c.featured;
          if (k === 'dien') return c.fuel === 'Điện';
          if (k === 'cu') return c.km > 0;
          return c.type === k;
        }).slice(0, 8);
        feat.innerHTML = list.map(H.carCard).join('');
        H.updateCounters(); H.initReveal();
      };
      ftabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ft]'); if (!b) return;
        $$('.tab', ftabs).forEach(function (x) { x.classList.toggle('is-on', x === b); });
        renderF(b.getAttribute('data-ft'));
      });
      renderF('all');
    }

    showcase();

    var acc = $('#accGrid');
    if (acc) acc.innerHTML = ['mam-17-5-chau', 'mam-18-den', 'bo-bong-h7', 'ac-quy-efb', 'day-cau-binh', 'tau-sac-usb', 'cap-obd2', 'dong-ho-ap-suat'].map(function (id) { return H.byId(D.ACCESSORIES, id); }).filter(Boolean).map(H.accCard).join('');

    services();

    var tt = $('#ttrack');
    if (tt) {
      tt.innerHTML = D.TESTIMONIALS.map(function (t) {
        return '<figure class="tcard"><span class="tcard__q" aria-hidden="true">“</span>' + stars(t.rate) + '<p>“' + esc(t.text) + '”</p><figcaption class="tcard__who"><span class="avatar">' + initials(t.name) + '</span><span><b>' + esc(t.name) + '</b><span>' + esc(t.car) + '</span></span></figcaption></figure>';
      }).join('');
      $$('[data-tt]').forEach(function (b) { b.addEventListener('click', function () { tt.scrollBy({ left: (+b.getAttribute('data-tt')) * (tt.clientWidth * 0.9), behavior: 'smooth' }); }); });
    }

    var fq = $('#faqList');
    if (fq) fq.innerHTML = D.FAQS.slice(0, 5).map(function (f, i) { return faqItem(f, i === 0); }).join('');

    var bl = $('#blogGrid');
    if (bl) bl.innerHTML = D.POSTS.slice(0, 3).map(function (p) { return H.postCard(p); }).join('');
  }

  function quickSearch() {
    var box = $('#qbuy'); if (!box) return;
    var st = { hang: '', dong: '', kieu: '', gia: '' };
    $('#qBrands').innerHTML = D.BRANDS.map(function (b) { return '<button class="chip" type="button" data-qb="' + b.id + '">' + b.name.replace('Mercedes-Benz', 'Mercedes') + '</button>'; }).join('');
    $('#qTypes').innerHTML = D.TYPES.map(function (t) { return '<button class="qtype" type="button" data-qt="' + t.id + '">' + H.typeIcon(t.id) + t.name + '</button>'; }).join('');
    $('#qPrices').innerHTML = D.PRICES.map(function (p) { return '<button class="chip" type="button" data-qp="' + p.id + '">' + p.name + '</button>'; }).join('');
    var sel = $('#qModel'), inp = $('#qText'), btn = $('#qGo');
    function models() {
      var names = {};
      D.CARS.forEach(function (c) { if (!st.hang || c.brand === st.hang) names[c.name] = 1; });
      sel.innerHTML = '<option value="">Tất cả dòng xe</option>' + Object.keys(names).sort().map(function (n) { return '<option' + (n === st.dong ? ' selected' : '') + '>' + n + '</option>'; }).join('');
    }
    function match() {
      var q = H.norm(inp.value.trim());
      return D.CARS.filter(function (c) {
        return (!st.hang || c.brand === st.hang) && (!st.dong || c.name === st.dong) && (!st.kieu || c.type === st.kieu) && (!st.gia || priceMatch(c, st.gia)) &&
          (!q || H.norm(H.carTitle(c) + ' ' + H.brandName(c.brand)).indexOf(q) > -1);
      });
    }
    function url() {
      var p = new URLSearchParams();
      if (st.hang) p.set('hang', st.hang); if (st.kieu) p.set('kieu', st.kieu); if (st.gia) p.set('gia', st.gia);
      var q = (st.dong ? st.dong + ' ' : '') + inp.value.trim(); if (q.trim()) p.set('q', q.trim());
      var s = p.toString(); return 'mua-xe.html' + (s ? '?' + s : '');
    }
    function update() {
      $$('[data-qb]', box).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-qb') === st.hang); });
      $$('[data-qt]', box).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-qt') === st.kieu); b.setAttribute('aria-pressed', b.getAttribute('data-qt') === st.kieu); });
      $$('[data-qp]', box).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-qp') === st.gia); });
      var n = match().length;
      btn.innerHTML = ic('search') + 'Xem ' + n + ' xe phù hợp';
      btn.setAttribute('href', url());
    }
    box.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-qb]'))) { var v = b.getAttribute('data-qb'); st.hang = st.hang === v ? '' : v; st.dong = ''; models(); }
      else if ((b = e.target.closest('[data-qt]'))) { var t = b.getAttribute('data-qt'); st.kieu = st.kieu === t ? '' : t; }
      else if ((b = e.target.closest('[data-qp]'))) { var p = b.getAttribute('data-qp'); st.gia = st.gia === p ? '' : p; }
      else return;
      update();
    });
    sel.addEventListener('change', function () { st.dong = sel.value; update(); });
    inp.addEventListener('input', update);
    $('#qForm').addEventListener('submit', function (e) { e.preventDefault(); location.href = url(); });
    models(); update();

    var sf = $('#qSell');
    if (sf) {
      $('#qsBrand').innerHTML = '<option value="">Chọn hãng xe</option>' + D.BRANDS.map(function (b) { return '<option value="' + b.id + '">' + b.name + '</option>'; }).join('') + '<option value="khac">Hãng khác</option>';
      sf.addEventListener('ht:submit', function (e) {
        e.preventDefault();
        var fd = e.detail, p = new URLSearchParams();
        ['hang', 'dong', 'nam'].forEach(function (k) { if (fd.get(k)) p.set(k, fd.get(k)); });
        location.href = 'ban-xe.html?' + p.toString() + '#dang-ky';
      });
    }
  }

  function showcase() {
    var root = $('#show'); if (!root) return;
    var ids = ['toyota-camry', 'honda-crv', 'mazda-cx5', 'ford-ranger-raptor', 'vinfast-vf8', 'bmw-x5'];
    var cars = ids.map(function (id) { return H.byId(D.CARS, id); });
    $('#showTabs').innerHTML = cars.map(function (c, i) { return '<button class="show__tab' + (i ? '' : ' is-on') + '" type="button" data-sh="' + i + '">' + c.name.replace('Mercedes-Benz ', '').replace(/^(Toyota|Honda|Mazda|Ford|VinFast|BMW) /, '') + '</button>'; }).join('');
    function render(i) {
      var c = cars[i];
      $('#showStage').innerHTML = '<div class="show__img"><img src="' + U(c.images[0], 1100, 650) + '" alt="' + esc(H.carTitle(c)) + '" loading="lazy"></div>' +
        '<div class="show__info"><span class="kicker">' + H.brandName(c.brand) + ' · ' + H.typeName(c.type) + ' · ' + c.year + '</span><h3>' + esc(H.carTitle(c)) + '</h3>' +
        '<div class="show__price">' + fmt(c.price) + '</div><p class="opt__h">Màu sắc: <span id="showColor">' + D.COLORS[c.colors[0]].name + '</span></p><div class="show__colors">' +
        c.colors.map(function (k, j) { return '<button class="swatch' + (j ? '' : ' is-on') + '" type="button" style="background:' + D.COLORS[k].hex + '" data-col="' + k + '" aria-label="' + D.COLORS[k].name + '"></button>'; }).join('') + '</div>' +
        '<ul class="ticks">' + c.highlights.map(function (h) { return '<li>' + ic('check') + h + '</li>'; }).join('') + '</ul></div>';
      $('#showBar').innerHTML = '<div class="show__specs"><div><span>Động cơ</span><b>' + c.engine.split(' + ')[0].split(' ').slice(0, 2).join(' ') + '</b></div><div><span>Công suất cực đại</span><b>' + c.power + '</b></div><div><span>Mô-men xoắn</span><b>' + c.torque + '</b></div><div><span>Hộp số</span><b>' + c.gear.replace('Tự động', 'AT') + '</b></div></div>' +
        '<div class="show__acts"><button class="btn btn--navy" type="button" data-testdrive="' + c.id + '">' + ic('key') + 'Đăng ký lái thử</button><a class="btn btn--line" href="xe.html?id=' + c.id + '">Xem chi tiết</a></div>';
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sh]');
      if (b) { $$('.show__tab', root).forEach(function (x) { x.classList.toggle('is-on', x === b); }); render(+b.getAttribute('data-sh')); return; }
      var s = e.target.closest('[data-col]');
      if (s) { $$('.swatch', root).forEach(function (x) { x.classList.toggle('is-on', x === s); }); $('#showColor').textContent = D.COLORS[s.getAttribute('data-col')].name; }
    });
    render(0);
  }

  function services() {
    var root = $('#svc'); if (!root) return;
    var S = [
      { k: 'Mua xe', ic: 'car', cta: ['mua-xe.html', 'Xem xe đang bán'], items: [['search', 'Tìm xe dễ dàng', 'Lọc theo hãng, kiểu dáng, khoảng giá chỉ vài cú chạm.'], ['key', 'Lái thử tận nơi', 'Đặt lịch lái thử tại showroom hoặc tại nhà (nội thành).'], ['shield', 'Kiểm tra minh bạch', 'Phiếu kiểm tra 180 hạng mục đi kèm mỗi xe.'], ['refresh', 'Đổi trả 7 ngày', 'Hoàn tiền nếu xe sai khác mô tả (kịch bản demo).']] },
      { k: 'Bán xe', ic: 'money', cta: ['ban-xe.html', 'Ký gửi bán xe'], items: [['clock', 'Phản hồi 15 phút', 'Gửi thông tin, chuyên viên gọi lại trong giờ làm việc.'], ['doc', 'Định giá miễn phí', 'Đối chiếu giá thị trường, tư vấn mức giá hợp lý.'], ['hand', 'Nhận tiền nhanh', 'Thu mua trực tiếp hoặc ký gửi, thanh toán minh bạch.'], ['check', 'Hỗ trợ thủ tục', 'Rút hồ sơ, tất toán ngân hàng, sang tên trọn gói.']] },
      { k: 'Lên đời xe', ic: 'refresh', cta: ['lien-he.html', 'Nhận tư vấn đổi xe'], items: [['refresh', 'Thu cũ đổi mới', 'Định giá xe cũ và trừ trực tiếp vào xe mới.'], ['tag', 'Ưu đãi bù trừ', 'Hỗ trợ thêm chi phí khi lên đời trong tháng (minh hoạ).'], ['wrench', 'Bàn giao trong ngày', 'Chuẩn bị xe mới sẵn sàng khi bạn giao xe cũ.'], ['shield', 'Bảo hành nối tiếp', 'Xe mới hưởng đầy đủ chính sách bảo hành.']] },
      { k: 'Trả góp', ic: 'doc', cta: ['xe.html?id=mazda-cx5#tra-gop', 'Thử tính trả góp'], items: [['money', 'Vay tới 80%', 'Kết nối nhiều ngân hàng, chọn gói phù hợp.'], ['calendar', 'Kỳ hạn tới 8 năm', 'Chủ động khoản trả hàng tháng vừa sức.'], ['doc', 'Hồ sơ đơn giản', 'CCCD, giấy tờ cư trú, chứng minh thu nhập.'], ['bolt', 'Duyệt nhanh', 'Phản hồi sơ bộ trong 24 giờ làm việc.']] }
    ];
    $('#svcTabs').innerHTML = S.map(function (s, i) { return '<button class="svc__tab' + (i ? '' : ' is-on') + '" type="button" data-sv="' + i + '">' + ic(s.ic) + s.k + '</button>'; }).join('');
    function render(i) {
      var s = S[i];
      $('#svcPanel').innerHTML = '<div class="svc__card">' + s.items.map(function (it) { return '<div class="svc__it">' + ic(it[0]) + '<h4>' + it[1] + '</h4><p>' + it[2] + '</p></div>'; }).join('') + '</div>' +
        '<div class="svc__cta"><p>Bạn cần hỗ trợ ' + s.k.toLowerCase() + '? Gọi <a href="tel:0900000686"><b>0900 000 686</b></a></p><a class="btn btn--navy" href="' + s.cta[0] + '">' + s.cta[1] + ic('arrow') + '</a></div>';
    }
    $('#svcTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sv]'); if (!b) return;
      $$('.svc__tab', root).forEach(function (x) { x.classList.toggle('is-on', x === b); }); render(+b.getAttribute('data-sv'));
    });
    render(0);
  }

  /* ======================= LISTING ======================= */
  function listing() {
    var P = new URLSearchParams(location.search);
    function arr(k) { return (P.get(k) || '').split(',').filter(Boolean); }
    var st = { hang: arr('hang'), kieu: arr('kieu'), gia: arr('gia'), nl: arr('nl'), tt: arr('tinh-trang'), q: P.get('q') || '', sort: P.get('sort') || 'noi-bat', view: P.get('view') || 'grid', page: +(P.get('page') || 1) };
    var PER = 9;
    var FUELS = ['Xăng', 'Dầu', 'Hybrid', 'Điện'];
    var fuelId = function (f) { return H.norm(f); };
    var TT = [['moi', 'Xe mới'], ['cu', 'Đã qua sử dụng']];

    function test(c, skip) {
      if (skip !== 'hang' && st.hang.length && st.hang.indexOf(c.brand) < 0) return false;
      if (skip !== 'kieu' && st.kieu.length && st.kieu.indexOf(c.type) < 0) return false;
      if (skip !== 'gia' && st.gia.length && !st.gia.some(function (g) { return priceMatch(c, g); })) return false;
      if (skip !== 'nl' && st.nl.length && st.nl.indexOf(fuelId(c.fuel)) < 0) return false;
      if (skip !== 'tt' && st.tt.length && st.tt.indexOf(c.km ? 'cu' : 'moi') < 0) return false;
      if (st.q) {
        var words = H.norm(st.q).split(/\s+/), hay = H.norm(H.carTitle(c) + ' ' + H.brandName(c.brand) + ' ' + H.typeName(c.type) + ' ' + c.fuel + ' ' + c.year);
        if (!words.every(function (w) { return hay.indexOf(w) > -1; })) return false;
      }
      return true;
    }
    function opts(group, list, type) {
      return list.map(function (o) {
        var n = D.CARS.filter(function (c) { return test(c, group) && (group === 'hang' ? c.brand === o[0] : group === 'kieu' ? c.type === o[0] : group === 'gia' ? priceMatch(c, o[0]) : group === 'nl' ? fuelId(c.fuel) === o[0] : (c.km ? 'cu' : 'moi') === o[0]); }).length;
        return '<label class="fopt"><input type="' + (type || 'checkbox') + '" name="' + group + '" value="' + o[0] + '"' + (st[group].indexOf(o[0]) > -1 ? ' checked' : '') + '>' + o[1] + '<em>' + n + '</em></label>';
      }).join('');
    }
    function renderFilters() {
      $('#fBody').innerHTML =
        '<div class="fgroup"><h3>Hãng xe</h3><div class="fopts fopts--2">' + opts('hang', D.BRANDS.map(function (b) { return [b.id, b.name.replace('Mercedes-Benz', 'Mercedes')]; })) + '</div></div>' +
        '<div class="fgroup"><h3>Kiểu dáng</h3><div class="fopts fopts--2">' + opts('kieu', D.TYPES.map(function (t) { return [t.id, t.name]; })) + '</div></div>' +
        '<div class="fgroup"><h3>Khoảng giá</h3><div class="fopts">' + opts('gia', D.PRICES.map(function (p) { return [p.id, p.name]; })) + '</div></div>' +
        '<div class="fgroup"><h3>Nhiên liệu</h3><div class="fopts fopts--2">' + opts('nl', FUELS.map(function (f) { return [fuelId(f), f]; })) + '</div></div>' +
        '<div class="fgroup"><h3>Tình trạng</h3><div class="fopts">' + opts('tt', TT) + '</div></div>';
    }
    function label(group, v) {
      if (group === 'hang') return H.brandName(v);
      if (group === 'kieu') return H.typeName(v);
      if (group === 'gia') { var p = H.byId(D.PRICES, v); return p ? p.name : v; }
      if (group === 'nl') { var f = FUELS.filter(function (x) { return fuelId(x) === v; })[0]; return f || v; }
      return v === 'cu' ? 'Đã qua sử dụng' : 'Xe mới';
    }
    function sync() {
      var p = new URLSearchParams();
      ['hang', 'kieu', 'gia', 'nl'].forEach(function (k) { if (st[k].length) p.set(k, st[k].join(',')); });
      if (st.tt.length) p.set('tinh-trang', st.tt.join(','));
      if (st.q) p.set('q', st.q);
      if (st.sort !== 'noi-bat') p.set('sort', st.sort);
      if (st.view !== 'grid') p.set('view', st.view);
      if (st.page > 1) p.set('page', st.page);
      var s = p.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    }
    function render(scroll) {
      var list = D.CARS.filter(function (c) { return test(c); });
      var sorters = {
        'noi-bat': function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); },
        'gia-tang': function (a, b) { return a.price - b.price; }, 'gia-giam': function (a, b) { return b.price - a.price; },
        'moi-nhat': function (a, b) { return b.year - a.year || a.km - b.km; }, 'km-thap': function (a, b) { return a.km - b.km; },
        'ten': function (a, b) { return H.carTitle(a).localeCompare(H.carTitle(b), 'vi'); }
      };
      list = list.slice().sort(sorters[st.sort] || sorters['noi-bat']);
      var pages = Math.max(1, Math.ceil(list.length / PER));
      if (st.page > pages) st.page = pages;
      var shown = list.slice((st.page - 1) * PER, st.page * PER);
      $('#count').innerHTML = '<b>' + list.length + '</b> xe phù hợp' + (st.q ? ' với “' + esc(st.q) + '”' : '');
      var grid = $('#grid');
      grid.classList.toggle('is-list', st.view === 'list');
      grid.innerHTML = shown.length ? shown.map(H.carCard).join('') : '';
      $('#noResult').innerHTML = shown.length ? '' : H.emptyState('Chưa có xe phù hợp', 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm. Bạn cũng có thể để lại yêu cầu, chúng tôi sẽ tìm xe giúp bạn.', 'mua-xe.html', 'Xoá bộ lọc', 'search');
      // chips
      var chips = [];
      ['hang', 'kieu', 'gia', 'nl', 'tt'].forEach(function (g) { st[g].forEach(function (v) { chips.push('<button class="achip" type="button" data-rm="' + g + ':' + v + '">' + esc(label(g, v)) + ic('close') + '</button>'); }); });
      if (st.q) chips.push('<button class="achip" type="button" data-rm="q:">Từ khoá: ' + esc(st.q) + ic('close') + '</button>');
      if (chips.length) chips.push('<button class="achip achip--clear" type="button" data-rm="all">Xoá tất cả</button>');
      $('#achips').innerHTML = chips.join('');
      $('#achips').hidden = !chips.length;
      // pager
      var pg = '';
      if (pages > 1) {
        pg += '<button type="button" data-pg="' + (st.page - 1) + '" aria-label="Trang trước"' + (st.page === 1 ? ' disabled' : '') + '>' + ic('left') + '</button>';
        for (var i = 1; i <= pages; i++) pg += '<button type="button" data-pg="' + i + '"' + (i === st.page ? ' class="is-on" aria-current="page"' : '') + '>' + i + '</button>';
        pg += '<button type="button" data-pg="' + (st.page + 1) + '" aria-label="Trang sau"' + (st.page === pages ? ' disabled' : '') + '>' + ic('right') + '</button>';
      }
      $('#pager').innerHTML = pg;
      $$('.vbtn').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-view') === st.view); b.setAttribute('aria-pressed', b.getAttribute('data-view') === st.view); });
      $('#sort').value = st.sort;
      $('#fApplyN').textContent = list.length;
      renderFilters(); sync(); H.updateCounters(); H.initReveal();
      if (scroll) { var t = $('#shopTop'); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' }); }
      var h1 = $('#lTitle');
      if (h1) {
        var t1 = 'Mua xe ô tô';
        if (st.hang.length === 1 && !st.kieu.length) t1 = 'Xe ' + H.brandName(st.hang[0]);
        else if (st.kieu.length === 1 && !st.hang.length) t1 = 'Xe ' + H.typeName(st.kieu[0]);
        else if (st.tt.length === 1 && st.tt[0] === 'cu') t1 = 'Xe đã qua sử dụng';
        h1.textContent = t1;
      }
    }
    // events
    $('#fBody').addEventListener('change', function (e) {
      var i = e.target; if (!i.name) return;
      var arrp = st[i.name], k = arrp.indexOf(i.value);
      if (i.checked && k < 0) arrp.push(i.value); else if (!i.checked && k > -1) arrp.splice(k, 1);
      st.page = 1; render();
    });
    $('#achips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-rm]'); if (!b) return;
      var v = b.getAttribute('data-rm');
      if (v === 'all') { st.hang = []; st.kieu = []; st.gia = []; st.nl = []; st.tt = []; st.q = ''; }
      else { var p = v.split(':'); if (p[0] === 'q') st.q = ''; else st[p[0]] = st[p[0]].filter(function (x) { return x !== p[1]; }); }
      st.page = 1; render();
    });
    $('#fReset').addEventListener('click', function () { st.hang = []; st.kieu = []; st.gia = []; st.nl = []; st.tt = []; st.page = 1; render(); });
    $('#sort').addEventListener('change', function (e) { st.sort = e.target.value; st.page = 1; render(); });
    $$('.vbtn').forEach(function (b) { b.addEventListener('click', function () { st.view = b.getAttribute('data-view'); render(); }); });
    $('#pager').addEventListener('click', function (e) { var b = e.target.closest('[data-pg]'); if (!b) return; st.page = +b.getAttribute('data-pg'); render(true); });
    var fl = $('#filters'), shade;
    function openF() { fl.classList.add('in'); shade = document.createElement('div'); shade.className = 'fshade'; shade.addEventListener('click', closeF); document.body.appendChild(shade); document.body.classList.add('no-scroll'); }
    function closeF() { fl.classList.remove('in'); if (shade) shade.remove(); document.body.classList.remove('no-scroll'); }
    $('#fOpen').addEventListener('click', openF);
    $$('[data-fclose]').forEach(function (b) { b.addEventListener('click', closeF); });
    var lq = $('#lq');
    if (lq) { lq.value = st.q; $('#lqForm').addEventListener('submit', function (e) { e.preventDefault(); st.q = lq.value.trim(); st.page = 1; render(true); }); }
    // category cards
    var cc = $('#catcards');
    if (cc) {
      var cats = [['kieu=suv,mpv', 'Xe gia đình', 'assets/img/cars/kia-carnival-1.webp', D.CARS.filter(function (c) { return c.seats >= 7 || c.type === 'mpv'; }).length],
        ['gia=tren-2000', 'Xe sang', 'assets/img/cars/bmw-x5-1.webp', D.CARS.filter(function (c) { return c.price >= 2e9; }).length],
        ['kieu=ban-tai', 'Bán tải', 'assets/img/cars/ford-ranger-wildtrak-1.webp', D.CARS.filter(function (c) { return c.type === 'ban-tai'; }).length],
        ['nl=dien,hybrid', 'Điện & Hybrid', 'assets/img/cars/vinfast-vf8-1.webp', D.CARS.filter(function (c) { return c.fuel === 'Điện' || c.fuel === 'Hybrid'; }).length]];
      cc.innerHTML = cats.map(function (c) { return '<a class="catcard" href="mua-xe.html?' + c[0] + '"><img src="' + U(c[2], 520, 300) + '" alt="' + c[1] + '" loading="lazy"><span>' + c[1] + '<em>' + c[3] + ' xe</em></span></a>'; }).join('');
    }
    document.addEventListener('ht:store', function () { H.updateCounters(); });
    render();
  }

  /* ======================= DETAIL ======================= */
  function detail() {
    var id = H.qs('id'), c = H.byId(D.CARS, id), root = $('#detail');
    if (!c) {
      $('#dCrumb').innerHTML = crumb([['Mua xe', 'mua-xe.html'], ['Không tìm thấy']]);
      root.innerHTML = '<div class="notfound"><div class="notfound__code">404</div><h1>Không tìm thấy xe này</h1><p class="muted">Mẫu xe bạn tìm có thể đã được bán hoặc đường dẫn chưa đúng' + (id ? ' (mã: “' + esc(id) + '”)' : '') + '.</p><a class="btn btn--y" href="mua-xe.html">Xem các xe đang bán</a></div>';
      $('#related').innerHTML = D.CARS.filter(function (x) { return x.featured; }).slice(0, 4).map(H.carCard).join('');
      document.title = 'Không tìm thấy xe | Hưng Thịnh Auto';
      H.updateCounters(); H.initReveal();
      return;
    }
    Store.viewed(c.id);
    document.title = H.carTitle(c) + ' ' + c.year + ' – ' + H.fmtShort(c.price) + ' | Hưng Thịnh Auto';
    $('#dCrumb').innerHTML = crumb([['Mua xe', 'mua-xe.html'], [H.brandName(c.brand), 'mua-xe.html?hang=' + c.brand], [H.carTitle(c)]]);
    var sr = H.byId(D.SHOWROOMS, c.showroom);
    var d = H.discount(c);
    var ADDONS = [['phim', 'Gói phim cách nhiệt + thảm 6D', 12000000], ['camera', 'Camera hành trình 4K lắp sẵn', 2490000], ['bh', 'Bảo hiểm thân vỏ năm đầu (ước tính 1,4%)', Math.round(c.price * 0.014 / 1e5) * 1e5]];
    root.innerHTML =
      '<div class="detail"><div class="gal"><div class="gal__main"><img id="gMain" src="' + U(c.images[0], 1200, 790) + '" alt="' + esc(H.carTitle(c)) + '">' +
      (c.images.length > 1 ? '<button class="gal__nav gal__nav--l" type="button" data-g="-1" aria-label="Ảnh trước">' + ic('left') + '</button><button class="gal__nav gal__nav--r" type="button" data-g="1" aria-label="Ảnh sau">' + ic('right') + '</button>' : '') +
      (d ? '<span class="badge badge--sale">Giảm ' + d + '%</span>' : '') + '<span class="gal__count" id="gCount">1/' + c.images.length + '</span></div>' +
      '<div class="gal__thumbs">' + c.images.map(function (im, i) { return '<button type="button" data-gi="' + i + '"' + (i ? '' : ' class="is-on"') + ' aria-label="Ảnh ' + (i + 1) + '"><img src="' + U(im, 240, 180) + '" alt="" loading="lazy"></button>'; }).join('') + '</div></div>' +
      '<div class="dinfo"><div class="dinfo__tags"><span class="pill pill--y">' + c.condition + '</span><span class="pill">' + H.typeName(c.type) + '</span>' + (c.tag ? '<span class="pill pill--g">' + c.tag + '</span>' : '') + '</div>' +
      '<h1>' + esc(H.carTitle(c)) + ' ' + c.year + '</h1><p class="muted">' + H.brandName(c.brand) + ' · ' + c.origin + ' · Mã tin: HT-' + c.id.length + c.year + '</p>' +
      '<div class="dinfo__price"><small>Giá niêm yết (minh hoạ)</small><b>' + fmt(c.price) + '</b>' + (c.oldPrice ? '<s>' + fmt(c.oldPrice) + '</s>' : '') + '<small id="dTotal"></small></div>' +
      '<ul class="kspecs"><li>' + ic('calendar') + '<b>' + c.year + '</b>Năm SX</li><li>' + ic('gauge') + '<b>' + H.fmtKm(c.km) + '</b>Đã đi</li><li>' + ic('fuel') + '<b>' + c.fuel + '</b>Nhiên liệu</li><li>' + ic('seat') + '<b>' + c.seats + ' chỗ</b>Số ghế</li></ul>' +
      '<div class="opt"><p class="opt__h">Màu ngoại thất: <span id="dColor">' + D.COLORS[c.colors[0]].name + '</span></p><div class="show__colors">' + c.colors.map(function (k, j) { return '<button class="swatch' + (j ? '' : ' is-on') + '" type="button" style="background:' + D.COLORS[k].hex + '" data-col="' + k + '" aria-label="' + D.COLORS[k].name + '"></button>'; }).join('') + '</div></div>' +
      '<div class="opt"><p class="opt__h">Tuỳ chọn thêm <span>(ước tính)</span></p><div class="fopts">' + ADDONS.map(function (a) { return '<label class="fopt"><input type="checkbox" data-addon="' + a[2] + '" value="' + a[0] + '">' + a[1] + '<em>+' + H.fmtShort(a[2]).replace(' triệu', ' tr') + '</em></label>'; }).join('') + '</div></div>' +
      '<div class="dinfo__acts"><button class="btn btn--y" type="button" id="dDeposit">' + ic('money') + 'Đặt cọc giữ xe</button><button class="btn btn--navy" type="button" data-testdrive="' + c.id + '">' + ic('key') + 'Đăng ký lái thử</button></div>' +
      '<div class="dinfo__acts2"><button class="btn btn--line btn--sm" type="button" data-wish="' + c.id + '" aria-pressed="false">' + ic('heart') + 'Yêu thích</button><button class="btn btn--line btn--sm" type="button" data-compare="' + c.id + '" aria-pressed="false">' + ic('compare') + 'So sánh</button><button class="btn btn--line btn--sm" type="button" id="dShare">' + ic('share') + 'Chia sẻ</button></div>' +
      '<div class="dinfo__hot">' + ic('phone') + '<div>Tư vấn &amp; báo giá lăn bánh<br><a href="tel:0900000686"><b>0900 000 686</b></a></div></div></div></div>' +
      '<div class="dtabs" role="tablist"><button class="dtab is-on" type="button" role="tab" data-dt="mo-ta">Mô tả</button><button class="dtab" type="button" role="tab" data-dt="thong-so">Thông số kỹ thuật</button><button class="dtab" type="button" role="tab" data-dt="tra-gop">Tính trả góp</button><button class="dtab" type="button" role="tab" data-dt="showroom">Xem xe tại showroom</button></div>' +
      '<div class="dpanel" id="p-mo-ta"><div class="prose"><p>' + esc(H.carTitle(c)) + ' đời ' + c.year + ' là mẫu ' + H.typeName(c.type).toLowerCase() + ' ' + c.seats + ' chỗ của ' + H.brandName(c.brand) + ', ' + (c.km ? 'đã đi khoảng ' + H.fmtKm(c.km) + ', được kiểm tra tổng thể trước khi niêm yết.' : 'xe mới 100%, sẵn màu giao ngay tại showroom.') + ' Xe sử dụng động cơ ' + c.engine + ', công suất ' + c.power + ', mô-men xoắn ' + c.torque + ', hộp số ' + c.gear.toLowerCase() + '.</p>' +
      '<h2>Điểm nổi bật</h2><ul>' + c.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
      '<h2>Cam kết khi mua tại Hưng Thịnh Auto</h2><ul><li>Giá niêm yết rõ ràng, báo giá lăn bánh chi tiết từng khoản.</li><li>' + (c.km ? 'Phiếu kiểm tra 180 hạng mục, cam kết không đâm đụng, không ngập nước.' : 'Bảo hành chính hãng theo chính sách của nhà sản xuất.') + '</li><li>Hỗ trợ trả góp, đăng ký, đăng kiểm trọn gói.</li></ul>' +
      '<p class="muted small">Lưu ý: thông tin và giá chỉ mang tính minh hoạ cho website demo.</p></div></div>' +
      '<div class="dpanel" id="p-thong-so" hidden><table class="stable"><tbody>' + [['Hãng', H.brandName(c.brand)], ['Dòng xe', c.name], ['Phiên bản', c.version], ['Năm sản xuất', c.year], ['Tình trạng', c.condition + (c.km ? ' – ' + H.fmtKm(c.km) : '')], ['Kiểu dáng', H.typeName(c.type)], ['Xuất xứ', c.origin], ['Số chỗ ngồi', c.seats], ['Động cơ', c.engine], ['Công suất cực đại', c.power], ['Mô-men xoắn cực đại', c.torque], ['Hộp số', c.gear], ['Dẫn động', c.drive], ['Nhiên liệu', c.fuel], ['Kích thước D x R x C', c.size], ['Mức tiêu hao / quãng đường', c.consumption], ['Màu sắc', c.colors.map(function (k) { return D.COLORS[k].name; }).join(', ')]].map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="dpanel" id="p-tra-gop" hidden><div class="calc"><form class="card" id="calc" onsubmit="return false"><h3>Ước tính khoản trả góp</h3>' +
      '<label class="field"><span>Giá xe (đã gồm tuỳ chọn)</span><input id="cPrice" inputmode="numeric" value="' + c.price.toLocaleString('vi-VN') + '"></label>' +
      '<label class="field"><span>Trả trước: <b id="cPctL">30%</b></span><input class="range" id="cPct" type="range" min="15" max="80" step="5" value="30"></label>' +
      '<div class="grid2"><label class="field"><span>Kỳ hạn vay</span><select id="cTerm"><option value="12">1 năm</option><option value="24">2 năm</option><option value="36">3 năm</option><option value="48">4 năm</option><option value="60" selected>5 năm</option><option value="72">6 năm</option><option value="84">7 năm</option><option value="96">8 năm</option></select></label>' +
      '<label class="field"><span>Lãi suất (%/năm)</span><input id="cRate" type="number" min="0" max="30" step="0.1" value="8.5"></label></div>' +
      '<p class="muted small">Tính theo dư nợ giảm dần. Kết quả chỉ mang tính tham khảo, không phải cam kết cho vay.</p></form>' +
      '<div class="calc__out" aria-live="polite"><small>Trả tháng đầu tiên</small><div class="calc__big" id="cFirst">—</div><ul class="calc__rows" id="cRows"></ul><div class="calc__tbl" id="cTbl"></div></div></div></div>' +
      '<div class="dpanel" id="p-showroom" hidden>' + (sr ? '<div class="sr-card is-on" style="cursor:default">' + srTile(sr) + '<div><span class="pill pill--y">Xe đang có tại</span><h3>' + sr.name + '</h3><ul><li>' + ic('pin') + sr.address + '</li><li>' + ic('clock') + sr.hours + '</li><li>' + ic('phone') + '<a href="tel:0900000686">' + sr.phone + '</a></li></ul><div class="sr-card__acts"><button class="btn btn--y btn--sm" type="button" data-testdrive="' + c.id + '">Hẹn xem xe</button><a class="btn btn--line btn--sm" href="he-thong-showroom.html?sr=' + sr.id + '">Xem bản đồ</a></div></div></div>' : '') + '</div>';

    // gallery
    var gi = 0, main = $('#gMain');
    function show(i) {
      gi = (i + c.images.length) % c.images.length; main.src = U(c.images[gi], 1200, 790);
      $$('[data-gi]').forEach(function (b, k) { b.classList.toggle('is-on', k === gi); }); $('#gCount').textContent = (gi + 1) + '/' + c.images.length;
    }
    root.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-gi]'))) show(+b.getAttribute('data-gi'));
      else if ((b = e.target.closest('[data-g]'))) show(gi + +b.getAttribute('data-g'));
      else if ((b = e.target.closest('[data-col]'))) { $$('.swatch', root).forEach(function (x) { x.classList.toggle('is-on', x === b); }); $('#dColor').textContent = D.COLORS[b.getAttribute('data-col')].name; }
      else if ((b = e.target.closest('[data-dt]'))) openTab(b.getAttribute('data-dt'));
    });
    swipe($('.gal__main'), function () { show(gi - 1); }, function () { show(gi + 1); });
    function openTab(k) {
      $$('.dtab').forEach(function (t) { var on = t.getAttribute('data-dt') === k; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
      $$('.dpanel').forEach(function (p) { p.hidden = p.id !== 'p-' + k; });
    }
    // addons & total
    function addons() { return $$('[data-addon]').reduce(function (s, x) { return s + (x.checked ? +x.getAttribute('data-addon') : 0); }, 0); }
    function updTotal() {
      var a = addons();
      $('#dTotal').innerHTML = a ? 'Tạm tính kèm tuỳ chọn: <b style="font-size:17px;color:var(--ink)">' + fmt(c.price + a) + '</b>' : '';
      $('#cPrice').value = (c.price + a).toLocaleString('vi-VN'); calc();
    }
    $$('[data-addon]').forEach(function (x) { x.addEventListener('change', updTotal); });
    // calculator
    function num(v) { return +String(v).replace(/[^\d]/g, '') || 0; }
    function calc() {
      var price = num($('#cPrice').value), pct = +$('#cPct').value, n = +$('#cTerm').value, r = (+$('#cRate').value || 0) / 100 / 12;
      $('#cPctL').textContent = pct + '%';
      var down = Math.round(price * pct / 100), loan = price - down, gốc = loan / n, rows = '', totalInt = 0, bal = loan, first = 0;
      for (var m = 1; m <= n; m++) {
        var it = bal * r, pay = gốc + it; totalInt += it;
        if (m === 1) first = pay;
        if (m <= 12 || m % 12 === 0) rows += '<tr><td>Tháng ' + m + '</td><td>' + fmt(gốc) + '</td><td>' + fmt(it) + '</td><td>' + fmt(pay) + '</td></tr>';
        bal -= gốc;
      }
      $('#cFirst').textContent = fmt(first);
      $('#cRows').innerHTML = '<li><span>Trả trước</span><b>' + fmt(down) + '</b></li><li><span>Số tiền vay</span><b>' + fmt(loan) + '</b></li><li><span>Tổng lãi ước tính</span><b>' + fmt(totalInt) + '</b></li><li><span>Tổng phải trả (gốc + lãi)</span><b>' + fmt(loan + totalInt) + '</b></li>';
      $('#cTbl').innerHTML = '<table><thead><tr><th>Kỳ</th><th>Gốc</th><th>Lãi</th><th>Tổng</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }
    ['cPrice', 'cPct', 'cTerm', 'cRate'].forEach(function (k) { $('#' + k).addEventListener('input', calc); $('#' + k).addEventListener('change', calc); });
    $('#cPrice').addEventListener('blur', function () { this.value = num(this.value).toLocaleString('vi-VN'); });
    calc();
    if (location.hash === '#tra-gop') { openTab('tra-gop'); setTimeout(function () { $('.dtabs').scrollIntoView({ behavior: 'smooth' }); }, 200); }
    // share
    $('#dShare').addEventListener('click', function () {
      var u = location.href;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(u).then(function () { H.toast('Đã sao chép liên kết xe'); }, function () { H.toast('Liên kết: ' + esc(u)); });
      else H.toast('Sao chép liên kết từ thanh địa chỉ để chia sẻ');
    });
    // deposit
    $('#dDeposit').addEventListener('click', function () {
      var dep = c.price < 5e8 ? 10000000 : c.price < 3e9 ? 20000000 : 50000000;
      var color = ($('.swatch.is-on', root) || {}).getAttribute ? $('.swatch.is-on', root).getAttribute('data-col') : c.colors[0];
      var m = H.modal('<div class="mform"><span class="kicker">Đặt cọc giữ xe</span><h3>' + esc(H.carTitle(c)) + '</h3><p class="muted">Số tiền cọc giữ xe: <b style="color:var(--red)">' + fmt(dep) + '</b>. Khoản cọc được thêm vào giỏ hàng để bạn hoàn tất bước thanh toán (demo, không phát sinh giao dịch thật).</p>' +
        '<form data-demo-form id="depForm"><label class="field"><span>Showroom nhận xe</span><select name="showroom">' + H.showroomOptions(c.showroom) + '</select></label>' +
        '<label class="field"><span>Màu ngoại thất</span><select name="color">' + c.colors.map(function (k) { return '<option value="' + k + '"' + (k === color ? ' selected' : '') + '>' + D.COLORS[k].name + '</option>'; }).join('') + '</select></label>' +
        '<label class="check"><input type="checkbox" required name="agree"> Tôi hiểu đây là website demo, khoản cọc chỉ mang tính minh hoạ.</label><div class="field" style="margin:0"></div>' +
        '<button class="btn btn--y btn--block" type="submit" style="margin-top:14px">' + ic('cart') + 'Thêm khoản cọc vào giỏ</button></form></div>', 'modal--sm');
      $('#depForm', m).addEventListener('ht:submit', function (e) {
        e.preventDefault();
        var fd = e.detail;
        Store.addCart({ key: 'dep:' + c.id, kind: 'dep', id: c.id, qty: 1, amount: dep, showroom: fd.get('showroom'), color: fd.get('color') });
        H.closeModal(); H.toast('Đã thêm khoản đặt cọc vào giỏ', ['gio-hang.html', 'Thanh toán']);
      });
    });
    // related
    var rel = D.CARS.filter(function (x) { return x.id !== c.id && (x.type === c.type || x.brand === c.brand); });
    if (rel.length < 4) rel = rel.concat(D.CARS.filter(function (x) { return x.id !== c.id && rel.indexOf(x) < 0; }));
    $('#related').innerHTML = rel.slice(0, 4).map(H.carCard).join('');
    H.updateCounters(); H.initReveal();
  }

  /* ======================= SELL ======================= */
  function sell() {
    var f = $('#sellForm'); if (!f) return;
    var bs = $('#sBrand');
    bs.innerHTML = '<option value="">Chọn hãng xe</option>' + D.BRANDS.map(function (b) { return '<option value="' + b.id + '">' + b.name + '</option>'; }).join('') + '<option value="khac">Hãng khác</option>';
    var ys = $('#sYear'); var yh = '<option value="">Chọn năm</option>'; for (var y = 2026; y >= 2008; y--) yh += '<option>' + y + '</option>'; ys.innerHTML = yh;
    var P = new URLSearchParams(location.search);
    if (P.get('hang')) bs.value = P.get('hang');
    if (P.get('dong')) $('#sModel').value = P.get('dong');
    if (P.get('nam')) ys.value = P.get('nam');
    var up = $('#sPhotos');
    up.addEventListener('change', function () {
      var names = Array.prototype.map.call(up.files, function (x) { return esc(x.name); });
      $('#sPhotoList').innerHTML = names.length ? 'Đã chọn ' + names.length + ' ảnh: ' + names.slice(0, 4).join(', ') + (names.length > 4 ? '…' : '') + ' <em>(chỉ hiển thị, không tải lên)</em>' : '';
    });
    var fq = $('#sellFaq');
    if (fq) fq.innerHTML = D.FAQS.filter(function (x) { return x.cat === 'Bán xe' || x.cat === 'Tài chính'; }).map(function (x, i) { return faqItem(x, i === 0); }).join('');
  }

  /* ======================= ACCESSORIES ======================= */
  function accessories() {
    var st = { cat: H.qs('cat') || 'all', sort: 'noi-bat', q: H.qs('q') || '' };
    var tabs = $('#aTabs');
    tabs.innerHTML = [['all', 'Tất cả']].concat(D.ACC_CATS.map(function (c) { return [c.id, c.name]; })).map(function (t) {
      var n = t[0] === 'all' ? D.ACCESSORIES.length : D.ACCESSORIES.filter(function (a) { return a.cat === t[0]; }).length;
      return '<button class="tab" type="button" data-ac="' + t[0] + '">' + t[1] + ' <span class="muted">(' + n + ')</span></button>';
    }).join('');
    var qi = $('#aq'); qi.value = st.q;
    function render() {
      var q = H.norm(st.q);
      var list = D.ACCESSORIES.filter(function (a) { return (st.cat === 'all' || a.cat === st.cat) && (!q || H.norm(a.name + ' ' + a.desc).indexOf(q) > -1); });
      if (st.sort === 'gia-tang') list = list.slice().sort(function (a, b) { return a.price - b.price; });
      if (st.sort === 'gia-giam') list = list.slice().sort(function (a, b) { return b.price - a.price; });
      if (st.sort === 'giam-gia') list = list.slice().sort(function (a, b) { return (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0); });
      $$('.tab', tabs).forEach(function (t) { t.classList.toggle('is-on', t.getAttribute('data-ac') === st.cat); });
      $('#aCount').innerHTML = '<b>' + list.length + '</b> sản phẩm' + (st.q ? ' cho “' + esc(st.q) + '”' : '');
      $('#aGrid').innerHTML = list.map(H.accCard).join('');
      $('#aEmpty').innerHTML = list.length ? '' : H.emptyState('Không có sản phẩm phù hợp', 'Thử từ khoá khác hoặc chọn danh mục “Tất cả”.', 'phu-kien.html', 'Xem tất cả phụ kiện', 'search');
      H.initReveal();
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-ac]'); if (!b) return; st.cat = b.getAttribute('data-ac'); render(); });
    $('#aSort').addEventListener('change', function (e) { st.sort = e.target.value; render(); });
    $('#aqForm').addEventListener('submit', function (e) { e.preventDefault(); st.q = qi.value.trim(); render(); });
    qi.addEventListener('input', function () { if (!qi.value) { st.q = ''; render(); } });
    render();
  }

  /* ======================= NEWS ======================= */
  function sidebar(activeCat) {
    var s = $('#side'); if (!s) return;
    s.innerHTML = '<div class="card"><h3>Chuyên mục</h3><ul class="side__list"><li><a href="tin-tuc.html"' + (!activeCat ? ' class="is-on"' : '') + '>Tất cả bài viết <span>' + D.POSTS.length + '</span></a></li>' +
      D.POST_CATS.map(function (c) { return '<li><a href="tin-tuc.html?cat=' + c.id + '"' + (activeCat === c.id ? ' class="is-on"' : '') + '>' + c.name + ' <span>' + D.POSTS.filter(function (p) { return p.cat === c.id; }).length + '</span></a></li>'; }).join('') + '</ul></div>' +
      '<div class="card"><h3>Bài viết mới</h3>' + D.POSTS.slice(0, 4).map(function (p) { return '<a class="mini" href="bai-viet.html?id=' + p.id + '"><img src="' + U(p.img, 200, 150) + '" alt="" loading="lazy"><span><b>' + esc(p.title) + '</b><small>' + H.fmtDate(p.date) + '</small></span></a>'; }).join('') + '</div>' +
      '<div class="card" style="background:var(--navy);color:#c8d0e5;border:0"><h3 style="color:#fff">Cần tư vấn chọn xe?</h3><p>Gọi hotline hoặc để lại số, chuyên viên sẽ gọi lại.</p><a class="btn btn--y btn--block" href="tel:0900000686">' + ic('phone') + '0900 000 686</a></div>';
  }
  function news() {
    var cat = H.qs('cat'); var c = H.byId(D.POST_CATS, cat);
    if (c) { $('#nTitle').textContent = c.name; $('#nCrumb').innerHTML = crumb([['Tin tức', 'tin-tuc.html'], [c.name]]); }
    else $('#nCrumb').innerHTML = crumb([['Tin tức']]);
    var list = D.POSTS.filter(function (p) { return !c || p.cat === c.id; });
    $('#nTabs').innerHTML = '<a class="tab' + (!c ? ' is-on' : '') + '" href="tin-tuc.html" style="display:inline-flex;align-items:center">Tất cả</a>' + D.POST_CATS.map(function (x) { return '<a class="tab' + (c && c.id === x.id ? ' is-on' : '') + '" href="tin-tuc.html?cat=' + x.id + '" style="display:inline-flex;align-items:center">' + x.name + '</a>'; }).join('');
    $('#nGrid').innerHTML = list.length ? list.map(function (p, i) { return H.postCard(p, i === 0 && list.length > 2); }).join('') : H.emptyState('Chưa có bài viết', 'Chuyên mục này đang được cập nhật.', 'tin-tuc.html', 'Xem tất cả', 'doc');
    sidebar(c && c.id); H.initReveal();
  }
  function article() {
    var p = H.byId(D.POSTS, H.qs('id')), root = $('#art');
    if (!p) {
      $('#aCrumb').innerHTML = crumb([['Tin tức', 'tin-tuc.html'], ['Không tìm thấy']]);
      root.innerHTML = '<div class="notfound"><div class="notfound__code">404</div><h1>Bài viết không tồn tại</h1><p class="muted">Bài viết có thể đã được gỡ hoặc đường dẫn chưa đúng.</p><a class="btn btn--y" href="tin-tuc.html">Về trang Tin tức</a></div>';
      sidebar(); return;
    }
    var c = H.byId(D.POST_CATS, p.cat);
    document.title = p.title + ' | Hưng Thịnh Auto';
    $('#aCrumb').innerHTML = crumb([['Tin tức', 'tin-tuc.html'], [c.name, 'tin-tuc.html?cat=' + c.id], [p.title]]);
    var body = p.body.map(function (b) {
      if (b[0] === 'ul') return '<ul>' + b[1].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      return '<' + b[0] + '>' + esc(b[1]) + '</' + b[0] + '>';
    }).join('');
    var words = p.body.reduce(function (s, b) { return s + (Array.isArray(b[1]) ? b[1].join(' ') : b[1]).split(/\s+/).length; }, 0);
    root.innerHTML = '<article class="art"><span class="pill pill--y">' + c.name + '</span><h1 style="margin-top:12px">' + esc(p.title) + '</h1>' +
      '<div class="art__meta"><span>' + ic('calendar') + H.fmtDate(p.date) + '</span><span>' + ic('user') + esc(p.author) + '</span><span>' + ic('clock') + Math.max(2, Math.round(words / 200)) + ' phút đọc</span></div>' +
      '<div class="art__hero"><img src="' + U(p.img, 1200, 600) + '" alt="' + esc(p.title) + '"></div><div class="prose"><p class="art__lead">' + esc(p.excerpt) + '</p>' + body + '</div>' +
      '<div class="share"><b>Chia sẻ:</b><button class="btn btn--line btn--sm" type="button" id="aCopy">' + ic('share') + 'Sao chép liên kết</button><a class="btn btn--soft btn--sm" href="tin-tuc.html?cat=' + c.id + '">Thêm bài ' + c.name.toLowerCase() + '</a></div></article>';
    $('#aCopy').addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(location.href).then(function () { H.toast('Đã sao chép liên kết'); }, function () { H.toast('Không sao chép được, hãy dùng thanh địa chỉ'); });
      else H.toast('Sao chép liên kết từ thanh địa chỉ để chia sẻ');
    });
    var rel = D.POSTS.filter(function (x) { return x.id !== p.id; }).sort(function (a, b) { return (b.cat === p.cat) - (a.cat === p.cat); }).slice(0, 3);
    $('#aRel').innerHTML = rel.map(function (x) { return H.postCard(x); }).join('');
    sidebar(p.cat); H.initReveal();
  }

  /* ======================= CONTACT & SHOWROOM ======================= */
  function streetMap(label) {
    return '<svg viewBox="0 0 800 450" role="img" aria-label="Bản đồ minh hoạ vị trí showroom"><rect width="800" height="450" fill="#e9eef4"/>' +
      '<path d="M0 330 C160 300 260 360 420 320 S700 260 800 290 V450 H0Z" fill="#cfe3f3"/>' +
      '<rect x="520" y="40" width="190" height="120" rx="18" fill="#d7ecd9"/><rect x="60" y="60" width="140" height="90" rx="14" fill="#d7ecd9"/>' +
      '<g stroke="#fff" stroke-linecap="round" fill="none"><path d="M0 210H800" stroke-width="26"/><path d="M380 0V450" stroke-width="22"/><path d="M0 90 L800 140" stroke-width="12"/><path d="M150 0 L240 450" stroke-width="12"/><path d="M600 0 L560 450" stroke-width="12"/><path d="M0 280 L380 250" stroke-width="9"/></g>' +
      '<g stroke="#ffd447" stroke-width="3" fill="none" stroke-dasharray="14 10"><path d="M0 210H800"/></g>' +
      '<g transform="translate(380 210)"><circle r="46" fill="rgba(255,194,14,.25)"/><path d="M0 -6 C-18 -6 -26 -20 -26 -32 A26 26 0 0 1 26 -32 C26 -20 18 -6 0 -6Z" transform="translate(0 -4) scale(1.3)" fill="#14244f"/><circle cy="-48" r="9" fill="#ffc20e"/></g>' +
      '<g font-family="Be Vietnam Pro, Arial" font-size="15" font-weight="700" fill="#14244f"><rect x="410" y="150" rx="10" width="' + (label.length * 8.6 + 24) + '" height="34" fill="#fff"/><text x="422" y="172">' + esc(label) + '</text></g>' +
      '<g font-family="Be Vietnam Pro, Arial" font-size="13" fill="#6b7489"><text x="20" y="200">Đường Minh Hoạ</text><text x="392" y="440">Phố Ví Dụ</text><text x="560" y="105">Công viên</text></g></svg>';
  }
  function contact() {
    var m = $('#map'); if (m) m.innerHTML = streetMap('Hưng Thịnh Auto (minh hoạ)') + '<span class="mapbox__note">Bản đồ minh hoạ – không phải vị trí thật</span>';
    var s = $('#cShowroom'); if (s) s.innerHTML = '<option value="">Chọn showroom gần bạn</option>' + H.showroomOptions('');
  }
  var VN = 'M18 8 30 2 42 5 50 4 56 10 60 16 52 20 46 24 44 30 48 36 54 42 60 50 64 58 66 66 66 74 64 82 60 88 54 94 46 100 38 104 32 110 28 116 26 108 30 100 36 94 42 90 48 86 52 80 54 74 52 66 48 58 42 50 36 44 32 38 34 32 30 26 24 22 18 16Z';
  function showroom() {
    var st = { region: 'all', sel: H.qs('sr') || '' };
    var tabs = $('#srTabs');
    tabs.innerHTML = [['all', 'Tất cả']].concat(D.REGIONS.map(function (r) { return [r.id, r.name]; })).map(function (r) { return '<button class="tab" type="button" data-rg="' + r[0] + '">' + r[1] + '</button>'; }).join('');
    function render() {
      var list = D.SHOWROOMS.filter(function (s) { return st.region === 'all' || s.region === st.region; });
      $$('.tab', tabs).forEach(function (t) { t.classList.toggle('is-on', t.getAttribute('data-rg') === st.region); });
      $('#srList').innerHTML = list.map(function (s) {
        var n = D.CARS.filter(function (c) { return c.showroom === s.id; }).length;
        return '<article class="sr-card' + (s.id === st.sel ? ' is-on' : '') + '" data-sr="' + s.id + '" tabindex="0">' + srTile(s) + '<div><span class="pill">' + H.byId(D.REGIONS, s.region).name + ' · ' + n + ' xe</span><h3>' + s.name + '</h3><ul><li>' + ic('pin') + s.address + '</li><li>' + ic('clock') + s.hours + '</li><li>' + ic('phone') + '<a href="tel:0900000686">' + s.phone + '</a></li></ul>' +
          '<div class="sr-card__acts"><a class="btn btn--y btn--sm" href="mua-xe.html?q=">Xem xe tại đây</a><button class="btn btn--line btn--sm" type="button" data-book="' + s.id + '">Đặt lịch hẹn</button></div></div></article>';
      }).join('');
      $('#vn').innerHTML = '<svg viewBox="0 0 90 122" role="img" aria-label="Sơ đồ minh hoạ vị trí các showroom"><path d="' + VN + '" fill="#ffffff" stroke="#14244f" stroke-width=".8" stroke-linejoin="round"/>' +
        '<g fill="#9aa6c0" font-size="3.2" font-family="Be Vietnam Pro, Arial"><text x="70" y="40">Biển Đông</text></g>' +
        D.SHOWROOMS.map(function (s) { var on = s.id === st.sel; var vis = st.region === 'all' || s.region === st.region; return '<g class="dot' + (on ? ' is-on' : '') + '" data-sr="' + s.id + '" opacity="' + (vis ? 1 : .35) + '"><circle cx="' + s.x + '" cy="' + s.y + '" r="' + (on ? 5 : 3.2) + '"/><circle cx="' + s.x + '" cy="' + s.y + '" r="1.6" fill="' + (on ? '#d0202a' : '#14244f') + '"/><title>' + s.name + '</title></g>'; }).join('') +
        D.REGIONS.map(function (r) { var s = D.SHOWROOMS.filter(function (x) { return x.region === r.id; })[0]; return '<text x="' + (s.x + 5) + '" y="' + (s.y + 1.2) + '" font-size="3.6" font-weight="700" fill="#14244f" font-family="Be Vietnam Pro, Arial">' + r.name.replace('TP. Hồ Chí Minh', 'TP.HCM') + '</text>'; }).join('') +
        '</svg><p class="muted small" style="text-align:center;margin:8px 0 0">Sơ đồ minh hoạ, không theo tỉ lệ</p>';
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-rg]'); if (!b) return; st.region = b.getAttribute('data-rg'); render(); });
    document.addEventListener('click', function (e) {
      var bk = e.target.closest('[data-book]');
      if (bk) {
        var s = H.byId(D.SHOWROOMS, bk.getAttribute('data-book'));
        H.modal('<div class="mform"><span class="kicker">Đặt lịch hẹn</span><h3>' + s.name + '</h3><p class="muted">' + s.address + '</p><form data-demo-form data-replace data-success="Lịch hẹn tại ' + s.name + ' đã được ghi nhận (demo)."><div class="grid2"><label class="field"><span>Họ tên *</span><input name="name" required></label><label class="field"><span>Số điện thoại *</span><input name="phone" type="tel" required pattern="0[0-9]{9}" data-msg="Số điện thoại gồm 10 số, bắt đầu bằng 0"></label></div><div class="grid2"><label class="field"><span>Ngày *</span><input type="date" name="date" required min="' + H.today(1) + '" value="' + H.today(1) + '"></label><label class="field"><span>Mục đích</span><select name="need"><option>Xem xe</option><option>Lái thử</option><option>Định giá xe cũ</option><option>Lắp phụ kiện</option></select></label></div><button class="btn btn--y btn--block" type="submit">Xác nhận lịch hẹn</button></form></div>', 'modal--sm');
        return;
      }
      var c = e.target.closest('[data-sr]');
      if (c && !e.target.closest('a,button')) { st.sel = c.getAttribute('data-sr'); render(); var card = $('.sr-card[data-sr="' + st.sel + '"]'); if (card && c.tagName.toLowerCase() === 'g') card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
    if (st.sel) { var s0 = H.byId(D.SHOWROOMS, st.sel); if (s0) st.region = 'all'; }
    render();
  }

  /* ======================= COMPARE ======================= */
  function compare() {
    var root = $('#cmp'), diffOnly = $('#diffOnly');
    function render() {
      var ids = Store.get('compare').filter(function (id) { return H.byId(D.CARS, id); });
      var cars = ids.map(function (id) { return H.byId(D.CARS, id); });
      var slots = cars.slice(); while (slots.length < 3) slots.push(null);
      var avail = D.CARS.filter(function (c) { return ids.indexOf(c.id) < 0; });
      var addBox = '<div class="cmp__add">' + H.ic('plus') + '<b>Thêm xe để so sánh</b><select aria-label="Chọn xe để thêm" data-addcmp><option value="">Chọn xe…</option>' + D.BRANDS.map(function (b) {
        var l = avail.filter(function (c) { return c.brand === b.id; }); return l.length ? '<optgroup label="' + b.name + '">' + l.map(function (c) { return '<option value="' + c.id + '">' + esc(H.carTitle(c)) + ' ' + c.year + '</option>'; }).join('') + '</optgroup>' : '';
      }).join('') + '</select></div>';
      var ROWS = [['Giá niêm yết', function (c) { return '<b style="color:var(--red)">' + fmt(c.price) + '</b>'; }, 'price'], ['Hãng', function (c) { return H.brandName(c.brand); }], ['Kiểu dáng', function (c) { return H.typeName(c.type); }], ['Năm sản xuất', function (c) { return c.year; }], ['Tình trạng', function (c) { return c.condition + (c.km ? ' (' + H.fmtKm(c.km) + ')' : ''); }], ['Xuất xứ', function (c) { return c.origin; }], ['Số chỗ', function (c) { return c.seats; }], ['Động cơ', function (c) { return c.engine; }], ['Công suất', function (c) { return c.power; }], ['Mô-men xoắn', function (c) { return c.torque; }], ['Hộp số', function (c) { return c.gear; }], ['Dẫn động', function (c) { return c.drive; }], ['Nhiên liệu', function (c) { return c.fuel; }], ['Kích thước', function (c) { return c.size; }], ['Tiêu hao / quãng đường', function (c) { return c.consumption; }], ['Điểm nổi bật', function (c) { return '<ul style="list-style:disc;padding-left:18px">' + c.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>'; }]];
      var html = '<table><thead><tr><th scope="col">' + (cars.length ? cars.length + '/3 xe đang so sánh' : 'Chưa có xe') + '</th>' + slots.map(function (c) {
        if (!c) return '<td>' + addBox + '</td>';
        return '<td class="cmp__car"><img src="' + U(c.images[0], 480, 300) + '" alt="' + esc(H.carTitle(c)) + '" loading="lazy"><h3><a href="xe.html?id=' + c.id + '">' + esc(H.carTitle(c)) + '</a></h3><b>' + fmt(c.price) + '</b><br><button class="btn btn--soft btn--sm" type="button" data-testdrive="' + c.id + '">Lái thử</button><br><button class="cmp__x" type="button" data-rmcmp="' + c.id + '">' + ic('trash') + 'Bỏ khỏi so sánh</button></td>';
      }).join('') + '</tr></thead><tbody>';
      ROWS.forEach(function (r) {
        var vals = cars.map(function (c) { return String(r[1](c)); });
        var diff = cars.length > 1 && vals.some(function (v) { return v !== vals[0]; });
        if (diffOnly.checked && cars.length > 1 && !diff) return;
        html += '<tr' + (diff ? ' class="is-diff"' : '') + '><th scope="row">' + r[0] + '</th>' + slots.map(function (c, i) { return '<td>' + (c ? vals[i] : '—') + '</td>'; }).join('') + '</tr>';
      });
      html += '</tbody></table>';
      root.innerHTML = html;
      $('#cmpHint').hidden = cars.length > 1;
    }
    root.addEventListener('change', function (e) { var s = e.target.closest('[data-addcmp]'); if (s && s.value) { var r = Store.toggle('compare', s.value, 3); if (r) H.toast('Đã thêm xe vào so sánh'); } });
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-rmcmp]'); if (b) { Store.toggle('compare', b.getAttribute('data-rmcmp')); } });
    diffOnly.addEventListener('change', render);
    $('#cmpClear').addEventListener('click', function () { Store.set('compare', []); });
    document.addEventListener('ht:store', function (e) { if (e.detail === 'compare') render(); });
    var pre = H.qs('add'); if (pre && H.byId(D.CARS, pre) && !Store.has('compare', pre)) Store.toggle('compare', pre, 3);
    render();
  }

  /* ======================= WISHLIST & VIEWED ======================= */
  function savedList(key, emptyTitle, emptyText) {
    var grid = $('#sGrid');
    function render() {
      var cars = Store.get(key).map(function (id) { return H.byId(D.CARS, id); }).filter(Boolean);
      $('#sCount').textContent = cars.length;
      grid.innerHTML = cars.map(H.carCard).join('');
      $('#sEmpty').innerHTML = cars.length ? '' : H.emptyState(emptyTitle, emptyText, 'mua-xe.html', 'Khám phá xe', key === 'wish' ? 'heart' : 'eye');
      $('#sClear').hidden = !cars.length;
      H.updateCounters(); H.initReveal();
    }
    $('#sClear').addEventListener('click', function () { Store.set(key, []); H.toast('Đã xoá danh sách'); });
    document.addEventListener('ht:store', function (e) { if (e.detail === key) render(); });
    render();
    var sug = $('#sSuggest');
    if (sug) sug.innerHTML = D.CARS.filter(function (c) { return c.featured; }).slice(0, 4).map(H.carCard).join('');
  }

  /* ======================= CART ======================= */
  function cart() {
    var st = { coupon: '', ship: 'showroom' };
    var COUPON = 'HUNGTHINH5';
    function items() {
      return Store.cart().map(function (x) {
        if (x.kind === 'dep') { var c = H.byId(D.CARS, x.id); return c ? { x: x, name: 'Đặt cọc giữ xe ' + H.carTitle(c), sub: 'Màu ' + (D.COLORS[x.color] ? D.COLORS[x.color].name : '') + ' · ' + ((H.byId(D.SHOWROOMS, x.showroom) || {}).name || ''), img: c.images[0], price: x.amount, link: 'xe.html?id=' + c.id, dep: true } : null; }
        var a = H.byId(D.ACCESSORIES, x.id); return a ? { x: x, name: a.name, sub: (H.byId(D.ACC_CATS, a.cat) || {}).name, img: a.images[0], price: a.price, link: 'phu-kien.html?cat=' + a.cat } : null;
      }).filter(Boolean);
    }
    function totals(list) {
      var acc = 0, dep = 0;
      list.forEach(function (i) { if (i.dep) dep += i.price; else acc += i.price * i.x.qty; });
      var disc = st.coupon === COUPON ? Math.round(acc * 0.05) : 0;
      var ship = acc && st.ship === 'giao' ? (acc >= 2000000 ? 0 : 30000) : 0;
      return { acc: acc, dep: dep, disc: disc, ship: ship, total: acc + dep - disc + ship };
    }
    function render() {
      var list = items(), root = $('#cartWrap');
      if (!list.length) {
        root.innerHTML = H.emptyState('Giỏ hàng đang trống', 'Thêm phụ kiện hoặc đặt cọc giữ xe để tiếp tục thanh toán.', 'phu-kien.html', 'Mua phụ kiện', 'cart') + '<p style="text-align:center;margin-top:14px"><a class="link" href="mua-xe.html">Hoặc xem xe đang bán ' + ic('arrow') + '</a></p>';
        return;
      }
      var t = totals(list);
      root.innerHTML = '<div class="cart"><div><div class="card"><h2 style="font-size:20px">Sản phẩm trong giỏ (' + Store.cartCount() + ')</h2>' + list.map(function (i) {
        return '<div class="citem"><a href="' + i.link + '"><img src="' + U(i.img, 220, 160) + '" alt="" loading="lazy"></a><div><h3><a href="' + i.link + '">' + esc(i.name) + '</a></h3><small>' + esc(i.sub || '') + '</small><small>' + fmt(i.price) + (i.dep ? ' (khoản cọc)' : ' / sản phẩm') + '</small></div>' +
          '<div class="citem__r"><b>' + fmt(i.price * i.x.qty) + '</b>' + (i.dep ? '' : '<div class="qty qty--sm"><button type="button" data-cq="' + i.x.key + '|-1" aria-label="Giảm">' + ic('minus') + '</button><input type="number" min="1" max="99" value="' + i.x.qty + '" data-cqi="' + i.x.key + '" aria-label="Số lượng"><button type="button" data-cq="' + i.x.key + '|1" aria-label="Tăng">' + ic('plus') + '</button></div>') +
          '<button class="citem__rm" type="button" data-crm="' + i.x.key + '">' + ic('trash') + 'Xoá</button></div></div>';
      }).join('') + '<p style="margin:16px 0 0"><a class="link" href="phu-kien.html">' + ic('left') + ' Tiếp tục mua sắm</a></p></div>' +
        '<form class="card" id="checkout" data-demo-form style="margin-top:20px"><h2 style="font-size:20px">Thông tin thanh toán</h2><div class="grid2"><label class="field"><span>Họ và tên *</span><input name="name" required autocomplete="name"></label><label class="field"><span>Số điện thoại *</span><input name="phone" type="tel" required pattern="0[0-9]{9}" data-msg="Số điện thoại gồm 10 số, bắt đầu bằng 0" autocomplete="tel"></label></div>' +
        '<label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" placeholder="ban@vidu.vn"></label>' +
        '<p class="opt__h">Hình thức nhận hàng</p><div class="pay" style="margin-bottom:14px"><label><input type="radio" name="ship" value="showroom"' + (st.ship === 'showroom' ? ' checked' : '') + '><span>Nhận &amp; lắp đặt tại showroom<small>Miễn phí lắp đặt phần lớn phụ kiện</small></span></label><label><input type="radio" name="ship" value="giao"' + (st.ship === 'giao' ? ' checked' : '') + '><span>Giao tận nơi<small>30.000₫, miễn phí cho đơn phụ kiện từ 2.000.000₫</small></span></label></div>' +
        (st.ship === 'giao' ? '<label class="field"><span>Địa chỉ nhận hàng *</span><input name="address" required autocomplete="street-address"></label>' : '<label class="field"><span>Showroom</span><select name="showroom">' + H.showroomOptions('hn-1') + '</select></label>') +
        '<p class="opt__h">Phương thức thanh toán</p><div class="pay"><label><input type="radio" name="pay" value="ck" checked><span>Chuyển khoản ngân hàng<small>Thông tin chuyển khoản hiển thị sau khi đặt (demo)</small></span></label><label><input type="radio" name="pay" value="cod"><span>Thanh toán khi nhận hàng / tại showroom</span></label></div>' +
        '<label class="field" style="margin-top:14px"><span>Ghi chú</span><textarea name="note" placeholder="Ví dụ: dòng xe, thời gian thuận tiện…"></textarea></label>' +
        '<label class="check"><input type="checkbox" name="agree" required> Tôi hiểu đây là website demo, đơn hàng không được xử lý thật.</label><div class="field" style="margin:0"></div></form></div>' +
        '<aside class="card" style="position:sticky;top:100px"><h2 style="font-size:20px">Tóm tắt đơn hàng</h2><ul class="sum">' +
        (t.acc ? '<li><span>Phụ kiện</span><b>' + fmt(t.acc) + '</b></li>' : '') + (t.dep ? '<li><span>Khoản đặt cọc xe</span><b>' + fmt(t.dep) + '</b></li>' : '') +
        (t.disc ? '<li><span>Mã ' + COUPON + ' (-5% phụ kiện)</span><b style="color:var(--green)">-' + fmt(t.disc) + '</b></li>' : '') +
        (t.acc ? '<li><span>Phí giao hàng</span><b>' + (t.ship ? fmt(t.ship) : 'Miễn phí') + '</b></li>' : '') +
        '<li class="sum__total"><span>Tổng thanh toán</span><b>' + fmt(t.total) + '</b></li></ul>' +
        '<div class="coupon"><input id="coupon" placeholder="Mã giảm giá" value="' + esc(st.coupon) + '" aria-label="Mã giảm giá"><button class="btn btn--line btn--sm" type="button" id="cApply" style="height:42px">Áp dụng</button></div><p class="muted small" style="margin:0 0 14px">Gợi ý demo: nhập <b>' + COUPON + '</b> để giảm 5% phụ kiện.</p>' +
        '<button class="btn btn--y btn--block" type="submit" form="checkout">' + ic('check') + 'Đặt hàng</button><p class="muted small" style="margin:12px 0 0;text-align:center">Không có giao dịch thật nào được thực hiện.</p></aside></div>';
      H.initForms(root);
      $('#checkout').addEventListener('ht:submit', function (e) {
        e.preventDefault();
        var fd = e.detail, code = 'HT' + String(Date.now()).slice(-6);
        var tt = totals(items());
        Store.set('cart', []);
        $('#steps').innerHTML = stepHTML(3);
        $('#cartWrap').innerHTML = '<div class="card thanks"><span class="thanks__ic">' + ic('check') + '</span><h2>Cảm ơn ' + esc(fd.get('name')) + '!</h2><p>Đơn hàng demo <code>' + code + '</code> trị giá <b style="color:var(--red)">' + fmt(tt.total) + '</b> đã được ghi nhận trên trình duyệt của bạn.</p><p class="muted">Vì đây là website minh hoạ, sẽ không có cuộc gọi xác nhận hay giao dịch thực tế nào.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn--y" href="index.html">Về trang chủ</a><a class="btn btn--line" href="mua-xe.html">Xem thêm xe</a></div></div>';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      $$('input[name="ship"]', root).forEach(function (r) { r.addEventListener('change', function () { st.ship = r.value; render(); }); });
      $('#cApply').addEventListener('click', function () {
        var v = $('#coupon').value.trim().toUpperCase();
        if (v === COUPON) { st.coupon = v; H.toast('Đã áp dụng mã giảm 5% cho phụ kiện'); } else { st.coupon = ''; H.toast(v ? 'Mã không hợp lệ (demo: ' + COUPON + ')' : 'Vui lòng nhập mã'); }
        render();
      });
    }
    function setQty(key, q) { var l = Store.cart(); l.forEach(function (x) { if (x.key === key) x.qty = Math.max(1, Math.min(99, q)); }); Store.set('cart', l); }
    $('#cartWrap').addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-cq]'))) { var p = b.getAttribute('data-cq').split('|'); var cur = Store.cart().filter(function (x) { return x.key === p[0]; })[0]; if (cur) setQty(p[0], cur.qty + +p[1]); }
      else if ((b = e.target.closest('[data-crm]'))) { Store.set('cart', Store.cart().filter(function (x) { return x.key !== b.getAttribute('data-crm'); })); H.toast('Đã xoá khỏi giỏ hàng'); }
    });
    $('#cartWrap').addEventListener('change', function (e) { var i = e.target.closest('[data-cqi]'); if (i) setQty(i.getAttribute('data-cqi'), +i.value || 1); });
    function stepHTML(n) { return ['Giỏ hàng', 'Thông tin', 'Hoàn tất'].map(function (s, i) { return '<li' + (i < n ? ' class="is-on"' : '') + '><b>' + (i + 1) + '</b>' + s + '</li>'; }).join(''); }
    $('#steps').innerHTML = stepHTML(2);
    document.addEventListener('ht:store', function (e) { if (e.detail === 'cart' && $('#checkout')) render(); });
    render();
  }

  /* ======================= FAQ PAGE ======================= */
  function faqPage() {
    var root = $('#faqAll');
    var groups = { 'Mua xe': 'mua-xe', 'Tài chính': 'tai-chinh', 'Bán xe': 'ban-xe', 'Bảo hành': 'bao-hanh' };
    function render(q) {
      var n = H.norm(q || ''), html = '', total = 0;
      Object.keys(groups).forEach(function (g) {
        var l = D.FAQS.filter(function (f) { return f.cat === g && (!n || H.norm(f.q + ' ' + f.a).indexOf(n) > -1); });
        total += l.length;
        if (l.length) html += '<section class="faqgroup" id="' + groups[g] + '"><h2>' + g + '</h2>' + l.map(function (f, i) { return faqItem(f, !!n || (i === 0 && g === 'Mua xe')); }).join('') + '</section>';
      });
      root.innerHTML = total ? html : H.emptyState('Không tìm thấy câu hỏi phù hợp', 'Hãy gửi câu hỏi cho chúng tôi ở khung bên cạnh.', '', '', 'chat');
    }
    $('#fq').addEventListener('input', function (e) { render(e.target.value); });
    $('#fqCats').innerHTML = Object.keys(groups).map(function (g) { return '<a class="tab" style="display:inline-flex;align-items:center" href="#' + groups[g] + '">' + g + '</a>'; }).join('');
    render('');
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); var d = t.querySelector('details'); if (d) d.open = true; }, 50); }
  }

  /* ======================= AUTH ======================= */
  function auth() {
    $$('[data-pwd]').forEach(function (b) {
      b.addEventListener('click', function () { var i = b.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'); b.innerHTML = ic(show ? 'close' : 'eye'); });
    });
  }

  /* ======================= ABOUT ======================= */
  function about() {
    var els = $$('[data-count-to]');
    function run(el) {
      var to = +el.getAttribute('data-count-to'), suf = el.getAttribute('data-suf') || '', t0 = null;
      function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('vi-VN') + suf; if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }); });
      els.forEach(function (e) { io.observe(e); });
    } else els.forEach(run);
  }

  var routes = { home: home, listing: listing, detail: detail, sell: sell, accessories: accessories, news: news, article: article, contact: contact, showroom: showroom, compare: compare,
    wishlist: function () { savedList('wish', 'Chưa có xe yêu thích', 'Bấm biểu tượng trái tim trên thẻ xe để lưu lại những mẫu xe bạn quan tâm.'); },
    viewed: function () { savedList('viewed', 'Bạn chưa xem xe nào', 'Các xe bạn đã xem chi tiết sẽ được lưu tại đây trên trình duyệt này.'); },
    cart: cart, faq: faqPage, auth: auth, about: about };
  if (routes[page]) routes[page]();
  H.initReveal();
})();
