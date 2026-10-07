/* AN KHANG AUTO – dữ liệu cửa hàng mẫu (thương hiệu minh hoạ, ảnh từ Wikimedia Commons, Pexels, Unsplash) */
(function () {
  'use strict';

  /* Ảnh Pexels (giấy phép Pexels, dùng miễn phí) – cắt vuông/tỉ lệ theo w,h */
  function P(id, w, h, ext) {
    return 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.' + (ext || 'jpeg') +
      '?auto=compress&cs=tinysrgb&w=' + w + (h ? '&h=' + h + '&fit=crop' : '');
  }
  /* Ảnh Unsplash (giấy phép Unsplash) */
  function U(id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=70';
  }
  /* ảnh sản phẩm đã chuẩn hoá: 800×800, nền trắng, webp (tải về assets/img/products) */
  function img(p) {
    return 'assets/img/products/' + (p.id || p) + '.webp';
  }

  /* ---------- Bộ biểu tượng nét mảnh (inline SVG) ---------- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    cart: '<path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.3"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17.5" cy="20.5" r="1.3"/>',
    cartplus: '<path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.3"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17.5" cy="20.5" r="1.3"/><path d="M13.5 9.5v4M11.5 11.5h4"/>',
    phone: '<path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11.5 11.5 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.6 16.6 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5z"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.5-1.5 2.5-4 2.5h-2"/>',
    chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.8 1.8 0 0 0 8.8 21h6.4a1.8 1.8 0 0 0 1.8-1.5L18 7M9 7V4.5h6V7"/>',
    bolt: '<path d="M13.5 2 4.5 13.5H11L9.8 22l9.7-12.3H13z" fill="currentColor" stroke="none"/>',
    shield: '<path d="M12 2.8 4.5 5.6v5.6c0 4.8 3.1 8.6 7.5 10 4.4-1.4 7.5-5.2 7.5-10V5.6z"/><path d="m8.6 12 2.4 2.4 4.5-4.6"/>',
    truck: '<path d="M2.5 6h11v9.5h-11zM13.5 9.5h4.2l3.3 3.3v2.7h-7.5"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>',
    wrench: '<path d="M14.6 6.2a4.2 4.2 0 0 0 5.2 5.2l-8.7 8.7a2.3 2.3 0 0 1-3.2-3.2L16.6 8.2"/><path d="M14.6 6.2 17.8 3l3.2 3.2-3.2 3.2"/>',
    refresh: '<path d="M20 11.5A8 8 0 0 0 5.6 6.4L4 8M4 3.8V8h4.2M4 12.5a8 8 0 0 0 14.4 5.1L20 16m0 4.2V16h-4.2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    left: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    right: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    down: '<path d="m6 9.5 6 6 6-6"/>',
    up: '<path d="m6 14.5 6-6 6 6"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.2"/><path d="M15.5 8.5V5.7a2.2 2.2 0 0 0-2.2-2.2H5.7a2.2 2.2 0 0 0-2.2 2.2v7.6a2.2 2.2 0 0 0 2.2 2.2h2.8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.8 3.5 8 3.8c-2.4.3-1.8 4.7 4 4.7zM12 8.5s1.2-5 4-4.7c2.4.3 1.8 4.7-4 4.7z"/>',
    star: '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="none"/>',
    pin: '<path d="M12 21.5s-6.8-6.2-6.8-11.6a6.8 6.8 0 0 1 13.6 0c0 5.4-6.8 11.6-6.8 11.6z"/><circle cx="12" cy="9.8" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.5V12l3 2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.3" cy="8.3" r="1.6"/>',
    ticket: '<path d="M3.5 7.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v2.5a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="2 2"/>',
    fb: '<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5z"/>',
    yt: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor"/>',
    car: '<path d="M4 15.5V12l2-4.6A2 2 0 0 1 7.8 6h8.4a2 2 0 0 1 1.8 1.4L20 12v3.5a1 1 0 0 1-1 1h-1.2M6.2 16.5H5a1 1 0 0 1-1-1M9 16.5h6M4.5 12h15"/><circle cx="7.6" cy="16.5" r="1.7"/><circle cx="16.4" cy="16.5" r="1.7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5 11.5V20h14v-8.5M10 20v-5h4v5"/>',
    box: '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    camera: '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 7 10 4.5h4L15.5 7"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 9.5h19M6 15h4"/>',
    bank: '<path d="M3 9.5 12 4l9 5.5M4.5 9.5h15M6 10v7M10 10v7M14 10v7M18 10v7M3.5 19.5h17"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="7.5" width="16.5" height="12" rx="2"/><path d="M20.5 11.5h-4a1.5 1.5 0 0 0 0 3h4"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 19.5h1.5M19.5 14v1.5"/>',
    percent: '<path d="M6 18 18 6"/><circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
    fire: '<path d="M12 21.5c-4 0-7-2.8-7-6.6 0-3.6 2.6-5.4 3.6-8.4.5 1.9 1.6 2.9 2.6 3.3C11 6.4 12.6 4 15 2.5c-.4 3.2 4 5.6 4 11.4 0 4.4-3 7.6-7 7.6z" fill="currentColor" stroke="none"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 2.5-2.5L20 19"/>',
    thumb: '<path d="M7.5 10.5v9h-3v-9zM7.5 10.5 11 3.5c1.6 0 2.6 1.2 2.3 2.8l-.6 3.2h5.4a2 2 0 0 1 2 2.4l-1.3 6.2a2 2 0 0 1-2 1.6H7.5"/>'
  };
  function ic(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Danh mục (ảnh đại diện lấy từ ảnh sản phẩm đã chuẩn hoá) ---------- */
  var CATEGORIES = [
    { key: 'camera', name: 'Camera hành trình', img: 'p01', sub: ['Camera hành trình', 'Bộ đi dây âm', 'Giá hít kính'] },
    { key: 'lop', name: 'Lốp & bơm lốp', img: 'p03', sub: ['Bơm lốp mini', 'Đồng hồ đo áp suất'] },
    { key: 'cuuho', name: 'An toàn – cứu hộ', img: 'p08', sub: ['Búa thoát hiểm', 'Bình chữa cháy', 'Dây câu bình', 'Túi sơ cứu', 'Đèn pin'] },
    { key: 'vesinh', name: 'Hút bụi – vệ sinh', img: 'p10', sub: ['Máy hút bụi cầm tay', 'Khăn microfiber', 'Nước rửa kính'] },
    { key: 'sac', name: 'Sạc – pin dự phòng', img: 'p13', sub: ['Tẩu sạc nhanh', 'Pin dự phòng'] },
    { key: 'thom', name: 'Tinh dầu – khử mùi', img: 'p09', sub: ['Tinh dầu thơm xe'] },
    { key: 'goi', name: 'Gối tựa – tiện nghi', img: 'p16', sub: ['Gối cổ chữ U'] }
  ];

  var CARS = [
    { key: 'vios', name: 'Vios', type: 'Sedan hạng B' },
    { key: 'accent', name: 'Accent', type: 'Sedan hạng B' },
    { key: 'city', name: 'City', type: 'Sedan hạng B' },
    { key: 'cx5', name: 'CX-5', type: 'SUV hạng C' },
    { key: 'xpander', name: 'Xpander', type: 'MPV 7 chỗ' },
    { key: 'vf5', name: 'VF 5', type: 'SUV điện hạng A' },
    { key: 'seltos', name: 'Seltos', type: 'SUV hạng B' },
    { key: 'ranger', name: 'Ranger', type: 'Bán tải' }
  ];

  var ALL = ['all'];
  /* fits: dòng xe đã có bộ lắp đặt riêng (dây nguồn đi âm / giá bắt); 'all' = dùng chung mọi xe.
     tags: ship = Freeship, lap = Lắp tận nơi, m2 = Mua 2 tặng 1, tg = Trả góp 0% */
  var PRODUCTS = [
    { id: 'p01', cat: 'camera', name: 'Camera hành trình kèm giá hít kính và tẩu nguồn 12V', spec: 'Màn hình 2,7 inch · ghi hình vòng lặp', price: 1290000, old: 1690000, rating: 4.8, reviews: 412, sold: 1860, fits: ['vios', 'accent', 'city', 'cx5', 'xpander', 'seltos', 'ranger'], tags: ['ship', 'lap'], hot: true, added: 1,
      desc: 'Camera hành trình gắn kính lái bằng giá hít chân không, cấp nguồn qua tẩu 12V. Ghi hình vòng lặp, tự khoá đoạn video khi có va chạm. An Khang có sẵn bộ dây đi âm trần cho các dòng xe trong danh sách.',
      bullets: ['Màn hình 2,7 inch xem lại tại chỗ', 'Kèm giá hít kính và tẩu nguồn 12V', 'Tự khoá video khi va chạm', 'Đi dây âm trần miễn phí nội thành'] },
    { id: 'p02', cat: 'lop', name: 'Đồng hồ đo áp suất lốp cơ, mặt kim, đầu đo kim loại', spec: 'Không cần pin · đọc trong 2 giây', price: 189000, old: 260000, rating: 4.7, reviews: 233, sold: 1420, fits: ALL, tags: ['m2'], added: 6,
      desc: 'Đồng hồ kim không cần pin, ấn đầu đo vào van là đọc được áp suất lốp. Nhỏ gọn để hộc cửa, dùng được cho ô tô và xe máy.',
      bullets: ['Mặt kim dễ đọc', 'Không cần pin', 'Đầu đo kim loại, kín hơi', 'Bảo hành 6 tháng'] },
    { id: 'p03', cat: 'lop', name: 'Bơm lốp điện mini cầm tay, màn hình số, tự ngắt khi đủ áp', spec: 'Pin sạc · cài sẵn áp suất', price: 790000, old: 1090000, rating: 4.8, reviews: 318, sold: 2240, isNew: true, fits: ALL, tags: ['ship', 'm2'], hot: true, added: 2,
      desc: 'Bơm lốp không dây nhỏ gọn, cài áp suất mong muốn rồi bấm bơm – máy tự ngắt khi đủ. Kèm đầu chuyển cho xe máy, xe đạp và bóng.',
      bullets: ['Màn hình số, tự ngắt khi đủ áp', 'Pin sạc, không cần cắm tẩu', 'Bơm được ô tô, xe máy, xe đạp', 'Bảo hành 12 tháng'] },
    { id: 'p04', cat: 'cuuho', name: 'Dây câu bình ắc quy ô tô, kẹp cách điện đỏ – đen', spec: 'Dây lõi đồng · kẹp bọc nhựa', price: 290000, old: 390000, rating: 4.8, reviews: 156, sold: 980, fits: ALL, tags: ['ship'], added: 7,
      desc: 'Bộ dây câu bình dùng khi ắc quy yếu, không đề được máy. Kẹp bám chắc cọc bình, tay kẹp bọc nhựa cách điện, phân biệt rõ cực đỏ – đen.',
      bullets: ['Dây lõi đồng', 'Kẹp có bọc cách điện', 'Phân biệt rõ cực đỏ – đen', 'Kèm hướng dẫn câu bình'] },
    { id: 'p05', cat: 'cuuho', name: 'Đèn pin LED vỏ nhôm, chống nước, nhỏ gọn để hộc xe', spec: 'Pin sạc · 3 chế độ sáng', price: 249000, old: 350000, rating: 4.7, reviews: 204, sold: 1310, fits: ALL, tags: ['m2'], added: 9,
      desc: 'Đèn pin vỏ nhôm nhỏ gọn để hộc xe, chiếu sáng khi thay lốp hay kiểm tra khoang máy ban đêm. Ba chế độ sáng và chế độ nháy báo hiệu.',
      bullets: ['Vỏ nhôm, chống nước mưa', '3 chế độ sáng + nháy', 'Pin sạc dùng 4–6 giờ', 'Bảo hành 6 tháng'] },
    { id: 'p06', cat: 'cuuho', name: 'Bình chữa cháy bột cho ô tô, có đồng hồ áp và giá bắt', spec: 'Chốt an toàn · vòi phun', price: 450000, old: 590000, rating: 4.8, reviews: 98, sold: 640, fits: ['vios', 'accent', 'city', 'cx5', 'xpander', 'vf5', 'seltos', 'ranger'], tags: ['lap'], added: 4,
      desc: 'Bình chữa cháy bột đặt dưới ghế phụ hoặc trong cốp. An Khang có giá bắt riêng cho từng dòng xe trong danh sách, lắp chắc chắn không rung lắc khi chạy.',
      bullets: ['Có đồng hồ báo áp suất', 'Giá bắt theo xe, không khoan', 'Hướng dẫn sử dụng tiếng Việt', 'Kiểm tra áp miễn phí 12 tháng'] },
    { id: 'p07', cat: 'cuuho', name: 'Túi sơ cứu ô tô nhiều ngăn, có dải phản quang', spec: 'Vải dày · đủ 30 món cơ bản', price: 390000, old: 520000, rating: 4.7, reviews: 87, sold: 420, isNew: true, fits: ALL, tags: ['ship'], added: 10,
      desc: 'Túi sơ cứu nhiều ngăn, đựng sẵn băng gạc, băng dính y tế, kéo, găng tay và dung dịch sát khuẩn. Dải phản quang giúp dễ tìm trong cốp khi trời tối.',
      bullets: ['Đủ 30 món sơ cứu cơ bản', 'Vải dày, nhiều ngăn', 'Dải phản quang', 'Có quai xách và quai đeo'] },
    { id: 'p08', cat: 'cuuho', name: 'Búa thoát hiểm ô tô đầu thép, có dao cắt dây an toàn', spec: 'Tay cầm chống trượt · kèm đế gắn', price: 159000, old: 220000, rating: 4.9, reviews: 265, sold: 2050, fits: ALL, tags: ['m2'], hot: true, added: 3,
      desc: 'Búa thoát hiểm đầu thép đập vỡ kính cửa khi xe gặp sự cố, lưỡi dao trong tay cầm để cắt dây đai an toàn. Kèm đế gắn cạnh ghế lái.',
      bullets: ['Đầu búa thép cứng', 'Dao cắt dây đai an toàn', 'Kèm đế gắn cạnh ghế', 'Màu đỏ dễ thấy'] },
    { id: 'p09', cat: 'thom', name: 'Tinh dầu thơm xe 10 ml, bộ 3 lọ (sả chanh, bạc hà, gỗ thông)', spec: 'Tinh dầu thiên nhiên · lọ thuỷ tinh', price: 189000, old: 260000, rating: 4.7, reviews: 611, sold: 3200, fits: ALL, tags: ['m2'], added: 5,
      desc: 'Ba lọ tinh dầu thiên nhiên để nhỏ vào sáp thơm, đá khuếch tán hoặc kẹp cửa gió. Mùi dịu, không gây say xe, hợp gia đình có trẻ nhỏ.',
      bullets: ['3 mùi: sả chanh, bạc hà, gỗ thông', 'Mỗi lọ 10 ml', 'Không cồn', 'Lọ thuỷ tinh tối màu'] },
    { id: 'p10', cat: 'vesinh', name: 'Máy hút bụi cầm tay không dây cho ô tô, kèm đầu hút khe', spec: 'Pin sạc · cốc chứa bụi trong suốt', price: 690000, old: 990000, rating: 4.8, reviews: 286, sold: 1730, fits: ALL, tags: ['ship', 'm2'], hot: true, added: 8,
      desc: 'Máy hút bụi cầm tay không dây, hút sạch cát, vụn bánh dưới ghế và khe cửa. Cốc chứa bụi trong suốt tháo rửa được, kèm đầu hút khe hẹp.',
      bullets: ['Không dây, pin sạc', 'Cốc bụi trong suốt, rửa được', 'Kèm đầu hút khe', 'Bảo hành 12 tháng'] },
    { id: 'p11', cat: 'vesinh', name: 'Khăn microfiber lau xe, bộ 2 chiếc xanh và cam', spec: 'Sợi siêu mịn · không xơ, không xước', price: 89000, old: 130000, rating: 4.8, reviews: 402, sold: 3850, fits: ALL, tags: ['m2'], added: 11,
      desc: 'Khăn sợi microfiber siêu mịn thấm hút tốt, lau khô thân xe, kính và taplo không để lại vệt, không xước sơn. Giặt máy được.',
      bullets: ['Bộ 2 chiếc: xanh + cam', 'Thấm hút nhanh', 'Không xơ, không xước', 'Giặt máy được'] },
    { id: 'p12', cat: 'vesinh', name: 'Nước rửa kính ô tô dạng xịt, chai 500 ml', spec: 'Không vệt mờ · an toàn với phim cách nhiệt', price: 79000, old: 110000, rating: 4.6, reviews: 175, sold: 1960, fits: ALL, tags: ['m2'], added: 12,
      desc: 'Dung dịch rửa kính dạng xịt, lau sạch bụi, dầu và vết côn trùng trên kính lái mà không để lại vệt mờ. An toàn với phim cách nhiệt và gioăng cao su.',
      bullets: ['Chai xịt 500 ml', 'Không để lại vệt', 'An toàn với phim cách nhiệt', 'Dùng được cho gương, màn hình'] },
    { id: 'p13', cat: 'sac', name: 'Tẩu sạc nhanh ô tô 30W, cổng USB-C và USB-A', spec: 'Sạc nhanh PD · vỏ nhỏ gọn', price: 259000, old: 350000, rating: 4.9, reviews: 266, sold: 1410, fits: ALL, tags: ['ship', 'm2'], added: 13,
      desc: 'Tẩu sạc nhỏ gọn cắm sát ổ 12V, hai cổng USB-C và USB-A sạc cùng lúc cho hai điện thoại. Có bảo vệ quá nhiệt, quá áp.',
      bullets: ['Tổng công suất 30W', 'Cổng USB-C + USB-A', 'Bảo vệ quá nhiệt, quá áp', 'Bảo hành 12 tháng'] },
    { id: 'p14', cat: 'sac', name: 'Pin sạc dự phòng 20.000 mAh, nhiều cổng, sạc nhanh', spec: 'USB-C hai chiều · đèn báo pin', price: 590000, old: 790000, rating: 4.7, reviews: 143, sold: 760, isNew: true, fits: ALL, tags: ['ship'], added: 14,
      desc: 'Pin dự phòng dung lượng lớn cho chuyến đi xa, sạc đầy điện thoại nhiều lần. Nhiều cổng ra, sạc được vài thiết bị cùng lúc.',
      bullets: ['Dung lượng 20.000 mAh', 'Nhiều cổng ra, có USB-C', 'Đèn báo dung lượng', 'Bảo hành 12 tháng'] },
    { id: 'p15', cat: 'sac', name: 'Pin sạc dự phòng 5.000 mAh dạng ống, bỏ túi được', spec: 'Vỏ nhôm · nhỏ gọn', price: 290000, old: 390000, rating: 4.6, reviews: 205, sold: 1180, fits: ALL, tags: ['m2'], added: 15,
      desc: 'Pin dự phòng dạng ống nhỏ gọn, bỏ túi áo hoặc hộc cửa xe. Sạc thêm khoảng một lần đầy cho điện thoại.',
      bullets: ['Dung lượng 5.000 mAh', 'Vỏ nhôm chắc chắn', 'Đèn báo pin', 'Bảo hành 6 tháng'] },
    { id: 'p16', cat: 'goi', name: 'Gối cổ chữ U vải nhung mềm, màu hồng và xám', spec: 'Ruột bông mềm · vỏ tháo giặt', price: 159000, old: 220000, rating: 4.8, reviews: 349, sold: 2380, fits: ALL, tags: ['m2'], added: 16,
      desc: 'Gối chữ U đỡ cổ khi ngồi xe đường dài, vải nhung mềm, ruột bông đàn hồi. Vỏ ngoài tháo ra giặt được. Có màu hồng và xám.',
      bullets: ['Vải nhung mềm', 'Ruột bông đàn hồi', 'Vỏ tháo giặt được', 'Màu hồng, xám'] }
  ];

  var FLASH = [
    { id: 'p03', price: 649000, sold: 41, total: 50 },
    { id: 'p01', price: 1090000, sold: 27, total: 40 },
    { id: 'p10', price: 549000, sold: 34, total: 50 },
    { id: 'p08', price: 119000, sold: 88, total: 100 },
    { id: 'p14', price: 469000, sold: 19, total: 40 },
    { id: 'p02', price: 139000, sold: 46, total: 60 },
    { id: 'p04', price: 219000, sold: 12, total: 30 },
    { id: 'p13', price: 199000, sold: 71, total: 80 }
  ];

  var COMBO_POOL = ['p08', 'p05', 'p02', 'p13', 'p15', 'p16', 'p11', 'p12'];
  var COMBO_GIFT = 'p09';

  /* min: đơn tối thiểu; off: số tiền giảm; pct + max: giảm theo %; ship: giảm phí ship; cat: chỉ áp dụng ngành hàng */
  var VOUCHERS = [
    { code: 'ANKHANG50', title: 'Giảm 50K', cond: 'Đơn từ 299K · Bạn mới', off: 50000, min: 299000, exp: '31/12', kind: 'new' },
    { code: 'CAM10', title: 'Giảm 10%', cond: 'Tối đa 150K · Camera hành trình', pct: 10, max: 150000, min: 1000000, cat: 'camera', exp: '31/10' },
    { code: 'FREESHIP', title: 'Freeship 30K', cond: 'Mọi đơn hàng', ship: 30000, min: 0, exp: '15/11', kind: 'ship' },
    { code: 'GIAM100', title: 'Giảm 100K', cond: 'Đơn từ 1,5 triệu', off: 100000, min: 1500000, exp: '30/11' }
  ];

  var HOT_KEYWORDS = ['bơm lốp', 'camera hành trình', 'búa thoát hiểm', 'pin dự phòng', 'máy hút bụi', 'tinh dầu', 'gối cổ', 'đèn pin'];

  /* Nguồn ảnh sản phẩm (đã chuẩn hoá: nền trắng, 800×800, webp) */
  var CREDITS = [
    { id: 'p01', by: 'Schekinov Alexey Victorovich', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%BE%D1%80_%D0%B4%D0%B2%D1%83%D1%85%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D0%BD%D0%B8%D0%B9_(%D1%81%D0%BD%D0%B8%D0%BC%D0%B0%D0%B5%D1%82_%D0%B2%D0%BD%D1%83%D1%82%D1%80%D0%B8_%D1%81%D0%B0%D0%BB%D0%BE%D0%BD%D0%B0_%D0%B8_%D1%82%D0%BE,_%D1%87%D1%82%D0%BE_%D0%BF%D1%80%D0%BE%D0%B8%D1%81%D1%85%D0%BE%D0%B4%D0%B8%D1%82_%D0%BF%D0%BE_%D0%BF%D1%83%D1%82%D0%B8_%D0%B4%D0%B2%D0%B8%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F_%D0%A2%D0%A1)._%D0%A4%D0%BE%D1%82%D0%BE_%D0%90._%D0%A9%D0%B5%D0%BA%D0%B8%D0%BD%D0%BE%D0%B2%D0%B0.jpg' },
    { id: 'p02', by: 'Tokino', lic: 'Public domain', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Air_pressure_gauge.jpg' },
    { id: 'p03', by: 'Jacek Halicki', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:2023_Xiaomi_Mi_Portable_Air_Compressor_1S.jpg' },
    { id: 'p04', by: 'Qurren', lic: 'CC BY-SA 3.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Booster_cables.jpg' },
    { id: 'p05', by: 'Creative Tools (Halmstad, Thuỵ Điển)', lic: 'CC BY 2.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:CreativeTools.se_-_PackshotCreator_-_Genzo_LED_flashlight_v1_(5639920426).jpg' },
    { id: 'p06', by: 'Jan van der Wolf', lic: 'Giấy phép Pexels', src: 'Pexels', url: 'https://www.pexels.com/photo/19107333/' },
    { id: 'p07', by: '~riley', lic: 'CC BY-SA 3.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:First_aid_1.jpg' },
    { id: 'p08', by: 'Uploader17 (German Wikipedia)', lic: 'Public domain', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Nothammer1.jpg' },
    { id: 'p09', by: 'Tara Winstead', lic: 'Giấy phép Pexels', src: 'Pexels', url: 'https://www.pexels.com/photo/6693967/' },
    { id: 'p10', by: 'Raimond Spekking', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Turbo_Akku_Vac_Easy_Home_VC_618WP-1123.jpg' },
    { id: 'p11', by: 'EvSOP HGUM', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Generic_Ultramicrofiber.jpg' },
    { id: 'p12', by: 'Polina Tankilevitch', lic: 'Giấy phép Pexels', src: 'Pexels', url: 'https://www.pexels.com/photo/4440564/' },
    { id: 'p13', by: 'Qurren', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Ugreen_car_charger_USB-C_USB-A_30W_25845.jpg' },
    { id: 'p14', by: 'Jacek Halicki', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:2023_Powerbank_Green_Cell_PowerPlay_20_(2).jpg' },
    { id: 'p15', by: 'Jacek Halicki', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:2023_Powerbank_Anker_Powercore_5000mAh.jpg' },
    { id: 'p16', by: '감자알찬2', lic: 'CC BY-SA 4.0', src: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:%EB%AA%A9%EB%B0%B0%EA%B2%8C2.jpg' }
  ];

  window.AK = {
    P: P, U: U, img: img, ic: ic,
    CATEGORIES: CATEGORIES, CARS: CARS, PRODUCTS: PRODUCTS, FLASH: FLASH,
    COMBO_POOL: COMBO_POOL, COMBO_GIFT: COMBO_GIFT, VOUCHERS: VOUCHERS, HOT_KEYWORDS: HOT_KEYWORDS, CREDITS: CREDITS
  };
})();
