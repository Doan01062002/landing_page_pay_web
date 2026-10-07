// Các chức năng quản trị ChungAuto dạng bảng (dùng trang danh sách chung src/admin/pages/Resource.jsx).
// Dữ liệu đọc ghi qua API; kiểm tra phía trình duyệt chỉ để báo sớm, máy chủ kiểm tra lại toàn bộ.
import { Contact, FileSignature, HelpCircle, LayoutGrid, Package, ScrollText, UserCog, Users, Wallet } from 'lucide-react'
import { Badge } from '../admin/ui.jsx'
import { addDays, fmtDate, fmtDateTime, initials, isoDay, money, moneyShort, num } from '../admin/lib.js'
import { api } from './api.js'
import { CustomerDetail, LeadDetail, OrderDetail } from './details.jsx'

export const LEAD_STATUS = ['Mới', 'Đã liên hệ', 'Hẹn demo', 'Đã báo giá', 'Chốt hợp đồng', 'Thất bại']
export const ORDER_STATUS = ['Báo giá', 'Đã ký', 'Đang triển khai', 'Chờ nghiệm thu', 'Hoàn tất', 'Đã huỷ']
export const BUSINESS_TYPES = ['Gara ô tô', 'Tiệm / chuỗi sửa xe máy', 'Lốp & ắc quy', 'Rửa xe, detailing', 'Sơn, gò đồng', 'Phụ tùng', 'Xưởng xe điện', 'Đại lý / showroom ô tô', 'Cửa hàng phụ kiện', 'Khác']
export const BRANCH_OPTIONS = ['1 điểm', '2 – 5 chi nhánh', '6 – 10 chi nhánh', 'Trên 10 chi nhánh']
export const SOURCES = ['Website', 'Hotline', 'Zalo', 'Facebook', 'Giới thiệu', 'Khác']
export const PACKAGES = ['Cơ bản', 'Cửa hàng', 'Chuỗi', 'Doanh nghiệp', 'Theo yêu cầu']
export const ROLES = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'sales', label: 'Kinh doanh' },
  { value: 'editor', label: 'Biên tập nội dung' },
]
const roleLabel = (r) => ROLES.find((x) => x.value === r)?.label || r

const who = (name, phone) => (
  <div className="adm-cell2">
    <b>{name}</b>
    <span>{phone}</span>
  </div>
)
const staffOptions = (ctx) => ctx.read('staff').filter((s) => s.active).map((s) => ({ value: s.id, label: s.name }))
const createdPreset = {
  key: '_when',
  label: 'Thời gian',
  options: ['Hôm nay', '7 ngày qua', '30 ngày qua', '90 ngày qua'],
  test: (r, v) => {
    const d = String(r.createdAt || '').slice(0, 10)
    const back = { 'Hôm nay': 0, '7 ngày qua': 7, '30 ngày qua': 30, '90 ngày qua': 90 }[v]
    return d >= isoDay(addDays(new Date(), -back))
  },
}
const total = (o) => (o.price || 0) - (o.discount || 0)

export function getCaSchema(id, ctx) {
  const S = SCHEMAS[id]
  if (!S) return null
  const def = S(ctx)
  // quyền theo vai trò đăng nhập (máy chủ vẫn kiểm tra lại)
  const p = ctx.perms?.[def.perm || def.collection] || ''
  return { id, ...def, canCreate: p.includes('w') && !def.readonly, canEdit: p.includes('w') && !def.readonly, canRemove: p.includes('d') && !def.readonly }
}

const SCHEMAS = {
  // ================= YÊU CẦU TƯ VẤN =================
  leads: () => ({
    label: 'Yêu cầu tư vấn',
    single: 'yêu cầu',
    icon: Contact,
    collection: 'leads',
    statuses: LEAD_STATUS,
    search: ['code', 'name', 'phone', 'email', 'interest', 'businessType', 'message'],
    filters: [createdPreset, { key: 'source', label: 'Nguồn', dynamic: true }, { key: 'assignedName', label: 'Phụ trách', dynamic: true }, { key: 'businessType', label: 'Loại hình', dynamic: true }],
    defaultSort: { key: 'createdAt', dir: -1 },
    views: ['table', 'board'],
    board: { title: (r) => r.name, sub: (r) => r.interest || 'Chưa chọn mẫu', meta: (r) => [r.businessType, r.phone].filter(Boolean).join(' · ') },
    columns: [
      { key: 'code', label: 'Mã', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDateTime(r.createdAt)}</span></div> },
      { key: 'name', label: 'Khách', main: true, render: (r) => who(r.name, r.phone) },
      { key: 'interest', label: 'Quan tâm', render: (r) => <div className="adm-cell2"><span className="adm-clamp1">{r.interest || 'Cần tư vấn chọn mẫu'}</span><span>{[r.businessType, r.branches].filter(Boolean).join(' · ')}</span></div> },
      { key: 'source', label: 'Nguồn', hideSm: true },
      { key: 'assignedName', label: 'Phụ trách', render: (r) => r.assignedName || <span className="adm-muted">Chưa phân</span> },
      { key: 'nextFollow', label: 'Gọi lại', sort: true, render: (r) => (r.nextFollow ? <Badge tone={r.nextFollow < isoDay() ? 'danger' : r.nextFollow === isoDay() ? 'warn' : 'muted'}>{fmtDate(r.nextFollow)}</Badge> : '—') },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'phone', label: 'Số điện thoại', type: 'phone', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'businessType', label: 'Loại hình kinh doanh', type: 'select', options: BUSINESS_TYPES },
      { key: 'branches', label: 'Số chi nhánh', type: 'select', options: BRANCH_OPTIONS },
      { key: 'interest', label: 'Mẫu / dịch vụ quan tâm', suggest: (c) => c.read('catalog').map((x) => x.name) },
      { key: 'source', label: 'Nguồn', type: 'select', options: SOURCES },
      { key: 'status', label: 'Trạng thái', type: 'select', options: LEAD_STATUS, required: true },
      { key: 'assignedTo', label: 'Người phụ trách', type: 'select', options: staffOptions },
      { key: 'nextFollow', label: 'Ngày gọi lại', type: 'date' },
      { key: 'message', label: 'Nội dung khách gửi', type: 'textarea', wide: true },
      { key: 'note', label: 'Ghi chú nội bộ', type: 'textarea', wide: true },
    ],
    defaults: (c) => ({ status: 'Mới', source: 'Hotline', nextFollow: isoDay(), assignedTo: c.me?.id }),
    beforeSave: (v) => ({ ...v, assignedTo: v.assignedTo ? Number(v.assignedTo) : null }),
    actions: [
      { label: 'Đã gọi', when: (r) => r.status === 'Mới', patch: () => ({ status: 'Đã liên hệ', nextFollow: isoDay(addDays(new Date(), 2)) }) },
      { label: 'Hẹn demo', when: (r) => ['Mới', 'Đã liên hệ'].includes(r.status), ask: { label: 'Ngày demo', type: 'date', value: isoDay(addDays(new Date(), 1)) }, patch: (r, d) => ({ status: 'Hẹn demo', nextFollow: d || null }) },
      { label: 'Đã gửi báo giá', when: (r) => ['Đã liên hệ', 'Hẹn demo'].includes(r.status), patch: () => ({ status: 'Đã báo giá', nextFollow: isoDay(addDays(new Date(), 3)) }) },
      {
        label: 'Chuyển thành hợp đồng',
        when: (r) => !['Chốt hợp đồng', 'Thất bại'].includes(r.status),
        ask: (r, c) => {
          const item = c.read('catalog').find((x) => r.interest && (x.name === r.interest || r.interest.includes(x.name)))
          return { label: `Giá hợp đồng cho "${r.interest || 'Phần mềm theo yêu cầu'}" (đồng)`, type: 'number', value: item?.price || 0 }
        },
        run: async (r, c, price) => {
          const item = c.read('catalog').find((x) => r.interest && (x.name === r.interest || r.interest.includes(x.name)))
          const out = await api('POST', `/api/admin/leads/${r.id}/convert`, {
            itemKind: item ? item.kind : 'custom',
            itemSlug: item?.slug || '',
            itemName: item?.name || r.interest || 'Phần mềm theo yêu cầu',
            price: Number(price) || 0,
          })
          await Promise.all(['leads', 'customers', 'orders'].map((x) => c.store.reload(x)))
          return { toast: `Đã tạo khách ${out.customerCode} và hợp đồng ${out.orderCode}`, go: `hop-dong?open=${out.orderId}` }
        },
      },
      { label: 'Thất bại', danger: true, when: (r) => !['Chốt hợp đồng', 'Thất bại'].includes(r.status), ask: { label: 'Lý do', type: 'text', value: 'Chưa có nhu cầu' }, patch: (r, why) => ({ status: 'Thất bại', nextFollow: null, note: [r.note, `Lý do: ${why}`].filter(Boolean).join('\n') }) },
    ],
    bulk: [{ label: 'Đánh dấu "Đã liên hệ"', patch: { status: 'Đã liên hệ' } }],
    detail: LeadDetail,
    summary: (rows) => {
      const done = rows.filter((r) => r.status === 'Chốt hợp đồng').length
      return [
        { label: 'Mới, chưa gọi', value: num(rows.filter((r) => r.status === 'Mới').length) },
        { label: 'Cần gọi lại hôm nay', value: num(rows.filter((r) => r.nextFollow && r.nextFollow <= isoDay() && !['Chốt hợp đồng', 'Thất bại'].includes(r.status)).length) },
        { label: 'Đã chốt', value: num(done) },
        { label: 'Tỉ lệ chốt', value: Math.round((done / (rows.length || 1)) * 100) + '%' },
      ]
    },
  }),

  // ================= KHÁCH HÀNG =================
  customers: () => ({
    label: 'Khách hàng',
    single: 'khách hàng',
    icon: Users,
    collection: 'customers',
    search: ['code', 'name', 'businessName', 'phone', 'email', 'taxCode', 'address'],
    filters: [{ key: 'businessType', label: 'Loại hình', dynamic: true }, { key: 'source', label: 'Nguồn', dynamic: true }],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Mã', render: (r) => <b className="adm-code">{r.code}</b> },
      { key: 'name', label: 'Khách hàng', main: true, render: (r) => who(r.name, r.phone) },
      { key: 'businessName', label: 'Doanh nghiệp', render: (r) => <div className="adm-cell2"><span>{r.businessName || '—'}</span><span>{r.businessType}</span></div> },
      { key: 'orderCount', label: 'Hợp đồng', align: 'num', sort: true },
      { key: 'paidTotal', label: 'Đã thanh toán', align: 'num', sort: true, render: (r) => money(r.paidTotal || 0) },
      { key: 'createdAt', label: 'Ngày tạo', sort: true, render: (r) => fmtDate(r.createdAt) },
    ],
    fields: [
      { key: 'name', label: 'Người liên hệ', required: true },
      { key: 'phone', label: 'Số điện thoại', type: 'phone', required: true },
      { key: 'businessName', label: 'Tên doanh nghiệp / cửa hàng' },
      { key: 'businessType', label: 'Loại hình', type: 'select', options: BUSINESS_TYPES },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'taxCode', label: 'Mã số thuế' },
      { key: 'branches', label: 'Số chi nhánh', type: 'select', options: BRANCH_OPTIONS },
      { key: 'source', label: 'Nguồn', type: 'select', options: SOURCES },
      { key: 'address', label: 'Địa chỉ', wide: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ source: 'Hotline' }),
    detail: CustomerDetail,
  }),

  // ================= HỢP ĐỒNG =================
  orders: () => ({
    label: 'Hợp đồng',
    single: 'hợp đồng',
    icon: FileSignature,
    collection: 'orders',
    statuses: ORDER_STATUS,
    search: ['code', 'customerName', 'customerPhone', 'businessName', 'itemName', 'domain'],
    filters: [createdPreset, { key: 'debt', label: 'Công nợ', options: ['Còn nợ', 'Đã thu đủ'], test: (r, v) => (v === 'Còn nợ' ? r.remaining > 0 && r.status !== 'Đã huỷ' : r.remaining <= 0) }, { key: 'assignedName', label: 'Phụ trách', dynamic: true }],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Số HĐ', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.createdAt)}</span></div> },
      { key: 'customerName', label: 'Khách hàng', main: true, render: (r) => who(r.customerName, r.businessName || r.customerPhone) },
      { key: 'itemName', label: 'Mẫu / gói', render: (r) => <div className="adm-cell2"><span className="adm-clamp1">{r.itemName}</span><span>{r.package || '—'}{r.giftLanding ? ' · tặng landing' : ''}</span></div> },
      { key: 'total', label: 'Giá trị', align: 'num', sort: true, render: (r) => money(r.total), csv: (r) => r.total },
      { key: 'remaining', label: 'Thanh toán', sort: true, render: (r) => (r.status === 'Đã huỷ' ? '—' : r.remaining <= 0 ? <Badge tone="ok">Đã thu đủ</Badge> : <Badge tone="warn">Còn {moneyShort(r.remaining)}</Badge>), csv: (r) => r.remaining },
      { key: 'dueDate', label: 'Hạn bàn giao', sort: true, hideSm: true, render: (r) => (r.dueDate ? <Badge tone={r.dueDate < isoDay() && !['Hoàn tất', 'Đã huỷ'].includes(r.status) ? 'danger' : 'muted'}>{fmtDate(r.dueDate)}</Badge> : '—') },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{r.status}</Badge> },
    ],
    fields: [
      { key: 'customerId', label: 'Khách hàng', type: 'select', required: true, wide: true, options: (c) => c.read('customers').map((x) => ({ value: x.id, label: `${x.code} · ${x.name}${x.businessName ? ' – ' + x.businessName : ''} · ${x.phone}` })) },
      { key: 'itemName', label: 'Mẫu / hạng mục', required: true, suggest: (c) => c.read('catalog').map((x) => x.name) },
      { key: 'package', label: 'Gói', type: 'select', options: PACKAGES },
      { key: 'price', label: 'Giá hợp đồng', type: 'money', required: true },
      { key: 'discount', label: 'Giảm giá', type: 'money', check: (v, all) => (Number(v) > Number(all.price) ? 'Không vượt giá hợp đồng' : '') },
      { key: 'giftLanding', label: 'Tặng landing page', type: 'boolean' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: ORDER_STATUS, required: true },
      { key: 'domain', label: 'Tên miền', placeholder: 'vd gara-abc.vn' },
      { key: 'assignedTo', label: 'Người phụ trách', type: 'select', options: staffOptions },
      { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
      { key: 'dueDate', label: 'Hạn bàn giao', type: 'date', check: (v, all) => (v && all.startDate && v < all.startDate ? 'Phải sau ngày bắt đầu' : '') },
      { key: 'note', label: 'Ghi chú / phạm vi công việc', type: 'textarea', wide: true },
    ],
    defaults: (c) => ({ status: 'Báo giá', giftLanding: true, discount: 0, package: 'Cơ bản', assignedTo: c.me?.id }),
    // tên mẫu → mã mẫu trong Kho mẫu (để thống kê mẫu bán chạy)
    beforeSave: (v, c) => {
      const item = c.read('catalog').find((x) => x.name === v.itemName)
      return { ...v, customerId: Number(v.customerId), assignedTo: v.assignedTo ? Number(v.assignedTo) : null, itemKind: item ? item.kind : v.itemKind || 'custom', itemSlug: item?.slug || '' }
    },
    actions: [
      { label: 'Ký hợp đồng', when: (r) => r.status === 'Báo giá', patch: () => ({ status: 'Đã ký', startDate: isoDay() }) },
      { label: 'Bắt đầu triển khai', when: (r) => r.status === 'Đã ký', patch: { status: 'Đang triển khai' } },
      { label: 'Gửi nghiệm thu', when: (r) => r.status === 'Đang triển khai', patch: { status: 'Chờ nghiệm thu' } },
      { label: 'Hoàn tất', when: (r) => r.status === 'Chờ nghiệm thu', patch: { status: 'Hoàn tất' } },
      {
        label: 'Thu tiền',
        when: (r) => r.status !== 'Đã huỷ' && r.remaining > 0,
        ask: (r) => ({ label: `Số tiền thu (còn lại ${money(r.remaining)})`, type: 'number', value: r.remaining }),
        run: async (r, c, amount) => {
          const p = await c.store.add('payments', { orderId: r.id, amount: Number(amount), method: 'Chuyển khoản', paidAt: isoDay() })
          await c.store.reload('orders')
          return { toast: `Đã ghi phiếu thu ${p.code}: ${money(p.amount)}` }
        },
      },
      { label: 'Huỷ hợp đồng', danger: true, when: (r) => !['Hoàn tất', 'Đã huỷ'].includes(r.status), confirm: 'Huỷ hợp đồng này?', patch: { status: 'Đã huỷ' } },
    ],
    detail: OrderDetail,
    summary: (rows) => {
      const live = rows.filter((r) => r.status !== 'Đã huỷ')
      return [
        { label: 'Đang triển khai', value: num(rows.filter((r) => ['Đã ký', 'Đang triển khai', 'Chờ nghiệm thu'].includes(r.status)).length) },
        { label: 'Giá trị hợp đồng', value: moneyShort(live.reduce((s, r) => s + total(r), 0)) },
        { label: 'Đã thu', value: moneyShort(live.reduce((s, r) => s + (r.paid || 0), 0)) },
        { label: 'Công nợ', value: moneyShort(live.reduce((s, r) => s + Math.max(0, r.remaining || 0), 0)) },
      ]
    },
  }),

  // ================= THU TIỀN =================
  payments: () => ({
    label: 'Thu tiền',
    single: 'phiếu thu',
    icon: Wallet,
    collection: 'payments',
    search: ['code', 'orderCode', 'customerName', 'itemName', 'note'],
    filters: [{ key: 'method', label: 'Hình thức', options: ['Chuyển khoản', 'Tiền mặt', 'Thẻ', 'Khác'] }, { ...createdPreset, test: (r, v) => createdPreset.test({ createdAt: r.paidAt }, v) }],
    defaultSort: { key: 'paidAt', dir: -1 },
    columns: [
      { key: 'code', label: 'Số phiếu', render: (r) => <div className="adm-cell2"><b className="adm-code">{r.code}</b><span>{fmtDate(r.paidAt)}</span></div> },
      { key: 'customerName', label: 'Khách hàng', main: true, render: (r) => who(r.customerName, `${r.orderCode} · ${r.itemName}`) },
      { key: 'amount', label: 'Số tiền', align: 'num', sort: true, render: (r) => <b>{money(r.amount)}</b>, csv: (r) => r.amount },
      { key: 'method', label: 'Hình thức' },
      { key: 'createdByName', label: 'Người thu', hideSm: true },
      { key: 'note', label: 'Ghi chú', hideSm: true, render: (r) => <span className="adm-clamp1">{r.note || '—'}</span> },
    ],
    fields: [
      { key: 'orderId', label: 'Hợp đồng', type: 'select', required: true, wide: true, options: (c) => c.read('orders').filter((o) => o.status !== 'Đã huỷ' && o.remaining > 0).map((o) => ({ value: o.id, label: `${o.code} · ${o.customerName} · còn ${money(o.remaining)}` })) },
      { key: 'amount', label: 'Số tiền', type: 'money', required: true, min: 1000 },
      { key: 'method', label: 'Hình thức', type: 'select', options: ['Chuyển khoản', 'Tiền mặt', 'Thẻ', 'Khác'], required: true },
      { key: 'paidAt', label: 'Ngày thu', type: 'date', required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    defaults: () => ({ method: 'Chuyển khoản', paidAt: isoDay() }),
    beforeSave: (v) => ({ ...v, orderId: Number(v.orderId), amount: Number(v.amount) }),
    summary: (rows) => {
      const m = isoDay().slice(0, 7)
      return [
        { label: 'Thu tháng này', value: moneyShort(rows.filter((r) => r.paidAt.startsWith(m)).reduce((s, r) => s + r.amount, 0)) },
        { label: 'Số phiếu tháng này', value: num(rows.filter((r) => r.paidAt.startsWith(m)).length) },
        { label: 'Tổng đã thu', value: moneyShort(rows.reduce((s, r) => s + r.amount, 0)) },
        { label: 'Tổng số phiếu', value: num(rows.length) },
      ]
    },
  }),

  // ================= KHO MẪU =================
  templates: () => ({
    label: 'Mẫu phần mềm',
    single: 'mẫu',
    icon: LayoutGrid,
    collection: 'catalog',
    perm: 'catalog',
    noCreate: true,
    noDelete: true,
    filterRows: (rows) => rows.filter((r) => r.kind === 'template'),
    statusOf: (r) => (r.visible ? 'Đang hiển thị' : 'Đang ẩn'),
    statuses: ['Đang hiển thị', 'Đang ẩn'],
    search: ['name', 'slug', 'category', 'summary'],
    filters: [{ key: 'category', label: 'Loại hình', dynamic: true }],
    defaultSort: { key: 'sortOrder', dir: 1 },
    columns: [
      { key: 'name', label: 'Mẫu', main: true, render: (r) => <div className="adm-cell2"><b>{r.name}</b><span>{r.slug} · {r.category}</span></div> },
      { key: 'price', label: 'Giá', align: 'num', sort: true, render: (r) => (r.free ? <Badge tone="ok">Miễn phí</Badge> : money(r.price || 0)) },
      { key: 'flags', label: 'Nhãn', render: (r) => <span className="adm-flags">{r.isNew && <Badge tone="info">Mới</Badge>}{r.featured && <Badge tone="warn">Nổi bật</Badge>}</span> },
      { key: 'sortOrder', label: 'Thứ tự', align: 'num', sort: true },
      { key: 'visible', label: 'Hiện trên web', toggle: 'visible' },
      { key: 'view', label: 'Xem', render: (r) => <a className="adm-link" href={`/mau-phan-mem/${r.slug}`} target="_blank" rel="noreferrer">Mở ↗</a> },
    ],
    fields: [
      { key: 'name', label: 'Tên mẫu', required: true, wide: true },
      { key: 'price', label: 'Giá triển khai', type: 'money' },
      { key: 'popularity', label: 'Độ phổ biến (sắp xếp "Phổ biến nhất")', type: 'number' },
      { key: 'free', label: 'Miễn phí', type: 'boolean' },
      { key: 'isNew', label: 'Nhãn "Mới"', type: 'boolean' },
      { key: 'featured', label: 'Nổi bật trên trang chủ', type: 'boolean' },
      { key: 'visible', label: 'Hiện trên website', type: 'boolean' },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number' },
      { key: 'summary', label: 'Mô tả ngắn (thẻ mẫu, SEO)', type: 'textarea', rows: 3, wide: true },
    ],
    beforeSave: (v) => ({ name: v.name, price: v.price === '' || v.price == null ? 0 : Number(v.price), popularity: Number(v.popularity) || 0, free: !!v.free, isNew: !!v.isNew, featured: !!v.featured, visible: !!v.visible, sortOrder: Number(v.sortOrder) || 0, summary: v.summary || '' }),
    rowQuick: false,
  }),
  projects: () => ({
    label: 'Mẫu dựng riêng',
    single: 'mẫu',
    icon: Package,
    collection: 'catalog',
    perm: 'catalog',
    noCreate: true,
    noDelete: true,
    filterRows: (rows) => rows.filter((r) => r.kind === 'project'),
    statusOf: (r) => (r.visible ? 'Đang hiển thị' : 'Đang ẩn'),
    statuses: ['Đang hiển thị', 'Đang ẩn'],
    search: ['name', 'slug', 'summary'],
    defaultSort: { key: 'sortOrder', dir: 1 },
    columns: [
      { key: 'sortOrder', label: '#', align: 'num', sort: true },
      { key: 'name', label: 'Mẫu', main: true, render: (r) => <div className="adm-cell2"><b>{r.name}</b><span>{r.slug}</span></div> },
      { key: 'summary', label: 'Mô tả', render: (r) => <span className="adm-clamp">{r.summary}</span> },
      { key: 'featured', label: 'Nổi bật', render: (r) => (r.featured ? <Badge tone="warn">Nổi bật</Badge> : '—') },
      { key: 'visible', label: 'Hiện trên web', toggle: 'visible' },
      { key: 'view', label: 'Xem', render: (r) => <a className="adm-link" href={`/du-an/${r.slug}/`} target="_blank" rel="noreferrer">Mở ↗</a> },
    ],
    fields: [
      { key: 'name', label: 'Tên mẫu', required: true, wide: true },
      { key: 'sortOrder', label: 'Thứ tự trong Kho mẫu', type: 'number', help: 'Số nhỏ đứng trước' },
      { key: 'featured', label: 'Nổi bật', type: 'boolean' },
      { key: 'visible', label: 'Hiện trên website', type: 'boolean' },
      { key: 'summary', label: 'Mô tả ngắn', type: 'textarea', rows: 3, wide: true },
    ],
    beforeSave: (v) => ({ name: v.name, sortOrder: Number(v.sortOrder) || 0, featured: !!v.featured, visible: !!v.visible, summary: v.summary || '' }),
    rowQuick: false,
  }),

  // ================= HỎI ĐÁP =================
  faqs: () => ({
    label: 'Hỏi đáp trang chủ',
    single: 'câu hỏi',
    icon: HelpCircle,
    collection: 'faqs',
    search: ['question', 'answer'],
    defaultSort: { key: 'sortOrder', dir: 1 },
    columns: [
      { key: 'sortOrder', label: '#', align: 'num', sort: true },
      { key: 'question', label: 'Câu hỏi', main: true, render: (r) => <b>{r.question}</b> },
      { key: 'answer', label: 'Trả lời', render: (r) => <span className="adm-clamp">{r.answer}</span> },
      { key: 'visible', label: 'Hiện', toggle: 'visible' },
    ],
    fields: [
      { key: 'question', label: 'Câu hỏi', required: true, wide: true },
      { key: 'answer', label: 'Trả lời', type: 'textarea', required: true, wide: true, rows: 5 },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number' },
      { key: 'visible', label: 'Hiện trên trang chủ', type: 'boolean' },
    ],
    defaults: (c) => ({ visible: true, sortOrder: c.read('faqs').length }),
    beforeSave: (v) => ({ question: v.question, answer: v.answer, sortOrder: Number(v.sortOrder) || 0, visible: !!v.visible }),
  }),

  // ================= TÀI KHOẢN =================
  users: (ctx) => ({
    label: 'Tài khoản quản trị',
    single: 'tài khoản',
    icon: UserCog,
    collection: 'users',
    statusOf: (r) => (!r.active ? 'Đã vô hiệu hoá' : r.lockedUntil && r.lockedUntil > new Date().toISOString() ? 'Đang tạm khoá' : 'Đang hoạt động'),
    statuses: ['Đang hoạt động', 'Đang tạm khoá', 'Đã vô hiệu hoá'],
    search: ['name', 'email'],
    filters: [{ key: 'role', label: 'Vai trò', options: ROLES.map((r) => r.value), test: (r, v) => r.role === v }],
    columns: [
      { key: 'name', label: 'Tài khoản', main: true, render: (r) => <div className="adm-media"><span className="adm-avatar">{initials(r.name, 1)}</span><div className="adm-cell2"><b>{r.name}{r.id === ctx.me?.id ? ' (bạn)' : ''}</b><span>{r.email}</span></div></div> },
      { key: 'role', label: 'Vai trò', render: (r) => <Badge tone={r.role === 'admin' ? 'info' : 'muted'}>{roleLabel(r.role)}</Badge>, csv: (r) => roleLabel(r.role) },
      { key: 'lastLoginAt', label: 'Đăng nhập gần nhất', sort: true, render: (r) => (r.lastLoginAt ? fmtDateTime(r.lastLoginAt) : 'Chưa đăng nhập') },
      { key: 'status', label: 'Trạng thái', render: (r) => <Badge>{!r.active ? 'Đã vô hiệu hoá' : r.lockedUntil && r.lockedUntil > new Date().toISOString() ? 'Đang tạm khoá' : 'Đang hoạt động'}</Badge> },
    ],
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'email', label: 'Email đăng nhập', type: 'email', required: true },
      { key: 'role', label: 'Vai trò', type: 'select', options: ROLES, required: true },
      { key: 'active', label: 'Cho phép đăng nhập', type: 'boolean' },
      { key: 'password', label: 'Mật khẩu', type: 'password', help: 'Tối thiểu 8 ký tự, có chữ và số. Khi sửa: để trống nếu không đổi.', check: (v, all) => (!all.id && !v ? 'Nhập mật khẩu cho tài khoản mới' : v && (v.length < 8 || !/\d/.test(v) || !/[a-zA-Z]/.test(v)) ? 'Tối thiểu 8 ký tự, có chữ và số' : '') },
    ],
    defaults: () => ({ role: 'sales', active: true, password: '' }),
    beforeSave: (v) => {
      const out = { name: v.name, email: v.email, role: v.role, active: !!v.active }
      if (v.password) out.password = v.password
      return out
    },
    actions: [
      { label: 'Đặt lại mật khẩu', ask: { label: 'Mật khẩu mới (≥ 8 ký tự, có chữ và số)', type: 'text', value: '' }, patch: (r, p) => ({ password: p }), toast: (r) => `Đã đặt lại mật khẩu cho ${r.email}. Các phiên đăng nhập cũ đã bị đăng xuất.` },
      { label: 'Mở khoá', when: (r) => r.lockedUntil && r.lockedUntil > new Date().toISOString(), patch: { unlock: true } },
    ],
    rowQuick: false,
  }),

  // ================= NHẬT KÝ =================
  audit: () => ({
    label: 'Nhật ký hoạt động',
    single: 'thao tác',
    icon: ScrollText,
    collection: 'audit',
    readonly: true,
    search: ['summary', 'userName', 'entity'],
    filters: [
      { key: 'action', label: 'Thao tác', options: ['create', 'update', 'delete', 'login', 'convert', 'lock'], test: (r, v) => r.action === v },
      { key: 'userName', label: 'Người làm', dynamic: true },
      createdPreset,
    ],
    defaultSort: { key: 'createdAt', dir: -1 },
    columns: [
      { key: 'createdAt', label: 'Thời gian', sort: true, render: (r) => fmtDateTime(r.createdAt) },
      { key: 'userName', label: 'Người làm', main: true, render: (r) => <b>{r.userName}</b> },
      { key: 'summary', label: 'Nội dung', render: (r) => r.summary },
    ],
    fields: [
      { key: 'userName', label: 'Người làm' },
      { key: 'action', label: 'Thao tác' },
      { key: 'entity', label: 'Bảng dữ liệu' },
      { key: 'entityId', label: 'Mã bản ghi' },
      { key: 'summary', label: 'Nội dung', wide: true },
    ],
  }),
}

// Thanh bên: nhóm + đường dẫn tiếng Việt (/admin/<slug>)
export const CA_MODULES = [
  { id: 'dashboard', slug: '', group: 'Tổng quan', label: 'Tổng quan' },
  { id: 'leads', slug: 'yeu-cau', group: 'Kinh doanh', perm: 'leads' },
  { id: 'customers', slug: 'khach-hang', group: 'Kinh doanh', perm: 'customers' },
  { id: 'orders', slug: 'hop-dong', group: 'Kinh doanh', perm: 'orders' },
  { id: 'payments', slug: 'thu-tien', group: 'Kinh doanh', perm: 'payments' },
  { id: 'templates', slug: 'mau-phan-mem', group: 'Website', perm: 'catalog' },
  { id: 'projects', slug: 'mau-dung-rieng', group: 'Website', perm: 'catalog' },
  { id: 'faqs', slug: 'hoi-dap', group: 'Website', perm: 'faqs' },
  { id: 'settings', slug: 'cai-dat', group: 'Website', perm: 'settings', label: 'Cài đặt website' },
  { id: 'users', slug: 'tai-khoan', group: 'Hệ thống', perm: 'users' },
  { id: 'audit', slug: 'nhat-ky', group: 'Hệ thống', perm: 'audit' },
  { id: 'account', slug: 'doi-mat-khau', group: 'Hệ thống', label: 'Đổi mật khẩu' },
]
