// Cơ sở dữ liệu: migration, dữ liệu khởi tạo, mã chứng từ, ràng buộc toàn vẹn.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../../server/migrate.js'
import { seed } from '../../server/seed.js'
import { verifyPassword } from '../../server/auth.js'
import { templates } from '../../src/data/templates.js'
import { projects } from '../../src/data/projects.js'
import { defaultBootstrap } from '../../src/data/bootstrap.js'
import { ADMIN, setup } from '../helpers.js'

let ctx
beforeAll(async () => {
  ctx = await setup()
})
afterAll(() => ctx.pool.end())

const q = (text, values) => ctx.pool.query(text, values)
const err = async (p) => {
  try {
    await p
  } catch (e) {
    return e
  }
  throw new Error('Lẽ ra phải lỗi')
}

describe('migration', () => {
  it('đã tạo đủ bảng và view', async () => {
    const { rows } = await q(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1`)
    const names = rows.map((r) => r.table_name)
    for (const t of ['users', 'sessions', 'settings', 'catalog_items', 'faqs', 'customers', 'leads', 'orders', 'payments', 'audit_logs', 'order_totals', 'schema_migrations']) expect(names).toContain(t)
  })
  it('chạy lại không làm gì (idempotent)', async () => {
    expect(await migrate(ctx.pool, () => {})).toBe(0)
  })
  it('chạy đồng thời vẫn an toàn (khoá advisory)', async () => {
    const r = await Promise.all([migrate(ctx.pool, () => {}), migrate(ctx.pool, () => {}), migrate(ctx.pool, () => {})])
    expect(r).toEqual([0, 0, 0])
  })
})

describe('dữ liệu khởi tạo', () => {
  it('nạp Kho mẫu từ mã nguồn', async () => {
    const { rows } = await q(`SELECT kind, count(*)::int AS n FROM catalog_items GROUP BY kind`)
    const n = Object.fromEntries(rows.map((r) => [r.kind, r.n]))
    expect(n.template).toBe(templates.length)
    expect(n.project).toBe(projects.length)
  })
  it('nạp hỏi đáp và cài đặt mặc định', async () => {
    const f = await q('SELECT count(*)::int AS n FROM faqs')
    expect(f.rows[0].n).toBe(defaultBootstrap().faqs.length)
    const s = await q(`SELECT key, value FROM settings ORDER BY key`)
    expect(s.rows.map((r) => r.key)).toEqual(['seo', 'site'])
    expect(s.rows[1].value.hotline).toBe(defaultBootstrap().site.hotline)
  })
  it('tạo tài khoản quản trị từ biến môi trường, mật khẩu được băm', async () => {
    const { rows } = await q('SELECT * FROM users WHERE email = $1', [ADMIN.email])
    expect(rows).toHaveLength(1)
    expect(rows[0].role).toBe('admin')
    expect(rows[0].password_hash).not.toContain(ADMIN.password)
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$12\$/)
    expect(await verifyPassword(ADMIN.password, rows[0].password_hash)).toBe(true)
  })
  it('chạy lại không nhân đôi dữ liệu, không ghi đè mật khẩu / cài đặt đã sửa', async () => {
    await q(`UPDATE settings SET value = jsonb_set(value, '{hotline}', '"0999 999 999"') WHERE key = 'site'`)
    const before = (await q('SELECT password_hash FROM users WHERE email = $1', [ADMIN.email])).rows[0].password_hash
    await seed(ctx.pool, { ...ctx.cfg, adminPassword: 'MatKhauKhac99' }, () => {})
    expect((await q('SELECT count(*)::int AS n FROM catalog_items')).rows[0].n).toBe(templates.length + projects.length)
    expect((await q('SELECT count(*)::int AS n FROM users')).rows[0].n).toBe(1)
    expect((await q('SELECT password_hash FROM users WHERE email = $1', [ADMIN.email])).rows[0].password_hash).toBe(before)
    expect((await q(`SELECT value->>'hotline' AS h FROM settings WHERE key = 'site'`)).rows[0].h).toBe('0999 999 999')
  })
  it('không có ADMIN_EMAIL / ADMIN_PASSWORD thì không tạo tài khoản', async () => {
    await seed(ctx.pool, { ...ctx.cfg, adminEmail: 'khac@test.local', adminPassword: '' }, () => {})
    expect((await q(`SELECT count(*)::int AS n FROM users WHERE email = 'khac@test.local'`)).rows[0].n).toBe(0)
  })
})

describe('mã chứng từ tự sinh', () => {
  it('đúng định dạng KH0001 / TV00001 / HD0001 / PT00001', async () => {
    const c = (await q(`INSERT INTO customers (name, phone) VALUES ('A', '0900000001') RETURNING id, code`)).rows[0]
    const l = (await q(`INSERT INTO leads (name, phone) VALUES ('A', '0900000001') RETURNING code`)).rows[0]
    const o = (await q(`INSERT INTO orders (customer_id, item_name, price) VALUES ($1, 'X', 1000) RETURNING id, code`, [c.id])).rows[0]
    const p = (await q(`INSERT INTO payments (order_id, amount) VALUES ($1, 500) RETURNING code`, [o.id])).rows[0]
    expect(c.code).toMatch(/^KH\d{4}$/)
    expect(l.code).toMatch(/^TV\d{5}$/)
    expect(o.code).toMatch(/^HD\d{4}$/)
    expect(p.code).toMatch(/^PT\d{5}$/)
  })
  it('vượt 9999 vẫn không bị cắt cụt / trùng mã', async () => {
    await q(`SELECT setval('customers_code_seq', 9999)`)
    const a = (await q(`INSERT INTO customers (name, phone) VALUES ('B', '0900000002') RETURNING code`)).rows[0]
    const b = (await q(`INSERT INTO customers (name, phone) VALUES ('C', '0900000003') RETURNING code`)).rows[0]
    expect(a.code).toBe('KH10000')
    expect(b.code).toBe('KH10001')
  })
})

describe('ràng buộc toàn vẹn', () => {
  let customerId, orderId
  beforeAll(async () => {
    customerId = (await q(`INSERT INTO customers (name, phone) VALUES ('Ràng buộc', '0911111111') RETURNING id`)).rows[0].id
    orderId = (await q(`INSERT INTO orders (customer_id, item_name, price, discount) VALUES ($1, 'Y', 1000000, 100000) RETURNING id`, [customerId])).rows[0].id
  })
  it('email tài khoản không trùng (không phân biệt hoa thường)', async () => {
    const e = await err(q(`INSERT INTO users (email, name, password_hash) VALUES ($1, 'x', 'x')`, [ADMIN.email.toUpperCase()]))
    expect(e.code).toBe('23505')
  })
  it('vai trò, trạng thái, phương thức thanh toán chỉ nhận giá trị hợp lệ', async () => {
    expect((await err(q(`INSERT INTO users (email, name, password_hash, role) VALUES ('r@x.vn', 'x', 'x', 'root')`))).code).toBe('23514')
    expect((await err(q(`INSERT INTO leads (name, phone, status) VALUES ('x', '0900000000', 'Lạ')`))).code).toBe('23514')
    expect((await err(q(`UPDATE orders SET status = 'Lạ' WHERE id = $1`, [orderId]))).code).toBe('23514')
    expect((await err(q(`INSERT INTO payments (order_id, amount, method) VALUES ($1, 1, 'Bitcoin')`, [orderId]))).code).toBe('23514')
  })
  it('giảm giá không vượt giá, hạn bàn giao sau ngày bắt đầu, tiền không âm', async () => {
    expect((await err(q(`UPDATE orders SET discount = price + 1 WHERE id = $1`, [orderId]))).code).toBe('23514')
    expect((await err(q(`UPDATE orders SET start_date = '2026-05-10', due_date = '2026-05-01' WHERE id = $1`, [orderId]))).code).toBe('23514')
    expect((await err(q(`UPDATE orders SET price = -1 WHERE id = $1`, [orderId]))).code).toBe('23514')
    expect((await err(q(`INSERT INTO payments (order_id, amount) VALUES ($1, 0)`, [orderId]))).code).toBe('23514')
  })
  it('không xoá được khách hàng còn hợp đồng; xoá hợp đồng thì xoá phiếu thu theo', async () => {
    await q(`INSERT INTO payments (order_id, amount) VALUES ($1, 200000)`, [orderId])
    expect((await err(q(`DELETE FROM customers WHERE id = $1`, [customerId]))).code).toBe('23001') // ON DELETE RESTRICT
    const t = (await q(`SELECT total, paid FROM order_totals WHERE order_id = $1`, [orderId])).rows[0]
    expect(t).toEqual({ total: 900000, paid: 200000 })
    await q(`DELETE FROM orders WHERE id = $1`, [orderId])
    expect((await q(`SELECT count(*)::int AS n FROM payments WHERE order_id = $1`, [orderId])).rows[0].n).toBe(0)
    await q(`DELETE FROM customers WHERE id = $1`, [customerId])
  })
  it('xoá tài khoản thì xoá phiên đăng nhập, giữ lại nhật ký', async () => {
    const u = (await q(`INSERT INTO users (email, name, password_hash) VALUES ('del@x.vn', 'Del', 'x') RETURNING id`)).rows[0].id
    await q(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ('abc', $1, now() + interval '1 day')`, [u])
    await q(`INSERT INTO audit_logs (user_id, user_name, action, entity, summary) VALUES ($1, 'Del', 'login', 'users', 'x')`, [u])
    await q(`DELETE FROM users WHERE id = $1`, [u])
    expect((await q(`SELECT count(*)::int AS n FROM sessions WHERE user_id = $1`, [u])).rows[0].n).toBe(0)
    expect((await q(`SELECT user_name FROM audit_logs WHERE summary = 'x'`)).rows[0].user_name).toBe('Del')
  })
})

describe('kết nối database thuê ngoài (Supabase)', async () => {
  const { getConfig } = await import('../../server/config.js')
  const { createPool, poolOptions } = await import('../../server/db.js')
  const SUPA = 'postgresql://postgres.abcxyz:MatKhau123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  it('địa chỉ Supabase tự bật SSL mã hoá; database tự host thì không', () => {
    expect(poolOptions(getConfig({ DATABASE_URL: SUPA })).ssl).toEqual({ rejectUnauthorized: false })
    expect(poolOptions(getConfig({ DATABASE_URL: 'postgres://u:p@localhost:5432/db' })).ssl).toBeUndefined()
    expect(poolOptions(getConfig({ DATABASE_URL: SUPA, DATABASE_SSL: '' })).ssl).toBeUndefined()
    expect(poolOptions(getConfig({ DATABASE_URL: SUPA, DB_POOL_MAX: '5' })).max).toBe(5)
  })
  it('sslmode trong chuỗi kết nối không ghi đè cấu hình SSL', () => {
    const p = createPool(SUPA + '?sslmode=require', { ssl: { rejectUnauthorized: false } })
    expect(p.options.connectionString).not.toContain('sslmode')
    expect(p.options.ssl).toEqual({ rejectUnauthorized: false })
    return p.end()
  })
  it('bật SSL thật sự gửi yêu cầu mã hoá tới máy chủ', async () => {
    // PostgreSQL test cục bộ không bật SSL → bị từ chối đúng kiểu lỗi SSL (chứng tỏ có yêu cầu mã hoá)
    const p = createPool(ctx.cfg.databaseUrl, poolOptions({ ...ctx.cfg, databaseSsl: 'require' }))
    await expect(p.query('SELECT 1')).rejects.toThrow(/SSL/i)
    await p.end()
  })
})
