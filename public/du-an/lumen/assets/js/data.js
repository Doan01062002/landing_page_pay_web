/* LUMEN – dữ liệu mẫu (thương hiệu minh hoạ) */
window.LUMEN_DATA = (function () {
  var U = function (id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=70';
  };

  var CATS = [
    { id: 'bi-led', name: 'Bi-LED', icon: 'c-biled', desc: 'Bi cầu LED cắt sáng' },
    { id: 'bi-laser', name: 'Bi-Laser', icon: 'c-laser', desc: 'Tia laser pha xa 1 km' },
    { id: 'bong-led', name: 'Bóng LED pha', icon: 'c-bulb', desc: 'Thay bóng cắm zin' },
    { id: 'den-gam', name: 'Đèn gầm', icon: 'c-fog', desc: 'Xuyên mưa, sương mù' },
    { id: 'ambient', name: 'Ambient', icon: 'c-ambient', desc: 'Nội thất 64 màu' },
    { id: 'led-mi', name: 'LED mí', icon: 'c-strip', desc: 'Dải sáng ban ngày' },
    { id: 'den-hau', name: 'Đèn hậu', icon: 'c-tail', desc: 'Đèn hậu độ dải liền' },
    { id: 'tro-sang', name: 'Trợ sáng', icon: 'c-bar', desc: 'Light bar, đèn tròn' },
    { id: 'cam-bien', name: 'Cảm biến', icon: 'c-sensor', desc: 'Tự bật đèn, cảm biến mưa' }
  ];

  var CARS = [
    { id: 'sedan', name: 'Sedan' },
    { id: 'suv', name: 'SUV / CUV' },
    { id: 'bantai', name: 'Bán tải' },
    { id: 'hatch', name: 'Hatchback / MPV' }
  ];

  var PRICES = [
    { id: 'p1', name: 'Dưới 2 triệu', min: 0, max: 2000000 },
    { id: 'p2', name: '2 – 5 triệu', min: 2000000, max: 5000000 },
    { id: 'p3', name: '5 – 10 triệu', min: 5000000, max: 10000000 },
    { id: 'p4', name: 'Trên 10 triệu', min: 10000000, max: Infinity }
  ];

  var ALL = ['sedan', 'suv', 'bantai', 'hatch'];

  var P = [
    { id: 'l01', cat: 'bi-led', name: 'Bi-LED Aurora X3 3.0 inch', cars: ['sedan', 'suv', 'hatch'], price: 6900000, old: 8500000, rating: 4.9, reviews: 128, img: '1616761879141-f485e5fed5df', spec: '55W · 6.000K · cắt sáng sắc nét', tag: 'Bán chạy', hot: 10,
      specs: ['Công suất 55W/bên, chip LED 3 tầng', 'Nhiệt độ màu 6.000K – trắng tinh', 'Quang thông 4.800 lm', 'Chống nước IP67, quạt tản nhiệt êm'] },
    { id: 'l02', cat: 'bi-led', name: 'Bi-LED Matrix M5 Pro', cars: ['sedan', 'suv', 'bantai'], price: 8900000, old: 10900000, rating: 4.8, reviews: 96, img: '1631856507219-d1f3465b4884', spec: '70W · 5.500K · 3 chế độ chiếu', tag: 'Mới', hot: 9,
      specs: ['Công suất 70W/bên', '3 chế độ: phố, cao tốc, sương mù', 'Quang thông 5.600 lm', 'Bảo hành 24 tháng'] },
    { id: 'l03', cat: 'bi-led', name: 'Bi-LED Compact C2 2.5 inch', cars: ['sedan', 'hatch'], price: 4650000, old: 5400000, rating: 4.7, reviews: 74, img: '1549207107-2704df6b92ab', spec: '45W · 6.000K · chóa nhỏ', hot: 6,
      specs: ['Kích thước 2.5 inch cho chóa nhỏ', 'Công suất 45W/bên', 'Quang thông 3.900 lm', 'Bảo hành 18 tháng'] },
    { id: 'l04', cat: 'bi-laser', name: 'Bi-Laser Nova L9', cars: ['sedan', 'suv', 'bantai'], price: 12900000, old: 15500000, rating: 5.0, reviews: 52, img: '1655757488255-b701f9886e92', spec: 'Laser pha 1.200 m · 6.000K', tag: 'Cao cấp', hot: 8,
      specs: ['Tia laser pha xa tới 1.200 m', 'Cos LED 60W, cắt sáng chuẩn', 'Quang thông 6.500 lm', 'Bảo hành 36 tháng'] },
    { id: 'l05', cat: 'bi-laser', name: 'Bi-Laser Titan Dual Beam', cars: ['suv', 'bantai'], price: 16500000, old: 19000000, rating: 4.9, reviews: 31, img: '1787593611002-037fe0f89611', spec: '2 tia laser · vòng halo · 36 tháng', hot: 5,
      specs: ['2 module laser độc lập', 'Vòng halo LED tích hợp', 'Quang thông 7.200 lm', 'Bảo hành 36 tháng'] },
    { id: 'l06', cat: 'bong-led', name: 'Bóng LED H4 Polar 6500K', cars: ['sedan', 'hatch', 'bantai'], price: 1250000, old: 1650000, rating: 4.7, reviews: 310, img: '1551464484-74a2f25d01a0', spec: 'Cắm zin · 60W · 6.500K', tag: 'Bán chạy', hot: 10,
      specs: ['Chân H4 cắm trực tiếp', 'Công suất 60W/cặp', 'Quang thông 3.200 lm/bóng', 'Bảo hành 12 tháng'] },
    { id: 'l07', cat: 'bong-led', name: 'Bóng LED 9005 Frost 120W', cars: ['sedan', 'suv'], price: 1490000, old: 1890000, rating: 4.8, reviews: 204, img: '1594467426116-d6736feaff3b', spec: '120W/cặp · tản nhiệt đồng', hot: 7,
      specs: ['Chân 9005/HB3', 'Tản nhiệt ống đồng + quạt', 'Quang thông 3.600 lm/bóng', 'Bảo hành 12 tháng'] },
    { id: 'l08', cat: 'bong-led', name: 'Bóng LED H11 Mini Canbus', cars: ['sedan', 'suv', 'hatch'], price: 990000, old: 1290000, rating: 4.6, reviews: 188, img: '1730742298439-6d82f9edc3c2', spec: 'Canbus chống báo lỗi · 6.000K', hot: 6,
      specs: ['Chân H11, thân ngắn', 'Canbus chống báo lỗi taplo', 'Quang thông 2.800 lm/bóng', 'Bảo hành 12 tháng'] },
    { id: 'l09', cat: 'den-gam', name: 'Đèn gầm Bi-LED 2 màu 3 inch', cars: ['sedan', 'suv', 'bantai'], price: 3200000, old: 3900000, rating: 4.8, reviews: 142, img: '1607507041354-b8d23042dc51', spec: 'Trắng / vàng 3.000K · xuyên mưa', tag: 'Hot', hot: 9,
      specs: ['2 màu: trắng 6.000K và vàng 3.000K', 'Xuyên mưa, sương mù', 'Lắp vừa hốc gầm zin', 'Bảo hành 24 tháng'] },
    { id: 'l10', cat: 'den-gam', name: 'Đèn gầm LED Fog-X vàng', cars: ['suv', 'bantai', 'hatch'], price: 1850000, old: 2300000, rating: 4.7, reviews: 88, img: '1736714859462-c02878f2877a', spec: 'Vàng 3.000K · góc rộng 120°', hot: 5,
      specs: ['Ánh sáng vàng 3.000K', 'Góc chiếu rộng 120°', 'Chống nước IP68', 'Bảo hành 12 tháng'] },
    { id: 'l11', cat: 'ambient', name: 'Ambient 64 màu – gói 18 vị trí', cars: ALL, price: 5900000, old: 7200000, rating: 4.9, reviews: 167, img: '1632655806671-a4af7ad1bcdc', spec: '18 vị trí · app + nháy nhạc', tag: 'Bán chạy', hot: 10,
      specs: ['18 vị trí: táp-lô, cửa, hốc gió, để chân', '64 màu, điều khiển app', 'Chế độ nháy theo nhạc', 'Bảo hành 24 tháng'] },
    { id: 'l12', cat: 'ambient', name: 'Ambient cửa & loa – 6 vị trí', cars: ALL, price: 2450000, old: 2900000, rating: 4.7, reviews: 93, img: '1772555429170-be39986f4d99', spec: '6 vị trí · sợi quang mảnh', hot: 6,
      specs: ['6 vị trí: 4 tapi cửa + 2 loa', 'Sợi quang mảnh 2 mm', 'Đồng bộ màu khi mở cửa', 'Bảo hành 18 tháng'] },
    { id: 'l13', cat: 'ambient', name: 'Ambient hốc gió đổi màu', cars: ['sedan', 'suv'], price: 1950000, old: 2350000, rating: 4.6, reviews: 61, img: '1773696756753-af4dcfd66eda', spec: 'Hốc gió · đổi màu theo nhiệt độ', hot: 4,
      specs: ['Vòng sáng quanh hốc gió', 'Xanh khi lạnh, đỏ khi sưởi', 'Lắp không khoan cắt', 'Bảo hành 12 tháng'] },
    { id: 'l14', cat: 'led-mi', name: 'Dải LED mí Sequential 2 màu', cars: ALL, price: 1350000, old: 1700000, rating: 4.7, reviews: 152, img: '1542282088-fe8426682b8f', spec: 'Trắng / vàng · xi-nhan chạy', hot: 8,
      specs: ['Trắng khi chạy, vàng khi xi-nhan', 'Hiệu ứng chạy đuổi Sequential', 'Dải silicon dẻo chống nước', 'Bảo hành 12 tháng'] },
    { id: 'l15', cat: 'led-mi', name: 'LED mí Halo Ring trắng-vàng', cars: ['sedan', 'suv'], price: 1750000, old: 2100000, rating: 4.8, reviews: 77, img: '1556448851-9359658faa54', spec: 'Vòng halo · 2 màu', hot: 5,
      specs: ['Vòng halo quanh bi cầu', 'Trắng / vàng 2 chế độ', 'Siêu mỏng 4 mm', 'Bảo hành 12 tháng'] },
    { id: 'l16', cat: 'den-hau', name: 'Đèn hậu LED dải liền', cars: ['sedan', 'suv'], price: 7500000, old: 8900000, rating: 4.8, reviews: 45, img: '1642002947561-2abeae21c503', spec: 'Dải liền ngang · xi-nhan động', tag: 'Mới', hot: 7,
      specs: ['Thanh LED nối liền 2 bên', 'Xi-nhan động, hiệu ứng chào', 'Giắc zin plug & play', 'Bảo hành 24 tháng'] },
    { id: 'l17', cat: 'den-hau', name: 'Đèn hậu 3 vạch Dynamic', cars: ['sedan', 'hatch'], price: 5800000, old: 6900000, rating: 4.7, reviews: 39, img: '1580014317999-e9f1936787a5', spec: '3 vạch LED · hiệu ứng chào', hot: 4,
      specs: ['Thiết kế 3 vạch LED đỏ', 'Hiệu ứng mở khoá', 'Vỏ chống nước, chống ố', 'Bảo hành 18 tháng'] },
    { id: 'l18', cat: 'tro-sang', name: 'Light bar 32 inch Combo', cars: ['bantai', 'suv'], price: 3600000, old: 4400000, rating: 4.8, reviews: 66, img: '1636364905411-0770892248c4', spec: '180W · spot + flood', hot: 6,
      specs: ['Công suất 180W', 'Kết hợp tia xa và toả rộng', 'Vỏ nhôm đúc IP68', 'Bảo hành 18 tháng'] },
    { id: 'l19', cat: 'tro-sang', name: 'Đèn trợ sáng tròn 7 inch', cars: ['bantai', 'suv'], price: 2800000, old: 3300000, rating: 4.7, reviews: 58, img: '1636138103588-ae927bfe10aa', spec: '2 màu · gắn cản / nóc', hot: 5,
      specs: ['Đèn tròn 7 inch, 2 màu', 'Gắn cản trước hoặc baga nóc', 'Kèm relay & công tắc', 'Bảo hành 12 tháng'] },
    { id: 'l20', cat: 'cam-bien', name: 'Cảm biến bật đèn tự động', cars: ALL, price: 690000, old: 890000, rating: 4.6, reviews: 121, img: '1628541512930-cca6bcc29eef', spec: 'Tự bật khi vào hầm, trời tối', hot: 7,
      specs: ['Tự bật đèn khi trời tối / vào hầm', 'Độ trễ tuỳ chỉnh 2–10 giây', 'Gắn kín dưới kính lái', 'Bảo hành 12 tháng'] },
    { id: 'l21', cat: 'cam-bien', name: 'Cảm biến mưa – ánh sáng 2in1', cars: ['sedan', 'suv', 'hatch'], price: 1150000, old: 1450000, rating: 4.7, reviews: 47, img: null, spec: 'Gạt mưa + đèn tự động', hot: 4,
      specs: ['Tự gạt mưa theo cường độ', 'Tự bật đèn khi trời tối', 'Hộp điều khiển riêng', 'Bảo hành 12 tháng'] }
  ];

  var SPEC = [
    { name: 'Halogen zin', note: 'Bóng sợi đốt', lm: 1000, k: 3200, life: 500, war: 6, tone: 'amber' },
    { name: 'Bóng LED', note: 'Thay bóng cắm zin', lm: 3200, k: 6000, life: 30000, war: 12, tone: 'cyan' },
    { name: 'Bi-LED', note: 'Bi cầu thấu kính', lm: 4800, k: 6000, life: 50000, war: 24, tone: 'cyan', best: true },
    { name: 'Bi-Laser', note: 'LED + module laser', lm: 6500, k: 6000, life: 60000, war: 36, tone: 'cyan' }
  ];

  var GALLERY = [
    { id: '1598586958772-8bf368215c2a', t: 'Sedan hạng D', d: 'Bi-LED + vòng halo đỏ' },
    { id: '1762077656314-a88615be0596', t: 'Crossover đô thị', d: 'Đèn hậu LED dải liền' },
    { id: '1720929633046-f171051f30ac', t: 'Sedan hạng sang', d: 'Ambient loa & cửa xanh băng' },
    { id: '1578245600656-e8fe67a2b5f7', t: 'Coupe 2 cửa', d: 'Bi-Laser Nova L9' },
    { id: '1675319003337-e802a671e105', t: 'SUV off-road', d: 'Light bar 32 inch + đèn gầm' },
    { id: '1775882117283-2b2fc891b3fb', t: 'Xe thể thao', d: 'LED bậc cửa + ambient' },
    { id: '1608412217711-ab7d42cf7920', t: 'Sedan hạng C', d: 'LED mí Sequential' },
    { id: '1518438223361-dde09dbeed6a', t: 'Hatchback', d: 'Đèn hậu 3 vạch Dynamic' },
    { id: '1676288176903-a68732722cce', t: 'SUV 7 chỗ', d: 'Bi-LED Matrix M5 Pro' },
    { id: '1774751114258-9ce8c37d9711', t: 'Xe thể thao', d: 'Dải LED mí trắng' }
  ];

  var REVIEWS = [
    { n: 'Anh Hoàng', car: 'Sedan hạng C', r: 5, t: 'Đi đèo Hải Vân ban đêm khác hẳn, đường cắt sáng gọn, xe ngược chiều không nháy pha nữa. Làm 3 tiếng là xong.' },
    { n: 'Chị Mai', car: 'SUV 7 chỗ', r: 5, t: 'Ambient 64 màu đẹp hơn mong đợi, dây đi ẩn hoàn toàn. Mấy đứa nhỏ thích nhất chế độ nháy theo nhạc.' },
    { n: 'Anh Bảo', car: 'Bán tải', r: 5, t: 'Light bar với đèn gầm vàng chạy mưa đường rừng rất yên tâm. Tư vấn kỹ, không ép mua gói đắt.' },
    { n: 'Anh Quân', car: 'Hatchback', r: 4, t: 'Bóng LED H4 cắm zin, sáng gấp 3 lần. Trừ 1 sao vì phải chờ 20 phút do đông khách cuối tuần.' },
    { n: 'Chị Thảo', car: 'Crossover', r: 5, t: 'Thích nhất là bảo hành điện tử, tra bằng số điện thoại, khỏi giữ phiếu. Đèn hậu dải liền nhìn sang hẳn.' },
    { n: 'Anh Đức', car: 'Sedan hạng D', r: 5, t: 'Bi-laser pha xa thật sự, đường quốc lộ không đèn vẫn thấy rõ biển báo từ xa. Đáng tiền.' },
    { n: 'Anh Tuấn', car: 'MPV 7 chỗ', r: 5, t: 'Đặt lịch online rồi tới lắp luôn buổi tối, test đèn trong bóng tối thật nên rất dễ so sánh trước sau.' }
  ];

  var WARRANTY = {
    '0905000301': { name: 'Nguyễn V. H***', car: 'Sedan hạng C', pack: 'Bi-LED Aurora X3 3.0 inch + LED mí Sequential', date: '12/03/2026', exp: '12/03/2028', ok: true, pct: 72 },
    '0935000302': { name: 'Trần T. M***', car: 'SUV 7 chỗ', pack: 'Ambient 64 màu – gói 18 vị trí', date: '05/11/2025', exp: '05/11/2027', ok: true, pct: 56 },
    '0779000303': { name: 'Lê Q. B***', car: 'Bán tải', pack: 'Light bar 32 inch Combo + Đèn gầm Fog-X', date: '20/06/2024', exp: '20/06/2026', ok: false, pct: 0 }
  };

  var SWATCHES = [
    { c: '#2ee6ff', n: 'Xanh băng' }, { c: '#3d7bff', n: 'Xanh đêm' }, { c: '#8b5cff', n: 'Tím ánh trăng' },
    { c: '#ff4fd8', n: 'Hồng neon' }, { c: '#ff3b5c', n: 'Đỏ thể thao' }, { c: '#ff8a1f', n: 'Cam hoàng hôn' },
    { c: '#ffb020', n: 'Hổ phách' }, { c: '#f5e663', n: 'Vàng chanh' }, { c: '#3dff9a', n: 'Xanh ngọc' },
    { c: '#00c2a8', n: 'Xanh biển' }, { c: '#ffffff', n: 'Trắng tinh' }, { c: '#ffd9b0', n: 'Trắng ấm' }
  ];

  return { U: U, CATS: CATS, CARS: CARS, PRICES: PRICES, PRODUCTS: P, SPEC: SPEC, GALLERY: GALLERY, REVIEWS: REVIEWS, WARRANTY: WARRANTY, SWATCHES: SWATCHES };
})();
