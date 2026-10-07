/* Trang so sánh: tối đa 3 xe, lưu trong localStorage (tv_compare), chia sẻ qua ?ids= */
(function () {
  'use strict';
  var TV = window.TV, D = window.TVDATA;
  var ids = TV.param('ids');
  if (ids) {
    var list = ids.split(',').filter(function (x) { return TV.carById(x); }).slice(0, 3);
    if (list.length) TV.save('tv_compare', list);
    history.replaceState(null, '', location.pathname);
  }
  TV.init('compare', 'compare');
  var $ = TV.$, table = $('#cmp-table');

  var rows = [
    ['Giá bán', function (c) { return TV.price(c.price); }, function (c) { return -c.price; }],
    ['Năm sản xuất', function (c) { return c.year; }, function (c) { return c.year; }],
    ['Số km đã đi', function (c) { return TV.km(c.odo); }, function (c) { return -c.odo; }],
    ['Kiểu dáng', function (c) { return c.body; }],
    ['Số chỗ', function (c) { return c.seats + ' chỗ'; }, function (c) { return c.seats; }],
    ['Động cơ', function (c) { return c.engine; }],
    ['Nhiên liệu', function (c) { return c.fuel; }],
    ['Hộp số', function (c) { return c.trans; }],
    ['Dẫn động', function (c) { return c.drive; }],
    ['Màu ngoại thất', function (c) { return c.color; }],
    ['Xuất xứ', function (c) { return c.origin; }],
    ['Số chủ', function (c) { return c.owners + ' chủ'; }, function (c) { return -c.owners; }],
    ['Lốp còn', function (c) { return c.tyre + '%'; }, function (c) { return c.tyre; }],
    ['Trả trước 30%', function (c) { return TV.price(Math.ceil(c.price * 0.3 / 1e6) * 1e6); }],
    ['Góp ước tính/tháng', function (c) { return TV.num(TV.loanCalc(c.price, 30, 60, 9, 'deu').first) + ' đ'; }, function (c) { return -c.price; }]
  ];

  function render() {
    var sel = TV.cmps().map(TV.carById);
    var only = $('#only-diff').checked;
    $('#cmp-hint').textContent = sel.length === 0 ? 'Chưa có xe nào. Chọn xe ở các ô bên dưới hoặc bấm biểu tượng so sánh trên thẻ xe ở trang chủ.' :
      sel.length < 3 ? 'Đã chọn ' + sel.length + '/3 xe. Bạn có thể thêm ' + (3 - sel.length) + ' xe nữa.' : 'Đã chọn đủ 3 xe. Bỏ bớt một xe để thay xe khác.';
    var avail = D.cars.filter(function (c) { return sel.indexOf(c) < 0; });
    var head = '<colgroup><col class="first"><col><col><col></colgroup><thead><tr><th scope="col" style="vertical-align:bottom">Thông số</th>';
    for (var i = 0; i < 3; i++) {
      var c = sel[i];
      if (c) {
        head += '<th scope="col"><div class="cmp-head"><a href="xe.html?id=' + c.id + '"><img src="' + c.img + '" alt="' + TV.esc(c.name) + '"></a>' +
          '<h3><a href="xe.html?id=' + c.id + '">' + TV.esc(c.name) + '</a></h3><span class="price">' + TV.price(c.price) + '</span>' +
          '<div class="rm"><button class="btn btn-line btn-sm" type="button" data-remove="' + c.id + '">' + TV.icon('close') + 'Bỏ xe</button></div></div></th>';
      } else {
        head += '<th scope="col"><div class="cmp-slot">' + TV.icon('car') + '<label for="add-' + i + '">Thêm xe thứ ' + (i + 1) + '</label>' +
          '<select class="sel" id="add-' + i + '" data-add><option value="">Chọn xe…</option>' +
          avail.map(function (a) { return '<option value="' + a.id + '">' + TV.esc(a.name) + ' – ' + TV.price(a.price) + '</option>'; }).join('') + '</select></div></th>';
      }
    }
    head += '</tr></thead>';
    var body = '<tbody>' + rows.map(function (r) {
      var vals = sel.map(function (c) { return String(r[1](c)); });
      var diff = sel.length > 1 && vals.some(function (v) { return v !== vals[0]; });
      if (only && sel.length > 1 && !diff) return '';
      var best = -1;
      if (r[2] && diff) {
        var sc = sel.map(r[2]), mx = Math.max.apply(null, sc);
        if (sc.filter(function (s) { return s === mx; }).length === 1) best = sc.indexOf(mx);
      }
      var tds = '';
      for (var i = 0; i < 3; i++) tds += '<td' + (i === best ? ' class="best"' : '') + '>' + (sel[i] ? TV.esc(vals[i]) : '<span class="muted">–</span>') + '</td>';
      return '<tr' + (diff ? ' class="diff"' : '') + '><th scope="row">' + r[0] + '</th>' + tds + '</tr>';
    }).join('') + '</tbody>';
    table.innerHTML = head + body;
  }
  table.addEventListener('change', function (e) {
    var s = e.target.closest('[data-add]'); if (!s || !s.value) return;
    TV.toggleCmp(s.value);
  });
  table.addEventListener('click', function (e) {
    var b = e.target.closest('[data-remove]'); if (b) TV.toggleCmp(b.getAttribute('data-remove'));
  });
  $('#only-diff').addEventListener('change', render);
  $('#cmp-clear').addEventListener('click', function () { TV.save('tv_compare', []); TV.sync(); TV.toast('Đã xoá danh sách so sánh'); });
  $('#cmp-share').addEventListener('click', function () {
    var c = TV.cmps();
    if (!c.length) { TV.toast('Chưa có xe để chia sẻ', 'warn'); return; }
    var url = new URL('so-sanh.html?ids=' + c.join(','), location.href).href;
    var done = function () { TV.toast('Đã sao chép liên kết so sánh'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, function () { TV.toast(url); });
    else TV.toast(url);
  });
  document.addEventListener('tv:change', render);
  render();
})();
