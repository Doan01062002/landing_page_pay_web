/* Hưng Thịnh Auto – layout dùng chung: header, footer, store localStorage, thẻ sản phẩm, modal, toast */
(function () {
  'use strict';
  var D = window.HT_DATA;
  var U = D.U;

  /* ---------------- Icons (inline SVG) ---------------- */
  var I = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    cart: '<path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.3"/><circle cx="10" cy="20.5" r="1.4"/><circle cx="17.5" cy="20.5" r="1.4"/>',
    heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    compare: '<path d="M7 4v13M7 17l-3-3M7 17l3-3M17 20V7M17 7l-3 3M17 7l3 3"/>',
    phone: '<path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11.5 11.5 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.6 16.6 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    pin: '<path d="M12 21.5s-6.8-6.2-6.8-11.6a6.8 6.8 0 0 1 13.6 0c0 5.4-6.8 11.6-6.8 11.6z"/><circle cx="12" cy="9.8" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.5V12l3 2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    down: '<path d="m6 9.5 6 6 6-6"/>',
    left: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    right: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    fuel: '<path d="M4 20V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14 5v15M3 20h12M6.5 8h5"/><path d="M14 10h2a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V8.5L18 6"/>',
    gear: '<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v8M12 8v8M18 8v4H6"/>',
    gauge: '<path d="M4.5 17a8.5 8.5 0 1 1 15 0"/><path d="m12 13 4-4"/><circle cx="12" cy="13" r="1.4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    seat: '<path d="M7 4.5h4a2 2 0 0 1 2 2.2L12.3 14H6.5L5 6.8A2 2 0 0 1 7 4.5z"/><path d="M5.5 14h10a3 3 0 0 1 3 3v1.5H5.5zM8 18.5V21M16 18.5V21"/>',
    star: '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="none"/>',
    shield: '<path d="M12 2.8 4.5 5.6v5.6c0 4.8 3.1 8.6 7.5 10 4.4-1.4 7.5-5.2 7.5-10V5.6z"/><path d="m8.6 12 2.4 2.4 4.5-4.6"/>',
    wrench: '<path d="M14.6 6.2a4.2 4.2 0 0 0 5.2 5.2l-8.7 8.7a2.3 2.3 0 0 1-3.2-3.2L16.6 8.2"/><path d="M14.6 6.2 17.8 3l3.2 3.2-3.2 3.2"/>',
    tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.3" cy="8.3" r="1.6"/>',
    car: '<path d="M4 15.5V12l2-4.6A2 2 0 0 1 7.8 6h8.4a2 2 0 0 1 1.8 1.4L20 12v3.5a1 1 0 0 1-1 1h-1.2M6.2 16.5H5a1 1 0 0 1-1-1M9 16.5h6M4.5 12h15"/><circle cx="7.6" cy="16.5" r="1.7"/><circle cx="16.4" cy="16.5" r="1.7"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
    refresh: '<path d="M20 11.5A8 8 0 0 0 5.6 6.4L4 8M4 3.8V8h4.2M4 12.5a8 8 0 0 0 14.4 5.1L20 16m0 4.2V16h-4.2"/>',
    filter: '<path d="M4 5h16l-6.2 7.4V19l-3.6-1.8v-4.8z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    list: '<rect x="4" y="4.5" width="5" height="5" rx="1.2"/><rect x="4" y="14.5" width="5" height="5" rx="1.2"/><path d="M12 6h8M12 9h5M12 16h8M12 19h5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.8 1.8 0 0 0 8.8 21h6.4a1.8 1.8 0 0 0 1.8-1.5L18 7M9 7V4.5h6V7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 8.5h8M8 11.5h5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    bolt: '<path d="M13.5 2 4.5 13.5H11L9.8 22l9.7-12.3H13z"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    quote: '<path d="M10 7H6.5A2.5 2.5 0 0 0 4 9.5V13h5v5H4M20 7h-3.5A2.5 2.5 0 0 0 14 9.5V13h5v5h-5" />',
    fb: '<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5z"/>',
    yt: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z"/>',
    ig: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8"/>',
    music: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.4 4.3 5 4.5"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="m8.2 10.8 7-3.6M8.2 13.2l7 3.6"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7.5"/>',
    hand: '<path d="M3 13.5h3l3.6-1.2a3 3 0 0 1 2 .1l3.7 1.6a1.6 1.6 0 0 1-1.2 3H10"/><path d="M6 19.5h6.8a4 4 0 0 0 2.4-.8l5.2-4a1.6 1.6 0 0 0-2-2.5L14.6 14"/><path d="M3 12v9"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.6"/><path d="m8.5 7 1.5-3h4l1.5 3"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>'
  };
  function ic(n, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (I[n] || '') + '</svg>';
  }

  /* Biểu tượng kiểu dáng xe (tự vẽ) */
  var TYPE_PATH = {
    suv: 'M5 31V21l5-8h31l8 8 9 2.5V31',
    crossover: 'M5 31v-7l7-3 7-7h22l8 7 9 2.5V31',
    sedan: 'M4 31v-5l9-2 9-8h17l10 8 9 2v5',
    'ban-tai': 'M4 31v-8l6-1 6-8h13v8h30v9',
    mpv: 'M5 31V18l9-7h33l8 9 4 2v9',
    'the-thao': 'M3 31v-3l12-4 10-6h12l12 7 10 2v4'
  };
  function typeIcon(t) {
    return '<svg class="type-ic" viewBox="0 0 64 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="' + (TYPE_PATH[t] || TYPE_PATH.sedan) + '"/><path d="M11 31h7M27 31h14M50 31h9"/><circle cx="22.5" cy="31" r="4.6"/><circle cx="45.5" cy="31" r="4.6"/></svg>';
  }

  var LOGO_MARK = '<path d="M24 2 44 8.5V25c0 12.5-8.5 21-20 25.5C12.5 46 4 37.5 4 25V8.5Z" fill="#ffc20e"/><path d="M17 13.5 24 9.6l7 3.9" fill="none" stroke="#14244f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 34v-4.2c0-1.3.9-2.3 2.1-2.6l5.2-1.3 4.6-4.8c.8-.8 1.9-1.3 3-1.3h6.9c1.3 0 2.4.6 3.1 1.7l3 4.4 2.3.7c1.2.4 2 1.4 2 2.7V34Z" fill="#14244f"/><path d="m18.3 26 3.2-3.4c.3-.3.7-.5 1.1-.5H26V26Zm9.4 0v-3.9h2.8c.4 0 .8.2 1 .5l2.3 3.4Z" fill="#ffc20e"/><circle cx="16" cy="34" r="3.9" fill="#14244f" stroke="#ffc20e" stroke-width="1.6"/><circle cx="33" cy="34" r="3.9" fill="#14244f" stroke="#ffc20e" stroke-width="1.6"/>';
  function logo(light) {
    var c = light ? '#ffffff' : '#14244f';
    return '<svg class="logo__svg" viewBox="0 0 230 52" role="img" aria-label="Hưng Thịnh Auto">' + LOGO_MARK +
      '<text x="54" y="27" font-size="20" font-weight="800" fill="' + c + '" letter-spacing=".3">HƯNG THỊNH</text>' +
      '<rect x="54" y="35" width="22" height="3" rx="1.5" fill="#ffc20e"/>' +
      '<text x="81" y="40.5" font-size="11" font-weight="700" fill="' + (light ? '#ffc20e' : '#14244f') + '" letter-spacing="4.2">AUTO</text></svg>';
  }

  /* ---------------- Helpers ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('vi-VN') + '₫'; }
  function fmtShort(n) {
    if (n >= 1e9) return (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
    return Math.round(n / 1e6).toLocaleString('vi-VN') + ' triệu';
  }
  function fmtKm(km) { return km ? km.toLocaleString('vi-VN') + ' km' : 'Xe mới'; }
  function fmtDate(s) { var p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function brandName(id) { var b = byId(D.BRANDS, id); return b ? b.name : id; }
  function typeName(id) { var t = byId(D.TYPES, id); return t ? t.name : id; }
  function carTitle(c) { return c.name + ' ' + c.version; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------------- Store ---------------- */
  var Store = {
    get: function (k) { try { var v = JSON.parse(localStorage.getItem('ht_' + k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } },
    set: function (k, v) { try { localStorage.setItem('ht_' + k, JSON.stringify(v)); } catch (e) { /* storage off */ } updateCounters(); document.dispatchEvent(new CustomEvent('ht:store', { detail: k })); },
    has: function (k, id) { return Store.get(k).indexOf(id) > -1; },
    toggle: function (k, id, max) {
      var l = Store.get(k), i = l.indexOf(id);
      if (i > -1) { l.splice(i, 1); Store.set(k, l); return false; }
      if (max && l.length >= max) return null;
      l.push(id); Store.set(k, l); return true;
    },
    viewed: function (id) { var l = Store.get('viewed').filter(function (x) { return x !== id; }); l.unshift(id); Store.set('viewed', l.slice(0, 12)); },
    cart: function () { return Store.get('cart'); },
    addCart: function (item) {
      var l = Store.get('cart'), f = null;
      l.forEach(function (x) { if (x.key === item.key) f = x; });
      if (f) { if (item.kind === 'dep') { Object.assign(f, item); } else { f.qty = Math.min(99, (f.qty || 1) + (item.qty || 1)); } }
      else l.push(item);
      Store.set('cart', l);
    },
    cartCount: function () { return Store.get('cart').reduce(function (s, x) { return s + (x.qty || 1); }, 0); }
  };
  function updateCounters() {
    var m = { cart: Store.cartCount(), wish: Store.get('wish').length, compare: Store.get('compare').length };
    $$('[data-count]').forEach(function (el) { var n = m[el.getAttribute('data-count')] || 0; el.textContent = n; el.classList.toggle('is-zero', !n); });
    $$('[data-wish]').forEach(function (b) { var on = Store.has('wish', b.getAttribute('data-wish')); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    $$('[data-compare]').forEach(function (b) { var on = Store.has('compare', b.getAttribute('data-compare')); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
  }

  /* ---------------- Toast & modal ---------------- */
  function toast(msg, link) {
    var w = $('#toasts');
    if (!w) { w = document.createElement('div'); w.id = 'toasts'; w.className = 'toasts'; w.setAttribute('role', 'status'); document.body.appendChild(w); }
    var t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = ic('check') + '<span>' + msg + '</span>' + (link ? '<a href="' + link[0] + '">' + link[1] + '</a>' : '');
    w.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 300); }, 3200);
  }
  function modal(html, cls) {
    closeModal();
    var m = document.createElement('div'); m.className = 'modal ' + (cls || ''); m.id = 'modal';
    m.innerHTML = '<div class="modal__bg" data-close></div><div class="modal__box" role="dialog" aria-modal="true"><button class="modal__x" data-close aria-label="Đóng">' + ic('close') + '</button>' + html + '</div>';
    document.body.appendChild(m); document.body.classList.add('no-scroll');
    requestAnimationFrame(function () { m.classList.add('in'); });
    m.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
    var f = m.querySelector('input,select,textarea,button:not(.modal__x)'); if (f) setTimeout(function () { f.focus(); }, 60);
    initForms(m);
    return m;
  }
  function closeModal() { var m = $('#modal'); if (m) { m.remove(); document.body.classList.remove('no-scroll'); } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  /* ---------------- Forms (demo, không gửi dữ liệu) ---------------- */
  function validateField(el) {
    var f = el.closest('.field'); if (!f) return true;
    var ok = el.checkValidity(), msg = '';
    if (!ok) {
      if (el.validity.valueMissing) msg = 'Vui lòng nhập thông tin này';
      else if (el.validity.patternMismatch) msg = el.getAttribute('data-msg') || 'Định dạng chưa đúng';
      else if (el.validity.typeMismatch) msg = 'Định dạng chưa đúng';
      else if (el.validity.tooShort) msg = 'Cần tối thiểu ' + el.minLength + ' ký tự';
      else msg = 'Giá trị chưa hợp lệ';
    }
    if (ok && el.hasAttribute('data-match')) {
      var o = el.form.querySelector('[name="' + el.getAttribute('data-match') + '"]');
      if (o && o.value !== el.value) { ok = false; msg = 'Mật khẩu nhập lại không khớp'; }
    }
    f.classList.toggle('has-err', !ok);
    var e = f.querySelector('.field__err');
    if (!e) { e = document.createElement('small'); e.className = 'field__err'; f.appendChild(e); }
    e.textContent = msg;
    return ok;
  }
  function initForms(root) {
    $$('form[data-demo-form]', root).forEach(function (form) {
      if (form._ht) return; form._ht = true;
      form.setAttribute('novalidate', '');
      $$('input,select,textarea', form).forEach(function (el) {
        el.addEventListener('blur', function () { if (el.value) validateField(el); });
        el.addEventListener('input', function () { if (el.closest('.has-err')) validateField(el); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true, first = null;
        $$('input,select,textarea', form).forEach(function (el) { if (!validateField(el)) { ok = false; first = first || el; } });
        if (!ok) { first.focus(); return; }
        var ev = new CustomEvent('ht:submit', { cancelable: true, detail: new FormData(form) });
        if (!form.dispatchEvent(ev)) return;
        var msg = form.getAttribute('data-success') || 'Đã ghi nhận thông tin (demo – không gửi dữ liệu đi đâu).';
        var box = document.createElement('div'); box.className = 'form-ok'; box.setAttribute('role', 'status');
        box.innerHTML = '<span class="form-ok__ic">' + ic('check') + '</span><div><b>Gửi thành công!</b><p>' + msg + '</p></div>';
        if (form.hasAttribute('data-replace')) { form.replaceWith(box); }
        else { var old = form.parentNode.querySelector('.form-ok'); if (old) old.remove(); form.parentNode.insertBefore(box, form.nextSibling); form.reset(); }
      });
    });
  }

  /* ---------------- Cards ---------------- */
  function discount(c) { return c.oldPrice ? Math.round((1 - c.price / c.oldPrice) * 100) : 0; }
  function carCard(c) {
    var d = discount(c);
    return '<article class="ccard reveal" data-id="' + c.id + '">' +
      '<div class="ccard__head"><div class="ccard__tt"><h3 class="ccard__name"><a href="xe.html?id=' + c.id + '">' + esc(carTitle(c)) + '</a></h3>' +
      '<span class="ccard__type">' + typeName(c.type) + ' · ' + c.year + '</span></div>' +
      '<button class="ibtn ibtn--wish" type="button" data-wish="' + c.id + '" aria-label="Thêm vào yêu thích" aria-pressed="false">' + ic('heart') + '</button></div>' +
      '<a class="ccard__img" href="xe.html?id=' + c.id + '" tabindex="-1"><img loading="lazy" src="' + U(c.images[0], 640, 420) + '" alt="' + esc(carTitle(c)) + '" width="640" height="420">' +
      (d ? '<span class="badge badge--sale">-' + d + '%</span>' : '') +
      '<span class="ccard__cond ' + (c.km ? 'is-used' : '') + '">' + c.condition + '</span>' + (c.tag ? '<span class="ccard__tag">' + c.tag + '</span>' : '') + '</a>' +
      '<div class="ccard__body"><ul class="ccard__specs"><li>' + ic('fuel') + c.fuel + '</li><li>' + ic('gear') + c.gear.split(' ')[0] + ' ' + (c.gear.split(' ')[1] || '') + '</li><li>' + ic('gauge') + fmtKm(c.km) + '</li></ul>' +
      '<p class="ccard__desc">' + esc(c.highlights[0]) + '.</p>' +
      '<div class="ccard__price"><b>' + fmt(c.price) + '</b>' + (c.oldPrice ? '<s>' + fmt(c.oldPrice) + '</s>' : '') + '</div>' +
      '<div class="ccard__acts"><button class="btn btn--soft btn--sm" type="button" data-testdrive="' + c.id + '">Đăng ký lái thử</button>' +
      '<a class="btn btn--line btn--sm ccard__more" href="xe.html?id=' + c.id + '">Chi tiết</a>' +
      '<button class="ibtn ibtn--cmp" type="button" data-compare="' + c.id + '" aria-label="Thêm vào so sánh" title="So sánh" aria-pressed="false">' + ic('compare') + '</button></div></div></article>';
  }
  function accCard(a) {
    var d = a.oldPrice ? Math.round((1 - a.price / a.oldPrice) * 100) : 0;
    var cat = byId(D.ACC_CATS, a.cat);
    return '<article class="acard reveal">' +
      '<button class="acard__img" type="button" data-quick="' + a.id + '" aria-label="Xem nhanh ' + esc(a.name) + '"><img loading="lazy" src="' + U(a.images[0], 520, 420) + '" alt="' + esc(a.name) + '" width="520" height="420">' + (d ? '<span class="badge badge--sale">-' + d + '%</span>' : '') + '<span class="acard__eye">' + ic('eye') + ' Xem nhanh</span></button>' +
      '<div class="acard__body"><span class="acard__cat">' + (cat ? cat.name : '') + '</span><h3 class="acard__name"><button type="button" data-quick="' + a.id + '">' + esc(a.name) + '</button></h3>' +
      '<div class="acard__foot"><div class="acard__price"><b>' + fmt(a.price) + '</b>' + (a.oldPrice ? '<s>' + fmt(a.oldPrice) + '</s>' : '') + '</div>' +
      '<button class="btn btn--soft btn--sm" type="button" data-addcart="' + a.id + '">' + ic('cart') + 'Mua hàng</button></div></div></article>';
  }
  function postCard(p, big) {
    var cat = byId(D.POST_CATS, p.cat);
    return '<article class="pcard reveal' + (big ? ' pcard--big' : '') + '"><a class="pcard__img" href="bai-viet.html?id=' + p.id + '"><img loading="lazy" src="' + U(p.img, big ? 900 : 640, big ? 560 : 400) + '" alt="' + esc(p.title) + '" width="640" height="400"><span class="pcard__cat">' + (cat ? cat.name : '') + '</span></a>' +
      '<div class="pcard__body"><p class="pcard__meta">' + ic('calendar') + fmtDate(p.date) + ' • ' + esc(p.author) + '</p><h3 class="pcard__title"><a href="bai-viet.html?id=' + p.id + '">' + esc(p.title) + '</a></h3>' +
      '<p class="pcard__ex">' + esc(p.excerpt) + '</p><a class="pcard__more" href="bai-viet.html?id=' + p.id + '">Đọc tiếp ' + ic('arrow') + '</a></div></article>';
  }
  function emptyState(title, text, href, label, icon) {
    return '<div class="empty"><span class="empty__ic">' + ic(icon || 'car') + '</span><h3>' + title + '</h3><p>' + text + '</p>' + (href ? '<a class="btn btn--y" href="' + href + '">' + label + '</a>' : '') + '</div>';
  }
  function showroomOptions(sel) {
    return D.SHOWROOMS.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + s.name + '</option>'; }).join('');
  }

  /* ---------------- Test drive / quick view / deposit ---------------- */
  function today(off) { var d = new Date(Date.now() + (off || 0) * 864e5); return d.toISOString().slice(0, 10); }
  function testDrive(id) {
    var c = byId(D.CARS, id); if (!c) return;
    modal('<div class="mform"><span class="kicker">Đăng ký lái thử</span><h3>' + esc(carTitle(c)) + '</h3><p class="muted">Để lại thông tin, tư vấn viên sẽ gọi xác nhận lịch hẹn (demo, dữ liệu không được gửi đi).</p>' +
      '<form data-demo-form data-replace data-success="Yêu cầu lái thử ' + esc(carTitle(c)) + ' đã được ghi nhận. Đây là bản demo nên không có cuộc gọi thực tế.">' +
      '<div class="grid2"><label class="field"><span>Họ và tên *</span><input name="name" required autocomplete="name" placeholder="Nguyễn Văn A"></label>' +
      '<label class="field"><span>Số điện thoại *</span><input name="phone" required type="tel" pattern="0[0-9]{9}" data-msg="Số điện thoại gồm 10 số, bắt đầu bằng 0" placeholder="09xx xxx xxx"></label></div>' +
      '<label class="field"><span>Showroom</span><select name="showroom">' + showroomOptions(c.showroom) + '</select></label>' +
      '<div class="grid2"><label class="field"><span>Ngày *</span><input name="date" type="date" required min="' + today(1) + '" value="' + today(2) + '"></label>' +
      '<label class="field"><span>Khung giờ</span><select name="time"><option>8:00 – 10:00</option><option>10:00 – 12:00</option><option>14:00 – 16:00</option><option>16:00 – 18:00</option></select></label></div>' +
      '<button class="btn btn--y btn--block" type="submit">' + ic('key') + 'Gửi đăng ký lái thử</button></form></div>', 'modal--sm');
  }
  function quickView(id) {
    var a = byId(D.ACCESSORIES, id); if (!a) return;
    var cat = byId(D.ACC_CATS, a.cat);
    var m = modal('<div class="qv"><div class="qv__img"><img src="' + U(a.images[0], 720, 600) + '" alt="' + esc(a.name) + '"></div><div class="qv__info"><span class="kicker">' + (cat ? cat.name : '') + '</span><h3>' + esc(a.name) + '</h3>' +
      '<div class="price-lg"><b>' + fmt(a.price) + '</b>' + (a.oldPrice ? '<s>' + fmt(a.oldPrice) + '</s>' : '') + '</div><p>' + esc(a.desc) + '</p>' +
      '<ul class="ticks"><li>' + ic('check') + 'Lắp đặt tại showroom (minh hoạ)</li><li>' + ic('check') + 'Đổi trả trong 7 ngày nếu lỗi</li></ul>' +
      '<div class="qv__buy"><div class="qty"><button type="button" data-q="-1" aria-label="Giảm">' + ic('minus') + '</button><input type="number" min="1" max="99" value="1" aria-label="Số lượng"><button type="button" data-q="1" aria-label="Tăng">' + ic('plus') + '</button></div>' +
      '<button class="btn btn--y" type="button" id="qvAdd">' + ic('cart') + 'Thêm vào giỏ</button></div></div></div>', 'modal--lg');
    var inp = m.querySelector('.qty input');
    m.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { inp.value = Math.max(1, Math.min(99, (+inp.value || 1) + +b.getAttribute('data-q'))); }); });
    m.querySelector('#qvAdd').addEventListener('click', function () { addAcc(id, Math.max(1, +inp.value || 1)); closeModal(); });
  }
  function addAcc(id, qty) {
    var a = byId(D.ACCESSORIES, id); if (!a) return;
    Store.addCart({ key: 'acc:' + id, kind: 'acc', id: id, qty: qty || 1 });
    toast('Đã thêm “' + esc(a.name) + '” vào giỏ', ['gio-hang.html', 'Xem giỏ']);
  }

  /* ---------------- Header / footer markup ---------------- */
  var NAV = [
    ['index.html', 'Trang chủ', 'home'], ['gioi-thieu.html', 'Giới thiệu', 'about'], ['mua-xe.html', 'Mua xe', 'listing', 'mega'],
    ['ban-xe.html', 'Bán xe', 'sell'], ['phu-kien.html', 'Phụ kiện ô tô', 'accessories'], ['tin-tuc.html', 'Tin tức', 'news', 'drop'],
    ['lien-he.html', 'Liên hệ', 'contact'], ['he-thong-showroom.html', 'Showroom', 'showroom', 'xl']
  ];
  function megaHTML() {
    return '<div class="mega"><div class="mega__in">' +
      '<div class="mega__col"><p class="mega__h">Theo hãng xe</p><div class="mega__brands">' + D.BRANDS.map(function (b) { return '<a href="mua-xe.html?hang=' + b.id + '"><span class="bdot">' + b.name.charAt(0) + '</span>' + b.name + '</a>'; }).join('') + '</div></div>' +
      '<div class="mega__col"><p class="mega__h">Theo kiểu dáng</p><div class="mega__types">' + D.TYPES.map(function (t) { return '<a href="mua-xe.html?kieu=' + t.id + '">' + typeIcon(t.id) + t.name + '</a>'; }).join('') + '</div></div>' +
      '<div class="mega__col"><p class="mega__h">Theo khoảng giá</p><ul class="mega__list">' + D.PRICES.map(function (p) { return '<li><a href="mua-xe.html?gia=' + p.id + '">' + ic('tag') + p.name + '</a></li>'; }).join('') +
      '<li><a href="mua-xe.html?tinh-trang=moi">' + ic('shield') + 'Xe mới</a></li><li><a href="mua-xe.html?tinh-trang=cu">' + ic('check') + 'Xe đã qua sử dụng</a></li></ul></div>' +
      '<a class="mega__promo" href="mua-xe.html?tinh-trang=cu"><img src="' + U('assets/img/cars/toyota-corolla-cross-1.webp') + '" alt="Toyota Corolla Cross đã qua sử dụng" loading="lazy"><span><b>Xe đã qua sử dụng</b>Kiểm tra 180 hạng mục, bảo hành tới 12 tháng</span><em>Xem ngay ' + ic('arrow') + '</em></a>' +
      '</div></div>';
  }
  function dropHTML() {
    return '<div class="drop"><ul>' + D.POST_CATS.map(function (c) { return '<li><a href="tin-tuc.html?cat=' + c.id + '">' + c.name + '</a></li>'; }).join('') +
      '<li><a href="hoi-dap.html">Hỏi đáp thường gặp</a></li></ul></div>';
  }
  function headerHTML(page) {
    var nav = NAV.map(function (n) {
      var act = n[2] === page || (page === 'detail' && n[2] === 'listing') || (page === 'article' && n[2] === 'news') ? ' is-active' : '';
      var sub = n[3] === 'mega' ? megaHTML() : n[3] === 'drop' ? dropHTML() : '';
      var cls = (n[3] === 'mega' ? ' has-mega' : n[3] === 'drop' ? ' has-drop' : '') + (n[3] === 'xl' ? ' nav__xl' : '');
      return '<li class="nav__it' + cls + act + '"><a href="' + n[0] + '"' + (act ? ' aria-current="page"' : '') + '>' + n[1] + (sub ? ic('down', 'nav__car') : '') + '</a>' + sub + '</li>';
    }).join('');
    return '<div class="topbar"><div class="container topbar__in">' +
      '<p class="topbar__note">' + ic('check') + 'Sàn mua bán ô tô &amp; phụ kiện – website demo minh hoạ</p>' +
      '<div class="topbar__info"><a href="he-thong-showroom.html">' + ic('pin') + 'Số 1 Đường Minh Hoạ, Hà Nội (minh hoạ)</a>' +
      '<a href="mailto:lienhe@hungthinhauto.vn">' + ic('mail') + 'lienhe@hungthinhauto.vn</a>' +
      '<a class="topbar__hot" href="tel:0900000686">' + ic('phone') + '0900 000 686</a></div></div></div>' +
      '<header class="hdr" id="hdr"><div class="container hdr__in">' +
      '<button class="hdr__burger" type="button" aria-label="Mở menu" data-drawer>' + ic('menu') + '</button>' +
      '<a class="logo" href="index.html" aria-label="Hưng Thịnh Auto – Trang chủ">' + logo(true) + '</a>' +
      '<nav class="nav" aria-label="Menu chính"><ul>' + nav + '</ul></nav>' +
      '<form class="hsearch" action="mua-xe.html" role="search" autocomplete="off"><label class="sr" for="hq">Tìm kiếm</label><input id="hq" name="q" type="search" placeholder="Tìm xe, phụ kiện…"><button type="submit" aria-label="Tìm kiếm">' + ic('search') + '</button><div class="hsearch__drop" hidden></div></form>' +
      '<div class="hdr__acts">' +
      '<button class="hact hact--search" type="button" aria-label="Tìm kiếm" data-search-toggle>' + ic('search') + '</button>' +
      '<a class="hact hact--opt" href="so-sanh.html" aria-label="So sánh xe" title="So sánh">' + ic('compare') + '<i data-count="compare" class="is-zero">0</i></a>' +
      '<a class="hact hact--opt" href="yeu-thich.html" aria-label="Xe yêu thích" title="Yêu thích">' + ic('heart') + '<i data-count="wish" class="is-zero">0</i></a>' +
      '<a class="hact hact--opt" href="dang-nhap.html" aria-label="Tài khoản" title="Tài khoản">' + ic('user') + '</a>' +
      '<a class="hact" href="gio-hang.html" aria-label="Giỏ hàng" title="Giỏ hàng">' + ic('cart') + '<i data-count="cart" class="is-zero">0</i></a>' +
      '</div></div></header>' +
      drawerHTML();
  }
  function drawerHTML() {
    function acc(title, body) { return '<details class="dacc"><summary>' + title + ic('down') + '</summary><div class="dacc__b">' + body + '</div></details>'; }
    return '<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer__bg" data-drawer-close></div><aside class="drawer__panel" aria-label="Menu di động">' +
      '<div class="drawer__top"><a class="logo" href="index.html">' + logo(false) + '</a><button class="ibtn" type="button" data-drawer-close aria-label="Đóng menu">' + ic('close') + '</button></div>' +
      '<form class="dsearch" action="mua-xe.html" role="search"><input name="q" type="search" placeholder="Tìm xe theo tên, hãng…" aria-label="Tìm kiếm"><button type="submit" aria-label="Tìm">' + ic('search') + '</button></form>' +
      '<nav class="dnav"><a href="index.html">' + ic('home') + 'Trang chủ</a><a href="gioi-thieu.html">' + ic('doc') + 'Giới thiệu</a>' +
      acc(ic('car') + 'Mua xe', '<a href="mua-xe.html">Tất cả xe</a>' + D.TYPES.map(function (t) { return '<a href="mua-xe.html?kieu=' + t.id + '">' + t.name + '</a>'; }).join('') + D.PRICES.map(function (p) { return '<a href="mua-xe.html?gia=' + p.id + '">' + p.name + '</a>'; }).join('')) +
      acc(ic('tag') + 'Theo hãng', D.BRANDS.map(function (b) { return '<a href="mua-xe.html?hang=' + b.id + '">' + b.name + '</a>'; }).join('')) +
      '<a href="ban-xe.html">' + ic('money') + 'Bán xe / ký gửi</a><a href="phu-kien.html">' + ic('wrench') + 'Phụ kiện ô tô</a>' +
      acc(ic('doc') + 'Tin tức', '<a href="tin-tuc.html">Tất cả bài viết</a>' + D.POST_CATS.map(function (c) { return '<a href="tin-tuc.html?cat=' + c.id + '">' + c.name + '</a>'; }).join('')) +
      '<a href="hoi-dap.html">' + ic('chat') + 'Hỏi đáp</a><a href="he-thong-showroom.html">' + ic('pin') + 'Hệ thống showroom</a><a href="lien-he.html">' + ic('mail') + 'Liên hệ</a>' +
      '<div class="dnav__sep"></div><a href="so-sanh.html">' + ic('compare') + 'So sánh xe <i data-count="compare">0</i></a><a href="yeu-thich.html">' + ic('heart') + 'Yêu thích <i data-count="wish">0</i></a><a href="da-xem.html">' + ic('eye') + 'Xe đã xem</a><a href="dang-nhap.html">' + ic('user') + 'Đăng nhập / Đăng ký</a></nav>' +
      '<a class="btn btn--y btn--block" href="tel:0900000686">' + ic('phone') + 'Hotline 0900 000 686</a></aside></div>';
  }
  function creditsHTML() {
    var C = window.HT_CREDITS || [];
    if (!C.length) return '';
    return '<div class="container"><details class="credits"><summary>' + ic('camera') + 'Nguồn ảnh &amp; giấy phép (' + C.length + ' ảnh)</summary><p>Ảnh xe và phụ kiện là ảnh chụp thật từ Wikimedia Commons (giữ nguyên giấy phép, đã cắt/chuẩn hoá kích thước); ảnh bài viết từ Unsplash (Giấy phép Unsplash). Không ảnh nào do AI tạo.</p><ol>' +
      C.map(function (c) { return '<li>' + esc(c.label) + ': <a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + esc(c.title) + '</a> – ' + esc(c.author || 'Không rõ tác giả') + ', ' + esc(c.license) + '</li>'; }).join('') + '</ol></details></div>';
  }
  function footerHTML() {
    return '<section class="nl"><div class="container"><div class="nl__box"><div class="nl__txt"><span class="nl__ic">' + ic('mail') + '</span><div><h2>Đăng ký nhận tin xe mới &amp; ưu đãi</h2><p>Mỗi tuần một bản tin ngắn: xe mới về, giá tốt, mẹo chăm xe. Huỷ bất cứ lúc nào.</p></div></div>' +
      '<form class="nl__form" data-demo-form data-replace data-success="Cảm ơn bạn! Đây là bản demo nên chưa có email nào được gửi."><label class="field"><span class="sr">Email</span><input type="email" name="email" required placeholder="Nhập email của bạn"></label><button class="btn btn--navy" type="submit">Đăng ký</button></form></div></div></section>' +
      '<footer class="ftr"><div class="container ftr__grid">' +
      '<div class="ftr__brand"><a class="logo" href="index.html">' + logo(true) + '</a><p>Hưng Thịnh Auto (thương hiệu minh hoạ) – sàn mua bán ô tô mới, xe đã qua sử dụng và phụ kiện. Giá niêm yết rõ ràng, kiểm tra xe minh bạch, hỗ trợ trả góp.</p>' +
      '<div class="ftr__social"><a href="#" aria-label="Facebook (minh hoạ)">' + ic('fb') + '</a><a href="#" aria-label="YouTube (minh hoạ)">' + ic('yt') + '</a><a href="#" aria-label="Instagram (minh hoạ)">' + ic('ig') + '</a><a href="#" aria-label="TikTok (minh hoạ)">' + ic('music') + '</a></div>' +
      '<p class="ftr__h ftr__h--sm">Phương thức thanh toán</p><div class="ftr__pay"><span>Chuyển khoản</span><span>Thẻ ATM</span><span>Thẻ quốc tế</span><span>Trả góp</span><span>Tiền mặt</span></div></div>' +
      '<div><p class="ftr__h">Thông tin liên hệ</p><ul class="ftr__ct"><li>' + ic('pin') + '<span>Số 1 Đường Minh Hoạ, Hà Nội (minh hoạ)</span></li><li>' + ic('phone') + '<a href="tel:0900000686">0900 000 686</a></li><li>' + ic('mail') + '<a href="mailto:lienhe@hungthinhauto.vn">lienhe@hungthinhauto.vn</a> <em>(minh hoạ)</em></li><li>' + ic('clock') + '<span>8:00 – 20:00, tất cả các ngày</span></li></ul></div>' +
      '<div><p class="ftr__h">Mua bán</p><ul><li><a href="mua-xe.html">Mua xe</a></li><li><a href="ban-xe.html">Bán xe / ký gửi</a></li><li><a href="phu-kien.html">Phụ kiện ô tô</a></li><li><a href="so-sanh.html">So sánh xe</a></li><li><a href="da-xem.html">Xe đã xem</a></li></ul></div>' +
      '<div><p class="ftr__h">Hỗ trợ</p><ul><li><a href="hoi-dap.html">Hỏi đáp thường gặp</a></li><li><a href="he-thong-showroom.html">Hệ thống showroom</a></li><li><a href="tin-tuc.html">Tin tức &amp; kinh nghiệm</a></li><li><a href="lien-he.html">Liên hệ</a></li><li><a href="gioi-thieu.html">Về chúng tôi</a></li></ul></div>' +
      '<div><p class="ftr__h">Chính sách</p><ul><li><a href="hoi-dap.html#bao-hanh">Chính sách bảo hành</a></li><li><a href="hoi-dap.html#tai-chinh">Đặt cọc &amp; thanh toán</a></li><li><a href="hoi-dap.html#mua-xe">Kiểm tra &amp; đổi trả</a></li><li><a href="hoi-dap.html">Bảo mật thông tin</a></li></ul></div>' +
      '</div>' + creditsHTML() + '<div class="ftr__bot"><div class="container"><p>© 2026 Hưng Thịnh Auto – Website demo minh hoạ. Thông tin, giá và địa chỉ chỉ mang tính trình diễn, không có giá trị giao dịch.</p></div></div></footer>' +
      '<div class="fabs"><button class="fab fab--up" type="button" aria-label="Lên đầu trang" id="toTop">' + ic('up') + '</button>' +
      '<a class="fab fab--call" href="tel:0900000686" aria-label="Gọi hotline">' + ic('phone') + '</a>' +
      '<button class="fab fab--chat" type="button" id="chatBtn" aria-label="Chat tư vấn">' + ic('chat') + '<span>Tư vấn</span></button></div>';
  }

  /* ---------------- Drawer, search, sticky ---------------- */
  function openDrawer() { var d = $('#drawer'); if (!d) return; d.classList.add('in'); d.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); }
  function closeDrawer() { var d = $('#drawer'); if (!d || !d.classList.contains('in')) return; d.classList.remove('in'); d.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll'); }

  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  function searchAll(q) {
    var n = norm(q).trim(); if (!n) return { cars: [], acc: [] };
    var words = n.split(/\s+/);
    function hit(s) { s = norm(s); return words.every(function (w) { return s.indexOf(w) > -1; }); }
    return {
      cars: D.CARS.filter(function (c) { return hit(carTitle(c) + ' ' + brandName(c.brand) + ' ' + typeName(c.type) + ' ' + c.fuel + ' ' + c.year); }),
      acc: D.ACCESSORIES.filter(function (a) { return hit(a.name); })
    };
  }
  function initSearch() {
    var form = $('.hsearch'); if (!form) return;
    var inp = form.querySelector('input'), drop = form.querySelector('.hsearch__drop');
    function render() {
      var q = inp.value.trim();
      if (q.length < 2) { drop.hidden = true; return; }
      var r = searchAll(q), h = '';
      if (r.cars.length) h += '<p class="sd__h">Xe (' + r.cars.length + ')</p>' + r.cars.slice(0, 5).map(function (c) { return '<a class="sd__it" href="xe.html?id=' + c.id + '"><img src="' + U(c.images[0], 120, 80) + '" alt=""><span><b>' + esc(carTitle(c)) + '</b><em>' + fmt(c.price) + '</em></span></a>'; }).join('');
      if (r.acc.length) h += '<p class="sd__h">Phụ kiện (' + r.acc.length + ')</p>' + r.acc.slice(0, 3).map(function (a) { return '<a class="sd__it" href="phu-kien.html?q=' + encodeURIComponent(q) + '"><img src="' + U(a.images[0], 120, 80) + '" alt=""><span><b>' + esc(a.name) + '</b><em>' + fmt(a.price) + '</em></span></a>'; }).join('');
      if (!h) h = '<p class="sd__none">Không tìm thấy kết quả cho “' + esc(q) + '”.</p>';
      else h += '<a class="sd__all" href="mua-xe.html?q=' + encodeURIComponent(q) + '">Xem tất cả kết quả ' + ic('arrow') + '</a>';
      drop.innerHTML = h; drop.hidden = false;
    }
    inp.addEventListener('input', render);
    inp.addEventListener('focus', render);
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) drop.hidden = true; });
    var t = $('[data-search-toggle]');
    if (t) t.addEventListener('click', function () { document.body.classList.toggle('search-open'); if (document.body.classList.contains('search-open')) inp.focus(); });
  }

  function initChat() {
    var b = $('#chatBtn'); if (!b) return;
    b.addEventListener('click', function () {
      modal('<div class="mform"><span class="kicker">Tư vấn nhanh</span><h3>Bạn cần hỗ trợ gì?</h3><p class="muted">Để lại số điện thoại, chuyên viên sẽ gọi lại trong giờ làm việc (bản demo – không gửi dữ liệu).</p>' +
        '<form data-demo-form data-replace data-success="Yêu cầu tư vấn đã được ghi nhận trong bản demo."><label class="field"><span>Nhu cầu</span><select name="need"><option>Mua xe</option><option>Bán / ký gửi xe</option><option>Trả góp</option><option>Phụ kiện &amp; dịch vụ</option></select></label>' +
        '<label class="field"><span>Số điện thoại *</span><input name="phone" type="tel" required pattern="0[0-9]{9}" data-msg="Số điện thoại gồm 10 số, bắt đầu bằng 0" placeholder="09xx xxx xxx"></label>' +
        '<button class="btn btn--y btn--block" type="submit">' + ic('phone') + 'Yêu cầu gọi lại</button></form><p class="muted small">Hoặc gọi ngay <a href="tel:0900000686"><b>0900 000 686</b></a></p></div>', 'modal--sm');
    });
  }

  function initReveal() {
    var els = $$('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    if (!initReveal.io) {
      initReveal.io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); initReveal.io.unobserve(x.target); } });
      }, { rootMargin: '0px 0px -40px 0px' });
    }
    els.forEach(function (e) { initReveal.io.observe(e); });
  }

  /* ---------------- Global delegated actions ---------------- */
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-wish]'))) {
      e.preventDefault();
      var on = Store.toggle('wish', t.getAttribute('data-wish'));
      toast(on ? 'Đã thêm vào danh sách yêu thích' : 'Đã bỏ khỏi danh sách yêu thích', on ? ['yeu-thich.html', 'Xem'] : null);
    } else if ((t = e.target.closest('[data-compare]'))) {
      e.preventDefault();
      var r = Store.toggle('compare', t.getAttribute('data-compare'), 3);
      if (r === null) toast('Chỉ so sánh tối đa 3 xe. Bỏ bớt xe để thêm mới.', ['so-sanh.html', 'Mở so sánh']);
      else toast(r ? 'Đã thêm vào so sánh (' + Store.get('compare').length + '/3)' : 'Đã bỏ khỏi so sánh', ['so-sanh.html', 'So sánh ngay']);
    } else if ((t = e.target.closest('[data-testdrive]'))) {
      e.preventDefault(); testDrive(t.getAttribute('data-testdrive'));
    } else if ((t = e.target.closest('[data-quick]'))) {
      e.preventDefault(); quickView(t.getAttribute('data-quick'));
    } else if ((t = e.target.closest('[data-addcart]'))) {
      e.preventDefault(); addAcc(t.getAttribute('data-addcart'), 1);
    } else if (e.target.closest('[data-drawer]')) {
      openDrawer();
    } else if (e.target.closest('[data-drawer-close]')) {
      closeDrawer();
    }
  });

  /* ---------------- Mount ---------------- */
  function mount() {
    var page = document.body.getAttribute('data-page') || '';
    var h = $('#site-header'), f = $('#site-footer');
    if (h) h.outerHTML = headerHTML(page);
    if (f) f.outerHTML = footerHTML();
    var hdr = $('#hdr');
    var onScroll = function () {
      var y = window.scrollY || 0;
      if (hdr) hdr.classList.toggle('is-stuck', y > 40);
      var up = $('#toTop'); if (up) up.classList.toggle('in', y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var up = $('#toTop'); if (up) up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    initSearch(); initChat(); initForms(document); updateCounters();
    window.addEventListener('storage', updateCounters);
  }

  window.HT = {
    D: D, U: U, ic: ic, typeIcon: typeIcon, logo: logo, esc: esc, fmt: fmt, fmtShort: fmtShort, fmtKm: fmtKm, fmtDate: fmtDate, qs: qs, byId: byId,
    brandName: brandName, typeName: typeName, carTitle: carTitle, discount: discount, $: $, $$: $$, Store: Store, toast: toast, modal: modal, closeModal: closeModal,
    initForms: initForms, carCard: carCard, accCard: accCard, postCard: postCard, emptyState: emptyState, showroomOptions: showroomOptions, testDrive: testDrive,
    addAcc: addAcc, updateCounters: updateCounters, initReveal: initReveal, searchAll: searchAll, norm: norm, today: today, mount: mount
  };
  mount();
})();
