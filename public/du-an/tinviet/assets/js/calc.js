/* Bộ tính trả góp: gốc đều – lãi giảm dần (cách phổ biến ở ngân hàng VN) hoặc trả đều (annuity) */
(function () {
  'use strict';
  var TV = window.TV;

  /* Hàm thuần, dùng chung + để kiểm thử */
  TV.loanCalc = function (price, downPct, months, ratePct, mode) {
    var loan = Math.round(price * (1 - downPct / 100));
    var i = ratePct / 100 / 12, rows = [], totalInt = 0, bal = loan, first = 0;
    for (var m = 1; m <= months; m++) {
      var interest = bal * i, principal, pay;
      if (mode === 'deu') {
        pay = i === 0 ? loan / months : loan * i / (1 - Math.pow(1 + i, -months));
        principal = pay - interest;
      } else {
        principal = loan / months; pay = principal + interest;
      }
      bal = Math.max(0, bal - principal);
      totalInt += interest;
      if (m === 1) first = pay;
      rows.push({ m: m, principal: principal, interest: interest, pay: pay, bal: bal });
    }
    return { price: price, down: price - loan, loan: loan, first: first, last: rows.length ? rows[rows.length - 1].pay : 0, totalInt: totalInt, total: loan + totalInt, rows: rows };
  };

  TV.mountCalc = function (root, opts) {
    opts = opts || {};
    var cars = window.TVDATA.cars;
    var st = { price: opts.price || 600e6, down: 30, months: 60, rate: 9, mode: 'giam', carId: opts.carId || '' };
    if (opts.carId) { var c0 = TV.carById(opts.carId); if (c0) st.price = c0.price; }

    var carOpts = '<option value="">Nhập giá khác</option>' + cars.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === st.carId ? ' selected' : '') + '>' + TV.esc(c.name) + ' – ' + TV.price(c.price) + '</option>';
    }).join('');

    root.innerHTML =
      '<div class="calc-box">' +
        '<div class="mode" role="group" aria-label="Cách tính">' +
          '<button type="button" data-mode="giam" aria-pressed="true">Gốc đều, lãi giảm dần</button>' +
          '<button type="button" data-mode="deu" aria-pressed="false">Trả đều hằng tháng</button></div>' +
        '<div class="form-grid" style="margin-bottom:18px">' +
          '<div class="fld"><label for="lc-car">Xe đang bán</label><select class="sel" id="lc-car">' + carOpts + '</select></div>' +
          '<div class="fld"><label for="lc-price">Giá xe (triệu đồng)</label><input class="inp" id="lc-price" type="number" inputmode="numeric" min="100" max="10000" step="1" value="' + Math.round(st.price / 1e6) + '"><span class="err"></span></div>' +
        '</div>' +
        '<div class="range-row"><div class="top"><label for="lc-down">Trả trước</label><output id="o-down"></output></div>' +
          '<input type="range" id="lc-down" min="30" max="90" step="5" value="' + st.down + '"><div class="scale"><span>30% (vay 70%)</span><span>90%</span></div></div>' +
        '<div class="range-row"><div class="top"><label for="lc-months">Thời hạn vay</label><output id="o-months"></output></div>' +
          '<input type="range" id="lc-months" min="12" max="96" step="12" value="' + st.months + '"><div class="scale"><span>1 năm</span><span>8 năm</span></div></div>' +
        '<div class="range-row" style="margin-bottom:0"><div class="top"><label for="lc-rate">Lãi suất tham khảo</label><output id="o-rate"></output></div>' +
          '<input type="range" id="lc-rate" min="6" max="14" step="0.1" value="' + st.rate + '"><div class="scale"><span>6%/năm</span><span>14%/năm</span></div></div>' +
        '<ul class="calc-tips"><li class="calc-tips-h">Hồ sơ vay cơ bản</li>' + ['Căn cước công dân', 'Xác nhận tình trạng hôn nhân', 'Sao kê lương 3–6 tháng', 'Hợp đồng mua bán, phiếu cọc'].map(function (t) { return '<li>' + TV.icon('check') + t + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="calc-out" aria-live="polite">' +
        '<div class="lbl" id="o-label"></div><div class="big" id="o-big"></div><div class="lbl" id="o-sub"></div>' +
        '<div class="calc-lines">' +
          '<div><span>Giá xe</span><b id="o-price"></b></div>' +
          '<div><span>Trả trước</span><b id="o-downv"></b></div>' +
          '<div><span>Số tiền vay</span><b id="o-loan"></b></div>' +
          '<div><span>Tổng lãi dự kiến</span><b id="o-int"></b></div>' +
          '<div><span>Tổng trả ngân hàng (gốc + lãi)</span><b id="o-total"></b></div>' +
        '</div>' +
        '<table class="sched"><thead><tr><th>Kỳ</th><th>Gốc</th><th>Lãi</th><th>Phải trả</th></tr></thead><tbody id="o-rows"></tbody></table>' +
        '<a class="btn btn-yellow btn-block" style="margin-top:16px" id="o-cta" href="lien-he.html?chu-de=tra-gop">Đăng ký tư vấn vay</a>' +
        '<p class="note" style="margin:10px 0 0;color:#8f99a6">Ước tính tham khảo, chưa gồm bảo hiểm khoản vay và phí trước bạ.</p>' +
      '</div>';

    var $ = function (s) { return root.querySelector(s); };
    var tr = function (v) { return TV.num(v) + ' đ'; };
    function render() {
      var r = TV.loanCalc(st.price, st.down, st.months, st.rate, st.mode);
      $('#o-down').textContent = st.down + '% · ' + TV.price(r.down);
      $('#o-months').textContent = (st.months / 12) + ' năm (' + st.months + ' tháng)';
      $('#o-rate').textContent = st.rate.toFixed(1).replace('.', ',') + '%/năm';
      if (st.mode === 'deu') {
        $('#o-label').textContent = 'Trả đều mỗi tháng';
        $('#o-big').textContent = tr(r.first);
        $('#o-sub').textContent = 'Không đổi trong ' + st.months + ' tháng';
      } else {
        $('#o-label').textContent = 'Tháng đầu tiên phải trả';
        $('#o-big').textContent = tr(r.first);
        $('#o-sub').textContent = 'Giảm dần, tháng cuối còn ' + tr(r.last);
      }
      $('#o-price').textContent = tr(r.price);
      $('#o-downv').textContent = tr(r.down);
      $('#o-loan').textContent = tr(r.loan);
      $('#o-int').textContent = tr(r.totalInt);
      $('#o-total').textContent = tr(r.total);
      var pick = [0, 1, 2, r.rows.length - 1].filter(function (v, i, a) { return v >= 0 && a.indexOf(v) === i; });
      $('#o-rows').innerHTML = pick.map(function (k, idx) {
        var x = r.rows[k];
        return (idx === 3 && k > 3 ? '<tr><td colspan="4" style="text-align:center">…</td></tr>' : '') +
          '<tr><td>Tháng ' + x.m + '</td><td>' + TV.num(x.principal) + '</td><td>' + TV.num(x.interest) + '</td><td>' + TV.num(x.pay) + '</td></tr>';
      }).join('');
      $('#o-cta').href = 'lien-he.html?chu-de=tra-gop' + (st.carId ? '&xe=' + encodeURIComponent(st.carId) : '');
      root.setAttribute('data-first', Math.round(r.first));
    }
    TV.$$('[data-mode]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        st.mode = b.getAttribute('data-mode');
        TV.$$('[data-mode]', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        render();
      });
    });
    $('#lc-car').addEventListener('change', function () {
      st.carId = this.value;
      var c = TV.carById(st.carId);
      if (c) { st.price = c.price; $('#lc-price').value = Math.round(c.price / 1e6); TV.setErr($('#lc-price'), ''); }
      render();
    });
    $('#lc-price').addEventListener('input', function () {
      var v = parseFloat(this.value);
      if (!v || v < 100 || v > 10000) { TV.setErr(this, 'Nhập giá từ 100 đến 10.000 triệu'); return; }
      TV.setErr(this, '');
      st.price = v * 1e6;
      if (st.carId) { st.carId = ''; $('#lc-car').value = ''; }
      render();
    });
    ['down', 'months', 'rate'].forEach(function (k) {
      $('#lc-' + k).addEventListener('input', function () { st[k] = parseFloat(this.value); render(); });
    });
    render();
    return { set: function (carId) { $('#lc-car').value = carId; $('#lc-car').dispatchEvent(new Event('change')); } };
  };
})();
