/* VÀNH VIỆT – dữ liệu mẫu (thương hiệu minh hoạ) */
window.VV = window.VV || {};

VV.U = function (id, w, h) {
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
  bac:   { name: 'Bạc',        add: 0,      sw: 'linear-gradient(135deg,#f4f5f7,#aeb3b9 55%,#e3e5e8)' },
  den:   { name: 'Đen bóng',   add: 100000, sw: 'linear-gradient(135deg,#55585e,#141518 55%,#2c2e32)' },
  titan: { name: 'Xám titan',  add: 150000, sw: 'linear-gradient(135deg,#9aa0a7,#53585e 55%,#7b8188)' },
  dong:  { name: 'Đồng',       add: 250000, sw: 'linear-gradient(135deg,#e0b273,#8d5f27 55%,#c18d4a)' }
};

/* Giá mâm / chiếc theo đường kính (trước hệ số kiểu nan) */
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

VV.PRODUCTS = [
  // ---------- MÂM ĐÚC ----------
  { id: 'w15f', cat: 'mam', name: 'Mâm đúc 15 inch 5 chấu VV-15F', d: 15, design: 'five', finish: 'bac', pcd: '4×100', spec: '6,0J · ET40 · 4×100', price: 1450000, old: 1690000, rating: 4.8, rv: 126, flash: true,
    desc: 'Thiết kế 5 chấu cổ điển, nhẹ và dễ vệ sinh. Phù hợp sedan, hatchback cỡ nhỏ đi phố hằng ngày.' },
  { id: 'w16d', cat: 'mam', name: 'Mâm đúc 16 inch nan kép VV-16D', d: 16, design: 'double', finish: 'titan', pcd: '4×100 / 5×114,3', spec: '7,0J · ET42 · 2 chuẩn lỗ', price: 1950000, old: 2290000, rating: 4.9, rv: 212,
    desc: '5 cặp nan kép thanh mảnh, sơn xám titan mờ. Tạo cảm giác xe thể thao mà vẫn giữ độ êm của lốp 55.' },
  { id: 'w17d', cat: 'mam', name: 'Mâm đúc 17 inch nan kép VV-17D', d: 17, design: 'double', finish: 'den', pcd: '5×114,3', spec: '7,5J · ET40 · 5×114,3', price: 2450000, old: 2850000, rating: 4.9, rv: 318, flash: true,
    desc: 'Mẫu bán chạy nhất: nan kép sơn đen bóng, phủ clear chống trầy. Hợp sedan hạng C, crossover cỡ nhỏ.' },
  { id: 'w17m', cat: 'mam', name: 'Mâm đúc 17 inch lưới đa chấu VV-17M', d: 17, design: 'mesh', finish: 'bac', pcd: '5×114,3', spec: '7,5J · ET45 · 5×114,3', price: 2590000, rating: 4.7, rv: 94,
    desc: 'Kiểu lưới đa chấu lấy cảm hứng xe đua, nhiều mặt cắt bắt sáng. Bạc sáng dễ phối với mọi màu sơn.' },
  { id: 'w18t', cat: 'mam', name: 'Mâm đúc 18 inch nan xoáy VV-18T', d: 18, design: 'turbine', finish: 'titan', pcd: '5×114,3', spec: '8,0J · ET40 · 5×114,3', price: 3150000, old: 3590000, rating: 4.8, rv: 167, flash: true,
    desc: '10 nan xoáy dạng tua-bin, nhìn như đang quay kể cả khi xe đứng yên. Xám titan sang trọng.' },
  { id: 'w18y', cat: 'mam', name: 'Mâm đúc 18 inch chấu chữ Y VV-18Y', d: 18, design: 'yspoke', finish: 'dong', pcd: '5×114,3', spec: '8,0J · ET38 · 5×114,3', price: 3290000, rating: 4.9, rv: 88,
    desc: 'Chấu chữ Y màu đồng – điểm nhấn nổi bật cho xe màu trắng, đen, xám. Đúc áp suất thấp, xử lý nhiệt T6.' },
  { id: 'w19f', cat: 'mam', name: 'Mâm đúc 19 inch 5 chấu thể thao VV-19F', d: 19, design: 'five', finish: 'den', pcd: '5×114,3', spec: '8,5J · ET35 · 5×114,3', price: 3850000, old: 4390000, rating: 4.8, rv: 73,
    desc: 'Chấu bản to, mặt lõm sâu cho SUV và sedan cỡ D. Sơn đen bóng 3 lớp, viền lip vát kim cương.' },
  { id: 'w19a', cat: 'mam', name: 'Mâm đúc 19 inch đĩa khí động VV-19A', d: 19, design: 'aero', finish: 'bac', pcd: '5×114,3', spec: '8,0J · ET40 · 5×114,3', price: 3990000, rating: 4.6, rv: 41,
    desc: 'Mặt đĩa kín giảm cản gió, hợp xe hybrid – xe điện. Thiết kế tối giản, dễ lau rửa.' },
  { id: 'w20m', cat: 'mam', name: 'Mâm đúc 20 inch lưới SUV VV-20M', d: 20, design: 'mesh', finish: 'dong', pcd: '6×139,7', spec: '9,0J · ET20 · 6×139,7', price: 4690000, old: 5200000, rating: 4.9, rv: 59, flash: true,
    desc: 'Lưới đa chấu cỡ lớn cho bán tải, SUV khung rời. Tải trọng 950 kg/chiếc, màu đồng cá tính.' },
  { id: 'w20d', cat: 'mam', name: 'Mâm đúc 20 inch nan kép SUV VV-20D', d: 20, design: 'double', finish: 'titan', pcd: '5×114,3', spec: '8,5J · ET40 · 5×114,3', price: 4590000, rating: 4.7, rv: 36,
    desc: 'Nan kép cao cấp cho SUV 7 chỗ, xám titan phủ ceramic. Kèm nắp chụp và van mới.' },
  // ---------- LỐP ----------
  { id: 't15e', cat: 'lop', name: 'Lốp 185/60R15 tiết kiệm VV Eco', d: 15, size: '185/60R15 84H', line: 'VV ECO', accent: '#4caf6a', spec: 'Lực cản lăn thấp · ồn 68 dB', price: 1150000, old: 1290000, rating: 4.7, rv: 205,
    desc: 'Hợp chất silica giảm lực cản lăn, tiết kiệm nhiên liệu cho xe đô thị cỡ nhỏ.' },
  { id: 't16c', cat: 'lop', name: 'Lốp 205/55R16 êm ái VV Comfort', d: 16, size: '205/55R16 91V', line: 'VV COMFORT', accent: '#ffcc00', spec: 'Êm · ồn 67 dB · bám đường ướt A', price: 1450000, old: 1650000, rating: 4.9, rv: 341, flash: true,
    desc: 'Gai lốp bất đối xứng, lớp đệm giảm ồn. Lựa chọn phổ biến nhất cho sedan hạng C.' },
  { id: 't17s', cat: 'lop', name: 'Lốp 215/45R17 thể thao VV Sport', d: 17, size: '215/45R17 91W', line: 'VV SPORT', accent: '#e8432f', spec: 'Vai lốp cứng · chỉ số W 270 km/h', price: 1890000, rating: 4.8, rv: 122,
    desc: 'Vai lốp cứng vững khi vào cua, rãnh dọc thoát nước nhanh. Hợp mâm 17 inch độ.' },
  { id: 't18p', cat: 'lop', name: 'Lốp 225/40R18 hiệu suất cao VV Sport+', d: 18, size: '225/40R18 92Y', line: 'VV SPORT+', accent: '#e8432f', spec: 'Hiệu suất cao · chỉ số Y 300 km/h', price: 2390000, old: 2690000, rating: 4.8, rv: 64,
    desc: 'Lốp thành mỏng cho mâm 18 inch, phản hồi tay lái sắc nét, phanh ngắn trên đường khô.' },
  { id: 't19t', cat: 'lop', name: 'Lốp 235/55R19 SUV đường trường VV Touring', d: 19, size: '235/55R19 105V', line: 'VV TOURING', accent: '#3b82c4', spec: 'Êm, bền · bảo hành 60.000 km', price: 2950000, rating: 4.7, rv: 58,
    desc: 'Dành cho SUV cỡ trung đi đường dài: êm, mòn đều, chịu tải tốt khi chở đủ 7 người.' },
  { id: 't18a', cat: 'lop', name: 'Lốp 265/60R18 địa hình VV Terra A/T', d: 18, size: '265/60R18 110T', line: 'VV TERRA A/T', accent: '#f08a24', spec: 'Gai A/T · đi phố & đường đất', price: 2790000, old: 3150000, rating: 4.8, rv: 97,
    desc: 'Gai bản to tự làm sạch bùn đất, hông lốp gia cường chống cắt. Cho bán tải, SUV khung rời.' },
  // ---------- PHỤ KIỆN ----------
  { id: 'a-lug', cat: 'pk', art: 'lug', name: 'Bộ 20 ốc mâm khoá chống trộm', spec: 'Thép hợp kim · ren M12×1,5 · kèm khoá', price: 650000, old: 790000, rating: 4.8, rv: 143,
    desc: 'Ốc mâm thép rèn mạ crôm, 4 ốc khoá đầu hoa văn riêng chống tháo trộm. Có loại M12×1,25 / M14×1,5.' },
  { id: 'a-cap', cat: 'pk', art: 'cap', name: 'Bộ 4 nắp chụp mâm VV 60 mm', spec: 'Nhựa ABS phủ nhôm · ngàm 56 mm', price: 290000, rating: 4.6, rv: 77,
    desc: 'Nắp chụp tâm mâm logo VV, bắt khít mâm VV mọi đường kính. Màu đen bóng chữ vàng.' },
  { id: 'a-tpms', cat: 'pk', art: 'tpms', name: 'Cảm biến áp suất lốp – bộ 4 van', spec: 'Màn hình màu · pin năng lượng mặt trời', price: 1590000, old: 1890000, rating: 4.7, rv: 189, flash: true,
    desc: 'Cảnh báo non hơi, nhiệt độ cao theo thời gian thực. Van gắn trong, lắp miễn phí khi mua kèm lốp.' },
  { id: 'a-valve', cat: 'pk', art: 'valve', name: 'Bộ 4 van lốp nhôm có nắp', spec: 'Nhôm anod hoá · gioăng cao su EPDM', price: 180000, rating: 4.5, rv: 52,
    desc: 'Van không săm bằng nhôm anod màu vàng tín hiệu, chống rỉ, kín hơi tốt hơn van cao su.' }
];

VV.SERVICES = [
  { n: 'Cân bằng động 4 bánh', d: 'Máy cân bằng điện tử, sai số dưới 1 gram – hết rung vô-lăng ở tốc độ cao.', t: '30 phút', p: '200.000₫', note: 'Miễn phí khi mua bộ mâm' },
  { n: 'Căn chỉnh thước lái 3D', d: 'Camera 3D đo góc camber, caster, toe; in báo cáo trước – sau.', t: '45 phút', p: '450.000₫' },
  { n: 'Thay lốp & đảo lốp', d: 'Máy ra vào lốp không chạm mặt mâm, kiểm tra van và áp suất.', t: '20 phút', p: 'từ 80.000₫' },
  { n: 'Sơn mâm đổi màu', d: 'Phun cát làm sạch, sơn tĩnh điện, phủ clear chống trầy – 12 màu.', t: '2 ngày', p: '1.800.000₫/bộ' },
  { n: 'Mạ crôm & tiện bóng mặt mâm', d: 'Tiện CNC mặt kim cương hoặc mạ crôm 3 lớp, bảo hành bong tróc 12 tháng.', t: '3 ngày', p: '2.600.000₫/bộ' },
  { n: 'Nắn mâm cong, hàn mâm nứt', d: 'Máy nắn thủy lực, kiểm tra độ đảo bằng đồng hồ so 0,01 mm.', t: '1 ngày', p: 'từ 350.000₫' },
  { n: 'Vá lốp nấm & bơm khí nitơ', d: 'Vá trong bằng nấm lưu hoá, bơm nitơ giữ áp suất ổn định lâu hơn.', t: '15 phút', p: 'từ 60.000₫' },
  { n: 'Lắp đặt tận nơi', d: 'Xe dịch vụ lưu động trong nội thành, mang theo máy cân bằng.', t: 'Theo hẹn', p: 'Miễn phí', note: 'Áp dụng đơn từ bộ 4 mâm' }
];

VV.GALLERY = [
  { id: '1502877338535-766e1452684a', t: 'Coupe xanh dương', s: 'Mâm 18″ nan kép · bạc' },
  { id: '1550355291-bbee04a92027', t: 'Hatchback đỏ', s: 'Mâm 18″ xám titan · lốp Sport+' },
  { id: '1580273916550-e323be2ae537', t: 'Coupe xám xi-măng', s: 'Mâm 19″ 5 chấu · đen bóng' },
  { id: '1601362840469-51e4d8d58785', t: 'Sedan hạng sang', s: 'Mâm 20″ nan kép · xám titan' },
  { id: '1616455579100-2ceaa4eb2d37', t: 'Sedan trắng', s: 'Mâm 19″ nan xoáy · đen bóng' },
  { id: '1618843479313-40f8afb4b4d8', t: 'Xe thể thao 2 cửa', s: 'Mâm 20″ lưới · đồng' },
  { id: '1626668893632-6f3a4466d22f', t: 'Muscle car tối màu', s: 'Mâm 20″ 5 chấu · đen bóng' },
  { id: '1617531653332-bd46c24f2068', t: 'Coupe đỏ', s: 'Mâm 19″ chấu Y · đen bóng' }
];

VV.REVIEWS = [
  { n: 'Anh Tuấn N.', car: 'Mazda3 · Lê Chân', s: 5, t: 'Lên bộ VV-17D đen bóng, tư vấn đúng ET nên không cạ hốc bánh. Cân bằng xong chạy 100 km/h vô-lăng đứng im.' },
  { n: 'Chị Hà P.', car: 'Honda City · Ngô Quyền', s: 5, t: 'Đặt lịch online, đến là làm luôn, 40 phút xong 4 lốp Comfort. Xe êm hơn hẳn, phòng chờ sạch sẽ có cà phê.' },
  { n: 'Anh Khoa L.', car: 'Ford Ranger · Thuỷ Nguyên', s: 5, t: 'Mâm 20 inch lưới đồng + lốp A/T nhìn cực ngầu. Thợ lắp tận nhà, trả góp 0% 6 tháng nên nhẹ ví.' },
  { n: 'Anh Đức V.', car: 'Hyundai Tucson · Hồng Bàng', s: 4, t: 'Sơn lại mâm zin sang xám titan, màu đều, phủ bóng đẹp. Hẹn 2 ngày thì 2 ngày rưỡi mới xong, còn lại ổn.' },
  { n: 'Chị Linh T.', car: 'Kia Morning · Kiến An', s: 5, t: 'Mâm bị cong do sụt ổ gà, anh thợ nắn và đo độ đảo cho xem tận mắt. Giá rõ ràng từ đầu, không phát sinh.' },
  { n: 'Anh Quang H.', car: 'Toyota Camry · Dương Kinh', s: 5, t: 'Căn chỉnh thước lái 3D có in báo cáo trước sau, xe hết ăn lốp một bên. Sẽ quay lại thay lốp ở đây.' }
];

VV.LOAD = { 84: 500, 87: 545, 89: 580, 91: 615, 94: 670, 97: 730, 100: 800, 103: 875, 105: 925, 107: 975, 110: 1060, 112: 1120 };
VV.SPEED = { H: 210, V: 240, W: 270, Y: 300, T: 190 };
