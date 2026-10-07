/* Trang chi tiết xe: xe.html?id=… */
(function () {
  'use strict';
  var TV = window.TV, D = window.TVDATA;
  TV.init('detail', 'home');
  var $ = TV.$, $$ = TV.$$, root = $('#detail-root');
  var id = TV.param('id'), car = id ? TV.carById(id) : null;

  function crumbs(last) {
    return '<nav class="crumbs" aria-label="Đường dẫn" style="padding-top:18px"><a href="index.html">Trang chủ</a>' + TV.icon('chev-r') +
      '<a href="index.html#danh-sach">Xe đang bán</a>' + TV.icon('chev-r') + last + '</nav>';
  }

  if (!car) {
    document.title = 'Không tìm thấy xe – Tín Việt Auto';
    var newest = D.cars.slice().sort(function (a, b) { return b.posted.localeCompare(a.posted); }).slice(0, 4);
    root.innerHTML = crumbs('<span>Không tìm thấy</span>') +
      '<div class="not-found">' + TV.icon('car') + '<h1>Xe này không còn trên website</h1>' +
      '<p>' + (id ? 'Mã xe “' + TV.esc(id.slice(0, 60)) + '” không tồn tại hoặc xe đã được bán.' : 'Đường dẫn thiếu mã xe.') +
      ' Bạn có thể xem các xe đang bán, hoặc gọi ' + TV.info.hotline + ' để hỏi xe tương tự.</p>' +
      '<div class="chips" style="justify-content:center"><a class="btn btn-red" href="index.html#danh-sach">Xem xe đang bán</a><a class="btn btn-line" href="lien-he.html?chu-de=tim-xe">Nhờ tìm xe giúp</a></div></div>' +
      '<section class="d-sec"><h2>Xe mới về</h2><div class="car-grid">' + newest.map(function (c) { return TV.card(c); }).join('') + '</div></section>';
    TV.sync();
    return;
  }

  var priceTxt = TV.price(car.price);
  document.title = car.name + ' – ' + priceTxt + ' | Tín Việt Auto';
  var md = document.querySelector('meta[name=description]');
  if (md) md.setAttribute('content', car.name + ', ' + TV.km(car.odo) + ', ' + car.fuel.toLowerCase() + ', ' + car.trans.toLowerCase() + '. Giá ' + priceTxt + ' tại Tín Việt Auto (minh hoạ).');
  var idx = D.cars.indexOf(car) + 1;
  var code = 'TV-' + ('00' + idx).slice(-3);
  var est = TV.loanCalc(car.price, 30, 60, 9, 'deu').first;
  var isMT = car.trans === 'Số sàn';

  var specs = [
    ['Hãng xe', car.brand], ['Dòng xe', car.model], ['Phiên bản', car.version], ['Năm sản xuất', car.year],
    ['Năm đăng ký', car.regYear], ['Số km đã đi', TV.km(car.odo)], ['Kiểu dáng', car.body], ['Số chỗ ngồi', car.seats + ' chỗ'],
    ['Động cơ', car.engine], ['Nhiên liệu', car.fuel === 'Dầu' ? 'Dầu (diesel)' : car.fuel], ['Hộp số', car.trans], ['Dẫn động', car.drive],
    ['Màu ngoại thất', car.color], ['Màu nội thất', car.interior], ['Xuất xứ', car.origin], ['Biển số', car.plate + ' · ' + car.owners + ' chủ từ mới']
  ];
  var half = Math.ceil(specs.length / 2);
  var specTable = function (rows) { return '<table class="spec-table"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + TV.esc(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>'; };
  var checks = [
    ['Khung gầm nguyên bản', 'Cột A/B/C, sườn, đà dọc không cắt hàn – không đâm đụng ảnh hưởng kết cấu'],
    ['Không ngập nước', 'Kiểm tra thảm sàn, ray ghế, giắc điện gầm, hốc lốp dự phòng'],
    ['Động cơ', 'Không rò dầu, không tiếng gõ, đọc OBD không có lỗi lưu'],
    [isMT ? 'Hộp số sàn, ly hợp' : 'Hộp số tự động', isMT ? 'Vào số nhẹ, côn không trượt, không kêu bi tê' : 'Chuyển số mượt, không giật, không trễ số'],
    ['Điện, điều hoà', 'Màn hình, camera, cảm biến, điều hoà hoạt động bình thường'],
    ['Phanh, treo, lái', 'Má phanh còn tốt, giảm xóc không chảy dầu, vô lăng không rơ'],
    ['Lốp còn khoảng ' + car.tyre + '%', car.tyre < 70 ? 'Nên dự trù thay lốp trong 1 năm tới' : 'Mòn đều, không phù, năm sản xuất lốp phù hợp', car.tyre < 70],
    ['Giấy tờ pháp lý', 'Đăng ký chính chủ, ' + car.owners + ' chủ, không tranh chấp, không thế chấp']
  ];
  var tomorrow = new Date(Date.now() + 864e5), maxD = new Date(Date.now() + 30 * 864e5);
  var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };

  root.innerHTML = crumbs('<a href="index.html?hang=' + TV.slug(car.brand) + '#danh-sach">' + car.brand + '</a>' + TV.icon('chev-r') + '<span>' + TV.esc(car.model + ' ' + car.year) + '</span>') +
    '<div class="detail">' +
      '<div class="d-gal">' +
        '<div class="gallery">' +
          '<div class="gallery-main" id="g-main" tabindex="0" role="button" aria-label="Phóng to ảnh">' +
            '<img id="g-img" src="' + car.gallery[0] + '" alt="' + TV.esc(car.name) + ' – ảnh 1" width="1200" height="900" fetchpriority="high">' +
            (car.gallery.length > 1 ? '<button class="lb-nav lb-prev" type="button" id="g-prev" aria-label="Ảnh trước">' + TV.icon('chev-l') + '</button><button class="lb-nav lb-next" type="button" id="g-next" aria-label="Ảnh sau">' + TV.icon('chev-r') + '</button>' : '') +
            '<span class="g-count">' + TV.icon('zoom') + '<span id="g-count">1/' + car.gallery.length + '</span></span></div>' +
          (car.gallery.length > 1 ? '<div class="thumbs" id="g-thumbs">' + car.gallery.map(function (g, i) {
            return '<button type="button" data-g="' + i + '" aria-label="Xem ảnh ' + (i + 1) + '" aria-current="' + (i === 0) + '"><img src="' + g + '" alt="" loading="lazy"></button>';
          }).join('') + '</div>' : '') +
          '<p class="note" style="margin:8px 0 0">Ảnh đúng mẫu xe, nguồn Wikimedia Commons (xem chân trang). Ảnh chụp thực tế xe tại bãi được gửi qua Zalo khi bạn đặt lịch.</p>' +
        '</div>' +
      '</div>' +
      '<aside class="d-info">' +
        '<div class="d-card">' +
          '<div class="tags" style="position:static">' + TV.tagHtml(car) + '<span class="tag" style="background:var(--bg);color:var(--muted)">Mã ' + code + '</span></div>' +
          '<h1 class="d-title">' + TV.esc(car.name) + '</h1>' +
          '<div class="d-price">' + priceTxt + '</div>' +
          '<div class="d-price-note">Góp khoảng ' + (est / 1e6).toFixed(1).replace('.', ',') + ' triệu/tháng · vay 70%, 5 năm, 9%/năm (ước tính)</div>' +
          '<div class="d-quick">' +
            '<div>Năm SX<b>' + car.year + '</b></div><div>Odo<b>' + TV.km(car.odo) + '</b></div><div>Hộp số<b>' + (isMT ? 'Số sàn' : 'Tự động') + '</b></div>' +
            '<div>Nhiên liệu<b>' + car.fuel + '</b></div><div>Kiểu dáng<b>' + car.body + '</b></div><div>Màu<b>' + car.color + '</b></div>' +
          '</div>' +
          '<div class="d-btns"><a class="btn btn-red full" href="tel:' + TV.info.tel + '">' + TV.icon('phone') + 'Gọi ' + TV.info.hotline + '</a>' +
            '<a class="btn btn-line" href="' + TV.info.zalo + '" target="_blank" rel="noopener">' + TV.icon('chat') + 'Nhắn Zalo</a>' +
            '<a class="btn btn-ink" href="#dat-lich">' + TV.icon('calendar') + 'Đặt lịch</a></div>' +
          '<div class="d-tools">' +
            '<button class="btn btn-line btn-sm" type="button" data-fav="' + car.id + '" data-label="1">' + TV.icon('heart') + '<span>Lưu xe</span></button>' +
            '<button class="btn btn-line btn-sm" type="button" data-cmp="' + car.id + '" data-label="1">' + TV.icon('compare') + '<span>So sánh</span></button>' +
            '<button class="btn btn-line btn-sm" type="button" data-share="' + car.id + '">' + TV.icon('share') + '<span>Chia sẻ</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="d-card seller"><span class="avatar">HN</span><div><b>Phạm Hoàng Nam</b><div class="note">Tư vấn viên phụ trách xe (minh hoạ) · Đăng ngày ' + TV.date(car.posted) + '</div></div></div>' +
      '</aside>' +
      '<div class="d-main">' +
        '<section class="d-sec" style="margin-top:24px"><h2>Điểm nổi bật</h2><ul class="d-desc">' + car.highlights.map(function (h) { return '<li>' + TV.esc(h) + '</li>'; }).join('') + '</ul></section>' +
        '<section class="d-sec" id="thong-so"><h2>Thông số xe</h2><div class="spec-2col">' + specTable(specs.slice(0, half)) + specTable(specs.slice(half)) + '</div></section>' +
        '<section class="d-sec" id="tinh-trang"><h2>Tình trạng xe – tóm tắt kiểm định</h2>' +
          '<div class="check-grid">' + checks.map(function (c) { return '<div class="chk' + (c[2] ? ' warn' : '') + '">' + TV.icon(c[2] ? 'info' : 'check-c') + '<div><b>' + c[0] + '</b><span>' + c[1] + '</span></div></div>'; }).join('') + '</div>' +
          '<p class="note" style="margin-top:10px">Tóm tắt 8 nhóm trong phiếu kiểm định 176 hạng mục (nội dung minh hoạ). Bản đầy đủ gửi kèm khi đặt lịch xem xe.</p></section>' +
        '<section class="d-sec" id="dat-lich"><h2>Đặt lịch xem xe, lái thử</h2>' +
          '<form id="book-form" novalidate><div class="form-grid">' +
            '<div class="fld full"><span class="lbl">Bạn muốn</span><div class="seg"><label><input type="radio" name="type" value="Xem xe tại bãi" checked><span>Xem xe tại bãi</span></label><label><input type="radio" name="type" value="Xem xe và lái thử"><span>Xem xe và lái thử</span></label></div></div>' +
            '<div class="fld"><label for="b-name">Họ tên <span class="req">*</span></label><input class="inp" id="b-name" name="name" autocomplete="name"><span class="err"></span></div>' +
            '<div class="fld"><label for="b-phone">Số điện thoại <span class="req">*</span></label><input class="inp" id="b-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="09xx xxx xxx"><span class="err"></span></div>' +
            '<div class="fld"><label for="b-date">Ngày hẹn <span class="req">*</span></label><input class="inp" id="b-date" name="date" type="date" min="' + iso(tomorrow) + '" max="' + iso(maxD) + '"><span class="err"></span></div>' +
            '<div class="fld"><label for="b-time">Khung giờ <span class="req">*</span></label><select class="sel" id="b-time" name="time"><option value="">Chọn giờ</option><option>08:00 – 10:00</option><option>10:00 – 12:00</option><option>13:30 – 15:30</option><option>15:30 – 17:30</option><option>17:30 – 19:30</option></select><span class="err"></span></div>' +
            '<div class="fld full"><label for="b-note">Ghi chú</label><textarea class="inp" id="b-note" name="note" rows="2" maxlength="300" placeholder="VD: muốn mang thợ riêng, cần hỗ trợ vay…"></textarea></div>' +
          '</div><div class="form-foot"><span class="note">Lái thử cần mang giấy phép lái xe hạng B trở lên.</span><button class="btn btn-red" type="submit">Gửi lịch hẹn</button></div></form>' +
          '<div class="success" id="book-ok" tabindex="-1"><div class="ok-ic">' + TV.icon('check') + '</div><h3>Đã giữ lịch hẹn</h3><p class="muted">Tư vấn viên gọi xác nhận trong 15 phút và gửi phiếu kiểm định qua Zalo.</p><dl id="book-sum"></dl><div><a class="btn btn-line" href="index.html#danh-sach">Xem thêm xe khác</a></div></div>' +
        '</section>' +
        '<section class="d-sec" id="tra-gop"><h2>Tính trả góp cho xe này</h2><div class="calc" id="d-calc"></div></section>' +
      '</div>' +

    '</div>' +
    '<section class="d-sec"><div class="sec-head"><div><h2 style="margin:0">Xe tương tự</h2></div><a class="link-more" href="index.html?kieu=' + TV.slug(car.body) + '#danh-sach">Xem thêm ' + car.body + TV.icon('arrow-right') + '</a></div>' +
      '<div class="car-grid" id="similar"></div></section>' +
    '<div class="dbar"><div class="p"><small>' + TV.esc(car.model + ' ' + car.year) + '</small><b>' + priceTxt + '</b></div>' +
      '<a class="btn btn-line" href="#dat-lich">' + TV.icon('calendar') + 'Đặt lịch</a><a class="btn btn-red" href="tel:' + TV.info.tel + '">' + TV.icon('phone') + 'Gọi</a></div>';
  document.body.classList.add('has-dbar');

  /* ----- gallery + lightbox ----- */
  var g = 0, n = car.gallery.length, lb = $('#lightbox');
  function show(i) {
    g = (i + n) % n;
    $('#g-img').src = car.gallery[g]; $('#g-img').alt = car.name + ' – ảnh ' + (g + 1);
    $('#g-count').textContent = (g + 1) + '/' + n;
    $$('#g-thumbs button').forEach(function (b, k) { b.setAttribute('aria-current', k === g); });
    if (lb.classList.contains('open')) {
      $('#lb-img').src = car.gallery[g]; $('#lb-img').alt = car.name + ' – ảnh ' + (g + 1);
      $('#lb-count').textContent = 'Ảnh ' + (g + 1) + '/' + n;
    }
  }
  $$('#g-thumbs button').forEach(function (b) { b.addEventListener('click', function () { show(+b.getAttribute('data-g')); }); });
  if (n > 1) {
    $('#g-prev').addEventListener('click', function (e) { e.stopPropagation(); show(g - 1); });
    $('#g-next').addEventListener('click', function (e) { e.stopPropagation(); show(g + 1); });
  }
  $$('.lb-prev', lb).concat($$('.lb-next', lb)).forEach(function (b) {
    b.hidden = n < 2;
    b.addEventListener('click', function () { show(g + (b.classList.contains('lb-next') ? 1 : -1)); });
  });
  function openLb() {
    TV.openModal(lb);
    $('#lb-cap').textContent = car.name;
    show(g);
  }
  $('#g-main').addEventListener('click', openLb);
  $('#g-main').addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); }
    if (e.key === 'ArrowRight') show(g + 1);
    if (e.key === 'ArrowLeft') show(g - 1);
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight') show(g + 1);
    if (e.key === 'ArrowLeft') show(g - 1);
  });
  var sx = null;
  $('#lb-img').addEventListener('pointerdown', function (e) { sx = e.clientX; });
  $('#lb-img').addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(g + (dx < 0 ? 1 : -1));
  });
  ['dragstart'].forEach(function (ev) { $('#lb-img').addEventListener(ev, function (e) { e.preventDefault(); }); });

  /* ----- form đặt lịch ----- */
  var form = $('#book-form'), tried = false;
  function validate() {
    var f = form.elements, ok = true;
    var set = function (el, m) { TV.setErr(el, m); if (m) ok = false; };
    var nm = f.name.value.trim();
    set(f.name, nm.length < 2 ? 'Nhập họ tên (ít nhất 2 ký tự)' : (/\d/.test(nm) ? 'Họ tên không chứa chữ số' : ''));
    set(f.phone, !f.phone.value.trim() ? 'Nhập số điện thoại' : (TV.phoneOk(f.phone.value) ? '' : 'Số điện thoại chưa đúng (10 số, bắt đầu 03, 05, 07, 08, 09)'));
    var d = f.date.value;
    set(f.date, !d ? 'Chọn ngày hẹn' : (d < f.date.min ? 'Chọn từ ngày mai trở đi' : (d > f.date.max ? 'Chỉ nhận lịch trong 30 ngày tới' : '')));
    set(f.time, f.time.value ? '' : 'Chọn khung giờ');
    return ok;
  }
  form.addEventListener('input', function () { if (tried) validate(); });
  form.addEventListener('change', function () { if (tried) validate(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); tried = true;
    if (!validate()) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
    var f = form.elements;
    var rows = [['Mã lịch hẹn', TV.refCode('LH')], ['Xe', car.name + ' (' + code + ')'], ['Nội dung', form.querySelector('[name=type]:checked').value],
      ['Thời gian', TV.date(f.date.value) + ', ' + f.time.value], ['Liên hệ', f.name.value.trim() + ' · ' + f.phone.value.trim()]];
    $('#book-sum').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + TV.esc(r[1]) + '</dd>'; }).join('');
    form.classList.add('done'); $('#book-ok').classList.add('show'); $('#book-ok').focus();
  });

  /* ----- trả góp + xe tương tự ----- */
  TV.mountCalc($('#d-calc'), { carId: car.id });
  var sim = D.cars.filter(function (c) { return c.id !== car.id; }).map(function (c) {
    var s = (c.body === car.body ? 3 : 0) + (c.brand === car.brand ? 1 : 0) + (c.fuel === car.fuel ? 0.5 : 0) - Math.abs(c.price - car.price) / car.price * 4;
    return { c: c, s: s };
  }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (x) { return x.c; });
  $('#similar').innerHTML = sim.map(function (c) { return TV.card(c); }).join('');
  TV.sync();
})();
