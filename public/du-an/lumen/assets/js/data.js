/* Lumen – dữ liệu mẫu (cửa hàng minh hoạ, không phải thương hiệu thật) */
window.LUMEN_DATA = (function () {
  'use strict';
  var U = function (id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=70';
  };

  var IMG = 'assets/img/products/';

  var CATS = [
    { id: 'bong-led', name: 'Bóng LED', full: 'Bóng LED ô tô', icon: 'c-bulb',
      groups: [['Chân bóng', ['H4', 'T10', '1156']], ['Vị trí lắp', ['Đèn pha – cos', 'Xi-nhan, phanh', 'Demi, biển số']]] },
    { id: 'bong-halogen', name: 'Halogen', full: 'Halogen tăng sáng', icon: 'c-bulb',
      groups: [['Chân bóng', ['H4', 'HB4']], ['Công suất', ['55W', '60/55W']]] },
    { id: 'xenon', name: 'Xenon', full: 'Bóng xenon HID', icon: 'c-laser',
      groups: [['Chân bóng', ['D2S']], ['Nhiệt độ màu', ['6.000K']]] },
    { id: 'den-pha', name: 'Đèn pha', full: 'Phục hồi đèn pha', icon: 'c-biled',
      groups: [['Dịch vụ', ['Phục hồi chóa ố vàng', 'Phủ nano chống UV']]] },
    { id: 'den-phu', name: 'Đèn phụ', full: 'Đèn phụ, đèn rọi', icon: 'c-fog',
      groups: [['Loại đèn', ['Đèn LED rọi 12V']], ['Gắn cho', ['Bán tải', 'SUV']]] },
    { id: 'led-day', name: 'LED dây', full: 'LED dây, ambient', icon: 'c-strip',
      groups: [['Loại', ['LED dây 2835', 'Tuỳ chọn bộ nguồn 12V']]] },
    { id: 'cam-bien', name: 'Cảm biến', full: 'Cảm biến đèn, mưa', icon: 'c-sensor',
      groups: [['Loại', ['Cảm biến mưa', 'Ánh sáng 2in1']]] }
  ];
  /* gói dịch vụ lắp đặt (không bán lẻ – đặt lịch tư vấn) */
  var SERVICES = [
    { name: 'Độ Bi-LED / Bi-Laser', href: '#so-sanh', icon: 'c-biled' },
    { name: 'Ambient 64 màu', href: '#ambient', icon: 'c-ambient' }
  ];

  var TYPES = [
    { id: 'sedan', name: 'Sedan' },
    { id: 'suv', name: 'SUV / CUV' },
    { id: 'bantai', name: 'Bán tải' },
    { id: 'hatch', name: 'Hatchback / MPV' }
  ];

  var PRICES = [
    { id: 'p1', name: 'Dưới 300.000₫', min: 0, max: 300000 },
    { id: 'p2', name: 'Từ 300.000 – 1 triệu', min: 300000, max: 1000000 },
    { id: 'p3', name: 'Trên 1 triệu', min: 1000000, max: Infinity }
  ];

  /* hãng → dòng xe → đời (dùng để gợi ý, kỹ thuật viên kiểm tra thực tế khi lắp) */
  var CARS = [
    { brand: 'Toyota', models: [
      { m: 'Vios', t: 'sedan', y: ['2014 – 2017', '2018 – 2022', '2023 – nay'] },
      { m: 'Corolla Cross', t: 'suv', y: ['2020 – 2023', '2024 – nay'] },
      { m: 'Fortuner', t: 'suv', y: ['2017 – 2020', '2021 – nay'] },
      { m: 'Innova', t: 'hatch', y: ['2016 – 2022', '2023 – nay'] },
      { m: 'Hilux', t: 'bantai', y: ['2015 – 2020', '2021 – nay'] }] },
    { brand: 'Hyundai', models: [
      { m: 'Accent', t: 'sedan', y: ['2018 – 2020', '2021 – nay'] },
      { m: 'Grand i10', t: 'hatch', y: ['2017 – 2020', '2021 – nay'] },
      { m: 'Creta', t: 'suv', y: ['2022 – nay'] },
      { m: 'Tucson', t: 'suv', y: ['2019 – 2021', '2022 – nay'] },
      { m: 'Santa Fe', t: 'suv', y: ['2019 – 2023', '2024 – nay'] }] },
    { brand: 'Kia', models: [
      { m: 'Morning', t: 'hatch', y: ['2015 – 2020', '2021 – nay'] },
      { m: 'K3', t: 'sedan', y: ['2019 – 2021', '2022 – nay'] },
      { m: 'Seltos', t: 'suv', y: ['2020 – 2023', '2024 – nay'] },
      { m: 'Carnival', t: 'hatch', y: ['2021 – nay'] }] },
    { brand: 'Mazda', models: [
      { m: 'Mazda2', t: 'hatch', y: ['2015 – 2019', '2020 – nay'] },
      { m: 'Mazda3', t: 'sedan', y: ['2015 – 2019', '2020 – nay'] },
      { m: 'CX-5', t: 'suv', y: ['2018 – 2022', '2023 – nay'] },
      { m: 'BT-50', t: 'bantai', y: ['2016 – 2020', '2021 – nay'] }] },
    { brand: 'Honda', models: [
      { m: 'City', t: 'sedan', y: ['2017 – 2020', '2021 – nay'] },
      { m: 'Civic', t: 'sedan', y: ['2017 – 2021', '2022 – nay'] },
      { m: 'HR-V', t: 'suv', y: ['2019 – 2021', '2022 – nay'] },
      { m: 'CR-V', t: 'suv', y: ['2018 – 2023', '2024 – nay'] }] },
    { brand: 'Ford', models: [
      { m: 'Ranger', t: 'bantai', y: ['2015 – 2022', '2023 – nay'] },
      { m: 'Everest', t: 'suv', y: ['2018 – 2022', '2023 – nay'] },
      { m: 'Territory', t: 'suv', y: ['2023 – nay'] }] },
    { brand: 'Mitsubishi', models: [
      { m: 'Attrage', t: 'sedan', y: ['2016 – 2019', '2020 – nay'] },
      { m: 'Xpander', t: 'hatch', y: ['2018 – 2021', '2022 – nay'] },
      { m: 'Triton', t: 'bantai', y: ['2015 – 2023', '2024 – nay'] }] },
    { brand: 'VinFast', models: [
      { m: 'Fadil', t: 'hatch', y: ['2019 – 2022'] },
      { m: 'Lux A2.0', t: 'sedan', y: ['2019 – 2022'] },
      { m: 'VF 5', t: 'suv', y: ['2023 – nay'] }] }
  ];
  var POPULAR_CARS = [['Toyota', 'Vios'], ['Hyundai', 'Accent'], ['Mazda', 'CX-5'], ['Ford', 'Ranger'], ['Mitsubishi', 'Xpander'], ['Honda', 'City'], ['Kia', 'Seltos']];

  var ALL = ['sedan', 'suv', 'bantai', 'hatch'];

  /* sold = số xe đã lắp; gift = quà tặng; inst = trả góp 0%; src = nguồn ảnh (giấy phép tự do) */
  var P = [
    { id: 'p01', cat: 'bong-led', brand: 'Lumen', name: 'Bóng LED H4 tản nhiệt nhôm 6.000K (cặp)', cars: ['sedan', 'hatch', 'bantai'], price: 1250000, old: 1650000, rating: 4.8, reviews: 312, sold: 3120, img: 'bong-led-h4.webp', gift: 'Lắp miễn phí tại xưởng + căn chỉnh góc chiếu', hot: 10, flash: { left: 12, total: 40 },
      specs: ['Chân H4 cắm trực tiếp, không cắt dây zin', 'Chip LED 2 mặt, điểm sáng gần vị trí sợi đốt', 'Tản nhiệt nhôm cánh tản, dây nguồn dẹt', 'Bảo hành 12 tháng, 1 đổi 1 trong 30 ngày'] },
    { id: 'p02', cat: 'bong-led', brand: 'Lumen', name: 'Bóng LED T10 W5W 9 SMD – demi, biển số (cặp)', cars: ['sedan', 'suv', 'bantai', 'hatch'], price: 120000, old: 180000, rating: 4.7, reviews: 486, sold: 5240, img: 'bong-led-t10-w5w.webp', gift: 'Mua 2 cặp tặng 1 cặp', hot: 8, flash: { left: 25, total: 60 },
      specs: ['Chân T10 / W5W cắm thay bóng zin', '9 chip SMD, ánh sáng trắng', 'Dùng cho demi, biển số, đèn trần', 'Bảo hành 6 tháng'] },
    { id: 'p03', cat: 'bong-led', brand: 'Lumen', name: 'Bộ bóng LED xi-nhan, phanh, demi (4 loại)', cars: ['sedan', 'suv', 'bantai', 'hatch'], price: 450000, old: 590000, rating: 4.6, reviews: 174, sold: 1380, img: 'bo-bong-led-xi-nhan.webp', gift: 'Tặng điện trở chống chớp nhanh', hot: 7, flash: { left: 8, total: 30 },
      specs: ['1 bóng 1156 chip cam cho xi-nhan', '1 bóng T10 trắng 9 chip, 1 bóng T10 đỏ', '1 bóng T10 4 chip cho đèn trần', 'Bảo hành 6 tháng'] },
    { id: 'p04', cat: 'bong-halogen', brand: 'Lumen', name: 'Bóng halogen H4 60/55W tăng sáng (cặp)', cars: ['sedan', 'hatch', 'bantai'], price: 390000, old: 490000, rating: 4.6, reviews: 205, sold: 2210, img: 'bong-halogen-h4.webp', gift: 'Lắp miễn phí trong 15 phút', hot: 6,
      specs: ['Chân H4, 2 tóc pha – cos', 'Công suất 60/55W, đúng chuẩn zin', 'Ánh sáng vàng trắng 3.200K, xuyên mưa tốt', 'Bảo hành 6 tháng'] },
    { id: 'p05', cat: 'bong-halogen', brand: 'Lumen', name: 'Bóng halogen HB4 9006 55W (cặp)', cars: ['sedan', 'suv'], price: 350000, old: 450000, rating: 4.5, reviews: 98, sold: 860, img: 'bong-halogen-hb4.webp', gift: 'Lắp miễn phí trong 15 phút', hot: 4,
      specs: ['Chân HB4 / 9006, dùng cho cos hoặc gầm', 'Công suất 55W', 'Ánh sáng 3.200K', 'Bảo hành 6 tháng'] },
    { id: 'p06', cat: 'xenon', brand: 'Lumen', name: 'Bóng xenon D2S 35W 6.000K (cặp)', cars: ['sedan', 'suv'], price: 1450000, old: 1850000, rating: 4.8, reviews: 121, sold: 640, img: 'bong-xenon-d2s.webp', gift: 'Tặng kiểm tra ballast miễn phí', inst: true, hot: 9, flash: { left: 4, total: 15 },
      specs: ['Chân D2S thay cho xe zin xenon', 'Công suất 35W, 6.000K trắng', 'Khởi động ổn định, không chớp', 'Bảo hành 12 tháng'] },
    { id: 'p07', cat: 'den-pha', brand: 'Lumen', name: 'Phục hồi cụm đèn pha ố vàng, mờ đục (cặp)', cars: ['sedan', 'suv', 'bantai', 'hatch'], price: 890000, old: 1200000, rating: 4.9, reviews: 263, sold: 1940, img: 'phuc-hoi-den-pha.webp', gift: 'Phủ nano chống UV, bảo hành 12 tháng', hot: 10, flash: { left: 6, total: 20 },
      specs: ['Đánh bóng 3 cấp, tẩy lớp ố vàng', 'Phủ nano chống tia UV', 'Làm trong 60 – 90 phút', 'Bảo hành độ trong 12 tháng'] },
    { id: 'p08', cat: 'den-phu', brand: 'Lumen', name: 'Đèn LED rọi tròn 9 bóng 12V', cars: ['bantai', 'suv'], price: 690000, old: 850000, rating: 4.6, reviews: 57, sold: 410, img: 'den-led-roi-9-bong.webp', gift: 'Tặng relay + công tắc', hot: 5,
      specs: ['9 LED, ánh sáng trắng ấm', 'Điện áp 12V, vỏ nhựa chịu nhiệt', 'Gắn thùng bán tải, khoang hành lý', 'Bảo hành 12 tháng'] },
    { id: 'p09', cat: 'led-day', brand: 'Lumen', name: 'LED dây 2835 12V trắng ấm – cuộn 5 m', cars: ['sedan', 'suv', 'bantai', 'hatch'], price: 260000, old: 350000, rating: 4.5, reviews: 142, sold: 1650, img: 'led-day-2835.webp', gift: 'Tặng 2 đầu nối nhanh', hot: 6,
      opts: [{ id: 'p09', label: 'Chỉ cuộn LED 5 m' }, { id: 'p09n', label: '+ bộ nguồn 12V', add: 150000 }],
      specs: ['Chip 2835, 120 LED/m', 'Điện áp 12V, cắt được mỗi 3 LED', 'Băng keo 3M mặt sau', 'Tuỳ chọn thêm bộ nguồn 12V: +150.000₫', 'Bảo hành 6 tháng'] },
    { id: 'p11', cat: 'cam-bien', brand: 'Lumen', name: 'Cảm biến mưa – ánh sáng 2in1 (module)', cars: ['sedan', 'suv', 'hatch'], price: 1150000, old: 1450000, rating: 4.7, reviews: 47, sold: 302, img: 'cam-bien-mua-anh-sang.webp', gift: 'Lắp miễn phí tại xưởng', inst: true, hot: 4,
      specs: ['Tự gạt mưa theo cường độ', 'Tự bật đèn khi trời tối, vào hầm', 'Gắn sau gương chiếu hậu', 'Bảo hành 12 tháng'] }
  ];
  P.forEach(function (p) { p.img = IMG + p.img; });
  /* biến thể (không hiển thị riêng trong danh sách, chỉ chọn trong trang chi tiết) */
  var VARIANTS = [
    { id: 'p09n', parent: 'p09', cat: 'led-day', brand: 'Lumen', name: 'LED dây 2835 12V trắng ấm – cuộn 5 m + bộ nguồn 12V', cars: ['sedan', 'suv', 'bantai', 'hatch'], price: 410000, old: 500000, img: IMG + 'led-day-2835.webp' }
  ];

  /* nguồn ảnh sản phẩm (Wikimedia Commons, giấy phép tự do) */
  var CREDITS = [
    ['Bóng LED H4', 'Phiarc', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Road-legal_H4_LED_retrofit_(Philips_Ultinon_Pro6000).jpg'],
    ['Bóng LED T10', 'Sebacalka', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Compare_of_old_and_new_w5w_light_bulb.jpg'],
    ['Bộ bóng LED', 'Sebacalka', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Led_car_bulbs.jpg'],
    ['Bóng H4', 'Ulfbastel', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Bilux.jpg'],
    ['Bóng HB4', 'Dantor', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Hb40gebr.jpg'],
    ['Bóng xenon D2S', 'Michiglaser', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Xenonlamp.jpg'],
    ['Cụm đèn pha', 'A7N8X', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Fanali_rigenerato_e_ingiallito.jpg'],
    ['Đèn LED rọi', 'Rhododendrites', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:LED_light_(40979).jpg'],
    ['LED dây', 'MickelPL', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Dioda_LED_na_ta%C5%9Bmie.jpg'],
    ['Cảm biến mưa', 'ReqEngineer', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Rain-Sensor-MB-2005-02-24.jpg']
  ];

  var SPEC = [
    { name: 'Halogen zin', note: 'Bóng sợi đốt', lm: 1000, k: 3200, life: 500, war: 6, range: 40 },
    { name: 'Bóng LED', note: 'Thay bóng cắm zin', lm: 3200, k: 6000, life: 30000, war: 12, range: 70 },
    { name: 'Bi-LED', note: 'Bi cầu thấu kính', lm: 4800, k: 6000, life: 50000, war: 36, range: 120, best: true },
    { name: 'Bi-Laser', note: 'LED + module laser', lm: 6500, k: 6000, life: 60000, war: 36, range: 600 }
  ];

  /* ảnh đường ban đêm cho widget so sánh */
  var SCENES = [
    { id: '1621863413762-5802c6065dfe', n: 'Đường đô thị' },
    { id: '1637863611072-7441a3609d28', n: 'Đường cua, ít đèn' },
    { id: '1697372028668-9a16fd16f00f', n: 'Đường hàng cây' }
  ];

  /* ambient: ảnh + màu gốc của dải sáng trong ảnh (độ hue) */
  var AMB_VIEWS = [
    { id: '1665491641078-1f8b275c8108', n: 'Táp-lô', hue: 275 },
    { id: '1632655806671-a4af7ad1bcdc', n: 'Tapi cửa & loa', hue: 268 },
    { id: '1780963991450-1a80d64d29c1', n: 'Tay nắm cửa', hue: 228 }
  ];

  var GALLERY = [
    { id: '1598586958772-8bf368215c2a', car: 'Sedan hạng D', d: 'Gói Bi-LED 2 bên + vòng halo đỏ', at: 'Chi nhánh Hải Châu', date: '02/10/2026' },
    { id: '1774751114258-9ce8c37d9711', car: 'Coupe thể thao', d: 'Gói Bi-LED + dải LED mí trắng', at: 'Chi nhánh Sơn Trà', date: '29/09/2026' },
    { id: '1636138103588-ae927bfe10aa', car: 'SUV off-road', d: 'Đèn phụ nóc + đèn rọi thùng xe', at: 'Chi nhánh Hải Châu', date: '27/09/2026' },
    { id: '1762077656314-a88615be0596', car: 'Crossover đô thị', d: 'Đèn hậu LED dải liền', at: 'Chi nhánh Hội An', date: '25/09/2026' },
    { id: '1616761879141-f485e5fed5df', car: 'Sedan hạng C', d: 'Gói Bi-LED + bóng LED gầm', at: 'Chi nhánh Sơn Trà', date: '22/09/2026' },
    { id: '1633991452837-6a50e247fda5', car: 'Bán tải', d: 'Đèn phụ cản trước, đi dây riêng', at: 'Chi nhánh Hải Châu', date: '20/09/2026' },
    { id: '1720929633046-f171051f30ac', car: 'Sedan hạng sang', d: 'Ambient loa & cửa xanh băng', at: 'Chi nhánh Hội An', date: '18/09/2026' },
    { id: '1518438223361-dde09dbeed6a', car: 'Hatchback', d: 'Đèn hậu 3 vạch Dynamic', at: 'Chi nhánh Sơn Trà', date: '15/09/2026' }
  ];

  var REVIEWS = [
    { n: 'Nguyễn Hoàng', city: 'Đà Nẵng', car: 'Toyota Vios 2021', svc: 'Gói độ Bi-LED trọn gói', r: 5, d: '03/10/2026', t: 'Đi đèo Hải Vân ban đêm khác hẳn, đường cắt sáng gọn, xe ngược chiều không nháy pha nữa. Làm hơn 3 tiếng là xong, có phòng chờ máy lạnh.' },
    { n: 'Trần Thị Mai', city: 'Hội An', car: 'Kia Carnival 2022', svc: 'Gói ambient 64 màu – 18 vị trí', r: 5, d: '30/09/2026', t: 'Ambient đẹp hơn mong đợi, dây đi ẩn hoàn toàn. Mấy đứa nhỏ thích nhất chế độ nháy theo nhạc. Nhân viên chỉ cách dùng app rất kỹ.' },
    { n: 'Lê Quốc Bảo', city: 'Tam Kỳ', car: 'Ford Ranger 2023', p: 'p08', r: 5, d: '28/09/2026', t: 'Gắn 2 đèn rọi ở thùng xe, tối dỡ hàng thấy rõ. Đi dây gọn, có công tắc riêng. Tư vấn kỹ, không ép mua đồ đắt.' },
    { n: 'Phạm Minh Quân', city: 'Đà Nẵng', car: 'Hyundai Grand i10', p: 'p01', r: 4, d: '26/09/2026', t: 'Bóng LED H4 cắm zin, sáng hơn hẳn bóng cũ, nhân viên chỉnh lại góc chiếu. Trừ 1 sao vì cuối tuần đông khách phải chờ khoảng 20 phút.' },
    { n: 'Võ Thu Thảo', city: 'Quảng Ngãi', car: 'Mazda CX-5 2020', p: 'p07', r: 5, d: '21/09/2026', t: 'Đèn pha ố vàng sau 6 năm, phục hồi xong trong lại như mới. Thích nhất là bảo hành điện tử, tra bằng số điện thoại, khỏi giữ phiếu.' },
    { n: 'Đặng Văn Đức', city: 'Huế', car: 'Toyota Fortuner 2021', svc: 'Gói độ Bi-Laser', r: 5, d: '17/09/2026', t: 'Bi-laser pha xa thật sự, đường quốc lộ không đèn vẫn thấy rõ biển báo từ xa. Giá hơi cao nhưng đáng tiền.' }
  ];
  var RATING_DIST = [ [5, 1104], [4, 142], [3, 28], [2, 7], [1, 5] ];

  var NEWS = [
    { img: '1693421563400-e72761d49e5f', t: 'Chóa phản xạ có nên lên bi-LED không? So sánh nhanh với bóng LED cắm zin', d: '05/10/2026', tag: 'Kinh nghiệm' },
    { img: '1652977691699-e213b966cf34', t: '5 dấu hiệu đèn pha bị ố, hấp hơi và cách xử lý trước mùa mưa', d: '01/10/2026', tag: 'Bảo dưỡng' },
    { img: '1643236084696-13306d729ff3', t: 'Quy trình 5 bước lắp bi-LED tại xưởng: mất bao lâu, cần chuẩn bị gì?', d: '26/09/2026', tag: 'Hướng dẫn' },
    { img: '1632655806671-a4af7ad1bcdc', t: 'Lái đêm nên chọn màu ambient nào để đỡ mỏi mắt?', d: '20/09/2026', tag: 'Ambient' }
  ];

  var BRANCHES = [
    { n: 'Lumen Hải Châu', a: 'Số 368 Đường Mẫu, P. Hải Châu, Đà Nẵng', p: '0900 000 368', h: '8:00 – 21:00', bay: 6 },
    { n: 'Lumen Sơn Trà', a: 'Số 12 Đường Mẫu B, P. An Hải, Đà Nẵng', p: '0900 000 369', h: '8:00 – 20:30', bay: 4 },
    { n: 'Lumen Hội An', a: 'Số 45 Đường Mẫu C, P. Cẩm Phô, Hội An', p: '0900 000 370', h: '8:00 – 20:00', bay: 3 }
  ];

  var WARRANTY = {
    '0905000301': { name: 'Nguyễn V. H***', car: 'Toyota Vios 2021', pack: 'Gói độ Bi-LED 2 bên + bóng LED T10 demi', date: '12/03/2026', exp: '12/03/2029', ok: true, pct: 83, at: 'Lumen Hải Châu' },
    '0935000302': { name: 'Trần T. M***', car: 'Kia Carnival 2022', pack: 'Ambient 64 màu – gói 18 vị trí', date: '05/11/2025', exp: '05/11/2027', ok: true, pct: 56, at: 'Lumen Hội An' },
    '0779000303': { name: 'Lê Q. B***', car: 'Ford Ranger 2019', pack: 'Đèn LED rọi 12V (2 bộ) + bóng LED H4', date: '20/06/2024', exp: '20/06/2026', ok: false, pct: 0, at: 'Lumen Hải Châu' }
  };

  var SWATCHES = [
    { c: '#22c7e8', n: 'Xanh băng' }, { c: '#2f6bff', n: 'Xanh dương' }, { c: '#8b5cf6', n: 'Tím' },
    { c: '#ec4899', n: 'Hồng' }, { c: '#ef2b3c', n: 'Đỏ' }, { c: '#f97316', n: 'Cam' },
    { c: '#f5a524', n: 'Hổ phách' }, { c: '#c8d62b', n: 'Vàng chanh' }, { c: '#22c55e', n: 'Xanh lá' },
    { c: '#14b8a6', n: 'Xanh ngọc' }, { c: '#ffffff', n: 'Trắng', white: true }, { c: '#ffd9b0', n: 'Trắng ấm', white: true }
  ];

  return { VARIANTS: VARIANTS, U: U, CATS: CATS, SERVICES: SERVICES, CREDITS: CREDITS, TYPES: TYPES, PRICES: PRICES, CARS: CARS, POPULAR_CARS: POPULAR_CARS, PRODUCTS: P, SPEC: SPEC, SCENES: SCENES, AMB_VIEWS: AMB_VIEWS, GALLERY: GALLERY, REVIEWS: REVIEWS, RATING_DIST: RATING_DIST, NEWS: NEWS, BRANCHES: BRANCHES, WARRANTY: WARRANTY, SWATCHES: SWATCHES };
})();
