// Sinh dữ liệu ban đầu cho trang quản trị của một mẫu: lấy dữ liệu thật của mẫu (sản phẩm, xe, dịch vụ, chi nhánh…)
// rồi sinh thêm giao dịch minh hoạ (đơn hàng, lịch hẹn, khách quan tâm…) rải theo ngày tính từ hôm nay.
// Dùng số ngẫu nhiên có hạt theo key: cùng một mẫu luôn ra cùng một bộ dữ liệu.
import { addDays, CARS, email, hashStr, isoDay, personName, phone, plate, rng, uid } from './lib.js'

// Dịch vụ của các landing gara (lấy theo nội dung trang)
const GARA_SERVICES = [
  ['Bảo dưỡng nhanh cấp nhỏ', 'Bảo dưỡng', 690000, '45 phút', 'Thay dầu, lọc dầu, kiểm tra 20 hạng mục an toàn.'],
  ['Bảo dưỡng cấp trung bình', 'Bảo dưỡng', 1450000, '2 giờ', 'Gói cấp nhỏ + lọc gió, dầu phanh, vệ sinh kim phun.'],
  ['Bảo dưỡng cấp lớn', 'Bảo dưỡng', 3200000, '4 giờ', 'Thay toàn bộ dầu, lọc, bugi, dầu hộp số, nước làm mát.'],
  ['Sửa chữa máy – gầm', 'Sửa chữa', 0, 'Theo kiểm tra', 'Chẩn đoán bằng máy, báo giá trước khi làm.'],
  ['Sửa điện & điều hoà', 'Sửa chữa', 450000, '1–3 giờ', 'Kiểm tra lốc lạnh, nạp gas, xử lý chập điện.'],
  ['Xử lý vết xước nhỏ', 'Đồng sơn', 450000, '2 giờ', 'Đánh xước, dặm sơn cục bộ.'],
  ['Sơn cản / cửa / tai xe', 'Đồng sơn', 1200000, '1 ngày', 'Sơn phòng sấy, bảo hành màu 12 tháng.'],
  ['Sơn quây cả xe', 'Đồng sơn', 18000000, '7–10 ngày', 'Làm mới toàn bộ màu sơn, giữ đúng mã màu.'],
  ['Gò hàn – phục hồi xe tai nạn', 'Đồng sơn', 0, 'Theo hồ sơ', 'Kéo nắn khung, thay thế theo bảo hiểm.'],
  ['Kiểm tra tổng quát', 'Kiểm tra', 0, '30 phút', 'Miễn phí kiểm tra 32 hạng mục.'],
  ['Vệ sinh & khử mùi nội thất', 'Chăm sóc', 650000, '2 giờ', 'Giặt ghế, trần, sàn; khử mùi bằng ozone.'],
  ['Đánh bóng & phủ ceramic', 'Chăm sóc', 4500000, '1 ngày', 'Đánh bóng 3 bước, phủ ceramic 9H.'],
  ['Rửa xe + khử mùi điều hoà', 'Chăm sóc', 250000, '45 phút', 'Rửa bọt tuyết, vệ sinh dàn lạnh.'],
]
const MOTO_SERVICES = [
  ['Thay nhớt + vệ sinh lọc gió', 'Bảo dưỡng', 120000, '20 phút', ''],
  ['Bảo dưỡng tổng quát xe tay ga', 'Bảo dưỡng', 350000, '1 giờ', ''],
  ['Vệ sinh nồi, bugi, kim phun', 'Bảo dưỡng', 250000, '45 phút', ''],
  ['Thay má phanh trước/sau', 'Sửa chữa', 180000, '20 phút', ''],
  ['Thay lốp xe máy', 'Lốp', 380000, '15 phút', ''],
  ['Sửa điện, đề, sạc', 'Sửa chữa', 150000, '30 phút', ''],
]
const PARTS = [
  ['Dầu động cơ 5W-30 (4L)', 'Can', 620000, 890000],
  ['Lọc dầu', 'Cái', 65000, 120000],
  ['Lọc gió động cơ', 'Cái', 120000, 220000],
  ['Lọc gió điều hoà', 'Cái', 95000, 180000],
  ['Bugi iridium', 'Cái', 180000, 290000],
  ['Má phanh trước', 'Bộ', 420000, 680000],
  ['Má phanh sau', 'Bộ', 360000, 590000],
  ['Dầu phanh DOT4 (1L)', 'Chai', 95000, 160000],
  ['Nước làm mát (4L)', 'Can', 160000, 260000],
  ['Dầu hộp số tự động (4L)', 'Can', 720000, 1050000],
  ['Ắc quy 12V 60Ah', 'Bình', 1350000, 1850000],
  ['Gạt mưa (cặp)', 'Bộ', 140000, 260000],
  ['Bóng đèn pha H4', 'Cái', 95000, 180000],
  ['Gas lạnh R134a', 'Bình', 260000, 450000],
  ['Dây curoa tổng', 'Sợi', 380000, 620000],
  ['Rotuyn lái ngoài', 'Cái', 450000, 720000],
  ['Giảm xóc trước', 'Cái', 1450000, 2100000],
  ['Sơn gốc nước (lít)', 'Lít', 520000, 0],
  ['Dung dịch vệ sinh kim phun', 'Chai', 120000, 220000],
  ['Lốp 185/65R15', 'Chiếc', 1150000, 1450000],
]
const SHOP_SERVICES = {
  'du-an-lumen': [
    ['Gói độ Bi-LED trọn gói 2 bên', 6900000, '3–4 giờ', '36 tháng'],
    ['Gói độ Bi-Laser', 12900000, '4–5 giờ', '36 tháng'],
    ['Ambient 64 màu – 18 vị trí', 4500000, '1 ngày', '24 tháng'],
    ['Phục hồi đèn pha ố vàng (cặp)', 690000, '1,5 giờ', '6 tháng'],
    ['Lắp đèn trợ sáng / đèn rọi', 450000, '1 giờ', '12 tháng'],
    ['Căn chỉnh góc chiếu đèn', 0, '20 phút', '—'],
  ],
  'du-an-vanhviet': [
    ['Cân bằng động 4 bánh', 200000, '30 phút', '—'],
    ['Căn chỉnh thước lái 3D', 450000, '45 phút', '—'],
    ['Thay lốp (công tháo lắp / bánh)', 50000, '15 phút', '—'],
    ['Sơn mâm (bộ 4)', 2400000, '2 ngày', '12 tháng'],
    ['Nắn mâm cong vênh (1 chiếc)', 350000, '1 giờ', '3 tháng'],
    ['Bơm khí nitơ', 0, '10 phút', '—'],
  ],
}
const POSTS = {
  gara: [
    ['Lịch bảo dưỡng ô tô theo mốc km: làm gì ở mỗi mốc?', 'Kinh nghiệm'],
    ['5 dấu hiệu xe cần kiểm tra hệ thống phanh ngay', 'Kinh nghiệm'],
    ['Điều hoà ô tô kém lạnh: nguyên nhân và cách xử lý', 'Kinh nghiệm'],
    ['Quy trình tiếp nhận và báo giá minh bạch tại xưởng', 'Tin xưởng'],
    ['Ưu đãi tháng này: giảm 10% công thợ khi đặt lịch online', 'Khuyến mãi'],
  ],
  shop: [
    ['Cách chọn phụ kiện đúng dòng xe, tránh mua nhầm', 'Hướng dẫn'],
    ['Bảo hành điện tử: tra cứu bằng số điện thoại', 'Chính sách'],
    ['Top phụ kiện được mua nhiều nhất tháng này', 'Tin tức'],
    ['Flash sale cuối tuần: lịch mở bán và số suất', 'Khuyến mãi'],
  ],
  showroom: [
    ['Mua xe trả góp: cần chuẩn bị giấy tờ gì?', 'Kinh nghiệm'],
    ['Chi phí lăn bánh gồm những khoản nào?', 'Kinh nghiệm'],
    ['So sánh nhanh các phiên bản đang bán tại showroom', 'Đánh giá xe'],
    ['Chương trình ưu đãi trong tháng', 'Khuyến mãi'],
    ['Kinh nghiệm lái thử: nên kiểm tra những gì?', 'Kinh nghiệm'],
  ],
}
const SOURCES = [['Website', 40], ['Zalo', 20], ['Hotline', 15], ['Facebook', 15], ['Vãng lai', 10]]
const CITIES = ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ']
const SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
const BANKS = ['Vietcombank', 'Techcombank', 'VPBank', 'TPBank', 'MB Bank', 'BIDV', 'VIB']

// "từ 690.000đ" → 690000; "1.290.000đ" → 1290000; "báo giá sau kiểm tra" → 0
const parsePrice = (s) => {
  if (typeof s === 'number') return s
  const m = String(s || '').match(/[\d.]+/)
  return m ? Number(m[0].replace(/\./g, '')) || 0 : 0
}
const stamp = (day, r) => {
  const d = new Date(day)
  d.setHours(r.int(7, 20), r.int(0, 59), r.int(0, 59))
  return d.toISOString()
}

// ---------- Ảnh minh hoạ cho dữ liệu mẫu (ảnh thật có sẵn trong public/) ----------
const MP = '/du-an/minhphat/assets/img/'
const XUONG = ['13260', '13270', '36522', '41933', '41936', '41947', '4716', '47585', '47830', '47831', '47834'].map((n) => `/images/xuong/x-${n}.jpg`)
const MOTO = ['/images/moto-city.jpg', '/images/moto-red.jpg', '/images/scooter.jpg', '/images/sockets.jpg', '/images/wrench-piston.jpg', '/images/tools-wall.jpg']
// từ khoá trong tên dịch vụ / bài viết → ảnh
const TOPIC_IMG = [
  [/sơn|dặm|quây/i, [MP + 's-son.webp', MP + 'g-son-dam.webp']],
  [/gò|hàn|móp|tai nạn|đồng/i, [MP + 'c-dent.webp']],
  [/đánh bóng|ceramic|phủ bóng|hiệu chỉnh sơn|detailing/i, [MP + 'c-polish.webp', MP + 'g-danh-bong.webp']],
  [/rửa|vệ sinh|nội thất|khử mùi/i, [MP + 'g-rua-xe.webp', MP + 'g-noi-that.webp']],
  [/điều hoà|điều hòa|máy lạnh/i, [MP + 's-dieu-hoa.webp']],
  [/lốp|vỏ xe|cân bằng|góc lái|lazang|la-zăng|mâm|vành/i, [MP + 'g-can-bang.webp', MP + 's-lazang.webp', '/images/xuong/x-47468.jpg']],
  [/gầm|phanh|thắng|treo|giảm xóc|phuộc/i, [MP + 'g-gam.webp', MP + 's-may-gam.webp']],
  [/ắc quy|acquy|bình điện|điện|đề nổ/i, ['/images/battery.jpg', MP + 's-dieu-hoa.webp']],
  [/thay dầu|nhớt|bảo dưỡng|bảo trì|mốc km|định kỳ/i, [MP + 's-bao-duong.webp', MP + 'g-thay-dau.webp']],
  [/động cơ|máy|hộp số|đại tu|chẩn đoán|kiểm tra/i, [MP + 'g-khoang-may.webp', MP + 'b-dong-co.webp', '/images/engine.jpg']],
  [/phim|dán/i, [MP + 's-phim.webp']],
  [/đèn|gương|camera/i, [MP + 's-guong-den.webp', MP + 'b-den-pha.webp']],
  [/cứu hộ|kéo xe/i, [MP + 's-cuu-ho.webp']],
  [/phụ tùng|phụ kiện|độ |nâng cấp/i, [MP + 's-phu-tung.webp', MP + 's-do-xe.webp']],
  [/chọn gara|gara uy tín/i, [MP + 'b-chon-gara.webp']],
  [/ít đi|để lâu|nghỉ lễ|đường dài/i, [MP + 'b-it-di.webp']],
  [/trẻ|con nhỏ|gia đình/i, [MP + 'b-con.webp']],
]
const topicImage = (text, i, fallback = XUONG) => {
  const hit = TOPIC_IMG.find(([re]) => re.test(text || ''))
  const list = hit ? hit[1] : fallback
  return list[i % list.length]
}
// ảnh trước / sau theo cặp cùng hạng mục
const BA_PAIRS = [
  ['Gò hàn – phục hồi xe tai nạn', MP + 'c-dent.webp', MP + 'v-son-dam.webp'],
  ['Sơn dặm', MP + 's-son.webp', MP + 'g-son-dam.webp'],
  ['Đánh bóng & phủ ceramic', MP + 'g-rua-xe.webp', MP + 'c-polish.webp'],
  ['Vệ sinh nội thất', MP + 'g-noi-that.webp', MP + 's-do-xe.webp'],
  ['Vệ sinh khoang máy', MP + 's-dieu-hoa.webp', MP + 'g-khoang-may.webp'],
  ['Phục hồi mâm', MP + 's-lazang.webp', MP + 'c-wheel.webp'],
  ['Phủ gầm chống ồn', MP + 's-may-gam.webp', MP + 'g-gam.webp'],
  ['Thay lốp & cân bằng động', '/images/xuong/x-47468.jpg', MP + 'g-can-bang.webp'],
]
// ảnh bài viết lưu dạng mã Unsplash (trang Hưng Thịnh) → đường dẫn ảnh đầy đủ
const fullImage = (s) => (/^\d{10,}-[0-9a-f]{6,}$/.test(s || '') ? `https://images.unsplash.com/photo-${s}?auto=format&fit=crop&w=640&q=70` : s || '')

export function buildSeed(site, data = {}) {
  const r = rng(hashStr(site.key))
  const T = site.template || {}
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const day = (n) => isoDay(addDays(today, n))
  const out = {}
  let seq = 0
  const id = () => `s${(++seq).toString(36)}`

  // ---------- Chi nhánh ----------
  const branchSrc = data.branches?.length ? data.branches : T.branches?.length ? T.branches : [{ name: site.name, address: site.address, phone: site.hotline, hours: site.hours }]
  out.branches = branchSrc.map((b, i) => ({
    id: id(),
    name: b.name,
    address: b.address,
    phone: b.phone || site.hotline,
    hours: b.hours || site.hours,
    manager: personName(r),
    capacity: b.note || `${r.int(3, 8)} khoang làm việc`,
    status: 'Đang hoạt động',
    main: i === 0,
  }))
  const branchNames = out.branches.map((b) => b.name)

  // ---------- Nhân viên ----------
  const roleSet =
    site.profile === 'gara'
      ? [['Quản trị viên', 1], ['Quản lý xưởng', 1], ['Cố vấn dịch vụ', 2], ['Kỹ thuật viên', 4], ['Kế toán', 1], ['Marketing', 1]]
      : site.profile === 'shop'
        ? [['Quản trị viên', 1], ['Quản lý cửa hàng', 1], ['Nhân viên bán hàng', 3], ['Kỹ thuật lắp đặt', 2], ['Thủ kho', 1], ['Kế toán', 1], ['Marketing', 1]]
        : [['Quản trị viên', 1], ['Giám đốc kinh doanh', 1], ['Tư vấn bán hàng', 4], ['Chuyên viên tài chính', 1], ['Kỹ thuật kiểm định', 1], ['Marketing', 1]]
  out.staff = []
  roleSet.forEach(([role, n]) => {
    for (let i = 0; i < n; i++) {
      const name = role === 'Quản trị viên' ? 'Quản trị viên' : personName(r)
      out.staff.push({
        id: id(),
        name,
        role,
        phone: phone(r),
        email: role === 'Quản trị viên' ? `admin@${site.slug}.demo` : email(r, name),
        branch: role === 'Quản trị viên' ? 'Tất cả' : r.pick(branchNames),
        status: r.chance(0.92) ? 'Đang làm việc' : 'Tạm nghỉ',
        lastLogin: new Date(Date.now() - r.int(5, 60 * 72) * 60000).toISOString(),
        createdAt: day(-r.int(120, 900)),
      })
    }
  })
  const staffBy = (re) => out.staff.filter((s) => re.test(s.role)).map((s) => s.name)
  const techs = staffBy(/Kỹ thuật/)
  const sales = staffBy(/Tư vấn|bán hàng|Cố vấn/)

  // ---------- Khách hàng (tổng chi tiêu tính lại sau khi có giao dịch) ----------
  out.customers = Array.from({ length: 72 }, (_, i) => {
    const name = personName(r)
    const city = site.profile === 'gara' ? r.pick(CITIES.slice(0, 1)) : r.pick(CITIES)
    const car = site.flags.moto ? r.pick(['Honda Vision', 'Honda SH', 'Yamaha Exciter', 'Honda Air Blade', 'VinFast Klara']) : r.pick(CARS)
    return {
      id: id(),
      code: 'KH' + String(i + 1).padStart(4, '0'),
      name,
      phone: phone(r),
      email: r.chance(0.6) ? email(r, name) : '',
      city,
      car,
      plate: site.flags.moto ? `${r.int(29, 30)}-${r.pick(['B1', 'G1', 'H1'])} ${r.int(100, 999)}.${r.int(10, 99)}` : plate(r, city),
      source: r.weighted(SOURCES),
      tier: 'Mới',
      spent: 0,
      visits: 0,
      lastVisit: '',
      note: r.chance(0.15) ? r.pick(['Khách quen, ưu tiên xếp lịch sáng', 'Hay hỏi báo giá qua Zalo', 'Xe công ty, xuất hoá đơn VAT', 'Thích nhận ưu đãi qua SMS']) : '',
      createdAt: day(-r.int(5, 420)),
    }
  })
  const cust = () => r.pick(out.customers)
  const touch = (c, amount, date) => {
    c.spent += amount
    c.visits += 1
    if (!c.lastVisit || date > c.lastVisit) c.lastVisit = date
  }

  // ---------- Dịch vụ ----------
  const svcSrc = data.services?.length
    ? data.services
    : T.services?.length
      ? T.services.map((s) => ({ name: s.title, group: 'Dịch vụ', price: parsePrice(s.price), priceText: s.price, desc: s.desc, image: s.image }))
      : site.profile === 'gara'
        ? (site.flags.moto ? MOTO_SERVICES : GARA_SERVICES).map(([name, group, price, duration, desc]) => ({ name, group, price, duration, desc }))
        : []
  // dịch vụ thi công tại cửa hàng (trang bán hàng không có danh sách dịch vụ riêng trong dữ liệu)
  if (!svcSrc.length && SHOP_SERVICES[site.key]) svcSrc.push(...SHOP_SERVICES[site.key].map(([name, price, duration, warranty]) => ({ name, group: 'Thi công tại cửa hàng', price, duration, warranty })))
  if (T.packages?.length) svcSrc.push(...T.packages.map((p) => ({ name: `Gói ${p.name}`, group: 'Gói dịch vụ', price: parsePrice(p.price), desc: p.items.join(', ') })))
  out.services = svcSrc.map((s, i) => ({
    id: id(),
    code: 'DV' + String(i + 1).padStart(3, '0'),
    name: s.name,
    group: s.group || 'Dịch vụ',
    price: s.price || 0,
    priceText: s.priceText || (s.price ? '' : 'Báo giá sau kiểm tra'),
    duration: s.duration || r.pick(['45 phút', '1 giờ', '2 giờ', '3–4 giờ']),
    warranty: s.warranty || r.pick(['3 tháng', '6 tháng', '12 tháng', '—']),
    desc: s.desc || '',
    image: s.image || (site.flags.moto ? MOTO[i % MOTO.length] : topicImage(s.name, i)),
    visible: true,
  }))
  const svcNames = out.services.map((s) => s.name)
  const svcPrice = (name) => out.services.find((s) => s.name === name)?.price || r.int(3, 30) * 100000

  // ======================= GARA =======================
  if (site.profile === 'gara') {
    out.parts = PARTS.map(([name, unit, cost, price], i) => ({
      id: id(),
      sku: 'PT' + String(i + 1).padStart(3, '0'),
      name,
      unit,
      stock: r.chance(0.12) ? r.int(0, 3) : r.int(6, 60),
      min: 5,
      cost,
      price: price || Math.round(cost * 1.45 / 1000) * 1000,
      supplier: r.pick(['Phụ tùng Minh Long', 'Đại lý dầu nhớt Việt Úc', 'Kho phụ tùng Hưng Thịnh', 'Phụ tùng chính hãng']),
    }))

    out.bookings = []
    for (let i = 0; i < 120; i++) {
      const n = r.int(-45, 14)
      const date = day(n)
      const c = cust()
      const status =
        n < 0
          ? r.weighted([['Hoàn thành', 74], ['Không đến', 8], ['Đã huỷ', 10], ['Đã xác nhận', 8]])
          : n === 0
            ? r.weighted([['Đang thực hiện', 35], ['Đã xác nhận', 35], ['Chờ xác nhận', 15], ['Hoàn thành', 15]])
            : r.weighted([['Chờ xác nhận', 45], ['Đã xác nhận', 55]])
      out.bookings.push({
        id: id(),
        code: 'LH' + String(i + 1).padStart(4, '0'),
        customer: c.name,
        phone: c.phone,
        car: c.car,
        plate: c.plate,
        service: r.pick(svcNames),
        branch: r.pick(branchNames),
        date,
        time: r.pick(SLOTS),
        status,
        source: r.weighted(SOURCES),
        tech: status === 'Chờ xác nhận' ? '' : r.pick(techs),
        note: r.chance(0.2) ? r.pick(['Xe có tiếng kêu gầm khi qua ổ gà', 'Cần lấy xe trước 17h', 'Báo giá qua Zalo trước khi làm', 'Kiểm tra thêm điều hoà']) : '',
        createdAt: stamp(addDays(today, Math.min(n, 0) - r.int(0, 6)), r),
      })
    }
    out.bookings.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    out.bookings.forEach((b, i) => (b.code = 'LH' + String(i + 1).padStart(4, '0')))

    out.repairOrders = []
    for (let i = 0; i < 90; i++) {
      const n = -r.int(0, 75)
      const c = cust()
      const items = []
      r.sample(out.services.filter((s) => s.price > 0), r.int(1, 2)).forEach((s) => items.push({ name: s.name, kind: 'Công', qty: 1, price: s.price }))
      r.sample(out.parts, r.int(0, 3)).forEach((p) => items.push({ name: p.name, kind: 'Phụ tùng', qty: p.unit === 'Can' || p.unit === 'Bộ' ? 1 : r.int(1, 4), price: p.price }))
      const sub = items.reduce((s, it) => s + it.qty * it.price, 0)
      const discount = r.chance(0.25) ? Math.round((sub * r.pick([0.05, 0.1])) / 1000) * 1000 : 0
      const status =
        n < -3
          ? r.weighted([['Đã giao xe', 88], ['Đã huỷ', 6], ['Hoàn thành', 6]])
          : r.weighted([['Báo giá', 18], ['Đã duyệt', 18], ['Đang sửa', 30], ['Chờ phụ tùng', 12], ['Hoàn thành', 22]])
      const total = sub - discount
      const paid = status === 'Đã giao xe' ? total : status === 'Hoàn thành' ? (r.chance(0.5) ? total : 0) : status === 'Đã huỷ' ? 0 : r.chance(0.3) ? Math.round(total * 0.3 / 1000) * 1000 : 0
      const date = day(n)
      out.repairOrders.push({
        id: id(),
        code: '',
        customer: c.name,
        phone: c.phone,
        car: c.car,
        plate: c.plate,
        km: r.int(8, 160) * 1000,
        branch: r.pick(branchNames),
        advisor: r.pick(sales.length ? sales : techs),
        tech: r.pick(techs),
        items,
        discount,
        paid,
        status,
        date,
        note: '',
        createdAt: stamp(addDays(today, n), r),
      })
      if (status === 'Đã giao xe') touch(c, total, date)
    }
    out.repairOrders.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    out.repairOrders.forEach((o, i) => (o.code = 'PSC' + String(i + 1).padStart(4, '0')))

    // hồ sơ xe: xe của khách đã từng vào xưởng
    const byPlate = {}
    out.repairOrders.forEach((o) => {
      const v = (byPlate[o.plate] ||= { plate: o.plate, car: o.car, owner: o.customer, phone: o.phone, visits: 0, km: 0, last: '' })
      v.visits++
      v.km = Math.max(v.km, o.km)
      if (o.date > v.last) v.last = o.date
    })
    out.vehicles = Object.values(byPlate).map((v) => ({
      id: id(),
      plate: v.plate,
      car: v.car,
      year: r.int(2015, 2025),
      color: r.pick(['Trắng', 'Đen', 'Bạc', 'Xám', 'Đỏ', 'Xanh']),
      vin: Array.from({ length: 17 }, () => r.pick([...'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'])).join(''),
      owner: v.owner,
      phone: v.phone,
      km: v.km,
      visits: v.visits,
      lastService: v.last,
      nextService: isoDay(addDays(new Date(v.last), 180)),
      insurance: r.chance(0.6) ? r.pick(['Bảo Việt', 'PVI', 'Bảo Minh', 'MIC']) : '',
    }))
  }

  // ======================= SẢN PHẨM (cửa hàng, phụ kiện showroom) =======================
  if (site.profile === 'shop' || site.flags.accessories) {
    const src = data.products?.length
      ? data.products
      : (T.products || []).map((p) => ({ name: p.name, price: parsePrice(p.price), oldPrice: parsePrice(p.oldPrice), image: p.image, category: /ắc quy/i.test(p.name) ? 'Ắc quy' : /lốp/i.test(p.name) ? 'Lốp' : 'Phụ tùng' }))
    out.products = src.map((p, i) => {
      const stock = r.chance(0.1) ? 0 : r.chance(0.12) ? r.int(1, 4) : r.int(8, 140)
      return {
        id: id(),
        sku: (site.slug.slice(0, 2) + '-' + String(i + 1).padStart(4, '0')).toUpperCase(),
        name: p.name,
        category: p.category || 'Khác',
        brand: p.brand || site.name,
        price: p.price,
        oldPrice: p.oldPrice || 0,
        cost: Math.round((p.price * r.int(55, 72)) / 100 / 1000) * 1000,
        stock,
        min: 5,
        sold: p.sold || r.int(10, 900),
        rating: p.rating || +(4 + r.next()).toFixed(1),
        image: p.image || '',
        spec: p.spec || '',
        desc: p.desc || '',
        status: stock === 0 ? 'Hết hàng' : 'Đang bán',
        featured: r.chance(0.3),
        createdAt: day(-r.int(10, 300)),
      }
    })
    const cats = data.categories?.length ? data.categories.map((c) => c.name) : [...new Set(out.products.map((p) => p.category))]
    out.categories = cats.map((name, i) => ({ id: id(), name, order: i + 1, visible: true, desc: '' }))

    out.orders = []
    const N = site.profile === 'shop' ? 170 : 60
    for (let i = 0; i < N; i++) {
      // rải đều 90 ngày, hơi dày hơn ở gần đây (cửa hàng đang tăng trưởng nhẹ)
      const n = -Math.floor(Math.pow(r.next(), 1.12) * 90)
      const c = cust()
      const items = r.sample(out.products, r.weighted([[1, 60], [2, 30], [3, 10]])).map((p) => ({ name: p.name, sku: p.sku, qty: r.weighted([[1, 80], [2, 15], [4, 5]]), price: p.price, image: p.image }))
      const sub = items.reduce((s, it) => s + it.qty * it.price, 0)
      const ship = sub >= 500000 ? 0 : 30000
      const discount = r.chance(0.3) ? r.pick([20000, 50000, 100000, Math.round(sub * 0.05 / 1000) * 1000]) : 0
      const status =
        n <= -4
          ? r.weighted([['Hoàn tất', 84], ['Đã huỷ', 9], ['Trả hàng', 3], ['Đã giao', 4]])
          : r.weighted([['Chờ xác nhận', 30], ['Đã xác nhận', 25], ['Đang giao', 25], ['Đã giao', 12], ['Đã huỷ', 8]])
      const payment = r.weighted([['COD', 45], ['Chuyển khoản', 35], ['Thẻ / ví điện tử', 15], ['Trả góp 0%', 5]])
      const date = day(n)
      const total = Math.max(0, sub + ship - discount)
      out.orders.push({
        id: id(),
        code: '',
        customer: c.name,
        phone: c.phone,
        address: `${r.int(1, 300)} ${r.pick(['Nguyễn Trãi', 'Lê Lợi', 'Trần Phú', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Nguyễn Văn Linh', 'Phạm Văn Đồng'])}, ${c.city}`,
        items,
        ship,
        discount,
        payment,
        paid: payment !== 'COD' ? status !== 'Đã huỷ' : ['Hoàn tất', 'Đã giao'].includes(status),
        channel: r.weighted([['Website', 55], ['Zalo', 15], ['Facebook', 15], ['Hotline', 10], ['Tại cửa hàng', 5]]),
        install: r.chance(0.3),
        status,
        date,
        note: r.chance(0.12) ? r.pick(['Giao giờ hành chính', 'Gọi trước khi giao', 'Xuất hoá đơn công ty', 'Lắp tại nhà buổi tối']) : '',
        createdAt: stamp(addDays(today, n), r),
      })
      if (status === 'Hoàn tất') touch(c, total, date)
    }
    out.orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    out.orders.forEach((o, i) => (o.code = 'DH' + String(i + 1).padStart(5, '0')))

    if (site.profile === 'shop') {
      out.installs = []
      for (let i = 0; i < 55; i++) {
        const n = r.int(-25, 10)
        const c = cust()
        const status =
          n < 0 ? r.weighted([['Hoàn thành', 82], ['Đã huỷ', 10], ['Không đến', 8]]) : n === 0 ? r.weighted([['Đang thực hiện', 40], ['Đã xác nhận', 40], ['Hoàn thành', 20]]) : r.weighted([['Chờ xác nhận', 45], ['Đã xác nhận', 55]])
        out.installs.push({
          id: id(),
          code: 'LD' + String(i + 1).padStart(4, '0'),
          customer: c.name,
          phone: c.phone,
          car: c.car,
          item: r.chance(0.35) && out.services.length ? r.pick(svcNames) : r.pick(out.products).name,
          place: r.chance(0.7) ? 'Tại cửa hàng' : 'Tận nơi',
          branch: r.pick(branchNames),
          date: day(n),
          time: r.pick(SLOTS),
          status,
          tech: status === 'Chờ xác nhận' ? '' : r.pick(techs.length ? techs : out.staff.map((s) => s.name)),
          note: '',
          createdAt: stamp(addDays(today, Math.min(n, 0) - r.int(0, 5)), r),
        })
      }
      out.installs.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      out.installs.forEach((b, i) => (b.code = 'LD' + String(i + 1).padStart(4, '0')))

      const SLOT = ['09:00 – 12:00', '12:00 – 15:00', '15:00 – 18:00', '20:00 – 23:00']
      out.flashsales = r.sample(out.products.filter((p) => p.stock > 0), Math.min(8, out.products.length)).map((p, i) => {
        const limit = r.pick([20, 30, 40, 50])
        return {
          id: id(),
          product: p.name,
          price: p.price,
          flashPrice: Math.round((p.price * r.pick([0.75, 0.8, 0.85])) / 1000) * 1000,
          slot: SLOT[i % SLOT.length],
          date: day(i < 4 ? 0 : 1),
          limit,
          sold: i < 4 ? r.int(2, limit - 1) : 0,
          perCustomer: 2,
          active: true,
        }
      })

      const SUPPLIERS = ['Công ty Phụ tùng Đông Á', 'Nhà phân phối Việt Phát', 'Kho tổng Hưng Long', 'Đại lý Sài Gòn Auto Parts']
      out.stockReceipts = Array.from({ length: 14 }, (_, i) => {
        const items = r.sample(out.products, r.int(2, 5)).map((p) => ({ name: p.name, sku: p.sku, qty: r.int(5, 40), price: p.cost }))
        const n = -r.int(0, 80)
        return {
          id: id(),
          code: 'PN' + String(i + 1).padStart(4, '0'),
          supplier: r.pick(SUPPLIERS),
          items,
          status: n > -3 ? r.pick(['Chờ nhập kho', 'Đã nhập kho']) : r.weighted([['Đã nhập kho', 90], ['Đã huỷ', 10]]),
          date: day(n),
          note: '',
          createdAt: stamp(addDays(today, n), r),
        }
      }).sort((a, b) => a.date.localeCompare(b.date))
      out.stockReceipts.forEach((x, i) => (x.code = 'PN' + String(i + 1).padStart(4, '0')))
    }
  }

  // ======================= SHOWROOM =======================
  if (site.profile === 'showroom') {
    let carSrc = data.cars
    if (!carSrc?.length && T.inventory?.length)
      carSrc = T.inventory.map((c) => ({ ...c, price: c.price * 1e6, condition: c.km < 20000 ? 'Lướt' : 'Đã qua sử dụng', model: c.name }))
    if (!carSrc?.length && T.versions?.length)
      carSrc = T.versions.flatMap((v) => ['Trắng', 'Đen', 'Bạc'].slice(0, r.int(1, 3)).map((color) => ({ name: v.name, brand: 'Mitsubishi', model: 'Xpander', version: v.name, year: 2026, km: 0, price: v.price, color, condition: 'Mới', body: 'MPV', fuel: 'Xăng', gear: /MT/.test(v.name) ? 'Số sàn' : 'Tự động', image: T.hero?.image })))
    if (!carSrc?.length && T.models?.length)
      carSrc = T.models.flatMap((g) => g.items).flatMap((v) => ['Trắng', 'Đỏ', 'Xám'].slice(0, r.int(1, 3)).map((color) => ({ name: v.name, brand: 'VinFast', model: v.name, year: 2026, km: 0, price: v.price, color, condition: 'Mới', body: v.meta?.split(' · ')[0] || 'SUV', fuel: 'Điện', gear: 'Tự động', image: v.image })))
    if (!carSrc?.length)
      // landing VinFast (dựng riêng)
      carSrc = [['VF 3', 299], ['VF 5', 529], ['VF 6', 689], ['VF 7', 799], ['VF 8', 1019], ['VF 9', 1499]].flatMap(([m, p]) =>
        ['Trắng', 'Đỏ', 'Xanh'].slice(0, 2).map((color) => ({ name: `VinFast ${m}`, brand: 'VinFast', model: m, year: 2026, km: 0, price: p * 1e6, color, condition: 'Mới', body: 'SUV', fuel: 'Điện', gear: 'Tự động', image: '' })),
      )
    out.cars = carSrc.map((c, i) => {
      const status = r.weighted([['Đang bán', 72], ['Đã đặt cọc', 14], ['Đã bán', 10], ['Tạm ẩn', 4]])
      return {
        id: id(),
        code: 'XE' + String(i + 1).padStart(3, '0'),
        name: c.name,
        brand: c.brand,
        model: c.model || c.name,
        version: c.version || '',
        year: c.year,
        km: c.km || 0,
        color: c.color || r.pick(['Trắng', 'Đen', 'Bạc', 'Xám', 'Đỏ']),
        body: c.body || '',
        fuel: c.fuel || 'Xăng',
        gear: c.gear || 'Tự động',
        condition: c.condition || 'Đã qua sử dụng',
        price: c.price,
        oldPrice: c.oldPrice || 0,
        cost: c.condition === 'Mới' ? Math.round(c.price * 0.93) : Math.round(c.price * (r.int(86, 92) / 100)),
        branch: c.showroom || r.pick(branchNames),
        image: c.image || (/^VF\s?\d$/i.test(c.model || '') ? `/images/xe/vf${c.model.replace(/\D/g, '')}.jpg` : ''),
        status,
        featured: !!c.featured || r.chance(0.25),
        views: r.int(40, 2600),
        tag: c.tag || '',
        postedAt: c.postedAt || day(-r.int(1, 60)),
      }
    })
    const carNames = out.cars.map((c) => c.name)
    const carPrice = (name) => out.cars.find((c) => c.name === name)?.price || 600e6

    const STAGES = ['Mới', 'Đã liên hệ', 'Hẹn xem xe', 'Đàm phán', 'Đặt cọc', 'Thất bại']
    out.leads = Array.from({ length: 95 }, (_, i) => {
      const n = -r.int(0, 60)
      const c = cust()
      const stage = n > -2 ? r.weighted([['Mới', 60], ['Đã liên hệ', 40]]) : r.weighted([['Đã liên hệ', 22], ['Hẹn xem xe', 18], ['Đàm phán', 16], ['Đặt cọc', 14], ['Thất bại', 22], ['Mới', 8]])
      const car = r.pick(carNames)
      return {
        id: id(),
        code: 'KQ' + String(i + 1).padStart(4, '0'),
        name: c.name,
        phone: c.phone,
        car,
        need: r.weighted([['Trả góp', 50], ['Trả thẳng', 35], ['Đổi xe cũ', 15]]),
        budget: Math.round(carPrice(car) * (r.int(85, 110) / 100) / 1e7) * 1e7,
        source: r.weighted([['Website', 35], ['Facebook Ads', 25], ['Zalo', 15], ['Hotline', 10], ['Đến showroom', 10], ['Google', 5]]),
        status: stage,
        sale: stage === 'Mới' ? '' : r.pick(sales),
        nextFollow: ['Thất bại', 'Đặt cọc'].includes(stage) ? '' : day(r.int(0, 7)),
        note: stage === 'Thất bại' ? r.pick(['Chọn xe hãng khác', 'Chưa đủ tài chính', 'Không liên lạc được', 'Đã mua ở đại lý khác']) : '',
        createdAt: stamp(addDays(today, n), r),
      }
    }).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    out.leads.forEach((x, i) => (x.code = 'KQ' + String(i + 1).padStart(4, '0')))

    out.testDrives = Array.from({ length: 48 }, (_, i) => {
      const n = r.int(-25, 10)
      const c = cust()
      const status = n < 0 ? r.weighted([['Đã lái thử', 72], ['Không đến', 12], ['Đã huỷ', 16]]) : r.weighted([['Chờ xác nhận', 40], ['Đã xác nhận', 60]])
      return {
        id: id(),
        code: '',
        customer: c.name,
        phone: c.phone,
        car: r.pick(carNames),
        kind: site.flags.used ? r.pick(['Xem xe', 'Xem xe', 'Lái thử']) : 'Lái thử',
        branch: r.pick(branchNames),
        date: day(n),
        time: r.pick(SLOTS),
        status,
        sale: r.pick(sales),
        license: r.chance(0.9) ? 'Có GPLX hạng B' : 'Chưa xác nhận',
        note: '',
        createdAt: stamp(addDays(today, Math.min(n, 0) - r.int(0, 4)), r),
      }
    }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    out.testDrives.forEach((x, i) => (x.code = 'LT' + String(i + 1).padStart(4, '0')))

    const soldCars = out.cars.filter((c) => c.status === 'Đã đặt cọc' || c.status === 'Đã bán')
    out.deposits = Array.from({ length: Math.max(soldCars.length, 16) }, (_, i) => {
      const car = soldCars[i] || r.pick(out.cars)
      const n = -r.int(0, 70)
      const c = cust()
      const status = car.status === 'Đã bán' ? 'Đã giao xe' : n < -40 ? r.weighted([['Đã giao xe', 80], ['Huỷ cọc', 20]]) : r.weighted([['Đã đặt cọc', 55], ['Chờ giao xe', 45]])
      const date = day(n)
      if (status === 'Đã giao xe') touch(c, car.price, date)
      return {
        id: id(),
        code: '',
        customer: c.name,
        phone: c.phone,
        car: car.name,
        carCode: car.code,
        price: car.price,
        deposit: r.pick([10, 20, 30, 50]) * 1e6,
        payment: r.weighted([['Trả góp', 55], ['Trả thẳng', 45]]),
        status,
        sale: r.pick(sales),
        delivery: day(n + r.int(7, 30)),
        date,
        createdAt: stamp(addDays(today, n), r),
      }
    }).sort((a, b) => a.date.localeCompare(b.date))
    out.deposits.forEach((x, i) => (x.code = 'HD' + String(i + 1).padStart(4, '0')))

    out.loans = Array.from({ length: 30 }, (_, i) => {
      const car = r.pick(out.cars)
      const n = -r.int(0, 50)
      const c = cust()
      const downPct = r.pick([20, 30, 30, 40, 50])
      const months = r.pick([36, 48, 60, 72, 84])
      const rate = r.pick([7.5, 7.9, 8.5, 8.9, 9.5, 10.5])
      return {
        id: id(),
        code: '',
        customer: c.name,
        phone: c.phone,
        car: car.name,
        carPrice: car.price,
        downPct,
        months,
        rate,
        bank: r.pick(BANKS),
        income: r.pick([18, 25, 30, 40, 60, 80]) * 1e6,
        status: n > -5 ? r.weighted([['Mới nhận', 50], ['Đang thẩm định', 50]]) : r.weighted([['Đã duyệt', 30], ['Đã giải ngân', 40], ['Từ chối', 15], ['Đang thẩm định', 15]]),
        officer: staffBy(/tài chính/)[0] || r.pick(sales),
        createdAt: stamp(addDays(today, n), r),
      }
    }).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    out.loans.forEach((x, i) => (x.code = 'TG' + String(i + 1).padStart(4, '0')))

    if (site.flags.used) {
      out.consignments = Array.from({ length: 32 }, (_, i) => {
        const n = -r.int(0, 45)
        const c = cust()
        const year = r.int(2015, 2023)
        const expect = r.int(28, 95) * 1e7
        const status = n > -3 ? r.weighted([['Mới', 70], ['Đã định giá', 30]]) : r.weighted([['Đã định giá', 20], ['Hẹn kiểm định', 15], ['Đang ký gửi', 25], ['Đã thu mua', 25], ['Từ chối', 15]])
        return {
          id: id(),
          code: '',
          owner: c.name,
          phone: c.phone,
          car: r.pick(CARS),
          year,
          km: r.int(20, 160) * 1000,
          kind: r.weighted([['Định giá thu mua', 50], ['Ký gửi bán', 35], ['Đổi xe', 15]]),
          expect,
          offer: status === 'Mới' ? 0 : Math.round(expect * (r.int(84, 98) / 100) / 1e6) * 1e6,
          status,
          inspector: staffBy(/kiểm định/)[0] || r.pick(sales),
          createdAt: stamp(addDays(today, n), r),
        }
      }).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      out.consignments.forEach((x, i) => (x.code = 'KG' + String(i + 1).padStart(4, '0')))
    }
  }

  // ---------- Thư viện trước / sau ----------
  if (site.flags.gallery) {
    const imgs = (data.products || []).map((p) => p.image).filter(Boolean)
    // chỉ ảnh riêng của mẫu (ảnh dịch vụ minh hoạ tự gán không tính)
    const pool = [T.beforeAfter?.image, T.hero?.image, ...svcSrc.map((s) => s.image), ...imgs].filter(Boolean)
    // mẫu có đủ ảnh riêng thì dùng ảnh của mẫu, còn lại dùng cặp ảnh trước / sau theo hạng mục
    const own = pool.length >= 2
    out.gallery = Array.from({ length: 8 }, (_, i) => ({
      id: id(),
      title: `${own ? r.pick(svcNames) : BA_PAIRS[i % BA_PAIRS.length][0]} – ${r.pick(CARS)}`,
      service: own ? r.pick(svcNames) : svcNames.find((n) => TOPIC_IMG.some(([re]) => re.test(n) && re.test(BA_PAIRS[i % BA_PAIRS.length][0]))) || BA_PAIRS[i % BA_PAIRS.length][0],
      before: own ? pool[i % pool.length] : BA_PAIRS[i % BA_PAIRS.length][1],
      after: own ? pool[(i + 1) % pool.length] : BA_PAIRS[i % BA_PAIRS.length][2],
      visible: r.chance(0.85),
      date: day(-r.int(1, 120)),
    }))
  }

  // ---------- Khuyến mãi ----------
  const vSrc = data.vouchers?.length
    ? data.vouchers.map((v) => ({ code: v.code, title: v.title, type: 'Giảm tiền', value: v.value, min: v.min }))
    : site.profile === 'gara'
      ? [
          { code: 'BAODUONG10', title: 'Giảm 10% công bảo dưỡng', type: 'Giảm %', value: 10, min: 0 },
          { code: 'KHACHMOI', title: 'Khách mới giảm 200.000đ', type: 'Giảm tiền', value: 200000, min: 1000000 },
          { code: 'RUAXE0D', title: 'Tặng rửa xe khi sửa chữa', type: 'Quà tặng', value: 0, min: 1500000 },
          { code: 'SINHNHAT', title: 'Ưu đãi tháng sinh nhật 15%', type: 'Giảm %', value: 15, min: 0 },
        ]
      : site.profile === 'shop'
        ? [
            { code: 'GIAM50K', title: 'Giảm 50.000đ đơn từ 299.000đ', type: 'Giảm tiền', value: 50000, min: 299000 },
            { code: 'FREESHIP', title: 'Miễn phí vận chuyển', type: 'Miễn phí vận chuyển', value: 30000, min: 0 },
            { code: 'THANG10', title: 'Giảm 8% toàn đơn tháng 10', type: 'Giảm %', value: 8, min: 1000000 },
            { code: 'LAPDAT0D', title: 'Miễn phí công lắp đặt', type: 'Quà tặng', value: 0, min: 2000000 },
          ]
        : [
            { code: 'TRUOCBA50', title: 'Hỗ trợ 50% lệ phí trước bạ', type: 'Giảm %', value: 50, min: 0 },
            { code: 'TANGPK10TR', title: 'Tặng gói phụ kiện 10 triệu', type: 'Quà tặng', value: 10000000, min: 0 },
            { code: 'LAISUAT0', title: 'Lãi suất 0% 6 tháng đầu', type: 'Quà tặng', value: 0, min: 0 },
          ]
  out.promotions = vSrc.map((v, i) => {
    const start = day(-r.int(5, 40))
    const end = day(r.int(-3, 45))
    const limit = r.pick([100, 200, 500, 1000])
    return { id: id(), code: v.code, title: v.title, type: v.type, value: v.value, min: v.min || 0, start, end, limit, used: r.int(0, limit / 2), active: i !== 2 || r.chance(0.5), note: v.cond || '' }
  })

  // ---------- Đánh giá ----------
  const REVIEW_TEXT = [
    'Nhân viên tư vấn nhiệt tình, báo giá rõ ràng trước khi làm.',
    'Làm nhanh, đúng hẹn, giá hợp lý. Sẽ quay lại.',
    'Chất lượng tốt nhưng hôm đó hơi đông, phải chờ khoảng 30 phút.',
    'Giao hàng nhanh, đóng gói cẩn thận, lắp đặt gọn gàng.',
    'Showroom rộng, xe sạch, tư vấn không ép mua.',
    'Đặt lịch online tiện, tới là có người tiếp nhận ngay.',
    'Giá tốt hơn chỗ khác, bảo hành rõ ràng.',
  ]
  const target = () => (site.profile === 'showroom' ? r.pick(out.cars).name : site.profile === 'shop' ? r.pick(out.products).name : r.pick(svcNames))
  const revSrc = [...(data.reviews || []), ...(T.testimonials || []).map((t) => ({ name: t.name.split(' – ')[0], content: t.text, rating: 5, target: t.name.split(' – ')[1] || '' }))]
  out.reviews = [
    ...revSrc.map((v) => ({ name: v.name, rating: v.rating || 5, content: v.content, target: v.target || target(), date: v.date || day(-r.int(1, 90)) })),
    ...Array.from({ length: Math.max(0, 22 - revSrc.length) }, () => ({ name: personName(r), rating: r.weighted([[5, 62], [4, 26], [3, 8], [2, 3], [1, 1]]), content: r.pick(REVIEW_TEXT), target: target(), date: day(-r.int(0, 120)) })),
  ].map((v) => ({
    id: id(),
    ...v,
    source: r.weighted([['Website', 50], ['Google', 35], ['Facebook', 15]]),
    status: v.rating <= 3 ? r.pick(['Chờ duyệt', 'Hiển thị']) : r.weighted([['Hiển thị', 80], ['Chờ duyệt', 20]]),
    reply: r.chance(0.4) ? `Cảm ơn anh/chị đã tin tưởng ${site.name}. Hẹn gặp lại anh/chị lần sau!` : '',
  }))
  out.reviews.sort((a, b) => b.date.localeCompare(a.date))

  // ---------- Bài viết ----------
  const postSrc = [...(data.posts || []), ...(T.news || []).map((n) => ({ title: n.title, date: n.date?.includes('/') ? n.date.split('/').reverse().join('-') : n.date, image: n.image, category: 'Tin tức' }))]
  if (!postSrc.length) {
    const imgs = [...(out.services || []).map((s) => s.image), ...(out.products || []).map((p) => p.image), ...(out.cars || []).map((c) => c.image)].filter(Boolean)
    POSTS[site.profile].forEach(([title, category], i) => postSrc.push({ title, category, date: day(-(i * 9 + r.int(1, 6))), image: site.flags.moto ? MOTO[i % MOTO.length] : topicImage(title, i, imgs.length ? imgs : XUONG), excerpt: '' }))
  }
  out.posts = postSrc.map((p, i) => ({
    id: id(),
    title: p.title,
    category: p.category || 'Tin tức',
    status: i === 0 && postSrc.length > 3 ? 'Nháp' : 'Đã đăng',
    author: r.pick(out.staff.filter((s) => /Marketing|Quản trị/.test(s.role))).name,
    date: p.date || day(-r.int(3, 60)),
    views: r.int(80, 4200),
    image: fullImage(p.image) || (site.flags.moto ? MOTO[i % MOTO.length] : topicImage(p.title, i)),
    excerpt: p.excerpt || '',
    content: p.excerpt || '',
    slug: '',
  }))

  // ---------- Hoàn thiện khách hàng ----------
  out.customers.forEach((c) => {
    c.tier = c.spent >= 30e6 || c.visits >= 4 ? 'VIP' : c.visits >= 2 ? 'Thân thiết' : 'Mới'
    if (!c.lastVisit) c.lastVisit = c.createdAt
  })

  // ---------- Nhật ký & cấu hình ----------
  const log = [
    'đã cập nhật bảng giá dịch vụ',
    'đã xác nhận một lịch hẹn mới',
    'đã thêm bài viết mới',
    'đã trả lời một đánh giá',
    'đã đổi ảnh banner trang chủ',
    'đã xuất báo cáo doanh thu tháng',
    'đã thêm khách hàng mới',
    'đã cập nhật giờ mở cửa',
  ]
  out.activity = Array.from({ length: 14 }, (_, i) => ({ id: uid() + i, at: new Date(Date.now() - (i * 3 + r.int(1, 3)) * 3600000).toISOString(), user: r.pick(out.staff).name, text: r.pick(log) }))

  return out
}

export function defaultSettings(site) {
  return {
    name: site.name,
    legalName: `Công ty TNHH ${site.name} (minh hoạ)`,
    taxCode: '0109 000 000',
    hotline: site.hotline,
    email: `lienhe@${site.slug}.demo`,
    address: site.address,
    hours: site.hours,
    website: `${location.origin}${site.siteUrl}`,
    social: { facebook: '', zalo: site.hotline, youtube: '', tiktok: '' },
    payment: { cod: true, bank: true, bankName: 'Vietcombank', bankAccount: '0011 0000 00000', bankHolder: site.name.toUpperCase(), vnpay: false, momo: false, installment: site.profile !== 'gara' },
    shipping: { fee: 30000, freeFrom: 500000, ghn: true, ghtk: true, inner: true },
    booking: { open: '08:00', close: '18:00', slot: 30, perSlot: 3, days: 30, autoConfirm: false },
    notify: { email: true, zalo: true, sms: false, newOrder: true, newBooking: true, newReview: true, lowStock: true, daily: true },
    integrations: { fbPixel: '', ga4: '', zaloOA: '', gmaps: '', chat: 'Zalo' },
    security: { twoFactor: false, sessionHours: 8, ipLock: false },
  }
}

const SECTION_LABELS = {
  services: 'Dịch vụ', pricetable: 'Bảng giá', lookup: 'Tra cứu biển số', booking: 'Đặt lịch', branches: 'Chi nhánh', testimonials: 'Đánh giá khách hàng',
  news: 'Tin tức', products: 'Sản phẩm', beforeafter: 'Ảnh trước / sau', packages: 'Gói dịch vụ', process: 'Quy trình', highlights: 'Điểm nổi bật',
  versions: 'Phiên bản', rolling: 'Giá lăn bánh', specs: 'Thông số', colors: 'Màu xe', equipment: 'Trang bị', installment: 'Trả góp', offers: 'Ưu đãi',
  quote: 'Nhận báo giá', faq: 'Hỏi đáp', commitments: 'Cam kết', inventory: 'Danh sách xe', valuation: 'Định giá xe cũ', perks: 'Ưu đãi', models: 'Dòng xe',
  pledge: 'Cam kết', reasons: 'Lý do chọn', pricelist: 'Bảng giá xe',
}
export function defaultContent(site, seed) {
  const T = site.template
  const sections = T?.sections?.length
    ? T.sections
    : site.profile === 'shop'
      ? ['banner', 'flashsale', 'categories', 'products', 'services', 'reviews', 'news', 'branches']
      : site.profile === 'showroom'
        ? ['banner', 'search', 'inventory', 'installment', 'valuation', 'testimonials', 'news', 'branches']
        : ['banner', 'services', 'gallery', 'pricetable', 'testimonials', 'booking', 'branches']
  const labels = { ...SECTION_LABELS, banner: 'Banner đầu trang', flashsale: 'Flash sale', categories: 'Danh mục', reviews: 'Đánh giá', search: 'Tìm xe nhanh', gallery: 'Thực tế tại xưởng' }
  const imgs = [T?.hero?.image, ...(seed.products || []).map((p) => p.image), ...(seed.cars || []).map((c) => c.image), ...(seed.services || []).map((s) => s.image)].filter(Boolean)
  return {
    notice: site.profile === 'shop' ? 'Miễn phí giao hàng cho đơn từ 500.000đ · Lắp đặt tận nơi' : site.profile === 'showroom' ? 'Ưu đãi tháng này: hỗ trợ lệ phí trước bạ, trả góp đến 80%' : 'Đặt lịch online giảm 10% công thợ',
    hero: {
      title: T?.hero?.title || site.fullName,
      subtitle: T?.hero?.text || `Website chính thức của ${site.name}.`,
      cta: site.profile === 'shop' ? 'Mua ngay' : site.profile === 'showroom' ? 'Xem xe' : 'Đặt lịch ngay',
      link: '#',
      image: imgs[0] || '',
    },
    banners: imgs.slice(0, 4).map((image, i) => ({ id: 'bn' + i, title: ['Ưu đãi tháng này', 'Sản phẩm / dịch vụ nổi bật', 'Khách hàng mới', 'Tin mới'][i], image, link: '#', active: i < 3 })),
    sections: sections.map((s) => ({ id: s, label: labels[s] || s, visible: true })),
    seo: {
      title: `${site.name} – ${site.fullName}`,
      description: T?.tagline || `Thông tin, bảng giá và đặt lịch tại ${site.name}.`,
      keywords: '',
      image: imgs[0] || '',
    },
    popup: { enabled: false, title: 'Nhận ưu đãi 10%', text: 'Để lại số điện thoại, chúng tôi gửi mã giảm giá qua Zalo.', cta: 'Nhận mã' },
  }
}
