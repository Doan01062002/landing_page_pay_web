// Cấu hình các bảng quản trị dạng thêm / sửa / xoá: kiểm tra dữ liệu (zod), câu SQL đọc danh sách, cột được ghi,
// và ràng buộc nghiệp vụ (vd tiền thu không vượt số còn lại của hợp đồng).
import { z } from 'zod'
import { toSnake } from './db.js'

// ---------- Kiểu dữ liệu dùng chung ----------
const text = (max = 200) => z.string().trim().max(max, `Tối đa ${max} ký tự`)
const required = (max = 200) => z.string().trim().min(1, 'Bắt buộc nhập').max(max, `Tối đa ${max} ký tự`)
const phone = z
  .string()
  .transform((s) => s.replace(/[\s.()-]/g, ''))
  .pipe(z.string().regex(/^0\d{9}$/, 'Số điện thoại 10 số, bắt đầu bằng 0'))
const email = z.union([z.literal(''), z.email('Email chưa đúng định dạng')])
const money = z.coerce.number('Phải là số').int('Phải là số nguyên').min(0, 'Không được âm').max(1e13, 'Số quá lớn')
const date = z.union([z.literal(''), z.null(), z.iso.date('Ngày chưa đúng định dạng')]).transform((v) => v || null)
const fk = z.union([z.literal(''), z.null(), z.coerce.number().int().positive()]).transform((v) => v || null)
const bool = z.coerce.boolean()

export const LEAD_STATUS = ['Mới', 'Đã liên hệ', 'Hẹn demo', 'Đã báo giá', 'Chốt hợp đồng', 'Thất bại']
export const ORDER_STATUS = ['Báo giá', 'Đã ký', 'Đang triển khai', 'Chờ nghiệm thu', 'Hoàn tất', 'Đã huỷ']
export const PAY_METHODS = ['Chuyển khoản', 'Tiền mặt', 'Thẻ', 'Khác']
const enumOf = (list) => z.enum(list, `Chỉ nhận: ${list.join(', ')}`)

const CUSTOMER_SELECT = `SELECT c.*,
    (SELECT count(*) FROM orders o WHERE o.customer_id = c.id AND o.status <> 'Đã huỷ')::int AS order_count,
    COALESCE((SELECT sum(p.amount) FROM payments p JOIN orders o ON o.id = p.order_id WHERE o.customer_id = c.id), 0)::bigint AS paid_total
  FROM customers c`

// ---------- Định nghĩa từng bảng ----------
// list: câu SELECT (có thể JOIN) – cột trả về được đổi sang camelCase
// create / update: zod schema; update luôn là partial
export const RESOURCES = {
  leads: {
    table: 'leads',
    label: 'yêu cầu tư vấn',
    list: `SELECT l.*, u.name AS assigned_name, c.code AS customer_code
           FROM leads l LEFT JOIN users u ON u.id = l.assigned_to LEFT JOIN customers c ON c.id = l.customer_id
           ORDER BY l.created_at DESC LIMIT 5000`,
    one: `SELECT l.*, u.name AS assigned_name, c.code AS customer_code FROM leads l LEFT JOIN users u ON u.id = l.assigned_to LEFT JOIN customers c ON c.id = l.customer_id WHERE l.id = $1`,
    schema: z.object({
      name: required(100),
      phone,
      email: email.default(''),
      businessType: text(100).default(''),
      branches: text(50).default(''),
      interest: text(200).default(''),
      message: text(2000).default(''),
      source: text(50).default('Hotline'),
      status: enumOf(LEAD_STATUS).default('Mới'),
      assignedTo: fk.optional(),
      nextFollow: date.optional(),
      note: text(2000).default(''),
    }),
  },

  customers: {
    table: 'customers',
    label: 'khách hàng',
    list: `${CUSTOMER_SELECT} ORDER BY c.created_at DESC LIMIT 5000`,
    one: `${CUSTOMER_SELECT} WHERE c.id = $1`,
    schema: z.object({
      name: required(100),
      businessName: text(150).default(''),
      businessType: text(100).default(''),
      phone,
      email: email.default(''),
      address: text(300).default(''),
      taxCode: text(20).default(''),
      branches: text(50).default(''),
      source: text(50).default('Website'),
      note: text(2000).default(''),
    }),
  },

  orders: {
    table: 'orders',
    label: 'hợp đồng',
    list: `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.business_name, u.name AS assigned_name,
             t.total, t.paid, (t.total - t.paid) AS remaining
           FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_totals t ON t.order_id = o.id
           LEFT JOIN users u ON u.id = o.assigned_to
           ORDER BY o.created_at DESC LIMIT 5000`,
    one: `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.business_name, u.name AS assigned_name, t.total, t.paid, (t.total - t.paid) AS remaining
          FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_totals t ON t.order_id = o.id LEFT JOIN users u ON u.id = o.assigned_to WHERE o.id = $1`,
    schema: z.object({
      customerId: z.coerce.number('Chọn khách hàng').int().positive('Chọn khách hàng'),
      leadId: fk.optional(),
      itemKind: z.enum(['template', 'project', 'landing', 'custom']).default('template'),
      itemSlug: text(80).default(''),
      itemName: required(200),
      package: text(100).default(''),
      price: money,
      discount: money.default(0),
      giftLanding: bool.default(true),
      status: enumOf(ORDER_STATUS).default('Báo giá'),
      domain: text(200).default(''),
      startDate: date.optional(),
      dueDate: date.optional(),
      assignedTo: fk.optional(),
      note: text(2000).default(''),
    }),
    // ràng buộc trên dữ liệu sau khi gộp (thêm mới hoặc sửa một phần)
    rules: (v) => ({
      ...(v.discount > v.price && { discount: 'Giảm giá không vượt giá hợp đồng' }),
      ...(v.startDate && v.dueDate && v.dueDate < v.startDate && { dueDate: 'Hạn bàn giao phải sau ngày bắt đầu' }),
    }),
    // sửa giá / giảm giá: tổng mới không được thấp hơn số tiền đã thu
    async check(db, data, id) {
      if (!id || (data.price === undefined && data.discount === undefined)) return null
      const { rows } = await db.query('SELECT price, discount, (SELECT COALESCE(sum(amount), 0) FROM payments WHERE order_id = $1)::bigint AS paid FROM orders WHERE id = $1', [id])
      if (!rows[0]) return null
      const total = (data.price ?? rows[0].price) - (data.discount ?? rows[0].discount)
      return total < rows[0].paid ? { price: `Tổng hợp đồng không được thấp hơn số đã thu (${rows[0].paid.toLocaleString('vi-VN')}đ)` } : null
    },
    bulkDeny: ['customerId', 'price', 'discount', 'startDate', 'dueDate'], // trường phải kiểm tra từng hợp đồng, không sửa hàng loạt
  },

  payments: {
    table: 'payments',
    label: 'phiếu thu',
    noBulkUpdate: true,
    list: `SELECT p.*, o.code AS order_code, o.item_name, c.name AS customer_name, u.name AS created_by_name
           FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id LEFT JOIN users u ON u.id = p.created_by
           ORDER BY p.paid_at DESC, p.id DESC LIMIT 5000`,
    one: `SELECT p.*, o.code AS order_code, o.item_name, c.name AS customer_name, u.name AS created_by_name FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id LEFT JOIN users u ON u.id = p.created_by WHERE p.id = $1`,
    schema: z.object({
      orderId: z.coerce.number('Chọn hợp đồng').int().positive('Chọn hợp đồng'),
      amount: money.refine((v) => v > 0, 'Số tiền phải lớn hơn 0'),
      method: enumOf(PAY_METHODS).default('Chuyển khoản'),
      paidAt: z.iso.date('Ngày chưa đúng định dạng').optional(),
      note: text(500).default(''),
    }),
    // không thu vượt số còn lại của hợp đồng
    async check(db, data, id) {
      if (data.orderId === undefined && data.amount === undefined) return null
      const cur = id ? (await db.query('SELECT order_id, amount FROM payments WHERE id = $1', [id])).rows[0] : null
      const orderId = data.orderId ?? cur?.order_id
      const { rows } = await db.query(
        `SELECT o.status, (o.price - o.discount) AS total, COALESCE((SELECT sum(amount) FROM payments WHERE order_id = o.id AND id <> $2), 0)::bigint AS paid
         FROM orders o WHERE o.id = $1`,
        [orderId, id || 0],
      )
      if (!rows[0]) return { orderId: 'Hợp đồng không tồn tại' }
      if (rows[0].status === 'Đã huỷ') return { orderId: 'Hợp đồng đã huỷ, không thu tiền' }
      const amount = data.amount ?? cur?.amount
      if (amount > rows[0].total - rows[0].paid) return { amount: `Vượt số còn lại (${(rows[0].total - rows[0].paid).toLocaleString('vi-VN')}đ)` }
      return null
    },
  },

  catalog: {
    table: 'catalog_items',
    label: 'mẫu',
    noCreate: true, // mẫu mới cần giao diện trong mã nguồn → thêm bằng seed / migration
    noDelete: true,
    list: `SELECT * FROM catalog_items ORDER BY kind DESC, sort_order, id`,
    one: `SELECT * FROM catalog_items WHERE id = $1`,
    schema: z.object({
      name: required(150),
      price: z.union([z.null(), money]).optional(),
      free: bool.optional(),
      isNew: bool.optional(),
      featured: bool.optional(),
      visible: bool.optional(),
      sortOrder: z.coerce.number().int().min(0).max(100000).optional(),
      popularity: z.coerce.number().int().min(0).max(1000).optional(),
      summary: text(400).optional(),
    }),
    affectsSite: true,
  },

  faqs: {
    table: 'faqs',
    label: 'câu hỏi',
    list: `SELECT * FROM faqs ORDER BY sort_order, id`,
    one: `SELECT * FROM faqs WHERE id = $1`,
    schema: z.object({
      question: required(300),
      answer: required(2000),
      sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
      visible: bool.default(true),
    }),
    affectsSite: true,
  },
}

// Kiểm tra dữ liệu → { data } hoặc { fields: { tênTrường: thông báo } }
export function validate(schema, body, partial) {
  const s = partial ? schema.partial() : schema
  const r = s.safeParse(body || {})
  if (r.success) {
    // sửa một phần: chỉ giữ trường thật sự được gửi lên (zod tự điền giá trị mặc định cho trường vắng mặt,
    // nếu giữ lại sẽ ghi đè dữ liệu cũ); bỏ khoá undefined
    const sent = new Set(Object.keys(body || {}))
    return { data: Object.fromEntries(Object.entries(r.data).filter(([k, v]) => v !== undefined && (!partial || sent.has(k)))) }
  }
  const fields = {}
  for (const i of r.error.issues) {
    const k = i.path.join('.') || '_'
    if (!fields[k]) fields[k] = i.message
  }
  return { fields }
}

// INSERT / UPDATE với các khoá camelCase → cột snake_case
export function insertSql(table, data) {
  const keys = Object.keys(data)
  return {
    text: `INSERT INTO ${table} (${keys.map(toSnake).join(', ')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(', ')}) RETURNING id`,
    values: keys.map((k) => data[k]),
  }
}
export function updateSql(table, id, data) {
  const keys = Object.keys(data)
  return {
    text: `UPDATE ${table} SET ${keys.map((k, i) => `${toSnake(k)} = $${i + 1}`).join(', ')}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING id`,
    values: [...keys.map((k) => data[k]), id],
  }
}
