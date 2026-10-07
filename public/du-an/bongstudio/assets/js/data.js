/* BÓNG STUDIO – dữ liệu cửa hàng mẫu (thương hiệu minh hoạ) */
(function (w) {
  'use strict';

  var G = '#c8a45c', GREEN = '#0f3d32', IVORY = '#faf7f2';

  var CATS = [
    { id: 'all', name: 'Tất cả' },
    { id: 'rua', name: 'Rửa xe', desc: 'pH trung tính, bọt tuyết, tẩy bụi sắt', rep: 1 },
    { id: 'bong', name: 'Đánh bóng & sáp', desc: 'Sáp Carnauba, kem xoá xước', rep: 5 },
    { id: 'ceramic', name: 'Ceramic', desc: 'Phủ DIY 9H, top-coat', rep: 9 },
    { id: 'khan', name: 'Khăn & phụ kiện', desc: 'Microfiber, mút, bàn chải', rep: 13 },
    { id: 'noithat', name: 'Nội thất & nhựa', desc: 'Dưỡng nhựa, vệ sinh da', rep: 16 },
    { id: 'kinh', name: 'Kính', desc: 'Tẩy ố, chống bám nước', rep: 18 },
    { id: 'may', name: 'Máy & dụng cụ', desc: 'Máy đánh bóng, bình bọt', rep: 20 }
  ];

  /* t = kiểu packshot; c = [thân, nắp, nhãn, chữ] ; lab = 2 dòng trên nhãn ; sub = dòng phụ */
  var P = [
    { id: 1, cat: 'rua', name: 'Dung dịch rửa xe pH trung tính 1L', spec: 'pH 7 · tỉ lệ pha 1:400 · an toàn ceramic', price: 189000, old: 239000, rate: 4.9, rv: 412, sold: 3120, hot: 10,
      t: 'bottle', c: ['#1f5a4a', '#c8a45c', '#faf7f2', '#0f3d32'], lab: ['GENTLE', 'WASH'], sub: 'pH 7 · 1L',
      desc: 'Công thức bọt dày, bôi trơn tốt giúp găng lướt nhẹ trên sơn, không tẩy sáp hay lớp ceramic. Mùi chanh sả dễ chịu, phân huỷ sinh học.' },
    { id: 2, cat: 'rua', name: 'Bọt tuyết Snow Foam đậm đặc 1L', spec: 'Bọt dày bám lâu · dùng với bình bọt', price: 229000, old: 269000, rate: 4.8, rv: 286, sold: 2140, hot: 9,
      t: 'bottle', c: ['#e9dfcb', '#0f3d32', '#0f3d32', '#faf7f2'], lab: ['SNOW', 'FOAM'], sub: 'Đậm đặc · 1L',
      desc: 'Bọt tuyết đặc như kem, bám trên thân xe 5–7 phút để làm mềm bùn đất trước khi chạm găng – giảm tối đa vết xước khi rửa.' },
    { id: 3, cat: 'rua', name: 'Dung dịch tẩy bụi sắt đổi màu 500ml', spec: 'Đổi tím khi phản ứng · không axit', price: 259000, old: 0, rate: 4.8, rv: 174, sold: 980, hot: 6,
      t: 'spray', c: ['#6b3d55', '#1d2a26', '#faf7f2', '#6b3d55'], lab: ['IRON', 'REMOVER'], sub: '500ml',
      desc: 'Hoà tan hạt bụi sắt từ má phanh bám vào sơn và mâm. Dung dịch chuyển tím khi phản ứng để bạn thấy rõ hiệu quả.' },
    { id: 4, cat: 'rua', name: 'Dung dịch tẩy nhựa đường & keo 500ml', spec: 'Gốc dung môi nhẹ · không hại sơn', price: 199000, old: 0, rate: 4.7, rv: 98, sold: 640, hot: 3,
      t: 'spray', c: ['#3d5a6c', '#1d2a26', '#faf7f2', '#3d5a6c'], lab: ['TAR &', 'GLUE OFF'], sub: '500ml',
      desc: 'Làm tan vết nhựa đường, keo dán decal, nhựa cây chỉ sau 30 giây. Lau lại bằng khăn microfiber, không để lại vệt dầu.' },
    { id: 5, cat: 'bong', name: 'Sáp Carnauba thượng hạng 200g', spec: 'Carnauba trắng · độ bóng ấm, sâu', price: 459000, old: 590000, rate: 5.0, rv: 321, sold: 1890, hot: 10,
      t: 'tin', c: ['#1d2a26', '#c8a45c', '#c8a45c', '#0f3d32'], lab: ['CARNAUBA', 'WAX'], sub: '200g',
      desc: 'Sáp cứng pha Carnauba trắng loại 1 cho độ bóng ướt, ấm và sâu – đặc biệt đẹp trên sơn màu tối. Bền 2–3 tháng.' },
    { id: 6, cat: 'bong', name: 'Kem đánh bóng 1 bước xoá xước nhẹ 500ml', spec: 'Cắt & hoàn thiện trong 1 lần', price: 389000, old: 0, rate: 4.8, rv: 156, sold: 870, hot: 7,
      t: 'bottle', c: ['#b5654a', '#1d2a26', '#faf7f2', '#b5654a'], lab: ['ONE STEP', 'POLISH'], sub: 'Xoá xước · 500ml',
      desc: 'Hạt mài giảm dần xoá vết xoáy, ố mờ và xước dăm, đồng thời để lại bề mặt trong bóng. Dùng tay hoặc máy đánh bóng.' },
    { id: 7, cat: 'bong', name: 'Xịt bóng nhanh Quick Detailer 500ml', spec: 'Xịt – lau trong 1 phút · thêm 20% độ bóng', price: 219000, old: 259000, rate: 4.9, rv: 368, sold: 2760, hot: 9,
      t: 'spray', c: ['#c8a45c', '#0f3d32', '#0f3d32', '#faf7f2'], lab: ['QUICK', 'DETAILER'], sub: '500ml',
      desc: 'Xoá bụi nhẹ, vân tay và vết nước giữa các lần rửa. Thêm độ trơn và bóng tức thì, an toàn cho ceramic và PPF.' },
    { id: 8, cat: 'bong', name: 'Sáp lỏng tổng hợp Sealant 6 tháng 500ml', spec: 'Polymer bền 6 tháng · dễ thoa', price: 349000, old: 0, rate: 4.7, rv: 122, sold: 760, hot: 5,
      t: 'bottle', c: ['#2f4a5a', '#c8a45c', '#faf7f2', '#2f4a5a'], lab: ['PAINT', 'SEALANT'], sub: '6 tháng · 500ml',
      desc: 'Lớp polymer tổng hợp tạo màng bảo vệ đến 6 tháng, chống tia UV, nước lăn thành giọt. Thoa mỏng, lau sau 10 phút.' },
    { id: 9, cat: 'ceramic', name: 'Bộ ceramic phủ DIY 9H 30ml', spec: 'Đủ cho 1 xe · bền 2 năm · kèm phụ kiện', price: 1290000, old: 1590000, rate: 4.9, rv: 264, sold: 1320, hot: 10,
      t: 'kit', c: ['#0f3d32', '#c8a45c', '#5a3b1a', '#faf7f2'], lab: ['CERAMIC', '9H'], sub: '30ml',
      desc: 'Bộ phủ gốm tự làm gồm lọ ceramic 30ml, mút thoa, 2 khăn microfiber và găng tay. Độ cứng 9H, góc tiếp xúc nước trên 110°.' },
    { id: 10, cat: 'ceramic', name: 'Xịt ceramic bảo dưỡng Top-coat 500ml', spec: 'Gia hạn lớp phủ · SiO2', price: 329000, old: 0, rate: 4.8, rv: 141, sold: 930, hot: 7,
      t: 'spray', c: ['#0f3d32', '#c8a45c', '#c8a45c', '#0f3d32'], lab: ['CERAMIC', 'TOP-COAT'], sub: 'SiO2 · 500ml',
      desc: 'Xịt SiO2 nạp lại hiệu ứng lá sen cho lớp ceramic sau 3 tháng sử dụng. Dùng được cho xe chưa phủ để tạo lớp bảo vệ nhanh.' },
    { id: 11, cat: 'ceramic', name: 'Ceramic cho mâm & kẹp phanh 15ml', spec: 'Chịu nhiệt 600°C · chống bám bụi phanh', price: 690000, old: 790000, rate: 4.7, rv: 64, sold: 310, hot: 4,
      t: 'dropper', c: ['#3a2a18', '#1d2a26', '#c8a45c', '#0f3d32'], lab: ['WHEEL', 'CERAMIC'], sub: '15ml',
      desc: 'Lớp gốm chịu nhiệt cao dành riêng cho mâm và kẹp phanh, giúp bụi phanh khó bám, rửa mâm chỉ cần xịt nước.' },
    { id: 12, cat: 'khan', name: 'Khăn microfiber lau khô waffle 60×90', spec: '380 GSM · thấm hút gấp 7 lần', price: 159000, old: 199000, rate: 4.9, rv: 452, sold: 4100, hot: 8,
      t: 'cloth', c: ['#0f3d32', '#c8a45c', '#e9dfcb', '#faf7f2'], lab: ['WAFFLE', '60×90'], sub: '380GSM',
      desc: 'Dệt tổ ong dày, thấm khô cả nóc xe SUV trong 1 lượt kéo. Viền bọc lụa không gây xước, giặt máy được.' },
    { id: 13, cat: 'khan', name: 'Bộ 5 khăn microfiber đa năng 40×40', spec: '5 màu phân loại · không viền', price: 199000, old: 0, rate: 4.8, rv: 307, sold: 3560, hot: 8,
      t: 'cloth', c: ['#c8a45c', '#7fa392', '#b5654a', '#0f3d32'], lab: ['MICRO', 'FIBER'], sub: '5 khăn',
      desc: 'Năm màu để phân loại: sơn, kính, nội thất, mâm và lau sáp – tránh nhiễm chéo hoá chất. Cắt laser không viền.' },
    { id: 14, cat: 'khan', name: 'Bộ 6 mút thoa sáp & ceramic', spec: 'Mút xốp mịn · có rãnh cầm', price: 129000, old: 0, rate: 4.7, rv: 88, sold: 1240, hot: 4,
      t: 'pads', c: ['#c8a45c', '#0f3d32', '#e9dfcb', '#0f3d32'], lab: ['', ''], sub: '',
      desc: 'Mút thoa mật độ cao giúp trải sáp, ceramic, dưỡng nhựa thật mỏng và đều. Có rãnh cầm chắc tay, giặt tái sử dụng.' },
    { id: 15, cat: 'noithat', name: 'Dung dịch dưỡng nhựa nhám & cao su 300ml', spec: 'Phục hồi màu đen · chống UV', price: 189000, old: 229000, rate: 4.8, rv: 196, sold: 1450, hot: 6,
      t: 'bottle', c: ['#1d2a26', '#c8a45c', '#c8a45c', '#1d2a26'], lab: ['TRIM', 'RESTORE'], sub: 'Chống UV · 300ml',
      desc: 'Trả lại màu đen sâu cho ốp nhựa, gioăng cao su đã bạc màu. Khô ráo, không nhờn, không chảy vệt khi gặp mưa.' },
    { id: 16, cat: 'noithat', name: 'Dung dịch vệ sinh nội thất đa năng 500ml', spec: 'Da, nỉ, nhựa · khử mùi nhẹ', price: 199000, old: 239000, rate: 4.8, rv: 233, sold: 2050, hot: 7,
      t: 'spray', c: ['#7fa392', '#0f3d32', '#faf7f2', '#0f3d32'], lab: ['INTERIOR', 'CLEANER'], sub: '500ml',
      desc: 'Làm sạch vết bẩn tay, cà phê, bụi trên taplo, ghế da và nỉ. Không để lại độ bóng nhờn, mùi trà xanh dịu nhẹ.' },
    { id: 17, cat: 'noithat', name: 'Dưỡng da ghế pH cân bằng 250ml', spec: 'Mềm da · chống nứt nẻ', price: 279000, old: 0, rate: 4.9, rv: 112, sold: 690, hot: 5,
      t: 'bottle', c: ['#8a5a3c', '#1d2a26', '#faf7f2', '#8a5a3c'], lab: ['LEATHER', 'CARE'], sub: 'pH 5.5 · 250ml',
      desc: 'Dưỡng ẩm sâu cho ghế da và vô lăng, giữ độ mềm mại tự nhiên, chống nứt và phai màu do nắng nóng.' },
    { id: 18, cat: 'kinh', name: 'Dung dịch tẩy ố kính & cặn nước 250ml', spec: 'Xoá ố mốc kính · không xước', price: 239000, old: 0, rate: 4.8, rv: 147, sold: 1180, hot: 6,
      t: 'bottle', c: ['#d7e6ea', '#3d5a6c', '#3d5a6c', '#faf7f2'], lab: ['GLASS', 'SPOT OFF'], sub: '250ml',
      desc: 'Dạng kem mịn xoá vết ố mốc, cặn canxi trên kính lái, gương và kính sườn. Kính trong lại như mới chỉ sau một lần.' },
    { id: 19, cat: 'kinh', name: 'Phủ chống bám nước kính 100ml', spec: 'Nước trôi khi chạy trên 60 km/h', price: 259000, old: 299000, rate: 4.7, rv: 91, sold: 820, hot: 5,
      t: 'dropper', c: ['#2f4a5a', '#1d2a26', '#faf7f2', '#2f4a5a'], lab: ['RAIN', 'REPEL'], sub: '100ml',
      desc: 'Lớp phủ kỵ nước cho kính lái, giúp nước mưa tự trôi khi xe chạy, tăng tầm nhìn ban đêm. Bền 3–4 tháng.' },
    { id: 20, cat: 'may', name: 'Máy đánh bóng mini cầm tay 12V', spec: 'Quỹ đạo kép · 6 tốc độ · 2 pin', price: 1890000, old: 2290000, rate: 4.8, rv: 76, sold: 410, hot: 9,
      t: 'polisher', c: ['#0f3d32', '#c8a45c', '#1d2a26', '#c8a45c'], lab: ['', ''], sub: '',
      desc: 'Máy đánh bóng quỹ đạo kép nhỏ gọn, an toàn cho người mới. Kèm 2 pin 12V, 3 phớt đánh bóng và túi đựng.' },
    { id: 21, cat: 'may', name: 'Bình phun bọt tuyết áp lực 2L', spec: 'Bơm tay · béc phun chỉnh được', price: 459000, old: 0, rate: 4.6, rv: 69, sold: 520, hot: 4,
      t: 'sprayer', c: ['#dfe9e4', '#7fa392', '#0f3d32', '#0f3d32'], lab: ['', ''], sub: '',
      desc: 'Bình bơm tay tạo bọt tuyết mà không cần máy rửa áp lực. Béc phun xoay chỉnh từ tia đến quạt, dung tích 2 lít.' },
    { id: 22, cat: 'may', name: 'Bàn chải mâm lông mềm', spec: 'Lông nhân tạo siêu mềm · cán bọc cao su', price: 149000, old: 0, rate: 4.7, rv: 58, sold: 660, hot: 3,
      t: 'brush', c: ['#0f3d32', '#c8a45c', '#e9dfcb', '#0f3d32'], lab: ['', ''], sub: '',
      desc: 'Lông mềm len lỏi vào khe nan mâm và kẹp phanh mà không xước. Lõi kim loại bọc nhựa, không gây trầy mâm.' }
  ];

  var PKGS = [
    { id: 'basic', name: 'Cơ bản', alias: 'Bóng Mới', tag: 'Làm mới định kỳ', price: { sedan: 2900000, suv: 3500000, pickup: 3900000 } },
    { id: 'pro', name: 'Nâng cao', alias: 'Bóng Gương', tag: 'Được chọn nhiều nhất', hot: true, price: { sedan: 8900000, suv: 10500000, pickup: 11200000 } },
    { id: 'premium', name: 'Cao cấp', alias: 'Giáp Toàn Diện', tag: 'Bảo vệ tối đa', price: { sedan: 24900000, suv: 29500000, pickup: 31900000 } }
  ];
  var FEATS = [
    ['Rửa bọt tuyết & tẩy bụi sắt', true, true, true],
    ['Đánh bóng hiệu chỉnh sơn', '1 bước', '2 bước', '3 bước'],
    ['Phủ ceramic 9H', '1 lớp', '2 lớp', '3 lớp'],
    ['Dưỡng nhựa & cao su', true, true, true],
    ['Phim cách nhiệt', false, 'Kính lái + sườn', 'Toàn xe'],
    ['PPF bảo vệ sơn', false, false, 'Trọn đầu xe'],
    ['Vệ sinh nội thất', 'Cơ bản', 'Chuyên sâu', 'Chuyên sâu + khử mùi'],
    ['Thời gian thi công', '4 giờ', '1 ngày', '2–3 ngày'],
    ['Bảo hành', '12 tháng', '24 tháng', '5 năm']
  ];
  var SIZES = {
    sedan: { label: 'Sedan', note: 'Sedan · 4–5 chỗ, xe hạng B, C, D' },
    suv: { label: 'SUV', note: 'SUV / MPV · 5–7 chỗ, gầm cao' },
    pickup: { label: 'Bán tải', note: 'Bán tải · cabin kép, thùng sau' }
  };
  var SERVICES = {
    phim: { sedan: 3500000, suv: 4200000, pickup: 4500000 },
    ppf: { sedan: 12900000, suv: 15500000, pickup: 16900000 },
    ceramic: { sedan: 2500000, suv: 3000000, pickup: 3300000 }
  };

  var COMBO_IDS = [1, 2, 3, 6, 7, 9, 10, 12, 13, 15, 16, 18];
  var COMBO_PRESET = { 1: 1, 7: 1, 13: 1 };
  var GIFT_AT = 1000000;

  var TIPS = [
    { img: 'photo-1552930294-6b595f4c2974', alt: 'Người đàn ông rửa xe mui trần bằng vòi nước', tag: '3 phút đọc', title: 'Rửa hai xô – tạm biệt vết xoáy',
      steps: ['Xô 1 pha dung dịch pH trung tính, xô 2 nước sạch để giặt găng.', 'Rửa từ nóc xuống, phần gầm và mâm để cuối cùng.', 'Găng rơi xuống đất? Thay găng mới, đừng tiếc.'], pid: 1 },
    { img: 'photo-1520340356584-f9917d1eea6f', alt: 'Vòi nước áp lực xối lên đuôi xe màu đen', tag: '2 phút đọc', title: 'Đừng rửa xe dưới nắng gắt',
      steps: ['Nước khô quá nhanh sẽ để lại vết ố khoáng khó tẩy.', 'Rửa lúc sáng sớm hoặc chiều mát, bề mặt sơn nguội.', 'Kính đã ố? Dùng kem tẩy ố kính, lau theo vòng tròn nhỏ.'], pid: 18 },
    { img: 'photo-1514316454349-750a7fd3da3a', alt: 'Cận cảnh nắp capo và đèn pha xe màu xám', tag: '2 phút đọc', title: 'Lau khô bằng khăn waffle, đừng chà',
      steps: ['Trải khăn lên bề mặt rồi kéo nhẹ về một hướng.', 'Xịt bóng nhanh làm chất bôi trơn để khăn lướt êm.', 'Giặt khăn riêng, không dùng nước xả vải.'], pid: 12 },
    { img: 'photo-1542282088-72c9c27ed0cd', alt: 'Xe sedan màu bạc đỗ trong hầm xe tối', tag: '3 phút đọc', title: 'Bảo dưỡng ceramic mỗi 3 tháng',
      steps: ['Chỉ rửa bằng dung dịch pH trung tính, tránh xà phòng rửa chén.', 'Xịt ceramic top-coat để nạp lại hiệu ứng lá sen.', 'Kiểm tra miễn phí tại studio sau mỗi 6 tháng.'], pid: 10 }
  ];

  var REVIEWS = [
    { n: 'Anh Minh Trí', p: 'Ninh Kiều', car: 'Sedan hạng C', s: 5, t: 'Gói Nâng cao', q: 'Xe đen 5 năm tuổi mà giờ soi gương được. Kỹ thuật viên chỉ từng vết xoáy trước và sau dưới đèn, rất có tâm.' },
    { n: 'Chị Thu Hằng', p: 'Cái Răng', car: 'SUV 7 chỗ', s: 5, t: 'Bộ ceramic DIY 9H', q: 'Lần đầu tự phủ ceramic theo video hướng dẫn, mất một buổi chiều. Mưa xong nước lăn tròn như lá sen, quá đã.' },
    { n: 'Anh Quốc Bảo', p: 'Bình Thuỷ', car: 'Bán tải', s: 5, t: 'Dán PPF đầu xe', q: 'Chạy đường đất nhiều nên dán PPF đầu xe. Đường cắt mép gọn, không thấy viền, vết xước nhỏ tự liền khi phơi nắng.' },
    { n: 'Chị Ngọc Diễm', p: 'Ninh Kiều', car: 'Hatchback', s: 5, t: 'Khăn waffle + Quick Detailer', q: 'Khăn waffle thấm cực nhanh, lau nóc xe một lượt là khô. Xịt bóng nhanh thơm nhẹ, xe lúc nào cũng như mới rửa.' },
    { n: 'Anh Hoàng Long', p: 'Ô Môn', car: 'SUV 5 chỗ', s: 4, t: 'Phim cách nhiệt', q: 'Trưa nắng Cần Thơ mà trong xe mát hẳn, nhìn ban đêm vẫn rõ. Trừ 1 sao vì phải chờ thêm 20 phút do khách trước.' },
    { n: 'Chị Kim Ngân', p: 'Cái Răng', car: 'Sedan hạng B', s: 5, t: 'Thi công tận nơi', q: 'Đặt lịch online, đội kỹ thuật đến tận nhà vệ sinh nội thất và phủ ceramic. Sạch sẽ, gọn gàng, giá đúng như báo.' },
    { n: 'Anh Thanh Tùng', p: 'Phong Điền', car: 'Bán tải', s: 5, t: 'Máy đánh bóng mini', q: 'Máy nhẹ, dễ dùng cho người mới, xoá được mấy vết xước do cành cây. Pin dùng đủ đánh nửa xe.' },
    { n: 'Chị Bảo Vy', p: 'Ninh Kiều', car: 'Crossover', s: 5, t: 'Gói Cao cấp', q: 'Đáng từng đồng: PPF, ceramic 3 lớp và phim toàn xe. Có phiếu bảo hành điện tử, tra cứu bằng số điện thoại rất tiện.' }
  ];

  /* ---------- Icons (inline SVG, không dùng <use> để an toàn khi chèn <base href>) ---------- */
  var IC = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    bag: '<path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    drop: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2 2.3"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    van: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
    bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9S10.5 4.5 8 4.5 6 7.5 8 9M12 9s1.5-4.5 4-4.5 2 3 0 4.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    chat: '<path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5H4.5z"/><path d="M8.5 10.5h7"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    sedan: '<path d="M2.5 15.5v-2.2c0-.8.5-1.4 1.3-1.6l3.2-.8 2.6-2.9c.4-.4.9-.6 1.5-.6h4.4c.6 0 1.2.3 1.6.8l2.2 2.7 1.6.4c.8.2 1.4.9 1.4 1.7v2.5h-2"/><path d="M8.6 15.5h6.8"/><circle cx="6.5" cy="15.8" r="1.9"/><circle cx="17.5" cy="15.8" r="1.9"/>',
    suv: '<path d="M2.5 16v-4.5c0-.6.4-1.1 1-1.3l1.5-.5 1.6-3.2c.3-.6.9-1 1.6-1h8.3c.7 0 1.3.4 1.6 1l1.9 3.4 1.5.4c.5.2.9.6.9 1.2V16h-2"/><path d="M8.6 16h6.8M5 10h14"/><circle cx="6.5" cy="16.3" r="1.9"/><circle cx="17.5" cy="16.3" r="1.9"/>',
    pickup: '<path d="M2.5 16v-4c0-.6.4-1 1-1.1L6 10.4 8 7c.3-.5.8-.8 1.4-.8h3.1c.6 0 1 .4 1 1v3.7h7.5c.5 0 1 .4 1 1V16h-2"/><path d="M8.6 16h6.8M13.5 10.9H6"/><circle cx="6.5" cy="16.3" r="1.9"/><circle cx="17.5" cy="16.3" r="1.9"/>',
    drag: '<path d="M9 7 4 12l5 5M15 7l5 5-5 5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>'
  };
  function icon(name, cls) {
    var d = IC[name]; if (!d) return '';
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* ---------- Packshot SVG (chai, hũ, khăn… vẽ bằng SVG theo màu thương hiệu) ---------- */
  var uidN = 0;
  function txt(x, y, s, size, fill, weight, ls, family, maxW) {
    if (!s) return '';
    if (maxW) { var est = s.length * size * 0.66 + s.length * (ls || 0); if (est > maxW) size = +(size * maxW / est).toFixed(2); }
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + size + '" font-weight="' + (weight || 700) + '" fill="' + fill + '"' +
      (ls ? ' letter-spacing="' + ls + '"' : '') + (family ? ' font-family="' + family + '"' : '') + '>' + s + '</text>';
  }
  var SERIF = "'Playfair Display', Georgia, serif";
  function packshot(p) {
    var u = 'k' + (++uidN), c = p.c, b = c[0], cap = c[1], lab = c[2], ink = c[3];
    var defs = '<defs>' +
      '<linearGradient id="' + u + 'h" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".16" stop-color="#fff" stop-opacity=".26"/><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>' +
      '<linearGradient id="' + u + 'v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>' +
      '<radialGradient id="' + u + 's"><stop offset="0" stop-color="#0f3d32" stop-opacity=".30"/><stop offset="1" stop-color="#0f3d32" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    var H = 'url(#' + u + 'h)', V = 'url(#' + u + 'v)';
    var shadow = '<ellipse cx="100" cy="222" rx="78" ry="12" fill="url(#' + u + 's)"/>';
    var s = '';
    var l1 = p.lab[0], l2 = p.lab[1];
    switch (p.t) {
      case 'bottle':
        var body = 'M58 84Q58 60 84 58H116Q142 60 142 84V204Q142 220 126 220H74Q58 220 58 204Z';
        s += '<rect x="86" y="44" width="28" height="16" fill="' + cap + '"/><rect x="86" y="44" width="28" height="16" fill="' + H + '"/>';
        s += '<rect x="79" y="16" width="42" height="32" rx="7" fill="' + cap + '"/><rect x="79" y="16" width="42" height="32" rx="7" fill="' + H + '"/>';
        s += '<path d="' + body + '" fill="' + b + '"/><path d="' + body + '" fill="' + H + '"/>';
        s += '<rect x="66" y="106" width="68" height="92" rx="7" fill="' + lab + '"/>';
        s += txt(100, 124, 'BÓNG', 8, cap === lab ? ink : (lab === '#faf7f2' || lab === '#e9dfcb' ? '#a3833f' : G), 700, 2.4);
        s += txt(100, 147, l1, 13.5, ink, 700, .4, 0, 60) + txt(100, 163, l2, 13.5, ink, 700, .4, 0, 60);
        s += '<rect x="80" y="172" width="40" height="1.2" fill="' + ink + '" opacity=".35"/>';
        s += txt(100, 186, p.sub, 7.6, ink, 500, .3, 0, 60);
        s += '<rect x="64" y="70" width="7" height="128" rx="3.5" fill="#fff" opacity=".28"/>';
        break;
      case 'spray':
        var sb = 'M64 104Q64 90 80 88H120Q136 90 136 104V206Q136 220 122 220H78Q64 220 64 206Z';
        s += '<path d="' + sb + '" fill="' + b + '"/><path d="' + sb + '" fill="' + H + '"/>';
        s += '<rect x="84" y="72" width="32" height="18" rx="3" fill="' + cap + '"/><rect x="84" y="72" width="32" height="18" rx="3" fill="' + H + '"/>';
        s += '<path d="M109 56 99 92Q97 99 104 96L118 60Z" fill="' + cap + '"/>';
        s += '<path d="M82 30H130Q142 30 142 42V54H121L116 72H86L82 54Q70 52 70 41Q70 30 82 30Z" fill="' + cap + '"/><path d="M82 30H130Q142 30 142 42V54H121L116 72H86L82 54Q70 52 70 41Q70 30 82 30Z" fill="' + V + '"/>';
        s += '<rect x="140" y="35" width="18" height="11" rx="2.5" fill="' + cap + '"/><rect x="154" y="37" width="4" height="7" fill="#000" opacity=".35"/>';
        s += '<rect x="72" y="118" width="56" height="84" rx="6" fill="' + lab + '"/>';
        s += txt(100, 134, 'BÓNG', 7.4, (lab === '#faf7f2') ? '#a3833f' : (lab === G ? ink : G), 700, 2.2);
        s += txt(100, 156, l1, 11.5, ink, 700, .3, 0, 50) + txt(100, 171, l2, 11.5, ink, 700, .3, 0, 50);
        s += txt(100, 191, p.sub, 7.2, ink, 500, .3, 0, 50);
        s += '<rect x="69" y="98" width="6" height="104" rx="3" fill="#fff" opacity=".28"/>';
        break;
      case 'tin':
        s += '<ellipse cx="100" cy="204" rx="68" ry="18" fill="' + b + '"/>';
        s += '<rect x="32" y="146" width="136" height="58" fill="' + b + '"/><rect x="32" y="146" width="136" height="58" fill="' + H + '"/>';
        s += '<rect x="32" y="160" width="136" height="30" fill="' + lab + '"/><rect x="32" y="160" width="136" height="30" fill="' + H + '" opacity=".6"/>';
        s += txt(100, 180, l1 + ' ' + l2, 12.5, ink, 700, 1.6, 0, 124);
        s += '<ellipse cx="100" cy="146" rx="68" ry="18" fill="' + cap + '"/>';
        s += '<rect x="32" y="128" width="136" height="18" fill="' + cap + '"/><rect x="32" y="128" width="136" height="18" fill="' + H + '"/>';
        s += '<ellipse cx="100" cy="128" rx="68" ry="18" fill="' + cap + '"/><ellipse cx="100" cy="128" rx="68" ry="18" fill="' + V + '"/>';
        s += '<ellipse cx="100" cy="128" rx="54" ry="13" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.4"/>';
        s += '<path d="M100 114s-7 8-7 12.6a7 7 0 0 0 14 0C107 122 100 114 100 114Z" fill="' + b + '"/>';
        s += txt(100, 98, p.sub, 9, '#0f3d32', 600, 1.5);
        break;
      case 'kit':
        s += '<rect x="34" y="44" width="98" height="174" rx="8" fill="' + b + '"/><rect x="34" y="44" width="98" height="174" rx="8" fill="' + H + '"/>';
        s += '<rect x="34" y="44" width="98" height="24" rx="8" fill="' + cap + '"/><rect x="34" y="60" width="98" height="8" fill="' + cap + '"/>';
        s += txt(83, 92, 'BÓNG STUDIO', 7, cap, 700, 1.8);
        s += txt(83, 114, l1, 14, IVORY, 700, 1.2);
        s += txt(83, 156, l2, 36, cap, 700, 0, SERIF);
        s += '<rect x="58" y="168" width="50" height="1" fill="' + cap + '" opacity=".6"/>';
        s += txt(83, 184, 'DIY KIT · ' + p.sub, 7, IVORY, 500, 1);
        s += '<path d="M131 70 Q140 120 133 200" stroke="#fff" stroke-opacity=".08" stroke-width="8" fill="none"/>';
        s += '<rect x="126" y="132" width="32" height="22" rx="3" fill="#161a18"/>';
        s += '<rect x="132" y="96" width="20" height="40" rx="10" fill="#1d2320"/><rect x="135" y="100" width="4" height="30" rx="2" fill="#fff" opacity=".18"/>';
        s += '<rect x="118" y="152" width="48" height="68" rx="9" fill="' + lab + '"/><rect x="118" y="152" width="48" height="68" rx="9" fill="' + H + '"/>';
        s += '<rect x="123" y="172" width="38" height="28" rx="3" fill="' + IVORY + '"/>';
        s += txt(142, 184, '9H', 9, '#0f3d32', 700, .5) + txt(142, 194, p.sub, 6, '#0f3d32', 500);
        break;
      case 'dropper':
        s += '<rect x="88" y="42" width="24" height="56" rx="12" fill="#1b201e"/><rect x="92" y="48" width="4" height="40" rx="2" fill="#fff" opacity=".2"/>';
        s += '<rect x="78" y="94" width="44" height="28" rx="4" fill="' + cap + '"/><rect x="78" y="94" width="44" height="28" rx="4" fill="' + H + '"/>';
        s += '<rect x="66" y="118" width="68" height="102" rx="13" fill="' + b + '"/><rect x="66" y="118" width="68" height="102" rx="13" fill="' + H + '"/>';
        s += '<rect x="72" y="142" width="56" height="60" rx="4" fill="' + lab + '"/>';
        s += txt(100, 156, 'BÓNG', 6.8, lab === G ? ink : '#a3833f', 700, 2);
        s += txt(100, 173, l1, 10.5, ink, 700, .3, 0, 50) + txt(100, 186, l2, 10.5, ink, 700, .3, 0, 50);
        s += txt(100, 197, p.sub, 6.5, ink, 500);
        s += '<rect x="71" y="126" width="5" height="86" rx="2.5" fill="#fff" opacity=".25"/>';
        break;
      case 'cloth':
        var cols = [cap, lab, b];
        for (var i = 0; i < 3; i++) {
          var y = 172 - i * 34, x = 30 + i * 6, wdt = 140 - i * 6, col = cols[i];
          s += '<rect x="' + x + '" y="' + y + '" width="' + wdt + '" height="40" rx="12" fill="' + col + '"/>';
          s += '<rect x="' + x + '" y="' + y + '" width="' + wdt + '" height="40" rx="12" fill="' + V + '"/>';
          s += '<path d="M' + (x + wdt - 16) + ' ' + (y + 3) + 'Q' + (x + wdt + 2) + ' ' + (y + 20) + ' ' + (x + wdt - 16) + ' ' + (y + 37) + '" stroke="#000" stroke-opacity=".16" stroke-width="2" fill="none"/>';
        }
        s += '<pattern id="' + u + 'w" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1"/></pattern>';
        s += '<rect x="42" y="104" width="128" height="40" rx="12" fill="url(#' + u + 'w)"/>';
        s += '<rect x="52" y="114" width="44" height="20" rx="3" fill="' + G + '"/>' + txt(74, 128, p.sub, 8, '#0f3d32', 700, .5);
        break;
      case 'pads':
        var pc = [b, cap, lab], py = [196, 160, 124];
        for (var j = 0; j < 3; j++) {
          var cy = py[j];
          s += '<ellipse cx="100" cy="' + (cy + 12) + '" rx="60" ry="17" fill="' + pc[j] + '"/>';
          s += '<rect x="40" y="' + cy + '" width="120" height="12" fill="' + pc[j] + '"/>';
          s += '<rect x="40" y="' + cy + '" width="120" height="12" fill="' + H + '"/>';
          s += '<ellipse cx="100" cy="' + (cy + 12) + '" rx="60" ry="17" fill="#000" opacity=".12"/>';
          s += '<ellipse cx="100" cy="' + cy + '" rx="60" ry="17" fill="' + pc[j] + '"/>';
          s += '<ellipse cx="100" cy="' + cy + '" rx="60" ry="17" fill="' + V + '"/>';
          s += '<ellipse cx="100" cy="' + cy + '" rx="34" ry="8" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>';
        }
        break;
      case 'polisher':
        s += '<ellipse cx="100" cy="206" rx="66" ry="14" fill="' + cap + '"/><rect x="34" y="190" width="132" height="16" fill="' + cap + '"/><rect x="34" y="190" width="132" height="16" fill="' + H + '"/>';
        s += '<ellipse cx="100" cy="190" rx="66" ry="14" fill="#e9d4a4"/>';
        s += '<rect x="60" y="174" width="80" height="16" rx="5" fill="#1b201e"/>';
        s += '<path d="M68 178 72 106Q74 90 92 90H108Q126 90 128 106L132 178Z" fill="' + b + '"/><path d="M68 178 72 106Q74 90 92 90H108Q126 90 128 106L132 178Z" fill="' + H + '"/>';
        s += '<rect x="36" y="58" width="132" height="36" rx="18" fill="' + b + '"/><rect x="36" y="58" width="132" height="36" rx="18" fill="' + V + '"/>';
        s += '<rect x="40" y="62" width="56" height="28" rx="14" fill="#1b201e"/>';
        for (var k = 0; k < 4; k++) s += '<rect x="' + (86 + k * 8) + '" y="118" width="3.5" height="26" rx="1.7" fill="#000" opacity=".3"/>';
        s += '<rect x="128" y="128" width="40" height="16" rx="8" fill="#1b201e"/>';
        s += txt(100, 162, 'BÓNG', 8, cap, 700, 2);
        s += '<circle cx="150" cy="76" r="4" fill="' + cap + '"/>';
        break;
      case 'sprayer':
        s += '<rect x="72" y="32" width="56" height="14" rx="7" fill="' + lab + '"/><rect x="95" y="44" width="10" height="48" fill="#2a302d"/>';
        s += '<rect x="56" y="98" width="88" height="122" rx="30" fill="' + b + '"/>';
        s += '<rect x="60" y="148" width="80" height="68" rx="26" fill="' + cap + '" opacity=".55"/>';
        s += '<rect x="56" y="98" width="88" height="122" rx="30" fill="' + H + '"/>';
        s += '<rect x="78" y="86" width="44" height="18" rx="4" fill="' + lab + '"/>';
        s += '<path d="M142 114Q176 122 168 168" stroke="#2a302d" stroke-width="4" fill="none" stroke-linecap="round"/>';
        s += '<rect x="160" y="164" width="16" height="44" rx="5" fill="' + lab + '"/><rect x="163" y="204" width="10" height="8" rx="2" fill="' + G + '"/>';
        s += txt(100, 136, 'BÓNG', 8, lab, 700, 2.2) + txt(100, 186, '2L', 13, '#fff', 700);
        s += '<rect x="62" y="112" width="6" height="92" rx="3" fill="#fff" opacity=".45"/>';
        break;
      case 'brush':
        s += '<rect x="90" y="24" width="20" height="124" rx="10" fill="' + b + '"/><rect x="90" y="24" width="20" height="124" rx="10" fill="' + H + '"/>';
        s += '<circle cx="100" cy="40" r="5" fill="#000" opacity=".3"/>';
        s += '<rect x="90" y="70" width="20" height="50" rx="4" fill="#1b201e" opacity=".55"/>';
        s += '<rect x="83" y="144" width="34" height="16" rx="3" fill="' + cap + '"/><rect x="83" y="144" width="34" height="16" rx="3" fill="' + H + '"/>';
        s += '<path d="M86 160Q56 178 66 214Q100 234 134 214Q144 178 114 160Z" fill="' + lab + '"/><path d="M86 160Q56 178 66 214Q100 234 134 214Q144 178 114 160Z" fill="' + H + '"/>';
        for (var m = 0; m < 7; m++) s += '<path d="M' + (78 + m * 7) + ' 172 Q' + (76 + m * 8) + ' 196 ' + (72 + m * 9.5) + ' 218" stroke="#000" stroke-opacity=".1" stroke-width="1.4" fill="none"/>';
        break;
    }
    return '<svg class="pk-svg" viewBox="0 0 200 240" role="img" aria-label="' + p.name.replace(/"/g, '') + '">' + defs + shadow + s + '</svg>';
  }

  w.BONG = {
    CATS: CATS, P: P, PKGS: PKGS, FEATS: FEATS, SIZES: SIZES, SERVICES: SERVICES,
    COMBO_IDS: COMBO_IDS, COMBO_PRESET: COMBO_PRESET, GIFT_AT: GIFT_AT,
    TIPS: TIPS, REVIEWS: REVIEWS, icon: icon, packshot: packshot
  };
})(window);
