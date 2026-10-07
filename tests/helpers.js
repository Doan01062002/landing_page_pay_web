// Tiện ích dùng chung cho test máy chủ: database test sạch, ứng dụng Express, đăng nhập.
import request from 'supertest'
import { getConfig } from '../server/config.js'
import { createPool } from '../server/db.js'
import { migrate } from '../server/migrate.js'
import { seed } from '../server/seed.js'
import { createApp, loadRenderer } from '../server/app.js'

export const TEST_DB = process.env.TEST_DATABASE_URL || 'postgres://postgres@localhost:55432/chungauto_test'
export const ADMIN = { email: 'admin@test.local', password: 'Admin12345' }
const quiet = () => {}

export function testConfig(env = {}) {
  return getConfig({
    DATABASE_URL: TEST_DB,
    ADMIN_EMAIL: ADMIN.email,
    ADMIN_PASSWORD: ADMIN.password,
    ADMIN_NAME: 'Quản trị Test',
    COOKIE_SECURE: 'false',
    TRUST_PROXY: 'false',
    LOGIN_RATE_LIMIT: '1000',
    LEAD_RATE_LIMIT: '1000',
    ...env,
  })
}

// Xoá sạch database test rồi chạy migration + dữ liệu khởi tạo
export async function resetDb(pool, cfg) {
  const name = new URL(cfg.databaseUrl).pathname.slice(1)
  if (!/test/i.test(name)) throw new Error(`Từ chối xoá database "${name}": database test phải có chữ test trong tên`)
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public')
  await migrate(pool, quiet)
  await seed(pool, cfg, quiet)
}

// Tạo ứng dụng trên database test mới. env: ghi đè cấu hình (vd giới hạn gửi form)
export async function setup(env = {}, { reset = true } = {}) {
  const cfg = testConfig(env)
  const pool = createPool(cfg.databaseUrl, { max: 5 })
  if (reset) await resetDb(pool, cfg)
  const renderer = await loadRenderer(cfg)
  const app = createApp({ pool, cfg, renderer })
  return { cfg, pool, app, renderer }
}

// Phiên trình duyệt giả lập: giữ cookie, tự gửi header chống CSRF cho thao tác ghi
export function client(app) {
  const agent = request.agent(app)
  const w = (m) => (path, body) => {
    const r = agent[m](path).set('x-ca-csrf', '1')
    return body === undefined ? r : r.send(body)
  }
  return { agent, get: (path) => agent.get(path), post: w('post'), put: w('put'), patch: w('patch'), del: w('delete') }
}

export async function login(app, email = ADMIN.email, password = ADMIN.password) {
  const c = client(app)
  const r = await c.post('/api/auth/login', { email, password })
  if (r.status !== 200) throw new Error(`Đăng nhập ${email} lỗi ${r.status}: ${JSON.stringify(r.body)}`)
  return c
}

// Tạo tài khoản theo vai trò (bằng tài khoản quản trị) rồi đăng nhập
export async function userWithRole(app, adminClient, role, email = `${role}-${Date.now()}@test.local`) {
  const password = 'Matkhau123'
  const r = await adminClient.post('/api/admin/users', { email, name: `Nhân viên ${role}`, role, password })
  if (r.status !== 201) throw new Error(`Tạo tài khoản lỗi ${r.status}: ${JSON.stringify(r.body)}`)
  return { user: r.body, client: await login(app, email, password), password }
}
