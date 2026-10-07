/* Bóng Studio – dữ liệu cửa hàng mẫu (thương hiệu minh hoạ, không phải cửa hàng thật) */
(function (w) {
  'use strict';


  /* Ảnh Unsplash (giấy phép miễn phí) */
  function img(id, wd, ht, q) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + wd + (ht ? '&h=' + ht : '') + '&q=' + (q || 70);
  }

  var CATS = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'rua', name: 'Rửa xe', img: '1694678505383-676d78ea3b96' },
    { id: 'bong', name: 'Sáp & ceramic', img: '1632823469850-2f77dd9c7f93' },
    { id: 'khan', name: 'Khăn & dụng cụ', img: '1737065179799-836c057974bb' },
    { id: 'noithat', name: 'Nội thất', img: '1771491237209-b89bc7290588' },
    { id: 'kinh', name: 'Chăm sóc kính', img: '1716366936159-b01e9504634f' }
  ];

  /* Ảnh sản phẩm: ảnh chụp thật (Pexels, Unsplash, Wikimedia Commons), đã chuẩn hoá 800×800 nền trắng.
     img = tệp trong assets/img/products/ ; src = nguồn ảnh gốc ; br = dòng sản phẩm (thương hiệu minh hoạ) */
  var P = [
    { id: 1, cat: 'rua', br: 'Bóng Essentials', name: 'Dung dịch rửa xe pH trung tính Gentle Wash 1L', spec: 'pH 7 · pha 1:400 · an toàn ceramic', price: 189000, old: 239000, rate: 4.9, rv: 412, sold: 3120, hot: 10, gift: 'Tặng 1 mút rửa xe',
      img: 'rua-xe-ph-trung-tinh-1l', src: 'https://www.pexels.com/photo/5217886/',
      desc: 'Công thức bọt dày, bôi trơn tốt giúp mút lướt nhẹ trên sơn, không tẩy sáp hay lớp ceramic. Can 1 lít có quai cầm, pha được khoảng 40 lần rửa.' },
    { id: 2, cat: 'rua', br: 'Bóng Essentials', name: 'Bọt tuyết Snow Foam đậm đặc 1L', spec: 'Bọt dày bám lâu · dùng với bình bọt', price: 229000, old: 269000, rate: 4.8, rv: 286, sold: 2140, hot: 9,
      img: 'bot-tuyet-snow-foam-1l', src: 'https://www.pexels.com/photo/5217898/',
      desc: 'Bọt tuyết đặc như kem, bám trên thân xe 5–7 phút để làm mềm bùn đất trước khi chạm mút – giảm tối đa vết xước khi rửa.' },
    { id: 3, cat: 'rua', br: 'Bóng Pro', name: 'Dung dịch tẩy nhựa đường & keo Tar Off 750ml', spec: 'Gốc dung môi nhẹ · không hại sơn', price: 199000, old: 0, rate: 4.7, rv: 98, sold: 640, hot: 4,
      img: 'tay-nhua-duong-keo', src: 'https://www.pexels.com/photo/5217885/',
      desc: 'Làm tan vết nhựa đường, keo dán decal, nhựa cây chỉ sau 30 giây. Thấm ra khăn rồi lau, không để lại vệt dầu.' },
    { id: 4, cat: 'rua', br: 'Bóng Pro', name: 'Xịt tẩy bụi sắt đổi màu Iron Remover 1L', spec: 'Đổi tím khi phản ứng · không axit', price: 289000, old: 0, rate: 4.8, rv: 174, sold: 980, hot: 6,
      img: 'tay-bui-sat-1l', src: 'https://commons.wikimedia.org/wiki/File:1_liter_trigger_spray_bottle.jpg',
      desc: 'Hoà tan hạt bụi sắt từ má phanh bám vào sơn và mâm. Dung dịch chuyển tím khi phản ứng để bạn thấy rõ hiệu quả. Chai 1 lít có vòi xịt.' },
    { id: 5, cat: 'bong', br: 'Bóng Studio', name: 'Sáp Carnauba thượng hạng dạng hũ 200g', spec: 'Carnauba trắng · bóng ấm, sâu · bền 2–3 tháng', price: 459000, old: 590000, rate: 5.0, rv: 321, sold: 1890, hot: 10, gift: 'Tặng mút thoa sáp',
      img: 'sap-carnauba-hu-200g', src: 'https://www.pexels.com/photo/6963149/',
      desc: 'Sáp mềm pha Carnauba trắng cho độ bóng ướt, ấm và sâu – đặc biệt đẹp trên sơn màu tối. Thoa mỏng bằng mút, đợi 5 phút rồi lau bằng khăn microfiber.' },
    { id: 7, cat: 'bong', br: 'Bóng Essentials', name: 'Xịt bóng nhanh Quick Detailer 1L', spec: 'Xịt – lau trong 1 phút · an toàn ceramic, PPF', price: 249000, old: 299000, rate: 4.9, rv: 368, sold: 2760, hot: 9,
      img: 'quick-detailer-1l', src: 'https://commons.wikimedia.org/wiki/File:1_liter_amber_trigger_spray_bottle.jpg',
      desc: 'Xoá bụi nhẹ, vân tay và vết nước giữa các lần rửa. Thêm độ trơn và bóng tức thì. Chai 1 lít dùng được khoảng 25 lần cho xe sedan.' },
    { id: 9, cat: 'bong', br: 'Bóng Pro', name: 'Dung dịch phủ ceramic 9H 30ml', spec: 'Đủ cho 1 xe sedan · bền đến 2 năm', price: 1290000, old: 1590000, rate: 4.9, rv: 264, sold: 1320, hot: 10, gift: 'Tặng mút thoa & 2 khăn',
      img: 'ceramic-9h-30ml', src: 'https://www.pexels.com/photo/8054398/',
      desc: 'Lọ ceramic 30ml có ống nhỏ giọt, độ cứng 9H, nước lăn thành giọt tròn. Thoa từng ô 50×50 cm, đợi 1–2 phút rồi lau đều. Có video hướng dẫn gửi kèm đơn.' },
    { id: 13, cat: 'khan', br: 'Bóng Essentials', name: 'Bộ 5 khăn microfiber đa năng 40×40cm', spec: '5 màu phân loại · thấm hút nhanh · giặt máy được', price: 199000, old: 249000, rate: 4.8, rv: 307, sold: 3560, hot: 9,
      img: 'bo-5-khan-microfiber', src: 'https://images.unsplash.com/photo-1737091985926-f9acc594fcbb',
      desc: 'Năm màu để phân loại: sơn, kính, nội thất, mâm và lau sáp – tránh nhiễm chéo hoá chất. Sợi mịn, không gây xước sơn.' },
    { id: 14, cat: 'khan', br: 'Bóng Essentials', name: 'Bộ 2 mút rửa xe 2 lớp mềm', spec: 'Mặt mút xốp giữ bọt · mặt nhám cho mâm, lốp', price: 59000, old: 79000, rate: 4.7, rv: 188, sold: 2240, hot: 6,
      img: 'bo-2-mut-rua-xe', src: 'https://www.pexels.com/photo/4440526/',
      desc: 'Mặt mút xốp lỗ to giữ nhiều bọt, lướt êm trên sơn; mặt nhám dùng riêng cho mâm và lốp. Không dùng mặt nhám lên sơn xe.' },
    { id: 21, cat: 'khan', br: 'Bóng Essentials', name: 'Xô rửa xe 10L có quai xách', spec: 'Nhựa PP dày · quai cầm chắc', price: 119000, old: 149000, rate: 4.7, rv: 76, sold: 830, hot: 5,
      img: 'xo-rua-xe-10l', src: 'https://www.pexels.com/photo/15336632/',
      desc: 'Xô 10 lít vừa cho phương pháp rửa hai xô: một xô pha dung dịch, một xô nước sạch để giặt mút sau mỗi ô rửa.' },
    { id: 22, cat: 'khan', br: 'Bóng Essentials', name: 'Bộ 6 cọ lông mềm vệ sinh chi tiết', spec: 'Lông mềm không xước · cán gỗ · 6 cỡ', price: 129000, old: 159000, rate: 4.8, rv: 96, sold: 1040, hot: 5,
      img: 'bo-6-co-ve-sinh-chi-tiet', src: 'https://www.pexels.com/photo/8251147/',
      desc: 'Sáu cọ lông mềm từ bản rộng đến đầu nhọn, dùng chải bụi ở khe gió điều hoà, logo, viền đèn, khe ốp nhựa và quanh ốc mâm. Lông mềm không làm xước nhựa bóng.' },
    { id: 16, cat: 'noithat', br: 'Bóng Essentials', name: 'Dung dịch vệ sinh nội thất đa năng 500ml', spec: 'Da, nỉ, nhựa · mùi trà xanh nhẹ', price: 199000, old: 239000, rate: 4.8, rv: 233, sold: 2050, hot: 7, gift: 'Tặng khăn 40×40',
      img: 've-sinh-noi-that', src: 'https://www.pexels.com/photo/12997254/',
      desc: 'Làm sạch vết bẩn tay, cà phê, bụi trên taplo, ghế da và nỉ. Không để lại độ bóng nhờn, mùi trà xanh dịu nhẹ.' },
    { id: 17, cat: 'noithat', br: 'Bóng Studio', name: 'Dưỡng da ghế pH cân bằng Leather Care 500ml', spec: 'Mềm da · chống nứt nẻ · chai có vòi nhấn', price: 279000, old: 0, rate: 4.9, rv: 112, sold: 690, hot: 5,
      img: 'duong-da-ghe', src: 'https://www.pexels.com/photo/8217467/',
      desc: 'Dưỡng ẩm sâu cho ghế da và vô lăng, giữ độ mềm mại tự nhiên, chống nứt và phai màu do nắng nóng. Nhấn 2–3 lần ra mút, thoa đều.' },
    { id: 18, cat: 'kinh', br: 'Bóng Pro', name: 'Dung dịch lau kính không vệt 500ml', spec: 'Không cồn · an toàn phim cách nhiệt', price: 149000, old: 179000, rate: 4.8, rv: 147, sold: 1180, hot: 6,
      img: 'lau-kinh-500ml', src: 'https://www.pexels.com/photo/4440564/',
      desc: 'Làm sạch màng dầu, vết côn trùng và dấu tay trên kính lái, gương. Không chứa cồn và amoniac nên an toàn cho kính đã dán phim.' },
    { id: 19, cat: 'kinh', br: 'Bóng Pro', name: 'Xịt chống bám nước kính lái Rain Repel 100ml', spec: 'Dạng xịt phun sương · nước tự trôi khi xe chạy · bền 2–3 tháng', price: 259000, old: 299000, rate: 4.7, rv: 91, sold: 820, hot: 5,
      img: 'chong-bam-nuoc-kinh', src: 'https://www.pexels.com/photo/6801177/',
      desc: 'Xịt phun sương lên kính lái sạch, lau đều bằng khăn microfiber để tạo lớp kỵ nước: nước mưa tự trôi khi xe chạy, tăng tầm nhìn ban đêm. Chai 100ml dùng được khoảng 10 lần.' },
    { id: 12, cat: 'kinh', br: 'Bóng Essentials', name: 'Khăn microfiber lau kính không xơ 40×40cm', spec: 'Dệt mỏng · không để lại xơ vải', price: 69000, old: 89000, rate: 4.8, rv: 204, sold: 2930, hot: 6,
      img: 'khan-microfiber-lau-kinh', src: 'https://commons.wikimedia.org/wiki/File:Microfibre_cloth.jpg',
      desc: 'Khăn dệt mỏng chuyên lau kính và gương, không để lại xơ vải hay vệt nước. Giặt tay với nước sạch, phơi khô tự nhiên.' }
  ];

  /* Flash deal: id, giá flash, đã bán / suất */
  var FLASH = [
    { id: 9, price: 1190000, sold: 38, stock: 50 },
    { id: 7, price: 219000, sold: 61, stock: 80 },
    { id: 13, price: 169000, sold: 87, stock: 100 },
    { id: 5, price: 419000, sold: 22, stock: 40 },
    { id: 16, price: 169000, sold: 45, stock: 60 },
    { id: 1, price: 159000, sold: 73, stock: 100 },
    { id: 21, price: 99000, sold: 31, stock: 60 },
    { id: 18, price: 129000, sold: 52, stock: 60 }
  ];

  var SIZES = {
    sedan: { label: 'Sedan', long: 'Sedan / Hatchback', note: '4–5 chỗ: hạng A, B, C, D', img: '1616804087352-0d82fc0c37bf' },
    suv: { label: 'SUV 5 chỗ', long: 'SUV / Crossover 5 chỗ', note: 'Gầm cao 5 chỗ, crossover cỡ B–C', img: '1684849311625-b66671fb66d5' },
    mpv: { label: '7 chỗ', long: 'SUV / MPV 7 chỗ', note: 'SUV 7 chỗ, MPV, bán tải cabin kép', img: '1623371857133-6d5552bbdc13' }
  };

  var PKGS = [
    { id: 'basic', name: 'Cơ bản', alias: 'Bóng Mới', note: 'Làm mới định kỳ 6–12 tháng', price: { sedan: 2900000, suv: 3500000, mpv: 3900000 } },
    { id: 'pro', name: 'Nâng cao', alias: 'Bóng Gương', note: 'Khách chọn nhiều nhất', hot: true, price: { sedan: 8900000, suv: 10500000, mpv: 11200000 }, old: { sedan: 9900000, suv: 11600000, mpv: 12400000 } },
    { id: 'premium', name: 'Cao cấp', alias: 'Bảo vệ toàn diện', note: 'Xe mới, giữ giá trị lâu dài', price: { sedan: 24900000, suv: 29500000, mpv: 31900000 } }
  ];
  var FEATS = [
    ['Rửa bọt tuyết, tẩy bụi sắt & nhựa đường', true, true, true],
    ['Đánh bóng hiệu chỉnh sơn', '1 bước', '2 bước', '3 bước'],
    ['Phủ ceramic 9H', '1 lớp', '2 lớp', '3 lớp'],
    ['Dưỡng nhựa nhám, cao su, lốp', true, true, true],
    ['Phim cách nhiệt', false, 'Kính lái + 4 kính sườn', 'Toàn xe'],
    ['PPF bảo vệ sơn', false, false, 'Trọn đầu xe'],
    ['Vệ sinh nội thất', 'Hút bụi, lau taplo', 'Chuyên sâu', 'Chuyên sâu + khử mùi'],
    ['Thời gian thi công', '4–5 giờ', '1 ngày', '2–3 ngày'],
    ['Bảo hành', '12 tháng', '24 tháng', '5 năm'],
    ['Kiểm tra định kỳ miễn phí', '1 lần', '2 lần/năm', '2 lần/năm']
  ];
  /* Dịch vụ lẻ */
  var SERVICES = [
    { id: 'phim', name: 'Dán phim cách nhiệt', short: 'Phim cách nhiệt', img: '1449965408869-eaa3f722e40d', alt: 'Tài xế nhìn qua kính lái lúc hoàng hôn', desc: 'Cản 99% tia UV, giảm hấp thụ nhiệt, giữ tầm nhìn đêm rõ.', time: '3–4 giờ', warranty: 'Bảo hành 7 năm', price: { sedan: 3500000, suv: 4200000, mpv: 4500000 } },
    { id: 'ppf', name: 'Dán PPF đầu xe', short: 'PPF đầu xe', img: '1646531840695-62810bcd1171', alt: 'Kỹ thuật viên đeo găng miết màng phim lên thân xe', desc: 'Màng TPU 7.5 mil chống đá văng, xước dăm tự liền khi gặp nhiệt.', time: '1 ngày', warranty: 'Bảo hành 5 năm', price: { sedan: 12900000, suv: 15500000, mpv: 16900000 } },
    { id: 'ceramic', name: 'Phủ ceramic 1 lớp', short: 'Phủ ceramic', img: '1652898072202-5084dc85b850', alt: 'Thoa ceramic bằng mút vàng lên mặt sơn', desc: 'Hiệu chỉnh sơn 1 bước, phủ 1 lớp gốm 9H, nước lăn thành giọt.', time: '6–8 giờ', warranty: 'Bảo hành 12 tháng', price: { sedan: 2500000, suv: 3000000, mpv: 3300000 } },
    { id: 'noithat', name: 'Vệ sinh nội thất chuyên sâu', short: 'Vệ sinh nội thất', img: '1771491237218-cbd4a707497e', alt: 'Kỹ thuật viên vệ sinh taplo bằng cọ mềm', desc: 'Hút bụi, giặt ghế nỉ, dưỡng da, khử mùi bằng hơi nước nóng.', time: '3–4 giờ', warranty: 'Kiểm tra lại sau 7 ngày', price: { sedan: 890000, suv: 1090000, mpv: 1290000 } }
  ];

  var COMBO_IDS = [1, 2, 3, 4, 7, 5, 13, 14, 21, 22, 16, 17, 18, 12];
  var COMBO_PRESET = { 1: 1, 7: 1, 13: 1 };
  var GIFT_AT = 1000000;
  var SHIP_FREE_AT = 500000;

  var BRANCHES = [
    { id: 'ninhkieu', name: 'Bóng Studio Ninh Kiều', addr: 'Số 515 Đường Mẫu, P. Tân An, Q. Ninh Kiều, Cần Thơ', hours: '7:30 – 19:00, tất cả các ngày', bays: '6 khoang thi công kín bụi', img: '1767681092416-bccf9410bda4', alt: 'Xưởng thi công sáng đèn với nhiều xe đang chờ', tag: 'Xưởng chính' },
    { id: 'cairang', name: 'Bóng Studio Cái Răng', addr: 'Số 88 Đường Minh Hoạ, P. Hưng Phú, Q. Cái Răng, Cần Thơ', hours: '8:00 – 18:30, tất cả các ngày', bays: '4 khoang · phòng rửa bọt tuyết', img: '1605822167835-d32696aef686', alt: 'Xe sedan trắng trong phòng rửa phủ hơi nước', tag: '' },
    { id: 'binhthuy', name: 'Bóng Studio Bình Thuỷ', addr: 'Số 21 Đường Ví Dụ, P. Bình Thuỷ, Q. Bình Thuỷ, Cần Thơ', hours: '8:00 – 18:00, nghỉ chiều Chủ nhật', bays: '3 khoang · chuyên PPF & phim', img: '1786489785506-9c527aaf908d', alt: 'Kỹ thuật viên chà nhám đuôi xe trong xưởng', tag: 'Mới khai trương' }
  ];

  var TIPS = [
    { img: '1552930294-6b595f4c2974', alt: 'Người đàn ông rửa xe mui trần bằng vòi nước', date: '02/10/2026', read: '4 phút đọc', title: 'Rửa xe hai xô tại nhà: cách đơn giản nhất để hết vết xoáy', ex: 'Xô thứ nhất pha dung dịch pH trung tính, xô thứ hai chỉ chứa nước sạch để giặt găng sau mỗi ô rửa. Rửa từ nóc xuống, mâm và gầm để sau cùng.', pid: 1 },
    { img: '1520340356584-f9917d1eea6f', alt: 'Vòi nước áp lực xối lên đuôi xe màu đen', date: '26/09/2026', read: '3 phút đọc', title: 'Vì sao không nên rửa xe dưới nắng trưa?', ex: 'Nước khô quá nhanh để lại cặn khoáng trên sơn và kính.', pid: 18 },
    { img: '1761934658112-80095148fe87', alt: 'Khăn microfiber lông dày màu xám', date: '18/09/2026', read: '3 phút đọc', title: 'Chọn khăn microfiber: GSM bao nhiêu là đủ?', ex: 'Khăn lau khô nên từ 350 GSM, khăn lau sáp 280–320 GSM.', pid: 13 },
    { img: '1608506375591-b90e1f955e4b', alt: 'Phun bọt tuyết lên xe thể thao màu đen trong gara', date: '09/09/2026', read: '5 phút đọc', title: 'Xe đã phủ ceramic có cần rửa bọt tuyết không?', ex: 'Bọt tuyết làm mềm bụi bẩn trước khi chạm găng, giữ lớp phủ bền hơn.', pid: 2 },
    { img: '1708805282683-50a060eba80f', alt: 'Tay đeo găng chải lốp xe bằng bàn chải', date: '30/08/2026', read: '2 phút đọc', title: 'Vệ sinh mâm xe đúng thứ tự trong 10 phút', ex: 'Luôn rửa mâm trước thân xe để bụi phanh không văng lên sơn sạch.', pid: 22 }
  ];

  /* Đánh giá: s = sao, d = ngày, v = phân loại, ph = ảnh, k = loại (sp/dv), h = hữu ích */
  var REVIEWS = [
    { n: 'Minh Trí', p: 'Ninh Kiều', s: 5, d: '05/10/2026', k: 'dv', v: 'Gói Nâng cao · Sedan', h: 24, ph: ['1619767886558-efdc259cde1a', '1606664515524-ed2f786a0bd6'], q: 'Xe đen 5 năm tuổi mà giờ soi gương được. Kỹ thuật viên chỉ từng vết xoáy trước và sau dưới đèn, giao xe đúng hẹn 17h.' },
    { n: 'Thu Hằng', p: 'Cái Răng', s: 5, d: '03/10/2026', k: 'sp', v: 'Dung dịch phủ ceramic 9H 30ml', h: 18, ph: ['1611239179213-d972da54091a'], q: 'Lần đầu tự phủ ceramic theo video hướng dẫn, mất một buổi chiều. Mưa xong nước lăn tròn, lau rất nhàn. Đóng gói kỹ, có kèm mút thoa và khăn.' },
    { n: 'Quốc Bảo', p: 'Bình Thuỷ', s: 5, d: '01/10/2026', k: 'dv', v: 'Dán PPF đầu xe · 7 chỗ', h: 15, ph: ['1632823642656-f62dbc9b4818', '1632823471565-1ecf94f8799a'], q: 'Chạy đường tỉnh nhiều nên dán PPF đầu xe. Mép cắt gọn, nhìn gần không thấy viền. Được hẹn kiểm tra lại sau 1 tuần.' },
    { n: 'Ngọc Diễm', p: 'Ninh Kiều', s: 5, d: '28/09/2026', k: 'sp', v: 'Bộ 5 khăn microfiber + Quick Detailer 1L', h: 11, ph: ['1761934658038-d0e6792378b1', '1761934657948-708146148588'], q: 'Khăn mềm, thấm nhanh, lau xong không để lại vệt. Xịt bóng nhanh thơm nhẹ, giao trong 2 tiếng.' },
    { n: 'Hoàng Long', p: 'Ô Môn', s: 4, d: '24/09/2026', k: 'dv', v: 'Dán phim cách nhiệt · SUV 5 chỗ', h: 9, ph: [], q: 'Trưa nắng mà trong xe mát hẳn, ban đêm nhìn vẫn rõ. Trừ 1 sao vì phải chờ thêm 20 phút do xe trước làm lâu.', rep: 'Cảm ơn anh Long đã góp ý. Từ tháng 10 xưởng nhận khách theo khung giờ cách nhau 90 phút để anh chị không phải chờ ạ.' },
    { n: 'Kim Ngân', p: 'Cái Răng', s: 5, d: '20/09/2026', k: 'dv', v: 'Vệ sinh nội thất · thi công tận nơi', h: 7, ph: ['1682858110563-3f609263d418'], q: 'Đặt lịch online, đội kỹ thuật đến tận nhà, mang theo máy hơi nước. Ghế da sạch, xe hết mùi ẩm, giá đúng như báo.' },
    { n: 'Thanh Tùng', p: 'Phong Điền', s: 5, d: '15/09/2026', k: 'sp', v: 'Sáp Carnauba dạng hũ 200g', h: 6, ph: ['1708805282706-f44730b7e527'], q: 'Sáp mềm, thoa bằng mút rất dễ, lau lên bóng ấm. Xe đen nhìn sâu hẳn, một hũ dùng được nhiều lần.' },
    { n: 'Bảo Vy', p: 'Ninh Kiều', s: 5, d: '10/09/2026', k: 'dv', v: 'Gói Cao cấp · SUV 5 chỗ', h: 21, ph: ['1786405454372-3fe75969c6b9'], q: 'PPF, ceramic 3 lớp và phim toàn xe. Có phiếu bảo hành điện tử tra bằng số điện thoại, nhân viên tư vấn kỹ, không ép thêm dịch vụ.' },
    { n: 'Đức Anh', p: 'Thốt Nốt', s: 4, d: '06/09/2026', k: 'sp', v: 'Dung dịch rửa xe pH trung tính 1L', h: 3, ph: [], q: 'Bọt nhiều, rửa không bị khô rít. Chai 1 lít dùng được khá lâu. Mong shop có thêm loại can 5 lít.', rep: 'Dạ shop đã ghi nhận, loại can 5 lít dự kiến có hàng trong tháng 11. Anh theo dõi mục Flash deal để nhận giá tốt nhé.' },
    { n: 'Phương Thảo', p: 'Ninh Kiều', s: 5, d: '02/09/2026', k: 'sp', v: 'Dưỡng da ghế Leather Care', h: 4, ph: [], q: 'Ghế da mềm lại, không bóng nhờn, mùi dễ chịu. Shop gọi xác nhận đơn nhanh.' }
  ];
  var RATING = { avg: 4.9, total: 2380, dist: [2190, 160, 18, 7, 5] };

  /* ---------- Icons (inline SVG, nét mảnh) ---------- */
  var IC = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    bag: '<path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    cart: '<path d="M3 4h2.2l2.3 11h10.4l2-7.5H6.4"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    chevL: '<path d="m15 6-6 6 6 6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
    home: '<path d="M4 11 12 4.5l8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M3 6.5h11v9.5H3zM14 9.5h3.8l3.2 3.4V16H14"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.2" cy="17.5" r="1.8"/>',
    van: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    swap: '<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5"/>',
    bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9S10.5 4.5 8 4.5 6 7.5 8 9M12 9s1.5-4.5 4-4.5 2 3 0 4.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    chat: '<path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5H4.5z"/><path d="M8.5 10.5h7"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    drag: '<path d="M9 7 4 12l5 5M15 7l5 5-5 5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8-9-9Z"/><circle cx="8" cy="9" r="1.4"/>',
    headset: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3.5" y="13.5" width="4" height="6" rx="1.5"/><rect x="16.5" y="13.5" width="4" height="6" rx="1.5"/><path d="M18.5 19.5c0 1-1.5 2-4 2"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    receipt: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8.5h6M9 12h6M9 15.5h3"/>',
    thumb: '<path d="M7.5 20H4.5v-9h3zM7.5 11l3.5-7c1.5 0 2.5 1 2.5 2.5V10h5a1.6 1.6 0 0 1 1.6 1.9l-1.4 6.6A2 2 0 0 1 16.7 20H7.5"/>',
    camera: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.2" r="3.4"/>',
    film: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 9h17M8 5v4M12 5v4M16 5v4"/>',
    drop: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>',
    seat: '<path d="M8 3.5h5l-1 9h5.5a2 2 0 0 1 2 2V17H8.5A2.5 2.5 0 0 1 6 14.5z"/><path d="M8 17v3.5M17 17v3.5"/>',
    star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z"/>',
    cash: '<rect x="3" y="6.5" width="18" height="11" rx="1.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    bank: '<path d="M3.5 9 12 4.5 20.5 9"/><path d="M5 9.5v8M9.5 9.5v8M14.5 9.5v8M19 9.5v8M3.5 19.5h17"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 9.5h18M6.5 15h4"/>',
    wallet: '<path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5 15 4.5v3"/><path d="M15.5 13.8h4.5"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM17.5 14H20M14 20h2"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    fire: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.2 2.2-5 3.4-7.6.4 1.6 1.1 2.6 2.2 3.2.2-3 1.4-5.6 3.6-7.1-.3 2.9.9 4.8 2.3 6.6 1.1 1.4 1.5 3 1.5 4.9 0 3.4-2.6 6-6.5 6Z"/>'
  };
  function icon(name, cls) {
    var d = IC[name]; if (!d) return '';
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* ---------- Ảnh sản phẩm (ảnh thật đã chuẩn hoá, tải lười) ---------- */
  function packshot(p, eager) {
    return '<img class="pk-img" src="assets/img/products/' + p.img + '.webp" width="800" height="800" alt="' + p.name.replace(/"/g, '') + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }

  w.BONG = {
    img: img, CATS: CATS, P: P, FLASH: FLASH, PKGS: PKGS, FEATS: FEATS, SIZES: SIZES, SERVICES: SERVICES,
    COMBO_IDS: COMBO_IDS, COMBO_PRESET: COMBO_PRESET, GIFT_AT: GIFT_AT, SHIP_FREE_AT: SHIP_FREE_AT,
    BRANCHES: BRANCHES, TIPS: TIPS, REVIEWS: REVIEWS, RATING: RATING, icon: icon, packshot: packshot
  };
})(window);
