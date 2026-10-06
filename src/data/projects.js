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
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)
export const typeLabel = (id) => projectTypes.find((t) => t.id === id)?.label || id
