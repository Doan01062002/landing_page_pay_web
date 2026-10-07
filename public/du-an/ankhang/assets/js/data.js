/* AN KHANG AUTO – dữ liệu sản phẩm mẫu (thương hiệu minh hoạ) */
(function () {
  'use strict';

  var U = function (id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 600) + (h ? '&h=' + h : '') + '&q=70';
  };

  /* ---------- Biểu tượng giao diện (inline SVG, không dùng <use>) ---------- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    cart: '<path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.3"/><circle cx="10" cy="20.5" r="1.4"/><circle cx="17.5" cy="20.5" r="1.4"/>',
    phone: '<path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11.5 11.5 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.6 16.6 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5z"/>',
    chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 7.5h6l-6 5h6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
    heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.8 1.8 0 0 0 8.8 21h6.4a1.8 1.8 0 0 0 1.8-1.5L18 7M9 7V4.5h6V7"/>',
    bolt: '<path d="M13.5 2 4.5 13.5H11L9.8 22l9.7-12.3H13z" fill="currentColor" stroke="none"/>',
    shield: '<path d="M12 2.8 4.5 5.6v5.6c0 4.8 3.1 8.6 7.5 10 4.4-1.4 7.5-5.2 7.5-10V5.6z"/><path d="m8.6 12 2.4 2.4 4.5-4.6"/>',
    truck: '<path d="M2.5 6h11v9.5h-11zM13.5 9.5h4.2l3.3 3.3v2.7h-7.5"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>',
    wrench: '<path d="M14.6 6.2a4.2 4.2 0 0 0 5.2 5.2l-8.7 8.7a2.3 2.3 0 0 1-3.2-3.2L16.6 8.2"/><path d="M14.6 6.2 17.8 3l3.2 3.2-3.2 3.2"/>',
    refresh: '<path d="M20 11.5A8 8 0 0 0 5.6 6.4L4 8M4 3.8V8h4.2M4 12.5a8 8 0 0 0 14.4 5.1L20 16m0 4.2V16h-4.2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    left: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    right: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    down: '<path d="m6 9.5 6 6 6-6"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.2"/><path d="M15.5 8.5V5.7a2.2 2.2 0 0 0-2.2-2.2H5.7a2.2 2.2 0 0 0-2.2 2.2v7.6a2.2 2.2 0 0 0 2.2 2.2h2.8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.8 3.5 8 3.8c-2.4.3-1.8 4.7 4 4.7zM12 8.5s1.2-5 4-4.7c2.4.3 1.8 4.7-4 4.7z"/>',
    star: '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="none"/>',
    pin: '<path d="M12 21.5s-6.8-6.2-6.8-11.6a6.8 6.8 0 0 1 13.6 0c0 5.4-6.8 11.6-6.8 11.6z"/><circle cx="12" cy="9.8" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.5V12l3 2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.3" cy="8.3" r="1.6"/>',
    fb: '<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5z"/>',
    car: '<path d="M4 15.5V12l2-4.6A2 2 0 0 1 7.8 6h8.4a2 2 0 0 1 1.8 1.4L20 12v3.5a1 1 0 0 1-1 1h-1.2M6.2 16.5H5a1 1 0 0 1-1-1M9 16.5h6M4.5 12h15"/><circle cx="7.6" cy="16.5" r="1.7"/><circle cx="16.4" cy="16.5" r="1.7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    fire: '<path d="M12 21.5c-4 0-7-2.8-7-6.6 0-3.6 2.6-5.4 3.6-8.4.5 1.9 1.6 2.9 2.6 3.3C11 6.4 12.6 4 15 2.5c-.4 3.2 4 5.6 4 11.4 0 4.4-3 7.6-7 7.6z" fill="currentColor" stroke="none"/>',
    sparkle: '<path d="M12 3c.7 4.2 2.5 6.3 7 7-4.5.7-6.3 2.8-7 7-.7-4.2-2.5-6.3-7-7 4.5-.7 6.3-2.8 7-7z" fill="currentColor" stroke="none"/>'
  };
  function ic(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Biểu tượng danh mục (vòng tròn) ---------- */
  var CAT_ICONS = {
    tham: '<path d="M18 12h28q6 0 6.6 6l2.4 30q.4 6-5.6 6H18.6q-6 0-6.4-6L14 18q.4-6 4-6z" fill="#ffd9c2"/><path d="M18 12h28q6 0 6.6 6l2.4 30q.4 6-5.6 6H18.6q-6 0-6.4-6L14 18q.4-6 4-6z" fill="none" stroke="#13233f" stroke-width="2.6"/><path d="M22 20 42 46M32 18l14 18M18 30l16 20M42 20 24 46M50 30 36 50M30 18 18 36" stroke="#ff6a13" stroke-width="1.8" opacity=".75"/>',
    camera: '<rect x="10" y="20" width="44" height="28" rx="7" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><circle cx="36" cy="34" r="9" fill="#13233f"/><circle cx="36" cy="34" r="4" fill="#ff6a13"/><path d="M24 20v-6h16v6" fill="none" stroke="#13233f" stroke-width="2.6"/><circle cx="17" cy="27" r="2.2" fill="#ff3b30"/>',
    lop: '<circle cx="32" cy="32" r="20" fill="#13233f"/><circle cx="32" cy="32" r="11" fill="#ffd9c2"/><circle cx="32" cy="32" r="4" fill="#13233f"/><path d="M32 12v5M32 47v5M12 32h5M47 32h5M18 18l3.5 3.5M42.5 42.5 46 46M46 18l-3.5 3.5M21.5 42.5 18 46" stroke="#ff6a13" stroke-width="2.6"/>',
    ghe: '<path d="M22 10h14q5 0 5 5l-2 22h-18l-3-22q0-5 4-5z" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><path d="M18 38h28q5 0 4 6l-1 4H16l-1-4q-1-6 3-6z" fill="#ff6a13" stroke="#13233f" stroke-width="2.6"/><path d="M24 20h10M24 27h10" stroke="#13233f" stroke-width="2" opacity=".5"/><path d="M20 48v6M44 48v6" stroke="#13233f" stroke-width="2.6"/>',
    thom: '<rect x="18" y="22" width="28" height="32" rx="9" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><rect x="26" y="12" width="12" height="10" rx="2" fill="#13233f"/><path d="M32 30c-4 5-4 10 0 13 4-3 4-8 0-13z" fill="#ff6a13"/><path d="M47 14c3 2 4 5 2 8M52 10c4 3 5 8 2 12" stroke="#ff6a13" stroke-width="2.2" fill="none"/>',
    giado: '<rect x="22" y="8" width="22" height="38" rx="5" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><rect x="26" y="13" width="14" height="26" rx="2" fill="#13233f"/><path d="M33 46v6M24 56h18" stroke="#13233f" stroke-width="2.6"/><circle cx="33" cy="26" r="4" fill="#ff6a13"/>',
    hutbui: '<path d="M14 24h22l8 6v8l-8 6H14q-4 0-4-4V28q0-4 4-4z" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><path d="M44 30h8v8h-8" fill="#ff6a13" stroke="#13233f" stroke-width="2.6"/><path d="M18 30h12M18 36h12" stroke="#13233f" stroke-width="2.2"/><path d="M22 44l-2 10M30 44l2 10" stroke="#13233f" stroke-width="2.6"/>',
    remche: '<path d="M12 46 20 16h30l4 30z" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><path d="M22 20l-6 24M28 20l-4 24M34 20l-2 24M40 20v24M46 20l2 24" stroke="#ff6a13" stroke-width="1.6" opacity=".8"/><circle cx="54" cy="14" r="5" fill="#ff6a13"/>',
    sac: '<rect x="20" y="10" width="24" height="30" rx="6" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><path d="M34 16l-6 10h6l-2 8 6-10h-6z" fill="#ff6a13"/><path d="M28 40v8h8v-8M32 48v8" stroke="#13233f" stroke-width="2.6" fill="none"/>',
    goi: '<path d="M12 26c0-10 8-14 20-14s20 4 20 14c0 6-3 10-7 10-3 0-5-4-13-4s-10 4-13 4c-4 0-7-4-7-10z" fill="#ffd9c2" stroke="#13233f" stroke-width="2.6"/><path d="M20 22c4-3 20-3 24 0" stroke="#ff6a13" stroke-width="2.2" fill="none"/><path d="M22 40h20v10H22z" fill="#ff6a13" opacity=".25"/>'
  };
  function catIcon(key) {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">' + (CAT_ICONS[key] || '') + '</svg>';
  }

  /* ---------- Minh hoạ sản phẩm (SVG) – dùng màu phẳng, không tham chiếu url(#) ---------- */
  function diamonds(x0, y0, x1, y1, step, color, op) {
    var s = '';
    for (var x = x0 - (y1 - y0); x < x1; x += step) {
      s += 'M' + x + ' ' + y0 + 'L' + (x + (y1 - y0)) + ' ' + y1;
      s += 'M' + (x + (y1 - y0)) + ' ' + y0 + 'L' + x + ' ' + y1;
    }
    return '<path d="' + s + '" stroke="' + color + '" stroke-width="1.6" opacity="' + op + '" fill="none"/>';
  }
  var shadow = '<ellipse cx="120" cy="214" rx="80" ry="9" fill="#13233f" opacity=".13"/>';

  var ART = {
    mat: function (o) {
      var base = o.base || '#1d2433', st = o.stitch || '#ff6a13';
      var shape = 'M70 36h96q20 0 22 20l10 124q2 22-20 22H74q-22 0-24-22L46 60q-2-24 24-24z';
      return shadow +
        '<g transform="rotate(10 160 120) translate(28 6) scale(.86)" opacity=".9"><path d="' + shape + '" fill="' + (o.base2 || '#3a2a20') + '"/></g>' +
        '<g transform="rotate(-7 120 120)">' +
        '<path d="' + shape + '" fill="' + base + '"/>' +
        '<g opacity="1">' + clipDiamond(shape, base) + '</g>' +
        '<path d="M73 46h90q13 0 14 13l9 118q1 14-13 14H78q-14 0-15-14L56 63q-1-17 17-17z" fill="none" stroke="' + st + '" stroke-width="2.6" stroke-dasharray="7 5"/>' +
        '<rect x="96" y="148" width="50" height="34" rx="9" fill="#0b0f18" opacity=".55"/>' +
        '<path d="M100 156h42M100 164h42M100 172h42" stroke="#fff" stroke-width="1.4" opacity=".18"/>' +
        '<path d="M76 42q-14 2-16 18" stroke="#fff" stroke-width="4" opacity=".22" fill="none"/>' +
        '</g>';
    },
    trunk: function (o) {
      return shadow +
        '<path d="M28 96q2-16 18-16h148q16 0 18 16l-12 92q-2 14-16 14H56q-14 0-16-14z" fill="#141a26"/>' +
        '<path d="M38 100q2-12 14-12h136q12 0 14 12l-10 80q-2 12-14 12H62q-12 0-14-12z" fill="' + (o.base || '#2a1e17') + '"/>' +
        '<g opacity=".9">' + diamondsBox(48, 92, 196, 188, 16) + '</g>' +
        '<path d="M44 102q2-8 10-8h132q8 0 10 8l-9 74q-1 9-10 9H63q-9 0-10-9z" fill="none" stroke="' + (o.stitch || '#ff9a3c') + '" stroke-width="2.4" stroke-dasharray="7 5"/>' +
        '<path d="M28 96 46 40h148l18 56" fill="none" stroke="#c9d1de" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M60 52h120" stroke="#c9d1de" stroke-width="3" opacity=".6"/>';
    },
    mirror: function () {
      return shadow +
        '<path d="M112 34h16v26h-16z" fill="#3a4357"/><circle cx="120" cy="30" r="10" fill="#2a3245"/>' +
        '<rect x="18" y="66" width="204" height="96" rx="26" fill="#121826"/>' +
        '<rect x="28" y="76" width="184" height="76" rx="16" fill="#9fc2ea"/>' +
        '<path d="M28 120h184v16a16 16 0 0 1-16 16H44a16 16 0 0 1-16-16z" fill="#3b4558"/>' +
        '<path d="M28 116q40-14 80-6t104-6v16H28z" fill="#6f8f6a"/>' +
        '<path d="M120 152 112 120h16z" fill="#2b3343"/><path d="M119 150l-1-6h4l-1 6zM118 138l-.6-5h3.2l-.6 5zM118.4 128l-.3-4h2l-.3 4z" fill="#fff"/>' +
        '<rect x="148" y="104" width="34" height="20" rx="6" fill="#e6edf7"/><rect x="152" y="108" width="26" height="8" rx="2" fill="#9fb3cc"/>' +
        '<circle cx="44" cy="90" r="5" fill="#ff3b30"/><text x="54" y="94" font-size="11" font-weight="700" fill="#fff">REC</text>' +
        '<rect x="168" y="84" width="34" height="12" rx="6" fill="#ff6a13"/><text x="185" y="93" font-size="8.5" font-weight="800" fill="#fff" text-anchor="middle">1080P</text>' +
        '<path d="M40 70h60" stroke="#fff" stroke-width="3" opacity=".18" stroke-linecap="round"/>';
    },
    tpms: function () {
      return shadow +
        '<circle cx="78" cy="120" r="66" fill="#1b2130"/><circle cx="78" cy="120" r="66" fill="none" stroke="#2c3447" stroke-width="10" stroke-dasharray="6 7"/>' +
        '<circle cx="78" cy="120" r="34" fill="#c8d0dc"/><circle cx="78" cy="120" r="12" fill="#8792a6"/>' +
        '<g fill="#a9b3c3">' + [0, 72, 144, 216, 288].map(function (a) { return '<rect x="74" y="88" width="8" height="18" rx="3" transform="rotate(' + a + ' 78 120)"/>'; }).join('') + '</g>' +
        '<rect x="112" y="78" width="112" height="88" rx="18" fill="#13233f"/>' +
        '<rect x="120" y="70" width="96" height="12" rx="4" fill="#2f5b9a"/><path d="M128 72v8M144 72v8M160 72v8M176 72v8M192 72v8M208 72v8" stroke="#6aa0e6" stroke-width="1.4"/>' +
        '<rect x="122" y="88" width="92" height="68" rx="10" fill="#0a1222"/>' +
        '<rect x="160" y="100" width="16" height="44" rx="7" fill="none" stroke="#4fd1a5" stroke-width="2"/>' +
        '<g font-size="12" font-weight="800" fill="#4fd1a5" font-family="Saira Condensed, sans-serif"><text x="128" y="106">2.3</text><text x="186" y="106">2.3</text><text x="128" y="148">2.4</text><text x="186" y="148" fill="#ffb020">2.1</text></g>' +
        '<text x="168" y="127" font-size="8" font-weight="700" fill="#7c8aa5" text-anchor="middle">BAR</text>';
    },
    seat: function (o) {
      var c = o.base || '#d8b48a', d = o.dark || '#b98f63';
      return shadow +
        '<path d="M150 22h22q14 0 13 14l-2 14q-1 10-12 10h-20q-10 0-10-10l-1-14q0-14 10-14z" fill="' + c + '"/>' +
        '<path d="M156 60v10M172 60v10" stroke="#8a95a8" stroke-width="5"/>' +
        '<path d="M128 70h64q14 0 13 16l-8 92q-2 14-16 14h-46q-14 0-16-12l-6-94q-1-16 15-16z" fill="' + c + '"/>' +
        '<path d="M140 80h40M138 100h44M137 120h46M137 140h46M138 160h44" stroke="' + d + '" stroke-width="3"/>' +
        '<path d="M140 82l-2 92M182 82l2 92" stroke="#ff6a13" stroke-width="2" stroke-dasharray="5 4"/>' +
        '<path d="M38 150q-4-22 18-24h96q26 0 26 20v14q0 18-20 18H58q-18 0-20-14z" fill="' + c + '"/>' +
        '<path d="M50 140h120M48 154h124" stroke="' + d + '" stroke-width="3"/>' +
        '<path d="M52 136h112" stroke="#ff6a13" stroke-width="2" stroke-dasharray="5 4"/>' +
        '<path d="M70 178l-6 24M150 178l6 24" stroke="#3a4357" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M140 78q-6 30-2 90" stroke="#fff" stroke-width="5" opacity=".22" fill="none" stroke-linecap="round"/>';
    },
    steering: function () {
      return shadow +
        '<circle cx="120" cy="116" r="84" fill="none" stroke="#1d2433" stroke-width="28"/>' +
        '<circle cx="120" cy="116" r="84" fill="none" stroke="#ff8a3d" stroke-width="2.2" stroke-dasharray="5 6" transform="rotate(4 120 116)" opacity=".95"/>' +
        '<circle cx="120" cy="116" r="72" fill="none" stroke="#2c3447" stroke-width="3"/><circle cx="120" cy="116" r="96" fill="none" stroke="#2c3447" stroke-width="3"/>' +
        '<path d="M42 132q40-10 78-10t78 10l-10 24q-30-8-68-8t-68 8z" fill="#3a4357"/>' +
        '<path d="M106 148h28l10 52h-48z" fill="#3a4357"/>' +
        '<circle cx="120" cy="124" r="28" fill="#13233f"/><circle cx="120" cy="124" r="20" fill="#1f3a66"/>' +
        '<path d="M110 132l10-18 10 18M114 126h12" stroke="#ff6a13" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M60 60q30-30 72-28" stroke="#fff" stroke-width="6" opacity=".16" fill="none" stroke-linecap="round"/>';
    },
    freshener: function () {
      return shadow +
        '<path d="M70 70q-6-20 50-20t50 20l10 110q2 22-22 24H82q-24-2-22-24z" fill="#2b2f36"/>' +
        '<g opacity=".25" stroke="#fff" stroke-width="1.2"><path d="M78 80h84M76 96h88M74 112h92M73 128h94M72 144h96M71 160h98M70 176h100"/></g>' +
        '<path d="M70 70q50 14 100 0" stroke="#c99a5b" stroke-width="5" fill="none"/>' +
        '<path d="M96 66q-8-30 4-38M144 66q8-30-4-38" stroke="#c99a5b" stroke-width="3.5" fill="none"/>' +
        '<rect x="86" y="104" width="68" height="62" rx="10" fill="#f4efe4"/>' +
        '<path d="M120 116c-12 12-12 26 0 34 12-8 12-22 0-34z" fill="#3f9b5a"/><path d="M120 120v28" stroke="#f4efe4" stroke-width="2"/>' +
        '<text x="120" y="161" font-size="9" font-weight="800" fill="#13233f" text-anchor="middle">THAN TRE</text>' +
        '<path d="M182 90c14 6 22 18 16 34-12-2-20-14-16-34z" fill="#58b36f"/><path d="M184 94q4 16 12 26" stroke="#2f7a45" stroke-width="2" fill="none"/>';
    },
    vent: function () {
      return shadow +
        '<rect x="22" y="128" width="196" height="70" rx="18" fill="#232a38"/>' +
        '<path d="M36 146h168M36 162h168M36 178h168" stroke="#4b5568" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M108 170h24v-30h-24z" fill="#3a4357"/>' +
        '<rect x="70" y="20" width="100" height="140" rx="18" fill="#13233f"/>' +
        '<rect x="78" y="30" width="84" height="120" rx="12" fill="#ff8a3d"/>' +
        '<path d="M78 98q42-36 84-8v48a12 12 0 0 1-12 12H90a12 12 0 0 1-12-12z" fill="#ff6a13"/>' +
        '<circle cx="120" cy="84" r="20" fill="none" stroke="#fff" stroke-width="3" opacity=".85"/><path d="M123 72l-9 14h8l-3 10 9-14h-8z" fill="#fff"/>' +
        '<path d="M60 60h12v40H60zM168 60h12v40h-12z" fill="#c9d1de"/><path d="M60 92q-8 0-8-8V68q0-8 8-8" fill="#8792a6"/><path d="M180 92q8 0 8-8V68q0-8-8-8" fill="#8792a6"/>';
    },
    curtain: function () {
      var mesh = '';
      for (var i = 0; i < 16; i++) mesh += 'M' + (52 + i * 10) + ' 50 L' + (40 + i * 10.5) + ' 184 ';
      for (var j = 0; j < 12; j++) mesh += 'M44 ' + (60 + j * 11) + ' L208 ' + (60 + j * 11) + ' ';
      return shadow +
        '<path d="M26 196 46 44q4-18 22-18h120q18 0 22 16l18 154z" fill="#dfe6f0"/>' +
        '<path d="M44 184 60 56q2-14 16-14h108q14 0 16 12l14 130z" fill="#9cc3ea"/>' +
        '<path d="M44 184 60 56q2-14 16-14h108q14 0 16 12l14 130z" fill="#1d2433" opacity=".86"/>' +
        '<path d="' + mesh + '" stroke="#5d6a82" stroke-width="1" opacity=".7"/>' +
        '<path d="M90 60q-10 40 0 110" stroke="#fff" stroke-width="10" opacity=".07"/>' +
        '<g fill="#ff6a13"><circle cx="70" cy="56" r="5"/><circle cx="184" cy="54" r="5"/><circle cx="56" cy="176" r="5"/><circle cx="200" cy="176" r="5"/></g>' +
        '<rect x="96" y="196" width="48" height="8" rx="4" fill="#b7c2d3"/>';
    },
    shade: function () {
      var ribs = '';
      for (var a = -70; a <= 70; a += 20) ribs += '<path d="M120 170 L' + (120 + Math.sin(a * Math.PI / 180) * 104).toFixed(1) + ' ' + (170 - Math.cos(a * Math.PI / 180) * 104).toFixed(1) + '" stroke="#8d97a8" stroke-width="2"/>';
      return shadow +
        '<path d="M14 170a106 106 0 0 1 212 0q-26-12-53 0-26-12-53 0-26-12-53 0-26-12-53 0z" fill="#e3e8ef"/>' +
        '<path d="M14 170a106 106 0 0 1 106-106v106q-26-12-53 0-26-12-53 0z" fill="#c8d0dc"/>' +
        '<path d="M40 120q40-50 80-56" stroke="#fff" stroke-width="10" opacity=".7" fill="none" stroke-linecap="round"/>' + ribs +
        '<path d="M120 170v26" stroke="#13233f" stroke-width="7" stroke-linecap="round"/><rect x="108" y="192" width="24" height="16" rx="6" fill="#ff6a13"/>' +
        '<circle cx="120" cy="64" r="5" fill="#13233f"/>';
    },
    cable: function () {
      return shadow +
        '<path d="M58 176c-30-40 10-80 60-70s70-30 40-60" fill="none" stroke="#13233f" stroke-width="12" stroke-linecap="round"/>' +
        '<path d="M58 176c-30-40 10-80 60-70s70-30 40-60" fill="none" stroke="#ff6a13" stroke-width="12" stroke-linecap="round" stroke-dasharray="3 9"/>' +
        '<rect x="40" y="168" width="36" height="32" rx="6" fill="#c9d1de"/><rect x="48" y="196" width="20" height="12" rx="2" fill="#8792a6"/>' +
        '<path d="M158 46c10-12 30-14 40-20M158 46c14-2 30 8 46 6M158 46c6-14 6-28 18-38" fill="none" stroke="#13233f" stroke-width="8" stroke-linecap="round"/>' +
        '<rect x="194" y="16" width="18" height="24" rx="5" fill="#c9d1de" transform="rotate(-30 203 28)"/>' +
        '<rect x="200" y="42" width="18" height="24" rx="5" fill="#ff6a13" transform="rotate(80 209 54)"/>' +
        '<rect x="168" y="0" width="18" height="24" rx="5" fill="#e3e8ef" transform="rotate(14 177 12)"/>';
    },
    lumbar: function () {
      var mesh = '';
      for (var i = 0; i < 9; i++) mesh += 'M' + (60 + i * 15) + ' 64 q-4 60 0 116 ';
      return shadow +
        '<path d="M48 60q72-26 144 0 12 40 0 80-10 40 0 60-72 22-144 0 10-20 0-60-12-40 0-80z" fill="#20283a"/>' +
        '<path d="' + mesh + '" stroke="#3b465e" stroke-width="2" fill="none"/>' +
        '<path d="M58 120q62-28 124 0" stroke="#ff6a13" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>' +
        '<path d="M56 70q64-20 128 0" stroke="#fff" stroke-width="4" opacity=".14" fill="none"/>' +
        '<path d="M30 110h18M192 110h18" stroke="#8792a6" stroke-width="6" stroke-linecap="round"/>';
    },
    gift: function () {
      return '<ellipse cx="120" cy="214" rx="84" ry="10" fill="#13233f" opacity=".14"/>' +
        '<rect x="44" y="104" width="152" height="104" rx="12" fill="#ff6a13"/><rect x="44" y="104" width="152" height="22" fill="#e85a07" opacity=".6"/>' +
        '<rect x="108" y="104" width="24" height="104" fill="#ffc53d"/>' +
        '<g class="gift-lid"><rect x="34" y="80" width="172" height="34" rx="10" fill="#ff8a3d"/><rect x="106" y="80" width="28" height="34" fill="#ffd25e"/>' +
        '<path d="M120 80c-14-34-52-38-50-12 2 18 34 14 50 12z" fill="#ffc53d"/><path d="M120 80c14-34 52-38 50-12-2 18-34 14-50 12z" fill="#f5b301"/><path d="M120 80c-10-20-30-26-34-14" stroke="#e09a00" stroke-width="3" fill="none"/><circle cx="120" cy="80" r="9" fill="#e09a00"/></g>' +
        '<g fill="#ffd25e"><path class="gift-spark" d="M42 52l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path class="gift-spark" d="M196 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>';
    }
  };
  // Đường kẻ trám (diamond) được cắt theo hình chữ nhật bao để không cần clipPath
  function diamondsBox(x0, y0, x1, y1, step) {
    var s = '';
    for (var k = -12; k < 24; k++) {
      var x = x0 + k * step;
      s += segClip(x, y0, x + (y1 - y0), y1, x0, y0, x1, y1);
      s += segClip(x + (y1 - y0), y0, x, y1, x0, y0, x1, y1);
    }
    return '<path d="' + s + '" stroke="#ff9a3c" stroke-width="1.3" opacity=".35" fill="none"/>';
  }
  function segClip(ax, ay, bx, by, x0, y0, x1, y1) {
    // cắt đoạn thẳng theo khung (Liang–Barsky)
    var dx = bx - ax, dy = by - ay, p = [-dx, dx, -dy, dy], q = [ax - x0, x1 - ax, ay - y0, y1 - ay], u1 = 0, u2 = 1;
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return ''; continue; }
      var t = q[i] / p[i];
      if (p[i] < 0) { if (t > u1) u1 = t; } else { if (t < u2) u2 = t; }
    }
    if (u1 > u2) return '';
    return 'M' + (ax + u1 * dx).toFixed(1) + ' ' + (ay + u1 * dy).toFixed(1) + 'L' + (ax + u2 * dx).toFixed(1) + ' ' + (ay + u2 * dy).toFixed(1);
  }
  function clipDiamond() {
    return diamondsBox(62, 48, 186, 196, 18);
  }

  function art(key, opts) {
    var f = ART[key];
    return '<svg class="art" viewBox="0 0 240 230" role="img" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">' + (f ? f(opts || {}) : '') + '</svg>';
  }

  /* ---------- Danh mục ---------- */
  var CATEGORIES = [
    { key: 'tham', name: 'Thảm lót sàn 6D' },
    { key: 'camera', name: 'Camera hành trình' },
    { key: 'lop', name: 'Cảm biến áp suất lốp' },
    { key: 'ghe', name: 'Bọc ghế da' },
    { key: 'thom', name: 'Nước hoa ô tô' },
    { key: 'giado', name: 'Giá đỡ điện thoại' },
    { key: 'hutbui', name: 'Máy hút bụi mini' },
    { key: 'remche', name: 'Rèm che nắng' },
    { key: 'sac', name: 'Sạc nhanh' },
    { key: 'goi', name: 'Gối tựa cổ' }
  ];

  var CARS = [
    { key: 'vios', name: 'Vios', type: 'Sedan B' },
    { key: 'accent', name: 'Accent', type: 'Sedan B' },
    { key: 'city', name: 'City', type: 'Sedan B' },
    { key: 'cx5', name: 'CX-5', type: 'SUV C' },
    { key: 'xpander', name: 'Xpander', type: 'MPV 7 chỗ' },
    { key: 'vf5', name: 'VF 5', type: 'SUV điện A' },
    { key: 'seltos', name: 'Seltos', type: 'SUV B' },
    { key: 'ranger', name: 'Ranger', type: 'Bán tải' }
  ];

  var ALL = ['all'];
  var PRODUCTS = [
    { id: 'p01', cat: 'tham', name: 'Thảm lót sàn 6D da PU vân kim cương', spec: 'Da PU chống nước · may theo form xe', price: 1250000, old: 1690000, rating: 4.9, reviews: 312, sold: 1240, fits: ['vios', 'accent', 'city', 'seltos', 'vf5'], art: ['mat', { base: '#1b2130', base2: '#5a2a18', stitch: '#ff6a13' }], tone: 'warm', hot: true,
      desc: 'Thảm 6D ôm trọn sàn xe, đường may kim cương nổi, lớp đáy cao su gai chống trượt. Đo cắt theo đúng form từng dòng xe nên lắp vừa khít, không cần khoan bắt vít.',
      bullets: ['Da PU dày 6 mm, chống nước – dễ lau', 'Đế cao su gai chống xô lệch', 'Lắp đặt 15 phút tại nhà', 'Bảo hành bong chỉ 12 tháng'] },
    { id: 'p02', cat: 'tham', name: 'Thảm lót sàn 6D bản SUV/MPV 7 chỗ', spec: 'Phủ kín 3 hàng ghế · lót đáy cao su', price: 1890000, old: 2450000, rating: 4.8, reviews: 198, sold: 860, fits: ['cx5', 'xpander', 'ranger', 'seltos'], art: ['mat', { base: '#4a2a1a', base2: '#1b2130', stitch: '#ffc58a' }], tone: 'sand',
      desc: 'Phiên bản phủ kín cả 3 hàng ghế cho xe gia đình 7 chỗ. Màu nâu bò ấm, đường viền chỉ kem sang trọng, dễ vệ sinh khi đi chơi xa cùng trẻ nhỏ.',
      bullets: ['Phủ 3 hàng ghế + bậc cửa', 'Mép vát cao 6 cm giữ nước', 'Không mùi hoá chất', 'Bảo hành 12 tháng'] },
    { id: 'p03', cat: 'tham', name: 'Thảm cốp 6D chống trầy, chống nước', spec: 'Ôm sát khoang hành lý · viền cao', price: 690000, old: 890000, rating: 4.8, reviews: 96, sold: 420, isNew: true, fits: ['vios', 'accent', 'city', 'cx5', 'xpander', 'vf5', 'seltos'], art: ['trunk', { base: '#2a1e17', stitch: '#ff9a3c' }], tone: 'warm',
      desc: 'Bảo vệ khoang hành lý khỏi trầy xước, nước và mùi đồ ăn. Viền cao giữ bụi bẩn, nhấc ra vệ sinh trong 1 phút.',
      bullets: ['Viền cao 5 cm', 'Lớp lót chống trượt', 'Nhấc ra – rửa nước được', 'Theo đúng kích thước cốp'] },
    { id: 'p04', cat: 'camera', name: 'Camera hành trình 4K Wi-Fi góc rộng 170°', spec: 'Ghi hình 2160p · xem trên điện thoại', price: 1890000, old: 2590000, rating: 4.9, reviews: 524, sold: 2100, fits: ALL, img: '1449965408869-eaa3f722e40d', tone: 'navy', hot: true,
      desc: 'Ghi hình 4K sắc nét cả biển số xe phía trước, chế độ đêm cảm biến lớn, kết nối Wi-Fi để tải video về điện thoại. Giám sát đỗ xe 24h khi lắp bộ nguồn phụ.',
      bullets: ['Độ phân giải 3840×2160', 'Góc quay 170°, chống loá', 'Thẻ nhớ 64GB tặng kèm', 'Đi dây âm trần miễn phí'] },
    { id: 'p05', cat: 'camera', name: 'Camera gương 10 inch ghi hình trước – sau', spec: 'Màn hình cảm ứng · cam lùi 1080p', price: 2390000, old: 3290000, rating: 4.7, reviews: 141, sold: 610, isNew: true, fits: ALL, art: ['mirror'], tone: 'sky',
      desc: 'Thay gương chiếu hậu bằng màn hình cảm ứng 10 inch: ghi hình trước – sau đồng thời, hỗ trợ lùi xe với vạch kẻ động, lắp kẹp không cần tháo gương zin.',
      bullets: ['Màn IPS 10 inch cảm ứng', 'Cam sau chống nước IP67', 'Vạch hỗ trợ lùi', 'Bảo hành 12 tháng'] },
    { id: 'p06', cat: 'lop', name: 'Cảm biến áp suất lốp gắn van ngoài', spec: '4 cảm biến · cảnh báo âm thanh', price: 1150000, old: 1590000, rating: 4.8, reviews: 233, sold: 980, fits: ALL, img: '1578844251758-2f71da64c96f', tone: 'navy',
      desc: 'Theo dõi áp suất và nhiệt độ cả 4 lốp theo thời gian thực. Cảnh báo ngay khi lốp non, xì hơi hoặc quá nhiệt – an tâm khi chạy cao tốc.',
      bullets: ['Hiển thị áp suất + nhiệt độ', 'Pin cảm biến 2 năm', 'Chống trộm van', 'Lắp tại nhà 10 phút'] },
    { id: 'p07', cat: 'lop', name: 'Cảm biến áp suất lốp màn hình năng lượng mặt trời', spec: 'Sạc mặt trời · màn LCD màu', price: 1390000, old: 1890000, rating: 4.7, reviews: 88, sold: 350, isNew: true, fits: ALL, art: ['tpms'], tone: 'sky',
      desc: 'Màn hình đặt taplo tự sạc bằng năng lượng mặt trời, không cần đi dây. Hiển thị trực quan sơ đồ 4 bánh, đổi màu cảnh báo khi áp suất bất thường.',
      bullets: ['Tự sạc mặt trời + USB-C', 'Màn LCD màu dễ đọc', 'Cảm biến van trong/ngoài', 'Bảo hành 12 tháng'] },
    { id: 'p08', cat: 'ghe', name: 'Bọc ghế da microfiber may đo theo xe', spec: 'Da thoáng khí · bảo hành 2 năm', price: 4900000, old: 6500000, rating: 4.9, reviews: 167, sold: 390, fits: ['vios', 'accent', 'city', 'seltos', 'cx5', 'xpander', 'vf5', 'ranger'], art: ['seat', { base: '#d9b68c', dark: '#b88f62' }], tone: 'sand', hot: true,
      desc: 'Bọc ghế da microfiber may đo theo từng dòng xe, lắp tại nhà trong một buổi. Bề mặt mát, không bí, khâu chỉ đôi chắc chắn, giữ nguyên túi khí hông.',
      bullets: ['Da microfiber cao cấp', 'Khâu chỉ đôi, giữ túi khí', 'Chọn 6 màu phối', 'Bảo hành 24 tháng'] },
    { id: 'p09', cat: 'ghe', name: 'Bọc vô lăng da khâu tay', spec: 'Da thật · chống trượt, êm tay', price: 350000, old: 490000, rating: 4.8, reviews: 402, sold: 1520, fits: ALL, art: ['steering'], tone: 'warm',
      desc: 'Bọc vô lăng da khâu tay ôm khít, cầm chắc tay kể cả khi trời nóng. Đường chỉ cam nổi bật, hợp mọi nội thất.',
      bullets: ['Da thật mềm', 'Khâu tay tại xưởng', 'Size 37–38 cm', 'Đổi size miễn phí'] },
    { id: 'p10', cat: 'thom', name: 'Nước hoa ô tô tinh dầu gỗ thông', spec: 'Tinh dầu thiên nhiên · lưu hương 60 ngày', price: 189000, old: 260000, rating: 4.7, reviews: 611, sold: 3200, fits: ALL, img: '1612817288484-6f916006741a', tone: 'mint',
      desc: 'Hương gỗ thông dịu nhẹ, không gây say xe, phù hợp gia đình có trẻ nhỏ. Lọ thuỷ tinh nắp gỗ, điều chỉnh được độ toả hương.',
      bullets: ['100% tinh dầu thiên nhiên', 'Lưu hương ~60 ngày', 'Không gây say xe', 'Nhiều mùi: thông, sả chanh, trà xanh'] },
    { id: 'p11', cat: 'thom', name: 'Túi than tre hoạt tính khử mùi', spec: 'Than tre · hút ẩm, khử mùi', price: 129000, old: 190000, rating: 4.8, reviews: 254, sold: 1880, isNew: true, fits: ALL, art: ['freshener'], tone: 'mint',
      desc: 'Túi than tre hoạt tính hút ẩm và khử mùi xe mới, mùi thuốc lá, mùi đồ ăn. Phơi nắng 2 giờ để tái sử dụng đến 1 năm.',
      bullets: ['Than tre tự nhiên', 'Tái sử dụng đến 12 tháng', 'Không hương liệu', 'An toàn cho trẻ nhỏ'] },
    { id: 'p12', cat: 'giado', name: 'Giá đỡ điện thoại nam châm gắn taplo', spec: 'Nam châm N52 · xoay 360°', price: 249000, old: 350000, rating: 4.8, reviews: 377, sold: 2650, fits: ALL, img: '1512499617640-c74ae3a79d37', tone: 'sky',
      desc: 'Giá đỡ nam châm lực hút mạnh, gắn taplo bằng keo 3M chuyên dụng, xoay 360° để xem bản đồ dọc hoặc ngang. Nhỏ gọn, không che tầm nhìn.',
      bullets: ['Nam châm N52 lực hút mạnh', 'Khớp xoay 360°', 'Tặng 2 miếng dán kim loại', 'Bảo hành 6 tháng'] },
    { id: 'p13', cat: 'giado', name: 'Giá kẹp cửa gió tích hợp sạc không dây 15W', spec: 'Tự kẹp cảm biến · sạc 15W', price: 590000, old: 850000, rating: 4.7, reviews: 129, sold: 540, isNew: true, fits: ALL, art: ['vent'], tone: 'warm',
      desc: 'Đặt điện thoại vào là tay kẹp tự đóng và bắt đầu sạc không dây 15W. Ngàm kẹp cửa gió chắc chắn, có đèn báo sạc dịu mắt khi chạy đêm.',
      bullets: ['Sạc không dây 15W', 'Kẹp tự động cảm biến', 'Ngàm cửa gió 2 điểm', 'Tặng kèm cáp USB-C'] },
    { id: 'p14', cat: 'hutbui', name: 'Máy hút bụi mini cầm tay 120W', spec: 'Lực hút 8000Pa · pin sạc USB-C', price: 690000, old: 990000, rating: 4.8, reviews: 286, sold: 1730, fits: ALL, img: '1527515637462-cff94eecc1ac', tone: 'sky', hot: true,
      desc: 'Máy hút bụi không dây nhỏ gọn, lực hút 8000Pa hút sạch cát, vụn bánh dưới ghế. Kèm 3 đầu hút: dẹt, chổi, ống nối dài.',
      bullets: ['Lực hút 8000Pa', 'Pin 25 phút, sạc USB-C', 'Lọc HEPA rửa được', 'Tặng túi đựng'] },
    { id: 'p15', cat: 'hutbui', name: 'Bộ vệ sinh nội thất 6 món', spec: 'Khăn microfiber · dung dịch dưỡng da', price: 320000, old: 450000, rating: 4.7, reviews: 143, sold: 760, fits: ALL, img: '1607860108855-64acf2078ed9', tone: 'mint',
      desc: 'Đủ đồ để tự làm sạch xe tại nhà: dung dịch vệ sinh da, dưỡng nhựa taplo, khăn microfiber 2 mặt, chổi khe cửa gió và bọt rửa kính.',
      bullets: ['6 món trong 1 túi', 'Không làm bạc màu da', 'Khăn không xơ vải', 'Hướng dẫn kèm theo'] },
    { id: 'p16', cat: 'remche', name: 'Rèm che nắng nam châm theo xe', spec: 'Lưới chống UV 95% · gắn từ tính', price: 790000, old: 1090000, rating: 4.8, reviews: 175, sold: 690, fits: ['vios', 'accent', 'city', 'cx5', 'xpander', 'vf5', 'seltos'], art: ['curtain'], tone: 'sky',
      desc: 'Bộ 4 rèm cửa sổ cắt theo khung kính từng dòng xe, hít nam châm vào khung cửa trong 3 giây. Che nắng cho bé ngủ ngon ở hàng ghế sau mà vẫn nhìn ra ngoài được.',
      bullets: ['Chống UV đến 95%', 'Lắp – tháo 3 giây', 'Không cần khoan, dán', 'Bộ 4 tấm theo xe'] },
    { id: 'p17', cat: 'remche', name: 'Ô che nắng kính lái phản quang gấp gọn', spec: 'Gấp như ô · giảm nhiệt cabin', price: 290000, old: 420000, rating: 4.7, reviews: 318, sold: 2240, isNew: true, fits: ALL, art: ['shade'], tone: 'sand',
      desc: 'Bung ra như chiếc ô, che kín kính lái khi đỗ xe ngoài trời. Lớp phủ phản quang 10 lớp giúp cabin mát hơn đáng kể, gấp gọn cất hộc cửa.',
      bullets: ['Phủ phản quang 10 lớp', 'Khung 10 nan chắc chắn', 'Gấp gọn 30 cm', 'Kèm túi đựng'] },
    { id: 'p18', cat: 'sac', name: 'Tẩu sạc nhanh 65W PD hai cổng', spec: 'USB-C PD + USB-A QC · vỏ nhôm', price: 390000, old: 560000, rating: 4.9, reviews: 266, sold: 1410, fits: ALL, img: '1583863788434-e58a36330cf0', tone: 'sky',
      desc: 'Sạc nhanh điện thoại, máy tính bảng và cả laptop ngay trên xe. Vỏ nhôm tản nhiệt, đèn viền dịu, tự ngắt khi đầy.',
      bullets: ['Tổng công suất 65W', 'Chuẩn PD 3.0 & QC 3.0', 'Bảo vệ quá nhiệt, quá áp', 'Bảo hành 12 tháng'] },
    { id: 'p19', cat: 'sac', name: 'Cáp sạc 3 đầu bọc dù 1,2 m', spec: 'Type-C · Micro · cổng iP', price: 149000, old: 220000, rating: 4.6, reviews: 205, sold: 1960, fits: ALL, art: ['cable'], tone: 'warm',
      desc: 'Một sợi cáp cho cả nhà: đủ 3 đầu sạc phổ biến, bọc dù chống gãy gập, dài 1,2 m tới cả hàng ghế sau.',
      bullets: ['3 đầu sạc trong 1', 'Bọc dù chống gãy', 'Dòng 3A sạc nhanh', 'Đổi mới 6 tháng'] },
    { id: 'p20', cat: 'goi', name: 'Gối tựa cổ cao su non', spec: 'Cao su non · vỏ lụa lạnh tháo rời', price: 279000, old: 390000, rating: 4.8, reviews: 349, sold: 2380, fits: ALL, img: '1584100936595-c0654b55a2e2', tone: 'sand',
      desc: 'Gối tựa cổ cao su non đàn hồi chậm, đỡ đốt sống cổ trên những chuyến đi dài. Vỏ lụa lạnh tháo rời giặt được.',
      bullets: ['Cao su non đàn hồi chậm', 'Vỏ lụa lạnh tháo rời', 'Dây đai điều chỉnh', 'Hợp mọi tựa đầu'] },
    { id: 'p21', cat: 'goi', name: 'Gối tựa lưng công thái học', spec: 'Đỡ thắt lưng · đệm lưới thoáng', price: 450000, old: 620000, rating: 4.7, reviews: 117, sold: 480, isNew: true, fits: ALL, art: ['lumbar'], tone: 'warm',
      desc: 'Đường cong công thái học đỡ vùng thắt lưng, giảm mỏi khi lái xe đường dài. Mặt lưới 3D thoáng khí, không bí lưng mùa nóng.',
      bullets: ['Đỡ thắt lưng chuẩn', 'Lưới 3D thoáng khí', 'Dây đai cố định', 'Giặt được vỏ'] }
  ];

  var FLASH = [
    { id: 'p04', price: 1590000, sold: 34, total: 50 },
    { id: 'p14', price: 549000, sold: 41, total: 50 },
    { id: 'p01', price: 990000, sold: 27, total: 40 },
    { id: 'p12', price: 179000, sold: 88, total: 100 },
    { id: 'p18', price: 299000, sold: 19, total: 40 },
    { id: 'p20', price: 199000, sold: 46, total: 60 },
    { id: 'p06', price: 890000, sold: 12, total: 30 },
    { id: 'p10', price: 129000, sold: 71, total: 80 }
  ];

  var COMBO_POOL = ['p12', 'p18', 'p20', 'p14', 'p09', 'p17', 'p11', 'p19'];
  var COMBO_GIFT = 'p10';

  window.AK = {
    U: U, ic: ic, catIcon: catIcon, art: art,
    CATEGORIES: CATEGORIES, CARS: CARS, PRODUCTS: PRODUCTS, FLASH: FLASH,
    COMBO_POOL: COMBO_POOL, COMBO_GIFT: COMBO_GIFT
  };
})();
