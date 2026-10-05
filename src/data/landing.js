export const segments = [
  { icon: 'Car', label: 'Gara ô tô đa hãng' },
  { icon: 'Store', label: 'Đại lý ô tô' },
  { icon: 'Car', label: 'Showroom xe cũ' },
  { icon: 'Bike', label: 'Tiệm sửa xe máy' },
  { icon: 'CircleDot', label: 'Lốp & ắc quy' },
  { icon: 'Droplets', label: 'Rửa xe & detailing' },
  { icon: 'PaintBucket', label: 'Sơn, gò đồng' },
  { icon: 'Package', label: 'Phụ tùng' },
  { icon: 'BatteryCharging', label: 'Xưởng xe điện' },
]

export const steps = [
  {
    day: 'Ngày 1',
    title: 'Chọn mẫu & tư vấn',
    text: 'Bạn chọn mẫu ưng ý trong kho, chuyên viên gọi lại để chốt tính năng: đặt lịch, số chi nhánh, bán phụ tùng.',
  },
  {
    day: 'Ngày 2',
    title: 'Gửi nội dung',
    text: 'Gửi logo, bảng giá dịch vụ, địa chỉ chi nhánh và ảnh xưởng. Chưa có ảnh đẹp? Chúng tôi dùng ảnh minh họa có bản quyền.',
  },
  {
    day: 'Ngày 3 – 6',
    title: 'Dựng phần mềm + landing page',
    text: 'Phần mềm được dựng theo nhận diện của bạn. Song song, chúng tôi làm landing page quảng cáo cho chương trình khuyến mãi bạn chọn.',
  },
  {
    day: 'Ngày 7',
    title: 'Bàn giao & chạy quảng cáo',
    text: 'Gắn tên miền, hướng dẫn quản trị 1-1 và cài sẵn mã đo lường để bạn chạy Facebook Ads, Google Ads ngay.',
  },
]

export const packages = [
  {
    id: 'cua-hang',
    name: 'Cửa hàng',
    fit: '1 điểm sửa chữa',
    price: 4900000,
    note: 'thanh toán 1 lần',
    gift: '1 landing page quảng cáo',
    features: [
      'Phần mềm 6 – 9 trang theo mẫu bạn chọn',
      'Form đặt lịch, nút gọi & Zalo nổi',
      'Bảng giá dịch vụ, bảo dưỡng theo km',
      'Tên miền .vn + hosting năm đầu',
      'Bảo hành kỹ thuật 12 tháng',
    ],
  },
  {
    id: 'chuoi',
    name: 'Chuỗi',
    fit: '2 – 10 chi nhánh',
    price: 9900000,
    note: 'thanh toán 1 lần',
    gift: '1 landing page + 1 tháng chạy hộ quảng cáo',
    featured: true,
    features: [
      'Tất cả quyền lợi gói Cửa hàng',
      'Đặt lịch theo từng chi nhánh',
      'Bản đồ & trang riêng cho mỗi chi nhánh',
      'Tra cứu lịch sử bảo dưỡng theo biển số',
      'Báo cáo lịch hẹn hằng tuần qua email',
    ],
  },
  {
    id: 'doanh-nghiep',
    name: 'Doanh nghiệp',
    fit: 'Trên 10 chi nhánh, nhượng quyền',
    price: null,
    note: 'báo giá theo yêu cầu',
    gift: '3 landing page theo chiến dịch',
    features: [
      'Thiết kế riêng theo nhận diện thương hiệu',
      'Bán phụ tùng online, giỏ hàng, thanh toán',
      'Kết nối phần mềm quản lý xưởng',
      'Tài khoản quản trị phân quyền theo chi nhánh',
      'Hỗ trợ ưu tiên 24/7',
    ],
  },
]

export const testimonials = [
  {
    name: 'Anh Trần Minh Đức',
    role: 'Chủ Gara Minh Đức Auto, Bình Thạnh',
    quote:
      'Trước đây khách chỉ gọi điện. Có phần mềm với form đặt lịch, mỗi tháng tôi nhận thêm khoảng 40 lịch hẹn online, chủ yếu là bảo dưỡng định kỳ.',
    metric: '+40',
    metricLabel: 'lịch hẹn online / tháng',
    template: 'AutoPro Garage',
  },
  {
    name: 'Chị Lê Thu Hà',
    role: 'Quản lý chuỗi 6 cửa hàng sửa xe máy, Hà Nội',
    quote:
      'Mỗi cửa hàng có trang riêng và bản đồ, khách tìm "sửa xe gần đây" là thấy. Landing page tặng kèm chúng tôi dùng cho đợt thay nhớt giảm giá, ra 312 số điện thoại.',
    metric: '312',
    metricLabel: 'khách để lại số trong 1 đợt',
    template: 'MotoFix 247',
  },
  {
    name: 'Anh Phạm Quốc Huy',
    role: 'Giám đốc Lốp Ắc Quy Huy Phát, Đà Nẵng',
    quote:
      'Khách tra kích cỡ lốp ngay trên web rồi mới tới cửa hàng, nhân viên đỡ phải tư vấn lại từ đầu. Bàn giao đúng 7 ngày như cam kết.',
    metric: '7',
    metricLabel: 'ngày từ lúc chọn mẫu đến lúc chạy',
    template: 'Lốp Việt',
  },
]

export const faqs = [
  {
    q: 'Phần mềm và landing page khác gì nhau? Sao lại tặng thêm landing page?',
    a: 'Phần mềm là cửa hàng online lâu dài, có nhiều trang (dịch vụ, bảng giá, chi nhánh, tin tức…) để khách tìm hiểu và đặt lịch. Landing page chỉ có 1 trang cho 1 chương trình khuyến mãi, dùng khi chạy quảng cáo: khách bấm quảng cáo, thấy đúng ưu đãi và để lại số điện thoại. Hai thứ bổ trợ nhau, nên chúng tôi tặng landing page để bạn chạy quảng cáo ngay sau khi có phần mềm.',
  },
  {
    q: 'Tôi có được đổi màu, logo và nội dung của mẫu không?',
    a: 'Có. Mỗi mẫu có sẵn 3 bộ màu, ngoài ra chúng tôi chỉnh theo màu nhận diện của bạn. Toàn bộ chữ, ảnh, bảng giá, chi nhánh đều thay bằng nội dung thật của gara.',
  },
  {
    q: 'Landing page tặng kèm dùng để làm gì?',
    a: 'Đó là một trang riêng cho một chương trình cụ thể, ví dụ "Thay dầu giảm 30%" hay "Kiểm tra xe miễn phí mùa mưa". Trang có form thu số điện thoại và được gắn sẵn mã đo lường để chạy quảng cáo Facebook, Google.',
  },
  {
    q: 'Tôi chưa có tên miền và hosting thì sao?',
    a: 'Gói Cửa hàng và Chuỗi đã gồm tên miền .vn và hosting năm đầu. Từ năm thứ hai, phí duy trì khoảng 1.200.000đ/năm.',
  },
  {
    q: 'Sau khi bàn giao, tôi tự cập nhật bảng giá được không?',
    a: 'Được. Bạn có trang quản trị để sửa giá dịch vụ, thêm chi nhánh, đăng tin khuyến mãi và xem danh sách lịch hẹn. Chúng tôi hướng dẫn 1-1 khi bàn giao.',
  },
  {
    q: 'Phần mềm có hiển thị tốt trên điện thoại không?',
    a: 'Tất cả mẫu đều tối ưu cho điện thoại, vì hơn 80% khách tìm gara bằng di động. Bạn có thể bấm "Xem thử" rồi chọn chế độ Điện thoại để kiểm tra.',
  },
  {
    q: 'Tôi có nhiều chi nhánh ở các tỉnh khác nhau, có làm được không?',
    a: 'Gói Chuỗi hỗ trợ tới 10 chi nhánh, mỗi chi nhánh có trang, bản đồ và lịch hẹn riêng. Trên 10 chi nhánh hoặc mô hình nhượng quyền, vui lòng chọn gói Doanh nghiệp.',
  },
]
