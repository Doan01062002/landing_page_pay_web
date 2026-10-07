/* VÀNH VIỆT – dữ liệu mẫu (cửa hàng & thương hiệu minh hoạ)
   Ảnh: Unsplash (giấy phép Unsplash, hotlink images.unsplash.com) */
window.VV = window.VV || {};

VV.IMG = function (id, w, h) {
  return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=70';
};

VV.DESIGNS = {
  five:    { name: '5 chấu',        code: 'F', k: 1.00 },
  double:  { name: 'Nan kép',       code: 'D', k: 1.06 },
  mesh:    { name: 'Lưới đa chấu',  code: 'M', k: 1.10 },
  turbine: { name: 'Nan xoáy',      code: 'T', k: 1.12 },
  yspoke:  { name: 'Chấu chữ Y',    code: 'Y', k: 1.08 },
  aero:    { name: 'Đĩa khí động',  code: 'A', k: 1.15 }
};

VV.FINISHES = {
  bac:   { name: 'Bạc',        add: 0,      sw: '#d9dde2' },
  den:   { name: 'Đen bóng',   add: 100000, sw: '#26282c' },
  titan: { name: 'Xám titan',  add: 150000, sw: '#6b7179' },
  dong:  { name: 'Vàng đồng',  add: 250000, sw: '#b07a3a' }
};

/* Giá mâm / chiếc theo đường kính (trước hệ số kiểu nan) – dùng cho cấu hình */
VV.WHEEL_BASE = { 15: 1450000, 16: 1850000, 17: 2350000, 18: 2950000, 19: 3650000, 20: 4450000 };
VV.TYRE_BASE  = { 15: 1150000, 16: 1450000, 17: 1850000, 18: 2350000, 19: 2950000, 20: 3550000 };

VV.TYRE_FOR = {
  sedan:  { 15: '185/60R15', 16: '205/55R16', 17: '215/45R17', 18: '225/40R18', 19: '235/35R19', 20: '245/30R20' },
  hatch:  { 15: '185/55R15', 16: '195/50R16', 17: '205/45R17', 18: '215/40R18' },
  suv:    { 16: '215/65R16', 17: '225/65R17', 18: '235/60R18', 19: '235/55R19', 20: '255/45R20' },
  pickup: { 17: '265/65R17', 18: '265/60R18', 20: '265/50R20' }
};

VV.CARS = {
  Toyota: [
    { m: 'Vios',          type: 'sedan',  pcd: '4×100',   lugs: 4, cb: '54,1', et: '35–45', d: [15, 16, 17] },
    { m: 'Corolla Cross', type: 'suv',    pcd: '5×114,3', lugs: 5, cb: '60,1', et: '35–45', d: [17, 18, 19] },
    { m: 'Camry',         type: 'sedan',  pcd: '5×114,3', lugs: 5, cb: '60,1', et: '35–45', d: [17, 18, 19] },
    { m: 'Fortuner',      type: 'suv',    pcd: '6×139,7', lugs: 6, cb: '106,1', et: '10–30', d: [17, 18, 20] }
  ],
  Honda: [
    { m: 'City',  type: 'sedan', pcd: '4×100',   lugs: 4, cb: '56,1', et: '40–50', d: [15, 16, 17] },
    { m: 'Civic', type: 'sedan', pcd: '5×114,3', lugs: 5, cb: '64,1', et: '40–50', d: [16, 17, 18, 19] },
    { m: 'CR-V',  type: 'suv',   pcd: '5×114,3', lugs: 5, cb: '64,1', et: '40–50', d: [17, 18, 19] }
  ],
  Mazda: [
    { m: 'Mazda2', type: 'hatch', pcd: '4×100',   lugs: 4, cb: '54,1', et: '38–45', d: [15, 16, 17] },
    { m: 'Mazda3', type: 'sedan', pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [16, 17, 18] },
    { m: 'CX-5',   type: 'suv',   pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [17, 18, 19] }
  ],
  Hyundai: [
    { m: 'Grand i10', type: 'hatch', pcd: '4×100',   lugs: 4, cb: '54,1', et: '35–45', d: [15, 16] },
    { m: 'Accent',    type: 'sedan', pcd: '4×100',   lugs: 4, cb: '54,1', et: '38–48', d: [15, 16, 17] },
    { m: 'Tucson',    type: 'suv',   pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [17, 18, 19] },
    { m: 'Santa Fe',  type: 'suv',   pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [18, 19, 20] }
  ],
  Kia: [
    { m: 'Morning',  type: 'hatch', pcd: '4×100',   lugs: 4, cb: '54,1', et: '35–45', d: [15, 16] },
    { m: 'K3',       type: 'sedan', pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [16, 17, 18] },
    { m: 'Seltos',   type: 'suv',   pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [16, 17, 18] },
    { m: 'Carnival', type: 'suv',   pcd: '5×114,3', lugs: 5, cb: '67,1', et: '40–50', d: [18, 19, 20] }
  ],
  Ford: [
    { m: 'Ranger',    type: 'pickup', pcd: '6×139,7', lugs: 6, cb: '93,1', et: '10–30', d: [17, 18, 20] },
    { m: 'Everest',   type: 'suv',    pcd: '6×139,7', lugs: 6, cb: '93,1', et: '15–30', d: [18, 20] },
    { m: 'Territory', type: 'suv',    pcd: '5×108',   lugs: 5, cb: '63,4', et: '40–50', d: [18, 19] }
  ],
  Mitsubishi: [
    { m: 'Xpander', type: 'suv',    pcd: '4×114,3', lugs: 4, cb: '67,1', et: '38–46', d: [16, 17, 18] },
    { m: 'Triton',  type: 'pickup', pcd: '6×139,7', lugs: 6, cb: '67,1', et: '10–30', d: [17, 18] }
  ]
};

/* Thương hiệu minh hoạ (VV Wheels, Arcadia, Tenzo, Nordak, Solano, VV Care là tên giả định) */
VV.BRANDS = [
  { n: 'VV Wheels', k: 'Mâm đúc' }, { n: 'Arcadia', k: 'Mâm đúc' }, { n: 'Tenzo', k: 'Mâm đúc' }, { n: 'Mâm zin', k: 'Tháo xe' },
  { n: 'Nordak', k: 'Lốp xe' }, { n: 'Solano', k: 'Lốp xe' }, { n: 'VV Care', k: 'Phụ kiện' }
];

/* Ảnh sản phẩm: ảnh chụp thật (Pexels / Wikimedia Commons), tách nền trắng, chuẩn hoá 800×800 – nguồn ở VV.CREDITS */
VV.P_IMG = function (f) { return 'assets/img/products/' + f + '.webp'; };

/* sold: số đã bán · flash: { s: đã bán trong suất, t: tổng suất } · set: giá tính theo cả bộ */
VV.PRODUCTS = [
  // ---------- MÂM ĐÚC (giá / chiếc) ----------
  { id: 'm1506', cat: 'mam', brand: 'VV Wheels', name: 'Mâm đúc 15 inch 6 chấu xám khói VV-1506', img: 'mam-15-6-chau-xam',
    d: 15, pcd: ['4×100'], j: '6,0J', et: 40, cb: '73,1', style: '6 chấu', finish: 'titan', price: 1450000, old: 1690000, rating: 4.8, rv: 126, sold: 1240,
    desc: '6 chấu bản vừa, sơn xám khói mặt phay nhẹ. Hợp Vios, City, Accent, Mazda2 đi phố hằng ngày.' },
  { id: 'm1505', cat: 'mam', brand: 'Tenzo', name: 'Mâm đúc 15 inch 5 chấu lòng sâu bạc TZ-1505', img: 'mam-15-5-chau-long-sau',
    d: 15, pcd: ['4×100'], j: '7,0J', et: 30, cb: '73,1', style: '5 chấu lòng sâu', finish: 'bac', price: 1590000, rating: 4.7, rv: 88, sold: 760,
    desc: '5 chấu bản to, lòng mâm sâu kiểu cổ điển. Bề rộng 7J, cần kiểm tra hốc bánh khi lắp cho xe hạng A.' },
  { id: 'm1606', cat: 'mam', brand: 'Arcadia', name: 'Mâm đúc 16 inch 6 chấu mặt phay AR-1606', img: 'mam-16-6-chau-mat-phay',
    d: 16, pcd: ['4×100', '5×114,3'], j: '6,5J', et: 42, cb: '73,1', style: '6 chấu mặt phay', finish: 'den', price: 1950000, old: 2290000, rating: 4.9, rv: 212, sold: 2130,
    desc: 'Nền đen, mặt chấu phay bóng CNC. Có 2 chuẩn lỗ, giữ độ êm của lốp thành 55 – 60.' },
  { id: 'm1714', cat: 'mam', brand: 'VV Wheels', name: 'Mâm đúc 17 inch 14 chấu mảnh bạc VV-1714', img: 'mam-17-14-chau-bac',
    d: 17, pcd: ['5×114,3'], j: '7,5J', et: 40, cb: '73,1', style: '14 chấu mảnh', finish: 'bac', price: 2450000, old: 2850000, rating: 4.9, rv: 318, sold: 3420, flash: { s: 36, t: 50 },
    desc: 'Mẫu bán chạy: 14 chấu mảnh kiểu xe đua, sơn bạc phủ clear chống trầy. Hợp sedan hạng C, crossover cỡ nhỏ.' },
  { id: 'm1714g', cat: 'mam', brand: 'VV Wheels', name: 'Mâm đúc 17 inch 14 chấu vàng đồng VV-1714G', img: 'mam-17-14-chau-vang-dong',
    d: 17, pcd: ['5×114,3'], j: '7,5J', et: 40, cb: '73,1', style: '14 chấu mảnh', finish: 'dong', price: 2690000, old: 2990000, rating: 4.8, rv: 77, sold: 540,
    desc: 'Cùng kiểu 14 chấu, sơn vàng đồng mờ – điểm nhấn cho xe màu trắng, đen, xám.' },
  { id: 'm1766', cat: 'mam', brand: 'Tenzo', name: 'Mâm đúc 17 inch 6 chấu 6 lỗ bán tải TZ-1766', img: 'mam-17-6-lo-ban-tai',
    d: 17, pcd: ['6×139,7'], j: '8,0J', et: 20, cb: '106,1', style: '6 chấu bản to', finish: 'bac', price: 3190000, old: 3490000, rating: 4.8, rv: 64, sold: 610,
    desc: 'Chuẩn 6×139,7 cho Ranger, Triton, Fortuner. Tải trọng 950 kg/chiếc, mép vành tiện bóng.' },
  { id: 'm1912', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin 19 inch nan xoáy đen phay bóng (tháo xe SUV)', img: 'mam-19-nan-xoay-phay',
    d: 19, pcd: ['5×114,3'], j: '8,0J', et: 40, cb: '67,1', style: 'Nan xoáy 12 chấu', finish: 'den', price: 3850000, old: 4390000, rating: 4.8, rv: 73, sold: 430, flash: { s: 12, t: 30 },
    desc: 'Mâm zin tháo xe SUV mới chạy dưới 3.000 km, không cong vênh, đã kiểm tra độ đảo. Nan xoáy đen phay hai tông.' },
  { id: 'm1916', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin 19 inch đa chấu đen phay bóng (tháo xe SUV)', img: 'mam-19-da-chau-phay',
    d: 19, pcd: ['5×114,3'], j: '8,0J', et: 38, cb: '67,1', style: 'Đa chấu', finish: 'den', price: 3690000, rating: 4.7, rv: 41, sold: 260,
    desc: 'Đa chấu mảnh hai tông đen – phay bóng, tháo từ xe mới. Kèm vòng định tâm theo xe.' },
  { id: 'm2005', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin 20 inch 5 chấu cánh quạt đen phay (tháo xe SUV)', img: 'mam-20-5-chau-canh-quat',
    d: 20, pcd: ['5×114,3'], j: '8,5J', et: 40, cb: '67,1', style: '5 chấu cánh quạt', finish: 'den', price: 4290000, old: 4890000, rating: 4.9, rv: 36, sold: 190, flash: { s: 8, t: 20 },
    desc: '5 chấu cánh quạt bản lớn, mặt phay bóng. Hợp SUV 5 – 7 chỗ, lốp đề xuất 255/45R20.' },
  { id: 'mz1710', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin Suzuki 17 inch 10 chấu bạc (tháo xe)', img: 'mam-zin-17-10-chau-bac',
    d: 17, pcd: ['5×114,3'], j: '6,5J', et: 50, cb: '60,1', style: '10 chấu xoắn', finish: 'bac', price: 2190000, rating: 4.8, rv: 29, sold: 320,
    desc: 'Mâm zin Suzuki tháo xe trưng bày, mới khoảng 98%. Lắp vừa xe cùng thông số PCD, ET, lỗ tâm.' },
  { id: 'mz1705', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin Suzuki 17 inch 5 chấu xoáy bạc (tháo xe)', img: 'mam-zin-17-5-chau-xoay',
    d: 17, pcd: ['5×114,3'], j: '6,5J', et: 45, cb: '60,1', style: '5 chấu xoáy', finish: 'bac', price: 2290000, rating: 4.7, rv: 22, sold: 280,
    desc: '5 chấu xoáy bạc, mới khoảng 98%. Bảo hành kết cấu 12 tháng cho hàng tháo xe.' },
  { id: 'mz1601', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin Suzuki 16 inch đen phay bóng (tháo xe)', img: 'mam-zin-16-den-phay',
    d: 16, pcd: ['4×100'], j: '6,0J', et: 45, cb: '54,1', style: '10 chấu kép', finish: 'den', price: 1790000, old: 1990000, rating: 4.8, rv: 47, sold: 450, flash: { s: 22, t: 40 },
    desc: 'Đen phay bóng hai tông, chuẩn 4×100. Lắp được nhiều xe hạng B (kỹ thuật kiểm tra lỗ tâm trước khi lắp).' },
  { id: 'mz1501', cat: 'mam', brand: 'Mâm zin', name: 'Mâm zin Suzuki 15 inch chấu xoáy bạc (tháo xe)', img: 'mam-zin-15-chau-xoay-bac',
    d: 15, pcd: ['4×100'], j: '5,5J', et: 50, cb: '54,1', style: 'Chấu xoáy', finish: 'bac', price: 1190000, rating: 4.6, rv: 31, sold: 520,
    desc: 'Mâm zin 15 inch giá tốt để thay mâm cong, mâm bị móp. Bán lẻ từng chiếc.' },
  { id: 'cb1855', cat: 'mam', set: true, brand: 'Mâm zin', name: 'Bộ 4 mâm zin 18 inch đen bóng kèm lốp Bridgestone Alenza (tháo xe)', img: 'combo-mam-18-den-lop',
    d: 18, pcd: ['5×114,3'], j: '8,0J', et: 40, cb: '66,6', style: 'Đa chấu', finish: 'den', size: '235/55R18', price: 16900000, old: 19500000, rating: 4.8, rv: 12, sold: 38,
    desc: 'Trọn bộ 4 bánh tháo xe mới: mâm 18 inch đen bóng + 4 lốp Bridgestone Alenza 235/55R18 còn khoảng 95% gai. Giá tính cho cả bộ.' },

  // ---------- LỐP (giá / chiếc) ----------
  { id: 't1655', cat: 'lop', brand: 'Nordak', name: 'Lốp Nordak AllGrip 205/55R16 91H', img: 'lop-gai-khoi-da-dung',
    d: 16, size: '205/55R16', li: 91, sp: 'H', kind: 'Gai định hướng', year: 2026, price: 1450000, old: 1650000, rating: 4.9, rv: 341, sold: 4120, flash: { s: 44, t: 60 },
    desc: 'Gai định hướng hình mũi tên, 4 rãnh dọc thoát nước nhanh, êm và mòn đều. Cỡ phổ biến cho sedan hạng C.' },
  { id: 't1760', cat: 'lop', brand: 'Nordak', name: 'Lốp Nordak AllGrip 215/60R17 96H', img: 'lop-gai-khoi-da-dung',
    d: 17, size: '215/60R17', li: 96, sp: 'H', kind: 'Gai định hướng', year: 2026, price: 1890000, rating: 4.8, rv: 122, sold: 1350,
    desc: 'Cùng mẫu gai AllGrip, cỡ 17 inch cho crossover hạng B – C.' },
  { id: 't1565', cat: 'lop', brand: 'Solano', name: 'Lốp Solano Grip 185/65R15 88T', img: 'lop-gai-zigzag-bam-duong',
    d: 15, size: '185/65R15', li: 88, sp: 'T', kind: 'Bám đường ướt', year: 2026, price: 1150000, old: 1290000, rating: 4.7, rv: 205, sold: 2860,
    desc: 'Rãnh cắt zigzag dày, thoát nước nhanh, êm khi đi phố. Hợp sedan, MPV hạng B.' },
  { id: 't1595', cat: 'lop', brand: 'Solano', name: 'Lốp Solano Grip 195/65R15 91T', img: 'lop-gai-zigzag-bam-duong',
    d: 15, size: '195/65R15', li: 91, sp: 'T', kind: 'Bám đường ướt', year: 2025, price: 1250000, rating: 4.7, rv: 88, sold: 970,
    desc: 'Cùng mẫu gai Solano Grip, cỡ 195/65R15 cho MPV 7 chỗ và sedan hạng C đời cũ.' },

  // ---------- PHỤ KIỆN ----------
  { id: 'a-pump', cat: 'pk', brand: 'VV Care', name: 'Bơm chân ô tô có đồng hồ áp suất', img: 'bom-chan-dong-ho',
    spec: ['Đồng hồ 0–7 bar', 'Ống bện thép', 'Đầu kẹp van'], price: 390000, old: 450000, rating: 4.7, rv: 189, sold: 2470, flash: { s: 63, t: 80 },
    desc: 'Bơm chân thân thép, đồng hồ áp suất gắn liền. Để sẵn trong cốp xe, bơm bù khi lốp non hơi.' },
  { id: 'a-depth', cat: 'pk', brand: 'VV Care', name: 'Thước đo độ sâu gai lốp dạng bút', img: 'thuoc-do-gai-lop',
    spec: ['0–25 mm', 'Thân kim loại', 'Bỏ túi'], price: 120000, rating: 4.6, rv: 96, sold: 1540,
    desc: 'Đo độ sâu gai để biết khi nào cần thay lốp: dưới 1,6 mm là phải thay ngay.' }
];

VV.CREDITS = [
  { a: 'Ihsan Adityawarman', s: 'Pexels', u: 'https://www.pexels.com/photo/5661682/', l: 'Giấy phép Pexels' },
  { a: 'Austin Briones', s: 'Pexels', u: 'https://www.pexels.com/photo/36202185/', l: 'Giấy phép Pexels' },
  { a: 'Giovanni Spoletini', s: 'Pexels', u: 'https://www.pexels.com/photo/37091330/', l: 'Giấy phép Pexels' },
  { a: 'Ildar Sagdejev', s: 'Wikimedia Commons', u: 'https://commons.wikimedia.org/wiki/File:2008-05-01_Tyre.jpg', l: 'CC BY-SA 3.0' },
  { a: 'Matti Blume', s: 'Wikimedia Commons', u: 'https://commons.wikimedia.org/wiki/File:Paris_Motor_Show_2018,_Paris_(1Y7A1510).jpg', l: 'CC BY-SA 4.0' },
  { a: 'Benlisquare', s: 'Wikimedia Commons', u: 'https://commons.wikimedia.org/wiki/File:Alloy_wheels_at_the_Huawei_Flagship_Store_in_Wangfujing.jpg', l: 'CC BY-SA 4.0' },
  { a: 'Lombroso', s: 'Wikimedia Commons', u: 'https://commons.wikimedia.org/wiki/File:Studless_tire_2.jpg', l: 'Public domain' },
  { a: 'Iswoar', s: 'Wikimedia Commons', u: 'https://commons.wikimedia.org/wiki/File:Air_pumps_Druckluft_Fu%C3%9Fpumpe_Automobile_equipment_01.jpg', l: 'CC BY-SA 4.0' },
  { a: 'Simon Speed', s: 'Wikimedia Commons', u: 'https://commons.wikimedia.org/wiki/File:TyreDepthGauge.JPG', l: 'CC0' }
];

VV.SERVICES = [
  { n: 'Cân bằng động 4 bánh', d: 'Máy cân bằng điện tử, sai số dưới 1 gram – hết rung vô-lăng ở tốc độ cao.', t: '30 phút', p: '200.000₫', note: 'Miễn phí khi mua bộ mâm/lốp' },
  { n: 'Căn chỉnh thước lái 3D', d: 'Camera 3D đo camber, caster, toe; in báo cáo trước – sau.', t: '45 phút', p: '450.000₫' },
  { n: 'Thay lốp & đảo lốp', d: 'Máy ra vào lốp không chạm mặt mâm, kiểm tra van và áp suất.', t: '20 phút', p: 'từ 80.000₫' },
  { n: 'Sơn mâm đổi màu', d: 'Phun cát làm sạch, sơn tĩnh điện, phủ clear chống trầy – 12 màu.', t: '2 ngày', p: '1.800.000₫/bộ' },
  { n: 'Tiện bóng mặt kim cương', d: 'Tiện CNC mặt mâm, phủ clear 2 lớp, bảo hành bong tróc 12 tháng.', t: '3 ngày', p: '2.600.000₫/bộ' },
  { n: 'Nắn mâm cong, hàn mâm nứt', d: 'Máy nắn thủy lực, đo độ đảo bằng đồng hồ so 0,01 mm.', t: '1 ngày', p: 'từ 350.000₫' },
  { n: 'Vá lốp nấm & bơm khí nitơ', d: 'Vá trong bằng nấm lưu hoá, bơm nitơ giữ áp suất ổn định.', t: '15 phút', p: 'từ 60.000₫' },
  { n: 'Lắp đặt tận nơi', d: 'Xe dịch vụ lưu động nội thành, mang theo máy cân bằng.', t: 'Theo hẹn', p: 'Miễn phí', note: 'Đơn từ bộ 4 mâm' }
];

VV.REVIEWS = [
  { n: 'Nguyễn Văn Tuấn', car: 'Mazda3 2022', buy: 'Mâm 17 inch nan kép VV-1703', s: 5, ago: '3 ngày trước', t: 'Tư vấn đúng ET nên không cạ hốc bánh. Cân bằng xong chạy 100 km/h vô-lăng đứng im. Lắp trong khoảng 40 phút.' },
  { n: 'Phạm Thu Hà', car: 'Honda City 2021', buy: 'Lốp Nordak Comfort 205/55R16', s: 5, ago: '1 tuần trước', t: 'Đặt lịch online, đến là làm luôn. 4 lốp mới êm hơn hẳn lốp zin, phòng chờ sạch, có nước uống.' },
  { n: 'Lê Minh Khoa', car: 'Ford Ranger 2023', buy: 'Mâm 20 inch AR-2011 + lốp Kenro A/T', s: 5, ago: '2 tuần trước', t: 'Thợ lắp tận nhà, trả góp 0% 6 tháng qua thẻ nên nhẹ ví. Mâm đồng + lốp A/T nhìn rất hợp xe.' },
  { n: 'Vũ Đức Anh', car: 'Hyundai Tucson 2020', buy: 'Sơn mâm đổi màu xám titan', s: 4, ago: '3 tuần trước', t: 'Màu đều, phủ bóng đẹp. Hẹn 2 ngày nhưng gần 3 ngày mới xong, cửa hàng có gọi báo trước.' },
  { n: 'Trần Thị Linh', car: 'Kia Morning 2019', buy: 'Nắn mâm cong', s: 5, ago: '1 tháng trước', t: 'Mâm cong do sụt ổ gà, thợ nắn và cho xem đồng hồ đo độ đảo. Báo giá trước, không phát sinh.' },
  { n: 'Hoàng Quang Huy', car: 'Toyota Camry 2018', buy: 'Căn chỉnh thước lái 3D', s: 5, ago: '1 tháng trước', t: 'Có in báo cáo góc đặt bánh trước – sau, xe hết ăn lốp một bên. Sẽ quay lại thay lốp.' }
];

VV.TIPS = [
  { img: '1645445522156-9ac06bc7a767', tag: 'Kinh nghiệm', date: '02/10/2026', t: '5 dấu hiệu cần thay lốp ô tô ngay, đừng đợi đến khi nổ lốp', go: 'giai-ma-lop' },
  { img: '1611633235555-45e252fe48c8', tag: 'Tư vấn mâm', date: '28/09/2026', t: 'ET, PCD, lỗ tâm là gì? Cách chọn mâm độ không cạ hốc bánh', go: 'cau-hinh' },
  { img: '1758739956768-169833459935', tag: 'Bảo dưỡng', date: '21/09/2026', t: 'Áp suất lốp chuẩn cho sedan, SUV và bán tải – bảng tra nhanh', go: 'giai-ma-lop' },
  { img: '1782235869459-eda397b8d565', tag: 'Chăm sóc', date: '14/09/2026', t: 'Vệ sinh mâm đúc đúng cách để không bong lớp sơn clear', go: 'dich-vu' }
];

VV.BRANCHES = [
  { n: 'Vành Việt Hải Phòng', a: 'Số 468 Đường Mẫu, Q. Lê Chân, Hải Phòng', p: '0900 000 468', h: '7:30 – 18:30', note: 'Xưởng 6 cầu nâng' },
  { n: 'Vành Việt Hà Nội', a: 'Số 12 Phố Mẫu, Q. Cầu Giấy, Hà Nội', p: '0900 000 469', h: '7:30 – 19:00', note: 'Có phòng chờ' },
  { n: 'Vành Việt TP.HCM', a: 'Số 88 Đường Mẫu, TP. Thủ Đức, TP.HCM', p: '0900 000 470', h: '7:30 – 19:00', note: 'Căn chỉnh 3D' }
];

VV.LOAD = { 84: 500, 87: 545, 89: 580, 91: 615, 94: 670, 97: 730, 98: 750, 100: 800, 103: 875, 105: 925, 107: 975, 110: 1060, 112: 1120 };
VV.SPEED = { H: 210, V: 240, W: 270, Y: 300, T: 190 };
