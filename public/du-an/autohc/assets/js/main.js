/* AUTO HC 579 – giao diện (không có backend: form chỉ hiện thông báo, không gửi đi đâu) */
;(() => {
  'use strict'

  // ================= DỮ LIỆU =================
  const C = {
    address: '579 Đường Phúc Diễn - P. Xuân Phương - Q. Nam Từ Liêm - Hà Nội',
    tel: '0979427059',
    hotline: '0979.427.059',
    hotlineDots: '0979.42.70.59',
    tel2: '0977508804',
    hotline2: '0977.50.88.04',
    zaloDots: '0374.57.94.70',
    email: 'autohc579hn@gmail.com',
    zalo: 'https://zalo.me/0979427059',
    fb: 'https://www.facebook.com/garaotoHC579',
    msg: 'https://www.messenger.com/t/garaotoHC579',
    map: 'https://www.google.com/maps?ll=21.029316,105.757062&z=15&t=m&cid=12505715833210545677',
    embed: 'https://maps.google.com/maps?q=21.029316,105.757062&z=16&hl=vi&output=embed',
  }
  const now = new Date()
  C.dealMonth = `THÁNG ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

  const IMG = 'assets/img/'
  const P = (id, name, img, price, old, tab, desc) => ({ id, name, img: IMG + img, price, old, tab, desc })
  const products = [
    P('led', 'Bóng đèn LED ô tô siêu sáng LX LED HEADLIGHT - Bảo hành 3 năm', 'p-led.svg', 1500000, 1850000, 'phu-kien', ['Chip LED công suất cao, sáng gấp 3 lần halogen', 'Quạt tản nhiệt kép, chạy êm', 'Lắp đặt tại xưởng trong 30 phút']),
    P('q15', 'Camera hành trình kẹp gương Q15 kết nối điện thoại dây 15M', 'p-cam-q15.webp', 2380000, 2890000, 'phu-kien', ['Ghi hình Full HD trước – sau', 'Xem lại, tải video qua điện thoại', 'Dây camera lùi dài 15 m, đi dây gọn']),
    P('tpms', 'Cảm biến áp suất lốp van ngoài, cảnh báo qua màn hình', 'p-tpms.webp', 1500000, 1690000, 'phu-kien', ['Báo áp suất, nhiệt độ 4 lốp theo thời gian thực', 'Cảnh báo non hơi, xì lốp', 'Pin dùng 1–2 năm']),
    P('c10', 'Camera hành trình 2 mắt trước sau, xem online 24/24', 'p-cam-2mat.webp', 4790000, 5500000, 'phu-kien', ['Hai mắt ghi trước – sau đồng thời', 'Xem trực tiếp, định vị xe qua 4G', 'Cảnh báo va chạm khi đỗ xe']),
    P('guong', 'Gương chiếu hậu gập điện tích hợp đèn xi nhan', 'p-guong.webp', 1200000, 1450000, 'phu-kien', ['Gập điện theo khoá xe', 'Đèn xi nhan LED trên gương', 'Bảo hành 12 tháng']),
    P('volang', 'Bọc vô lăng da cao cấp khâu tay theo xe', 'p-volang.webp', 450000, 550000, 'phu-kien', ['Da bò thật, chống trơn', 'Khâu tay tại xưởng theo đúng size vô lăng', 'Nhiều màu chỉ để chọn']),
    P('bugi', 'Bugi Iridium bạch kim (bộ 4 chiếc)', 'p-bugi.webp', 880000, 1050000, 'phu-tung', ['Đánh lửa ổn định, tiết kiệm nhiên liệu', 'Tuổi thọ 60.000 – 100.000 km', 'Có đủ mã cho xe Nhật, Hàn']),
    P('locdau', 'Lọc dầu động cơ chính hãng', 'p-loc-dau.webp', 180000, 220000, 'phu-tung', ['Phụ tùng chính hãng, có tem', 'Thay kèm dầu máy miễn phí công', 'Đủ mã Toyota, Kia, Hyundai, Mazda, Ford']),
    P('acquy', 'Ắc quy khô 12V 60Ah bảo hành 12 tháng', 'p-acquy.webp', 1650000, 1850000, 'phu-tung', ['Ắc quy khô không cần châm nước', 'Thu cũ đổi mới, trừ tiền ắc quy cũ', 'Lắp tận nơi trong nội thành']),
    P('lop', 'Lốp ô tô 205/55R16 chính hãng', 'p-lop.webp', 1850000, 2100000, 'phu-tung', ['Lốp mới, sản xuất trong năm', 'Miễn phí cân bằng động khi thay 2 lốp', 'Bảo hành theo hãng']),
    P('mam', 'Mâm hợp kim 17 inch (1 chiếc)', 'p-mam.webp', 2900000, 3400000, 'phu-tung', ['Mâm đúc nguyên khối', 'Có đủ PCD theo xe', 'Miễn phí lắp đặt, cân chỉnh']),
    P('gioang', 'Bộ gioăng quy lát (gioăng mặt máy)', 'p-gioang.webp', 950000, 1150000, 'phu-tung', ['Chống rò nước, rò dầu', 'Dùng khi đại tu, làm máy', 'Báo giá công thay theo dòng xe']),
    P('tuyp', 'Bộ khẩu tuýp sửa chữa ô tô 46 chi tiết', 'p-tuyp.webp', 690000, 850000, 'phu-tung', ['Thép CR-V cứng, chống gỉ', 'Hộp đựng gọn để cốp xe', 'Bảo hành 12 tháng']),
  ]
  const G = (id, name, img, price, desc) => ({ id, name, img: IMG + img, price, tab: 'dich-vu', service: true, desc })
  const servicePrices = [
    G('thay-dau', 'Thay dầu, lọc dầu động cơ', 'g-thay-dau.webp', 450000, ['Kiểm tra 20 hạng mục miễn phí', 'Dầu chính hãng, có tem']),
    G('khoang-may', 'Vệ sinh khoang máy ô tô', 'g-khoang-may.webp', 350000, ['Dung dịch chuyên dụng, an toàn điện', 'Phủ dưỡng nhựa, cao su']),
    G('son-dam', 'Sơn dặm 1 mặt (cửa, ba đỏ sốc...)', 'g-son-dam.webp', 1200000, ['Pha màu bằng máy, chuẩn màu', 'Sấy phòng kín, bảo hành 2 năm']),
    G('danh-bong', 'Đánh bóng, phục hồi sơn toàn xe', 'g-danh-bong.webp', 1500000, ['Xoá xước xoáy, ố mờ', 'Phủ wax bảo vệ']),
    G('rua-xe', 'Rửa xe bọt tuyết, hút bụi', 'g-rua-xe.webp', 120000, ['Rửa gầm, lau khô', 'Làm trong 30 phút']),
    G('noi-that', 'Dọn nội thất, khử mùi', 'g-noi-that.webp', 900000, ['Giặt ghế nỉ, dưỡng ghế da', 'Khử mùi bằng ozone']),
    G('can-bang', 'Cân bằng động 4 bánh', 'g-can-bang.webp', 200000, ['Máy cân bằng điện tử', 'Hết rung vô lăng ở tốc độ cao']),
    G('gam', 'Kiểm tra gầm, máy tổng quát', 'g-gam.webp', 0, ['Kiểm tra trên cầu nâng', 'Báo giá trước khi sửa']),
  ]
  const allProducts = [...products, ...servicePrices]
  const byId = (id) => allProducts.find((p) => p.id === id)
  const dealIds = ['led', 'q15']

  const services = [
    ['SỬA CHỮA MÁY GẦM', 's-may-gam.webp', 'Chuyên sửa chữa đại tu động cơ, đại tu thước lái, sửa chữa turbo, sửa chữa gầm...'],
    ['SƠN XE Ô TÔ', 's-son.webp', 'Chuyên sơn gò ô tô: Sơn dặm, sơn quây, sơn đổi màu ô tô, phục hồi xe tai nạn...'],
    ['BẢO DƯỠNG ĐỊNH KỲ', 's-bao-duong.webp', 'Bảo dưỡng ô tô các cấp: Thay dầu, bảo dưỡng định kỳ xe ô tô'],
    ['SỬA ĐIỀU HÒA Ô TÔ', 's-dieu-hoa.webp', 'Sửa điều hòa ô tô chuyên sâu: Thay lốc, thay giàn nóng, giàn lạnh...'],
    ['CỨU HỘ Ô TÔ', 's-cuu-ho.webp', 'Cứu hộ xe ô tô 24/7 - Sửa chữa ô tô lưu động - Sửa chữa xe ô tô tại nhà...'],
    ['PHIM CÁCH NHIỆT 3M', 's-phim.webp', 'Đại lý dán phim cách nhiệt 3M - Chiết khấu cao - Bảo hành dài lâu'],
    ['PHỤ TÙNG Ô TÔ', 's-phu-tung.webp', 'Cung cấp phụ tùng chính hãng các dòng xe Toyota, Kia, Huyndai, Mazda, Ford...'],
    ['ĐỘ XE - ĐỒ CHƠI XE', 's-do-xe.webp', 'Độ đèn, gương, camera hành trình, cam 360, độ body, nâng đời xe ô tô...'],
    ['SƠN LAZANG Ô TÔ', 's-lazang.webp', 'Chuyên sơn lazang, phay mâm xe ô tô, phục hồi lazang móp, vênh...'],
    ['PHỤC CHẾ GƯƠNG ĐÈN', 's-guong-den.webp', 'Chuyên phục chế gương đèn ô tô vỡ, gẫy, vá đèn, thay mặt đèn, đánh bóng đèn...'],
  ].map(([t, img, d]) => ({ t, img: IMG + img, d }))

  const HL = '- Hotline : 0979.42.70.59'
  const post = (id, group, t, img, date, ex, body) => ({ id, group, t: `${t}${HL}`, short: t, img: IMG + img, date, ex, body })
  const posts = [
    post('lop', 'tech', 'Căn chỉnh, cân bằng lốp ô tô: vì sao? khi nào? chi phí bao nhiêu?', 'b-lop.webp', '24/09/2026', 'Việc lái xe an toàn là điều mà ai cũng rất quan tâm, một trong những vấn đề đầu tiên cần để ý chính là lốp xe...', [
      'Lốp lệch, mòn không đều hay vô lăng rung ở tốc độ cao là dấu hiệu xe cần cân bằng động và căn chỉnh góc đặt bánh xe (độ chụm, góc camber, caster).',
      'Nên kiểm tra sau mỗi 10.000 km, khi vừa thay lốp, đi qua ổ gà mạnh hoặc sau khi sửa gầm. Làm đúng giúp lốp bền hơn 20–30% và xe đi thẳng, đầm chắc hơn.',
      'Tại AUTO HC 579, cân bằng động 4 bánh từ 200.000₫, căn chỉnh thước lái 3D báo giá theo dòng xe, làm trong khoảng 45 phút.',
    ]),
    post('con', 'tech', 'Sửa chữa côn xe ô tô khi nào? Bao nhiêu tiền? ở đâu uy tín?', 'b-con.webp', '10/09/2026', 'Côn xe ô tô (Ly hợp) nằm giữa động cơ và hộp số có tác dụng ngắt nối công suất từ động cơ đến hộp số...', [
      'Côn trượt (ga lên nhưng xe không vọt), chân côn nặng hoặc cao bất thường, có mùi khét khi leo dốc là lúc cần kiểm tra bộ ly hợp.',
      'Chi phí thay bộ côn (lá côn, mâm ép, bi tê) phụ thuộc dòng xe, thường từ 3–8 triệu đồng gồm công. Kỹ thuật viên sẽ kiểm tra và báo giá trước khi tháo.',
      'Gọi hotline để được tư vấn và đặt lịch, xe được kiểm tra miễn phí trên cầu nâng.',
    ]),
    post('dongco', 'tech', 'Dịch vụ sửa chữa đại tu động cơ ô tô (máy) khi nào, chi phí bao nhiêu?', 'b-dong-co.webp', '03/09/2026', 'Động cơ ô tô hay thường được gọi máy là một tổng thành bao gồm nhiều bộ phận sử dụng trong thời gian dài...', [
      'Máy hao dầu, khói xanh, nổ không đều, áp suất nén thấp là các dấu hiệu động cơ cần đại tu (làm máy).',
      'Đại tu gồm tháo máy, đo kiểm, thay piston – xéc măng – bạc, gioăng quy lát, mài xupap... Chi phí tuỳ dòng xe và mức hao mòn.',
      'AUTO HC 579 bảo hành đại tu động cơ 12 tháng hoặc 20.000 km, báo giá chi tiết từng hạng mục trước khi làm.',
    ]),
    post('itdi', 'share', 'Cần bảo dưỡng xe ô tô ít được sử dụng như thế nào?', 'b-it-di.webp', '22/09/2026', 'Nếu bạn có một chiếc xe ô tô hiếm khi được sử dụng trong thời gian dài, số km đi được rất ít...', [
      'Xe ít chạy vẫn cần thay dầu theo thời gian (6–12 tháng), vì dầu bị oxy hoá và hút ẩm dù không đi nhiều.',
      'Nổ máy 15 phút mỗi tuần, giữ ắc quy đầy, bơm lốp đúng áp suất và đỗ nơi khô ráo để tránh hỏng gioăng, phớt.',
      'Mang xe đi kiểm tra tổng quát mỗi 6 tháng để phát hiện sớm rò rỉ hay chuột cắn dây điện.',
    ]),
    post('denpha', 'share', 'Cách tự sửa chữa, bảo dưỡng đèn pha ô tô hiệu quả', 'b-den-pha.webp', '21/09/2026', 'Đèn pha ô tô là một bộ phận quan trọng giúp an toàn trong vận hành xe ô tô. Bạn nên kiểm tra thường xuyên...', [
      'Mặt đèn ố vàng làm giảm 30–50% độ sáng. Có thể đánh bóng, phủ lại lớp bảo vệ UV để đèn trong như mới.',
      'Kiểm tra đèn cốt, pha, xi nhan mỗi tháng; thay bóng theo cặp để ánh sáng đều hai bên.',
      'Khi nâng cấp LED, nên chọn loại có tản nhiệt tốt và chỉnh lại góc chiếu để không gây chói xe ngược chiều.',
    ]),
    post('gara', 'share', '7 yếu tố cần xem xét trước khi chọn gara sửa ô tô gần nhất tại Hà Nội', 'b-chon-gara.webp', '12/09/2026', 'Điều quan tâm lớn nhất khi bạn sở hữu xe ô tô đó là nó luôn ở trong tình trạng vận hành tốt nhất...', [
      'Hãy ưu tiên gara có báo giá rõ ràng trước khi sửa, phụ tùng có nguồn gốc và chính sách bảo hành bằng văn bản.',
      'Xưởng có cầu nâng, phòng sơn sấy, máy chẩn đoán và kỹ thuật viên có kinh nghiệm theo dòng xe của bạn.',
      'Vị trí thuận tiện, có hỗ trợ cứu hộ và đánh giá tốt từ khách hàng thật cũng là yếu tố nên cân nhắc.',
    ]),
  ]

  const videos = [
    ['Hướng dẫn về rửa khoang máy ô tô, vệ sinh khoang động cơ ô tô', 'v-khoang-may.webp', 'assets/video/khoang-may.mp4'],
    ['Video giới thiệu dịch vụ Garage Auto HC 579 ', 'v-gioi-thieu.webp', 'assets/video/gioi-thieu.mp4'],
    ['Quy trình sơn xe dặm xe ô tô màu trắng ngọc trai xe Huyndai Elantra ', 'v-son-dam.webp', 'assets/video/son-dam.mp4'],
  ].map(([t, img, src]) => ({ t: t + HL, img: IMG + img, src }))

  const feedback = [
    ['VŨ THU HUYỀN', 'Giáo viên', 'Dịch vụ xuất sắc. Chồng tôi sửa chữa và sơn xe ô tô Toyota Fortuner không vấn đề gì, không rắc rối. Và tôi đã bảo dưỡng ô tô Huyndai Accent của tôi, một lần nữa không có vấn đề gì. Chi phí rất hợp lý', '#e57373,#c2185b'],
    ['VŨ VIỆT HƯNG', 'Kỹ sư', 'Tôi rất ưng dịch vụ tại Auto HC, giá cả rất tốt và phù hợp. Tôi đã sơn xe ô tô tại tại đây rất đẹp và giá cả hợp lý. Nhân viên tại đây rất nhiệt tình, ân cần và chu đáo.', '#4fc3f7,#1565c0'],
    ['TỐNG NGỌC ÁNH', 'Doanh nhân', 'Tôi đã tiết kiệm được nhiều chi phí khi sử dụng dịch vụ tại Auto HC. Tôi đã sửa chữa đèn, độ đèn xe ô tô của tôi tại đây. Các em kỹ thuật nhiệt tình, tay nghề cao mà giá lại rẻ. Sẽ ủng hộ dài dài.', '#ffb74d,#ef6c00'],
  ]

  // Menu: mục có tab → mở tab sản phẩm; có href → cuộn; còn lại → popup báo giá
  const vmenu = [
    { t: 'Báo giá sửa chữa xe ô tô', sub: ['Sửa chữa máy, gầm', 'Sửa chữa điện, điều hoà', 'Sửa chữa hộp số', 'Sửa chữa turbo, kim phun'] },
    { t: 'Báo giá bảo dưỡng ô tô', sub: ['Bảo dưỡng cấp nhỏ (5.000 km)', 'Bảo dưỡng cấp trung (20.000 km)', 'Bảo dưỡng cấp lớn (40.000 km)', 'Thay dầu, lọc dầu'] },
    { t: 'Báo giá sơn gò ô tô' },
    { t: 'Báo giá chăm sóc xe ô tô' },
    { t: 'Báo giá xe ô tô mới nhất', sub: ['Toyota', 'Kia', 'Hyundai', 'Mazda', 'Ford', 'Honda'] },
    { t: 'Phụ tùng xe ô tô', tab: 'phu-tung', sub: ['Lọc gió, lọc dầu', 'Bugi, ắc quy', 'Má phanh, giảm xóc', 'Lốp, mâm xe'] },
    { t: 'Phụ kiện xe ô tô', tab: 'phu-kien', sub: ['Camera hành trình', 'Cảm biến áp suất lốp', 'Đèn LED, bi gầm', 'Gương, vô lăng'] },
  ]
  const menu = [
    { t: 'Sửa chữa', href: '#dich-vu', sub: ['Bảng báo giá dịch vụ', 'Dịch vụ bảo dưỡng định kỳ', 'Dịch vụ bảo dưỡng ô tô các cấp', 'Dịch vụ sửa chữa khung gầm', 'Dịch vụ sửa chữa điện', 'Dịch vụ sửa chữa điều hòa ô tô', 'Dịch vụ sửa chữa đại tu hộp số', 'Dịch vụ sửa chữa turbo - Kim phun', 'Sửa chữa hộp: ECU, ABS...', 'Sửa chữa gương, đèn'] },
    { t: 'Sơn gò', href: '#dich-vu', sub: ['Báo giá dịch vụ sơn ô tô', 'Dịch vụ sơn ô tô', 'Dịch vụ sơn bảo hiểm ô tô', 'Dịch vụ sơn dặm ô tô', 'Dịch vụ sơn quây ô tô', 'Dịch vụ sơn đổi màu ô tô', 'Dịch vụ sơn lazang ô tô', 'Dịch vụ sơn phủ gầm ô tô'] },
    { t: 'Chăm sóc xe', href: '#dich-vu', sub: ['Dịch vụ rửa xe ô tô', 'Dịch vụ dọn nội thất ô tô', 'Dịch vụ rửa khoang máy', 'Dịch vụ đánh bóng ô tô', 'Dịch vụ đánh bóng kính', 'Dịch vụ dán phim cách nhiệt 3M'] },
    { t: 'Độ xe', href: '#dich-vu', sub: ['Độ đèn ô tô', 'Độ gương ô tô', 'Độ bodykit', 'Độ nâng đời', 'Độ loa, màn hình'] },
    { t: 'Phụ Tùng', href: '#san-pham', sub: ['Phụ tùng xe', 'Phụ kiện xe'] },
    { t: 'Tin tức', href: '#tin-tuc' },
    { t: 'Liên hệ', href: '#dat-lich' },
  ]
  const subTab = { 'Bảng báo giá dịch vụ': 'dich-vu', 'Phụ tùng xe': 'phu-tung', 'Phụ kiện xe': 'phu-kien' }
  const footerSvc = ['Bảo dưỡng ô tô', 'Sơn gò ô tô', 'Sơn lazang ô tô', 'Sửa điều hòa ô tô', 'Sơn dặm ô tô', 'Đại tu gầm ô tô', 'Đại tu động cơ', 'Sửa chữa điện ô tô']
  const policies = {
    'Giới thiệu': 'AUTO HC 579 là xưởng dịch vụ ô tô tại 579 Phúc Diễn, Nam Từ Liêm, Hà Nội: sửa chữa máy gầm, điện, điều hoà, sơn gò, chăm sóc và độ xe cho các dòng Kia, Hyundai, Toyota, Honda, Mazda, Ford, Nissan, Mitsubishi. Phương châm: "Chăm sóc, sửa chữa xe đúng nghĩa".',
    'Chính sách chung công ty': 'Mọi hạng mục đều được kiểm tra, báo giá và có sự đồng ý của khách trước khi làm. Phụ tùng thay ra được trả lại khách hàng nếu có yêu cầu.',
    'Quy trình dịch vụ': 'Tiếp nhận xe → Kiểm tra, chẩn đoán → Báo giá chi tiết → Khách đồng ý → Sửa chữa → Kiểm tra chất lượng, chạy thử → Bàn giao, hướng dẫn bảo dưỡng.',
    'Chính sách bảo hành, đổi trả': 'Bảo hành công sửa chữa 6 tháng, sơn 24 tháng, đại tu động cơ 12 tháng hoặc 20.000 km. Phụ tùng bảo hành theo nhà sản xuất; lỗi do kỹ thuật của xưởng được khắc phục miễn phí.',
    'Chính sách bảo mật thông tin': 'Thông tin khách hàng (họ tên, số điện thoại, biển số xe) chỉ dùng để liên hệ, nhắc lịch bảo dưỡng và không chia sẻ cho bên thứ ba.',
    'Liên hệ với chúng tôi': `Hotline: ${C.hotlineDots} - ${C.hotline2}\nEmail: ${C.email}\nĐịa chỉ: Số 579 Phúc Diễn, Xuân Phương, Nam Từ Liêm, Hà Nội\nMở cửa: 8h00 - 18h00 hàng tuần`,
  }
  const bookServices = ['Bảo dưỡng định kỳ', 'Sửa chữa máy gầm', 'Sửa chữa điện, điều hoà', 'Sơn gò, sơn dặm', 'Chăm sóc, rửa xe, dọn nội thất', 'Dán phim cách nhiệt', 'Độ xe, lắp phụ kiện', 'Cứu hộ ô tô', 'Khác']

  // ================= TIỆN ÍCH =================
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const vnd = (n) => n.toLocaleString('vi-VN') + '₫'
  const icon = (id, cls = '') => `<svg class="${cls}"><use href="#${id}"/></svg>`
  const normPhone = (v) => v.replace(/[\s.\-()]/g, '').replace(/^\+84/, '0')
  const validPhone = (v) => /^0(3|5|7|8|9)\d{8}$/.test(normPhone(v))
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

  let logoN = 0
  const logo = () => {
    const g = 'lg' + ++logoN
    return `<svg class="logo-svg" viewBox="0 0 340 150" role="img" aria-label="AUTO HC 579">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd54a"/><stop offset="1" stop-color="#f7941d"/></linearGradient></defs>
      <path d="M14 86C64 52 128 30 200 25c52-4 98 6 132 28-30-11-70-15-114-14C150 41 82 60 14 86z" fill="#1976d2"/>
      <path d="M58 90c50-21 112-32 182-32 24 0 46 3 62 7-22-1-46-1-70 1-62 4-118 12-174 24z" fill="#0d47a1"/>
      <text x="226" y="64" font-size="38" font-weight="900" font-style="italic" fill="url(#${g})" stroke="#0b2a6b" stroke-width="1.8" paint-order="stroke">579</text>
      <text x="4" y="122" font-size="64" font-weight="900" font-style="italic" fill="#0d47a1" textLength="206" lengthAdjust="spacingAndGlyphs">AUTO</text>
      <text x="214" y="122" font-size="64" font-weight="900" font-style="italic" fill="url(#${g})" stroke="#0b2a6b" stroke-width="1.4" paint-order="stroke" textLength="118" lengthAdjust="spacingAndGlyphs">HC</text>
      <text x="172" y="143" text-anchor="middle" font-size="13" font-weight="900" fill="#1b1b1b" textLength="262" lengthAdjust="spacingAndGlyphs">CHĂM SÓC SỬA CHỮA XE ĐÚNG NGHĨA</text>
    </svg>`
  }

  // ================= GẮN DỮ LIỆU =================
  $$('[data-bind]').forEach((el) => (el.textContent = C[el.dataset.bind] ?? ''))
  $$('[data-logo]').forEach((el) => (el.innerHTML = logo()))
  $$('[data-tel]').forEach((a) => (a.href = 'tel:' + C.tel))
  $$('[data-tel2]').forEach((a) => (a.href = 'tel:' + C.tel2))
  $$('[data-mail]').forEach((a) => (a.href = 'mailto:' + C.email))
  $$('[data-zalo]').forEach((a) => (a.href = C.zalo))
  $$('[data-fb]').forEach((a) => (a.href = C.fb))
  $$('[data-msg]').forEach((a) => (a.href = C.msg))
  $$('[data-map]').forEach((a) => (a.href = C.map))
  $('[data-service-select]').innerHTML = bookServices.map((s) => `<option>${s}</option>`).join('')

  // Menu dọc + menu ngang
  $('[data-vmenu]').innerHTML = vmenu
    .map((m) => `<li><a data-go="${esc(m.t)}">${esc(m.t)}${m.sub ? icon('i-right') : ''}</a>${m.sub ? `<div class="vmenu__sub">${m.sub.map((s) => `<a data-go="${esc(m.t + ' – ' + s)}" ${m.tab ? `data-tab-go="${m.tab}"` : ''}>${esc(s)}</a>`).join('')}</div>` : ''}</li>`)
    .join('')
  $$('[data-vmenu] > li > a').forEach((a, i) => vmenu[i].tab && (a.dataset.tabGo = vmenu[i].tab))
  $('[data-menu]').insertAdjacentHTML(
    'beforeend',
    menu
      .map((m) => `<li><a href="${m.href}">${m.t}${m.sub ? icon('i-down') : ''}</a>${m.sub ? `<div class="menu__drop">${m.sub.map((s) => `<a data-go="${esc(s)}" ${subTab[s] ? `data-tab-go="${subTab[s]}"` : ''}>${esc(s)}</a>`).join('')}</div>` : ''}</li>`)
      .join(''),
  )
  // Menu điện thoại (gộp cả hai menu)
  const dm = (m, hl) => `<li class="${hl ? 'dm-hl' : ''}"><div class="dm-row"><a ${m.href ? `href="${m.href}"` : `data-go="${esc(m.t)}"`} ${m.tab ? `data-tab-go="${m.tab}"` : ''}>${esc(m.t)}</a>${m.sub ? `<button type="button" aria-label="Mở ${esc(m.t)}" aria-expanded="false">${icon('i-down')}</button>` : ''}</div>${m.sub ? `<ul>${m.sub.map((s) => `<li><a data-go="${esc(s)}" ${subTab[s] || m.tab ? `data-tab-go="${subTab[s] || m.tab}"` : ''}>${esc(s)}</a></li>`).join('')}</ul>` : ''}</li>`
  $('[data-drawer-menu]').innerHTML =
    `<li><div class="dm-row"><a href="#top">Trang chủ</a></div></li>` +
    dm({ t: 'Sản phẩm - Dịch vụ', sub: vmenu.map((v) => v.t) }, true) +
    menu.map((m) => dm(m)).join('')
  // mục con của "Sản phẩm - Dịch vụ" trên điện thoại: mở đúng tab nếu có
  $$('[data-drawer-menu] .dm-hl ul a').forEach((a, i) => vmenu[i].tab && (a.dataset.tabGo = vmenu[i].tab))

  // Footer
  $('[data-footer="svc"]').innerHTML = footerSvc.map((s) => `<li><a data-go="${esc(s)}">${s}</a></li>`).join('')
  $('[data-footer="policy"]').innerHTML = Object.keys(policies).map((s) => `<li><a data-policy="${esc(s)}">${s}</a></li>`).join('')

  // ================= THẺ =================
  const pcard = (p) => {
    const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0
    const price = p.service
      ? `<span class="contact">${p.price ? 'Từ ' + vnd(p.price) : 'Miễn phí'}</span>`
      : `<b>${vnd(p.price)}</b>${p.old ? `<s>${vnd(p.old)}</s>` : ''}`
    return `<article class="pcard reveal" data-product="${p.id}" tabindex="0" aria-label="${esc(p.name)}">
      <div class="pcard__img"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy">${off ? `<span class="pcard__badge"><span>- ${off}%</span></span>` : ''}<span class="pcard__quick">${p.service ? 'Nhận báo giá' : 'Xem nhanh'}</span></div>
      <div class="pcard__body"><h3 class="pcard__name">${esc(p.name)}</h3><div class="pcard__price">${price}</div></div>
    </article>`
  }
  $('[data-products="deal"]').innerHTML = dealIds.map((id) => pcard(byId(id))).join('')
  const stratTrack = $('[data-products="strat"]')
  const renderTab = (tab) => (stratTrack.innerHTML = allProducts.filter((p) => p.tab === tab).map(pcard).join(''))
  renderTab('phu-kien')

  $('[data-services]').innerHTML = services
    .map((s) => `<article class="scard" data-go="${esc(s.t)}" tabindex="0"><div class="scard__img"><img src="${s.img}" alt="${esc(s.t)}" loading="lazy"></div><h3>${s.t}</h3><p>${s.d}</p></article>`)
    .join('')

  const postCard = (p) => `<article class="post reveal" data-post="${p.id}" tabindex="0">
      <div class="post__img"><img src="${p.img}" alt="${esc(p.short)}" loading="lazy"></div>
      <h3>${esc(p.t)}</h3>
      <p class="post__date">${icon('i-clock')} Ngày ${p.date}</p>
      <p class="post__ex">${esc(p.ex)}</p>
      <span class="post__more">Xem thêm »</span>
    </article>`
  $('[data-posts="tech"]').innerHTML = posts.filter((p) => p.group === 'tech').map(postCard).join('')
  $('[data-posts="share"]').innerHTML = posts.filter((p) => p.group === 'share').map(postCard).join('')

  $('[data-videos]').innerHTML = videos
    .map((v, i) => `<article class="vcard reveal" data-video="${i}" tabindex="0"><div class="vcard__img"><img src="${v.img}" alt="" loading="lazy"><span class="vcard__play">${icon('i-play')}</span></div><h3>${esc(v.t)}</h3></article>`)
    .join('')

  $('[data-feedback]').innerHTML = feedback
    .map(([n, r, q, g]) => {
      const ini = n.split(' ').slice(-2).map((w) => w[0]).join('')
      return `<article class="fcard reveal"><div class="fcard__head"><span class="fcard__ava" style="background:linear-gradient(135deg,${g})">${ini}</span><div><p class="fcard__name">${n}${icon('i-star')}</p><p class="fcard__role">${r}</p><p class="fcard__stars">${icon('i-star').repeat(5)}</p></div></div><p>“ ${esc(q)} ”</p></article>`
    })
    .join('')

  // Bọc chữ tab để không bị nghiêng
  $$('[data-tabs] button').forEach((b) => (b.innerHTML = `<span>${b.textContent}</span>`))

  // ================= SLIDER =================
  const sliders = {}
  const initSlider = (root) => {
    const track = $('.slider__track', root)
    const dotsBox = $('.slider__dots', root)
    const prev = $('.slider__nav--prev', root)
    const next = $('.slider__nav--next', root)
    const auto = +root.dataset.auto || 0
    let pages = 1
    let timer = 0
    let hold = false

    const step = () => {
      const first = track.children[0]
      if (!first) return track.clientWidth
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      return first.getBoundingClientRect().width + gap
    }
    const perView = () => Math.max(1, Math.round((track.clientWidth + 1) / step()))
    const page = () => {
      const max = track.scrollWidth - track.clientWidth
      if (max <= 2) return 0
      if (track.scrollLeft >= max - 2) return pages - 1
      return Math.round(track.scrollLeft / (step() * perView()))
    }
    const go = (i) => {
      const n = (i + pages) % pages
      track.scrollTo({ left: n * step() * perView(), behavior: 'smooth' })
    }
    const sync = () => {
      const p = page()
      if (dotsBox) $$('button', dotsBox).forEach((b, i) => b.classList.toggle('is-active', i === p))
      const max = track.scrollWidth - track.clientWidth
      if (prev) prev.disabled = track.scrollLeft <= 2
      if (next) next.disabled = track.scrollLeft >= max - 2
    }
    const build = () => {
      const scrollable = track.scrollWidth - track.clientWidth > 2
      pages = scrollable ? Math.ceil(track.children.length / perView()) : 1
      if (dotsBox) {
        dotsBox.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button type="button" aria-label="Trang ${i + 1}"></button>`).join('') : ''
        $$('button', dotsBox).forEach((b, i) => b.addEventListener('click', () => go(i)))
      }
      sync()
    }
    let raf = 0
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(sync)
    }, { passive: true })
    prev?.addEventListener('click', () => track.scrollBy({ left: -step() * perView(), behavior: 'smooth' }))
    next?.addEventListener('click', () => track.scrollBy({ left: step() * perView(), behavior: 'smooth' }))
    if (auto) {
      const tick = () => !hold && !document.hidden && pages > 1 && go(page() + 1)
      timer = setInterval(tick, auto)
      root.addEventListener('pointerenter', () => (hold = true))
      root.addEventListener('pointerleave', () => (hold = false))
      track.addEventListener('touchstart', () => (hold = true), { passive: true })
      track.addEventListener('touchend', () => setTimeout(() => (hold = false), 4000), { passive: true })
    }
    new ResizeObserver(build).observe(track)
    return { build, reset: () => { track.scrollLeft = 0; build() }, timer }
  }
  $$('[data-slider]').forEach((el) => (sliders[el.dataset.slider] = initSlider(el)))

  // ================= TAB SẢN PHẨM =================
  const setTab = (tab) => {
    $$('[data-tabs] button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)))
    renderTab(tab)
    stratTrack.classList.remove('is-swap')
    void stratTrack.offsetWidth
    stratTrack.classList.add('is-swap')
    $$('.reveal', stratTrack).forEach((el) => el.classList.add('is-in'))
    sliders.strat.reset()
  }
  $$('[data-tabs] button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)))

  // ================= POPUP =================
  const modal = $('.modal')
  const box = $('.modal__box', modal)
  const body = $('.modal__body', modal)
  let lastFocus = null
  const openModal = (html, size = '') => {
    lastFocus = document.activeElement
    body.innerHTML = html
    box.className = 'modal__box' + (size ? ' is-' + size : '')
    modal.hidden = false
    document.body.classList.add('is-locked')
    const f = $('input, button:not(.modal__x), a', body) || $('.modal__x', modal)
    setTimeout(() => f.focus({ preventScroll: true }), 30)
  }
  const closeModal = () => {
    if (modal.hidden) return
    $$('video', body).forEach((v) => v.pause())
    modal.hidden = true
    body.innerHTML = ''
    document.body.classList.remove('is-locked')
    lastFocus?.focus?.({ preventScroll: true })
  }
  $$('[data-close-modal]', modal).forEach((el) => el.addEventListener('click', closeModal))
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return
    const f = $$('a[href], button, input, select, textarea, video[controls]', modal).filter((el) => !el.disabled && el.offsetParent)
    if (!f.length) return
    const [a, z] = [f[0], f[f.length - 1]]
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
  })

  const toastEl = $('.toast')
  let toastT = 0
  const toast = (msg) => {
    toastEl.textContent = msg
    toastEl.classList.add('is-on')
    clearTimeout(toastT)
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600)
  }

  const done = (title, text) =>
    openModal(`<div class="done"><span class="done__ic">${icon('i-check')}</span><h3>${title}</h3><p>${text}</p><a class="btn btn--orange" href="tel:${C.tel}">${icon('i-phone')} Gọi ngay ${C.hotlineDots}</a><button class="btn btn--line" type="button" data-close>Đóng</button></div>`, 'sm')

  // Kiểm tra form: trả về dữ liệu hoặc null (đánh dấu ô sai)
  const check = (form) => {
    const name = form.elements.name
    const phone = form.elements.phone
    const err = $('.bform__err', form) || $('[data-err]', form)
    $$('.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'))
    let msg = ''
    if (!phone.value.trim() || !validPhone(phone.value)) { phone.classList.add('is-invalid'); msg = 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).' }
    if (name && !name.value.trim()) { name.classList.add('is-invalid'); msg = 'Vui lòng nhập họ tên.' }
    if (err) { err.textContent = msg; err.hidden = !msg }
    if (msg) { ($('.is-invalid', form)).focus(); return null }
    return Object.fromEntries(new FormData(form))
  }

  const quote = (subject, img) =>
    openModal(
      `<form class="mform" data-form="quote" novalidate>
        <h3 id="modal-title">Nhận báo giá – đặt lịch</h3>
        <p>Để lại số điện thoại, kỹ thuật viên AUTO HC 579 gọi lại tư vấn trong 15 phút (8h00 – 18h00).</p>
        ${img ? `<div class="mform__sum"><img src="${img}" alt=""><span>${esc(subject)}</span></div>` : ''}
        <label>Dịch vụ quan tâm<input name="subject" value="${esc(subject || '')}"></label>
        <label>Họ và tên<input name="name" autocomplete="name" placeholder="Nguyễn Văn A"></label>
        <label>Số điện thoại<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="09xx xxx xxx"></label>
        <label>Dòng xe, ghi chú<textarea name="note" rows="2" placeholder="VD: Mazda 3 2019, sơn lại cản trước"></textarea></label>
        <p class="bform__err" data-err role="alert" hidden></p>
        <button class="btn btn--blue" type="submit">GỬI YÊU CẦU</button>
      </form>`,
      'sm',
    )

  const quickView = (p) => {
    if (p.service) return quote(p.name, p.img)
    const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0
    openModal(`<div class="qv">
      <div class="qv__img"><img src="${p.img}" alt="${esc(p.name)}"></div>
      <div class="qv__info">
        <h3 id="modal-title">${esc(p.name)}</h3>
        <p class="qv__meta">Tình trạng: <b>Còn hàng</b> · Lắp đặt tại xưởng</p>
        <div class="qv__price"><b>${vnd(p.price)}</b>${p.old ? `<s>${vnd(p.old)}</s><em>-${off}%</em>` : ''}</div>
        <ul class="qv__list">${p.desc.map((d) => `<li>${icon('i-check')}${esc(d)}</li>`).join('')}</ul>
        <div><span class="qty"><button type="button" data-q="-1" aria-label="Bớt">−</button><input type="number" value="1" min="1" max="20" aria-label="Số lượng" data-qty><button type="button" data-q="1" aria-label="Thêm">+</button></span></div>
        <div class="qv__btns"><button class="btn btn--orange" type="button" data-order="${p.id}">ĐẶT MUA NGAY</button><a class="btn btn--blue" href="tel:${C.tel}">${icon('i-phone')} GỌI TƯ VẤN</a></div>
      </div></div>`)
  }

  const order = (p, qty) =>
    openModal(
      `<form class="mform" data-form="order" data-id="${p.id}" data-qty="${qty}" novalidate>
        <h3 id="modal-title">Đặt mua sản phẩm</h3>
        <div class="mform__sum"><img src="${p.img}" alt=""><span>${esc(p.name)} × ${qty}<b>${vnd(p.price * qty)}</b></span></div>
        <label>Họ và tên<input name="name" autocomplete="name"></label>
        <label>Số điện thoại<input name="phone" type="tel" inputmode="tel" autocomplete="tel"></label>
        <label>Địa chỉ nhận hàng / lắp tại xưởng<input name="address" autocomplete="street-address" placeholder="Bỏ trống nếu lắp tại xưởng"></label>
        <p class="bform__err" data-err role="alert" hidden></p>
        <button class="btn btn--orange" type="submit">XÁC NHẬN ĐẶT HÀNG</button>
      </form>`,
      'sm',
    )

  const openPost = (p) =>
    openModal(`<article class="article">
      <div class="article__img"><img src="${p.img}" alt=""></div>
      <div class="article__body">
        <h3 id="modal-title">${esc(p.short)}</h3>
        <p class="post__date">${icon('i-clock')} Ngày ${p.date} · AUTO HC 579</p>
        <p><b>${esc(p.ex.replace(/\.\.\.$/, '.'))}</b></p>
        ${p.body.map((t) => `<p>${esc(t)}</p>`).join('')}
        <div class="article__cta"><a class="btn btn--orange" href="tel:${C.tel}">${icon('i-phone')} Hotline ${C.hotlineDots}</a><button class="btn btn--blue" type="button" data-quote="${esc(p.short)}">Đặt lịch tư vấn</button></div>
      </div></article>`)

  const openVideo = (v) => openModal(`<video src="${v.src}" controls autoplay playsinline poster="${v.img}" aria-label="${esc(v.t)}"></video>`, 'video')

  const openPolicy = (k) =>
    openModal(`<div class="mform"><h3 id="modal-title">${esc(k)}</h3>${policies[k].split('\n').map((l) => `<p>${esc(l)}</p>`).join('')}<button class="btn btn--blue" type="button" data-close>Đã hiểu</button></div>`, 'sm')

  // ================= ĐIỀU HƯỚNG / CLICK =================
  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const off = id === 'top' ? 0 : 10
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: 'smooth' })
  }
  const goTab = (tab) => {
    setTab(tab)
    scrollToId('san-pham')
  }

  document.addEventListener('click', (e) => {
    const t = e.target
    const tg = t.closest('[data-tab-go]')
    if (tg) { e.preventDefault(); closeDrawer(); goTab(tg.dataset.tabGo); return }
    const go = t.closest('[data-go]')
    if (go) { e.preventDefault(); closeDrawer(); quote(go.dataset.go); return }
    const q = t.closest('[data-quote]')
    if (q) { e.preventDefault(); quote(q.dataset.quote); return }
    const a = t.closest('a[href^="#"]')
    if (a && a.getAttribute('href').length > 1) {
      e.preventDefault()
      closeDrawer()
      scrollToId(a.getAttribute('href').slice(1))
      return
    }
    const pc = t.closest('[data-product]')
    if (pc) { quickView(byId(pc.dataset.product)); return }
    const po = t.closest('[data-post]')
    if (po) { openPost(posts.find((p) => p.id === po.dataset.post)); return }
    const vc = t.closest('[data-video]')
    if (vc) { openVideo(videos[+vc.dataset.video]); return }
    const pl = t.closest('[data-policy]')
    if (pl) { openPolicy(pl.dataset.policy); return }
    if (t.closest('[data-soon]')) { e.preventDefault(); toast('Kênh này đang được cập nhật, mời bạn theo dõi Fanpage Facebook.'); return }
    if (t.closest('[data-close]')) { closeModal(); return }
    const qb = t.closest('[data-q]')
    if (qb) {
      const inp = $('[data-qty]', body)
      inp.value = Math.min(20, Math.max(1, (+inp.value || 1) + +qb.dataset.q))
      return
    }
    const ob = t.closest('[data-order]')
    if (ob) { order(byId(ob.dataset.order), Math.min(20, Math.max(1, +$('[data-qty]', body).value || 1))); return }
  })
  // Phím Enter / Space trên thẻ
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); closeSearch(); return }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.pcard, .post, .vcard, .scard')) {
      e.preventDefault()
      e.target.click()
    }
  })

  // Gửi form (đặt lịch, báo giá, đặt hàng) – chỉ hiện thông báo, không gửi đi
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]')
    if (!form) return
    e.preventDefault()
    const data = check(form)
    if (!data) return
    const name = (data.name || '').trim().split(' ').pop()
    if (form.dataset.form === 'book') {
      form.reset()
      done('Đặt lịch thành công!', `Cảm ơn ${esc(name)}, AUTO HC 579 sẽ gọi lại số ${esc(normPhone(data.phone))} để xác nhận lịch hẹn.`)
    } else if (form.dataset.form === 'order') {
      done('Đặt hàng thành công!', `Cảm ơn ${esc(name)}, nhân viên sẽ gọi xác nhận đơn hàng và hẹn lịch lắp đặt.`)
    } else {
      done('Đã gửi yêu cầu!', `Cảm ơn ${esc(name)}, kỹ thuật viên sẽ gọi lại tư vấn – báo giá trong 15 phút.`)
    }
  })
  document.addEventListener('input', (e) => e.target.classList?.remove('is-invalid'))

  // ================= MENU DỌC (chạm trên máy tính bảng) =================
  const vm = $('.vmenu')
  $('.vmenu__btn').addEventListener('click', () => {
    const open = vm.classList.toggle('is-open')
    $('.vmenu__btn').setAttribute('aria-expanded', String(open))
  })
  document.addEventListener('click', (e) => !e.target.closest('.vmenu') && vm.classList.remove('is-open'))

  // ================= MENU ĐIỆN THOẠI =================
  const drawer = $('.drawer')
  function closeDrawer() {
    if (drawer.hidden) return
    drawer.hidden = true
    document.body.classList.remove('is-locked')
  }
  $('[data-open-drawer]').addEventListener('click', () => {
    drawer.hidden = false
    document.body.classList.add('is-locked')
    $('.drawer__head button', drawer).focus()
  })
  $$('[data-close-drawer]', drawer).forEach((b) => b.addEventListener('click', closeDrawer))
  $$('.dm-row > button', drawer).forEach((b) =>
    b.addEventListener('click', () => {
      const li = b.closest('li')
      b.setAttribute('aria-expanded', String(li.classList.toggle('is-open')))
    }),
  )
  // Chân trang dạng xếp trên điện thoại
  $$('.fcol h4').forEach((h) => h.addEventListener('click', () => h.parentElement.classList.toggle('is-open')))

  // ================= TÌM KIẾM =================
  const index = [
    ...products.map((p) => ({ t: p.name, sub: vnd(p.price), img: p.img, tag: p.tab === 'phu-kien' ? 'Phụ kiện' : 'Phụ tùng', run: () => quickView(p) })),
    ...servicePrices.map((p) => ({ t: p.name, sub: p.price ? 'Từ ' + vnd(p.price) : 'Miễn phí', img: p.img, tag: 'Báo giá', run: () => quote(p.name, p.img) })),
    ...services.map((s) => ({ t: s.t.charAt(0) + s.t.slice(1).toLowerCase(), sub: 'Dịch vụ', img: s.img, tag: 'Dịch vụ', run: () => quote(s.t) })),
    ...posts.map((p) => ({ t: p.short, sub: 'Ngày ' + p.date, img: p.img, tag: 'Tin tức', run: () => openPost(p) })),
  ].map((x) => ({ ...x, k: fold(x.t + ' ' + x.tag) }))
  let results = []
  let active = -1
  function closeSearch() {
    $$('.search__drop').forEach((d) => (d.hidden = true))
    active = -1
  }
  $$('[data-search]').forEach((form) => {
    const input = $('input', form)
    const drop = $('.search__drop', form)
    const paint = () => {
      const q = fold(input.value.trim())
      if (!q) { drop.hidden = true; return }
      const words = q.split(/\s+/)
      results = index.filter((x) => words.every((w) => x.k.includes(w))).slice(0, 8)
      active = -1
      drop.innerHTML = results.length
        ? results.map((r, i) => `<a class="search__item" data-i="${i}"><img src="${r.img}" alt=""><span>${esc(r.t)}<small>${esc(r.sub)}</small></span><em>${r.tag}</em></a>`).join('')
        : `<p class="search__empty">Không tìm thấy “${esc(input.value.trim())}”. Gọi <a href="tel:${C.tel}"><b>${C.hotlineDots}</b></a> để được tư vấn.</p>`
      drop.hidden = false
    }
    input.addEventListener('input', paint)
    input.addEventListener('focus', () => input.value.trim() && paint())
    input.addEventListener('keydown', (e) => {
      if (drop.hidden || !results.length) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
        $$('.search__item', drop).forEach((el, i) => el.classList.toggle('is-active', i === active))
      }
    })
    drop.addEventListener('click', (e) => {
      const it = e.target.closest('[data-i]')
      if (!it) return
      closeSearch()
      results[+it.dataset.i].run()
    })
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      paint()
      if (results.length) {
        closeSearch()
        results[Math.max(0, active)].run()
      }
    }, true)
  })
  document.addEventListener('click', (e) => !e.target.closest('[data-search]') && closeSearch())

  // ================= BẢN ĐỒ (tải khi cuộn tới) =================
  const mapFrame = $('[data-map-embed]')
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (!en.isIntersecting) return
      if (en.target === mapFrame) { mapFrame.src = C.embed; io.unobserve(mapFrame); return }
      en.target.classList.add('is-in')
      io.unobserve(en.target)
    })
  }, { rootMargin: '0px 0px -40px 0px' })
  io.observe(mapFrame)

  // ================= HIỆN DẦN =================
  $$('.stitle, .feat, .promo, .qr, .about__title').forEach((el) => el.classList.add('reveal'))
  $$('.reveal').forEach((el) => io.observe(el))

  // ================= LÊN ĐẦU TRANG =================
  const top = $('.totop')
  addEventListener('scroll', () => (top.hidden = scrollY < 700), { passive: true })
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
})()
