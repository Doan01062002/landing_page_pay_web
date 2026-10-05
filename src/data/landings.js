// Mẫu landing page quảng cáo tặng kèm khi khách triển khai website.
// Mỗi mẫu là một chiến dịch cụ thể, dựng bởi src/landings/LandingSite.jsx.
// Video: Mixkit (giấy phép miễn phí), đã nén trong /public/videos. Ảnh xưởng trích từ chính các video đó.

const v = (id, title, caption, duration) => ({ id, src: `/videos/mk-${id}.mp4`, poster: `/videos/mk-${id}.jpg`, title, caption, duration })
const x = (id) => `/images/xuong/x-${id}.jpg`
const img = (name) => `/images/${name}.jpg`

export const landings = [
  {
    slug: 'ceramic',
    name: 'Ceramic Studio',
    campaignType: 'Chăm sóc xe, detailing',
    forWebsite: 'Shine Detailing',
    summary: 'Một ưu đãi, một nút đăng ký. Video đánh bóng làm nền, giá trước và sau đặt cạnh nhau, đồng hồ đếm ngược và số suất còn lại.',
    accent: '#0E7490',
    fonts: { display: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif", body: "'Be Vietnam Pro', sans-serif" },
    variant: 'split',
    brand: {
      name: 'Shine Detailing',
      hotline: '0900 000 411',
      address: '55 Trần Não, An Khánh, Thủ Đức, TP. HCM',
      hours: '8:00 – 20:00 mỗi ngày',
    },
    hero: {
      eyebrow: 'Ưu đãi tháng 10 · Chỉ 50 suất',
      title: ['Phủ ceramic 9H,', 'bóng như xe mới.'],
      text: 'Đánh bóng 3 bước xóa xoáy sơn, phủ 2 lớp ceramic và bảo hành 3 năm. Giảm 30% cho 50 khách đăng ký đầu tiên.',
      video: v('47834', 'Đánh bóng thân xe', 'Đánh bóng bằng máy, xóa xoáy và vết xước nhẹ', '0:05'),
      cta: 'Giữ suất ưu đãi',
    },
    offer: {
      label: 'Gói Ceramic 9H cho sedan',
      oldPrice: 6500000,
      price: 4550000,
      note: 'SUV, bán tải cộng 20%. Đã gồm VAT.',
      deadline: '2026-10-31T23:59:59+07:00',
      slots: 50,
      taken: 32,
    },
    benefits: ['Bảo hành 3 năm', 'Đánh bóng 3 bước', 'Ceramic 9H 2 lớp', 'Kiểm tra định kỳ miễn phí', 'Nhận xe trong ngày', 'Phòng làm việc kín bụi'],
    included: [
      { icon: 'Droplets', title: 'Rửa bọt tuyết, tẩy bụi sắt', text: 'Làm sạch sâu trước khi đánh bóng, không để lại hạt cát gây xước.' },
      { icon: 'Sparkles', title: 'Đánh bóng 3 bước', text: 'Xóa xoáy sơn, vết xước nhẹ, trả lại độ trong của lớp sơn gốc.' },
      { icon: 'ShieldCheck', title: 'Phủ 2 lớp ceramic 9H', text: 'Kháng nước, chống tia UV, giữ màu sơn bền và dễ vệ sinh.' },
      { icon: 'CalendarCheck', title: 'Bảo hành 3 năm', text: 'Kiểm tra và bổ sung lớp phủ miễn phí mỗi 6 tháng.' },
    ],
    videos: [
      v('47834', 'Đánh bóng thân xe', 'Máy đánh bóng xóa xoáy sơn', '0:05'),
      v('47830', 'Đánh bóng chi tiết', 'Xử lý từng mảng sơn quanh cụm đèn', '0:09'),
      v('47831', 'Kiểm tra bề mặt', 'Kỹ thuật viên kiểm tra độ bóng sau khi hoàn thiện', '0:06'),
      v('47585', 'Rửa bọt tuyết', 'Làm sạch trước khi xử lý sơn', '0:07'),
      v('47832', 'Dưỡng da nội thất', 'Vệ sinh và dưỡng ghế da', '0:12'),
      v('36522', 'Giặt thảm sàn', 'Hút và giặt thảm bằng hơi nước', '0:06'),
    ],
    photos: [
      { src: x('47834'), caption: 'Khu đánh bóng', size: 'wide' },
      { src: x('47831'), caption: 'Kiểm tra sau phủ' },
      { src: img('white-car'), caption: 'Xe sau khi phủ ceramic', size: 'tall' },
      { src: x('47830'), caption: 'Xử lý chi tiết' },
      { src: x('36522'), caption: 'Vệ sinh nội thất' },
      { src: x('47585'), caption: 'Khu rửa xe' },
    ],
    steps: [
      { title: 'Đăng ký giữ suất', text: 'Để lại số điện thoại, chúng tôi gọi xác nhận lịch trong 15 phút.' },
      { title: 'Mang xe đến studio', text: 'Kiểm tra độ dày sơn, chụp ảnh hiện trạng trước khi làm.' },
      { title: 'Nhận xe trong ngày', text: 'Bàn giao kèm ảnh trước / sau và phiếu bảo hành 3 năm.' },
    ],
    reviews: [
      { name: 'Anh Khoa', car: 'BMW 320i', text: 'Sơn hết xoáy, đứng dưới nắng nhìn bóng như gương. Làm xong trong ngày.' },
      { name: 'Chị My', car: 'Honda CR-V', text: 'Nước mưa trôi tuột, rửa xe nhanh hơn hẳn. Có ảnh trước sau gửi qua Zalo.' },
    ],
    form: { carPlaceholder: 'Ví dụ: Mazda CX-5 2022', options: ['Sedan', 'SUV / Crossover', 'Bán tải', 'MPV 7 chỗ'] },
  },

  {
    slug: 'bao-duong',
    name: 'Service Pack',
    campaignType: 'Gara ô tô, bảo dưỡng',
    forWebsite: 'AutoPro Garage',
    summary: 'Tiêu đề lớn căn giữa, video xưởng trải ngang màn hình, bảng hạng mục rõ ràng. Hợp với gói bảo dưỡng giá cố định.',
    accent: '#1D4ED8',
    fonts: { display: "'Lexend', sans-serif", body: "'Be Vietnam Pro', sans-serif" },
    variant: 'center',
    brand: {
      name: 'AutoPro Garage',
      hotline: '0900 000 101',
      address: '128 Điện Biên Phủ, Bình Thạnh, TP. HCM',
      hours: '7:30 – 18:00, Thứ 2 – Chủ nhật',
    },
    hero: {
      eyebrow: 'Gói bảo dưỡng 10.000 km',
      title: ['Bảo dưỡng trọn gói', '990.000đ.'],
      text: 'Thay dầu tổng hợp, lọc dầu, kiểm tra 32 hạng mục và rửa xe miễn phí. Giá cố định, báo trước từng hạng mục, không phát sinh.',
      video: v('13270', 'Kiểm tra khoang máy', 'Kỹ thuật viên kiểm tra khoang động cơ', '0:08'),
      cta: 'Đặt lịch bảo dưỡng',
    },
    offer: {
      label: 'Gói 10.000 km cho sedan hạng B, C',
      oldPrice: 1450000,
      price: 990000,
      note: 'Áp dụng Vios, City, Accent, Mazda 3, Cerato… Xe khác báo giá qua Zalo.',
      deadline: '2026-10-31T23:59:59+07:00',
      slots: 120,
      taken: 87,
    },
    benefits: ['Dầu tổng hợp chính hãng', 'Kiểm tra 32 hạng mục', 'Báo giá trước khi làm', 'Rửa xe miễn phí', 'Phòng chờ có wifi, cà phê', 'Bảo hành 6 tháng'],
    included: [
      { icon: 'Droplet', title: 'Dầu tổng hợp 5W-30', text: 'Tối đa 4 lít, kèm thay lọc dầu chính hãng.' },
      { icon: 'Gauge', title: 'Kiểm tra 32 hạng mục', text: 'Phanh, lốp, gầm, đèn, ắc quy, nước làm mát… có phiếu kết quả.' },
      { icon: 'Wrench', title: 'Vệ sinh lọc gió', text: 'Vệ sinh lọc gió động cơ và lọc gió điều hòa.' },
      { icon: 'Sparkles', title: 'Rửa xe miễn phí', text: 'Rửa ngoài, hút bụi nội thất sau khi bảo dưỡng.' },
    ],
    videos: [
      v('13270', 'Kiểm tra khoang máy', 'Kiểm tra dầu, nước làm mát, dây curoa', '0:08'),
      v('4716', 'Sửa chữa động cơ', 'Tháo lắp và kiểm tra cụm động cơ', '0:11'),
      v('13260', 'Kiểm tra gầm xe', 'Nâng xe kiểm tra hệ thống treo, phanh', '0:12'),
      v('41937', 'Thay dầu', 'Châm dầu mới đúng định lượng', '0:08'),
      v('65', 'Khoang động cơ', 'Động cơ sau khi vệ sinh', '0:08'),
      v('47468', 'Kho lốp', 'Lốp chính hãng có sẵn tại xưởng', '0:07'),
    ],
    photos: [
      { src: x('13260'), caption: 'Khu nâng gầm', size: 'wide' },
      { src: x('13270'), caption: 'Khoang kiểm tra' },
      { src: x('47468'), caption: 'Kho lốp', size: 'tall' },
      { src: x('4716'), caption: 'Khu sửa chữa động cơ' },
      { src: img('tools-wall'), caption: 'Dụng cụ chuyên dụng' },
      { src: img('garage-car'), caption: 'Khu tiếp nhận xe' },
    ],
    steps: [
      { title: 'Đặt lịch online', text: 'Chọn ngày giờ, chi nhánh. Nhận xác nhận qua Zalo.' },
      { title: 'Kiểm tra & báo giá', text: 'Kỹ thuật viên kiểm tra 32 hạng mục, báo trước nếu cần thay thêm.' },
      { title: 'Nhận xe sau 60 phút', text: 'Kèm phiếu kết quả kiểm tra và lịch bảo dưỡng tiếp theo.' },
    ],
    reviews: [
      { name: 'Chị Ngọc', car: 'Toyota Vios', text: 'Đặt lịch online, tới là có người tiếp nhận. Đúng 1 tiếng là xong.' },
      { name: 'Anh Hoàng', car: 'Mazda 3', text: 'Có phiếu kiểm tra từng hạng mục, giá đúng 990 nghìn, không phát sinh.' },
    ],
    form: { carPlaceholder: 'Ví dụ: Toyota Vios 2021', options: ['Bình Thạnh', 'Thủ Đức', 'Quận 7'] , optionsLabel: 'Chi nhánh' },
  },

  {
    slug: 'khai-truong',
    name: 'Grand Opening',
    campaignType: 'Sửa xe máy, khai trương',
    forWebsite: 'MotoFix 247',
    summary: 'Video toàn khung với thẻ thông tin nổi, địa chỉ chi nhánh mới và quà khai trương. Hợp với khai trương hoặc sự kiện có ngày cụ thể.',
    accent: '#DC2626',
    fonts: { display: "'Oswald', sans-serif", body: "'Be Vietnam Pro', sans-serif" },
    variant: 'overlay',
    brand: {
      name: 'MotoFix 247',
      hotline: '0900 000 245',
      address: '36 Nguyễn Văn Cừ, Long Biên, Hà Nội',
      hours: '7:00 – 21:00 mỗi ngày',
    },
    hero: {
      eyebrow: 'Khai trương chi nhánh Long Biên · 18/10',
      title: ['Thay nhớt', '0đ tiền công.'],
      text: 'Mừng chi nhánh thứ 6, miễn phí công thay nhớt và kiểm tra 12 điểm cho mọi xe máy trong 3 ngày khai trương.',
      video: v('41936', 'Thay nhớt xe máy', 'Thay nhớt và kiểm tra máy', '0:12'),
      cta: 'Nhận vé ưu tiên',
    },
    offer: {
      label: 'Vé ưu tiên khai trương',
      oldPrice: 50000,
      price: 0,
      note: 'Chỉ trả tiền nhớt theo giá niêm yết. Tặng móc khóa cho 100 khách đầu.',
      deadline: '2026-10-20T21:00:00+07:00',
      slots: 300,
      taken: 214,
    },
    benefits: ['Miễn công thay nhớt', 'Kiểm tra 12 điểm', 'Rửa xe miễn phí', 'Quà cho 100 khách đầu', 'Không cần chờ lâu', 'Mở cửa 7:00 – 21:00'],
    included: [
      { icon: 'Droplet', title: 'Miễn công thay nhớt', text: 'Nhớt chính hãng, trả lại vỏ chai để bạn kiểm tra.' },
      { icon: 'Settings', title: 'Kiểm tra 12 điểm', text: 'Phanh, lốp, xích, đèn, còi, bugi, ắc quy…' },
      { icon: 'Sparkles', title: 'Rửa xe miễn phí', text: 'Áp dụng cả 3 ngày khai trương 18 – 20/10.' },
      { icon: 'Gift', title: 'Quà khai trương', text: 'Móc khóa và phiếu giảm 20% lần sửa tiếp theo.' },
    ],
    videos: [
      v('41936', 'Thay nhớt', 'Xả nhớt cũ, châm nhớt mới', '0:12'),
      v('41933', 'Sửa chữa tại xưởng', 'Thợ có chứng chỉ, dụng cụ chuyên dụng', '0:12'),
      v('41928', 'Kiểm tra động cơ', 'Siết, chỉnh từng chi tiết', '0:09'),
      v('41947', 'Khu chờ sửa', 'Xe được xếp gọn, có thẻ số', '0:10'),
      v('41941', 'Tiếp nhận xe', 'Đưa xe vào xưởng ngay khi tới', '0:05'),
    ],
    photos: [
      { src: x('41947'), caption: 'Khu tiếp nhận', size: 'wide' },
      { src: x('41936'), caption: 'Khu thay nhớt' },
      { src: img('moto-red'), caption: 'Xe sau bảo dưỡng', size: 'tall' },
      { src: x('41933'), caption: 'Khu sửa chữa' },
      { src: img('sockets'), caption: 'Bộ dụng cụ chuyên dụng' },
      { src: img('scooter'), caption: 'Xe tay ga' },
    ],
    steps: [
      { title: 'Nhận vé ưu tiên', text: 'Để lại số điện thoại, vé gửi qua tin nhắn Zalo.' },
      { title: 'Ghé chi nhánh mới', text: '36 Nguyễn Văn Cừ, Long Biên, từ 18 đến 20/10.' },
      { title: 'Đưa vé, thay nhớt', text: 'Khách có vé được ưu tiên vào xưởng trước.' },
    ],
    reviews: [
      { name: 'Minh', car: 'Honda Vision', text: 'Có vé ưu tiên nên vào làm luôn, 15 phút xong cả thay nhớt lẫn rửa xe.' },
      { name: 'Lan', car: 'Honda SH Mode', text: 'Thợ trả lại vỏ chai nhớt cho xem, giá đúng như niêm yết.' },
    ],
    form: { carPlaceholder: 'Ví dụ: Honda Vision', options: ['18/10 (Thứ Bảy)', '19/10 (Chủ nhật)', '20/10 (Thứ Hai)'], optionsLabel: 'Ngày ghé' },
  },
]

export const getLanding = (slug) => landings.find((l) => l.slug === slug)
