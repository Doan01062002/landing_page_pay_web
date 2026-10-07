// Cấu hình máy chủ: đọc biến môi trường (và tệp .env nếu có, không ghi đè biến đã đặt sẵn).
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function loadEnvFile(file = resolve(process.cwd(), '.env')) {
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m || line.trim().startsWith('#')) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
}

const bool = (v, d) => (v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(v))
const int = (v, d) => (v === undefined || v === '' || isNaN(Number(v)) ? d : Number(v))

export function getConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  return {
    production,
    port: int(env.PORT, 8080),
    host: env.HOST || '0.0.0.0',
    databaseUrl: env.DATABASE_URL || 'postgres://chungauto:chungauto@localhost:5432/chungauto',
    // Địa chỉ công khai (https://ten-mien.vn): dùng cho canonical, sitemap. Trống = lấy theo request.
    publicUrl: (env.PUBLIC_URL || '').replace(/\/$/, ''),
    trustProxy: bool(env.TRUST_PROXY, true),
    cookieSecure: bool(env.COOKIE_SECURE, production),
    sessionDays: int(env.SESSION_DAYS, 7),
    // Tài khoản quản trị tạo tự động khi khởi động (nếu chưa có)
    adminEmail: env.ADMIN_EMAIL || '',
    adminPassword: env.ADMIN_PASSWORD || '',
    adminName: env.ADMIN_NAME || 'Quản trị viên',
    // Giới hạn gửi form tư vấn / đăng nhập (chống spam, dò mật khẩu)
    leadLimit: int(env.LEAD_RATE_LIMIT, 5),
    leadWindowMin: int(env.LEAD_RATE_WINDOW_MIN, 10),
    loginLimit: int(env.LOGIN_RATE_LIMIT, 20),
    loginWindowMin: int(env.LOGIN_RATE_WINDOW_MIN, 15),
    maxFailedLogins: int(env.MAX_FAILED_LOGINS, 5),
    lockMinutes: int(env.LOCK_MINUTES, 15),
    distDir: resolve(env.DIST_DIR || 'dist'),
    ssrEntry: resolve(env.SSR_ENTRY || 'dist-server/entry-server.js'),
  }
}
