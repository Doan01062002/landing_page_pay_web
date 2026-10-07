// Dữ liệu "khởi động" của website: thông tin thương hiệu, SEO mặc định, Kho mẫu (phần quản trị sửa được), hỏi đáp.
// - Trên VPS: máy chủ đọc từ database (trang quản trị /admin sửa được) rồi nhúng vào trang (window.__CA_BOOT__).
// - Bản tĩnh (Vercel) hoặc khi chưa có database: dùng giá trị mặc định dưới đây (lấy từ mã nguồn).
import { site } from './site.js'
import { faqs } from './landing.js'

export const defaultSeo = {
  title: 'ChungAuto – Phần mềm cho gara, đại lý & showroom ô tô',
  description:
    'Website và phần mềm dựng sẵn cho gara ô tô, tiệm sửa xe máy, đại lý, showroom xe cũ, cửa hàng phụ kiện. Bàn giao 7 ngày, tặng landing page quảng cáo.',
  image: '/brand/og-home.jpg',
}

export function defaultBootstrap() {
  return {
    site: structuredClone(site),
    seo: { ...defaultSeo },
    // null = dùng nguyên dữ liệu Kho mẫu trong mã nguồn
    catalog: null,
    faqs: faqs.map((f) => ({ q: f.q, a: f.a })),
  }
}
