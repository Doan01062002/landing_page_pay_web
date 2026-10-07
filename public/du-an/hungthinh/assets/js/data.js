/* Hưng Thịnh Auto – dữ liệu mẫu (thương hiệu, giá, địa chỉ đều là minh hoạ) */
(function () {
  'use strict';

  /* id dạng đường dẫn (assets/...) = ảnh cục bộ; còn lại = mã ảnh Unsplash (ảnh chụp thật, giấy phép Unsplash) */
  function U(id, w, h) {
    if (String(id).indexOf('/') > -1) return id;
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 800) + (h ? '&h=' + h : '') + '&q=70';
  }

  var BRANDS = [
    { id: 'toyota', name: 'Toyota' }, { id: 'honda', name: 'Honda' }, { id: 'mazda', name: 'Mazda' },
    { id: 'hyundai', name: 'Hyundai' }, { id: 'kia', name: 'Kia' }, { id: 'ford', name: 'Ford' },
    { id: 'vinfast', name: 'VinFast' }, { id: 'mercedes', name: 'Mercedes-Benz' }, { id: 'bmw', name: 'BMW' },
    { id: 'lexus', name: 'Lexus' }, { id: 'mitsubishi', name: 'Mitsubishi' }, { id: 'peugeot', name: 'Peugeot' }
  ];

  var TYPES = [
    { id: 'suv', name: 'SUV' }, { id: 'crossover', name: 'Crossover' }, { id: 'sedan', name: 'Sedan' },
    { id: 'ban-tai', name: 'Bán tải' }, { id: 'mpv', name: 'MPV' }
  ];

  var PRICES = [
    { id: 'duoi-500', name: 'Dưới 500 triệu', min: 0, max: 500e6 },
    { id: '500-800', name: '500 – 800 triệu', min: 500e6, max: 800e6 },
    { id: '800-1200', name: '800 triệu – 1,2 tỷ', min: 800e6, max: 1200e6 },
    { id: '1200-2000', name: '1,2 – 2 tỷ', min: 1200e6, max: 2000e6 },
    { id: 'tren-2000', name: 'Trên 2 tỷ', min: 2000e6, max: Infinity }
  ];

  var COLORS = {
    trang: { name: 'Trắng ngọc trai', hex: '#f3f4f6' }, den: { name: 'Đen ánh kim', hex: '#111827' },
    bac: { name: 'Bạc', hex: '#c0c6cf' }, xam: { name: 'Xám titan', hex: '#5b6472' },
    do: { name: 'Đỏ pha lê', hex: '#b91c1c' }, xanh: { name: 'Xanh đậm', hex: '#1e3a8a' },
    cam: { name: 'Cam hoàng hôn', hex: '#ea7a1a' }, ngoc: { name: 'Xanh ngọc', hex: '#5fb3a8' },
    vang: { name: 'Vàng thể thao', hex: '#f5c518' }, nau: { name: 'Nâu đồng', hex: '#7c5a45' },
    cat: { name: 'Vàng cát', hex: '#a59a7f' }, reu: { name: 'Xanh rêu', hex: '#5c6a55' }, xanhdam: { name: 'Xanh đại dương', hex: '#1f4a45' }
  };

  /* Ảnh xe: ảnh thật từ Wikimedia Commons (đúng mẫu xe), chuẩn hoá 1200x900 webp trong assets/img/cars/ */
  function CI(id, n) { var a = []; for (var i = 1; i <= n; i++) a.push('assets/img/cars/' + id + '-' + i + '.webp'); return a; }

  var CARS = [
    {
      id: 'toyota-camry', brand: 'toyota', name: 'Toyota Camry', version: '2.5 Hybrid', year: 2025, type: 'sedan',
      price: 1530000000, oldPrice: 1560000000, km: 0, fuel: 'Hybrid', gear: 'Tự động e-CVT', seats: 5, condition: 'Mới',
      origin: 'Nhập khẩu', engine: '2.5L Dynamic Force + mô-tơ điện', power: '225 HP', torque: '221 Nm', drive: 'Cầu trước (FWD)',
      size: '4.915 x 1.840 x 1.445 mm', consumption: '4,7 L/100 km', colors: ['bac', 'trang', 'den'], showroom: 'hn-1',
      featured: true, tag: 'Bán chạy', images: CI('toyota-camry', 3),
      highlights: ['Thế hệ XV80 mới, chỉ còn hệ truyền động hybrid', 'Gói an toàn chủ động: giữ làn, phanh tự động, ga tự động thích ứng', 'Màn hình trung tâm cỡ lớn, kết nối điện thoại không dây']
    },
    {
      id: 'toyota-fortuner', brand: 'toyota', name: 'Toyota Fortuner', version: '2.4AT 4x2', year: 2021, type: 'suv',
      price: 985000000, oldPrice: 1015000000, km: 42000, fuel: 'Dầu', gear: 'Tự động 6 cấp', seats: 7, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '2.4L Diesel 2GD-FTV', power: '147 HP', torque: '400 Nm', drive: 'Cầu sau (RWD)',
      size: '4.795 x 1.855 x 1.835 mm', consumption: '7,8 L/100 km', colors: ['trang'], showroom: 'hn-2',
      featured: true, tag: 'Gia đình 7 chỗ', images: CI('toyota-fortuner', 3),
      highlights: ['Khung gầm rời bền bỉ, máy dầu tiết kiệm', '3 hàng ghế rộng rãi, điều hoà cho hàng ghế sau', 'Xe một chủ, bảo dưỡng định kỳ đầy đủ']
    },
    {
      id: 'toyota-corolla-cross', brand: 'toyota', name: 'Toyota Corolla Cross', version: '1.8V', year: 2022, type: 'crossover',
      price: 735000000, km: 28000, fuel: 'Xăng', gear: 'Tự động CVT', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Nhập khẩu Thái Lan', engine: '1.8L 2ZR-FE', power: '138 HP', torque: '172 Nm', drive: 'Cầu trước (FWD)',
      size: '4.460 x 1.825 x 1.620 mm', consumption: '6,8 L/100 km', colors: ['trang'], showroom: 'hcm-1',
      featured: true, tag: 'Đã kiểm định', images: CI('toyota-corolla-cross', 3),
      highlights: ['Crossover đô thị gầm cao, dễ lái', 'Toyota Safety Sense trên bản V', 'Chi phí bảo dưỡng thấp, giữ giá tốt']
    },
    {
      id: 'toyota-vios', brand: 'toyota', name: 'Toyota Vios', version: '1.5E MT', year: 2018, type: 'sedan',
      price: 365000000, oldPrice: 385000000, km: 76000, fuel: 'Xăng', gear: 'Số sàn 5 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '1.5L Dual VVT-i', power: '107 HP', torque: '140 Nm', drive: 'Cầu trước (FWD)',
      size: '4.425 x 1.730 x 1.475 mm', consumption: '5,8 L/100 km', colors: ['den'], showroom: 'dn-1',
      featured: false, tag: 'Giá tốt', images: CI('toyota-vios', 3),
      highlights: ['Sedan hạng B bền bỉ, phụ tùng dễ tìm', 'Phù hợp chạy dịch vụ hoặc xe đầu tiên', 'Đã thay dầu, lọc và má phanh trước khi bán']
    },
    {
      id: 'honda-crv', brand: 'honda', name: 'Honda CR-V', version: '1.5 Turbo L AWD', year: 2024, type: 'suv',
      price: 1250000000, km: 0, fuel: 'Xăng', gear: 'Tự động CVT', seats: 5, condition: 'Mới',
      origin: 'Lắp ráp trong nước', engine: '1.5L VTEC Turbo', power: '188 HP', torque: '240 Nm', drive: '4 bánh (AWD)',
      size: '4.691 x 1.866 x 1.681 mm', consumption: '7,3 L/100 km', colors: ['xam', 'trang', 'den'], showroom: 'hn-1',
      featured: true, tag: 'Mới về', images: CI('honda-crv', 3),
      highlights: ['Thế hệ thứ 6 rộng rãi hơn, cách âm tốt', 'Honda SENSING đầy đủ tính năng', 'Khoang hành lý lớn, hàng ghế sau ngả linh hoạt']
    },
    {
      id: 'honda-civic', brand: 'honda', name: 'Honda Civic', version: 'Sport', year: 2022, type: 'sedan',
      price: 745000000, oldPrice: 779000000, km: 31000, fuel: 'Xăng', gear: 'Tự động CVT', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Nhập khẩu', engine: '2.0L i-VTEC', power: '158 HP', torque: '187 Nm', drive: 'Cầu trước (FWD)',
      size: '4.674 x 1.801 x 1.415 mm', consumption: '6,4 L/100 km', colors: ['xam'], showroom: 'hcm-1',
      featured: true, tag: 'Giá tốt', images: CI('honda-civic', 2),
      highlights: ['Thế hệ thứ 11, thiết kế tối giản thanh lịch', 'Đã kiểm tra 180 hạng mục, không đâm đụng', 'Lốp còn trên 70%, nội thất sạch']
    },
    {
      id: 'mazda-cx5', brand: 'mazda', name: 'Mazda CX-5', version: '2.5 Signature', year: 2024, type: 'crossover',
      price: 979000000, km: 0, fuel: 'Xăng', gear: 'Tự động 6 cấp', seats: 5, condition: 'Mới',
      origin: 'Lắp ráp trong nước', engine: '2.5L Skyactiv-G', power: '188 HP', torque: '252 Nm', drive: '4 bánh (AWD)',
      size: '4.590 x 1.845 x 1.680 mm', consumption: '7,4 L/100 km', colors: ['cat', 'xam', 'do'], showroom: 'hn-2',
      featured: true, tag: 'Bán chạy', images: CI('mazda-cx5', 3),
      highlights: ['Thiết kế KODO sang trọng, cách âm tốt trong phân khúc', 'i-Activsense: cảnh báo điểm mù, phanh thông minh', 'Giá dễ tiếp cận cho gia đình trẻ']
    },
    {
      id: 'mazda3', brand: 'mazda', name: 'Mazda3', version: '2.0 Premium Sedan', year: 2020, type: 'sedan',
      price: 585000000, oldPrice: 609000000, km: 45000, fuel: 'Xăng', gear: 'Tự động 6 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '2.0L Skyactiv-G', power: '153 HP', torque: '200 Nm', drive: 'Cầu trước (FWD)',
      size: '4.660 x 1.795 x 1.440 mm', consumption: '6,5 L/100 km', colors: ['trang'], showroom: 'dn-1',
      featured: false, tag: '', images: CI('mazda3', 2),
      highlights: ['Kiểu dáng sedan thể thao, nội thất tối giản', 'Màn hình HUD hiển thị trên kính lái', 'Ghế lái chỉnh điện có nhớ vị trí']
    },
    {
      id: 'hyundai-santafe', brand: 'hyundai', name: 'Hyundai Santa Fe', version: '2.5T Calligraphy', year: 2024, type: 'suv',
      price: 1365000000, km: 0, fuel: 'Xăng', gear: 'Tự động 8 cấp ướt', seats: 7, condition: 'Mới',
      origin: 'Lắp ráp trong nước', engine: '2.5L T-GDi', power: '277 HP', torque: '422 Nm', drive: '4 bánh HTRAC',
      size: '4.830 x 1.900 x 1.780 mm', consumption: '9,1 L/100 km', colors: ['reu', 'trang'], showroom: 'hcm-1',
      featured: true, tag: 'Mới về', images: CI('hyundai-santafe', 3),
      highlights: ['Thế hệ MX5 vuông vức, khoang sau cực rộng', 'Động cơ tăng áp 277 mã lực', 'Ghế hàng hai dạng thương gia']
    },
    {
      id: 'hyundai-tucson', brand: 'hyundai', name: 'Hyundai Tucson', version: '2.0 Đặc biệt', year: 2022, type: 'crossover',
      price: 745000000, oldPrice: 775000000, km: 26000, fuel: 'Xăng', gear: 'Tự động 6 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '2.0L MPi', power: '156 HP', torque: '192 Nm', drive: 'Cầu trước (FWD)',
      size: '4.630 x 1.865 x 1.695 mm', consumption: '7,8 L/100 km', colors: ['nau'], showroom: 'hn-1',
      featured: false, tag: 'Đã kiểm định', images: CI('hyundai-tucson', 3),
      highlights: ['Đèn ban ngày dạng tham số ẩn đặc trưng', 'Màn hình kép 10,25 inch', 'Phanh tay điện tử, giữ phanh tự động']
    },
    {
      id: 'hyundai-creta', brand: 'hyundai', name: 'Hyundai Creta', version: '1.5 Đặc biệt', year: 2022, type: 'crossover',
      price: 615000000, km: 19000, fuel: 'Xăng', gear: 'Tự động IVT', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Nhập khẩu Indonesia', engine: '1.5L Smartstream', power: '113 HP', torque: '144 Nm', drive: 'Cầu trước (FWD)',
      size: '4.315 x 1.790 x 1.660 mm', consumption: '6,3 L/100 km', colors: ['cam'], showroom: 'hcm-2',
      featured: false, tag: '', images: CI('hyundai-creta', 2),
      highlights: ['Phối màu cam – nóc đen cá tính', 'Cửa sổ trời, sạc không dây', 'Gầm cao, dễ xoay trở trong phố']
    },
    {
      id: 'hyundai-accent', brand: 'hyundai', name: 'Hyundai Accent', version: '1.6 AT', year: 2018, type: 'sedan',
      price: 375000000, km: 68000, fuel: 'Xăng', gear: 'Tự động 6 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Nhập khẩu', engine: '1.6L Gamma', power: '130 HP', torque: '157 Nm', drive: 'Cầu trước (FWD)',
      size: '4.385 x 1.729 x 1.460 mm', consumption: '6,4 L/100 km', colors: ['do'], showroom: 'dn-1',
      featured: false, tag: 'Giá tốt', images: CI('hyundai-accent', 2),
      highlights: ['Sedan hạng B tiết kiệm, dễ sử dụng', 'Đầy đủ hồ sơ, đăng kiểm còn hạn', 'Phù hợp gia đình nhỏ đi phố']
    },
    {
      id: 'kia-seltos', brand: 'kia', name: 'Kia Seltos', version: '1.4 Turbo GT-Line', year: 2021, type: 'crossover',
      price: 615000000, oldPrice: 639000000, km: 34000, fuel: 'Xăng', gear: 'Tự động 7 cấp DCT', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '1.4L T-GDi', power: '138 HP', torque: '242 Nm', drive: 'Cầu trước (FWD)',
      size: '4.315 x 1.800 x 1.645 mm', consumption: '6,6 L/100 km', colors: ['bac'], showroom: 'hcm-2',
      featured: true, tag: 'Giá tốt', images: CI('kia-seltos', 3),
      highlights: ['Bản GT-Line ngoại hình thể thao', 'Cửa sổ trời, ghế làm mát', 'Phù hợp đi phố lẫn đường trường']
    },
    {
      id: 'kia-carnival', brand: 'kia', name: 'Kia Carnival', version: '2.2D Luxury', year: 2022, type: 'mpv',
      price: 1219000000, oldPrice: 1265000000, km: 39000, fuel: 'Dầu', gear: 'Tự động 8 cấp', seats: 8, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '2.2L Smartstream Diesel', power: '199 HP', torque: '440 Nm', drive: 'Cầu trước (FWD)',
      size: '5.155 x 1.995 x 1.775 mm', consumption: '7,4 L/100 km', colors: ['trang'], showroom: 'hcm-1',
      featured: false, tag: 'Gia đình 7 chỗ', images: CI('kia-carnival', 3),
      highlights: ['Cửa lùa điện hai bên, 3 hàng ghế thoải mái', 'Máy dầu mô-men xoắn lớn, tiết kiệm', 'Lịch sử bảo dưỡng minh bạch']
    },
    {
      id: 'ford-ranger-wildtrak', brand: 'ford', name: 'Ford Ranger', version: 'Wildtrak 2.0 Bi-Turbo 4x4', year: 2020, type: 'ban-tai',
      price: 689000000, oldPrice: 715000000, km: 58000, fuel: 'Dầu', gear: 'Tự động 10 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Nhập khẩu Thái Lan', engine: '2.0L Bi-Turbo Diesel', power: '210 HP', torque: '500 Nm', drive: '4 bánh bán thời gian',
      size: '5.362 x 1.860 x 1.830 mm', consumption: '8,4 L/100 km', colors: ['cam'], showroom: 'dn-1',
      featured: false, tag: 'Đã kiểm định', images: CI('ford-ranger-wildtrak', 2),
      highlights: ['Màu cam Saber đặc trưng bản Wildtrak', 'Kiểm tra gầm, hộp số và hệ dẫn động 4 bánh', 'Hỗ trợ trả góp tới 70% giá trị xe']
    },
    {
      id: 'ford-ranger-raptor', brand: 'ford', name: 'Ford Ranger Raptor', version: '2.0L Bi-Turbo 4x4', year: 2024, type: 'ban-tai',
      price: 1299000000, km: 0, fuel: 'Dầu', gear: 'Tự động 10 cấp', seats: 5, condition: 'Mới',
      origin: 'Nhập khẩu Thái Lan', engine: '2.0L Bi-Turbo Diesel', power: '210 HP', torque: '500 Nm', drive: '4 bánh bán thời gian',
      size: '5.360 x 2.028 x 1.926 mm', consumption: '9,6 L/100 km', colors: ['do', 'xam', 'trang'], showroom: 'hn-2',
      featured: true, tag: 'Off-road', images: CI('ford-ranger-raptor', 2),
      highlights: ['Phuộc FOX hiệu suất cao cho địa hình', 'Nhiều chế độ lái, khoá vi sai trước sau', 'Thân xe rộng, mâm và lốp địa hình']
    },
    {
      id: 'vinfast-vf8', brand: 'vinfast', name: 'VinFast VF 8', version: 'Eco', year: 2024, type: 'suv',
      price: 1019000000, km: 0, fuel: 'Điện', gear: 'Một cấp', seats: 5, condition: 'Mới',
      origin: 'Sản xuất trong nước', engine: '2 mô-tơ điện', power: '349 HP', torque: '500 Nm', drive: '4 bánh (AWD)',
      size: '4.750 x 1.934 x 1.667 mm', consumption: 'Khoảng 470 km/lần sạc (công bố)', colors: ['xanhdam', 'trang', 'do'], showroom: 'hn-1',
      featured: true, tag: 'Xe điện', images: CI('vinfast-vf8', 2),
      highlights: ['Hai mô-tơ, tăng tốc mạnh mẽ', 'Trợ lý ảo tiếng Việt, cập nhật phần mềm từ xa', 'Chi phí vận hành thấp hơn xe xăng']
    },
    {
      id: 'vinfast-vf3', brand: 'vinfast', name: 'VinFast VF 3', version: 'Tiêu chuẩn', year: 2025, type: 'crossover',
      price: 299000000, km: 0, fuel: 'Điện', gear: 'Một cấp', seats: 4, condition: 'Mới',
      origin: 'Sản xuất trong nước', engine: 'Mô-tơ điện', power: '43 HP', torque: '110 Nm', drive: 'Cầu sau (RWD)',
      size: '3.190 x 1.679 x 1.622 mm', consumption: 'Khoảng 210 km/lần sạc (công bố)', colors: ['reu', 'vang', 'trang'], showroom: 'hcm-2',
      featured: false, tag: 'Xe điện', images: CI('vinfast-vf3', 2),
      highlights: ['Nhỏ gọn, dễ xoay trở trong phố', 'Chi phí sạc thấp, ít bảo dưỡng', 'Nhiều màu sơn trẻ trung']
    },
    {
      id: 'vinfast-vf5', brand: 'vinfast', name: 'VinFast VF 5', version: 'Plus', year: 2024, type: 'crossover',
      price: 529000000, km: 0, fuel: 'Điện', gear: 'Một cấp', seats: 5, condition: 'Mới',
      origin: 'Sản xuất trong nước', engine: 'Mô-tơ điện', power: '134 HP', torque: '135 Nm', drive: 'Cầu trước (FWD)',
      size: '3.967 x 1.723 x 1.578 mm', consumption: 'Khoảng 300 km/lần sạc (công bố)', colors: ['do', 'xanh', 'trang'], showroom: 'hn-2',
      featured: false, tag: 'Xe điện', images: CI('vinfast-vf5', 2),
      highlights: ['SUV điện cỡ A cho đô thị', 'Màn hình trung tâm 8 inch, kết nối thông minh', 'Phù hợp gia đình nhỏ, chạy dịch vụ']
    },
    {
      id: 'mercedes-c200', brand: 'mercedes', name: 'Mercedes-Benz C 200', version: 'Avantgarde', year: 2023, type: 'sedan',
      price: 1529000000, oldPrice: 1599000000, km: 15000, fuel: 'Xăng', gear: 'Tự động 9 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '1.5L I4 Turbo + EQ Boost', power: '204 HP', torque: '300 Nm', drive: 'Cầu sau (RWD)',
      size: '4.751 x 1.820 x 1.438 mm', consumption: '6,9 L/100 km', colors: ['do'], showroom: 'hcm-1',
      featured: true, tag: 'Sang trọng', images: CI('mercedes-c200', 3),
      highlights: ['Thế hệ W206, màn hình trung tâm dạng dọc', 'Hệ thống mild-hybrid EQ Boost', 'Còn bảo hành chính hãng']
    },
    {
      id: 'mercedes-glc300', brand: 'mercedes', name: 'Mercedes-Benz GLC 300', version: '4MATIC', year: 2024, type: 'suv',
      price: 2799000000, km: 0, fuel: 'Xăng', gear: 'Tự động 9 cấp', seats: 5, condition: 'Mới',
      origin: 'Lắp ráp trong nước', engine: '2.0L I4 Turbo + EQ Boost', power: '258 HP', torque: '400 Nm', drive: '4 bánh 4MATIC',
      size: '4.716 x 1.890 x 1.640 mm', consumption: '8,0 L/100 km', colors: ['xanh', 'trang', 'den'], showroom: 'hn-1',
      featured: false, tag: 'Sang trọng', images: CI('mercedes-glc300', 3),
      highlights: ['Thế hệ X254, đèn và lưới tản nhiệt mới', 'Hệ dẫn động 4MATIC ổn định', 'Nội thất màn hình lớn, đèn viền 64 màu']
    },
    {
      id: 'bmw-320i', brand: 'bmw', name: 'BMW 320i', version: 'M Sport', year: 2022, type: 'sedan',
      price: 1180000000, oldPrice: 1225000000, km: 29000, fuel: 'Xăng', gear: 'Tự động 8 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '2.0L TwinPower Turbo', power: '184 HP', torque: '300 Nm', drive: 'Cầu sau (RWD)',
      size: '4.709 x 1.827 x 1.442 mm', consumption: '6,6 L/100 km', colors: ['den'], showroom: 'hn-2',
      featured: false, tag: '', images: CI('bmw-320i', 2),
      highlights: ['Cảm giác lái đặc trưng dẫn động cầu sau', 'Gói ngoại thất M Sport', 'Xe đi ít, sơn zin phần lớn thân xe']
    },
    {
      id: 'bmw-x5', brand: 'bmw', name: 'BMW X5', version: 'xDrive40i', year: 2023, type: 'suv',
      price: 3899000000, km: 0, fuel: 'Xăng', gear: 'Tự động 8 cấp', seats: 5, condition: 'Mới',
      origin: 'Nhập khẩu', engine: '3.0L I6 TwinPower Turbo', power: '340 HP', torque: '450 Nm', drive: '4 bánh xDrive',
      size: '4.922 x 2.004 x 1.745 mm', consumption: '9,2 L/100 km', colors: ['den', 'trang'], showroom: 'hcm-1',
      featured: true, tag: 'Sang trọng', images: CI('bmw-x5', 3),
      highlights: ['Động cơ 6 xi-lanh thẳng hàng mượt mà', 'Hệ dẫn động xDrive, treo thích ứng', 'Khoang lái rộng, vật liệu cao cấp']
    },
    {
      id: 'lexus-rx350', brand: 'lexus', name: 'Lexus RX 350', version: 'Premium', year: 2023, type: 'suv',
      price: 3150000000, oldPrice: 3290000000, km: 12000, fuel: 'Xăng', gear: 'Tự động 8 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Nhập khẩu Nhật Bản', engine: '2.4L I4 Turbo', power: '275 HP', torque: '430 Nm', drive: '4 bánh (AWD)',
      size: '4.890 x 1.920 x 1.695 mm', consumption: '9,0 L/100 km', colors: ['trang'], showroom: 'hn-1',
      featured: false, tag: 'Sang trọng', images: CI('lexus-rx350', 3),
      highlights: ['Thế hệ thứ 5, lưới tản nhiệt liền khối mới', 'Cách âm vượt trội, nội thất tinh xảo', 'Độ tin cậy cao, giữ giá tốt']
    },
    {
      id: 'mitsubishi-xpander', brand: 'mitsubishi', name: 'Mitsubishi Xpander', version: '1.5 AT', year: 2023, type: 'mpv',
      price: 545000000, oldPrice: 568000000, km: 21000, fuel: 'Xăng', gear: 'Tự động CVT', seats: 7, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '1.5L MIVEC', power: '103 HP', torque: '141 Nm', drive: 'Cầu trước (FWD)',
      size: '4.595 x 1.750 x 1.750 mm', consumption: '6,9 L/100 km', colors: ['do'], showroom: 'dn-1',
      featured: true, tag: 'Gia đình 7 chỗ', images: CI('mitsubishi-xpander', 3),
      highlights: ['MPV 7 chỗ bán chạy, chi phí sử dụng thấp', 'Gầm cao 220 mm, đi đường ngập nhẹ tốt', 'Hàng ghế 2–3 gập phẳng linh hoạt']
    },
    {
      id: 'peugeot-3008', brand: 'peugeot', name: 'Peugeot 3008', version: '1.6 AT Allure', year: 2018, type: 'crossover',
      price: 655000000, km: 52000, fuel: 'Xăng', gear: 'Tự động 6 cấp', seats: 5, condition: 'Đã qua sử dụng',
      origin: 'Lắp ráp trong nước', engine: '1.6L THP Turbo', power: '165 HP', torque: '245 Nm', drive: 'Cầu trước (FWD)',
      size: '4.447 x 1.841 x 1.624 mm', consumption: '7,3 L/100 km', colors: ['den'], showroom: 'hn-2',
      featured: false, tag: '', images: CI('peugeot-3008', 3),
      highlights: ['Khoang lái i-Cockpit độc đáo', 'Thiết kế châu Âu thời trang', 'Đã bảo dưỡng lớn mốc 50.000 km']
    }
  ];

  var ACC_CATS = [
    { id: 'mam-lop', name: 'Mâm & lốp' }, { id: 'den', name: 'Đèn chiếu sáng' },
    { id: 'dien', name: 'Ắc quy & điện' }, { id: 'an-toan', name: 'An toàn & chẩn đoán' }
  ];

  /* Ảnh phụ kiện: ảnh sản phẩm thật (Wikimedia Commons), chuẩn hoá 800x800 nền trắng trong assets/img/products/ */
  function PI(id) { return ['assets/img/products/' + id + '.webp']; }
  var ACCESSORIES = [
    { id: 'mam-17-5-chau', cat: 'mam-lop', name: 'Mâm hợp kim 17 inch 5 chấu kép (1 chiếc)', price: 3450000, oldPrice: 3900000, images: PI('mam-17-5-chau'), desc: 'Mâm đúc hợp kim nhôm, mặt phay xước bóng phối đen; kiểm tra PCD và offset theo xe trước khi lắp.' },
    { id: 'mam-17-luoi', cat: 'mam-lop', name: 'Mâm hợp kim 17 inch kiểu lưới cổ điển (1 chiếc)', price: 4200000, images: PI('mam-17-luoi'), desc: 'Kiểu nan lưới cổ điển, vành ngoài đánh bóng; hợp với sedan và hatchback phong cách thể thao.' },
    { id: 'mam-18-den', cat: 'mam-lop', name: 'Mâm hợp kim 18 inch 5 chấu sơn đen bóng (1 chiếc)', price: 4650000, oldPrice: 4990000, images: PI('mam-18-den'), desc: 'Sơn đen bóng, viền vành đánh bóng; miễn phí cân bằng động khi lắp tại showroom.' },
    { id: 'dong-ho-ap-suat', cat: 'mam-lop', name: 'Đồng hồ đo áp suất lốp dạng kim', price: 390000, images: PI('dong-ho-ap-suat'), desc: 'Mặt đồng hồ dễ đọc, đầu đo kim loại; nên kiểm tra áp suất lốp mỗi 2 tuần và trước chuyến đi xa.' },
    { id: 'bong-h7', cat: 'den', name: 'Bóng đèn halogen H7 12V 55W', price: 180000, images: PI('bong-h7'), desc: 'Bóng halogen chân H7 tiêu chuẩn cho đèn pha/cos; nên thay theo cặp để ánh sáng đồng đều.' },
    { id: 'bo-bong-h7', cat: 'den', name: 'Bóng halogen H7 tăng sáng (kèm hộp)', price: 320000, oldPrice: 360000, images: PI('bo-bong-h7'), desc: 'Bóng H7 loại tăng sáng, chuẩn chân cắm phổ biến; không cần chỉnh sửa hệ thống điện.' },
    { id: 'ac-quy-70ah', cat: 'dien', name: 'Ắc quy khô 12V 70Ah', price: 2150000, images: PI('ac-quy-70ah'), desc: 'Ắc quy miễn bảo dưỡng cho sedan và SUV cỡ vừa; miễn phí kiểm tra hệ thống sạc khi thay tại showroom.' },
    { id: 'ac-quy-efb', cat: 'dien', name: 'Ắc quy EFB 12V cho xe Start-Stop', price: 2890000, oldPrice: 3150000, images: PI('ac-quy-efb'), desc: 'Công nghệ EFB chịu chu kỳ khởi động – dừng liên tục, phù hợp xe có tính năng Start-Stop.' },
    { id: 'day-cau-binh', cat: 'dien', name: 'Dây câu bình ắc quy kẹp đồng', price: 450000, images: PI('day-cau-binh'), desc: 'Bộ dây kẹp đỏ – đen hỗ trợ kích nổ khi ắc quy yếu; nên để sẵn trong cốp xe.' },
    { id: 'tau-sac-usb', cat: 'dien', name: 'Tẩu sạc nhanh USB-C + USB-A', price: 290000, images: PI('tau-sac-usb'), desc: 'Hai cổng sạc nhanh cho điện thoại và máy tính bảng, thân nhỏ gọn cắm vừa khít ổ 12V.' },
    { id: 'cap-obd2', cat: 'an-toan', name: 'Cáp chẩn đoán OBD2 – USB', price: 650000, images: PI('cap-obd2'), desc: 'Kết nối cổng OBD2 của xe với máy tính để đọc mã lỗi và thông số động cơ (cần phần mềm tương thích).' }
  ];

  var SHOWROOMS = [
    { id: 'hn-1', region: 'ha-noi', name: 'Hưng Thịnh Auto Hà Nội', address: 'Số 1 Đường Minh Hoạ, Hà Nội (minh hoạ)', phone: '0900 000 686', hours: '8:00 – 20:00, tất cả các ngày', x: 34, y: 18 },
    { id: 'hn-2', region: 'ha-noi', name: 'Hưng Thịnh Auto Long Biên', address: 'Số 25 Phố Minh Hoạ, Long Biên, Hà Nội (minh hoạ)', phone: '0900 000 686', hours: '8:00 – 19:30, tất cả các ngày', x: 38, y: 20 },
    { id: 'dn-1', region: 'da-nang', name: 'Hưng Thịnh Auto Đà Nẵng', address: 'Số 8 Đường Minh Hoạ, Hải Châu, Đà Nẵng (minh hoạ)', phone: '0900 000 686', hours: '8:00 – 19:00, Thứ 2 – Chủ nhật', x: 58, y: 50 },
    { id: 'hcm-1', region: 'tp-hcm', name: 'Hưng Thịnh Auto Sài Gòn', address: 'Số 88 Đường Minh Hoạ, Quận 7, TP.HCM (minh hoạ)', phone: '0900 000 686', hours: '8:00 – 20:00, tất cả các ngày', x: 44, y: 82 },
    { id: 'hcm-2', region: 'tp-hcm', name: 'Hưng Thịnh Auto Thủ Đức', address: 'Số 12 Xa lộ Minh Hoạ, TP. Thủ Đức, TP.HCM (minh hoạ)', phone: '0900 000 686', hours: '8:00 – 19:30, tất cả các ngày', x: 47, y: 80 }
  ];
  var REGIONS = [{ id: 'ha-noi', name: 'Hà Nội' }, { id: 'da-nang', name: 'Đà Nẵng' }, { id: 'tp-hcm', name: 'TP. Hồ Chí Minh' }];

  var POST_CATS = [
    { id: 'kinh-nghiem', name: 'Kinh nghiệm lái xe' }, { id: 'tu-van', name: 'Tư vấn mua xe' },
    { id: 'bao-duong', name: 'Bảo dưỡng & chăm sóc' }, { id: 'tai-chinh', name: 'Tài chính & trả góp' }
  ];

  var POSTS = [
    {
      id: 'lai-xe-duong-dai-dip-le', cat: 'kinh-nghiem', date: '2026-09-28', author: 'Ban biên tập', img: '1469854523086-cc02fe5d8800',
      title: 'Lái xe đường dài dịp nghỉ lễ: chuẩn bị thế nào để an toàn, đỡ mệt?',
      excerpt: 'Kiểm tra xe trước chuyến đi, chia chặng nghỉ hợp lý và vài thói quen nhỏ giúp cả nhà có chuyến đi trọn vẹn.',
      body: [
        ['p', 'Những chuyến đi xa dịp lễ thường kéo dài nhiều giờ liền, đường đông và thời tiết khó đoán. Chuẩn bị kỹ trước khi lăn bánh giúp bạn giảm phần lớn rủi ro dọc đường.'],
        ['h2', '1. Kiểm tra xe trước ngày khởi hành'],
        ['p', 'Hãy xem lại áp suất lốp (kể cả lốp dự phòng), mức dầu máy, nước làm mát, nước rửa kính và tình trạng gạt mưa. Nếu xe sắp đến mốc bảo dưỡng, nên làm sớm vài ngày thay vì để sau chuyến đi.'],
        ['h2', '2. Chia chặng và nghỉ đúng lúc'],
        ['p', 'Cứ khoảng 2 giờ lái, nên dừng nghỉ 15 phút để vận động nhẹ. Nếu có người cùng lái, hãy thay phiên trước khi cảm thấy mệt chứ không đợi đến lúc buồn ngủ.'],
        ['ul', ['Đi sớm để tránh giờ cao điểm ra khỏi thành phố', 'Lưu sẵn bản đồ ngoại tuyến cho đoạn đường ít sóng', 'Mang theo nước, đồ ăn nhẹ và bộ sơ cứu cơ bản']],
        ['h2', '3. Giữ khoảng cách và tốc độ phù hợp'],
        ['p', 'Trên cao tốc, giữ khoảng cách an toàn theo biển báo và tránh chuyển làn liên tục. Ga tự động thích ứng (nếu có) giúp giảm mỏi chân nhưng vẫn cần quan sát thường xuyên.'],
        ['p', 'Chúc bạn và gia đình có chuyến đi an toàn! Nếu cần kiểm tra xe miễn phí trước chuyến đi, hãy đặt lịch tại showroom gần nhất.']
      ]
    },
    {
      id: 'lich-bao-duong-theo-moc-km', cat: 'bao-duong', date: '2026-09-15', author: 'Kỹ thuật viên Hưng Thịnh', img: '1625047509168-a7026f36de04',
      title: 'Lịch bảo dưỡng ô tô theo mốc km: chủ xe mới cần nhớ gì?',
      excerpt: 'Tóm tắt các hạng mục thường gặp ở mốc 5.000, 10.000, 20.000 và 40.000 km để bạn chủ động chi phí.',
      body: [
        ['p', 'Mỗi hãng xe có lịch bảo dưỡng riêng, nhưng nhìn chung các mốc chính khá giống nhau. Bảng dưới đây mang tính tham khảo – hãy luôn ưu tiên sổ bảo hành đi kèm xe của bạn.'],
        ['h2', 'Mốc 5.000 – 10.000 km'],
        ['p', 'Thay dầu máy, kiểm tra lọc gió, kiểm tra các mức dung dịch và áp suất lốp. Đây là mốc bảo dưỡng nhỏ, thời gian làm khoảng 1 giờ.'],
        ['h2', 'Mốc 20.000 km'],
        ['p', 'Ngoài các hạng mục trên, thường thay lọc dầu, lọc gió điều hoà, kiểm tra má phanh và đảo lốp.'],
        ['h2', 'Mốc 40.000 km'],
        ['ul', ['Thay dầu phanh và có thể thay nước làm mát', 'Kiểm tra bugi, dây curoa', 'Vệ sinh hệ thống phun xăng, bướm ga']],
        ['p', 'Ghi chép đầy đủ lịch sử bảo dưỡng không chỉ giúp xe bền mà còn giúp xe giữ giá tốt hơn khi bạn muốn bán lại.']
      ]
    },
    {
      id: 'mua-xe-cu-12-diem-kiem-tra', cat: 'tu-van', date: '2026-09-02', author: 'Ban biên tập', img: '1595696389610-2d339d4573c7',
      title: 'Mua xe cũ: 12 điểm cần kiểm tra trước khi xuống tiền',
      excerpt: 'Từ giấy tờ, số khung số máy đến khe hở cánh cửa – danh sách giúp bạn tự tin hơn khi xem xe đã qua sử dụng.',
      body: [
        ['p', 'Xe đã qua sử dụng giúp tiết kiệm đáng kể chi phí, đổi lại người mua cần cẩn thận hơn. Dưới đây là các điểm nên kiểm tra theo thứ tự.'],
        ['h2', 'Giấy tờ và lịch sử'],
        ['ul', ['Đăng ký xe, đăng kiểm còn hạn, đối chiếu số khung – số máy', 'Sổ bảo dưỡng hoặc lịch sử làm dịch vụ tại hãng', 'Tình trạng phạt nguội, thế chấp ngân hàng']],
        ['h2', 'Ngoại thất và khung gầm'],
        ['ul', ['Độ đều của khe hở cánh cửa, nắp capo', 'Độ dày sơn ở các tấm thân vỏ', 'Dấu hiệu gỉ sét, cong vênh ở gầm và hốc bánh']],
        ['h2', 'Nội thất và vận hành'],
        ['ul', ['Mùi ẩm mốc, vết bùn đất trong khe ghế (dấu hiệu ngập nước)', 'Hoạt động của điều hoà, cửa kính, màn hình', 'Lái thử: tiếng động lạ, độ trễ hộp số, độ thẳng lái']],
        ['p', 'Tại Hưng Thịnh Auto (minh hoạ), mỗi xe đã qua sử dụng đều đi kèm phiếu kiểm tra để khách hàng tham khảo trước khi quyết định.']
      ]
    },
    {
      id: 'tinh-tra-gop-o-to', cat: 'tai-chinh', date: '2026-08-21', author: 'Tư vấn tài chính', img: '1554224155-8d04cb21cd6c',
      title: 'Trả góp ô tô: cách tính khoản trả hàng tháng dễ hiểu',
      excerpt: 'Hiểu rõ khoản trả trước, kỳ hạn và lãi suất để chọn phương án vừa sức, không áp lực tài chính.',
      body: [
        ['p', 'Khoản trả hàng tháng phụ thuộc vào ba yếu tố: số tiền vay, kỳ hạn và lãi suất. Thay đổi bất kỳ yếu tố nào cũng làm khoản trả thay đổi đáng kể.'],
        ['h2', 'Dư nợ giảm dần là gì?'],
        ['p', 'Phần lớn khoản vay mua xe tính lãi trên dư nợ giảm dần: tiền gốc chia đều mỗi tháng, tiền lãi tính trên số gốc còn lại. Vì vậy những tháng đầu bạn trả nhiều hơn, các tháng sau giảm dần.'],
        ['h2', 'Mẹo chọn phương án'],
        ['ul', ['Tổng khoản trả góp không nên vượt 30–40% thu nhập hằng tháng', 'Trả trước nhiều giúp giảm lãi phải trả', 'Hỏi rõ phí trả nợ trước hạn và lãi suất sau thời gian ưu đãi']],
        ['p', 'Bạn có thể dùng công cụ tính trả góp trên trang chi tiết mỗi xe để ước tính nhanh. Kết quả chỉ mang tính tham khảo.']
      ]
    },
    {
      id: 'suv-hay-sedan', cat: 'tu-van', date: '2026-08-09', author: 'Ban biên tập', img: '1533473359331-0135ef1b58bf',
      title: 'SUV hay Sedan: chọn kiểu dáng nào cho gia đình 4–5 người?',
      excerpt: 'So sánh nhanh về không gian, cảm giác lái, chi phí và nhu cầu sử dụng để chọn đúng chiếc xe đầu tiên.',
      body: [
        ['p', 'Đây là câu hỏi phổ biến nhất của khách hàng mua xe lần đầu. Không có đáp án chung – chỉ có lựa chọn phù hợp với nhu cầu của bạn.'],
        ['h2', 'Sedan: êm ái, tiết kiệm'],
        ['p', 'Trọng tâm thấp giúp sedan ổn định khi chạy tốc độ cao, ít tốn nhiên liệu hơn và thường có giá dễ tiếp cận hơn SUV cùng hạng.'],
        ['h2', 'SUV/Crossover: linh hoạt, tầm nhìn cao'],
        ['p', 'Gầm cao giúp đi đường xấu, ngập nhẹ thoải mái hơn; khoang hành lý linh hoạt; tầm nhìn lái tốt. Đổi lại, chi phí và mức tiêu hao nhiên liệu thường cao hơn.'],
        ['ul', ['Chủ yếu đi phố, ít đi tỉnh: ưu tiên sedan hoặc crossover cỡ nhỏ', 'Thường xuyên đi tỉnh, đường xấu: ưu tiên SUV/crossover', 'Gia đình đông người: cân nhắc SUV 7 chỗ hoặc MPV']]
      ]
    },
    {
      id: 'rua-xe-dung-cach', cat: 'bao-duong', date: '2026-07-30', author: 'Kỹ thuật viên Hưng Thịnh', img: '1607860108855-64acf2078ed9',
      title: 'Rửa xe đúng cách tại nhà để giữ lớp sơn bền màu',
      excerpt: 'Hai xô nước, khăn microfiber và vài nguyên tắc đơn giản giúp hạn chế xước xoáy trên bề mặt sơn.',
      body: [
        ['p', 'Rửa xe sai cách là nguyên nhân phổ biến gây xước xoáy. Chỉ cần thay đổi vài thói quen, lớp sơn sẽ giữ được độ bóng lâu hơn.'],
        ['h2', 'Dụng cụ cần có'],
        ['ul', ['Hai xô nước: một xô dung dịch, một xô nước sạch để giũ găng', 'Dung dịch rửa xe trung tính, không dùng nước rửa chén', 'Khăn microfiber riêng cho thân xe và mâm']],
        ['h2', 'Quy trình'],
        ['p', 'Xịt trôi bụi bẩn, rửa từ trên xuống dưới, mâm lốp để cuối cùng. Lau khô ngay bằng khăn sạch để tránh vệt nước. Không nên rửa xe dưới nắng gắt.']
      ]
    },
    {
      id: 'chon-camera-hanh-trinh', cat: 'kinh-nghiem', date: '2026-07-12', author: 'Ban biên tập', img: '1449965408869-eaa3f722e40d',
      title: 'Camera hành trình: nên chọn loại nào và lắp ở đâu?',
      excerpt: 'Độ phân giải, góc quay, khả năng ghi đêm và vị trí lắp đặt – những điều cần biết trước khi mua.',
      body: [
        ['p', 'Camera hành trình là phụ kiện đáng đầu tư bậc nhất: ghi lại bằng chứng khi có va chạm và giúp bạn yên tâm hơn khi đỗ xe.'],
        ['h2', 'Tiêu chí lựa chọn'],
        ['ul', ['Độ phân giải tối thiểu Full HD, ưu tiên 2K/4K cho camera trước', 'Góc quay 140–170°', 'Cảm biến tốt cho khả năng ghi hình ban đêm', 'Có chế độ giám sát đỗ xe nếu thường đỗ ngoài trời']],
        ['h2', 'Vị trí lắp đặt'],
        ['p', 'Lắp sau gương chiếu hậu để không che tầm nhìn người lái, đi dây âm theo viền trần và cột A để gọn gàng, an toàn khi túi khí bung.']
      ]
    },
    {
      id: 'lai-xe-troi-mua-ban-dem', cat: 'kinh-nghiem', date: '2026-06-25', author: 'Ban biên tập', img: '1626621394541-b9a48e35a95d',
      title: 'Lái xe trời mưa và ban đêm: những thói quen nên có',
      excerpt: 'Tầm nhìn hạn chế đòi hỏi tài xế chậm lại, bật đèn đúng cách và giữ khoảng cách xa hơn bình thường.',
      body: [
        ['p', 'Trời mưa và ban đêm là hai điều kiện khiến quãng đường phanh dài hơn và tầm nhìn giảm rõ rệt.'],
        ['h2', 'Đèn và kính'],
        ['p', 'Bật đèn chiếu gần khi trời tối hoặc mưa to, chỉ dùng đèn pha khi đường vắng. Giữ kính lái sạch cả mặt trong lẫn mặt ngoài, thay gạt mưa định kỳ.'],
        ['h2', 'Tốc độ và khoảng cách'],
        ['ul', ['Giảm tốc độ 10–20% so với bình thường', 'Tăng gấp đôi khoảng cách với xe phía trước', 'Tránh phanh gấp và đánh lái đột ngột trên mặt đường trơn']]
      ]
    }
  ];

  var FAQS = [
    { cat: 'Mua xe', q: 'Hưng Thịnh Auto khác gì so với mua xe ở nơi khác?', a: 'Đây là website demo minh hoạ. Trong kịch bản mẫu, mỗi xe đều có phiếu kiểm tra tình trạng, giá niêm yết rõ ràng và chính sách đổi trả trong 7 ngày nếu phát hiện sai khác so với mô tả.' },
    { cat: 'Mua xe', q: 'Xe đã qua sử dụng có được kiểm tra kỹ không?', a: 'Mỗi xe được kiểm tra theo danh mục khoảng 180 hạng mục: khung gầm, động cơ, hộp số, hệ thống điện, nội thất và giấy tờ. Kết quả được gửi kèm hồ sơ xe.' },
    { cat: 'Mua xe', q: 'Tôi có thể lái thử trước khi mua không?', a: 'Có. Bạn chỉ cần bấm "Đăng ký lái thử" trên trang chi tiết xe, chọn showroom và thời gian phù hợp, tư vấn viên sẽ liên hệ xác nhận.' },
    { cat: 'Tài chính', q: 'Có hỗ trợ trả góp không? Cần chuẩn bị giấy tờ gì?', a: 'Có hỗ trợ kết nối ngân hàng, vay tới 70–80% giá trị xe tuỳ hồ sơ. Giấy tờ cơ bản gồm CCCD, giấy tờ cư trú và chứng minh thu nhập.' },
    { cat: 'Tài chính', q: 'Đặt cọc online có được hoàn lại không?', a: 'Trong kịch bản demo, tiền cọc được hoàn lại toàn bộ nếu xe không đúng như mô tả khi bạn đến xem trực tiếp.' },
    { cat: 'Bán xe', q: 'Bán xe qua Hưng Thịnh Auto mất bao lâu?', a: 'Sau khi bạn gửi thông tin, chúng tôi liên hệ trong khoảng 15 phút làm việc để hẹn lịch định giá. Thủ tục ký gửi hoặc thu mua có thể hoàn tất trong ngày.' },
    { cat: 'Bán xe', q: 'Xe của tôi đang trả góp ngân hàng có bán được không?', a: 'Được. Chúng tôi hỗ trợ tất toán khoản vay và rút hồ sơ gốc trước khi sang tên cho người mua.' },
    { cat: 'Bảo hành', q: 'Chính sách bảo hành cho xe đã qua sử dụng thế nào?', a: 'Xe đã qua sử dụng được bảo hành động cơ và hộp số tối đa 12 tháng hoặc 20.000 km (tuỳ điều kiện nào đến trước) theo kịch bản minh hoạ.' },
    { cat: 'Bảo hành', q: 'Phụ kiện mua online có được lắp đặt miễn phí?', a: 'Phần lớn phụ kiện được lắp đặt miễn phí khi bạn mang xe đến showroom. Một số hạng mục như lắp mâm, thay ắc quy nên đặt lịch trước để không phải chờ.' }
  ];

  var TESTIMONIALS = [
    { name: 'Anh Minh Quân', car: 'Mua Mazda CX-5', text: 'Tư vấn viên giải thích rõ từng phiên bản, không ép mua. Thủ tục trả góp gọn, nhận xe đúng hẹn.', rate: 5 },
    { name: 'Chị Thu Hà', car: 'Mua Honda CR-V', text: 'Mình được lái thử hai lần trước khi quyết định. Xe giao sạch sẽ, phụ kiện tặng kèm đầy đủ như cam kết.', rate: 5 },
    { name: 'Anh Đức Long', car: 'Bán Ford Ranger', text: 'Gửi thông tin buổi sáng, chiều đã có người hẹn định giá. Giá thu mua hợp lý, thanh toán nhanh.', rate: 5 },
    { name: 'Chị Ngọc Anh', car: 'Mua Kia Seltos', text: 'Showroom sạch, nhân viên nhiệt tình. Mình thích nhất là bảng so sánh xe trên web rất dễ xem.', rate: 4 },
    { name: 'Anh Hoàng Nam', car: 'Mua BMW 320i đã qua sử dụng', text: 'Có phiếu kiểm tra chi tiết từng hạng mục nên yên tâm. Sau 3 tháng xe vẫn chạy rất ổn.', rate: 5 },
    { name: 'Chị Lan Phương', car: 'Thay ắc quy & bóng đèn', text: 'Đặt phụ kiện online, hẹn giờ mang xe đến thay chưa tới 1 tiếng. Giá rõ ràng, không phát sinh.', rate: 5 }
  ];

  window.HT_DATA = {
    U: U, BRANDS: BRANDS, TYPES: TYPES, PRICES: PRICES, COLORS: COLORS, CARS: CARS,
    ACC_CATS: ACC_CATS, ACCESSORIES: ACCESSORIES, SHOWROOMS: SHOWROOMS, REGIONS: REGIONS,
    POST_CATS: POST_CATS, POSTS: POSTS, FAQS: FAQS, TESTIMONIALS: TESTIMONIALS,
    HERO: [
      { img: 'assets/img/hero/hero-1.webp', kicker: 'Sàn mua bán ô tô & phụ kiện', title: 'Chọn xe ưng ý,<br>lăn bánh an tâm', text: 'Hơn 25 mẫu xe mới và xe đã qua sử dụng được kiểm tra kỹ, giá niêm yết minh bạch, hỗ trợ trả góp và lái thử tận nơi.', cta: ['mua-xe.html', 'Khám phá xe'], cta2: ['ban-xe.html', 'Ký gửi bán xe'] },
      { img: 'assets/img/hero/hero-2.webp', kicker: 'Xe gia đình 7 chỗ', title: 'Rộng rãi cho<br>mọi hành trình', text: 'SUV và MPV 7 chỗ cho gia đình đông thành viên – đặt lịch xem xe cuối tuần, nhận ưu đãi phụ kiện đi kèm.', cta: ['mua-xe.html?kieu=mpv,suv', 'Xem xe 7 chỗ'], cta2: ['lien-he.html', 'Nhận tư vấn'] },
      { img: 'assets/img/hero/hero-3.webp', kicker: 'Bán tải & off-road', title: 'Sẵn sàng chinh phục<br>mọi cung đường', text: 'Bán tải mạnh mẽ, dẫn động 4 bánh – kiểm tra gầm và hệ truyền động kỹ lưỡng trước khi bàn giao.', cta: ['mua-xe.html?kieu=ban-tai', 'Xem bán tải'], cta2: ['phu-kien.html', 'Phụ kiện đi kèm'] }
    ]
  };
})();
