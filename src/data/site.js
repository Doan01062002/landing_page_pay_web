// Thông tin thương hiệu bên bán mẫu website (lấy từ chungauto.vn). Đổi tại đây là cập nhật toàn trang.
export const site = {
  brand: 'ChungAuto',
  domain: 'chungauto.vn',
  tagline: 'Giải pháp website cho gara',
  logo: '/brand/logo-mobile.png',
  hotline: '1800 8282',
  zalo: 'Zalo OA ChungAuto',
  zaloUrl: 'https://zalo.me/1417031441174876205',
  facebookUrl: 'https://www.facebook.com/ChungAuto.vncom/',
  email: 'marketing@chungauto.vn',
  address: '495 Hoàng Quốc Việt, Cổ Nhuế, Bắc Từ Liêm, Hà Nội',
  company: 'Công ty Cổ phần Chung Group · MST 0110297480',
  showrooms: 13,
  promo: {
    label: 'Ưu đãi tháng 10',
    text: 'Triển khai website trong tháng này, tặng 1 landing page quảng cáo trị giá 3.500.000đ',
    giftValue: 3500000,
  },
}

export const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ'
