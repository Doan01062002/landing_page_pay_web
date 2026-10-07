/* ĐỘ PRO GARAGE – dữ liệu mẫu (thương hiệu minh hoạ) */
(function () {
  'use strict';
  var IMG = function (id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=70';
  };

  var CATS = [
    { id: 'body-kit', name: 'Body kit', short: 'Body kit', img: '1779263439678-d02c2eb7591b', desc: 'Lip, hông, khuếch tán' },
    { id: 'canh-gio', name: 'Cánh gió', short: 'Cánh gió', img: '1775391985323-c4eb0e2a5807', desc: 'Carbon · GT wing' },
    { id: 'po', name: 'Pô độ', short: 'Pô độ', img: '1777173649680-45b71ee019d5', desc: 'Titan · van điện' },
    { id: 'mam', name: 'Mâm độ', short: 'Mâm độ', img: '1591158704107-8a254758d4c9', desc: '17" – 19" đúc & rèn' },
    { id: 'loc-gio', name: 'Hút gió & Turbo', short: 'Hút gió', img: '1522598140461-ec9911e01c53', desc: 'Lọc côn · intake' },
    { id: 'phuoc', name: 'Phuộc & hạ gầm', short: 'Phuộc', img: '1760836395763-25ea44ae8145', desc: 'Coilover · phuộc hơi' },
    { id: 'tem', name: 'Tem dán & đổi màu', short: 'Tem dán', img: '1674898759716-d7ddd59072a5', desc: 'Livery · wrap' },
    { id: 'noi-that', name: 'Vô lăng & nội thất', short: 'Nội thất', img: '1784034839931-87b163b53271', desc: 'Vô lăng · ghế bucket' }
  ];

  /* Fitment: brand -> models */
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

  var SEDAN = ['vios', 'camry', 'city', 'civic', 'mazda3', 'mazda6', 'accent', 'elantra', 'k3', 'attrage'];
  var SPORTY = ['civic', 'mazda3', 'elantra', 'k3', 'city', 'vios', 'camry', 'mazda6'];
  var SUV = ['corolla-cross', 'fortuner', 'crv', 'cx5', 'tucson', 'seltos', 'everest', 'territory', 'xpander', 'vf8', 'ranger'];
  var SMALL = ['morning', 'fadil', 'vf5', 'accent', 'attrage', 'vios', 'city'];
  var TURBO = ['civic', 'crv', 'mazda3', 'elantra', 'k3', 'tucson', 'seltos', 'ranger', 'everest', 'territory', 'corolla-cross', 'cx5', 'camry'];
  var ICE_ALL = ['vios', 'corolla-cross', 'camry', 'fortuner', 'city', 'civic', 'crv', 'mazda3', 'cx5', 'mazda6', 'accent', 'elantra', 'tucson', 'morning', 'k3', 'seltos', 'ranger', 'everest', 'territory', 'xpander', 'attrage', 'fadil'];

  var P = [
    { id: 'p01', cat: 'canh-gio', name: 'Cánh gió GT Carbon 3D Track Wing', spec: 'Carbon twill 3K · chân nhôm CNC · chỉnh góc 5 nấc', price: 6900000, old: 8500000, rating: 4.9, reviews: 214, img: '1775391985323-c4eb0e2a5807', fit: SEDAN, hot: 98,
      feats: ['Carbon thật 3K, phủ UV chống ố vàng', 'Chân đế nhôm CNC 6061, sơn tĩnh điện', 'Chỉnh góc tấn 5 nấc (0° – 8°)', 'Bộ ốc inox + gioăng cao su chống nước'] },
    { id: 'p02', cat: 'canh-gio', name: 'Cánh gió đuôi vịt Carbon Ducktail', spec: 'Carbon thật · dán 3M VHB · không khoan cốp', price: 2450000, old: 2990000, rating: 4.8, reviews: 532, img: '1770172505231-2644765d984c', fit: SEDAN, hot: 96,
      feats: ['Không khoan cốp – dán băng keo 3M VHB', 'Form ôm theo từng dòng xe', 'Carbon bóng hoặc nhám tuỳ chọn', 'Lắp đặt 20 phút'] },
    { id: 'p03', cat: 'canh-gio', name: 'Cánh gió cổ thiên nga Swan-Neck', spec: 'Nhôm + carbon · bản rộng 1450 mm · gắn cốp', price: 7800000, old: 9200000, rating: 4.7, reviews: 88, img: '1770172505314-b36c50ba7a56', fit: SPORTY, hot: 80,
      feats: ['Kiểu treo cổ thiên nga, luồng gió sạch phía dưới', 'Bản rộng 1450 mm, end-plate carbon', 'Tăng lực ép ở tốc độ cao', 'Kèm pát gia cố cốp'] },
    { id: 'p04', cat: 'body-kit', name: 'Body kit thể thao Street-R (4 món)', spec: 'Lip trước · ốp hông · khuếch tán sau · ABS đen bóng', price: 12500000, old: 15900000, rating: 4.8, reviews: 176, img: '1779263439678-d02c2eb7591b', fit: SPORTY, hot: 94,
      feats: ['Gồm lip trước, 2 ốp hông, khuếch tán sau', 'Nhựa ABS dẻo, sơn đen bóng 3 lớp', 'Bắt vít vào lỗ zin, không cắt cản', 'Bảo hành nứt vỡ 12 tháng'] },
    { id: 'p05', cat: 'body-kit', name: 'Bộ widebody Fender Flare +50 mm', spec: '8 mảnh · sợi thủy tinh FRP · bulong đen', price: 18900000, old: 22000000, rating: 4.6, reviews: 41, img: '1788718600150-84f1e18a9f36', fit: SPORTY, hot: 70,
      feats: ['Nới rộng 50 mm mỗi bên', '8 mảnh FRP, hoàn thiện sơn theo màu xe', 'Bulong đen kiểu riveted', 'Tư vấn mâm offset phù hợp'] },
    { id: 'p06', cat: 'body-kit', name: 'Ốp gương carbon dạng cánh', spec: 'Carbon 3K phủ UV · thay thế nắp gương', price: 1850000, old: 2300000, rating: 4.7, reviews: 302, img: '1787130314421-ce947d45aed9', fit: ICE_ALL.concat(['vf5', 'vf8']), hot: 85,
      feats: ['Thay thế trực tiếp nắp gương zin', 'Carbon 3K, giữ nguyên xi-nhan gương', 'Không ảnh hưởng gập điện', 'Bộ 2 chiếc trái/phải'] },
    { id: 'p07', cat: 'po', name: 'Pô titan đôi khò cháy Burnt-Ti', spec: 'Titan grade 1 · đầu Ø89 mm · tăng ~6 HP', price: 9600000, old: 11900000, rating: 4.9, reviews: 267, img: '1777173649680-45b71ee019d5', fit: ICE_ALL, hot: 99, hp: 6,
      feats: ['Titan grade 1, nhẹ hơn inox 40%', 'Màu khò cháy xanh tím thủ công', 'Tiếng trầm, không ù trong cabin', 'Tăng khoảng 6 HP (đo dyno tham chiếu)'] },
    { id: 'p08', cat: 'po', name: 'Pô thể thao 2 đầu viền carbon', spec: 'Inox 304 · đầu Ø101 mm · âm trầm', price: 4850000, old: 5900000, rating: 4.8, reviews: 411, img: '1692309175422-b9d614f4764e', fit: ICE_ALL, hot: 95,
      feats: ['Inox 304 đánh bóng gương', 'Viền đầu pô carbon thật', 'Ống tiêu âm thẳng, âm trầm ấm', 'Lắp đặt 60 phút'] },
    { id: 'p09', cat: 'po', name: 'Pô van điện Valve-X điều khiển remote', spec: 'Đóng/mở van · 2 chế độ êm/gầm · tăng ~8 HP', price: 14500000, old: 17000000, rating: 4.9, reviews: 129, img: '1779263450175-dbd8771edc44', fit: TURBO, hot: 92, hp: 8,
      feats: ['Van điện đóng/mở bằng remote hoặc app', 'Chế độ êm đi phố – chế độ gầm đi tour', 'Tăng khoảng 8 HP khi mở van', 'Bảo hành mô-tơ van 24 tháng'] },
    { id: 'p10', cat: 'po', name: 'Đầu pô xanh titan Blue-Burn (cặp)', spec: 'Ø76 mm · kẹp không hàn · bộ 2 chiếc', price: 1290000, old: 1690000, rating: 4.6, reviews: 688, img: '1760449072788-8ace021a956b', fit: ICE_ALL, hot: 90,
      feats: ['Kẹp đai, không cần hàn', 'Mạ PVD xanh titan bền màu', 'Đường kính trong Ø63 – 76 mm', 'Tự lắp tại nhà được'] },
    { id: 'p11', cat: 'mam', name: 'Mâm đúc 18" 5 chấu kép Gunmetal', spec: '18×8.5 · ET35 · 9,2 kg/chiếc · bộ 4', price: 21900000, old: 26000000, rating: 4.8, reviews: 154, img: '1591158704107-8a254758d4c9', fit: SPORTY.concat(SUV), hot: 93,
      feats: ['Đúc áp suất thấp, kiểm định JWL/VIA', 'Màu gunmetal sơn tĩnh điện', 'Có PCD 5×100 / 5×114.3', 'Miễn phí cân bằng động'] },
    { id: 'p12', cat: 'mam', name: 'Mâm 10 chấu Classic Mesh 17"', spec: '17×8 · ET30 · vành bóng · bộ 4', price: 16500000, old: 19800000, rating: 4.7, reviews: 97, img: '1770750942596-be791b5d0ffe', fit: SEDAN.concat(SMALL), hot: 84,
      feats: ['Thiết kế 10 chấu cổ điển', 'Vành step-lip đánh bóng', 'Trọng lượng 8,4 kg/chiếc', 'Tặng bộ ốc khoá chống trộm'] },
    { id: 'p13', cat: 'mam', name: 'Mâm rèn Forged Flow 19" siêu nhẹ', spec: 'Rèn nguyên khối 6061-T6 · 8,1 kg/chiếc · bộ 4', price: 42000000, old: 49000000, rating: 5.0, reviews: 36, img: '1611633235555-45e252fe48c8', fit: SPORTY.concat(SUV), hot: 78,
      feats: ['Rèn nguyên khối nhôm 6061-T6', 'Nhẹ hơn mâm zin ~3 kg/chiếc', 'Gia công theo offset riêng từng xe', 'Bảo hành kết cấu 5 năm'] },
    { id: 'p14', cat: 'loc-gio', name: 'Lọc gió côn hiệu suất Cone-Flow', spec: 'Cotton 4 lớp · rửa tái sử dụng · tăng ~4 HP', price: 1150000, old: 1450000, rating: 4.7, reviews: 845, img: '1522598140461-ec9911e01c53', fit: ICE_ALL, hot: 97, hp: 4,
      feats: ['Vải cotton 4 lớp tẩm dầu', 'Rửa và dùng lại đến 80.000 km', 'Tiếng hút gió thể thao', 'Kèm cổ nối theo họng gió'] },
    { id: 'p15', cat: 'loc-gio', name: 'Bộ hút gió lạnh Cold Air Intake', spec: 'Ống nhôm Ø76 · hộp chắn nhiệt · tăng ~9 HP', price: 6200000, old: 7500000, rating: 4.8, reviews: 203, img: '1779263570103-e6cb9045fc54', fit: TURBO, hot: 88, hp: 9,
      feats: ['Ống nhôm Ø76 mm sơn đỏ', 'Hộp chắn nhiệt lấy gió lạnh', 'Không báo lỗi cảm biến MAF', 'Tăng khoảng 9 HP'] },
    { id: 'p16', cat: 'loc-gio', name: 'Bộ turbo kit Stage 2 lắp trọn gói', spec: 'Turbo bạc đạn bi · intercooler · tăng ~60 HP', price: 68000000, old: 79000000, rating: 4.9, reviews: 22, img: '1591879742348-13012c2963bf', fit: TURBO, hot: 75, hp: 60,
      feats: ['Turbo bạc đạn bi phản hồi nhanh', 'Intercooler nhôm + đường ống silicon', 'Remap ECU & dyno tuning kèm theo', 'Bảo hành hệ thống 12 tháng'] },
    { id: 'p17', cat: 'phuoc', name: 'Phuộc coilover 32 nấc Street-Track', spec: 'Chỉnh cao thấp & cứng mềm · bộ 4 · BH 24 tháng', price: 19500000, old: 23500000, rating: 4.9, reviews: 318, img: '1760836395763-25ea44ae8145', fit: ICE_ALL.concat(['vf5', 'vf8']), hot: 97,
      feats: ['32 nấc chỉnh độ cứng giảm chấn', 'Hạ gầm 30 – 80 mm tuỳ chỉnh', 'Ty phuộc mạ crom cứng Ø44', 'Bảo hành rò dầu 24 tháng'] },
    { id: 'p18', cat: 'phuoc', name: 'Lò xo hạ gầm thể thao −35 mm', spec: 'Thép crom-silic · sơn tĩnh điện đỏ · bộ 4', price: 3900000, old: 4600000, rating: 4.6, reviews: 457, img: '1760836395865-0c20fff2aefd', fit: ICE_ALL.concat(['vf5']), hot: 86,
      feats: ['Hạ gầm 35 mm, giữ phuộc zin', 'Thép crom-silic chịu tải cao', 'Giảm nghiêng thân khi vào cua', 'Kèm căn chỉnh thước lái'] },
    { id: 'p19', cat: 'phuoc', name: 'Bộ phuộc hơi Air-Ride điều khiển app', spec: 'Bình hơi 5L · 4 vị trí nhớ · nâng/hạ 10 cm', price: 58000000, old: 65000000, rating: 4.8, reviews: 31, img: '1760317890353-5b156b3f9769', fit: SEDAN.concat(SUV), hot: 72,
      feats: ['Nâng/hạ 10 cm bằng app điện thoại', '4 vị trí nhớ chiều cao', 'Máy nén kép, bình hơi 5L', 'Thi công 2 ngày'] },
    { id: 'p20', cat: 'phuoc', name: 'Đĩa phanh khoan rãnh + heo 4 piston', spec: 'Đĩa 330 mm · má phanh gốm · bộ cầu trước', price: 15900000, old: 18500000, rating: 4.9, reviews: 112, img: '1760317890322-364a810cd4da', fit: SPORTY.concat(SUV), hot: 83,
      feats: ['Đĩa 330 mm khoan lỗ xẻ rãnh', 'Heo 4 piston nhôm đúc', 'Má phanh gốm ít bụi', 'Rút ngắn quãng phanh ~12%'] },
    { id: 'p21', cat: 'tem', name: 'Tem livery Racing Stripes', spec: 'Decal cán bóng · cắt theo form xe', price: 2200000, old: 2800000, rating: 4.7, reviews: 389, img: '1593481639859-98e0458f3902', fit: ICE_ALL.concat(['vf5', 'vf8']), hot: 87,
      feats: ['Decal cán phủ bóng chống UV', 'Cắt CNC theo form từng xe', 'Bóc không để lại keo', 'Dán trong 2 giờ'] },
    { id: 'p22', cat: 'tem', name: 'Dán đổi màu Chameleon đổi sắc', spec: 'Film PVC bền 5 năm · trọn xe sedan', price: 16000000, old: 19000000, rating: 4.8, reviews: 74, img: '1617024094355-b886817cffc4', fit: ICE_ALL.concat(['vf5', 'vf8']), hot: 81,
      feats: ['Đổi sắc theo góc nhìn', 'Film PVC bền màu 5 năm', 'Bảo vệ sơn zin bên dưới', 'Bao gồm khe cửa & tay nắm'] },
    { id: 'p23', cat: 'tem', name: 'Tem nghệ thuật Art-Wrap theo yêu cầu', spec: 'Thiết kế riêng · in UV · cán phủ chống trầy', price: 9500000, old: 12000000, rating: 4.9, reviews: 58, img: '1558958806-d5088c90f389', fit: ICE_ALL.concat(['vf5', 'vf8']), hot: 76,
      feats: ['Thiết kế riêng 2 bản phác thảo', 'In UV độ phân giải cao', 'Cán phủ chống trầy xước', 'Bảo hành bong tróc 24 tháng'] },
    { id: 'p24', cat: 'noi-that', name: 'Vô lăng đĩa sâu da lộn 350 mm', spec: 'Da lộn cao cấp · chỉ đỏ · kèm hub chuyển', price: 3450000, old: 4200000, rating: 4.8, reviews: 266, img: '1784034839931-87b163b53271', fit: ICE_ALL, hot: 91,
      feats: ['Đường kính 350 mm, độ sâu 90 mm', 'Bọc da lộn, chỉ khâu đỏ', 'Kèm hub chuyển theo dòng xe', 'Lưu ý: tư vấn túi khí trước khi lắp'] },
    { id: 'p25', cat: 'noi-that', name: 'Ghế bucket thể thao khung thép', spec: 'Đệm da · viền đỏ · kèm ray trượt', price: 8900000, old: 10500000, rating: 4.7, reviews: 63, img: '1789457365610-ac228d667d3d', fit: SEDAN.concat(SMALL), hot: 74,
      feats: ['Khung thép ống chịu lực', 'Đệm da, viền chỉ đỏ', 'Kèm ray trượt & pát bắt sàn', 'Hỗ trợ dây đai 4 điểm'] }
  ];

  var COMBOS = [
    { id: 'c1', stage: 'STAGE 1', tag: 'STREET', name: 'Combo Đánh Thức', img: '1779263570103-e6cb9045fc54',
      hp: [178, 201], nm: [240, 272], acc: [7.6, 7.1], price: 8900000, old: 10600000,
      items: ['Lọc gió côn Cone-Flow', 'Đầu pô Blue-Burn', 'Remap ECU nhẹ (map an toàn)', 'Đo dyno trước & sau'] },
    { id: 'c2', stage: 'STAGE 2', tag: 'BÁN CHẠY', name: 'Combo Bứt Phá', img: '1503221507150-dcb5a13416ca', featured: true,
      hp: [178, 228], nm: [240, 320], acc: [7.6, 6.4], price: 29500000, old: 34900000,
      items: ['Hút gió lạnh Cold Air Intake', 'Pô van điện Valve-X', 'Downpipe inox + remap Stage 2', 'Lò xo hạ gầm −35 mm'] },
    { id: 'c3', stage: 'STAGE 3', tag: 'TRACK', name: 'Combo Quái Vật', img: '1591879742348-13012c2963bf',
      hp: [178, 246], nm: [240, 365], acc: [7.6, 5.8], price: 89000000, old: 104000000,
      items: ['Turbo kit + intercooler', 'Coilover 32 nấc Street-Track', 'Pô titan Burnt-Ti', 'Đĩa phanh khoan rãnh 4 piston'] }
  ];

  /* HP theo vòng tua 1500 → 7000 rpm (bước 500) */
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
    { name: 'Project TWIN SMOKE', car: 'Cặp coupe drift', img: '1536909526839-8f10e29ba80c', gain: '+112 HP', mods: ['Turbo kit', 'Coilover', 'Livery'] },
    { name: 'Project NEON ART', car: 'Coupe trình diễn', img: '1761344529053-b64306f1c5cd', gain: '+74 HP', mods: ['Art-Wrap', 'Body kit', 'Pô titan'] },
    { name: 'Project SNOW DRIFT', car: 'Coupe trắng drift', img: '1514046877476-ccde53bfc372', gain: '+95 HP', mods: ['Turbo', 'Cánh GT', 'Phanh 4 piston'] },
    { name: 'Project NIGHT RUNNER', car: 'Coupe đen bóng', img: '1625762571817-b6dff1438ee4', gain: '+48 HP', mods: ['Mâm rèn', 'Pô van điện', 'Hạ gầm'] },
    { name: 'Project WHITE GHOST', car: 'Coupe trắng', img: '1539799139339-50c5fe1e2b1b', gain: '+90 HP', mods: ['Turbo', 'Intercooler', 'Coilover'] },
    { name: 'Project VIOLET', car: 'Drift coupe tím', img: '1598632604495-49431163fda6', gain: '+66 HP', mods: ['Body kit', 'Cánh GT', 'Coilover'] },
    { name: 'Project ICE', car: 'Hatchback trắng', img: '1602107461979-5b9460f0176c', gain: '+26 HP', mods: ['Lò xo −35', 'Mâm đen', 'Intake'] },
    { name: 'Project TANGERINE', car: 'Coupe cam', img: '1790396349058-7c0e89659739', gain: '+38 HP', mods: ['Lip carbon', 'Pô đôi', 'Remap'] },
    { name: 'Project GREY FOX', car: 'Roadster xám', img: '1552615526-40e47a79f9d7', gain: '+29 HP', mods: ['Coilover', 'Mâm 15"', 'Ghế bucket'] }
  ];

  var REVIEWS = [
    { n: 'Anh Minh Tuấn', car: 'Civic 2020 · Stage 2', r: 5, t: 'Làm Stage 2 xong chạy dyno lên đúng 226 HP như báo giá. Tiếng pô van điện ban đêm đóng lại êm, cuối tuần mở ra là cả nhóm quay lại nhìn.' },
    { n: 'Chị Thu Hà', car: 'Mazda 3 · cánh gió + lip', r: 5, t: 'Ducktail carbon dán không khoan, 20 phút xong. Màu carbon khớp với lip trước, nhìn xe khác hẳn mà vẫn đăng kiểm bình thường.' },
    { n: 'Anh Quốc Bảo', car: 'K3 · coilover + mâm 18"', r: 5, t: 'Kỹ thuật viên tư vấn offset mâm rất kỹ, hạ gầm xong căn chỉnh thước lái luôn. Đi đường gồ ghề vẫn không bị cạ gầm.' },
    { n: 'Anh Đức Long', car: 'Ranger · pô + intake', r: 4, t: 'Lắp tận nhà đúng hẹn, dọn dẹp sạch sẽ. Xe kéo khoẻ hơn rõ ở dải tua thấp. Trừ 1 sao vì phải chờ hàng mâm 2 ngày.' },
    { n: 'Anh Hoàng Nam', car: 'Elantra · Art-Wrap', r: 5, t: 'Bản thiết kế tem riêng được sửa 2 lần miễn phí. In sắc nét, sau 6 tháng phơi nắng vẫn chưa phai. Rất đáng tiền.' },
    { n: 'Chị Ngọc Ánh', car: 'City · vô lăng + ghế', r: 5, t: 'Vô lăng da lộn cầm sướng tay, shop tư vấn kỹ về túi khí trước khi lắp. Nhân viên nhiệt tình, giải thích dễ hiểu.' }
  ];

  var FAQ = [
    { q: 'Độ xe có làm mất bảo hành chính hãng không?', a: 'Phần lớn phụ kiện ngoại thất (cánh gió, tem, mâm, ốp carbon) không ảnh hưởng bảo hành hãng. Với các hạng mục can thiệp động cơ như remap, turbo, chúng tôi tư vấn rõ phạm vi ảnh hưởng và cung cấp gói bảo hành riêng đến 24 tháng.' },
    { q: 'Xe sau khi độ có đăng kiểm được không?', a: 'Chúng tôi ưu tiên các hạng mục nằm trong quy định. Với hạng mục thay đổi kích thước, kết cấu hoặc màu sơn, kỹ thuật viên sẽ hướng dẫn thủ tục cải tạo/khai báo cần thiết trước khi thi công để bạn yên tâm lưu hành.' },
    { q: 'Thời gian lắp đặt mất bao lâu?', a: 'Phụ kiện đơn giản (lọc gió, đầu pô, ducktail) khoảng 20–60 phút. Combo Stage 1 khoảng nửa ngày, Stage 2 một ngày, Stage 3 và phuộc hơi 2–3 ngày kèm chạy thử và đo dyno.' },
    { q: 'Có lắp đặt tận nơi không?', a: 'Có. Nội thành Hà Nội lắp tận nơi miễn phí với đơn từ 3.000.000₫ cho các hạng mục không cần cầu nâng. Hạng mục lớn sẽ thực hiện tại xưởng để đảm bảo kỹ thuật.' },
    { q: 'Có hỗ trợ trả góp không?', a: 'Hỗ trợ trả góp 0% qua thẻ tín dụng kỳ hạn 3–12 tháng cho đơn từ 5.000.000₫ (minh hoạ). Ngoài ra có thể thanh toán COD hoặc chuyển khoản.' },
    { q: 'Chính sách đổi trả như thế nào?', a: 'Đổi trả trong 7 ngày nếu sản phẩm chưa lắp đặt, còn nguyên tem hộp. Sản phẩm lỗi kỹ thuật được đổi mới trong thời gian bảo hành.' }
  ];

  window.DOPRO = { IMG: IMG, CATS: CATS, BRANDS: BRANDS, P: P, COMBOS: COMBOS, DYNO: DYNO, BUILDS: BUILDS, REVIEWS: REVIEWS, FAQ: FAQ };
})();
