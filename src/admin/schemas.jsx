// Định nghĩa các chức năng quản lý dạng bảng: cột, trường nhập, trạng thái, bộ lọc, thao tác nhanh và
// tác động sang bảng khác (vd tạo đơn hàng thì trừ tồn kho, giao xe thì đổi trạng thái xe sang "Đã bán").
// ResourcePage (pages/Resource.jsx) đọc cấu hình này để dựng trang danh sách + biểu mẫu thêm / sửa.
import {
  BadgePercent, Boxes, Building2, CalendarDays, Car, ClipboardList, Contact, FileSignature, Handshake, Images, Landmark, Newspaper, Package,
  PackagePlus, ShoppingBag, Star, Tags, UserCog, Users, Wrench, Zap,
} from 'lucide-react'
import { addDays, fmtDate, fmtDateTime, initials, isoDay, money, moneyShort, nextCode, norm, num } from './lib.js'
import { Badge, Stars } from './ui.jsx'

export const orderTotal = (o) => (o.items || []).reduce((s, it) => s + it.qty * it.price, 0) + (Number(o.ship) || 0) - (Number(o.discount) || 0)
export const repairTotal = (o) => (o.items || []).reduce((s, it) => s + it.qty * it.price, 0) - (Number(o.discount) || 0)
export const receiptTotal = (o) => (o.items || []).reduce((s, it) => s + it.qty * it.price, 0)
// trả góp dư nợ giảm dần đều: kỳ trả đều (annuity) để khách dễ hình dung
export function monthlyPay(price, downPct, months, rate) {
  const loan = price * (1 - downPct / 100)
  const i = rate / 100 / 12
  return i ? Math.round((loan * i) / (1 - Math.pow(1 + i, -months))) : Math.round(loan / months)
}
export function promoStatus(p, today = isoDay()) {
  if (!p.active) return 'Tạm dừng'
  if (p.end && p.end < today) return 'Hết hạn'
  if (p.start && p.start > today) return 'Sắp diễn ra'
  if (p.limit && p.used >= p.limit) return 'Hết lượt'
  return 'Đang chạy'
}

const SLOTS = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
const opt = (col, key = 'name') => (ctx) => ctx.read(col).map((r) => r[key])
const who = (r) => (
  <div className="adm-cell2">
    <b>{r.customer || r.name || r.owner}</b>
    <span>{r.phone}</span>
  </div>
)
const thumb = (src, alt = '') => (src ? <img className="adm-thumb" src={src} alt={alt} loading="lazy" /> : <span className="adm-thumb adm-thumb--empty" />)
const datePreset = {
  key: '_when',
  label: 'Thời gian',
  options: ['Hôm nay', 'Ngày mai', '7 ngày tới', '7 ngày qua', '30 ngày qua'],
  test: (r, v, field = 'date') => {
    const d = (r[field] || r.createdAt || '').slice(0, 10)
    const t = isoDay()
    if (v === 'Hôm nay') return d === t
    if (v === 'Ngày mai') return d === isoDay(addDays(new Date(), 1))
    if (v === '7 ngày tới') return d >= t && d <= isoDay(addDays(new Date(), 7))
    if (v === '7 ngày qua') return d <= t && d >= isoDay(addDays(new Date(), -7))
    if (v === '30 ngày qua') return d <= t && d >= isoDay(addDays(new Date(), -30))
    return true
  },
}
const createdPreset = { ...datePreset, options: ['Hôm nay', '7 ngày qua', '30 ngày qua'], test: (r, v) => datePreset.test(r, v, 'createdAt') }

// đổi tồn kho theo tên sản phẩm
function adjustStock(ctx, items, sign, col = 'products') {
  const rows = ctx.read(col)
  let changed = false
  const next = rows.map((p) => {
    const used = items.filter((it) => it.name === p.name).reduce((s, it) => s + Number(it.qty || 0), 0)
    if (!used) return p
    changed = true
    const stock = Math.max(0, (Number(p.stock) || 0) + sign * used)
    return { ...p, stock, sold: sign < 0 ? (p.sold || 0) + used : p.sold, status: p.status === 'Ẩn' ? 'Ẩn' : stock === 0 ? 'Hết hàng' : 'Đang bán' }
  })
  if (changed) ctx.store.write(col, next)
}

const BOOKING_STATUSES = ['Chờ xác nhận', 'Đã xác nhận', 'Đang thực hiện', 'Hoàn thành', 'Không đến', 'Đã huỷ']
const bookingActions = (extra = []) => [
  { label: 'Xác nhận', when: (r) => r.status === 'Chờ xác nhận', patch: { status: 'Đã xác nhận' } },
  { label: 'Bắt đầu làm', when: (r) => r.status === 'Đã xác nhận', patch: { status: 'Đang thực hiện' } },
  { label: 'Hoàn thành', when: (r) => r.status === 'Đang thực hiện', patch: { status: 'Hoàn thành' } },
  ...extra,
]

export function getSchema(id, ctx) {
  const { site } = ctx
  const isGara = site.profile === 'gara'
  const S = SCHEMAS[id]
  return S ? { id, ...S(ctx, { isGara }) } : null
}

const SCHEMAS = {
  // ============ KHÁCH HÀNG ============
  customers: (ctx, { isGara }) => ({
    label: 'Khách hàng',
    single: 'khách hàng',
    icon: Users,
    collection: 'customers',
    codePrefix: 'KH',
    statusField: 'tier',
    statuses: ['Mới', 'Thân thiết', 'VIP'],
    search: ['code', 'name', 'phone', 'email', 'plate', 'car'],
    filters: [
      { key: 'source', label: 'Nguồn', options: ['Website', 'Zalo', 'Hotline', 'Facebook', 'Vãng lai'] },
      { key: 'city', label: 'Khu vực', options: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'] },
    ],
    defaultSort: { key: 'lastVisit', dir: -1 },
    columns: [
      { key: 'code', label: 'Mã' },
      { key: 'name', label: 'Khách hàng', render: (r) => <div className="adm-cell2"><b>{r.name}</b><span>{r.phone}</span></div>, main: true },
      { key: 'car', label: isGara ? 'Xe / biển số' : 'Xe', render: (r) => <div className="adm-cell2"><span>{r.car}</span>{isGara && <span className="adm-plate">{r.plate}</span>}</div> },
      { key: 'source', label: 'Nguồn' },
      { key: 'visits', label: 'Lượt', align: 'num', sort: true },
      { key: 'spent', label: 'Đã chi tiêu', align: 'num', sort: true, render: (r) => money(r.spent || 0), csv: (r) => r.spent },
      { key: 'lastVisit', label: 'Lần gần nhất', sort: true, render: (r) => fmtDate(r.lastVisit) },
      { key: 'tier', label: 'Hạng', render: (r) => <Badge tone={r.tier === 'VIP' ? 'info' : r.tier === 'Thân thiết' ? 'ok' : 'warn'}>{r.tier}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'phone', label: 'Số điện thoại', type: 'phone', required: true, check: (v, all) => (ctx.read('customers').some((c) => c.phone.replace(/\s/g, '') === String(v).replace(/\s/g, '') && c.id !== all.id) ? 'Số này đã có trong danh sách' : '') },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'city', label: 'Khu vực', type: 'select', options: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'] },
      { key: 'car', label: 'Xe đang dùng', suggest: ['Toyota Vios', 'Honda CR-V', 'Mazda CX-5', 'Hyundai Accent', 'Kia Seltos', 'Ford Ranger', 'VinFast VF 8'] },
      { key: 'plate', label: 'Biển số', placeholder: '30A-123.45', hidden: () => !isGara },
      { key: 'source', label: 'Nguồn khách', type: 'select', options: ['Website', 'Zalo', 'Hotline', 'Facebook', 'Vãng lai'] },
      { key: 'tier', label: 'Hạng khách', type: 'select', options: ['Mới', 'Thân thiết', 'VIP'], required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ tier: 'Mới', source: 'Website', city: 'Hà Nội', spent: 0, visits: 0, lastVisit: isoDay() }),
    detail: 'customer',
  }),

  reviews: () => ({
    label: 'Đánh giá',
    single: 'đánh giá',
    icon: Star,
    collection: 'reviews',
    statuses: ['Chờ duyệt', 'Hiển thị', 'Ẩn'],
    search: ['name', 'content', 'target'],
    filters: [
      { key: 'rating', label: 'Số sao', options: ['5', '4', '3', '2', '1'], test: (r, v) => String(r.rating) === v },
      { key: 'source', label: 'Nguồn', options: ['Website', 'Google', 'Facebook'] },
    ],
    defaultSort: { key: 'date', dir: -1 },
    columns: [
      { key: 'name', label: 'Khách', render: (r) => <div className="adm-cell2"><b>{r.name}</b><span>{r.source} · {fmtDate(r.date)}</span></div>, main: true },
      { key: 'rating', label: 'Đánh giá', sort: true, render: (r) => <Stars value={r.rating} /> },
      { key: 'content', label: 'Nội dung', render: (r) => <div className="adm-clamp">{r.content}{r.reply && <em className="adm-reply">↳ Đã trả lời</em>}</div> },
      { key: 'target', label: 'Về', render: (r) => <span className="adm-clamp1">{r.target}</span> },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Tên khách', required: true },
      { key: 'rating', label: 'Số sao', type: 'rating', required: true },
      { key: 'content', label: 'Nội dung', type: 'textarea', required: true, wide: true },
      { key: 'target', label: 'Sản phẩm / dịch vụ' },
      { key: 'source', label: 'Nguồn', type: 'select', options: ['Website', 'Google', 'Facebook'] },
      { key: 'date', label: 'Ngày', type: 'date' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Chờ duyệt', 'Hiển thị', 'Ẩn'], required: true },
      { key: 'reply', label: 'Phản hồi của cửa hàng', type: 'textarea', wide: true, help: 'Hiển thị ngay dưới đánh giá trên website' },
    ],
    defaults: () => ({ rating: 5, status: 'Chờ duyệt', source: 'Website', date: isoDay() }),
    actions: [
      { label: 'Duyệt', when: (r) => r.status !== 'Hiển thị', patch: { status: 'Hiển thị' } },
      { label: 'Ẩn', when: (r) => r.status === 'Hiển thị', patch: { status: 'Ẩn' } },
    ],
    summary: (rows) => {
      const avg = rows.reduce((s, r) => s + r.rating, 0) / (rows.length || 1)
      return [
        { label: 'Điểm trung bình', value: avg.toFixed(1) + ' / 5' },
        { label: 'Tổng đánh giá', value: num(rows.length) },
        { label: 'Chờ duyệt', value: num(rows.filter((r) => r.status === 'Chờ duyệt').length) },
        { label: 'Chưa trả lời', value: num(rows.filter((r) => !r.reply).length) },
      ]
    },
  }),

  posts: () => ({
    label: 'Bài viết',
    single: 'bài viết',
    icon: Newspaper,
    collection: 'posts',
    statuses: ['Đã đăng', 'Nháp', 'Hẹn giờ'],
    search: ['title', 'category', 'author'],
    filters: [{ key: 'category', label: 'Chuyên mục', dynamic: true }],
    defaultSort: { key: 'date', dir: -1 },
    columns: [
      { key: 'title', label: 'Bài viết', main: true, render: (r) => <div className="adm-media">{thumb(r.image)}<div className="adm-cell2"><b className="adm-clamp1">{r.title}</b><span>{r.category} · {r.author}</span></div></div> },
      { key: 'date', label: 'Ngày đăng', sort: true, render: (r) => fmtDate(r.date) },
      { key: 'views', label: 'Lượt xem', align: 'num', sort: true, render: (r) => num(r.views) },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'title', label: 'Tiêu đề', required: true, wide: true },
      { key: 'category', label: 'Chuyên mục', suggest: (c) => [...new Set(c.read('posts').map((p) => p.category))] },
      { key: 'author', label: 'Tác giả', type: 'select', options: opt('staff') },
      { key: 'image', label: 'Ảnh đại diện', type: 'image', wide: true },
      { key: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', rows: 2, wide: true, help: 'Dùng cho thẻ bài viết và chia sẻ Facebook / Zalo' },
      { key: 'content', label: 'Nội dung', type: 'textarea', rows: 10, wide: true },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Nháp', 'Đã đăng', 'Hẹn giờ'], required: true },
      { key: 'date', label: 'Ngày đăng', type: 'date' },
    ],
    defaults: () => ({ status: 'Nháp', date: isoDay(), views: 0, author: 'Quản trị viên' }),
    actions: [{ label: 'Đăng ngay', when: (r) => r.status !== 'Đã đăng', patch: () => ({ status: 'Đã đăng', date: isoDay() }) }],
  }),

  promotions: (ctx) => ({
    label: ctx.site.profile === 'shop' ? 'Mã giảm giá' : 'Khuyến mãi',
    single: 'chương trình',
    icon: BadgePercent,
    collection: 'promotions',
    statusOf: (r) => promoStatus(r),
    statuses: ['Đang chạy', 'Sắp diễn ra', 'Hết lượt', 'Hết hạn', 'Tạm dừng'],
    search: ['code', 'title'],
    columns: [
      { key: 'code', label: 'Mã', main: true, render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{r.title}</span></div> },
      { key: 'value', label: 'Ưu đãi', render: (r) => (r.type === 'Giảm %' ? `−${r.value}%` : r.type === 'Quà tặng' ? 'Quà tặng' : `−${money(r.value)}`) },
      { key: 'min', label: 'Đơn tối thiểu', align: 'num', render: (r) => (r.min ? money(r.min) : '—') },
      { key: 'start', label: 'Thời gian', render: (r) => `${fmtDate(r.start)} – ${fmtDate(r.end)}` },
      { key: 'used', label: 'Đã dùng', render: (r) => <div className="adm-progress" title={`${r.used}/${r.limit}`}><i style={{ width: `${Math.min(100, (r.used / (r.limit || 1)) * 100)}%` }} /><span>{r.used}/{r.limit || '∞'}</span></div> },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{promoStatus(r)}</Badge>, csv: (r) => promoStatus(r) },
    ],
    fields: [
      { key: 'code', label: 'Mã', required: true, check: (v, all) => (/^[A-Z0-9]{3,20}$/.test(v) ? (ctx.read('promotions').some((p) => p.code === v && p.id !== all.id) ? 'Mã đã tồn tại' : '') : 'Chữ in hoa / số, 3–20 ký tự'), help: 'VD: THANG10' },
      { key: 'title', label: 'Tên chương trình', required: true },
      { key: 'type', label: 'Loại', type: 'select', options: ['Giảm %', 'Giảm tiền', 'Miễn phí vận chuyển', 'Quà tặng'], required: true },
      { key: 'value', label: 'Giá trị', type: 'number', help: 'Giảm % nhập 10 = 10%; giảm tiền nhập số đồng' },
      { key: 'min', label: 'Áp dụng cho đơn từ', type: 'money' },
      { key: 'limit', label: 'Số lượt tối đa', type: 'number' },
      { key: 'start', label: 'Bắt đầu', type: 'date', required: true },
      { key: 'end', label: 'Kết thúc', type: 'date', required: true, check: (v, all) => (all.start && v < all.start ? 'Phải sau ngày bắt đầu' : '') },
      { key: 'active', label: 'Đang bật', type: 'boolean' },
      { key: 'note', label: 'Điều kiện / ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ type: 'Giảm %', value: 10, min: 0, limit: 100, used: 0, active: true, start: isoDay(), end: isoDay(addDays(new Date(), 30)) }),
    beforeSave: (v) => ({ ...v, code: String(v.code || '').toUpperCase().trim() }),
    actions: [
      { label: 'Tạm dừng', when: (r) => r.active, patch: { active: false } },
      { label: 'Bật lại', when: (r) => !r.active, patch: { active: true } },
    ],
  }),

  // ============ HỆ THỐNG ============
  branches: (ctx) => ({
    label: ctx.site.profile === 'showroom' ? 'Showroom' : 'Chi nhánh',
    single: ctx.site.profile === 'showroom' ? 'showroom' : 'chi nhánh',
    icon: Building2,
    collection: 'branches',
    statuses: ['Đang hoạt động', 'Tạm đóng'],
    search: ['name', 'address', 'phone', 'manager'],
    columns: [
      { key: 'name', label: 'Tên', main: true, render: (r) => <div className="adm-cell2"><b>{r.name} {r.main && <Badge tone="info">Chính</Badge>}</b><span>{r.address}</span></div> },
      { key: 'phone', label: 'Điện thoại' },
      { key: 'hours', label: 'Giờ mở cửa' },
      { key: 'manager', label: 'Phụ trách' },
      { key: 'capacity', label: 'Quy mô' },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Tên', required: true },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'address', label: 'Địa chỉ', required: true, wide: true },
      { key: 'hours', label: 'Giờ mở cửa' },
      { key: 'manager', label: 'Người phụ trách', type: 'select', options: opt('staff') },
      { key: 'capacity', label: 'Quy mô', placeholder: 'VD: 6 khoang, 2 cầu nâng' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Đang hoạt động', 'Tạm đóng'], required: true },
      { key: 'main', label: 'Cơ sở chính', type: 'boolean' },
    ],
    defaults: () => ({ status: 'Đang hoạt động', hours: '8:00 – 18:00' }),
  }),

  staff: (ctx) => ({
    label: 'Nhân viên',
    rowQuick: false, // thao tác nằm trong ngăn chi tiết, bảng gọn hơn
    single: 'nhân viên',
    icon: UserCog,
    collection: 'staff',
    statuses: ['Đang làm việc', 'Tạm nghỉ'],
    search: ['name', 'email', 'phone', 'role'],
    filters: [{ key: 'role', label: 'Vai trò', options: (c) => c.read('roles').roles }, { key: 'branch', label: 'Chi nhánh', options: (c) => ['Tất cả', ...c.read('branches').map((b) => b.name)] }],
    columns: [
      { key: 'name', label: 'Nhân viên', main: true, render: (r) => <div className="adm-media"><span className="adm-avatar">{initials(r.name, 1)}</span><div className="adm-cell2"><b>{r.name}</b><span>{r.email}</span></div></div> },
      { key: 'role', label: 'Vai trò', render: (r) => <Badge tone={/Quản trị|Giám đốc|Quản lý/.test(r.role) ? 'info' : 'muted'}>{r.role}</Badge> },
      { key: 'phone', label: 'Điện thoại' },
      { key: 'branch', label: 'Nơi làm việc' },
      { key: 'lastLogin', label: 'Đăng nhập gần nhất', sort: true, render: (r) => fmtDateTime(r.lastLogin) },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'role', label: 'Vai trò', type: 'select', options: (c) => c.read('roles').roles, required: true },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'email', label: 'Email đăng nhập', type: 'email', required: true, check: (v, all) => (ctx.read('staff').some((s) => s.email === v && s.id !== all.id) ? 'Email đã được dùng' : '') },
      { key: 'branch', label: 'Nơi làm việc', type: 'select', options: (c) => ['Tất cả', ...c.read('branches').map((b) => b.name)] },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Đang làm việc', 'Tạm nghỉ'], required: true },
    ],
    defaults: () => ({ status: 'Đang làm việc', branch: 'Tất cả' }),
    actions: [{ label: 'Gửi lại mật khẩu', toast: (r) => `Đã gửi liên kết đặt mật khẩu tới ${r.email} (bản demo)` }],
  }),

  // ============ GARA ============
  services: (ctx) => ({
    label: ctx.site.profile === 'gara' ? 'Dịch vụ & bảng giá' : 'Dịch vụ thi công',
    single: 'dịch vụ',
    icon: ClipboardList,
    collection: 'services',
    codePrefix: 'DV',
    search: ['code', 'name', 'group'],
    filters: [{ key: 'group', label: 'Nhóm', dynamic: true }, { key: 'visible', label: 'Hiển thị', options: ['Đang hiện', 'Đang ẩn'], test: (r, v) => (v === 'Đang hiện' ? r.visible : !r.visible) }],
    columns: [
      { key: 'code', label: 'Mã' },
      { key: 'name', label: 'Dịch vụ', main: true, render: (r) => <div className="adm-media">{r.image ? thumb(r.image) : null}<div className="adm-cell2"><b>{r.name}</b><span>{r.group}</span></div></div> },
      { key: 'price', label: 'Giá', align: 'num', sort: true, render: (r) => (r.priceText && !r.price ? r.priceText : r.price ? money(r.price) : 'Báo giá sau') },
      { key: 'duration', label: 'Thời gian' },
      { key: 'warranty', label: 'Bảo hành' },
      { key: 'visible', label: 'Website', toggle: 'visible' },
    ],
    fields: [
      { key: 'name', label: 'Tên dịch vụ', required: true, wide: true },
      { key: 'group', label: 'Nhóm', suggest: (c) => [...new Set(c.read('services').map((s) => s.group))] },
      { key: 'price', label: 'Giá từ', type: 'money', help: 'Để 0 nếu báo giá sau kiểm tra' },
      { key: 'priceText', label: 'Ghi chú giá', placeholder: 'VD: Sedan 3.500.000đ · SUV 4.200.000đ' },
      { key: 'duration', label: 'Thời gian làm' },
      { key: 'warranty', label: 'Bảo hành' },
      { key: 'image', label: 'Ảnh', type: 'image', wide: true },
      { key: 'desc', label: 'Mô tả', type: 'textarea', wide: true },
      { key: 'visible', label: 'Hiện trên website', type: 'boolean' },
    ],
    defaults: () => ({ visible: true, price: 0 }),
  }),

  bookings: (ctx) => ({
    label: 'Lịch hẹn',
    single: 'lịch hẹn',
    icon: CalendarDays,
    collection: 'bookings',
    codePrefix: 'LH',
    statuses: BOOKING_STATUSES,
    search: ['code', 'customer', 'phone', 'plate', 'car', 'service'],
    filters: [datePreset, { key: 'branch', label: 'Chi nhánh', options: opt('branches') }, { key: 'source', label: 'Nguồn', options: ['Website', 'Zalo', 'Hotline', 'Facebook', 'Vãng lai'] }],
    defaultSort: { key: 'date', dir: -1, by: (r) => r.date + r.time },
    views: ['table', 'calendar'],
    calendar: { date: 'date', time: 'time', title: (r) => `${r.customer} · ${r.plate || r.car}`, sub: (r) => r.service },
    columns: [
      { key: 'code', label: 'Mã' },
      { key: 'date', label: 'Ngày giờ', sort: (r) => r.date + r.time, render: (r) => <div className="adm-cell2"><b>{r.time}</b><span>{fmtDate(r.date)}</span></div> },
      { key: 'customer', label: 'Khách hàng', main: true, render: who },
      { key: 'plate', label: 'Xe', render: (r) => <div className="adm-cell2"><span className="adm-plate">{r.plate}</span><span>{r.car}</span></div> },
      { key: 'service', label: 'Dịch vụ', render: (r) => <span className="adm-clamp1">{r.service}</span> },
      { key: 'branch', label: 'Chi nhánh', hideSm: true },
      { key: 'tech', label: 'KTV', render: (r) => r.tech || <span className="adm-muted">Chưa phân</span> },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('customers') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe', suggest: ['Toyota Vios', 'Honda City', 'Mazda 3', 'Hyundai Accent', 'Kia Seltos', 'Ford Ranger'] },
      { key: 'plate', label: 'Biển số', placeholder: '30A-123.45' },
      { key: 'service', label: 'Dịch vụ', type: 'select', options: opt('services'), required: true },
      { key: 'branch', label: 'Chi nhánh', type: 'select', options: opt('branches'), required: true },
      { key: 'date', label: 'Ngày', type: 'date', required: true },
      { key: 'time', label: 'Giờ', type: 'select', options: SLOTS, required: true },
      { key: 'tech', label: 'Kỹ thuật viên', type: 'select', options: (c) => c.read('staff').filter((s) => /Kỹ thuật|Cố vấn/.test(s.role)).map((s) => s.name) },
      { key: 'source', label: 'Nguồn', type: 'select', options: ['Website', 'Zalo', 'Hotline', 'Facebook', 'Vãng lai'] },
      { key: 'status', label: 'Trạng thái', type: 'select', options: BOOKING_STATUSES, required: true },
      { key: 'note', label: 'Ghi chú của khách', type: 'textarea', wide: true },
    ],
    defaults: (c) => ({ status: 'Chờ xác nhận', date: isoDay(), time: '09:00', source: 'Hotline', branch: c.read('branches')[0]?.name }),
    actions: bookingActions([
      {
        label: 'Tạo phiếu sửa chữa',
        when: (r) => ['Đã xác nhận', 'Đang thực hiện'].includes(r.status),
        run: (r, c) => {
          const rows = c.read('repairOrders')
          const svc = c.read('services').find((s) => s.name === r.service)
          const row = c.store.add('repairOrders', {
            code: nextCode(rows, 'PSC'), customer: r.customer, phone: r.phone, plate: r.plate, car: r.car, km: 0, branch: r.branch, tech: r.tech, advisor: '',
            items: svc ? [{ name: svc.name, kind: 'Công', qty: 1, price: svc.price }] : [], discount: 0, paid: 0, status: 'Báo giá', date: isoDay(), note: `Từ lịch hẹn ${r.code}`,
          }, `phiếu sửa chữa từ lịch hẹn ${r.code}`)
          c.store.update('bookings', r.id, { status: 'Đang thực hiện' })
          return { go: `repairOrders?open=${row.id}`, toast: `Đã tạo phiếu ${row.code}` }
        },
      },
      { label: 'Nhắc lịch qua Zalo', when: (r) => ['Chờ xác nhận', 'Đã xác nhận'].includes(r.status), toast: (r) => `Đã gửi tin nhắc lịch cho ${r.customer} (bản demo)` },
    ]),
  }),

  repairOrders: () => ({
    label: 'Phiếu sửa chữa',
    single: 'phiếu sửa chữa',
    icon: Wrench,
    collection: 'repairOrders',
    codePrefix: 'PSC',
    statuses: ['Báo giá', 'Đã duyệt', 'Đang sửa', 'Chờ phụ tùng', 'Hoàn thành', 'Đã giao xe', 'Đã huỷ'],
    search: ['code', 'customer', 'phone', 'plate', 'car'],
    filters: [createdPreset, { key: 'branch', label: 'Chi nhánh', options: opt('branches') }, { key: 'debt', label: 'Công nợ', options: ['Còn nợ', 'Đã thu đủ'], test: (r, v) => (v === 'Còn nợ' ? repairTotal(r) - (r.paid || 0) > 0 && r.status !== 'Đã huỷ' : repairTotal(r) - (r.paid || 0) <= 0) }],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Số phiếu', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.date)}</span></div> },
      { key: 'customer', label: 'Khách hàng', main: true, render: who },
      { key: 'plate', label: 'Xe', render: (r) => <div className="adm-cell2"><span className="adm-plate">{r.plate}</span><span>{r.car} · {num(r.km)} km</span></div> },
      { key: 'tech', label: 'KTV', hideSm: true },
      { key: 'total', label: 'Tổng tiền', align: 'num', sort: (r) => repairTotal(r), render: (r) => money(repairTotal(r)), csv: (r) => repairTotal(r) },
      { key: 'paid', label: 'Thanh toán', render: (r) => { const due = repairTotal(r) - (r.paid || 0); return r.status === 'Đã huỷ' ? '—' : due <= 0 ? <Badge tone="ok">Đã thu đủ</Badge> : <Badge tone="warn">Còn {moneyShort(due)}</Badge> }, csv: (r) => r.paid },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('customers') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'plate', label: 'Biển số', required: true, suggest: opt('vehicles', 'plate') },
      { key: 'car', label: 'Xe' },
      { key: 'km', label: 'Số km (ODO)', type: 'number', suffix: 'km' },
      { key: 'branch', label: 'Chi nhánh', type: 'select', options: opt('branches'), required: true },
      { key: 'advisor', label: 'Cố vấn dịch vụ', type: 'select', options: (c) => c.read('staff').filter((s) => /Cố vấn|Quản lý/.test(s.role)).map((s) => s.name) },
      { key: 'tech', label: 'Kỹ thuật viên', type: 'select', options: (c) => c.read('staff').filter((s) => /Kỹ thuật/.test(s.role)).map((s) => s.name) },
      { key: 'items', label: 'Hạng mục công việc & phụ tùng', type: 'items', wide: true, kinds: ['Công', 'Phụ tùng'], catalog: (c) => [...c.read('services').filter((s) => s.price).map((s) => ({ name: s.name, price: s.price, kind: 'Công' })), ...c.read('parts').map((p) => ({ name: p.name, price: p.price, kind: 'Phụ tùng', sku: p.sku }))], required: true },
      { key: 'discount', label: 'Giảm giá', type: 'money' },
      { key: 'paid', label: 'Đã thanh toán', type: 'money' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Báo giá', 'Đã duyệt', 'Đang sửa', 'Chờ phụ tùng', 'Hoàn thành', 'Đã giao xe', 'Đã huỷ'], required: true },
      { key: 'date', label: 'Ngày nhận xe', type: 'date' },
      { key: 'note', label: 'Ghi chú / tình trạng xe khi nhận', type: 'textarea', wide: true },
    ],
    defaults: (c) => ({ status: 'Báo giá', date: isoDay(), items: [], discount: 0, paid: 0, km: 0, branch: c.read('branches')[0]?.name }),
    afterSave: (row, prev, c) => {
      // xuất phụ tùng khỏi kho khi bắt đầu sửa (một lần)
      if (!row.stockOut && ['Đang sửa', 'Hoàn thành', 'Đã giao xe'].includes(row.status)) {
        adjustStock(c, row.items.filter((i) => i.kind === 'Phụ tùng'), -1, 'parts')
        c.store.update('repairOrders', row.id, { stockOut: true })
      }
    },
    actions: [
      { label: 'Gửi báo giá Zalo', when: (r) => r.status === 'Báo giá', toast: (r) => `Đã gửi báo giá ${r.code} (${money(repairTotal(r))}) cho ${r.customer} (bản demo)` },
      { label: 'Khách duyệt', when: (r) => r.status === 'Báo giá', patch: { status: 'Đã duyệt' } },
      { label: 'Bắt đầu sửa', when: (r) => r.status === 'Đã duyệt' || r.status === 'Chờ phụ tùng', patch: { status: 'Đang sửa' } },
      { label: 'Sửa xong', when: (r) => r.status === 'Đang sửa', patch: { status: 'Hoàn thành' } },
      { label: 'Thu tiền & giao xe', when: (r) => r.status === 'Hoàn thành', patch: (r) => ({ status: 'Đã giao xe', paid: repairTotal(r) }) },
    ],
    detail: 'invoice',
    summary: (rows) => {
      const live = rows.filter((r) => r.status !== 'Đã huỷ')
      return [
        { label: 'Đang trong xưởng', value: num(rows.filter((r) => ['Đã duyệt', 'Đang sửa', 'Chờ phụ tùng'].includes(r.status)).length) + ' xe' },
        { label: 'Chờ khách duyệt', value: num(rows.filter((r) => r.status === 'Báo giá').length) },
        { label: 'Doanh thu', value: moneyShort(live.reduce((s, r) => s + repairTotal(r), 0)) },
        { label: 'Công nợ', value: moneyShort(live.reduce((s, r) => s + Math.max(0, repairTotal(r) - (r.paid || 0)), 0)) },
      ]
    },
  }),

  vehicles: () => ({
    label: 'Hồ sơ xe',
    single: 'hồ sơ xe',
    icon: Car,
    collection: 'vehicles',
    search: ['plate', 'car', 'owner', 'phone', 'vin'],
    filters: [{ key: 'due', label: 'Bảo dưỡng', options: ['Đến hạn trong 14 ngày', 'Quá hạn'], test: (r, v) => (v === 'Quá hạn' ? r.nextService < isoDay() : r.nextService >= isoDay() && r.nextService <= isoDay(addDays(new Date(), 14))) }],
    defaultSort: { key: 'lastService', dir: -1 },
    columns: [
      { key: 'plate', label: 'Biển số', main: true, render: (r) => <div className="adm-cell2"><span className="adm-plate">{r.plate}</span><span>{r.car} · {r.year}</span></div> },
      { key: 'owner', label: 'Chủ xe', render: (r) => <div className="adm-cell2"><b>{r.owner}</b><span>{r.phone}</span></div> },
      { key: 'km', label: 'ODO', align: 'num', sort: true, render: (r) => num(r.km) + ' km' },
      { key: 'visits', label: 'Lượt vào xưởng', align: 'num', sort: true },
      { key: 'lastService', label: 'Lần gần nhất', sort: true, render: (r) => fmtDate(r.lastService) },
      { key: 'nextService', label: 'Hẹn bảo dưỡng', sort: true, render: (r) => <Badge tone={r.nextService < isoDay() ? 'danger' : r.nextService <= isoDay(addDays(new Date(), 14)) ? 'warn' : 'muted'}>{fmtDate(r.nextService)}</Badge> },
    ],
    fields: [
      { key: 'plate', label: 'Biển số', required: true },
      { key: 'car', label: 'Dòng xe', required: true },
      { key: 'year', label: 'Năm sản xuất', type: 'number', min: 1990 },
      { key: 'color', label: 'Màu' },
      { key: 'vin', label: 'Số khung (VIN)' },
      { key: 'owner', label: 'Chủ xe', required: true, suggest: opt('customers') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'km', label: 'ODO hiện tại', type: 'number', suffix: 'km' },
      { key: 'insurance', label: 'Bảo hiểm thân vỏ' },
      { key: 'nextService', label: 'Hẹn bảo dưỡng tiếp', type: 'date' },
    ],
    defaults: () => ({ visits: 0, km: 0, year: 2022, lastService: isoDay(), nextService: isoDay(addDays(new Date(), 180)) }),
    actions: [{ label: 'Nhắc bảo dưỡng', toast: (r) => `Đã gửi nhắc bảo dưỡng cho chủ xe ${r.plate} (bản demo)` }],
    detail: 'vehicle',
  }),

  parts: () => ({
    label: 'Phụ tùng & vật tư',
    single: 'phụ tùng',
    icon: Boxes,
    collection: 'parts',
    statusOf: (r) => (r.stock <= 0 ? 'Hết hàng' : r.stock <= r.min ? 'Sắp hết' : 'Còn hàng'),
    statuses: ['Còn hàng', 'Sắp hết', 'Hết hàng'],
    search: ['sku', 'name', 'supplier'],
    columns: [
      { key: 'sku', label: 'Mã' },
      { key: 'name', label: 'Phụ tùng', main: true, render: (r) => <div className="adm-cell2"><b>{r.name}</b><span>{r.supplier}</span></div> },
      { key: 'stock', label: 'Tồn', align: 'num', sort: true, render: (r) => <Badge tone={r.stock <= 0 ? 'danger' : r.stock <= r.min ? 'warn' : 'ok'}>{r.stock} {r.unit}</Badge> },
      { key: 'cost', label: 'Giá nhập', align: 'num', render: (r) => money(r.cost) },
      { key: 'price', label: 'Giá bán', align: 'num', sort: true, render: (r) => money(r.price) },
      { key: 'value', label: 'Giá trị tồn', align: 'num', sort: (r) => r.stock * r.cost, render: (r) => money(r.stock * r.cost) },
    ],
    fields: [
      { key: 'name', label: 'Tên phụ tùng', required: true, wide: true },
      { key: 'sku', label: 'Mã', required: true },
      { key: 'unit', label: 'Đơn vị', suggest: ['Cái', 'Bộ', 'Can', 'Chai', 'Lít', 'Bình'] },
      { key: 'stock', label: 'Tồn kho', type: 'number' },
      { key: 'min', label: 'Cảnh báo khi còn', type: 'number' },
      { key: 'cost', label: 'Giá nhập', type: 'money' },
      { key: 'price', label: 'Giá bán', type: 'money' },
      { key: 'supplier', label: 'Nhà cung cấp' },
    ],
    defaults: (c) => ({ unit: 'Cái', stock: 0, min: 5, sku: nextCode(c.read('parts'), 'PT') }),
    actions: [{ label: 'Nhập thêm', ask: { label: 'Số lượng nhập thêm', type: 'number', value: 10 }, patch: (r, n) => ({ stock: (r.stock || 0) + Math.max(0, Number(n) || 0) }) }],
  }),

  gallery: () => ({
    label: 'Ảnh trước / sau',
    single: 'công trình',
    icon: Images,
    collection: 'gallery',
    search: ['title', 'service'],
    columns: [
      { key: 'before', label: 'Trước / sau', render: (r) => <div className="adm-ba">{thumb(r.before)}{thumb(r.after)}</div> },
      { key: 'title', label: 'Công trình', main: true, render: (r) => <div className="adm-cell2"><b>{r.title}</b><span>{r.service}</span></div> },
      { key: 'date', label: 'Ngày', sort: true, render: (r) => fmtDate(r.date) },
      { key: 'visible', label: 'Website', toggle: 'visible' },
    ],
    fields: [
      { key: 'title', label: 'Tiêu đề', required: true, wide: true },
      { key: 'service', label: 'Dịch vụ', type: 'select', options: opt('services') },
      { key: 'date', label: 'Ngày hoàn thành', type: 'date' },
      { key: 'before', label: 'Ảnh trước', type: 'image', wide: true, required: true },
      { key: 'after', label: 'Ảnh sau', type: 'image', wide: true, required: true },
      { key: 'visible', label: 'Hiện trên website', type: 'boolean' },
    ],
    defaults: () => ({ visible: true, date: isoDay() }),
  }),

  // ============ CỬA HÀNG ============
  products: () => ({
    label: 'Sản phẩm',
    rowQuick: false, // thao tác nằm trong ngăn chi tiết, bảng gọn hơn
    single: 'sản phẩm',
    icon: Package,
    collection: 'products',
    statuses: ['Đang bán', 'Hết hàng', 'Ẩn'],
    search: ['sku', 'name', 'category', 'brand'],
    filters: [{ key: 'category', label: 'Danh mục', options: opt('categories') }, { key: 'stockLow', label: 'Tồn kho', options: ['Sắp hết (≤ mức cảnh báo)'], test: (r) => r.stock > 0 && r.stock <= r.min }],
    defaultSort: { key: 'sold', dir: -1 },
    columns: [
      { key: 'name', label: 'Sản phẩm', main: true, render: (r) => <div className="adm-media">{thumb(r.image, r.name)}<div className="adm-cell2"><b className="adm-clamp1">{r.name}</b><span>{r.sku} · {r.category}</span></div></div> },
      { key: 'price', label: 'Giá bán', align: 'num', sort: true, render: (r) => <div className="adm-cell2 adm-cell2--r"><b>{money(r.price)}</b>{r.oldPrice > r.price && <s>{money(r.oldPrice)}</s>}</div> },
      { key: 'stock', label: 'Tồn', align: 'num', sort: true, render: (r) => <Badge tone={r.stock <= 0 ? 'danger' : r.stock <= r.min ? 'warn' : 'ok'}>{r.stock}</Badge> },
      { key: 'sold', label: 'Đã bán', align: 'num', sort: true, render: (r) => num(r.sold) },
      { key: 'rating', label: 'Đánh giá', align: 'num', sort: true, render: (r) => `${r.rating}★` },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Tên sản phẩm', required: true, wide: true },
      { key: 'sku', label: 'Mã SKU', required: true, check: (v, all, c) => (c.read('products').some((p) => p.sku === v && p.id !== all.id) ? 'SKU đã tồn tại' : '') },
      { key: 'category', label: 'Danh mục', type: 'select', options: opt('categories'), required: true },
      { key: 'brand', label: 'Thương hiệu' },
      { key: 'price', label: 'Giá bán', type: 'money', required: true, min: 1000 },
      { key: 'oldPrice', label: 'Giá gốc (gạch ngang)', type: 'money', check: (v, all) => (v && v < all.price ? 'Giá gốc phải lớn hơn giá bán' : '') },
      { key: 'cost', label: 'Giá vốn', type: 'money' },
      { key: 'stock', label: 'Tồn kho', type: 'number' },
      { key: 'min', label: 'Cảnh báo khi còn', type: 'number' },
      { key: 'image', label: 'Ảnh sản phẩm', type: 'image', wide: true },
      { key: 'spec', label: 'Thông số ngắn', wide: true },
      { key: 'desc', label: 'Mô tả', type: 'textarea', wide: true },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Đang bán', 'Hết hàng', 'Ẩn'], required: true },
      { key: 'featured', label: 'Sản phẩm nổi bật', type: 'boolean' },
    ],
    defaults: (c) => ({ status: 'Đang bán', stock: 0, min: 5, sold: 0, rating: 5, sku: nextCode(c.read('products').map((p) => ({ code: p.sku })), 'SP-') }),
    beforeSave: (v) => ({ ...v, status: v.status === 'Ẩn' ? 'Ẩn' : Number(v.stock) <= 0 ? 'Hết hàng' : 'Đang bán' }),
    actions: [
      { label: 'Ẩn khỏi web', when: (r) => r.status !== 'Ẩn', patch: { status: 'Ẩn' } },
      { label: 'Hiện lại', when: (r) => r.status === 'Ẩn', patch: (r) => ({ status: r.stock > 0 ? 'Đang bán' : 'Hết hàng' }) },
      { label: 'Nhập thêm', ask: { label: 'Số lượng nhập thêm', type: 'number', value: 10 }, patch: (r, n) => ({ stock: (r.stock || 0) + Math.max(0, Number(n) || 0), status: r.status === 'Ẩn' ? 'Ẩn' : 'Đang bán' }) },
    ],
    bulk: [{ label: 'Ẩn khỏi web', patch: { status: 'Ẩn' } }, { label: 'Đặt lại "Đang bán"', patch: { status: 'Đang bán' } }],
    summary: (rows) => [
      { label: 'Sản phẩm', value: num(rows.length) },
      { label: 'Sắp hết / hết hàng', value: num(rows.filter((r) => r.stock <= r.min).length) },
      { label: 'Giá trị tồn (giá vốn)', value: moneyShort(rows.reduce((s, r) => s + (r.stock || 0) * (r.cost || 0), 0)) },
      { label: 'Đã bán', value: num(rows.reduce((s, r) => s + (r.sold || 0), 0)) },
    ],
  }),

  categories: () => ({
    label: 'Danh mục',
    single: 'danh mục',
    icon: Tags,
    collection: 'categories',
    search: ['name'],
    defaultSort: { key: 'order', dir: 1 },
    columns: [
      { key: 'order', label: 'Thứ tự', align: 'num', sort: true },
      { key: 'name', label: 'Danh mục', main: true, render: (r) => <b>{r.name}</b> },
      { key: 'count', label: 'Số sản phẩm', align: 'num', render: (r, c) => num(c.read('products').filter((p) => p.category === r.name).length) },
      { key: 'visible', label: 'Hiện trên menu', toggle: 'visible' },
    ],
    fields: [
      { key: 'name', label: 'Tên danh mục', required: true, check: (v, all, c) => (c.read('categories').some((x) => x.name === v && x.id !== all.id) ? 'Danh mục đã tồn tại' : '') },
      { key: 'order', label: 'Thứ tự', type: 'number' },
      { key: 'desc', label: 'Mô tả (SEO)', type: 'textarea', wide: true },
      { key: 'visible', label: 'Hiện trên menu', type: 'boolean' },
    ],
    defaults: (c) => ({ visible: true, order: c.read('categories').length + 1 }),
    // đổi tên danh mục: cập nhật luôn sản phẩm thuộc danh mục
    afterSave: (row, prev, c) => {
      if (prev && prev.name !== row.name) c.store.write('products', c.read('products').map((p) => (p.category === prev.name ? { ...p, category: row.name } : p)))
    },
    canDelete: (rows, c) => {
      const used = rows.filter((r) => c.read('products').some((p) => p.category === r.name))
      return used.length ? `Danh mục "${used[0].name}" còn sản phẩm, hãy chuyển sản phẩm sang danh mục khác trước.` : ''
    },
  }),

  orders: () => ({
    label: 'Đơn hàng',
    single: 'đơn hàng',
    icon: ShoppingBag,
    collection: 'orders',
    codePrefix: 'DH',
    statuses: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Hoàn tất', 'Đã huỷ', 'Trả hàng'],
    search: ['code', 'customer', 'phone', 'address'],
    filters: [createdPreset, { key: 'channel', label: 'Kênh', options: ['Website', 'Zalo', 'Facebook', 'Hotline', 'Tại cửa hàng'] }, { key: 'payment', label: 'Thanh toán', options: ['COD', 'Chuyển khoản', 'Thẻ / ví điện tử', 'Trả góp 0%'] }],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Mã đơn', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDateTime(r.createdAt)}</span></div> },
      { key: 'customer', label: 'Khách hàng', main: true, render: who },
      { key: 'items', label: 'Sản phẩm', render: (r) => <span className="adm-clamp1">{r.items[0]?.name}{r.items.length > 1 ? ` +${r.items.length - 1}` : ''}</span>, csv: (r) => r.items.map((i) => `${i.name} x${i.qty}`).join('; ') },
      { key: 'total', label: 'Tổng tiền', align: 'num', sort: (r) => orderTotal(r), render: (r) => money(orderTotal(r)), csv: (r) => orderTotal(r) },
      { key: 'payment', label: 'Thanh toán', render: (r) => <div className="adm-cell2"><span>{r.payment}</span>{r.paid ? <Badge tone="ok">Đã thanh toán</Badge> : <Badge tone="warn">Chưa thanh toán</Badge>}</div>, csv: (r) => `${r.payment}${r.paid ? ' - đã thanh toán' : ''}` },
      { key: 'channel', label: 'Kênh', hideSm: true },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('customers') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'address', label: 'Địa chỉ giao hàng', required: true, wide: true },
      { key: 'items', label: 'Sản phẩm', type: 'items', wide: true, required: true, itemLabel: 'Sản phẩm', catalog: (c) => c.read('products').filter((p) => p.status !== 'Ẩn').map((p) => ({ name: p.name, price: p.price, sku: p.sku, image: p.image })) },
      { key: 'ship', label: 'Phí vận chuyển', type: 'money' },
      { key: 'discount', label: 'Giảm giá', type: 'money' },
      { key: 'payment', label: 'Hình thức thanh toán', type: 'select', options: ['COD', 'Chuyển khoản', 'Thẻ / ví điện tử', 'Trả góp 0%'], required: true },
      { key: 'paid', label: 'Đã thanh toán', type: 'boolean' },
      { key: 'channel', label: 'Kênh bán', type: 'select', options: ['Website', 'Zalo', 'Facebook', 'Hotline', 'Tại cửa hàng'] },
      { key: 'install', label: 'Cần lắp đặt', type: 'boolean' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Hoàn tất', 'Đã huỷ', 'Trả hàng'], required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ status: 'Chờ xác nhận', items: [], ship: 0, discount: 0, payment: 'COD', paid: false, channel: 'Hotline', date: isoDay() }),
    afterSave: (row, prev, c) => {
      // trừ kho khi tạo đơn; trả lại kho khi huỷ / trả hàng
      if (!prev && !['Đã huỷ', 'Trả hàng'].includes(row.status)) adjustStock(c, row.items, -1)
      if (prev && !['Đã huỷ', 'Trả hàng'].includes(prev.status) && ['Đã huỷ', 'Trả hàng'].includes(row.status)) adjustStock(c, row.items, +1)
    },
    actions: [
      { label: 'Xác nhận', when: (r) => r.status === 'Chờ xác nhận', patch: { status: 'Đã xác nhận' } },
      { label: 'Giao cho vận chuyển', when: (r) => r.status === 'Đã xác nhận', patch: { status: 'Đang giao' }, toast: (r) => `Đã tạo vận đơn cho ${r.code} (bản demo)` },
      { label: 'Đã giao', when: (r) => r.status === 'Đang giao', patch: (r) => ({ status: 'Đã giao', paid: true }) },
      { label: 'Hoàn tất', when: (r) => r.status === 'Đã giao', patch: { status: 'Hoàn tất' } },
      { label: 'Huỷ đơn', when: (r) => ['Chờ xác nhận', 'Đã xác nhận'].includes(r.status), danger: true, confirm: 'Huỷ đơn này? Sản phẩm sẽ được trả lại kho.', patch: { status: 'Đã huỷ' } },
    ],
    bulk: [{ label: 'Xác nhận đơn', patch: { status: 'Đã xác nhận' } }, { label: 'Chuyển "Đang giao"', patch: { status: 'Đang giao' } }],
    detail: 'invoice',
    summary: (rows) => {
      const ok = rows.filter((r) => !['Đã huỷ', 'Trả hàng'].includes(r.status))
      return [
        { label: 'Chờ xử lý', value: num(rows.filter((r) => ['Chờ xác nhận', 'Đã xác nhận'].includes(r.status)).length) + ' đơn' },
        { label: 'Đang giao', value: num(rows.filter((r) => r.status === 'Đang giao').length) + ' đơn' },
        { label: 'Doanh thu', value: moneyShort(ok.reduce((s, r) => s + orderTotal(r), 0)) },
        { label: 'Giá trị TB / đơn', value: moneyShort(ok.reduce((s, r) => s + orderTotal(r), 0) / (ok.length || 1)) },
      ]
    },
  }),

  installs: (ctx) => ({
    label: ctx.site.flags.shopServices ? 'Lịch hẹn & lắp đặt' : 'Lịch lắp đặt',
    single: 'lịch hẹn',
    icon: CalendarDays,
    collection: 'installs',
    codePrefix: 'LD',
    statuses: BOOKING_STATUSES,
    search: ['code', 'customer', 'phone', 'item', 'car'],
    filters: [datePreset, { key: 'place', label: 'Nơi làm', options: ['Tại cửa hàng', 'Tận nơi'] }, { key: 'branch', label: 'Chi nhánh', options: opt('branches') }],
    defaultSort: { key: 'date', dir: -1, by: (r) => r.date + r.time },
    views: ['table', 'calendar'],
    calendar: { date: 'date', time: 'time', title: (r) => `${r.customer} · ${r.car}`, sub: (r) => r.item },
    columns: [
      { key: 'code', label: 'Mã' },
      { key: 'date', label: 'Ngày giờ', sort: (r) => r.date + r.time, render: (r) => <div className="adm-cell2"><b>{r.time}</b><span>{fmtDate(r.date)}</span></div> },
      { key: 'customer', label: 'Khách hàng', main: true, render: who },
      { key: 'item', label: 'Sản phẩm / dịch vụ', render: (r) => <div className="adm-cell2"><span className="adm-clamp1">{r.item}</span><span>{r.car}</span></div> },
      { key: 'place', label: 'Nơi làm', render: (r) => <div className="adm-cell2"><span>{r.place}</span><span>{r.branch}</span></div> },
      { key: 'tech', label: 'Kỹ thuật', render: (r) => r.tech || <span className="adm-muted">Chưa phân</span> },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('customers') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe' },
      { key: 'item', label: 'Sản phẩm / dịch vụ', required: true, suggest: (c) => [...c.read('services').map((s) => s.name), ...c.read('products').map((p) => p.name)] },
      { key: 'place', label: 'Nơi làm', type: 'select', options: ['Tại cửa hàng', 'Tận nơi'], required: true },
      { key: 'branch', label: 'Chi nhánh', type: 'select', options: opt('branches') },
      { key: 'date', label: 'Ngày', type: 'date', required: true },
      { key: 'time', label: 'Giờ', type: 'select', options: SLOTS, required: true },
      { key: 'tech', label: 'Kỹ thuật viên', type: 'select', options: opt('staff') },
      { key: 'status', label: 'Trạng thái', type: 'select', options: BOOKING_STATUSES, required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: (c) => ({ status: 'Chờ xác nhận', place: 'Tại cửa hàng', date: isoDay(), time: '09:00', branch: c.read('branches')[0]?.name }),
    actions: bookingActions([{ label: 'Nhắc lịch qua Zalo', when: (r) => ['Chờ xác nhận', 'Đã xác nhận'].includes(r.status), toast: (r) => `Đã gửi tin nhắc lịch cho ${r.customer} (bản demo)` }]),
  }),

  flashsales: () => ({
    label: 'Flash sale',
    single: 'suất flash sale',
    icon: Zap,
    collection: 'flashsales',
    search: ['product', 'slot'],
    filters: [{ key: 'slot', label: 'Khung giờ', options: ['09:00 – 12:00', '12:00 – 15:00', '15:00 – 18:00', '20:00 – 23:00'] }],
    defaultSort: { key: 'date', dir: -1 },
    columns: [
      { key: 'product', label: 'Sản phẩm', main: true, render: (r, c) => <div className="adm-media">{thumb(c.read('products').find((p) => p.name === r.product)?.image)}<div className="adm-cell2"><b className="adm-clamp1">{r.product}</b><span>{fmtDate(r.date)} · {r.slot}</span></div></div> },
      { key: 'flashPrice', label: 'Giá flash', align: 'num', render: (r) => <div className="adm-cell2 adm-cell2--r"><b>{money(r.flashPrice)}</b><s>{money(r.price)}</s></div> },
      { key: 'off', label: 'Giảm', align: 'num', render: (r) => `−${Math.round((1 - r.flashPrice / r.price) * 100)}%` },
      { key: 'sold', label: 'Đã bán', render: (r) => <div className="adm-progress"><i style={{ width: `${(r.sold / r.limit) * 100}%` }} /><span>{r.sold}/{r.limit}</span></div> },
      { key: 'active', label: 'Bật', toggle: 'active' },
    ],
    fields: [
      { key: 'product', label: 'Sản phẩm', type: 'select', options: (c) => c.read('products').filter((p) => p.status === 'Đang bán').map((p) => p.name), required: true, wide: true },
      { key: 'flashPrice', label: 'Giá flash', type: 'money', required: true, check: (v, all, c) => { const p = c.read('products').find((x) => x.name === all.product); return p && v >= p.price ? 'Giá flash phải thấp hơn giá bán ' + money(p.price) : '' } },
      { key: 'date', label: 'Ngày', type: 'date', required: true },
      { key: 'slot', label: 'Khung giờ', type: 'select', options: ['09:00 – 12:00', '12:00 – 15:00', '15:00 – 18:00', '20:00 – 23:00'], required: true },
      { key: 'limit', label: 'Số suất', type: 'number', required: true, min: 1 },
      { key: 'perCustomer', label: 'Tối đa mỗi khách', type: 'number', min: 1 },
      { key: 'active', label: 'Bật', type: 'boolean' },
    ],
    defaults: () => ({ date: isoDay(), slot: '12:00 – 15:00', limit: 30, perCustomer: 2, sold: 0, active: true }),
    beforeSave: (v, c) => ({ ...v, price: c.read('products').find((p) => p.name === v.product)?.price || v.price }),
  }),

  stockReceipts: () => ({
    label: 'Nhập kho',
    single: 'phiếu nhập',
    icon: PackagePlus,
    collection: 'stockReceipts',
    codePrefix: 'PN',
    statuses: ['Chờ nhập kho', 'Đã nhập kho', 'Đã huỷ'],
    search: ['code', 'supplier'],
    defaultSort: { key: 'date', dir: -1 },
    columns: [
      { key: 'code', label: 'Số phiếu', render: (r) => <b className="adm-code">{r.code}</b> },
      { key: 'date', label: 'Ngày', sort: true, render: (r) => fmtDate(r.date) },
      { key: 'supplier', label: 'Nhà cung cấp', main: true },
      { key: 'items', label: 'Mặt hàng', align: 'num', render: (r) => `${r.items.length} mã · ${r.items.reduce((s, i) => s + i.qty, 0)} sp`, csv: (r) => r.items.length },
      { key: 'total', label: 'Giá trị', align: 'num', sort: (r) => receiptTotal(r), render: (r) => money(receiptTotal(r)), csv: (r) => receiptTotal(r) },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'supplier', label: 'Nhà cung cấp', required: true, suggest: (c) => [...new Set(c.read('stockReceipts').map((s) => s.supplier))] },
      { key: 'date', label: 'Ngày nhập', type: 'date', required: true },
      { key: 'items', label: 'Hàng nhập (giá vốn)', type: 'items', wide: true, required: true, itemLabel: 'Sản phẩm', catalog: (c) => c.read('products').map((p) => ({ name: p.name, price: p.cost, sku: p.sku })) },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Chờ nhập kho', 'Đã nhập kho', 'Đã huỷ'], required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ status: 'Chờ nhập kho', date: isoDay(), items: [] }),
    afterSave: (row, prev, c) => {
      if (row.status === 'Đã nhập kho' && (!prev || prev.status !== 'Đã nhập kho')) adjustStock(c, row.items, +1)
    },
    actions: [{ label: 'Xác nhận nhập kho', when: (r) => r.status === 'Chờ nhập kho', patch: { status: 'Đã nhập kho' }, toast: () => 'Đã cộng tồn kho' }],
  }),

  // ============ SHOWROOM ============
  cars: () => ({
    label: 'Xe đang bán',
    rowQuick: false, // thao tác nằm trong ngăn chi tiết, bảng gọn hơn
    single: 'xe',
    icon: Car,
    collection: 'cars',
    codePrefix: 'XE',
    statuses: ['Đang bán', 'Đã đặt cọc', 'Đã bán', 'Tạm ẩn'],
    search: ['code', 'name', 'brand', 'model', 'color'],
    filters: [
      { key: 'brand', label: 'Hãng', dynamic: true },
      { key: 'condition', label: 'Tình trạng', dynamic: true },
      { key: 'branch', label: 'Showroom', options: opt('branches') },
    ],
    defaultSort: { key: 'postedAt', dir: -1 },
    columns: [
      { key: 'name', label: 'Xe', main: true, render: (r) => <div className="adm-media">{thumb(r.image, r.name)}<div className="adm-cell2"><b className="adm-clamp1">{r.featured ? '★ ' : ''}{r.name}</b><span>{r.code} · {r.year} · {r.km ? num(r.km) + ' km' : 'Xe mới'} · {r.color}</span></div></div> },
      { key: 'condition', label: 'Tình trạng' },
      { key: 'price', label: 'Giá bán', align: 'num', sort: true, render: (r) => <div className="adm-cell2 adm-cell2--r"><b>{moneyShort(r.price)}</b>{r.oldPrice > r.price && <s>{moneyShort(r.oldPrice)}</s>}</div>, csv: (r) => r.price },
      { key: 'branch', label: 'Showroom', hideSm: true },
      { key: 'views', label: 'Lượt xem', align: 'num', sort: true, render: (r) => num(r.views) },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Tên tin đăng', required: true, wide: true, placeholder: 'VD: Toyota Vios 1.5G CVT 2021' },
      { key: 'brand', label: 'Hãng', required: true, suggest: ['Toyota', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Ford', 'Mitsubishi', 'VinFast', 'Mercedes-Benz', 'BMW'] },
      { key: 'model', label: 'Dòng xe' },
      { key: 'version', label: 'Phiên bản' },
      { key: 'year', label: 'Năm sản xuất', type: 'number', min: 2000, required: true },
      { key: 'km', label: 'Số km', type: 'number', suffix: 'km' },
      { key: 'color', label: 'Màu' },
      { key: 'body', label: 'Kiểu dáng', suggest: ['Sedan', 'SUV', 'MPV', 'Hatchback', 'Bán tải'] },
      { key: 'fuel', label: 'Nhiên liệu', type: 'select', options: ['Xăng', 'Dầu', 'Hybrid', 'Điện'] },
      { key: 'gear', label: 'Hộp số', type: 'select', options: ['Tự động', 'Số sàn', 'Tự động e-CVT'] },
      { key: 'condition', label: 'Tình trạng', type: 'select', options: ['Mới', 'Lướt', 'Đã qua sử dụng'], required: true },
      { key: 'price', label: 'Giá bán', type: 'money', required: true, min: 1000000 },
      { key: 'oldPrice', label: 'Giá niêm yết cũ', type: 'money' },
      { key: 'cost', label: 'Giá vốn (nội bộ)', type: 'money' },
      { key: 'branch', label: 'Showroom', type: 'select', options: opt('branches') },
      { key: 'tag', label: 'Nhãn', suggest: ['Giá tốt', 'Mới về', 'Lướt', 'Chính chủ', 'Bán chạy'] },
      { key: 'image', label: 'Ảnh đại diện', type: 'image', wide: true },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Đang bán', 'Đã đặt cọc', 'Đã bán', 'Tạm ẩn'], required: true },
      { key: 'featured', label: 'Xe nổi bật trang chủ', type: 'boolean' },
    ],
    defaults: (c) => ({ status: 'Đang bán', condition: 'Đã qua sử dụng', fuel: 'Xăng', gear: 'Tự động', year: 2022, km: 0, views: 0, postedAt: isoDay(), branch: c.read('branches')[0]?.name }),
    actions: [
      { label: 'Tạm ẩn', when: (r) => r.status === 'Đang bán', patch: { status: 'Tạm ẩn' } },
      { label: 'Đăng lại', when: (r) => r.status === 'Tạm ẩn', patch: () => ({ status: 'Đang bán', postedAt: isoDay() }) },
      { label: 'Đẩy tin lên đầu', when: (r) => r.status === 'Đang bán', patch: () => ({ postedAt: isoDay(), featured: true }), toast: () => 'Đã đẩy tin lên đầu danh sách' },
    ],
    summary: (rows) => {
      const sell = rows.filter((r) => r.status === 'Đang bán')
      return [
        { label: 'Đang bán', value: num(sell.length) + ' xe' },
        { label: 'Giá trị tồn', value: moneyShort(sell.reduce((s, r) => s + r.price, 0)) },
        { label: 'Đã đặt cọc', value: num(rows.filter((r) => r.status === 'Đã đặt cọc').length) },
        { label: 'Lượt xem tin', value: num(rows.reduce((s, r) => s + (r.views || 0), 0)) },
      ]
    },
  }),

  leads: () => ({
    label: 'Khách quan tâm',
    single: 'khách quan tâm',
    icon: Contact,
    collection: 'leads',
    codePrefix: 'KQ',
    statuses: ['Mới', 'Đã liên hệ', 'Hẹn xem xe', 'Đàm phán', 'Đặt cọc', 'Thất bại'],
    search: ['code', 'name', 'phone', 'car'],
    filters: [createdPreset, { key: 'source', label: 'Nguồn', options: ['Website', 'Facebook Ads', 'Zalo', 'Hotline', 'Đến showroom', 'Google'] }, { key: 'sale', label: 'Tư vấn', options: (c) => c.read('staff').filter((s) => /Tư vấn|kinh doanh/i.test(s.role)).map((s) => s.name) }],
    defaultSort: { key: 'createdAt', dir: -1 },
    views: ['table', 'board'],
    board: { title: (r) => r.name, sub: (r) => r.car, meta: (r) => `${r.need} · ${moneyShort(r.budget)}` },
    columns: [
      { key: 'code', label: 'Mã', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.createdAt)}</span></div> },
      { key: 'name', label: 'Khách', main: true, render: who },
      { key: 'car', label: 'Quan tâm', render: (r) => <div className="adm-cell2"><span className="adm-clamp1">{r.car}</span><span>{r.need} · {moneyShort(r.budget)}</span></div> },
      { key: 'source', label: 'Nguồn', hideSm: true },
      { key: 'sale', label: 'Tư vấn', render: (r) => r.sale || <span className="adm-muted">Chưa phân</span> },
      { key: 'nextFollow', label: 'Chăm sóc tiếp', sort: true, render: (r) => (r.nextFollow ? <Badge tone={r.nextFollow < isoDay() ? 'danger' : r.nextFollow === isoDay() ? 'warn' : 'muted'}>{fmtDate(r.nextFollow)}</Badge> : '—') },
      { key: 'status', label: 'Giai đoạn', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe quan tâm', type: 'select', options: opt('cars'), required: true },
      { key: 'need', label: 'Nhu cầu', type: 'select', options: ['Trả góp', 'Trả thẳng', 'Đổi xe cũ'] },
      { key: 'budget', label: 'Ngân sách', type: 'money' },
      { key: 'source', label: 'Nguồn', type: 'select', options: ['Website', 'Facebook Ads', 'Zalo', 'Hotline', 'Đến showroom', 'Google'] },
      { key: 'sale', label: 'Tư vấn phụ trách', type: 'select', options: (c) => c.read('staff').filter((s) => /Tư vấn|kinh doanh/i.test(s.role)).map((s) => s.name) },
      { key: 'status', label: 'Giai đoạn', type: 'select', options: ['Mới', 'Đã liên hệ', 'Hẹn xem xe', 'Đàm phán', 'Đặt cọc', 'Thất bại'], required: true },
      { key: 'nextFollow', label: 'Ngày chăm sóc tiếp', type: 'date' },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ status: 'Mới', need: 'Trả góp', source: 'Hotline', nextFollow: isoDay() }),
    actions: [
      { label: 'Đã gọi', when: (r) => r.status === 'Mới', patch: () => ({ status: 'Đã liên hệ', nextFollow: isoDay(addDays(new Date(), 2)) }) },
      {
        label: 'Hẹn lái thử',
        when: (r) => ['Mới', 'Đã liên hệ', 'Đàm phán'].includes(r.status),
        run: (r, c) => {
          const row = c.store.add('testDrives', { code: nextCode(c.read('testDrives'), 'LT'), customer: r.name, phone: r.phone, car: r.car, kind: 'Lái thử', branch: c.read('branches')[0]?.name, date: isoDay(addDays(new Date(), 1)), time: '09:00', status: 'Chờ xác nhận', sale: r.sale, license: 'Chưa xác nhận' }, `lịch lái thử cho ${r.name}`)
          c.store.update('leads', r.id, { status: 'Hẹn xem xe' })
          return { go: `testDrives?open=${row.id}`, toast: `Đã tạo lịch ${row.code}` }
        },
      },
      {
        label: 'Chốt đặt cọc',
        when: (r) => ['Hẹn xem xe', 'Đàm phán'].includes(r.status),
        run: (r, c) => {
          const car = c.read('cars').find((x) => x.name === r.car)
          const row = c.store.add('deposits', { code: nextCode(c.read('deposits'), 'HD'), customer: r.name, phone: r.phone, car: r.car, carCode: car?.code, price: car?.price || r.budget, deposit: 20e6, payment: r.need === 'Trả thẳng' ? 'Trả thẳng' : 'Trả góp', status: 'Đã đặt cọc', sale: r.sale, delivery: isoDay(addDays(new Date(), 14)), date: isoDay() }, `hợp đồng đặt cọc cho ${r.name}`)
          c.store.update('leads', r.id, { status: 'Đặt cọc', nextFollow: '' })
          if (car) c.store.update('cars', car.id, { status: 'Đã đặt cọc' })
          return { go: `deposits?open=${row.id}`, toast: `Đã tạo hợp đồng ${row.code}` }
        },
      },
      { label: 'Đánh dấu thất bại', when: (r) => !['Thất bại', 'Đặt cọc'].includes(r.status), danger: true, ask: { label: 'Lý do', type: 'text', value: 'Chọn xe hãng khác' }, patch: (r, reason) => ({ status: 'Thất bại', note: reason, nextFollow: '' }) },
    ],
    summary: (rows) => {
      const done = rows.filter((r) => r.status === 'Đặt cọc').length
      return [
        { label: 'Khách mới chưa gọi', value: num(rows.filter((r) => r.status === 'Mới').length) },
        { label: 'Cần chăm sóc hôm nay', value: num(rows.filter((r) => r.nextFollow && r.nextFollow <= isoDay()).length) },
        { label: 'Đã chốt cọc', value: num(done) },
        { label: 'Tỉ lệ chốt', value: Math.round((done / (rows.length || 1)) * 100) + '%' },
      ]
    },
  }),

  testDrives: (ctx) => ({
    label: ctx.site.flags.used ? 'Lịch xem xe / lái thử' : 'Lịch lái thử',
    single: 'lịch hẹn',
    icon: CalendarDays,
    collection: 'testDrives',
    codePrefix: 'LT',
    statuses: ['Chờ xác nhận', 'Đã xác nhận', 'Đã lái thử', 'Không đến', 'Đã huỷ'],
    search: ['code', 'customer', 'phone', 'car'],
    filters: [datePreset, { key: 'branch', label: 'Showroom', options: opt('branches') }],
    defaultSort: { key: 'date', dir: -1, by: (r) => r.date + r.time },
    views: ['table', 'calendar'],
    calendar: { date: 'date', time: 'time', title: (r) => r.customer, sub: (r) => `${r.kind} · ${r.car}` },
    columns: [
      { key: 'code', label: 'Mã' },
      { key: 'date', label: 'Ngày giờ', sort: (r) => r.date + r.time, render: (r) => <div className="adm-cell2"><b>{r.time}</b><span>{fmtDate(r.date)}</span></div> },
      { key: 'customer', label: 'Khách', main: true, render: who },
      { key: 'car', label: 'Xe', render: (r) => <div className="adm-cell2"><span className="adm-clamp1">{r.car}</span><span>{r.kind}</span></div> },
      { key: 'branch', label: 'Showroom', hideSm: true },
      { key: 'sale', label: 'Tư vấn' },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('leads') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe', type: 'select', options: opt('cars'), required: true },
      { key: 'kind', label: 'Loại hẹn', type: 'select', options: ['Lái thử', 'Xem xe'] },
      { key: 'branch', label: 'Showroom', type: 'select', options: opt('branches'), required: true },
      { key: 'date', label: 'Ngày', type: 'date', required: true },
      { key: 'time', label: 'Giờ', type: 'select', options: SLOTS, required: true },
      { key: 'sale', label: 'Tư vấn', type: 'select', options: (c) => c.read('staff').filter((s) => /Tư vấn|kinh doanh/i.test(s.role)).map((s) => s.name) },
      { key: 'license', label: 'Giấy phép lái xe', type: 'select', options: ['Có GPLX hạng B', 'Chưa xác nhận'] },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Chờ xác nhận', 'Đã xác nhận', 'Đã lái thử', 'Không đến', 'Đã huỷ'], required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: (c) => ({ status: 'Chờ xác nhận', kind: 'Lái thử', date: isoDay(addDays(new Date(), 1)), time: '09:00', branch: c.read('branches')[0]?.name, license: 'Chưa xác nhận' }),
    actions: [
      { label: 'Xác nhận', when: (r) => r.status === 'Chờ xác nhận', patch: { status: 'Đã xác nhận' } },
      { label: 'Đã lái thử', when: (r) => r.status === 'Đã xác nhận', patch: { status: 'Đã lái thử' } },
      { label: 'Không đến', when: (r) => r.status === 'Đã xác nhận', patch: { status: 'Không đến' } },
    ],
  }),

  deposits: () => ({
    label: 'Đặt cọc & hợp đồng',
    single: 'hợp đồng',
    icon: FileSignature,
    collection: 'deposits',
    codePrefix: 'HD',
    statuses: ['Đã đặt cọc', 'Chờ giao xe', 'Đã giao xe', 'Huỷ cọc'],
    search: ['code', 'customer', 'phone', 'car'],
    filters: [{ key: 'payment', label: 'Hình thức', options: ['Trả thẳng', 'Trả góp'] }],
    defaultSort: { key: 'date', dir: -1 },
    columns: [
      { key: 'code', label: 'Số HĐ', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.date)}</span></div> },
      { key: 'customer', label: 'Khách hàng', main: true, render: who },
      { key: 'car', label: 'Xe', render: (r) => <span className="adm-clamp1">{r.car}</span> },
      { key: 'price', label: 'Giá xe', align: 'num', sort: true, render: (r) => moneyShort(r.price), csv: (r) => r.price },
      { key: 'deposit', label: 'Đã cọc', align: 'num', render: (r) => moneyShort(r.deposit), csv: (r) => r.deposit },
      { key: 'delivery', label: 'Hẹn giao', sort: true, render: (r) => fmtDate(r.delivery) },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('leads') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe', type: 'select', options: (c) => c.read('cars').filter((x) => x.status !== 'Đã bán').map((x) => x.name), required: true },
      { key: 'price', label: 'Giá chốt', type: 'money', required: true },
      { key: 'deposit', label: 'Tiền cọc', type: 'money', required: true, check: (v, all) => (v > all.price ? 'Tiền cọc không vượt giá xe' : '') },
      { key: 'payment', label: 'Hình thức', type: 'select', options: ['Trả thẳng', 'Trả góp'] },
      { key: 'sale', label: 'Tư vấn', type: 'select', options: (c) => c.read('staff').filter((s) => /Tư vấn|kinh doanh/i.test(s.role)).map((s) => s.name) },
      { key: 'delivery', label: 'Ngày giao xe dự kiến', type: 'date' },
      { key: 'date', label: 'Ngày ký', type: 'date' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Đã đặt cọc', 'Chờ giao xe', 'Đã giao xe', 'Huỷ cọc'], required: true },
    ],
    defaults: () => ({ status: 'Đã đặt cọc', payment: 'Trả góp', deposit: 20e6, date: isoDay(), delivery: isoDay(addDays(new Date(), 14)) }),
    beforeSave: (v, c) => ({ ...v, price: v.price || c.read('cars').find((x) => x.name === v.car)?.price || 0 }),
    afterSave: (row, prev, c) => {
      const car = c.read('cars').find((x) => x.name === row.car)
      if (!car) return
      const status = row.status === 'Đã giao xe' ? 'Đã bán' : row.status === 'Huỷ cọc' ? 'Đang bán' : 'Đã đặt cọc'
      if (car.status !== status) c.store.update('cars', car.id, { status })
    },
    actions: [
      { label: 'Xe đã về, chờ giao', when: (r) => r.status === 'Đã đặt cọc', patch: { status: 'Chờ giao xe' } },
      { label: 'Giao xe', when: (r) => r.status === 'Chờ giao xe', patch: { status: 'Đã giao xe' } },
      { label: 'Huỷ cọc', when: (r) => ['Đã đặt cọc', 'Chờ giao xe'].includes(r.status), danger: true, confirm: 'Huỷ hợp đồng đặt cọc? Xe sẽ trở lại trạng thái "Đang bán".', patch: { status: 'Huỷ cọc' } },
    ],
    detail: 'invoice',
  }),

  loans: () => ({
    label: 'Hồ sơ trả góp',
    single: 'hồ sơ',
    icon: Landmark,
    collection: 'loans',
    codePrefix: 'TG',
    statuses: ['Mới nhận', 'Đang thẩm định', 'Đã duyệt', 'Đã giải ngân', 'Từ chối'],
    search: ['code', 'customer', 'phone', 'car', 'bank'],
    filters: [{ key: 'bank', label: 'Ngân hàng', dynamic: true }],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Mã', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.createdAt)}</span></div> },
      { key: 'customer', label: 'Khách hàng', main: true, render: who },
      { key: 'car', label: 'Xe', render: (r) => <div className="adm-cell2"><span className="adm-clamp1">{r.car}</span><span>{moneyShort(r.carPrice)}</span></div> },
      { key: 'loan', label: 'Khoản vay', align: 'num', render: (r) => <div className="adm-cell2 adm-cell2--r"><b>{moneyShort(r.carPrice * (1 - r.downPct / 100))}</b><span>{100 - r.downPct}% · {r.months} th · {r.rate}%</span></div>, csv: (r) => r.carPrice * (1 - r.downPct / 100) },
      { key: 'monthly', label: 'Trả hằng tháng', align: 'num', render: (r) => money(monthlyPay(r.carPrice, r.downPct, r.months, r.rate)), csv: (r) => monthlyPay(r.carPrice, r.downPct, r.months, r.rate) },
      { key: 'bank', label: 'Ngân hàng' },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customer', label: 'Khách hàng', required: true, suggest: opt('leads') },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe', type: 'select', options: opt('cars'), required: true },
      { key: 'carPrice', label: 'Giá xe', type: 'money', required: true },
      { key: 'downPct', label: 'Trả trước (%)', type: 'number', min: 10, suffix: '%', check: (v) => (v > 90 ? 'Tối đa 90%' : '') },
      { key: 'months', label: 'Thời hạn vay', type: 'select', options: ['12', '24', '36', '48', '60', '72', '84'], required: true },
      { key: 'rate', label: 'Lãi suất (%/năm)', type: 'number', step: 0.1, suffix: '%' },
      { key: 'bank', label: 'Ngân hàng', suggest: ['Vietcombank', 'Techcombank', 'VPBank', 'TPBank', 'MB Bank', 'BIDV', 'VIB'] },
      { key: 'income', label: 'Thu nhập hằng tháng', type: 'money' },
      { key: 'officer', label: 'Chuyên viên phụ trách', type: 'select', options: opt('staff') },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Mới nhận', 'Đang thẩm định', 'Đã duyệt', 'Đã giải ngân', 'Từ chối'], required: true },
    ],
    defaults: () => ({ status: 'Mới nhận', downPct: 30, months: 60, rate: 8.5 }),
    beforeSave: (v, c) => ({ ...v, months: Number(v.months), carPrice: v.carPrice || c.read('cars').find((x) => x.name === v.car)?.price || 0 }),
    actions: [
      { label: 'Gửi ngân hàng', when: (r) => r.status === 'Mới nhận', patch: { status: 'Đang thẩm định' }, toast: (r) => `Đã gửi hồ sơ ${r.code} sang ${r.bank} (bản demo)` },
      { label: 'Ngân hàng duyệt', when: (r) => r.status === 'Đang thẩm định', patch: { status: 'Đã duyệt' } },
      { label: 'Đã giải ngân', when: (r) => r.status === 'Đã duyệt', patch: { status: 'Đã giải ngân' } },
      { label: 'Từ chối', when: (r) => ['Mới nhận', 'Đang thẩm định'].includes(r.status), danger: true, patch: { status: 'Từ chối' } },
    ],
  }),

  consignments: () => ({
    label: 'Ký gửi & thu mua',
    single: 'yêu cầu',
    icon: Handshake,
    collection: 'consignments',
    codePrefix: 'KG',
    statuses: ['Mới', 'Đã định giá', 'Hẹn kiểm định', 'Đang ký gửi', 'Đã thu mua', 'Từ chối'],
    search: ['code', 'owner', 'phone', 'car'],
    filters: [{ key: 'kind', label: 'Loại', options: ['Định giá thu mua', 'Ký gửi bán', 'Đổi xe'] }],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Mã', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.createdAt)}</span></div> },
      { key: 'owner', label: 'Chủ xe', main: true, render: who },
      { key: 'car', label: 'Xe', render: (r) => <div className="adm-cell2"><span>{r.car} {r.year}</span><span>{num(r.km)} km · {r.kind}</span></div> },
      { key: 'expect', label: 'Khách mong muốn', align: 'num', render: (r) => moneyShort(r.expect), csv: (r) => r.expect },
      { key: 'offer', label: 'Giá định giá', align: 'num', render: (r) => (r.offer ? moneyShort(r.offer) : '—'), csv: (r) => r.offer },
      { key: 'inspector', label: 'Phụ trách', hideSm: true },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'owner', label: 'Chủ xe', required: true },
      { key: 'phone', label: 'Điện thoại', type: 'phone', required: true },
      { key: 'car', label: 'Xe', required: true, suggest: ['Toyota Vios', 'Honda City', 'Mazda CX-5', 'Hyundai Accent', 'Kia Seltos', 'Ford Ranger'] },
      { key: 'year', label: 'Năm sản xuất', type: 'number', min: 2000, required: true },
      { key: 'km', label: 'Số km', type: 'number', suffix: 'km' },
      { key: 'kind', label: 'Nhu cầu', type: 'select', options: ['Định giá thu mua', 'Ký gửi bán', 'Đổi xe'] },
      { key: 'expect', label: 'Giá khách mong muốn', type: 'money' },
      { key: 'offer', label: 'Giá showroom định giá', type: 'money' },
      { key: 'inspector', label: 'Người phụ trách', type: 'select', options: opt('staff') },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ['Mới', 'Đã định giá', 'Hẹn kiểm định', 'Đang ký gửi', 'Đã thu mua', 'Từ chối'], required: true },
      { key: 'note', label: 'Ghi chú tình trạng xe', type: 'textarea', wide: true },
    ],
    defaults: () => ({ status: 'Mới', kind: 'Định giá thu mua', year: 2020 }),
    actions: [
      { label: 'Gửi giá định giá', when: (r) => r.status === 'Mới', ask: { label: 'Giá định giá (đồng)', type: 'number', value: 0 }, patch: (r, v) => ({ status: 'Đã định giá', offer: Number(v) || Math.round(r.expect * 0.92 / 1e6) * 1e6 }), toast: (r) => `Đã gửi giá định giá cho ${r.owner} (bản demo)` },
      { label: 'Hẹn kiểm định', when: (r) => r.status === 'Đã định giá', patch: { status: 'Hẹn kiểm định' } },
      {
        label: 'Thu mua → đăng bán',
        when: (r) => ['Hẹn kiểm định', 'Đang ký gửi'].includes(r.status),
        run: (r, c) => {
          const row = c.store.add('cars', { code: nextCode(c.read('cars'), 'XE'), name: `${r.car} ${r.year}`, brand: r.car.split(' ')[0], model: r.car, year: r.year, km: r.km, condition: 'Đã qua sử dụng', price: Math.round((r.offer || r.expect) * 1.08 / 1e6) * 1e6, cost: r.offer || r.expect, status: 'Tạm ẩn', branch: c.read('branches')[0]?.name, views: 0, postedAt: isoDay(), fuel: 'Xăng', gear: 'Tự động', image: '' }, `xe thu mua ${r.car}`)
          c.store.update('consignments', r.id, { status: 'Đã thu mua' })
          return { go: `cars?open=${row.id}&edit=1`, toast: `Đã tạo tin ${row.code} (đang ẩn) – bổ sung ảnh rồi đăng bán` }
        },
      },
      { label: 'Từ chối', when: (r) => !['Đã thu mua', 'Từ chối'].includes(r.status), danger: true, patch: { status: 'Từ chối' } },
    ],
  }),
}

// Bảng nào xuất hiện trong ô tìm kiếm chung trên thanh trên cùng
export const SEARCHABLE = ['customers', 'orders', 'bookings', 'repairOrders', 'vehicles', 'installs', 'products', 'cars', 'leads', 'testDrives', 'deposits', 'loans', 'consignments']
export const matchText = (row, fields, q) => {
  const n = norm(q)
  return fields.some((f) => norm(row[f]).includes(n) || norm(String(row[f] || '').replace(/[\s.-]/g, '')).includes(n.replace(/[\s.-]/g, '')))
}
