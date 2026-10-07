// Dự án đã triển khai cho khách thật: website, landing page, phần mềm.
// Landing page tĩnh đặt trong /public/du-an/<slug>/ và chạy độc lập tại /du-an/<slug>/
// (gửi thẳng đường dẫn này cho cơ sở). Thêm dự án: chép thư mục vào public/du-an rồi khai báo ở đây.

export const projectTypes = [
  { id: 'all', label: 'Tất cả' },
  { id: 'website', label: 'Website' },
  { id: 'landing', label: 'Landing page' },
  { id: 'software', label: 'Phần mềm' },
]

const dir = (slug) => `/du-an/${slug}/`

export const projects = [
  {
    slug: 'nhatduc',
    type: 'landing',
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
    slug: 'nhatduc-ladi',
    type: 'landing',
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
    slug: 'carcarservice',
    type: 'landing',
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
    slug: 'nhatduc-motion',
    type: 'landing',
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
    slug: 'minhphat',
    type: 'landing',
    demo: true, // thương hiệu hư cấu: thẻ hiện "Bản mẫu" thay cho "Đã triển khai"
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
    slug: 'vinfast',
    type: 'landing',
    demo: true, // trang demo học tập, không phải web chính thức của VinFast
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
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)
export const typeLabel = (id) => projectTypes.find((t) => t.id === id)?.label || id
