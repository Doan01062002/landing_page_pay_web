// Mẫu dựng riêng (trang tĩnh): landing page, website, trang bán hàng. Hiện đầu Kho mẫu (/mau-phan-mem), trước các mẫu phần mềm.
// Trang đặt trong /public/du-an/<slug>/ và chạy độc lập tại /du-an/<slug>/ (gửi thẳng đường dẫn này cho khách xem).
// Thêm mẫu: chép thư mục vào public/du-an (scripts/sync-du-an.mjs) rồi khai báo ở đây.
// category dùng chung bộ lọc ngành với Kho mẫu (categories trong templates.js), vd 'phutung' cho trang bán phụ kiện.

export const projectTypes = [
  { id: 'all', label: 'Tất cả' },
  { id: 'landing', label: 'Landing page' },
  { id: 'website', label: 'Website' },
  { id: 'shop', label: 'Trang bán hàng' },
]

const dir = (slug) => `/du-an/${slug}/`

export const projects = [
  {
    slug: 'nhatduc',
    type: 'landing',
    category: 'oto',
    name: 'Gara Nhật Đức Long Biên',
    client: 'Công ty TNHH TM & DV Ô tô Nhật Đức',
    area: 'KĐT Sài Đồng, Long Biên, Hà Nội',
    hotline: '08 3695 3695',
    deployed: '10/2026',
    url: dir('nhatduc'),
    cover: dir('nhatduc') + 'assets/img/storefront-2026.webp',
    accent: '#d71e28',
    summary:
      'Landing page cho trung tâm sửa chữa, đồng sơn, điều hoà xe 2–16 chỗ. Ảnh thật của xưởng, video TikTok và YouTube của gara, bảng giá rõ ràng và form đặt lịch 30 giây.',
    highlights: ['Ảnh xưởng thật', 'Video TikTok, YouTube', 'Bảng giá dịch vụ', 'Đặt lịch 30 giây', 'Bản đồ chỉ đường', 'Nút gọi, Zalo nổi'],
  },
  {
    slug: 'carcarservice',
    type: 'landing',
    category: 'oto',
    name: 'Gara Ô Tô Đức Tùng – Cơ sở 2',
    client: 'DUCTUNG CO.,LTD · Trung tâm dịch vụ Nissan Sài Đồng',
    area: '21 Sài Đồng, Long Biên, Hà Nội',
    hotline: '093 386 8386',
    deployed: '10/2026',
    url: dir('carcarservice'),
    cover: dir('carcarservice') + 'assets/img/storefront-ductung.webp',
    accent: '#0b56c9',
    summary:
      'Landing page cho gara sửa chữa, bảo dưỡng, sơn gò và cứu hộ 24/7. Nhấn mạnh báo giá minh bạch, ưu đãi giảm 10% công thợ khi đặt lịch trước.',
    highlights: ['Ảnh xưởng thật', 'Bảng giá dịch vụ', '4 cam kết, 5 bước', 'Đặt lịch giảm 10%', 'Bản đồ chỉ đường', 'Nút gọi, Zalo nổi'],
  },
  {
    slug: 'vinfast',
    type: 'landing',
    category: 'daily', // trang demo học tập, không phải web chính thức của VinFast
    name: 'Landing page xe điện VinFast',
    client: 'Bản demo – không liên kết với VinFast',
    area: 'Đại lý ô tô điện · bản demo',
    hotline: '0900 000 000',
    deployed: '10/2026',
    url: dir('vinfast'),
    cover: 'https://static-cms-prod.vinfastauto.com/statics/car/vf8-all-new/hinh-anh-vinfast-vf-8-all-new-ngoai-that-mau-do-mobile.webp',
    accent: '#1464f4',
    summary:
      'Landing page bán xe điện tông sáng, nhiều chuyển động: intro logo, xe lướt vào và đổi 6 màu, thẻ lợi thế và dòng xe tự trượt, xem xe xoay 360° (kéo để xoay, đổi màu), so sánh VF 3 – VF 9, form đăng ký lái thử.',
    highlights: ['Xe xoay 360°', 'Đổi màu xe', 'Thanh trượt tự chạy', 'Chọn mẫu xe + thông số', 'Đăng ký lái thử', 'Tối ưu điện thoại'],
  },
  {
    slug: 'minhphat',
    type: 'landing',
    category: 'oto',
    name: 'Gara Ô Tô Minh Phát',
    client: 'Gara mẫu (thương hiệu minh hoạ)',
    area: 'Hà Nội · thông tin liên hệ minh hoạ',
    hotline: '0900 000 068',
    deployed: '10/2026',
    url: dir('minhphat'),
    cover: dir('minhphat') + 'assets/img/bn-son.webp',
    accent: '#024e98',
    summary:
      'Landing page gara sửa chữa – bảo dưỡng một trang, xanh – cam theo logo: banner tự chạy, mã QR Zalo và bản đồ, 10 dịch vụ nổi bật, khuyến mại tháng, bảng giá dịch vụ, video, phản hồi khách và form đặt lịch kèm bản đồ.',
    highlights: ['Banner tự chạy', 'Menu dính khi cuộn', 'Bảng giá dịch vụ', 'Bấm là đặt lịch', 'Đặt lịch + bản đồ', 'Nút gọi, Zalo, Messenger'],
  },
  {
    slug: 'nhatduc-ladi',
    type: 'landing',
    category: 'oto',
    name: 'Gara Nhật Đức – bản Ladi',
    client: 'Công ty TNHH TM & DV Ô tô Nhật Đức',
    area: 'KĐT Sài Đồng, Long Biên, Hà Nội',
    hotline: '08 3695 3695',
    deployed: '10/2026',
    url: dir('nhatduc-ladi'),
    cover: dir('nhatduc-ladi') + 'assets/img/storefront-2026.webp',
    accent: '#d71e28',
    summary:
      'Landing kiểu LadiPage đỏ – vàng: hero cắt chéo, 5 thẻ dịch vụ, ưu đãi đặt lịch online, bảng giá 2 nhóm, ảnh xưởng trượt, đếm ngược ưu đãi tháng, popup tri ân và form đặt lịch.',
    highlights: ['Popup ưu đãi', 'Đếm ngược ưu đãi', 'Bảng giá 2 nhóm', 'Ảnh xưởng trượt', 'Video YouTube, TikTok', 'Đặt lịch 30 giây'],
  },
  {
    slug: 'nhatduc-motion',
    type: 'landing',
    category: 'oto',
    name: 'Gara Nhật Đức – bản Motion',
    client: 'Công ty TNHH TM & DV Ô tô Nhật Đức',
    area: 'KĐT Sài Đồng, Long Biên, Hà Nội',
    hotline: '08 3695 3695',
    deployed: '10/2026',
    url: dir('nhatduc-motion'),
    cover: dir('nhatduc-motion') + 'videos/hero-1.jpg',
    accent: '#d71e28',
    summary:
      'Bản landing cao cấp kiểu editorial, nền kem xen nền tối, màu theo logo: hero video 3 cảnh, băng ảnh xưởng thật xếp vòng cung, mục xưởng 3 khu vực, bảng giá 3 gói, đặt lịch 30 giây.',
    highlights: ['Hero video 3 cảnh', 'Ảnh xưởng thật', 'Cuộn mượt Lenis', 'Hiệu ứng GSAP', 'Bảng giá 3 gói', 'Đặt lịch 30 giây'],
  },
  {
    slug: 'tinviet',
    type: 'website',
    category: 'xecu', // mẫu website, thương hiệu minh hoạ
    name: 'Tín Việt Auto – showroom xe lướt',
    client: 'Showroom mẫu (thương hiệu minh hoạ)',
    area: 'Hà Nội · thông tin liên hệ minh hoạ',
    hotline: '0900 000 868',
    deployed: '10/2026',
    url: dir('tinviet'),
    accent: '#c8102e',
    summary:
      'Website showroom xe lướt nhiều trang: lọc xe theo hãng, giá, năm, hộp số; trang chi tiết có thư viện ảnh và phiếu kiểm định; so sánh 3 xe, yêu thích, định giá ký gửi, tính trả góp, đặt lịch lái thử.',
    highlights: ['Lọc xe đa tiêu chí', 'Trang chi tiết xe', 'So sánh 3 xe', 'Tính trả góp', 'Định giá & ký gửi', 'Đặt lịch lái thử'],
  },
  {
    slug: 'dopro',
    type: 'shop',
    category: 'phutung', // cửa hàng mẫu, thương hiệu minh hoạ
    name: 'Độ Pro Garage – độ xe hiệu suất',
    client: 'Cửa hàng mẫu (thương hiệu minh hoạ)',
    area: 'Hà Nội · thông tin liên hệ minh hoạ',
    hotline: '0900 000 123',
    deployed: '10/2026',
    url: dir('dopro'),
    accent: '#e10600',
    summary:
      'Cửa hàng phụ kiện độ xe nền sáng kiểu Thế Giới Di Động: turbo, cổ góp xả, mâm, coilover, đèn LED; flash sale theo khung giờ, tìm phụ kiện theo xe, combo Stage 1–3 kèm biểu đồ dyno, dịch vụ body kit, dán đổi màu tại xưởng.',
    highlights: ['Flash sale theo khung giờ', 'Tìm phụ kiện theo xe', 'Combo Stage 1–3 + dyno', 'Dịch vụ độ tại xưởng', 'Trả góp 0%', 'Đặt lịch lắp đặt'],
  },
  {
    slug: 'ankhang',
    type: 'shop',
    category: 'phutung', // cửa hàng mẫu, thương hiệu minh hoạ
    name: 'An Khang Auto – phụ kiện ô tô',
    client: 'Cửa hàng mẫu (thương hiệu minh hoạ)',
    area: 'TP. Hồ Chí Minh · thông tin liên hệ minh hoạ',
    hotline: '0900 000 268',
    deployed: '10/2026',
    url: dir('ankhang'),
    accent: '#ff6a13',
    summary:
      'Cửa hàng phụ kiện ô tô kiểu sàn thương mại điện tử: camera hành trình, bơm lốp, đồ cứu hộ, máy hút bụi, sạc; ảnh sản phẩm nền trắng, flash sale, mua 2 tặng 1, ví voucher tự áp mã, lắp đặt tận nơi.',
    highlights: ['Flash Sale đếm ngược', 'Mua 2 tặng 1', 'Ví voucher tự áp mã', 'Lọc theo dòng xe', 'Lắp đặt tận nơi', 'Giỏ hàng tự lưu'],
  },
  {
    slug: 'lumen',
    type: 'shop',
    category: 'phutung', // cửa hàng mẫu, thương hiệu minh hoạ
    name: 'Lumen – độ đèn ô tô',
    client: 'Cửa hàng mẫu (thương hiệu minh hoạ)',
    area: 'Đà Nẵng · thông tin liên hệ minh hoạ',
    hotline: '0900 000 368',
    deployed: '10/2026',
    url: dir('lumen'),
    accent: '#2ee6ff',
    summary:
      'Cửa hàng đèn ô tô kiểu CellphoneS: bóng LED, xenon, halogen, LED dây, cảm biến; chọn đèn theo xe, so sánh trước / sau, thử màu ambient, tra cứu bảo hành, đặt lịch độ bi-LED.',
    highlights: ['Chọn đèn theo xe', 'Flash sale đếm ngược', 'So sánh trước / sau', 'Thử màu ambient', 'Tra cứu bảo hành', 'Trả góp 0%'],
  },
  {
    slug: 'vanhviet',
    type: 'shop',
    category: 'lop', // cửa hàng mẫu, thương hiệu minh hoạ
    name: 'Vành Việt – mâm & lốp',
    client: 'Cửa hàng mẫu (thương hiệu minh hoạ)',
    area: 'Hải Phòng · thông tin liên hệ minh hoạ',
    hotline: '0900 000 468',
    deployed: '10/2026',
    url: dir('vanhviet'),
    accent: '#ffcc00',
    summary:
      'Cửa hàng mâm đúc 15–20 inch, mâm zin tháo xe, lốp và phụ kiện: tìm lốp theo xe hoặc cỡ, giá trọn bộ 4 bánh, giải mã cỡ lốp, bảng giá cân bằng động, tính trả góp 0%.',
    highlights: ['Tìm lốp theo xe & cỡ', 'Giá trọn bộ 4 mâm', 'Flash sale đếm ngược', 'Giải mã cỡ lốp', 'Bảng giá dịch vụ', 'Trả góp 0%'],
  },
  {
    slug: 'bongstudio',
    type: 'shop',
    category: 'detailing', // cửa hàng mẫu, thương hiệu minh hoạ
    name: 'Bóng Studio – chăm sóc xe',
    client: 'Cửa hàng mẫu (thương hiệu minh hoạ)',
    area: 'Cần Thơ · thông tin liên hệ minh hoạ',
    hotline: '0900 000 515',
    deployed: '10/2026',
    url: dir('bongstudio'),
    accent: '#c8a45c',
    summary:
      'Cửa hàng chăm sóc xe kiểu Hasaki: dung dịch rửa, sáp, ceramic, khăn microfiber; bảng giá dán phim, PPF, phủ ceramic theo cỡ xe, tự chọn combo −10%, đặt lịch chọn giờ.',
    highlights: ['Flash deal mỗi ngày', 'Bảng giá theo cỡ xe', 'Tự chọn combo −10%', 'Đặt lịch chọn giờ', 'Kéo so sánh trước / sau', 'Giỏ hàng & thanh toán'],
  },
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)
export const typeLabel = (id) => projectTypes.find((t) => t.id === id)?.label || id
