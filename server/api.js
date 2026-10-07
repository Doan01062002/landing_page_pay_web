// API JSON: /api/public/* (website), /api/leads (form tư vấn), /api/auth/* (đăng nhập), /api/admin/* (trang quản trị).
import express from 'express'
import { createHash } from 'node:crypto'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { camelize, toSnake, tx } from './db.js'
import {
  COOKIE, PERMS, ROLE_LABEL, cookieOptions, createSession, csrfGuard, destroySession, hashPassword, loadUser, passwordProblem, requireAuth, requirePerm, verifyPassword,
} from './auth.js'
import { RESOURCES, insertSql, updateSql, validate } from './resources.js'

class HttpError extends Error {
  constructor(status, body) {
    super(body.message || body.error)
    this.status = status
    this.body = body
  }
}
const invalid = (fields) => new HttpError(422, { error: 'validation', message: 'Dữ liệu chưa hợp lệ', fields })
const notFound = (what = 'Dữ liệu') => new HttpError(404, { error: 'not_found', message: `${what} không tồn tại hoặc đã bị xoá` })

async function audit(db, user, action, entity, entityId, summary) {
  await db.query('INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, summary) VALUES ($1, $2, $3, $4, $5, $6)', [
    user?.id || null,
    user?.name || 'Hệ thống',
    action,
    entity,
    entityId == null ? null : String(entityId),
    summary,
  ])
}

const SITE_SCHEMA = z.object({
  brand: z.string().trim().min(1, 'Bắt buộc nhập').max(60),
  domain: z.string().trim().max(100),
  tagline: z.string().trim().max(120),
  logo: z.string().trim().max(300),
  hotline: z.string().trim().min(1, 'Bắt buộc nhập').max(30),
  zalo: z.string().trim().max(100),
  zaloUrl: z.union([z.literal(''), z.url('Đường dẫn chưa hợp lệ')]),
  facebookUrl: z.union([z.literal(''), z.url('Đường dẫn chưa hợp lệ')]),
  email: z.union([z.literal(''), z.email('Email chưa đúng định dạng')]),
  address: z.string().trim().max(300),
  company: z.string().trim().max(200),
  showrooms: z.coerce.number().int().min(0).max(10000),
  promo: z.object({ label: z.string().trim().max(60), text: z.string().trim().max(300), giftValue: z.coerce.number().int().min(0).max(1e11) }),
})
const SEO_SCHEMA = z.object({
  title: z.string().trim().min(10, 'Tối thiểu 10 ký tự').max(70, 'Tối đa 70 ký tự'),
  description: z.string().trim().min(50, 'Tối thiểu 50 ký tự').max(300, 'Tối đa 300 ký tự'),
  image: z.string().trim().max(300),
})
const USER_SCHEMA = z.object({
  email: z.email('Email chưa đúng định dạng').max(160),
  name: z.string().trim().min(1, 'Bắt buộc nhập').max(100),
  role: z.enum(['admin', 'manager', 'sales', 'editor'], 'Vai trò không hợp lệ'),
  active: z.coerce.boolean().default(true),
  password: z.string().optional(),
  unlock: z.coerce.boolean().optional(), // mở khoá tài khoản bị khoá tạm do nhập sai mật khẩu
})
const PUBLIC_LEAD = z.object({
  name: z.string().trim().min(2, 'Nhập họ tên').max(100),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s.()-]/g, ''))
    .pipe(z.string().regex(/^0\d{9}$/, 'Số điện thoại gồm 10 số, bắt đầu bằng 0')),
  type: z.string().trim().max(100).default(''),
  branches: z.string().trim().max(50).default(''),
  template: z.string().trim().max(200).default(''),
  note: z.string().trim().max(2000).default(''),
  page: z.string().trim().max(300).default(''),
  utm: z.record(z.string(), z.string().max(120)).default({}),
  website: z.string().default(''), // bẫy spam: người thật không thấy ô này
})

export function createApi({ pool, cfg, boot }) {
  const r = express.Router()
  r.use(express.json({ limit: '200kb' }))
  r.use(loadUser(pool))
  const dummyHash = hashPassword('chungauto-dummy-password')
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

  // ---------- Công khai ----------
  r.get('/health', wrap(async (_req, res) => {
    await pool.query('SELECT 1')
    res.json({ ok: true, time: new Date().toISOString() })
  }))
  r.get('/public/bootstrap', wrap(async (_req, res) => {
    res.set('Cache-Control', 'public, max-age=30')
    res.json(await boot.load())
  }))

  const leadLimiter = rateLimit({
    windowMs: cfg.leadWindowMin * 60000,
    limit: cfg.leadLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'rate_limited', message: 'Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau ít phút hoặc gọi hotline.' },
  })
  r.post('/leads', leadLimiter, wrap(async (req, res) => {
    const v = PUBLIC_LEAD.safeParse(req.body || {})
    if (!v.success) {
      const fields = {}
      for (const i of v.error.issues) fields[i.path[0]] ||= i.message
      throw invalid(fields)
    }
    const d = v.data
    if (d.website) return res.status(201).json({ ok: true }) // bot điền ô ẩn: bỏ qua, không lưu
    const { rows } = await pool.query(
      `INSERT INTO leads (name, phone, business_type, branches, interest, message, page, utm, source, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Website', $9, $10) RETURNING id, code`,
      [d.name, d.phone, d.type, d.branches, d.template, d.note, d.page, JSON.stringify(d.utm), req.ip || null, (req.get('user-agent') || '').slice(0, 300)],
    )
    await audit(pool, null, 'create', 'leads', rows[0].id, `Khách gửi yêu cầu tư vấn ${rows[0].code} từ website`)
    res.status(201).json({ ok: true, code: rows[0].code })
  }))

  // ---------- Đăng nhập ----------
  const loginLimiter = rateLimit({
    windowMs: cfg.loginWindowMin * 60000,
    limit: cfg.loginLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'rate_limited', message: 'Đăng nhập sai quá nhiều lần, vui lòng thử lại sau.' },
  })
  r.post('/auth/login', loginLimiter, csrfGuard, wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim()
    const password = String(req.body?.password || '')
    if (!email || !password) throw invalid({ ...(!email && { email: 'Nhập email' }), ...(!password && { password: 'Nhập mật khẩu' }) })
    const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email])
    const u = rows[0]
    const fail = () => new HttpError(401, { error: 'invalid_credentials', message: 'Email hoặc mật khẩu không đúng.' })
    if (!u) {
      await verifyPassword(password, await dummyHash) // giữ thời gian phản hồi như khi email tồn tại (chống dò email)
      throw fail()
    }
    if (u.locked_until && new Date(u.locked_until) > new Date()) {
      const min = Math.ceil((new Date(u.locked_until) - Date.now()) / 60000)
      throw new HttpError(423, { error: 'locked', message: `Tài khoản tạm khoá do nhập sai nhiều lần. Thử lại sau ${min} phút.` })
    }
    if (!(await verifyPassword(password, u.password_hash))) {
      const n = u.failed_attempts + 1
      const lock = n >= cfg.maxFailedLogins
      await pool.query(`UPDATE users SET failed_attempts = $2, locked_until = CASE WHEN $3 THEN now() + make_interval(mins => $4) ELSE locked_until END WHERE id = $1`, [u.id, lock ? 0 : n, lock, cfg.lockMinutes])
      if (lock) await audit(pool, null, 'lock', 'users', u.id, `Khoá tạm ${u.email} do nhập sai mật khẩu ${cfg.maxFailedLogins} lần`)
      throw fail()
    }
    if (!u.active) throw new HttpError(403, { error: 'inactive', message: 'Tài khoản đã bị vô hiệu hoá. Liên hệ quản trị viên.' })
    await pool.query('UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = now() WHERE id = $1', [u.id])
    const token = await createSession(pool, u.id, req, cfg.sessionDays)
    res.cookie(COOKIE, token, cookieOptions(cfg))
    await audit(pool, u, 'login', 'users', u.id, 'Đăng nhập')
    res.json({ user: publicUser(u) })
  }))
  r.post('/auth/logout', csrfGuard, wrap(async (req, res) => {
    await destroySession(pool, req.cookies?.[COOKIE])
    res.clearCookie(COOKIE, { ...cookieOptions(cfg), maxAge: undefined })
    res.json({ ok: true })
  }))
  r.get('/auth/me', requireAuth, (req, res) => res.json({ user: { ...req.user, roleLabel: ROLE_LABEL[req.user.role] }, perms: PERMS[req.user.role] }))
  r.post('/auth/password', requireAuth, csrfGuard, wrap(async (req, res) => {
    const { current, next } = req.body || {}
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
    if (!(await verifyPassword(String(current || ''), rows[0].password_hash))) throw invalid({ current: 'Mật khẩu hiện tại không đúng' })
    const problem = passwordProblem(next)
    if (problem) throw invalid({ next: problem })
    if (next === current) throw invalid({ next: 'Mật khẩu mới phải khác mật khẩu cũ' })
    await pool.query('UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1', [req.user.id, await hashPassword(next)])
    // đăng xuất các phiên khác
    await pool.query('DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2', [req.user.id, createHash('sha256').update(req.cookies[COOKIE]).digest('hex')])
    await audit(pool, req.user, 'update', 'users', req.user.id, 'Đổi mật khẩu')
    res.json({ ok: true })
  }))

  // ---------- Quản trị ----------
  const admin = express.Router()
  admin.use(requireAuth, csrfGuard)

  // danh sách người phụ trách (ai đăng nhập cũng xem được, để chọn người phụ trách)
  admin.get('/staff', wrap(async (_req, res) => {
    const { rows } = await pool.query('SELECT id, name, role, active FROM users ORDER BY name')
    res.json(rows.map(camelize))
  }))

  // Tài khoản quản trị
  admin.get('/users', requirePerm('users', 'r'), wrap(async (_req, res) => {
    const { rows } = await pool.query('SELECT id, email, name, role, active, last_login_at, locked_until, created_at, updated_at FROM users ORDER BY id')
    res.json(rows.map(camelize))
  }))
  admin.post('/users', requirePerm('users', 'w'), wrap(async (req, res) => {
    const v = validate(USER_SCHEMA, req.body)
    if (v.fields) throw invalid(v.fields)
    const problem = passwordProblem(v.data.password)
    if (problem) throw invalid({ password: problem })
    const { rows } = await pool.query('INSERT INTO users (email, name, role, active, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id', [v.data.email.trim(), v.data.name, v.data.role, v.data.active, await hashPassword(v.data.password)])
    await audit(pool, req.user, 'create', 'users', rows[0].id, `Thêm tài khoản ${v.data.email} (${ROLE_LABEL[v.data.role]})`)
    res.status(201).json(await oneUser(rows[0].id))
  }))
  admin.patch('/users/:id', requirePerm('users', 'w'), wrap(async (req, res) => {
    const id = Number(req.params.id)
    const v = validate(USER_SCHEMA, req.body, true)
    if (v.fields) throw invalid(v.fields)
    const d = v.data
    if (id === req.user.id && ((d.role && d.role !== req.user.role) || d.active === false)) throw invalid({ role: 'Không tự đổi vai trò hoặc khoá tài khoản của chính mình' })
    if ((d.role && d.role !== 'admin') || d.active === false) await ensureOtherAdmin(id)
    if (d.password) {
      const problem = passwordProblem(d.password)
      if (problem) throw invalid({ password: problem })
      d.passwordHash = await hashPassword(d.password)
    }
    delete d.password
    if (d.unlock) Object.assign(d, { failedAttempts: 0, lockedUntil: null })
    delete d.unlock
    if (d.email) d.email = d.email.trim()
    if (!Object.keys(d).length) return res.json(await oneUser(id))
    const q = updateSql('users', id, d)
    const r2 = await pool.query(q.text, q.values)
    if (!r2.rowCount) throw notFound('Tài khoản')
    if (d.active === false || d.passwordHash) await pool.query('DELETE FROM sessions WHERE user_id = $1', [id])
    await audit(pool, req.user, 'update', 'users', id, `Cập nhật tài khoản #${id}${d.passwordHash ? ' (đặt lại mật khẩu)' : ''}${d.failedAttempts === 0 ? ' (mở khoá)' : ''}`)
    res.json(await oneUser(id))
  }))
  admin.delete('/users/:id', requirePerm('users', 'd'), wrap(async (req, res) => {
    const id = Number(req.params.id)
    if (id === req.user.id) throw new HttpError(409, { error: 'conflict', message: 'Không thể xoá tài khoản đang đăng nhập' })
    await ensureOtherAdmin(id)
    const r2 = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id])
    if (!r2.rowCount) throw notFound('Tài khoản')
    await audit(pool, req.user, 'delete', 'users', id, `Xoá tài khoản ${r2.rows[0].email}`)
    res.json({ ok: true })
  }))
  async function ensureOtherAdmin(id) {
    const { rows } = await pool.query(`SELECT count(*)::int AS n FROM users WHERE role = 'admin' AND active AND id <> $1`, [id])
    if (!rows[0].n) throw new HttpError(409, { error: 'conflict', message: 'Phải còn ít nhất một quản trị viên đang hoạt động' })
  }
  async function oneUser(id) {
    const { rows } = await pool.query('SELECT id, email, name, role, active, last_login_at, locked_until, created_at, updated_at FROM users WHERE id = $1', [id])
    if (!rows[0]) throw notFound('Tài khoản')
    return camelize(rows[0])
  }

  // Cài đặt website
  admin.get('/settings', requirePerm('settings', 'r'), wrap(async (_req, res) => {
    const b = await boot.load()
    res.json({ site: b.site, seo: b.seo })
  }))
  admin.put('/settings/:key', requirePerm('settings', 'w'), wrap(async (req, res) => {
    const schema = { site: SITE_SCHEMA, seo: SEO_SCHEMA }[req.params.key]
    if (!schema) throw notFound('Mục cài đặt')
    const v = validate(schema, req.body)
    if (v.fields) throw invalid(v.fields)
    await pool.query(
      `INSERT INTO settings (key, value, updated_by, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [req.params.key, JSON.stringify(v.data), req.user.id],
    )
    boot.invalidate()
    await audit(pool, req.user, 'update', 'settings', req.params.key, `Cập nhật cài đặt ${req.params.key === 'site' ? 'thông tin website' : 'SEO'}`)
    res.json(v.data)
  }))

  // Thông báo đã xem (riêng từng tài khoản; giữ 180 ngày)
  admin.get('/notifications/seen', wrap(async (req, res) => {
    const { rows } = await pool.query(`SELECT key FROM notification_seen WHERE user_id = $1 AND seen_at > now() - interval '180 days'`, [req.user.id])
    res.json({ keys: rows.map((r) => r.key) })
  }))
  admin.post('/notifications/seen', wrap(async (req, res) => {
    const keys = z.array(z.string().trim().min(1).max(120)).min(1).max(500).safeParse(req.body?.keys)
    if (!keys.success) throw invalid({ keys: 'Danh sách không hợp lệ' })
    await pool.query('INSERT INTO notification_seen (user_id, key) SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING', [req.user.id, [...new Set(keys.data)]])
    await pool.query(`DELETE FROM notification_seen WHERE user_id = $1 AND seen_at < now() - interval '180 days'`, [req.user.id])
    res.json({ ok: true })
  }))

  // Nhật ký
  admin.get('/audit', requirePerm('audit', 'r'), wrap(async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT 1000')
    res.json(rows.map(camelize))
  }))

  // Chuyển yêu cầu tư vấn → khách hàng + hợp đồng
  const CONVERT = z.object({
    itemKind: z.enum(['template', 'project', 'landing', 'custom']).default('template'),
    itemSlug: z.string().trim().max(80).default(''),
    itemName: z.string().trim().min(1, 'Nhập tên mẫu / hạng mục').max(200),
    price: z.coerce.number('Nhập giá').int().min(0, 'Không được âm'),
    package: z.string().trim().max(100).default(''),
    businessName: z.string().trim().max(150).default(''),
  })
  admin.post('/leads/:id/convert', requirePerm('leads', 'w'), requirePerm('orders', 'w'), wrap(async (req, res) => {
    const v = validate(CONVERT, req.body)
    if (v.fields) throw invalid(v.fields)
    const out = await tx(pool, async (db) => {
      const lead = (await db.query('SELECT * FROM leads WHERE id = $1 FOR UPDATE', [req.params.id])).rows[0]
      if (!lead) throw notFound('Yêu cầu tư vấn')
      let cust = lead.customer_id ? (await db.query('SELECT id, code FROM customers WHERE id = $1', [lead.customer_id])).rows[0] : null
      cust ||= (await db.query('SELECT id, code FROM customers WHERE phone = $1 ORDER BY id LIMIT 1', [lead.phone])).rows[0]
      if (!cust)
        cust = (
          await db.query(
            `INSERT INTO customers (name, phone, email, business_type, branches, business_name, source, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, code`,
            [lead.name, lead.phone, lead.email, lead.business_type, lead.branches, v.data.businessName, lead.source, `Từ yêu cầu tư vấn ${lead.code}`],
          )
        ).rows[0]
      const order = (
        await db.query(
          `INSERT INTO orders (customer_id, lead_id, item_kind, item_slug, item_name, package, price, assigned_to, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, code`,
          [cust.id, lead.id, v.data.itemKind, v.data.itemSlug, v.data.itemName, v.data.package, v.data.price, lead.assigned_to || req.user.id, lead.message],
        )
      ).rows[0]
      await db.query(`UPDATE leads SET status = 'Chốt hợp đồng', customer_id = $2, next_follow = NULL, updated_at = now() WHERE id = $1`, [lead.id, cust.id])
      await audit(db, req.user, 'convert', 'leads', lead.id, `Chuyển ${lead.code} thành hợp đồng ${order.code} (khách ${cust.code})`)
      return { customerId: cust.id, customerCode: cust.code, orderId: order.id, orderCode: order.code }
    })
    res.status(201).json(out)
  }))

  // CRUD chung cho các bảng trong resources.js
  for (const [name, R] of Object.entries(RESOURCES)) {
    const one = async (db, id) => {
      const { rows } = await db.query(R.one, [id])
      if (!rows[0]) throw notFound()
      return camelize(rows[0])
    }
    const label = (row) => `${R.label} ${row.code || row.name || row.question?.slice(0, 40) || '#' + row.id}`
    const affects = () => R.affectsSite && boot.invalidate()

    admin.get(`/${name}`, requirePerm(name, 'r'), wrap(async (_req, res) => {
      const { rows } = await pool.query(R.list)
      res.json(rows.map(camelize))
    }))
    admin.get(`/${name}/:id`, requirePerm(name, 'r'), wrap(async (req, res) => res.json(await one(pool, req.params.id))))

    if (!R.noCreate)
      admin.post(`/${name}`, requirePerm(name, 'w'), wrap(async (req, res) => {
        const v = validate(R.schema, req.body)
        if (v.fields) throw invalid(v.fields)
        const data = { ...v.data }
        if (name === 'payments') data.createdBy = req.user.id
        const rule = { ...(R.rules?.(data) || {}), ...((await R.check?.(pool, data, null)) || {}) }
        if (Object.keys(rule).length) throw invalid(rule)
        const q = insertSql(R.table, data)
        const row = await one(pool, (await pool.query(q.text, q.values)).rows[0].id)
        await audit(pool, req.user, 'create', name, row.id, `Thêm ${label(row)}`)
        affects()
        res.status(201).json(row)
      }))

    admin.patch(`/${name}/:id`, requirePerm(name, 'w'), wrap(async (req, res) => {
      const id = Number(req.params.id)
      const v = validate(R.schema, req.body, true)
      if (v.fields) throw invalid(v.fields)
      const before = await one(pool, id)
      const rule = { ...(R.rules?.({ ...before, ...v.data }) || {}), ...((await R.check?.(pool, v.data, id)) || {}) }
      if (Object.keys(rule).length) throw invalid(rule)
      if (Object.keys(v.data).length) {
        const q = updateSql(R.table, id, v.data)
        await pool.query(q.text, q.values)
      }
      const row = await one(pool, id)
      const changed = Object.keys(v.data).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(row[k]))
      if (changed.length) await audit(pool, req.user, 'update', name, id, `Cập nhật ${label(row)}${v.data.status && before.status !== row.status ? `: ${before.status} → ${row.status}` : ''}`)
      affects()
      res.json(row)
    }))

    if (!R.noDelete) {
      admin.delete(`/${name}/:id`, requirePerm(name, 'd'), wrap(async (req, res) => {
        const row = await one(pool, req.params.id)
        await pool.query(`DELETE FROM ${R.table} WHERE id = $1`, [row.id])
        await audit(pool, req.user, 'delete', name, row.id, `Xoá ${label(row)}`)
        affects()
        res.json({ ok: true })
      }))
      admin.post(`/${name}/bulk-delete`, requirePerm(name, 'd'), wrap(async (req, res) => {
        const ids = z.array(z.coerce.number().int().positive()).min(1).max(500).safeParse(req.body?.ids)
        if (!ids.success) throw invalid({ ids: 'Danh sách không hợp lệ' })
        const r2 = await tx(pool, (db) => db.query(`DELETE FROM ${R.table} WHERE id = ANY($1::int[])`, [ids.data]))
        await audit(pool, req.user, 'delete', name, null, `Xoá ${r2.rowCount} ${R.label}`)
        affects()
        res.json({ ok: true, deleted: r2.rowCount })
      }))
    }
    admin.post(`/${name}/bulk-update`, requirePerm(name, 'w'), wrap(async (req, res) => {
      const ids = z.array(z.coerce.number().int().positive()).min(1).max(500).safeParse(req.body?.ids)
      if (!ids.success) throw invalid({ ids: 'Danh sách không hợp lệ' })
      const v = validate(R.schema, req.body?.patch, true)
      if (v.fields) throw invalid(v.fields)
      if (!Object.keys(v.data).length || R.noBulkUpdate || Object.keys(v.data).some((k) => R.bulkDeny?.includes(k))) throw invalid({ patch: 'Không hỗ trợ cập nhật hàng loạt trường này' })
      const keys = Object.keys(v.data)
      const r2 = await pool.query(
        `UPDATE ${R.table} SET ${keys.map((k, i) => `${toSnake(k)} = $${i + 1}`).join(', ')}, updated_at = now() WHERE id = ANY($${keys.length + 1}::int[])`,
        [...keys.map((k) => v.data[k]), ids.data],
      )
      await audit(pool, req.user, 'update', name, null, `Cập nhật ${r2.rowCount} ${R.label}: ${keys.join(', ')}`)
      affects()
      res.json({ ok: true, updated: r2.rowCount })
    }))
  }

  r.use('/admin', admin)
  r.use((_req, res) => res.status(404).json({ error: 'not_found', message: 'Không có API này' }))

  // Lỗi → JSON
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json(err.body)
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_json', message: 'Dữ liệu gửi lên không đúng định dạng JSON' })
    if (err.code === '23505') return res.status(409).json({ error: 'conflict', message: 'Dữ liệu bị trùng (email / mã đã tồn tại)', fields: err.constraint?.includes('email') ? { email: 'Email đã được dùng' } : undefined })
    if (err.code === '23503' || err.code === '23001') return res.status(409).json({ error: 'in_use', message: 'Không thể xoá: dữ liệu đang được dùng ở nơi khác (vd khách hàng còn hợp đồng)' })
    if (err.code === '23514' || err.code === '22P02' || err.code === '22003') return res.status(422).json({ error: 'validation', message: 'Dữ liệu không hợp lệ' })
    console.error('[api]', err)
    res.status(500).json({ error: 'server_error', message: 'Máy chủ gặp lỗi, vui lòng thử lại.' })
  })
  return r
}

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, roleLabel: ROLE_LABEL[u.role] })
