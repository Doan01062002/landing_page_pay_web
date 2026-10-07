// Đăng nhập quản trị: mật khẩu băm bcrypt, phiên lưu trong bảng sessions (cookie httpOnly chỉ chứa token ngẫu nhiên,
// DB lưu SHA-256 của token), khoá tạm tài khoản khi nhập sai nhiều lần, phân quyền theo vai trò.
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { camelize } from './db.js'

export const COOKIE = 'ca_sid'
const sha = (s) => createHash('sha256').update(s).digest('hex')

export const hashPassword = (p) => bcrypt.hash(p, 12)
export const verifyPassword = (p, h) => bcrypt.compare(p, h)

// Mật khẩu tối thiểu 8 ký tự, có chữ và số
export function passwordProblem(p) {
  if (typeof p !== 'string' || p.length < 8) return 'Mật khẩu tối thiểu 8 ký tự'
  if (p.length > 128) return 'Mật khẩu tối đa 128 ký tự'
  if (!/[A-Za-zÀ-ỹ]/.test(p) || !/\d/.test(p)) return 'Mật khẩu cần có cả chữ và số'
  return ''
}

// Quyền theo vai trò: r = xem, w = thêm / sửa, d = xoá
const ALL = 'rwd'
export const PERMS = {
  admin: { leads: ALL, customers: ALL, orders: ALL, payments: ALL, catalog: ALL, faqs: ALL, settings: ALL, users: ALL, audit: 'r' },
  manager: { leads: ALL, customers: ALL, orders: ALL, payments: ALL, catalog: ALL, faqs: ALL, settings: ALL, users: '', audit: 'r' },
  sales: { leads: ALL, customers: 'rw', orders: 'rw', payments: 'rw', catalog: 'r', faqs: 'r', settings: 'r', users: '', audit: '' },
  editor: { leads: '', customers: '', orders: '', payments: '', catalog: 'rw', faqs: ALL, settings: 'rw', users: '', audit: '' },
}
export const can = (user, resource, op) => !!user && (PERMS[user.role]?.[resource] || '').includes(op)
export const ROLE_LABEL = { admin: 'Quản trị viên', manager: 'Quản lý', sales: 'Kinh doanh', editor: 'Biên tập nội dung' }

export async function createSession(pool, userId, req, days) {
  const token = randomBytes(32).toString('base64url')
  await pool.query(`INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES ($1, $2, now() + make_interval(days => $3), $4, $5)`, [
    sha(token),
    userId,
    days,
    req.ip || null,
    (req.get('user-agent') || '').slice(0, 300),
  ])
  // dọn phiên hết hạn
  await pool.query('DELETE FROM sessions WHERE expires_at < now()')
  return token
}

export async function destroySession(pool, token) {
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha(token)])
}

export async function userFromToken(pool, token) {
  if (!token) return null
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.active FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha(token)],
  )
  const u = rows[0]
  return u && u.active ? camelize(u) : null
}

export function cookieOptions(cfg) {
  return { httpOnly: true, sameSite: 'lax', secure: cfg.cookieSecure, path: '/', maxAge: cfg.sessionDays * 86400000 }
}

// Gắn req.user nếu có phiên hợp lệ
export const loadUser = (pool) => async (req, _res, next) => {
  req.user = await userFromToken(pool, req.cookies?.[COOKIE])
  next()
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated', message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' })
  next()
}

// Chống CSRF cho yêu cầu ghi: bắt buộc header riêng (trình duyệt không tự gửi từ trang khác) và Origin cùng máy chủ
export function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  if (req.get('x-ca-csrf') !== '1') return res.status(403).json({ error: 'csrf', message: 'Yêu cầu không hợp lệ.' })
  const origin = req.get('origin')
  if (origin) {
    try {
      if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: 'csrf', message: 'Yêu cầu từ nguồn khác bị chặn.' })
    } catch {
      return res.status(403).json({ error: 'csrf', message: 'Yêu cầu không hợp lệ.' })
    }
  }
  next()
}

export const requirePerm = (resource, op) => (req, res, next) => {
  if (!can(req.user, resource, op)) return res.status(403).json({ error: 'forbidden', message: 'Tài khoản của bạn không có quyền thực hiện thao tác này.' })
  next()
}
