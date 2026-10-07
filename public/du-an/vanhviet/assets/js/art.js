/* VÀNH VIỆT – vẽ mâm, lốp, xe, phụ kiện bằng SVG */
(function () {
  var uid = 0;
  var FILL = { bac: 'url(#fBac)', den: 'url(#fDen)', titan: 'url(#fTitan)', dong: 'url(#fDong)' };

  function rep(n, inner, off) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<g transform="rotate(' + ((360 / n) * i + (off || 0)).toFixed(2) + ')">' + inner + '</g>';
    return s;
  }

  function spokes(design, f) {
    switch (design) {
      case 'double':
        return rep(5, '<path d="M-7.5,-17 L-2.6,-17 L-8,-63.5 L-15.5,-63.5 Z" fill="' + f + '"/><path d="M2.6,-17 L7.5,-17 L15.5,-63.5 L8,-63.5 Z" fill="' + f + '"/>');
      case 'mesh':
        return rep(10, '<path d="M-2.5,-17 L2.5,-17 L3.8,-63.5 L-3.8,-63.5 Z" fill="' + f + '"/><path d="M0,-37 L-11.5,-62 M0,-37 L11.5,-62" stroke="' + f + '" stroke-width="3.2" stroke-linecap="round" fill="none"/>');
      case 'turbine':
        return rep(10, '<path d="M-3.4,-17 Q-16,-38 -8.5,-63.5 L2.2,-63.5 Q-5.5,-38 4.2,-17 Z" fill="' + f + '"/>');
      case 'yspoke':
        return rep(5, '<path d="M-5.5,-17 L5.5,-17 L4.6,-35 L17.5,-63.5 L9,-63.5 L0,-43 L-9,-63.5 L-17.5,-63.5 L-4.6,-35 Z" fill="' + f + '"/>');
      case 'aero':
        return '<circle r="64" fill="' + f + '"/>' +
          rep(6, '<path d="M-7,-28 L7,-28 L17,-55.5 L-17,-55.5 Z" fill="#232529" stroke="#232529" stroke-width="5" stroke-linejoin="round"/>') +
          '<circle r="43" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1"/>';
      default: // five
        return rep(5, '<path d="M-8.5,-17 L8.5,-17 L16.5,-63.5 L-16.5,-63.5 Z" fill="' + f + '"/><path d="M-0.6,-24 L0.6,-24 L0.9,-58 L-0.9,-58 Z" fill="rgba(0,0,0,.28)"/>');
    }
  }

  /* Mâm (không lốp) trong toạ độ gốc: mép vành r=72 */
  function rim(design, fin, lugs) {
    var f = FILL[fin] || FILL.bac;
    lugs = lugs || 5;
    var nuts = '';
    for (var i = 0; i < lugs; i++) {
      var a = (Math.PI * 2 * i) / lugs;
      nuts += '<circle cx="' + (13 * Math.sin(a)).toFixed(2) + '" cy="' + (-13 * Math.cos(a)).toFixed(2) + '" r="2.6" fill="#141518" stroke="rgba(255,255,255,.35)" stroke-width=".6"/>';
    }
    return '<circle r="72" fill="' + f + '"/>' +
      '<circle r="63.5" fill="url(#fBarrel)"/>' +
      spokes(design, f) +
      '<circle r="70.6" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/>' +
      '<circle r="63.8" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="1.3"/>' +
      '<circle r="20" fill="' + f + '"/><circle r="19.4" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="1"/>' +
      nuts +
      '<circle r="8" fill="#1d1f22"/><path d="M-4,-2.6 L0,4 L4,-2.6" fill="none" stroke="#ffcc00" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /* Mâm đơn – dùng cho thẻ sản phẩm */
  function wheelSVG(design, fin, cls) {
    return '<svg class="wheel-svg ' + (cls || '') + '" viewBox="-78 -78 156 156" aria-hidden="true" focusable="false">' +
      '<ellipse cx="0" cy="74" rx="56" ry="4" fill="rgba(0,0,0,.12)"/>' +
      '<g class="rim-rot">' + rim(design, fin) + '</g>' +
      '<circle r="72" fill="url(#fSheen)" pointer-events="none"/></svg>';
  }

  /* Lốp + mâm dạng nhóm (toạ độ: lốp r=100) */
  function wheelTyreGroup(design, fin, ratio, opts) {
    opts = opts || {};
    var rr = 100 * ratio;
    var s = (rr / 72).toFixed(4);
    var mid = (rr + 100) / 2;
    var id = 'tp' + (++uid);
    var txt = opts.text ? '<path id="' + id + '" d="M ' + (-mid) + ' 0 A ' + mid + ' ' + mid + ' 0 1 1 ' + mid + ' 0 A ' + mid + ' ' + mid + ' 0 1 1 ' + (-mid) + ' 0" fill="none"/>' +
      '<text font-family="Be Vietnam Pro, sans-serif" font-weight="600" font-size="' + (opts.fs || 7.5) + '" fill="#7d8187" letter-spacing="1.6"><textPath href="#' + id + '" startOffset="2%">' + opts.text + '</textPath></text>' : '';
    return '<circle r="100" fill="url(#fTyre)"/>' +
      '<circle r="97.5" fill="none" stroke="#0a0b0c" stroke-width="4.5" stroke-dasharray="5.5 4"/>' +
      '<circle r="' + mid.toFixed(2) + '" fill="none" stroke="rgba(255,255,255,.035)" stroke-width="' + ((100 - rr) * 0.55).toFixed(2) + '"/>' +
      txt +
      '<circle r="' + (rr + 1.2).toFixed(2) + '" fill="#0c0d0e"/>' +
      '<g transform="scale(' + s + ')">' + rim(design, fin, opts.lugs) + '</g>';
  }

  function heroWheelSVG() {
    return '<svg viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">' +
      wheelTyreGroup('turbine', 'titan', 0.72, { text: 'VÀNH VIỆT · 225/45R18 95W · TUBELESS · ĐÚC A356.2 T6 · ', fs: 6.6 }) + '</svg>';
  }

  /* Lốp sản phẩm */
  function tyreSVG(p) {
    var id = 'tt' + (++uid);
    var blocks = '';
    var n = 56;
    for (var i = 0; i < n; i++) {
      blocks += '<rect x="-3.2" y="-101" width="6.4" height="8" rx="1.2" fill="#0b0c0d" transform="rotate(' + ((360 / n) * i).toFixed(2) + ')"/>';
    }
    var ring = 'M -100 0 A 100 100 0 1 0 100 0 A 100 100 0 1 0 -100 0 Z M -60 0 A 60 60 0 1 1 60 0 A 60 60 0 1 1 -60 0 Z';
    return '<svg class="tyre-svg" viewBox="-110 -110 220 220" aria-hidden="true" focusable="false">' +
      '<ellipse cx="0" cy="104" rx="76" ry="5" fill="rgba(0,0,0,.14)"/>' +
      '<g class="rim-rot">' +
      '<path d="' + ring + '" fill="url(#fTyre)" fill-rule="evenodd"/>' + blocks +
      '<circle r="91" fill="none" stroke="#2a2c30" stroke-width="1"/>' +
      '<circle r="66" fill="none" stroke="' + (p.accent || '#ffcc00') + '" stroke-width="2.2"/>' +
      '<circle r="61" fill="none" stroke="#2a2c30" stroke-width="2"/>' +
      '<path id="' + id + '" d="M -78 0 A 78 78 0 1 1 78 0 A 78 78 0 1 1 -78 0" fill="none"/>' +
      '<text font-family="Be Vietnam Pro, sans-serif" font-weight="700" font-size="10.5" fill="#9a9ea4" letter-spacing="2.2"><textPath href="#' + id + '" startOffset="3%">' + p.line + ' · ' + p.size + ' · TUBELESS · RADIAL · </textPath></text>' +
      '</g><circle r="100" fill="url(#fSheen)" opacity=".5" pointer-events="none"/></svg>';
  }

  function hex(cx, cy, r, extra) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i + Math.PI / 6;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" ' + (extra || '') + '/>';
  }

  function accSVG(kind) {
    var o = '<svg class="acc-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><ellipse cx="100" cy="176" rx="70" ry="6" fill="rgba(0,0,0,.12)"/><g class="rim-rot acc-g">';
    if (kind === 'lug') {
      [[64, 120, 28], [136, 120, 28], [100, 70, 32]].forEach(function (n, i) {
        o += hex(n[0], n[1], n[2], 'fill="url(#fBac)" stroke="#8b9097" stroke-width="1.2"');
        o += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + (n[2] * 0.62) + '" fill="url(#fTitan)"/>';
        o += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + (n[2] * 0.38) + '" fill="#1d1f22"/>';
        if (i === 2) o += '<path d="M' + (n[0] - 8) + ',' + n[1] + ' q4,-8 8,0 t8,0" fill="none" stroke="#ffcc00" stroke-width="2.4" stroke-linecap="round"/>';
      });
      o += '<rect x="86" y="140" width="28" height="22" rx="4" fill="#1d1f22"/><rect x="92" y="146" width="16" height="10" rx="2" fill="#ffcc00"/>';
    } else if (kind === 'cap') {
      [[70, 118], [130, 118], [100, 72]].forEach(function (c) {
        o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="36" fill="url(#fBac)"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="30" fill="url(#fDen)"/>' +
          '<path d="M' + (c[0] - 12) + ',' + (c[1] - 7) + ' L' + c[0] + ',' + (c[1] + 12) + ' L' + (c[0] + 12) + ',' + (c[1] - 7) + '" fill="none" stroke="#ffcc00" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="36" fill="url(#fSheen)"/>';
      });
    } else if (kind === 'tpms') {
      o += '<rect x="30" y="44" width="140" height="96" rx="12" fill="#1d1f22"/><rect x="38" y="52" width="124" height="80" rx="6" fill="#0d1014"/>' +
        '<rect x="88" y="66" width="24" height="52" rx="9" fill="none" stroke="#5b6168" stroke-width="2"/>' +
        '<text x="62" y="76" font-family="Be Vietnam Pro,sans-serif" font-weight="700" font-size="12" fill="#ffcc00" text-anchor="middle">2.3</text>' +
        '<text x="138" y="76" font-family="Be Vietnam Pro,sans-serif" font-weight="700" font-size="12" fill="#ffcc00" text-anchor="middle">2.3</text>' +
        '<text x="62" y="118" font-family="Be Vietnam Pro,sans-serif" font-weight="700" font-size="12" fill="#ffcc00" text-anchor="middle">2.4</text>' +
        '<text x="138" y="118" font-family="Be Vietnam Pro,sans-serif" font-weight="700" font-size="12" fill="#e8432f" text-anchor="middle">1.9</text>' +
        '<text x="100" y="128" font-family="Be Vietnam Pro,sans-serif" font-size="7" fill="#7b8189" text-anchor="middle">BAR</text>' +
        '<rect x="84" y="140" width="32" height="10" fill="#2a2d31"/><rect x="64" y="150" width="72" height="8" rx="4" fill="#2a2d31"/>' +
        '<rect x="150" y="146" width="18" height="24" rx="4" fill="url(#fBac)"/><rect x="155" y="132" width="8" height="16" fill="url(#fTitan)"/>';
    } else {
      [50, 82, 114, 146].forEach(function (x, i) {
        var y = i % 2 ? 66 : 58;
        o += '<rect x="' + (x - 8) + '" y="' + (y + 52) + '" width="16" height="44" rx="3" fill="#1d1f22"/>' +
          hex(x, y + 52, 13, 'fill="url(#fBac)"') +
          '<rect x="' + (x - 10) + '" y="' + y + '" width="20" height="46" rx="6" fill="#ffcc00"/>' +
          '<rect x="' + (x - 10) + '" y="' + y + '" width="7" height="46" rx="3" fill="rgba(255,255,255,.35)"/>' +
          '<path d="M' + (x - 10) + ',' + (y + 14) + ' h20 M' + (x - 10) + ',' + (y + 20) + ' h20 M' + (x - 10) + ',' + (y + 26) + ' h20" stroke="rgba(0,0,0,.25)" stroke-width="1.4"/>';
      });
    }
    return o + '</g></svg>';
  }

  /* Bóng xe nhìn ngang */
  var CARS = {
    sedan: {
      R: 60, A: 72, Y: 214, py: [70, 119], w: [[190, 202], [612, 202]],
      body: 'M 62 212 L 56 176 Q 54 150 74 140 L 150 126 Q 190 120 230 117 L 300 74 Q 318 64 345 63 L 452 63 Q 478 64 500 76 L 566 116 L 690 132 Q 742 140 750 166 L 754 200 Q 754 212 740 214 L 683 214 A 72 72 0 1 0 541 214 L 261 214 A 72 72 0 1 0 119 214 Z',
      glass: 'M 248 118 L 306 80 Q 320 72 345 71 L 448 71 Q 470 72 488 82 L 548 118 Z', pillars: [396],
      head: 'M 700 140 L 742 150 Q 746 158 740 162 L 704 152 Z', tail: 'M 58 152 L 84 146 L 84 158 L 58 164 Z',
      belt: 'M 80 150 L 700 144', doors: [400, 260, 548], handle: [[330, 140], [470, 138]], mirror: [548, 112]
    },
    hatch: {
      R: 58, A: 70, Y: 214, py: [67, 119], w: [[180, 204], [590, 204]],
      body: 'M 66 214 L 60 150 Q 60 116 80 100 L 128 70 Q 140 62 160 62 L 420 62 Q 444 63 462 76 L 540 120 L 660 134 Q 712 142 720 168 L 722 202 Q 722 214 708 214 L 659 214 A 70 70 0 1 0 521 214 L 249 214 A 70 70 0 1 0 111 214 Z',
      glass: 'M 100 112 L 138 74 Q 148 68 162 68 L 416 68 Q 436 69 452 80 L 514 118 Z', pillars: [236, 364],
      head: 'M 672 142 L 712 152 Q 716 160 710 164 L 676 154 Z', tail: 'M 62 128 L 82 122 L 82 140 L 62 146 Z',
      belt: 'M 70 152 L 670 146', doors: [364, 236, 514], handle: [[300, 140], [430, 138]], mirror: [514, 112]
    },
    suv: {
      R: 68, A: 80, Y: 212, py: [56, 107], w: [[196, 194], [614, 194]],
      body: 'M 52 212 L 48 120 Q 50 96 70 86 L 110 60 Q 120 52 140 52 L 470 50 Q 492 50 506 60 L 584 110 L 712 124 Q 752 132 758 160 L 760 200 Q 760 212 746 212 L 692 212 A 80 80 0 1 0 536 212 L 274 212 A 80 80 0 1 0 118 212 Z',
      glass: 'M 104 106 L 138 64 Q 146 58 158 58 L 466 57 Q 484 57 496 66 L 560 106 Z', pillars: [250, 404],
      head: 'M 718 132 L 752 140 Q 756 150 750 154 L 720 146 Z', tail: 'M 50 112 L 70 106 L 70 132 L 50 138 Z',
      belt: 'M 60 136 L 720 132', doors: [404, 250, 560], handle: [[340, 128], [490, 126]], mirror: [560, 98],
      rail: 'M 150 48 L 460 46'
    },
    pickup: {
      R: 70, A: 82, Y: 212, py: [69, 119], w: [[190, 192], [626, 192]],
      body: 'M 36 212 L 34 128 L 330 128 L 336 76 Q 340 64 356 63 L 470 62 Q 490 62 502 72 L 574 118 L 722 128 Q 758 136 764 162 L 766 200 Q 766 212 752 212 L 706 212 A 82 82 0 1 0 546 212 L 270 212 A 82 82 0 1 0 110 212 Z',
      glass: 'M 350 118 L 354 78 Q 356 70 364 70 L 466 70 Q 482 70 492 78 L 552 118 Z', pillars: [446],
      head: 'M 724 136 L 758 144 Q 762 154 756 158 L 726 150 Z', tail: 'M 36 136 L 52 136 L 52 160 L 36 160 Z',
      belt: 'M 40 146 L 730 140', doors: [446, 334, 552], handle: [[400, 140], [500, 138]], mirror: [552, 110],
      bed: 'M 40 134 L 326 134'
    }
  };

  /* hốc bánh tối màu phía sau thân xe */
  function wells(c) {
    return c.w.map(function (w) {
      var dy = c.Y - w[1], dx = Math.sqrt(c.A * c.A - dy * dy);
      return '<path d="M ' + (w[0] - dx).toFixed(1) + ' ' + c.Y + ' A ' + c.A + ' ' + c.A + ' 0 1 1 ' + (w[0] + dx).toFixed(1) + ' ' + c.Y + ' Z" fill="#26292e"/>';
    }).join('');
  }

  function carSVG(type, design, fin, ratio, lugs) {
    var c = CARS[type] || CARS.sedan;
    var o = '<svg class="car-svg" viewBox="0 0 800 290" role="img" aria-label="Bóng xe minh hoạ với mâm đã chọn">' +
      '<ellipse cx="400" cy="264" rx="360" ry="10" fill="rgba(29,31,34,.14)"/>' +
      '<g class="car-body">' +
      wells(c) + '<path d="' + c.body + '" fill="url(#fBody)"/>' +
      '<path d="' + c.glass + '" fill="url(#fGlass)"/>';
    c.pillars.forEach(function (x) { o += '<rect x="' + (x - 4) + '" y="' + c.py[0] + '" width="8" height="' + (c.py[1] - c.py[0]) + '" fill="#4a5260"/>'; });
    o += '<path d="' + c.belt + '" stroke="rgba(255,255,255,.16)" stroke-width="1.5" fill="none"/>';
    if (c.rail) o += '<path d="' + c.rail + '" stroke="#8b939e" stroke-width="5" stroke-linecap="round"/>';
    if (c.bed) o += '<path d="' + c.bed + '" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/>';
    o += '<path d="M ' + c.doors[0] + ' 120 L ' + c.doors[0] + ' 206" stroke="rgba(0,0,0,.22)" stroke-width="1.4"/>';
    c.handle.forEach(function (h) { o += '<rect x="' + h[0] + '" y="' + h[1] + '" width="22" height="4" rx="2" fill="rgba(255,255,255,.28)"/>'; });
    o += '<path d="' + c.head + '" fill="#ffcc00"/><path d="' + c.tail + '" fill="#d8342b"/>' +
      '<path d="M ' + c.mirror[0] + ' ' + c.mirror[1] + ' l 18 -2 l 2 10 l -16 2 z" fill="#8b939e"/>' +
      '</g>';
    c.w.forEach(function (w) {
      o += '<g transform="translate(' + w[0] + ' ' + w[1] + ') scale(' + (c.R / 100).toFixed(3) + ')"><g class="wspin">' +
        wheelTyreGroup(design, fin, ratio, { lugs: lugs }) + '</g><circle r="' + (100 * ratio).toFixed(1) + '" fill="url(#fSheen)" opacity=".8"/></g>';
    });
    return o + '</svg>';
  }

  /* Sơ đồ giải mã lốp */
  function decoderSVG(w, ar, d, li, sp) {
    var h = (w * ar) / 100, rimmm = d * 25.4, D = rimmm + 2 * h;
    var Ro = 192, cx = 250, cy = 244, k = Ro / (D / 2);
    var rr = (rimmm / 2) * k, hw = w * k;
    var fx = 556 - hw / 2;
    var top = cy - Ro, bot = cy + Ro;
    var ring = 'M ' + (cx - Ro) + ' ' + cy + ' A ' + Ro + ' ' + Ro + ' 0 1 0 ' + (cx + Ro) + ' ' + cy + ' A ' + Ro + ' ' + Ro + ' 0 1 0 ' + (cx - Ro) + ' ' + cy + ' Z M ' + (cx - rr) + ' ' + cy + ' A ' + rr + ' ' + rr + ' 0 1 1 ' + (cx + rr) + ' ' + cy + ' A ' + rr + ' ' + rr + ' 0 1 1 ' + (cx - rr) + ' ' + cy + ' Z';
    var plies = '';
    for (var i = 0; i < 36; i++) {
      var a = (Math.PI * 2 * i) / 36, ca = Math.cos(a), sa = Math.sin(a);
      plies += 'M' + (cx + (rr + 4) * ca).toFixed(1) + ',' + (cy + (rr + 4) * sa).toFixed(1) + ' L' + (cx + (Ro - 8) * ca).toFixed(1) + ',' + (cy + (Ro - 8) * sa).toFixed(1) + ' ';
    }
    var tread = '';
    for (var y = top + 10; y < bot - 6; y += 14) {
      tread += 'M' + (fx + 6).toFixed(1) + ',' + y + ' l' + (hw * 0.18).toFixed(1) + ',6 M' + (fx + hw - 6).toFixed(1) + ',' + y + ' l' + (-hw * 0.18).toFixed(1) + ',6 ';
    }
    var mid = (rr + Ro) / 2;
    var f1 = function (n) { return n.toLocaleString('vi-VN', { maximumFractionDigits: 0 }); };
    var o = '<svg class="dg" viewBox="0 0 660 480" role="img" aria-label="Sơ đồ kích thước lốp ' + w + '/' + ar + 'R' + d + '">' +
      '<defs><marker id="arw" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="currentColor"/></marker></defs>' +
      '<g class="p-tyre"><path d="' + ring + '" fill="#141517" fill-rule="evenodd" stroke="#3a3e44" stroke-width="1"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (Ro - 3) + '" fill="none" stroke="#0a0b0c" stroke-width="6" stroke-dasharray="7 5"/></g>' +
      '<path class="p-r" d="' + plies + '" stroke-width="1"/>' +
      '<path class="p-ar-band" d="M ' + (cx - mid) + ' ' + cy + ' A ' + mid + ' ' + mid + ' 0 1 1 ' + (cx + mid) + ' ' + cy + ' A ' + mid + ' ' + mid + ' 0 1 1 ' + (cx - mid) + ' ' + cy + '" fill="none" stroke-width="' + (Ro - rr - 10).toFixed(1) + '"/>' +
      '<path id="dgtp" d="M ' + (cx - mid) + ' ' + cy + ' A ' + mid + ' ' + mid + ' 0 1 1 ' + (cx + mid) + ' ' + cy + '" fill="none"/>' +
      '<text class="p-txt" font-family="Be Vietnam Pro, sans-serif" font-weight="700" font-size="17" letter-spacing="3" text-anchor="middle"><textPath href="#dgtp" startOffset="27%">' + w + '/' + ar + 'R' + d + ' ' + li + sp + '</textPath></text>' +
      '<g transform="translate(' + cx + ' ' + cy + ') scale(' + ((rr - 2) / 72).toFixed(4) + ')">' + rim('five', 'bac', 5) + '</g>' +
      /* đường kính mâm */
      '<g class="p-d dim"><line x1="' + (cx - rr + 4) + '" y1="' + cy + '" x2="' + (cx + rr - 4) + '" y2="' + cy + '" marker-start="url(#arw)" marker-end="url(#arw)"/>' +
      '<rect x="' + (cx - 62) + '" y="' + (cy + 12) + '" width="124" height="26" rx="13"/><text x="' + cx + '" y="' + (cy + 30) + '">' + d + '″ = ' + f1(rimmm) + ' mm</text></g>' +
      /* chiều cao thành lốp */
      '<g class="p-ar dim"><line x1="' + (cx + 26) + '" y1="' + (top + 3) + '" x2="' + (cx + 26) + '" y2="' + (cy - rr) + '" marker-start="url(#arw)" marker-end="url(#arw)"/>' +
      '<rect x="' + (cx + 36) + '" y="' + (top + (Ro - rr) / 2 - 13) + '" width="96" height="26" rx="13"/><text x="' + (cx + 84) + '" y="' + (top + (Ro - rr) / 2 + 5) + '">' + f1(h) + ' mm</text></g>' +
      /* đường kính tổng */
      '<g class="p-D dim"><line x1="22" y1="' + top + '" x2="22" y2="' + bot + '" marker-start="url(#arw)" marker-end="url(#arw)"/>' +
      '<line x1="16" y1="' + top + '" x2="' + cx + '" y2="' + top + '" class="ext"/><line x1="16" y1="' + bot + '" x2="' + cx + '" y2="' + bot + '" class="ext"/>' +
      '<rect x="6" y="' + (cy - 46) + '" width="32" height="92" rx="16"/><text transform="translate(27 ' + cy + ') rotate(-90)">Ø ' + f1(D) + '</text></g>' +
      /* mặt lốp nhìn thẳng */
      '<g class="p-w"><rect class="tread" x="' + fx.toFixed(1) + '" y="' + top + '" width="' + hw.toFixed(1) + '" height="' + (2 * Ro) + '" rx="' + Math.min(26, hw / 4).toFixed(1) + '"/>' +
      '<path d="' + tread + '" stroke="#0a0b0c" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="' + (fx + hw * 0.36).toFixed(1) + '" y1="' + (top + 6) + '" x2="' + (fx + hw * 0.36).toFixed(1) + '" y2="' + (bot - 6) + '" stroke="#0a0b0c" stroke-width="4"/>' +
      '<line x1="' + (fx + hw * 0.64).toFixed(1) + '" y1="' + (top + 6) + '" x2="' + (fx + hw * 0.64).toFixed(1) + '" y2="' + (bot - 6) + '" stroke="#0a0b0c" stroke-width="4"/></g>' +
      '<g class="p-w dim"><line x1="' + fx.toFixed(1) + '" y1="' + (top - 22) + '" x2="' + (fx + hw).toFixed(1) + '" y2="' + (top - 22) + '" marker-start="url(#arw)" marker-end="url(#arw)"/>' +
      '<line class="ext" x1="' + fx.toFixed(1) + '" y1="' + (top - 30) + '" x2="' + fx.toFixed(1) + '" y2="' + (top + 8) + '"/><line class="ext" x1="' + (fx + hw).toFixed(1) + '" y1="' + (top - 30) + '" x2="' + (fx + hw).toFixed(1) + '" y2="' + (top + 8) + '"/>' +
      '<rect x="' + (556 - 46) + '" y="' + (top - 50) + '" width="92" height="24" rx="12"/><text x="556" y="' + (top - 33) + '">' + w + ' mm</text></g>' +
      '<text class="dg-cap" x="556" y="' + (bot + 26) + '">MẶT LỐP</text><text class="dg-cap" x="' + cx + '" y="' + (bot + 26) + '">NHÌN NGANG</text>' +
      '</svg>';
    return { svg: o, h: h, D: D };
  }

  window.VVArt = { rim: rim, wheelSVG: wheelSVG, wheelTyreGroup: wheelTyreGroup, heroWheelSVG: heroWheelSVG, tyreSVG: tyreSVG, accSVG: accSVG, carSVG: carSVG, decoderSVG: decoderSVG };
})();
