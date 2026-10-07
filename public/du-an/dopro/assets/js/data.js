/* ĐỘ PRO GARAGE – dữ liệu mẫu (cửa hàng & thương hiệu minh hoạ) */
(function () {
  'use strict';
  /* Ảnh minh hoạ banner / dịch vụ: Unsplash (giấy phép miễn phí) */
  var IMG = function (id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=70';
  };
  /* Ảnh sản phẩm: ảnh thật từ Wikimedia Commons, đã tách nền trắng & chuẩn hoá 800×800 (assets/img/products) */
  var PIMG = function (slug) { return 'assets/img/products/' + slug + '.webp'; };

  /* ---------- Danh mục sản phẩm ---------- */
  var CATS = [
    { id: 'turbo-xa', name: 'Turbo & cổ góp xả', short: 'Turbo', img: 'turbo-wastegate-tich-hop',
      groups: [['Tăng áp', ['Turbo có wastegate', 'Turbo T3/T4', 'Bộ turbo trọn gói']], ['Hệ thống xả', ['Cổ góp xả (header)']]] },
    { id: 'mam', name: 'Mâm & ốc mâm', short: 'Mâm', img: 'mam-18-5-chau-kep-bac',
      groups: [['Mâm đúc', ['Mâm 17 inch', 'Mâm 18 inch']], ['Ốc mâm', ['Ốc khoá chống trộm', 'Ốc & tắc kê']]] },
    { id: 'gam', name: 'Phuộc & phụ kiện gầm', short: 'Phuộc', img: 'coilover-bo-4',
      groups: [['Hệ thống treo', ['Coilover']], ['Track day', ['Móc kéo xe']]] },
    { id: 'den-dien', name: 'Đèn & đồ điện', short: 'Đèn & điện', img: 'bong-led-h4',
      groups: [['Chiếu sáng', ['Bóng LED H4']], ['Thiết bị', ['Camera hành trình']]] },
    { id: 'bao-duong', name: 'Phụ tùng bảo dưỡng', short: 'Bảo dưỡng', img: 'bugi-danh-lua',
      groups: [['Đánh lửa', ['Bugi']], ['Lọc', ['Lọc gió điều hoà']]] }
  ];

  /* ---------- Dịch vụ thi công tại xưởng (ảnh công trình thực tế, không phải ảnh sản phẩm) ---------- */
  var SERVICES = [
    { id: 'body-kit', name: 'Body kit & cánh gió', from: 2450000, time: '1–2 ngày', img: '1788718600150-84f1e18a9f36', desc: 'Lip trước, ốp sườn, widebody, cánh GT – sơn đúng mã màu xe.', svc: 'Body kit & cánh gió' },
    { id: 'dan-doi-mau', name: 'Dán đổi màu & tem', from: 2200000, time: '2 giờ – 2 ngày', img: '1617024094355-b886817cffc4', desc: 'Film đổi màu bền 5 năm, tem livery cắt CNC theo form xe.', svc: 'Tem dán & đổi màu' },
    { id: 'do-po', name: 'Độ pô & hệ thống xả', from: 1290000, time: '1–3 giờ', img: '1777173649680-45b71ee019d5', desc: 'Pô inox/titan, đầu pô, van điện – đo độ ồn trước khi bàn giao.', svc: 'Pô độ' },
    { id: 'phanh', name: 'Nâng cấp phanh', from: 1350000, time: '1–4 giờ', img: '1760317890322-364a810cd4da', desc: 'Đĩa khoan xẻ rãnh, heo 4–6 piston, má phanh gốm, dầu DOT 4.', svc: 'Phanh hiệu suất' },
    { id: 'noi-that', name: 'Vô lăng & ghế thể thao', from: 3450000, time: '1–3 giờ', img: '1784034839931-87b163b53271', desc: 'Vô lăng đĩa sâu, ghế bucket, ốp carbon – tư vấn túi khí kỹ.', svc: 'Nội thất thể thao' },
    { id: 'remap', name: 'Remap ECU & đo dyno', from: 3900000, time: 'Nửa ngày', img: '1591879742348-13012c2963bf', desc: 'Map an toàn theo xăng tại Việt Nam, in biên bản dyno trước & sau.', svc: 'Combo Stage 1' }
  ];

  /* ---------- Hãng xe -> dòng xe ---------- */
  var BRANDS = [
    { id: 'toyota', name: 'Toyota', models: [['vios', 'Vios'], ['corolla-cross', 'Corolla Cross'], ['camry', 'Camry'], ['fortuner', 'Fortuner']] },
    { id: 'honda', name: 'Honda', models: [['city', 'City'], ['civic', 'Civic'], ['crv', 'CR-V']] },
    { id: 'mazda', name: 'Mazda', models: [['mazda3', 'Mazda 3'], ['cx5', 'CX-5'], ['mazda6', 'Mazda 6']] },
    { id: 'hyundai', name: 'Hyundai', models: [['accent', 'Accent'], ['elantra', 'Elantra'], ['tucson', 'Tucson']] },
    { id: 'kia', name: 'Kia', models: [['morning', 'Morning'], ['k3', 'K3'], ['seltos', 'Seltos']] },
    { id: 'ford', name: 'Ford', models: [['ranger', 'Ranger'], ['everest', 'Everest'], ['territory', 'Territory']] },
    { id: 'mitsubishi', name: 'Mitsubishi', models: [['xpander', 'Xpander'], ['attrage', 'Attrage']] },
    { id: 'vinfast', name: 'VinFast', models: [['vf5', 'VF 5'], ['vf8', 'VF 8'], ['fadil', 'Fadil']] }
  ];
  var MODEL_TABS = ['vios', 'city', 'mazda3', 'civic', 'accent', 'k3', 'ranger', 'xpander'];

  var SEDAN = ['vios', 'camry', 'city', 'civic', 'mazda3', 'mazda6', 'accent', 'elantra', 'k3', 'attrage'];
  var SPORTY = ['civic', 'mazda3', 'elantra', 'k3', 'city', 'vios', 'camry', 'mazda6'];
  var SUV = ['corolla-cross', 'fortuner', 'crv', 'cx5', 'tucson', 'seltos', 'everest', 'territory', 'xpander', 'vf8', 'ranger'];
  var SMALL = ['morning', 'fadil', 'vf5', 'accent', 'attrage', 'vios', 'city'];
  var NA4 = ['vios', 'city', 'mazda3', 'mazda6', 'accent', 'elantra', 'k3', 'attrage', 'xpander', 'morning', 'fadil', 'corolla-cross', 'cx5'];
  var ICE_ALL = ['vios', 'corolla-cross', 'camry', 'fortuner', 'city', 'civic', 'crv', 'mazda3', 'cx5', 'mazda6', 'accent', 'elantra', 'tucson', 'morning', 'k3', 'seltos', 'ranger', 'everest', 'territory', 'xpander', 'attrage', 'fadil'];
  var ALL = ICE_ALL.concat(['vf5', 'vf8']);
  var H4 = ['vios', 'city', 'accent', 'attrage', 'xpander', 'morning', 'fadil', 'ranger', 'fortuner', 'k3'];

  /*
   * img = tên file trong assets/img/products, src = nguồn ảnh (Wikimedia Commons)
   * tags: g = có quà tặng, i = trả góp 0%, l = lắp tại xưởng
   */
  var P = [
    { id: 'p01', cat: 'turbo-xa', name: 'Turbo tăng áp có wastegate tích hợp cho máy 1.5–2.0L', spec: 'Van xả áp tích hợp · làm mát dầu + nước · ~45 HP', price: 14500000, old: 16900000, rating: 4.8, reviews: 74, sold: 132, img: 'turbo-wastegate-tich-hop', fit: NA4, hot: 96, hp: 45, tags: 'gil', gift: 'Tặng bộ ống dầu turbo',
      feats: ['Wastegate tích hợp, không cần van xả rời', 'Vỏ turbine gang chịu nhiệt', 'Đường dầu & nước làm mát tiêu chuẩn', 'Lắp kèm remap ECU tại xưởng'],
      src: ['Panoha', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Turbo_charger_with_wastegate.jpg'] },
    { id: 'p02', cat: 'turbo-xa', name: 'Turbo T3/T4 mặt bích T3 cho máy 1.8–2.5L', spec: 'Mặt bích T3 · cửa xả V-band · ~60 HP', price: 11800000, old: 13500000, rating: 4.7, reviews: 51, sold: 88, img: 'turbo-t3-t4', fit: ['civic', 'camry', 'mazda6', 'crv', 'cx5', 'tucson', 'ranger', 'everest', 'fortuner'], hot: 88, hp: 60, tags: 'il',
      feats: ['Mặt bích T3 phổ biến, dễ chế cổ góp', 'Bánh nén nhôm đúc', 'Phù hợp dự án Stage 3', 'Bảo hành 6 tháng khi lắp tại xưởng'],
      src: ['Bobbobson', 'CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Turbocharger-1-.jpg'] },
    { id: 'p03', cat: 'turbo-xa', name: 'Bộ turbo kèm cổ góp xả lắp sẵn (trọn gói)', spec: 'Turbo + cổ góp + ống dầu · ~70 HP', price: 24900000, old: 28500000, rating: 4.9, reviews: 23, sold: 31, img: 'bo-turbo-co-gop-xa', fit: ['civic', 'mazda3', 'k3', 'elantra', 'camry', 'cx5'], hot: 84, hp: 70, tags: 'gil', gift: 'Tặng remap ECU + 2 lần đo dyno',
      feats: ['Turbo và cổ góp xả lắp sẵn, giảm thời gian thi công', 'Kèm ống dầu, gioăng, bulông chịu nhiệt', 'Remap ECU & chạy dyno kèm theo', 'Bảo hành hệ thống 12 tháng'],
      src: ['Tiia Monto', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Turbocharger_3.jpg'] },
    { id: 'p04', cat: 'turbo-xa', name: 'Cổ góp xả (header) 4-1 thép chịu nhiệt cho máy 4 xi-lanh', spec: '4 ống vào 1 · mối hàn TIG · ~6 HP', price: 6900000, old: 8200000, rating: 4.8, reviews: 96, sold: 214, img: 'co-xa-header-4-1', fit: NA4, hot: 92, hp: 6, tags: 'il',
      feats: ['4 ống dài bằng nhau, xả đều từng máy', 'Thép chịu nhiệt, hàn TIG', 'Kèm gioăng mặt bích & bulông', 'Tăng ~6 HP khi đi cùng pô thông (đo tham chiếu)'],
      src: ['Auge=mit', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:TF_Kruemmer_002_noBG.jpg'] },

    { id: 'p05', cat: 'mam', name: 'Mâm đúc 18 inch 5 chấu kép xám phay mặt (bộ 4)', spec: '18×8 · PCD 5×114.3 · ET40', price: 15600000, old: 18400000, rating: 4.8, reviews: 142, sold: 318, img: 'mam-18-5-chau-kep-bac', fit: SPORTY.concat(SUV), hot: 97, tags: 'gil', gift: 'Tặng ốc khoá + cân bằng động',
      feats: ['Đúc áp suất thấp, kiểm tra đảo vành tại xưởng', 'Màu xám phay mặt bóng', 'Có PCD 5×114.3 / 5×100', 'Miễn phí tháo lắp & cân bằng động'],
      src: ['Caylik', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Reblica-Dx-S-540-Janti-Fume-Yuzeyi-Polisaj.JPG'] },
    { id: 'p06', cat: 'mam', name: 'Mâm đúc 17 inch đen phay mặt 5 chấu (bộ 4)', spec: '17×7.5 · PCD 4×100 / 5×114.3 · ET42', price: 13200000, old: 15800000, rating: 4.7, reviews: 97, sold: 236, img: 'mam-17-den-phay-mat', fit: SEDAN.concat(SMALL), hot: 90, tags: 'il',
      feats: ['Thiết kế 5 chấu cong thể thao', 'Sơn đen bóng, mặt chấu phay sáng', 'Có PCD 4×100 cho xe hạng B', 'Tặng bộ chụp ốc'],
      src: ['Duru2007', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Black_diamond_alloy_wheels.jpg'] },
    { id: 'p07', cat: 'mam', name: 'Ốc khoá mâm chống trộm đầu cầu (bộ 4 + đầu khoá)', spec: 'Thép mạ kẽm · ren M14×1.5 · đầu cầu', price: 650000, old: 790000, rating: 4.8, reviews: 365, sold: 2140, img: 'oc-khoa-mam-chong-trom', fit: ALL, hot: 93, tags: 'l',
      feats: ['Mỗi bánh 1 ốc khoá, mở bằng đầu khoá riêng', 'Thép mạ kẽm chống gỉ', 'Đầu cầu khớp mâm zin & mâm độ', 'Lắp miễn phí khi mua mâm'],
      src: ['Raimond Spekking', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Kugelbund-Felgenschloss_und_Kugelbundschraube-92159.jpg'] },
    { id: 'p08', cat: 'mam', name: 'Bộ ốc mâm & tắc kê thép mạ (chọn theo xe)', spec: 'M12 / M14 · đầu côn & đầu cầu', price: 420000, old: 520000, rating: 4.6, reviews: 211, sold: 1380, img: 'bo-oc-mam-tac-ke', fit: ALL, hot: 80, tags: 'l',
      feats: ['Đủ cỡ M12×1.5 và M14×1.5', 'Đầu côn 60° hoặc đầu cầu theo mâm', 'Thép cứng 10.9, mạ chống gỉ', 'Siết lực đúng thông số khi lắp'],
      src: ['Davidtlchow', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wheel_Nuts_All_Details.png'] },

    { id: 'p09', cat: 'gam', name: 'Phuộc coilover chỉnh cao thấp (bộ 4 cây)', spec: 'Chỉnh cao thấp bằng ren · lò xo xanh · BH 12 tháng', price: 16900000, old: 19500000, rating: 4.8, reviews: 188, sold: 402, img: 'coilover-bo-4', fit: ICE_ALL.concat(['vf5']), hot: 95, tags: 'gil', gift: 'Tặng căn chỉnh thước lái',
      feats: ['Hạ gầm 30–70 mm tuỳ chỉnh', 'Thân phuộc nhôm, ren chỉnh cao thấp', 'Đi phố êm, vào cua chắc', 'Bảo hành rò dầu 12 tháng'],
      src: ['Cameron Chapman', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:Coilovers.jpg'] },
    { id: 'p10', cat: 'gam', name: 'Móc kéo xe ren vặn (tow hook) thép rèn', spec: 'Thép rèn · ren theo cản xe · tải 2 tấn', price: 250000, old: 320000, rating: 4.7, reviews: 129, sold: 760, img: 'moc-keo-xe', fit: ALL, hot: 70, tags: 'l',
      feats: ['Vặn vào lỗ móc kéo zin ở cản', 'Thép rèn, sơn tĩnh điện', 'Bắt buộc khi chạy track day', 'Kèm túi đựng'],
      src: ['Paplauskas', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:%D0%91%D1%83%D0%BA%D1%81%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D1%87%D0%BD%D0%B0%D1%8F_%D0%BF%D0%B5%D1%82%D0%BB%D1%8F_(%D0%B1%D1%83%D0%BA%D1%81%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D1%87%D0%BD%D1%8B%D0%B9_%D0%BA%D1%80%D1%8E%D0%BA,_%D0%BF%D1%80%D0%BE%D1%83%D1%88%D0%B8%D0%BD%D0%B0).jpg'] },

    { id: 'p11', cat: 'den-dien', name: 'Bóng đèn LED H4 tản nhiệt nhôm (cặp)', spec: 'Chân H4 cos/pha · 6000K · quạt tản nhiệt', price: 890000, old: 1190000, rating: 4.7, reviews: 512, sold: 3260, img: 'bong-led-h4', fit: H4, hot: 98, tags: 'l',
      feats: ['Thay trực tiếp bóng halogen H4', 'Ánh sáng trắng 6000K, cos – pha rõ', 'Thân nhôm tản nhiệt + quạt', 'Cân chỉnh pha miễn phí tại xưởng'],
      src: ['Ostadhamechidon', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:%D9%87%D8%AF%D9%84%D8%A7%DB%8C%D8%AA.jpg'] },
    { id: 'p12', cat: 'den-dien', name: 'Camera hành trình 2 mắt kèm tẩu sạc', spec: 'Ghi trước & trong xe · đế hít kính · tẩu 12V', price: 1450000, old: 1890000, rating: 4.6, reviews: 274, sold: 1120, img: 'camera-hanh-trinh-2-mat', fit: ALL, hot: 89, tags: 'gil', gift: 'Tặng thẻ nhớ 32GB',
      feats: ['2 ống kính: phía trước và trong cabin', 'Đế hít kính chắc chắn', 'Tẩu sạc 12V kèm dây dài', 'Đi dây gọn miễn phí tại xưởng'],
      src: ['Schekinov Alexey Victorovich', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%BE%D1%80_%D0%B4%D0%B2%D1%83%D1%85%D0%BA%D0%B0%D0%BC%D0%B5%D1%80%D0%BD%D1%8B%D0%B9_%D0%B8_%D0%B1%D0%BB%D0%BE%D0%BA_%D0%BF%D0%B8%D1%82%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BA_%D0%BD%D0%B5%D0%BC%D1%83._%D0%A4%D0%BE%D1%82%D0%BE_%D0%90._%D0%A9%D0%B5%D0%BA%D0%B8%D0%BD%D0%BE%D0%B2%D0%B0.jpg'] },

    { id: 'p13', cat: 'bao-duong', name: 'Bugi đánh lửa ren dài (1 cây)', spec: 'Ren M12 · cực đồng · thay mỗi 20.000 km', price: 180000, old: 220000, rating: 4.7, reviews: 438, sold: 4120, img: 'bugi-danh-lua', fit: ICE_ALL, hot: 86, tags: 'l',
      feats: ['Đúng mã theo động cơ, tra cứu theo đời xe', 'Đánh lửa ổn định khi đã remap', 'Nên thay đồng bộ cả bộ', 'Thay tại xưởng 15 phút'],
      src: ['Ren206', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Sparkplug3.jpg'] },
    { id: 'p14', cat: 'bao-duong', name: 'Lọc gió điều hoà than hoạt tính (2 tấm)', spec: 'Lọc bụi mịn · khử mùi · thay mỗi 10.000 km', price: 290000, old: 350000, rating: 4.6, reviews: 356, sold: 2870, img: 'loc-gio-dieu-hoa', fit: ALL, hot: 78, tags: 'l',
      feats: ['Lớp than hoạt tính khử mùi', 'Giữ bụi mịn, phấn hoa', 'Đúng kích thước theo xe', 'Thay miễn phí khi bảo dưỡng tại xưởng'],
      src: ['友田康治', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:MG_9218M.jpg'] }
  ];

  /* Flash sale: id, số suất, đã bán */
  var FLASH = [['p11', 50, 41], ['p07', 60, 47], ['p12', 30, 17], ['p14', 80, 52], ['p05', 10, 6], ['p13', 100, 64], ['p09', 8, 7], ['p10', 40, 13]];

  var COMBOS = [
    { id: 'c1', stage: 'Stage 1', tag: 'Đi phố', name: 'Combo Stage 1 – Đánh Thức', img: '1779263570103-e6cb9045fc54',
      hp: [178, 201], nm: [240, 272], acc: [7.6, 7.1], time: 'Nửa ngày', price: 8900000, old: 10600000,
      items: ['Lọc gió hiệu suất', 'Bugi & vệ sinh hệ thống nạp', 'Remap ECU nhẹ (map an toàn)', 'Đo dyno trước & sau'] },
    { id: 'c2', stage: 'Stage 2', tag: 'Bán chạy', name: 'Combo Stage 2 – Bứt Phá', img: '1591879742348-13012c2963bf',
      hp: [178, 228], nm: [240, 320], acc: [7.6, 6.4], time: '1 ngày', price: 29500000, old: 34900000,
      items: ['Cổ góp xả 4-1 + pô thông', 'Hút gió lạnh', 'Remap ECU Stage 2', 'Coilover chỉnh cao thấp'] },
    { id: 'c3', stage: 'Stage 3', tag: 'Track', name: 'Combo Stage 3 – Track Day', img: '1593142927747-8c1b758967a6',
      hp: [178, 246], nm: [240, 365], acc: [7.6, 5.8], time: '2–3 ngày', price: 89000000, old: 104000000,
      items: ['Bộ turbo kèm cổ góp xả', 'Intercooler + đường ống', 'Nâng cấp phanh 4 piston', 'Coilover + móc kéo track'] }
  ];

  var DYNO = {
    rpm: [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
    stock: [52, 74, 96, 118, 136, 150, 162, 171, 177, 178, 174, 166],
    stages: [
      { hp: [58, 84, 110, 134, 154, 170, 183, 193, 199, 201, 196, 186], peakHp: 201, nm: 272 },
      { hp: [62, 92, 124, 154, 178, 196, 210, 220, 226, 228, 222, 210], peakHp: 228, nm: 320 },
      { hp: [60, 90, 128, 166, 196, 218, 232, 241, 245, 246, 240, 228], peakHp: 246, nm: 365 }
    ]
  };

  var BUILDS = [
    { name: 'Coupe drift cặp đôi', car: 'Turbo kit · coilover · livery', img: '1536909526839-8f10e29ba80c', gain: '+112 HP' },
    { name: 'Coupe trắng drift', car: 'Turbo · cánh GT · phanh 4 piston', img: '1514046877476-ccde53bfc372', gain: '+95 HP' },
    { name: 'Hatchback trắng hạ gầm', car: 'Coilover · mâm đen · intake', img: '1602107461979-5b9460f0176c', gain: '+26 HP' },
    { name: 'Coupe tím widebody', car: 'Body kit · cánh GT · coilover', img: '1598632604495-49431163fda6', gain: '+66 HP' },
    { name: 'Roadster xám', car: 'Coilover · mâm 15" · ghế bucket', img: '1552615526-40e47a79f9d7', gain: '+29 HP' },
    { name: 'Coupe dán đổi màu', car: 'Chameleon · mâm đen · pô đôi', img: '1617024094355-b886817cffc4', gain: 'Đổi màu' },
    { name: 'Coupe trắng độ máy', car: 'Turbo · intercooler · coilover', img: '1539799139339-50c5fe1e2b1b', gain: '+90 HP' },
    { name: 'Coupe art-wrap', car: 'Art-wrap · body kit · pô titan', img: '1761344529053-b64306f1c5cd', gain: '+74 HP' }
  ];

  var REVIEWS = [
    { n: 'Minh Tuấn', car: 'Civic 2020 · Combo Stage 2', r: 5, d: '12/09/2026', t: 'Làm Stage 2 xong chạy dyno lên 226 HP, sát số báo giá. Xe đi phố vẫn êm, đạp ga sâu là thấy khác hẳn.', ph: ['1779263450175-dbd8771edc44', '1591879742348-13012c2963bf'] },
    { n: 'Thu Hà', car: 'Mazda 3 · đuôi vịt + lip', r: 5, d: '03/09/2026', t: 'Ducktail carbon dán không khoan, 20 phút là xong. Màu carbon khớp với lip trước, xe nhìn khác hẳn.', ph: ['1770172505231-2644765d984c'] },
    { n: 'Quốc Bảo', car: 'K3 · coilover + mâm 18"', r: 5, d: '28/08/2026', t: 'Kỹ thuật tư vấn offset mâm rất kỹ, hạ gầm xong căn chỉnh thước lái luôn. Đi đường gồ ghề vẫn không cạ gầm.' },
    { n: 'Đức Long', car: 'Ranger · LED H4 + camera', r: 4, d: '21/08/2026', t: 'Lắp tận nhà đúng hẹn, đi dây camera gọn. Đèn LED sáng hơn hẳn, cos không loá. Trừ 1 sao vì phải chờ hàng 2 ngày.' },
    { n: 'Hoàng Nam', car: 'Elantra · dán đổi màu', r: 5, d: '15/08/2026', t: 'Bản thiết kế tem được sửa 2 lần miễn phí. In sắc nét, phơi nắng 6 tháng vẫn chưa phai.', ph: ['1558958806-d5088c90f389'] },
    { n: 'Ngọc Ánh', car: 'City · vô lăng + ghế', r: 5, d: '02/08/2026', t: 'Vô lăng da lộn cầm sướng tay, shop giải thích kỹ chuyện túi khí trước khi lắp. Nhân viên nhiệt tình.' }
  ];
  var RATING_DIST = [[5, 1834], [4, 212], [3, 41], [2, 9], [1, 6]];

  var NEWS = [
    { t: 'Coilover hay lò xo hạ gầm: chọn loại nào cho xe đi phố hằng ngày?', d: '05/10/2026', tag: 'Kinh nghiệm', img: '1602107461979-5b9460f0176c', ex: 'So sánh độ êm, chi phí và mức hạ gầm của hai phương án phổ biến nhất cho sedan cỡ B, C.' },
    { t: 'Cách chọn offset và PCD khi thay mâm 18 inch không bị cạ hốc bánh', d: '29/09/2026', tag: 'Hướng dẫn', img: '1611633235555-45e252fe48c8' },
    { t: 'Lắp turbo cho máy hút khí tự nhiên: cần nâng cấp những gì?', d: '22/09/2026', tag: 'Dyno test', img: '1591879742348-13012c2963bf' },
    { t: 'Độ pô cho ô tô: lưu ý độ ồn và thủ tục trước khi đăng kiểm', d: '16/09/2026', tag: 'Pháp lý', img: '1692309175422-b9d614f4764e' },
    { t: 'Rửa xe dán đổi màu thế nào để film bền màu 5 năm?', d: '09/09/2026', tag: 'Chăm sóc xe', img: '1617024094355-b886817cffc4' }
  ];

  var SHOWROOMS = [
    { n: 'Xưởng chính Cầu Giấy', a: 'Số 1xx Đường Mẫu, Q. Cầu Giấy, Hà Nội', p: '0900 000 123', h: '08:00 – 20:00 (cả CN)', f: '6 khoang lắp · phòng dyno · cầu nâng 4 trụ', img: '1682795735660-a789079d5623' },
    { n: 'Chi nhánh Long Biên', a: 'Số 2xx Đường Mẫu, Q. Long Biên, Hà Nội', p: '0900 000 145', h: '08:00 – 19:30', f: '4 khoang lắp · dán đổi màu · cân chỉnh thước lái', img: '1727893304219-063d142ce6f3' },
    { n: 'Chi nhánh Thủ Đức', a: 'Số 3xx Đường Mẫu, TP. Thủ Đức, TP.HCM', p: '0900 000 167', h: '08:00 – 20:00', f: '5 khoang lắp · phòng dyno · kho phụ tùng', img: '1786198984387-b63cdf520602' }
  ];

  var FAQ = [
    { q: 'Độ xe có làm mất bảo hành chính hãng không?', a: 'Phần lớn phụ kiện ngoại thất (mâm, đèn, camera, dán đổi màu) không can thiệp hệ thống của xe. Với hạng mục liên quan động cơ như remap, turbo, kỹ thuật viên sẽ nói rõ phạm vi ảnh hưởng và áp dụng gói bảo hành riêng của xưởng.' },
    { q: 'Xe sau khi độ có đăng kiểm được không?', a: 'Xưởng ưu tiên các hạng mục không thay đổi kết cấu. Với hạng mục thay đổi kích thước, kết cấu hoặc màu sơn, chúng tôi hướng dẫn thủ tục cải tạo/khai báo cần thiết trước khi thi công.' },
    { q: 'Thời gian lắp đặt mất bao lâu?', a: 'Phụ kiện đơn giản (bóng LED, camera, ốc khoá mâm) khoảng 15–60 phút. Combo Stage 1 khoảng nửa ngày, Stage 2 một ngày, Stage 3 và turbo 2–3 ngày kèm chạy thử và đo dyno.' },
    { q: 'Có lắp đặt tận nơi không?', a: 'Có. Nội thành Hà Nội lắp tận nơi miễn phí với đơn từ 3.000.000₫ cho hạng mục không cần cầu nâng. Hạng mục lớn thực hiện tại xưởng để đảm bảo kỹ thuật.' },
    { q: 'Trả góp 0% áp dụng thế nào?', a: 'Trả góp 0% qua thẻ tín dụng kỳ hạn 3–12 tháng cho đơn từ 5.000.000₫ (minh hoạ). Ngoài ra có thể thanh toán khi nhận hàng hoặc chuyển khoản.' },
    { q: 'Chính sách đổi trả như thế nào?', a: 'Đổi trả trong 7 ngày nếu sản phẩm chưa lắp đặt, còn nguyên tem hộp. Sản phẩm lỗi kỹ thuật được đổi mới trong thời gian bảo hành.' }
  ];

  var HOT_KEYS = ['turbo', 'mâm 18', 'coilover', 'ốc khoá mâm', 'LED H4', 'camera hành trình', 'header', 'bugi'];

  window.DOPRO = { IMG: IMG, PIMG: PIMG, CATS: CATS, SERVICES: SERVICES, BRANDS: BRANDS, MODEL_TABS: MODEL_TABS, P: P, FLASH: FLASH, COMBOS: COMBOS, DYNO: DYNO, BUILDS: BUILDS, REVIEWS: REVIEWS, RATING_DIST: RATING_DIST, NEWS: NEWS, SHOWROOMS: SHOWROOMS, FAQ: FAQ, HOT_KEYS: HOT_KEYS };
})();
